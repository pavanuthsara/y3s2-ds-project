# Payment Service Implementation Checklist

## ✅ Completed

- [x] Project structure created
- [x] Maven pom.xml with all dependencies
- [x] Stripe integration dependency added
- [x] Application configuration (application.yml)
- [x] Payment entities (PaymentTransaction)
- [x] DTOs for requests/responses
- [x] Repository layer
- [x] Service layer (PaymentService, StripePaymentService)
- [x] Controller layer (PaymentController, WebhookController)
- [x] Exception handling & GlobalExceptionHandler
- [x] Security configuration & JWT filter
- [x] Stripe configuration
- [x] Docker & Docker Compose setup
- [x] Database schema

## 🔄 Next Steps

1. **Copy Maven Wrapper**
   ```shell
   cd backend/payment-service
   cp ../auth-service/mvnw ./
   cp ../auth-service/.mvn ./ -r
   chmod +x mvnw
   ```

2. **Build the service**
   ```shell
   cd backend/payment-service
   ./mvnw clean package -DskipTests
   ```

3. **Update API Gateway routes** (add payment-service proxy)
   - Add /api/payments/** → http://payment-service:8086

4. **Set Stripe credentials** in docker-compose.yml
   - `STRIPE_SECRET_KEY`: Replace with your Stripe test key
   - `STRIPE_WEBHOOK_SECRET`: Replace with your webhook secret
   - `STRIPE_PUBLISHABLE_KEY`: Replace with your publishable key

5. **Start payment service**
   ```shell
   docker-compose up -d payment-service
   ```

6. **Verify health**
   ```shell
   curl http://localhost:8086/api/payments/health
   ```

## API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | /api/payments/initiate | Start payment transaction |
| POST | /api/payments/confirm | Confirm completed payment |
| GET | /api/payments/transaction/{id} | Get transaction details |
| GET | /api/payments/patient/{patientId}/history | Patient transaction history |
| POST | /api/payments/refund/{transactionId} | Process refund |
| GET | /api/payments/admin/all | All transactions (admin) |
| POST | /webhooks/stripe | Stripe webhook handler |

## Database Schema

```sql
CREATE TABLE payment_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    appointment_id UUID NOT NULL,
    patient_id VARCHAR(255) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(5) DEFAULT 'LKR',
    payment_gateway VARCHAR(50) NOT NULL,
    gateway_order_id VARCHAR(255),
    gateway_payment_id VARCHAR(255),
    status VARCHAR(20) DEFAULT 'PENDING',
    failure_reason VARCHAR(500),
    paid_at TIMESTAMP,
    refunded_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

## Testing with Postman

See `/docs/PAYMENT_SERVICE_TESTING_GUIDE.md` for complete testing guide.
