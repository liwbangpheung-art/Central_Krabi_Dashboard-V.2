import { useCallback, useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { buildMonthDays, currentMonthValue, getDaysInMonth, monthLabelThai } from "../lib/daily-entry.js";
import { calculateAmount, currentMonthValue as scrapCurrentMonthValue, formatMoney, formatQuantity, todayValue, validateScrapSaleForm } from "../lib/scrap-sales.js";
import { numericPolicies, parseNumberValue, unsavedChangesMessage, validateNumberValue } from "../lib/entry-validation.js";

function Notice({ notice, onClose }) {
  if (!notice) return null;
  return <div className={`inline-notice notice-${notice.type}`} role={notice.type === "error" ? "alert" : "status"}><span>{notice.message}</span><button type="button" aria-label="ปิดข้อความ" onClick={onClose}>×</button></div>;
}

function formatCount(value) {
  return Number(value || 0).toLocaleString("th-TH", { maximumFractionDigits: 0 });
}

function firstDateOfMonth(month) {
  return `${month}-01`;
}

function csvEscape(value) {
  const text = String(value ?? "");
  return /[",\n]/u.test(text) ? `"${text.replace(/"/gu, '""')}"` : text;
}

function downloadCsv(fileName, rows) {
  const csv = rows.map((row) => row.map(csvEscape).join(",")).join("\n");
  const blob = new Blob(["\ufeff", csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(url);
}

function readCsvText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("อ่านไฟล์ CSV ไม่สำเร็จ"));
    reader.readAsText(file, "utf-8");
  });
}

function parseSimpleCsv(text) {
  return String(text || "")
    .split(/\r?\n/u)
    .map((line) => line.split(",").map((cell) => cell.trim().replace(/^"|"$/gu, "").replace(/""/gu, '"')))
    .filter((row) => row.some(Boolean));
}

function categoryMatcher(category, keywordList) {
  const haystack = `${category.code || ""} ${category.name_th || ""} ${category.name_en || ""}`.toLowerCase();
  return keywordList.some((keyword) => haystack.includes(keyword.toLowerCase()));
}

function createBlankRows(month, categories) {
  const days = buildMonthDays(month);
  return Object.fromEntries(categories.map((category) => [
    category.id,
    Object.fromEntries(days.map((day) => [day.date, ""]))
  ]));
}

function categoryTotalsFromRows(rowsByCategory) {
  return Object.fromEntries(Object.entries(rowsByCategory).map(([categoryId, rows]) => [
    categoryId,
    Object.values(rows || {}).reduce((sum, value) => value === "" ? sum : sum + parseNumberValue(value), 0)
  ]));
}

function monthlyValueFromOverviewItem(item) {
  return String(item?.summary?.total ?? 0);
}

export function MonthlyCategoryEntryPage({
  module,
  title,
  description,
  dailyToggle = false,
  monthlyButtonLabel = "บันทึกข้อมูลรายเดือน"
}) {
  const { api, permissions } = useOutletContext();
  const canEdit = permissions?.includes("manage_daily_data");
  const [month, setMonth] = useState(currentMonthValue());
  const [categories, setCategories] = useState([]);
  const [mode, setMode] = useState("monthly");
  const [monthlyValues, setMonthlyValues] = useState({});
  const [dailyRows, setDailyRows] = useState({});
  const [state, setState] = useState({ loading: true, saving: false, error: null });
  const [dirty, setDirty] = useState(false);
  const [notice, setNotice] = useState(null);
  const [advancedActionsOpen, setAdvancedActionsOpen] = useState(false);
  const policy = numericPolicies.count;
  const days = useMemo(() => buildMonthDays(month), [month]);
  const totals = mode === "daily" ? categoryTotalsFromRows(dailyRows) : monthlyValues;
  const monthTotal = Object.values(totals || {}).reduce((sum, value) => sum + parseNumberValue(value), 0);

  const loadPage = useCallback(async () => {
    setState({ loading: true, saving: false, error: null });
    try {
      const categoryData = await api.request(`/api/master-data?module=${encodeURIComponent(module)}&status=active`);
      const items = categoryData.items || [];
      setCategories(items);

      const monthly = Object.fromEntries(items.map((item) => [item.id, "0"]));
      const rows = createBlankRows(month, items);

      if (items.length === 0) {
        setMonthlyValues(monthly);
        setDailyRows(rows);
        setDirty(false);
        setState({ loading: false, saving: false, error: null });
        return;
      }

      if (!dailyToggle) {
        const overview = await api.request(`/api/daily-entry-overview?module=${encodeURIComponent(module)}&month=${encodeURIComponent(month)}`);
        (overview.items || []).forEach((item) => {
          const categoryId = item.category?.id;
          if (categoryId) monthly[categoryId] = monthlyValueFromOverviewItem(item);
        });
        setMonthlyValues(monthly);
        setDailyRows(rows);
        setDirty(false);
        setState({ loading: false, saving: false, error: null });
        return;
      }

      await Promise.all(items.map(async (category) => {
        const detail = await api.request(`/api/daily-entries?categoryId=${encodeURIComponent(category.id)}&month=${encodeURIComponent(month)}`);
        const entries = detail.items || [];
        monthly[category.id] = String(entries.reduce((sum, entry) => sum + Number(entry.quantity || 0), 0));
        entries.forEach((entry) => {
          const date = String(entry.entry_date).slice(0, 10);
          if (rows[category.id] && Object.hasOwn(rows[category.id], date)) rows[category.id][date] = String(entry.quantity);
        });
      }));

      setMonthlyValues(monthly);
      setDailyRows(rows);
      setDirty(false);
      setState({ loading: false, saving: false, error: null });
    } catch (error) {
      setState({ loading: false, saving: false, error });
      setNotice({ type: "error", message: error.message });
    }
  }, [api, dailyToggle, module, month]);

  useEffect(() => { loadPage(); }, [loadPage]);
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

  function changeMonth(nextMonth) {
    if (!confirmDiscard()) return;
    setMonth(nextMonth);
    setNotice(null);
  }

  function cancelEdit() {
    if (!confirmDiscard()) return;
    loadPage();
  }

  function exportCurrentCsv() {
    const header = mode === "monthly"
      ? ["month", ...categories.map((category) => category.name_th)]
      : ["date", ...categories.map((category) => category.name_th)];
    const rows = mode === "monthly"
      ? [[month, ...categories.map((category) => monthlyValues[category.id] ?? "0")]]
      : days.map((day) => [day.date, ...categories.map((category) => dailyRows[category.id]?.[day.date] ?? "")]);
    downloadCsv(`${module}_${month}_${mode}.csv`, [header, ...rows]);
  }

  async function importCurrentCsv(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!canEdit) {
      setNotice({ type: "error", message: "คุณไม่มีสิทธิ์ Import ข้อมูล" });
      return;
    }
    if (dirty && !window.confirm("Import CSV จะแทนค่าบนหน้าจอปัจจุบัน ต้องการดำเนินการต่อหรือไม่?")) return;
    try {
      const rows = parseSimpleCsv(await readCsvText(file));
      if (rows.length < 2) throw new Error("CSV ไม่มีข้อมูล");
      const body = rows.slice(1);
      if (mode === "monthly") {
        const next = { ...monthlyValues };
        categories.forEach((category, index) => {
          if (body[0]?.[index + 1] !== undefined) next[category.id] = body[0][index + 1];
        });
        setMonthlyValues(next);
      } else {
        const next = { ...dailyRows };
        body.forEach((row) => {
          const date = row[0];
          if (!date || !date.startsWith(`${month}-`)) return;
          categories.forEach((category, index) => {
            next[category.id] = { ...(next[category.id] || {}), [date]: row[index + 1] ?? "" };
          });
        });
        setDailyRows(next);
      }
      setDirty(true);
      setNotice({ type: "success", message: `นำเข้า CSV ${file.name} แล้ว กรุณาตรวจสอบก่อนบันทึก` });
    } catch (error) {
      setNotice({ type: "error", message: error.message || "นำเข้า CSV ไม่สำเร็จ" });
    }
  }

  function updateMonthly(categoryId, value) {
    setMonthlyValues((current) => ({ ...current, [categoryId]: value }));
    setDirty(true);
    setNotice(null);
  }

  function updateDaily(categoryId, date, value) {
    setDailyRows((current) => ({
      ...current,
      [categoryId]: { ...(current[categoryId] || {}), [date]: value }
    }));
    setDirty(true);
    setNotice(null);
  }

  function validateAll() {
    for (const category of categories) {
      if (mode === "monthly") {
        const error = validateNumberValue(monthlyValues[category.id], policy, { label: category.name_th, required: true, allowZero: true });
        if (error) return error;
      } else {
        for (const day of days) {
          const value = dailyRows[category.id]?.[day.date] ?? "";
          if (value === "") continue;
          const error = validateNumberValue(value, policy, { label: `${category.name_th} วันที่ ${day.day}`, allowZero: true });
          if (error) return error;
        }
      }
    }
    return null;
  }

  async function saveAll() {
    if (!canEdit) {
      setNotice({ type: "error", message: "คุณไม่มีสิทธิ์บันทึกข้อมูล" });
      return;
    }
    const error = validateAll();
    if (error) {
      setNotice({ type: "error", message: error });
      return;
    }
    setState((current) => ({ ...current, saving: true, error: null }));
    try {
      await Promise.all(categories.map((category) => {
        const entries = mode === "monthly"
          ? [{ date: firstDateOfMonth(month), quantity: parseNumberValue(monthlyValues[category.id], 0), note: "บันทึกจากฟอร์มรายเดือน" }]
          : days
              .map((day) => ({ date: day.date, quantity: dailyRows[category.id]?.[day.date] ?? "" }))
              .filter((item) => item.quantity !== "")
              .map((item) => ({ date: item.date, quantity: parseNumberValue(item.quantity, 0), note: null }));
        return api.request("/api/daily-entries/month", {
          method: "POST",
          body: { categoryId: category.id, month, entries }
        });
      }));
      setDirty(false);
      setNotice({ type: "success", message: `บันทึก ${title} เดือน ${monthLabelThai(month)} สำเร็จ` });
      await loadPage();
    } catch (saveError) {
      setState((current) => ({ ...current, saving: false, error: saveError }));
      setNotice({ type: "error", message: saveError.message });
    }
  }

  return (
    <>
      <section className="page-heading task-entry-heading unified-entry-heading">
        <div>
          <p className="eyebrow">กรอกข้อมูล</p>
          <h1>{title}</h1>
          <p>{description}</p>
        </div>
        <span className={`role-access ${canEdit ? "can-edit" : "read-only"}`}>{canEdit ? "เพิ่มและแก้ไขได้" : "ดูข้อมูลเท่านั้น"}</span>
      </section>

      <Notice notice={notice} onClose={() => setNotice(null)} />

      <section className="task-entry-card unified-entry-card">
        <div className="task-entry-toolbar unified-entry-toolbar">
          <label>ปี/เดือน พ.ศ.
            <input type="month" value={month} max={currentMonthValue()} onChange={(event) => changeMonth(event.target.value)} disabled={state.saving} />
          </label>
          <div className="operator-hint">
            <span>เลือกเดือน → กรอกตัวเลข → ตรวจยอดรวม → กดบันทึก</span>
          </div>
          {dailyToggle && (
            <label className="task-toggle">
              <span>กรอกยอดสถิติแบบรายวัน (สะสมเป็นยอดรวม)</span>
              <input type="checkbox" checked={mode === "daily"} onChange={(event) => setMode(event.target.checked ? "daily" : "monthly")} disabled={state.saving} />
              <i />
            </label>
          )}
        </div>

        {state.loading ? <div className="daily-loading"><span className="spinner" /> กำลังโหลดข้อมูล...</div> : categories.length === 0 ? (
          <div className="task-empty-state">
            <strong>ยังไม่มีประเภทข้อมูลที่เปิดใช้งาน</strong>
            <span>กรุณาเพิ่ม Master Data ของเมนูนี้ก่อนเริ่มกรอกข้อมูล</span>
          </div>
        ) : (
          <>
            {mode === "monthly" ? (
              <div className="task-monthly-grid">
                {categories.map((category) => (
                  <label key={category.id}>{category.name_th} ({category.unit})
                    <input type="number" min="0" step="1" inputMode="numeric" value={monthlyValues[category.id] ?? "0"} onChange={(event) => updateMonthly(category.id, event.target.value)} disabled={!canEdit || state.saving} />
                  </label>
                ))}
              </div>
            ) : (
              <div className="task-daily-grid">
                {days.map((day) => (
                  <article key={day.date} className="task-day-card">
                    <strong>วันที่ {day.day}</strong>
                    {categories.map((category) => (
                      <label key={category.id}>{category.name_th}
                        <input type="number" min="0" step="1" inputMode="numeric" value={dailyRows[category.id]?.[day.date] ?? ""} onChange={(event) => updateDaily(category.id, day.date, event.target.value)} disabled={!canEdit || state.saving || day.future} />
                      </label>
                    ))}
                  </article>
                ))}
              </div>
            )}

            <div className="task-total-bar">
              <strong>รวมทั้งหมด: {formatCount(monthTotal)}</strong>
              <span>{categories[0]?.unit || "หน่วย"}</span>
            </div>
          </>
        )}

        <div className="task-form-footer unified-form-footer operator-action-bar">
          <div className="advanced-menu">
            <button className="secondary-button" type="button" onClick={() => setAdvancedActionsOpen((current) => !current)} disabled={state.loading || state.saving}>
              ตัวเลือกเพิ่มเติม ▾
            </button>
            {advancedActionsOpen && (
              <div className="advanced-menu-panel" role="menu">
                <label className="advanced-upload-item">นำเข้า CSV<input type="file" accept=".csv,text/csv" hidden onChange={importCurrentCsv} disabled={state.saving || state.loading} /></label>
                <button type="button" onClick={exportCurrentCsv} disabled={state.loading}>ส่งออก CSV</button>
              </div>
            )}
          </div>
          <div className="operator-primary-actions">
            <button className="secondary-button" type="button" onClick={cancelEdit} disabled={state.loading || state.saving}>ยกเลิก</button>
            <button className="primary-button compact" type="button" onClick={saveAll} disabled={!canEdit || state.loading || state.saving}>{state.saving ? "กำลังบันทึก..." : monthlyButtonLabel}</button>
          </div>
        </div>
      </section>
    </>
  );
}

function blankRecycleRow(categories) {
  return { categoryId: categories[0]?.id || "", weightKg: "", pricePerKg: "", note: "" };
}

export function RecycleMultiRowPage() {
  const { api, permissions } = useOutletContext();
  const canEdit = permissions?.includes("manage_scrap_sales");
  const [month, setMonth] = useState(scrapCurrentMonthValue());
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [rows, setRows] = useState([]);
  const [open, setOpen] = useState(false);
  const [state, setState] = useState({ loading: true, saving: false, error: null });
  const [notice, setNotice] = useState(null);
  const [advancedActionsOpen, setAdvancedActionsOpen] = useState(false);
  const saleDate = `${month}-01`;
  const rowTotals = rows.map((row) => calculateAmount(row.weightKg, row.pricePerKg));
  const totalWeight = rows.reduce((sum, row) => sum + parseNumberValue(row.weightKg, 0), 0);
  const totalAmount = rowTotals.reduce((sum, amount) => sum + amount, 0);

  const loadPage = useCallback(async () => {
    setState({ loading: true, saving: false, error: null });
    try {
      const [categoryData, saleData] = await Promise.all([
        api.request("/api/master-data?module=scrap_material&status=active"),
        api.request(`/api/scrap-sales?month=${encodeURIComponent(month)}`)
      ]);
      const categoryItems = categoryData.items || [];
      setCategories(categoryItems);
      setItems(saleData.items || []);
      setRows([blankRecycleRow(categoryItems)]);
      setState({ loading: false, saving: false, error: null });
    } catch (error) {
      setState({ loading: false, saving: false, error });
      setNotice({ type: "error", message: error.message });
    }
  }, [api, month]);

  useEffect(() => { loadPage(); }, [loadPage]);

  function updateRow(index, patch) {
    setRows((current) => current.map((row, rowIndex) => rowIndex === index ? { ...row, ...patch } : row));
  }

  function addRow() {
    setRows((current) => [...current, blankRecycleRow(categories)]);
  }

  function removeRow(index) {
    setRows((current) => current.filter((_, rowIndex) => rowIndex !== index));
  }

  function exportRecycleCsv() {
    const saleRows = items.map((item) => [
      item.sale_date,
      item.category?.name_th || "",
      item.weight_kg,
      item.price_per_kg,
      item.amount
    ]);
    downloadCsv(`recycle_${month}.csv`, [["sale_date", "category", "weight_kg", "price_per_kg", "amount"], ...saleRows]);
  }

  async function importRecycleCsv(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!canEdit) {
      setNotice({ type: "error", message: "คุณไม่มีสิทธิ์ Import ข้อมูล" });
      return;
    }
    try {
      const parsed = parseSimpleCsv(await readCsvText(file)).slice(1);
      const nextRows = parsed.map((row) => {
        const categoryName = row[1] || row[0] || "";
        const category = categories.find((item) => item.name_th === categoryName || item.code === categoryName) || categories[0];
        return {
          categoryId: category?.id || "",
          weightKg: row[2] || row[1] || "",
          pricePerKg: row[3] || row[2] || "",
          note: ""
        };
      }).filter((row) => row.categoryId);
      if (!nextRows.length) throw new Error("ไม่พบรายการใน CSV");
      setRows(nextRows);
      setOpen(true);
      setNotice({ type: "success", message: `นำเข้า CSV ${file.name} แล้ว กรุณาตรวจสอบก่อนบันทึก` });
    } catch (error) {
      setNotice({ type: "error", message: error.message || "นำเข้า CSV ไม่สำเร็จ" });
    }
  }

  async function saveRows() {
    if (!canEdit) {
      setNotice({ type: "error", message: "คุณไม่มีสิทธิ์บันทึกรายการขาย" });
      return;
    }
    const payloadRows = rows.filter((row) => parseNumberValue(row.weightKg, 0) > 0);
    if (payloadRows.length === 0) {
      setNotice({ type: "error", message: "กรุณากรอกน้ำหนักอย่างน้อย 1 รายการ น้ำหนัก 0 จะไม่ถูกบันทึก" });
      return;
    }
    for (const row of payloadRows) {
      const error = validateScrapSaleForm({ saleDate, categoryId: row.categoryId, weightKg: row.weightKg, pricePerKg: row.pricePerKg, note: row.note }, month);
      if (error) {
        setNotice({ type: "error", message: error });
        return;
      }
    }
    if (rows.some((row) => row.weightKg !== "" && parseNumberValue(row.weightKg, 0) === 0) && !window.confirm("มีรายการที่น้ำหนักเป็น 0 ระบบจะไม่บันทึกรายการนั้น ต้องการดำเนินการต่อหรือไม่?")) return;

    setState((current) => ({ ...current, saving: true, error: null }));
    try {
      for (const row of payloadRows) {
        await api.request("/api/scrap-sales", {
          method: "POST",
          body: {
            saleDate,
            categoryId: row.categoryId,
            weightKg: parseNumberValue(row.weightKg),
            pricePerKg: parseNumberValue(row.pricePerKg),
            note: row.note || null
          }
        });
      }
      setOpen(false);
      setNotice({ type: "success", message: `บันทึกประวัติขาย Recycle ${payloadRows.length} รายการสำเร็จ` });
      await loadPage();
    } catch (error) {
      setState((current) => ({ ...current, saving: false, error }));
      setNotice({ type: "error", message: error.message });
    }
  }

  return (
    <>
      <section className="page-heading task-entry-heading unified-entry-heading">
        <div>
          <p className="eyebrow">กรอกข้อมูล</p>
          <h1>ขยะรีไซเคิล (รายเดือน)</h1>
          <p>เพิ่มประวัติขาย Recycle แบบหลายรายการในเดือนเดียว ระบบคำนวณน้ำหนักรวมและรายได้รวมให้อัตโนมัติ</p>
        </div>
        <span className={`role-access ${canEdit ? "can-edit" : "read-only"}`}>{canEdit ? "เพิ่มและแก้ไขได้" : "ดูข้อมูลเท่านั้น"}</span>
      </section>

      <Notice notice={notice} onClose={() => setNotice(null)} />

      <section className="task-entry-card unified-entry-card">
        <div className="task-table-heading unified-entry-toolbar">
          <div>
            <h2>ตารางการขายขยะรีไซเคิลรายเดือน</h2>
            <p>{monthLabelThai(month)}</p>
          </div>
          <div className="task-table-actions operator-action-bar">
            <input type="month" value={month} max={scrapCurrentMonthValue()} onChange={(event) => setMonth(event.target.value)} />
            <div className="advanced-menu">
              <button className="secondary-button" type="button" onClick={() => setAdvancedActionsOpen((current) => !current)} disabled={state.loading || state.saving}>ตัวเลือกเพิ่มเติม ▾</button>
              {advancedActionsOpen && (
                <div className="advanced-menu-panel" role="menu">
                  <label className="advanced-upload-item">นำเข้า CSV<input type="file" accept=".csv,text/csv" hidden onChange={importRecycleCsv} disabled={state.saving} /></label>
                  <button type="button" onClick={exportRecycleCsv} disabled={state.loading}>ส่งออก CSV</button>
                </div>
              )}
            </div>
            <button className="primary-button compact" type="button" onClick={() => setOpen(true)} disabled={!canEdit}>+ เพิ่มประวัติขาย Recycle</button>
          </div>
        </div>

        <div className="table-wrapper">
          <table className="app-table">
            <thead><tr><th>วันที่ขาย</th><th>ประเภทวัสดุ</th><th>น้ำหนัก</th><th>ราคา/กก.</th><th>รายได้</th></tr></thead>
            <tbody>
              {items.length ? items.map((item) => <tr key={item.id}><td>{item.sale_date}</td><td>{item.category?.name_th || "-"}</td><td>{formatQuantity(item.weight_kg, 2)} กก.</td><td>{formatMoney(item.price_per_kg)}</td><td><strong className="accent-money">฿{formatMoney(item.amount)}</strong></td></tr>) : <tr><td colSpan="5">ยังไม่มีรายการขายในเดือนนี้</td></tr>}
            </tbody>
          </table>
        </div>
      </section>

      {open && (
        <div className="task-modal-backdrop" role="dialog" aria-modal="true">
          <div className="task-modal unified-task-modal">
            <header><h2>เพิ่มประวัติขายขยะ Recycle</h2><button type="button" onClick={() => setOpen(false)} disabled={state.saving}>×</button></header>
            <div className="task-modal-body">
              <label>ปี/เดือน พ.ศ.<input type="month" value={month} max={scrapCurrentMonthValue()} onChange={(event) => setMonth(event.target.value)} disabled={state.saving} /></label>
              <div className="recycle-row-heading"><strong>รายการสินค้าขยะรีไซเคิลที่ขาย</strong><button className="secondary-button" type="button" onClick={addRow} disabled={state.saving}>+ เพิ่มแถวรายการใหม่</button></div>
              <div className="recycle-row-list">
                {rows.map((row, index) => (
                  <article key={index} className="recycle-entry-row">
                    <select value={row.categoryId} onChange={(event) => updateRow(index, { categoryId: event.target.value })} disabled={state.saving}>
                      {categories.map((category) => <option key={category.id} value={category.id}>{category.name_th}</option>)}
                    </select>
                    <input type="number" min="0" step="0.01" inputMode="decimal" placeholder="น้ำหนัก กก." value={row.weightKg} onChange={(event) => updateRow(index, { weightKg: event.target.value })} disabled={state.saving} />
                    <input type="number" min="0" step="0.01" inputMode="decimal" placeholder="ราคา/กก." value={row.pricePerKg} onChange={(event) => updateRow(index, { pricePerKg: event.target.value })} disabled={state.saving} />
                    <strong>฿{formatMoney(rowTotals[index] || 0)}</strong>
                    <button className="icon-danger-button" type="button" onClick={() => removeRow(index)} disabled={rows.length <= 1 || state.saving}>🗑</button>
                  </article>
                ))}
              </div>
              <div className="task-total-bar"><strong>น้ำหนักรวม: {formatQuantity(totalWeight, 2)} กก.</strong><span>รายได้รวม: ฿{formatMoney(totalAmount)}</span></div>
            </div>
            <footer><button className="secondary-button" type="button" disabled={state.saving} onClick={() => setOpen(false)}>ยกเลิก</button><button className="primary-button compact" type="button" disabled={state.saving} onClick={saveRows}>{state.saving ? "กำลังบันทึก..." : "บันทึกข้อมูล"}</button></footer>
          </div>
        </div>
      )}
    </>
  );
}


export function WetWastePorkPage() {
  const { api, permissions } = useOutletContext();
  const canEdit = permissions?.includes("manage_daily_data");
  const [month, setMonth] = useState(currentMonthValue());
  const [categories, setCategories] = useState([]);
  const [dogTotal, setDogTotal] = useState(0);
  const [pigValue, setPigValue] = useState("0");
  const [pigModalOpen, setPigModalOpen] = useState(false);
  const [draftPigValue, setDraftPigValue] = useState("0");
  const [state, setState] = useState({ loading: true, saving: false, error: null });
  const [notice, setNotice] = useState(null);
  const [advancedActionsOpen, setAdvancedActionsOpen] = useState(false);

  const dogCategory = categories.find((category) => categoryMatcher(category, ["DOG", "หมา", "สุนัข"])) || null;
  const pigCategory = categories.find((category) => categoryMatcher(category, ["PIG", "หมู"])) || null;
  const wetTotal = dogTotal + parseNumberValue(pigValue, 0);

  const loadPage = useCallback(async () => {
    setState({ loading: true, saving: false, error: null });
    try {
      const categoryData = await api.request("/api/master-data?module=animal_feed&status=active");
      const categoryItems = categoryData.items || [];
      const dog = categoryItems.find((category) => categoryMatcher(category, ["DOG", "หมา", "สุนัข"]));
      const pig = categoryItems.find((category) => categoryMatcher(category, ["PIG", "หมู"]));
      let dogSum = 0;
      let pigSum = 0;

      if (dog) {
        const dogData = await api.request(`/api/daily-entries?categoryId=${encodeURIComponent(dog.id)}&month=${encodeURIComponent(month)}`);
        dogSum = (dogData.items || []).reduce((sum, item) => sum + Number(item.quantity || 0), 0);
      }
      if (pig) {
        const pigData = await api.request(`/api/daily-entries?categoryId=${encodeURIComponent(pig.id)}&month=${encodeURIComponent(month)}`);
        pigSum = (pigData.items || []).reduce((sum, item) => sum + Number(item.quantity || 0), 0);
      }

      setCategories(categoryItems);
      setDogTotal(dogSum);
      setPigValue(String(pigSum));
      setDraftPigValue(String(pigSum));
      setState({ loading: false, saving: false, error: null });
    } catch (error) {
      setState({ loading: false, saving: false, error });
      setNotice({ type: "error", message: error.message });
    }
  }, [api, month]);

  useEffect(() => { loadPage(); }, [loadPage]);

  function exportWetCsv() {
    downloadCsv(`wet_waste_${month}.csv`, [
      ["month", "dog_food_daily_total_kg", "pig_food_monthly_kg", "wet_waste_total_kg"],
      [month, dogTotal, pigValue, wetTotal]
    ]);
  }

  async function importPigCsv(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!canEdit) {
      setNotice({ type: "error", message: "คุณไม่มีสิทธิ์ Import ข้อมูล" });
      return;
    }
    try {
      const rows = parseSimpleCsv(await readCsvText(file));
      const value = rows[1]?.[2] ?? rows[1]?.[1] ?? "";
      const error = validateNumberValue(value, numericPolicies.weight, { label: "อาหารหมู", required: true, allowZero: true });
      if (error) throw new Error(error);
      setDraftPigValue(value);
      setPigModalOpen(true);
      setNotice({ type: "success", message: `นำเข้า CSV ${file.name} แล้ว กรุณาตรวจสอบและกดบันทึก` });
    } catch (error) {
      setNotice({ type: "error", message: error.message || "นำเข้า CSV ไม่สำเร็จ" });
    }
  }

  async function savePigMonth() {
    if (!canEdit) {
      setNotice({ type: "error", message: "คุณไม่มีสิทธิ์บันทึกข้อมูลอาหารหมู" });
      return;
    }
    if (!pigCategory) {
      setNotice({ type: "error", message: "ไม่พบประเภทข้อมูลอาหารหมูใน Master Data" });
      return;
    }
    const error = validateNumberValue(draftPigValue, numericPolicies.weight, { label: "อาหารหมู", required: true, allowZero: true });
    if (error) {
      setNotice({ type: "error", message: error });
      return;
    }

    setState((current) => ({ ...current, saving: true, error: null }));
    try {
      await api.request("/api/daily-entries/month", {
        method: "POST",
        body: {
          categoryId: pigCategory.id,
          month,
          entries: [{ date: firstDateOfMonth(month), quantity: parseNumberValue(draftPigValue, 0), note: "บันทึกจากฟอร์มอาหารหมูรายเดือน" }]
        }
      });
      setPigModalOpen(false);
      setNotice({ type: "success", message: `บันทึกสถิติอาหารหมูเดือน ${monthLabelThai(month)} สำเร็จ` });
      await loadPage();
    } catch (error) {
      setState((current) => ({ ...current, saving: false, error }));
      setNotice({ type: "error", message: error.message });
    }
  }

  async function clearPigMonth() {
    if (!pigCategory) return;
    if (!window.confirm(`ลบข้อมูลอาหารหมูเดือน ${monthLabelThai(month)} หรือไม่?`)) return;
    setState((current) => ({ ...current, saving: true, error: null }));
    try {
      await api.request(`/api/daily-entries/month?categoryId=${encodeURIComponent(pigCategory.id)}&month=${encodeURIComponent(month)}`, { method: "DELETE" });
      setNotice({ type: "success", message: "ลบข้อมูลอาหารหมูรายเดือนแล้ว" });
      await loadPage();
    } catch (error) {
      setState((current) => ({ ...current, saving: false, error }));
      setNotice({ type: "error", message: error.message });
    }
  }

  return (
    <>
      <section className="page-heading task-entry-heading unified-entry-heading">
        <div>
          <p className="eyebrow">กรอกข้อมูล</p>
          <h1>ขยะเปียก & อาหารหมู</h1>
          <p>ตารางรวมอาหารหมาสะสมรายวันกับอาหารหมูรายเดือน เพื่อคำนวณยอดขยะเปียกทั้งหมด</p>
        </div>
        <span className={`role-access ${canEdit ? "can-edit" : "read-only"}`}>{canEdit ? "เพิ่มและแก้ไขได้" : "ดูข้อมูลเท่านั้น"}</span>
      </section>

      <Notice notice={notice} onClose={() => setNotice(null)} />

      <section className="task-entry-card unified-entry-card">
        <div className="task-table-heading unified-entry-toolbar">
          <div>
            <h2>ตารางสถิติขยะเปียก (อาหารหมา + อาหารหมู)</h2>
            <p>{monthLabelThai(month)}</p>
          </div>
          <div className="task-table-actions operator-action-bar">
            <input type="month" value={month} max={currentMonthValue()} onChange={(event) => setMonth(event.target.value)} disabled={state.saving} />
            <div className="advanced-menu">
              <button className="secondary-button" type="button" onClick={() => setAdvancedActionsOpen((current) => !current)} disabled={state.loading || state.saving}>ตัวเลือกเพิ่มเติม ▾</button>
              {advancedActionsOpen && (
                <div className="advanced-menu-panel" role="menu">
                  <label className="advanced-upload-item">นำเข้า CSV<input type="file" accept=".csv,text/csv" hidden onChange={importPigCsv} disabled={state.saving} /></label>
                  <button type="button" onClick={exportWetCsv} disabled={state.loading}>ส่งออก CSV</button>
                </div>
              )}
            </div>
            <button className="primary-button compact" type="button" onClick={() => { setDraftPigValue(pigValue); setPigModalOpen(true); }} disabled={!canEdit || state.loading}>+ เพิ่มสถิติอาหารหมูรายเดือน</button>
          </div>
        </div>

        {state.loading ? <div className="daily-loading"><span className="spinner" /> กำลังโหลดข้อมูล...</div> : (
          <div className="table-wrapper">
            <table className="app-table wet-waste-table">
              <thead>
                <tr>
                  <th>ปี/เดือน</th>
                  <th>อาหารหมาสะสม (กก.) [รายวัน]</th>
                  <th>อาหารหมู (กก.) [รายเดือน]</th>
                  <th>รวมขยะเปียกทั้งหมด (กก.)</th>
                  <th>จัดการอาหารหมู</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>{monthLabelThai(month)}</strong></td>
                  <td>{formatQuantity(dogTotal, 2)} กก.</td>
                  <td>{formatQuantity(pigValue, 2)} กก.</td>
                  <td><strong className="wet-total">{formatQuantity(wetTotal, 2)} กก.</strong></td>
                  <td><button className="text-button" type="button" onClick={() => { setDraftPigValue(pigValue); setPigModalOpen(true); }} disabled={!canEdit}>แก้ไข</button><button className="text-button danger-link" type="button" onClick={clearPigMonth} disabled={!canEdit || parseNumberValue(pigValue, 0) === 0}>ลบ</button></td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </section>

      {pigModalOpen && (
        <div className="task-modal-backdrop" role="dialog" aria-modal="true">
          <div className="task-modal unified-task-modal small-task-modal">
            <header><h2>เพิ่มสถิติอาหารหมูรายเดือน</h2><button type="button" onClick={() => setPigModalOpen(false)} disabled={state.saving}>×</button></header>
            <div className="task-modal-body">
              <label>ปี/เดือน พ.ศ.<input type="month" value={month} max={currentMonthValue()} onChange={(event) => setMonth(event.target.value)} disabled={state.saving} /></label>
              <label>อาหารหมู (กก.) [รายเดือน]<input type="number" min="0" step="0.01" inputMode="decimal" value={draftPigValue} onChange={(event) => setDraftPigValue(event.target.value)} disabled={state.saving} /></label>
              <div className="task-total-bar"><strong>อาหารหมาสะสม: {formatQuantity(dogTotal, 2)} กก.</strong><span>รวมหลังบันทึก: {formatQuantity(dogTotal + parseNumberValue(draftPigValue, 0), 2)} กก.</span></div>
            </div>
            <footer><button className="secondary-button" type="button" onClick={() => setPigModalOpen(false)} disabled={state.saving}>ยกเลิก</button><button className="primary-button compact" type="button" onClick={savePigMonth} disabled={state.saving}>{state.saving ? "กำลังบันทึก..." : "บันทึกข้อมูล"}</button></footer>
          </div>
        </div>
      )}
    </>
  );
}
