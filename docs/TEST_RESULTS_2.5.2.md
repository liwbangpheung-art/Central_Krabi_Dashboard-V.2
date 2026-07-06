# Test Results 2.5.2

Final results are generated from a clean `npm ci` installation:

- Backend test files: 7 passed
- Backend tests: 46 passed
- Frontend test files: 7 passed
- Frontend tests: 25 passed
- Backend syntax check: 27 files passed
- Frontend production build: passed
- Migration sequence check: 13 files, 001–013
- Repository verification: passed
- npm audit after `npm ci`: 0 vulnerabilities in Backend and Frontend

Coverage includes:

- `/health`, `/ready`, `/api/me`
- Supabase token validation
- Missing/inactive Profile
- Admin, Editor, Viewer role rules
- Allowed and forbidden CORS origins
- Frontend root API URL validation
- Daily quantity precision by module
- Excel import date and quantity parsing
- Master Data, daily entries, scrap sales, analytics and export

Live Render + Supabase E2E requires UAT credentials and is intentionally not executed without user-provided secrets. Use `npm run test:e2e:live` in the target environment.
