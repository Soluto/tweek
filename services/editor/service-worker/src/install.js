import refresh from './refresh';

export default async function install() {
  try {
    await refresh();
  } catch (error) {
    console.error('error while loading cache', error);
  }
  self.skipWaiting();
}
