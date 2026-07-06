# Phase 3 API

ทุกเส้นทางใต้ `/api` ต้องส่ง Header:

```http
Authorization: Bearer <SUPABASE_ACCESS_TOKEN>
```

## GET `/api/daily-entry/modules`

คืนหมวดที่รองรับข้อมูลรายวัน

## GET `/api/daily-entries`

Query:

- `categoryId`
- `month` รูปแบบ `YYYY-MM`

ตัวอย่าง:

```http
GET /api/daily-entries?categoryId=<uuid>&month=2026-05
```

Response มี `category`, `items` และ `summary` ซึ่งรวม Week 1–4 และวันที่ 29–สิ้นเดือน

## GET `/api/daily-entry-overview`

Query:

- `module`
- `month`

คืนสรุปทุกประเภทที่เปิดใช้งานภายในหมวดนั้น

## POST `/api/daily-entries/month`

Role: `admin`, `editor`

```json
{
  "categoryId": "<uuid>",
  "month": "2026-05",
  "entries": [
    { "date": "2026-05-01", "quantity": 10 },
    { "date": "2026-05-02", "quantity": 0 }
  ]
}
```

หมายเหตุ:

- `0` เป็นค่าที่ถูกต้อง
- วันที่ที่ไม่อยู่ใน `entries` จะถูกลบออกจากเดือนนั้น
- การแทนที่ทำใน Database Transaction เดียว

## DELETE `/api/daily-entries/month`

Role: `admin`, `editor`

```http
DELETE /api/daily-entries/month?categoryId=<uuid>&month=2026-05
```

ล้างข้อมูลของประเภทและเดือนนั้นทั้งหมด พร้อมสร้าง Audit Log
