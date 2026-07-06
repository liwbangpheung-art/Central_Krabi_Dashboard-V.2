# Central Krabi Waste & Resource Management Dashboard v2.7.0

Release นี้ต่อจาก **v2.6.0 Phase A User & Permission Management** โดยตรง และเพิ่ม **Phase B: Data Governance** ห้ามนำ Patch, Migration หรือ Source Code จากเวอร์ชันเก่ามาทับ Release นี้

## ขอบเขตระบบ

- Central Krabi สาขาเดียว ผู้ใช้รวมทุกสถานะไม่เกิน 10 คน
- Role: `owner`, `admin`, `editor`, `viewer`
- Permission แบบ Role Default + Override รายบุคคล
- Supabase Auth, Profile, Permission และ Database
- Grid ข้อมูลรายวันครบทุกวันของเดือน
- ไม่อนุญาตให้กรอกหรือ Import ข้อมูลในอนาคตตาม `Asia/Bangkok`
- ย้อนกลับไปเพิ่มหรือแก้ข้อมูลในอดีตได้ หากงวดยังไม่ปิด
- สถานะงวดภาษาไทย: กำลังบันทึก, ตรวจสอบแล้ว, ปิดงวดแล้ว, เปิดแก้ไขอีกครั้ง
- Import Excel เข้าสู่ Grid พร้อม Preview, Error รายแถว และ Import History
- Data Quality Dashboard แบบ Progressive Disclosure
- Audit Log ครอบคลุม User Management และการเปลี่ยนข้อมูลธุรกิจสำคัญ
- Dashboard/Analytics รายเดือน ไตรมาส ปี และเดือนต่อเดือน
- Master Data และประวัติราคาขายเศษวัสดุ
- Export Excel, PDF, PNG และ PowerPoint
- Theme Lavender, Mint และ Rose Pink

## Repository

```text
frontend/       React + Vite
backend/        Express API + Supabase Admin
database/       SQL migrations และ smoke tests
docs/           API, acceptance tests, status และ release evidence
scripts/        dev, verify, migration check และ live E2E
render.yaml     Render Blueprint
README.md
CHANGELOG.md
VERSION
CURRENT_STATUS.md
NEXT_PHASE.md
```

## Environment Variables

Frontend ใช้ชื่อเดียว:

```env
VITE_API_BASE_URL=https://your-backend.onrender.com
```

ค่าต้องเป็น Root URL ของ Backend โดยไม่มี `/api`, `/` ท้าย, path, query หรือ hash

Backend ตัวอย่าง:

```env
NODE_ENV=development
PORT=3000
SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
SUPABASE_SERVICE_ROLE_KEY=YOUR_SECRET_KEY
CORS_ORIGIN=http://localhost:5173
ORGANIZATION_NAME=Central Krabi
```

ห้าม Commit `.env` หรือ Secret จริง

## Local Development

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
npm run install:all
npm run verify
npm run test
npm run test:e2e
npm run build
npm run dev
```

## Database Migration

### อัปเกรดจาก v2.6.0

รันตามลำดับใน Supabase SQL Editor:

```text
database/migrations/015_phase_b_data_governance.sql
database/release_2_7_0_smoke_test.sql
```

### ติดตั้งใหม่

รัน Migration `001` ถึง `015` ตามลำดับ แล้วรัน:

```text
database/release_2_7_0_smoke_test.sql
```

Migration 015 เพิ่ม:

- ตารางสถานะงวดรายเดือน
- Import History และ Error รายแถว
- Timezone Policy `Asia/Bangkok`
- Database Trigger ป้องกันวันที่อนาคต
- Database Trigger ป้องกันการแก้ข้อมูลในงวดที่ปิดแล้ว
- การเปลี่ยนงวดที่ตรวจสอบแล้วกลับเป็นกำลังบันทึกเมื่อข้อมูลถูกแก้
- Constraint น้ำหนักและราคาขายเศษวัสดุไม่เกิน 2 ตำแหน่ง

ห้ามแก้ Migration เก่าที่ Release แล้ว Migration ถัดไปต้องเริ่มจาก `016_...sql`

รายละเอียด: `database/README.md`

## สถานะงวดข้อมูล

| Internal value | ภาษาไทย | การเขียนข้อมูล |
|---|---|---|
| `draft` | กำลังบันทึก | เพิ่ม/แก้ไข/Import ได้ตาม Permission |
| `reviewed` | ตรวจสอบแล้ว | แก้ไขได้ แต่สถานะจะกลับเป็นกำลังบันทึก |
| `locked` | ปิดงวดแล้ว | เพิ่ม/แก้ไข/ลบ/Import ไม่ได้ |
| `reopened` | เปิดแก้ไขอีกครั้ง | แก้ไขได้และต้องตรวจสอบใหม่ก่อนปิดงวด |

Flow หลัก:

```text
กำลังบันทึก → ตรวจสอบแล้ว → ปิดงวดแล้ว
                                  ↓
                         เปิดแก้ไขอีกครั้ง
                                  ↓
                    ตรวจสอบใหม่ → ปิดงวดใหม่
