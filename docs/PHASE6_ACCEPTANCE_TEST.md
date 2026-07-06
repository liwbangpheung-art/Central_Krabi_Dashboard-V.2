# Phase 6 Acceptance Test

1. รัน migrations `011_phase6_export_logs.sql` และ `012_phase6_security.sql`
2. `/ready` ต้องคืน `checks.export = ok`
3. หน้า Export โหลดข้อมูลจาก Analytics API ได้
4. เปิด/ปิดตัวเลข Legend และ Total แล้ว Preview เปลี่ยนตาม
5. Export Excel ต้องมีชีตสรุปและชีตข้อมูลกราฟ
6. Export PNG ต้องดาวน์โหลดรูป Preview
7. Export PDF ต้องคงข้อความภาษาไทยผ่านภาพ Preview
8. Export PowerPoint ต้องมีหน้าสรุปและตารางข้อมูล
9. หลัง Export สำเร็จต้องมีรายการในประวัติ Export
10. ไฟล์ทุกชนิดต้องสร้างจากข้อมูลจริงชุดเดียวกับกราฟบนหน้าเว็บ
