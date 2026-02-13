import type { DomainResult } from "./types";

export async function checkDomains(domainNames: string[]): Promise<DomainResult[]> {
  const res = await fetch("/api/check", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ domains: domainNames }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || "Domain kontrol edilemedi.");
  }

  const data = await res.json();
  return data.results;
}
