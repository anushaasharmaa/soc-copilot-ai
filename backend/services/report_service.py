import os
import json
import logging
import random
from datetime import datetime, timezone
import google.generativeai as genai
from config import config

logger = logging.getLogger(__name__)

# Configure Gemini if key is provided
if config.GEMINI_API_KEY:
    genai.configure(api_key=config.GEMINI_API_KEY)
else:
    logger.warning("GEMINI_API_KEY is not set in environment or config.")

def generate_incident_report(analysis_data: dict, logs: list[dict] = None) -> dict:
    """
    Calls Gemini API to generate narrative sections and timeline for a professional incident report.
    """
    logs_data = logs if logs else []
    
    # 1. Prepare fallback default structure
    generated_id = f"IR-{datetime.now(timezone.utc).strftime('%Y%m%d')}-{random.randint(1000, 9999)}"
    default_report = {
        "report_id": generated_id,
        "generated_at": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "executive_summary": "An incident was flagged for review. Further details are unavailable due to threat service configuration issues.",
        "technical_summary": "Technical telemetry is unavailable. Standard fallback report active.",
        "indicators_of_compromise": {
            "ips": [],
            "domains": [],
            "urls": [],
            "emails": [],
            "hashes": [],
            "cves": []
        },
        "mitre_attack_mapping": {
            "tactic": analysis_data.get("tactic", "N/A"),
            "technique": analysis_data.get("technique", "N/A"),
            "technique_id": analysis_data.get("mitre_attack", "N/A"),
            "description": "Standard threat mapping details."
        },
        "risk_score": analysis_data.get("risk_score", 0),
        "severity": analysis_data.get("severity", "Low"),
        "timeline": [
            {
                "timestamp": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
                "event": "Report generated with default fallback settings"
            }
        ],
        "recommended_containment": analysis_data.get("recommended_actions", ["Isolate affected systems"]),
        "recovery_steps": ["Verify system integrity", "Monitor endpoints for lateral movement"],
        "analyst_notes": "Please verify Gemini API settings in your workspace configurations."
    }
    
    if not config.GEMINI_API_KEY:
        raise ValueError("Gemini API key is missing. Please set GEMINI_API_KEY in your environment.")
        
    try:
        # Load prompt template
        prompt_path = os.path.join(os.path.dirname(__file__), "../prompts/report_prompt.txt")
        if not os.path.exists(prompt_path):
            raise FileNotFoundError(f"Prompt template file not found at {prompt_path}")
            
        with open(prompt_path, "r") as f:
            prompt_template = f.read()
            
        # Format prompt template
        formatted_prompt = prompt_template.replace(
            "{analysis}", json.dumps(analysis_data, indent=2)
        ).replace(
            "{logs}", json.dumps(logs_data, indent=2)
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
            # Safety cleanup of markdown blocks
            if cleaned_text.startswith("```json"):
                cleaned_text = cleaned_text[7:]
            if cleaned_text.endswith("```"):
                cleaned_text = cleaned_text[:-3]
            cleaned_text = cleaned_text.strip()
            
            result = json.loads(cleaned_text)
            
            # Normalize key conformity
            final_res = {}
            for key, val in default_report.items():
                if key in result:
                    if key == "indicators_of_compromise":
                        final_res[key] = {}
                        for ioc_type in val.keys():
                            if isinstance(result[key].get(ioc_type), list):
                                final_res[key][ioc_type] = [str(x) for x in result[key][ioc_type] if x is not None]
                            else:
                                final_res[key][ioc_type] = []
                    elif key == "mitre_attack_mapping":
                        final_res[key] = {}
                        for mitre_key in val.keys():
                            final_res[key][mitre_key] = str(result[key].get(mitre_key, "N/A"))
                    elif key == "timeline":
                        if isinstance(result[key], list):
                            final_res[key] = []
                            for item in result[key]:
                                if isinstance(item, dict):
                                    final_res[key].append({
                                        "timestamp": str(item.get("timestamp", "")),
                                        "event": str(item.get("event", ""))
                                    })
                        else:
                            final_res[key] = val
                    elif key in ["recommended_containment", "recovery_steps"]:
                        if isinstance(result[key], list):
                            final_res[key] = [str(x) for x in result[key] if x is not None]
                        else:
                            final_res[key] = []
                    elif key == "risk_score":
                        try:
                            final_res[key] = int(result[key])
                        except (ValueError, TypeError):
                            final_res[key] = 0
                    else:
                        final_res[key] = str(result[key])
                else:
                    final_res[key] = val
            return final_res
        else:
            raise Exception("Empty response text received from Gemini API")
            
    except Exception as e:
        logger.exception("Exception occurred in report_service during report generation")
        raise e
