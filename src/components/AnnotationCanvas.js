import React, { useState, useRef, useEffect } from "react";
import { Stage, Layer, Rect, Circle } from "react-konva";

const AnnotationCanvas = ({ imageUrl, annotations = [], onUpdateAnnotations }) => {
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
  const imageRef = useRef(null);

  useEffect(() => {
    const img = new Image();
    img.src = imageUrl;
    img.onload = () => {
      imageRef.current = img; // Store the loaded image reference
      setImagePosition({
        x: (window.innerWidth - img.width) / 2,
        y: (window.innerHeight - img.height) / 2,
      });
    };
  }, [imageUrl]);

  const handleWheel = (e) => {
    const scaleBy = 1.1;
    const newScale = e.deltaY < 0 ? scale * scaleBy : scale / scaleBy;
    setScale(Math.max(0.1, Math.min(newScale, 5)));
  };

  const handleDragStart = (e) => {
    setDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleDragMove = (e) => {
    if (dragging) {
      const dx = e.clientX - dragStart.x;
      const dy = e.clientY - dragStart.y;
      setImagePosition((prevPosition) => ({
        x: prevPosition.x + dx,
        y: prevPosition.y + dy,
      }));
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handleDragEnd = () => {
    setDragging(false);
  };

  const handleAnnotationUpdate = (index, newAnnotation) => {
    const updatedAnnotations = [...annotations];
    updatedAnnotations[index] = newAnnotation;
    onUpdateAnnotations(updatedAnnotations);
  };

  return (
    <div
      style={{ overflow: "hidden", position: "relative", width: "100%", height: "100%" }}
      onWheel={handleWheel}
      onMouseDown={handleDragStart}
      onMouseMove={handleDragMove}
      onMouseUp={handleDragEnd}
      onMouseLeave={handleDragEnd}
    >
      <Stage
        width={window.innerWidth}
        height={window.innerHeight}
        scaleX={scale}
        scaleY={scale}
        x={offset.x}
        y={offset.y}
      >
        <Layer>
          {imageRef.current && (
            <Rect
              x={imagePosition.x}
              y={imagePosition.y}
              width={imageRef.current.width}
              height={imageRef.current.height}
              fillPatternImage={imageRef.current}
              draggable
              onDragMove={handleDragMove}
              onDragEnd={handleDragEnd}
            />
          )}
          {annotations.map((annotation, index) => (
            <React.Fragment key={index}>
              {annotation.type === "rectangle" && (
                <Rect
                  x={annotation.x}
                  y={annotation.y}
                  width={annotation.width}
                  height={annotation.height}
                  stroke="red"
                  strokeWidth={2}
                  onClick={() => handleAnnotationUpdate(index, { ...annotation, active: !annotation.active })}
                />
              )}
              {annotation.type === "circle" && (
                <Circle
                  x={annotation.x}
                  y={annotation.y}
                  radius={annotation.radius}
                  stroke="blue"
                  strokeWidth={2}
                  onClick={() => handleAnnotationUpdate(index, { ...annotation, active: !annotation.active })}
                />
              )}
            </React.Fragment>
          ))}
        </Layer>
      </Stage>
    </div>
  );
};

export default AnnotationCanvas;
