import React, { useState, useContext } from 'react';
import { SocketContext } from './SocketContext';
import './finalJeopardy.css';

export function FinalJeopardy({ gameState, player, isAdmin }) {
    const socket = useContext(SocketContext);
    const [wager, setWager] = useState('');
    const [answer, setAnswer] = useState('');


    const handleWagerSubmit = (e) => {
        e.preventDefault();
        socket.emit('submit-final-jeopardy-wager', { wager });
    };

    const handleAnswerSubmit = (e) => {
        e.preventDefault();
        socket.emit('submit-final-jeopardy-answer', { answer });
    };

    const handleRevealQuestion = () => {
        socket.emit('reveal-final-jeopardy-question');
    };

    const handleRuling = (playerId, correct) => {
        socket.emit('final-jeopardy-ruling', { playerId, correct });
    };

    

    if (isAdmin) {
        return (
            <div className="final-jeopardy-admin-container">
                <h1>Final Jeopardy - Admin</h1>
                <button onClick={handleRevealQuestion}>Reveal Question</button>
                {gameState.finalJeopardyRevealed && (
                    <h3>Question: {gameState.finalJeopardyQuestion}</h3>
                )}
                <div>
                    <h3>Wagers:</h3>
                    <ul>
                        {Object.entries(gameState.finalJeopardyWagers).map(([playerId, wager]) => {
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
                        {Object.entries(gameState.finalJeopardyAnswers).map(([playerId, answer]) => {
                            const player = gameState.players.find(p => p.id === playerId);
                            return (
                                <li key={playerId}>
                                    <strong>{player ? player.name : 'Unknown'}:</strong> {answer}
                                    <button onClick={() => handleRuling(playerId, true)}>Correct</button>
                                    <button onClick={() => handleRuling(playerId, false)}>Incorrect</button>
                                </li>
                            );
                        })}
                    </ul>
                </div>
                <button onClick={() => socket.emit('end-final-jeopardy')}>End Final Jeopardy</button>
            </div>
        );
    }

    return (
        <div className="final-jeopardy-container">
            <h1 className="final-jeopardy-category">{gameState.finalJeopardyCategory}</h1>
            {!gameState.finalJeopardyRevealed ? (
                <form onSubmit={handleWagerSubmit} className="final-jeopardy-form">
                    <label>
                        Enter your wager:
                        <input type="number" value={wager} onChange={(e) => setWager(e.target.value)} />
                    </label>
                    <button type="submit">Submit Wager</button>
                </form>
            ) : (
                <form onSubmit={handleAnswerSubmit} className="final-jeopardy-form">
                    <h3 className="final-jeopardy-question">{gameState.finalJeopardyQuestion}</h3>
                    <label>
                        What is...
                        <textarea value={answer} onChange={(e) => setAnswer(e.target.value)} />
                    </label>
                    <button type="submit">Submit Answer</button>
                </form>
            )}
        </div>
    );
}
