import axios from 'axios';
import { DashboardStats, Transaction, SimulationRequest, SimulationResponse } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const api = {
  getStats: async (): Promise<DashboardStats> => {
    const res = await apiClient.get('/api/stats');
    return res.data;
  },

  getTransactions: async (params?: {
    risk_level?: string;
    decision?: string;
    search?: string;
    min_amount?: number;
    max_amount?: number;
    only_suspicious?: boolean;
  }): Promise<Transaction[]> => {
    const res = await apiClient.get('/api/transactions', { params });
    return res.data;
  },

  getTransactionById: async (id: string): Promise<Transaction> => {
    const res = await apiClient.get(`/api/transactions/${id}`);
    return res.data;
  },

  explainTransaction: async (id: string): Promise<{ transaction_id: string; explanation: string; cached: boolean }> => {
    const res = await apiClient.post(`/api/transactions/${id}/explain`);
    return res.data;
  },

  simulateRisk: async (payload: SimulationRequest): Promise<SimulationResponse> => {
    const res = await apiClient.post('/api/simulate', payload);
    return res.data;
  },

  askAnalyst: async (query: string, history?: { role: string; content: string }[]): Promise<{ query: string; answer: string }> => {
    const res = await apiClient.post('/api/analyst', {
      query,
      conversation_history: history || [],
    });
    return res.data;
  },

  resetData: async (): Promise<{ status: string; message: string }> => {
    const res = await apiClient.post('/api/reset-data');
    return res.data;
  },
};
