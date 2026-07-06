# Phase 1 Acceptance Test

## A. Installation

- [ ] `npm ci --prefix backend` ผ่าน
- [ ] `npm ci --prefix frontend` ผ่าน
- [ ] `npm run verify` ผ่าน
- [ ] ไม่มี Internal Registry URL ใน lockfile
- [ ] ไม่มี `.env` จริงใน Git/ZIP

## B. Database

- [ ] รัน `001_phase1_schema.sql` ผ่าน
- [ ] รัน `002_phase1_security.sql` ผ่าน
- [ ] รัน Migration ซ้ำผ่าน
- [ ] `smoke_test.sql` แสดงตารางและ Trigger ครบ
- [ ] สร้างผู้ใช้ลำดับที่ 11 ไม่ได้

## C. Backend

- [ ] `/health` ตอบ 200 โดยไม่ต้องใช้ Database
- [ ] `/ready` ตอบ 200 เมื่อ Database พร้อม
- [ ] `/ready` ตอบ 503 พร้อมรายละเอียดเมื่อ Database ไม่พร้อม
- [ ] `/api/me` ไม่มี Token ตอบ 401
- [ ] `/api/me` Token ถูกต้องตอบ Profile และ Role
- [ ] CORS อนุญาตเฉพาะ Origin ที่กำหนด

## D. Frontend

- [ ] Environment หายแล้วแสดงหน้า Configuration Error ไม่ใช่หน้าขาว
- [ ] Login สำเร็จ
- [ ] Login ผิดแสดงข้อความที่เข้าใจได้
- [ ] Dashboard แสดง API URL ที่กำลังใช้
- [ ] Backend ล่มแล้วแสดงข้อผิดพลาดเฉพาะเจาะจง
- [ ] Role แสดงตรงกับ `public.profiles`
- [ ] Theme ทั้งสามแบบใช้งานได้
- [ ] Logout สำเร็จ

## E. End-to-End

- [ ] สร้าง Admin ด้วย `npm run create-admin`
- [ ] Login ด้วย Admin
- [ ] Dashboard แสดง Backend Online
- [ ] Dashboard แสดง Database Ready
- [ ] Dashboard แสดง Role Admin
- [ ] Refresh หน้าแล้ว Session ยังอยู่
- [ ] Logout/Login ใหม่แล้ว Role ยังถูกต้อง
