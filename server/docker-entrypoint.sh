#!/bin/sh
set -e

echo "🔄 Waiting for database to be ready..."
until npx sequelize-cli db:migrate:status > /dev/null 2>&1; do
  echo "⏳ Database not ready yet, waiting..."
  sleep 2
done

echo "✅ Database is ready!"

echo "🚀 Running database migrations..."
npx sequelize-cli db:migrate

# Only run seeders if the directory exists and contains files
if [ -d "./seeders" ] && [ "$(ls -A ./seeders 2>/dev/null)" ]; then
  echo "🌱 Running database seeders..."
  npx sequelize-cli db:seed:all
else
  echo "ℹ️  No seeders found, skipping..."
fi

echo "✅ Database setup complete!"
echo "🚀 Starting application..."

# Execute the main command (passed as arguments)
exec "$@"
