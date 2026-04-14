import { useMemo, useState } from "react";
import {
  addDoctorAvailabilitySlot,
  deleteDoctorAvailabilitySlot,
  getDoctorAvailability,
  replaceDoctorAvailability,
} from "../api/doctorAvailabilityApi";
import SlotForm from "../components/SlotForm";
import SlotList from "../components/SlotList";
import ReplaceAvailabilityForm from "../components/ReplaceAvailabilityForm";

const DEFAULT_CONTEXT = {
  userId: "doctor_001",
  userRole: "ROLE_DOCTOR",
};

function DoctorAvailabilityPage() {
  const [userContext, setUserContext] = useState(DEFAULT_CONTEXT);
  const [slots, setSlots] = useState([]);
  const [status, setStatus] = useState({ loading: false, error: "", success: "" });
  const [actionState, setActionState] = useState({ saving: false, deleting: false, replacing: false });

  const contextIsValid = useMemo(() => {
    return Boolean(userContext.userId.trim()) && Boolean(userContext.userRole.trim());
  }, [userContext]);

  const setError = (message) => {
    setStatus({ loading: false, error: message, success: "" });
  };

  const setSuccess = (message) => {
    setStatus({ loading: false, error: "", success: message });
  };

  const handleContextChange = (field) => (event) => {
    setUserContext((previous) => ({ ...previous, [field]: event.target.value }));
  };

  const loadAvailability = async () => {
    if (!contextIsValid) {
      setError("Provide both User ID and User Role before loading data.");
      return;
    }

    setStatus({ loading: true, error: "", success: "" });
    try {
      const data = await getDoctorAvailability(userContext);
      setSlots(data || []);
      setSuccess("Availability loaded successfully.");
    } catch (error) {
      setError(error.message);
    }
  };

  const handleAddSlot = async (slot) => {
    setActionState((previous) => ({ ...previous, saving: true }));
    try {
      const newSlot = await addDoctorAvailabilitySlot(userContext, slot);
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
      await deleteDoctorAvailabilitySlot(userContext, slotId);
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
      const updatedSlots = await replaceDoctorAvailability(userContext, draftSlots);
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
          Manage weekly consultation windows using the backend service endpoints.
          This module is isolated so your team can add additional features without conflicts.
        </p>
      </header>

      <section className="panel context-panel">
        <div className="panel-title-row">
          <h3>Auth Context (Headers)</h3>
          <p>Maps to X-User-Id and X-User-Role</p>
        </div>

        <div className="grid-two">
          <label>
            User ID
            <input value={userContext.userId} onChange={handleContextChange("userId")} placeholder="doctor_001" />
          </label>

          <label>
            User Role
            <input
              value={userContext.userRole}
              onChange={handleContextChange("userRole")}
              placeholder="ROLE_DOCTOR"
            />
          </label>
        </div>

        <button className="btn-primary" type="button" onClick={loadAvailability} disabled={status.loading}>
          {status.loading ? "Loading..." : "Load Availability"}
        </button>
      </section>

      {status.error ? <p className="notice error">{status.error}</p> : null}
      {status.success ? <p className="notice success">{status.success}</p> : null}

      <div className="doctor-grid">
        <SlotForm onSubmit={handleAddSlot} isSaving={actionState.saving} />
        <ReplaceAvailabilityForm onReplace={handleReplaceAvailability} isSaving={actionState.replacing} />
      </div>

      <SlotList slots={slots} onDelete={handleDeleteSlot} isDeleting={actionState.deleting} />
    </section>
  );
}

export default DoctorAvailabilityPage;
