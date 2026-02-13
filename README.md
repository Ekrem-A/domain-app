# AI Domain Finder 🚀


<img width="715" height="871" alt="image" src="https://github.com/user-attachments/assets/52e4cf31-135f-4349-b534-c00168a61b7b" />

Yapay zeka ile yaratıcı ve markalaşabilir domain isimlerini bulun, ardından RDAP ile müsaitliklerini anında kontrol edin.

## ✨ Özellikler

- **AI-Powered Domain Generation** - OpenAI GPT ile işletmenize uygun domain önerileri oluştur
- **Instant Availability Check** - RDAP API ile gerçek zamanlı müsaitlik kontrolü
- **Modern UI** - Vibrant tasarım, smooth animasyonlar ve responsive layout
- **Real-time Status** - Adım adım ilerleme durumu gösterimi
- **Smart Filtering** - Kısa, markalaşabilir ve profesyonel domain isimleri
- **Error Handling** - Kullanıcı dostu hata mesajları

## 🛠 Teknoloji Stack

### Frontend
- **Next.js 16.1.6** - Modern React framework
- **React 19.2.3** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS 4** - Styling
- **Geist Font** - Beautiful typography

### Backend
- **Next.js API Routes** - Server-side endpoints
- **OpenAI API (GPT-4o-mini)** - Domain generation
- **RDAP (Registration Data Access Protocol)** - Domain availability check

### DevTools
- **ESLint 9** - Code quality
- **Turbopack** - Fast builds

## 🚀 Hızlı Başlangıç

### Gereksinimler
- Node.js 20+
- npm veya yarn
- OpenAI API key

### Kurulum

1. **Projeyi klonla veya indir**
```bash
cd domain-app
```

2. **Bağımlılıkları yükle**
```bash
npm install
```

3. **OpenAI API key'ini ayarla**

`.env.local` dosyasını oluştur proje kökünde:
```env
OPENAI_API_KEY=your-openai-api-key-here
```

> ⚠️ **Önemli:** `OPENAI_API_KEY` sunucu tarafında kalarak güvenliğini korur. `NEXT_PUBLIC_` ön eki olmadığını fark et - bu tarayıcı tarafında expose edilmemiş demektir.

4. **Geliştirme serverini başlat**
```bash
npm run dev
```

Sonra `http://localhost:3000` adresini ziyaret et.

5. **Üretim için build et**
```bash
npm run build
npm start
```

## 📖 Kullanım

1. **Ana sayfaya git** (`http://localhost:3000`)
2. **İşletmen/projenin tanımını yaz** (örnek: "Bir çiçekçiyim, modern ve akılda kalıcı bir domain istiyorum")
3. **"Domain Bul" butonuna tıkla**
4. **Sonuçları bekle** - AI domain isimleri ürettikten sonra, RDAP müsaitliği kontrol edecek
5. **Sonuçları gözden geçir** - Hangi domainler kullanılabilir, hangisi kayıtlı olduğunu görmek için

### Sonuç Yorumlama

- **Kullanılabilir (Yeşil)** - Domain kayıtlı değil, satın alabilirsin
- **Kayıtlı (Kırmızı)** - Domain zaten birisi tarafından kayıtlanmış

## 🔌 API Routes

### POST `/api/generate`

OpenAI ile domain isimleri üret.

**Request Body:**
```json
{
  "prompt": "Bir yazılım geliştirme şirketi için startup tarzında domain istiyorum"
}
```

**Response:**
```json
{
  "domains": [
    "codeshift.com",
    "vertexa.io",
    "syntaxlab.co"
  ]
}
```

**Error Response:**
```json
{
  "error": "Domain isimleri üretilemedi."
}
```

### POST `/api/check`

RDAP ile domain müsaitliğini kontrol et.

**Request Body:**
```json
{
  "domains": [
    "example.com",
    "example.io",
    "example.co"
  ]
}
```

**Response:**
```json
{
  "results": [
    { "domain": "example.com", "available": false },
    { "domain": "example.io", "available": true },
    { "domain": "example.co", "available": false }
  ]
}
```

## ⚙️ Ortam Değişkenleri

| Değişken | Gerekli | Açıklama |
|----------|---------|---------|
| `OPENAI_API_KEY` | Evet | OpenAI API anahtarı (sunucu tarafında) |

## 🎨 Tasarım Özellikleri

### Renk Paleti
- **Primary Gradient:** Indigo → Violet → Pink
- **Background:** Light slate with radial gradient mesh
- **Available:** Emerald green tones
- **Registered:** Rose/red tones
- **Borders:** Subtle slate toning

### Animasyonlar
- **fadeIn** - 0.4s öge belirme
- **slideUp** - 0.4s yukarı kayma + opasite
- **spin** - Loading spinner için 1s dönüş
- **shimmer** - Loading placeholder efekti

## 📁 Proje Yapısı

```
domain-app/
├── app/
│   ├── api/
│   │   ├── generate/route.ts    # OpenAI API endpoint
│   │   └── check/route.ts       # RDAP API endpoint
│   ├── page.tsx                 # Ana sayfa
│   ├── layout.tsx               # Root layout
│   └── globals.css              # Global styles & animations
├── components/
│   ├── PromptForm/              # Input form component
│   ├── DomainList/              # Results list component
│   ├── DomainItem/              # Individual domain card
│   └── index.ts                 # Barrel exports
├── lib/
│   ├── gpt.ts                   # OpenAI integration
│   └── rdap.ts                  # RDAP integration
├── public/                      # Static assets
├── .env.local                   # Environment variables
├── package.json
├── tsconfig.json
├── next.config.ts
└── tailwind.config.ts
```

## 🔄 İş Akışı

```
Kullanıcı Input
    ↓
[/api/generate endpoint]
    ↓
OpenAI API → GPT-4o-mini
    ↓
Domain isimleri JSON
    ↓
[/api/check endpoint]
    ↓
RDAP API (rate-limited: 300ms arası)
    ↓
Müsaitlik durumu (true/false)
    ↓
UI'da sonuçlar gösteriliyor
```

## 🐛 Sorun Giderme

### "OpenAI API anahtarı yapılandırılmamış"
- `.env.local` dosyasını oluştur
- `OPENAI_API_KEY` değişkenini ekle
- Server'ı yeniden başlat

### "Domain kontrol edilemedi"
- RDAP API'nin çalışır durumda olduğunu kontrol et
- Rate limiting'den dolayı yavaş olabilir (istemi bekle)
- Browser console'da tam hata mesajını kontrol et

### "Domain isimleri üretilemedi"
- OpenAI API key'inin geçerli olduğunu kontrol et
- API quote'unun bitmediğini kontrol et
- Internet bağlantısını kontrol et

## 📚 Geliştirme

### Linting
```bash
npm run lint
```

### Build
```bash
npm run build
```

### Development Mode
```bash
npm run dev
```

## 🚢 Deployment

### Vercel'e Deploy (Önerilen)

1. Projeyi GitHub'a push et
2. [Vercel Dashboard](https://vercel.com)'a git
3. "Add New Project" → GitHub repo'yu seç
4. Environment variable'ı ayarla: `OPENAI_API_KEY`
5. Deploy et!

### Docker ile Deploy

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

```bash
docker build -t domain-app .
docker run -p 3000:3000 -e OPENAI_API_KEY=your-key domain-app
```

## 📝 Lisans

MIT

## 🤝 Katkı

Pullrequest'leri ve issue'ları welcome!

---

**Yapılmış:** Claude AI ile ❤️
