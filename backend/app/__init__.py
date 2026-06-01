from flask import Flask
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
import os

db = SQLAlchemy()
jwt = JWTManager()


def create_app():
    app = Flask(__name__)
    app.config.from_object('config.Config')

    CORS(app, resources={r"/api/*": {"origins": "*"}})
    db.init_app(app)
    jwt.init_app(app)

    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

    from app.routes.auth import auth_bp
    from app.routes.records import records_bp
    from app.routes.stats import stats_bp
    from app.routes.upload import upload_bp

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(records_bp, url_prefix='/api/records')
    app.register_blueprint(stats_bp, url_prefix='/api/stats')
    app.register_blueprint(upload_bp, url_prefix='/api/upload')

    @app.route('/api/health')
    def health():
        return {'code': 200, 'message': 'ok'}

    with app.app_context():
        db.create_all()

    return app
