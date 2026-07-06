# Phase C6 Preview Hardening

## เป้าหมาย

ยกระดับ Phase C6 จาก early preview ให้เป็น preview ที่ทีมภายในตรวจได้จริง โดยแก้ 3 จุดหลัก:

1. Versioning ชัดเจน
2. Report Builder เป็น Wizard
3. PowerPoint Readability มี rule ไม่ใช่แค่ขยาย font

## Version

```text
2.8.0-c6-preview
```

## Wizard Steps

1. Template
2. Period
3. Data
4. Slides
5. Preview
6. Generate

## Preview Outline

เพิ่ม `buildReportSlideOutline(report, settings)` เพื่อแสดงลำดับสไลด์ก่อนสร้างไฟล์จริง

## Readability Rules

```text
maxTableRowsPerSlide = 8
maxCategoriesPerBreakdown = 7
maxBulletsPerSlide = 5
maxBulletChars = 128
maxTitleChars = 72
```

## ไฟล์ที่แก้

```text
VERSION
package.json
backend/package.json
frontend/package.json
backend/src/version.js
frontend/src/lib/report-builder.js
frontend/src/pages/ExportPage.jsx
frontend/src/styles.css
backend/src/domain/report-generator.js
CURRENT_STATUS.md
CHANGELOG.md
NEXT_PHASE.md
```
