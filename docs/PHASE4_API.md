# Phase 4 API — Scrap Sales

ทุก `/api/*` endpoint ต้องใช้ Bearer Token ของ Supabase

## GET `/api/scrap-sales?month=YYYY-MM`

คืนรายการขายในเดือนและ Summary

## GET `/api/scrap-sales/price?categoryId=UUID&date=YYYY-MM-DD`

คืนราคาที่มีผล ณ วันที่ระบุ ถ้ายังไม่มีราคาจะคืน `pricePerKg: null`

## POST `/api/scrap-sales`

สิทธิ์: `admin`, `editor`

```json
{
  "saleDate": "2026-07-02",
  "categoryId": "UUID",
  "weightKg": 914.8,
  "pricePerKg": 6,
  "note": "ราคาจริง"
}
```

`pricePerKg` สามารถไม่ส่งได้ ระบบจะค้นหาจากประวัติราคา ถ้าไม่พบจะคืน `422 PRICE_NOT_FOUND`

## PATCH `/api/scrap-sales/:id`

สิทธิ์: `admin`, `editor`

รับเฉพาะฟิลด์ที่ต้องการแก้ไข หากเปลี่ยนวันที่หรือประเภทโดยไม่ส่งราคา ระบบจะค้นหาราคาใหม่ตามวันที่

## DELETE `/api/scrap-sales/:id`

สิทธิ์: `admin`, `editor`

คืน `204 No Content`

## Calculation

จำนวนเงินถูกคำนวณใน PostgreSQL:

```text
amount = round(weight_kg × price_per_kg, 2)
```
