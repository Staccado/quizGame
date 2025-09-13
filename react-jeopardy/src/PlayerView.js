
import React, { useState, useEffect, useContext, Profiler } from 'react';
import { SocketContext } from './SocketContext';
import Board from './Board';
import Buzzer from './buzzer';
import PodiumContainer, { JeopardyPodium } from './podium';
import QuestionScreen from './questionScreen';
import { FinalJeopardy } from './finalJeopardy';

import './App.css'; // We can reuse the main App styles

const PlayerView = () => {
  const socket = useContext(SocketContext);
  const [gameState, setGameState] = useState(null);
  const [player, setPlayer] = useState(null);

  const profilerCallback = (id, phase, actualDuration, baseDuration, startTime, commitTime, interactions) => {
    //console.log(`${id} phase: ${phase}, actual time: ${actualDuration}, base time: ${baseDuration}`);
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
    return (
      <div className="App">
        <div className="board-area-container">
          <Profiler id="BoardProfiler" onRender={profilerCallback}>
            <Board boardData={gameState.board} isAdmin={false} />
          </Profiler>
          <QuestionScreen gameState={gameState} />
        </div>
        <PodiumContainer />
        <Buzzer gameState={gameState} />
      </div>
    );
  }
};

export default PlayerView;
