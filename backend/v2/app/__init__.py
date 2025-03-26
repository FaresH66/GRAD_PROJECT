from flask import Flask
from flask_cors import CORS

def create_app():
    app = Flask(__name__, static_folder=None, template_folder=None)
    CORS(app)  # Enable CORS for frontend communication
    
    # Register blueprints
    from .routes import main_bp
    app.register_blueprint(main_bp)
    
    return app