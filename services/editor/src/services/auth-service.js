export const isAuthenticated = async () => {
  const response = await fetch('/isAuthenticated', { credentials: 'include' });
  if (response.ok) {
    const data = await response.json();
    return data && data.isAuthenticated;
  }
  return false;
};

export const getAuthProviders = async () => {
  const res = await fetch('/authProviders');
  if (res.ok) {
    return await res.json();
  }
  return [];
};
