# VedaConnect Member Portal — Backend (Prisma + Supabase)

## 1. Create your Supabase project
https://supabase.com -> New project. Save the database password you set — you'll need it below.

## 2. Create the tables — run this in Supabase SQL Editor (in order)
1. `sql/schema.sql` — creates `users`, `member_profiles`, `memberships`, `membership_plans` (seeded with the ₹7,000 + 18% GST Founder plan), `business_certificates`
2. `sql/functions.sql` — creates `next_member_id()`, used later for admin-side Member ID generation

You can see all of these afterward in **Table Editor** in your Supabase dashboard.

## 3. Create the Storage bucket
Dashboard -> Storage -> New bucket -> name it exactly `business-certificates`. Keep it **private**.

## 4. Get your connection strings
Dashboard -> Project Settings -> Database -> **Connection string** section. Copy:
- The **Connection pooling** string (port 6543) -> this is `DATABASE_URL`
- The **Direct connection** string (port 5432) -> this is `DIRECT_URL`

Dashboard -> Project Settings -> API. Copy:
- **Project URL** -> `SUPABASE_URL`
- **service_role key** -> `SUPABASE_SERVICE_ROLE_KEY` (only used for Storage uploads)

## 5. Configure environment
```bash
cd backend
cp .env.example .env
```
Paste in the 4 values above.

⚠️ `.env` is already in `.gitignore`. Never commit it, never send the service role key or DATABASE_URL to the frontend.

## 6. Install & generate the Prisma client
```bash
npm install
```
`npm install` automatically runs `prisma generate` (see the `postinstall` script), which reads `prisma/schema.prisma` and generates the typed client your code imports from `@prisma/client`. It does **not** create or change any tables — you already did that manually in step 2.

## 7. Run
```bash
npm run dev
```

## 8. Verify
```bash
curl http://localhost:5000/api/health
curl http://localhost:5000/api/health/db
```
The second call confirms Prisma can actually reach your Supabase Postgres database.

## Optional: browse your data visually
```bash
npm run prisma:studio
```
Opens Prisma Studio in the browser — lets you view/edit rows without touching Supabase's Table Editor.

## Endpoints (Phase 3 — onboarding only)

| Method | Route | Maps to |
|---|---|---|
| POST | `/api/onboarding/personal-details` | Step 1 |
| PUT | `/api/onboarding/business-details` | Step 2 |
| POST | `/api/onboarding/business-certificate` (multipart, field name `certificate`) | Step 3 |
| GET | `/api/onboarding/plans` / POST `/api/onboarding/membership` | Step 4 |
| POST | `/api/onboarding/confirm-payment` | Step 5 |

## If you ever change the schema
Edit `prisma/schema.prisma` **and** update `sql/schema.sql` to match, run the updated SQL in Supabase SQL Editor, then run `npx prisma generate` again. The two files must always describe the same tables — Prisma doesn't create tables here, it only maps to what you created via SQL.

## Not built yet (next phases)
- Admin auth + JWT login
- Admin endpoint: verify payment -> generate Member ID -> activate account
- Member dashboard / members directory / events APIs
