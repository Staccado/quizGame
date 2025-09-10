import React, { useState, useEffect, useContext } from 'react';
import { SocketContext } from './SocketContext';
import './podium.css';
import BuzzerBar from './BuzzerBar';

/**
 * JeopardyPodium
 * Fully styled to closely match the real Jeopardy podium design, now with a media display area.
 */
export function JeopardyPodium({ name = 'Player', score = 0, playerImage = '', hasWebcam = false, className = '' }) {
  const parsed = typeof score === 'number' ? score : Number(score);
  const safeScore = Number.isFinite(parsed) ? parsed : 0;

  const renderMediaContent = () => {
    if (hasWebcam) {
       //console.log('webcam found')
      return (
        <div className="podium-media-content">
          <p style={{color: 'white', fontSize: '0.875rem'}}>Webcam Feed</p>
        </div>
      );
    }
    
    if (playerImage) {
       //console.log('image found')
      return (
        <img 
          src={playerImage} 
          alt={`${name}'s avatar`} 
          onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/600x400/0b1f4d/ffffff?text=Image+Not+Found"; }}
        />
      );
    }
    if (!hasWebcam && !playerImage) {
       //console.log('no image or webcam')
    }
    return (
        
        <div className="podium-media-content">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="podium-placeholder-icon"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        </div>
    );
  };

  const scoreColorClass = safeScore < 0 ? 'score-negative' : 'score-positive';

  return (
    <div
      id={`podium-${name}`}
      className={`jeopardy-podium ${className}`}
      role="group"
      aria-label={`${name ?? 'Player'} podium`}
    >
      <div className="podium-media-area">
        {renderMediaContent()}
      </div>
        <BuzzerBar totalBoxes={7} playerName={name} />

      <div className="podium-score-area">
        <p className={`podium-score ${scoreColorClass}`}>{safeScore.toLocaleString()}</p>
      </div>

      <div className="podium-name-area">
        
        <p className="podium-name">{name ?? '—'}</p>
      </div>

      <div className="podium-base" aria-hidden="true" />
    </div>
  );
}

const handleBuzzerWinner = (buzzerWinner) => {
 // console.log('Buzzer winner from the podium.js: ', buzzerWinner);
  
};


const PodiumContainer = ({ spotlightPlayerId }) => {
  const socket = useContext(SocketContext);
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    const handleGameTick = (gameState) => {
      setPlayers(gameState.players);
    };

    socket.on('gameTick', handleGameTick);
    socket.on('buzzerWinner', handleBuzzerWinner);

    socket.emit('getGameState');

    return () => {
      socket.off('gameTick', handleGameTick);
    };
  }, [socket]);

  const displayedPlayers = spotlightPlayerId
    ? players.filter(player => player.id === spotlightPlayerId)
    : players.filter(player => player.isConnected);

  return (
    <div className="podium-container">
      {displayedPlayers.map((player, i) => (
        <JeopardyPodium
          key={player.id || i}
          name={player.name ?? `Player ${i + 1}`}
          score={player.score}
          playerImage={player.playerImage}
          hasWebcam={player.webcamStream}
        />
      ))}
    </div>
  );
};

export default PodiumContainer;
