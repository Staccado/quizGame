import React, { useState, useContext } from 'react';
import { SocketContext } from './SocketContext';
import './finalJeopardy.css';
import DrawingBoard from './drawing';
import PodiumContainer from './podium';


export function FinalJeopardy({ gameState, player, isAdmin }) {
    const socket = useContext(SocketContext);
    const [wager, setWager] = useState('');

    const handleWagerSubmit = (e) => {
        e.preventDefault();
        socket.emit('submit-final-jeopardy-wager', { wager });
    };

    const handleDrawingSubmit = (imageData) => {
        socket.emit('submit-final-jeopardy-answer', imageData);
    };

    const handleRevealQuestion = () => {
        socket.emit('reveal-final-jeopardy-question');
    };

    const handleRuling = (playerId, correct) => {
        socket.emit('final-jeopardy-ruling', { playerId, correct });
    };
    const showAnswer = (playerId, answer) => {
        console.log('revealing answer for', playerId)
        let data = {player:playerId, 
            answer:answer
        }
        socket.emit('revealFinalJeopardyAnswer',data)
        socket.emit('printData')


    }

    

    if (isAdmin) {
        return (
            <div className="final-jeopardy-admin-container">
                <h1>Final Jeopardy - Admin</h1>
                <button onClick={handleRevealQuestion}>Reveal Question</button>
                <button onClick={() => socket.emit('startFinalJeopardyTimer')}>Start Timer</button>
                {gameState.finalJeopardyRevealed && (
                    <h3>Question: {gameState.finalJeopardyQuestion}</h3>
                )}
                <div>
                    <h3>Wagers:</h3>
                    <ul>
                        {gameState.finalJeopardyWagers && Object.entries(gameState.finalJeopardyWagers).map(([playerId, wager]) => {
                            const player = gameState.players.find(p => p.id === playerId);
                            return (
                                <li key={playerId}>
                                    <strong>{player ? player.name : 'Unknown'}:</strong> ${wager}
                                </li>
                            );
                        })}
                    </ul>
                </div>
                <div>
                    <h3>Answers:</h3>
                    <ul>
                        {gameState.finalJeopardyAnswers && Object.entries(gameState.finalJeopardyAnswers).map(([playerId, answer]) => {
                            const player = gameState.players.find(p => p.id === playerId);
                            return (
                                <li key={playerId}>
                                    <strong>{player ? player.name : 'Unknown'}:</strong> <img src={answer}/>
                                    
                                    <button onClick={() => handleRuling(playerId, true)}>Correct</button>
                                    <button onClick={() => handleRuling(playerId, false)}>Incorrect</button>
                                    <button onClick={() => showAnswer(playerId, answer)}>Show Answer</button>
                                    
                                </li>
                            );
                        })}
                    </ul>
                </div>
                <button onClick={() => socket.emit('end-final-jeopardy')}>End Final Jeopardy</button>
            </div>
        );
    }

    const renderFinalJeopardy = () => {
        const renderContent = () => {
            if (gameState.finalJeopardySpotlight) {
                return (
                    <div className="final-jeopardy-spotlight-info">
                        <h2>Answer Spotlight</h2>
                        <h3>{gameState.players.find(p => p.id === gameState.finalJeopardySpotlight)?.name}</h3>
                        <img src={gameState.finalJeopardyAnswers[gameState.finalJeopardySpotlight]} alt="Final Jeopardy Answer" />
                        
                    </div>
                );
            }
            if (!gameState.finalJeopardyRevealed) {
                return (
                    <div>
                    <form onSubmit={handleWagerSubmit} className="final-jeopardy-form">
                        <h1 className="final-jeopardy-category">{gameState.finalJeopardyCategory}</h1>
                        <label>
                            Enter your wager:
                            <input type="number" value={wager} onChange={(e) => setWager(e.target.value)} />
                        </label>
                        <button type="submit">Submit Wager</button>
                    </form>
                    
                    </div>
                );
            }

            // When final jeopardy is revealed, but before the timer starts or after it ends, show the question and drawing board.
            // Assuming the timer running is what allows submission, not what shows the component.
            if (gameState.finalJeopardyTimer > 0) {
                return (
                    <div className="final-jeopardy-form">
                        <h3 className="final-jeopardy-question">{gameState.finalJeopardyQuestion}</h3>
                        <h3 className="final-jeopardy-timer">{gameState.finalJeopardyTimer}</h3>
                        <label>
                            What is...
                        </label>
                        <DrawingBoard onSubmit={handleDrawingSubmit} />
                        
                    </div>
                );
            }
            else{
                return (
                    <h3>Time's up!</h3>
                )
            }
        };

        return (
            <div className="final-jeopardy-container">
                <div className="final-jeopardy-content">
                    {renderContent()}
                </div>
                <PodiumContainer spotlightPlayerId={gameState.finalJeopardySpotlight} />
            </div>
        );
    };

    return renderFinalJeopardy();
};

export default FinalJeopardy;
