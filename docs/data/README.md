# Data and persistence

PostgreSQL is the durable system of record and Sequelize is the Node mapping/migration layer. Supabase is the current hosted target. Read [models and relationships](models.md) before schema changes and follow the [Heroku-to-Supabase migration runbook](migration-runbook.md) for cutover.

Models and ordered migrations are in `server/models/` and `server/migrations/`. ORM definitions do not prove deployed schema state. Verify migration history, constraints, sequences, indexes, and row counts in the active DB before declaring a migration complete.
