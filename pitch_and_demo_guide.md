# 🎤 PayGuard AI — Pitch Script & Panel Defense Guide

> **Razorpay AI Buildathon (Track 2: AI Risk Manager)**
> **Role:** AI Intern (₹75k/month)

---

## 🎯 1-Line Tagline
> **"PayGuard AI is an autonomous, hybrid payment risk intelligence engine that delivers sub-15ms deterministic fraud prevention coupled with explainable generative AI for modern fintech gateways."**

---

## ⏱️ 2-Minute Video / Demo Pitch Script

### [0:00 - 0:25] The Problem & Hook
*"Hi everyone, I'm excited to present **PayGuard AI**, built for Track 2 (AI Risk Manager) of the Razorpay AI Buildathon.*

*Modern payment gateways face a massive dilemma: If you rely solely on rigid static rules, you suffer high false-positive rates and frustrate genuine buyers. But if you blindly use a black-box LLM to approve or reject payments, you face 1-second latency delays, hallucinations, and non-compliance with financial regulations.*

*How do we get sub-15ms deterministic safety AND intelligent, explainable AI? That's why I built PayGuard AI."*

### [0:25 - 0:50] The Solution & Architecture
*"PayGuard AI uses a **Hybrid Architecture**.*
*Every incoming transaction first flows through a high-speed deterministic anomaly engine in Python and FastAPI. It analyzes 7 behavioral dimensions: amount multipliers against historical averages, hardware device fingerprints, geolocation travel anomalies, midnight high-risk windows, 24-hour velocity bursts, and prior authentication failure streaks.*

*This produces an auditable mathematical risk score from 0 to 100 in under 10 milliseconds, triggering instant routing: **Approve, Step-Up 2FA, Review, or Hard Block**.*

*Then, we decouple the AI layer powered by Google's Gemini Flash. Gemini takes the computed telemetry and generates grounded, human-readable explanations for fraud analysts and merchants without any hallucination."*

### [0:50 - 1:30] Live Product Walkthrough
*(Show the dashboard screen)*
*"Here is our live operations dashboard:*
1. *At the top, we see real-time KPIs: ₹2.4 Lakhs in protected volume, auto-approval rates, and the 24-hour temporal risk distribution showing nocturnal fraud spikes between 1 AM and 5 AM.*
2. *In the transaction ledger, notice transaction **TX-9901**. It was blocked because Rohan Mehta, whose normal average is ₹2,400, attempted a ₹94,500 Apple Store purchase from Moscow on an unrecognized device at 2:40 AM.*
3. *When I click **'Explain Decision'**, Gemini analyzes the structured signals and provides an instant executive rationale.*
4. *Next, let's switch to the **Live Risk Simulator**. Let's test a normal ₹450 Swiggy order on a known phone in Bangalore — Risk Score is 0 (APPROVE). Now let's change the amount to ₹85,000 at 3 AM on a new device from a foreign location. Instantly, the score jumps to 94 (BLOCK), and Gemini explains the exact multi-vector risk trigger.*
5. *Finally, in the **AI Risk Analyst** tab, risk operators can query the ledger in natural language, asking 'Show me the top 3 riskiest transactions today' and receive grounded, instant answers."*

### [1:30 - 2:00] Business Impact for Razorpay & Wrap-up
*"For Razorpay, this architecture delivers three critical advantages:*
- *Zero latency overhead on live payment authorization.*
- *100% regulatory compliance and auditability.*
- *Dramatically reduced operational costs for fraud review teams.*

*Thank you, and I look forward to contributing as an AI Intern at Razorpay!"*

---

## 🛡️ Razorpay Panel Defense: Master Q&A Bank

### 1. "Why is this AI? Why didn't you just use static rules?"
> **Your Answer:** 
> *"A payment risk system cannot be solely static rules because rules don't explain themselves to customers or merchants, leading to support ticket backlogs and opaque chargebacks. On the flip side, a system cannot be pure LLM because of latency and hallucination risks. 
> 
> Our system is AI-driven in two key areas: 
> 1) Dynamic multi-variable feature weighting that adapts to contextual baselines.
> 2) Explainable Generative AI (Gemini) that bridges complex mathematical telemetry into human-comprehensible reasoning and natural language dataset exploration."*

### 2. "How would you handle latency at Razorpay scale (50,000+ TPS)?"
> **Your Answer:** 
> *"The live authorization path and the AI explanation path are completely decoupled.
> - The deterministic risk scoring runs in-memory in under 10ms. Customer baseline profiles (rolling 30-day averages, device hashes, frequent cities) are stored in Redis cache clusters.
> - The LLM is never on the blocking path of the gateway. Gemini is called asynchronously via background workers (Kafka/Celery) when generating audit logs or on-demand when a fraud analyst opens the dashboard."*

### 3. "How do you prevent Gemini from hallucinating or making up transaction facts?"
> **Your Answer:** 
> *"We use Strict Grounded Prompting. We do not ask the LLM 'Do you think this transaction is fraud?'. Instead, we pass the exact structured JSON telemetry computed by the risk engine: the amount ratio, device novelty flag, velocity count, and location deviation. We restrict the prompt strictly to summarizing the provided evidence. If the API is offline, our deterministic template engine generates the explanation as a zero-failure fallback."*

### 4. "What metrics would you use to evaluate this system in production?"
> **Your Answer:** 
> 1. **Precision & Recall on Fraud:** Balancing False Positive Rate (FPR) to avoid declining genuine users vs False Negative Rate (FNR) to prevent fraud loss.
> 2. **P99 Gateway Latency:** Ensuring authorization completes in $<50\text{ms}$.
> 3. **Merchant Dispute / Chargeback Rate:** Tracking post-transaction dispute reduction.
> 4. **Review Queue Turnaround Time:** How fast human analysts resolve flagged transactions using AI summaries.

### 5. "How would you handle Concept Drift (fraudsters changing tactics)?"
> **Your Answer:** 
> *"In production, we would implement:
> 1. Rolling window feature updates (e.g. 7-day, 30-day customer velocity baselines).
> 2. Automated anomaly threshold calibration using unsupervised clustering (e.g. Isolation Forests / DBSCAN).
> 3. Active feedback loops where fraud analyst approvals/rejections feed back into the feature weighting pipeline to continuously adapt weights."*

### 6. "What are the limitations of this prototype?"
> **Your Answer:** 
> *"Because this was built within 24 hours for the Buildathon:
> 1. We used a synthetic dataset rather than live banking feeds.
> 2. Geolocation distance is evaluated via categorical city/state mapping rather than exact IP-to-Geo Haversine velocity calculation (impossible travel speed).
> 3. In full production, we would integrate Graph Neural Networks (GNNs) to detect mule account networks across multiple merchants."*
