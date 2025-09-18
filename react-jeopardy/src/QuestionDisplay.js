import React, { useContext, useEffect, useState } from 'react';
import DrawingBoard from './drawing';
import { SocketContext } from './SocketContext';

export function QuestionDisplay({ questionText, questionImage, drawingBoard, lastCorrectPlayer, pictionaryImageUrl, pictionarySubmittedBy }) {
    const socket = useContext(SocketContext);
    const [playerID, setPlayerID] = useState(null);

    useEffect(() => {
        setPlayerID(socket.id);
    }, [socket]);

    const handleImageSubmit = (image) => {
        console.log('Submitting pictionary image');
        socket.emit('pictionaryImageSubmitted', image);
    };

    if (!drawingBoard) {
        return (
            <div className="question-content">
                {questionImage && <img src={questionImage} alt="Question" className="question-image" />}
                <div className="question-text">
                    {questionText}
                </div>
            </div>
        );
    }

    if (drawingBoard) {
        // Check if current player is the one who should draw
        if (lastCorrectPlayer === playerID) {
            return (
                <div className="question-content">
                    <div className="question-text">
                        {questionText}
                    </div>
                    <DrawingBoard onSubmit={handleImageSubmit} />
                </div>
            );
        } else {
            // Other players wait for the image
            return (
                <div className="question-content">
                    <div className="question-text">
                        
                    </div>
                    {pictionaryImageUrl ? (
                        <img src={pictionaryImageUrl} alt="Pictionary Drawing" className="question-image" />
                    ) : (
                        <div className="waiting-message">
                            Waiting for drawing...
                        </div>
                    )}
                </div>
            );
        }
    }
}

export default QuestionDisplay;