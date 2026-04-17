# Payment Service Frontend Implementation Plan

## 📋 Overview
Implement a complete payment service UI integrated with the patient portal, allowing patients to pay for appointments using Stripe.

---

## 🏗️ Project Structure

```
frontend/src/features/payments/
├── components/
│   ├── PaymentForm.jsx              # Main payment initiation form
│   ├── PaymentModal.jsx             # Modal wrapper for payment
│   ├── StripePaymentElement.jsx     # Stripe Elements integration
│   ├── PaymentConfirmation.jsx      # Confirmation after payment
│   ├── TransactionHistory.jsx       # Patient payment history
│   ├── TransactionCard.jsx          # Individual transaction display
│   ├── PaymentStatusBadge.jsx       # Status badge component
│   └── PaymentLoader.jsx            # Loading state
├── pages/
│   └── PaymentPage.jsx              # Standalone payment page
├── services/
│   ├── paymentService.js            # API service for payments
│   └── stripeService.js             # Stripe client initialization
├── styles/
│   ├── PaymentForm.css
│   ├── PaymentModal.css
│   └── TransactionHistory.css
├── hooks/
│   ├── usePaymentForm.js            # Form state management
│   └── useStripeElements.js         # Stripe elements hook
└── README.md                        # Feature documentation
```

---

## 📦 Dependencies to Add

```bash
# Stripe React library
npm install @stripe/react-stripe-js @stripe/js

# Additional validation (optional but recommended)
npm install yup react-hook-form
```

---

## 🎯 Implementation Tasks

### Phase 1: Setup & Configuration
- [ ] **1.1** Create payment feature directory structure
- [ ] **1.2** Install Stripe dependencies
- [ ] **1.3** Set up environment variables for Stripe keys
- [ ] **1.4** Create Stripe service configuration
- [ ] **1.5** Create payment API service

### Phase 2: Core Components
- [ ] **2.1** Create `PaymentForm.jsx` (initiate payment)
- [ ] **2.2** Create `StripePaymentElement.jsx` (payment input)
- [ ] **2.3** Create `PaymentConfirmation.jsx` (success screen)
- [ ] **2.4** Create `PaymentModal.jsx` (modal wrapper)
- [ ] **2.5** Create `PaymentLoader.jsx` (loading states)

### Phase 3: History & Display
- [ ] **3.1** Create `TransactionHistory.jsx` (list all transactions)
- [ ] **3.2** Create `TransactionCard.jsx` (individual transaction)
- [ ] **3.3** Create `PaymentStatusBadge.jsx` (status indicator)
- [ ] **3.4** Add filtering/sorting functionality

### Phase 4: Hooks & Services
- [ ] **4.1** Create `usePaymentForm.js` hook
- [ ] **4.2** Create `useStripeElements.js` hook
- [ ] **4.3** Create comprehensive payment API service

### Phase 5: Integration
- [ ] **5.1** Integrate payment modal into patient portal
- [ ] **5.2** Add "Pay Now" button to appointment cards
- [ ] **5.3** Add payment history tab to patient dashboard
- [ ] **5.4** Update routes in App.jsx

### Phase 6: UI/UX & Styling
- [ ] **6.1** Apply Tailwind CSS styling
- [ ] **6.2** Create responsive design
- [ ] **6.3** Add error handling UI
- [ ] **6.4** Add loading animations

### Phase 7: Testing & Validation
- [ ] **7.1** Test with Stripe test cards
- [ ] **7.2** Test error scenarios
- [ ] **7.3** Test mobile responsiveness
- [ ] **7.4** Fix frontend build errors

---

## 📋 Component Specifications

### PaymentForm Component
**Purpose**: Main component for initiating payment
```javascript
Props:
  - appointmentId (UUID)
  - amount (number)
  - patientId (string)
  - onSuccess (callback)
  - onCancel (callback)

State:
  - formData: { amount, currency }
  - loading: boolean
  - error: string
  - transactionId: UUID

Methods:
  - initiatePayment()
  - handleSubmit()
  - validateForm()
```

### StripePaymentElement Component
**Purpose**: Render Stripe payment input
```javascript
Props:
  - clientSecret (string)
  - onPaymentMethodChange (callback)
  - disabled (boolean)

Functionality:
  - Display Stripe Elements
  - Handle payment method selection
  - Display payment errors
```

