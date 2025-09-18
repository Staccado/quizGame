import React, { useState, useEffect } from 'react';
import DragMove from './dragmove';
import hat from './hat.png';
import './Hat.css';

const Hat = ({ player, gameState, socket }) => {
  const [translate, setTranslate] = useState({
    x: 0,
    y: 0
  });
  
  const [hatSize, setHatSize] = useState({
    width: 100,
    height: 100
  });

  // Tray / placement state
  const [isHatsTrayOpen, setIsHatsTrayOpen] = useState(false);
  const [placedHatName, setPlacedHatName] = useState('hat1');
  
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

  const allHats = Array.from({ length: 10 }, (_, i) => `hat${i + 1}`);

  // Function to apply hat data from other players (for when server broadcasts hat positions)
  const applyHatData = (hatData) => {
    if (!hatData) return;
    
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // Convert percentages back to pixel positions
    setTranslate({
      x: hatData.x * viewportWidth,
      y: hatData.y * viewportHeight
    });
    
    setHatSize({
      width: hatData.width * viewportWidth,
      height: hatData.height * viewportHeight
    });
    
    if (hatData.hatName) {
      setPlacedHatName(hatData.hatName);
    }
  };

  const handleDragMove = (e) => {
    // Don't drag if we're resizing
    if (isResizing) return;
    
    setTranslate({
      x: translate.x + e.movementX,
      y: translate.y + e.movementY
    });
  };

  const handlePointerDown = (e) => {
    // Don't start dragging if clicking on resize handle
    if (e.target.classList.contains('resize-handle')) {
      e.stopPropagation();
      return false;
    }
    return true;
  };

  const handleResizeStart = (e) => {
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
    if (!isResizing) return;
    
    const deltaX = e.clientX - resizeStart.x;
    const deltaY = e.clientY - resizeStart.y;
    
    // Simple corner resize (maintains aspect ratio)
    const scale = Math.max(0.5, Math.min(3, 1 + (deltaX + deltaY) / 200));
    
    setHatSize({
      width: Math.max(50, Math.min(300, resizeStart.width * scale)),
      height: Math.max(50, Math.min(300, resizeStart.height * scale))
    });
  };

  const handleResizeEnd = () => {
    setIsResizing(false);
  };

  // Drag from tray -> drop on play area
  const handleHatDragStart = (e, hatName, isUnlocked) => {
    if (!isUnlocked) {
      e.preventDefault();
      return;
    }
    e.dataTransfer.setData('text/hat', hatName);
    e.dataTransfer.effectAllowed = 'copyMove';
  };

  const handlePlayAreaDragOver = (e) => {
    // Allow dropping
    e.preventDefault();
  };

  const handlePlayAreaDrop = (e) => {
    e.preventDefault();
    const droppedHatName = e.dataTransfer.getData('text/hat');
    if (!droppedHatName) return;

    // Replace any existing hat with the new one
    setPlacedHatName(droppedHatName);

    // Position hat at drop location (center it roughly)
    const boundingRect = e.currentTarget.getBoundingClientRect();
    const dropX = e.clientX - boundingRect.left;
    const dropY = e.clientY - boundingRect.top;
    setTranslate({
      x: Math.round(dropX - hatSize.width / 2),
      y: Math.round(dropY - hatSize.height / 2),
    });
  };

  const handlePointerUp = () => {
    //get the current x and y of the hat
    const currentX = translate.x;
    const currentY = translate.y;
    console.log('Current x and y of the hat:', currentX, currentY);
    console.log('Current hat size:', hatSize);

    // Calculate relative position as percentage of viewport for cross-resolution compatibility
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // Position as percentage of viewport (0.0 to 1.0)
    const relativeXPercent = currentX / viewportWidth;
    const relativeYPercent = currentY / viewportHeight;
    
    // Size as percentage of viewport width (for consistent scaling)
    const relativeWidthPercent = hatSize.width / viewportWidth;
    const relativeHeightPercent = hatSize.height / viewportHeight;

    console.log('Relative position (percentages):', {
      x: relativeXPercent,
      y: relativeYPercent,
      width: relativeWidthPercent,
      height: relativeHeightPercent
    });

    // Send this data to server for broadcasting to other players
    // The server can then apply these percentages to each player's viewport
    
    const hatDataToSend = {
      playerId: socket.id,
      hatName: placedHatName,
      position: {
        x: relativeXPercent,
        y: relativeYPercent
      },
      size: {
        width: relativeWidthPercent,
        height: relativeHeightPercent
      }
    };
    
    // Send hat update to server
    socket.emit('hatUpdate', hatDataToSend);
  };

  // Add resize event listeners
  useEffect(() => {
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
  }, [isResizing, resizeStart, hatSize]);

  // Handle window resize to maintain relative positioning
  useEffect(() => {
    const handleWindowResize = () => {
      // When window resizes, we could optionally maintain the hat's relative position
      // This is useful if you want hats to stay in the same relative position when window is resized
      // For now, we'll just log it - you can implement the logic if needed
      console.log('Window resized, current hat position:', translate, 'size:', hatSize);
    };

    window.addEventListener('resize', handleWindowResize);
    return () => window.removeEventListener('resize', handleWindowResize);
  }, [translate, hatSize]);

  return (
    <>
      {/* Hats tray toggle */}
      <div
        style={{
          position: 'fixed',
          top: '50%',
          left: 0,
          transform: 'translateY(-50%)',
          zIndex: 10000,
        }}
      >
        <div
          onClick={() => setIsHatsTrayOpen(!isHatsTrayOpen)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter') setIsHatsTrayOpen(!isHatsTrayOpen); }}
          style={{
            backgroundColor: '#1f2937',
            color: 'white',
            padding: '10px 12px',
            borderTopRightRadius: 8,
            borderBottomRightRadius: 8,
            boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
            cursor: 'pointer',
            userSelect: 'none',
            fontWeight: 600,
          }}
        >
          {isHatsTrayOpen ? 'Close Hats' : 'Hats'}
        </div>

        {isHatsTrayOpen && (
          <div
            style={{
              width: 220,
              maxHeight: '60vh',
              overflowY: 'auto',
              backgroundColor: '#111827',
              padding: 12,
              borderTopRightRadius: 8,
              borderBottomRightRadius: 8,
              boxShadow: '0 6px 16px rgba(0,0,0,0.35)',
              marginTop: 8,
            }}
          >
            <div style={{ color: 'white', marginBottom: 8, fontWeight: 700 }}>Select a Hat</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {allHats.map((hatName) => {
                const isUnlocked = !!(player && player.hatsUnlocked && player.hatsUnlocked.includes(hatName));
                const imgSrc = getHatAsset(hatName);
                return (
                  <div key={hatName} style={{ textAlign: 'center' }}>
                    <img
                      src={imgSrc}
                      alt={hatName}
                      draggable={isUnlocked}
                      onDragStart={(e) => handleHatDragStart(e, hatName, isUnlocked)}
                      onClick={() => {
                        if (!isUnlocked) return;
                        setPlacedHatName(hatName);
                      }}
                      style={{
                        width: 72,
                        height: 72,
                        objectFit: 'contain',
                        filter: isUnlocked ? 'none' : 'grayscale(100%)',
                        opacity: isUnlocked ? 1 : 0.5,
                        cursor: isUnlocked ? 'grab' : 'not-allowed',
                        border: placedHatName === hatName ? '2px solid #10b981' : '2px solid transparent',
                        borderRadius: 8,
                        backgroundColor: placedHatName === hatName ? 'rgba(16,185,129,0.1)' : 'transparent',
                      }}
                    />
                    <div style={{ color: '#e5e7eb', fontSize: 12, marginTop: 4 }}>{hatName}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {placedHatName && (
        <DragMove 
          onDragMove={handleDragMove}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerMove={() => {}}
        >
          <div style={{ 
            transform: `translate(${translate.x}px, ${translate.y}px)`, 
            position: 'fixed', 
            zIndex: 9999, 
            pointerEvents: 'auto',
            display: 'inline-block'
          }}>
            <div 
              style={{ 
                position: 'relative', 
                display: 'inline-block',
                ':hover .resize-handle': {
                  opacity: 1
                }
              }}
              className="hat-container"
            >
              <img 
                src={getHatAsset(placedHatName)} 
                alt="hat" 
                draggable={false}
                style={{
                  width: `${hatSize.width}px`,
                  height: `${hatSize.height}px`,
                  display: 'block'
                }}
              />
              {/* Resize handle */}
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
            </div>
          </div>
        </DragMove>
      )}
    </>
  );
};

export default Hat;
