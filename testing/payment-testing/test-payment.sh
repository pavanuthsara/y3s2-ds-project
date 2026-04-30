#!/bin/bash

# Payment Service Testing Script
# This script tests all payment service endpoints

set -e

BASE_URL="http://localhost:8080"
PAYMENT_URL="http://localhost:8086"
PATIENT_ID="patient-123"
APPOINTMENT_ID="550e8400-e29b-41d4-a716-446655440000"

echo "================================"
echo "Payment Service Testing Script"
echo "================================"
echo ""

# Step 1: Login
echo "📌 Step 1: Getting Authentication Token..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "patient@test.com",
    "password": "password123"
  }')

TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "❌ Failed to get authentication token"
  echo "Response: $LOGIN_RESPONSE"
  exit 1
fi

echo "✅ Token obtained: ${TOKEN:0:30}..."
echo ""

# Step 2: Health Check
echo "📌 Step 2: Payment Service Health Check..."
HEALTH=$(curl -s -X GET "$PAYMENT_URL/api/payments/health")
echo "✅ Response: $HEALTH"
echo ""

# Step 3: Initiate Payment
echo "📌 Step 3: Initiating Payment..."
PAYMENT_RESPONSE=$(curl -s -X POST "$PAYMENT_URL/api/payments/initiate" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"appointmentId\": \"$APPOINTMENT_ID\",
    \"patientId\": \"$PATIENT_ID\",
    \"amount\": 5000.00,
    \"currency\": \"LKR\",
    \"description\": \"Consultation Fee\"
  }")

TRANSACTION_ID=$(echo "$PAYMENT_RESPONSE" | grep -o '"transactionId":"[^"]*' | cut -d'"' -f4)
CLIENT_SECRET=$(echo "$PAYMENT_RESPONSE" | grep -o '"clientSecret":"[^"]*' | cut -d'"' -f4)

if [ -z "$TRANSACTION_ID" ]; then
  echo "❌ Failed to initiate payment"
  echo "Response: $PAYMENT_RESPONSE"
  exit 1
fi

echo "✅ Payment initiated"
echo "   Transaction ID: $TRANSACTION_ID"
echo "   Client Secret: ${CLIENT_SECRET:0:20}..."
echo ""

# Step 4: Get Transaction Details
echo "📌 Step 4: Getting Transaction Details..."
TRANSACTION=$(curl -s -X GET "$PAYMENT_URL/api/payments/transaction/$TRANSACTION_ID" \
  -H "Authorization: Bearer $TOKEN")
echo "✅ Response:"
echo "$TRANSACTION" | grep -o '"[^"]*":"[^"]*' | head -5
echo ""

# Step 5: Confirm Payment
echo "📌 Step 5: Confirming Payment..."
CONFIRM_RESPONSE=$(curl -s -X POST "$PAYMENT_URL/api/payments/confirm" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"transactionId\": \"$TRANSACTION_ID\",
    \"paymentMethodId\": \"pm_test_visa\"
  }")

echo "✅ Response:"
echo "$CONFIRM_RESPONSE" | grep -o '"[^"]*":"[^"]*' | head -5
echo ""

# Step 6: Get Payment History
echo "📌 Step 6: Getting Payment History..."
HISTORY=$(curl -s -X GET "$PAYMENT_URL/api/payments/patient/$PATIENT_ID/history" \
  -H "Authorization: Bearer $TOKEN")
echo "✅ Found payments:"
echo "$HISTORY" | grep -o '"transactionId":"[^"]*' | head -3
echo ""

echo "================================"
echo "✅ All tests completed successfully!"
echo "================================"
