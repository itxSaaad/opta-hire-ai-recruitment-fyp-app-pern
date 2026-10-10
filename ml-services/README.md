# OptaHire matching service

Python Flask service for model health/status and candidate-job ranking/shortlist operations. The Express API invokes it through a private service binding; the browser does not call this service directly.

- [ML service guide](../docs/services/ml-service.md)
- [Architecture and user journeys](../docs/architecture/README.md)
- [Matching feature](../docs/features/matching.md)
- [API and realtime routes](../docs/api/README.md)
- [Local development](../docs/development/local-setup.md)
- [Environment variables](../docs/development/configuration.md)

The service pins Python `3.12.13` in `.python-version` and resolves dependencies with `uv` from `pyproject.toml` and `uv.lock`. Install `uv`, then run `uv sync --frozen` and `uv run --frozen python app.py` from this folder. Flask defaults to port `10000`; use `5001` for the API's local fallback. Hosted Docker and Render deployments use Gunicorn with one worker and four threads to limit model memory usage. `requirements.txt` is generated from the lockfile for tools that only support pip. Rate limiting uses process memory; Redis/Upstash is not required.
