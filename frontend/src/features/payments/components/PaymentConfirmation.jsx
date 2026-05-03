import React, { useState, useEffect } from 'react';
import { paymentService } from '../services';
import PaymentStatusBadge from './PaymentStatusBadge';
import PaymentLoader from './PaymentLoader';

export const PaymentConfirmation = ({
  transactionId,
  appointmentId,
  amount,
  currency = 'LKR',
  appointmentDetails,
  onClose,
}) => {
  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTransaction = async () => {
      if (!transactionId) { setLoading(false); return; }
      try {
        setLoading(true);
        setError('');
        const data = await paymentService.getTransaction(transactionId);
        setTransaction(data);
      } catch (err) {
        setError(err.message || 'Failed to load transaction details');
      } finally {
        setLoading(false);
      }
    };
    fetchTransaction();
  }, [transactionId]);

  if (loading) return <PaymentLoader message="Loading confirmation..." />;

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-800 text-sm">{error}</p>
      </div>
    );
  }

  const displayTransaction = transaction || { transactionId, appointmentId, amount, currency };
  const paidAt = displayTransaction.paidAt ? new Date(displayTransaction.paidAt) : new Date();
  const formattedPaidAt = paidAt.toLocaleString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });

  const isVirtual = appointmentDetails?.appointmentMode !== 'PHYSICAL';
  const appointmentTime = appointmentDetails?.appointmentDateTime
    ? new Date(appointmentDetails.appointmentDateTime).toLocaleString('en-US', {
        weekday: 'short', year: 'numeric', month: 'short',
        day: 'numeric', hour: '2-digit', minute: '2-digit',
      })
    : null;
  const displayAmount = Number(displayTransaction.amount || amount).toFixed(2);
  const displayCurrency = displayTransaction.currency || currency;

  const handleDownloadReceipt = () => {
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
    .brand{font-size:24px;font-weight:700;color:#2563eb}
    .subtitle{font-size:13px;color:#6b7280;margin-top:2px}
    .success-badge{display:inline-flex;align-items:center;gap:6px;background:#d1fae5;color:#065f46;font-size:13px;font-weight:600;padding:5px 14px;border-radius:9999px;margin-top:12px}
    hr{border:none;border-top:1px dashed #d1d5db;margin:20px 0}
    .section-label{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:#9ca3af;margin-bottom:10px}
    .row{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:9px;font-size:14px}
    .lbl{color:#6b7280}
    .val{font-weight:600;color:#111827;text-align:right;max-width:58%}
    .total-row{display:flex;justify-content:space-between;align-items:center;margin-top:18px;padding-top:14px;border-top:2px solid #111827}
    .total-lbl{font-size:16px;font-weight:700}
    .total-val{font-size:22px;font-weight:700;color:#2563eb}
    .footer{margin-top:32px;text-align:center;font-size:11px;color:#9ca3af;line-height:1.6}
  </style>
</head>
<body>
  <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:24px">
    <div>
      <div class="brand">NexaHealth</div>
      <div class="subtitle">Medical Appointment Receipt</div>
    </div>
    <span class="success-badge">&#10003; Payment Successful</span>
  </div>

  <hr/>

  <div class="section-label">Appointment Details</div>
  ${appointmentDetails?.doctorName ? `<div class="row"><span class="lbl">Doctor</span><span class="val">Dr. ${appointmentDetails.doctorName}</span></div>` : ''}
  <div class="row"><span class="lbl">Consultation Type</span><span class="val">${isVirtual ? 'Virtual Consultation' : 'In-Person Visit'}</span></div>
  ${!isVirtual && appointmentDetails?.hospital ? `<div class="row"><span class="lbl">Hospital / Location</span><span class="val">${appointmentDetails.hospital}</span></div>` : ''}
  ${appointmentTime ? `<div class="row"><span class="lbl">Appointment Time</span><span class="val">${appointmentTime}</span></div>` : ''}

  <hr/>

  <div class="section-label">Payment Details</div>
  ${transactionId ? `<div class="row"><span class="lbl">Transaction ID</span><span class="val" style="font-family:monospace;font-size:12px">${transactionId}</span></div>` : ''}
  ${appointmentId ? `<div class="row"><span class="lbl">Appointment ID</span><span class="val" style="font-family:monospace;font-size:12px">${appointmentId}</span></div>` : ''}
  <div class="row"><span class="lbl">Payment Date</span><span class="val">${formattedPaidAt}</span></div>
  <div class="row"><span class="lbl">Status</span><span class="val" style="color:#065f46">Successful</span></div>

  <div class="total-row">
    <span class="total-lbl">Total Paid</span>
    <span class="total-val">${displayCurrency} ${displayAmount}</span>
  </div>

  <div class="footer">
    <p>Thank you for choosing NexaHealth.</p>
    <p>A confirmation has been sent to your registered email address.</p>
    <p style="margin-top:8px">Generated on ${new Date().toLocaleString()}</p>
  </div>
</body>
</html>`);
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 300);
  };

  return (
    <div className="p-6 bg-white">
      {/* Success header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
          <span className="text-3xl">✅</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-1">Payment Successful!</h2>
        <p className="text-gray-500 text-sm">Your appointment has been confirmed.</p>
      </div>

      {/* Receipt card */}
      <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-3">

        {/* Appointment section */}
        {(appointmentDetails?.doctorName || appointmentTime) && (
          <>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Appointment</p>

            {appointmentDetails?.doctorName && (
              <div className="flex justify-between items-center">
                <span className="text-gray-500 text-sm">Doctor</span>
                <span className="font-semibold text-gray-800">Dr. {appointmentDetails.doctorName}</span>
              </div>
            )}

            <div className="flex justify-between items-center">
              <span className="text-gray-500 text-sm">Type</span>
              <span className="font-semibold text-gray-800">
                {isVirtual ? '🖥️ Virtual Consultation' : '🏥 In-Person Visit'}
              </span>
            </div>

            {!isVirtual && appointmentDetails?.hospital && (
              <div className="flex justify-between items-center">
                <span className="text-gray-500 text-sm">Hospital</span>
                <span className="font-semibold text-gray-800">{appointmentDetails.hospital}</span>
              </div>
            )}

            {appointmentTime && (
              <div className="flex justify-between items-center">
                <span className="text-gray-500 text-sm">Date & Time</span>
                <span className="font-semibold text-gray-800 text-sm">{appointmentTime}</span>
              </div>
            )}

            <hr className="border-dashed border-gray-200" />
          </>
        )}

        {/* Payment section */}
        <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Payment</p>

        <div className="flex justify-between items-center">
          <span className="text-gray-500 text-sm">Status</span>
          <PaymentStatusBadge status="SUCCESS" />
        </div>

        <div className="flex justify-between items-center">
          <span className="text-gray-500 text-sm">Amount Paid</span>
          <span className="text-lg font-bold text-gray-800">{displayCurrency} {displayAmount}</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-gray-500 text-sm">Payment Date</span>
          <span className="text-sm text-gray-700">{formattedPaidAt}</span>
        </div>

        {transactionId && (
          <div className="flex justify-between items-center">
            <span className="text-gray-500 text-sm">Transaction ID</span>
            <span className="text-xs text-gray-400 font-mono">{transactionId}</span>
          </div>
        )}
      </div>

      {/* Buttons */}
      <div className="flex gap-3">
        <button
          onClick={handleDownloadReceipt}
          className="flex-1 px-4 py-2 bg-blue-50 text-blue-700 font-semibold rounded-lg hover:bg-blue-100 transition-colors"
        >
          📥 Download Receipt
        </button>
        {onClose && (
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            Done
          </button>
        )}
      </div>

      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-800">
          💡 A confirmation email has been sent to your registered email address.
        </p>
      </div>
    </div>
  );
};

export default PaymentConfirmation;
