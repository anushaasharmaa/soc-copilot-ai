from flask import Blueprint, request, jsonify
from services.gemini_service import extract_iocs_from_logs
import logging

logger = logging.getLogger(__name__)

ioc_bp = Blueprint('ioc', __name__)

@ioc_bp.route('/ioc', methods=['POST'])
def get_iocs():
    try:
        # Check if the request is JSON
        if not request.is_json:
            return jsonify({"error": "Request body must be JSON"}), 400
            
        parsed_logs = request.get_json()
        
        # Standardize single dictionary event into a list
        if not isinstance(parsed_logs, list):
            if isinstance(parsed_logs, dict):
                parsed_logs = [parsed_logs]
            else:
                return jsonify({"error": "Invalid format. Expected a JSON list of parsed events."}), 400
                
        # Invoke Gemini service to extract IOCs
        try:
            iocs = extract_iocs_from_logs(parsed_logs)
            return jsonify(iocs), 200
        except ValueError as ve:
            logger.error(f"Configuration error: {ve}")
            return jsonify({
                "error": "Gemini API service is not configured. Please ensure GEMINI_API_KEY is defined.",
                "details": str(ve)
            }), 503
        except Exception as e:
            logger.exception("Gemini API call failed")
            return jsonify({
                "error": "Failed to communicate with Gemini API or parse its response. Please try again later.",
                "details": str(e)
            }), 502
            
    except Exception as e:
        logger.exception("An error occurred during IOC extraction endpoint invocation")
        return jsonify({"error": f"An internal server error occurred: {str(e)}"}), 500
