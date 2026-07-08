from flask import Blueprint, request, jsonify, current_app
from utils.file_validator import validate_file
from services.upload_service import save_uploaded_file
import logging

logger = logging.getLogger(__name__)

upload_bp = Blueprint('upload', __name__)

@upload_bp.route('/upload', methods=['POST'])
def upload_file():
    try:
        # Check if file key is present in request.files
        if 'file' not in request.files:
            return jsonify({"error": "No file part in the request"}), 400
            
        file = request.files['file']
        
        # Validate the file (existence, type, name)
        is_valid, error_msg = validate_file(file)
        if not is_valid:
            return jsonify({"error": error_msg}), 400
            
        # Get upload directory from app config
        upload_folder = current_app.config.get('UPLOAD_FOLDER')
        if not upload_folder:
            logger.error("UPLOAD_FOLDER is not configured in current_app.config")
            return jsonify({"error": "Server configuration error"}), 500
            
        # Save file and return response metadata
        metadata = save_uploaded_file(file, upload_folder)
        return jsonify(metadata), 200
        
    except Exception as e:
        logger.exception("An error occurred during file upload")
        return jsonify({"error": f"An internal server error occurred: {str(e)}"}), 500
