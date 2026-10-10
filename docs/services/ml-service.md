# Python ML service

`ml-services/app.py` registers health, shortlist and model blueprints. Controllers call `models/candidate_matcher.py`; settings are in `config/settings.py`; training code and bundled vectorizers live in `data/` and `train_model.py`.

Default score weights: skills .40, experience .30, education .15, industry .10, text .05. Settings validate total weight and bound results with candidate cap and minimum similarity. These are ranking aids, not hiring decisions. Node calls Flask through `ML_SERVICES_URL`; the browser should not call a public Flask host. Model artifacts are persisted as private, versioned bundles in Vercel Blob; the instance filesystem is only a temporary cache. The Flask app shares one matcher across health, training, and inference in each instance, and refreshes warm instances when a newer artifact manifest is published.

See [Flask routes](../api/rest-reference.md), [matching flow](../features/matching.md), [model artifact storage](model-artifact-storage.md), and [scaling limits](../architecture/scaling-and-free-tier.md).
