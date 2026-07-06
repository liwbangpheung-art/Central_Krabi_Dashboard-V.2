import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { moduleLabel } from "../lib/master-data.js";
import {
  bangkokTodayValue,
  buildMonthDays,
  currentMonthValue,
  dailyModuleOptions,
  getDaysInMonth,
  monthLabelThai,
  quantityPolicyForModule,
  serializeDailyEntries,
  summarizeDailyValues,
  validateDailyGrid
} from "../lib/daily-entry.js";
import { importDailyFilePreview } from "../lib/daily-import.js";
import { unsavedChangesMessage } from "../lib/entry-validation.js";
import { periodStatusLabels } from "../lib/permissions.js";

function Notice({ notice, onClose }) {
  if (!notice) return null;
  return (
    <div className={`inline-notice notice-${notice.type}`} role={notice.type === "error" ? "alert" : "status"}>
      <span>{notice.message}</span>
      <button type="button" aria-label="ปิดข้อความ" onClick={onClose}>×</button>
    </div>
  );
}

function formatNumber(value, maximumFractionDigits = 4) {
  return Number(value || 0).toLocaleString("th-TH", { maximumFractionDigits });
}

export function DailyEntryPage({
  initialModule = "waste",
  fixedModule = false,
  headingTitle = "บันทึกข้อมูลรายวัน",
  headingDescription = "เลือกหมวด ประเภท และเดือน จากนั้นกรอกข้อมูลครบทั้งเดือนในหน้าเดียว ระบบจะรวมรายสัปดาห์และรายเดือนให้อัตโนมัติ"
}) {
  const { api, permissions } = useOutletContext();
  const canEdit = permissions?.includes("manage_daily_data");
  const canImport = permissions?.includes("import_data");
  const canReview = permissions?.includes("review_data");
  const canLock = permissions?.includes("lock_periods");
  const canReopen = permissions?.includes("reopen_periods");
  const [module, setModule] = useState(initialModule);
  const [month, setMonth] = useState(currentMonthValue());
  const [categoriesState, setCategoriesState] = useState({ loading: true, items: [], error: null });
  const [categoryId, setCategoryId] = useState("");
  const [days, setDays] = useState(() => buildMonthDays(currentMonthValue()));
  const [entryState, setEntryState] = useState({ loading: false, saving: false, loaded: false, error: null });
  const [notice, setNotice] = useState(null);
  const [dirty, setDirty] = useState(false);
  const [period, setPeriod] = useState({ status: "draft", status_label: periodStatusLabels.draft });
  const [today, setToday] = useState(() => bangkokTodayValue());
  const [importPreview, setImportPreview] = useState(null);
  const [reopenForm, setReopenForm] = useState({ open: false, reason: "", saving: false });
  const inputRefs = useRef([]);
  const importInputRef = useRef(null);

  const selectedCategory = useMemo(
    () => categoriesState.items.find((item) => item.id === categoryId) || null,
    [categoriesState.items, categoryId]
  );
  const summary = useMemo(() => summarizeDailyValues(days, month), [days, month]);
  const quantityPolicy = useMemo(() => quantityPolicyForModule(module), [module]);
  const formatQuantity = (value) => formatNumber(value, quantityPolicy.maximumFractionDigits);
  const periodLocked = period?.status === "locked";
  const canWrite = Boolean(canEdit && !periodLocked);
  const currentMonth = today.slice(0, 7);
  const selectedMonthEnd = `${month}-${String(getDaysInMonth(month)).padStart(2, "0")}`;
  const canLockCompletedMonth = selectedMonthEnd <= today;

  const loadCategories = useCallback(async () => {
    setCategoriesState({ loading: true, items: [], error: null });
    setCategoryId("");
    setDirty(false);
    try {
      const data = await api.request(`/api/master-data?module=${encodeURIComponent(module)}&status=active`);
      const items = data.items ?? [];
      setCategoriesState({ loading: false, items, error: null });
      setCategoryId(items[0]?.id || "");
    } catch (error) {
      setCategoriesState({ loading: false, items: [], error });
    }
  }, [api, module]);

  const loadEntries = useCallback(async () => {
    if (!categoryId) {
      setDays(buildMonthDays(month, [], { today }));
      setEntryState({ loading: false, saving: false, loaded: false, error: null });
      return;
    }
    setEntryState((current) => ({ ...current, loading: true, error: null }));
    try {
      const data = await api.request(`/api/daily-entries?categoryId=${encodeURIComponent(categoryId)}&month=${encodeURIComponent(month)}`);
      setToday(data.today || bangkokTodayValue());
      setPeriod(data.period || { status: "draft", status_label: periodStatusLabels.draft });
      setDays(buildMonthDays(month, data.items, { today: data.today || bangkokTodayValue() }));
      setImportPreview(null);
      setDirty(false);
      setEntryState({ loading: false, saving: false, loaded: true, error: null });
    } catch (error) {
      setDays(buildMonthDays(month, [], { today }));
      setEntryState({ loading: false, saving: false, loaded: false, error });
    }
  }, [api, categoryId, month, today]);

  useEffect(() => { loadCategories(); }, [loadCategories]);
  useEffect(() => {
    if (fixedModule && module !== initialModule) {
      setModule(initialModule);
      setDirty(false);
      setNotice(null);
    }
  }, [fixedModule, initialModule, module]);

  useEffect(() => { loadEntries(); }, [loadEntries]);
  useEffect(() => {
    const handler = (event) => {
      if (!dirty) return;
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);


  function confirmDiscard() {
    return !dirty || window.confirm(unsavedChangesMessage());
  }

  function changeModule(nextModule) {
    if (!confirmDiscard()) return;
    setModule(nextModule);
    setDirty(false);
    setNotice(null);
  }

  function changeCategory(nextCategoryId) {
    if (!confirmDiscard()) return;
    setCategoryId(nextCategoryId);
    setDirty(false);
    setNotice(null);
  }

  function changeMonth(nextMonth) {
    if (!nextMonth || !confirmDiscard()) return;
    setMonth(nextMonth);
    setDirty(false);
    setNotice(null);
  }

  function reloadEntries() {
    if (!confirmDiscard()) return;
    setDirty(false);
    loadEntries();
  }

  function updateDay(index, value) {
    if (!canWrite || days[index]?.future) return;
    setDays((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, value } : item));
    setDirty(true);
    setNotice(null);
  }

  function applyFirstToAll() {
    const firstValue = days[0]?.value ?? "";
    if (firstValue === "") {
      setNotice({ type: "error", message: "กรุณากรอกค่าของวันที่ 1 ก่อนใช้คำสั่งนี้" });
      inputRefs.current[0]?.focus();
      return;
    }
    const value = Number(firstValue);
    if (!Number.isFinite(value) || value < 0) {
      setNotice({ type: "error", message: "ค่าของวันที่ 1 ต้องเป็นตัวเลขตั้งแต่ 0 ขึ้นไป" });
      return;
    }
    setDays((current) => current.map((item) => item.future ? item : ({ ...item, value: firstValue })));
    setDirty(true);
    setNotice({ type: "success", message: `ใส่ค่า ${formatQuantity(value)} ให้วันที่ที่บันทึกได้แล้ว กรุณาตรวจสอบก่อนบันทึก` });
  }

  function clearForm() {
    if (days.some((item) => item.value !== "") && !window.confirm("ล้างค่าที่อยู่บนหน้าจอทั้งหมดหรือไม่? ข้อมูลในฐานข้อมูลจะยังไม่ถูกลบจนกว่าจะกดบันทึกหรือล้างข้อมูลที่บันทึกแล้ว")) return;
    setDays(buildMonthDays(month));
    setDirty(true);
    setNotice({ type: "success", message: "ล้างค่าบนหน้าจอแล้ว ข้อมูลที่บันทึกไว้ยังคงอยู่" });
  }

  async function handleDailyImport(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!canImport || !canWrite) {
      setNotice({ type: "error", message: periodLocked ? "งวดนี้ปิดงวดแล้ว ไม่สามารถ Import ได้" : "คุณไม่มีสิทธิ์ Import ข้อมูล" });
      return;
    }
    if (days.some((item) => item.value !== "") && !window.confirm("Import ไฟล์จะแทนค่าที่อยู่บน Grid ปัจจุบัน ต้องการดำเนินการต่อหรือไม่?")) return;

    setEntryState((current) => ({ ...current, loading: true, error: null }));
    try {
      const preview = await importDailyFilePreview(file, { month, module, today });
      const history = await api.request("/api/import-history", {
        method: "POST",
        body: { month, module, categoryId, fileName: file.name, sheetName: preview.sheetName, totalRows: preview.totalRows, validRows: preview.validRows, errorRows: preview.errorRows, errors: preview.errors }
      });
      setDays(buildMonthDays(month, preview.items, { today }));
      setImportPreview({ ...preview, fileName: file.name, historyId: history.item?.id || null });
      setDirty(preview.validRows > 0);
      setNotice({ type: preview.errorRows ? "error" : "success", message: `ตรวจไฟล์ ${file.name}: ผ่าน ${preview.validRows} แถว, พบปัญหา ${preview.errorRows} แถว${preview.validRows ? " กรุณาตรวจสอบ Grid ก่อนบันทึก" : ""}` });
      setEntryState((current) => ({ ...current, loading: false }));
    } catch (error) {
      setEntryState((current) => ({ ...current, loading: false, error: null }));
      setNotice({ type: "error", message: error.message });
    }
  }

  async function saveMonth() {
    if (!canWrite) {
      setNotice({ type: "error", message: periodLocked ? "งวดนี้ปิดงวดแล้ว ไม่สามารถบันทึกได้" : "คุณไม่มีสิทธิ์บันทึกข้อมูล" });
      return;
    }
    if (!selectedCategory) {
      setNotice({ type: "error", message: "กรุณาเลือกประเภทข้อมูลก่อนบันทึก" });
      return;
    }
    const errors = validateDailyGrid(days, module, { today });
    if (errors.length) {
      setNotice({ type: "error", message: errors[0] });
      return;
    }
    const entries = serializeDailyEntries(days, { today });
    if (entries.length === 0) {
      setNotice({ type: "error", message: "ยังไม่มีข้อมูลสำหรับบันทึก หากต้องการลบข้อมูลทั้งเดือนให้ใช้ปุ่ม “ล้างข้อมูลที่บันทึกแล้ว”" });
      return;
    }

    setEntryState((current) => ({ ...current, saving: true, error: null }));
    try {
      const data = await api.request("/api/daily-entries/month", {
        method: "POST",
        body: { categoryId, month, entries, importHistoryId: importPreview?.historyId || null }
      });
      setToday(data.today || bangkokTodayValue());
      setPeriod(data.period || { status: "draft", status_label: periodStatusLabels.draft });
      setDays(buildMonthDays(month, data.items, { today: data.today || bangkokTodayValue() }));
      setImportPreview(null);
      setDirty(false);
      setNotice({ type: "success", message: `บันทึก ${data.summary.filledDays} วัน รวม ${formatQuantity(data.summary.total)} ${selectedCategory.unit} สำเร็จ` });
      setEntryState({ loading: false, saving: false, loaded: true, error: null });
    } catch (error) {
      setEntryState((current) => ({ ...current, saving: false, error }));
      setNotice({ type: "error", message: error.message });
    }
  }

  async function clearSavedMonth() {
    if (!canWrite) {
      setNotice({ type: "error", message: periodLocked ? "งวดนี้ปิดงวดแล้ว ไม่สามารถลบข้อมูลได้" : "คุณไม่มีสิทธิ์ลบข้อมูล" });
      return;
    }
    if (!selectedCategory) {
      setNotice({ type: "error", message: "กรุณาเลือกประเภทข้อมูลก่อน" });
      return;
    }
    const confirmed = window.confirm(`ยืนยันลบข้อมูล “${selectedCategory.name_th}” เดือน ${monthLabelThai(month)} ทั้งหมดหรือไม่?`);
    if (!confirmed) return;

    setEntryState((current) => ({ ...current, saving: true, error: null }));
    try {
      const data = await api.request(`/api/daily-entries/month?categoryId=${encodeURIComponent(categoryId)}&month=${encodeURIComponent(month)}`, { method: "DELETE" });
      if (data.period) setPeriod(data.period);
      setDays(buildMonthDays(month, [], { today }));
      setDirty(false);
      setEntryState({ loading: false, saving: false, loaded: true, error: null });
      setNotice({ type: "success", message: `ล้างข้อมูลที่บันทึกไว้ของเดือน ${monthLabelThai(month)} แล้ว` });
    } catch (error) {
      setEntryState((current) => ({ ...current, saving: false, error }));
      setNotice({ type: "error", message: error.message });
    }
  }

  async function transitionPeriod(action) {
    if (dirty && !window.confirm("มีข้อมูลที่ยังไม่ได้บันทึก ต้องการเปลี่ยนสถานะงวดต่อหรือไม่?")) return;
    const labels = { review: "ตรวจสอบข้อมูลของงวดนี้แล้ว", lock: "ปิดงวดนี้", reopen: "เปิดแก้ไขงวดนี้อีกครั้ง" };
    if (action !== "reopen" && !window.confirm(`ยืนยัน${labels[action]}หรือไม่?`)) return;
    const reason = action === "reopen" ? reopenForm.reason.trim() : null;
    if (action === "reopen" && reason.length < 5) {
      setNotice({ type: "error", message: "กรุณาระบุเหตุผลอย่างน้อย 5 ตัวอักษร" });
      return;
    }
    setReopenForm((current) => ({ ...current, saving: true }));
    try {
      const data = await api.request(`/api/period-status/${month}/transition`, { method: "POST", body: { action, reason } });
      setPeriod(data.period);
      setReopenForm({ open: false, reason: "", saving: false });
      setNotice({ type: "success", message: `เปลี่ยนสถานะงวดเป็น “${data.period.status_label}” แล้ว` });
    } catch (error) {
      setReopenForm((current) => ({ ...current, saving: false }));
      setNotice({ type: "error", message: error.message });
    }
  }

  return (
    <>
      <section className="page-heading daily-page-heading">
        <div>
          <p className="eyebrow">Phase 3</p>
          <h1>{headingTitle}</h1>
          <p>{headingDescription}</p>
        </div>
        <span className={`role-access ${canWrite ? "can-edit" : "read-only"}`}>{periodLocked ? "งวดถูกปิดแล้ว" : canEdit ? "เพิ่มและแก้ไขได้" : "ดูข้อมูลเท่านั้น"}</span>
      </section>

      <Notice notice={notice} onClose={() => setNotice(null)} />

      <section className="daily-filter-panel">
        <div className="daily-filter-grid">
          {!fixedModule && <label>หมวดข้อมูล
            <select value={module} onChange={(event) => changeModule(event.target.value)} disabled={entryState.saving}>
              {dailyModuleOptions.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
            </select>
          </label>}
          <label>ประเภทข้อมูล
            <select value={categoryId} onChange={(event) => changeCategory(event.target.value)} disabled={categoriesState.loading || entryState.saving || categoriesState.items.length === 0}>
              {categoriesState.items.length === 0 && <option value="">ไม่มีประเภทที่เปิดใช้งาน</option>}
              {categoriesState.items.map((item) => <option key={item.id} value={item.id}>{item.name_th} ({item.unit})</option>)}
            </select>
          </label>
          <label>เดือนข้อมูล
            <input type="month" min="2020-01" max={currentMonth} value={month} onChange={(event) => changeMonth(event.target.value)} disabled={entryState.saving} />
          </label>
          <button className="secondary-button daily-refresh-button" type="button" onClick={reloadEntries} disabled={!categoryId || entryState.loading || entryState.saving}>
            {entryState.loading ? "กำลังโหลด..." : "โหลดข้อมูลใหม่"}
          </button>
        </div>
        <div className="daily-filter-footnote">
          <span><strong>{moduleLabel[module]}</strong> • {selectedCategory?.name_th || "ยังไม่ได้เลือกประเภท"}</span>
          <span>{monthLabelThai(month)}</span>
        </div>
      </section>

      <section className={`period-status-panel period-${period?.status || "draft"}`}>
        <div>
          <p className="eyebrow">สถานะงวดข้อมูล</p>
          <div className="period-status-line"><strong>{period?.status_label || periodStatusLabels[period?.status] || "กำลังบันทึก"}</strong><span>{monthLabelThai(month)}</span></div>
          <p>{periodLocked ? "ข้อมูลถูกใช้เป็นงวดอ้างอิงแล้ว หากจำเป็นต้องแก้ไขให้เปิดแก้ไขพร้อมระบุเหตุผล" : "กรอกวันนี้หรือย้อนหลังได้ วันที่ในอนาคตจะแสดงแต่ไม่เปิดให้กรอก"}</p>
        </div>
        <div className="period-actions">
          {canReview && ["draft", "reopened", "reviewed"].includes(period?.status) && <button className="secondary-button" type="button" onClick={() => transitionPeriod("review")}>ทำเครื่องหมายว่าตรวจสอบแล้ว</button>}
          {canLock && period?.status === "reviewed" && canLockCompletedMonth && <button className="primary-button compact" type="button" onClick={() => transitionPeriod("lock")}>ปิดงวด</button>}
          {canLock && period?.status === "reviewed" && !canLockCompletedMonth && <span className="period-lock-note">ปิดงวดได้หลังสิ้นเดือน</span>}
          {canReopen && periodLocked && <button className="secondary-button" type="button" onClick={() => setReopenForm((current) => ({ ...current, open: !current.open }))}>เปิดแก้ไขอีกครั้ง</button>}
        </div>
        {reopenForm.open && <div className="reopen-inline-form"><label>เหตุผลในการเปิดแก้ไขอีกครั้ง<textarea value={reopenForm.reason} maxLength="500" onChange={(event) => setReopenForm((current) => ({ ...current, reason: event.target.value }))} placeholder="เช่น พบข้อมูลวันที่ 3 ไม่ถูกต้อง" /></label><button className="primary-button compact" type="button" disabled={reopenForm.saving} onClick={() => transitionPeriod("reopen")}>{reopenForm.saving ? "กำลังเปิดงวด..." : "ยืนยันเปิดแก้ไข"}</button></div>}
      </section>

      {categoriesState.error && (
        <section className="connection-error page-error" role="alert">
          <div><p className="eyebrow">Master Data Error</p><h2>โหลดประเภทข้อมูลไม่สำเร็จ</h2><p>{categoriesState.error.message}</p></div>
          <button className="primary-button compact" type="button" onClick={loadCategories}>ลองใหม่</button>
        </section>
      )}

      {!categoriesState.loading && !categoriesState.error && categoriesState.items.length === 0 && (
        <section className="daily-empty-state">
          <div><p className="eyebrow">ยังไม่มีประเภทข้อมูล</p><h2>เพิ่ม Master Data ก่อนเริ่มกรอกข้อมูลรายวัน</h2><p>หมวด {moduleLabel[module]} ยังไม่มีประเภทที่เปิดใช้งาน</p></div>
          {permissions?.includes("manage_master_data") && <Link className="primary-link" to="/master-data">ไปที่ Master Data</Link>}
        </section>
      )}

      {selectedCategory && (
        <>
          <section className="daily-summary-grid">
            <article><small>จำนวนวันในเดือน</small><strong>{summary.daysInMonth}</strong><span>วัน</span></article>
            <article><small>กรอกแล้ว</small><strong>{summary.filledDays}</strong><span>เหลือ {summary.missingDays} วัน{summary.futureDays ? ` • อนาคต ${summary.futureDays} วัน` : ""}</span></article>
            <article><small>ยอดรวมเดือน</small><strong>{formatQuantity(summary.total)}</strong><span>{selectedCategory.unit}</span></article>
            <article><small>เฉลี่ยวันที่มีข้อมูล</small><strong>{formatQuantity(summary.averagePerFilledDay)}</strong><span>{selectedCategory.unit}/วัน</span></article>
          </section>

          <section className="daily-action-panel">
            <div>
              <p className="eyebrow">เครื่องมือกรอกข้อมูล</p>
              <strong>{dirty ? "มีการเปลี่ยนแปลงที่ยังไม่บันทึก" : entryState.loaded ? "ข้อมูลล่าสุดถูกโหลดแล้ว" : "พร้อมกรอกข้อมูล"}</strong>
            </div>
            <div className="daily-action-buttons">
              <input ref={importInputRef} type="file" accept=".xlsx,.xlsm,.csv,text/csv" hidden onChange={handleDailyImport} />
              <button className="secondary-button" type="button" onClick={() => importInputRef.current?.click()} disabled={!canImport || !canWrite || entryState.loading || entryState.saving}>Import Excel/CSV</button>
              <button className="secondary-button" type="button" onClick={applyFirstToAll} disabled={!canWrite || entryState.loading || entryState.saving}>ใช้ค่าวันที่ 1 กับทุกวัน</button>
              <button className="secondary-button" type="button" onClick={clearForm} disabled={!canWrite || entryState.loading || entryState.saving}>ล้างค่าบนหน้าจอ</button>
              <button className="danger-button" type="button" onClick={clearSavedMonth} disabled={!canWrite || entryState.loading || entryState.saving}>ล้างข้อมูลที่บันทึกแล้ว</button>
              <button className="primary-button compact" type="button" onClick={saveMonth} disabled={!canWrite || entryState.loading || entryState.saving}>
                {entryState.saving ? "กำลังบันทึก..." : "บันทึกข้อมูลทั้งเดือน"}
              </button>
            </div>
          </section>

          {importPreview && (
            <details className="import-preview-panel" open={importPreview.errorRows > 0}>
              <summary>ผลตรวจ Import: ผ่าน {importPreview.validRows} แถว • มีปัญหา {importPreview.errorRows} แถว</summary>
              <p>ไฟล์ {importPreview.fileName} • Sheet {importPreview.sheetName} • ข้อมูลที่ผ่านถูกนำมาแสดงบน Grid แต่ยังไม่บันทึกฐานข้อมูล</p>
              {importPreview.errors.length > 0 && <div className="import-error-list">{importPreview.errors.slice(0, 50).map((error) => <div key={`${error.rowNumber}-${error.code}`}><strong>แถว {error.rowNumber}</strong><span>{error.message}</span></div>)}</div>}
            </details>
          )}

          {entryState.error && (
            <section className="connection-error page-error" role="alert">
              <div><p className="eyebrow">Daily Entry Error</p><h2>ดำเนินการข้อมูลรายวันไม่สำเร็จ</h2><p>{entryState.error.message}</p><code>{entryState.error.url}</code></div>
              <button className="primary-button compact" type="button" onClick={loadEntries}>ลองโหลดใหม่</button>
            </section>
          )}

          <section className="daily-grid-card" aria-busy={entryState.loading}>
            <div className="daily-grid-heading">
              <div><p className="eyebrow">Daily Grid</p><h2>{selectedCategory.name_th}</h2><p>หน่วย: {selectedCategory.unit} • {quantityPolicy.integer ? "จำนวนเต็มเท่านั้น" : "ทศนิยมไม่เกิน 2 ตำแหน่ง"} • ช่องว่างหมายถึงยังไม่กรอก ส่วน 0 คือค่าที่บันทึกจริง</p></div>
              <span className="category-color-badge"><i style={{ backgroundColor: selectedCategory.color_hex }} />{selectedCategory.code}</span>
            </div>
            {entryState.loading ? <div className="daily-loading"><span className="spinner" /> กำลังโหลดข้อมูลรายวัน...</div> : (
              <div className="daily-day-grid">
                {days.map((item, index) => (
                  <label key={item.date} className={`daily-day-card ${item.weekend ? "weekend" : ""} ${item.value !== "" ? "filled" : ""} ${item.future ? "future" : ""}`}>
                    <span className="daily-day-title"><strong>วันที่ {item.day}</strong><small>{item.weekday}</small></span>
                    <input
                      ref={(element) => { inputRefs.current[index] = element; }}
                      type="number"
                      min="0"
                      step={quantityPolicy.step}
                      inputMode={quantityPolicy.inputMode}
                      placeholder={quantityPolicy.placeholder}
                      value={item.value}
                      disabled={!canWrite || item.future || entryState.saving}
                      aria-label={`วันที่ ${item.day} ${selectedCategory.unit}`}
                      onChange={(event) => updateDay(index, event.target.value)}
                    />
                    <span className="daily-unit">{item.future ? "ยังไม่ถึงวันที่บันทึก" : selectedCategory.unit}</span>
                  </label>
                ))}
              </div>
            )}
          </section>

          <section className="weekly-summary-card">
            <div className="card-heading"><div><p className="eyebrow">Automatic Summary</p><h2>สรุปรายสัปดาห์</h2></div><span>{monthLabelThai(month)}</span></div>
            <div className="weekly-summary-grid">
              {summary.weeks.map((week) => (
                <article key={week.key}>
                  <small>{week.label}</small>
                  <strong>{formatQuantity(week.total)}</strong>
                  <span>{selectedCategory.unit} • {week.filledDays} วัน</span>
                </article>
              ))}
              <article className="monthly-total-card">
                <small>รวมเดือน</small>
                <strong>{formatQuantity(summary.total)}</strong>
                <span>{selectedCategory.unit}</span>
              </article>
            </div>
          </section>
        </>
      )}
    </>
  );
}
