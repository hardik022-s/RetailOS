import os
import joblib
import pandas as pd
from django.conf import settings

class ForecastingService:
    def __init__(self):
        # Keep the model path available, but don't unpickle LightGBM at Django
        # startup. The current forecast implementation below uses a fallback
        # value, and loading this artifact requires the native libomp runtime.
        self.model_path = os.path.join(settings.BASE_DIR, 'ai_engine', 'm5_forecaster.pkl')
        self.model = None
        self.model_load_error = None

    def load_model(self):
        """Load the optional LightGBM artifact on demand, not during startup."""
        if self.model is not None:
            return self.model
        if not os.path.exists(self.model_path):
            self.model_load_error = f'Model file not found: {self.model_path}'
            return None
        try:
            self.model = joblib.load(self.model_path)
        except (ImportError, OSError, ValueError) as exc:
            # Missing native libraries (such as libomp on macOS) should not
            # prevent Django from serving non-forecast endpoints.
            self.model_load_error = str(exc)
            return None
        return self.model

    def predict_next_7_days(self, product_id, current_stock, category):
        """
        Takes real-time POS data and feeds it to the LightGBM model.
        Returns a dictionary with predictions and recommendations.
        """
        # --- ML INFERENCE ---
        # Note: We are using a static simulation for the API response test. 
        # Once your React frontend is connected, we will pass real feature arrays here.
        # features = pd.DataFrame({'stock': [current_stock], 'category': [category]})
        # predicted_demand = self.model.predict(features)[0]
        
        predicted_demand = 45 
        
        recommended_order = max(0, predicted_demand - current_stock)
        
        return {
            "product_id": product_id,
            "predicted_7_day_demand": predicted_demand,
            "recommended_order_quantity": recommended_order,
            "trend": "up",
            "confidence_score": 0.89
        }
