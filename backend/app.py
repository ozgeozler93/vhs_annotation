import os
from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel
import base64
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
import shutil
import os



app = FastAPI()

# CORS yapılandırması
# Enable CORS middleware to allow cross-origin requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Statik dosyalar için yol
app.mount("/static", StaticFiles(directory="static"), name="static")


# Yüklenen dosyalar için klasör
UPLOAD_FOLDER = "uploaded_images"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Route to handle image upload
@app.post("/upload")
async def upload_image(file: UploadFile = File(...)):
    file_location = f"static/uploaded_images/{file.filename}"
    
    # Create 'uploaded_images' directory if it doesn't exist
    os.makedirs(os.path.dirname(file_location), exist_ok=True)
    
    # Save the uploaded image to the specified location
    with open(file_location, "wb") as buffer:
        buffer.write(await file.read())
    
    return {"filename": file.filename}

# Route to serve uploaded images
@app.get("/uploaded_images/{filename}")
async def get_image(filename: str):
    file_path = os.path.join("static/uploaded_images", filename)
    
    if os.path.exists(file_path):
        return FileResponse(file_path)
    else:
        return {"error": "File not found"}

# Veritabanı yerine kullanılacak geçici model
class AnnotationData(BaseModel):
    image_id: str
    vhs_value: float
    long_axis: float
    short_axis: float
    measurement_points: dict
    metadata: dict

# Ana sayfa route'u
@app.get("/")
def read_root():
    return {"message": "Welcome to the VHS annotation API!"}

# Resim yükleme endpointi
@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    file_location = os.path.join(UPLOAD_FOLDER, file.filename)
    with open(file_location, "wb") as f:
        f.write(await file.read())
    return {"filename": file.filename, "url": f"http://127.0.0.1:8000/uploaded_images/{file.filename}", "message": "Resim başarıyla yüklendi!"}






# Görseli base64 formatında al
@app.get("/images/{image_id}/annotations")
async def get_image_annotations(image_id: str):
    try:
        with open(f'{UPLOAD_FOLDER}/{image_id}.jpg', 'rb') as image_file:
            encoded_string = base64.b64encode(image_file.read()).decode('utf-8')
        return JSONResponse(content={"image": encoded_string})
    except Exception as e:
        return {"error": str(e)}

@app.get("/", response_class=HTMLResponse)
async def main():
    content = """
    <html>
        <body>
            <h2>Upload Image and Annotate</h2>
            <form action="/upload/" method="post" enctype="multipart/form-data">
                <input type="file" name="file" accept="image/*">
                <input type="submit" value="Upload Image">
            </form>
            <div id="image-container"></div>
            <canvas id="imageCanvas" width="600" height="400"></canvas>
            <script>
                // JavaScript ile resmin canvas'a yüklenmesi
                const imageContainer = document.getElementById('image-container');
                const canvas = document.getElementById('imageCanvas');
                const ctx = canvas.getContext('2d');
                
                function loadImage(imagePath) {
                    const img = new Image();
                    img.onload = function() {
                        ctx.clearRect(0, 0, canvas.width, canvas.height); // Temizle
                        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                    }
                    img.src = imagePath;
                }

                // Örnek bir görsel yükle (upload sonrası resim yüklenebilir)
                loadImage('/static/uploads/image001.jpg');
            </script>
        </body>
    </html>
    """
    return content


# Etiketleme verisini kaydetme
@app.post("/images/{image_id}/annotations")
async def save_annotations(image_id: str, annotations: AnnotationData):
    try:
        annotation_file = os.path.join(UPLOAD_FOLDER, f"{image_id}_annotations.json")
        with open(annotation_file, "w") as f:
            f.write(annotations.json(indent=4))
        return JSONResponse(content={"message": "Annotations saved successfully"})
    except Exception as e:
        return {"error": str(e)}

# Etiketli verileri getirme
@app.get("/images/{image_id}/annotations")
async def get_annotations(image_id: str):
    annotation_file = os.path.join(UPLOAD_FOLDER, f"{image_id}_annotations.json")
    if os.path.exists(annotation_file):
        with open(annotation_file, "r") as f:
            annotation_data = f.read()
        return JSONResponse(content={"annotation": annotation_data}, status_code=200)
    return JSONResponse(content={"message": "Etiket bulunamadı!"}, status_code=404)

# Etiket verilerini dışa aktarma
@app.get("/export")
async def export_data():
    annotations = []
    for filename in os.listdir(UPLOAD_FOLDER):
        if filename.endswith("_annotations.json"):
            with open(os.path.join(UPLOAD_FOLDER, filename), "r") as f:
                annotations.append(f.read())
    return JSONResponse(content={"annotations": annotations}, status_code=200)
