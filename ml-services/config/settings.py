import os
from pathlib import Path
import logging

BASE_DIR = Path(__file__).resolve().parent.parent


class AppConfig:
    """Application configuration with validation"""

    def __init__(self):
        self.DEBUG = os.getenv("DEBUG", "false").lower() == "true"
        self.FLASK_ENV = os.getenv("FLASK_ENV", "development")
        self.PORT = self._validate_port()
        self.HOST = os.getenv("HOST", "127.0.0.1")

        # URLs
        self.CLIENT_URL = os.getenv("CLIENT_URL", "http://localhost:5173")
        self.NODE_SERVER_URL = os.getenv("NODE_SERVER_URL", "http://localhost:5000")
        self.PROD_CLIENT_URL = os.getenv("PROD_CLIENT_URL", "")
        self.PROD_NODE_SERVER_URL = os.getenv("PROD_NODE_SERVER_URL", "")

        # CORS Configuration
        self.CORS_ORIGINS = self._parse_cors_origins()

        # AI Model Configuration
        self.MODEL_VERSION = os.getenv("MODEL_VERSION", "1.0.0")
        self.MAX_CANDIDATES = int(os.getenv("MAX_CANDIDATES", 5))
        self.MIN_SIMILARITY = float(os.getenv("MIN_SIMILARITY", 0.3))
        self.MODEL_STORAGE_PATH = os.getenv(
            "MODEL_STORAGE_PATH", str(BASE_DIR / "data" / "models")
        )

        # Scoring Weights
        self.WEIGHT_SKILLS = float(os.getenv("WEIGHT_SKILLS", 0.40))
        self.WEIGHT_EXPERIENCE = float(os.getenv("WEIGHT_EXPERIENCE", 0.30))
        self.WEIGHT_EDUCATION = float(os.getenv("WEIGHT_EDUCATION", 0.15))
        self.WEIGHT_INDUSTRY = float(os.getenv("WEIGHT_INDUSTRY", 0.10))
        self.WEIGHT_TEXT = float(os.getenv("WEIGHT_TEXT", 0.05))

        # Performance Settings
        self.ENABLE_CACHING = os.getenv("ENABLE_CACHING", "false").lower() == "true"
        self.RATE_LIMIT_PER_MINUTE = int(os.getenv("RATE_LIMIT_PER_MINUTE", 100))
        self.RATE_LIMIT_STORAGE = os.getenv("RATE_LIMIT_STORAGE", "memory://")

        # Logging Configuration
        self.LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO").upper()
        self.LOG_TO_FILE = os.getenv("LOG_TO_FILE", "false").lower() == "true"
        self.ENABLE_COLOR_LOGS = (
            os.getenv("ENABLE_COLOR_LOGS", "true").lower() == "true"
        )

        # Validate scoring weights
        self._validate_weights()

    def _validate_port(self):
        try:
            port = int(os.getenv("PORT", 8000))
            if 1024 <= port <= 65535:
                return port
            else:
                logging.warning(f"Invalid port {port}, using default 8000")
                return 8000
        except ValueError:
            logging.warning("Invalid port value, using default 8000")
            return 8000

    def _parse_cors_origins(self):
        return os.getenv(
            "CORS_ORIGIN", "http://localhost:5173,http://localhost:5000"
        ).split(",")

    def _validate_weights(self):
        """Validate that scoring weights sum to 1.0"""
        total_weight = (
            self.WEIGHT_SKILLS
            + self.WEIGHT_EXPERIENCE
            + self.WEIGHT_EDUCATION
            + self.WEIGHT_INDUSTRY
            + self.WEIGHT_TEXT
        )
        if abs(total_weight - 1.0) > 0.001:  # Allow for small floating point errors
            logging.warning(f"Scoring weights sum to {total_weight}, not 1.0")
