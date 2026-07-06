# PowerPoint Readability + Preview Patch

ปรับ PowerPoint Report Builder เพื่อให้ไฟล์นำเสนอใช้งานจริงได้ดีขึ้น

## สิ่งที่ปรับ

### PowerPoint
- เพิ่มขนาดหัวข้อสไลด์
- เพิ่มขนาด subtitle/footer
- เพิ่มขนาด KPI card
- เพิ่มขนาดตัวเลข KPI
- เพิ่มขนาด label/value ในกราฟ shape
- เพิ่มขนาด axis label/data label ใน native PowerPoint chart
- ขยายพื้นที่กราฟในสไลด์รายโมดูล
- เพิ่มขนาดตารางใน PowerPoint

### Preview
- เพิ่ม loading state สำหรับ Preview
- เพิ่มข้อความบอกว่า Preview ใช้ข้อมูลชุดเดียวกับ PowerPoint
- เพิ่มขนาดตัวหนังสือใน preview card
- เพิ่มจำนวนหมวดย่อยและช่วงข้อมูลใน preview เพื่อให้ตรวจสอบก่อนสร้างไฟล์ได้ง่ายขึ้น

## ไฟล์ที่แก้
- frontend/src/lib/report-builder.js
- frontend/src/pages/ExportPage.jsx
- frontend/src/styles.css

## ทดสอบ
- frontend: npm ci --ignore-scripts && npm run build ผ่าน
- backend: npm ci --ignore-scripts && npm run build ผ่าน
