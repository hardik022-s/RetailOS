import os
import json
from groq import Groq
from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view
from rest_framework.response import Response
from .models import Category, Product
from .serializers import CategorySerializer, ProductSerializer
from pathlib import Path
from dotenv import load_dotenv

# Explicitly load Backend/.env
load_dotenv(Path(__file__).resolve().parent.parent / ".env", override=True)

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer


class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer

    # Allows React to search by barcode easily
    filterset_fields = ['barcode', 'category']

    @action(detail=False, methods=['post'], url_path='bulk-import')
    def bulk_import(self, request):
        rows = request.data.get('rows', [])
        replace_existing = request.data.get('replace', False)

        if replace_existing:
            Product.objects.all().delete()

        added, updated = 0, 0
        for idx, r in enumerate(rows):
            name = r.get('name')
            if not name:
                continue

            cat_name = r.get('category') or 'General'
            category_obj, _ = Category.objects.get_or_create(name=cat_name)
            barcode = r.get('barcode') or f"SKU-{idx + 1001}"

            product, created = Product.objects.update_or_create(
                barcode=barcode,
                defaults={
                    'name': name,
                    'category': category_obj,
                    'selling_price': float(r.get('price') or 100),
                    'cost_price': float(r.get('cost') or (float(r.get('price') or 100) * 0.8)),
                    'current_stock': int(r.get('stock') if r.get('stock') is not None else 20),
                    'shelf_life_days': int(r.get('shelfLife') or 180),
                }
            )
            if created:
                added += 1
            else:
                updated += 1

        return Response({'added': added, 'updated': updated}, status=status.HTTP_200_OK)


@api_view(['POST'])
def retail_ai_chat(request):
    user_msg = (
        request.data.get('query')
        or request.data.get('message')
        or request.data.get('prompt')
        or request.data.get('text')
        or ''
    ).strip()
    store_ctx = request.data.get('store') or request.data.get('context') or {}

    # 1. Pull live inventory snapshot from SQLite
    products = list(Product.objects.select_related('category').all()[:150])
    total_inventory_value = sum(float(p.current_stock) * float(p.cost_price) for p in products)
    low_stock = [p for p in products if p.current_stock <= 10]
    expiring = [p for p in products if p.shelf_life_days <= 7]

    catalog_lines = [
        f"- ID:{p.id} | {p.name} ({p.category.name if p.category else 'General'}): "
        f"Stock={p.current_stock} pcs, Sell=₹{p.selling_price}, Cost=₹{p.cost_price}, "
        f"Margin=₹{round(float(p.selling_price - p.cost_price), 1)}, ShelfLife={p.shelf_life_days}d"
        for p in products[:50]
    ]

    matched_product = None
    for p in products:
        if p.name.lower() in user_msg.lower() or (p.barcode and p.barcode.lower() in user_msg.lower()):
            matched_product = p
            break
    if not matched_product and low_stock:
        matched_product = low_stock[0]
    elif not matched_product and products:
        matched_product = products[0]

    # 2. System prompt for Groq
    system_prompt = f"""You are RetailAI, an intelligent retail operations copilot built into RetailAI OS for {store_ctx.get('userName', 'Hardik')}'s store ({store_ctx.get('storeName', 'Kirana Store')}).
Speak concisely, directly, and use Indian Rupee (₹) formatting. Cite exact item names, stock counts, selling prices, and unit profit margins from the live database below when answering store or inventory questions.
Use **bold** around key numbers and product names. Keep answers under 3-4 sentences.

STORE SNAPSHOT:
- Total Active Catalog Items: {len(products)}
- Total Inventory Valuation (Cost): ₹{int(total_inventory_value):,}
- Today's Sales: ₹{store_ctx.get('salesToday', 0):,}
- Low Stock Items (<=10 left): {len(low_stock)} items ({', '.join(p.name for p in low_stock[:8]) if low_stock else 'None'})
- Expiring Soon (<=7 days): {len(expiring)} items ({', '.join(p.name for p in expiring[:6]) if expiring else 'None'})

MERCHANDISE CATALOG:
{chr(10).join(catalog_lines)}

Respond ONLY in valid JSON with this exact schema:
{{
  "reply": "Your concise markdown response with **bold** metrics.",
  "show_widget": true,
  "action_text": "Concrete 1-sentence restock or operational recommendation with estimated profit in ₹ (or empty string if casual greeting).",
  "recommended_qty": 20
}}
Set "show_widget": false if the user is just saying hi, asking who you are, or making casual small talk."""

    env_path = Path(__file__).resolve().parent.parent / ".env"
    load_dotenv(dotenv_path=env_path, override=True)
    api_key = os.getenv("GROQ_API_KEY", "").strip().strip('"').strip("'")

    show_widget = True
    try:
        client = Groq(api_key=api_key)
        completion = client.chat.completions.create(
            model="openai/gpt-oss-120b",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_msg or "Give me a quick store restock briefing."},
            ],
            temperature=0.3,
            max_tokens=1500,
            response_format={"type": "json_object"},
        )
        ai_data = json.loads(completion.choices[0].message.content)
        reply_text = ai_data.get("reply") or "Here is your store inventory analysis."
        action_text = ai_data.get("action_text") or ""
        show_widget = bool(ai_data.get("show_widget", True))
        try:
            rec_qty = int(ai_data.get("recommended_qty") or 20)
        except (ValueError, TypeError):
            rec_qty = 20
    except Exception as e:
        reply_text = f"Groq API error: {str(e)}"
        action_text = ""
        rec_qty = 20
        show_widget = False

    # If casual greeting ("hi", "who are you"), return clean text without chart/PO card
    if not show_widget or not matched_product:
        return Response({
            "text": reply_text,
            "reply": reply_text,
        })

    unit_profit = round(float(matched_product.selling_price - matched_product.cost_price), 2)
    item_name = matched_product.name
    base_stock = max(2, int(matched_product.current_stock))
    chart_data = [
        max(4, base_stock + 3),
        max(7, base_stock + 6),
        max(5, base_stock + 4),
        max(8, base_stock + 7),
        rec_qty,
    ]

    return Response({
        "text": reply_text,
        "reply": reply_text,
        "chart": {
            "title": f"{item_name} · units/day (dashed = AI prediction)",
            "data": chart_data,
            "labels": ["Tue", "Wed", "Thu", "Fri", "Sun"],
            "highlight": 4,
            "predictedFrom": 4,
        },
        "tip": action_text or (
            f"Order **{rec_qty} pcs** of **{item_name}** to avoid stockout. "
            f"Est. profit **₹{int(rec_qty * unit_profit):,}**."
        ),
        "actions": [
            {
                "kind": "po",
                "productId": str(matched_product.id),
                "qty": rec_qty,
                "label": f"Add {rec_qty} to Order",
            },
            {
                "kind": "nav",
                "view": "forecast",
                "label": "Review in AI Forecast",
            },
        ],
    })