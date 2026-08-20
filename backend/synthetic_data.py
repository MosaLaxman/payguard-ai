"""
PayGuard AI - Synthetic Transaction Generator
Generates realistic Indian payment transactions across diverse risk profiles.
"""

import random
from datetime import datetime, timedelta
from typing import List
from risk_engine import calculate_risk
from schemas import TransactionRecord

INDIAN_CITIES = ["Mumbai, IN", "Bengaluru, IN", "Delhi NCR, IN", "Hyderabad, IN", "Pune, IN", "Chennai, IN", "Kolkata, IN", "Ahmedabad, IN", "Jaipur, IN", "Kochi, IN"]
FLAGGED_LOCATIONS = ["Lagos, NG", "Moscow, RU", "Kyiv, UA", "Bucharest, RO", "George Town, KY"]

MERCHANTS = [
    ("Swiggy India", "Food Delivery", 450.0, 1500.0),
    ("Zomato India", "Food Delivery", 350.0, 1800.0),
    ("Flipkart India", "E-Commerce", 1200.0, 65000.0),
    ("Amazon India", "E-Commerce", 800.0, 45000.0),
    ("Reliance Digital", "Electronics", 5000.0, 95000.0),
    ("Apple India Store", "Electronics", 25000.0, 149000.0),
    ("Tanishq Jewellery", "Jewelry", 15000.0, 120000.0),
    ("MakeMyTrip", "Travel/Aviation", 3500.0, 45000.0),
    ("Uber India", "Ride Hailing", 180.0, 1200.0),
    ("BESCOM Utility", "Utility Bills", 850.0, 3500.0),
    ("BookMyShow", "Entertainment", 500.0, 2500.0),
    ("WazirX India", "Crypto Exchange", 10000.0, 150000.0),
    ("Dream11 Gaming", "Online Casino", 500.0, 25000.0),
    ("Myntra Fashion", "E-Commerce", 1500.0, 12000.0),
    ("Nykaa Beauty", "E-Commerce", 900.0, 8000.0),
    ("Tata 1mg", "Groceries", 450.0, 3200.0),
]

CUSTOMER_NAMES = [
    "Aarav Sharma", "Priya Nair", "Rohan Mehta", "Ananya Iyer", "Vikram Patel",
    "Neha Singh", "Aditya Deshmukh", "Sneha Reddy", "Rahul Verma", "Kavita Rao",
    "Siddharth Joshi", "Pooja Gupta", "Manish Malhotra", "Divya Krishnan", "Kunal Kapoor",
    "Tanvi Kulkarni", "Arjun Bhatia", "Meera Sen", "Harsh Vardhan", "Ritu Agrawal"
]

PAYMENT_METHODS = ["UPI (GooglePay)", "UPI (PhonePe)", "UPI (Paytm)", "Credit Card (HDFC)", "Credit Card (ICICI)", "Debit Card (SBI)", "Net Banking (Axis)"]

