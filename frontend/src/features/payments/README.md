# Payment Service Frontend Feature

This directory contains all the frontend components, services, and hooks for the payment service feature of the healthcare platform.

## 📁 Structure

```
payments/
├── components/           # React components
│   ├── PaymentForm.jsx
│   ├── PaymentModal.jsx
│   ├── StripePaymentElement.jsx
│   ├── PaymentConfirmation.jsx
│   ├── TransactionHistory.jsx
│   ├── TransactionCard.jsx
│   ├── PaymentStatusBadge.jsx
│   ├── PaymentLoader.jsx
│   └── index.js
├── pages/               # Page components
│   ├── PaymentPage.jsx
│   └── index.js
├── services/            # API and Stripe services
│   ├── paymentService.js
│   ├── stripeService.js
│   └── index.js
├── hooks/               # Custom React hooks
│   ├── usePaymentForm.js
│   ├── useStripeElements.js
│   └── index.js
└── styles/              # CSS files
```

## 🚀 Quick Start

### 1. Environment Setup

Create a `.env.local` file in the frontend directory:

```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
VITE_API_URL=http://localhost:8080
VITE_ENABLE_PAYMENT_FEATURE=true
```

Get your Stripe keys from: https://dashboard.stripe.com/

### 2. Import Components

```javascript
import { PaymentModal, TransactionHistory } from '@/features/payments/components';
import { PaymentPage } from '@/features/payments/pages';
```

### 3. Use Payment Modal

```javascript
import { useState } from 'react';
import { PaymentModal } from '@/features/payments/components';

function MyComponent() {
  const [showPayment, setShowPayment] = useState(false);

  return (
    <>
      <button onClick={() => setShowPayment(true)}>Pay Now</button>
      
      <PaymentModal
        isOpen={showPayment}
        appointmentId="abc-123"
        patientId="patient-001"
        amount={5000}
        currency="LKR"
        onClose={() => setShowPayment(false)}
        onSuccess={(result) => {
          console.log('Payment successful:', result);
        }}
      />
    </>
  );
}
```

### 4. Display Transaction History

```javascript
import { TransactionHistory } from '@/features/payments/components';

function HistoryPage() {
  return (
    <TransactionHistory
      patientId="patient-001"
      showActions={true}
      onRefund={(txn) => console.log('Refund:', txn)}
      onViewDetails={(txn) => console.log('Details:', txn)}
    />
  );
}
```

## 🎨 Components

### PaymentModal
Modal wrapper for the payment form.

**Props:**
```javascript
{
  isOpen: boolean,
  appointmentId: UUID,
  patientId: string,
  amount: number,
  currency: string,
  onClose: function,
  onSuccess: function,
  title: string
}
```

### PaymentForm
Main payment form handling initiation and confirmation.

**Features:**
- Payment initiation
- Stripe payment element integration
- Payment confirmation
- Error handling
- Loading states

### TransactionHistory
Displays patient payment history with filters and sorting.

**Features:**
- View all transactions
- Filter by status
- Sort by date/amount
- Summary statistics
- Refund capability

### PaymentConfirmation
Success confirmation screen.

### TransactionCard
Individual transaction display with actions.

### PaymentStatusBadge
Status indicator with color coding.

## 🪝 Hooks

### usePaymentForm()
Manages payment form state and logic.

```javascript
const {
  formData,
  loading,
  error,
  success,
  transactionId,
  clientSecret,
  updateField,
  initiatePayment,
  resetForm,
  validateForm
} = usePaymentForm(appointmentId, patientId, amount, currency);
```

### useStripeElements()
Manages Stripe Elements initialization and payment confirmation.

```javascript
const {
  stripe,
  elements,
  paymentElement,
  loading,
  error,
  createPaymentElement,
  mountPaymentElement,
  confirmPayment,
  getPaymentElementStatus,
  cleanup
} = useStripeElements();
```

## 🔗 Services

### paymentService

```javascript
// Initiate payment
await paymentService.initiatePayment(appointmentId, patientId, amount, currency);

// Confirm payment
await paymentService.confirmPayment(transactionId, paymentMethodId);

// Get transaction
await paymentService.getTransaction(transactionId);

// Get patient history
await paymentService.getPatientHistory(patientId);

// Refund transaction
await paymentService.refundTransaction(transactionId);

// Get all transactions (admin)
await paymentService.getAllTransactions();

// Check service health
await paymentService.checkPaymentServiceHealth();
```

### stripeService

```javascript
// Get Stripe instance
const stripe = await getStripe();

// Initialize Stripe Elements
const elements = await initializeStripeElements(stripe);
```

## 🧪 Testing

### Stripe Test Cards

```
Success:         4242 4242 4242 4242
Decline:         4000 0000 0000 0002
Requires Auth:   4000 0025 0000 3155
```

Any future expiry date and any 3-digit CVC.

### Test Scenarios

1. **Successful Payment**
   - Use card: 4242 4242 4242 4242
   - Should complete payment and show confirmation

2. **Declined Payment**
   - Use card: 4000 0000 0000 0002
   - Should show error message

3. **Payment Authentication**
   - Use card: 4000 0025 0000 3155
   - Should prompt for 3D Secure authentication

4. **Transaction History**
   - Filter and sort transactions
   - View transaction details
   - Process refunds

## 🔐 Security

- Never expose Stripe Secret Key
- Always use HTTPS in production
- Validate on backend before processing
- Store sensitive data securely
- Use environment variables for keys
- CORS properly configured

## 📚 API Endpoints

All endpoints require authentication headers:
- `X-User-Id`: User ID
- `X-User-Role`: User role
- `Authorization`: Bearer token

```
POST   /api/payments/initiate              # Start payment
POST   /api/payments/confirm               # Confirm payment
GET    /api/payments/transaction/{id}      # Get transaction
GET    /api/payments/patient/{id}/history  # Patient history
POST   /api/payments/refund/{id}           # Refund transaction
GET    /api/payments/admin/all             # All transactions (admin)
GET    /api/payments/health                # Service health
```

## 🐛 Troubleshooting

### Stripe Element Not Loading
- Check `VITE_STRIPE_PUBLISHABLE_KEY` in `.env.local`
- Verify Stripe API is accessible
- Check browser console for errors

### Payment Confirmation Failed
- Ensure API URL is correct in `.env.local`
- Check network tab for API responses
- Verify backend payment service is running

### Transaction History Empty
- Ensure patient ID is correct
- Check authentication headers
- Verify transactions exist in database

## 📖 Additional Resources

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe React Library](https://github.com/stripe/react-stripe-js)
- [Backend Payment Service](/backend/payment-service/)
- [Testing Guide](/docs/PAYMENT_SERVICE_TESTING_GUIDE.md)

## ✅ Feature Checklist

- [x] Stripe integration setup
- [x] Payment form component
- [x] Payment modal wrapper
- [x] Payment confirmation
- [x] Transaction history
- [x] Payment status badge
- [x] Error handling
- [x] Loading states
- [x] Custom hooks
- [x] API services
- [ ] Integration with patient portal (next phase)
- [ ] Styling and responsive design (in progress)
- [ ] Testing and validation (in progress)
