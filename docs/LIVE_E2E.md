# Live E2E — Render + Supabase

ใช้สำหรับตรวจระบบจริงโดยไม่เก็บ Secret ใน GitHub

ตั้งค่า Environment Variables ใน Terminal ชั่วคราว:

```env
E2E_BACKEND_BASE_URL=https://your-backend.onrender.com
E2E_FRONTEND_ORIGIN=https://your-frontend.onrender.com
E2E_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
E2E_SUPABASE_ANON_KEY=YOUR_PUBLISHABLE_OR_ANON_KEY
E2E_EMAIL=uat-user@example.com
E2E_PASSWORD=YOUR_UAT_PASSWORD
```

URL Backend และ Frontend ต้องไม่มี `/` ท้าย และ Backend ต้องไม่มี `/api`

รัน:

```bash
npm run test:e2e:live
```

Script จะตรวจ:

- `GET /health`
- `GET /ready`
- CORS Origin
- Supabase Password Login
- Bearer Token
- `GET /api/me`
- Profile ที่ Active
- Role เป็น admin/editor/viewer

ห้าม Commit ค่า Environment จริงหรือไฟล์ `.env` ที่มี Secret
