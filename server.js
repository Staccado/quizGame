const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const fs = require('fs');
const path = require('path');
const app = express();
const server = http.createServer(app);
const playerImagesDir = path.join(__dirname, 'playerimages');
if (!fs.existsSync(playerImagesDir)) {
    fs.mkdirSync(playerImagesDir);
}
app.use('/playerimages', express.static(playerImagesDir));
let buzzerArray = [];
let previousBuzzerArray = [];

testBoardLayout = [
    {
      "categoryName": "Test",
      "questions": [
        { "value": 200, "answered": false, "question": "What is the capital of France?", "answer": "Paris", "dailyDouble": true },
        { "value": 400, "answered": false, "question": "What is the capital of Germany?", "answer": "Berlin" },
        { "value": 600, "answered": false, "question": "What is the capital of Italy?", "answer": "Rome" },
        { "value": 800, "answered": false, "question": "What is the capital of Spain?", "answer": "Madrid" },
        { "value": 1000, "answered": false, "question": "What is the capital of Portugal?", "answer": "Lisbon" },
      ]
    },
    {
      "categoryName": "HISTORY",
      "questions": [
        { "value": 200, "answered": false, "question": "What is the capital of France?", "answer": "Paris" },
        { "value": 400, "answered": false, "question": "What is the capital of Germany?", "answer": "Berlin" },
        { "value": 600, "answered": false, "question": "What is the capital of Italy?", "answer": "Rome" },
        { "value": 800, "answered": false, "question": "What is the capital of Spain?", "answer": "Madrid" },
        { "value": 1000, "answered": false, "question": "What is the capital of Portugal?", "answer": "Lisbon" },
      ]
    },
    {
      "categoryName": "LITERATURE",
      "questions": [
        { "value": 200, "answered": false },
        { "value": 400, "answered": false },
        { "value": 600, "answered": false },
        { "value": 800, "answered": false },
        { "value": 1000, "answered": false },
      ]
    },
    {
      "categoryName": "SPORTS",
      "questions": [
        { "value": 200, "answered": false },
        { "value": 400, "answered": false },
        { "value": 600, "answered": false },
        { "value": 800, "answered": false },
        { "value": 1000, "answered": false },
      ]
    },
    {
      "categoryName": "MUSIC",
      "questions": [
        { "value": 200, "answered": false },
        { "value": 400, "answered": false },
        { "value": 600, "answered": false },
        { "value": 800, "answered": false },
        { "value": 1000, "answered": false },
      ]
    },
    {
      "categoryName": "GEOGRAPHY",
      "questions": [
        { "value": 200, "answered": false },
        { "value": 400, "answered": false },
        { "value": 600, "answered": false },
        { "value": 800, "answered": false },
        { "value": 1000, "answered": false },
      ]
    }
  ];


allQuestions = {
    categories: ["test1", 'test2', 'test3','test4','test5','test6'],
    questions: []
};

// Configure CORS for Socket.IO
const io = socketio(server, {
    cors: {
        origin: "*", // In production, replace with your actual domain
        methods: ["GET", "POST"]
    }
});


server.listen(3001, () => {
    console.log('Server is running on port 3001');
});

class gameState {
    constructor() {
        this.players = [];
        this.board = [];
        this.questionActive = false;
        this.buzzerActive = false;
        this.buzzerPlayer = null;
        this.buzzerTime = 0; // amount of time the buzzer accepts inputs
        this.highlightedPlayer = null;
        this.buzzerTimeoutId = null; // Store timeout ID to clear it when needed
        this.dailyDouble = false;
        this.questionText = null;
        this.questionImage = null;
        this.lastCorrectPlayer = null;
        this.currentActivePlayer = null;
        this.dailyDoublePlayer = null;
        this.wagerAmount = 0;

    }

    addPlayer(player) {
        this.players.push(player);
    }

    removePlayer(player) {
        this.players = this.players.filter(p => p.id !== player.id);
    }

    playerDisconnected(disonnectedPlayer) {
        this.players.forEach(player => {
            if (player.id === disonnectedPlayer) {
            player.isConnected = false;
            }
        });


    }

    getPlayerById(id) {
        return this.players.find(p => p.id === id);
    }

    reconnectPlayer(name, newId) {
        const player = this.players.find(p => p.name === name && !p.isConnected);
        if (player) {
            player.id = newId;
            player.isConnected = true;
            return player;
        }
        return null;
    }


};

 const currentGameState = new gameState();
 currentGameState.board = testBoardLayout;


