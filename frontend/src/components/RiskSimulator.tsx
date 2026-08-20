import React, { useState } from 'react';
import { Play, Sparkles, AlertTriangle, ShieldCheck, ShieldX, RefreshCw, Smartphone, MapPin, Clock, DollarSign, Zap } from 'lucide-react';
import { SimulationRequest, SimulationResponse } from '../types';
import { api } from '../services/api';

export const RiskSimulator: React.FC = () => {
  const [formData, setFormData] = useState<SimulationRequest>({
    customer_id: 'CUST-DEMO-01',
    customer_name: 'Aditya Sharma',
    amount: 3200,
    customer_average_amount: 2500,
    location: 'Mumbai, IN',
    usual_location: 'Mumbai, IN',
    is_new_device: false,
    transaction_count_last_24h: 2,
    previous_failed_transactions: 0,
    merchant_name: 'Flipkart India',
    merchant_category: 'E-Commerce',
    customer_account_age_days: 365,
    payment_method: 'UPI (GooglePay)',
    transaction_hour: 14,
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SimulationResponse | null>(null);

  const applyPreset = (presetType: 'safe' | 'takeover' | 'velocity' | 'crossborder') => {
    if (presetType === 'safe') {
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
    } else if (presetType === 'takeover') {
      setFormData({
        customer_id: 'CUST-VICTIM-02',
        customer_name: 'Rohan Mehta',
        amount: 88500,
        customer_average_amount: 2800,
        location: 'Moscow, RU',
        usual_location: 'Mumbai, IN',
        is_new_device: true,
        transaction_count_last_24h: 3,
        previous_failed_transactions: 2,
        merchant_name: 'Apple India Store',
        merchant_category: 'Electronics',
        customer_account_age_days: 320,
        payment_method: 'Credit Card (HDFC)',
        transaction_hour: 2,
      });
    } else if (presetType === 'velocity') {
      setFormData({
        customer_id: 'CUST-BOT-03',
        customer_name: 'Ananya Iyer',
        amount: 54000,
        customer_average_amount: 3500,
        location: 'Bengaluru, IN',
        usual_location: 'Bengaluru, IN',
        is_new_device: true,
        transaction_count_last_24h: 11,
        previous_failed_transactions: 3,
        merchant_name: 'WazirX India',
        merchant_category: 'Crypto Exchange',
        customer_account_age_days: 14,
        payment_method: 'Net Banking (Axis)',
        transaction_hour: 3,
      });
    } else if (presetType === 'crossborder') {
      setFormData({
        customer_id: 'CUST-TRAVEL-04',
        customer_name: 'Priya Nair',
        amount: 42000,
        customer_average_amount: 3000,
        location: 'Lagos, NG',
        usual_location: 'Delhi NCR, IN',
        is_new_device: true,
        transaction_count_last_24h: 4,
        previous_failed_transactions: 1,
        merchant_name: 'Tanishq Jewellery',
        merchant_category: 'Jewelry',
        customer_account_age_days: 200,
        payment_method: 'Credit Card (ICICI)',
        transaction_hour: 4,
      });
    }
  };

  const handleSimulate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.simulateRisk(formData);
      setResult(res);
    } catch (err) {
      console.error("Simulation error:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatINR = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800/90 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
              Interactive Test Bench
            </span>
            <h2 className="text-lg font-bold text-white">Live Risk Simulation Sandbox</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Input arbitrary transaction parameters and test how deterministic anomaly thresholds and Gemini AI explainability react in real-time.
          </p>
        </div>

        {/* Demo Presets */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-400 font-semibold mr-1">Demo Scenarios:</span>
          <button
            type="button"
            onClick={() => applyPreset('safe')}
            className="px-2.5 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold transition"
          >
            Safe Swiggy ₹450
          </button>
          <button
            type="button"
            onClick={() => applyPreset('takeover')}
            className="px-2.5 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-bold transition"
          >
            Midnight Takeover ₹88.5k
          </button>
          <button
            type="button"
            onClick={() => applyPreset('velocity')}
            className="px-2.5 py-1.5 rounded-lg bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border border-orange-500/30 text-xs font-bold transition"
          >
            Bot Velocity Crypto
          </button>
        </div>
      </div>

      {/* Main Grid: Form Left, Real-Time Result Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Form (7 cols) */}
        <form onSubmit={handleSimulate} className="glass-panel p-6 rounded-2xl border border-slate-800/90 lg:col-span-7 space-y-4">
          <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider flex items-center space-x-2">
            <Zap className="w-4 h-4 text-blue-400" />
            <span>Transaction Parameters</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Amount */}
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

            {/* Customer Baseline Avg */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Customer 30-Day Avg (INR ₹)
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

            {/* Current Location */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Current Transaction Location
              </label>
              <select
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 text-slate-200 text-xs rounded-xl border border-slate-700 focus:border-blue-500 focus:outline-none"
              >
                <option value="Mumbai, IN">Mumbai, IN (Domestic)</option>
                <option value="Bengaluru, IN">Bengaluru, IN (Domestic)</option>
                <option value="Delhi NCR, IN">Delhi NCR, IN (Domestic)</option>
                <option value="Hyderabad, IN">Hyderabad, IN (Domestic)</option>
                <option value="Moscow, RU">Moscow, RU (High-Risk Cross-Border)</option>
                <option value="Lagos, NG">Lagos, NG (High-Risk Cross-Border)</option>
              </select>
            </div>

            {/* Registered Home Location */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Registered Home Location
              </label>
              <select
                value={formData.usual_location}
                onChange={(e) => setFormData({ ...formData, usual_location: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 text-slate-200 text-xs rounded-xl border border-slate-700 focus:border-blue-500 focus:outline-none"
              >
                <option value="Mumbai, IN">Mumbai, IN</option>
                <option value="Bengaluru, IN">Bengaluru, IN</option>
                <option value="Delhi NCR, IN">Delhi NCR, IN</option>
              </select>
            </div>

            {/* Merchant Vertical */}
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
                <option value="Online Casino">Online Casino / Gaming (High Risk)</option>
              </select>
            </div>

            {/* Transaction Hour */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Transaction Hour (00 - 23 hrs)
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="range"
                  min={0}
                  max={23}
                  value={formData.transaction_hour}
                  onChange={(e) => setFormData({ ...formData, transaction_hour: parseInt(e.target.value) })}
                  className="w-full accent-blue-500"
                />
                <span className="text-xs font-mono font-bold text-blue-400 w-12 text-right">
                  {formData.transaction_hour.toString().padStart(2, '0')}:00
                </span>
              </div>
              <span className="text-[10px] text-slate-400">
                {formData.transaction_hour >= 1 && formData.transaction_hour <= 5 ? (
                  <span className="text-rose-400 font-bold">⚠️ High-Fraud Midnight Window</span>
                ) : 'Normal Business Hours'}
              </span>
            </div>

            {/* Velocity (24h) */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                24-Hour Velocity (Txn Count)
              </label>
              <input
                type="number"
                min={0}
                max={30}
                value={formData.transaction_count_last_24h}
                onChange={(e) => setFormData({ ...formData, transaction_count_last_24h: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 bg-slate-900 text-slate-100 font-mono text-xs rounded-xl border border-slate-700 focus:border-blue-500 focus:outline-none"
              />
            </div>

            {/* Prior Failed Attempts */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Consecutive Prior Auth Failures
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

          </div>

          {/* New Device Toggle */}
          <div className="pt-2 flex items-center justify-between p-3 bg-slate-900/80 rounded-xl border border-slate-800">
            <div className="flex items-center space-x-2">
              <Smartphone className={`w-4 h-4 ${formData.is_new_device ? 'text-orange-400' : 'text-slate-400'}`} />
              <div>
                <span className="text-xs font-semibold text-slate-200">New / Unrecognized Device Hardware</span>
                <p className="text-[10px] text-slate-400">First-time browser/app hardware fingerprint</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={formData.is_new_device}
              onChange={(e) => setFormData({ ...formData, is_new_device: e.target.checked })}
              className="w-4 h-4 accent-blue-500 cursor-pointer"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-lg shadow-blue-500/25 transition disabled:opacity-50"
          >
            <Play className={`w-4 h-4 fill-white ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Evaluating Risk Signals...' : 'Analyze Transaction'}</span>
          </button>
        </form>

        {/* Right Output Panel (5 cols) */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800/90 lg:col-span-5 flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider mb-3">
              Risk Decision Output
            </h3>

            {!result ? (
              <div className="h-72 flex flex-col items-center justify-center text-center p-6 border border-dashed border-slate-800 rounded-2xl">
                <Play className="w-10 h-10 text-slate-600 mb-3" />
                <p className="text-xs font-semibold text-slate-400">No active simulation run.</p>
                <p className="text-[11px] text-slate-500 mt-1">
                  Adjust parameters on the left and click <strong>"Analyze Transaction"</strong> or click a preset above.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                
                {/* Score Banner */}
                <div className={`p-4 rounded-2xl border flex items-center justify-between ${
                  result.risk_score >= 80 ? 'bg-rose-500/15 border-rose-500/40 text-rose-300' :
                  result.risk_score >= 60 ? 'bg-orange-500/15 border-orange-500/40 text-orange-300' :
                  result.risk_score >= 30 ? 'bg-amber-500/15 border-amber-500/40 text-amber-300' :
                  'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                }`}>
                  <div>
                    <span className="text-[10px] uppercase tracking-wider font-bold opacity-80">Deterministic Risk Score</span>
                    <div className="text-3xl font-extrabold font-mono mt-0.5">
                      {result.risk_score} <span className="text-sm font-normal opacity-70">/ 100</span>
                    </div>
                    <div className="text-xs font-bold mt-1">Level: {result.risk_level}</div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] uppercase tracking-wider font-bold opacity-80">Gateway Decision</span>
                    <div className="text-lg font-extrabold font-mono mt-1">
                      {result.recommended_action}
                    </div>
                  </div>
                </div>

                {/* Factor Breakdown */}
                <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Triggered Risk Signals</span>
                  {result.risk_factors.length === 0 ? (
                    <div className="text-xs text-emerald-400 bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-500/20">
                      ✓ No anomalies detected. Clear transaction.
                    </div>
                  ) : (
                    result.risk_factors.map((f, idx) => (
                      <div key={idx} className="p-2.5 bg-slate-900/90 border border-slate-800 rounded-xl text-xs flex justify-between items-center">
                        <span className="text-slate-300 font-medium">{f.factor_name}</span>
                        <span className="font-mono font-bold text-blue-400">+{f.score_contribution.toFixed(0)}</span>
                      </div>
                    ))
                  )}
                </div>

                {/* AI Explanation Box */}
                {result.ai_explanation && (
                  <div className="p-3.5 bg-gradient-to-r from-blue-950/40 to-slate-900 border border-blue-500/30 rounded-xl space-y-1.5">
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

          <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-800">
            Simulated transactions are logged into the audit ledger for compliance verification.
          </div>
        </div>

      </div>
    </div>
  );
};
