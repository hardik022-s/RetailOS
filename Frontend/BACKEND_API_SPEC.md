# RetailOS · Backend API Specification & Integration Guide

This document defines the complete REST API contract between the **RetailOS** frontend (HTML/CSS/JS/Chart.js) and your backend (FastAPI / Express / Django / Flask).

When the frontend loads, it automatically pings `GET /api/health`.
- If your backend is **offline**, a subtle pill badge in the bottom-left shows:  
  `● Backend not connected · showing demo data [Retry]`  
  All POS billing, demand graphs, OCR, and AI assistant features continue to function seamlessly using local storage and deterministic retail algorithms.
- When your backend is **started**, clicking **Retry** (or waiting for the automatic 10-second poll) connects immediately. All operations synchronize live with your backend and LLM.

---

## 1. Quick Start: Ready-to-Run FastAPI Server

Save this as `server.py` in your backend folder and run `uvicorn server:app --reload --port 8000`:

```python
from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import time, uuid

app = FastAPI(title="RetailOS Backend & LLM Service")

# Enable CORS for the frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/health")
def health():
    return {"status": "ok", "timestamp": int(time.time() * 1000)}

class LoginRequest(BaseModel):
    method: str  # "email" or "phone"
    identifier: str
    password: str
    name: Optional[str] = None
    store: Optional[str] = None

@app.post("/api/auth/login")
@app.post("/api/auth/signup")
def auth(req: LoginRequest):
    return {
        "token": f"jwt_{uuid.uuid4().hex[:16]}",
        "user": {
            "name": req.name or "Rajesh Kumar",
            "store": req.store or "Kirana Store",
            "identifier": req.identifier
        }
    }

class GoogleAuthRequest(BaseModel):
    code: str

@app.post("/api/auth/google")
def google_auth(req: GoogleAuthRequest):
    # Exchange req.code with Google OAuth2 token endpoint
    return {
        "token": f"jwt_google_{uuid.uuid4().hex[:16]}",
        "user": {
            "name": "Rajesh Kumar",
            "store": "Kirana Store"
        }
    }

class ChatRequest(BaseModel):
    query: str
    store: Optional[dict] = None

@app.post("/api/assistant/chat")
def assistant_chat(req: ChatRequest):
    """
    Connect your LLM here (e.g. Gemini, OpenAI, Claude, or local Ollama / vLLM).
    Returns text, interactive chart data, actionable tip, and quick action buttons.
    """
    q = req.query.lower()
    
    # Example intelligent LLM response payload:
    return {
        "text": f"Analyzing store data for: **{req.query}**.\nDemand trends show healthy movement across dairy and staple categories.",
        "chart": {
            "title": "Hourly Footfall & Sales Velocity",
            "data": [1200, 2400, 3100, 4800, 5200, 3900],
            "labels": ["8a", "10a", "12p", "2p", "4p", "6p"],
            "highlight": 4
        },
        "tip": "Restock high-velocity items before the 5 PM evening peak.",
        "actions": [
            {"kind": "nav", "view": "forecast", "label": "Review Forecasts"}
        ]
    }
```

---

## 2. API Endpoints Overview

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Status check for live sync indicator |
| `POST` | `/api/auth/login` | Email/Phone password authentication |
| `POST` | `/api/auth/signup` | New store account creation |
| `POST` | `/api/auth/google` | Google OAuth2 code exchange |
| `POST` | `/api/auth/logout` | Session invalidation |
| `GET` | `/api/store/state` | Retrieves full store state (products, bills, pos, wastage) |
| `POST` | `/api/store/profile` | Updates store and owner name |
| `POST` | `/api/bills/checkout` | Records atomic transaction, updates inventory |
| `POST` | `/api/bills/{id}/settle` | Marks a khata credit bill settled |
| `POST` | `/api/orders/po` | Creates a new purchase order |
| `POST` | `/api/orders/po/{id}/receive` | Receives delivery, increments stock |
| `POST` | `/api/products/{id}/stock-in` | Direct stock adjustment |
| `POST` | `/api/products/{id}/markdown` | Applies/clears expiry markdown discount |
| `POST` | `/api/products` | Creates or updates a product |
| `POST` | `/api/wastage` | Logs damaged or expired stock loss |
| `POST` | `/api/import` | Multipart CSV / photo OCR upload |
| `POST` | `/api/assistant/chat` | Conversational LLM assistant endpoint |

---

## 3. Detailed Payload Specifications

### 3.1 Checkout (`POST /api/bills/checkout`)
**Request:**
```json
{
  "items": [
    {
      "productId": "milk",
      "name": "Amul Taaza Milk (500ml)",
      "unit": "pkt",
      "qty": 2,
      "price": 27,
      "cost": 24,
      "gst": 0
    }
  ],
  "payment": "UPI",
  "customer": "Rajesh"
}
```
**Response (200 OK):**
```json
{
  "id": "b_7f8a9e",
  "no": 1035,
  "time": 1731307200000,
  "items": [...],
  "subtotal": 54,
  "tax": 0,
  "total": 54,
  "payment": "UPI",
  "customer": "Rajesh",
  "settled": false
}
```

### 3.2 AI Assistant (`POST /api/assistant/chat`)
**Request:**
```json
{
  "query": "How much milk is left?",
  "store": {
    "storeName": "Kirana Store",
    "userName": "Rajesh",
    "productsCount": 19,
    "salesToday": 14200
  }
}
```

**Response (200 OK):**
```json
{
  "text": "You have **14 pkts** of Amul Taaza Milk left (46 sold today). At current pace it runs out **Today 5:30 PM**.\nNote: **14 pkts** expire within 24h.",
  "chart": {
    "title": "Amul Taaza Milk · units/day (dashed = AI prediction)",
    "data": [39, 55, 50, 46, 52],
    "labels": ["Sat", "Sun", "Mon", "Tue", "Wed"],
    "predictedFrom": 4
  },
  "tip": "Order **45 pkts** today to keep stock fresh for tomorrow.",
  "actions": [
    { "kind": "po", "productId": "milk", "qty": 45, "label": "Add 45 to Order" },
    { "kind": "waste", "productId": "milk", "label": "Log wastage" }
  ]
}
```

---

## 4. Configuring Frontend for Your Backend

Open `js/config.js` and set your backend IP / domain:

```javascript
const CFG = {
  API_BASE: 'http://localhost:8000/api', // Change to your live server URL
  GOOGLE_CLIENT_ID: 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com',
  // ...
};
```
Or set them dynamically without editing files:
```html
<script>
  window.RETAILOS_API_BASE = 'https://api.yourdomain.com/api';
  window.RETAILOS_GOOGLE_CLIENT_ID = 'your-client-id.apps.googleusercontent.com';
</script>
```
