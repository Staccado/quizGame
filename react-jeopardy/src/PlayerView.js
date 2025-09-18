
import React, { useState, useEffect, useContext, Profiler } from 'react';
import { SocketContext } from './SocketContext';
import Board from './Board';
import Buzzer from './buzzer';
import PodiumContainer, { JeopardyPodium } from './podium';
import QuestionScreen from './questionScreen';
import { FinalJeopardy } from './finalJeopardy';

import DragMove from './dragmove';
import hat from './hat.png';




import './App.css'; // We can reuse the main App styles

const PlayerView = () => {
  const socket = useContext(SocketContext);
  const [gameState, setGameState] = useState(null);
  const [player, setPlayer] = useState(null);

  const profilerCallback = (id, phase, actualDuration, baseDuration, startTime, commitTime, interactions) => {
    //console.log(`${id} phase: ${phase}, actual time: ${actualDuration}, base time: ${baseDuration}`);
  };
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
  
  const [isResizing, setIsResizing] = useState(false);
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });

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
  



  useEffect(() => {
    // Handle socket connection and player registration
    socket.on('connect', () => {
      console.log('Player socket connected, sending player data for reconnection');
      
      // Get player data from localStorage and send it immediately
      const playerName = localStorage.getItem('playerName') || 'Anonymous Player';
      const playerImage = localStorage.getItem('playerImage') || "react.png";
      
      const playerData = {
        name: playerName,
        image: playerImage,
        webcam: false
      };
      
      console.log('Sending player data for reconnection:', playerData);
      socket.emit('playerData', playerData);
    });

    // Listen for game state updates
    socket.on('gameTick', (newGameState) => {
        setGameState(newGameState);
        const currentPlayer = newGameState.players.find(p => p.id === socket.id);
        setPlayer(currentPlayer);
    });

    return () => {
        socket.off('connect');
        socket.off('gameTick');
    };
  }, [socket]);

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

  useEffect(() => {
    socket.on('buzzerWinner', (buzzerWinner) => {
     // console.log('Buzzer winner from the player view.js ', buzzerWinner);
    });

    return () => {
      socket.off('buzzerWinner');
    };
  }, [socket]);


  
  if (!gameState) {
    return (
      <div className="App">
        <h1>Waiting for game to start...</h1>
      </div>
    );
  }

  if (gameState.playerShowcase.active) {
    const showcasedPlayer = gameState.players.find(p => p.id === gameState.finalJeopardySpotlight);
    return (
      


      <div className="showcase">
        <h1>Player Showcase</h1>
        {showcasedPlayer && <h2>{showcasedPlayer.name}</h2>}
        <JeopardyPodium
                    name={showcasedPlayer.name}
                    score={showcasedPlayer.score}
                    playerImage={showcasedPlayer.playerImage}
                    hasWebcam={showcasedPlayer.webcamStream}
                    className="daily-double-podium2"
                />
      </div>
    );
  }


  if (gameState.finalJeopardyActive) {
    return (
      <div className="App">
        <FinalJeopardy gameState={gameState} player={player} isAdmin={false} />
      </div>
    );
  } else {


    if (!gameState.winner) {
    return (
      <div
        className="App"
        onDragOver={handlePlayAreaDragOver}
        onDrop={handlePlayAreaDrop}
      >
        <div>
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
            onPointerUp={() => {}}
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

        
        
        <div className="board-area-container">
          <Profiler id="BoardProfiler" onRender={profilerCallback}>
            <Board boardData={gameState.board} isAdmin={false} />
          </Profiler>
          <QuestionScreen gameState={gameState} />

        </div>
        <PodiumContainer />
        <Buzzer gameState={gameState} />
        
        </div>
      </div>
    );
  } else {
    return (
      <div className="App">
        <div className="winner-container" style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh'}}>
        <h1>Winner {gameState.winner.name}</h1>
        <JeopardyPodium
                    name={gameState.winner.name}
                    score={gameState.winner.score}
                    playerImage={gameState.winner.playerImage}
                    hasWebcam={gameState.winner.webcamStream}
                    className="daily-double-podium2"
                />
      </div>
      </div>
    );
  }
  }
};

export default PlayerView;
