import React from 'react';

export function DailyDoubleIntro({ wagerAmount }) {
    return (
        <div className="daily-double-screen">
            <h1>Daily Double!</h1>
            {wagerAmount > 0 && <h2>Wager: ${wagerAmount}</h2>}
        </div>
    );
}