### PaymentConfirmation Component
**Purpose**: Show successful payment status
```javascript
Props:
  - transactionId (UUID)
  - amount (number)
  - appointmentId (UUID)
  - onClose (callback)

Functionality:
  - Display confirmation message
  - Show transaction details
  - Provide download receipt option
```

### TransactionHistory Component
**Purpose**: Display patient's payment history
```javascript
Props:
  - patientId (string)

Features:
  - Fetch and display transactions
  - Sort by date
  - Filter by status
  - Pagination support
```

---

## 🔌 API Service Methods

### paymentService.js
```javascript
// Initiate payment
initiatePayment(appointmentId, patientId, amount, currency)
  → Returns: { transactionId, clientSecret, amount, currency }

// Confirm payment
confirmPayment(transactionId, paymentMethodId)
  → Returns: { status, transactionId, paidAt }

// Get transaction details
getTransaction(transactionId)
  → Returns: { id, appointmentId, amount, status, paidAt }

// Get patient transaction history
getPatientHistory(patientId)
  → Returns: Array<Transaction>

// Refund transaction
refundTransaction(transactionId)
  → Returns: { status, refundedAt }

// Get transaction by appointment
getTransactionByAppointment(appointmentId)
  → Returns: Transaction or null
```

---

## 🎨 UI Flow

```
1. Patient Portal Dashboard
   ↓
2. Click "Pay for Appointment" button
   ↓
3. PaymentModal Opens
   ├─ PaymentForm
   │  ├─ Amount Display
   │  ├─ StripePaymentElement
   │  └─ Pay Button
   ↓
4. Backend initiates payment (creates transaction)
   ↓
5. User enters payment details in Stripe form
   ↓
6. Confirm payment via API
   ↓
7. PaymentConfirmation shown (success/error)
   ↓
8. Update appointment status
   ↓
9. Display in TransactionHistory
```

---

## 🔐 Security Considerations

- [ ] Never expose Stripe Secret Key in frontend
- [ ] Use environment variables for Stripe Publishable Key
- [ ] Always validate on backend
- [ ] Handle sensitive data securely
- [ ] Implement CORS properly
- [ ] Use HTTPS only in production
- [ ] Validate user authentication before payment

---

## 📱 Responsive Design Breakpoints

- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

---

## 🧪 Testing Scenarios

### Stripe Test Cards
```
Success: 4242 4242 4242 4242
Decline: 4000 0000 0000 0002
Requires Auth: 4000 0025 0000 3155
```

### Test Cases
- [ ] Initiate payment for valid appointment
- [ ] Confirm payment with valid card
- [ ] Handle payment decline
- [ ] Handle network errors
- [ ] Display transaction history
- [ ] Process refund
- [ ] Mobile responsiveness

---

## 📊 Status Indicators

| Status | Color | Icon |
|--------|-------|------|
| PENDING | Yellow | ⏳ |
| SUCCESS | Green | ✅ |
| FAILED | Red | ❌ |
| REFUNDED | Blue | 🔄 |
| CANCELLED | Gray | ⏹️ |

---

## 🚀 Timeline Estimate

| Phase | Tasks | Estimate |
|-------|-------|----------|
| Phase 1 | Setup | 1 hour |
| Phase 2 | Core Components | 3 hours |
| Phase 3 | History & Display | 2 hours |
| Phase 4 | Hooks & Services | 1.5 hours |
| Phase 5 | Integration | 1 hour |
| Phase 6 | Styling | 2 hours |
| Phase 7 | Testing | 1.5 hours |
| **Total** | | **~12 hours** |

---

## ✅ Definition of Done

- [ ] All components created and functional
- [ ] API integration complete
- [ ] Stripe integration working
- [ ] Error handling implemented
- [ ] Responsive design verified
- [ ] All routes configured
- [ ] Build passes without errors
- [ ] Payment flow tested end-to-end
- [ ] Transaction history displays correctly
- [ ] Documentation updated

---

## 🔗 Related Files

- Backend: `/backend/payment-service/`
- API Docs: `/docs/PAYMENT_SERVICE_TESTING_GUIDE.md`
- Postman Collection: `/payment-testing/Payment_Service_Collection.postman_collection.json`

---

## 📝 Notes

- Use Tailwind CSS for all styling (no custom CSS unless necessary)
- Follow existing component patterns from appointment/doctor features
- Implement proper error handling and user feedback
- Test with Stripe test mode credentials
- Keep payment logic separate from appointment logic
- Document any custom hooks or utilities

---

**Next Step**: Start with Phase 1 - Setup & Configuration
