import React, { useState, useEffect } from "react";
import doctorService from "../services/doctorService";
import slotService from "../services/slotService";
import DoctorCard from "./DoctorCard";
import "./DoctorSelector.css";

/**
 * DoctorSlotSelector Component
 * Main component for selecting doctors and their available time slots
 */
const DoctorSlotSelector = ({
  onDoctorSelected,
  onSlotSelected,
  selectedDoctorUsername,
  selectedSlotId,
}) => {
  const [doctors, setDoctors] = useState([]);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedDoctor, setExpandedDoctor] = useState(
    selectedDoctorUsername || null,
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSpecialization, setFilterSpecialization] = useState("");
  const [specializations, setSpecializations] = useState([]);

  // Fetch doctors and slots on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch doctors
        const doctorsData = await doctorService.getAllDoctors();
        setDoctors(doctorsData || []);

        // Extract unique specializations
        const specs = [
          ...new Set(doctorsData?.map((d) => d.specialization).filter(Boolean)),
        ];
        setSpecializations(specs);

        // Fetch available slots
        const slotsData = await slotService.getAllSlots();
        setSlots(slotsData || []);

        // Auto-expand first doctor if available
        if (doctorsData && doctorsData.length > 0 && !selectedDoctorUsername) {
          setExpandedDoctor(doctorsData[0].doctorUsername);
        }
      } catch (err) {
        console.error("Error loading doctors and slots:", err);
        setError(err.message || "Failed to load doctors and slots");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedDoctorUsername]);

  // Filter doctors based on search and specialization
  const filteredDoctors = doctors.filter((doctor) => {
    const specialization = doctor.specialization || "";
    const firstName = doctor.firstName || "";
    const lastName = doctor.lastName || "";
    const matchesSearch =
      !searchTerm ||
      firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      specialization.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSpecialization =
      !filterSpecialization || specialization === filterSpecialization;

    return matchesSearch && matchesSpecialization;
  });

  // Get active slots for a doctor, filtered by appointment mode
  const getDoctorSlots = (doctorUsername) => {
    return slots.filter(
      (slot) =>
        slot.doctorUsername === doctorUsername && slot.isActive === true,
    );
  };

  const handleSlotSelect = (slot) => {
    if (onSlotSelected) {
      const doctor = doctors.find((d) => d.doctorUsername === slot.doctorUsername);
      onSlotSelected({
        ...slot,
        consultationFee: doctor?.consultationFee ?? null,
        doctorName: slot.doctorName || [doctor?.firstName, doctor?.lastName].filter(Boolean).join(' '),
      });
    }
  };

  const handleDoctorToggle = (doctorUsername) => {
    setExpandedDoctor(
      expandedDoctor === doctorUsername ? null : doctorUsername,
    );
    if (onDoctorSelected && expandedDoctor !== doctorUsername) {
      const doctor = doctors.find((d) => d.doctorUsername === doctorUsername);
      if (doctor) {
        onDoctorSelected(doctor);
      }
    }
  };

  if (loading) {
    return (
      <div className="doctor-selector-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading doctors and available slots...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="doctor-selector-container">
      {/* Header */}
      <div className="selector-header">
        <h2>👨‍⚕️ Select Your Doctor</h2>
        <p>Choose a doctor and select an available time slot</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="error-message">
          <span>⚠️ {error}</span>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      )}

      {/* Filters */}
      <div className="selector-filters">
        <input
          type="text"
          placeholder="Search by name or specialization..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />

        {specializations.length > 0 && (
          <select
            value={filterSpecialization}
            onChange={(e) => setFilterSpecialization(e.target.value)}
            className="specialization-filter"
          >
            <option value="">All Specializations</option>
            {specializations.map((spec) => (
              <option key={spec} value={spec}>
                {spec}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Doctors List */}
      <div className="doctors-list doctors-grid">
        {filteredDoctors.length > 0 ? (
          filteredDoctors.map((doctor) => (
            <DoctorCard
              key={doctor.doctorUsername}
              doctor={doctor}
              slots={getDoctorSlots(doctor.doctorUsername)}
              selectedSlotId={selectedSlotId}
              onSlotSelect={handleSlotSelect}
              isExpanded={expandedDoctor === doctor.doctorUsername}
              onToggleExpand={handleDoctorToggle}
            />
          ))
        ) : (
          <div className="no-doctors">
            <p>No doctors found matching your criteria.</p>
            <button
              onClick={() => {
                setSearchTerm("");
                setFilterSpecialization("");
              }}
              className="reset-button"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="selector-stats">
        <p>
          Showing {filteredDoctors.length} of {doctors.length} doctors
        </p>
      </div>
    </div>
  );
};

export default DoctorSlotSelector;
