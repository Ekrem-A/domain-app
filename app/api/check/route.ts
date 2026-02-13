import { NextRequest, NextResponse } from "next/server";
import {
  RDAP_API_URL,
  RDAP_TIMEOUT_MS,
  RDAP_MAX_RETRIES,
  RDAP_RETRY_DELAY_MS,
  RDAP_CONCURRENT_LIMIT,
  RDAP_RATE_LIMIT_MS,
} from "@/lib/constants";
import { validateDomains } from "@/lib/validation";
import {
  getCachedDomain,
  setCachedDomain,
} from "@/lib/rdap-cache";
import type { DomainResult } from "@/lib/types";

/**
 * Check domain with exponential backoff retry
 */
async function checkDomainWithRetry(
  domain: string,
  attempt: number = 0
): Promise<DomainResult> {
  try {
    const res = await fetch(`${RDAP_API_URL}/${domain}`, {
      signal: AbortSignal.timeout(RDAP_TIMEOUT_MS),
    });

    if (res.status === 200) {
      return { domain, available: false };
    }

    if (res.status === 404) {
      return { domain, available: true };
    }

    return { domain, available: false };
  } catch (error) {
    // Retry with exponential backoff
    if (attempt < RDAP_MAX_RETRIES) {
      const delay = RDAP_RETRY_DELAY_MS * Math.pow(2, attempt);
      await new Promise((r) => setTimeout(r, delay));
      return checkDomainWithRetry(domain, attempt + 1);
    }

    // After max retries, assume unavailable (conservative approach)
    return { domain, available: false };
  }
}

/**
 * Concurrency limiter utility
 */
async function pLimit(
  concurrency: number,
  tasks: (() => Promise<any>)[]
): Promise<any[]> {
  const results: any[] = [];
  let started = 0;
  let finished = 0;
  let running = 0;

  if (tasks.length === 0) return [];

  return new Promise((resolve, reject) => {
    const runNext = async () => {
      if (started >= tasks.length || running >= concurrency) {
        return;
      }

      running++;
      const index = started;
      started++;

      try {
        const result = await tasks[index]();
        results[index] = result;
        running--;
        finished++;

        if (finished === tasks.length) {
          resolve(results);
          return;
        }

        runNext();
      } catch (error) {
        running--;
        reject(error);
      }
    };

    // Start initial batch
    for (let i = 0; i < Math.min(concurrency, tasks.length); i++) {
      runNext();
    }
  });
}

export async function POST(req: NextRequest) {
  const { domains } = await req.json();

  if (!Array.isArray(domains) || domains.length === 0) {
    return NextResponse.json(
      { error: "Domain listesi gerekli." },
      { status: 400 }
    );
  }

  // Validate and normalize domains
  const { valid, invalid } = validateDomains(domains);

  if (valid.length === 0) {
    return NextResponse.json(
      { error: `Geçerli domain bulunamadı. ${invalid.length} invalid domains.` },
      { status: 400 }
    );
  }

  try {
    // Check cache first and separate into cached & uncached
    const cached: DomainResult[] = [];
    const toCheck: string[] = [];

    for (const domain of valid) {
      const cached_result = getCachedDomain(domain);
      if (cached_result) {
        cached.push(cached_result);
      } else {
        toCheck.push(domain);
      }
    }

    // Create tasks for parallel execution
    const tasks = toCheck.map(
      (domain) =>
        async () => {
          // Rate limiting between batches
          await new Promise((r) => setTimeout(r, RDAP_RATE_LIMIT_MS));
          const result = await checkDomainWithRetry(domain);
          // Cache the result
          setCachedDomain(domain, result);
          return result;
        }
    );

    // Execute in parallel with concurrency limit
    const checkedResults = await pLimit(RDAP_CONCURRENT_LIMIT, tasks);

    // Combine cached + newly checked results
    const allResults = [...cached, ...checkedResults];

    // Sort by domain name for consistency
    allResults.sort((a, b) => a.domain.localeCompare(b.domain));

    return NextResponse.json({ results: allResults });
  } catch (error) {
    console.error("RDAP check error:", error);
    return NextResponse.json(
      { error: "Domain kontrol edilemedi. Lütfen tekrar deneyin." },
      { status: 500 }
    );
  }
}
