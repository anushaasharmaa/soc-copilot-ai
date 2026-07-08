from flask import Blueprint, request, jsonify
from utils.file_validator import validate_file
from services.parser_service import parse_log_file
import logging

logger = logging.getLogger(__name__)

parser_bp = Blueprint('parser', __name__)

@parser_bp.route('/parse', methods=['POST'])
def parse_log():
    try:
        # 1. Check if file exists in the request
        if 'file' not in request.files:
            return jsonify({"error": "No file part in the request"}), 400
            
        file = request.files['file']
        
        # 2. Validate using the file validator utility
        is_valid, error_msg = validate_file(file)
        if not is_valid:
            return jsonify({"error": error_msg}), 400
            
        # 3. Read content
        try:
            content = file.read().decode('utf-8', errors='ignore')
        except Exception as e:
            logger.exception("Failed to decode uploaded log file")
            return jsonify({"error": f"Failed to read file content: {str(e)}"}), 400
            
        # 4. Parse content
        parsed_events = parse_log_file(content, file.filename)
        
        # 5. Return standardized response
        return jsonify(parsed_events), 200
        
    except Exception as e:
        logger.exception("An error occurred during log parsing")
        return jsonify({"error": f"An internal server error occurred: {str(e)}"}), 500
