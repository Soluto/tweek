export const UKNOWN_AUTHOR = {
  name: 'unknown',
  email: 'unknown@tweek.com',
};

export function getAuthor(req) {
  return (
    (req.user &&
    req.user.email && {
      name: req.user.displayName || req.user.email,
      email: req.user.email,
    }) ||
    UKNOWN_AUTHOR
  );
}
