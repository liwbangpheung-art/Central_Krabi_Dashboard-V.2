# Test Results — v2.6.0

วันที่ทดสอบ: 3 กรกฎาคม 2569

## Dependency Installation

- Backend `npm ci`: ผ่าน, 0 vulnerabilities
- Frontend `npm ci`: ผ่าน, 0 vulnerabilities

## Automated Tests

- Backend: 53/53 ผ่าน
- Frontend: 28/28 ผ่าน
- Automated API integration (`test:e2e`): 35/35 ผ่าน

Backend ครอบคลุม:

- Auth Token, Profile, Role และ Permission
- Owner User Management
- Admin ที่ไม่มี `manage_users` ถูกปฏิเสธ
- Temporary Password
- Self Role Change Protection
- Permission Override
- Soft Disable
- Feature เดิม Phase 1–6

Frontend ครอบคลุม:

- Environment Configuration
- Daily Entry และ Import
- Analytics และ Export Helpers
- Permission Helpers และป้ายภาษาไทย

## Build

- Backend syntax check: ผ่าน
- Frontend Production Build: ผ่าน
- มี Warning เรื่อง Chunk ขนาดใหญ่จาก ExcelJS/PptxGenJS ซึ่งไม่ทำให้ Build ล้มเหลว

## Not Executed

- Live E2E กับ Render + Supabase จริง
- Supabase SMTP Invite/Recovery จริง
- Migration 014 กับสำเนาฐานข้อมูล Production/UAT
