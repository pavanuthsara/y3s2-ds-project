#!/bin/bash
set -e

echo "=== Payment Service Startup ==="
cd /Users/kaveeshaathukorala/blog-api/y3s2-ds-project/backend/payment-service

# Kill existing processes
pkill -f "java.*payment-service" 2>/dev/null || true
sleep 2

# Set environment variables
export STRIPE_SECRET_KEY="sk_test_51TMvcaA621M92XkWJGzMnqZVd9L8ym0EamEll411jtYQZdKhJS3gAa6HSyA8zVJbFFEsrd4WzIf4RkXGtrFal7M9002YvmoSuX"

# Start service
echo "Starting Payment Service..."
java -jar target/payment-service-0.0.1-SNAPSHOT.jar > /tmp/payment-service.log 2>&1 &

# Wait and check
sleep 8

# Verify service is running
if lsof -i :8086 2>/dev/null | grep -q LISTEN; then
    echo "✅ SUCCESS! Payment Service is running on port 8086"
    echo ""
    echo "🧪 You can now test the Postman collection!"
    echo "   Use the Payment_Service_Collection.postman_collection.json"
else
    echo "❌ Service failed to start"
    echo "Checking logs..."
    tail -30 /tmp/payment-service.log
fi
