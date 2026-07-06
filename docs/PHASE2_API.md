# Phase 2 API

ทุก Route ใต้ `/api` ต้องส่ง:

```http
Authorization: Bearer <SUPABASE_ACCESS_TOKEN>
```

## Master Data

### อ่านรายการ

```http
GET /api/master-data?module=waste&status=all
```

Role: `admin`, `editor`, `viewer`

### เพิ่มประเภท

```http
POST /api/master-data
```

Role: `admin`

```json
{
  "module": "scrap_material",
  "code": "PET_BOTTLE",
  "nameTh": "ขวด PET",
  "nameEn": "PET bottle",
  "unit": "กิโลกรัม",
  "colorHex": "#F1A15A",
  "pattern": "solid",
  "sortOrder": 80,
  "active": true,
  "metadata": {}
}
```

### แก้ไข/เปิดปิด

```http
PATCH /api/master-data/:id
```

Role: `admin`

### ลบถาวร

```http
DELETE /api/master-data/:id
```

Role: `admin`

หากมีประวัติราคา ตอบ `409 CATEGORY_HAS_HISTORY`

## Price History

### อ่านประวัติ

```http
GET /api/scrap-prices?categoryId=<uuid>
```

### เพิ่มราคา

```http
POST /api/scrap-prices
```

```json
{
  "categoryId": "uuid",
  "pricePerKg": 6.5,
  "effectiveFrom": "2026-07-01",
  "note": "ราคาตามรอบรับซื้อ"
}
```

### แก้ไขราคา

```http
PATCH /api/scrap-prices/:id
```

### ลบราคาที่กรอกผิด

```http
DELETE /api/scrap-prices/:id
```
