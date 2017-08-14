export default function (timeoutInMs) {
  return new Promise(resolve => setTimeout(resolve, timeoutInMs));
}
