export function randomString(length: number) {
  return crypto
    .getRandomValues(new Uint8Array(length))
    .reduce((current, next) => current + (next & 15).toString(16), '');
}
