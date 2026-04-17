# Payment Service Frontend - Testing Guide

## 🚀 Quick Start

### 1. Setup Environment

```bash
cd frontend
```

Create `.env.local` file:
```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_51234567890abcdefghijklmnop
VITE_API_URL=http://localhost:8080
VITE_ENABLE_PAYMENT_FEATURE=true
```

### 2. Start Services

**Terminal 1 - Backend:**
```bash
cd backend
docker-compose up -d
# Verify all services are running:
docker-compose ps
```

**Terminal 2 - Frontend:**
```bash
cd frontend
pnpm dev
```

Frontend will be available at: `http://localhost:5173`

---

## 🧪 Test Scenarios

### Scenario 1: View Payment History

**Steps:**
1. Navigate to `http://localhost:5173/patient`
2. Click on "💳 Payments" tab
3. View your transaction history

**Expected Result:**
- Transaction list displays (empty if no payments)
- Filter and sort controls work
- Summary statistics shown

---

### Scenario 2: Initiate Payment (No Stripe Key)

**Steps:**
1. In Patient Portal, book an appointment
2. If payment modal appears, click "Pay Now"
3. See payment form

**Expected Result:**
- Payment form displays with amount
- "Proceed to Payment" button ready
- If Stripe not configured: error message shown

---

### Scenario 3: Complete Payment (With Stripe)

**Prerequisites:**
- Valid Stripe publishable key in `.env.local`

**Steps:**
1. Book an appointment (amount will be set)
2. Click "Pay Now" button
3. Click "Proceed to Payment"
4. Fill Stripe payment form with test card
5. Click "Complete Payment"

**Test Cards:**
```
Success:        4242 4242 4242 4242
Decline:        4000 0000 0000 0002
Requires Auth:  4000 0025 0000 3155
```

Use any future expiry date and any 3-digit CVC.

**Expected Result:**
- Payment processes
- Confirmation screen shows
- Transaction appears in history

---

### Scenario 4: Handle Payment Decline

**Steps:**
1. Use card: `4000 0000 0000 0002`
2. Complete payment flow
3. Observe error

**Expected Result:**
- Error message displays: "Payment declined"
- User can retry with different card
- Payment not recorded in history

---

### Scenario 5: Filter Transactions

**Steps:**
1. Go to Payments tab
2. Click "Status Filter" dropdown
3. Select "SUCCESS"
4. Verify list updates

**Expected Result:**
- Only successful transactions shown
- Transaction count updates
- Summary statistics recalculate

---

### Scenario 6: Sort Transactions

**Steps:**
1. Go to Payments tab
2. Click "Sort By" dropdown
3. Select "Highest Amount"
4. Verify list reorders

**Expected Result:**
- Transactions sorted correctly
- Order updates immediately

---

## ✅ Checklist

### Functionality
- [ ] Payment history loads successfully
- [ ] Filter by status works
- [ ] Sort by date/amount works
- [ ] Summary statistics correct
- [ ] View transaction details
- [ ] Payment initiation works
- [ ] Stripe form displays
- [ ] Success confirmation shows
- [ ] Refund button appears for successful payments

### Error Handling
- [ ] Network errors handled
- [ ] Invalid amount shows error
- [ ] Missing appointment ID shows error
- [ ] Missing Stripe key shows error
- [ ] Declined card shows error

### UI/UX
- [ ] Responsive on mobile
- [ ] Responsive on tablet
- [ ] Responsive on desktop
- [ ] Loading spinners work
- [ ] Error messages clear
- [ ] Buttons are accessible
- [ ] Color scheme consistent

### Performance
- [ ] Page loads quickly
- [ ] Transaction history loads < 2 seconds
- [ ] Payment form responsive
- [ ] No console errors

---

## 🐛 Troubleshooting

### Stripe Form Not Loading

**Check:**
1. Is `.env.local` set with correct key?
2. Is Stripe API accessible?
3. Check browser console for errors

**Solution:**
```bash
# Check console for CORS errors
# Verify VITE_STRIPE_PUBLISHABLE_KEY starts with pk_test_
```

### API Errors

**Check:**
1. Is payment service running on port 8086?
2. Is API gateway routing /api/payments correctly?
3. Check backend logs: `docker logs backend-payment-service`

**Solution:**
```bash
# Verify services running
docker-compose ps

# Check payment service logs
docker-compose logs payment-service
```

### Transaction History Empty

**Check:**
1. Have you completed any payments?
2. Is patient ID correct?
3. Check browser DevTools Network tab for API response

**Solution:**
```bash
# Make a test payment first
# Verify patientId matches your session
```

### Build Errors

**Solution:**
```bash
# Clear cache and reinstall
rm -rf node_modules pnpm-lock.yaml
pnpm install
pnpm dev
```

---

## 📊 Browser DevTools Tips

### Check Network Requests

1. Open DevTools (F12)
2. Go to Network tab
3. Perform payment action
4. Check requests to `/api/payments/*`
5. Verify response status and data

### Check Console Logs

1. Open DevTools (F12)
2. Go to Console tab
3. Look for error messages
4. Check for 404 or 500 errors

### Storage

1. Open DevTools (F12)
2. Go to Storage > Local Storage
3. Check for:
   - `patientSession` (patient info)
   - `token` (authentication)
   - `userId`, `userRole`

---

## 📱 Mobile Testing

### Chrome DevTools Mobile Emulation

1. Open DevTools (F12)
2. Click device toggle icon
3. Select mobile device
4. Refresh page
5. Test all interactions

**Test Devices:**
- iPhone 12
- iPhone SE
- Samsung Galaxy S10
- iPad
- Pixel 5

---

## 🔗 API Testing with Postman

### Import Collection

Use: `Payment_Service_Collection.postman_collection.json`

### Test Endpoints

1. **Initiate Payment**
   ```
   POST /api/payments/initiate
   Body: {
     "appointmentId": "uuid",
     "patientId": "patient-001",
     "amount": 5000,
     "currency": "LKR"
   }
   ```

2. **Get Transaction**
   ```
   GET /api/payments/transaction/{transactionId}
   ```

3. **Get Patient History**
   ```
   GET /api/payments/patient/{patientId}/history
   ```

---

## 📈 Performance Metrics

### Target Metrics
- Page load: < 2 seconds
- Transaction list load: < 1 second
- Filter/Sort response: < 500ms
- Payment form interactivity: immediate

### Check with Lighthouse

1. DevTools > Lighthouse
2. Generate report
3. Check Performance, Accessibility, Best Practices

---

## ✨ Success Criteria

✅ All manual test scenarios pass  
✅ No console errors  
✅ Responsive on all devices  
✅ API calls complete successfully  
✅ Stripe integration working  
✅ User can initiate and confirm payment  
✅ Transaction history displays correctly  
✅ Error handling working properly  

---

## 🚀 Deployment Checklist

Before deploying to production:

- [ ] All test scenarios pass
- [ ] No console errors
- [ ] Environment variables set correctly
- [ ] Stripe keys verified
- [ ] Backend services verified
- [ ] HTTPS enabled
- [ ] CORS properly configured
- [ ] Database backups in place
- [ ] Monitoring configured
- [ ] Error logging setup

---

**Test Plan Version:** 1.0  
**Last Updated:** April 17, 2026  
**Status:** Ready for Testing
