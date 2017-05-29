export default async function (...args) {
  const response = await fetch(...args);
  if (!response.ok) throw response;
  return response;
}
