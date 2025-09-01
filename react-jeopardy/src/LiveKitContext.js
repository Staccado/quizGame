import React, { createContext, useState, useContext, useCallback } from 'react';
import { Room, RoomEvent, Participant } from 'livekit-client';

export const LiveKitContext = createContext(null);

export const LiveKitProvider = ({ children }) => {
  const [room, setRoom] = useState(null);
  const [participants, setParticipants] = useState([]);

  const updateParticipants = () => {
    if (room) {
      const remoteParticipants = Array.from(room.participants.values());
      const allParticipants = [room.localParticipant, ...remoteParticipants];
      setParticipants(allParticipants);
    }
  };

  const connectToRoom = useCallback(async (token) => {
    const newRoom = new Room({
      // These are sensible defaults for a game
      adaptiveStream: true,
      dynacast: true,
    });
    
    newRoom.on(RoomEvent.ParticipantConnected, updateParticipants);
    newRoom.on(RoomEvent.ParticipantDisconnected, updateParticipants);
    newRoom.on(RoomEvent.TrackSubscribed, updateParticipants);
    newRoom.on(RoomEvent.TrackUnsubscribed, updateParticipants);
    newRoom.on(RoomEvent.LocalTrackPublished, updateParticipants);
    newRoom.on(RoomEvent.LocalTrackUnpublished, updateParticipants);
    
    // Replace with your LiveKit server URL
    const serverUrl = 'ws://localhost:7880'; 
    await newRoom.connect(serverUrl, token);

    setRoom(newRoom);
    updateParticipants(); // Initial participant list
  }, []);

  const value = { room, participants, connectToRoom };

  return (
    <LiveKitContext.Provider value={value}>
      {children}
    </LiveKitContext.Provider>
  );
};