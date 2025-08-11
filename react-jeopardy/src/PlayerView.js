
import React, { useState, useEffect, useContext } from 'react';
import { SocketContext } from './SocketContext';
import Board from './Board';
import Buzzer from './buzzer';
import Podium from './podium';
import QuestionScreen from './questionScreen';
import FinalJeopardy from './finalJeopardy.js'

import './App.css'; // We can reuse the main App styles

const PlayerView = () => {
  const socket = useContext(SocketContext);
  const [gameState, setGameState] = useState(null);


  useEffect(() => {
    const playerImage = localStorage.getItem('playerImage');
    const playerName = localStorage.getItem('playerName') || 'ReactPlayer';

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
    socket.on('gameTick', setGameState);
    //socket.on('question', setQuestion);
    socket.on('disconnect', () => console.log('Player disconnected.'));

    return () => {
        socket.off('connect', handleConnect);
        socket.off('gameTick');
        socket.off('disconnect');
    };
  }, [socket]);

  return (
    <div className="App">
      {gameState ? (
        <>
          <div className="board-area-container">
            <Board boardData={gameState.board} isAdmin={false} />
            <QuestionScreen gameState={gameState} />
          </div>
          <Podium />
          {/* Buzzer component for players */}
          <Buzzer gameState={gameState} />
        </>
      ) : (
        <h1>Waiting for game to start...</h1>
      )}
    </div>
  );
};

export default PlayerView;
