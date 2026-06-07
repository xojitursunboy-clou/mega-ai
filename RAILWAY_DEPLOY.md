# Railway Deploy Yo'riqnomasi

## ❓ Supabase SQL Editor ga kod qo'yish kerakmi?

### Javob: **YO'Q — kerak emas!**

Prisma o'zi avtomatik barcha jadvallarni yaratadi.
`prisma db push` buyrug'i schema.prisma faylidagi barcha modellarni
PostgreSQL ga avtomatik yaratib beradi.

---

## 🚂 Railway Deploy — Bosqichma-bosqich

### 1-qadam: Railway PostgreSQL yaratish

1. https://railway.app ga kiring (GitHub bilan)
2. **"New Project"** → **"Provision PostgreSQL"**
3. PostgreSQL yaratilgandan so'ng **Variables** tabiga o'ting
4. `DATABASE_URL` ni nusxalab oling (shunday ko'rinadi):
   ```
   postgresql://postgres:AbCdEf@monorail.proxy.rlwy.net:12345/railway
   ```

### 2-qadam: Loyihani Railway ga ulash

1. Railway dashboardda **"New"** → **"GitHub Repo"**
2. Reponi tanlang → **"Deploy"** bosing
3. **Variables** tabiga o'ting, quyidagilarni qo'shing:

```
DATABASE_URL          = (PostgreSQL dan olgan URL)
DIRECT_URL            = (xuddi shu URL, bir xil)
JWT_SECRET            = megaai_super_secret_key_minimum_32_chars_2024
ADMIN_USERNAME        = admin
ADMIN_CODE            = sizning_admin_kodingiz
NEXT_PUBLIC_APP_URL   = https://sizning-loyiha.up.railway.app
```

**Ixtiyoriy (bo'lmasa demo mode ishlaydi):**
```
OPENAI_API_KEY        = sk-proj-...
```

**Supabase Storage ishlatmoqchi bo'lsangiz:**
```
NEXT_PUBLIC_SUPABASE_URL      = https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJ...
SUPABASE_SERVICE_ROLE_KEY     = eyJ...
```

### 3-qadam: Jadvalarni yaratish (bir marta)

Railway deploy tugagandan so'ng, Railway dashboardda:
**"New"** → **"Run Command"** yoki terminal orqali:

```bash
npx prisma db push
```

Yoki bu buyruq `build` paytida avtomatik ishga tushadi chunki:
```json
"build": "prisma generate && next build"
```

**Shu bilan tamom! SQL yozish shart emas.**

---

## ✅ Tekshirish

Deploy tamom bo'lgandan so'ng:
1. Saytga kiring → Register sahifasida foydalanuvchi yarating
2. `/admin/login` ga kiring → Admin kodingiz bilan kiring
3. Admin panelda foydalanuvchiga tarif bering
4. Chat sahifasida AI ishlayotganini tekshiring

---

## 🔧 Muammo bo'lsa

**"Table not found" xatosi:**
```bash
# Railway terminal da:
npx prisma db push
```

**"JWT_SECRET undefined" xatosi:**
→ Railway Variables ga JWT_SECRET qo'shilganini tekshiring

**Build muvaffaqiyatsiz:**
→ Variables to'liq kiritilganini tekshiring
→ DATABASE_URL to'g'riligini tekshiring

---

## 📝 Eslatma: Supabase SQL Editor

Faqat **Supabase Storage** ishlatmoqchi bo'lsangiz,
SQL Editorga quyidagi 2 ta policy qo'shing:

```sql
-- Storage bucket yaratish
INSERT INTO storage.buckets (id, name, public)
VALUES ('ai-images', 'ai-images', true)
ON CONFLICT DO NOTHING;

-- Hamma ko'ra olsin
CREATE POLICY "Public read" ON storage.objects
FOR SELECT USING (bucket_id = 'ai-images');

-- Foydalanuvchilar yuklashi
CREATE POLICY "Auth upload" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'ai-images');
```

Agar Supabase Storage ishlatmasangiz (Railway PostgreSQL yetarli) —
**bu ham kerak emas.**
