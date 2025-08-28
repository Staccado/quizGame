import React, { useState, useEffect, useContext, memo } from 'react';
import { SocketContext } from './SocketContext'; // Ensure this path is correct

const AudioManager = () => {
    console.log('AudioManager component rendered');
    const socket = useContext(SocketContext);
    console.log('socket', socket);
    const [volume, setVolume] = useState(0.5);

    const handleVolumeChange = (event) => {
        const newVolume = parseFloat(event.target.value);
        setVolume(newVolume);
    };

    useEffect(() => {
        console.log('useEffect called');
        const handlePlaySound = (soundURL) => {
            console.log(`Playing sound from URL: ${soundURL}`);


            const audio = new Audio(soundURL);

            audio.volume = volume;
            audio.play().catch(error => {
                console.error("Audio playback error:", error);
            });
        };

        if (socket) {
            socket.on('playSound', handlePlaySound);
        }

        // Cleanup function remains crucial for preventing memory leaks.
        return () => {
            if (socket) {
                socket.off('playSound', handlePlaySound);
            }
        };
    }, [socket, volume]);

    return (
        <div>
            
            <label htmlFor="volume-slider">Sound Volume</label>
            <input
                id="volume-slider"
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={volume}
                onChange={handleVolumeChange}
            />
        </div>
    );
};

export default AudioManager;