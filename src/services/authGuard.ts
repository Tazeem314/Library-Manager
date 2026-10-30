/**
 * Open Access Configuration for StudySpace Manager
 * Anyone with a Google account is authorized to log in and manage study space records.
 */

export const PRIMARY_ADMIN_EMAIL = '';

export const AUTHORIZED_ADMIN_EMAILS: readonly string[] = [];

/**
 * Validates whether a user is allowed to access the application.
 * All restrictions have been removed: anyone can log in.
 */
export function isAuthorizedAdmin(
  _email?: string | null | undefined,
  _customConfiguredEmail?: string | null
): boolean {
  // No restrictions - everyone is authorized
  return true;
}

/**
 * Access denied message helper (kept for API compatibility)
 */
export function getAccessDeniedMessage(): string {
  return '';
}
