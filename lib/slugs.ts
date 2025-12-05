import { nanoid } from 'nanoid';

/**
 * Generate a short URL-safe slug for public view links
 * 10 characters should be sufficient for uniqueness
 */
export function generateViewSlug(): string {
  return nanoid(10);
}

/**
 * Generate a longer token for edit access
 * 21 characters provides better security
 */
export function generateEditToken(): string {
  return nanoid(21);
}

