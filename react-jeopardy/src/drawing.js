import React, { useRef, useState, useContext } from 'react';

import { ReactSketchCanvas } from 'react-sketch-canvas';
import "./drawing.css"
import { SocketContext } from './SocketContext';

function DrawingBoard({onSubmit}) {
  const socket = useContext(SocketContext);
  // The ref is still the same
  const canvasRef = useRef(null);
  const [strokeColor, setStrokeColor] = useState('#FFFFFF');

  const handleSave = () => {
    if (canvasRef.current) {
      // The export function is async and returns a promise
      canvasRef.current
        .exportImage('png')
        .then(imageData => {
          // imageData is the base64 encoded PNG

          onSubmit(imageData);
        })
        .catch(e => {
          console.error(e);
        });
    }
  };

  const handleClear = () => {
    if (canvasRef.current) {
      canvasRef.current.clearCanvas();
    }
  };

  const handleUndo = () => {
    if (canvasRef.current) {
      canvasRef.current.undo();
    }
  };
  
  return (
    <div id="rootDraw">
   

      <div id="drawingContainer" style={{
          width: '100%',
          height: '100%',
          border: '1px solid #ccc', // You can keep your border here
          padding: '1px'
          
      }}>
        <ReactSketchCanvas
            ref={canvasRef}
            // These props tell the canvas to fill the 260x200 div above
            width="100%"
            height="100%"
            strokeWidth={8}
            strokeColor={strokeColor}
            canvasColor='DarkBlue'
        />
      </div>
      <div style={{ marginTop: '10px' }}>
      
  
      <div>
      <label htmlFor="colorPicker">Brush Color: </label>
      <input 
        type="color" 
        id="colorPicker"
        value={strokeColor} 
        onChange={(e) => setStrokeColor(e.target.value)} 
      />
        <button class="drawingbutton" onClick={handleSave}>Submit Final Answer</button>
        <button class="drawingbutton" onClick={handleClear}>Clear</button>
        <button class="drawingbutton"onClick={handleUndo}>Undo</button>
        </div>
      </div>
    </div>
  );
}

export default DrawingBoard;