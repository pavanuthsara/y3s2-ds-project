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

const initialState = {
  dayOfWeek: "MONDAY",
  startTime: "09:00",
  endTime: "10:00",
  active: true,
};

function SlotForm({ onSubmit, isSaving }) {
  const [form, setForm] = useState(initialState);

  const handleChange = (field) => (event) => {
    const value = field === "active" ? event.target.checked : event.target.value;
    setForm((previous) => ({ ...previous, [field]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit(form);
    setForm(initialState);
  };

  return (
    <form className="panel" onSubmit={handleSubmit}>
      <div className="panel-title-row">
        <h3>Add Slot</h3>
        <p>Create a single availability slot</p>
      </div>

      <div className="grid-two">
        <label>
          Day
          <select value={form.dayOfWeek} onChange={handleChange("dayOfWeek")}>
            {DAYS.map((day) => (
              <option key={day} value={day}>
                {day}
              </option>
            ))}
          </select>
        </label>

        <label>
          Start Time
          <input type="time" value={form.startTime} onChange={handleChange("startTime")} required />
        </label>

        <label>
          End Time
          <input type="time" value={form.endTime} onChange={handleChange("endTime")} required />
        </label>

        <label className="checkbox-row">
          <input type="checkbox" checked={form.active} onChange={handleChange("active")} />
          Active Slot
        </label>
      </div>

      <button className="btn-primary" type="submit" disabled={isSaving}>
        {isSaving ? "Saving..." : "Add Slot"}
      </button>
    </form>
  );
}

export default SlotForm;
