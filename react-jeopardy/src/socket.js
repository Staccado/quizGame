import io from 'socket.io-client';

const SERVER_URL = 'http://localhost:3001';

const socket = io(SERVER_URL, {
  autoConnect: false // We will connect manually when the app starts
});

export default socket;
