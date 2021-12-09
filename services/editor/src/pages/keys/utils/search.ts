export function getTagLink(tag: string) {
  const whiteSpaces = (tag.match(/\s/g) || []).length;
  return `/keys/$search/tags:${tag.replace(/\s/g, '_')}${whiteSpaces > 0 ? `~${whiteSpaces}` : ''}`;
}

export function getSearchLink(query: string) {
  const whiteSpaces = (query.match(/[\s/]/g) || []).length;
  return `/keys/$search/${query.replace(/[\s/]/g, '_')}${whiteSpaces > 0 ? `~${whiteSpaces}` : ''}`;
}
