import React from 'react';

export function QuestionDisplay({ questionText, questionImage }) {
    return (
        <div className="question-content">
            {questionImage && <img src={questionImage} alt="Question" className="question-image" />}
            <div className="question-text">
                {questionText}
            </div>
        </div>
    );
}
