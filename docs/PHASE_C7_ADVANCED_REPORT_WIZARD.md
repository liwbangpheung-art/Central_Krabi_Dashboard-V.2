# Phase C7 — Advanced Report Wizard

## เป้าหมาย

เปลี่ยน Report Builder จากฟอร์มสร้าง PowerPoint เป็น Wizard ที่ควบคุมโครงสร้างรายงานได้จริง

## Features

### 1. Editable Slide Outline
ผู้ใช้สามารถแก้ชื่อสไลด์ เลือก layout เปิด/ปิดสไลด์ และขยับลำดับได้

### 2. Per-slide Layout Selection
รองรับ layout:
- Auto
- KPI + Chart + Analysis
- Chart Focus
- Table Focus
- Analysis Focus
- Data Quality Focus

### 3. Smart Readability Engine
ระบบแสดง warning เมื่อข้อมูลมีความเสี่ยงทำให้สไลด์แน่น

### 4. Template Theme System
รองรับ theme:
- Executive Dark
- Clean Government
- Eco Green
- Minimal White

### 5. Mini Slide Preview
แสดง mini preview ใน outline เพื่อให้ผู้ใช้เห็นภาพรวมก่อน generate

### 6. Preset Management Ready
config ใหม่ เช่น theme และ slide outline override ถูกเก็บใน builder setting และ preset ได้

### 7. Report Run History UX
ยังใช้ history/storage เดิม แต่เตรียม metadata ให้รองรับ slide outline และ theme

## ไฟล์หลักที่แก้

```text
frontend/src/lib/report-builder.js
frontend/src/pages/ExportPage.jsx
frontend/src/styles.css
CURRENT_STATUS.md
CHANGELOG.md
NEXT_PHASE.md
```

## สถานะ

`2.9.0-c7-preview` ยังเป็น preview สำหรับ internal review
