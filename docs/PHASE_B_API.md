# Phase B API — Data Governance

Base path: `/api`

ทุก Endpoint ต้องใช้ `Authorization: Bearer <access-token>` Backend เป็นผู้ตรวจ Permission และวันที่ปัจจุบันตาม `Asia/Bangkok`

## Period Status

### `GET /period-status?month=YYYY-MM`

คืนสถานะงวด วันที่ปัจจุบัน และ Timezone

```json
{
  "period": {
    "month": "2026-06",
    "status": "reviewed",
    "status_label": "ตรวจสอบแล้ว"
  },
  "today": "2026-07-04",
  "timezone": "Asia/Bangkok"
}
```

หากยังไม่มี Record ระบบคืนสถานะเสมือนเป็น `draft` โดยยังไม่จำเป็นต้อง Insert แถวทันที

### `POST /period-status/:month/transition`

Actions:

```json
{ "action": "review" }
```

ต้องมี `review_data`

```json
{ "action": "lock" }
```

ต้องมี `lock_periods` และสถานะเดิมต้องเป็น `reviewed` เดือนต้องสิ้นสุดแล้ว

```json
{ "action": "reopen", "reason": "แก้ไขยอดวันที่ 18 ตามเอกสารตรวจสอบ" }
```

ต้องมี `reopen_periods` สถานะเดิมต้องเป็น `locked` และต้องระบุเหตุผล

Flow ที่อนุญาต:

```text
draft/reopened → reviewed → locked → reopened
```

Error:

- `PERIOD_TRANSITION_INVALID`
- `PERIOD_NOT_COMPLETE`
- `PERMISSION_FORBIDDEN`

## Import History

### `POST /import-history`

ต้องมี `import_data` และงวดต้องเขียนได้

ตัวอย่าง:

```json
{
  "month": "2026-06",
  "categoryId": "uuid",
  "module": "tissue",
  "fileName": "tissue-june.xlsx",
  "sheetName": "June",
  "totalRows": 30,
  "validRows": 28,
  "errorRows": 2,
  "errors": [
    {
      "row_number": 14,
      "column_name": "date",
      "raw_value": "2026-07-10",
      "error_code": "FUTURE_DATE_NOT_ALLOWED",
      "error_message": "ไม่สามารถ Import วันที่ในอนาคตได้"
    }
  ]
}
```

สถานะที่ Backend กำหนด:

- `validated`
- `validated_with_errors`
- `rejected`
- `committed` หลังบันทึก Daily Data สำเร็จ

### `GET /import-history?month=YYYY-MM`

คืนรายการล่าสุดก่อน สามารถไม่ส่ง `month` เพื่อดูทุกเดือนตามขอบเขตระบบ

## Data Quality

### `GET /data-quality?month=YYYY-MM`

คืน:

- วันที่ตรวจถึงตาม `Asia/Bangkok`
- สถานะงวด
- จำนวนวันผ่านไปในเดือน
- ความครบถ้วนรวม
- ความครบถ้วนแยกประเภท
- วันที่ขาด
- แจ้งเดือนที่ผ่านมาแล้วยังไม่ปิดงวด

Data Quality v2.7.0 ตรวจเฉพาะ Master Category ที่ Active ในโมดูล:

```text
waste
tissue
animal_feed
garbage_bag
consumable
```

## Existing Write APIs

Daily Entries และ Scrap Sales ถูกเพิ่ม Guard:

- วันที่อนาคต → `FUTURE_DATE_NOT_ALLOWED`
- งวดปิดแล้ว → `PERIOD_LOCKED`

Database Trigger ป้องกันซ้ำแม้มีการเขียนข้าม Backend

## Standard Errors

```json
{
  "error": {
    "code": "PERIOD_LOCKED",
    "message": "งวด 2026-06 ปิดงวดแล้ว ไม่สามารถเพิ่ม แก้ไข ลบ หรือ Import ข้อมูลได้",
    "details": {}
  }
}
```

Code สำคัญ:

```text
FUTURE_DATE_NOT_ALLOWED
PERIOD_LOCKED
PERIOD_NOT_COMPLETE
PERIOD_TRANSITION_INVALID
PERMISSION_FORBIDDEN
VALIDATION_ERROR
DATABASE_ERROR
```
