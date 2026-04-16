#!/bin/bash

# Payment Service Startup Script with Stripe Configuration

cd /Users/kaveeshaathukorala/blog-api/y3s2-ds-project/backend/payment-service

# Export environment variables
export STRIPE_SECRET_KEY="sk_test_51TMvcaA621M92XkWJGzMnqZVd9L8ym0EamEll411jtYQZdKhJS3gAa6HSyA8zVJbFFEsrd4WzIf4RkXGtrFal7M9002YvmoSuX"
export DB_HOST="localhost"
export DB_PORT="5433"
export DB_NAME="payment_service_db"
export DB_USERNAME="postgres"
export DB_PASSWORD="postgres"
export JWT_SECRET="mySecretKeyForJwtTokenGenerationAndValidationPurposesOnly123456789"

# Debug output
echo "🔧 Environment Variables:"
echo "   STRIPE_SECRET_KEY: ${STRIPE_SECRET_KEY:0:30}..."
echo "   DB_HOST: $DB_HOST"
echo "   DB_PORT: $DB_PORT"
echo "   DB_NAME: $DB_NAME"
echo ""

# Kill any existing process on port 8086
echo "🛑 Killing processes on port 8086..."
lsof -i :8086 2>/dev/null | grep -v COMMAND | awk '{print $2}' | xargs kill -9 2>/dev/null || true

sleep 2

# Start the service
echo "🚀 Starting Payment Service..."
java -jar target/payment-service-0.0.1-SNAPSHOT.jar > /tmp/payment-service.log 2>&1 &

# Get the PID
PID=$!
echo "✅ Payment Service started (PID: $PID)"
echo "   Logs: tail -f /tmp/payment-service.log"
echo ""
echo "Waiting for service to start..."
sleep 8

# Check if service is running
if lsof -i :8086 2>/dev/null | grep -q LISTEN; then
    echo "✅ Payment Service is now listening on port 8086"
    echo ""
    echo "🧪 Test it:"
    echo "   curl -X GET http://localhost:8086/api/payments/health"
else
    echo "❌ Service failed to start. Checking logs..."
    tail -30 /tmp/payment-service.log | grep -A5 "ERROR"
fi
