import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, BarChart, Bar, Cell } from 'recharts';
import { DashboardStats } from '../types';

interface RiskChartsProps {
  stats: DashboardStats | null;
}

export const RiskCharts: React.FC<RiskChartsProps> = ({ stats }) => {
  if (!stats) return null;

  const riskDistData = [
    { name: 'Low (0-29)', count: stats.risk_level_distribution.LOW, color: '#10B981', action: 'Auto-Approve' },
    { name: 'Med (30-59)', count: stats.risk_level_distribution.MEDIUM, color: '#F59E0B', action: 'Step-Up 2FA' },
    { name: 'High (60-79)', count: stats.risk_level_distribution.HIGH, color: '#F97316', action: 'Manual Review' },
    { name: 'Critical (80+)', count: stats.risk_level_distribution.CRITICAL, color: '#EF4444', action: 'Hard Block' },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      
      {/* 1. 24-Hour Transaction & Risk Temporal Distribution */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800/90 lg:col-span-2 flex flex-col justify-between">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider flex items-center space-x-2">
              <span>Temporal Risk Distribution</span>
              <span className="text-[10px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded border border-blue-500/20 font-mono">
                24H Window
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Identifies nocturnal velocity spikes and midnight fraud clusters (01:00 - 05:00 AM)
            </p>
          </div>
          <div className="flex items-center space-x-3 text-xs">
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-blue-500"></span>
              <span className="text-slate-400">Total Volume</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-rose-500"></span>
              <span className="text-slate-400">High-Risk (Score ≥ 60)</span>
            </div>
          </div>
        </div>

        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={stats.hourly_distribution} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
              <defs>
                <linearGradient id="totalGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.0}/>
                </linearGradient>
                <linearGradient id="riskGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EF4444" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#EF4444" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="hour" stroke="#64748B" fontSize={11} tickLine={false} />
              <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '0.75rem', fontSize: '12px' }}
                itemStyle={{ color: '#E2E8F0' }}
              />
              <Area type="monotone" dataKey="total" stroke="#3B82F6" strokeWidth={2} fillOpacity={1} fill="url(#totalGrad)" />
              <Area type="monotone" dataKey="high_risk" stroke="#EF4444" strokeWidth={2} fillOpacity={1} fill="url(#riskGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. Risk Classification Distribution */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800/90 flex flex-col justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
            Risk Tier Breakdown
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Automated routing by deterministic safety thresholds
          </p>
        </div>

        <div className="h-44 w-full my-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={riskDistData} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <XAxis type="number" stroke="#64748B" fontSize={10} hide />
              <YAxis type="category" dataKey="name" stroke="#94A3B8" fontSize={11} tickLine={false} width={85} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '0.75rem', fontSize: '12px' }}
                itemStyle={{ color: '#E2E8F0' }}
              />
              <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                {riskDistData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80 text-[11px]">
          {riskDistData.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between px-2 py-1 rounded bg-slate-900/60 border border-slate-800">
              <span className="text-slate-300 font-medium">{item.name.split(' ')[0]}</span>
              <span className="font-mono font-bold" style={{ color: item.color }}>{item.count}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
