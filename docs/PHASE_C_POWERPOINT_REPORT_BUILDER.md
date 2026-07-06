# Phase C — PowerPoint Report Builder

## เป้าหมาย
เพิ่มความสามารถให้หน้า Export สร้างไฟล์ PowerPoint หลายสไลด์ โดยผู้ใช้เลือกข้อมูลที่จะใส่รายงานได้ เช่น ขยะ, ทิชชู่, อาหารสัตว์, ถุงขยะ, วัสดุสิ้นเปลือง และขายเศษวัสดุ

## สิ่งที่เพิ่มแล้ว

### Frontend
- เพิ่มโหมด `PowerPoint Report Builder` ใน `frontend/src/pages/ExportPage.jsx`
- เลือก Template รายงานได้ 3 แบบ
  - รายงานผู้บริหาร
  - รายงานปฏิบัติการ
  - รายงานตรวจสอบข้อมูล
- เลือกช่วงเวลาได้ตาม Analytics เดิม
  - รายเดือน
  - รายไตรมาส
  - รายปี
  - เดือนต่อเดือน
- เลือกข้อมูลหลาย Module ได้พร้อมกัน
  - ขยะ
  - ทิชชู่
  - อาหารสัตว์
  - ถุงขยะ
  - วัสดุสิ้นเปลือง
  - ขายเศษวัสดุ
- เลือกส่วนประกอบของสไลด์ได้
  - หน้าปก
  - Executive Summary
  - กราฟแยกตามข้อมูล
  - สัดส่วนรายหมวด
  - บทวิเคราะห์อัตโนมัติ
  - ตารางข้อมูล
  - ข้อเสนอแนะ
- Preview ข้อมูลก่อนสร้าง PowerPoint
- สร้างไฟล์ `.pptx` หลายสไลด์ด้วย `pptxgenjs`
- บันทึก Export Log ผ่าน API เดิม

### Report Logic
เพิ่มไฟล์ `frontend/src/lib/report-builder.js`

ความสามารถหลัก:
- ดึงข้อมูล Analytics API หลาย Module ตามที่ผู้ใช้เลือก
- สร้าง Executive Summary
- วิเคราะห์แนวโน้มเทียบช่วงก่อนหน้า
- หาหมวดที่มีสัดส่วนสูงสุด
- หาช่วงที่มีค่าสูงสุด
- สร้างข้อเสนอแนะตามประเภทข้อมูล
- สร้าง PowerPoint หลายสไลด์

## โครงสร้างสไลด์ที่สร้างได้
1. หน้าปก
2. Executive Summary
3. KPI + กราฟราย Module
4. สัดส่วนรายหมวด + ข้อเสนอแนะราย Module
5. ตารางข้อมูลราย Module (ถ้าเลือก)
6. ข้อเสนอแนะรวม

จำนวนสไลด์จะเพิ่มตามจำนวน Module ที่เลือก

ตัวอย่าง:
- เลือก ขยะ + ทิชชู่ + ขายเศษวัสดุ
- เปิดสัดส่วนรายหมวดและตารางข้อมูล
- จะได้ประมาณ 1 + 1 + (3 x 3) + 1 = 12 สไลด์

## ข้อจำกัดของ MVP นี้
- ยังเลือก Category ย่อยเฉพาะบางตัวไม่ได้ เพราะ Analytics API เดิมยังดึงทั้ง Module
- ยังไม่มี Saved Presets ลงฐานข้อมูล
- กราฟใน PowerPoint ใช้กราฟวาดด้วย shape เพื่อความเสถียรใน Browser ก่อน ไม่ได้ใช้ native PowerPoint chart object
- Data Quality slide แบบละเอียดควรต่อเพิ่มจาก `/api/data-quality` ใน Phase C.2

## สิ่งที่ควรทำต่อ Phase C.2
1. เพิ่ม Category Filter ใน Analytics API
2. เพิ่ม Data Quality Slide โดยดึงข้อมูลจาก API งวด
3. เพิ่มตาราง `report_presets`
4. เพิ่ม Saved / Load / Share Preset
5. เพิ่ม Template สีและ Layout แบบผู้บริหาร
6. เพิ่ม Native PowerPoint Chart เมื่อยืนยันความเข้ากันได้ของ `pptxgenjs` ใน Browser แล้ว

## Phase C.2 — Report Builder Essentials

เพิ่มจาก MVP รอบแรก:

- เลือกชนิดกราฟใน PowerPoint ได้: กราฟแท่งหรือกราฟเส้น
- เลือกหมวดย่อยรายโมดูลได้ เช่น เลือกเฉพาะ Recycle/RDF หรือเลือกเฉพาะทิชชู่บางประเภท
- เพิ่ม Data Quality slide สำหรับรายงานรายเดือนและเดือนต่อเดือน
- เพิ่ม Preview ที่แสดง Data Quality ก่อนสร้างไฟล์
- เพิ่ม Saved Presets แบบ localStorage เพื่อบันทึกชุดการตั้งค่ารายงานโดยยังไม่เพิ่มฐานข้อมูล
- บันทึก Export Log พร้อม options เพิ่มเติม เช่น chartType และ categorySelection
- ป้องกันการสร้าง PowerPoint จาก preview เก่า โดยระบบจะโหลด report ใหม่ทุกครั้งก่อน export

### หมายเหตุ

