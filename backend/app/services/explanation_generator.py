from abc import ABC, abstractmethod
from typing import List, Dict, Any
import numpy as np

class ExplanationGenerator(ABC):
    @abstractmethod
    def generate(self, shap_values: List[Dict[str, Any]], expected_value: float, prediction: float, is_regression: bool, prediction_prob: float = None) -> Dict[str, str]:
        pass

class RuleBasedExplanationGenerator(ExplanationGenerator):
    def generate(self, shap_values: List[Dict[str, Any]], expected_value: float, prediction: float, is_regression: bool, prediction_prob: float = None) -> Dict[str, str]:
        # Sort features by absolute contribution to find main drivers
        sorted_shap = sorted(shap_values, key=lambda x: abs(x['contribution']), reverse=True)
        top_drivers = sorted_shap[:3] if len(sorted_shap) >= 3 else sorted_shap
        
        # Prediction section
        if is_regression:
            pred_text = f"The model predicted a continuous value of {prediction:,.2f}."
            conf_text = "Confidence scoring is not directly applicable for regression predictions."
        else:
            # Classification
            if prediction_prob is not None:
                pred_text = f"The model predicted class '{prediction}' with {prediction_prob*100:.1f}% probability."
                if prediction_prob > 0.8:
                    conf_text = "The model is highly confident in this prediction."
                elif prediction_prob > 0.6:
                    conf_text = "The model has moderate confidence in this prediction."
                else:
                    conf_text = "The model has low confidence in this prediction. Interpret with caution."
            else:
                pred_text = f"The model predicted class '{prediction}'."
                conf_text = "Probability scores are unavailable for this model type."

        # Drivers section
        if not top_drivers:
            drivers_text = "No strong driving features were detected."
        else:
            driver_phrases = []
            for d in top_drivers:
                feat = d['feature']
                cont = d['contribution']
                direction = "increased" if cont > 0 else "decreased"
                if abs(cont) / (abs(expected_value) + 1e-9) > 0.2:
                    driver_phrases.append(f"{feat} {direction} the prediction considerably")
                else:
                    driver_phrases.append(f"{feat} {direction} the prediction slightly")
            
            drivers_text = "This prediction is primarily driven by " + ", and ".join([d['feature'] for d in top_drivers]) + ". "
            drivers_text += ". ".join([p.capitalize() for p in driver_phrases]) + "."

        return {
            "prediction": pred_text,
            "drivers": drivers_text,
            "confidence": conf_text
        }
