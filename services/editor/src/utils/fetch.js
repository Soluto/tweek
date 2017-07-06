export default async function (url, config = {}) {
  const response = await fetch(url, { ...config, credentials: 'same-origin' });
  if (!response.ok) throw response;
  return response;
}