```

- การเปิดงวดใหม่ต้องมี `reopen_periods` และระบุเหตุผล
- ปิดงวดได้เมื่อเดือนนั้นสิ้นสุดแล้วเท่านั้น
- ทุก Transition สำคัญถูกบันทึก Audit Log

## กฎวันที่

- Backend และ Database ใช้วันที่ปัจจุบันตาม `Asia/Bangkok`
- `record_date` ต้องไม่เกินวันที่ปัจจุบัน
- Daily Grid แสดงครบทุกวัน แต่วันอนาคตถูกปิดพร้อมข้อความ “ยังไม่ถึงวันที่บันทึก”
- Month Picker สำหรับการกรอกข้อมูลเลือกได้ไม่เกินเดือนปัจจุบัน
- ย้อนแก้วันหรือเดือนก่อนหน้าได้หากงวดยังไม่ `locked`
- Import แถววันที่อนาคตจะถูกแสดงเป็น Error รายแถวและไม่ถูกบันทึก

## Data Governance API

เอกสารเต็ม: `docs/PHASE_B_API.md`

Endpoint สำคัญ:

```text
GET  /api/period-status?month=YYYY-MM
POST /api/period-status/:month/transition
POST /api/import-history
GET  /api/import-history?month=YYYY-MM
GET  /api/data-quality?month=YYYY-MM
```

Error Code สำคัญ:

```text
FUTURE_DATE_NOT_ALLOWED
PERIOD_LOCKED
PERIOD_NOT_COMPLETE
PERIOD_TRANSITION_INVALID
PERMISSION_FORBIDDEN
```

## User Management และ Permission

Role เป็นค่าเริ่มต้น แต่สิทธิ์จริงคำนวณจาก:

```text
Default Permission ของ Role
+ Permission ที่อนุญาตรายบุคคล
- Permission ที่ปฏิเสธรายบุคคล
= Effective Permissions
```

Permission ที่เกี่ยวข้องกับ Phase B:

```text
review_data
lock_periods
reopen_periods
import_data
view_audit_logs
```

Frontend ซ่อนเมนูและปุ่มตาม Permission แต่ Backend เป็นผู้ตรวจสิทธิ์ขั้นสุดท้าย

รายละเอียด Phase A: `docs/PHASE_A_API.md`

## Import Excel

Flow:

```text
เลือกไฟล์ → อ่านข้อมูล → Validate → Preview → แสดง Error รายแถว
→ ผู้ใช้ยืนยัน → Backend ตรวจซ้ำ → บันทึก → เก็บ Import History
```

รองรับไฟล์ `.xlsx` และ `.xlsm` ผ่าน ExcelJS ใน Release นี้ ไฟล์ Excel รุ่นเก่า `.xls` ยังไม่รองรับโดยตรง

Import History เก็บอย่างน้อย:

- ชื่อไฟล์และ Sheet
- เดือนและหมวดข้อมูล
- จำนวนแถวทั้งหมด/ผ่าน/ผิด
- สถานะการตรวจและการบันทึก
- ผู้ Import และวันเวลา
- Error รายแถว

## Data Quality Dashboard

หน้า `คุณภาพข้อมูล` แสดง:

- เปอร์เซ็นต์ความครบถ้วนถึงวันปัจจุบัน
- จำนวนช่องที่คาดหวัง มีข้อมูลแล้ว และยังขาด
- ความครบถ้วนแยกประเภท
- วันที่ขาดหาย
- เดือนที่ผ่านมาแล้วยังไม่ปิดงวด
- ประวัติ Import ของเดือน

หน้าจอแสดงภาพรวมก่อน และใช้ส่วนพับเก็บได้สำหรับรายละเอียด เพื่อไม่ให้รก

## Health และ Readiness

```text
GET /health
GET /ready
GET /api/me
```

`/ready` ตรวจ Environment, Supabase และตาราง Phase B ที่จำเป็น เมื่อ Migration 015 ยังไม่พร้อมจะตอบสถานะไม่พร้อมใช้งาน

## Test และ Release Check

```bash
npm run install:all
npm run release:check
npm audit --prefix backend
npm audit --prefix frontend
```

`release:check` ครอบคลุม:

- Repository/Version/Secret/Internal Registry verification
- Migration sequence
- Backend tests
- Frontend tests
- Automated API integration
- Backend syntax build
- Frontend production build

ผลล่าสุดดูที่ `docs/TEST_RESULTS_2.7.0.md`

## Deployment

1. Backup หรือใช้สำเนาฐานข้อมูล UAT
2. รัน Migration 015 และ Smoke Test
3. ตั้ง Backend Environment Variables ใน Render
4. ตั้ง Frontend `VITE_API_BASE_URL`
5. ตั้ง `CORS_ORIGIN` ให้ตรง Frontend Origin
6. Deploy Backend และตรวจ `/health`, `/ready`
7. Deploy Frontend
8. Login ด้วยบัญชี Owner/Admin จริง
9. รัน Acceptance Test ใน `docs/PHASE_B_ACCEPTANCE_TEST.md`
10. รัน Live E2E ตาม `docs/LIVE_E2E.md`

## Security Notes

- Service Role Key อยู่ Backend เท่านั้น
- ห้ามใส่ Secret ใน Frontend, SQL, README หรือ Git
- การซ่อนปุ่มไม่ใช่ Authorization; Backend และ Database ต้องบังคับซ้ำ
- การปิดงวดและ Future-Date Guard ถูกป้องกันที่ Frontend, Backend และ Database
- การลบผู้ใช้ใน UI เป็น Soft Disable เพื่อรักษาข้อมูลย้อนหลัง

## Release Process

ทุก Release ต้องมี ZIP เดียว พร้อม:

```text
frontend/
backend/
database/
docs/
scripts/
render.yaml
.gitignore
README.md
CHANGELOG.md
VERSION
CURRENT_STATUS.md
NEXT_PHASE.md
```

ห้ามรวม `node_modules`, `dist`, `coverage`, `.env`, Secret, Private Key หรือไฟล์ทดลอง
