import os
from flask import Flask, jsonify, request
from flask_cors import CORS
from config import config

from routes.upload import upload_bp
from routes.parser import parser_bp
from routes.ioc import ioc_bp
from routes.analyze import analyze_bp
from routes.report import report_bp

app = Flask(__name__)
CORS(app)

app.config['UPLOAD_FOLDER'] = config.UPLOAD_FOLDER

app.register_blueprint(upload_bp)
app.register_blueprint(parser_bp)
app.register_blueprint(ioc_bp)
app.register_blueprint(analyze_bp)
app.register_blueprint(report_bp)

@app.route("/", methods=["GET"])
def index():
    return jsonify({
        "message": "SOC Copilot Running"
    })

if __name__ == "__main__":
    app.run(
        host=config.HOST,
        port=config.PORT,
        debug=config.DEBUG
    )
    