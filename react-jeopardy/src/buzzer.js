
import React, { useState, useEffect, useContext } from 'react';
import { SocketContext } from './SocketContext';
import './App.css';

const Buzzer = ({ gameState }) => {
    const socket = useContext(SocketContext);
    const [buzzerPressed, setBuzzerPressed] = useState(false);
    const [buzzerActivatedTime, setBuzzerActivatedTime] = useState(null);

    // Track when buzzer becomes active
    useEffect(() => {

        
        if (gameState && gameState.buzzerActive && !buzzerActivatedTime) {
            setBuzzerActivatedTime(Date.now());
            // Reset buzzer pressed state when buzzer becomes active
            setBuzzerPressed(false);
        } else if (gameState && !gameState.buzzerActive) {
            setBuzzerActivatedTime(null);
            // Reset buzzer pressed state when buzzer becomes inactive
            setBuzzerPressed(false);
        }
    }, [gameState?.buzzerActive, buzzerActivatedTime]);

    const handleBuzzerPress = () => {
        if (gameState && gameState.buzzerActive && socket && buzzerActivatedTime) {
            const reactionTime = Date.now() - buzzerActivatedTime;
            console.log('buzzer pressed, reaction time: ', reactionTime, 'ms', );
            
            setBuzzerPressed(true);
            socket.emit('buzzerPressed', {
                playerId: socket.id,
                timestamp: Date.now(),
                reactionTime: reactionTime // Time in milliseconds from activation to press
            });
            
            // Reset buzzer state after a short delay
           // setTimeout(() => {
             //   setBuzzerPressed(false);
            //}, 1000);
        }
    };

    // Determine if buzzer should be enabled
    const isBuzzerEnabled = gameState && gameState.buzzerActive && !buzzerPressed;
    
    // Also reset buzzer pressed state when buzzer becomes active again
    useEffect(() => {
        if (gameState && gameState.buzzerActive) {
            setBuzzerPressed(false);
        }
    }, [gameState?.buzzerActive]);

    return (
        <div className="buzzer-container">
            <button 
                className={`buzzer-button ${isBuzzerEnabled ? 'enabled' : 'disabled'}`}
                onClick={handleBuzzerPress}
                disabled={!isBuzzerEnabled}
            >
                {isBuzzerEnabled ? 'BUZZ IN!' : 'WAITING...'}
            </button>
        </div>
    );
};

export default Buzzer;
            