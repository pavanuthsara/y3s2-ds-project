import { useState } from "react";
import {
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
  VideoCameraIcon,
  UserCircleIcon,
  CreditCardIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import { CheckCircleIcon } from "@heroicons/react/24/solid";

// ── Helpers ──────────────────────────────────────────────────────────────────
const formatDate = (dt) => {
  if (!dt) return "—";
  return new Date(dt).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const formatTime = (dt) => {
  if (!dt) return "";
  return new Date(dt).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

// ── Status badge ─────────────────────────────────────────────────────────────
function StatusBadgeInline({ status, paymentStatus }) {
  const STATUS_STYLES = {
    CONFIRMED:  "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
    COMPLETED:  "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
    PENDING:    "bg-amber-50  text-amber-700  ring-1 ring-amber-200",
    CANCELLED:  "bg-red-50    text-red-700    ring-1 ring-red-200",
  };
  const PAYMENT_STYLES = {
    PENDING:   "bg-orange-50 text-orange-700 ring-1 ring-orange-200",
    PAID:      "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
    REFUNDED:  "bg-slate-50 text-slate-600 ring-1 ring-slate-200",
  };

  const s = status?.toUpperCase();
  const p = paymentStatus?.toUpperCase();

  return (
    <div className="flex flex-wrap gap-1.5">
      {status && (
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_STYLES[s] || "bg-slate-100 text-slate-600"}`}>
          {status.charAt(0) + status.slice(1).toLowerCase()}
        </span>
      )}
      {paymentStatus && (
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${PAYMENT_STYLES[p] || "bg-slate-100 text-slate-600"}`}>
          {p === "PENDING" ? "Payment Pending" : p === "PAID" ? "Paid" : "Refunded"}
        </span>
      )}
    </div>
  );
}

// ── Main Card ─────────────────────────────────────────────────────────────────
const AppointmentCard = ({
  appointment,
  onCancel,
  onReschedule,
  onPay,
  onJoinVideoCall,
  onConfirmAppointment,
  onAddPrescription,
  showPaymentAction = true,
  showActions = true,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const status = String(appointment.status || "").trim().toUpperCase();
  const mode   = String(appointment.appointmentMode || "").trim().toUpperCase();

  const isVirtual  = mode === "VIRTUAL";
  const canCancel  = ["PENDING", "CONFIRMED"].includes(status);
  const canJoin    = Boolean(onJoinVideoCall) && isVirtual && !["CANCELLED", "COMPLETED"].includes(status);
  const isConfirmed = status === "CONFIRMED";

  const handleCancel = async () => {
    if (!window.confirm("Are you sure you want to cancel this appointment?")) return;
    setIsLoading(true);
    try {
      await onCancel(appointment.appointmentId);
      setError(null);
    } catch (err) {
      setError(err.message || "Failed to cancel appointment");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <article className="bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      {/* Accent stripe based on status */}
      <div className={`h-1 w-full ${
        status === "CONFIRMED" ? "bg-emerald-400" :
        status === "COMPLETED" ? "bg-teal-400" :
        status === "PENDING"   ? "bg-amber-400" :
        status === "CANCELLED" ? "bg-red-400" :
        "bg-slate-200"
      }`} />

      <div className="p-5">
        {/* Error banner */}
        {error && (
          <div className="mb-4 flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl px-3 py-2.5">
            <XCircleIcon className="w-4 h-4 flex-shrink-0 mt-0.5" />
            {error}
          </div>
        )}

        <div className="flex gap-5 items-start flex-wrap sm:flex-nowrap">

          {/* ── LEFT: Date & Time ────────────────────────────────────────────── */}
          <div className="flex-shrink-0 w-[90px] bg-slate-50 border border-slate-100 rounded-xl overflow-hidden text-center">
            {/* Month header */}
            <div className="bg-teal-600 text-white text-xs font-bold py-1 px-2 uppercase tracking-wider">
              {appointment.appointmentDateTime
                ? new Date(appointment.appointmentDateTime).toLocaleString("en-US", { month: "short" })
                : "—"}
            </div>
            {/* Day number */}
            <div className="py-2">
              <span className="block text-3xl font-bold text-slate-900 leading-none">
                {appointment.appointmentDateTime
                  ? new Date(appointment.appointmentDateTime).getDate()
                  : "—"}
              </span>
              <span className="block text-xs text-slate-500 mt-1">
                {appointment.appointmentDateTime
                  ? new Date(appointment.appointmentDateTime).getFullYear()
                  : ""}
              </span>
            </div>
            {/* Time */}
            <div className="flex items-center justify-center gap-1 border-t border-slate-100 py-1.5 px-2 bg-white">
              <ClockIcon className="w-3 h-3 text-teal-500 flex-shrink-0" />
              <span className="text-xs text-slate-600 font-medium">
                {formatTime(appointment.appointmentDateTime)}
              </span>
            </div>
          </div>

          {/* ── CENTER: Doctor Info ──────────────────────────────────────────── */}
          <div className="flex-1 min-w-0 flex items-start gap-3">
            {/* Avatar */}
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-cyan-600 flex items-center justify-center text-white font-bold text-base flex-shrink-0 shadow-sm">
              {appointment.doctorUsername?.charAt(0).toUpperCase() || "D"}
            </div>

            <div className="min-w-0">
              <h3 className="font-bold text-slate-900 text-base truncate">
                Dr. {appointment.doctorUsername || "Unknown"}
              </h3>
              {appointment.hospital && (
                <p className="text-sm text-slate-500 truncate flex items-center gap-1 mt-0.5">
                  <MapPinIcon className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  {appointment.hospital}
                </p>
              )}

              {/* Mode pill */}
              <div className="mt-2">
                {isVirtual ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold ring-1 ring-blue-200">
                    <VideoCameraIcon className="w-3.5 h-3.5" />
                    Virtual Consultation
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold ring-1 ring-slate-200">
                    <MapPinIcon className="w-3.5 h-3.5" />
                    In-Person Visit
                  </span>
                )}
              </div>

              {appointment.notes && (
                <p className="mt-2 text-xs text-slate-400 italic line-clamp-1">
                  "{appointment.notes}"
                </p>
              )}
            </div>
          </div>

          {/* ── RIGHT: Status & Actions ──────────────────────────────────────── */}
          <div className="flex-shrink-0 flex flex-col items-end gap-3 min-w-[130px]">
            {/* Status badges */}
            <StatusBadgeInline status={appointment.status} paymentStatus={appointment.paymentStatus} />

            {/* Price */}
            {appointment.price && (
              <p className="text-sm font-semibold text-slate-700">
                LKR {appointment.price}
              </p>
            )}

            {/* Action buttons */}
            {showActions && (
              <div className="flex flex-col items-end gap-2 w-full">
                {/* Primary actions */}
                {showPaymentAction && appointment.paymentStatus === "PENDING" && (
                  <button
                    onClick={() => onPay?.(appointment)}
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-teal-600 text-white text-xs font-semibold hover:bg-teal-700 transition-colors shadow-sm disabled:opacity-50"
                  >
                    <CreditCardIcon className="w-3.5 h-3.5" />
                    Pay Now
                  </button>
                )}
                {canJoin && (
                  <button
                    onClick={() => onJoinVideoCall?.(appointment)}
                    disabled={isLoading || !isConfirmed}
                    title={isConfirmed ? "Join the telemedicine call" : "Appointment must be confirmed first"}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <VideoCameraIcon className="w-3.5 h-3.5" />
                    {isConfirmed ? "Join Call" : "Call Pending"}
                  </button>
                )}
                {onConfirmAppointment && status === "PENDING" && (
                  <button
                    onClick={() => onConfirmAppointment(appointment)}
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition-colors shadow-sm disabled:opacity-50"
                  >
                    <CheckCircleIcon className="w-3.5 h-3.5" />
                    Confirm
                  </button>
                )}
                {onAddPrescription && (
                  <button
                    onClick={() => onAddPrescription(appointment)}
                    disabled={isLoading || !appointment.appointmentId || !appointment.patientId}
                    className="w-full px-4 py-2 rounded-xl bg-slate-800 text-white text-xs font-semibold hover:bg-slate-900 transition-colors shadow-sm disabled:opacity-50"
                  >
                    Add Prescription
                  </button>
                )}

                {/* Secondary / destructive */}
                {canCancel && (
                  <button
                    onClick={handleCancel}
                    disabled={isLoading}
                    className="text-xs text-red-500 hover:text-red-700 font-medium transition-colors disabled:opacity-50 underline-offset-2 hover:underline"
                  >
                    {isLoading ? "Cancelling…" : "Cancel appointment"}
                  </button>
                )}
                {onReschedule && (
                  <button
                    onClick={() => onReschedule(appointment)}
                    disabled={!canCancel || isLoading}
                    className="text-xs text-slate-500 hover:text-slate-700 font-medium transition-colors disabled:opacity-50 underline-offset-2 hover:underline"
                  >
                    Reschedule
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </article>
  );
};

export default AppointmentCard;
