export function noActiveUser() {
  return new Error($localize`:@@errorNoActiveUser:You are not signed in. Please sign in.`);
}
