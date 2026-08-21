import React, { useState } from 'react';
import { X, Sparkles, AlertTriangle, ShieldCheck, ShieldX, CheckCircle, Clock, MapPin, Smartphone, User, Store, ArrowRight, ShieldAlert, Cpu } from 'lucide-react';
import { Transaction } from '../types';
import { api } from '../services/api';

interface TransactionDetailModalProps {
  transaction: Transaction | null;
  onClose: () => void;
  onUpdateExplanation?: (txId: string, explanation: string) => void;
}

export const TransactionDetailModal: React.FC<TransactionDetailModalProps> = ({
  transaction,
  onClose,
  onUpdateExplanation,
}) => {
  const [loadingAI, setLoadingAI] = useState(false);
  const [explanation, setExplanation] = useState<string | null>(transaction?.ai_explanation || null);

  if (!transaction) return null;

  const handleGenerateExplanation = async (forceRefresh: boolean = false) => {
    setLoadingAI(true);
    try {
      const res = await api.explainTransaction(transaction.transaction_id, forceRefresh);
      setExplanation(res.explanation);
      if (onUpdateExplanation) {
        onUpdateExplanation(transaction.transaction_id, res.explanation);
      }
    } catch (err) {
      console.error("Failed to generate AI explanation:", err);
    } finally {
      setLoadingAI(false);
    }
  };

  const formatINR = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(val);
  };

  const getDecisionDisplay = (decision: string) => {
    switch (decision) {
      case 'APPROVE':
        return { text: 'APPROVE', color: 'text-emerald-400', sub: 'Auto-Cleared' };
      case 'REVIEW':
        return { text: 'REVIEW', color: 'text-orange-400', sub: 'Manual Queue' };
      case 'ADDITIONAL_AUTHENTICATION':
      case 'STEP-UP AUTHENTICATION':
        return { text: 'STEP-UP 2FA', color: 'text-amber-400', sub: 'OTP Challenge' };
      case 'BLOCK':
        return { text: 'BLOCK', color: 'text-rose-400', sub: 'Zero-Loss Rule' };
      default:
        return { text: decision, color: 'text-slate-300', sub: 'Deterministic' };
    }
  };

  const ratio = (transaction.amount / Math.max(transaction.customer_average_amount, 1)).toFixed(1);
  const decisionInfo = getDecisionDisplay(transaction.decision);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-[#111827] border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center space-x-3">
            <div className={`p-2.5 rounded-xl ${
              transaction.risk_score >= 80 ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30' :
              transaction.risk_score >= 60 ? 'bg-orange-500/15 text-orange-400 border border-orange-500/30' :
              transaction.risk_score >= 30 ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30' :
              'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
            }`}>
              {transaction.risk_score >= 80 ? <ShieldX className="w-6 h-6" /> :
               transaction.risk_score >= 60 ? <AlertTriangle className="w-6 h-6" /> :
               <ShieldCheck className="w-6 h-6" />}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-bold text-white font-mono">{transaction.transaction_id}</h3>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700">
                  Risk: {transaction.risk_score}/100 ({transaction.risk_level})
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">{transaction.timestamp}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-5 overflow-y-auto space-y-5 text-xs text-slate-300">
          
          {/* Key Overview Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 flex flex-col justify-between overflow-hidden">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Amount</span>
              <div className="text-sm font-bold text-white font-mono mt-0.5">{formatINR(transaction.amount)}</div>
              <div className="text-[10px] text-slate-400 mt-0.5">{ratio}x 30d Avg</div>
            </div>

            <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 flex flex-col justify-between overflow-hidden">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Gateway Action</span>
              <div className={`text-xs sm:text-sm font-bold font-mono mt-0.5 truncate ${decisionInfo.color}`} title={transaction.decision}>
                {decisionInfo.text}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5 truncate">{decisionInfo.sub}</div>
            </div>

            <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 flex flex-col justify-between overflow-hidden">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Velocity (24h)</span>
              <div className="text-sm font-bold text-white font-mono mt-0.5">{transaction.transaction_count_last_24h} Txns</div>
              <div className="text-[10px] text-slate-400 mt-0.5 truncate">Fails: {transaction.previous_failed_transactions}</div>
            </div>

            <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 flex flex-col justify-between overflow-hidden">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Payment Rail</span>
              <div className="text-sm font-bold text-slate-200 mt-0.5 truncate">{transaction.payment_method.split(' ')[0]}</div>
              <div className="text-[10px] text-slate-400 mt-0.5 truncate">{transaction.merchant_category}</div>
            </div>
          </div>

          {/* Customer & Merchant Telemetry */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 bg-slate-900/60 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center space-x-2 text-slate-200 font-semibold border-b border-slate-800/80 pb-1.5">
                <User className="w-4 h-4 text-blue-400" />
                <span>Customer Profile</span>
              </div>
              <div className="space-y-1 text-slate-300">
                <div className="flex justify-between"><span className="text-slate-400">Name:</span> <span className="font-semibold">{transaction.customer_name}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Customer ID:</span> <span className="font-mono">{transaction.customer_id}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Account Age:</span> <span>{transaction.customer_account_age_days} days</span></div>
                <div className="flex justify-between"><span className="text-slate-400">30d Avg Amount:</span> <span className="font-mono">{formatINR(transaction.customer_average_amount)}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Home Location:</span> <span>{transaction.usual_location}</span></div>
              </div>
            </div>

            <div className="p-3.5 bg-slate-900/60 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center space-x-2 text-slate-200 font-semibold border-b border-slate-800/80 pb-1.5">
                <Store className="w-4 h-4 text-emerald-400" />
                <span>Device & Session Environment</span>
              </div>
              <div className="space-y-1 text-slate-300">
                <div className="flex justify-between"><span className="text-slate-400">Merchant:</span> <span className="font-semibold">{transaction.merchant_name}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">TX Location:</span> <span className={transaction.location !== transaction.usual_location ? 'text-rose-400 font-bold' : ''}>{transaction.location}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Device Hardware:</span> <span className={transaction.is_new_device ? 'text-orange-400 font-bold' : ''}>{transaction.is_new_device ? 'New Device' : 'Known Device'}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Device ID:</span> <span className="font-mono">{transaction.device_id}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Recent Auth Fails:</span> <span className="font-mono">{transaction.previous_failed_transactions}</span></div>
              </div>
            </div>
          </div>

          {/* Itemized Deterministic Risk Factors */}
          <div>
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
              <Cpu className="w-3.5 h-3.5 text-blue-400" />
              <span>Deterministic Factor Breakdown</span>
            </h4>
            <div className="space-y-2">
              {transaction.risk_factors.length === 0 ? (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>No behavioral anomalies detected. Transaction fits within established baselines.</span>
                </div>
              ) : (
                transaction.risk_factors.map((factor, idx) => (
                  <div key={idx} className="p-3 bg-slate-900/90 border border-slate-800 rounded-xl flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-slate-200">{factor.factor_name}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.2 rounded ${
                          factor.severity === 'CRITICAL' ? 'bg-rose-500/20 text-rose-400' :
                          factor.severity === 'HIGH' ? 'bg-orange-500/20 text-orange-400' :
                          factor.severity === 'MEDIUM' ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-700 text-slate-300'
                        }`}>
                          {factor.severity}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">{factor.description}</p>
                    </div>
                    <span className="text-xs font-mono font-bold text-blue-400 shrink-0 ml-2">
                      +{factor.score_contribution.toFixed(0)} pts
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* AI-Generated Explanation Section */}
          <div className="p-4 bg-gradient-to-r from-blue-950/40 via-purple-950/30 to-slate-900/80 border border-blue-500/30 rounded-2xl relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-blue-400" />
                <h4 className="text-xs font-bold text-blue-200 uppercase tracking-wider">
                  Explainable AI Narrative (Google Gemini)
                </h4>
              </div>
              
              {!explanation && (
                <button
                  onClick={() => handleGenerateExplanation(false)}
                  disabled={loadingAI}
                  className="flex items-center space-x-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold shadow-lg shadow-blue-500/20 transition disabled:opacity-50"
                >
                  <Sparkles className={`w-3.5 h-3.5 ${loadingAI ? 'animate-spin' : ''}`} />
                  <span>{loadingAI ? 'Analyzing with Gemini...' : 'Explain Decision'}</span>
                </button>
              )}
            </div>

            {explanation ? (
              <div className="space-y-2">
                <p className="text-xs text-slate-200 leading-relaxed bg-slate-900/60 p-3 rounded-xl border border-blue-500/20">
                  {explanation}
                </p>
                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                  <span>Grounded strictly on computed risk telemetry (Zero Hallucination)</span>
                  <button 
                    onClick={() => handleGenerateExplanation(true)}
                    disabled={loadingAI}
                    className="text-blue-400 hover:text-blue-300 hover:underline flex items-center space-x-1 disabled:opacity-50"
                  >
                    <Sparkles className={`w-3 h-3 ${loadingAI ? 'animate-spin text-blue-400' : ''}`} />
                    <span>{loadingAI ? 'Regenerating...' : 'Regenerate explanation'}</span>
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">
                Click "Explain Decision" to generate a natural language explanation grounded on this transaction's mathematical risk signals.
              </p>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/80 flex items-center justify-between">
          <div className="text-[11px] text-slate-400">
            System Recommendation: <strong className="text-white">{transaction.decision}</strong>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition"
          >
            Close Inspector
          </button>
        </div>

      </div>
    </div>
  );
};
