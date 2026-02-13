/**
 * Domain validation utilities
 */

import {
  DOMAIN_REGEX,
  MAX_DOMAIN_LENGTH,
  MIN_DOMAIN_LENGTH,
} from "./constants";

export function isValidDomain(domain: string): boolean {
  if (!domain) return false;
  if (domain.length < MIN_DOMAIN_LENGTH || domain.length > MAX_DOMAIN_LENGTH)
    return false;
  return DOMAIN_REGEX.test(domain);
}

export function validateDomains(
  domains: string[]
): { valid: string[]; invalid: string[] } {
  const valid: string[] = [];
  const invalid: string[] = [];

  for (const domain of domains) {
    if (isValidDomain(domain)) {
      valid.push(domain.toLowerCase());
    } else {
      invalid.push(domain);
    }
  }

  return { valid, invalid };
}

export function parseErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === "string") {
    return error;
  }
  return "Bilinmeyen bir hata oluştu.";
}
