// src/components/AnnotationForm.js
import React, { useState } from "react";
import axios from "axios";

const AnnotationForm = ({ imageId }) => {
  const [vhsValue, setVhsValue] = useState("");
  const [longAxis, setLongAxis] = useState("");
  const [shortAxis, setShortAxis] = useState("");
  const [measurementPoints, setMeasurementPoints] = useState({
    long_axis_start: [],
    long_axis_end: [],
    short_axis_start: [],
    short_axis_end: [],
  });
  const [metadata, setMetadata] = useState({
    breed: "",
    position: "",
    image_quality: "",
  });

  const handleSubmit = async () => {
    const annotationData = {
      image_id: imageId,
      vhs_value: parseFloat(vhsValue),
      long_axis: parseFloat(longAxis),
      short_axis: parseFloat(shortAxis),
      measurement_points: measurementPoints,
      metadata: metadata,
    };

    try {
      await axios.post(`http://localhost:8000/images/${imageId}/annotations`, annotationData);
      alert("Etiket verisi başarıyla kaydedildi!");
    } catch (err) {
      console.error(err);
      alert("Etiket verisi kaydedilirken bir hata oluştu.");
    }
  };

  return (
    <div>
      <h3>VHS Etiketleme Formu</h3>

      {/* VHS Değeri */}
      <label>
        VHS Değeri:
        <input
          type="number"
          value={vhsValue}
          onChange={(e) => setVhsValue(e.target.value)}
          step="0.1"
        />
      </label>
      <br />

      {/* Long Axis */}
      <label>
        Long Axis:
        <input
          type="number"
          value={longAxis}
          onChange={(e) => setLongAxis(e.target.value)}
          step="0.1"
        />
      </label>
      <br />

      {/* Short Axis */}
      <label>
        Short Axis:
        <input
          type="number"
          value={shortAxis}
          onChange={(e) => setShortAxis(e.target.value)}
          step="0.1"
        />
      </label>
      <br />

      {/* Measurement Points */}
      <h4>Measurement Points</h4>
      <label>
        Long Axis Başlangıç Noktası (x, y):
        <input
          type="text"
          placeholder="Örn: 120, 340"
          onChange={(e) =>
            setMeasurementPoints({
              ...measurementPoints,
              long_axis_start: e.target.value.split(",").map(Number),
            })
          }
        />
      </label>
      <br />
      <label>
        Long Axis Bitiş Noktası (x, y):
        <input
          type="text"
          placeholder="Örn: 280, 420"
          onChange={(e) =>
            setMeasurementPoints({
              ...measurementPoints,
              long_axis_end: e.target.value.split(",").map(Number),
            })
          }
        />
      </label>
      <br />
      <label>
        Short Axis Başlangıç Noktası (x, y):
        <input
          type="text"
          placeholder="Örn: 200, 380"
          onChange={(e) =>
            setMeasurementPoints({
              ...measurementPoints,
              short_axis_start: e.target.value.split(",").map(Number),
            })
          }
        />
      </label>
      <br />
      <label>
        Short Axis Bitiş Noktası (x, y):
        <input
          type="text"
          placeholder="Örn: 320, 460"
          onChange={(e) =>
            setMeasurementPoints({
              ...measurementPoints,
              short_axis_end: e.target.value.split(",").map(Number),
            })
          }
        />
      </label>
      <br />

      {/* Metadata */}
      <h4>Metadata</h4>
      <label>
        Irk:
        <input
          type="text"
          value={metadata.breed}
          onChange={(e) => setMetadata({ ...metadata, breed: e.target.value })}
        />
      </label>
      <br />
      <label>
        Pozisyon:
        <input
          type="text"
          value={metadata.position}
          onChange={(e) => setMetadata({ ...metadata, position: e.target.value })}
        />
      </label>
      <br />
      <label>
        Görüntü Kalitesi:
        <input
          type="text"
          value={metadata.image_quality}
          onChange={(e) => setMetadata({ ...metadata, image_quality: e.target.value })}
        />
      </label>
      <br />

      {/* Formu gönder */}
      <button onClick={handleSubmit}>Kaydet</button>
    </div>
  );
};

export default AnnotationForm;
