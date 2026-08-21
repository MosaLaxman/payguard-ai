import React, { useState, useEffect } from 'react';
import { X, ShieldAlert, KeyRound, CheckCircle2, ArrowRight, Sparkles, RefreshCw, Lock } from 'lucide-react';

interface StepUpAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  transactionId?: string;
  amount?: number;
  riskScore?: number;
  reason?: string;
}

export const StepUpAuthModal: React.FC<StepUpAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  transactionId = 'TX-SIM-001',
  amount = 14500,
  riskScore = 48,
  reason = 'Moderate amount deviation & domestic location mismatch detected.',
}) => {
  const [otp, setOtp] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const DEMO_OTP = '849201';

  useEffect(() => {
    if (isOpen) {
      setOtp('');
      setIsVerifying(false);
      setIsSuccess(false);
      setErrorMsg('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAutoFill = () => {
    setOtp(DEMO_OTP);
    setErrorMsg('');
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp.trim()) {
      setErrorMsg('Please enter the 6-digit verification code.');
      return;
    }

    if (otp !== DEMO_OTP && otp !== '123456') {
      setErrorMsg('Invalid Demo OTP. Use "849201" or click Auto-Fill.');
      return;
    }

    setErrorMsg('');
    setIsVerifying(true);

    // Simulate realistic 700ms 2FA verification roundtrip
    setTimeout(() => {
      setIsVerifying(false);
      setIsSuccess(true);
      setTimeout(() => {
        onSuccess();
      }, 1200);
    }, 800);
  };

  const formatINR = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md bg-[#111827] border border-amber-500/40 rounded-2xl shadow-2xl overflow-hidden p-6 text-slate-100">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {!isSuccess ? (
          <div className="space-y-4">
            
            {/* Header with amber glow */}
            <div className="flex items-center space-x-3">
              <div className="p-3 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30">
                <ShieldAlert className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  Step-Up Authentication
                </span>
                <h3 className="text-base font-bold text-white mt-0.5">
                  Additional Verification Required
                </h3>
              </div>
            </div>

            {/* Context Notice */}
            <div className="p-3.5 bg-slate-900/90 rounded-xl border border-slate-800 text-xs space-y-1.5">
              <div className="flex justify-between text-slate-400">
                <span>Transaction ID:</span>
                <span className="font-mono text-slate-200 font-bold">{transactionId}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Amount:</span>
                <span className="font-mono text-white font-bold">{formatINR(amount)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Computed Risk Score:</span>
                <span className="font-mono text-amber-400 font-bold">{riskScore}/100 (Medium Risk)</span>
              </div>
              <p className="text-[11px] text-amber-300/90 pt-1 border-t border-slate-800/80">
                ⚠️ {reason}
              </p>
            </div>

            {/* Simulation Instructions & Auto-Fill */}
            <div className="flex items-center justify-between p-2.5 bg-blue-950/30 border border-blue-500/30 rounded-xl text-xs">
              <div className="flex items-center space-x-2 text-blue-300">
                <KeyRound className="w-4 h-4 text-blue-400" />
                <span>Demo OTP: <strong className="font-mono text-white tracking-widest">{DEMO_OTP}</strong></span>
              </div>
              <button
                type="button"
                onClick={handleAutoFill}
                className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-[11px] font-bold shadow transition"
              >
                Auto-Fill
              </button>
            </div>

            {/* OTP Input Form */}
            <form onSubmit={handleVerify} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Enter 6-Digit Demo Verification Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="849201"
                  className="w-full text-center text-xl font-mono tracking-widest py-2.5 bg-slate-950 text-white rounded-xl border border-slate-700 focus:border-amber-500 focus:outline-none transition"
                  autoFocus
                />
                {errorMsg && (
                  <p className="text-xs text-rose-400 font-medium mt-1.5 text-center">
                    {errorMsg}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-3 pt-1">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isVerifying}
                  className="flex-1 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 transition flex items-center justify-center space-x-1.5 disabled:opacity-50"
                >
                  {isVerifying ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-3.5 h-3.5" />
                      <span>Verify & Approve</span>
                    </>
                  )}
                </button>
              </div>
            </form>

          </div>
        ) : (
          /* Step 3: Success Animation */
          <div className="py-6 text-center space-y-4 animate-fadeIn">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/30">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white">Identity Verified Successfully!</h3>
              <p className="text-xs text-emerald-400 font-semibold font-mono">
                Payment Status Updated: APPROVED (2FA Verified)
              </p>
              <p className="text-[11px] text-slate-400 max-w-xs mx-auto pt-1">
                Customer successfully cleared two-factor authentication challenge. Risk mitigated.
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
