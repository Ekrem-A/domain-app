/**
 * Configuration constants for the domain-app
 */

// RDAP API Configuration
export const RDAP_API_URL = "https://rdap.org/domain";
export const RDAP_TIMEOUT_MS = parseInt(process.env.RDAP_TIMEOUT_MS || "10000", 10);
export const RDAP_RATE_LIMIT_MS = 50; // Reduced from 300ms for parallel requests
export const RDAP_CONCURRENT_LIMIT = 5; // Max concurrent RDAP requests
export const RDAP_MAX_RETRIES = parseInt(process.env.RDAP_MAX_RETRIES || "3", 10);
export const RDAP_RETRY_DELAY_MS = 1000; // Initial retry delay (exponential backoff)

// Cache Configuration
export const CACHE_TTL_HOURS = 24;
export const CACHE_TTL_MS = CACHE_TTL_HOURS * 60 * 60 * 1000;
export const MAX_CACHE_SIZE = 1000; // Max entries in LRU cache

// Domain Validation
export const DOMAIN_REGEX = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*\.[a-z]{2,}$/i;
export const MAX_DOMAIN_LENGTH = 253;
export const MIN_DOMAIN_LENGTH = 4;

// Favorites
export const MAX_FAVORITES = 100;
export const FAVORITES_STORAGE_KEY = "domain-finder-favorites";

// Search History
export const MAX_SEARCH_HISTORY = 10;
export const SEARCH_HISTORY_STORAGE_KEY = "domain-finder-history";
