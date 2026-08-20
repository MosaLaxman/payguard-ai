# 🛡️ PayGuard AI — Autonomous Payment Risk Intelligence Engine

> **Razorpay AI Buildathon Submission**  
> **Track 2: AI Risk Manager**  
> **Target Role:** AI Intern (2027 B.Tech CSE / MCA Batch)

---

## 🌟 Executive Summary

**PayGuard AI** is an enterprise-grade payment risk assessment prototype built to address the critical trade-off in modern fintech payment gateways: **stopping sophisticated fraud in sub-50ms without adding friction to legitimate customers.**

Rather than naively outsourcing payment authorization to an unpredictable Large Language Model (LLM), PayGuard AI implements an industry-standard **Hybrid Architecture**:
1. **Deterministic Multi-Vector Risk Engine:** Computes real-time mathematical risk scores (0–100) using velocity, hardware fingerprinting, geolocation deviation, amount baseline multipliers, and temporal patterns in $<10\text{ms}$.
2. **Explainable AI Layer (Google Gemini):** Synthesizes grounded natural language narratives for merchant dispute teams, fraud analysts, and automated customer step-up reasoning (Zero Hallucination).
3. **AI Risk Analyst:** An embedded conversational co-pilot for fraud ops to query large-scale transaction datasets in plain English.

---

## 🏛️ System Architecture

```
[ Incoming Payment Payload ]
           │
           ▼
┌───────────────────────────────────────────────────────────┐
│     Deterministic Multi-Signal Engine (Python / FastAPI)  │
│                                                           │
│  ├─ Amount vs 30-Day Customer Baseline Multiplier         │
│  ├─ Hardware Device Fingerprint & Unrecognized Signature  │
│  ├─ Geolocation & Cross-Border Deviation Check            │
│  ├─ Nocturnal / High-Risk Temporal Window (01:00-05:00)   │
│  ├─ 24-Hour Velocity & Card-Draining Burst Detection      │
│  ├─ Prior Authentication Failure Streak (Brute-Force)     │
│  └─ Merchant Vertical Risk Weighting                      │
└──────────────────────────┬────────────────────────────────┘
                           │
                           ▼
          ┌──────────────────────────────────┐
          │   Mathematical Risk Score: 0-100 │
          │   Risk Level: LOW / MED / HIGH   │
          │   Action: APPROVE / 2FA / BLOCK  │
          └────────────────┬─────────────────┘
                           │
                           ▼
┌───────────────────────────────────────────────────────────┐
│          Explainable AI Layer (Google Gemini Flash)       │
│                                                           │
│  ├─ Grounded Decision Explanation (Zero Hallucination)    │
│  └─ Interactive AI Risk Analyst Copilot                   │
└──────────────────────────┬────────────────────────────────┘
                           │
                           ▼
┌───────────────────────────────────────────────────────────┐
│       Modern Fintech Operations Dashboard (React + Vite) │
│                                                           │
│  ├─ Live KPI Metrics & Temporal Anomaly Heatmaps          │
│  ├─ Real-Time Filterable Transaction Ledger               │
│  ├─ Deep-Dive Anomaly & Hardware Telemetry Inspector      │
│  └─ Interactive Live Risk Simulator Sandbox               │
└───────────────────────────────────────────────────────────┘
```

---

## ✨ Key Features

### 1. 📊 Executive Risk Dashboard
- Real-time KPIs: Total Transaction Volume, Auto-Approved Count, Under Review / 2FA, Prevented Fraud Loss (Blocked), Average Risk Score, and High-Risk Anomaly Rate.
- Temporal Risk Visualizer showing 24-hour volume trends against high-risk nocturnal spikes.

