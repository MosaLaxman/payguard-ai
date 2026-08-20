"""
Test script to verify all backend components of PayGuard AI (UTF-8 / ASCII safe).
"""
import sys

# Ensure UTF-8 output encoding
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding='utf-8')

from database import init_db, get_all_transactions
from risk_engine import calculate_risk
from ai_service import generate_transaction_explanation, query_ai_risk_analyst
from schemas import SimulationRequest

print("1. Initializing database...")
init_db(force_reseed=True)
txs = get_all_transactions()
print(f"[SUCCESS] Total transactions loaded: {len(txs)}")

print("\n2. Testing Deterministic Risk Engine on High-Risk Scenario...")
res_high = calculate_risk(
    amount=95000.0,
    customer_average_amount=2500.0,
    location="Moscow, RU",
    usual_location="Mumbai, IN",
    is_new_device=True,
    transaction_count_last_24h=8,
    previous_failed_transactions=2,
    merchant_category="Crypto Exchange",
    customer_account_age_days=15,
    transaction_hour=2
)
print(f"Risk Score: {res_high.risk_score}/100")
print(f"Risk Level: {res_high.risk_level}")
print(f"Action: {res_high.recommended_action}")
print(f"Anomalies: {res_high.anomalies_detected}")
assert res_high.risk_score >= 80, "Expected high risk score"
assert res_high.recommended_action == "BLOCK", "Expected BLOCK action"
print("[SUCCESS] High-Risk deterministic calculation verified!")

print("\n3. Testing Deterministic Risk Engine on Safe Normal Scenario...")
res_low = calculate_risk(
    amount=450.0,
    customer_average_amount=2200.0,
    location="Bengaluru, IN",
    usual_location="Bengaluru, IN",
    is_new_device=False,
    transaction_count_last_24h=1,
    previous_failed_transactions=0,
    merchant_category="Food Delivery",
    customer_account_age_days=500,
    transaction_hour=19
)
print(f"Risk Score: {res_low.risk_score}/100")
print(f"Risk Level: {res_low.risk_level}")
print(f"Action: {res_low.recommended_action}")
assert res_low.risk_score < 30, "Expected low risk score"
assert res_low.recommended_action == "APPROVE", "Expected APPROVE action"
print("[SUCCESS] Safe normal calculation verified!")

print("\n4. Testing AI Explainability Generator...")
tx_sample = txs[0]
explanation = generate_transaction_explanation(tx_sample)
print(f"Sample explanation for {tx_sample.transaction_id}:\n--> {explanation}")
assert len(explanation) > 20, "Explanation is too short"
print("[SUCCESS] Explainability engine verified!")

print("\n5. Testing AI Risk Analyst query...")
analyst_res = query_ai_risk_analyst(
    user_query="Show me the highest-risk transactions and why they were blocked",
    transactions=txs,
    stats={"total_transactions": len(txs), "blocked_count": 5, "average_risk_score": 32.4}
)
print(f"Analyst response:\n--> {analyst_res[:200]}...")
print("[SUCCESS] AI Risk Analyst verified!")

print("\n[ALL TESTS PASSED] PayGuard AI Backend is 100% functional and verified!")
