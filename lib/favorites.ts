/**
 * Favorites management using localStorage
 */

import type { Favorite } from "./types";
import { FAVORITES_STORAGE_KEY, MAX_FAVORITES } from "./constants";

/**
 * Get all favorite domains from localStorage
 */
export function getFavorites(): Favorite[] {
  if (typeof window === "undefined") return [];

  try {
    const data = localStorage.getItem(FAVORITES_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    console.error("Error reading favorites from localStorage");
    return [];
  }
}

/**
 * Check if a domain is in favorites
 */
export function isFavorite(domain: string): boolean {
  const favorites = getFavorites();
  return favorites.some((fav) => fav.domain.toLowerCase() === domain.toLowerCase());
}

/**
 * Add domain to favorites
 */
export function addFavorite(domain: string): boolean {
  const normalized = domain.toLowerCase();

  if (isFavorite(normalized)) {
    return false; // Already in favorites
  }

  const favorites = getFavorites();

  if (favorites.length >= MAX_FAVORITES) {
    // Remove oldest (least recently added)
    favorites.shift();
  }

  favorites.push({
    domain: normalized,
    savedAt: Date.now(),
  });

  try {
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
    return true;
  } catch {
    console.error("Error saving favorites to localStorage");
    return false;
  }
}

/**
 * Remove domain from favorites
 */
export function removeFavorite(domain: string): boolean {
  const normalized = domain.toLowerCase();
  const favorites = getFavorites();
  const filtered = favorites.filter(
    (fav) => fav.domain.toLowerCase() !== normalized
  );

  if (filtered.length === favorites.length) {
    return false; // Not found
  }

  try {
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(filtered));
    return true;
  } catch {
    console.error("Error updating favorites in localStorage");
    return false;
  }
}

/**
 * Toggle favorite status
 */
export function toggleFavorite(domain: string): boolean {
  if (isFavorite(domain)) {
    return removeFavorite(domain);
  } else {
    return addFavorite(domain);
  }
}

/**
 * Clear all favorites
 */
export function clearFavorites(): void {
  try {
    localStorage.removeItem(FAVORITES_STORAGE_KEY);
  } catch {
    console.error("Error clearing favorites from localStorage");
  }
}

/**
 * Export favorites as JSON
 */
export function exportFavoritesAsJSON(): string {
  const favorites = getFavorites();
  return JSON.stringify(favorites, null, 2);
}

/**
 * Export favorites as CSV
 */
export function exportFavoritesAsCSV(): string {
  const favorites = getFavorites();
  const headers = "Domain,Saved Date\n";
  const rows = favorites
    .map(
      (fav) =>
        `${fav.domain},${new Date(fav.savedAt).toISOString()}`
    )
    .join("\n");
  return headers + rows;
}
