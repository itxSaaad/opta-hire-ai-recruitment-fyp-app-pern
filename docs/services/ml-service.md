# Python ML service

`ml-services/app.py` registers health, shortlist and model blueprints. Controllers call `models/candidate_matcher.py`; settings are in `config/settings.py`; training code and bundled vectorizers live in `data/` and `train_model.py`.

Default score weights: skills .40, experience .30, education .15, industry .10, text .05. Settings validate total weight and bound results with candidate cap and minimum similarity. These are ranking aids, not hiring decisions. Node calls Flask through `ML_SERVICES_URL`; the browser should not call a public Flask host. Rate limits, training state and filesystem writes are process-local/ephemeral; committed artifacts are deploy-time inputs.

See [Flask routes](../api/rest-reference.md), [matching flow](../features/matching.md), and [scaling limits](../architecture/scaling-and-free-tier.md).
