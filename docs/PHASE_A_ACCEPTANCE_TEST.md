# Phase A Acceptance Test

## Migration

1. รัน Migration 001–014 ตามลำดับ
2. รัน `database/release_2_6_0_smoke_test.sql`
3. ยืนยันว่ามี Permission อย่างน้อย 21 รายการ
4. หากมีผู้ใช้แล้ว ต้องมี Owner ที่ใช้งานได้อย่างน้อย 1 คน

## Owner

- Login สำเร็จ
- เห็นเมนู `จัดการผู้ใช้งาน`
- เปิดรายชื่อผู้ใช้ได้
- เพิ่มผู้ใช้ด้วย Invite ได้
- เพิ่มผู้ใช้ด้วยรหัสผ่านชั่วคราวได้
- เตรียมบัญชี Pending ได้
- เปลี่ยน Role ของผู้ใช้อื่นได้
- กำหนด Permission Override ได้
- ปิดใช้งานบัญชีอื่นได้
- เปิดดูประวัติการจัดการได้
- เปลี่ยน Role หรือปิดบัญชีตัวเองไม่ได้

## Admin

- Admin ปกติยังจัดการ Master Data, ราคา, Daily Data และ Scrap Sales ตาม Default Permission
- Admin ที่ไม่มี `manage_users` ไม่เห็นเมนูจัดการผู้ใช้
- เรียก `/api/users` โดยตรงแล้วได้ 403
- Owner สามารถเพิ่ม `manage_users` ให้ Admin รายบุคคลได้
- Admin ที่ได้รับเฉพาะ `manage_users` แต่ไม่มี `manage_admins` แก้ Owner หรือแต่งตั้ง Admin ไม่ได้

## Editor และ Viewer

- Editor เพิ่ม/แก้ข้อมูลตาม Permission เดิมได้
- Viewer เขียนข้อมูลไม่ได้
- Editor/Viewer ไม่เห็นเมนูจัดการผู้ใช้โดยค่าเริ่มต้น

## Password

- Invite ส่งคำเชิญได้เมื่อ SMTP/Redirect ของ Supabase ตั้งค่าถูกต้อง
- Temporary password ต้องผ่านกฎความแข็งแรง
- Reset email ส่งได้เมื่อ Supabase Email Provider พร้อม
- ผู้ดูแลไม่เห็นรหัสผ่านปัจจุบัน

## Audit

- สร้างผู้ใช้มี `user.created`
- แก้ผู้ใช้มี `user.updated`
- ปิดบัญชีมี `user.disabled`
- จัดการรหัสผ่านมี `user.password.*`

## Security

- Frontend ซ่อนเมนูตาม Permission
- Backend ตรวจ Permission ทุก Endpoint
- Supabase RLS ไม่อนุญาตให้ Client แก้ Profile หรือ Permission โดยตรง
- Owner คนสุดท้ายถูกป้องกันด้วย Database Trigger
