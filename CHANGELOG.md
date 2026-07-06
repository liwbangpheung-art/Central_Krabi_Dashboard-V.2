# Changelog

## 2.9.0-c7-preview

### Added
- Advanced Report Wizard preview
- Editable Slide Outline
- Per-slide Layout Selection
- Smart Readability Warning
- Template Theme System
- Mini Slide Preview
- Slide override config สำหรับ preset/report generation

### Changed
- Version bump จาก `2.8.0-c6-preview` เป็น `2.9.0-c7-preview`
- Preview Outline ใช้ advanced slide metadata เช่น `id`, `layout`, `locked`, `enabled`
- Client PowerPoint export รับ theme และ slide outline override

### Status
- Preview / Internal Review
- ยังไม่ใช่ Production release เต็ม


---

## Previous content

# Changelog

## 2.8.0-c6-preview

### Added
- Report Builder Wizard ขั้นต่ำในหน้า Export
- Preview Slide Outline ก่อนสร้าง PowerPoint
- Readability rules สำหรับ PowerPoint:
  - split table slides เมื่อข้อมูลเกิน 8 แถว
  - top 7 category breakdown
  - truncate long bullet/title
- Preview loading state และ preview card ที่อ่านง่ายขึ้น

### Changed
- Bump version จาก 2.7.0 เป็น 2.8.0-c6-preview
- ปรับฟอนต์ PowerPoint ให้ใหญ่ขึ้น
- ปรับพื้นที่กราฟและตารางให้สมส่วนขึ้น

### Status
- Internal Review / Preview release
- ยังไม่ใช่ Production release เต็ม


---

## Previous content

# Changelog

## 2.7.0 — Phase B Data Governance — 2026-07-04
- เพิ่มสถานะงวดภาษาไทย: กำลังบันทึก, ตรวจสอบแล้ว, ปิดงวดแล้ว และเปิดแก้ไขอีกครั้ง
- เพิ่ม Permission Guard สำหรับ Review, Lock และ Reopen พร้อมเหตุผลและ Audit Log
- ห้ามปิดงวดก่อนวันสุดท้ายของเดือนตาม Timezone `Asia/Bangkok`
- ป้องกันการกรอกและ Import วันที่อนาคตที่ Frontend, Backend และ Database
- Daily Grid ยังคงแสดงครบทุกวัน แต่ปิดช่องวันอนาคตพร้อมคำอธิบาย
- ป้องกันการเพิ่ม แก้ไข ลบ หรือ Import ข้อมูลในงวดที่ปิดแล้ว
- เพิ่ม Import History และรายละเอียด Error รายแถว
- เพิ่ม Data Quality Dashboard แสดงความครบถ้วน วันที่ขาด และสถานะงวด
- ขยาย Audit Log ไปยัง Daily Data, Scrap Sales, Master Data, Price และ Period Transition
- เพิ่ม Migration 015, Smoke Test, API Docs และ Acceptance Test
- เพิ่ม Constraint น้ำหนักและราคาขายเศษวัสดุไม่เกิน 2 ตำแหน่ง
- อัปเดต Next Phase เป็น Phase C Advanced Report Builder v2.8.0

## 2.6.0 — Phase A User & Permission Management
- เพิ่ม Role `owner` และ Permission แบบ Role Default + Override รายบุคคล
- เพิ่มหน้าจัดการผู้ใช้ที่แสดงตาม `manage_users`
- รองรับ Invite, Temporary Password และ Pending Account
- เพิ่มสถานะ Invited, Pending, Active, Suspended และ Disabled
- เปลี่ยนการลบผู้ใช้ในหน้าระบบเป็น Soft Disable เพื่อรักษาข้อมูลย้อนหลัง
- เพิ่ม Password Recovery, Temporary Password และ Force Change Flag
- เพิ่ม Audit Log และหน้าดูเหตุการณ์ล่าสุดแบบพับเก็บได้
- ป้องกันการเปลี่ยน Role/Permission ของตนเองและป้องกัน Owner คนสุดท้าย
- เปลี่ยน Backend Write Guards จาก Role ตายตัวเป็น Effective Permission
- เพิ่ม Migration 014, Smoke Test, API Docs และ Acceptance Test
- อัปเดต Next Phase ให้ใช้สถานะงวดภาษาไทยและห้ามกรอกข้อมูลล่วงหน้า

## 2.5.2 — Repository Hardening & Data Rules
- จัด Repository และเอกสาร Release ให้ครบ พร้อม CURRENT_STATUS.md และ NEXT_PHASE.md ที่ Root และ docs
- เปลี่ยน Frontend Environment Variable เป็น `VITE_API_BASE_URL` และบังคับ URL รากที่ไม่มี `/api` หรือ `/` ท้าย
- เพิ่ม CORS exact-origin validation และ Automated Integration Tests
- เพิ่มการตรวจ Supabase Token, Profile, Active Status และ Role ผ่าน `/api/me`
- เพิ่ม Live E2E Script สำหรับ Render + Supabase โดยไม่เก็บ Secret
- เพิ่ม Import Excel ข้อมูลรายวันเข้าสู่ Grid ก่อนบันทึก
- บังคับ Tissue, ถุงขยะ, สบู่โฟม และน้ำยาเช็ดฝาโถเป็นจำนวนเต็ม
- บังคับข้อมูลน้ำหนักรายวันเป็นทศนิยมไม่เกิน 2 ตำแหน่ง
- เพิ่ม Migration 013 และ Database Trigger สำหรับ Quantity Policy
- เพิ่ม Migration sequence check, Secret scan และ Internal Registry check
- อัปเดต API health version เป็น 2.5.2

## 2.5.1 — Frontend Stability Hotfix
- แก้ Dashboard ล่มระหว่างรอข้อมูล Analytics เมื่อ `comparison` ยังเป็น `null/undefined`
- แก้หน้า Analytics และ Export ล่มด้วยสาเหตุเดียวกัน
- เพิ่มฟังก์ชันแสดงเปอร์เซ็นต์เปรียบเทียบแบบ null-safe
- เพิ่ม Unit Test ครอบคลุมกรณีข้อมูลยังโหลดไม่เสร็จและไม่มีฐานเปรียบเทียบ
- เพิ่มคู่มือแก้ `VITE_API_BASE_URL` และ CORS สำหรับ Render

## 2.5.0 — Phase 6
- เพิ่ม Export Center
- Export Excel ด้วย ExcelJS
- Export PDF จาก Preview เพื่อรักษาข้อความภาษาไทย
- Export PNG ความละเอียดสูง
- Export PowerPoint พร้อมสไลด์สรุปและตาราง
- เพิ่มประวัติการ Export และ Audit Trail
- ใช้ตัวกรองและการตั้งค่ากราฟเดียวกับ Analytics