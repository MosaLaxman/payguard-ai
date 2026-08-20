import React from 'react';
import { ShieldCheck, AlertTriangle, ShieldX, Activity, DollarSign, TrendingUp } from 'lucide-react';
import { DashboardStats } from '../types';

interface StatsCardsProps {
  stats: DashboardStats | null;
  loading: boolean;
}

export const StatsCards: React.FC<StatsCardsProps> = ({ stats, loading }) => {
  if (loading || !stats) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="glass-panel p-4 rounded-xl animate-pulse h-28 border border-slate-800">
            <div className="h-4 bg-slate-800 rounded w-1/2 mb-3"></div>
            <div className="h-7 bg-slate-800 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  const formatINR = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 sm:gap-4">
      
      {/* 1. Total Volume */}
      <div className="glass-panel p-4 rounded-xl border border-slate-800/90 hover:border-blue-500/30 transition-all group">
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">Total Volume</span>
          <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400">
            <DollarSign className="w-4 h-4" />
          </div>
        </div>
        <div className="text-lg sm:text-xl font-extrabold text-white font-mono tracking-tight">
          {formatINR(stats.total_volume_inr)}
        </div>
        <div className="text-[11px] text-slate-400 mt-1 flex items-center space-x-1">
          <span className="font-medium text-slate-300">{stats.total_transactions}</span>
          <span>transactions</span>
        </div>
      </div>

      {/* 2. Approved */}
      <div className="glass-panel p-4 rounded-xl border border-slate-800/90 hover:border-emerald-500/30 transition-all group">
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">Approved</span>
          <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
          </div>
        </div>
        <div className="text-xl font-extrabold text-emerald-400 font-mono tracking-tight">
          {stats.approved_count}
        </div>
        <div className="text-[11px] text-slate-400 mt-1">
          <span className="text-emerald-400 font-semibold">
            {stats.total_transactions > 0 ? ((stats.approved_count / stats.total_transactions) * 100).toFixed(1) : 0}%
          </span>
          <span className="ml-1">auto-cleared</span>
        </div>
      </div>

      {/* 3. Under Review / 2FA */}
      <div className="glass-panel p-4 rounded-xl border border-slate-800/90 hover:border-amber-500/30 transition-all group">
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">Under Review</span>
          <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>
        <div className="text-xl font-extrabold text-amber-400 font-mono tracking-tight">
          {stats.review_count}
        </div>
        <div className="text-[11px] text-slate-400 mt-1">
          <span className="text-amber-400 font-semibold">Step-Up Auth / 2FA</span>
        </div>
      </div>

      {/* 4. Blocked */}
      <div className="glass-panel p-4 rounded-xl border border-slate-800/90 hover:border-rose-500/30 transition-all group">
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">Blocked</span>
          <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400">
            <ShieldX className="w-4 h-4" />
          </div>
        </div>
        <div className="text-xl font-extrabold text-rose-400 font-mono tracking-tight">
          {stats.blocked_count}
        </div>
        <div className="text-[11px] text-rose-400/90 mt-1 font-medium">
          Zero-Loss Protection
        </div>
      </div>

      {/* 5. Avg Risk Score */}
      <div className="glass-panel p-4 rounded-xl border border-slate-800/90 hover:border-indigo-500/30 transition-all group">
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">Avg Risk Score</span>
          <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
            <Activity className="w-4 h-4" />
          </div>
        </div>
        <div className="text-xl font-extrabold text-indigo-400 font-mono tracking-tight">
          {stats.average_risk_score} <span className="text-xs text-slate-400 font-normal">/100</span>
        </div>
        <div className="text-[11px] text-slate-400 mt-1">
          <span>Weighted Portfolio Risk</span>
        </div>
      </div>

      {/* 6. High Risk Anomaly Rate */}
      <div className="glass-panel p-4 rounded-xl border border-slate-800/90 hover:border-purple-500/30 transition-all group">
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">Anomaly Rate</span>
          <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
        <div className="text-xl font-extrabold text-purple-400 font-mono tracking-tight">
          {stats.high_risk_rate_percent}%
        </div>
        <div className="text-[11px] text-slate-400 mt-1">
          <span>Score ≥ 60 Anomalies</span>
        </div>
      </div>

    </div>
  );
};
