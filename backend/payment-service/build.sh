#!/bin/bash
set -e

cd "$(dirname "$0")"/backend/payment-service

echo "Building Payment Service..."
mvn clean package -DskipTests

echo "Build completed successfully!"
