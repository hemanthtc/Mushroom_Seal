import React, { useState } from 'react';
import { ShieldCheck, CreditCard, QrCode, Building, CheckCircle2, Lock, X } from 'lucide-react';
import { generatePaymentId } from '../../services/razorpay';

interface RazorpaySimulationModalProps {
  amount: number;
  customerName: string;
  customerPhone: string;
  onSuccess: (paymentId: string) => void;
  onClose: () => void;
}

export const RazorpaySimulationModal: React.FC<RazorpaySimulationModalProps> = ({
  amount,
  customerName,
  customerPhone,
  onSuccess,
  onClose,
}) => {
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [upiId, setUpiId] = useState('user@okaxis');
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8912');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [paymentId, setPaymentId] = useState('');

  const handlePayNow = () => {
    setIsProcessing(true);
    const newPaymentId = generatePaymentId();
    setPaymentId(newPaymentId);

    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);

      setTimeout(() => {
        onSuccess(newPaymentId);
      }, 1400);
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl text-slate-100 font-sans">
        
        {/* Razorpay Brand Header */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center font-extrabold text-white text-sm shadow-md">
              R
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg tracking-tight text-white">Razorpay</span>
                <span className="bg-blue-500/30 text-blue-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-400/40">
                  TEST MODE
                </span>
              </div>
              <p className="text-[11px] text-slate-300">Shroom & Veggies Farm Market</p>
            </div>
          </div>

          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Amount bar */}
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex justify-between items-center">
          <div>
            <span className="text-xs text-slate-400 block">Total Amount</span>
            <span className="text-2xl font-extrabold text-white">₹{amount.toFixed(2)}</span>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-400 block">{customerName}</span>
            <span className="text-xs text-slate-300 font-mono">{customerPhone}</span>
          </div>
        </div>

        {/* Body content */}
        <div className="p-6 space-y-5">
          {isSuccess ? (
            <div className="py-8 text-center space-y-3 animate-scale-up">
              <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto animate-bounce" />
              <h3 className="text-xl font-bold text-white">Payment Successful!</h3>
              <p className="text-xs text-slate-400">Payment ID: <span className="font-mono text-amber-300">{paymentId}</span></p>
              <p className="text-xs text-emerald-400">Redirecting to Order Confirmation...</p>
            </div>
          ) : isProcessing ? (
            <div className="py-12 text-center space-y-4">
              <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <h4 className="font-bold text-white text-base">Processing Razorpay Transaction...</h4>
              <p className="text-xs text-slate-400">Please do not close or refresh this window.</p>
            </div>
          ) : (
            <>
              {/* Payment Methods tabs */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('upi')}
                  className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 text-xs font-semibold ${
                    paymentMethod === 'upi'
                      ? 'bg-blue-600/30 border-blue-500 text-white shadow-md'
                      : 'bg-slate-800/40 border-slate-700 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  <QrCode className="w-5 h-5 text-blue-400" />
                  <span>UPI / QR</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 text-xs font-semibold ${
                    paymentMethod === 'card'
                      ? 'bg-blue-600/30 border-blue-500 text-white shadow-md'
                      : 'bg-slate-800/40 border-slate-700 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  <CreditCard className="w-5 h-5 text-indigo-400" />
                  <span>Cards</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('netbanking')}
                  className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 text-xs font-semibold ${
                    paymentMethod === 'netbanking'
                      ? 'bg-blue-600/30 border-blue-500 text-white shadow-md'
                      : 'bg-slate-800/40 border-slate-700 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  <Building className="w-5 h-5 text-emerald-400" />
                  <span>Net Banking</span>
                </button>
              </div>

              {/* Tab specific details */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
                {paymentMethod === 'upi' && (
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Enter Virtual Payment Address (VPA)</label>
                    <input
                      type="text"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 font-mono"
                    />
                    <div className="flex gap-2 mt-2 text-[10px] text-slate-400">
                      <span className="bg-slate-800 px-2 py-0.5 rounded text-blue-300">GPay</span>
                      <span className="bg-slate-800 px-2 py-0.5 rounded text-purple-300">PhonePe</span>
                      <span className="bg-slate-800 px-2 py-0.5 rounded text-sky-300">Paytm</span>
                      <span className="bg-slate-800 px-2 py-0.5 rounded text-emerald-300">BHIM</span>
                    </div>
                  </div>
                )}

                {paymentMethod === 'card' && (
                  <div className="space-y-2 text-xs">
                    <div>
                      <label className="block text-slate-400 mb-1">Card Number</label>
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="MM/YY (12/28)"
                        className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                      />
                      <input
                        type="password"
                        placeholder="CVV (888)"
                        className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                      />
                    </div>
                  </div>
                )}

                {paymentMethod === 'netbanking' && (
                  <div className="text-xs space-y-2">
                    <label className="block text-slate-400">Popular Banks</label>
                    <select className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-sans">
                      <option>HDFC Bank</option>
                      <option>State Bank of India (SBI)</option>
                      <option>ICICI Bank</option>
                      <option>Axis Bank</option>
                      <option>Kotak Mahindra</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Razorpay Trust seal */}
              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                <span className="flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5 text-emerald-400" /> 256-bit SSL Encrypted
                </span>
                <span className="flex items-center gap-1 text-slate-300">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-400" /> Razorpay Verified
                </span>
              </div>

              {/* Submit Pay button */}
              <button
                onClick={handlePayNow}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-3.5 rounded-2xl shadow-xl shadow-blue-900/50 flex items-center justify-center gap-2 text-sm transition-all transform active:scale-95"
              >
                <span>Pay ₹{amount.toFixed(2)}</span>
              </button>
            </>
          )}
        </div>

      </div>
    </div>
  );
};
