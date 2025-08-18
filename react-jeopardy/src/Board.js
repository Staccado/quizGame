
import React, { useContext, memo } from 'react';
import { SocketContext } from './SocketContext';
import './Board.css';

// The component now receives 'isAdmin', 'socket', and 'onQuestionSelected' as props
const Board = ({ boardData, isAdmin, onQuestionSelected }) => {
  const socket = useContext(SocketContext);

  // If there's no board data yet, or it's not an array, show a loading message.
  if (!boardData || !Array.isArray(boardData)) {
    return <div>Loading board...</div>;
  }

  // --- Data Transformation ---
  const categories = boardData.map(category => category.categoryName);
  const prices = boardData[0]?.questions.map(q => q.value) || [];

  const handleCellClick = (categoryName, price) => {
    // Only admins can select questions
    if (isAdmin && socket) {
      console.log(`ADMIN ACTION: Selecting question for ${categoryName} - ${price}`);
      // Emit an event to the server to signal the question selection
      socket.emit('questionSelected', { categoryName, value: price });
      
      // Also notify the parent component about the selected question
      if (onQuestionSelected) {
        onQuestionSelected({ categoryName, value: price });
      }
    }
  };

  // Create a single flat array for the grid
  const grid = [];

  // Add the category headers first
  categories.forEach(category => {
    grid.push({ type: 'category', content: category });
  });

  // Add the price cells row by row
  prices.forEach(price => {
    boardData.forEach((category, catIndex) => {
      // Find the specific question for this cell
      const question = category.questions.find(q => q.value === price);
      grid.push({ 
        type: 'price', 
        content: `${price}`,
        id: `${category.categoryName}-${price}`, // A more descriptive ID
        categoryName: category.categoryName, // Add category name to cell data
        price: price, // Add price to cell data
        isAnswered: question ? question.answered : false // Note: your server sends "answered"
      });
    });
  });

  return (
    <div className="board-container">
      {grid.map((cell, index) => (
        <div 
          key={cell.id || index} 
          className={`${cell.type}-cell ${cell.isAnswered ? 'answered' : ''} ${isAdmin ? 'admin-clickable' : ''}`}
          // Add the onClick handler to the price cells
          onClick={() => cell.type === 'price' && handleCellClick(cell.categoryName, cell.price)}
        >
          {cell.content}
        </div>
      ))}
    </div>
  );
};

// Custom comparison function for React.memo
// This prevents re-rendering unless the board data or admin status actually changes.
const areBoardsEqual = (prevProps, nextProps) => {
  // Using JSON.stringify is a simple way to deep compare, but not the most performant.
  // For this app's scale, it's perfectly fine. In larger apps, consider a library like lodash.isEqual.
  const isBoardDataEqual = JSON.stringify(prevProps.boardData) === JSON.stringify(nextProps.boardData);
  const isAdminEqual = prevProps.isAdmin === nextProps.isAdmin;
  return isBoardDataEqual && isAdminEqual;
};

export default memo(Board, areBoardsEqual);
