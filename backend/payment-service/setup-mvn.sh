#!/usr/bin/env bash
set -e

# Script to copy Maven wrapper from another service
if [ ! -f mvnw ]; then
  echo "Copying Maven wrapper from auth-service..."
  cp ../auth-service/mvnw ./
  cp ../auth-service/.mvn ./ -r
  chmod +x mvnw
fi

echo "Maven wrapper ready!"
