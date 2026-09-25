export type SessionProfile = {
  name: string;
  initials: string;
  role: "admin" | "owner";
  email: string;
};

function configuredAdminEmails() {
  return (process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminEmail(email: string | undefined) {
  const normalizedEmail = email?.trim().toLowerCase() ?? "";
  return Boolean(normalizedEmail && configuredAdminEmails().includes(normalizedEmail));
}

export function getSessionProfile(email: string | undefined, displayName?: string): SessionProfile {
  const isAdmin = isAdminEmail(email);
  const accountName = displayName?.trim() || email?.split("@")[0]?.trim() || "Usuário";

  return isAdmin
    ? { name: accountName, initials: accountName.slice(0, 2).toUpperCase(), role: "admin", email: email ?? "" }
    : { name: accountName, initials: accountName.slice(0, 2).toUpperCase(), role: "owner", email: email ?? "" };
}