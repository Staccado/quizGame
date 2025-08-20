
import React, { useState, useEffect, useContext, Profiler } from 'react';
import { SocketContext } from './SocketContext';
import Board from './Board';
import Buzzer from './buzzer';
import Podium from './podium';
import QuestionScreen from './questionScreen';
import { FinalJeopardy } from './finalJeopardy';

import './App.css'; // We can reuse the main App styles

const PlayerView = () => {
  const socket = useContext(SocketContext);
  const [gameState, setGameState] = useState(null);
  const [player, setPlayer] = useState(null);

  const profilerCallback = (id, phase, actualDuration, baseDuration, startTime, commitTime, interactions) => {
    console.log(`${id} phase: ${phase}, actual time: ${actualDuration}, base time: ${baseDuration}`);
  };


  useEffect(() => {
    const playerName = localStorage.getItem('playerName') || 'ReactPlayer';
    const playerImage = localStorage.getItem(`playerImage_${playerName}`);

    const playerData = {
        name: playerName,
        image: playerImage || "react.png",
        webcam: false
    };

    socket.io.opts.query = playerData;

    const handleConnect = () => {
        console.log('Player connected to server!');
        socket.emit('playerData', playerData);
    };

    if (socket.connected) {
        handleConnect();
    }

    socket.on('connect', handleConnect);

    socket.on('gameTick', (newGameState) => {
        setGameState(newGameState);
        const currentPlayer = newGameState.players.find(p => p.id === socket.id);
        setPlayer(currentPlayer);

    });
    //socket.on('question', setQuestion);
    socket.on('disconnect', () => console.log('Player disconnected.'));

    return () => {
        socket.off('connect', handleConnect);
        socket.off('gameTick');
        socket.off('disconnect');
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
      <div className="App">
        <h1>Player Showcase</h1>
        {showcasedPlayer && <h2>{showcasedPlayer.name}</h2>}
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
        <Podium />
        <Buzzer gameState={gameState} />
      </div>
    );
  }
};

export default PlayerView;
