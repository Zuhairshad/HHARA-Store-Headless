// Field caps for newsletter sign-up. Shared by the popup inputs (maxLength) and the
// server action, because a "use server" file can only export async functions.
export const NEWSLETTER_LIMITS = {
  name: 20, // same cap as the account sign-up first name
  email: 254, // RFC 5321 maximum address length
  phone: 16, // E.164: "+" and up to 15 digits
  dob: 10, // YYYY-MM-DD
} as const;
