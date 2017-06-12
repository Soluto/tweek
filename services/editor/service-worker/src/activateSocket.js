import { refresh } from './data-actions';

let socket;

function installSocket() {
  socket = io(self.origin, { jsonp: false });
  socket.on('connect', () => console.log('connected to socket'));
  socket.on('refresh', () => {
    console.log('refreshing cache...');
    refresh().catch(error => console.error('error while refreshing cache', error));
  });
}

export default function activateSocket() {
  if (!socket) {
    installSocket();
  } else if (!socket.connected) {
    socket.connect();
  }
}
