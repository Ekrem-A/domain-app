import { NextRequest, NextResponse } from "next/server";
import { getRdapUrl, RDAP_TIMEOUT_MS } from "@/lib/constants";

/**
 * RDAP Lookup API - Returns full WHOIS/RDAP info for a single domain
 */
export async function GET(req: NextRequest) {
  const domain = req.nextUrl.searchParams.get("domain");

  if (!domain || typeof domain !== "string") {
    return NextResponse.json(
      { error: "Domain parametresi gerekli." },
      { status: 400 }
    );
  }

  const trimmed = domain.trim().toLowerCase();

  // Basic domain validation
  if (!/^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*\.[a-z]{2,}$/i.test(trimmed)) {
    return NextResponse.json(
      { error: "Geçersiz domain formatı." },
      { status: 400 }
    );
  }

  try {
    const rdapUrl = getRdapUrl(trimmed);
    const res = await fetch(rdapUrl, {
      signal: AbortSignal.timeout(RDAP_TIMEOUT_MS),
    });

    // 404 = domain not found in registry = available
    if (res.status === 404) {
      return NextResponse.json({
        domain: trimmed,
        available: true,
        registered: false,
      });
    }

    // Non-200 and non-404: RDAP server error or unsupported TLD
    // Treat as available since we couldn't confirm registration
    if (!res.ok) {
      return NextResponse.json({
        domain: trimmed,
        available: true,
        registered: false,
      });
    }

    const data = await res.json();

    // Validate that we actually got registration data
    // If RDAP returns 200 but no real data, treat as available
    const hasRegistrationData = data.ldhName || data.unicodeName || (data.events && data.events.length > 0);
    if (!hasRegistrationData) {
      return NextResponse.json({
        domain: trimmed,
        available: true,
        registered: false,
      });
    }

    // Extract useful fields from RDAP response
    const result = {
      domain: trimmed,
      available: false,
      registered: true,

      // Registration info
      name: data.ldhName || data.unicodeName || trimmed,
      status: data.status || [],
      
      // Events (registration, expiration, last update)
      events: (data.events || []).map((e: any) => ({
        action: e.eventAction,
        date: e.eventDate,
      })),

      // Nameservers
      nameservers: (data.nameservers || []).map((ns: any) => ns.ldhName || ns.unicodeName).filter(Boolean),

      // Registrar info (from entities)
      registrar: extractRegistrar(data.entities),

      // Links
      links: (data.links || []).map((l: any) => ({
        rel: l.rel,
        href: l.href,
        type: l.type,
      })),

      // Port43 (WHOIS server)
      port43: data.port43 || null,
    };

    return NextResponse.json(result);
  } catch (error: any) {
    if (error?.name === "TimeoutError" || error?.name === "AbortError") {
      // Timeout likely means domain is not in any RDAP registry = available
      return NextResponse.json({
        domain: trimmed,
        available: true,
        registered: false,
      });
    }

    console.error("RDAP lookup error:", error);
    // Network errors = can't confirm registration = treat as available
    return NextResponse.json({
      domain: trimmed,
      available: true,
      registered: false,
    });
  }
}

/**
 * Extract registrar information from RDAP entities
 */
function extractRegistrar(entities: any[] | undefined): { name: string; url?: string } | null {
  if (!entities || !Array.isArray(entities)) return null;

  for (const entity of entities) {
    const roles = entity.roles || [];
    if (roles.includes("registrar")) {
      const name =
        entity.vcardArray?.[1]?.find((v: any) => v[0] === "fn")?.[3] ||
        entity.publicIds?.[0]?.identifier ||
        entity.handle ||
        "Unknown";

      const url = entity.links?.find((l: any) => l.rel === "self" || l.rel === "related")?.href;

      return { name, url };
    }
  }

  return null;
}
