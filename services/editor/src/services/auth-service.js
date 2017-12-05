export const isAuthenticated = async () => {
  const response = await fetch('/isAuthenticated', { credentials: 'include' });
  const data = await response.json();
  return data  && data.isAuthenticated;
};

export const getAuthProviders = async () => {
  const res = await fetch('/authProviders');
  return await res.json();
};