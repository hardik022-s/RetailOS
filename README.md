# RetailOS — AI-Powered Retail Inventory & POS Framework

**RetailOS** is a full-stack retail intelligence platform built for small-to-mid-sized stores (kirana and neighbourhood shops). It combines smart POS billing, real-time inventory tracking, live **LightGBM** 7-day demand forecasting, and a **Groq LLM** conversational assistant in a single lightweight web application.

---

## Key Features

* **Live ML Demand Forecasting (`LightGBM Live`):** Runs recursive 7-day demand predictions via a trained `LGBMRegressor` (`m5_forecaster.pkl`) served over Django REST Framework (`POST /api/ai/forecast/`), adapting dynamically to surges, declines, and weekend patterns.
* **Shelf-Life & Restock Optimisation:** Automatically converts 7-day demand forecasts into shelf-life-aware purchase orders (e.g., 1-day cover for perishables ≤ 2 days; up to 7 days otherwise) and flags run-out alerts.
* **Connected POS Billing:** Supports barcode scanning and manual selection with **UPI, Cash, and Khata** payment modes, automatic stock deduction, and printable receipts.
* **Multi-Format Data Import:** Upload sales and stock data via CSV, Excel, Word, PDF, Google Sheets, or photo OCR with chronological date-mapped history tracking.
* **Conversational AI Assistant:** Powered by Groq LLM with live store context (stock, margins, expiry, and low-stock alerts) and one-tap PO approval.
* **Bilingual & Offline-Resilient UI:** Full English and Hindi interface with browser `localStorage` fallback so billing continues even if the backend is offline.

---

## Machine Learning Pipeline

* **Dataset:** M5 Forecasting (Walmart) — 100-item sample across 3 categories (`Foods`, `Hobbies`, `Household`) and 7 departments.
* **Model:** `LightGBM` (`LGBMRegressor`) — 150 trees, 31 leaves per tree, learning rate `0.1`, squared-error regression objective.
* **Input Features (7):** `sell_price`, `day_of_week`, `is_weekend`, `is_event`, `lag_1`, `lag_7`, `rolling_mean_7`.
* **Inference:** Rolling 7-day recursive forecasting where each predicted day feeds into the next day's `lag_1` and `rolling_mean_7`.

---

## Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Backend** | Django, Django REST Framework, `django-cors-headers`, Gunicorn |
| **Machine Learning** | LightGBM, scikit-learn, pandas, NumPy, SciPy, joblib |
| **AI Assistant** | Groq API (`openai/gpt-oss-120b`) |
| **Database** | SQLite (prototype) + Browser `localStorage` fallback |
| **Frontend** | HTML5, Vanilla JavaScript, Tailwind CSS, Chart.js |

## Deployment (Render)

RetailOS is configured for one-click deployment on **Render** using `render.yaml`:
* **Backend Web Service (`retailos-backend`):** Django REST API + LightGBM (`m5_forecaster.pkl`) served via Gunicorn (`--workers 1`).
* **Frontend Static Site (`retailos-frontend`):** Vanilla JS & Tailwind CSS dashboard connected to the live backend API.
* **Environment Variable:** Requires `GROQ_API_KEY` set in Render for the conversational AI assistant.

*(Live URL will be added here once Render deployment is active.)*

---

## Team

Developed for **Statistical Machine Learning** at **Bennett University**:
* **Hardik Sharma**
* **Aishwarya Bisaria**
