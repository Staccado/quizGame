import React, { useState, useEffect, useContext } from 'react';
import './questionScreen.css';
import { SocketContext } from './SocketContext';
import { JeopardyPodium } from './podium';

function QuestionScreen({ gameState }) {
    const socket = useContext(SocketContext);
    const [isQuestionVisible, setIsQuestionVisible] = useState(false);

    const { questionActive, dailyDouble, questionText, questionImage, wagerAmount, players, dailyDoublePlayer: dailyDoublePlayerId } = gameState;

    useEffect(() => {
        const handleShowQuestion = () => {
            setIsQuestionVisible(true);
        };

        socket.on('showQuestion', handleShowQuestion);

        return () => {
            socket.off('showQuestion', handleShowQuestion);
        };
    }, [socket]);

    useEffect(() => {
        // Reset visibility when the question changes
        if (questionActive) {
            if (!dailyDouble) {
                setIsQuestionVisible(true);
            } else {
                setIsQuestionVisible(false);
            }
        } else {
            setIsQuestionVisible(false);
        }
    }, [questionActive, dailyDouble, questionText]);

    const dailyDoublePlayer = players.find(p => p.id === dailyDoublePlayerId);

    if (!questionActive) {
        return null; // Don't render anything if no question is active
    }

    return (
        <div className={`question-screen ${dailyDouble ? 'daily-double' : 'regular-question'} ${questionActive ? 'active' : ''}`}>
            {dailyDouble && !isQuestionVisible && (
                <div className="daily-double-screen">
                    <h1>Daily Double!</h1>
                    {wagerAmount > 0 && <h2>Wager: ${wagerAmount}</h2>}
                </div>
            )}

            {isQuestionVisible && (
                <div className="question-content">
                    {questionImage && <img src={questionImage} alt="Question" className="question-image" />}
                    <div className="question-text">
                        {questionText}
                    </div>
                </div>
            )}

            {dailyDouble && dailyDoublePlayer && (
                <JeopardyPodium
                    name={dailyDoublePlayer.name}
                    score={dailyDoublePlayer.score}
                    playerImage={dailyDoublePlayer.playerImage}
                    hasWebcam={dailyDoublePlayer.webcamStream}
                    className="daily-double-podium"
                />
            )}
        </div>
    );
}

export default QuestionScreen;
