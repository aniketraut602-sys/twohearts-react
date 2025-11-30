#!/bin/sh
set -e

# Run migrations
echo "Running migrations..."
node api/scripts/migrate.js

# Start the server
echo "Starting server..."
exec node api/server.js
