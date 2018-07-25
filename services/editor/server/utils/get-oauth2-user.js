import jwt from 'jsonwebtoken';

export default function (accessToken, params, profile) {
  const decodedAccessToken = jwt.decode(accessToken) || profile || {};
  const decodedIdToken = jwt.decode(params.id_token) || {};
  const upn = decodedAccessToken.upn || decodedAccessToken.user_principal_name;
  const name = decodedAccessToken.name || decodedIdToken.name;
  const displayName =
    decodedAccessToken.displayName ||
    (decodedIdToken && decodedIdToken.given_name && decodedIdToken.family_name)
      ? `${decodedIdToken.given_name} ${decodedIdToken.family_name}`
      : name;

  return {
    id: upn,
    sub: decodedAccessToken.sub || decodedIdToken.sub,
    name,
    email: upn,
    displayName,
  };
}
