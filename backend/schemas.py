from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

class RiskFactor(BaseModel):
    factor_name: str
    severity: str  # LOW, MEDIUM, HIGH, CRITICAL
    score_contribution: float
    description: str

class RiskAssessmentResult(BaseModel):
    risk_score: int  # 0 to 100
    risk_level: str  # LOW, MEDIUM, HIGH, CRITICAL
    recommended_action: str  # APPROVE, REVIEW, BLOCK, ADDITIONAL_AUTHENTICATION
    risk_factors: List[RiskFactor]
    anomalies_detected: List[str]
    is_rule_override: bool = False
    override_reason: Optional[str] = None

class TransactionBase(BaseModel):
    transaction_id: str
    customer_id: str
    customer_name: str
    amount: float
    timestamp: str
    location: str
    usual_location: str
    device_id: str
    is_new_device: bool
    customer_average_amount: float
    transaction_count_last_24h: int
    previous_failed_transactions: int
    merchant_name: str
    merchant_category: str
    customer_account_age_days: int
    payment_method: str

class TransactionRecord(TransactionBase):
    risk_score: int
    risk_level: str
    decision: str
    risk_factors: List[RiskFactor] = []
    anomalies_detected: List[str] = []
    ai_explanation: Optional[str] = None

class SimulationRequest(BaseModel):
    customer_id: str = "CUST-SIM-001"
    customer_name: str = "Demo User"
    amount: float = Field(..., gt=0, description="Transaction amount in INR")
    location: str = "Mumbai, IN"
    usual_location: str = "Mumbai, IN"
    is_new_device: bool = False
    customer_average_amount: float = 2500.0
    transaction_count_last_24h: int = 2
    previous_failed_transactions: int = 0
    merchant_name: str = "Flipkart India"
    merchant_category: str = "E-Commerce"
    customer_account_age_days: int = 365
    payment_method: str = "UPI"
    transaction_hour: int = 14  # 0 to 23

class SimulationResponse(BaseModel):
    transaction_id: str
    risk_score: int
    risk_level: str
    recommended_action: str
    risk_factors: List[RiskFactor]
    anomalies_detected: List[str]
    ai_explanation: Optional[str] = None
    input_summary: Dict[str, Any]

class ExplanationRequest(BaseModel):
    transaction_id: str

class AIAnalystQuery(BaseModel):
    query: str
    conversation_history: Optional[List[Dict[str, str]]] = []

class DashboardStats(BaseModel):
    total_transactions: int
    total_volume_inr: float
    approved_count: int
    review_count: int
    blocked_count: int
    high_risk_count: int
    average_risk_score: float
    high_risk_rate_percent: float
    recent_suspicious: List[TransactionRecord]
    hourly_distribution: List[Dict[str, Any]]
    risk_level_distribution: Dict[str, int]
    top_risk_factors: List[Dict[str, Any]]