Saved Presets รอบนี้เก็บในเครื่องผู้ใช้ผ่าน `localStorage` เพื่อให้ใช้งานได้ทันทีโดยไม่เพิ่ม migration ใหม่ หากต้องการแชร์ preset ระหว่างทีม ควรทำ Phase C.3 โดยเพิ่มตาราง `report_presets` และ API สำหรับบันทึก/แชร์ preset บนฐานข้อมูล

### การทดสอบ

ทดสอบ frontend production build แล้วด้วยคำสั่ง:

```bash
cd frontend
npm ci --ignore-scripts
npm run build
```

ผลลัพธ์: build ผ่าน มีเฉพาะคำเตือน chunk size จาก dependency export/report ที่มีขนาดใหญ่ ซึ่งเป็น warning เดิมจากไลบรารี Excel/PowerPoint/PDF

## Phase C.3 — Enterprise Saved Presets

เพิ่มจาก Phase C.2 เพื่อให้ Report Builder ใช้งานแบบทีม/องค์กรได้จริง ไม่ใช่บันทึกเฉพาะในเครื่องผู้ใช้

### สิ่งที่เพิ่ม

- เพิ่มตาราง `report_presets` สำหรับบันทึก Saved Report Presets ลงฐานข้อมูล
- เพิ่ม API สำหรับจัดการ Preset:
  - `GET /api/report-presets`
  - `POST /api/report-presets`
  - `PATCH /api/report-presets/:id`
  - `DELETE /api/report-presets/:id`
- รองรับ Preset 2 ระดับ:
  - `private` ใช้ส่วนตัว เจ้าของเห็นและจัดการได้
  - `team` แชร์ให้ทีมเห็นร่วมกัน ต้องมี permission `manage_report_presets` ในการสร้าง/แก้เป็น team preset
- บันทึก Audit Log เมื่อสร้าง/แก้ไข/ลบ Preset
- ปรับหน้า Export ให้โหลด Preset จาก backend
- ยังมี fallback อ่าน localStorage เดิม ถ้า backend ยังไม่ได้รัน Migration 016
- ปรับ `/ready` ให้ตรวจตาราง `report_presets` และแจ้งเตือนถ้ายังไม่ได้รัน Migration 016

### Migration ใหม่

ไฟล์:

```text
 database/migrations/016_phase_c3_report_presets.sql
```

ตารางใหม่:

```text
report_presets
- id
- name
- description
- owner_id
- visibility: private | team
- config: jsonb
- created_at
- updated_at
```

### Permission

ใช้ permission เดิมที่ระบบเตรียมไว้แล้ว:

```text
manage_report_presets
```

กฎการใช้งาน:

- ผู้ใช้ที่มี `export_reports` สามารถสร้าง private preset ของตัวเองได้
- ผู้ใช้ที่มี `manage_report_presets` สามารถสร้าง/แก้/ลบ team preset ได้
- Owner เห็นและจัดการได้ทั้งหมดตาม permission model เดิม
- Admin ได้ `manage_report_presets` ตาม role default เดิม

### การทดสอบ

ทดสอบแล้ว:

```bash
cd backend
npm ci --ignore-scripts
npm run build

cd ../frontend
npm ci --ignore-scripts
npm run build
```

ผลลัพธ์:

- Backend syntax check ผ่าน
- Frontend production build ผ่าน
- ยังมี Vite warning เรื่อง chunk size จาก dependency export/report ซึ่งเป็น warning เดิมจาก Excel/PowerPoint/PDF libraries

### ขั้นตอนก่อน Deploy/UAT

หลังนำ ZIP นี้ไปใช้ ให้รัน migration ใหม่บน Supabase:

```sql
-- run database/migrations/016_phase_c3_report_presets.sql
```

จากนั้นตรวจ readiness:

```text
GET /ready
```

ควรเห็น:

```json
"reportPresets": "ok"
```

## Phase C.4 — Native Editable PowerPoint Charts

เพิ่มโหมดกราฟใน PowerPoint Report Builder:

- `Native chart แก้ไขได้`: สร้างกราฟเป็น PowerPoint chart object เพื่อให้เปิดใน PowerPoint แล้วแก้ข้อมูล/รูปแบบกราฟต่อได้
- `Shape chart เสถียรสูง`: ใช้กราฟแบบวาดด้วย shape เหมาะกับเครื่อง/เวอร์ชัน PowerPoint ที่ต้องการความนิ่งสูง

ระบบจะ fallback เป็น shape chart อัตโนมัติถ้า browser หรือ `pptxgenjs` ไม่รองรับ native chart ในบางสถานการณ์

## Phase C.5 — Report Run Metadata

เพิ่ม migration ใหม่:

```text
017_phase_c5_report_runs.sql
```

เพิ่มตาราง:

```text
report_runs
```

ใช้เก็บประวัติการสร้างรายงานระดับ report run เช่น:

- ชื่อรายงาน
- ช่วงเวลา
- config ที่ใช้สร้าง
- จำนวนสไลด์
- จำนวน native charts / shape charts
- export log ที่เกี่ยวข้อง
- ผู้สร้างรายงาน
- เวลา generated_at

API ใหม่:

```text
GET  /api/report-runs
POST /api/report-runs
```

หมายเหตุ: รอบนี้ยังไม่ได้เก็บไฟล์ `.pptx` ใน Supabase Storage แต่เก็บ metadata ของการสร้างรายงานไว้เพื่อ audit และต่อยอดเป็น file storage ใน Phase ถัดไป
