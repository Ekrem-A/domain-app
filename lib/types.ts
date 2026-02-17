/**
 * Shared type definitions for the domain-app
 */

export type DomainResult = {
  domain: string;
  available: boolean;
  reason?: string;
};

export type DomainSuggestion = {
  domain: string;
  reason: string;
};

export type Domain = string;

export type CacheEntry<T> = {
  value: T;
  timestamp: number;
  ttl: number;
};

export type ValidationError = {
  message: string;
  field?: string;
};

export type Favorite = {
  domain: string;
  savedAt: number;
};

export type SearchHistoryEntry = {
  id: string;
  prompt: string;
  results: DomainResult[];
  createdAt: number;
};
