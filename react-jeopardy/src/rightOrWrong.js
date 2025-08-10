import React, { useContext } from 'react';
import { SocketContext } from './SocketContext';

const RightOrWrong = ({ currentQuestion, highlightedPlayer }) => {
  const socket = useContext(SocketContext);
  // Only show the buttons if there's a highlighted player (someone buzzed in)
  if (!highlightedPlayer || !currentQuestion) {
    return null;
  }

  const handleClearQuestion = () => {
    if (socket) {
      console.log('ADMIN ACTION: Clearing current question');
      socket.emit('clearQuestion');
    }
  };

  const handleAnswer = (isCorrect) => {
    if (socket && currentQuestion) {
      console.log(`ADMIN ACTION: Marking answer as ${isCorrect ? 'correct' : 'incorrect'} for question ${currentQuestion.categoryName} - ${currentQuestion.value}`);
      
      // Send the questionAnswered event with the required data
      socket.emit('questionAnswered', {
        categoryName: currentQuestion.categoryName,
        value: currentQuestion.value,
        correct: isCorrect,
        playerId: highlightedPlayer
      });
    }
  };

  return (
    <div className="right-or-wrong-container">
      <h3>Mark Answer</h3>
      <div className="question-info">
        <p><strong>Category:</strong> {currentQuestion.categoryName}</p>
        <p><strong>Value:</strong> ${currentQuestion.value}</p>
        <p><strong>Player:</strong> {highlightedPlayer}</p>
      </div>
      <div className="answer-buttons">
        <button 
          className="correct-button"
          onClick={() => handleAnswer(true)}
        >
          ✓ Correct
        </button>
        <button 
          className="incorrect-button"
          onClick={() => handleAnswer(false)}
        >
          ✗ Incorrect
        </button>
        <button 
          className="clear-button"
          onClick={handleClearQuestion}
        >
          Clear Question
        </button>
      </div>
    </div>
  );
};

export default RightOrWrong;
