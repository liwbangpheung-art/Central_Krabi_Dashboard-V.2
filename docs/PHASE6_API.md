# Phase 6 Export API

## POST `/api/export-logs`
บันทึกประวัติการ Export หลังสร้างไฟล์สำเร็จ

Body:
```json
{
  "format": "pptx",
  "module": "waste",
  "view": "monthly",
  "periodLabel": "2026-05",
  "options": { "chartType": "bar", "showLegend": true, "showValues": true, "includeTotal": false }
}
```

## GET `/api/export-logs?limit=20`
Admin เห็นประวัติทั้งหมด ส่วน Editor/Viewer เห็นเฉพาะของตนเอง
