import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppointmentCard from "../../appointments/components/AppointmentCard";
import appointmentService from "../../appointments/services/appointmentService";

export default function DoctorAppointmentsPanel({ session }) {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [hideCancelled, setHideCancelled] = useState(true);
  const navigate = useNavigate();

  const handleConfirmAppointment = async (appointment) => {
    setError("");

    try {
      const updatedAppointment =
        await appointmentService.updateAppointmentStatus(
          appointment.appointmentId,
          "CONFIRMED",
        );

      setAppointments((current) =>
        current.map((item) =>
          item.appointmentId === appointment.appointmentId
            ? updatedAppointment
            : item,
        ),
      );
    } catch (err) {
      setError(err.message || "Failed to confirm appointment");
    }
  };

  useEffect(() => {
    let cancelled = false;

    async function loadAppointments() {
      if (!session?.username) {
        setAppointments([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      try {
        const data = await appointmentService.getDoctorAppointments(
          session.username,
        );
        if (!cancelled) {
          setAppointments(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Failed to load doctor appointments");
          setAppointments([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadAppointments();

    return () => {
      cancelled = true;
    };
  }, [session]);

  return (
    <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm lg:p-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-600">
            Appointments
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-900">
            Doctor appointment list
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Join video calls only for virtual appointments that are confirmed or
            active.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
              hideCancelled
                ? "border-sky-300 bg-sky-50 text-sky-700 hover:bg-sky-100"
                : "border-slate-300 text-slate-700 hover:bg-slate-50"
            }`}
            onClick={() => setHideCancelled((prev) => !prev)}
            type="button"
          >
            {hideCancelled ? "Show cancelled" : "Hide cancelled"}
          </button>
          <button
            className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            onClick={() => window.location.reload()}
            type="button"
          >
            Reload appointments
          </button>
        </div>
      </div>

      {error ? (
        <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="mt-6 text-sm text-slate-600">
          Loading appointments...
        </div>
      ) : appointments.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center text-slate-500">
          No appointments found for this doctor.
        </div>
      ) : (
        <div className="mt-6 grid gap-5">
          {appointments
            .filter(
              (a) =>
                !hideCancelled ||
                String(a.status || "").toUpperCase() !== "CANCELLED",
            )
            .map((appointment) => (
              <AppointmentCard
                key={appointment.appointmentId}
                appointment={appointment}
                onConfirmAppointment={handleConfirmAppointment}
                onJoinVideoCall={(apt) =>
                  navigate(`/telemedicine/${apt.appointmentId}`)
                }
                showPaymentAction={false}
                showActions={true}
              />
            ))}
        </div>
      )}
    </div>
  );
}
