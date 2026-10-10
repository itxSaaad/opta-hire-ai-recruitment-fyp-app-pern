# Development

- [Local setup](local-setup.md): start the three services and check health.
- [Configuration](configuration.md): local env loading and safe variable use.
- [Conventions](conventions.md): boundaries, validation, performance and change discipline.
- [Verification](verification.md): local/hosted checks and what each proves.

Use a disposable DB for schema work. Current local env may target shared Supabase production data; avoid destructive operations unless deliberately validating a controlled workflow.
