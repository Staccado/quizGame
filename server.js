const express = require('express'); //test
const http = require('http');
const socketio = require('socket.io');
const fs = require('fs');
const path = require('path');
const app = express();
const cors = require('cors');
const server = http.createServer(app);
const playerImagesDir = path.join(__dirname, 'playerimages');
if (!fs.existsSync(playerImagesDir)) {
    fs.mkdirSync(playerImagesDir);
}
app.use('/playerimages', express.static(playerImagesDir));
app.use('/audio', (req, res, next) => {
    const filePath = path.join(__dirname, 'audio', req.url);
    const ext = path.extname(filePath);
    if (ext === '.mp3') {
      res.setHeader('Content-Type', 'audio/mpeg');
    }
    next();
  }, express.static(path.join(__dirname, 'audio')));

app.use(cors({
	origin: ["https://test2.chrismartel.com",
	"https://quiz.chrismartel.com"
	]
}));


const baseUrl = process.env.NODE_ENV === 'production' ? (process.env.PRODUCTION_URL || 'https://test3.chrismartel.com') : (process.env.SERVER_URL || 'https://quiz.chrismartel.com');
let buzzerArray = [];
let previousBuzzerArray = [];

testBoardLayout = [
    {
      "categoryName": "Test",
      "questions": [
        { "value": 200, "answered": false, "question": "What is the capital of this drawing board?", "answer": "Paris", "dailyDouble": false, "drawingBoard": true },
        { "value": 400, "answered": false, "question": "What is the capital of Germany?", "answer": "Berlin", "dailyDouble":true },
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

  testBoardLayout2 = [
    {
      "categoryName": "DoubleJeopardy1",
      "questions": [
        { "value": 200, "answered": false, "question": "What is the capital of France?", "answer": "Paris", "dailyDouble": true },
        { "value": 400, "answered": false, "question": "What is the capital of Germany?", "answer": "Berlin", "dailyDouble":true },
        { "value": 600, "answered": false, "question": "What is the capital of Italy?", "answer": "Rome" },
        { "value": 800, "answered": false, "question": "What is the capital of Spain?", "answer": "Madrid" },
        { "value": 1000, "answered": false, "question": "What is the capital of Portugal?", "answer": "Lisbon" },
      ]
    },
    {
      "categoryName": "DoubleJeopardy2",
      "questions": [
        { "value": 200, "answered": false, "question": "What is the capital of France?", "answer": "Paris" },
        { "value": 400, "answered": false, "question": "What is the capital of Germany?", "answer": "Berlin" },
        { "value": 600, "answered": false, "question": "What is the capital of Italy?", "answer": "Rome" },
        { "value": 800, "answered": false, "question": "What is the capital of Spain?", "answer": "Madrid" },
        { "value": 1000, "answered": false, "question": "What is the capital of Portugal?", "answer": "Lisbon" },
      ]
    },
    {
      "categoryName": "DoubleJeopardy3",
      "questions": [
        { "value": 200, "answered": false },
        { "value": 400, "answered": false },
        { "value": 600, "answered": false },
        { "value": 800, "answered": false },
        { "value": 1000, "answered": false },
      ]
    },
    {
      "categoryName": "DoubleJeopardy4",
      "questions": [
        { "value": 200, "answered": false },
        { "value": 400, "answered": false },
        { "value": 600, "answered": false },
        { "value": 800, "answered": false },
        { "value": 1000, "answered": false },
      ]
    },
    {
      "categoryName": "DoubleJeopardy5",
      "questions": [
        { "value": 200, "answered": false },
        { "value": 400, "answered": false },
        { "value": 600, "answered": false },
        { "value": 800, "answered": false },
        { "value": 1000, "answered": false },
      ]
    },
    {
      "categoryName": "DoubleJeopardy6",
      "questions": [
        { "value": 200, "answered": false },
        { "value": 400, "answered": false },
        { "value": 600, "answered": false },
        { "value": 800, "answered": false },
        { "value": 1000, "answered": false },
      ]
    }
  ];




// Configure CORS for Socket.IO
const io = socketio(server, {
    cors: {
	    origin: ["https://test2.chrismartel.com","https://quiz.chrismartel.com"], // In production, replace with your actual domain
        methods: ["GET", "POST"]
    }
});


server.listen(3000, () => {
    console.log('Server is running on port 3000');
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
        this.finalJeopardyActive = false;
        this.finalJeopardyCategory = null;
        this.finalJeopardyQuestion = null;
        this.finalJeopardyAnswer = null;
        this.finalJeopardyWagers = {};
        this.finalJeopardyAnswers = {};
        this.finalJeopardyRevealed = false;
        this.finalJeopardySpotlight = '';
        this.finalJeopardyTimer = 0;
        this.playerShowcase = {
            active: false,
            player: null,

        }
        this.pictionaryImage = null;
        this.winner = null;
     

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
        // Find a disconnected player with this exact name
        const disconnectedPlayer = this.players.find(p => p.name === name && !p.isConnected);
        
        if (disconnectedPlayer) {
            console.log(`Found disconnected player "${name}" with old ID: ${disconnectedPlayer.id}, attempting reconnection with new ID: ${newId}`);
            
            // Check if there's already a connected player with this name and a different socket ID
            // (excluding the disconnected player we found, which has the old socket ID)
            const connectedPlayerWithSameName = this.players.find(p => 
                p.name === name && 
                p.isConnected && 
                p.id !== newId && 
                p.id !== disconnectedPlayer.id
            );
            
            if (connectedPlayerWithSameName) {
                // There's already a connected player with this name, so this is a name conflict
                console.log(`Reconnection blocked: Player "${name}" is already connected with ID: ${connectedPlayerWithSameName.id}`);
                return null;
            }
            
            // Safe to reconnect - update the disconnected player's ID and connection status
            console.log(`Reconnecting player "${name}" from ID ${disconnectedPlayer.id} to ${newId}`);
            disconnectedPlayer.id = newId;
            disconnectedPlayer.isConnected = true;
            return disconnectedPlayer;
        }
        
        console.log(`No disconnected player found with name "${name}" for reconnection`);
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
        this.hatsUnlocked = ["hat1", "hat2", "hat3", "hat4", "hat5", "hat6", "hat7", "hat8", "hat9", "hat10"];
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
currentGameBoard = new gameBoard(testBoardLayout.categories, testBoardLayout.questions);


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

        console.log(`Received playerData from socket ${playerid}:`, { name: playerName, hasImage: !!playerImage });

        if (playerName === 'ReactAdmin' || playerName === 'ADMIN') {
            console.log('Admin connected');
            return;
        }

        const reconnectedPlayer = currentGameState.reconnectPlayer(playerName, playerid);

        if (reconnectedPlayer) {
            // Don't overwrite the player's original image during reconnection
            // The playerImage from client might be wrong due to localStorage sharing
            console.log(`Player ${reconnectedPlayer.name} reconnected with new ID: ${playerid}`);
            
            // If the reconnected player doesn't have an image, use the one from client
            if (!reconnectedPlayer.playerImage && playerImage) {
                reconnectedPlayer.playerImage = playerImage;
                console.log(`Assigned image to reconnected player ${reconnectedPlayer.name}`);
            }
        } else {
            const existingPlayer = currentGameState.getPlayerById(playerid);
            if (!existingPlayer) {
                // Check if another connected player already has this name
                const nameConflict = currentGameState.players.find(p => p.name === playerName && p.isConnected && p.id !== playerid);
                if (nameConflict) {
                    console.log(`Name conflict: Player ${playerName} is already connected. Assigning unique name.`);
                    // Assign a unique name by appending a number
                    let uniqueName = playerName;
                    let counter = 1;
                    while (currentGameState.players.find(p => p.name === uniqueName && p.isConnected)) {
                        uniqueName = `${playerName}${counter}`;
                        counter++;
                    }
                    playerName = uniqueName;
                    console.log(`Assigned unique name: ${playerName}`);
                }
                
                const newPlayerObject = new player(playerName, playerid, playerImage, playerWebcam);
                currentGameState.addPlayer(newPlayerObject);
                console.log(`Player ${playerName} joined with ID: ${playerid}`);

                //take the user's name, check the database for the user's past scores and acheivements, update the player object with the new data





                
            } else {
                // Update existing player's data (name, image, etc.)
                if (playerName !== existingPlayer.name) {
                    // Check for name conflicts before updating
                    const nameConflict = currentGameState.players.find(p => p.name === playerName && p.isConnected && p.id !== playerid);
                    if (nameConflict) {
                        console.log(`Name conflict: Cannot update player name to "${playerName}" - already taken by another connected player`);
                        return; // Don't update the name if it conflicts
                    }
                    console.log(`Updating player name from "${existingPlayer.name}" to "${playerName}"`);
                    existingPlayer.name = playerName;
                }
                if (playerImage && playerImage !== existingPlayer.playerImage) {
                    console.log(`Updating player image for ${existingPlayer.name}`);
                    existingPlayer.playerImage = playerImage;
                }
            }
        }

        if (playerWebcam) {
            startWebcamStream(playerid);
        }
    });

    socket.on('startDoubleJeopardy', (data) => {

        currentGameState.board = testBoardLayout2;

        //start double jeopardy
    });

    socket.on('disconnect', () => {
        currentGameState.playerDisconnected(playerid);
        console.log('Player disconnected: ', playerid);
    });

    socket.on('uploadImage', (file) => {
        console.log('Uploading image start ');
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
            const imageUrl = `${baseUrl}/playerimages/${fileName}`;
            
            // Update the player's image in the game state
            const player = currentGameState.getPlayerById(socket.id);
            if (player) {
                player.playerImage = imageUrl;
                console.log(`Player ${player.name} image updated to: ${imageUrl} using the uploadImage function`);
            }
            else{
                console.log('Player not found', socket.id);
                console.log('list of players',currentGameState.players);
            }
            
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
                socket.broadcast.emit('buzzerTimeout');
                socket.broadcast.emit('playSound', `${baseUrl}/audio/buzzerTimeout.mp3`);
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

                io.emit('buzzerWinner', currentGameState.buzzerPlayer);

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
        currentGameState.drawingBoard = question.drawingBoard;
        currentGameState.pictionaryImageUrl = null;
        currentGameState.pictionarySubmittedBy = null;

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
        console.log('playing daily double sound')
        if(question.dailyDouble){
            socket.broadcast.emit('playSound', `${baseUrl}/audio/dailyDouble.mp3`);
        } else {
            console.log('No daily double');
        }
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
            socket.broadcast.emit('playSound', `${baseUrl}/audio/ding.mp3`);
            
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
            socket.broadcast.emit('playSound', `${baseUrl}/audio/buzzerTimeout.mp3`);
            
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
                    socket.broadcast.emit('buzzerTimeout');
                    socket.broadcast.emit('playSound', `${baseUrl}/audio/buzzerTimeout.mp3`);
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

    socket.on('start-final-jeopardy', (data) => {
        currentGameState.finalJeopardyTimer = 30;
        currentGameState.finalJeopardyActive = true;
        currentGameState.finalJeopardyCategory = data.category;
        currentGameState.finalJeopardyQuestion = data.question;
        currentGameState.finalJeopardyAnswer = data.answer;
        io.emit('final-jeopardy-started', { category: data.category });
        console.log('Final Jeopardy started. Category:', data.category);
    });

    socket.on('submit-final-jeopardy-wager', (data) => {
        const player = currentGameState.getPlayerById(socket.id);
        if (player) {
            currentGameState.finalJeopardyWagers[player.id] = data.wager;
            console.log(`Player ${player.name} wagered ${data.wager} for Final Jeopardy.`);
        }
    });

    socket.on('reveal-final-jeopardy-question', () => {
        currentGameState.finalJeopardyRevealed = true;
        io.emit('final-jeopardy-question-revealed', { question: currentGameState.finalJeopardyQuestion });
        console.log('Final Jeopardy question revealed.');
    });

    socket.on('startFinalJeopardyTimer', () => {   
        currentGameState.finalJeopardyTimer = 30;
        const timerInterval = setInterval(() => {
            currentGameState.finalJeopardyTimer--;
            if (currentGameState.finalJeopardyTimer <= 0) {
                currentGameState.finalJeopardyTimer = 0;
                io.emit('final-jeopardy-timer-ended');
                clearInterval(timerInterval);
            }
            io.emit('final-jeopardy-timer-tick', { timer: currentGameState.finalJeopardyTimer });
            console.log('Final Jeopardy timer:', currentGameState.finalJeopardyTimer);
        }, 1000);
        currentGameState.finalJeopardyTimerId = timerInterval;
        io.emit('final-jeopardy-timer-started', { timer: currentGameState.finalJeopardyTimer });
        console.log('Final Jeopardy timer started.');
        socket.broadcast.emit('playSound', `${baseUrl}/audio/themeSong.mp3`);
        console.log('playing final jeopardy sound')
    });

    socket.on('finalJeopardyTimerTick', () => {
        currentGameState.finalJeopardyTimer--;
        io.emit('final-jeopardy-timer-tick', { timer: currentGameState.finalJeopardyTimer });
    });
    socket.on('revealFinalJeopardyAnswer', (data) =>{
        console.log('revealing answer for player', data.player)
        let playerAnswer = currentGameState.finalJeopardyAnswers[data.player]
        currentGameState.finalJeopardySpotlight = data.player
        io.emit('revealAnswer', data.player)
        
    });

    socket.on('submit-final-jeopardy-answer', (data) => {
        // 'data' is now known to be the raw base64 string from the client.
        console.log('Raw data received:', data);
    
        const player = currentGameState.getPlayerById(socket.id);
    
        // --- CHANGE 1: Modified the check ---
        // If player not found, or if data is not a valid string.
        if (!player || !data || typeof data !== 'string') {
            console.error('Player not found or invalid drawing data received.');
            return;
        }
    
        console.log('Received drawing data from:', player.name);
        const drawingString = data;
        const base64Data = drawingString.split(',')[1];
                if (!base64Data) {
            console.error('Could not extract base64 data from string.');
            return;
        }
    
        // --- File Saving Logic (no changes needed below) ---
        const uniquePrefix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const fileName = `${uniquePrefix}-${player.name}-finalJeopardy.png`;
        const filePath = path.join(playerImagesDir, fileName);
    
        const buffer = Buffer.from(base64Data, 'base64');
    
        fs.writeFile(filePath, buffer, (err) => {
            if (err) {
                console.error('Error saving image:', err);
                return;
            }
    
            const imageUrl = `${baseUrl}/playerimages/${fileName}`;
            console.log(`Player ${player.name}'s answer saved at: ${imageUrl}`);
            
            currentGameState.finalJeopardyAnswers[player.id] = imageUrl;
    
            io.emit('admin-final-jeopardy-answer-submitted', {
                playerId: player.id,
                name: player.name,
                answerUrl: imageUrl
            });
        });
    });

    socket.on('pictionaryImageSubmitted', (payload) => {
        console.log('Pictionary image received');
        const player = currentGameState.getPlayerById(socket.id);

        if (!player) {
            console.error('Unable to resolve player for socket', socket.id);
            return;
        }

        let base64Data;
        let extension = 'png';

        // Accept either a data URL string or an object with a `data` field
        if (typeof payload === 'string') {
            const match = payload.match(/^data:image\/(png|jpeg|jpg);base64,(.+)$/);
            if (!match) {
                console.error('Invalid data URL format for pictionary image.');
                return;
            }
            const format = match[1];
            extension = format === 'jpeg' ? 'jpg' : format;
            base64Data = match[2];
        } else if (payload && typeof payload.data === 'string') {
            base64Data = payload.data;
            if (payload.extension) {
                extension = payload.extension;
            }
        } else {
            console.error('Unexpected pictionary payload shape:', payload);
            return;
        }

        const uniquePrefix = 'pictionaryImage-' + Date.now() + '-' + Math.round(Math.random() * 1E9);
        const fileName = `${uniquePrefix}-${player.name}.${extension}`;
        const filePath = path.join(playerImagesDir, fileName);

        try {
            const buffer = Buffer.from(base64Data, 'base64');
            fs.writeFile(filePath, buffer, (err) => {
                if (err) {
                    console.error('Error saving pictionary image:', err);
                    return;
                }
                const imageUrl = `${baseUrl}/playerimages/${fileName}`;
                console.log('Pictionary image saved for', player.name, '->', imageUrl);

                // Update game state with the image URL
                currentGameState.pictionaryImageUrl = imageUrl;
                currentGameState.pictionarySubmittedBy = player.id;
            });
        } catch (e) {
            console.error('Failed to process pictionary image buffer:', e);
        }
    });






    //

    socket.on('final-jeopardy-ruling', (data) => {
        const player = currentGameState.getPlayerById(data.playerId);
        if (player) {
            const wager = parseInt(currentGameState.finalJeopardyWagers[data.playerId]) || 0;
            if (data.correct) {
                player.modifyScore(wager);
            } else {
                player.modifyScore(-wager);
            }
            console.log(`Player ${player.name} Final Jeopardy ruling: ${data.correct}. New score: ${player.score}`);
        }
    });

    socket.on('end-final-jeopardy', () => {
        currentGameState.finalJeopardyActive = false;
        currentGameState.finalJeopardyRevealed = false;
        currentGameState.finalJeopardyCategory = null;
        currentGameState.finalJeopardyQuestion = null;
        currentGameState.finalJeopardyAnswer = null;
        currentGameState.finalJeopardyWagers = {};
        currentGameState.finalJeopardyAnswers = {};
        currentGameState.finalJeopardySpotlight = null;
        currentGameState.finalJeopardyTimer = 0;
        clearInterval(currentGameState.finalJeopardyTimerId);
        currentGameState.finalJeopardyTimerId = null;
        

        console.log('Final Jeopardy has ended.');

        //rank players by score
        let rankedPlayers = currentGameState.players.sort((a, b) => b.score - a.score);
        console.log('ranked players', rankedPlayers)
        currentGameState.rankedPlayers = rankedPlayers;

        let winner = rankedPlayers[0];
        console.log('winner', winner)
        currentGameState.winner = winner;
    });








    socket.on('printData', () =>{
        console.log(currentGameState)
    });

    socket.on('playerShowcase',() =>{
        console.log('starting showcase')
        let index = 0;
        console.log('showcasing player', currentGameState.players[index].name)
        currentGameState.playerShowcase.active = true;
        // Set the initial spotlight
        if (currentGameState.players.length > 0) {
            currentGameState.finalJeopardySpotlight = currentGameState.players[index].id;
        }

        console.log('gamestate after enabling showcase', currentGameState)
        
        const showcaseInterval = setInterval(() => {
            index++;
            if (index >= currentGameState.players.length) {
                currentGameState.playerShowcase.active = false;
                currentGameState.finalJeopardySpotlight = null; // Clear spotlight
                clearInterval(showcaseInterval);
                console.log('showcase ended')
            } else {
                currentGameState.finalJeopardySpotlight = currentGameState.players[index].id;
                currentGameState.playerShowcase.player = currentGameState.players[index].id;
                console.log('showcasing player', currentGameState.players[index].name);
            }
        }, 5000);
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
        finalJeopardyActive: currentGameState.finalJeopardyActive,
        finalJeopardyCategory: currentGameState.finalJeopardyCategory,
        finalJeopardyQuestion: currentGameState.finalJeopardyQuestion,
        finalJeopardyRevealed: currentGameState.finalJeopardyRevealed,
        finalJeopardySpotlight: currentGameState.finalJeopardySpotlight,
        finalJeopardyTimer: currentGameState.finalJeopardyTimer,
        playerShowcase: currentGameState.playerShowcase,
        finalJeopardyWagers: currentGameState.finalJeopardyWagers,
        finalJeopardyAnswers: currentGameState.finalJeopardyAnswers,
        drawingBoard: currentGameState.drawingBoard,
        pictionaryImageUrl: currentGameState.pictionaryImageUrl,
        pictionarySubmittedBy: currentGameState.pictionarySubmittedBy,
        winner: currentGameState.winner,
      

    };
   // console.log(cleanGameState);
    io.emit('gameTick', cleanGameState);
    //console.log(currentGameState);


}, 100);
