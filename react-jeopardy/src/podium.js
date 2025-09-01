import React, { useState, useEffect, useContext, useRef } from 'react';
import { SocketContext } from './SocketContext';
import { LiveKitContext } from './LiveKitContext'; // Import the new context
import { Track } from 'livekit-client';
import './podium.css';

// --- Our new reusable video component ---
const VideoRenderer = ({ track }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    if (track) {
      const el = videoRef.current;
      track.attach(el);
      return () => {
        track.detach(el);
      };
    }
  }, [track]);

  return <video ref={videoRef} width="100%" height="100%" style={{ objectFit: 'cover' }} autoPlay muted />;
};


// --- Updated JeopardyPodium Component ---
// Changed hasWebcam prop to videoTrack
export function JeopardyPodium({ name = 'Player', score = 0, playerImage = '', videoTrack = null, className = '' }) {
  const parsed = typeof score === 'number' ? score : Number(score);
  const safeScore = Number.isFinite(parsed) ? parsed : 0;

  const renderMediaContent = () => {
    // Priority 1: If there's a video track, render it.
    if (videoTrack) {
      return (
        <div className="podium-media-content">
           <VideoRenderer track={videoTrack} />
        </div>
      );
    }
    
    // Priority 2: If there's an image, render it.
    if (playerImage) {
      return (
        <img 
          src={playerImage} 
          alt={`${name}'s avatar`} 
          onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/600x400/0b1f4d/ffffff?text=Image+Not+Found"; }}
        />
      );
    }

    // Priority 3: Fallback to the placeholder icon.
    return (
      <div className="podium-media-content">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="podium-placeholder-icon"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
      </div>
    );
  };

  const scoreColorClass = safeScore < 0 ? 'score-negative' : 'score-positive';

  return (
    <div className={`jeopardy-podium ${className}`} role="group" aria-label={`${name ?? 'Player'} podium`}>
      <div className="podium-media-area">
        {renderMediaContent()}
      </div>
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

// --- Updated PodiumContainer ---
const PodiumContainer = ({ spotlightPlayerId }) => {
  const socket = useContext(SocketContext);
  // NEW: Consume the LiveKitContext
  const { participants } = useContext(LiveKitContext); 
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    const handleGameTick = (gameState) => {
      setPlayers(gameState.players);
    };

    socket.on('gameTick', handleGameTick);
    socket.emit('getGameState');

    return () => {
      socket.off('gameTick', handleGameTick);
    };
  }, [socket]);

  // Create a quick lookup map for participants by their identity (which should be player.id)
  const participantMap = new Map(
    participants.map(p => [p.identity, p])
  );

  const displayedPlayers = spotlightPlayerId
    ? players.filter(player => player.id === spotlightPlayerId)
    : players.filter(player => player.isConnected);

  return (
    <div className="podium-container">
      {displayedPlayers.map((player, i) => {
        // Find the corresponding LiveKit participant for this player
        const participant = participantMap.get(player.id);
        // Get their camera track, if it exists and is published
        const videoTrack = participant?.getTrackPublication(Track.Source.Camera)?.track;

        return (
          <JeopardyPodium
            key={player.id || i}
            name={player.name ?? `Player ${i + 1}`}
            score={player.score}
            playerImage={player.playerImage}
            // Pass the track object to the podium component
            videoTrack={videoTrack}
          />
        );
      })}
    </div>
  );
};

export default PodiumContainer;