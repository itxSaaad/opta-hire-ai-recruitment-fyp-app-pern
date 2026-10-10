"""Persist trained model artifacts in a private Vercel Blob store.

The service keeps a per-instance local cache for fast inference, while a small
manifest in Blob identifies the durable, immutable model bundle for an
environment. Preview and production have separate namespaces in the shared
store so preview training cannot replace the production model.
"""

import asyncio
import hashlib
import io
import json
import logging
import os
import re
import time
import uuid
import zipfile
from datetime import datetime, timezone
from typing import Optional


class VercelBlobModelStore:
    MANIFEST_SCHEMA_VERSION = 1
    MANIFEST_FILENAME = "current.json"
    MODEL_FILES = (
        "text_vectorizer.pkl",
        "skills_vectorizer.pkl",
        "training_state.json",
    )

    def __init__(self):
        vercel_runtime = bool(os.getenv("VERCEL") or os.getenv("VERCEL_ENV"))
        has_credentials = bool(
            os.getenv("BLOB_READ_WRITE_TOKEN")
            or (os.getenv("BLOB_STORE_ID") and os.getenv("VERCEL_OIDC_TOKEN"))
        )
        requested_backend = os.getenv("MODEL_ARTIFACT_BACKEND", "auto").lower()
        self.enabled = requested_backend == "vercel_blob" or (
            requested_backend == "auto" and (vercel_runtime or has_credentials)
        )
        self.namespace = self._resolve_namespace()
        self.client = None
        self.last_check_ok = not self.enabled
        self.last_error = None
        self.current_bundle_path = None
        self.last_manifest_check = 0.0

        if not self.enabled:
            return

        if not has_credentials:
            self.last_check_ok = False
            self.last_error = "Vercel Blob credentials are not configured"
            return

        try:
            from vercel.blob import BlobClient

            self.client = BlobClient()
        except Exception as error:  # Fail closed in hosted environments.
            self.last_check_ok = False
            self.last_error = str(error)
            logging.exception("Could not initialize the Vercel Blob SDK")

    @staticmethod
    def _resolve_namespace() -> str:
        override = os.getenv("MODEL_ARTIFACT_NAMESPACE")
        if override:
            namespace = override.strip().lower().replace("_", "-")
            if not re.fullmatch(r"[a-z0-9][a-z0-9-]{0,31}", namespace):
                raise ValueError("MODEL_ARTIFACT_NAMESPACE must be a short path-safe name")
            return namespace

        environment = (os.getenv("VERCEL_ENV") or "development").strip().lower()
        allowed = {"production", "preview", "development"}
        return environment if environment in allowed else "preview"

    @property
    def manifest_path(self) -> str:
        return f"models/{self.namespace}/{self.MANIFEST_FILENAME}"

    def _get_bytes(self, pathname: str, *, use_cache: bool = True) -> Optional[bytes]:
        try:
            result = self.client.get(pathname, access="private", use_cache=use_cache)
        except Exception as error:
            if error.__class__.__name__ == "BlobNotFoundError":
                return None
            raise
        if result is None:
            return None
        if getattr(result, "status_code", 200) != 200:
            return None

        content = getattr(result, "content", None)
        if isinstance(content, (bytes, bytearray)):
            return bytes(content)

        stream = getattr(result, "stream", None)
        if stream is None:
            return b""
        if isinstance(stream, (bytes, bytearray)):
            return bytes(stream)
        if hasattr(stream, "read"):
            return stream.read()
        if hasattr(stream, "__aiter__"):
            async def collect():
                return b"".join([chunk async for chunk in stream])

            return asyncio.run(collect())
        return b"".join(stream)

    def _read_manifest(self):
        manifest_bytes = self._get_bytes(self.manifest_path, use_cache=False)
        if manifest_bytes is None:
            return None

        manifest = json.loads(manifest_bytes.decode("utf-8"))
        if manifest.get("schema_version") != self.MANIFEST_SCHEMA_VERSION:
            raise ValueError("Unsupported model artifact manifest version")

        bundle_path = manifest.get("bundle_path", "")
        expected_prefix = f"models/{self.namespace}/versions/"
        if not bundle_path.startswith(expected_prefix) or ".." in bundle_path:
            raise ValueError("Model manifest contains an invalid artifact path")
        return manifest

    def _write_bundle_to_cache(self, bundle_bytes: bytes, cache_directory: str):
        with zipfile.ZipFile(io.BytesIO(bundle_bytes), "r") as bundle:
            members = set(bundle.namelist())
            if members != set(self.MODEL_FILES):
                raise ValueError("Model bundle contains unexpected or missing files")

            os.makedirs(cache_directory, exist_ok=True)
            for filename in self.MODEL_FILES:
                with open(os.path.join(cache_directory, filename), "wb") as output:
                    output.write(bundle.read(filename))

    def load_latest(self, cache_directory: str):
        """Download and validate the active artifact bundle, if one exists."""
        if not self.enabled:
            return {"state": "disabled"}
        if self.client is None:
            self.last_check_ok = False
            return {"state": "error", "error": self.last_error}

        try:
            manifest = self._read_manifest()
            self.last_manifest_check = time.monotonic()
            self.last_check_ok = True
            self.last_error = None
            if manifest is None:
                return {"state": "missing"}

            bundle_path = manifest["bundle_path"]
            if bundle_path == self.current_bundle_path:
                return {"state": "unchanged", "manifest": manifest}

            bundle_bytes = self._get_bytes(bundle_path)
            if bundle_bytes is None:
                raise FileNotFoundError("Active model bundle is missing from Blob")

            digest = hashlib.sha256(bundle_bytes).hexdigest()
            if digest != manifest.get("sha256"):
                raise ValueError("Model bundle checksum does not match its manifest")

            self._write_bundle_to_cache(bundle_bytes, cache_directory)
            self.current_bundle_path = bundle_path
            return {"state": "loaded", "manifest": manifest}
        except Exception as error:
            self.last_check_ok = False
            self.last_error = str(error)
            logging.exception("Could not load the active model bundle from Vercel Blob")
            return {"state": "error", "error": str(error)}

    def publish(self, model_directory: str):
        """Upload an immutable bundle, then atomically point current.json at it."""
        if not self.enabled:
            return True
        if self.client is None:
            self.last_check_ok = False
            logging.error("Vercel Blob is required but is not configured: %s", self.last_error)
            return False

        try:
            buffer = io.BytesIO()
            with zipfile.ZipFile(buffer, "w", compression=zipfile.ZIP_DEFLATED) as bundle:
                for filename in self.MODEL_FILES:
                    path = os.path.join(model_directory, filename)
                    if not os.path.isfile(path):
                        raise FileNotFoundError(f"Model artifact is missing: {filename}")
                    bundle.write(path, arcname=filename)

            bundle_bytes = buffer.getvalue()
            digest = hashlib.sha256(bundle_bytes).hexdigest()
            version = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
            bundle_path = f"models/{self.namespace}/versions/{version}-{uuid.uuid4().hex}.zip"

            self.client.put(
                bundle_path,
                bundle_bytes,
                access="private",
                content_type="application/zip",
                add_random_suffix=False,
            )

            # Verify the immutable bundle before switching the active pointer.
            uploaded_bytes = self._get_bytes(bundle_path)
            if uploaded_bytes is None or hashlib.sha256(uploaded_bytes).hexdigest() != digest:
                raise IOError("Uploaded model bundle did not pass read-back verification")

            manifest = {
                "schema_version": self.MANIFEST_SCHEMA_VERSION,
                "namespace": self.namespace,
                "bundle_path": bundle_path,
                "sha256": digest,
                "size_bytes": len(bundle_bytes),
                "published_at": datetime.now(timezone.utc).isoformat(),
            }
            self.client.put(
                self.manifest_path,
                json.dumps(manifest, separators=(",", ":")).encode("utf-8"),
                access="private",
                content_type="application/json",
                add_random_suffix=False,
                overwrite=True,
            )

            # Verify that the active pointer can be read back before reporting success.
            published_manifest = self._read_manifest()
            if not published_manifest or published_manifest.get("bundle_path") != bundle_path:
                raise IOError("Active model manifest did not pass read-back verification")

            self.current_bundle_path = bundle_path
            self.last_check_ok = True
            self.last_error = None
            self.last_manifest_check = time.monotonic()
            logging.info(
                "Published model artifact to private Vercel Blob (%s namespace, %s bytes)",
                self.namespace,
                len(bundle_bytes),
            )
            return True
        except Exception as error:
            self.last_check_ok = False
            self.last_error = str(error)
            logging.exception("Could not publish the model bundle to Vercel Blob")
            return False
