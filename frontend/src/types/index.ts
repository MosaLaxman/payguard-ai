export interface RiskFactor {
  factor_name: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  score_contribution: number;
  description: string;
}

export interface Transaction {
  transaction_id: string;
  customer_id: string;
  customer_name: string;
  amount: number;
  timestamp: string;
  location: string;
  usual_location: string;
  device_id: string;
  is_new_device: boolean;
  customer_average_amount: number;
  transaction_count_last_24h: number;
  previous_failed_transactions: number;
  merchant_name: string;
  merchant_category: string;
  customer_account_age_days: number;
  payment_method: string;
  risk_score: number;
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  decision: 'APPROVE' | 'REVIEW' | 'BLOCK' | 'ADDITIONAL_AUTHENTICATION';
  risk_factors: RiskFactor[];
  anomalies_detected: string[];
  ai_explanation?: string | null;
}

export interface DashboardStats {
  total_transactions: number;
  total_volume_inr: number;
  approved_count: number;
  review_count: number;
  blocked_count: number;
  high_risk_count: number;
  average_risk_score: number;
  high_risk_rate_percent: number;
  recent_suspicious: Transaction[];
  hourly_distribution: {
    hour: string;
    total: number;
    high_risk: number;
  }[];
  risk_level_distribution: {
    LOW: number;
    MEDIUM: number;
    HIGH: number;
    CRITICAL: number;
  };
  top_risk_factors: {
    factor: string;
    count: number;
  }[];
}

export interface SimulationRequest {
  customer_id?: string;
  customer_name?: string;
  amount: number;
  location: string;
  usual_location: string;
  is_new_device: boolean;
  customer_average_amount: number;
  transaction_count_last_24h: number;
  previous_failed_transactions: number;
  merchant_name: string;
  merchant_category: string;
  customer_account_age_days: number;
  payment_method: string;
  transaction_hour: number;
}

export interface SimulationResponse {
  transaction_id: string;
  risk_score: number;
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  recommended_action: string;
  risk_factors: RiskFactor[];
  anomalies_detected: string[];
  ai_explanation: string;
  input_summary: Record<string, any>;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}
