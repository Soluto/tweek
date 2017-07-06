export default async function (message) {
  const clients = await self.clients.matchAll();
  clients.forEach(client => client.postMessage(message));
}
