/**
 * Authorization Guard for StudySpace Manager
 * Strict Single-Admin Whitelist Protection
 */

export const PRIMARY_ADMIN_EMAIL = 'tazeemsiddiqui0786@gmail.com';

/**
 * List of authorized administrator emails
 */
export const AUTHORIZED_ADMIN_EMAILS: readonly string[] = [
  PRIMARY_ADMIN_EMAIL,
];

/**
 * Validates whether the given email belongs to the authorized administrator
 */
export function isAuthorizedAdmin(
  email: string | null | undefined,
  customConfiguredEmail?: string | null
): boolean {
  if (!email || typeof email !== 'string') return false;
  
  const normalizedEmail = email.trim().toLowerCase();
  
  // Check against hardcoded primary admin email
  if (normalizedEmail === PRIMARY_ADMIN_EMAIL.toLowerCase()) {
    return true;
  }

  // Check against static authorized admin whitelist
  if (AUTHORIZED_ADMIN_EMAILS.some((admin) => admin.toLowerCase() === normalizedEmail)) {
    return true;
  }

  // Check against custom configured email from business settings if present
  if (customConfiguredEmail && typeof customConfiguredEmail === 'string' && customConfiguredEmail.trim()) {
    if (customConfiguredEmail.trim().toLowerCase() === normalizedEmail) {
      return true;
    }
  }

  return false;
}

/**
 * Get human-readable access denied error message (without exposing admin credentials/email)
 */
export function getAccessDeniedMessage(): string {
  return `Access Denied: This account is not authorized to access this workspace. Only the registered administrator is permitted to access study materials, student data, seat allocations, and payment records.`;
}
