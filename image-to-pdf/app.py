import os
from flask import Flask, request, render_template, send_file
from werkzeug.utils import secure_filename
import img2pdf
import logging

# إعداد التطبيق
app = Flask(__name__)

# تحديد مجلد مؤقت لتخزين الصور المرفوعة
# سنستخدم المسار 'tmp' الذي تدعمه العديد من منصات الاستضافة مثل Render
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
        # التحقق من وجود ملفات مرفوعة
        if 'images' not in request.files:
            return "No file part", 400

        files = request.files.getlist('images')
        
        image_paths = []
        for file in files:
            if file.filename == '':
                continue
            if file:
                filename = secure_filename(file.filename)
                # استخدام المسار المؤقت لتخزين الملف
                filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
                try:
                    file.save(filepath)
                    image_paths.append(filepath)
                except Exception as e:
                    logging.error(f"Error saving file {filepath}: {e}")
                    return "Error saving file", 500


        if not image_paths:
            return "No selected file", 400

        # إنشاء ملف PDF في المجلد المؤقت
        pdf_path = os.path.join(app.config['UPLOAD_FOLDER'], "output.pdf")
        
        try:
            # تحويل الصور إلى PDF
            with open(pdf_path, "wb") as f:
                f.write(img2pdf.convert(image_paths))
        except Exception as e:
            # حذف الصور المؤقتة في حالة حدوث خطأ
            for path in image_paths:
                os.remove(path)
            logging.error(f"Error converting to PDF: {e}")
            return "Error converting to PDF", 500


        # بعد إرسال الملف، يجب حذف الملفات المؤقتة
        # (الصور وملف الـ PDF)
        @app.after_request
        def cleanup(response):
            try:
                for path in image_paths:
                    if os.path.exists(path):
                        os.remove(path)
                if os.path.exists(pdf_path):
                    os.remove(pdf_path)
            except Exception as e:
                logging.error(f"Error during cleanup: {e}")
            return response

        # إرسال ملف الـ PDF للمستخدم ليقوم بتحميله
        return send_file(pdf_path, as_attachment=True, download_name='converted.pdf')

    # في حالة كانت الطلب GET، فقط اعرض الصفحة الرئيسية
    return render_template('index.html')

if __name__ == '__main__':
    # هذا السطر للتشغيل المحلي فقط، Render ستستخدم Gunicorn
    app.run(host='0.0.0.0', port=5000)