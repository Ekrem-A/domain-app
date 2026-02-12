import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { prompt } = await req.json();

  if (!prompt || typeof prompt !== "string") {
    return NextResponse.json({ error: "Prompt gerekli." }, { status: 400 });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "OpenAI API anahtarı yapılandırılmamış." },
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
        messages: [
          {
            role: "system",
            content: `Sen bir domain ismi üretme asistanısın.

Görevin:
1. Kullanıcının iş tanımını ve niyetini analiz et.
2. Yaratıcı, markalaşabilir, kısa ve akılda kalıcı domain ismi önerileri üret.
3. En az 10 aday domain ismi üret.

Kurallar:
- Domain isimleri şu özelliklere sahip olmalı:
  - Kısa (mümkünse en fazla 12 karakter)
  - Kolay telaffuz edilebilir
  - Markalaşabilir (genel anahtar kelime spam'i değil)
  - Profesyonel bir iş web sitesi için uygun
- Şu TLD'leri tercih et (sırasıyla): .com, .co, .io, .net
- Kaçın: Rakamlar, tireler, tescilli marka isimleri

Çıktı formatı (KESİN):
Sadece JSON dizisi döndür. Başka hiçbir şey yazma.

Her öğe şunları içermeli:
- domain: tam domain ismi (ör: "floriva.com")
- tld: üst düzey alan adı (ör: ".com")
- reason: bu domainin işe neden uygun olduğuna dair kısa açıklama

Örnek çıktı:
[
  {
    "domain": "floriva.com",
    "tld": ".com",
    "reason": "Çiçekleri ve yaratıcılığı çağrıştıran kısa, zarif bir isim"
  }
]

Dahil ETME:
- JSON dışında açıklamalar
- Markdown biçimlendirmesi
- Kod blokları`,
          },
          {
            role: "user",
            content: prompt,
          },
        ],
      }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.error?.message || "OpenAI API hatası." },
        { status: res.status }
      );
    }

    const data = await res.json();
    const content = data.choices[0].message.content;

    // JSON parse - markdown code block varsa temizle
    const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const domains = JSON.parse(cleaned);

    // Sadece domain isimlerini çıkar
    const domainNames: string[] = domains.map(
      (d: { domain: string }) => d.domain
    );

    return NextResponse.json({ domains: domainNames });
  } catch (error) {
    console.error("Domain üretme hatası:", error);
    return NextResponse.json(
      { error: "Domain isimleri üretilemedi." },
      { status: 500 }
    );
  }
}
