import React, { useState } from 'react';
import './DoctorCard.css';

/**
 * DoctorCard Component
 * Displays individual doctor profile with selectable time slots
 */
const DoctorCard = ({
  doctor,
  slots,
  selectedSlotId,
  onSlotSelect,
  isExpanded = false,
  onToggleExpand,
}) => {
  if (!doctor) return null;

  const {
    doctorUsername,
    firstName = '',
    lastName = '',
    specialization = 'General',
    yearsOfExperience = 0,
    bio = '',
    email = '',
    phone = '',
  } = doctor;

  const fullName = `${firstName} ${lastName}`.trim() || doctorUsername;

  // Group slots by day of week
  const slotsByDay = slots.reduce((acc, slot) => {
    const day = slot.dayOfWeek;
    if (!acc[day]) {
      acc[day] = [];
    }
    acc[day].push(slot);
    return acc;
  }, {});

  // Sort slots by time
  const sortedDays = Object.keys(slotsByDay).sort();

  const formatTime = (time) => {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getInitials = () => {
    return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase() || 'DR';
  };

  return (
    <div className="doctor-card">
      {/* Doctor Header */}
      <div className="doctor-header" onClick={() => onToggleExpand && onToggleExpand(doctorUsername)}>
        {/* Avatar */}
        <div className="doctor-avatar">
          {getInitials()}
        </div>

        {/* Doctor Info */}
        <div className="doctor-info">
          <h3 className="doctor-name">
            Dr. {fullName}
          </h3>
          <p className="doctor-specialization">
            {specialization}
          </p>
          <p className="doctor-experience">
            {yearsOfExperience} {yearsOfExperience === 1 ? 'year' : 'years'} of experience
          </p>
        </div>

        {/* Toggle Icon */}
        <div className={`toggle-icon ${isExpanded ? 'expanded' : ''}`}>
          ▼
        </div>
      </div>

      {/* Doctor Bio */}
      <div className="doctor-bio">
        {bio && <p>{bio}</p>}
        <div className="doctor-contact">
          {email && <span className="contact-item">📧 {email}</span>}
          {phone && <span className="contact-item">📞 {phone}</span>}
        </div>
      </div>

      {/* Slots Section - Expandable */}
      {isExpanded && (
        <div className="doctor-slots">
          <h4>Available Slots</h4>

          {sortedDays.length > 0 ? (
            <div className="slots-by-day">
              {sortedDays.map((day) => (
                <div key={day} className="day-slots">
                  <p className="day-label">
                    {day.charAt(0).toUpperCase() + day.slice(1).toLowerCase()}
                  </p>
                  <div className="slot-buttons">
                    {slotsByDay[day]
                      .sort((a, b) => a.startTime.localeCompare(b.startTime))
                      .map((slot) => (
                        <button
                          key={slot.slotId}
                          className={`slot-button ${
                            selectedSlotId === slot.slotId ? 'selected' : ''
                          }`}
                          onClick={() =>
                            onSlotSelect({
                              ...slot,
                              doctorUsername,
                              doctorName: fullName,
                            })
                          }
                          title={`${formatTime(slot.startTime)} - ${formatTime(slot.endTime)}`}
                        >
                          {formatTime(slot.startTime)}
                        </button>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-slots">
              <p>No available slots at the moment</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DoctorCard;
