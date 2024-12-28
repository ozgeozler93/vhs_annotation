import React from "react";
import ImageUploader from "./components/ImageUploader";
import AnnotationCanvas from "./components/AnnotationCanvas";

const App = () => {
  return (
    <div>
      <h1>VHS Annotation Tool</h1>
      <ImageUploader />
      {/* AnnotationCanvas bileşenini daha sonra ekleyeceğiz */}
    </div>
  );
};

export default App;
