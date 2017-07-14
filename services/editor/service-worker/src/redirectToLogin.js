import { urls } from './constants';

export default async function redirectToLogin() {
  await self.clients.claim();
  const clients = await self.clients.matchAll({ type: 'window' });
  clients.forEach((client) => {
    if ('navigate' in client) {
      client.navigate(urls.LOGIN);
    }
  });
}
