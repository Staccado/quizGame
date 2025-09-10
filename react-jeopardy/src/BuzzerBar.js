import React, { useState, useContext , useEffect} from 'react';
import './BuzzerBar.css'; // We'll create this new CSS file
import { SocketContext } from './SocketContext';


const BuzzerBar = ({ totalBoxes, playerName }) => {
  const socket = useContext(SocketContext);
  
  // Initialize activeCount to 0
  const [activeCount, setActiveCount] = useState(0);
  
  const handleBuzzerWinner = (buzzerWinner) => {
    console.log('Buzzer winner from the buzzer bar.js: ', buzzerWinner.name);
    console.log('This podium is for player: ', playerName);

    // Only activate if this buzzer bar belongs to the winning player
    if (buzzerWinner.name === playerName) {
      console.log('Activating buzzer bar for player: ', playerName);
      
      // Reset the bar first
      setActiveCount(0);
      
      // Then fill it up gradually
      for(let i = 1; i <= 8; i++) {
        setTimeout(() => {
          setActiveCount(i);
        }, 50 * i);
      }
      setTimeout(() => {
        setActiveCount(0);
      }, 5000);


    } else {
      console.log('Not activating buzzer bar - wrong player');
    }
  };

  useEffect(() => {
    socket.on('buzzerWinner', (buzzerWinner) => handleBuzzerWinner(buzzerWinner));
  }, [socket]);

  return (
    <div className="buzzer-bar-container">
      {/* Create an array of a specific length and map over it to render the boxes */}
      {Array.from({ length: totalBoxes }).map((_, index) => {
        // Determine if the current box should be active
        const isActive = index < activeCount;
        
        return (
          <div 
            key={index} 
            className={`buzzer-box ${isActive ? 'active' : ''}`}
          ></div>
        );
      })}
    </div>
  );
};

export default BuzzerBar;