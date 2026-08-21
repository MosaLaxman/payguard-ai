import React, { useState } from 'react';
import { Play, Sparkles, AlertTriangle, ShieldCheck, ShieldX, RefreshCw, Smartphone, MapPin, Clock, DollarSign, Zap, CheckCircle2, KeyRound, ArrowRight } from 'lucide-react';
import { SimulationRequest, SimulationResponse } from '../types';
import { StepUpAuthModal } from './StepUpAuthModal';
import { api } from '../services/api';

export const RiskSimulator: React.FC = () => {
  const [formData, setFormData] = useState<SimulationRequest>({
    customer_id: 'CUST-SIM-001',
    customer_name: 'Aditya Sharma',
    amount: 14500,
    customer_average_amount: 3000,
    location: 'Delhi NCR, IN',
    usual_location: 'Mumbai, IN',
    is_new_device: false,
    transaction_count_last_24h: 4,
    previous_failed_transactions: 1,
    merchant_name: 'Flipkart India',
    merchant_category: 'E-Commerce',
    customer_account_age_days: 365,
    payment_method: 'UPI (GooglePay)',
    transaction_hour: 16,
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SimulationResponse | null>(null);
  const [activePreset, setActivePreset] = useState<'normal' | 'suspicious' | 'critical'>('suspicious');
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [is2FAVerified, setIs2FAVerified] = useState(false);

  const applyPreset = (presetType: 'normal' | 'suspicious' | 'critical') => {
    setActivePreset(presetType);
    setIs2FAVerified(false);

    if (presetType === 'normal') {
      setFormData({
        customer_id: 'CUST-SAFE-01',
        customer_name: 'Aditya Sharma',
        amount: 450,
        customer_average_amount: 2200,
        location: 'Bengaluru, IN',
        usual_location: 'Bengaluru, IN',
        is_new_device: false,
        transaction_count_last_24h: 1,
        previous_failed_transactions: 0,
        merchant_name: 'Swiggy India',
        merchant_category: 'Food Delivery',
        customer_account_age_days: 480,
        payment_method: 'UPI (PhonePe)',
        transaction_hour: 13,
      });
    } else if (presetType === 'suspicious') {
      setFormData({
        customer_id: 'CUST-REVIEW-02',
        customer_name: 'Priya Nair',
        amount: 14500,
        customer_average_amount: 3000,
        location: 'Delhi NCR, IN',
        usual_location: 'Mumbai, IN',
        is_new_device: false,
        transaction_count_last_24h: 4,
        previous_failed_transactions: 1,
        merchant_name: 'Flipkart India',
        merchant_category: 'E-Commerce',
        customer_account_age_days: 240,
        payment_method: 'Credit Card (ICICI)',
        transaction_hour: 16,
      });
    } else if (presetType === 'critical') {
      setFormData({
        customer_id: 'CUST-FRAUD-03',
        customer_name: 'Rohan Mehta',
        amount: 89500,
        customer_average_amount: 2400,
        location: 'Moscow, RU',
        usual_location: 'Mumbai, IN',
        is_new_device: true,
        transaction_count_last_24h: 8,
        previous_failed_transactions: 3,
        merchant_name: 'Apple India Store',
        merchant_category: 'Electronics',
        customer_account_age_days: 320,
        payment_method: 'Credit Card (HDFC)',
        transaction_hour: 2,
      });
    }
  };

  const handleSimulate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setIs2FAVerified(false);
    try {
      const res = await api.simulateRisk(formData);
      setResult(res);
    } catch (err) {
      console.error("Simulation error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOtpVerified = () => {
    setIs2FAVerified(true);
    setIsOtpModalOpen(false);
  };

  const formatINR = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const ratio = (formData.amount / Math.max(formData.customer_average_amount, 1)).toFixed(1);

  // Dynamic calculation of why risk changed
  const getRiskDrivers = () => {
    const drivers: { title: string; desc: string; impact: string; severity: 'low' | 'med' | 'high' }[] = [];
    const r = formData.amount / Math.max(formData.customer_average_amount, 1);
    
    if (r >= 5) {
      drivers.push({ title: 'Extreme Amount Anomaly', desc: `${r.toFixed(1)}x higher than baseline average`, impact: '+28 to +42 pts', severity: 'high' });
    } else if (r >= 2.5) {
      drivers.push({ title: 'Moderate Amount Deviation', desc: `${r.toFixed(1)}x higher than typical purchases`, impact: '+14 pts', severity: 'med' });
    }

    if (formData.location !== formData.usual_location) {
      if (formData.location === 'Moscow, RU' || formData.location === 'Lagos, NG') {
        drivers.push({ title: 'Cross-Border Location Mismatch', desc: `Flagged foreign territory (${formData.location})`, impact: '+35 pts', severity: 'high' });
      } else {
        drivers.push({ title: 'Domestic Geolocation Deviation', desc: `${formData.location} vs home ${formData.usual_location}`, impact: '+16 pts', severity: 'med' });
      }
    }

    if (formData.is_new_device) {
      drivers.push({ title: 'Unrecognized Device Hardware', desc: 'New browser/app device signature detected', impact: '+18 pts', severity: 'med' });
    }

    if (formData.transaction_hour >= 1 && formData.transaction_hour <= 5) {
      drivers.push({ title: 'Atypical Midnight Window', desc: `Initiated at ${formData.transaction_hour}:00 AM (high-fraud hour)`, impact: '+16 pts', severity: 'med' });
    }

    if (formData.transaction_count_last_24h >= 6) {
      drivers.push({ title: 'High 24h Velocity Spike', desc: `${formData.transaction_count_last_24h} transactions executed in 24 hours`, impact: '+26 pts', severity: 'high' });
    } else if (formData.transaction_count_last_24h >= 4) {
      drivers.push({ title: 'Elevated Transaction Velocity', desc: `${formData.transaction_count_last_24h} transactions in 24 hours`, impact: '+12 pts', severity: 'med' });
    }

    if (formData.previous_failed_transactions >= 3) {
      drivers.push({ title: 'Multiple Failed Auth Attempts', desc: `${formData.previous_failed_transactions} consecutive prior failures (brute-force)`, impact: '+28 pts', severity: 'high' });
    } else if (formData.previous_failed_transactions > 0) {
      drivers.push({ title: 'Prior Auth Failure Detected', desc: `${formData.previous_failed_transactions} recent failure attempt`, impact: '+10 pts', severity: 'med' });
    }

    return drivers;
  };

  const riskDrivers = getRiskDrivers();

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800/90 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
              What-If Sandbox
            </span>
            <h2 className="text-lg font-bold text-white">Live Risk Simulation Engine</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Tweak transaction amount, hardware signature, location, midnight hours, and velocity to test dynamic risk scoring and Gemini explanations live.
          </p>
        </div>

        {/* 3 Presets */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-400 font-semibold mr-1">Presets:</span>
          
          {/* Preset 1: Normal */}
          <button
            type="button"
            onClick={() => applyPreset('normal')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
              activePreset === 'normal'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-sm shadow-emerald-500/10'
                : 'bg-slate-800/80 text-slate-300 hover:text-white border border-slate-700'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>1. Normal Payment (Low Risk)</span>
          </button>

          {/* Preset 2: Suspicious */}
          <button
            type="button"
            onClick={() => applyPreset('suspicious')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
              activePreset === 'suspicious'
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-sm shadow-amber-500/10'
                : 'bg-slate-800/80 text-slate-300 hover:text-white border border-slate-700'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
            <span>2. Suspicious Payment (Medium Risk)</span>
          </button>

          {/* Preset 3: Critical */}
          <button
            type="button"
            onClick={() => applyPreset('critical')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
              activePreset === 'critical'
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 shadow-sm shadow-rose-500/10'
                : 'bg-slate-800/80 text-slate-300 hover:text-white border border-slate-700'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-rose-400"></span>
            <span>3. Critical Payment (High Risk)</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Left Controls (7 cols), Right Output (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Form (7 cols) */}
        <form onSubmit={handleSimulate} className="glass-panel p-6 rounded-2xl border border-slate-800/90 lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider flex items-center space-x-2">
              <Zap className="w-4 h-4 text-blue-400" />
              <span>Input Parameters</span>
            </h3>
            <span className="text-[11px] text-slate-400 font-mono">
              Amount Ratio: <strong className={parseFloat(ratio) >= 3 ? 'text-amber-400' : 'text-slate-200'}>{ratio}x Baseline</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* 1. Transaction Amount */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Transaction Amount (INR ₹)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">₹</span>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                  className="w-full pl-7 pr-3 py-2 bg-slate-900 text-slate-100 font-mono text-xs rounded-xl border border-slate-700 focus:border-blue-500 focus:outline-none"
                  required
                />
              </div>
            </div>

            {/* 2. Customer Baseline Avg */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Customer 30-Day Baseline (INR ₹)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">₹</span>
                <input
                  type="number"
                  value={formData.customer_average_amount}
                  onChange={(e) => setFormData({ ...formData, customer_average_amount: parseFloat(e.target.value) || 100 })}
                  className="w-full pl-7 pr-3 py-2 bg-slate-900 text-slate-100 font-mono text-xs rounded-xl border border-slate-700 focus:border-blue-500 focus:outline-none"
                  required
                />
              </div>
            </div>

            {/* 3. Transaction Location */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Current Transaction Location
              </label>
              <select
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 text-slate-200 text-xs rounded-xl border border-slate-700 focus:border-blue-500 focus:outline-none"
              >
                <option value="Bengaluru, IN">Bengaluru, IN (Domestic)</option>
                <option value="Mumbai, IN">Mumbai, IN (Domestic)</option>
                <option value="Delhi NCR, IN">Delhi NCR, IN (Domestic)</option>
                <option value="Hyderabad, IN">Hyderabad, IN (Domestic)</option>
                <option value="Moscow, RU">Moscow, RU (Cross-Border / High-Risk)</option>
                <option value="Lagos, NG">Lagos, NG (Cross-Border / High-Risk)</option>
              </select>
            </div>

            {/* 4. Registered Home Location */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Customer Home Location
              </label>
              <select
                value={formData.usual_location}
                onChange={(e) => setFormData({ ...formData, usual_location: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 text-slate-200 text-xs rounded-xl border border-slate-700 focus:border-blue-500 focus:outline-none"
              >
                <option value="Bengaluru, IN">Bengaluru, IN</option>
                <option value="Mumbai, IN">Mumbai, IN</option>
                <option value="Delhi NCR, IN">Delhi NCR, IN</option>
              </select>
            </div>

            {/* 5. Transaction Hour (Time) */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold text-slate-300">
                  Transaction Time (Hour)
                </label>
                <span className="text-xs font-mono font-bold text-blue-400">
                  {formData.transaction_hour.toString().padStart(2, '0')}:00 hrs
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={23}
                value={formData.transaction_hour}
                onChange={(e) => setFormData({ ...formData, transaction_hour: parseInt(e.target.value) })}
                className="w-full accent-blue-500"
              />
              <span className="text-[10px] block mt-0.5">
                {formData.transaction_hour >= 1 && formData.transaction_hour <= 5 ? (
                  <span className="text-rose-400 font-bold">⚠️ High-Fraud Midnight Window (01:00 - 05:00 AM)</span>
                ) : (
                  <span className="text-slate-400">Standard Business Hours</span>
                )}
              </span>
            </div>

            {/* 6. Velocity (24h) */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Transactions in Last 24h
              </label>
              <input
                type="number"
                min={0}
                max={30}
                value={formData.transaction_count_last_24h}
                onChange={(e) => setFormData({ ...formData, transaction_count_last_24h: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 bg-slate-900 text-slate-100 font-mono text-xs rounded-xl border border-slate-700 focus:border-blue-500 focus:outline-none"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                {formData.transaction_count_last_24h >= 8 ? '🚨 High Velocity Burst' : 'Normal frequency: 1 to 3'}
              </span>
            </div>

            {/* 7. Prior Failed Transactions */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Prior Failed Auth Attempts
              </label>
              <input
                type="number"
                min={0}
                max={10}
                value={formData.previous_failed_transactions}
                onChange={(e) => setFormData({ ...formData, previous_failed_transactions: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 bg-slate-900 text-slate-100 font-mono text-xs rounded-xl border border-slate-700 focus:border-blue-500 focus:outline-none"
              />
            </div>

            {/* 8. Merchant Vertical */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Merchant Category
              </label>
              <select
                value={formData.merchant_category}
                onChange={(e) => setFormData({ ...formData, merchant_category: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 text-slate-200 text-xs rounded-xl border border-slate-700 focus:border-blue-500 focus:outline-none"
              >
                <option value="Food Delivery">Food Delivery (Low Risk)</option>
                <option value="E-Commerce">E-Commerce</option>
                <option value="Electronics">Electronics (High Resale)</option>
                <option value="Jewelry">Jewelry (High Resale)</option>
                <option value="Crypto Exchange">Crypto Exchange (High Risk)</option>
              </select>
            </div>

          </div>

          {/* Device Novelty Toggle */}
          <div className="pt-2 flex items-center justify-between p-3 bg-slate-900/80 rounded-xl border border-slate-800">
            <div className="flex items-center space-x-2">
              <Smartphone className={`w-4 h-4 ${formData.is_new_device ? 'text-amber-400' : 'text-slate-400'}`} />
              <div>
                <span className="text-xs font-semibold text-slate-200">Device Hardware Signature</span>
                <p className="text-[10px] text-slate-400">
                  {formData.is_new_device ? 'New / Unrecognized Hardware Signature' : 'Known / Trusted Registered Device'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, is_new_device: !formData.is_new_device })}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                formData.is_new_device
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                  : 'bg-slate-800 text-slate-400 border border-slate-700'
              }`}
            >
              {formData.is_new_device ? 'New Device' : 'Known Device'}
            </button>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-lg shadow-blue-500/25 transition disabled:opacity-50"
          >
            <Play className={`w-4 h-4 fill-white ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Evaluating Multi-Vector Risk Signals...' : 'Analyze Transaction'}</span>
          </button>
        </form>

        {/* Right Output Panel (5 cols) */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800/90 lg:col-span-5 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
              <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
                Risk Decision Output
              </h3>
              {result && (
                <span className="text-[10px] font-mono text-slate-400">
                  Dynamic Deterministic Calculation
                </span>
              )}
            </div>

            {!result ? (
              <div className="h-80 flex flex-col items-center justify-center text-center p-6 border border-dashed border-slate-800 rounded-2xl">
                <Play className="w-10 h-10 text-slate-600 mb-3" />
                <p className="text-xs font-semibold text-slate-300">No active simulation run.</p>
                <p className="text-[11px] text-slate-500 mt-1 max-w-xs">
                  Select a preset at the top or tweak parameters on the left and click <strong>"Analyze Transaction"</strong>.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                
                {/* Score & Action Banner */}
                <div className={`p-4 rounded-2xl border flex items-center justify-between transition-all ${
                  is2FAVerified
                    ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                    : result.risk_score >= 60
                    ? 'bg-rose-500/15 border-rose-500/40 text-rose-300'
                    : result.risk_score >= 30
                    ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                    : 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                }`}>
                  <div>
                    <span className="text-[10px] uppercase tracking-wider font-bold opacity-80">Risk Score</span>
                    <div className="text-3xl font-extrabold font-mono mt-0.5">
                      {result.risk_score} <span className="text-sm font-normal opacity-70">/ 100</span>
                    </div>
                    <div className="text-xs font-bold mt-1">Level: {result.risk_level} RISK</div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] uppercase tracking-wider font-bold opacity-80">Gateway Decision</span>
                    <div className="text-sm sm:text-base font-extrabold font-mono mt-1">
                      {is2FAVerified ? 'APPROVED (2FA Verified)' : result.recommended_action}
                    </div>
                    {is2FAVerified && (
                      <span className="text-[10px] text-emerald-400 font-bold flex items-center justify-end space-x-1 mt-0.5">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>OTP Challenge Passed</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Step-Up Auth Action Trigger (If Medium Risk) */}
                {result.recommended_action === 'STEP-UP AUTHENTICATION' && !is2FAVerified && (
                  <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-amber-400 flex items-center space-x-1.5">
                        <KeyRound className="w-3.5 h-3.5" />
                        <span>Step-Up 2FA Challenge Triggered</span>
                      </span>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Simulate the customer OTP verification flow
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsOtpModalOpen(true)}
                      className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg text-xs font-bold shadow-md shadow-amber-500/20 transition flex items-center space-x-1"
                    >
                      <span>Verify OTP</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {/* Why Risk Changed (Signal Breakdown) */}
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1">
                    <span>Why the Risk Score Changed</span>
                  </span>
                  
                  {riskDrivers.length === 0 ? (
                    <div className="text-xs text-emerald-400 bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-500/20 flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>All parameters align with customer historical baseline. Zero anomaly penalty.</span>
                    </div>
                  ) : (
                    <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                      {riskDrivers.map((d, idx) => (
                        <div key={idx} className="p-2 bg-slate-900/90 border border-slate-800 rounded-xl text-xs flex justify-between items-center">
                          <div>
                            <span className="font-semibold text-slate-200">{d.title}</span>
                            <p className="text-[10px] text-slate-400">{d.desc}</p>
                          </div>
                          <span className="font-mono font-bold text-blue-400 text-xs shrink-0 ml-2">
                            {d.impact}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Gemini AI Explanation */}
                {result.ai_explanation && (
                  <div className="p-3.5 bg-gradient-to-r from-blue-950/40 via-purple-950/20 to-slate-900 border border-blue-500/30 rounded-xl space-y-1.5">
                    <div className="flex items-center space-x-1.5 text-blue-400 text-xs font-bold">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Gemini Explainable AI Rationale:</span>
                    </div>
                    <p className="text-xs text-slate-200 leading-relaxed">
                      {result.ai_explanation}
                    </p>
                  </div>
                )}

              </div>
            )}
          </div>

          <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-800 flex items-center justify-between">
            <span>Deterministic Math + Gemini Grounded Explanation</span>
            <span className="font-mono text-slate-400">&lt;10ms Scoring</span>
          </div>
        </div>

      </div>

      {/* Step-Up Auth Demo Modal */}
      {result && (
        <StepUpAuthModal
          isOpen={isOtpModalOpen}
          onClose={() => setIsOtpModalOpen(false)}
          onSuccess={handleOtpVerified}
          transactionId={result.transaction_id}
          amount={formData.amount}
          riskScore={result.risk_score}
          reason={result.anomalies_detected.length > 0 ? result.anomalies_detected.join('; ') : 'Medium risk threshold exceeded.'}
        />
      )}

    </div>
  );
};
