import React, { useState, useEffect, useMemo } from 'react';
import doctorService from '../services/doctorService';
import slotService from '../services/slotService';
import DoctorCard from './DoctorCard';
import { MagnifyingGlassIcon, AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline';

const DoctorSlotSelector = ({
  onDoctorSelected,
  onSlotSelected,
  selectedDoctorUsername,
  selectedSlotId,
  appointmentMode = 'VIRTUAL',
}) => {
  const [doctors, setDoctors] = useState([]);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSpecialization, setFilterSpecialization] = useState('All Specializations');
  const [filterRating, setFilterRating] = useState('Any Rating');
  const [filterGender, setFilterGender] = useState('Any Gender');
  const [filterAvailability, setFilterAvailability] = useState('Any Time');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [doctorsData, slotsData] = await Promise.all([
          doctorService.getAllDoctors(),
          slotService.getAllSlots()
        ]);
        setDoctors(doctorsData || []);
        setSlots(slotsData || []);
      } catch (err) {
        setError(err.message || 'Failed to load doctors and slots');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const specializations = useMemo(() => {
    return ['All Specializations', ...new Set(doctors.map((d) => d.specialization).filter(Boolean))];
  }, [doctors]);

  const filteredDoctors = useMemo(() => {
    return doctors.filter((doctor) => {
      const searchStr = `${doctor.firstName} ${doctor.lastName} ${doctor.specialization}`.toLowerCase();
      const matchesSearch = !searchTerm || searchStr.includes(searchTerm.toLowerCase());
      const matchesSpec = filterSpecialization === 'All Specializations' || doctor.specialization === filterSpecialization;

      // Mock filters logic for rich UI representation
      const mockRating = doctor.rating || 4.5;
      const matchesRating = filterRating === 'Any Rating'
        || (filterRating === '4.5+' && mockRating >= 4.5)
        || (filterRating === '4.0+' && mockRating >= 4.0);

      const matchesGender = filterGender === 'Any Gender'; // Mock gender filter as there is no gender field natively yet

      return matchesSearch && matchesSpec && matchesRating && matchesGender;
    });
  }, [doctors, searchTerm, filterSpecialization, filterRating, filterGender]);

  const getDoctorSlots = (doctorUsername) => {
    return slots.filter(s => s.doctorUsername === doctorUsername);
  };

  const handleSlotSelect = (slot) => {
    if (onSlotSelected) {
      const doctor = doctors.find((d) => d.doctorUsername === slot.doctorUsername);
      onSlotSelected({
        ...slot,
        consultationFee: doctor?.consultationFee ?? null,
        doctorName: [doctor?.firstName, doctor?.lastName].filter(Boolean).join(' '),
      });
      if (onDoctorSelected && doctor) {
        onDoctorSelected(doctor);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-slate-200 shadow-sm">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-slate-500 font-medium text-lg">Finding available doctors...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 bg-red-50 text-red-700 rounded-2xl border border-red-200 flex flex-col items-center shadow-sm">
        <span className="text-4xl mb-4">⚠️</span>
        <p className="font-bold text-lg mb-6">{error}</p>
        <button onClick={() => window.location.reload()} className="px-6 py-2.5 bg-white text-red-700 border border-red-200 rounded-xl shadow-sm hover:bg-red-50 font-bold transition-colors">
          Retry Loading
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Filter & Search Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        {/* Search */}
        <div className="relative">
          {/* <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-6 w-6 text-slate-400" />
          </div> */}
          <input
            type="text"
            className="block w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-transparent rounded-xl text-base focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-slate-900 placeholder-slate-400 font-medium"
            placeholder="Search doctors by name or specialization"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <div className="flex items-center gap-2 text-sm text-slate-500 mr-2">
            <AdjustmentsHorizontalIcon className="w-5 h-5" />
            <span className="font-bold uppercase tracking-wider text-xs">Filters</span>
          </div>

          <select
            value={filterSpecialization}
            onChange={(e) => setFilterSpecialization(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-700 text-sm font-medium rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none cursor-pointer"
          >
            {specializations.map(s => <option key={s} value={s}>{s}</option>)}
          </select>

          <select
            value={filterRating}
            onChange={(e) => setFilterRating(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-700 text-sm font-medium rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none cursor-pointer"
          >
            <option value="Any Rating">Any Rating</option>
            <option value="4.5+">4.5+ Stars</option>
            <option value="4.0+">4.0+ Stars</option>
          </select>

          <select
            value={filterGender}
            onChange={(e) => setFilterGender(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-700 text-sm font-medium rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none cursor-pointer"
          >
            <option value="Any Gender">Any Gender</option>
            <option value="Female">Female</option>
            <option value="Male">Male</option>
          </select>

          <select
            value={filterAvailability}
            onChange={(e) => setFilterAvailability(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-700 text-sm font-medium rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none cursor-pointer"
          >
            <option value="Any Time">Any Time</option>
            <option value="Next 3 Days">Next 3 Days</option>
            <option value="This Week">This Week</option>
          </select>
        </div>
      </div>

      {/* Grid of Doctor Cards */}
      <div>
        <div className="mb-4 text-sm font-bold text-slate-500 uppercase tracking-wide">
          Showing {filteredDoctors.length} {filteredDoctors.length === 1 ? 'Doctor' : 'Doctors'}
        </div>

        {filteredDoctors.length > 0 ? (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
            {filteredDoctors.map((doctor) => (
              <DoctorCard
                key={doctor.doctorUsername}
                doctor={doctor}
                slots={getDoctorSlots(doctor.doctorUsername)}
                selectedSlotId={selectedSlotId}
                onSlotSelect={handleSlotSelect}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white border border-slate-200 rounded-2xl shadow-sm">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MagnifyingGlassIcon className="w-8 h-8 text-slate-400" />
            </div>
            <p className="text-xl font-bold text-slate-900 mb-2">No doctors found</p>
            <p className="text-slate-500 mb-8 max-w-md mx-auto">We couldn't find any doctors matching your current filters. Try adjusting your criteria.</p>
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterSpecialization('All Specializations');
                setFilterRating('Any Rating');
                setFilterGender('Any Gender');
                setFilterAvailability('Any Time');
              }}
              className="px-6 py-3 bg-blue-50 text-blue-700 font-bold rounded-xl shadow-sm hover:bg-blue-100 transition-colors"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorSlotSelector;
