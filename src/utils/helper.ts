export const getInitials = (name: string) => {
  if (!name) return "GU";
  const nameParts = name.trim().split(" ");
  return nameParts.length === 1
    ? (nameParts[0][0] + nameParts[0].slice(-1)).toUpperCase()
    : (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase();
};
