# Next Phase after C7 Preview

## สิ่งที่ควรทำต่อ

1. ทำให้ backend report-generator ใช้ slideOutlineOverrides ครบเท่า frontend
2. เพิ่ม unit tests:
   - buildReportSlideOutline
   - applySlideOutlineOverrides
   - buildReadabilityWarnings
3. เพิ่ม thumbnail preview ใกล้ PowerPoint จริงมากขึ้น
4. เพิ่ม drag-and-drop outline แทนปุ่มขึ้น/ลง
5. เพิ่ม preset management แบบเต็ม:
   - duplicate
   - edit
   - set default
   - preview before apply
6. เพิ่ม report run detail page:
   - status per section
   - error per section
   - download history
7. ทำ Live E2E กับ Supabase + Storage


---

## Previous content

# Next Phase

## Phase C6 Preview Hardening — Remaining

1. เพิ่ม unit tests สำหรับ `frontend/src/lib/report-builder.js`
2. เพิ่ม unit tests สำหรับ `backend/src/domain/report-generator.js`
3. สร้างตัวอย่าง PowerPoint output สำหรับรีวิว readability
4. ทำ Live E2E กับ Render + Supabase จริง
5. ตรวจความเท่ากันของ Frontend Preview Outline กับ Backend-generated PowerPoint
6. เพิ่ม error handling ราย section เช่น สไลด์ขยะสำเร็จ แต่สไลด์ทิชชู่ล้มเหลว
7. เตรียม UAT checklist สำหรับผู้ใช้จริง


---

## Previous content

# Next Phase — Phase C Advanced Report Builder

Suggested version: **v2.8.0**

## เป้าหมาย

ยกระดับระบบ Export เดิมให้เป็น Report Builder ที่รวมผลวิเคราะห์หลายหมวดไว้ในไฟล์เดียวได้ โดยผู้ใช้ทั่วไปสร้างรายงานได้ง่ายจาก Template และผู้ใช้ขั้นสูงสามารถปรับรายละเอียดเพิ่มได้โดยไม่ทำให้หน้าจอรก

## หลัก UX

```text
ใช้ง่ายก่อน ปรับละเอียดภายหลัง
```

- ใช้ Wizard และ Progressive Disclosure
- มีค่าเริ่มต้นที่เหมาะสม
- ไม่แสดงตัวเลือกทั้งหมดในหน้าเดียว
- มีโหมดแนะนำและโหมดกำหนดเอง
- มี Preview โครงสร้างรายงานก่อนสร้างไฟล์
- ห้ามสร้างภาพ Mockup/Preview ภายนอกจนกว่าจะได้รับคำสั่ง

## Scope

1. Report Builder กลางสำหรับ Excel, PDF, PNG และ PowerPoint
2. เลือกช่วงข้อมูล: เดือน ไตรมาส ปี หรือช่วงกำหนดเองตามที่รองรับ
3. เลือกหลายหมวดในรายงานเดียว
4. PowerPoint หลายสไลด์ และหนึ่งหมวดมีได้หลายสไลด์
5. PDF หลายหน้าโดยใช้ลำดับเดียวกับ Report Outline
6. Template สำเร็จรูป
7. Drag-and-drop หรือปุ่มจัดลำดับเนื้อหา
8. Saved Report Presets แบบส่วนตัวและส่วนกลาง
9. Report History
10. ตรวจ Permission สำหรับ Export, Preset และ Report History
11. ใช้ข้อมูลที่ปิดงวดแล้วเป็นค่าเริ่มต้นสำหรับรายงานทางการ
12. แสดงคำเตือนเมื่อสร้างรายงานจากงวดที่ยังไม่ปิด

## Template ที่ควรมี

- รายงานประจำเดือน
- รายงานประจำไตรมาส
- รายงานประจำปี
- รายงานสำหรับผู้บริหาร
- รายงานขยะ
- รายงานวัสดุสิ้นเปลือง
- รายงานเศษวัสดุและรายได้
- รายงานแบบกำหนดเอง

## ตัวอย่าง PowerPoint

