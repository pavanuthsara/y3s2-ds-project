import { useEffect, useState } from "react";
import {
  addDoctorAvailabilitySlot,
  deleteDoctorAvailabilitySlot,
  getDoctorAvailability,
  replaceDoctorAvailability,
} from "../api/doctorAvailabilityApi";
import SlotForm from "../components/SlotForm";
import SlotList from "../components/SlotList";
import ReplaceAvailabilityForm from "../components/ReplaceAvailabilityForm";

function DoctorAvailabilityPage() {
  const [slots, setSlots] = useState([]);
  const [status, setStatus] = useState({ loading: false, error: "", success: "" });
  const [actionState, setActionState] = useState({ saving: false, deleting: false, replacing: false });

  const setError = (message) => {
    setStatus({ loading: false, error: message, success: "" });
  };

  const setSuccess = (message) => {
    setStatus({ loading: false, error: "", success: message });
  };

  const loadAvailability = async () => {
    setStatus({ loading: true, error: "", success: "" });
    try {
      const data = await getDoctorAvailability();
      setSlots(data || []);
      setSuccess("Availability loaded successfully.");
    } catch (error) {
      setError(error.message);
    }
  };

  useEffect(() => {
    loadAvailability();
  }, []);

  const handleAddSlot = async (slot) => {
    setActionState((previous) => ({ ...previous, saving: true }));
    try {
      const newSlot = await addDoctorAvailabilitySlot(slot);
      setSlots((previous) => [...previous, newSlot]);
      setSuccess("Slot added successfully.");
    } catch (error) {
      setError(error.message);
    } finally {
      setActionState((previous) => ({ ...previous, saving: false }));
    }
  };

  const handleDeleteSlot = async (slotId) => {
    setActionState((previous) => ({ ...previous, deleting: true }));
    try {
      await deleteDoctorAvailabilitySlot(slotId);
      setSlots((previous) => previous.filter((slot) => slot.id !== slotId));
      setSuccess("Slot deleted successfully.");
    } catch (error) {
      setError(error.message);
    } finally {
      setActionState((previous) => ({ ...previous, deleting: false }));
    }
  };

  const handleReplaceAvailability = async (draftSlots) => {
    setActionState((previous) => ({ ...previous, replacing: true }));
    try {
      const updatedSlots = await replaceDoctorAvailability(draftSlots);
      setSlots(updatedSlots || []);
      setSuccess("Availability replaced successfully.");
    } catch (error) {
      setError(error.message);
    } finally {
      setActionState((previous) => ({ ...previous, replacing: false }));
    }
  };

  return (
    <section className="doctor-page">
      <header className="doctor-hero">
        <h1>Doctor Availability Manager</h1>
        <p>
          Manage weekly consultation windows using your logged-in doctor account.
          Availability actions now use the authenticated gateway flow instead of manual header entry.
        </p>
      </header>

      {status.error ? <p className="notice error">{status.error}</p> : null}
      {status.success ? <p className="notice success">{status.success}</p> : null}

      <section className="panel">
        <div className="panel-title-row">
          <h3>Current Schedule</h3>
          <p>Reload from the doctor service whenever you need the latest saved slots.</p>
        </div>
        <button className="btn-primary" type="button" onClick={loadAvailability} disabled={status.loading}>
          {status.loading ? "Loading..." : "Refresh Availability"}
        </button>
      </section>

      <div className="doctor-grid">
        <SlotForm onSubmit={handleAddSlot} isSaving={actionState.saving} />
        <ReplaceAvailabilityForm onReplace={handleReplaceAvailability} isSaving={actionState.replacing} />
      </div>

      <SlotList slots={slots} onDelete={handleDeleteSlot} isDeleting={actionState.deleting} />
    </section>
  );
}

export default DoctorAvailabilityPage;
