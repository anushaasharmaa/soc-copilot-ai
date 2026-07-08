import os
from flask import Flask, jsonify, request
from config import config

from routes.upload import upload_bp

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = config.UPLOAD_FOLDER

app.register_blueprint(upload_bp)

@app.route('/', methods=['GET'])
def index():
    return jsonify({
        "message": "SOC Copilot Running"
    })

if __name__ == "__main__":
    app.run(debug=True, port=5001)
