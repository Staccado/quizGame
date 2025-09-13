let playerName = "testUsers";
let playerImage = "testImage.jpg";

const SERVER_URL = process.env.SERVER_URL || 'https://jepordee.chrismartel.com';
const socket = io(SERVER_URL, {
    query: {
        name: playerName,
        image: playerImage,
        id: 23,
        webcam: false
    }
});



socket.on('gameTick', (gameState) => {
    console.log(gameState);
});



socket.on('connect', () => {
    console.log("connected to server");
    
    // Send player data after connection
    socket.emit('playerData', {
        name: playerName,
        image: playerImage,
        id: 23,
        webcam: false
    });
});
