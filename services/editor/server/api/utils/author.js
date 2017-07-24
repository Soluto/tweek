export const UKNOWN_AUTHOR = {
  "author.name": 'unknown',
  "author.email": 'unknown@tweek.com',
};

export function getAuthor(req) {
  return (
    (req.user &&
    req.user.email && {
      "author.name": req.user.displayName || req.user.email,
      "author.email": req.user.email,
    }) ||
    UKNOWN_AUTHOR
  );
}
