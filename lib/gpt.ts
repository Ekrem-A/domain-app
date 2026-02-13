import type { DomainSuggestion } from "./types";

export async function generateDomains(userPrompt: string): Promise<DomainSuggestion[]> {
  const res = await fetch("/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt: userPrompt }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || "Domain isimleri üretilemedi.");
  }
  
  const data = await res.json();
  return data.domains;
}
