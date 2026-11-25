import os
from datetime import date, timedelta
import joblib
import pandas as pd
from django.conf import settings
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

_LGBM_MODEL = None

def _get_lgbm():
    global _LGBM_MODEL
    if _LGBM_MODEL is None:
        path = os.path.join(settings.BASE_DIR, 'ai_engine', 'm5_forecaster.pkl')
        _LGBM_MODEL = joblib.load(path)
    return _LGBM_MODEL

@api_view(['POST'])
@permission_classes([AllowAny])
def lgbm_forecast(request):
    """
    Expects JSON: { "price": 85, "history": [0, ..., 4, 6, 9, 16] }
    Returns 7-day rolling LightGBM predictions.
    """
    model = _get_lgbm()
    price = float(request.data.get('price') or 0)
    raw_hist = [float(x) for x in (request.data.get('history') or [])]

    # Strip leading empty days so 4-5 day histories aren't dragged down by zeros
    first_nz = next((i for i, v in enumerate(raw_hist) if v > 0), None)
    series = raw_hist[first_nz:] if first_nz is not None else [0.0]

    preds = []
    today = date.today()

    for step in range(1, 8):
        target_day = today + timedelta(days=step)
        dow = target_day.weekday()  # 0=Mon ... 6=Sun
        recent = series[-7:]
        lag_1 = series[-1]
        lag_7 = series[-7] if len(series) >= 7 else series[0]
        rolling_mean_7 = sum(recent) / len(recent)

        row = pd.DataFrame([{
            'sell_price': price,
            'day_of_week': dow,
            'is_weekend': 1 if dow >= 5 else 0,
            'is_event': 0,
            'lag_1': lag_1,
            'lag_7': lag_7,
            'rolling_mean_7': rolling_mean_7,
        }])

        pred = max(0.0, round(float(model.predict(row)[0]), 2))
        preds.append(pred)
        series.append(pred)  # feed today's prediction into tomorrow's lag_1

    return Response({
        'model': 'LightGBM (m5_forecaster.pkl)',
        'forecast': preds,
        'tomorrow': preds[0],
        'total_7d': round(sum(preds), 2),
    })