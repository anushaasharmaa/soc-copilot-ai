import os
import json
import logging
import google.generativeai as genai
from config import config

logger = logging.getLogger(__name__)

# Configure Gemini if key is provided
if config.GEMINI_API_KEY:
    genai.configure(api_key=config.GEMINI_API_KEY)
else:
    logger.warning("GEMINI_API_KEY is not set in environment or config.")

def analyze_threats(parsed_logs: list[dict], extracted_iocs: dict) -> dict:
    """
    Calls Google's Gemini API to analyze parsed logs and extracted IOCs for threats.
    """
    default_response = {
        "attack_type": "Unknown",
        "severity": "Low",
        "risk_score": 0,
        "confidence": 0,
        "mitre_attack": "N/A",
        "tactic": "N/A",
        "technique": "N/A",
        "reasoning": "Gemini API threat analysis is unconfigured or failed.",
        "recommended_actions": []
    }
    
    if not config.GEMINI_API_KEY:
        raise ValueError("Gemini API key is missing. Please set GEMINI_API_KEY in your environment.")
        
    try:
        # Load prompt template
        prompt_path = os.path.join(os.path.dirname(__file__), "../prompts/threat_prompt.txt")
        if not os.path.exists(prompt_path):
            raise FileNotFoundError(f"Prompt template file not found at {prompt_path}")
            
        with open(prompt_path, "r") as f:
            prompt_template = f.read()
            
        # Format prompt with logs and IOCs JSON
        formatted_prompt = prompt_template.replace(
            "{logs}", json.dumps(parsed_logs, indent=2)
        ).replace(
            "{iocs}", json.dumps(extracted_iocs, indent=2)
        )
        
        # Configure model
        model = genai.GenerativeModel(
            model_name="gemini-2.5-flash",
            generation_config={"response_mime_type": "application/json"}
        )
        
        # Call Gemini API
        response = model.generate_content(formatted_prompt)
        
        if response and response.text:
            cleaned_text = response.text.strip()
            # Clean markdown wrappers if present
            if cleaned_text.startswith("```json"):
                cleaned_text = cleaned_text[7:]
            if cleaned_text.endswith("```"):
                cleaned_text = cleaned_text[:-3]
            cleaned_text = cleaned_text.strip()
            
            result = json.loads(cleaned_text)
            
            # Normalize response matching exact keys
            final_res = {}
            for key, val in default_response.items():
                if key in result:
                    if key in ["risk_score", "confidence"]:
                        try:
                            final_res[key] = int(result[key])
                        except (ValueError, TypeError):
                            final_res[key] = 0
                    elif key == "recommended_actions":
                        if isinstance(result[key], list):
                            final_res[key] = [str(x) for x in result[key] if x is not None]
                        else:
                            final_res[key] = []
                    else:
                        final_res[key] = str(result[key])
                else:
                    final_res[key] = val
            return final_res
        else:
            raise Exception("Empty response text received from Gemini API")
            
    except Exception as e:
        logger.exception("Exception occurred in threat_analysis_service during analysis")
        raise e
