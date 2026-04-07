/**
 * Admin utilities — checks if a user email is an admin.
 * Admins get unlimited access to all features without payment.
 *
 * Set ADMIN_EMAILS env var as a comma-separated list of emails:
 *   ADMIN_EMAILS=you@example.com,partner@example.com
 */

export function getAdminEmails(): string[] {
  const raw = process.env.ADMIN_EMAILS || '';
  return raw
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdmin(email: string | null | undefined): boolean {
  if (!email) return false;
  return getAdminEmails().includes(email.trim().toLowerCase());
}
