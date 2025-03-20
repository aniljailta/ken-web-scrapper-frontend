import { baseInviteLink } from "./constant";

export const getInitials = (name: string) => {
  if (!name) return "GU";
  const nameParts = name.trim().split(" ");
  return nameParts.length === 1
    ? (nameParts[0][0] + nameParts[0].slice(-1)).toUpperCase()
    : (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase();
};
export function generatePassword(length = 12) {
  const upperCase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lowerCase = "abcdefghijklmnopqrstuvwxyz";
  const numbers = "0123456789";

  const allCharacters = upperCase + lowerCase + numbers;
  let password = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * allCharacters.length);
    password += allCharacters[randomIndex];
  }

  return password;
}

export function copyToClipboard(text: string) {
  return navigator.clipboard.writeText(text);
}

export function generateInviteLink(email: string) {
  const appURL = baseInviteLink;
  if (!appURL) {
    return Promise.reject("No App URL Found");
  }
  const params = new URLSearchParams();
  params.append("beta-email", email);

  const inviteUrl = appURL + "?" + params.toString();

  return copyToClipboard(inviteUrl);
}

export function generateUniqueId() {
  return `id-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function generateUrlParam(key: string, value: string) {
  const params = new URLSearchParams();
  params.append(key, value);
  return params.toString();
}

const guestTokenKey = "guest_token";

export function getGuestToken() {
  return window.localStorage.getItem(guestTokenKey);
}

export function setGuestToken(value: string) {
  return window.localStorage.setItem(guestTokenKey, value);
}

export function clearGuestToken() {
  return window.localStorage.removeItem(guestTokenKey);
}
