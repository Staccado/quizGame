import React, { useState, useContext } from 'react';
import { SocketContext } from './SocketContext';
import './finalJeopardy.css';
import DrawingBoard from './drawing';
import JeopardyPodium from './podium';

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

    return (
        
        <div className="final-jeopardy-container">
            {gameState.finalJeopardySpotlight ? (

                
                <div>
                    <h2>Answer Spotlight</h2>
                    <h3>{gameState.players.find(p => p.id === gameState.finalJeopardySpotlight).name}</h3>
                    <img src={gameState.finalJeopardyAnswers[gameState.finalJeopardySpotlight]}/>
                    
                    <JeopardyPodium
                    name={gameState.players.find(p => p.id === gameState.finalJeopardySpotlight).name}
                    score={gameState.players.find(p => p.id === gameState.finalJeopardySpotlight).score}
                    playerImage={gameState.players.find(p => p.id === gameState.finalJeopardySpotlight).playerImage}
                    hasWebcam={gameState.players.find(p => p.id === gameState.finalJeopardySpotlight).webcamStream}
                    />
                </div>

        ) : !gameState.finalJeopardyRevealed ? (
                <form onSubmit={handleWagerSubmit} className="final-jeopardy-form">
                    <h1 className="final-jeopardy-category">{gameState.finalJeopardyCategory}</h1>
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
                    </label>
                    {/*  <textarea value={answer} onChange={(e) => setAnswer(e.target.value)} />*/}
                    <DrawingBoard/>
                </form>
            )}
        </div>
    );
}
