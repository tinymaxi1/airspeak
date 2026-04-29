# AirSpeak Admin Panel

Next.js 14 + Supabase SSR ile yazılmış admin paneli.

## Lokal başlatma

```bash
cd admin
npm install
cp .env.example .env.local
# .env.local'e gerçek key'leri yaz:
#   NEXT_PUBLIC_SUPABASE_URL
#   NEXT_PUBLIC_SUPABASE_ANON_KEY
#   SUPABASE_SERVICE_ROLE_KEY (sadece server)
npm run dev   # http://localhost:3001
```

## İlk admin kullanıcısı

Mock auth kapatıldıktan sonra Supabase Dashboard > Authentication > Users'tan
bir kullanıcı oluştur, sonra SQL Editor'da:

```sql
update public.profiles
set is_admin = true, admin_role = 'super_admin'
where id = (select id from auth.users where email = 'sen@airspeak.io');
```

## Sayfa Haritası

```
/login                 — magic link veya şifre
/                      — dashboard (KPI + yayın durumu)
/tree                  — 5 rol kartı
/tree/[role]           — modüller
/tree/[role]/[m]       — üniteler
/tree/[role]/[m]/[u]   — dersler
/tree/[role]/[m]/[u]/[l]  — egzersizler
/vocab                 — kelime tablosu
/interviews            — mülakat soruları
/icao4                 — ICAO 4 sınav
/oral                  — sözlü prompt'lar
/placement             — placement test
/airlines              — havayolları
/scenarios             — AI senaryolar
/users                 — kullanıcı yönetimi (editor+)
/audit                 — admin aksiyon logu
/analytics             — temel istatistik
/403                   — yetki yok
```

## Roller

- **super_admin**: tüm CRUD + delete + ban + diğer admin atama
- **editor**: içerik CRUD + status publish'e kadar
- **reviewer**: sadece status değişikliği (draft → review → published)

## Deploy

Vercel:
- Repo connect et
- Build command: `npm run build`
- Output directory: `.next`
- Install command: `npm install`
- Root directory: `admin`
- Env vars: 3 Supabase key'i ekle
- Custom domain: `admin.airspeak.io`

## Şu Anki Durum

Faz 3 read-only tamamlandı. Faz 4'te CRUD form'lar, sürükle-bırak,
versioning UI, audio upload eklenecek.
