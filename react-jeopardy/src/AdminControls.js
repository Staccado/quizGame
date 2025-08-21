
import React, { useContext, useState } from 'react';
import { SocketContext } from './SocketContext';

const AdminControls = ({ gameState }) => {
  const socket = useContext(SocketContext);
  const [wager, setWager] = useState('');

  const handleSetPlayerControl = (playerId) => {
    if (socket) {
      socket.emit('adminSetPlayerControl', { playerId });
    }
  };

  const handleSubmitWager = () => {
    if (socket && wager) {
      socket.emit('submitWager', { wager: parseInt(wager, 10) });
      setWager('');
    }
  };

  const handleRevealQuestion = () => {
    if (socket) {
      socket.emit('revealQuestion');
    }
  };

  const handleAwardPoints = (playerId, amount) => {
    if (socket) {
      console.log(`ADMIN ACTION: Awarding ${amount} points to ${playerId}`);
      socket.emit('admin:awardPoints', { playerId, amount });
    }
  };

  const handleStartFinalJeopardy = () => {
    if (socket) {
      socket.emit('start-final-jeopardy', { category: 'FINAL JEOPARDY', question: 'This is the Final Jeopardy question.', answer: 'This is the answer.' });
    }
  };

  const handlePlayerShowcase = () => {
    if (socket) {
      socket.emit('playerShowcase');
    }
  };

  const handleStartDoubleJeopardy = () => {
    if (socket) {
      socket.emit('startDoubleJeopardy');
    }
  };

  const dailyDoublePlayer = gameState && gameState.players.find(p => p.id === gameState.dailyDoublePlayer);

  return (
    <div className="admin-controls">
      <h2>Admin Controls</h2>
      <button onClick={handleStartFinalJeopardy}>Start Final Jeopardy</button>
      <button onClick={handlePlayerShowcase}>Player Showcase</button>
      {gameState && gameState.dailyDouble && gameState.questionActive && (
        <div className="daily-double-controls">
          <h3>Daily Double!</h3>
          {dailyDoublePlayer && <p>Assigned to: {dailyDoublePlayer.name}</p>}
          <input
            type="number"
            value={wager}
            onChange={(e) => setWager(e.target.value)}
            placeholder="Enter wager"
          />
          <button onClick={handleSubmitWager}>Submit Wager</button>
          <button onClick={handleRevealQuestion}>Reveal Question</button>
        </div>
      )}

      <div className="player-controls">
        {gameState && gameState.players && gameState.players.map(player => (
          <div key={player.id} className="player-control-group" style={{display: player.isConnected ? 'block' : 'none'}}>
            <span>{player.name} ({player.score})</span>
            <button onClick={() => handleSetPlayerControl(player.id)}>Set Control</button>
            <button onClick={() => handleAwardPoints(player.id, 1000)}>+1000</button>
            <button onClick={() => handleAwardPoints(player.id, -1000)}>-1000</button>
            <button onClick={handleStartDoubleJeopardy}>Start Double Jeopardy</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminControls;
