import { useState } from "react";

const DAYS = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
];

const newDraftSlot = () => ({
  dayOfWeek: "MONDAY",
  startTime: "09:00",
  endTime: "10:00",
  active: true,
});

function ReplaceAvailabilityForm({ onReplace, isSaving }) {
  const [draftSlots, setDraftSlots] = useState([newDraftSlot()]);

  const updateSlot = (index, field, value) => {
    setDraftSlots((previous) =>
      previous.map((slot, currentIndex) =>
        currentIndex === index ? { ...slot, [field]: value } : slot,
      ),
    );
  };

  const addDraft = () => {
    setDraftSlots((previous) => [...previous, newDraftSlot()]);
  };

  const removeDraft = (index) => {
    setDraftSlots((previous) => previous.filter((_, currentIndex) => currentIndex !== index));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (draftSlots.length === 0) {
      return;
    }
    onReplace(draftSlots);
  };

  return (
    <form className="panel" onSubmit={handleSubmit}>
      <div className="panel-title-row">
        <h3>Replace Full Availability</h3>
        <p>Submit all weekly slots in one request</p>
      </div>

      <div className="draft-list">
        {draftSlots.map((slot, index) => (
          <div key={`${slot.dayOfWeek}-${index}`} className="draft-row">
            <select
              value={slot.dayOfWeek}
              onChange={(event) => updateSlot(index, "dayOfWeek", event.target.value)}
            >
              {DAYS.map((day) => (
                <option key={day} value={day}>
                  {day}
                </option>
              ))}
            </select>

            <input
              type="time"
              value={slot.startTime}
              onChange={(event) => updateSlot(index, "startTime", event.target.value)}
              required
            />

            <input
              type="time"
              value={slot.endTime}
              onChange={(event) => updateSlot(index, "endTime", event.target.value)}
              required
            />

            <label className="checkbox-row compact">
              <input
                type="checkbox"
                checked={slot.active}
                onChange={(event) => updateSlot(index, "active", event.target.checked)}
              />
              Active
            </label>

            <button className="btn-ghost" type="button" onClick={() => removeDraft(index)}>
              Remove
            </button>
          </div>
        ))}
      </div>

      <div className="action-row">
        <button className="btn-ghost" type="button" onClick={addDraft}>
          Add Draft Row
        </button>
        <button className="btn-primary" type="submit" disabled={isSaving || draftSlots.length === 0}>
          {isSaving ? "Replacing..." : "Replace Availability"}
        </button>
      </div>
    </form>
  );
}

export default ReplaceAvailabilityForm;
