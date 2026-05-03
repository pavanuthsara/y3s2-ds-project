import React from 'react';
import PaymentStatusBadge from './PaymentStatusBadge';

export const TransactionCard = ({ transaction, appointment }) => {
  if (!transaction) return null;

  const {
    id,
    transactionId,
    amount,
    currency = 'LKR',
    status,
    paymentGateway,
    paidAt,
    createdAt,
    failureReason,
    refundedAt,
  } = transaction;

  const displayId = transactionId || id;
  const transactionDate = paidAt ? new Date(paidAt) : new Date(createdAt);
  const isVirtual = appointment?.appointmentMode !== 'PHYSICAL';

  const appointmentTime = appointment?.appointmentDateTime
    ? new Date(appointment.appointmentDateTime).toLocaleString('en-US', {
        weekday: 'short', year: 'numeric', month: 'short',
        day: 'numeric', hour: '2-digit', minute: '2-digit',
      })
    : null;

  const handleDownload = () => {
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <title>Payment Receipt</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:Arial,sans-serif;padding:48px;color:#1f2937;max-width:600px;margin:auto}
    .brand{font-size:22px;font-weight:700;color:#2563eb}
    .subtitle{font-size:13px;color:#6b7280;margin-top:2px}
    .badge{display:inline-block;background:#d1fae5;color:#065f46;font-size:13px;font-weight:600;padding:5px 14px;border-radius:9999px;margin-top:12px}
    hr{border:none;border-top:1px dashed #d1d5db;margin:20px 0}
    .section{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:#9ca3af;margin-bottom:10px}
    .row{display:flex;justify-content:space-between;margin-bottom:9px;font-size:14px}
    .lbl{color:#6b7280}.val{font-weight:600;color:#111827;text-align:right;max-width:58%}
    .total-row{display:flex;justify-content:space-between;margin-top:18px;padding-top:14px;border-top:2px solid #111827}
    .total-lbl{font-size:16px;font-weight:700}.total-val{font-size:22px;font-weight:700;color:#2563eb}
    .footer{margin-top:32px;text-align:center;font-size:11px;color:#9ca3af;line-height:1.6}
  </style>
</head>
<body>
  <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:24px">
    <div><div class="brand">NexaHealth</div><div class="subtitle">Medical Appointment Receipt</div></div>
    <span class="badge">&#10003; Payment Successful</span>
  </div>
  <hr/>
  ${appointment ? `
  <div class="section">Appointment</div>
  ${appointment.doctorUsername ? `<div class="row"><span class="lbl">Doctor</span><span class="val">${appointment.doctorUsername}</span></div>` : ''}
  <div class="row"><span class="lbl">Type</span><span class="val">${isVirtual ? 'Virtual Consultation' : 'In-Person Visit'}</span></div>
  ${!isVirtual && appointment.hospital ? `<div class="row"><span class="lbl">Hospital</span><span class="val">${appointment.hospital}</span></div>` : ''}
  ${appointmentTime ? `<div class="row"><span class="lbl">Appointment Time</span><span class="val">${appointmentTime}</span></div>` : ''}
  <hr/>` : ''}
  <div class="section">Payment</div>
  ${displayId ? `<div class="row"><span class="lbl">Transaction ID</span><span class="val" style="font-family:monospace;font-size:12px">${displayId}</span></div>` : ''}
  <div class="row"><span class="lbl">Payment Date</span><span class="val">${transactionDate.toLocaleString()}</span></div>
  <div class="row"><span class="lbl">Gateway</span><span class="val">${paymentGateway || 'Stripe'}</span></div>
  <div class="row"><span class="lbl">Status</span><span class="val" style="color:#065f46">Successful</span></div>
  <div class="total-row">
    <span class="total-lbl">Total Paid</span>
    <span class="total-val">${currency} ${Number(amount || 0).toFixed(2)}</span>
  </div>
  <div class="footer">
    <p>Thank you for choosing NexaHealth.</p>
    <p>Generated on ${new Date().toLocaleString()}</p>
  </div>
</body>
</html>`);
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 300);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-bold text-gray-800">Payment Receipt</h3>
          <p className="text-gray-400 text-xs mt-0.5">
            {transactionDate.toLocaleString('en-US', {
              year: 'numeric', month: 'short', day: 'numeric',
              hour: '2-digit', minute: '2-digit',
            })}
          </p>
        </div>
        <PaymentStatusBadge status={status} />
      </div>

      {/* Appointment details */}
      {appointment && (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg space-y-1.5 text-sm">
          <p className="text-xs font-bold uppercase tracking-widest text-blue-400 mb-2">Appointment</p>

          {appointment.doctorUsername && (
            <div className="flex justify-between">
              <span className="text-gray-500">Doctor</span>
              <span className="font-semibold text-gray-800">{appointment.doctorUsername}</span>
            </div>
          )}

          <div className="flex justify-between">
            <span className="text-gray-500">Type</span>
            <span className="font-semibold text-gray-800">
              {isVirtual ? '🖥️ Virtual' : '🏥 In-Person'}
            </span>
          </div>

          {!isVirtual && appointment.hospital && (
            <div className="flex justify-between">
              <span className="text-gray-500">Hospital</span>
              <span className="font-semibold text-gray-800">{appointment.hospital}</span>
            </div>
          )}

          {appointmentTime && (
            <div className="flex justify-between">
              <span className="text-gray-500">Date & Time</span>
              <span className="font-semibold text-gray-800 text-xs">{appointmentTime}</span>
            </div>
          )}
        </div>
      )}

      {/* Payment details */}
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-500">Amount Paid</span>
          <span className="font-bold text-gray-800">{currency} {Number(amount || 0).toFixed(2)}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-500">Gateway</span>
          <span className="text-gray-700 capitalize">{paymentGateway?.toLowerCase() || 'N/A'}</span>
        </div>

        {refundedAt && (
          <div className="flex justify-between">
            <span className="text-gray-500">Refunded</span>
            <span className="text-gray-700">{new Date(refundedAt).toLocaleDateString()}</span>
          </div>
        )}

        {failureReason && status?.toUpperCase() === 'FAILED' && (
          <div className="flex justify-between">
            <span className="text-gray-500">Reason</span>
            <span className="text-red-600 text-xs">{failureReason}</span>
          </div>
        )}

        {displayId && (
          <div className="flex justify-between items-center pt-1 border-t border-gray-100">
            <span className="text-gray-400 text-xs">Transaction ID</span>
            <span className="text-gray-400 font-mono text-xs truncate max-w-[55%]">{displayId}</span>
          </div>
        )}
      </div>

      {/* Download button */}
      {status?.toUpperCase() === 'SUCCESS' && (
        <div className="mt-4 pt-3 border-t border-gray-100">
          <button
            onClick={handleDownload}
            className="w-full px-3 py-2 bg-blue-50 text-blue-700 font-semibold rounded-lg hover:bg-blue-100 transition-colors text-sm"
          >
            📥 Download Receipt
          </button>
        </div>
      )}
    </div>
  );
};

export default TransactionCard;
