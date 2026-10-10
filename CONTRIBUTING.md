# Contributing to OptaHire

Thanks for helping improve OptaHire. Start by opening an issue for a larger change so we can agree on the user problem and approach. Small fixes can go directly to a pull request.

## Pull requests

1. Branch from the repository's active base branch and keep the change focused.
2. Explain the user-facing problem and the solution in the PR description.
3. Update `docs/` when behavior, routes, environment variables, or deployment changes.
4. Run the relevant service build/lint or manual verification and describe what you ran.
5. Do not commit credentials, environment bundles, database dumps, or real user data.

For local setup and service boundaries, begin with the [root README](README.md) and [development guide](docs/development.md). Keep client secrets out of `VITE_*` variables.
