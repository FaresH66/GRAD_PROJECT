from flask import Flask, request, jsonify, session
from flask_cors import CORS  # Import CORS
from flask_socketio import SocketIO
from config import Config
from database import db, log_entry
import models.ocr_plate as ocr
import models.face_recognition as face_recognition
import bcrypt
from models.face_recognition import predict

# Initialize Flask app
app = Flask(__name__)
app.config.from_object(Config)
app.secret_key = Config.SECRET_KEY

# Enable CORS for all routes, allowing requests from localhost:3000 with credentials
CORS(app, origins=["http://localhost:3000"], supports_credentials=True)

# Initialize SocketIO with consistent CORS
socketio = SocketIO(app, cors_allowed_origins=["http://localhost:3000"])

# Define root route
@app.route('/')
def index():
    print("Root hit!")
    return "Gatekeeper Backend is running!"

# Login route to set session
@app.route('/login', methods=['POST'])
def login():
    email = None
    password = None
    
    # Handle both JSON and form data
    if request.is_json:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')
    else:
        email = request.form.get('email')
        password = request.form.get('password')
    
    if not email or not password:
        return jsonify({'status': 'error', 'message': 'Email and password required'}), 400
    
    try:
        conn = db.get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT id, role, password_hash FROM users WHERE email = %s", (email,))
        user = cursor.fetchone()
        cursor.close()
        conn.close()
        
        if user and bcrypt.checkpw(password.encode('utf-8'), user['password_hash'].encode('utf-8')):
            session['user_id'] = user['id']
            session['role'] = user['role']
            response = jsonify({'status': 'success', 'user_id': user['id'], 'role': user['role']})
            return response
        return jsonify({'status': 'error', 'message': 'Invalid credentials'}), 401
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

# OCR route for license plate recognition
@app.route('/test_ocr', methods=['POST'])
def test_ocr():
    if 'plate_image' not in request.files:
        return jsonify({"success": False, "message": "No image file provided"}), 400
    
    image_file = request.files['plate_image']
    success, result = ocr.read_plate(image_file)
    
    if success:
        # Check if the plate matches a resident or guest
        conn = db.get_connection()
        cursor = conn.cursor(dictionary=True)
        try:
            # Check residents' cars
            cursor.execute("SELECT resident_id FROM cars WHERE license_plate = %s", (result,))
            car = cursor.fetchone()
            if car:
                resident_id = car['resident_id']
                log_entry(session.get('user_id'), 'plate_recognition', 
                         {'plate': result, 'resident_id': resident_id, 'status': 'resident_access'})
                return jsonify({"success": True, "plate_text": result, "type": "resident", "resident_id": resident_id})
            
            # Check guests
            cursor.execute("SELECT id, resident_id FROM guests WHERE license_plate = %s AND status = 'pending'", (result,))
            guest = cursor.fetchone()
            if guest:
                guest_id = guest['id']
                resident_id = guest['resident_id']
                cursor.execute("UPDATE guests SET status = 'arrived', arrival_time = NOW() WHERE id = %s", (guest_id,))
                conn.commit()
                log_entry(session.get('user_id'), 'plate_recognition', 
                         {'plate': result, 'guest_id': guest_id, 'resident_id': resident_id, 'status': 'guest_arrived'})
                return jsonify({"success": True, "plate_text": result, "type": "guest", "guest_id": guest_id, "resident_id": resident_id})
            
            # No match found
            log_entry(session.get('user_id'), 'plate_recognition', {'plate': result, 'status': 'unknown'})
            return jsonify({"success": True, "plate_text": result, "type": "unknown"})
        finally:
            cursor.close()
            conn.close()
    return jsonify({"success": False, "message": result}), 400

# Face recognition route for gatekeeper
@app.route('/recognize_face', methods=['POST'])
def recognize_face():
    if 'user_id' not in session or session.get('role') != 'gatekeeper':
        return jsonify({'status': 'error', 'message': 'Unauthorized'}), 403
    
    if 'face_image' not in request.files:
        return jsonify({'status': 'error', 'message': 'No face image provided'}), 400
    
    face_image = request.files['face_image']
    result = predict(face_image)  # Uses the updated predict function
    
    if result['id'] == 'Unknown':
        log_entry(session.get('user_id'), 'face_recognition', 
                 {'status': 'unknown', 'demographics': result['demographics']})
        return jsonify({'status': 'error', 'message': 'Face not recognized', 'demographics': result['demographics']}), 404
    
    # Check if recognized ID belongs to a resident or guest
    conn = db.get_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        # Check residents
        cursor.execute("SELECT r.id AS resident_id FROM residents r WHERE r.user_id = %s AND r.face_data_ref IS NOT NULL", (result['id'],))
        resident = cursor.fetchone()
        if resident:
            log_entry(session.get('user_id'), 'face_recognition', 
                     {'user_id': result['id'], 'status': 'resident_access', 'confidence': result['confidence'], 'demographics': result['demographics']})
            return jsonify({'status': 'success', 'type': 'resident', 'user_id': result['id'], 'resident_id': resident['resident_id'], 
                           'confidence': result['confidence'], 'demographics': result['demographics']})
        
        # Check guests
        cursor.execute("SELECT g.id AS guest_id, g.resident_id FROM guests g WHERE g.id = %s AND g.face_data_ref IS NOT NULL AND g.status = 'pending'", (result['id'],))
        guest = cursor.fetchone()
        if guest:
            cursor.execute("UPDATE guests SET status = 'arrived', arrival_time = NOW() WHERE id = %s", (guest['guest_id'],))
            conn.commit()
            log_entry(session.get('user_id'), 'face_recognition', 
                     {'guest_id': guest['guest_id'], 'resident_id': guest['resident_id'], 'status': 'guest_arrived', 
                      'confidence': result['confidence'], 'demographics': result['demographics']})
            return jsonify({'status': 'success', 'type': 'guest', 'guest_id': guest['guest_id'], 'resident_id': guest['resident_id'], 
                           'confidence': result['confidence'], 'demographics': result['demographics']})
        
        return jsonify({'status': 'error', 'message': 'Recognized face not found in residents or guests'}), 404
    finally:
        cursor.close()
        conn.close()

