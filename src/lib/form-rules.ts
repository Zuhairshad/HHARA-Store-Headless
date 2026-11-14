// Field rules shared by the forms (maxLength, live filtering) and the server actions that
// re-check them. Lives outside the "use server" files, which may only export async functions.
export const FIELD_LIMITS = {
  name: 20, // first or last name
  email: 60, // sign-up forms only; login and password reset keep 254 so existing accounts can sign in
  phone: 16, // E.164: "+" and up to 15 digits
  dob: 10, // YYYY-MM-DD
  passwordMin: 8, // what the sign-up form promises (Shopify's own floor is 5)
  passwordMax: 40, // Shopify rejects longer passwords
} as const;

// Letters in any language, spaces, apostrophes and hyphens: "Zoë", "O'Brien", "Anne-Marie"
const NAME_DISALLOWED = /[^\p{L}\s'-]/gu;

/** Drops characters a name can't contain; used on every keystroke. */
export function stripNameChars(value: string): string {
  return value.replace(NAME_DISALLOWED, "");
}

/** Server-side check: within the length cap and nothing stripNameChars would remove. */
export function isValidName(value: string): boolean {
  return value.length <= FIELD_LIMITS.name && stripNameChars(value) === value;
}

export function isValidEmail(value: string): boolean {
  return value.length <= FIELD_LIMITS.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function isValidDob(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value));
}
