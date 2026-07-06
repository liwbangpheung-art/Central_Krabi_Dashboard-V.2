# Phase 2 Acceptance Test

## A. Database

- [ ] รัน Migration 003–005 ผ่าน
- [ ] รัน Migration ซ้ำผ่าน
- [ ] `phase2_smoke_test.sql` พบ 6 modules
- [ ] สีขยะเป็น เขียว/เหลือง/ดำ
- [ ] สีถุงขยะเป็นดำ/ชา/ดำ
- [ ] `get_scrap_price_at` คืนราคาล่าสุดที่มีผลตามวันที่

## B. Backend

- [ ] `/ready` แสดง `masterData: ok`
- [ ] Viewer อ่าน Master Data ได้
- [ ] Viewer/Editor แก้ Master Data ไม่ได้
- [ ] Admin เพิ่มและแก้ไขประเภทได้
- [ ] Duplicate code/name ตอบ 409 พร้อมข้อความ
- [ ] เพิ่มประวัติราคาได้
- [ ] ราคาใหม่ไม่ทับราคาเดิม
- [ ] ประเภทที่มีประวัติราคาลบไม่ได้

## C. Frontend

- [ ] เมนู Master Data เปิดได้
- [ ] ตารางไม่เบียดกับฟอร์มบน Desktop
- [ ] Tablet/Mobile เรียงเป็นคอลัมน์เดียว
- [ ] ไม่มี Master Data แล้วแสดง Empty State
- [ ] ทุก Action แสดง Loading/Success/Error
- [ ] ปุ่มไม่มี Silent Return
- [ ] Admin เห็นปุ่มเพิ่ม/แก้ไข/ลบ
- [ ] Viewer เห็นข้อมูลแบบ Read-only
- [ ] สีและลายกราฟแสดงในตาราง
- [ ] ราคาแสดงตามวันที่เริ่มใช้

## D. End-to-End

- [ ] Login Admin
- [ ] เพิ่มประเภทเศษวัสดุใหม่
- [ ] เพิ่มราคาแรก
- [ ] เพิ่มราคาใหม่ในวันถัดไป
- [ ] ประวัติราคามี 2 แถว
- [ ] ปิดใช้งานประเภทแล้วข้อมูลราคาไม่หาย
- [ ] ลองลบประเภทที่มีราคาแล้วได้ 409
- [ ] Logout/Login ใหม่แล้วข้อมูลยังอยู่
