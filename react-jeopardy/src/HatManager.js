import React, { useState, useEffect } from 'react';
import HatTray from './HatTray';
import PlayerHat from './PlayerHat';

const HatManager = ({ player, gameState, socket }) => {
  // Current player's hat state
  const [currentPlayerHat, setCurrentPlayerHat] = useState({
    hatName: 'hat1',
    position: { x: 0, y: 0 },
    size: { width: 100, height: 100 }
  });

  // Other players' hats state
  const [otherPlayersHats, setOtherPlayersHats] = useState({});

  // Handle hat selection from tray
  const handleHatSelect = (hatName) => {
    setCurrentPlayerHat(prev => ({
      ...prev,
      hatName
    }));
  };

  // Handle hat drag start from tray
  const handleHatDragStart = (e, hatName, isUnlocked) => {
    if (!isUnlocked) {
      e.preventDefault();
      return;
    }
    e.dataTransfer.setData('text/hat', hatName);
    e.dataTransfer.effectAllowed = 'copyMove';
  };

  // Handle drop on play area
  const handlePlayAreaDragOver = (e) => {
    e.preventDefault();
  };

  const handlePlayAreaDrop = (e) => {
    e.preventDefault();
    const droppedHatName = e.dataTransfer.getData('text/hat');
    if (!droppedHatName) return;

    // Position hat at drop location (center it roughly)
    const boundingRect = e.currentTarget.getBoundingClientRect();
    const dropX = e.clientX - boundingRect.left;
    const dropY = e.clientY - boundingRect.top;
    
    const newPosition = {
      x: Math.round(dropX - currentPlayerHat.size.width / 2),
      y: Math.round(dropY - currentPlayerHat.size.height / 2),
    };

    setCurrentPlayerHat(prev => ({
      ...prev,
      hatName: droppedHatName,
      position: newPosition
    }));
  };

  // Function to send hat updates to server
  const sendHatUpdateToServer = (hatData) => {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // Convert to percentages for cross-resolution compatibility
    const hatDataToSend = {
      playerId: socket.id,
      hatName: hatData.hatName,
      position: {
        x: hatData.position.x / viewportWidth,
        y: hatData.position.y / viewportHeight
      },
      size: {
        width: hatData.size.width / viewportWidth,
        height: hatData.size.height / viewportHeight
      }
    };

    // Send to server - this will be stored in gameState.players[playerId].playerHatPosition
    socket.emit('hatUpdate', hatDataToSend);
  };

  // Handle current player's hat position changes
  const handleCurrentPlayerHatPositionChange = (newPosition) => {
    setCurrentPlayerHat(prev => ({
      ...prev,
      position: newPosition
    }));

    // Send hat update to server
    sendHatUpdateToServer({
      hatName: currentPlayerHat.hatName,
      position: newPosition,
      size: currentPlayerHat.size
    });
  };

  // Handle current player's hat size changes
  const handleCurrentPlayerHatSizeChange = (newSize) => {
    setCurrentPlayerHat(prev => ({
      ...prev,
      size: newSize
    }));

    // Send hat update to server
    sendHatUpdateToServer({
      hatName: currentPlayerHat.hatName,
      position: currentPlayerHat.position,
      size: newSize
    });
  };

  // Listen for game state updates (includes hat data from other players)
  useEffect(() => {
    const handleGameTick = (newGameState) => {
      if (!newGameState || !newGameState.players) return;

      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      // Extract hat data from other players
      const otherPlayersHatData = {};
      
      newGameState.players.forEach(player => {
        if (player.id !== socket.id && 
            player.playerHatPosition && 
            player.playerHatPosition.position && 
            player.playerHatPosition.size && 
            player.playerHatPosition.hatName) {
          // Convert percentages back to pixel positions
          const pixelPosition = {
            x: player.playerHatPosition.position.x * viewportWidth,
            y: player.playerHatPosition.position.y * viewportHeight
          };
          
          const pixelSize = {
            width: player.playerHatPosition.size.width * viewportWidth,
            height: player.playerHatPosition.size.height * viewportHeight
          };

          otherPlayersHatData[player.id] = {
            hatName: player.playerHatPosition.hatName,
            position: pixelPosition,
            size: pixelSize
          };
        }
      });
      setOtherPlayersHats(otherPlayersHatData);
    };

    // Listen for game state updates (same as other components)
    socket.on('gameTick', handleGameTick);

    return () => {
      socket.off('gameTick', handleGameTick);
    };
  }, [socket.id]);

  // Handle window resize to maintain relative positioning
  useEffect(() => {
    const handleWindowResize = () => {
      // Recalculate other players' hat positions based on new viewport size
      setOtherPlayersHats(prev => {
        const updated = {};
        Object.entries(prev).forEach(([playerId, hatData]) => {
          // This would need the original percentage data from server
          // For now, we'll just log the resize
          console.log('Window resized, would recalculate hat for player:', playerId);
        });
        return prev;
      });
    };

    window.addEventListener('resize', handleWindowResize);
    return () => window.removeEventListener('resize', handleWindowResize);
  }, []);

  return (
    <>
      {/* Hat tray - only for current player */}
      <HatTray 
        player={player}
        onHatSelect={handleHatSelect}
        onHatDragStart={handleHatDragStart}
        placedHatName={currentPlayerHat.hatName}
      />

      {/* Current player's interactive hat */}
      {currentPlayerHat.hatName && (
        <PlayerHat
          hatName={currentPlayerHat.hatName}
          initialPosition={currentPlayerHat.position}
          initialSize={currentPlayerHat.size}
          isInteractive={true}
          onPositionChange={handleCurrentPlayerHatPositionChange}
          onSizeChange={handleCurrentPlayerHatSizeChange}
          playerId={socket.id}
          socket={socket}
        />
      )}

      {/* Other players' display-only hats */}
      {Object.entries(otherPlayersHats).map(([playerId, hatData]) => (
        <PlayerHat
          key={playerId}
          hatName={hatData.hatName}
          initialPosition={hatData.position}
          initialSize={hatData.size}
          isInteractive={false}
          playerId={playerId}
        />
      ))}
    </>
  );
};

export default HatManager;
