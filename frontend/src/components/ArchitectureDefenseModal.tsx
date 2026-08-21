import React from 'react';
import { Shield, Cpu, Sparkles, Server, CheckCircle2, Lock, Scale, Zap, FileCode, Layers } from 'lucide-react';

interface ArchitectureDefenseModalProps {
  onClose: () => void;
}

export const ArchitectureDefenseModal: React.FC<ArchitectureDefenseModalProps> = ({ onClose }) => {
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800/90 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 rounded-xl text-emerald-400">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">System Architecture & Technical Specifications</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Technical design specifications for the hybrid deterministic + explainable AI architecture
            </p>
          </div>
        </div>
        <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full text-xs font-mono font-bold">
          Production Specifications
        </div>
      </div>

      {/* 1. The Decision Pipeline Flowchart */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800/90 space-y-4">
        <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider flex items-center space-x-2">
          <Zap className="w-4 h-4 text-blue-400" />
          <span>End-to-End Decision Pipeline</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-center">
          
          {/* Step 1 */}
          <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl flex flex-col justify-between">
            <div className="text-[10px] text-blue-400 font-mono font-bold uppercase mb-1">Step 1</div>
            <div className="font-bold text-white text-xs">Payment Telemetry</div>
            <p className="text-[11px] text-slate-400 mt-1">Amount, Device, IP, Location, Velocity, Prior Fails</p>
            <div className="text-[10px] text-emerald-400 font-mono mt-2">&lt;2ms Ingestion</div>
          </div>

          {/* Step 2 */}
          <div className="p-4 bg-blue-950/30 border border-blue-500/30 rounded-xl flex flex-col justify-between">
            <div className="text-[10px] text-blue-400 font-mono font-bold uppercase mb-1">Step 2</div>
            <div className="font-bold text-blue-200 text-xs">Deterministic Rules Engine</div>
            <p className="text-[11px] text-slate-400 mt-1">Mathematical anomaly weights & hard overrides</p>
            <div className="text-[10px] text-blue-400 font-mono mt-2">&lt;5ms Computation</div>
          </div>

          {/* Step 3 */}
          <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl flex flex-col justify-between">
            <div className="text-[10px] text-blue-400 font-mono font-bold uppercase mb-1">Step 3</div>
            <div className="font-bold text-white text-xs">Score & Action Matrix</div>
            <p className="text-[11px] text-slate-400 mt-1">Score: 0-100<br/>Approve / Step-Up 2FA / Block</p>
            <div className="text-[10px] text-emerald-400 font-mono mt-2">Zero Ambiguity</div>
          </div>

          {/* Step 4 */}
          <div className="p-4 bg-purple-950/30 border border-purple-500/30 rounded-xl flex flex-col justify-between">
            <div className="text-[10px] text-purple-400 font-mono font-bold uppercase mb-1">Step 4</div>
            <div className="font-bold text-purple-200 text-xs">Gemini Explainable AI</div>
            <p className="text-[11px] text-slate-400 mt-1">Grounded narrative for fraud operations & audit</p>
            <div className="text-[10px] text-purple-400 font-mono mt-2">Zero Hallucination</div>
          </div>

          {/* Step 5 */}
          <div className="p-4 bg-emerald-950/30 border border-emerald-500/30 rounded-xl flex flex-col justify-between">
            <div className="text-[10px] text-emerald-400 font-mono font-bold uppercase mb-1">Step 5</div>
            <div className="font-bold text-emerald-200 text-xs">Gateway Execution</div>
            <p className="text-[11px] text-slate-400 mt-1">Instant authorization or 2FA step-up trigger</p>
            <div className="text-[10px] text-emerald-400 font-mono mt-2">Sub-15ms Latency</div>
          </div>

        </div>
      </div>

      {/* 2. Technical Architecture & Engineering Q&A */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Question 1 */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-2">
          <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center space-x-1.5">
            <Shield className="w-4 h-4" />
            <span>Why not use pure LLMs for payment approval?</span>
          </h4>
          <p className="text-xs text-slate-300 leading-relaxed">
            In high-throughput financial payment gateways, pure LLMs cannot be the primary gatekeeper because:
            1) <strong>Latency:</strong> Gateways require sub-50ms roundtrip decisions, whereas LLM inference takes 400-1200ms.
            2) <strong>Determinism & Auditability:</strong> Financial compliance requires 100% reproducible and explainable reasons for declining transactions.
            3) <strong>Cost & Reliability:</strong> LLMs hallucinate and can fail under burst traffic.
          </p>
        </div>

        {/* Question 2 */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-2">
          <h4 className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center space-x-1.5">
            <Sparkles className="w-4 h-4" />
            <span>What role does Google Gemini play in PayGuard AI?</span>
          </h4>
          <p className="text-xs text-slate-300 leading-relaxed">
            Gemini is decoupled from the blocking path and powers:
            1) <strong>Explainable AI Narratives:</strong> Translating complex multi-variable mathematical signals into plain-English justifications for merchant dispute portals and fraud analysts.
            2) <strong>AI Risk Analyst:</strong> Natural language query agent enabling risk teams to investigate anomalies across millions of records without writing SQL queries.
          </p>
        </div>

        {/* Question 3 */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-2">
          <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center space-x-1.5">
            <Scale className="w-4 h-4" />
            <span>How does this scale to 50,000+ TPS high-throughput loads?</span>
          </h4>
          <p className="text-xs text-slate-300 leading-relaxed">
            The deterministic engine runs in-memory with pre-computed customer baselines (stored in Redis). The LLM explanation is invoked <strong>asynchronously via worker queues</strong> or on-demand when a fraud analyst opens the dashboard, ensuring <strong>zero impact on live payment throughput</strong>.
          </p>
        </div>

        {/* Question 4 */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-2">
          <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center space-x-1.5">
            <Lock className="w-4 h-4" />
            <span>How do you guarantee Zero Hallucination?</span>
          </h4>
          <p className="text-xs text-slate-300 leading-relaxed">
            The Gemini prompt is strictly constrained with structured JSON ground truth containing the pre-calculated risk score, exact anomaly flags, and historical baselines. The system prompt explicitly forbids inventing transaction attributes and includes deterministic fallback templates.
          </p>
        </div>

      </div>

    </div>
  );
};
