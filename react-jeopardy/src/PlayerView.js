
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
      <div className="App">
        <div>
        
       

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
                  src={hat} 
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
