# Phase C.6 — Enterprise Reporting Completion

เพิ่มความสามารถสาย Enterprise สำหรับ PowerPoint Report Builder ต่อจาก Phase C.4–C.5

## สิ่งที่เพิ่ม

### 1. Backend-generated PowerPoint

เพิ่ม endpoint:

```text
POST /api/reports/powerpoint
```

Backend จะโหลดข้อมูลจาก Analytics/Daily/Scrap Sales, สร้าง PowerPoint ด้วย `pptxgenjs`, บันทึก Export Log, Report Run และ Report File แล้วส่ง signed download URL กลับให้ผู้ใช้

### 2. เก็บไฟล์รายงานใน Supabase Storage

เพิ่ม migration:

```text
database/migrations/018_phase_c6_report_files_storage.sql
```

เพิ่ม bucket:

```text
report-files
```

เพิ่มตาราง:

```text
report_files
```

เก็บ metadata:

- report_run_id
- export_log_id
- bucket/object_path
- file_name
- mime_type
- file_size_bytes
- sha256
- generated_by
- created_at

### 3. ดาวน์โหลดไฟล์ย้อนหลัง

เพิ่ม endpoint:

```text
GET  /api/report-files
POST /api/report-files/:id/download
```

ระบบใช้ signed URL อายุ 10 นาที จึงไม่เปิด public file โดยตรง

### 4. Rate Limit / Hardening

เพิ่ม `express-rate-limit`

Default:

```text
/api = 300 requests / 15 min
/api/users, /api/report-presets, /api/reports/powerpoint = 60 requests / 15 min
```

ตั้งค่าได้ด้วย environment variables:

```text
RATE_LIMIT_WINDOW_MINUTES
RATE_LIMIT_MAX_REQUESTS
SENSITIVE_RATE_LIMIT_WINDOW_MINUTES
SENSITIVE_RATE_LIMIT_MAX_REQUESTS
```

### 5. Frontend UI

หน้า Export เพิ่มปุ่ม:

```text
สร้างด้วย Backend + เก็บไฟล์
```

และเพิ่ม panel:

```text
ไฟล์รายงานที่เก็บไว้ล่าสุด
```

สามารถกดดาวน์โหลดไฟล์ย้อนหลังผ่าน signed URL ได้

## ต้องรัน migration

ให้รันตามลำดับ:

```text
016_phase_c3_report_presets.sql
017_phase_c5_report_runs.sql
018_phase_c6_report_files_storage.sql
```

จากนั้นตรวจ `/ready` ต้องเห็น:

```json
{
  "reportPresets": "ok",
  "reportRuns": "ok",
  "reportFiles": "ok",
  "reportStorage": "ok"
}
```

## Environment ใหม่

```text
REPORT_STORAGE_BUCKET=report-files
RATE_LIMIT_WINDOW_MINUTES=15
RATE_LIMIT_MAX_REQUESTS=300
SENSITIVE_RATE_LIMIT_WINDOW_MINUTES=15
SENSITIVE_RATE_LIMIT_MAX_REQUESTS=60
```

## ข้อจำกัดที่ยังเหลือ

- Backend-generated PowerPoint ยังเป็น template มาตรฐาน Enterprise ไม่ใช่ template designer แบบลากวาง
- Smart Insight ยังเป็น rule-based analysis ไม่ได้ต่อ LLM/AI ภายนอก
- Auto Monthly Report ยังต้องใช้ scheduler ภายนอกหรือ phase ถัดไป
