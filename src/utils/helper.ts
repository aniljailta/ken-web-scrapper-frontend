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
  const symbols = "!@#$%^&*()_+[]{}|;:,.<>?";

  const allCharacters = upperCase + lowerCase + numbers + symbols;
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
