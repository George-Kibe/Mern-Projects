export function getInitials(name: string): string {
  const parts = name.split(" ");

  const initials =
    parts[0]?.[0].toUpperCase() + (parts[1]?.[0].toUpperCase() || "");

  return initials;
}
