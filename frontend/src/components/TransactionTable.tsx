import React, { useState } from 'react';
import { Search, Filter, AlertOctagon, Sparkles, ChevronRight, Smartphone, MapPin, CreditCard, Clock } from 'lucide-react';
import { Transaction } from '../types';

interface TransactionTableProps {
  transactions: Transaction[];
  loading: boolean;
  onSelectTransaction: (tx: Transaction) => void;
  onQuickExplain: (tx: Transaction) => void;
}

export const TransactionTable: React.FC<TransactionTableProps> = ({
  transactions,
  loading,
  onSelectTransaction,
  onQuickExplain,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRisk, setSelectedRisk] = useState<string>('ALL');
  const [selectedDecision, setSelectedDecision] = useState<string>('ALL');
  const [onlySuspicious, setOnlySuspicious] = useState<boolean>(false);

  const formatINR = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(val);
  };

  const getRiskBadge = (score: number, level: string) => {
    if (score >= 80) {
      return (
        <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-400 font-mono text-xs font-bold shadow-sm shadow-rose-500/10">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping"></span>
          <span>{score} • {level}</span>
        </div>
      );
    }
    if (score >= 60) {
      return (
        <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-orange-500/15 border border-orange-500/30 text-orange-400 font-mono text-xs font-bold">
          <span className="w-1.5 h-1.5 rounded-full bg-orange-400"></span>
          <span>{score} • {level}</span>
        </div>
      );
    }
    if (score >= 30) {
      return (
        <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 font-mono text-xs font-bold">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
          <span>{score} • {level}</span>
        </div>
      );
    }
    return (
      <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-mono text-xs font-bold">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
        <span>{score} • {level}</span>
      </div>
    );
  };

  const getDecisionBadge = (decision: string) => {
    switch (decision) {
      case 'APPROVE':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">APPROVE</span>;
      case 'REVIEW':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-orange-500/10 text-orange-400 border border-orange-500/20">REVIEW</span>;
      case 'ADDITIONAL_AUTHENTICATION':
      case 'STEP-UP AUTHENTICATION':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">STEP-UP 2FA</span>;
      case 'BLOCK':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">BLOCK</span>;
      default:
        return <span>{decision}</span>;
    }
  };

  // Filter client-side for ultra-fast instant search response
  const filteredTransactions = transactions.filter((tx) => {
    if (selectedRisk !== 'ALL' && tx.risk_level !== selectedRisk) return false;
    if (selectedDecision !== 'ALL' && tx.decision !== selectedDecision) return false;
    if (onlySuspicious && tx.risk_score < 50) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      return (
        tx.transaction_id.toLowerCase().includes(q) ||
        tx.customer_name.toLowerCase().includes(q) ||
        tx.merchant_name.toLowerCase().includes(q) ||
        tx.location.toLowerCase().includes(q) ||
        tx.payment_method.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="glass-panel rounded-2xl border border-slate-800/90 overflow-hidden">
      
      {/* Table Header Controls */}
      <div className="p-4 sm:p-5 border-b border-slate-800/90 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <span>Real-Time Transaction Ledger</span>
              <span className="px-2 py-0.5 text-xs font-mono bg-blue-500/10 text-blue-400 rounded-full border border-blue-500/20">
                {filteredTransactions.length} of {transactions.length} records
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Live multi-vector anomaly scores evaluated prior to gateway authorization
            </p>
          </div>

          {/* Suspicious Toggle */}
          <button
            onClick={() => setOnlySuspicious(!onlySuspicious)}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              onlySuspicious
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 shadow-sm shadow-rose-500/10'
                : 'bg-slate-800 text-slate-400 border border-slate-700 hover:text-slate-200'
            }`}
          >
            <AlertOctagon className="w-3.5 h-3.5" />
            <span>High Anomaly Only (≥50)</span>
          </button>
        </div>

        {/* Filter Controls Row */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          
          {/* Search Bar */}
          <div className="relative sm:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by TX ID, customer, merchant, city..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-900/90 text-slate-100 placeholder-slate-500 text-xs rounded-xl border border-slate-700/80 focus:border-blue-500 focus:outline-none transition"
            />
          </div>

          {/* Risk Level Filter */}
          <div className="relative">
            <select
              value={selectedRisk}
              onChange={(e) => setSelectedRisk(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900/90 text-slate-300 text-xs rounded-xl border border-slate-700/80 focus:border-blue-500 focus:outline-none appearance-none"
            >
              <option value="ALL">All Risk Levels</option>
              <option value="LOW">Low (0-29)</option>
              <option value="MEDIUM">Medium (30-59)</option>
              <option value="HIGH">High (60-79)</option>
              <option value="CRITICAL">Critical (80+)</option>
            </select>
            <Filter className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Decision Filter */}
          <div className="relative">
            <select
              value={selectedDecision}
              onChange={(e) => setSelectedDecision(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900/90 text-slate-300 text-xs rounded-xl border border-slate-700/80 focus:border-blue-500 focus:outline-none appearance-none"
            >
              <option value="ALL">All Gateway Actions</option>
              <option value="APPROVE">Approve</option>
              <option value="STEP-UP AUTHENTICATION">Step-Up 2FA</option>
              <option value="BLOCK">Block</option>
            </select>
            <Filter className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-900/90 text-slate-400 font-semibold border-b border-slate-800">
            <tr>
              <th className="py-3 px-4">Transaction ID</th>
              <th className="py-3 px-4">Amount (INR)</th>
              <th className="py-3 px-4">Customer & Merchant</th>
              <th className="py-3 px-4">Location & Device</th>
              <th className="py-3 px-4">Risk Assessment</th>
              <th className="py-3 px-4">Decision</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-medium">
            {loading ? (
              [...Array(6)].map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td colSpan={7} className="py-4 px-4">
                    <div className="h-4 bg-slate-800 rounded w-full"></div>
                  </td>
                </tr>
              ))
            ) : filteredTransactions.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-400">
                  <AlertOctagon className="w-8 h-8 mx-auto text-slate-500 mb-2" />
                  <p className="font-semibold">No transactions match the selected filter criteria.</p>
                  <p className="text-[11px] text-slate-500 mt-1">Try clearing search filters or resetting demo data.</p>
                </td>
              </tr>
            ) : (
              filteredTransactions.map((tx) => {
                const ratio = tx.amount / Math.max(tx.customer_average_amount, 1);
                return (
                  <tr
                    key={tx.transaction_id}
                    onClick={() => onSelectTransaction(tx)}
                    className="hover:bg-slate-800/40 cursor-pointer transition group"
                  >
                    {/* ID & Time */}
                    <td className="py-3.5 px-4 font-mono">
                      <div className="text-white font-bold group-hover:text-blue-400 transition flex items-center space-x-1.5">
                        <span>{tx.transaction_id}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center space-x-1 mt-0.5">
                        <Clock className="w-3 h-3" />
                        <span>{tx.timestamp.split(' ')[1]}</span>
                      </div>
                    </td>

                    {/* Amount */}
                    <td className="py-3.5 px-4">
                      <div className="text-white font-mono font-bold text-sm">
                        {formatINR(tx.amount)}
                      </div>
                      <div className={`text-[10px] font-mono ${ratio > 3 ? 'text-rose-400 font-bold' : 'text-slate-400'}`}>
                        {ratio.toFixed(1)}x avg (₹{tx.customer_average_amount.toFixed(0)})
                      </div>
                    </td>

                    {/* Customer & Merchant */}
                    <td className="py-3.5 px-4">
                      <div className="text-slate-200 font-semibold">{tx.customer_name}</div>
                      <div className="text-[11px] text-slate-400 flex items-center space-x-1">
                        <span>{tx.merchant_name}</span>
                        <span className="text-slate-600">•</span>
                        <span className="text-slate-400">{tx.payment_method.split(' ')[0]}</span>
                      </div>
                    </td>

                    {/* Location & Device */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-1 text-slate-300">
                        <MapPin className={`w-3 h-3 ${tx.location !== tx.usual_location ? 'text-rose-400' : 'text-slate-500'}`} />
                        <span className={tx.location !== tx.usual_location ? 'text-rose-300 font-medium' : ''}>
                          {tx.location}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1 mt-0.5 text-[11px]">
                        <Smartphone className={`w-3 h-3 ${tx.is_new_device ? 'text-orange-400' : 'text-slate-500'}`} />
                        <span className={tx.is_new_device ? 'text-orange-400 font-medium' : 'text-slate-500'}>
                          {tx.is_new_device ? 'New Device' : 'Trusted Device'}
                        </span>
                      </div>
                    </td>

                    {/* Risk Score Badge */}
                    <td className="py-3.5 px-4">
                      {getRiskBadge(tx.risk_score, tx.risk_level)}
                    </td>

                    {/* Decision */}
                    <td className="py-3.5 px-4">
                      {getDecisionBadge(tx.decision)}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onQuickExplain(tx);
                          }}
                          className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-500/20 text-[11px] font-semibold transition"
                          title="Generate AI Explanation"
                        >
                          <Sparkles className="w-3 h-3 text-blue-400" />
                          <span>Explain</span>
                        </button>
                        <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-blue-400 group-hover:translate-x-0.5 transition" />
                      </div>
                    </td>

                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
};
