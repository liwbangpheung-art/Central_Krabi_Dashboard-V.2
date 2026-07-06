# Phase A API — User & Permission Management

Base path: `/api`

ทุก Endpoint ต้องใช้ `Authorization: Bearer <access-token>` และ Backend เป็นผู้ตรวจ Permission ขั้นสุดท้าย

## Current user

### `GET /me`
คืนค่า Supabase user, Profile และ Effective Permissions

```json
{
  "user": { "id": "...", "email": "owner@example.com" },
  "profile": { "role": "owner", "status": "active" },
  "permissions": ["manage_users", "manage_master_data"]
}
```

## Permission metadata

### `GET /users/meta`
ต้องมี `manage_users`

คืนรายการ Role, Status, วิธีสร้างบัญชี, Permission และ Default Permission ของแต่ละ Role

### `GET /permissions`
คืน Effective Permissions ของบัญชีที่ Login อยู่

## Users

### `GET /users`
ต้องมี `manage_users`

คืนรายชื่อผู้ใช้ พร้อม Effective Permissions และ Permission Override

### `POST /users`
ต้องมี `manage_users` และ Permission ตามวิธีสร้างบัญชี

วิธีสร้างบัญชี:

- `invite` ต้องมี `invite_users`
- `temporary_password` ต้องมี `create_users`
- `pending` ต้องมี `create_users`

ตัวอย่าง:

```json
{
  "mode": "temporary_password",
  "fullName": "สมชาย ใจดี",
  "email": "somchai@example.com",
  "role": "editor",
  "temporaryPassword": "Strong-Password1!"
}
```

การสร้าง `owner` หรือ `admin` ต้องมี `manage_admins` และการสร้าง `owner` ทำได้เฉพาะ Owner

### `PATCH /users/:id`
แก้ไขชื่อ Role Status การบังคับเปลี่ยนรหัสผ่าน และ Permission Override

```json
{
  "fullName": "สมชาย ใจดี",
  "role": "editor",
  "status": "active",
  "mustChangePassword": false,
  "permissionOverrides": {
    "manage_master_data": "allow",
    "manage_prices": "deny",
    "manage_users": "inherit"
  }
}
```

กฎสำคัญ:

- ผู้ใช้เปลี่ยน Role ของตนเองไม่ได้
- ผู้ใช้ปิดบัญชีตนเองไม่ได้
- Admin แก้ Owner ไม่ได้
- ระบบต้องมี Owner ที่ใช้งานได้อย่างน้อยหนึ่งคน
- Permission Override ของตนเองแก้ไม่ได้

### `DELETE /users/:id`
ต้องมี `disable_users`

เป็น Soft Disable เท่านั้น ไม่ลบข้อมูลย้อนหลัง และตอบ `deletionMode: "soft_disable"`

## Password actions

### `POST /users/:id/password`
ต้องมี `reset_user_password`

รองรับ:

```json
{ "action": "send_recovery" }
```

```json
{ "action": "set_temporary_password", "temporaryPassword": "Strong-Password1!" }
```

```json
{ "action": "force_change" }
```

ระบบไม่สามารถและไม่ควรแสดงรหัสผ่านปัจจุบันของผู้ใช้

## Audit logs

### `GET /audit-logs?limit=30`
ต้องมี `view_audit_logs`

คืนเหตุการณ์สำคัญ เช่น การสร้าง แก้ไข ปิดบัญชี และจัดการรหัสผ่าน
