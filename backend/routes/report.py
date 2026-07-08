from flask import Blueprint, request, jsonify
from services.report_service import generate_incident_report
import logging

logger = logging.getLogger(__name__)

report_bp = Blueprint('report', __name__)

@report_bp.route('/report', methods=['POST'])
def create_report():
    try:
        # 1. Verify JSON payload
        if not request.is_json:
            return jsonify({"error": "Request body must be JSON"}), 400
            
        payload = request.get_json()
        
        # 2. Extract analysis from payload
        if 'analysis' not in payload:
            return jsonify({"error": "Missing required field 'analysis'"}), 400
            
        analysis = payload['analysis']
        if not isinstance(analysis, dict):
            return jsonify({"error": "Invalid format. 'analysis' must be a JSON object from the Threat Analysis Module."}), 400
            
        # 3. Extract optional logs
        logs = payload.get('logs')
        if logs and not isinstance(logs, list):
            return jsonify({"error": "Invalid format. 'logs' must be a JSON list of parsed events."}), 400
            
        # 4. Generate incident report
        try:
            report = generate_incident_report(analysis, logs)
            return jsonify(report), 200
        except ValueError as ve:
            logger.error(f"Configuration error: {ve}")
            return jsonify({
                "error": "Gemini API service is not configured. Please ensure GEMINI_API_KEY is defined.",
                "details": str(ve)
            }), 503
        except Exception as e:
            logger.exception("Gemini API incident report generation failed")
            return jsonify({
                "error": "Failed to communicate with Gemini API or parse incident report response.",
                "details": str(e)
            }), 502
            
    except Exception as e:
        logger.exception("An error occurred during incident report endpoint invocation")
        return jsonify({"error": f"An internal server error occurred: {str(e)}"}), 500
