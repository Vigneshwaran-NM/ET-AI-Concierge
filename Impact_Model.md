# 💰 ET AI Concierge — Business Impact Model

## Executive Summary

ET AI Concierge automates financial advisory tasks that traditionally require human advisors or expensive subscriptions. This document quantifies the estimated business impact in three dimensions: **time saved**, **cost reduced**, and **revenue recovered/generated**.

---

## Assumptions

| Parameter | Value | Rationale |
|-----------|-------|-----------|
| Target user base (Year 1) | 10,000 monthly active users | ET has 50M+ monthly visitors; 0.02% adoption is conservative |
| Avg. queries per user/month | 15 | Mix of daily traders (30+) and casual users (5) |
| Human advisor cost per query | ₹200–500 | Based on SEBI-registered advisor consultation rates |
| Platform subscription (if monetized) | ₹299/month or ₹2,499/year | Comparable to ET Prime (₹2,499/year) |
| AI cost per query | ₹0.50 | HuggingFace free tier + Tavily free tier (1000 searches/month) |
| Time to get human advisor response | 24–48 hours | Typical response time for non-premium advisor services |
| Time to get ET AI response | 3–5 seconds | Measured in testing (Tavily + Qwen 7B) |
| Avg. portfolio size of target user | ₹5–25 lakhs | Early career to mid-career Indian investors |

---

## 1. Time Saved

### For Individual Users

| Task | Without ET AI | With ET AI | Time Saved |
|------|--------------|-----------|------------|
| Research a stock/fund | 30–60 min (Google, forums, articles) | 5 sec (real-time AI answer + sources) | **~55 min** |
| Analyze a portfolio PDF | 2–4 hours (manual spreadsheet) | 10 sec (upload → AI analysis) | **~3 hours** |
| Check if asset allocation is optimal | 1–2 hours (consult advisor) | 5 sec (ask AI with risk profile) | **~90 min** |
| Get latest market news summary | 20–30 min (read 10+ articles) | 5 sec (Tavily + AI summary) | **~25 min** |

### Aggregate Time Savings (10,000 users)

```
Conservative estimate:
  10,000 users × 15 queries/month × 25 min saved/query = 62,500 hours/month

That's ≈ 750,000 hours/year of collective user time saved.

Monetized at ₹500/hour (avg. professional rate):
  → ₹37.5 crore/year in time value returned to users
```

---

## 2. Cost Reduced

### AI vs. Human Advisor Cost Comparison

| Metric | Human Advisor | ET AI Concierge | Savings |
|--------|--------------|-----------------|---------|
| Cost per query | ₹200–500 | ₹0.50 | **99.8% reduction** |
| Monthly cost (15 queries) | ₹3,000–7,500 | ₹7.50 | **₹3,000–7,500/user** |
| Annual cost per user | ₹36,000–90,000 | ₹90 | **₹35,910–89,910/user** |

### Aggregate Cost Savings

```
10,000 users × ₹36,000 avg saved/year = ₹36 crore/year in advisory costs avoided

Even at the low end (₹3,000/month saved × 10,000 users):
  → ₹36 crore/year saved across the user base
```

### Platform Operating Costs

```
Infrastructure costs (Year 1):
  - MongoDB Atlas (M10): ₹5,000/month
  - Server hosting (2 vCPU): ₹3,000/month
  - Tavily API (paid plan): ₹7,000/month
  - HuggingFace Pro: ₹8,000/month
  ─────────────────────────
  Total: ≈ ₹23,000/month = ₹2.76 lakh/year

Cost per query: ₹2.76L ÷ (10,000 × 15 × 12) = ₹0.15/query
```

---

## 3. Revenue Opportunity

### Direct Monetization (SaaS Model)

```
Freemium model:
  - Free tier: 5 queries/day, no file upload
  - Premium (₹299/month): unlimited queries, PDF analysis, voice, portfolio tracking

Conversion assumption: 5% of 10,000 MAU → 500 paying users

Revenue:
  500 users × ₹299/month × 12 = ₹17.94 lakh/year
```

### ET Prime Upsell (Partnership Model)

```
If ET AI Concierge drives 2% of users to subscribe to ET Prime (₹2,499/year):

  10,000 × 2% × ₹2,499 = ₹5.0 lakh/year in affiliate/upsell revenue
```

### Enterprise / B2B Licensing

```
License to wealth management firms or banks:
  - 5 enterprise clients × ₹10 lakh/year = ₹50 lakh/year

These firms would embed ET AI Concierge as a white-label advisory tool
for their own customers, reducing their support costs by 60–80%.
```

### Total Revenue Potential (Year 1)

| Revenue Stream | Estimate |
|----------------|----------|
| Premium subscriptions | ₹17.94 lakh |
| ET Prime upsells | ₹5.0 lakh |
| Enterprise licensing | ₹50 lakh |
| **Total** | **₹72.94 lakh/year** |

---

## 4. Summary Dashboard

```
┌─────────────────────────────────────────────────────────┐
│                 IMPACT SUMMARY (Year 1)                  │
├──────────────────────┬──────────────────────────────────┤
│ Time Saved           │ 750,000+ hours/year              │
│ Cost Avoided         │ ₹36 crore/year (advisory fees)   │
│ Operating Cost       │ ₹2.76 lakh/year                  │
│ Revenue Potential    │ ₹72.94 lakh/year                 │
│ ROI                  │ ~2,643% (revenue ÷ operating)    │
│ Cost Per Query       │ ₹0.15 (vs ₹200–500 human)       │
│ Response Time        │ 3–5 sec (vs 24–48 hr human)      │
└──────────────────────┴──────────────────────────────────┘
```

---

## 5. Non-Quantifiable Benefits

- **Financial democratization** — affordable advice for Tier 2/3 city investors who lack access to personal advisors
- **Real-time edge** — Tavily integration means advice is always based on today's news, not last week's
- **Personalization at scale** — every response adapts to the user's risk profile, unlike generic articles
- **Retention driver for ET ecosystem** — users who use AI Concierge daily are more likely to subscribe to ET Prime
- **Data moat** — anonymized query patterns reveal what retail investors care about (valuable for ET editorial and advertising)

---

## Methodology Note

All figures use **back-of-envelope estimation** with conservative assumptions. Actual impact will vary based on adoption rates, user engagement, and market conditions. The model intentionally uses the lower bound of ranges to avoid overstating impact.
