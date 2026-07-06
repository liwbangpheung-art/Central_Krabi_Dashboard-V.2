# Current Status — v2.7.0

สถานะ: **Phase B Data Governance พร้อมทดสอบ UAT**

วันที่จัดทำ Release: 4 กรกฎาคม 2569

## ทำงานแล้ว

- รักษา Feature Phase 1–6, Repository Hardening และ Phase A จาก v2.6.0
- เพิ่มสถานะงวดรายเดือนเป็นภาษาไทย:
  - กำลังบันทึก
  - ตรวจสอบแล้ว
  - ปิดงวดแล้ว
  - เปิดแก้ไขอีกครั้ง
- เพิ่ม Review/Lock/Reopen แบบเบา พร้อม Permission และ Audit Log
- การเปิดแก้ไขอีกครั้งต้องระบุเหตุผล
- ไม่อนุญาตให้ปิดงวดก่อนสิ้นเดือน
- ใช้วันที่ปัจจุบันตาม `Asia/Bangkok`
- ไม่อนุญาตให้กรอกหรือ Import วันที่ในอนาคต
- Daily Grid แสดงครบทุกวัน แต่วันอนาคตถูก Disable
- ย้อนเพิ่มหรือแก้ข้อมูลเก่าได้หากงวดยังไม่ปิด
- งวดที่ปิดแล้วถูกป้องกันทั้ง Backend และ Database Trigger
- เพิ่ม Import History และรายละเอียด Error รายแถว
- Import Preview เก็บแถวที่ถูกต้องไว้ให้ตรวจ แม้บางแถวผิด
- เพิ่ม Data Quality Dashboard แบบภาพรวมก่อนรายละเอียด
- แสดงความครบถ้วน วันที่ขาด ประเด็นที่ควรตรวจ และ Import History ของเดือน
- ขยาย Audit Log ไปยัง Daily Data, Master Data, Price, Scrap Sales และ Period Transition
- เพิ่ม Migration ต่อเนื่องถึง 015
- เพิ่ม Readiness Check สำหรับตาราง Phase B

## Tests

- Backend automated tests: 62 tests ผ่าน
- Frontend automated tests: 31 tests ผ่าน
- Automated API integration: 40 tests ผ่าน
- Backend syntax check: ผ่าน
- Frontend production build: ผ่าน
- `npm ci`: ผ่านทั้ง Backend และ Frontend
- Dependency audit: 0 vulnerabilities จากการติดตั้งล่าสุด
- Migration sequence: 001–015 ต่อเนื่อง
- Secret/Internal Registry verification: ผ่าน

รายละเอียดหลักฐาน: `docs/TEST_RESULTS_2.7.0.md`

## Database

Migration ล่าสุด:

```text
015_phase_b_data_governance.sql
```

Smoke test:

```text
release_2_7_0_smoke_test.sql
```

ต้องทดสอบ Migration 015 บนสำเนาฐานข้อมูล UAT ก่อน Production โดยเฉพาะข้อมูล Scrap Sales เดิมที่อาจมีทศนิยมเกิน 2 ตำแหน่ง

## Deployment Status

- Source, tests และ production build พร้อมสำหรับ UAT
- ยังไม่ได้รัน Migration 015 กับ Supabase จริง
- ยังไม่ได้ทดสอบ Period Trigger กับข้อมูล Production/UAT จริง
- ยังไม่ได้รัน Live E2E กับ Render + Supabase จริง เนื่องจากไม่มี URL และ Credential ใน Release

## Known Limitations

- Data Quality v2.7.0 ตรวจความครบถ้วนของข้อมูลรายวันและสถานะงวดเป็นหลัก ยังไม่ใช่ AI Anomaly Detection
- Import History เก็บ Metadata และ Error รายแถว แต่ไม่ได้เก็บไฟล์ต้นฉบับใน Supabase Storage
- Legacy Excel `.xls` ยังไม่รองรับโดยตรง; รองรับ `.xlsx` และ `.xlsm`
- การปิดงวดตรวจว่าสิ้นเดือนแล้ว แต่ยังไม่ได้บังคับว่าความครบถ้วนต้อง 100%; ผู้มีสิทธิ์ต้องตรวจ Data Quality ก่อนปิดงวด
- Build มี Warning เรื่อง Chunk ขนาดใหญ่จาก ExcelJS/PptxGenJS แต่ Build สำเร็จ
- Live Invite/Password Recovery จาก Phase A ยังต้องทดสอบ SMTP จริง

## งานถัดไป

Phase C v2.8.0:

- Advanced Report Builder
- รวมหลายหมวดในรายงานเดียว
- PowerPoint หลายสไลด์
- PDF หลายหน้า
- Template และ Saved Report Presets
- จัดลำดับสไลด์
- Report History
- Wizard/Progressive Disclosure เพื่อคง UI ที่ใช้งานง่ายและไม่รก
