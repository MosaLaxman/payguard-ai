import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { StatsCards } from './components/StatsCards';
import { RiskCharts } from './components/RiskCharts';
import { TransactionTable } from './components/TransactionTable';
import { TransactionDetailModal } from './components/TransactionDetailModal';
import { RiskSimulator } from './components/RiskSimulator';
import { AIAnalystChat } from './components/AIAnalystChat';
import { ArchitectureDefenseModal } from './components/ArchitectureDefenseModal';
import { DashboardStats, Transaction } from './types';
import { api } from './services/api';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'simulator' | 'analyst' | 'architecture'>('dashboard');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isResetting, setIsResetting] = useState<boolean>(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsData, txsData] = await Promise.all([
        api.getStats(),
        api.getTransactions(),
      ]);
      setStats(statsData);
      setTransactions(txsData);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleResetData = async () => {
    setIsResetting(true);
    try {
      await api.resetData();
      await fetchData();
    } catch (err) {
      console.error("Error resetting data:", err);
    } finally {
      setIsResetting(false);
    }
  };

  const handleQuickExplain = (tx: Transaction) => {
    setSelectedTransaction(tx);
  };

  const handleUpdateExplanation = (txId: string, explanation: string) => {
    setTransactions((prev) =>
      prev.map((t) => (t.transaction_id === txId ? { ...t, ai_explanation: explanation } : t))
    );
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 flex flex-col font-sans selection:bg-blue-500 selection:text-white">
      
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onResetData={handleResetData}
        isResetting={isResetting}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {activeTab === 'dashboard' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Top KPI Metrics Banner */}
            <StatsCards stats={stats} loading={loading} />

            {/* Visual Risk Analytics Charts */}
            <RiskCharts stats={stats} />

            {/* Filterable Transaction Ledger */}
            <TransactionTable
              transactions={transactions}
              loading={loading}
              onSelectTransaction={(tx) => setSelectedTransaction(tx)}
              onQuickExplain={handleQuickExplain}
            />
          </div>
        )}

        {activeTab === 'simulator' && (
          <div className="animate-fadeIn">
            <RiskSimulator />
          </div>
        )}

        {activeTab === 'analyst' && (
          <div className="animate-fadeIn">
            <AIAnalystChat />
          </div>
        )}

        {activeTab === 'architecture' && (
          <div className="animate-fadeIn">
            <ArchitectureDefenseModal onClose={() => setActiveTab('dashboard')} />
          </div>
        )}

      </main>

      {/* Transaction Inspection Modal */}
      {selectedTransaction && (
        <TransactionDetailModal
          transaction={selectedTransaction}
          onClose={() => setSelectedTransaction(null)}
          onUpdateExplanation={handleUpdateExplanation}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-[#0B0F19] py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>PayGuard AI • Autonomous Payment Risk Intelligence Engine</span>
          <span className="text-[11px] text-slate-400">
            Hybrid Architecture • Sub-15ms Deterministic Safety + Gemini Explainability
          </span>
        </div>
      </footer>

    </div>
  );
};
