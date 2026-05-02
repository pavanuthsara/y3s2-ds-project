#!/bin/bash
set -e

# Create all service logical databases inside the shared PostgreSQL instance.
# Using SELECT … \gexec makes the script idempotent: databases that already
# exist are silently skipped.
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    SELECT 'CREATE DATABASE authdb'
        WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'authdb')\gexec
    SELECT 'CREATE DATABASE patient_service_db'
        WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'patient_service_db')\gexec
    SELECT 'CREATE DATABASE doctor_service_db'
        WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'doctor_service_db')\gexec
    SELECT 'CREATE DATABASE appointment_service_db'
        WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'appointment_service_db')\gexec
    SELECT 'CREATE DATABASE payment_service_db'
        WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'payment_service_db')\gexec
    SELECT 'CREATE DATABASE notification_service_db'
        WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'notification_service_db')\gexec
EOSQL
