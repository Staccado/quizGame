import io from 'socket.io-client';
import config from './config';

const SERVER_URL = config.SERVER_URL;

const socket = io(SERVER_URL, {
  autoConnect: false // We will connect manually when the app starts
});

export default socket;
