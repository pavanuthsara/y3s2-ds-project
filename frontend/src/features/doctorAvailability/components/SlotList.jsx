function toFriendlyDay(day) {
  return day.charAt(0) + day.slice(1).toLowerCase();
}

function SlotList({ slots, onDelete, isDeleting }) {
  return (
    <section className="panel">
      <div className="panel-title-row">
        <h3>Current Slots</h3>
        <p>{slots.length} total slot(s)</p>
      </div>

      {slots.length === 0 ? (
        <p className="empty-state">No slots yet. Add one to start building your weekly schedule.</p>
      ) : (
        <ul className="slot-list">
          {slots.map((slot) => (
            <li key={slot.id} className="slot-card">
              <div>
                <strong>{toFriendlyDay(slot.dayOfWeek)}</strong>
                <p>
                  {slot.startTime} - {slot.endTime}
                </p>
                <span className={slot.active ? "tag-active" : "tag-inactive"}>
                  {slot.active ? "Active" : "Inactive"}
                </span>
              </div>

              <button
                className="btn-danger"
                type="button"
                onClick={() => onDelete(slot.id)}
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default SlotList;