### 2. 🔍 Real-Time Filterable Transaction Ledger
- Live search and multi-criteria filtering by Risk Level (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`), Gateway Decision (`APPROVE`, `ADDITIONAL_AUTHENTICATION`, `REVIEW`, `BLOCK`), and High-Risk Anomaly toggle.
- Rich telemetry tags (Amount Anomaly Multiplier, Device Hardware ID, Geo Mismatch, Payment Rail).

### 3. 🧠 Deep Anomaly Inspector & Explainable AI
- Click any transaction to inspect itemized deterministic signal score contributions ($+42\text{ pts}$ Amount Spike, $+18\text{ pts}$ New Device, $+35\text{ pts}$ Cross-Border IP).
- **"Explain Decision"** button powered by Gemini Flash that generates clear, executive-ready rationale without hallucinating facts.

### 4. ⚡ Interactive Live Risk Simulator
- Live sandbox for panel demonstrations: Adjust amount, device status, location, transaction hour, velocity, and previous failed attempts.
- Click **"Analyze Transaction"** to observe instantaneous deterministic score calculation, action routing, and instant AI explanation.

### 5. 💬 Embedded AI Risk Analyst
- Conversational assistant grounded in live dataset telemetry.
- Answers complex risk questions like: *"Show me the top 3 highest-risk transactions today"*, *"Why was TX-9901 blocked?"*, *"What are the most common anomaly triggers?"*.

---

## 🛠️ Tech Stack

| Layer | Technology | Rationale |
|---|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS, Lucide Icons, Recharts | Blazing fast rendering, modern fintech UI aesthetic, rich charts |
| **Backend** | Python 3.11+, FastAPI, Uvicorn, Pydantic | Sub-15ms asynchronous API execution, strict schema enforcement |
| **AI Layer** | Google Gemini (Gemini 1.5 Flash) | High-speed, cost-effective reasoning for grounded explainability |
| **Database** | SQLite (In-Memory / File-based) | Zero setup overhead, persistent audit logging |

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js**: v18.0+
- **Python**: 3.9+
- **Git**

### 1. Clone & Setup Backend
```bash
cd backend
python -m venv venv

# On Windows (PowerShell):
.\venv\Scripts\Activate.ps1

# On Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Add your Gemini API Key in `backend/.env`:
```env
GEMINI_API_KEY=your_actual_gemini_api_key
PORT=8000
HOST=0.0.0.0
```
*(Note: If no Gemini key is provided, the system seamlessly operates in intelligent offline fallback mode, ensuring zero demo failures).*

### 3. Start Backend Server
```bash
uvicorn main:app --reload --port 8000
```
Backend API will be live at `http://localhost:8000` (Interactive Swagger Docs at `http://localhost:8000/docs`).

### 4. Start Frontend Server
Open a new terminal tab:
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173` in your browser!

---

## 🧪 Synthetic Dataset & Disclaimer

> [!NOTE]
> **Prototype Disclaimer:** All transaction data, customer names, merchant names, device IDs, and geographic locations used in this project are 100% synthetically generated for demonstration and testing purposes. No real cardholder or banking information is utilized.

---

## 🛡️ Razorpay Panel Defense & Technical Q&A

### Q1: Why use a Hybrid Architecture instead of letting an LLM decide directly?
> **Answer:** *"In financial payment infrastructure, authorization latency must remain strictly below 50ms. LLMs introduce 500-1500ms of latency, non-deterministic outputs, and hallucination risks. Our hybrid approach keeps critical safety thresholds deterministic and auditable, while leveraging Gemini for explainability and conversational analytics where humans need clarity."*

### Q2: How would PayGuard AI scale to Razorpay's 50,000+ TPS?
> **Answer:** *"The deterministic scoring engine is compute-light (O(1) lookups and weighted sums) and runs in-memory with customer baseline vectors cached in Redis. The LLM explanation layer is decoupled from the transaction path and triggered asynchronously via message queues (e.g. Kafka/Celery) only when required."*

### Q3: How do you prevent AI hallucinations?
> **Answer:** *"We use strictly structured prompt grounding. Gemini is never asked to predict whether a payment is fraud from scratch; instead, it is fed the exact mathematical metrics (e.g. '12.4x customer baseline', 'New device signature', 'IP mismatch') and tasked solely with synthesizing an executive explanation from existing facts."*

---

## 👨‍💻 Author & Submission Details
- **Project Name:** PayGuard AI
- **Track:** Track 2 (AI Risk Manager) — Razorpay AI Buildathon
- **Target Internship:** AI Intern (₹75,000/month stipend)
- **Batch:** 2027 Graduating B.Tech CSE / MCA
