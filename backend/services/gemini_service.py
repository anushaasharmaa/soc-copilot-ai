import os
import json
import logging
import google.generativeai as genai
from config import config

logger = logging.getLogger(__name__)

# Initialize Gemini if key is provided
if config.GEMINI_API_KEY:
    genai.configure(api_key=config.GEMINI_API_KEY)
else:
    logger.warning("GEMINI_API_KEY is not set in environment or config.")

def extract_iocs_from_logs(parsed_logs: list[dict]) -> dict:
    """
    Calls Google's Gemini API to extract Indicators of Compromise (IOCs) from parsed logs.
    """
    default_response = {
        "ips": [],
        "domains": [],
        "urls": [],
        "emails": [],
        "hashes": [],
        "cves": []
    }
    
    if not config.GEMINI_API_KEY:
        raise ValueError("Gemini API key is missing. Please set GEMINI_API_KEY in your environment.")
        
    try:
        # Load prompt template
        prompt_path = os.path.join(os.path.dirname(__file__), "../prompts/ioc_prompt.txt")
        if not os.path.exists(prompt_path):
            raise FileNotFoundError(f"Prompt template file not found at {prompt_path}")
            
        with open(prompt_path, "r") as f:
            prompt_template = f.read()
            
        # Format the prompt with logs JSON
        formatted_prompt = prompt_template.replace("{logs}", json.dumps(parsed_logs, indent=2))
        
        # Configure model (Gemini 2.5 Flash supports structured JSON mode)
        model = genai.GenerativeModel(
            model_name="gemini-2.5-flash",
            generation_config={"response_mime_type": "application/json"}
        )
        
        # Call Gemini API
        response = model.generate_content(formatted_prompt)
        
        if response and response.text:
            cleaned_text = response.text.strip()
            # Safety cleanup of markdown blocks if they persist
            if cleaned_text.startswith("```json"):
                cleaned_text = cleaned_text[7:]
            if cleaned_text.endswith("```"):
                cleaned_text = cleaned_text[:-3]
            cleaned_text = cleaned_text.strip()
            
            result = json.loads(cleaned_text)
            
            # Ensure the response adheres strictly to the required schema
            final_res = {}
            for key, val in default_response.items():
                if key in result and isinstance(result[key], list):
                    # Filter out non-string items or sanitize
                    final_res[key] = [str(x) for x in result[key] if x is not None]
                else:
                    final_res[key] = []
            return final_res
        else:
            raise Exception("Empty text response received from Gemini API")
            
    except Exception as e:
        logger.exception("Exception occurred in gemini_service during IOC extraction")
        raise e
