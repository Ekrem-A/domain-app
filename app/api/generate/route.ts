import { NextRequest, NextResponse } from "next/server";
import { parseErrorMessage } from "@/lib/validation";

const MAX_PROMPT_LENGTH = 5000;
const MIN_PROMPT_LENGTH = 10;

export async function POST(req: NextRequest) {
  const { prompt } = await req.json();

  // Input validation
  if (!prompt || typeof prompt !== "string") {
    return NextResponse.json(
      { error: "Prompt gerekli ve string olmalı." },
      { status: 400 }
    );
  }

  const trimmedPrompt = prompt.trim();

  if (trimmedPrompt.length < MIN_PROMPT_LENGTH) {
    return NextResponse.json(
      { error: `Prompt en az ${MIN_PROMPT_LENGTH} karakter olmalı.` },
      { status: 400 }
    );
  }

  if (trimmedPrompt.length > MAX_PROMPT_LENGTH) {
    return NextResponse.json(
      { error: `Prompt ${MAX_PROMPT_LENGTH} karakteri geçemez.` },
      { status: 400 }
    );
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "OpenAI API anahtarı yapılandırılmamış. Sunucu yöneticisine bildirin.",
      },
      { status: 500 }
    );
  }

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.7,
        messages: [
          {
            role: "system",
            content: `You are a domain name generation assistant.

Your task:
1. Analyze the user's business description and intent.
2. Generate creative, brandable, short, and memorable domain name ideas.
3. After generating domain ideas, CHECK domain availability.
4. Only return domain names that are ACTUALLY AVAILABLE for registration.

Rules:
- Domain names must be:
  - Short (max 12 characters if possible)
  - Easy to pronounce
  - Brandable (not generic keyword spam)
  - Suitable for a professional business website
- Prefer these TLDs (in order):
  .com
  .co
  .io
  .net
- Avoid:
  - Numbers
  - Hyphens
  - Trademarked brand names
- Generate at least 10 candidate domain names internally.
- Perform availability checks for each candidate.
- Filter out unavailable domains.
- Return ONLY domains that are confirmed available.

Output format (STRICT):
Return a JSON array only.

Each item must include:
- domain: string
- tld: string
- reason: short explanation why this domain fits the business
- availability: true

Example output:
[
  {
    "domain": "floriva.com",
    "tld": ".com",
    "reason": "'flora' ve 'viva' kelimelerinin birleşimi, çiçek ve canlılık çağrışımı yaparak bahçecilik işine uygun",
    "availability": true
  }
]

Do NOT include:
- Unavailable domains
- Explanations outside the JSON
- Markdown formatting`,
          },
          {
            role: "user",
            content: trimmedPrompt,
          },
        ],
      }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      const errorMsg =
        errorData.error?.message ||
        `OpenAI API hatası (${res.status}): ${parseErrorMessage(errorData)}`;

      console.error("OpenAI API Error:", errorMsg);

      return NextResponse.json(
        { error: errorMsg },
        { status: res.status >= 500 ? 503 : 400 }
      );
    }

    const data = await res.json();

    if (!data.choices?.[0]?.message?.content) {
      throw new Error("OpenAI yanıtı geçersiz formatında");
    }

    const content = data.choices[0].message.content;

    // Clean up markdown code blocks if present
    const cleaned = content
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();

    // Parse and validate JSON
    let domains;
    try {
      domains = JSON.parse(cleaned);
    } catch (parseError) {
      console.error("JSON parse error:", content.substring(0, 200));
      throw new Error(
        "OpenAI yanıtı JSON olarak parse edilemedi. Lütfen tekrar deneyiniz."
      );
    }

    // Validate response structure
    if (!Array.isArray(domains) || domains.length === 0) {
      throw new Error("OpenAI geçerli domain önerileri döndürmedi");
    }

    // Extract domain names with reasons and validate
    const suggestions = domains
      .filter((d: any) => typeof d?.domain === "string" && d.domain.length > 0)
      .map((d: any) => ({
        domain: d.domain,
        reason: d.reason || "",
      }))
      .slice(0, 50); // Max 50 domains to prevent abuse

    if (suggestions.length === 0) {
      throw new Error("Geçerli domain isimleri çıkarılamadı");
    }

    return NextResponse.json({ domains: suggestions });
  } catch (error) {
    const errorMessage = parseErrorMessage(error);
    console.error("Domain generation error:", errorMessage);

    return NextResponse.json(
      {
        error:
          errorMessage ||
          "Domain isimleri üretilemedi. Lütfen daha sonra tekrar deneyiniz.",
      },
      { status: 500 }
    );
  }
}
