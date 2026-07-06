# Render Rate Limit Hotfix

แก้ปัญหา Render crash จาก `ERR_MODULE_NOT_FOUND: express-rate-limit`

## สิ่งที่แก้

- ตัด dependency ภายนอก `express-rate-limit` ออกจาก backend
- เปลี่ยน `backend/src/middleware/rate-limit.js` เป็น middleware ภายในโปรเจกต์
- ยังรองรับ rate limit ผ่าน env เดิม:
  - `RATE_LIMIT_WINDOW_MINUTES`
  - `RATE_LIMIT_MAX_REQUESTS`
  - `SENSITIVE_RATE_LIMIT_WINDOW_MINUTES`
  - `SENSITIVE_RATE_LIMIT_MAX_REQUESTS`

## เหตุผล

Render บางรอบ start โดยไม่มี `backend/node_modules/express-rate-limit` ทำให้ backend crash ตั้งแต่เริ่มระบบ
การใช้ middleware ภายในทำให้ไม่พึ่ง package นี้ และ start ได้เสถียรกว่า

## หลังอัปโหลด

ให้กด:

```text
Manual Deploy → Clear build cache & deploy
```

แล้วตรวจ:

```text
/health
/ready
```
