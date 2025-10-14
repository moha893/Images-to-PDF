import os
from flask import Flask, request, render_template, send_file
from werkzeug.utils import secure_filename
import img2pdf
import logging
import io
from flask_cors import CORS # <-- 1. استيراد المكتبة الجديدة

# إعداد التطبيق
app = Flask(__name__)
CORS(app) # <-- 2. تفعيل CORS للتطبيق بأكمله

# (باقي كود الإعداد يبقى كما هو)
UPLOAD_FOLDER = '/tmp/uploads'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
try:
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)
except OSError as e:
    logging.error(f"Error creating directory {UPLOAD_FOLDER}: {e}")


# --- الواجهة الرسومية الحالية (تبقى كما هي) ---
@app.route('/', methods=['GET', 'POST'])
def index():
    if request.method == 'POST':
        # (كل الكود الخاص بالواجهة الذي كتبناه آخر مرة يبقى هنا بدون تغيير)
        if 'images' not in request.files:
            return "No file part", 400
        files = request.files.getlist('images')
        image_paths = []
        for file in files:
            if file.filename == '': continue
            if file:
                filename = secure_filename(file.filename)
                filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
                file.save(filepath)
                image_paths.append(filepath)
        if not image_paths: return "No selected file", 400
        pdf_path = os.path.join(app.config['UPLOAD_FOLDER'], "output.pdf")
        try:
            with open(pdf_path, "wb") as f: f.write(img2pdf.convert(image_paths))
            with open(pdf_path, 'rb') as f: pdf_bytes = f.read()
            pdf_stream = io.BytesIO(pdf_bytes)
            return send_file(pdf_stream, as_attachment=True, download_name='converted.pdf', mimetype='application/pdf')
        except Exception as e:
            logging.error(f"Error during PDF conversion or cleanup: {e}")
            return "Error converting to PDF", 500
        finally:
            for path in image_paths:
                if os.path.exists(path): os.remove(path)
            if os.path.exists(pdf_path): os.remove(pdf_path)
    return render_template('index.html')


# --- 3. نقطة النهاية الجديدة الخاصة بالـ API ---
@app.route('/api/convert', methods=['POST'])
def api_convert():
    # هذا الكود هو نسخة طبق الأصل من منطق التحويل في الأعلى
    if 'images' not in request.files:
        return {"error": "No file part"}, 400 # إرجاع خطأ بصيغة JSON
    
    files = request.files.getlist('images')
    image_paths = []
    for file in files:
        if file.filename == '': continue
        if file:
            filename = secure_filename(file.filename)
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(filepath)
            image_paths.append(filepath)

    if not image_paths: return {"error": "No selected file"}, 400

    pdf_path = os.path.join(app.config['UPLOAD_FOLDER'], "output.pdf")
    try:
        with open(pdf_path, "wb") as f: f.write(img2pdf.convert(image_paths))
        with open(pdf_path, 'rb') as f: pdf_bytes = f.read()
        
        pdf_stream = io.BytesIO(pdf_bytes)
        
        # الـ API سيرجع الملف مباشرة
        return send_file(pdf_stream, download_name='converted.pdf', mimetype='application/pdf')
    except Exception as e:
        logging.error(f"API Error during PDF conversion: {e}")
        return {"error": "Failed to convert images to PDF"}, 500
    finally:
        # التنظيف ضروري جداً
        for path in image_paths:
            if os.path.exists(path): os.remove(path)
        if os.path.exists(pdf_path): os.remove(pdf_path)

# (باقي الكود يبقى كما هو)
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)