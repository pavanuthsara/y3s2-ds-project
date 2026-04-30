#!/bin/bash

# All-in-One Payment Testing Startup Script
# Starts Auth Service, API Gateway, and ensures Payment Service is ready

set -e

PROJECT_ROOT="/Users/kaveeshaathukorala/blog-api/y3s2-ds-project"
BACKEND="$PROJECT_ROOT/backend"

echo "🚀 Starting All Services for Payment Testing"
echo "=============================================="
echo ""

# Check if services are already running
check_service() {
  local port=$1
  local name=$2
  if lsof -i :$port 2>/dev/null | grep -q LISTEN; then
    echo "✅ $name is already running on port $port"
    return 0
  else
    echo "⚠️  $name not running on port $port"
    return 1
  fi
}

# 1. Check Auth Service
echo "📌 Checking Auth Service (8081)..."
if ! check_service 8081 "Auth Service"; then
  echo "   Starting Auth Service..."
  cd "$BACKEND/auth-service"
  nohup java -jar target/auth-service-0.0.1-SNAPSHOT.jar > /tmp/auth-service.log 2>&1 &
  sleep 5
fi

# 2. Check API Gateway
echo "📌 Checking API Gateway (8080)..."
if ! check_service 8080 "API Gateway"; then
  echo "   Starting API Gateway..."
  cd "$BACKEND/api-gateway"
  nohup java -jar target/api-gateway-0.0.1-SNAPSHOT.jar > /tmp/api-gateway.log 2>&1 &
  sleep 5
fi

# 3. Check Payment Service
echo "📌 Checking Payment Service (8086)..."
if ! check_service 8086 "Payment Service"; then
  echo "   Starting Payment Service..."
  cd "$BACKEND/payment-service"
  DB_HOST=localhost DB_PORT=5433 DB_NAME=payment_service_db \
  DB_USERNAME=postgres DB_PASSWORD=postgres \
  nohup java -jar target/payment-service-0.0.1-SNAPSHOT.jar > /tmp/payment-service.log 2>&1 &
  sleep 5
fi

# 4. Check Database
echo "📌 Checking PostgreSQL Database..."
if docker ps 2>/dev/null | grep -q payment-postgres; then
  echo "✅ PostgreSQL is running on port 5433"
else
  echo "   Starting PostgreSQL..."
  cd "$PROJECT_ROOT"
  docker-compose up -d payment-postgres
  sleep 3
fi

echo ""
echo "=============================================="
echo "✅ All services ready for testing!"
echo "=============================================="
echo ""
echo "🧪 To run automated tests:"
echo "   cd $PROJECT_ROOT/payment-testing"
echo "   ./test-payment.sh"
echo ""
echo "📖 Or follow manual tests:"
echo "   See PAYMENT_TEST_GUIDE.md"
echo ""
echo "🔍 Service URLs:"
echo "   Auth Service: http://localhost:8081"
echo "   API Gateway: http://localhost:8080"
echo "   Payment Service: http://localhost:8086"
echo ""
