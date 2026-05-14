import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Banknote, QrCode, Smartphone, CheckCircle2,
  Loader2, X, AlertCircle
} from 'lucide-react';
import { paymentService } from '../../services/payment.service';
import { adminService } from '../../services/admin.service';

/**
 * DeliveryPaymentModal
 * Opens when admin tries to mark a cash-on-delivery order as DELIVERED.
 * 
 * Flow:
 * 1. Choose: Cash or UPI
 * 2a. Cash → mark payment PAID → then update order to DELIVERED
 * 2b. UPI  → show QR → enter UTR → verify → then update order to DELIVERED
 * 
 * Order status is ONLY updated to DELIVERED after payment is confirmed.
 * If admin closes/cancels, order stays at its previous status.
 */
const DeliveryPaymentModal = ({ isOpen, order, onClose, onDone }) => {
  const [step, setStep]                   = useState('choose');
  const [selectedMethod, setSelectedMethod] = useState(null); // 'cash' | 'upi'
  const [selectedUpiId, setSelectedUpiId] = useState('primary');
  const [upiData, setUpiData]             = useState(null);
  const [utrInput, setUtrInput]           = useState('');
  const [loading, setLoading]             = useState(false);
  const [error, setError]                 = useState('');

  // Pre-select method based on order
  useEffect(() => {
    if (order) {
      setSelectedMethod(order.paymentMethod === 'UPI' ? 'upi' : 'cash');
    }
  }, [order, isOpen]);

  const reset = () => {
    setStep('choose');
    setSelectedMethod(null);
    setUpiData(null);
    setUtrInput('');
    setError('');
    setLoading(false);
    setSelectedUpiId('primary');
  };

  const handleClose = () => { reset(); onClose(); };

  // ── Finalize: mark order DELIVERED after payment confirmed ────────────────
  const finalizeDelivery = async () => {
    await adminService.updateOrderStatus(order._id, 'DELIVERED');
  };

  // ── Cash selected ─────────────────────────────────────────────────────────
  const handleCash = async () => {
    setLoading(true);
    setError('');
    try {
      await adminService.updatePaymentStatus(order._id, 'PAID');
      await finalizeDelivery();
      setStep('done');
      setTimeout(() => { reset(); onDone(); }, 1200);
    } catch {
      setError('Failed to update. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── UPI: generate QR ──────────────────────────────────────────────────────
  const handleUpiQr = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await paymentService.initiateUpi(order._id, selectedUpiId);
      setUpiData(res.data);
      setStep('upi_qr');
    } catch {
      setError('Failed to generate QR. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── UTR submit ────────────────────────────────────────────────────────────
  const handleVerifyUtr = async () => {
    if (!utrInput.trim()) { setError('Please enter UTR / Transaction ID'); return; }
    setLoading(true);
    setError('');
    try {
      await paymentService.verifyUtr(upiData.paymentId, utrInput);
      await finalizeDelivery();
      setStep('done');
      setTimeout(() => { reset(); onDone(); }, 1200);
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed. Check UTR and retry.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !order) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      {/* Backdrop — clicking it does NOT close (payment must be confirmed or explicitly cancelled) */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="relative w-full max-w-md glass border border-white/10 rounded-3xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-white/5">
          <div>
            <h2 className="text-lg font-playfair font-bold text-white">Collect Payment</h2>
            <p className="text-[10px] text-text-muted mt-0.5">
              Order #{order.orderNumber} · ₹{order.totalAmount}
            </p>
          </div>
          {/* Only allow close on choose step — not mid-flow */}
          {step === 'choose' && (
            <button onClick={handleClose}
              className="p-2 rounded-xl hover:bg-white/5 text-text-muted hover:text-white transition-all">
              <X size={18} />
            </button>
          )}
        </div>

        <div className="px-8 py-6">
          <AnimatePresence mode="wait">

            {/* ── Step: Choose ── */}
            {step === 'choose' && (
              <motion.div key="choose"
                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
                className="space-y-5">

                <p className="text-sm text-text-muted">How did the customer pay?</p>

                {/* Method selection — only one active at a time */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Cash */}
                  <button
                    onClick={() => setSelectedMethod('cash')}
                    className={`flex flex-col items-center gap-3 p-6 rounded-2xl border transition-all group ${
                      selectedMethod === 'cash'
                        ? 'border-yellow-400 bg-yellow-400/10 ring-1 ring-yellow-400/30'
                        : 'border-white/10 bg-white/5 hover:border-white/20'
                    }`}
                  >
                    <Banknote size={28} className={selectedMethod === 'cash' ? 'text-yellow-400' : 'text-text-muted'} />
                    <span className={`text-xs font-black uppercase tracking-widest ${selectedMethod === 'cash' ? 'text-yellow-400' : 'text-text-muted'}`}>
                      Cash
                    </span>
                  </button>

                  {/* UPI */}
                  <button
                    onClick={() => setSelectedMethod('upi')}
                    className={`flex flex-col items-center gap-3 p-6 rounded-2xl border transition-all group ${
                      selectedMethod === 'upi'
                        ? 'border-primary bg-primary/10 ring-1 ring-primary/30'
                        : 'border-white/10 bg-white/5 hover:border-white/20'
                    }`}
                  >
                    <QrCode size={28} className={selectedMethod === 'upi' ? 'text-primary' : 'text-text-muted'} />
                    <span className={`text-xs font-black uppercase tracking-widest ${selectedMethod === 'upi' ? 'text-primary' : 'text-text-muted'}`}>
                      UPI / QR
                    </span>
                  </button>
                </div>

                {/* UPI account selector — only shown when UPI selected */}
                {selectedMethod === 'upi' && (
                  <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-text-muted">UPI Account</p>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: 'primary',   label: 'shivanshsaini733@oksbi', bank: 'SBI'  },
                        { id: 'secondary', label: '9520640928@okbizaxis',   bank: 'Axis' },
                      ].map(opt => (
                        <button key={opt.id} onClick={() => setSelectedUpiId(opt.id)}
                          className={`p-3 rounded-xl border text-left transition-all ${selectedUpiId === opt.id ? 'border-primary bg-primary/10' : 'border-white/10 bg-white/5 hover:border-white/20'}`}>
                          <p className={`text-[10px] font-black truncate ${selectedUpiId === opt.id ? 'text-primary' : 'text-white'}`}>{opt.label}</p>
                          <p className="text-[9px] text-text-muted">{opt.bank}</p>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {error && (
                  <p className="text-red-400 text-xs flex items-center gap-1.5">
                    <AlertCircle size={12} />{error}
                  </p>
                )}

                {/* Confirm button — enabled only after selection */}
                <button
                  onClick={() => {
                    if (selectedMethod === 'cash') handleCash();
                    else if (selectedMethod === 'upi') handleUpiQr();
                  }}
                  disabled={!selectedMethod || loading}
                  className="w-full btn-primary py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {loading
                    ? <><Loader2 size={15} className="animate-spin" /> Processing...</>
                    : <><CheckCircle2 size={15} /> {selectedMethod === 'cash' ? 'Confirm Cash Payment' : selectedMethod === 'upi' ? 'Generate QR' : 'Select a Method'}</>
                  }
                </button>

                <p className="text-[10px] text-text-muted text-center italic">
                  Order will be marked Delivered only after payment is confirmed.
                </p>
              </motion.div>
            )}

            {/* ── Step: UPI QR ── */}
            {step === 'upi_qr' && upiData && (
              <motion.div key="upi_qr"
                initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
                className="flex flex-col items-center gap-5">

                <div className="bg-white p-4 rounded-2xl shadow-2xl">
                  <img src={upiData.qrDataUrl} alt="UPI QR" className="w-52 h-52 object-contain" />
                </div>

                <div className="text-center space-y-1">
                  <p className="text-2xl font-black text-primary">₹{upiData.amount}</p>
                  <p className="text-xs text-text-muted">
                    Pay to: <span className="text-white font-bold">{upiData.upiId}</span>
                  </p>
                </div>

                <a href={upiData.deepLink}
                  className="btn-primary px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center gap-2 w-full justify-center">
                  <Smartphone size={15} /> Open UPI App
                </a>

                <button onClick={() => setStep('upi_utr')}
                  className="text-[11px] font-black uppercase tracking-widest text-primary hover:underline">
                  Customer Paid → Enter UTR
                </button>

                <button onClick={() => setStep('choose')}
                  className="text-[10px] text-text-muted hover:text-white transition-colors">
                  ← Change Payment Method
                </button>
              </motion.div>
            )}

            {/* ── Step: UTR entry ── */}
            {step === 'upi_utr' && (
              <motion.div key="upi_utr"
                initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
                className="space-y-5">

                <div>
                  <p className="text-sm font-bold text-white mb-1">Enter UTR / Transaction ID</p>
                  <p className="text-[11px] text-text-muted mb-4">
                    Find it in the UPI app under payment history
                  </p>
                  <input type="text" value={utrInput}
                    onChange={e => { setUtrInput(e.target.value); setError(''); }}
                    placeholder="e.g. 123456789012"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-5 outline-none focus:border-primary/40 transition-all text-sm font-mono"
                  />
                  {error && (
                    <p className="text-red-400 text-xs mt-2 flex items-center gap-1">
                      <AlertCircle size={12} />{error}
                    </p>
                  )}
                </div>

                <div className="flex gap-3">
                  <button onClick={() => setStep('upi_qr')}
                    className="flex-1 py-3 rounded-2xl border border-white/10 text-[11px] font-black uppercase tracking-widest text-text-muted hover:border-white/20 transition-all">
                    ← Back
                  </button>
                  <button onClick={handleVerifyUtr} disabled={loading}
                    className="flex-1 btn-primary py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-2">
                    {loading ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle2 size={15} />}
                    Confirm & Deliver
                  </button>
                </div>
              </motion.div>
            )}

            {/* ── Step: Done ── */}
            {step === 'done' && (
              <motion.div key="done"
                initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                className="flex flex-col items-center gap-4 py-6">
                <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center">
                  <CheckCircle2 size={36} className="text-green-400" />
                </div>
                <p className="text-lg font-bold text-white">Payment Confirmed!</p>
                <p className="text-sm text-text-muted">Order marked as Delivered & Paid.</p>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default DeliveryPaymentModal;
