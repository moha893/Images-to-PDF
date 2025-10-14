import os
from flask import Flask, request, render_template, send_file
from werkzeug.utils import secure_filename
import img2pdf
import logging
import io # <-- تأكد من إضافة هذا السطر

# إعداد التطبيق
app = Flask(__name__)

# تحديد مجلد مؤقت لتخزين الصور المرفوعة
UPLOAD_FOLDER = '/tmp/uploads'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# التأكد من وجود مجلد الرفع عند بدء التشغيل
try:
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)
except OSError as e:
    logging.error(f"Error creating directory {UPLOAD_FOLDER}: {e}")


@app.route('/', methods=['GET', 'POST'])
def index():
    if request.method == 'POST':
        if 'images' not in request.files:
            return "No file part", 400

        files = request.files.getlist('images')
        
        image_paths = []
        for file in files:
            if file.filename == '':
                continue
            if file:
                filename = secure_filename(file.filename)
                filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
                try:
                    file.save(filepath)
                    image_paths.append(filepath)
                except Exception as e:
                    logging.error(f"Error saving file {filepath}: {e}")
                    return "Error saving file", 500

        if not image_paths:
            return "No selected file", 400

        pdf_path = os.path.join(app.config['UPLOAD_FOLDER'], "output.pdf")
        
        try:
            # 1. إنشاء ملف الـ PDF على القرص
            with open(pdf_path, "wb") as f:
                f.write(img2pdf.convert(image_paths))

            # 2. قراءة محتوى الملف إلى الذاكرة
            with open(pdf_path, 'rb') as f:
                pdf_bytes = f.read()

            # 3. إنشاء "ملف في الذاكرة" لإرساله للمستخدم
            pdf_stream = io.BytesIO(pdf_bytes)
            
            return send_file(
                pdf_stream,
                as_attachment=True,
                download_name='converted.pdf',
                mimetype='application/pdf'
            )

        except Exception as e:
            logging.error(f"Error during PDF conversion or cleanup: {e}")
            return "Error converting to PDF", 500

        finally:
            # 4. حذف كل الملفات المؤقتة (هذا الجزء سيعمل دائمًا)
            for path in image_paths:
                if os.path.exists(path):
                    os.remove(path)
            if os.path.exists(pdf_path):
                os.remove(pdf_path)

    return render_template('index.html')

if __name__ == '__main__':
    # هذا السطر للتشغيل المحلي فقط، Render ستستخدم Gunicorn
    app.run(host='0.0.0.0', port=5000)