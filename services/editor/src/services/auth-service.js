export const getAuthProviders = async () => {
  const res = await fetch('/authProviders');
  if (res.ok) {
    return await res.json();
  }
  return [];
};
