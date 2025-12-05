/**
 * Utility functions for managing recent sequences in localStorage
 */

export interface RecentSequence {
  view_slug: string;
  edit_token: string;
  name: string | null;
  length: number;
  created_at: string; // ISO timestamp
}

const STORAGE_KEY = 'seqview_recent_sequences';
const MAX_RECENT = 10;

/**
 * Save a sequence to recent sequences
 */
export function saveRecentSequence(sequence: RecentSequence): void {
  try {
    const existing = getRecentSequences();
    
    // Remove if already exists (to avoid duplicates)
    const filtered = existing.filter(
      (seq) => seq.edit_token !== sequence.edit_token
    );
    
    // Add new sequence at the beginning
    const updated = [sequence, ...filtered].slice(0, MAX_RECENT);
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    // localStorage might be disabled or full
    console.warn('Failed to save recent sequence:', error);
  }
}

/**
 * Get all recent sequences
 */
export function getRecentSequences(): RecentSequence[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    
    const parsed = JSON.parse(data);
    if (!Array.isArray(parsed)) return [];
    
    return parsed;
  } catch (error) {
    console.warn('Failed to read recent sequences:', error);
    return [];
  }
}

/**
 * Clear all recent sequences
 */
export function clearRecentSequences(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.warn('Failed to clear recent sequences:', error);
  }
}

/**
 * Remove a specific sequence from recent sequences
 */
export function removeRecentSequence(editToken: string): void {
  try {
    const existing = getRecentSequences();
    const filtered = existing.filter((seq) => seq.edit_token !== editToken);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.warn('Failed to remove recent sequence:', error);
  }
}

