import os
from datetime import datetime, timezone
from werkzeug.utils import secure_filename

def get_human_readable_size(size_in_bytes: int) -> str:
    """
    Formats the file size in a human-readable format.
    """
    for unit in ['bytes', 'KB', 'MB', 'GB']:
        if size_in_bytes < 1024.0:
            return f"{size_in_bytes:.2f} {unit}" if unit != 'bytes' else f"{size_in_bytes} {unit}"
        size_in_bytes /= 1024.0
    return f"{size_in_bytes:.2f} TB"

def save_uploaded_file(file, upload_folder: str) -> dict:
    """
    Saves the uploaded file to the upload folder and returns its metadata.
    
    Args:
        file: Flask FileStorage object
        upload_folder: The absolute path to save the file to
        
    Returns:
        dict: Metadata of the uploaded file
    """
    # Secure the filename
    original_filename = secure_filename(file.filename)
    
    # Ensure the upload folder exists
    os.makedirs(upload_folder, exist_ok=True)
    
    # Determine save path
    filepath = os.path.join(upload_folder, original_filename)
    
    # Save the file
    file.save(filepath)
    
    # Extract metadata
    file_size_bytes = os.path.getsize(filepath)
    file_size_str = get_human_readable_size(file_size_bytes)
    
    # File type (extension)
    _, ext = os.path.splitext(original_filename)
    file_type = ext.lstrip('.').lower()
    
    # Upload time in ISO 8601 UTC format
    upload_time = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    
    return {
        "filename": original_filename,
        "file_type": file_type,
        "file_size": file_size_str,
        "upload_time": upload_time,
        "status": "uploaded"
    }
