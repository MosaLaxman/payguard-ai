"""
PayGuard AI - SQLite Database Layer
Handles persistent storage for synthetic transactions, risk assessments, and explanations.
"""

import sqlite3
import json
import os
from typing import List, Optional, Dict, Any
from schemas import TransactionRecord, RiskFactor
from synthetic_data import generate_synthetic_transactions

DB_PATH = os.path.join(os.path.dirname(__file__), "payguard.db")

def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db(force_reseed: bool = False):
    """Initializes the database schema and seeds synthetic transactions if empty."""
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS transactions (
        transaction_id TEXT PRIMARY KEY,
        customer_id TEXT,
        customer_name TEXT,
        amount REAL,
        timestamp TEXT,
        location TEXT,
        usual_location TEXT,
        device_id TEXT,
        is_new_device INTEGER,
        customer_average_amount REAL,
        transaction_count_last_24h INTEGER,
        previous_failed_transactions INTEGER,
        merchant_name TEXT,
        merchant_category TEXT,
        customer_account_age_days INTEGER,
        payment_method TEXT,
        risk_score INTEGER,
        risk_level TEXT,
        decision TEXT,
        risk_factors_json TEXT,
        anomalies_json TEXT,
        ai_explanation TEXT
    )
    """)
    conn.commit()

    # Check if table has data
    cursor.execute("SELECT COUNT(*) FROM transactions")
    count = cursor.fetchone()[0]

    if count == 0 or force_reseed:
        if force_reseed:
            cursor.execute("DELETE FROM transactions")
            conn.commit()
        
        txs = generate_synthetic_transactions(65)
        for tx in txs:
            cursor.execute("""
            INSERT OR REPLACE INTO transactions (
                transaction_id, customer_id, customer_name, amount, timestamp, location,
                usual_location, device_id, is_new_device, customer_average_amount,
                transaction_count_last_24h, previous_failed_transactions, merchant_name,
                merchant_category, customer_account_age_days, payment_method, risk_score,
                risk_level, decision, risk_factors_json, anomalies_json, ai_explanation
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                tx.transaction_id, tx.customer_id, tx.customer_name, tx.amount, tx.timestamp,
                tx.location, tx.usual_location, tx.device_id, 1 if tx.is_new_device else 0,
                tx.customer_average_amount, tx.transaction_count_last_24h, tx.previous_failed_transactions,
                tx.merchant_name, tx.merchant_category, tx.customer_account_age_days, tx.payment_method,
                tx.risk_score, tx.risk_level, tx.decision,
                json.dumps([f.model_dump() for f in tx.risk_factors]),
                json.dumps(tx.anomalies_detected),
                tx.ai_explanation
            ))
        conn.commit()
    conn.close()

def row_to_transaction(row: sqlite3.Row) -> TransactionRecord:
    factors_data = json.loads(row["risk_factors_json"]) if row["risk_factors_json"] else []
    anomalies_data = json.loads(row["anomalies_json"]) if row["anomalies_json"] else []
    
    risk_factors = [RiskFactor(**f) for f in factors_data]

    return TransactionRecord(
        transaction_id=row["transaction_id"],
        customer_id=row["customer_id"],
        customer_name=row["customer_name"],
        amount=row["amount"],
        timestamp=row["timestamp"],
        location=row["location"],
        usual_location=row["usual_location"],
        device_id=row["device_id"],
        is_new_device=bool(row["is_new_device"]),
        customer_average_amount=row["customer_average_amount"],
        transaction_count_last_24h=row["transaction_count_last_24h"],
        previous_failed_transactions=row["previous_failed_transactions"],
        merchant_name=row["merchant_name"],
        merchant_category=row["merchant_category"],
        customer_account_age_days=row["customer_account_age_days"],
        payment_method=row["payment_method"],
        risk_score=row["risk_score"],
        risk_level=row["risk_level"],
        decision=row["decision"],
        risk_factors=risk_factors,
        anomalies_detected=anomalies_data,
        ai_explanation=row["ai_explanation"]
    )

def get_all_transactions(
    risk_level: Optional[str] = None,
    decision: Optional[str] = None,
    search: Optional[str] = None,
    min_amount: Optional[float] = None,
    max_amount: Optional[float] = None,
    only_suspicious: bool = False
) -> List[TransactionRecord]:
    conn = get_connection()
    cursor = conn.cursor()

    query = "SELECT * FROM transactions WHERE 1=1"
    params = []

    if risk_level and risk_level.upper() != "ALL":
        query += " AND risk_level = ?"
        params.append(risk_level.upper())

    if decision and decision.upper() != "ALL":
        query += " AND decision = ?"
        params.append(decision.upper())

    if search:
        query += " AND (transaction_id LIKE ? OR customer_name LIKE ? OR customer_id LIKE ? OR merchant_name LIKE ? OR location LIKE ?)"
        s_pattern = f"%{search}%"
        params.extend([s_pattern, s_pattern, s_pattern, s_pattern, s_pattern])

    if min_amount is not None:
        query += " AND amount >= ?"
        params.append(min_amount)

    if max_amount is not None:
        query += " AND amount <= ?"
        params.append(max_amount)

    if only_suspicious:
        query += " AND risk_score >= 50"

    query += " ORDER BY timestamp DESC"
    cursor.execute(query, params)
    rows = cursor.fetchall()
    conn.close()

    return [row_to_transaction(r) for r in rows]

def get_transaction_by_id(tx_id: str) -> Optional[TransactionRecord]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM transactions WHERE transaction_id = ?", (tx_id,))
    row = cursor.fetchone()
    conn.close()
    if row:
        return row_to_transaction(row)
    return None

def update_transaction_explanation(tx_id: str, explanation: str):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE transactions SET ai_explanation = ? WHERE transaction_id = ?", (explanation, tx_id))
    conn.commit()
    conn.close()

def save_new_transaction(tx: TransactionRecord):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
    INSERT OR REPLACE INTO transactions (
        transaction_id, customer_id, customer_name, amount, timestamp, location,
        usual_location, device_id, is_new_device, customer_average_amount,
        transaction_count_last_24h, previous_failed_transactions, merchant_name,
        merchant_category, customer_account_age_days, payment_method, risk_score,
        risk_level, decision, risk_factors_json, anomalies_json, ai_explanation
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        tx.transaction_id, tx.customer_id, tx.customer_name, tx.amount, tx.timestamp,
        tx.location, tx.usual_location, tx.device_id, 1 if tx.is_new_device else 0,
        tx.customer_average_amount, tx.transaction_count_last_24h, tx.previous_failed_transactions,
        tx.merchant_name, tx.merchant_category, tx.customer_account_age_days, tx.payment_method,
        tx.risk_score, tx.risk_level, tx.decision,
        json.dumps([f.model_dump() for f in tx.risk_factors]),
        json.dumps(tx.anomalies_detected),
        tx.ai_explanation
    ))
    conn.commit()
    conn.close()
