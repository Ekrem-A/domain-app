/**
 * LRU Cache implementation for RDAP domain checks
 * Caches domain availability results to reduce API calls
 */

import type { DomainResult, CacheEntry } from "./types";
import { CACHE_TTL_MS, MAX_CACHE_SIZE } from "./constants";

class LRUCache {
  private cache: Map<string, CacheEntry<DomainResult>>;
  private maxSize: number;

  constructor(maxSize: number = MAX_CACHE_SIZE) {
    this.cache = new Map();
    this.maxSize = maxSize;
  }

  get(key: string): DomainResult | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    // Check if entry has expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    // Move to end (most recently used)
    this.cache.delete(key);
    this.cache.set(key, entry);

    return entry.value;
  }

  set(key: string, value: DomainResult, ttl: number = CACHE_TTL_MS): void {
    // Remove oldest entry if at capacity
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      const firstKey = this.cache.keys().next().value as string | undefined;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }

    // Remove if already exists (to update position)
    this.cache.delete(key);

    // Add new entry
    this.cache.set(key, {
      value,
      timestamp: Date.now(),
      ttl,
    });
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }
}

// Global cache instance
const rdapCache = new LRUCache();

export function getCachedDomain(domain: string): DomainResult | null {
  return rdapCache.get(domain.toLowerCase());
}

export function setCachedDomain(domain: string, result: DomainResult): void {
  rdapCache.set(domain.toLowerCase(), result);
}

export function clearRDAPCache(): void {
  rdapCache.clear();
}

export function getRDAPCacheSize(): number {
  return rdapCache.size();
}
