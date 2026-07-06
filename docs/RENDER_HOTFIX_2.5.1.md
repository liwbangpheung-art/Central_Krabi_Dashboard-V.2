# Render Hotfix 2.5.1

## Frontend Environment
ตั้งค่าใน Render Static Site → Environment:

```env
VITE_API_BASE_URL=https://centralkrabi.onrender.com
```

อย่าใช้ `https://centralkrabi-api.onrender.com` หาก URL นั้นตอบ `Not Found` ที่ `/api/me` และอย่าเติม `/api` ท้ายค่า

หลังแก้ให้ใช้ **Manual Deploy → Clear build cache & deploy**

## Backend Environment
ตั้งค่าใน Render Web Service → Environment:

```env
CORS_ORIGIN=https://centralkrabi-1.onrender.com
```

ใช้ URL Frontend จริงและไม่ใส่ `/` ท้าย URL จากนั้น Deploy Backend ใหม่

## Verification
- `https://centralkrabi.onrender.com/health` ต้องตอบ 200
- `https://centralkrabi.onrender.com/api/me` เมื่อเปิดตรง ๆ ต้องตอบ 401 `AUTH_TOKEN_MISSING`
- หลัง Login จาก Frontend Request `/api/me` ต้องตอบ 200
