import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import AppointmentCard from "../components/AppointmentCard";
import appointmentService from "../services/appointmentService";
import { PaymentModal } from "../../payments/components/PaymentModal";
import {
  CalendarDaysIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";

// ── Tab definitions ──────────────────────────────────────────────────────────
const TABS = [
  {
    id: "upcoming",
    label: "Upcoming",
    icon: ClockIcon,
    filter: (apt) => {
      const s = apt.status?.toUpperCase();
      const dt = new Date(apt.appointmentDateTime);
      return ["PENDING", "CONFIRMED"].includes(s) && dt >= new Date();
    },
  },
  {
    id: "past",
    label: "Past",
    icon: CheckCircleIcon,
    filter: (apt) => {
      const s = apt.status?.toUpperCase();
      const dt = new Date(apt.appointmentDateTime);
      return s === "COMPLETED" || (["PENDING", "CONFIRMED"].includes(s) && dt < new Date());
    },
  },
  {
    id: "cancelled",
    label: "Cancelled",
    icon: XCircleIcon,
    filter: (apt) => apt.status?.toUpperCase() === "CANCELLED",
  },
];

const AppointmentHistoryPage = ({ patientIdFromSession }) => {
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("upcoming");
  const [searchQuery, setSearchQuery] = useState("");
  const [patientId] = useState(patientIdFromSession || "");
  const [selectedPaymentAppointment, setSelectedPaymentAppointment] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (patientId) fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    if (!patientId?.trim()) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await appointmentService.getPatientAppointments(patientId);
      setAppointments(data || []);
    } catch (err) {
      setError(err.message || "Failed to load appointments");
      setAppointments([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelAppointment = async (appointmentId) => {
    try {
      await appointmentService.cancelAppointment(appointmentId);
      setAppointments((prev) =>
        prev.map((apt) =>
          apt.appointmentId === appointmentId
            ? { ...apt, status: "CANCELLED" }
            : apt,
        ),
      );
    } catch (err) {
      throw new Error(err.message || "Failed to cancel appointment");
    }
  };

  // ── Filtered list ───────────────────────────────────────────────────────────
  const activeTabDef = TABS.find((t) => t.id === activeTab);
  const filteredAppointments = useMemo(() => {
    let list = activeTabDef ? appointments.filter(activeTabDef.filter) : appointments;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (apt) =>
          apt.doctorUsername?.toLowerCase().includes(q) ||
          apt.hospital?.toLowerCase().includes(q) ||
          apt.appointmentMode?.toLowerCase().includes(q),
      );
    }
    // Sort by date descending for past, ascending for upcoming
    return [...list].sort((a, b) => {
      const diff = new Date(a.appointmentDateTime) - new Date(b.appointmentDateTime);
      return activeTab === "upcoming" ? diff : -diff;
    });
  }, [appointments, activeTab, searchQuery]);

  // ── Tab counts ──────────────────────────────────────────────────────────────
  const tabCounts = useMemo(() =>
    Object.fromEntries(
      TABS.map((t) => [t.id, appointments.filter(t.filter).length]),
    ),
    [appointments],
  );

  return (
    <div className="space-y-6">

      {/* ── Page header ─────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <CalendarDaysIcon className="w-6 h-6 text-teal-500" />
            My Appointments
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            View and manage all your scheduled consultations
          </p>
        </div>
        <button
          onClick={fetchAppointments}
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm disabled:opacity-50"
        >
          <ArrowPathIcon className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* ── Tabs ────────────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-1 bg-slate-100 rounded-2xl p-1.5">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all
              ${activeTab === id
                ? "bg-white text-teal-700 shadow-sm border border-teal-100"
                : "text-slate-500 hover:text-slate-700"
              }`}
          >
            <Icon className="w-4 h-4" />
            {label}
            {tabCounts[id] > 0 && (
              <span className={`inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1.5 rounded-full text-xs font-bold
                ${activeTab === id
                  ? "bg-teal-100 text-teal-700"
                  : "bg-slate-200 text-slate-500"
                }`}
              >
                {tabCounts[id]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Search bar ─────────────────────────────────────────────────────── */}
      <div className="relative">
        <MagnifyingGlassIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search by doctor, hospital, or mode…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-400/30 focus:border-teal-400 transition-all shadow-sm"
        />
      </div>

      {/* ── Error ───────────────────────────────────────────────────────────── */}
      {error && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
          <XCircleIcon className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* ── Content ─────────────────────────────────────────────────────────── */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <ArrowPathIcon className="w-8 h-8 animate-spin mb-3" />
          <p className="text-sm font-medium">Loading your appointments…</p>
        </div>
      ) : filteredAppointments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
            <CalendarDaysIcon className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-base font-semibold text-slate-700">No appointments found</h3>
          <p className="text-sm text-slate-400 mt-1 max-w-xs">
            {searchQuery
              ? "Try adjusting your search query."
              : activeTab === "upcoming"
                ? "You have no upcoming appointments scheduled."
                : activeTab === "past"
                  ? "No past appointments on record."
                  : "No cancelled appointments."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">
            {filteredAppointments.length} appointment{filteredAppointments.length !== 1 ? "s" : ""}
          </p>
          <div className="grid gap-3">
            {filteredAppointments.map((appointment) => (
              <AppointmentCard
                key={appointment.appointmentId}
                appointment={appointment}
                onCancel={handleCancelAppointment}
                onJoinVideoCall={(apt) => navigate(`/telemedicine/${apt.appointmentId}`)}
                onPay={(apt) => setSelectedPaymentAppointment(apt)}
                showActions={true}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── Payment Modal ────────────────────────────────────────────────────── */}
      {selectedPaymentAppointment && (
        <PaymentModal
          isOpen={!!selectedPaymentAppointment}
          appointmentId={selectedPaymentAppointment.appointmentId}
          patientId={selectedPaymentAppointment.patientId}
          amount={selectedPaymentAppointment.price}
          onClose={() => setSelectedPaymentAppointment(null)}
          onSuccess={() => {
            fetchAppointments();
            setSelectedPaymentAppointment(null);
          }}
        />
      )}
    </div>
  );
};

export default AppointmentHistoryPage;
