import os
from werkzeug.utils import secure_filename

ALLOWED_EXTENSIONS = {'txt', 'json', 'csv'}

def allowed_file(filename: str) -> bool:
    """
    Check if the file has one of the allowed extensions.
    """
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def validate_file(file) -> tuple[bool, str]:
    """
    Validates a Flask FileStorage object.
    
    Args:
        file: The file object from request.files
        
    Returns:
        tuple: (is_valid: bool, error_message: str)
    """
    if file is None:
        return False, "No file part in the request"
        
    if file.filename == '':
        return False, "No file selected for uploading"
        
    if not allowed_file(file.filename):
        return False, "Allowed file types are txt, json, csv"
        
    return True, ""
