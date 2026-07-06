# Package / Render Deploy Ready

ตรวจแพ็กเกจสำหรับ Deploy บน Render แล้ว

## สรุปการแก้ไข

- ตรวจ `package.json` ทั้ง root / backend / frontend
- ตรวจ `package-lock.json` ให้ตรงกับ dependencies
- เพิ่ม/ยืนยัน `express-rate-limit` ใน backend dependencies
- Regenerate lock file ให้ใช้ public npm registry (`registry.npmjs.org`)
- ลบ path registry ภายในออกจาก lock file เพื่อให้ Render ติดตั้งได้
- อัปเดต `render.yaml` ให้มี Environment Variables ของ Phase C.6 ครบ
- ตรวจ build:
  - Backend: `npm ci --ignore-scripts && npm run build` ผ่าน
  - Frontend: `npm ci --ignore-scripts && npm run build` ผ่าน

## Render Backend

Root Directory:

```bash
backend
```

Build Command:

```bash
npm ci && npm run build
```

Start Command:

```bash
npm start
```

Environment Variables ที่ต้องมี:

```env
NODE_ENV=production
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_ANON_KEY=
CORS_ORIGIN=
ORGANIZATION_NAME=Central Krabi
REPORT_STORAGE_BUCKET=report-files
RATE_LIMIT_WINDOW_MINUTES=15
RATE_LIMIT_MAX_REQUESTS=300
SENSITIVE_RATE_LIMIT_WINDOW_MINUTES=15
SENSITIVE_RATE_LIMIT_MAX_REQUESTS=60
```

## Render Frontend

Root Directory:

```bash
frontend
```

Build Command:

```bash
npm ci && npm run build
```

Publish Directory:

```bash
dist
```

Environment Variables ที่ต้องมี:

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_API_BASE_URL=
VITE_ORGANIZATION_NAME=Central Krabi
```

## หลัง Deploy

เช็ก:

```text
/backend-url/health
/backend-url/ready
```

`/ready` ควรมี:

```text
reportPresets: ok
reportRuns: ok
reportFiles: ok
reportStorage: ok
```
