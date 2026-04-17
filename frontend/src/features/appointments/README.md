# Appointment Service Frontend

This is the frontend implementation for the appointment booking and management system.

## Features Implemented

### 1. **Appointment Booking** (`/appointments/book`)
- Form to book a new appointment
- Input fields:
  - Patient ID
  - Doctor Username
  - Slot ID
  - Appointment Date & Time
  - Appointment Mode (Virtual/Physical)
  - Hospital/Location (for physical appointments)
  - Notes (optional)
- Form validation with error messages
- Success confirmation with appointment details
- Next steps guidance post-booking

### 2. **Appointment History** (`/appointments/history`)
- View all appointments for a patient
- Search by Patient ID
- Filter by status:
  - All
  - Pending
  - Confirmed
  - Completed
  - Cancelled
- Cancel appointments (for PENDING and CONFIRMED status)
- View full appointment details
- Display appointment cards with all relevant information

### 3. **Appointment Components**

#### `AppointmentBookingForm`
- Multi-field form with validation
- Real-time error feedback
- Conditional field display (Hospital field shows only for PHYSICAL mode)
- Loading state during submission
- Success message on booking

#### `AppointmentCard`
- Display appointment information
- Show status and payment status badges
- Action buttons (Cancel, Reschedule)
- Formatted date and time display
- Optional notes section

#### `StatusBadge`
- Color-coded status indicators
- Support for appointment and payment statuses
- Responsive badge display

## API Integration

### Service: `appointmentService.js`

**Available Methods:**
```javascript
// Create appointment
createAppointment(appointmentData)

// Get appointment by ID
getAppointmentById(appointmentId)

// Get patient's appointments
getPatientAppointments(patientId)

// Get doctor's appointments
getDoctorAppointments(doctorUsername)

// Get all appointments
getAllAppointments()

// Update appointment status
updateAppointmentStatus(appointmentId, status)

// Cancel appointment
cancelAppointment(appointmentId)
```

## Data Models

### Appointment Response
```javascript
{
  appointmentId: UUID,
  patientId: string,
  doctorUsername: string,
  slotId: UUID,
  appointmentDateTime: LocalDateTime,
  appointmentMode: "VIRTUAL" | "PHYSICAL",
  hospital: string,
  status: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED",
  price: BigDecimal,
  paymentStatus: "PENDING" | "PAID" | "REFUNDED",
  notes: string,
  createdAt: LocalDateTime,
  updatedAt: LocalDateTime
}
```

## Styling

### CSS Files
- `StatusBadge.css` - Badge styling for statuses
- `AppointmentCard.css` - Card component styling
- `AppointmentForm.css` - Form component styling
- `AppointmentHistory.css` - History page styling
- `AppointmentBooking.css` - Booking page styling

### Theme Colors
- Primary: `#667eea` (Blue)
- Success: `#28a745` (Green)
- Danger: `#dc3545` (Red)
- Warning: `#ffc107` (Yellow)

## Routes

| Route | Component | Purpose |
|-------|-----------|---------|
| `/appointments/book` | AppointmentBookingPage | Book new appointment |
| `/appointments/history` | AppointmentHistoryPage | View appointment history |

## Authentication

The service uses JWT authentication. The auth token is:
- Retrieved from `localStorage` under key `authToken`
- Automatically added to all API requests
- Refreshed on 401 response

## Error Handling

- Form validation errors with field-specific messages
- API error handling with user-friendly messages
- Loading states during API calls
- Toast/modal notifications for errors

## Usage

### Book an Appointment
1. Navigate to `/appointments/book`
2. Fill in the form with:
   - Your Patient ID
   - Doctor's username
   - Time slot ID
   - Preferred date and time
   - Appointment mode
   - Hospital location (if physical)
3. Submit the form
4. Receive confirmation with appointment details

### View Appointments
1. Navigate to `/appointments/history`
2. Enter your Patient ID
3. Click Search
4. Filter by status if needed
5. View, cancel, or manage appointments

## Future Enhancements

- [ ] Reschedule appointment functionality
- [ ] Email confirmation notifications
- [ ] Calendar view for availability
- [ ] Doctor search and browsing
- [ ] Time slot selection interface
- [ ] Payment integration
- [ ] Appointment reminders
- [ ] Video call integration for virtual appointments
- [ ] Prescription management
- [ ] Follow-up appointment suggestions

## Dependencies

- React 18+
- React Router
- Axios
- Tailwind CSS (via main app)

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Notes

- The service requires backend API endpoints to be running
- All times are converted to local timezone for display
- Dates must be in the future for booking
- Appointment cancellation is only allowed for PENDING and CONFIRMED appointments
