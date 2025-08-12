import React, { useState, useContext } from 'react';
import { SocketContext } from './SocketContext';

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

    const handleStartFinalJeopardy = () => {
        // This should be moved to AdminView, and should get the category, question, and answer from a form
        socket.emit('start-final-jeopardy', { category: 'Test Category', question: 'Test Question', answer: 'Test Answer' });
    };

    if (isAdmin) {
        return (
            <div>
                <h1>Final Jeopardy - Admin</h1>
                <button onClick={handleStartFinalJeopardy}>Start Final Jeopardy</button>
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
        <div>
            <h1>Final Jeopardy</h1>
            <h2>{gameState.finalJeopardyCategory}</h2>
            {!gameState.finalJeopardyRevealed ? (
                <form onSubmit={handleWagerSubmit}>
                    <label>
                        Wager:
                        <input type="number" value={wager} onChange={(e) => setWager(e.target.value)} />
                    </label>
                    <button type="submit">Submit Wager</button>
                </form>
            ) : (
                <form onSubmit={handleAnswerSubmit}>
                    <h3>{gameState.finalJeopardyQuestion}</h3>
                    <label>
                        Answer:
                        <textarea value={answer} onChange={(e) => setAnswer(e.target.value)} />
                    </label>
                    <button type="submit">Submit Answer</button>
                </form>
            )}
        </div>
    );
}
