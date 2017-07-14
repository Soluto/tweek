export default function getUrl(request) {
  const url = new URL(request.url).pathname;
  return url.replace(/\/$/, '');
}
