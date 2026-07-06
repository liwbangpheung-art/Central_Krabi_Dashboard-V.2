# CSV Import + Hygiene SQL Import

## สิ่งที่เพิ่ม

### 1) Daily Entry Import รองรับ CSV แล้ว

หน้า `บันทึกข้อมูลรายวัน` ปุ่ม Import เปลี่ยนเป็น:

```text
Import Excel/CSV
```

รองรับไฟล์:

```text
.xlsx
.xlsm
.csv
```

หัวคอลัมน์ CSV ที่รองรับ:

```text
entry_date หรือ date หรือ วันที่
quantity หรือ qty หรือ จำนวน หรือ ปริมาณ หรือ น้ำหนัก
note หรือ หมายเหตุ (ไม่บังคับ)
```

ตัวอย่าง:

```csv
entry_date,quantity,note
2026-01-01,10,ทดสอบ
2026-01-02,12,
```

### 2) SQL Import สำหรับ Hygiene

ไฟล์:

```text
HYGIENE_IMPORT_SUPABASE_READY.sql
```

ใช้รันใน Supabase SQL Editor เพื่อใส่ข้อมูลที่แปลงจาก `Hygiene .xlsx` เข้า database โดยตรง

ข้อมูลที่ใส่:
- master_categories ที่ขาด
- daily_entries
- scrap_price_history
- scrap_sales
- hygiene_monthly_entries_source สำหรับข้อมูลที่ต้นฉบับเป็นรายเดือน

## หมายเหตุ

`scrap_sales` ไม่มี unique constraint เดิม ระบบ SQL นี้จะลบเฉพาะรายการจาก Hygiene เดิมในวัน/หมวดเดียวกันก่อน insert ใหม่ เพื่อกันซ้ำจากการรันซ้ำ


## SQL Hotfix

แก้ CTE `with rows(...) as (` ให้เป็น `with rows(...) as ( values ... )` เพื่อให้รันบน Supabase/PostgreSQL ได้ถูกต้อง
