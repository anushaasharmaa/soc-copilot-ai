from flask import Blueprint, request, jsonify
from services.threat_analysis_service import analyze_threats
from services.gemini_service import extract_iocs_from_logs
import logging

logger = logging.getLogger(__name__)

analyze_bp = Blueprint('analyze', __name__)

@analyze_bp.route('/analyze', methods=['POST'])
def threat_analysis():
    try:
        # 1. Verify JSON payload
        if not request.is_json:
            return jsonify({"error": "Request body must be JSON"}), 400
            
        payload = request.get_json()
        
        # 2. Extract logs from payload
        if 'logs' not in payload:
            return jsonify({"error": "Missing required field 'logs'"}), 400
            
        logs = payload['logs']
        if not isinstance(logs, list):
            if isinstance(logs, dict):
                logs = [logs]
            else:
                return jsonify({"error": "Invalid format. 'logs' must be a JSON list of parsed events."}), 400
                
        # 3. Handle optional IOCs payload (extract dynamically if omitted)
        iocs = payload.get('iocs')
        if not iocs or not isinstance(iocs, dict):
            logger.info("Optional 'iocs' field missing or invalid. Attempting dynamic extraction...")
            try:
                iocs = extract_iocs_from_logs(logs)
            except Exception as ioce:
                logger.warning(f"Dynamic IOC extraction skipped/failed: {ioce}. Falling back to empty IOC lists.")
                iocs = {"ips": [], "domains": [], "urls": [], "emails": [], "hashes": [], "cves": []}
                
        # 4. Perform threat analysis
        try:
            analysis = analyze_threats(logs, iocs)
            return jsonify(analysis), 200
        except ValueError as ve:
            logger.error(f"Configuration error: {ve}")
            return jsonify({
                "error": "Gemini API service is not configured. Please ensure GEMINI_API_KEY is defined.",
                "details": str(ve)
            }), 503
        except Exception as e:
            logger.exception("Gemini API threat analysis failed")
            return jsonify({
                "error": "Failed to communicate with Gemini API or parse threat analysis response.",
                "details": str(e)
            }), 502
            
    except Exception as e:
        logger.exception("An error occurred during threat analysis invocation")
        return jsonify({"error": f"An internal server error occurred: {str(e)}"}), 500
