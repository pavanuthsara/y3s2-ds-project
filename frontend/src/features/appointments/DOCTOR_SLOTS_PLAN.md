# Implementation Plan: Doctor Availability & Time Slots UI

## Overview
Display available time slots for each doctor in the appointment booking page, organized by doctor with their profile information.

---

## Backend APIs Available ✅

### 1. Get All Doctors
```
GET http://localhost:8080/api/doctors
Response:
[
  {
    "doctorUsername": "dr_ahmed",
    "firstName": "Ahmed",
    "lastName": "Khan",
    "specialization": "Cardiology",
    "phone": "+94771234567",
    "email": "ahmed@hospital.com",
    "yearsOfExperience": 10,
    "bio": "Senior Cardiologist..."
  },
  ...
]
```

### 2. Get Doctor Profile
```
GET http://localhost:8080/api/doctors/{doctorUsername}/profile
```

### 3. Get All Available Slots
```
GET http://localhost:8080/api/doctors/availability/all
Headers: Authorization: Bearer {token}
Response:
[
  {
    "slotId": "uuid",
    "doctorUsername": "dr_ahmed",
    "dayOfWeek": "MONDAY",
    "startTime": "09:00",
    "endTime": "10:00",
    "isActive": true
  },
  ...
]
```

---

## Frontend Components to Create

### 1. **DoctorSlotSelector** (Main Component)
- Displays doctor list with their profiles
- Shows available slots for each doctor
- Allows selection of doctor + slot
- Organized in accordion/card format

### 2. **DoctorCard** Component
- Doctor name, specialization, experience
- Profile photo/avatar
- Bio/description
- Expandable time slots section

### 3. **SlotGrid** Component
- Display slots organized by day of week
- Color code: Available (green), Selected (blue), Past (gray)
- 24-hour format with time labels
- Show slot start/end times

### 4. **Service Layer Updates**
- `doctorService.js` for doctor API calls
- `slotService.js` for availability API calls

---

## Data Flow

```
1. PatientPortal (Book Appointment Tab)
   ↓
2. DoctorSlotSelector Component Loads
   ↓
3. Fetch All Doctors → Display as Cards
   ↓
4. Fetch All Available Slots → Group by Doctor
   ↓
5. Display Slots Grid for Each Doctor
   ↓
6. Patient Selects Doctor + Slot
   ↓
7. Update AppointmentBookingForm with Selection
   ↓
8. Auto-fill doctorUsername & slotId fields
```

---

## Implementation Phases

### Phase 1: API Service Layer ⏱️ 15 mins
- Create `doctorService.js` 
- Create `slotService.js`
- Add methods:
  - `getAllDoctors()`
  - `getDoctorProfile(username)`
  - `getAvailableSlots()`
  - `getSlotsByDoctor(doctorUsername)` - helper

### Phase 2: Components ⏱️ 45 mins
- Create `DoctorCard.jsx` - Display doctor info
- Create `SlotGrid.jsx` - Display time slots
- Create `DoctorSlotSelector.jsx` - Main component
- Create `DoctorSelector.css` - Styling

### Phase 3: Integration ⏱️ 20 mins
- Update `AppointmentBookingForm.jsx` to use selector
- Connect slot selection to form fields
- Handle loading & error states

### Phase 4: Styling & Polish ⏱️ 15 mins
- Responsive design (mobile, tablet, desktop)
- Loading spinners
- Empty states
- Animations

---

## UI Structure (Mockup)

```
┌─────────────────────────────────────────────────┐
│  📅 Book Appointment                            │
├─────────────────────────────────────────────────┤
│  Available Doctors & Time Slots                 │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌─────────────────────────────────────────┐  │
│  │ 👨‍⚕️ Dr. Ahmed Khan                        │  │
│  │ Cardiology | 10 years experience         │  │
│  │ Senior specialist in heart diseases...  │  │
│  │                                         │  │
│  │ Available Slots:                        │  │
│  │ ┌─────────────────────────────────────┐ │  │
│  │ │ Monday                              │ │  │
│  │ │ [09:00] [10:00] [11:00] [14:00]     │ │  │
│  │ └─────────────────────────────────────┘ │  │
│  │ ┌─────────────────────────────────────┐ │  │
│  │ │ Tuesday                             │ │  │
│  │ │ [09:00] [11:00] [15:00]             │ │  │
│  │ └─────────────────────────────────────┘ │  │
│  └─────────────────────────────────────────┘  │
│                                                 │
│  ┌─────────────────────────────────────────┐  │
│  │ 👩‍⚕️ Dr. Fatima Ali                       │  │
│  │ Dermatology | 7 years experience        │  │
│  │ Expert in skin treatments...            │  │
│  │                                         │  │
│  │ Available Slots:                        │  │
│  │ ┌─────────────────────────────────────┐ │  │
│  │ │ Wednesday                           │ │  │
│  │ │ [10:00] [13:00] [15:30]             │ │  │
│  │ └─────────────────────────────────────┘ │  │
│  └─────────────────────────────────────────┘  │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

## Technical Specifications

### DoctorSlotSelector Props
```javascript
{
  onDoctorSelected: (doctor) => void,
  onSlotSelected: (slot, doctor) => void,
  selectedDoctor: string | null,
  selectedSlot: UUID | null,
  isLoading: boolean,
  error: string | null
}
```

### Slot Selection State
```javascript
{
  selectedDoctorUsername: string,
  selectedSlotId: UUID,
  selectedDateTime: LocalDateTime,
  appointmentMode: 'VIRTUAL' | 'PHYSICAL'
}
```

---

## Key Features

✅ **Doctor Browsing**
- View all doctors with profiles
- Search/filter by specialization
- View experience and bio

✅ **Slot Visualization**
- Organized by doctor
- Grouped by day of week
- Color-coded availability

✅ **Smart Selection**
- Click to select doctor + slot
- Auto-populate booking form
- Show selected state

✅ **Error Handling**
- Handle API failures gracefully
- Show empty states
- Loading spinners

✅ **Responsive Design**
- Mobile: Single column, collapsible slots
- Tablet: 2 columns
- Desktop: Full view

---

## Integration Points

### 1. AppointmentBookingForm Changes
- Add `<DoctorSlotSelector />` above form
- Pass `selectedDoctor` and `selectedSlot` as props
- Auto-fill `doctorUsername` and `slotId` fields
- Disable fields if pre-selected

### 2. PatientPortal Update
- Pass `onSlotSelected` callback
- Store selected slot in state
- Pass to booking form

### 3. Navigation
- Still use existing routes
- Tab-based navigation within Patient Portal
- No URL changes needed

---

## Success Criteria ✅

- [ ] All doctors displayed with profile info
- [ ] All available slots shown for each doctor
- [ ] Slots organized by day of week
- [ ] Doctor + slot selection works
- [ ] Selected values populate booking form
- [ ] Loading states shown during API calls
- [ ] Error handling for API failures
- [ ] Responsive design works on mobile
- [ ] No authentication issues
- [ ] Smooth UX without layout shifts

---

## Timeline Estimate
**Total: ~90 minutes**
- Phase 1: 15 mins
- Phase 2: 45 mins
- Phase 3: 20 mins
- Phase 4: 10 mins

---

## Questions Before Implementation

1. Should slots be searchable/filterable? (by day, time range)
2. Show past slots? (gray out, disable)
3. Show booked slots? (indicate booking conflicts)
4. Slot duration display? (e.g., "90 mins" or just start time)
5. Search/filter doctors? (by specialization, experience)
6. Max doctors to show initially? (lazy load or show all)
