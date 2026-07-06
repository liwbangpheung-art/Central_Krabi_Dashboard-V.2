# Phase B Acceptance Test

## 1. Migration

1. Backup หรือ Clone ฐานข้อมูล UAT
2. รัน Migration 001–015 ตามลำดับ หรือรัน 015 ต่อจาก v2.6.0
3. รัน `database/release_2_7_0_smoke_test.sql`
4. ยืนยันว่า `/ready` ตอบพร้อมใช้งาน
5. ยืนยัน Business Timezone เป็น `Asia/Bangkok`

## 2. Daily Grid และวันที่

- เปิดเดือนปัจจุบันแล้วเห็นครบทุกวัน
- วันปัจจุบันและวันย้อนหลังกรอกได้ตาม Permission
- วันอนาคตมองเห็นแต่ช่องถูก Disable
- วันอนาคตแสดงข้อความ “ยังไม่ถึงวันที่บันทึก”
- Month Picker ไม่เลือกเดือนอนาคตสำหรับการกรอก
- เรียก Daily API ด้วยวันที่อนาคตโดยตรงแล้วได้ `FUTURE_DATE_NOT_ALLOWED`
- เขียนวันที่อนาคตตรง Database แล้ว Trigger ปฏิเสธ

## 3. ย้อนแก้ข้อมูล

- เดือนก่อนหน้าสถานะกำลังบันทึกแก้ได้
- สถานะตรวจสอบแล้วแก้ได้ตาม Permission และสถานะกลับเป็นกำลังบันทึก
- สถานะเปิดแก้ไขอีกครั้งแก้ได้
- ค่าเดิมและค่าใหม่ถูกบันทึก Audit Log

## 4. Period Lifecycle

- ผู้มี `review_data` เปลี่ยนกำลังบันทึกเป็นตรวจสอบแล้วได้
- ผู้ไม่มีสิทธิ์ Review ได้ 403
- ปิดงวดปัจจุบันก่อนสิ้นเดือนไม่ได้และได้ `PERIOD_NOT_COMPLETE`
- เดือนที่สิ้นสุดแล้วและตรวจสอบแล้วสามารถปิดงวดได้
- งวดปิดแล้วเพิ่ม แก้ไข ลบ และ Import ไม่ได้
- ผู้มี `reopen_periods` เปิดงวดใหม่ได้เมื่อระบุเหตุผล
- ไม่ระบุเหตุผลแล้วเปิดไม่ได้
- หลังเปิดแก้ไข ต้องตรวจสอบใหม่ก่อนปิดงวดอีกครั้ง
- ทุก Transition มี Audit Log

## 5. Import Excel

- `.xlsx` ที่ถูกต้อง Preview และบันทึกได้
- `.xlsm` ที่ถูกต้องอ่านได้
- แถววันที่อนาคตแสดง Error รายแถว
- แถวจำนวนเต็มที่มีทศนิยมแสดง Error
- แถว Decimal เกิน 2 ตำแหน่งแสดง Error
- แถวที่ถูกต้องยังอยู่ใน Preview เมื่อมีบางแถวผิด
- ผู้ใช้ยืนยันก่อนบันทึก Database
- งวดปิดแล้ว Import ไม่ได้
- Import History เก็บชื่อไฟล์ Sheet จำนวนแถวผ่าน/ผิด และผู้ Import
- หลังบันทึกสำเร็จ Status เปลี่ยนเป็น `committed`

## 6. Data Quality

- หน้า `คุณภาพข้อมูล` เปิดได้จาก Sidebar
- แสดงเปอร์เซ็นต์ความครบถ้วนถึงวันปัจจุบัน
- ไม่ถือวันอนาคตเป็นข้อมูลขาด
- แสดงจำนวนวันขาดแยกประเภท
- เปิดรายละเอียดวันที่ขาดได้
- แสดงประวัติ Import ของเดือน
- เดือนที่ผ่านมาแล้วยังไม่ปิดมีคำเตือน
- หน้าจอภาพรวมไม่รก และรายละเอียดอยู่ในส่วนพับเก็บได้

## 7. Scrap Sales

- วันที่อนาคตถูกปฏิเสธ
- งวดปิดแล้วสร้าง แก้ไข หรือลบไม่ได้
- Weight และ Unit Price เกิน 2 ตำแหน่งถูกปฏิเสธ
- การสร้าง แก้ไข และลบมี Audit Log

## 8. Master Data และ Price

- การเพิ่ม แก้ ปิดใช้ หรือลบตามกฎมี Audit Log
- การเปลี่ยนราคามี Audit Log
- Price History เดิมไม่ถูกเขียนทับ

## 9. Role และ Permission Regression

- Owner ใช้ User Management ได้
- Admin ที่ไม่มี `manage_users` เข้า User Management ไม่ได้
- Editor เขียนข้อมูลตาม Permission เดิมได้
- Viewer เขียนข้อมูลไม่ได้
- Frontend ซ่อนปุ่มตาม Permission
- Backend ปฏิเสธ Direct API Call ที่ไม่มี Permission

## 10. Release Verification

```bash
npm ci --prefix backend
npm ci --prefix frontend
npm run release:check
npm audit --prefix backend
npm audit --prefix frontend
```

ต้องตรวจ ZIP ว่าไม่มี `node_modules`, `dist`, `coverage`, `.env`, Secret, Private Key และ Internal Registry
