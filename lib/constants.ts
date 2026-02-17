/**
 * Configuration constants for the domain-app
 */

// RDAP API Configuration
export const RDAP_FALLBACK_URL = "https://rdap.org/domain";
export const RDAP_TIMEOUT_MS = parseInt(process.env.RDAP_TIMEOUT_MS || "10000", 10);
export const RDAP_RATE_LIMIT_MS = 50; // Reduced from 300ms for parallel requests
export const RDAP_CONCURRENT_LIMIT = 5; // Max concurrent RDAP requests
export const RDAP_MAX_RETRIES = parseInt(process.env.RDAP_MAX_RETRIES || "3", 10);
export const RDAP_RETRY_DELAY_MS = 1000; // Initial retry delay (exponential backoff)

// Authoritative RDAP servers per TLD (directly query these, no redirects)
export const RDAP_SERVERS: Record<string, string> = {
  com: "https://rdap.verisign.com/com/v1/domain",
  net: "https://rdap.verisign.com/net/v1/domain",
  org: "https://rdap.org/domain",
  io: "https://rdap.nic.io/domain",
  co: "https://rdap.nic.co/domain",
  dev: "https://rdap.nic.google/domain",
  app: "https://rdap.nic.google/domain",
  me: "https://rdap.nic.me/domain",
  ai: "https://rdap.nic.ai/domain",
  xyz: "https://rdap.nic.xyz/domain",
  tech: "https://rdap.nic.tech/domain",
  info: "https://rdap.nic.info/domain",
  biz: "https://rdap.nic.biz/domain",
};

/**
 * Get the correct RDAP URL for a domain based on its TLD
 */
export function getRdapUrl(domain: string): string {
  const tld = domain.split(".").pop()?.toLowerCase() || "";
  const server = RDAP_SERVERS[tld] || RDAP_FALLBACK_URL;
  return `${server}/${domain}`;
}

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
