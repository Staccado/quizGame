import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';

export default function DragMove(props) {
  const {
    onDragMove,
    onPointerDown,
    onPointerUp,
    children,
    style,
    className,
  } = props;

  const [isDragging, setIsDragging] = useState(false);
  // Use a ref to hold a reference to the DOM element
  const dragRef = useRef(null);

  const handlePointerDown = (e) => {
    // Check if we should allow dragging
    const shouldAllowDrag = onPointerDown(e);
    if (shouldAllowDrag === false) {
      return;
    }
    
    // Prevent default behaviors like text selection
    e.preventDefault(); 
    
    setIsDragging(true);

    // Capture the pointer
    // This tells the browser to send all future pointer events to this element
    dragRef.current.setPointerCapture(e.pointerId);
  };

  const handlePointerUp = (e) => {
    setIsDragging(false);
    onPointerUp(e);

    // Release the pointer capture
    dragRef.current.releasePointerCapture(e.pointerId);
  };
  
  const handlePointerMove = (e) => {
    // We only call onDragMove if dragging is active
    if (isDragging) {
      onDragMove(e);
    }
  };

  // The original useEffect for window 'pointerup' is no longer needed
  // because we will now handle it on the element itself thanks to pointer capture.
  
  return (
    <div
      ref={dragRef} // Assign the ref to the div
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerMove={handlePointerMove}
      style={style}
      className={className}
    >
      {children}
    </div>
  );
}

// PropTypes and defaultProps remain the same...