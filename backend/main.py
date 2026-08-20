"""
PayGuard AI - FastAPI Backend Application
Track 2: AI Risk Manager - Razorpay AI Buildathon
"""

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional
import os
import datetime
from dotenv import load_dotenv

load_dotenv()

from schemas import (
    TransactionRecord, RiskAssessmentResult, SimulationRequest,
    SimulationResponse, ExplanationRequest, AIAnalystQuery, DashboardStats
)
from database import (
    init_db, get_all_transactions, get_transaction_by_id,
    update_transaction_explanation, save_new_transaction
)
from risk_engine import calculate_risk
from ai_service import (
    generate_transaction_explanation, query_ai_risk_analyst, HAS_VALID_GEMINI_KEY
)

# Initialize database schema and seed data on startup
init_db()

app = FastAPI(
    title="PayGuard AI - Risk Intelligence Engine",
    description="Deterministic Risk Analysis + Explainable AI for Payment Gateway Risk Management",
    version="1.0.0"
)

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {
        "system": "PayGuard AI",
        "status": "active",
        "track": "Track 2: AI Risk Manager (Razorpay Buildathon)",
        "version": "1.0.0",
        "gemini_active": HAS_VALID_GEMINI_KEY
    }

@app.get("/api/health")
def health():
    return {
        "status": "healthy",
        "gemini_configured": HAS_VALID_GEMINI_KEY,
        "timestamp": datetime.datetime.now().isoformat()
    }

@app.get("/api/stats", response_model=DashboardStats)
def get_dashboard_stats():
    """Computes aggregated KPIs and chart distributions for the Risk Dashboard."""
    txs = get_all_transactions()
    total_count = len(txs)
    
    if total_count == 0:
        return DashboardStats(
            total_transactions=0,
            total_volume_inr=0.0,
            approved_count=0,
            review_count=0,
            blocked_count=0,
            high_risk_count=0,
            average_risk_score=0.0,
            high_risk_rate_percent=0.0,
            recent_suspicious=[],
            hourly_distribution=[],
            risk_level_distribution={"LOW": 0, "MEDIUM": 0, "HIGH": 0, "CRITICAL": 0},
            top_risk_factors=[]
        )

    total_volume = sum(t.amount for t in txs)
    approved = sum(1 for t in txs if t.decision == "APPROVE")
    review = sum(1 for t in txs if t.decision in ["REVIEW", "ADDITIONAL_AUTHENTICATION"])
    blocked = sum(1 for t in txs if t.decision == "BLOCK")
    high_risk = sum(1 for t in txs if t.risk_score >= 60)
    avg_score = round(sum(t.risk_score for t in txs) / total_count, 1)
    high_risk_rate = round((high_risk / total_count) * 100.0, 1)

    # Risk level distribution
    risk_dist = {"LOW": 0, "MEDIUM": 0, "HIGH": 0, "CRITICAL": 0}
    for t in txs:
        risk_dist[t.risk_level] = risk_dist.get(t.risk_level, 0) + 1

    # Hourly distribution
    hourly_map = {h: {"hour": f"{h:02d}:00", "total": 0, "high_risk": 0} for h in range(24)}
    for t in txs:
        try:
            h = int(t.timestamp.split()[1].split(":")[0])
            hourly_map[h]["total"] += 1
            if t.risk_score >= 60:
                hourly_map[h]["high_risk"] += 1
        except Exception:
            pass
    hourly_distribution = [hourly_map[h] for h in sorted(hourly_map.keys())]

    # Top risk factors frequency
    factor_counts = {}
    for t in txs:
        for f in t.risk_factors:
            factor_counts[f.factor_name] = factor_counts.get(f.factor_name, 0) + 1
    
    top_factors = [
        {"factor": k, "count": v}
        for k, v in sorted(factor_counts.items(), key=lambda x: x[1], reverse=True)[:5]
    ]

    # Recent suspicious
    suspicious = [t for t in txs if t.risk_score >= 50][:6]

    return DashboardStats(
        total_transactions=total_count,
        total_volume_inr=round(total_volume, 2),
        approved_count=approved,
        review_count=review,
        blocked_count=blocked,
        high_risk_count=high_risk,
        average_risk_score=avg_score,
        high_risk_rate_percent=high_risk_rate,
        recent_suspicious=suspicious,
        hourly_distribution=hourly_distribution,
        risk_level_distribution=risk_dist,
        top_risk_factors=top_factors
    )

@app.get("/api/transactions", response_model=List[TransactionRecord])
def list_transactions(
    risk_level: Optional[str] = Query("ALL", description="Filter by risk level: ALL, LOW, MEDIUM, HIGH, CRITICAL"),
    decision: Optional[str] = Query("ALL", description="Filter by decision: ALL, APPROVE, REVIEW, BLOCK, ADDITIONAL_AUTHENTICATION"),
    search: Optional[str] = Query(None, description="Search by TX ID, customer, merchant, location"),
    min_amount: Optional[float] = Query(None, description="Minimum amount in INR"),
    max_amount: Optional[float] = Query(None, description="Maximum amount in INR"),
    only_suspicious: bool = Query(False, description="Filter only suspicious (Score >= 50)")
):
    """Retrieves transactions with dynamic multi-criteria filtering."""
    return get_all_transactions(
        risk_level=risk_level,
        decision=decision,
        search=search,
        min_amount=min_amount,
        max_amount=max_amount,
        only_suspicious=only_suspicious
    )

