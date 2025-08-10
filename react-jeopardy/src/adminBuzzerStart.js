import React, { useContext } from 'react';
import { SocketContext } from './SocketContext';
import './App.css';

const AdminBuzzerStart = ({ gameState }) => {
  const socket = useContext(SocketContext);
  const handleBuzzerActivate = () => {
    if (socket) {
      console.log('Admin activating buzzer...');
      socket.emit('buzzerActive', {});
    }
  };
  const handleFadeQuestion = () => {
    if (socket) {
      console.log('Admin fading question...');
      socket.emit('fadeQuestion');
    }
  };
  // Determine if buzzer should be enabled
  const isBuzzerEnabled = socket && !gameState?.buzzerActive;
  const isQuestionActive = socket && !gameState?.questionActive;

  return (
    <div className="admin-buzzer-container">
      <button 
        className={`admin-buzzer-button ${isBuzzerEnabled ? 'enabled' : 'disabled'}`}
        onClick={handleBuzzerActivate}
        disabled={!isBuzzerEnabled}
      >
        {gameState?.buzzerActive ? 'BUZZER ACTIVE' : 'ACTIVATE BUZZER'}
      </button>
      <button 
        className={`fadeQuestionButton ${isQuestionActive ? 'disabled' : 'enabled'}`}
        onClick={handleFadeQuestion}
        style={{display: isQuestionActive ? 'none' : 'block'}}
      >
        Fade Question
      </button>
      {gameState?.buzzerActive && (
        <div className="buzzer-status">
           Buzzer is active - waiting for players to buzz in...
        </div>
      )}
    </div>
  );
};

export default AdminBuzzerStart;
