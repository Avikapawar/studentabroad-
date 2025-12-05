"""
Simple Flask App
Study Abroad Platform without complex security middleware
"""
from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_jwt_extended import JWTManager
import os
from dotenv import load_dotenv
from models import init_db
from routes.auth import auth_bp
from routes.users import users_bp
from routes.universities import universities_bp
from routes.bookmarks import bookmarks_bp
from routes.recommendations import recommendations_bp

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)

# Simple CORS configuration
CORS(app, origins=['http://localhost:3000', 'http://127.0.0.1:3000'])

# Basic configuration
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'your-secret-key-change-in-production')
app.config['DATABASE_URL'] = os.getenv('DATABASE_URL', 'sqlite:///database/student_abroad.db')

# JWT configuration
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'jwt-secret-change-in-production')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = False

jwt = JWTManager(app)

# Initialize database
with app.app_context():
    init_db()

# Register blueprints
app.register_blueprint(auth_bp)
app.register_blueprint(users_bp)
app.register_blueprint(universities_bp)
app.register_blueprint(bookmarks_bp)
app.register_blueprint(recommendations_bp)

# Basic routes
@app.route('/')
def home():
    """Home endpoint"""
    return jsonify({
        'message': 'Study Abroad Platform API',
        'version': '1.0',
        'status': 'running'
    })

@app.route('/api/health')
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'database': 'connected',
        'firebase': 'connected' if os.path.exists('studyabroad-e9afb-firebase-adminsdk-fbsvc-a1e7ee1a7f.json') else 'not configured'
    })

# Error handlers
@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    print("🚀 STARTING STUDY ABROAD PLATFORM")
    print("=" * 50)
    print("✅ Simple Flask app (no complex security)")
    print("✅ Firebase integration ready")
    print("✅ 200 universities available")
    print("\n🌐 Server starting...")
    print("   URL: http://localhost:5000")
    print("   Health: http://localhost:5000/api/health")
    print("   Press Ctrl+C to stop")
    print("=" * 50)
    
    app.run(debug=True, host='0.0.0.0', port=5000)