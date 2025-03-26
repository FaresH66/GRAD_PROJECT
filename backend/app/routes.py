from flask import Blueprint, request, jsonify, send_file
from .ocr.processor import PlateProcessor
import os

main_bp = Blueprint('main', __name__)
processor = PlateProcessor('/workspaces/GRAD_PROJECT/backend/yolo11m_car_plate_trained.pt')

@main_bp.route('/process', methods=['POST'])
def process_image():
    if 'image' not in request.files:
        return jsonify({'error': 'No image provided'}), 400
    
    file = request.files['image']
    if file.filename == '':
        return jsonify({'error': 'No image selected'}), 400

    img_path = os.path.join('uploads', file.filename)
    os.makedirs('uploads', exist_ok=True)
    file.save(img_path)

    cropped = processor.crop_plate(img_path)
    if cropped is None:
        return jsonify({'error': 'No plate detected'}), 400

    result = processor.detect_text(cropped)
    if result is None:
        return jsonify({'error': 'Text detection failed'}), 500

    return jsonify({
        'texts': result['texts'],
        'debug_image': f"/debug/{os.path.basename(result['debug_image'])}"
    })

@main_bp.route('/debug/<filename>')
def serve_debug_image(filename):
    return send_file(os.path.join(processor.debug_dir, filename), mimetype='image/jpeg')