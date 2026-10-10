# OptaHire matching service

Python Flask service for model health/status and candidate-job ranking/shortlist operations. The Express API invokes it through a private service binding; the browser does not call this service directly.

- [ML service guide](../docs/services/ml-service.md)
- [Architecture and user journeys](../docs/architecture/README.md)
- [Matching feature](../docs/features/matching.md)
- [API and realtime routes](../docs/api/README.md)
- [Local development](../docs/development/local-setup.md)
- [Environment variables](../docs/development/configuration.md)

Install `requirements.txt`, then run `python app.py` from this folder. Flask defaults to port `10000`; use `5001` for the API's local fallback. Rate limiting uses process memory; Redis/Upstash is not required.