@app.get("/api/transactions/{tx_id}", response_model=TransactionRecord)
def get_transaction(tx_id: str):
    """Fetches full telemetry and risk assessment for a specific transaction."""
    tx = get_transaction_by_id(tx_id)
    if not tx:
        raise HTTPException(status_code=404, detail=f"Transaction {tx_id} not found")
    return tx

@app.post("/api/transactions/{tx_id}/explain")
def explain_transaction(tx_id: str):
    """
    Generates or retrieves explainable AI narrative for a transaction using Gemini.
    """
    tx = get_transaction_by_id(tx_id)
    if not tx:
        raise HTTPException(status_code=404, detail=f"Transaction {tx_id} not found")

    if tx.ai_explanation:
        return {"transaction_id": tx_id, "explanation": tx.ai_explanation, "cached": True}

    explanation = generate_transaction_explanation(tx)
    update_transaction_explanation(tx_id, explanation)
    return {"transaction_id": tx_id, "explanation": explanation, "cached": False}

@app.post("/api/simulate", response_model=SimulationResponse)
def simulate_transaction(req: SimulationRequest):
    """
    Live Risk Simulator: Calculates risk score deterministically and generates an AI explanation.
    """
    risk_res = calculate_risk(
        amount=req.amount,
        customer_average_amount=req.customer_average_amount,
        location=req.location,
        usual_location=req.usual_location,
        is_new_device=req.is_new_device,
        transaction_count_last_24h=req.transaction_count_last_24h,
        previous_failed_transactions=req.previous_failed_transactions,
        merchant_category=req.merchant_category,
        customer_account_age_days=req.customer_account_age_days,
        transaction_hour=req.transaction_hour
    )

    sim_id = f"TX-SIM-{datetime.datetime.now().strftime('%M%S%f')[:6]}"
    now_str = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    tx_temp = TransactionRecord(
        transaction_id=sim_id,
        customer_id=req.customer_id,
        customer_name=req.customer_name,
        amount=req.amount,
        timestamp=now_str,
        location=req.location,
        usual_location=req.usual_location,
        device_id="DEV-SIMULATOR",
        is_new_device=req.is_new_device,
        customer_average_amount=req.customer_average_amount,
        transaction_count_last_24h=req.transaction_count_last_24h,
        previous_failed_transactions=req.previous_failed_transactions,
        merchant_name=req.merchant_name,
        merchant_category=req.merchant_category,
        customer_account_age_days=req.customer_account_age_days,
        payment_method=req.payment_method,
        risk_score=risk_res.risk_score,
        risk_level=risk_res.risk_level,
        decision=risk_res.recommended_action,
        risk_factors=risk_res.risk_factors,
        anomalies_detected=risk_res.anomalies_detected,
        ai_explanation=None
    )

    explanation = generate_transaction_explanation(tx_temp)
    tx_temp.ai_explanation = explanation

    # Save simulated transaction to DB so it appears in live audit log
    save_new_transaction(tx_temp)

    return SimulationResponse(
        transaction_id=sim_id,
        risk_score=risk_res.risk_score,
        risk_level=risk_res.risk_level,
        recommended_action=risk_res.recommended_action,
        risk_factors=risk_res.risk_factors,
        anomalies_detected=risk_res.anomalies_detected,
        ai_explanation=explanation,
        input_summary={
            "amount": req.amount,
            "customer_average": req.customer_average_amount,
            "ratio": round(req.amount / max(req.customer_average_amount, 1), 1),
            "location": req.location,
            "usual_location": req.usual_location,
            "is_new_device": req.is_new_device,
            "hour": req.transaction_hour,
            "velocity_24h": req.transaction_count_last_24h,
            "failed_attempts": req.previous_failed_transactions
        }
    )

@app.post("/api/analyst")
def ask_risk_analyst_endpoint(query_body: AIAnalystQuery):
    """
    Embedded AI Risk Analyst endpoint. Answers natural language queries grounded in the live dataset.
    """
    txs = get_all_transactions()
    stats = get_dashboard_stats().model_dump()
    
    answer = query_ai_risk_analyst(
        user_query=query_body.query,
        transactions=txs,
        stats=stats,
        history=query_body.conversation_history
    )
    return {"query": query_body.query, "answer": answer}

@app.post("/api/reset-data")
def reset_synthetic_data():
    """Resets and regenerates the synthetic dataset to original state."""
    init_db(force_reseed=True)
    return {"status": "success", "message": "Synthetic dataset reseeded successfully"}