def generate_synthetic_transactions(count: int = 65) -> List[TransactionRecord]:
    """Generates synthetic dataset populated with realistic normal and fraudulent transactions."""
    random.seed(42)  # Deterministic seed for reproducible demo
    transactions: List[TransactionRecord] = []
    base_time = datetime.now() - timedelta(hours=36)

    # 1. Specially curated Showcase Transactions for high-impact demo
    showcase_scenarios = [
        {
            "tx_id": "TX-9901",
            "name": "Rohan Mehta",
            "amount": 94500.0,
            "avg": 2400.0,
            "loc": "Moscow, RU",
            "home": "Mumbai, IN",
            "new_dev": True,
            "v24": 2,
            "failed": 0,
            "merchant": "Apple India Store",
            "cat": "Electronics",
            "age": 420,
            "method": "Credit Card (HDFC)",
            "hour": 2,
            "desc_tag": "Midnight International Account Takeover"
        },
        {
            "tx_id": "TX-9902",
            "name": "Ananya Iyer",
            "amount": 78000.0,
            "avg": 3100.0,
            "loc": "Lagos, NG",
            "home": "Bengaluru, IN",
            "new_dev": True,
            "v24": 11,
            "failed": 3,
            "merchant": "WazirX India",
            "cat": "Crypto Exchange",
            "age": 12,
            "method": "Net Banking (Axis)",
            "hour": 3,
            "desc_tag": "Brute-force + High-velocity Crypto Drain"
        },
        {
            "tx_id": "TX-9903",
            "name": "Vikram Patel",
            "amount": 42000.0,
            "avg": 4500.0,
            "loc": "Jaipur, IN",
            "home": "Ahmedabad, IN",
            "new_dev": True,
            "v24": 7,
            "failed": 1,
            "merchant": "Reliance Digital",
            "cat": "Electronics",
            "age": 180,
            "method": "UPI (GooglePay)",
            "hour": 1,
            "desc_tag": "Late night multi-anomaly Electronics purchase"
        },
        {
            "tx_id": "TX-9904",
            "name": "Priya Nair",
            "amount": 16500.0,
            "avg": 3800.0,
            "loc": "Kochi, IN",
            "home": "Bengaluru, IN",
            "new_dev": False,
            "v24": 3,
            "failed": 0,
            "merchant": "MakeMyTrip",
            "cat": "Travel/Aviation",
            "age": 300,
            "method": "Credit Card (ICICI)",
            "hour": 15,
            "desc_tag": "Moderate vacation travel booking (Legitimate deviation)"
        },
        {
            "tx_id": "TX-9905",
            "name": "Aarav Sharma",
            "amount": 485.0,
            "avg": 2200.0,
            "loc": "Bengaluru, IN",
            "home": "Bengaluru, IN",
            "new_dev": False,
            "v24": 1,
            "failed": 0,
            "merchant": "Swiggy India",
            "cat": "Food Delivery",
            "age": 510,
            "method": "UPI (PhonePe)",
            "hour": 20,
            "desc_tag": "Standard daily food delivery (Safe)"
        }
    ]

    for s in showcase_scenarios:
        t_time = base_time + timedelta(hours=random.randint(1, 30))
        # Adjust hour
        t_time = t_time.replace(hour=s["hour"], minute=random.randint(5, 55))
        
        risk_res = calculate_risk(
            amount=s["amount"],
            customer_average_amount=s["avg"],
            location=s["loc"],
            usual_location=s["home"],
            is_new_device=s["new_dev"],
            transaction_count_last_24h=s["v24"],
            previous_failed_transactions=s["failed"],
            merchant_category=s["cat"],
            customer_account_age_days=s["age"],
            transaction_hour=s["hour"]
        )

        record = TransactionRecord(
            transaction_id=s["tx_id"],
            customer_id=f"CUST-{random.randint(1001, 1099)}",
            customer_name=s["name"],
            amount=s["amount"],
            timestamp=t_time.strftime("%Y-%m-%d %H:%M:%S"),
            location=s["loc"],
            usual_location=s["home"],
            device_id=f"DEV-{random.randint(10000, 99999)}" if s["new_dev"] else "DEV-KNOWN-01",
            is_new_device=s["new_dev"],
            customer_average_amount=s["avg"],
            transaction_count_last_24h=s["v24"],
            previous_failed_transactions=s["failed"],
            merchant_name=s["merchant"],
            merchant_category=s["cat"],
            customer_account_age_days=s["age"],
            payment_method=s["method"],
            risk_score=risk_res.risk_score,
            risk_level=risk_res.risk_level,
            decision=risk_res.recommended_action,
            risk_factors=risk_res.risk_factors,
            anomalies_detected=risk_res.anomalies_detected,
            ai_explanation=None
        )
        transactions.append(record)

    # 2. Generate remaining realistic distributed transactions
    for i in range(len(showcase_scenarios), count):
        tx_id = f"TX-{1000 + i}"
        customer_name = random.choice(CUSTOMER_NAMES)
        customer_id = f"CUST-{1000 + (hash(customer_name) % 100)}"
        home_city = random.choice(INDIAN_CITIES)
        merchant, cat, min_amt, max_amt = random.choice(MERCHANTS)
        payment_method = random.choice(PAYMENT_METHODS)

        # Baseline customer stats
        avg_amt = round(random.uniform(1200.0, 6000.0), 2)
        account_age = random.randint(10, 800)

        # 75% normal, 15% medium risk/review, 10% high/fraud
        scenario_type = random.choices(["NORMAL", "ELEVATED", "FRAUD"], weights=[72, 18, 10])[0]

        if scenario_type == "NORMAL":
            amt = round(random.uniform(min_amt, min(avg_amt * 1.8, max_amt)), 2)
            loc = home_city
            new_device = random.random() < 0.08
            v24 = random.randint(1, 3)
            failed = 0
            hour = random.choice([7, 8, 9, 11, 12, 13, 14, 16, 17, 19, 20, 21, 22])
        elif scenario_type == "ELEVATED":
            amt = round(random.uniform(avg_amt * 2.2, avg_amt * 4.5), 2)
            loc = random.choice(INDIAN_CITIES)
            new_device = random.random() < 0.4
            v24 = random.randint(3, 6)
            failed = random.choice([0, 1, 1, 2])
            hour = random.randint(0, 23)
        else:  # FRAUD
            amt = round(random.uniform(avg_amt * 7.0, avg_amt * 18.0), 2)
            loc = random.choice(FLAGGED_LOCATIONS + INDIAN_CITIES)
            new_device = True
            v24 = random.randint(6, 12)
            failed = random.randint(1, 4)
            hour = random.choice([1, 2, 3, 4, 23])

        t_time = base_time + timedelta(hours=random.randint(1, 35))
        t_time = t_time.replace(hour=hour, minute=random.randint(0, 59))

        risk_res = calculate_risk(
            amount=amt,
            customer_average_amount=avg_amt,
            location=loc,
            usual_location=home_city,
            is_new_device=new_device,
            transaction_count_last_24h=v24,
            previous_failed_transactions=failed,
            merchant_category=cat,
            customer_account_age_days=account_age,
            transaction_hour=hour
        )

        record = TransactionRecord(
            transaction_id=tx_id,
            customer_id=customer_id,
            customer_name=customer_name,
            amount=amt,
            timestamp=t_time.strftime("%Y-%m-%d %H:%M:%S"),
            location=loc,
            usual_location=home_city,
            device_id=f"DEV-{random.randint(10000, 99999)}" if new_device else "DEV-TRUSTED-01",
            is_new_device=new_device,
            customer_average_amount=avg_amt,
            transaction_count_last_24h=v24,
            previous_failed_transactions=failed,
            merchant_name=merchant,
            merchant_category=cat,
            customer_account_age_days=account_age,
            payment_method=payment_method,
            risk_score=risk_res.risk_score,
            risk_level=risk_res.risk_level,
            decision=risk_res.recommended_action,
            risk_factors=risk_res.risk_factors,
            anomalies_detected=risk_res.anomalies_detected,
            ai_explanation=None
        )
        transactions.append(record)

    # Sort descending by timestamp
    transactions.sort(key=lambda x: x.timestamp, reverse=True)
    return transactions
