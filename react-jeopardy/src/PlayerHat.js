import React, { useState, useEffect } from 'react';
import DragMove from './dragmove';
import hat from './hat.png';
import './Hat.css';

const PlayerHat = ({ 
  hatName, 
  initialPosition = { x: 0, y: 0 }, 
  initialSize = { width: 100, height: 100 },
  isInteractive = false,
  onPositionChange,
  onSizeChange,
  playerId = null,
  socket = null
}) => {
  const [translate, setTranslate] = useState(initialPosition);
  const [hatSize, setHatSize] = useState(initialSize);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });

  // Helper to resolve hat asset by name; falls back to default `hat.png`
  const getHatAsset = (hatName) => {
    try {
      // Try common locations; adjust if a dedicated folder exists
      // eslint-disable-next-line global-require, import/no-dynamic-require
      return require(`./hats/${hatName}.png`);
    } catch (e1) {
      try {
        // Fallback to root if hats are placed alongside other images
        // eslint-disable-next-line global-require, import/no-dynamic-require
        return require(`./${hatName}.png`);
      } catch (e2) {
        return hat;
      }
    }
  };

  const handleDragMove = (e) => {
    if (!isInteractive || isResizing) return;
    
    const newTranslate = {
      x: translate.x + e.movementX,
      y: translate.y + e.movementY
    };
    
    setTranslate(newTranslate);
    onPositionChange?.(newTranslate);
  };

  const handlePointerDown = (e) => {
    if (!isInteractive) return false;
    
    // Don't start dragging if clicking on resize handle
    if (e.target.classList.contains('resize-handle')) {
      e.stopPropagation();
      return false;
    }
    return true;
  };

  const handleResizeStart = (e) => {
    if (!isInteractive) return;
    
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: hatSize.width,
      height: hatSize.height
    });
  };

  const handleResizeMove = (e) => {
    if (!isInteractive || !isResizing) return;
    
    const deltaX = e.clientX - resizeStart.x;
    const deltaY = e.clientY - resizeStart.y;
    
    // Simple corner resize (maintains aspect ratio)
    const scale = Math.max(0.5, Math.min(3, 1 + (deltaX + deltaY) / 200));
    
    const newSize = {
      width: Math.max(50, Math.min(300, resizeStart.width * scale)),
      height: Math.max(50, Math.min(300, resizeStart.height * scale))
    };
    
    setHatSize(newSize);
    onSizeChange?.(newSize);
  };

  const handleResizeEnd = () => {
    setIsResizing(false);
  };

  const handlePointerUp = () => {
    //if (!isInteractive) return;
    
    // Calculate relative position as percentage of viewport for cross-resolution compatibility
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // Position as percentage of viewport (0.0 to 1.0)
    const relativeXPercent = translate.x / viewportWidth;
    const relativeYPercent = translate.y / viewportHeight;
    
    // Size as percentage of viewport width (for consistent scaling)
    const relativeWidthPercent = hatSize.width / viewportWidth;
    const relativeHeightPercent = hatSize.height / viewportHeight;

    console.log('Hat position updated:', {
      playerId,
      hatName,
      position: { x: relativeXPercent, y: relativeYPercent },
      size: { width: relativeWidthPercent, height: relativeHeightPercent }
    });

    // Send this data to server for broadcasting to other players
    if (socket && isInteractive) {
      const hatData = { 
        playerId, 
        hatName, 
        position: { x: relativeXPercent, y: relativeYPercent }, 
        size: { width: relativeWidthPercent, height: relativeHeightPercent } 
      };
      socket.emit('hatUpdate', hatData);
    }
  };

  // Add resize event listeners for interactive hats
  useEffect(() => {
    if (!isInteractive) return;

    const handleGlobalMouseMove = (e) => {
      if (isResizing) {
        handleResizeMove(e);
      }
    };

    const handleGlobalMouseUp = () => {
      if (isResizing) {
        handleResizeEnd();
      }
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isInteractive, isResizing, resizeStart, hatSize]);

  // Update position and size when props change (for other players' hats)
  useEffect(() => {
    setTranslate(initialPosition);
  }, [initialPosition]);

  useEffect(() => {
    setHatSize(initialSize);
  }, [initialSize]);

  if (!hatName) return null;

  const hatContent = (
    <div style={{ 
      transform: `translate(${translate.x}px, ${translate.y}px)`, 
      position: 'fixed', 
      zIndex: 9999, 
      pointerEvents: isInteractive ? 'auto' : 'none',
      display: 'inline-block'
    }}>
      <div 
        style={{ 
          position: 'relative', 
          display: 'inline-block'
        }}
        className="hat-container"
      >
        <img 
          src={getHatAsset(hatName)} 
          alt="hat" 
          draggable={false}
          style={{
            width: `${hatSize.width}px`,
            height: `${hatSize.height}px`,
            display: 'block'
          }}
        />
        {/* Resize handle - only show for interactive hats */}
        {isInteractive && (
          <div
            className="resize-handle"
            style={{
              position: 'absolute',
              bottom: '-8px',
              right: '-8px',
              width: '16px',
              height: '16px',
              backgroundColor: '#007bff',
              border: '2px solid white',
              borderRadius: '50%',
              cursor: 'nw-resize',
              pointerEvents: 'auto',
              opacity: 0,
              transition: 'opacity 0.2s ease',
              zIndex: 10000
            }}
            onMouseDown={handleResizeStart}
          />
        )}
      </div>
    </div>
  );

  // Wrap in DragMove only if interactive
  if (isInteractive) {
    return (
      <DragMove 
        onDragMove={handleDragMove}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerMove={() => {}}
      >
        {hatContent}
      </DragMove>
    );
  }

  return hatContent;
};

export default PlayerHat;
