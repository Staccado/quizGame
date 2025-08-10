
import React, { useState, useEffect, useContext } from 'react';
import { SocketContext } from './SocketContext';
import Board from './Board';
import AdminControls from './AdminControls'; // We will create this component next
import AdminBuzzerStart from './adminBuzzerStart';
import RightOrWrong from './rightOrWrong';
import './App.css';

const SERVER_URL = 'http://localhost:3001';

const AdminView = () => {
  const socket = useContext(SocketContext);
  const [gameState, setGameState] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [isQuestionVisible, setIsQuestionVisible] = useState(false);

  useEffect(() => {
    // Identify this client as the admin
    socket.io.opts.query = { name: 'ADMIN' };

    socket.on('connect', () => {
      console.log('Admin connected to server!');
      
      // Emit player data to register with the server
      socket.emit('playerData', {
        name: "ReactAdmin",
        image: "react.png",
        webcam: false
      });
    });

    socket.on('gameTick', (newGameState) => {
      setGameState(newGameState);
    });

    socket.on('questionSelected', (data) => {
      console.log('Question selected:', data);
      setCurrentQuestion(data);
      setIsQuestionVisible(false); // Reset visibility on new question
    });

    socket.on('showQuestion', () => {
      setIsQuestionVisible(true);
    });

    socket.on('questionCleared', () => {
      console.log('Question cleared');
      setCurrentQuestion(null);
    });

    socket.on('disconnect', () => console.log('Admin disconnected.'));

    return () => {
      socket.off('connect');
      socket.off('gameTick');
      socket.off('questionSelected');
      socket.off('showQuestion');
      socket.off('questionCleared');
      socket.off('disconnect');
    };
  }, [socket]);

  const getPlayerForRightOrWrong = () => {
    if (!gameState) return null;
    if (gameState.dailyDouble) {
      // For a daily double, the buttons should appear after the question is revealed.
      return isQuestionVisible ? gameState.dailyDoublePlayer : null;
    } else {
      // For a normal question, the buttons appear when a player has buzzed in.
      return gameState.highlightedPlayer;
    }
  };

  return (
    <div className="App">
      <h1>Jeopardy! Admin Control Panel</h1>
      {gameState && socket ? (
        <>
          <Board 
            boardData={gameState.board} 
            isAdmin={true} 
            onQuestionSelected={setCurrentQuestion}
          />
          <AdminBuzzerStart gameState={gameState} />
          <RightOrWrong 
            currentQuestion={currentQuestion} 
            highlightedPlayer={getPlayerForRightOrWrong()} 
          />
          <AdminControls gameState={gameState} />
        </>
      ) : (
        <h1>Connecting to server...</h1>
      )}
    </div>
  );
};

export default AdminView;
