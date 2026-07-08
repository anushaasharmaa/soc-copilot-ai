import os
from flask import Flask, jsonify, request
from config import config

app = Flask(__name__)

# Allowed extensions for log upload
ALLOWED_EXTENSIONS = {'txt', 'json', 'csv'}

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/', methods=['GET'])
def index():
    return jsonify({
        "message": "SOC Copilot Running"
    })

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({"error": "No file part in the request"}), 400
        
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({"error": "No file selected for uploading"}), 400
        
    if file and allowed_file(file.filename):
        # We don't process it yet, just return success status
        return jsonify({
            "status": "uploaded"
        }), 200
    else:
        return jsonify({"error": "Allowed file types are txt, json, csv"}), 400

if __name__ == "__main__":
    app.run(debug=True, port=5001)
