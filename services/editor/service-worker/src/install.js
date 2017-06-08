import { refresh } from './actions';

export default async function install() {
  const socket = io(self.origin, { jsonp: false });
  socket.on('connect', () => console.log('connected to socket'));
  socket.on('refresh', () => {
    console.log('refreshing cache...');
    refresh().catch(error => console.error('error while refreshing cache', error));
  });

  try {
    await refresh();
  } catch (error) {
    console.error('error while loading cache', error);
  }

  self.skipWaiting();
}
