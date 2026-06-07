# MegaAI — AI Image Platform

AI yordamida rasm yaratish va tahrirlash platformasi.

---

## 📁 Loyiha Strukturasi

```
megaai/
├── app/
│   ├── page.tsx                    # Landing page
│   ├── layout.tsx                  # Root layout
│   ├── globals.css                 # Global styles
│   ├── login/page.tsx              # Login
│   ├── register/page.tsx           # Register
│   ├── pricing/page.tsx            # Pricing
│   ├── chat/page.tsx               # AI Chat (asosiy sahifa)
│   ├── profile/page.tsx            # Profil
│   ├── settings/page.tsx           # Sozlamalar
│   ├── subscription-inactive/      # Tarif yo'q sahifasi
│   └── admin/
│       ├── page.tsx                # Admin dashboard
│       └── login/page.tsx          # Admin login
│
├── app/api/
│   ├── auth/
│   │   ├── register/route.ts
│   │   ├── login/route.ts
│   │   ├── logout/route.ts
│   │   ├── me/route.ts
│   │   └── change-password/route.ts
│   ├── ai/
│   │   ├── generate/route.ts       # DALL-E 3 generation
│   │   └── usage/route.ts          # Daily limit check
│   └── admin/
│       ├── login/route.ts
│       ├── logout/route.ts
│       ├── users/route.ts
│       ├── stats/route.ts
│       └── subscription/route.ts
│
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx
│   │   └── AppSidebar.tsx
│   └── ui/
│       ├── Logo.tsx
│       └── LangSwitcher.tsx
│
├── hooks/
│   └── useLang.tsx                 # UZ/EN/RU til tizimi
│
├── lib/
│   ├── auth.ts                     # JWT + bcrypt
│   ├── prisma.ts                   # Prisma client
│   ├── supabase.ts                 # Supabase client
│   ├── storage.ts                  # Supabase Storage
│   ├── adminAuth.ts                # Admin JWT verify
│   └── i18n.ts                     # Tarjimalar
│
├── prisma/
│   ├── schema.prisma               # DB modellari
│   └── seed.ts                     # Test ma'lumotlar
│
├── types/index.ts
├── middleware.ts                   # Route protection
├── .env.local.example
├── vercel.json
└── README.md
```

---

## 🔧 Ro'yxatdan O'tish Kerak Bo'lgan Xizmatlar

| Xizmat | Maqsad | URL |
|--------|--------|-----|
| **Supabase** | Database + Auth + Storage | https://supabase.com |
| **OpenAI** | DALL-E 3 rasm yaratish | https://platform.openai.com |
| **Vercel** | Deploy qilish | https://vercel.com |

---

## 🗄️ Supabase Sozlash

### 1. Loyiha yarating
1. https://supabase.com ga kiring
2. "New Project" bosing
3. Nom, parol va region tanlang (Frankfurt yaqin)

### 2. Database URL olish
- **Settings → Database → Connection string → URI** ni nusxalang
- Bu `DATABASE_URL` bo'ladi
- **Direct connection** ham nusxalang — bu `DIRECT_URL`

### 3. API Keys olish
- **Settings → API**:
  - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
  - `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `service_role` → `SUPABASE_SERVICE_ROLE_KEY`

### 4. Storage bucket yarating
```sql
-- Supabase SQL Editor da bajaring:
INSERT INTO storage.buckets (id, name, public)
VALUES ('ai-images', 'ai-images', true);

-- Public read policy:
CREATE POLICY "Public read ai-images"
ON storage.objects FOR SELECT
USING (bucket_id = 'ai-images');

-- Authenticated upload policy:
CREATE POLICY "Auth upload ai-images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'ai-images');
```

---

## 🤖 OpenAI API Ulash

1. https://platform.openai.com ga kiring
2. **API Keys** → "Create new secret key"
3. Kalitni nusxalang → `.env.local` ga `OPENAI_API_KEY` sifatida saqlang

> ⚠️ **Muhim:** DALL-E 3 uchun kreditingiz bo'lishi kerak (taxminan $0.04/rasm).

---

## ⚙️ Environment Variables

`.env.local.example` faylini `.env.local` nomi bilan ko'chirb, to'ldiring:

```bash
cp .env.local.example .env.local
```

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6...

# OpenAI
OPENAI_API_KEY=sk-proj-...

# JWT (kamida 32 ta tasodifiy belgi)
JWT_SECRET=megaai_super_secret_jwt_key_change_this_2024!

# Admin
ADMIN_USERNAME=admin
ADMIN_CODE=your_admin_secret_code_here

# App
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app

# Database (Supabase PostgreSQL)
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres
DIRECT_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres
```

---

## 🚀 Local Ishga Tushirish

```bash
# 1. Paketlarni o'rnatish
npm install

# 2. Prisma generate
npm run db:generate

# 3. Database yaratish (Supabase ga push)
npm run db:push

# 4. (Ixtiyoriy) Test ma'lumot qo'shish
npx ts-node prisma/seed.ts

# 5. Dev server ishga tushirish
npm run dev
```

Brauzerda oching: http://localhost:3000

---

## 🌐 Vercel Deploy

### Usul 1 — Vercel Dashboard (tavsiya)
1. https://vercel.com → "New Project"
2. GitHub reponi import qiling
3. **Environment Variables** bo'limida barcha `.env.local` o'zgaruvchilarini qo'shing
4. **Build Command**: `prisma generate && next build`
5. "Deploy" bosing

### Usul 2 — CLI
```bash
npm i -g vercel
vercel login
vercel --prod
```

### Deploy'dan keyin
```bash
# Production database'ga push qilish
DATABASE_URL=your_production_url npx prisma db push
```

---

## 👤 Admin Panel

URL: `https://your-domain.com/admin/login`

- **Username**: `.env` dagi `ADMIN_USERNAME` (default: `admin`)
- **Kod**: `.env` dagi `ADMIN_CODE`

Admin imkoniyatlari:
- Barcha foydalanuvchilar ro'yxati
- Oylik/Yillik tarif berish
- Tarifni bekor qilish
- Statistikalar

---

## 💬 Telegram To'lov Tizimi

Foydalanuvchi "Tarif sotib olish" bosganida avtomatik xabar:

```
Salom. MegaAI uchun tarif sotib olmoqchiman.
Username: {username}
Tarif: Oylik / Yillik
```

Admin to'lovni qabul qilib, `/admin` paneldan tarif beradi.

---

## 🔒 Xavfsizlik

- Barcha parollar `bcrypt` (12 rounds) bilan shifrlangan
- JWT tokenlar `httpOnly cookie` da saqlanadi
- Admin va User tokenlar alohida
- Middleware orqali route protection
- Daily limit: kuniga 3 ta rasm

---

## 🐛 Muammo Bo'lsa

```bash
# Prisma muammosi
npm run db:generate
npm run db:push

# Port band bo'lsa
lsof -ti:3000 | xargs kill

# Build xatosi
npm run build 2>&1 | tail -50
```

---

## 📊 Database Modellari

| Jadval | Maydonlar |
|--------|-----------|
| `users` | id, username, email, password_hash, created_at |
| `subscriptions` | id, user_id, plan_type, start_date, end_date, status |
| `payments` | id, user_id, plan_type, amount, created_at |
| `ai_usages` | id, user_id, date, count |

---

*MegaAI © 2026 — Barcha huquqlar himoyalangan*