```text
Slide 1  หน้าปก
Slide 2  Executive Summary
Slide 3  ภาพรวมขยะ
Slide 4  แนวโน้ม/เปรียบเทียบขยะ
Slide 5  การใช้ทิชชู่รายวัน
Slide 6  สรุปทิชชู่ Week 1–5
Slide 7  ถุงขยะแยกสีและขนาด
Slide 8  สบู่โฟมและน้ำยาเช็ดฝาโถ
Slide 9  เศษวัสดุและรายได้
Slide 10 สรุปแนวโน้มและข้อสังเกต
```

ระบบต้องเพิ่มหรือลดจำนวนสไลด์ตามข้อมูลจริง และไม่บีบหลายกราฟลงสไลด์เดียวจนอ่านยาก

## Wizard ที่แนะนำ

```text
1. เลือกช่วงข้อมูล
2. เลือก Template
3. เลือกหมวด
4. จัดลำดับเนื้อหา
5. ตรวจสอบโครงสร้าง
6. สร้างไฟล์
```

โหมดแนะนำต้องสร้างรายงานมาตรฐานได้โดยไม่ต้องตั้งค่าทุกตัวเลือก

## Database

Migration ถัดไปต้องเริ่มจาก:

```text
016_phase_c_report_builder.sql
```

ควรมีอย่างน้อย:

- `report_presets`
- `report_runs` หรือ Report History
- Owner/visibility ของ Preset
- Report format, period, sections และ ordering
- Status: queued/generating/completed/failed ตามรูปแบบการทำงานจริง
- Audit indexes และ RLS

ห้ามเก็บไฟล์ขนาดใหญ่ใน Database โดยตรง หากต้องเก็บไฟล์ให้ใช้ Storage และกำหนด Retention ชัดเจน

## Frontend

- หน้า Report Builder แบบ Wizard
- Card เลือก Template พร้อมคำอธิบายสั้น
- Card เลือกหมวดพร้อมสถานะว่ามีข้อมูลหรือไม่
- Outline รายงานที่จัดลำดับได้
- Advanced Settings แบบพับเก็บ
- Preview เฉพาะโครงสร้างและ Summary ไม่ต้อง Render ไฟล์เต็มก่อน Export
- Status ระหว่างสร้างไฟล์ที่เข้าใจง่าย
- รองรับ Desktop และ Tablet

## Backend

- Validate Report Definition
- ตรวจ Permission และ Period Status
- Query ข้อมูลจากแหล่งเดียวกับ Analytics
- สร้าง Report Manifest ที่ทุก Format ใช้ร่วมกัน
- บันทึก Report History และ Audit Log
- Error ราย Section เพื่อให้รู้ว่าหมวดใดสร้างไม่สำเร็จ
- ป้องกันไฟล์/คำสั่งที่ผู้ใช้ส่งเข้ามาโดยตรง

## Permission ที่ควรใช้

```text
export_reports
manage_report_presets
view_report_history
```

Preset ส่วนกลางต้องสร้างหรือแก้ได้เฉพาะผู้มี `manage_report_presets`

## Acceptance Criteria

- สร้างรายงานจาก Template มาตรฐานได้ภายในขั้นตอนไม่มาก
- รวมขยะและทิชชู่ใน PowerPoint เดียวได้
- หนึ่งหมวดสร้างหลายสไลด์ได้
- ผู้ใช้จัดลำดับสไลด์ได้ แต่ไม่จำเป็นต้องจัดเองทุกครั้ง
- PDF ใช้ลำดับเนื้อหาเดียวกับ PowerPoint
- PNG Export เฉพาะ Section/Chart ที่เลือก ไม่สร้างภาพยาวรก
- Excel ใช้ชนิดข้อมูลตัวเลข/วันที่ถูกต้อง
- ภาษาไทยไม่แตกใน PDF และ PowerPoint
- Preset บันทึกและนำกลับมาใช้ซ้ำได้
- Report History ระบุผู้สร้าง ช่วงข้อมูล Template หมวด Format และผลลัพธ์
- งวดที่ยังไม่ปิดมีคำเตือนชัดเจน
- UI ไม่มี Modal ซ้อน Modal และไม่แสดงตัวเลือกจำนวนมากพร้อมกัน
- Frontend, Backend, Database และ Tests ผ่านทั้งหมด

## Out of Scope

- Scheduled Report อัตโนมัติ
- Email Distribution จำนวนมาก
- Multi-branch/Multi-tenant
- Collaborative Slide Editing
- AI เขียนบทวิเคราะห์อัตโนมัติเต็มรูปแบบ
