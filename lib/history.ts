/**
 * Search history management using localStorage
 */

import type { SearchHistoryEntry, DomainResult } from "./types";
import { SEARCH_HISTORY_STORAGE_KEY, MAX_SEARCH_HISTORY } from "./constants";

/**
 * Get all search history entries
 */
export function getSearchHistory(): SearchHistoryEntry[] {
  if (typeof window === "undefined") return [];

  try {
    const data = localStorage.getItem(SEARCH_HISTORY_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    console.error("Error reading search history from localStorage");
    return [];
  }
}

/**
 * Add a new search to history
 */
export function addSearchHistory(prompt: string, results: DomainResult[]): SearchHistoryEntry {
  const entry: SearchHistoryEntry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    prompt: prompt.trim(),
    results,
    createdAt: Date.now(),
  };

  const history = getSearchHistory();

  // Remove oldest if at limit
  while (history.length >= MAX_SEARCH_HISTORY) {
    history.pop();
  }

  // Add new entry at the beginning (most recent first)
  history.unshift(entry);

  try {
    localStorage.setItem(SEARCH_HISTORY_STORAGE_KEY, JSON.stringify(history));
    window.dispatchEvent(new Event("history-updated"));
  } catch {
    console.error("Error saving search history to localStorage");
  }

  return entry;
}

/**
 * Get a specific history entry by ID
 */
export function getSearchHistoryById(id: string): SearchHistoryEntry | null {
  const history = getSearchHistory();
  return history.find((h) => h.id === id) || null;
}

/**
 * Remove a history entry by ID
 */
export function removeSearchHistory(id: string): boolean {
  const history = getSearchHistory();
  const filtered = history.filter((h) => h.id !== id);

  if (filtered.length === history.length) return false;

  try {
    localStorage.setItem(SEARCH_HISTORY_STORAGE_KEY, JSON.stringify(filtered));
    window.dispatchEvent(new Event("history-updated"));
    return true;
  } catch {
    console.error("Error removing search history from localStorage");
    return false;
  }
}

/**
 * Clear all search history
 */
export function clearSearchHistory(): void {
  try {
    localStorage.removeItem(SEARCH_HISTORY_STORAGE_KEY);
    window.dispatchEvent(new Event("history-updated"));
  } catch {
    console.error("Error clearing search history from localStorage");
  }
}
