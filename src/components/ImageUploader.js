import React, { useState } from 'react';
import AnnotationCanvas from './AnnotationCanvas';

const ImageUploader = () => {
  const [file, setFile] = useState(null);
  const [imageUrl, setImageUrl] = useState(null); // Store the image URL
  const [message, setMessage] = useState('');
  const [annotations, setAnnotations] = useState([]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage('Lütfen bir dosya seçin.');
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch('http://127.0.0.1:8000/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.filename) {
        setImageUrl(`http://127.0.0.1:8000/uploaded_images/${data.filename}`);
        setMessage('Dosya başarıyla yüklendi!');
      } else {
        setMessage('Dosya yükleme başarısız!');
      }
    } catch (error) {
      console.error('Dosya yükleme hatası:', error);
      setMessage('Dosya yükleme sırasında bir hata oluştu.');
    }
  };

  const handleUpdateAnnotations = (updatedAnnotations) => {
    setAnnotations(updatedAnnotations);
  };

  return (
    <div>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleUpload}>Yükle</button>
      <p>{message}</p>

      {imageUrl && (
        <AnnotationCanvas
          imageUrl={imageUrl}
          annotations={annotations}
          onUpdateAnnotations={handleUpdateAnnotations}
        />
      )}
    </div>
  );
};

export default ImageUploader;
