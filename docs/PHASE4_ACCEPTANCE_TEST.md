# Phase 4 Acceptance Test

## Database

- [ ] รัน Migration 008 และ 009 ผ่าน
- [ ] `phase4_smoke_test.sql` พบตาราง `scrap_sales`
- [ ] `/ready` แสดง `scrapSales: ok`

## Permission

- [ ] Admin เพิ่ม/แก้ไข/ลบได้
- [ ] Editor เพิ่ม/แก้ไข/ลบได้
- [ ] Viewer ดูได้ แต่ไม่เห็นฟอร์มและปุ่มแก้ไข/ลบ

## Price Snapshot

- [ ] เลือกประเภทและวันที่แล้วค้นหาราคาได้
- [ ] ผู้ใช้แก้ราคาจริงได้
- [ ] เปลี่ยนประวัติราคาภายหลังแล้วรายการเก่าไม่เปลี่ยน
- [ ] จำนวนเงินตรงกับน้ำหนัก × ราคาจริง

## UI

- [ ] เลือกเดือนได้
- [ ] ฟอร์มไม่เบียดกันที่ 1366px, 1024px และ Mobile
- [ ] ทุกปุ่มมี Loading/Success/Error
- [ ] กรอกข้อมูลไม่ครบแล้วมีข้อความ ไม่กดแล้วเงียบ
- [ ] ตารางแสดงยอดรวมรายเดือน
- [ ] ประเภทปิดใช้งานยังมีชื่อในรายการย้อนหลัง

## Regression

- [ ] Login/Role ยังทำงาน
- [ ] Master Data ยังทำงาน
- [ ] Daily Entry ยังทำงาน
- [ ] `npm run verify`, `npm run test`, `npm run build` ผ่าน
