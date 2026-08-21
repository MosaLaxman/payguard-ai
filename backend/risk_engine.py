"""
PayGuard AI - Deterministic Risk Engine
Combines multi-factor behavioral anomaly signals into an auditable 0-100 risk score.
"""

from typing import List, Tuple
from schemas import RiskFactor, RiskAssessmentResult

# High-risk merchant categories
HIGH_RISK_MERCHANTS = {"Crypto Exchange", "Online Casino", "P2P Lending", "Foreign Forex", "High-End Luxury"}
MEDIUM_RISK_MERCHANTS = {"Electronics", "Jewelry", "Gift Cards", "Travel/Aviation"}
LOW_RISK_MERCHANTS = {"Food Delivery", "Ride Hailing", "Utility Bills", "Groceries", "Entertainment", "E-Commerce"}

# International / High-risk locations for Indian payment gateway context
INTERNATIONAL_SUSPICIOUS_LOCATIONS = {"Lagos, NG", "Moscow, RU", "Kyiv, UA", "Bucharest, RO", "George Town, KY"}

def calculate_risk(
    amount: float,
    customer_average_amount: float,
    location: str,
    usual_location: str,
    is_new_device: bool,
    transaction_count_last_24h: int,
    previous_failed_transactions: int,
    merchant_category: str,
    customer_account_age_days: int,
    transaction_hour: int
) -> RiskAssessmentResult:
    """
    Evaluates multi-signal transaction context deterministically.
    Returns calculated risk score (0-100), risk level, recommended action, and itemized factors.
    """
    raw_score = 0.0
    risk_factors: List[RiskFactor] = []
    anomalies: List[str] = []

    # 1. Amount Anomaly Ratio
    avg = max(customer_average_amount, 100.0)
    ratio = amount / avg

    if ratio >= 12.0:
        pts = 42.0
        raw_score += pts
        risk_factors.append(RiskFactor(
            factor_name="Extreme Amount Anomaly",
            severity="CRITICAL",
            score_contribution=pts,
            description=f"Transaction amount (₹{amount:,.2f}) is {ratio:.1f}x higher than customer 30-day baseline (₹{avg:,.2f})."
        ))
        anomalies.append(f"Amount is {ratio:.1f}x customer average")
    elif ratio >= 5.0:
        pts = 28.0
        raw_score += pts
        risk_factors.append(RiskFactor(
            factor_name="High Amount Anomaly",
            severity="HIGH",
            score_contribution=pts,
            description=f"Transaction amount (₹{amount:,.2f}) is {ratio:.1f}x higher than customer average."
        ))
        anomalies.append(f"Amount is {ratio:.1f}x customer average")
    elif ratio >= 2.5:
        pts = 14.0
        raw_score += pts
        risk_factors.append(RiskFactor(
            factor_name="Moderate Amount Deviation",
            severity="MEDIUM",
            score_contribution=pts,
            description=f"Transaction amount (₹{amount:,.2f}) is {ratio:.1f}x higher than customary pattern."
        ))
        anomalies.append(f"Amount {ratio:.1f}x higher than usual")
    elif ratio <= 0.2 and amount > 5000:
        # Micro-testing anomaly (rare)
        pass

    # 2. Location / Geolocation Deviation
    if location in INTERNATIONAL_SUSPICIOUS_LOCATIONS or ("," in location and not location.endswith(", IN")):
        pts = 35.0
        raw_score += pts
        risk_factors.append(RiskFactor(
            factor_name="Cross-Border Geolocation Mismatch",
            severity="CRITICAL",
            score_contribution=pts,
            description=f"Payment initiated from international/flagged location ({location}) vs registered home location ({usual_location})."
        ))
        anomalies.append(f"Cross-border transaction location ({location})")
    elif location.strip().lower() != usual_location.strip().lower():
        pts = 16.0
        raw_score += pts
        risk_factors.append(RiskFactor(
            factor_name="Domestic Location Deviation",
            severity="MEDIUM",
            score_contribution=pts,
            description=f"Payment initiated from {location} differing from habitual location {usual_location}."
        ))
        anomalies.append(f"Unfamiliar domestic location ({location} vs {usual_location})")

    # 3. Device Signature
    if is_new_device:
        pts = 18.0
        raw_score += pts
        risk_factors.append(RiskFactor(
            factor_name="Unrecognized Device Signature",
            severity="HIGH" if ratio > 3.0 else "MEDIUM",
            score_contribution=pts,
            description="Transaction originated from a new, unregistered device hardware fingerprint."
        ))
        anomalies.append("New device detected")

    # 4. Temporal Anomaly (Midnight / High-Risk Hours: 01:00 AM - 05:00 AM)
    if 1 <= transaction_hour <= 5:
        pts = 16.0
        raw_score += pts
        risk_factors.append(RiskFactor(
            factor_name="Atypical Midnight Transaction Window",
            severity="MEDIUM",
            score_contribution=pts,
            description=f"Transaction initiated at {transaction_hour:02d}:00 hours (statistically high-fraud temporal window)."
        ))
        anomalies.append(f"Unusual transaction time ({transaction_hour:02d}:00 AM)")

    # 5. Velocity / Rapid Burst Pattern
    if transaction_count_last_24h >= 8:
        pts = 26.0
        raw_score += pts
        risk_factors.append(RiskFactor(
            factor_name="High-Frequency Velocity Spike",
            severity="CRITICAL",
            score_contribution=pts,
            description=f"{transaction_count_last_24h} transactions executed in the past 24 hours (card draining/bot pattern)."
        ))
        anomalies.append(f"High velocity ({transaction_count_last_24h} txns in 24h)")
    elif transaction_count_last_24h >= 4:
        pts = 12.0
        raw_score += pts
        risk_factors.append(RiskFactor(
            factor_name="Elevated Transaction Velocity",
            severity="MEDIUM",
            score_contribution=pts,
            description=f"{transaction_count_last_24h} transactions in the last 24h."
        ))
        anomalies.append(f"Elevated velocity ({transaction_count_last_24h} txns in 24h)")

    # 6. Prior Failed Authentication Attempts (Brute Force / Guessing)
    if previous_failed_transactions >= 3:
        pts = 28.0
        raw_score += pts
        risk_factors.append(RiskFactor(
            factor_name="Repeated Prior Auth Failures",
            severity="CRITICAL",
            score_contribution=pts,
            description=f"{previous_failed_transactions} consecutive failed OTP/PIN attempts preceding this transaction."
        ))
        anomalies.append(f"{previous_failed_transactions} consecutive failed attempts")
    elif previous_failed_transactions >= 1:
        pts = 10.0 * previous_failed_transactions
        raw_score += pts
        risk_factors.append(RiskFactor(
            factor_name="Prior Auth Failure Detected",
            severity="LOW" if previous_failed_transactions == 1 else "MEDIUM",
            score_contribution=pts,
            description=f"{previous_failed_transactions} failed auth attempt(s) in recent session."
        ))

    # 7. Customer Account Age
    if customer_account_age_days < 7:
        pts = 12.0
        raw_score += pts
        risk_factors.append(RiskFactor(
            factor_name="Brand-New Account",
            severity="MEDIUM",
            score_contribution=pts,
            description=f"Account created only {customer_account_age_days} day(s) ago (limited transaction history)."
        ))
        anomalies.append("New customer account (<7 days)")

    # 8. Merchant Category Weighting
    if merchant_category in HIGH_RISK_MERCHANTS:
        pts = 18.0
        raw_score += pts
        risk_factors.append(RiskFactor(
            factor_name="High-Risk Merchant Vertical",
            severity="HIGH",
            score_contribution=pts,
            description=f"Merchant category '{merchant_category}' carries elevated chargeback & fraud velocity."
        ))
    elif merchant_category in MEDIUM_RISK_MERCHANTS:
        pts = 8.0
        raw_score += pts
        risk_factors.append(RiskFactor(
            factor_name="Medium-Risk Merchant Category",
            severity="LOW",
            score_contribution=pts,
            description=f"Merchant vertical '{merchant_category}' contains high-resale items."
        ))

    # Normalize final score between 0 and 100
    final_score = int(min(max(raw_score, 0.0), 100.0))

    # Hard-rule overrides (Deterministic Safety Safeguards)
    is_override = False
    override_reason = None

    # Hard Override 1: Extreme multi-vector fraud
    if ratio >= 10.0 and is_new_device and (location != usual_location or (1 <= transaction_hour <= 5)):
        if final_score < 85:
            final_score = 92
        is_override = True
        override_reason = "Hard Policy Override: Extreme amount spike + new device + location/time anomaly."

    # Hard Override 2: Credential brute-force + New device
    if previous_failed_transactions >= 3 and is_new_device:
        if final_score < 80:
            final_score = 88
        is_override = True
        override_reason = "Hard Policy Override: Multiple failed auth attempts paired with unrecognized hardware signature."

    # Determine Risk Level and Recommended Action
    if final_score >= 80:
        risk_level = "CRITICAL"
        recommended_action = "BLOCK"
    elif final_score >= 60:
        risk_level = "HIGH"
        recommended_action = "BLOCK"
    elif final_score >= 30:
        risk_level = "MEDIUM"
        recommended_action = "STEP-UP AUTHENTICATION"
    else:
        risk_level = "LOW"
        recommended_action = "APPROVE"

    return RiskAssessmentResult(
        risk_score=final_score,
        risk_level=risk_level,
        recommended_action=recommended_action,
        risk_factors=risk_factors,
        anomalies_detected=anomalies,
        is_rule_override=is_override,
        override_reason=override_reason
    )
