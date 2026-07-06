# Phase 5 Analytics API

## GET `/api/analytics`

Query parameters:
- `module`: `waste`, `tissue`, `animal_feed`, `garbage_bag`, `consumable`, `scrap_sales`
- `view`: `monthly`, `quarterly`, `yearly`, `month_over_month`
- `year`: ค.ศ.
- `month`: 1-12
- `quarter`: 1-4
- `metric`: `quantity`; สำหรับ scrap sales ใช้ `amount` หรือ `weight`

ผลลัพธ์มี `rows`, `categories`, `kpis`, `comparison` และ `weekly` สำหรับมุมมองรายเดือนของข้อมูลรายวัน
