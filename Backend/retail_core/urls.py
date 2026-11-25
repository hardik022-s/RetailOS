import json
import time
import uuid
from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from ai_engine.services import ForecastingService
from inventory.views import retail_ai_chat
from ai_engine.views import lgbm_forecast

ai_service = ForecastingService()

# In-memory store state synced with the frontend
STORE_STATE = {}

def health_check(request):
    return JsonResponse({"status": "ok", "timestamp": int(time.time() * 1000)})

@csrf_exempt
def auth_handler(request):
    body = json.loads(request.body or "{}")
    return JsonResponse({
        "token": f"jwt_{uuid.uuid4().hex[:16]}",
        "user": {
            "name": body.get("name") or "Hardik Sharma",
            "store": body.get("store") or "Kirana Store",
            "identifier": body.get("identifier", "")
        }
    })

@csrf_exempt
def store_state(request):
    # Returning an empty object lets store.js keep its seed products while staying Online
    return JsonResponse(STORE_STATE)

@csrf_exempt
def bills_checkout(request):
    body = json.loads(request.body or "{}")
    items = body.get("items", [])
    subtotal = sum(i.get("price", 0) * i.get("qty", 1) for i in items)
    return JsonResponse({
        "id": f"b_{uuid.uuid4().hex[:6]}",
        "no": int(time.time()) % 10000,
        "time": int(time.time() * 1000),
        "items": items,
        "subtotal": subtotal,
        "tax": 0,
        "total": subtotal,
        "payment": body.get("payment", "UPI"),
        "customer": body.get("customer"),
        "settled": False
    })

@csrf_exempt
def pos_invoices_compat(request):
    # Compatibility handler for your custom handleCheckout() button
    body = json.loads(request.body or "{}")
    items = body.get("items", [])
    return JsonResponse({
        "status": "success",
        "invoice_id": f"inv_{uuid.uuid4().hex[:6]}",
        "total_amount": body.get("total_amount", len(items))
    }, status=201)

@csrf_exempt
def assistant_chat(request):
    body = json.loads(request.body or "{}")
    query = body.get("query", "")
    
    # Call your LightGBM ForecastingService from ai_engine/services.py
    prediction = ai_service.predict_next_7_days(
        product_id="milk",
        current_stock=14,
        category="Dairy & Eggs"
    )
    demand = prediction.get("predicted_7_day_demand", 45)
    order_qty = prediction.get("recommended_order_quantity", 31)
    conf = int(prediction.get("confidence_score", 0.89) * 100)

    return JsonResponse({
        "text": (
            f"LightGBM M5 Forecast for **{query}**:\n"
            f"Predicted 7-day demand is **{demand} units** ({conf}% confidence). "
            f"Recommended restock order: **{order_qty} units**."
        ),
        "chart": {
            "title": "7-Day AI Demand Forecast (LightGBM)",
            "data": [38, 42, 40, 44, demand],
            "labels": ["Day -3", "Day -2", "Day -1", "Today", "Next 7d"],
            "predictedFrom": 4
        },
        "tip": f"Order **{order_qty} units** today based on M5 LightGBM trend analysis.",
        "actions": [
            {"kind": "nav", "view": "forecast", "label": "Open AI Forecast"}
        ]
    })

@csrf_exempt
def generic_ok(request, *args, **kwargs):
    return JsonResponse({"status": "ok"})

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # Core RetailOS Frontend Spec Endpoints
    path('api/health', health_check),
    path('api/auth/login', auth_handler),
    path('api/auth/signup', auth_handler),
    path('api/auth/google', auth_handler),
    path('api/auth/logout', generic_ok),
    path('api/store/state', store_state),
    path('api/store/profile', generic_ok),
    path('api/bills/checkout', bills_checkout),
    path('api/pos/invoices/', pos_invoices_compat),
    
    # 2. Hook up your Groq RetailAI endpoint to match frontend calls:
    path('api/assistant/chat', retail_ai_chat),
    path('api/assistant/chat/', retail_ai_chat),
    path('api/chat', retail_ai_chat),
    path('api/chat/', retail_ai_chat),
    path('api/ai/forecast', lgbm_forecast),
    path('api/ai/forecast/', lgbm_forecast),

    path('api/orders/po', generic_ok),
    path('api/wastage', generic_ok),
    path('api/notices/mark-read', generic_ok),
    path('api/recommendations/dismiss', generic_ok),

    # Existing Django App Routes
    path('api/inventory/', include('inventory.urls')),
    path('api/pos/', include('pos.urls')),
]