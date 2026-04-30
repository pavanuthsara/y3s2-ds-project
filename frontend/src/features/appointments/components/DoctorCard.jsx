import React, { useState, useEffect } from 'react';
import { StarIcon, MapPinIcon, CheckBadgeIcon } from '@heroicons/react/24/solid';

const DoctorCard = ({
  doctor,
  slots,
  selectedSlotId,
  onSlotSelect,
}) => {
  if (!doctor) return null;

  const {
    doctorUsername,
    firstName = '',
    lastName = '',
    specialization = 'General Practitioner',
    yearsOfExperience = 0,
    profilePhoto,
  } = doctor;

  const fullName = `${firstName} ${lastName}`.trim() || doctorUsername;
  
  // Mock data for rich UI missing from standard schema
  const rating = doctor.rating || (4.0 + Math.random() * 0.9).toFixed(1);
  const reviewCount = doctor.reviewCount || Math.floor(Math.random() * 200) + 50;
  const location = doctor.location || 'City Medical Center';

  // Group slots by day of week
  const slotsByDay = slots.reduce((acc, slot) => {
    const day = slot.dayOfWeek;
    if (!acc[day]) acc[day] = [];
    acc[day].push(slot);
    return acc;
  }, {});

  const sortedDays = Object.keys(slotsByDay).sort();
  const [activeDay, setActiveDay] = useState(sortedDays[0] || null);

  useEffect(() => {
    if (sortedDays.length > 0 && !activeDay) {
      setActiveDay(sortedDays[0]);
    }
  }, [sortedDays, activeDay]);

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
    <div className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden flex flex-col ${
      slots.some(s => s.slotId === selectedSlotId) 
        ? 'border-blue-500 shadow-lg ring-1 ring-blue-500' 
        : 'border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300'
    }`}>
      {/* Top Header Section */}
      <div className="p-5 flex gap-4 bg-white">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          {profilePhoto ? (
             <img src={profilePhoto} alt={fullName} className="w-16 h-16 rounded-full object-cover border border-slate-200 shadow-sm" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 text-blue-700 flex items-center justify-center font-bold text-xl shadow-sm border border-blue-200">
              {getInitials()}
            </div>
          )}
          <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5">
            <CheckBadgeIcon className="w-5 h-5 text-blue-500" />
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-bold text-slate-900 truncate" title={`Dr. ${fullName}`}>Dr. {fullName}</h3>
              <p className="text-sm font-medium text-blue-600 truncate">{specialization}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 mt-2 text-sm">
            <div className="flex items-center gap-1 bg-amber-50 text-amber-700 px-2 py-0.5 rounded-md font-medium border border-amber-100">
              <StarIcon className="w-4 h-4 text-amber-500" />
              {rating} <span className="text-amber-600/70 ml-0.5 text-xs">({reviewCount})</span>
            </div>
            <div className="flex items-center gap-1 text-slate-500 text-xs font-medium">
              <span>•</span>
              <span>{yearsOfExperience} yrs exp</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 mt-2.5 text-xs text-slate-500 font-medium">
            <MapPinIcon className="w-3.5 h-3.5 text-slate-400" />
            <span className="truncate">{location}</span>
          </div>
        </div>
      </div>

      {/* Scheduling Section inline inside card */}
      <div className="border-t border-slate-100 bg-slate-50 flex-1 p-4 flex flex-col">
        {sortedDays.length > 0 ? (
          <div className="flex flex-col h-full">
            {/* Day Tabs */}
            <div className="flex overflow-x-auto hide-scrollbar gap-2 mb-4 pb-1">
              {sortedDays.map(day => (
                <button
                  key={day}
                  onClick={(e) => { e.preventDefault(); setActiveDay(day); }}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
                    activeDay === day
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  {day.charAt(0).toUpperCase() + day.slice(1, 3).toLowerCase()}
                </button>
              ))}
            </div>

            {/* Time Slots Grid */}
            <div className="grid grid-cols-3 gap-2 max-h-32 overflow-y-auto pr-1">
              {slotsByDay[activeDay]
                ?.sort((a, b) => a.startTime.localeCompare(b.startTime))
                .map((slot) => {
                  const isSelected = selectedSlotId === slot.slotId;
                  return (
                    <button
                      key={slot.slotId}
                      onClick={(e) => {
                        e.preventDefault();
                        onSlotSelect({
                          ...slot,
                          doctorUsername,
                          doctorName: fullName,
                        });
                      }}
                      className={`py-2 px-1 text-xs font-bold rounded-lg text-center transition-all border ${
                        isSelected
                          ? 'bg-blue-600 border-blue-600 text-white shadow-md ring-2 ring-blue-600 ring-offset-1'
                          : 'bg-white border-slate-200 text-slate-700 shadow-sm hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50'
                      }`}
                    >
                      {formatTime(slot.startTime)}
                    </button>
                  );
              })}
            </div>
          </div>
        ) : (
          <div className="py-6 flex flex-col items-center justify-center text-center h-full">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mb-2">
              <span className="text-slate-400 text-lg">📅</span>
            </div>
            <p className="text-sm text-slate-500 font-semibold">No available slots</p>
            <p className="text-xs text-slate-400 mt-1">Check back later for updates</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorCard;
