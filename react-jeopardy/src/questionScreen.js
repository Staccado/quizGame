import React, { useState, useEffect, useContext } from 'react';
import './questionScreen.css';
import { SocketContext } from './SocketContext';
import { JeopardyPodium } from './podium';
import { DailyDoubleIntro } from './DailyDoubleIntro';
import { QuestionDisplay } from './QuestionDisplay';

function QuestionScreen({ gameState }) {
    const socket = useContext(SocketContext);
    const [isQuestionVisible, setIsQuestionVisible] = useState(false);

    const { questionActive, dailyDouble, questionText, questionImage, wagerAmount, players, dailyDoublePlayer: dailyDoublePlayerId, drawingBoard, lastCorrectPlayer, pictionaryImageUrl, pictionarySubmittedBy } = gameState;

    useEffect(() => {
        const handleShowQuestion = () => {
            setIsQuestionVisible(true);
            console.log('Show question triggered');
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

    // Determine what content to render based on game state
    let contentToRender = null;

    if (dailyDouble && !isQuestionVisible) {
        // Show Daily Double intro screen and do not overwrite with other content
        contentToRender = <DailyDoubleIntro wagerAmount={wagerAmount} />;
    } else if (isQuestionVisible && drawingBoard) {
        // Show the question with drawing board enabled
        contentToRender = (
            <QuestionDisplay
                questionText={questionText}
                questionImage={questionImage}
                drawingBoard={drawingBoard}
                lastCorrectPlayer={lastCorrectPlayer}
                pictionaryImageUrl={pictionaryImageUrl}
                pictionarySubmittedBy={pictionarySubmittedBy}
            />
        );
    } else if (isQuestionVisible) {
        // Show the standard question content
        contentToRender = (
            <QuestionDisplay
                questionText={questionText}
                questionImage={questionImage}
                drawingBoard={drawingBoard}
                lastCorrectPlayer={lastCorrectPlayer}
                pictionaryImageUrl={pictionaryImageUrl}
                pictionarySubmittedBy={pictionarySubmittedBy}
            />
        );
    }
    // Future conditions can be added here, for example:
    // else if (drawingBoard) {
    //     contentToRender = <DrawingBoard />;
    // }

    return (
        <div className={`question-screen ${dailyDouble ? 'daily-double' : 'regular-question'} ${questionActive ? 'active' : ''} ${drawingBoard ? 'drawing-board' : ''}`}>
            {contentToRender}

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
