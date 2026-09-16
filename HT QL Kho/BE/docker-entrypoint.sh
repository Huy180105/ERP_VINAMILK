#!/bin/bash
set -e

# Install composer dependencies if vendor directory is missing
if [ ! -d "vendor" ]; then
    echo "vendor/ not found. Running composer install..."
    composer install --no-interaction --optimize-autoloader --no-dev
fi

# Generate app key if not set
php artisan key:generate --force --no-interaction 2>/dev/null || true

# Wait for database to be ready
echo "Waiting for database..."
max_retries=30
counter=0
until php artisan migrate --force --no-interaction 2>/dev/null; do
    counter=$((counter + 1))
    if [ $counter -ge $max_retries ]; then
        echo "Database not ready after $max_retries attempts, starting anyway..."
        break
    fi
    echo "Database not ready yet... retrying in 3s ($counter/$max_retries)"
    sleep 3
done

# Set permissions
chown -R www-data:www-data storage bootstrap/cache 2>/dev/null || true

echo "Starting Laravel server..."
exec php artisan serve --host=0.0.0.0 --port=8000