class player {
    constructor(name, id, playerImage, webcamStream,) {
        this.name = name;
        this.id = id;
        this.score = 0;
        this.dailyDouble = false;
        this.playerImage = playerImage || null;
        this.webcamStream = false;
        this.isConnected = true;
        this.isReady = false;
        this.isEliminated = false;
};

 modifyScore(amount) {
    this.score += amount;
    return this.score;

}

};



class gameBoard {
    constructor(categories, questions) {
        this.categories = [];
        this.questions = [false,false,false,false,false,false]; // if question has been selected or not
    }
};

class question {
    constructor(category, question, answer, value) {
        this.category = category;
        this.question = question;
        this.answer = answer;
        this.value = value;
    }
};

//initialize game board
currentGameBoard = new gameBoard(allQuestions.categories, allQuestions.questions);


function importQuestions() {
    const questions = [];
    const fs = require('fs');
    const path = require('path');
    const questionsPath = path.join(__dirname, 'questions.json');
    const questionsData = fs.readFileSync(questionsPath, 'utf8');
    const questionsArray = JSON.parse(questionsData);
    return questionsArray;
}
function startWebcamStream(player){

    // start and rebroadcast webcam stream
}



io.on('connection', (socket) => {
    let playerName = socket.handshake.query.name;
    let playerid = socket.id;
    let playerImage = socket.handshake.query.image || null;
    let playerWebcam = socket.handshake.query.webcam || null;
    
    // Listen for player data from client
    socket.on('playerData', (data) => {
        playerName = data.name;
        playerid = socket.id;
        playerImage = data.image || null;
        playerWebcam = data.webcam || null;

        if (playerName === 'ReactAdmin' || playerName === 'ADMIN') {
            console.log('Admin connected');
            return;
        }

        const reconnectedPlayer = currentGameState.reconnectPlayer(playerName, playerid);

        if (reconnectedPlayer) {
            reconnectedPlayer.playerImage = playerImage;
            console.log(`Player ${reconnectedPlayer.name} reconnected with new ID: ${playerid}`);
        } else {
            const existingPlayer = currentGameState.getPlayerById(playerid);
            if (!existingPlayer) {
                const newPlayerObject = new player(playerName, playerid, playerImage, playerWebcam);
                currentGameState.addPlayer(newPlayerObject);
                console.log(`Player ${playerName} joined with ID: ${playerid}`);
            }
        }

        if (playerWebcam) {
            startWebcamStream(playerid);
        }
    });

    socket.on('disconnect', () => {
        currentGameState.playerDisconnected(playerid);
        console.log('Player disconnected: ', playerid);
    });

    socket.on('uploadImage', (file) => {
        const { name, data } = file;
        const uniquePrefix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const fileName = `${uniquePrefix}-${name}`;
        const filePath = path.join(playerImagesDir, fileName);

        const buffer = Buffer.from(data, 'base64');
        fs.writeFile(filePath, buffer, (err) => {
            if (err) {
                console.error('Error saving image:', err);
                return;
            }
            const imageUrl = `http://localhost:3001/playerimages/${fileName}`;
            socket.emit('imageUploaded', { imageUrl });
        });
    });

    socket.on('adminSetPlayerControl', (data) => {
        currentGameState.lastCorrectPlayer = data.playerId;
        console.log(`Admin set player control to: ${data.playerId}`);
    });

    socket.on('submitWager', (data) => {
        currentGameState.wagerAmount = data.wager;
        console.log(`Wager of ${data.wager} submitted for Daily Double`);
    });

    socket.on('revealQuestion', () => {
        io.emit('showQuestion');
        console.log('Question revealed to players');
    });


    socket.on('buzzerActive', (data) => {
        // Clear previous buzzer array
        buzzerArray = [];
        previousBuzzerArray = [];
        
        // Reset buzzer state
        currentGameState.buzzerPlayer = null;
        currentGameState.highlightedPlayer = null;
        
        // Clear any existing buzzer timeout
        if (currentGameState.buzzerTimeoutId) {
            clearTimeout(currentGameState.buzzerTimeoutId);
            currentGameState.buzzerTimeoutId = null;
        }
        
        // Activate the buzzer
        currentGameState.buzzerActive = true;
        console.log('Buzzer activated - State:', {
            buzzerActive: currentGameState.buzzerActive,
            buzzerPlayer: currentGameState.buzzerPlayer,
            highlightedPlayer: currentGameState.highlightedPlayer

        });
        console.log('printing gamestate')
        console.log(currentGameState);
        // Set timeout for buzzer and store the timeout ID
        const buzzerTimeout = setTimeout(() => {
            currentGameState.buzzerActive = false;
            if (buzzerArray.length === 0) {
                console.log('Buzzer timeout - no one buzzed in');
                socket.emit('buzzerTimeout');
            }
        }, 5000);
        
        // Store the timeout ID so we can clear it if someone buzzes in
        currentGameState.buzzerTimeoutId = buzzerTimeout;
    });

    socket.on('buzzerPressed', (data) => {
        // buzzer data will contain player ID, timestamp, and reaction time in milliseconds
        buzzerArray.push(data);
        
        // Find the player who pressed the buzzer
        const player = currentGameState.getPlayerById(data.playerId);
        if (player && currentGameState.buzzerActive) {
            console.log(`Player ${player.name} buzzed in with reaction time: ${data.reactionTime}ms`);
        }
        
        
        setTimeout(() => {
            if (buzzerArray.length > 0) {
                // Clear the buzzer timeout since someone buzzed in
                if (currentGameState.buzzerTimeoutId) {
                    clearTimeout(currentGameState.buzzerTimeoutId);
                    currentGameState.buzzerTimeoutId = null;
                }
                
                // Sort by reaction time (fastest first)
                let buzzerWinner = buzzerArray.sort((a, b) => a.reactionTime - b.reactionTime)[0];
                currentGameState.buzzerActive = false;
                currentGameState.buzzerPlayer = currentGameState.getPlayerById(buzzerWinner.playerId);
                currentGameState.highlightedPlayer = buzzerWinner.playerId; // auto select the winner to allow answer/points
                currentGameState.currentActivePlayer = buzzerWinner.playerId;
                console.log(`Winner: ${buzzerWinner.playerId} with reaction time: ${buzzerWinner.reactionTime}ms`);
                console.log(currentGameState);
            }
            previousBuzzerArray = buzzerArray;
            buzzerArray = [];
        }, 1000);
    });


    socket.on('importQuestions', (data) => {

        //takes in a CSV file and converts it to questions and categories
        const fs = require('fs');
        const path = require('path');
        //data will contain the csv file uploaded by the user
        const questionsArray = data.split('\n');
        return questionsArray;

    });

    socket.on('fadeQuestion', (data) => {
        console.log('Fading question...');
        currentGameState.questionActive = false;
        socket.emit('fadeQuestion');
    });

    socket.on('questionSelected', (data) => {
        // Clear previous buzzer array
        buzzerArray = [];
        previousBuzzerArray = [];
        
        // Reset buzzer state when a new question is selected
        currentGameState.buzzerActive = false;
        currentGameState.buzzerPlayer = null;
        currentGameState.highlightedPlayer = null;
        currentGameState.questionActive = true;
        currentGameState.wagerAmount = 0;
        currentGameState.dailyDoublePlayer = null;
        
        // Clear any existing buzzer timeout
        if (currentGameState.buzzerTimeoutId) {
            clearTimeout(currentGameState.buzzerTimeoutId);
            currentGameState.buzzerTimeoutId = null;
        }
        
        console.log(data);
        console.log(`Question ${data.categoryName} - ${data.value} selected`);
        
        //get the question and answer from the board
        const question = currentGameState.board.find(cat => cat.categoryName === data.categoryName).questions.find(q => q.value === data.value);

        
        // Mark the question as answered in the board when it's selected
        const category = currentGameState.board.find(cat => cat.categoryName === data.categoryName);
        if (category) {
            const q = category.questions.find(q => q.value === data.value);
            if (q) {
                q.answered = true;
                console.log(`Question ${data.categoryName} - ${data.value} marked as answered, the question is ${q.question}`);
            }
        }

        currentGameState.questionText = question.question;
        currentGameState.questionImage = question.image;
        currentGameState.dailyDouble = question.dailyDouble;

        if (question.dailyDouble) {
            currentGameState.dailyDoublePlayer = currentGameState.lastCorrectPlayer;
            console.log(`Daily Double assigned to player: ${currentGameState.lastCorrectPlayer}`);
        }
        
        const questionData = {
            categoryName: data.categoryName,
            value: data.value,
            question: question.question,
        }
        
        // Emit back to confirm question selection
        socket.emit('questionSelected', questionData);
        console.log(currentGameState);

    });

    socket.on('questionAnswered', (data) => {
        console.log(`Question answered: ${data.categoryName} - ${data.value}, Correct: ${data.correct}`);
        
        const player = currentGameState.getPlayerById(data.playerId);
        if (!player) {
            console.log(`Player ${data.playerId} not found`);
            return;
        }

        const value = currentGameState.dailyDouble ? currentGameState.wagerAmount : data.value;

        if (data.correct) {
            // Add the question value to the player's score
            player.modifyScore(value);
            currentGameState.lastCorrectPlayer = data.playerId;
            console.log(`Player ${player.name} answered correctly. New score: ${player.score}`);
            
            // Clear buzzer state after correct answer
            currentGameState.buzzerActive = false;
            currentGameState.buzzerPlayer = null;
            currentGameState.highlightedPlayer = null;
            currentGameState.currentActivePlayer = null;
            
            // Clear any existing buzzer timeout
            if (currentGameState.buzzerTimeoutId) {
                clearTimeout(currentGameState.buzzerTimeoutId);
                currentGameState.buzzerTimeoutId = null;
            }
            
            // Clear buzzer arrays
            buzzerArray = [];
            previousBuzzerArray = [];
            
            console.log('Correct answer - Buzzer state cleared:');
        } else {
            // Subtract the question value from the player's score
            player.modifyScore(-value);
            console.log(`Player ${player.name} answered incorrectly. New score: ${player.score}`);
            
            // Re-enable the buzzer for other players to buzz in
            currentGameState.buzzerActive = true;
            currentGameState.buzzerPlayer = null;
            currentGameState.highlightedPlayer = null;
            currentGameState.currentActivePlayer = null;
            
            // Clear any existing buzzer timeout
            if (currentGameState.buzzerTimeoutId) {
                clearTimeout(currentGameState.buzzerTimeoutId);
                currentGameState.buzzerTimeoutId = null;
            }
            
            // Set a new timeout for the buzzer
            const buzzerTimeout = setTimeout(() => {
                if (buzzerArray.length === 0) {
                    currentGameState.buzzerActive = false;
                    console.log('Buzzer timeout after incorrect answer - no one buzzed in');
                    socket.emit('buzzerTimeout');
                }
            }, 5000);
            
            currentGameState.buzzerTimeoutId = buzzerTimeout;
            console.log('Incorrect answer - Buzzer re-enabled:');
        }

        
        // Emit back to confirm the answer was processed
        socket.emit('questionAnswered', data);
    });

    socket.on('clearQuestion', () => {
        console.log('Clearing current question');
        
        // Reset buzzer state
        currentGameState.buzzerActive = false;
        currentGameState.buzzerPlayer = null;
        currentGameState.highlightedPlayer = null;
        currentGameState.currentActivePlayer = null;
        currentGameState.dailyDouble = false;
        currentGameState.wagerAmount = 0;
        currentGameState.dailyDoublePlayer = null;

        
        // Clear any existing buzzer timeout
        if (currentGameState.buzzerTimeoutId) {
            clearTimeout(currentGameState.buzzerTimeoutId);
            currentGameState.buzzerTimeoutId = null;
        }
        
        // Clear buzzer arrays
        buzzerArray = [];
        previousBuzzerArray = [];
        
        // Emit back to confirm the question was cleared
        socket.emit('questionCleared');
    });
    socket.on('questionFade', (data) => {
        console.log('Fading question...');
        currentGameState.questionActive = false;
        socket.emit('questionFade');
    });

    


    // server functions



});






//main server logic - sending game ticks to all players
setInterval(() => {
    // Create a clean version of game state for transmission (without timeout objects)
    const cleanGameState = {
        players: currentGameState.players,
        board: currentGameState.board,
        buzzerActive: currentGameState.buzzerActive,
        buzzerPlayer: currentGameState.buzzerPlayer,
        buzzerTime: currentGameState.buzzerTime,
        highlightedPlayer: currentGameState.highlightedPlayer,
        questionActive: currentGameState.questionActive,
        questionText: currentGameState.questionText,
        questionImage: currentGameState.questionImage,
        dailyDouble: currentGameState.dailyDouble,
        lastCorrectPlayer: currentGameState.lastCorrectPlayer,
        currentActivePlayer: currentGameState.currentActivePlayer,
        dailyDoublePlayer: currentGameState.dailyDoublePlayer,
        wagerAmount: currentGameState.wagerAmount,
        // Note: buzzerTimeoutId is intentionally excluded as it's a Node.js timeout object
    };
   // console.log(cleanGameState);
    io.emit('gameTick', cleanGameState);
    //console.log(currentGameState);


}, 1000);