# Combined recognition route (plate + face)
@app.route('/verify_entry', methods=['POST'])
def verify_entry():
    if 'user_id' not in session or session.get('role') != 'gatekeeper':
        return jsonify({'status': 'error', 'message': 'Unauthorized'}), 403
    
    if 'plate_image' not in request.files or 'face_image' not in request.files:
        return jsonify({'status': 'error', 'message': 'Both plate and face images required'}), 400
    
    plate_image = request.files['plate_image']
    face_image = request.files['face_image']
    
    # Step 1: Recognize license plate
    plate_success, plate_result = ocr.read_plate(plate_image)
    if not plate_success:
        log_entry(session.get('user_id'), 'entry_verification', {'status': 'failed', 'reason': 'plate_recognition_failed'})
        return jsonify({'status': 'error', 'message': 'Failed to read license plate: ' + plate_result}), 400
    
    # Step 2: Recognize face
    face_result = predict(face_image)  # Uses the updated predict function
    if face_result['id'] == 'Unknown':
        log_entry(session.get('user_id'), 'entry_verification', 
                 {'plate': plate_result, 'status': 'failed', 'reason': 'face_not_recognized'})
        return jsonify({'status': 'error', 'message': 'Face not recognized', 'demographics': face_result['demographics']}), 404
    
    # Step 3: Verify plate and face match
    conn = db.get_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        # Check resident
        cursor.execute("""
            SELECT r.id AS resident_id, r.user_id 
            FROM cars c 
            JOIN residents r ON c.resident_id = r.id 
            WHERE c.license_plate = %s AND r.user_id = %s AND r.face_data_ref IS NOT NULL
        """, (plate_result, face_result['id']))
        resident = cursor.fetchone()
        if resident:
            log_entry(session.get('user_id'), 'entry_verification', 
                     {'plate': plate_result, 'user_id': resident['user_id'], 'status': 'resident_access', 
                      'face_confidence': face_result['confidence']})
            return jsonify({'status': 'success', 'type': 'resident', 'user_id': resident['user_id'], 
                           'resident_id': resident['resident_id'], 'plate': plate_result, 
                           'face_confidence': face_result['confidence'], 'demographics': face_result['demographics']})
        
        # Check guest
        cursor.execute("""
            SELECT g.id AS guest_id, g.resident_id 
            FROM guests g 
            WHERE g.license_plate = %s AND g.id = %s AND g.status = 'pending' AND g.face_data_ref IS NOT NULL
        """, (plate_result, face_result['id']))
        guest = cursor.fetchone()
        if guest:
            cursor.execute("UPDATE guests SET status = 'arrived', arrival_time = NOW() WHERE id = %s", (guest['guest_id'],))
            conn.commit()
            log_entry(session.get('user_id'), 'entry_verification', 
                     {'plate': plate_result, 'guest_id': guest['guest_id'], 'resident_id': guest['resident_id'], 
                      'status': 'guest_arrived', 'face_confidence': face_result['confidence']})
            return jsonify({'status': 'success', 'type': 'guest', 'guest_id': guest['guest_id'], 
                           'resident_id': guest['resident_id'], 'plate': plate_result, 
                           'face_confidence': face_result['confidence'], 'demographics': face_result['demographics']})
        
        log_entry(session.get('user_id'), 'entry_verification', 
                 {'plate': plate_result, 'face_id': face_result['id'], 'status': 'failed', 'reason': 'no_match'})
        return jsonify({'status': 'error', 'message': 'Plate and face do not match any resident or guest'}), 404
    finally:
        cursor.close()
        conn.close()

# Import and register blueprints
from routes.admin import admin_bp
from routes.gatekeeper import gatekeeper_bp
from routes.resident import resident_bp
from routes.auth import auth_bp

app.register_blueprint(admin_bp, url_prefix='/admin')
app.register_blueprint(gatekeeper_bp, url_prefix='/gatekeeper')
app.register_blueprint(resident_bp, url_prefix='/resident')
app.register_blueprint(auth_bp)

# Test database connection
try:
    conn = db.get_connection()
    print("Connected to MySQL database")
    conn.close()
except Exception as e:
    print(f"Error connecting to MySQL: {e}")

# Print route map for debugging
with app.test_request_context():
    print(app.url_map)

# Global error handler
@app.errorhandler(Exception)
def handle_exception(e):
    return jsonify({'status': 'error', 'message': str(e)}), 500

if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=5000, debug=True)
    if hasattr(db, 'close'):
        db.close()