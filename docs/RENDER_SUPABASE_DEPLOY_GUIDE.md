# Render + Supabase Deploy Guide — v2.9.0-c7-preview

## 1. Supabase Database

รันไฟล์เดียวนี้ใน Supabase SQL Editor:

```text
database/Central_Krabi_Dashboard_v2.9.0-c7-preview_SUPABASE_FULL_SETUP.sql
```

ไฟล์นี้รวม migrations 001-018 แล้ว

## 2. Supabase Storage

Migration 018 เตรียม report files/storage metadata แล้ว
ตรวจว่า bucket ที่ใช้ตรงกับ ENV:

```text
REPORT_STORAGE_BUCKET=report-files
```

## 3. Backend Render ENV

```text
NODE_ENV=production
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=xxxxx
CORS_ORIGIN=https://your-frontend.onrender.com
REPORT_STORAGE_BUCKET=report-files
ORGANIZATION_NAME=Central Krabi
RATE_LIMIT_WINDOW_MINUTES=15
RATE_LIMIT_MAX_REQUESTS=1200
SENSITIVE_RATE_LIMIT_WINDOW_MINUTES=15
SENSITIVE_RATE_LIMIT_MAX_REQUESTS=300
```

## 4. Frontend Render ENV

```text
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxxxx
VITE_API_BASE_URL=https://your-backend.onrender.com
VITE_ORGANIZATION_NAME=Central Krabi
```

## 5. Render Services

ใช้ `render.yaml` ในโปรเจกต์ได้เลย

## 6. Smoke Check

หลัง deploy:

```text
GET /health
GET /ready
```

Frontend:
- Login
- Master Data
- Daily Entry
- Export > PowerPoint Report Builder
- Preview
- Backend Generate + Storage



## SPA Routing Fallback

Frontend includes these files for React Router fallback on static hosting:

```text
frontend/public/_redirects
frontend/public/static.json
```

Expected `_redirects` content:

```text
/*    /index.html   200
```

This prevents `/master-data`, `/entry/tissue`, `/entry/recycle`, etc. from showing `Not Found` after refresh.
