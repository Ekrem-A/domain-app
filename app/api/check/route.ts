import { NextRequest, NextResponse } from "next/server";

async function checkDomain(domain: string) {
  try {
    const res = await fetch(`https://rdap.org/domain/${domain}`, {
      signal: AbortSignal.timeout(10000),
    });

    if (res.status === 200) {
      return { domain, available: false };
    }

    if (res.status === 404) {
      return { domain, available: true };
    }

    return { domain, available: false };
  } catch {
    return { domain, available: false };
  }
}

export async function POST(req: NextRequest) {
  const { domains } = await req.json();

  if (!Array.isArray(domains) || domains.length === 0) {
    return NextResponse.json(
      { error: "Domain listesi gerekli." },
      { status: 400 }
    );
  }

  const results = [];

  for (const domain of domains) {
    if (typeof domain !== "string") continue;
    const result = await checkDomain(domain);
    results.push(result);

    // Rate limit - RDAP API'yi yormamak için
    await new Promise((r) => setTimeout(r, 300));
  }

  return NextResponse.json({ results });
}
