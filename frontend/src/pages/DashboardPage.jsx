import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { AnalyticsChart } from "../components/analytics/AnalyticsChart.jsx";
import { analyticsPath, chartRows, comparisonPercentText, defaultAnalyticsFilters, formatNumber } from "../lib/analytics.js";

export function DashboardPage() {
  const { api } = useOutletContext();
  const defaults = useMemo(() => defaultAnalyticsFilters(), []);
  const [state, setState] = useState({ loading: true, waste: null, scrap: null, error: null });
  const load = useCallback(async () => {
    setState((current) => ({ ...current, loading: true, error: null }));
    try {
      const [waste, scrap] = await Promise.all([
        api.request(analyticsPath({ ...defaults, module: "waste", view: "yearly", metric: "quantity" })),
        api.request(analyticsPath({ ...defaults, module: "scrap_sales", view: "yearly", metric: "amount" }))
      ]);
      setState({ loading: false, waste, scrap, error: null });
    } catch (error) { setState({ loading: false, waste: null, scrap: null, error }); }
  }, [api, defaults]);
  useEffect(() => { load(); }, [load]);

  const wasteRows = chartRows(state.waste);
  const wasteCategories = state.waste?.categories || [];
  const wet = wasteCategories.find((item) => item.code === "WET_WASTE")?.total || 0;
  const recycle = wasteCategories.find((item) => item.code === "RECYCLE")?.total || 0;
  const rdf = wasteCategories.find((item) => item.code === "RDF")?.total || 0;

  return (
    <>
      <section className="page-heading executive-heading">
        <div><p className="eyebrow">Executive Dashboard</p><h1>ภาพรวมการจัดการขยะและทรัพยากร</h1><p>ข้อมูลปี {defaults.year} จากฐานข้อมูลจริงของ Central Krabi</p></div>
        <div className="page-heading-actions"><Link className="secondary-link" to="/daily-entry">บันทึกข้อมูล</Link><Link className="primary-link" to="/analytics">วิเคราะห์เชิงลึก</Link></div>
      </section>
      {state.error && <section className="connection-error"><div><h2>โหลด Dashboard ไม่สำเร็จ</h2><p>{state.error.message}</p></div><button className="primary-button compact" onClick={load}>ลองใหม่</button></section>}
      <section className="executive-kpi-grid">
        <article><span>ขยะรวม</span><strong>{formatNumber(state.waste?.kpis?.grandTotal)} <small>กก.</small></strong><em>{formatNumber((state.waste?.kpis?.grandTotal || 0) / 1000)} ตัน</em></article>
        <article><span>ขยะ RDF</span><strong>{formatNumber(rdf)} <small>กก.</small></strong><em>สีมาตรฐาน: ดำ</em></article>
        <article><span>ขยะเปียก</span><strong>{formatNumber(wet)} <small>กก.</small></strong><em>สีมาตรฐาน: เขียว</em></article>
        <article><span>Recycle</span><strong>{formatNumber(recycle)} <small>กก.</small></strong><em>สีมาตรฐาน: เหลือง</em></article>
        <article><span>รายได้เศษวัสดุ</span><strong>{formatNumber(state.scrap?.kpis?.grandTotal)} <small>บาท</small></strong><em>{comparisonPercentText(state.scrap?.comparison, { fallback: "ไม่มีฐานเปรียบเทียบ", suffix: " จากปีก่อน" })}</em></article>
      </section>
      <section className="executive-chart-grid">
        <article className="analytics-chart-card">
          <div className="card-heading"><div><p className="eyebrow">Waste trend</p><h2>แนวโน้มปริมาณขยะรายเดือน</h2></div><Link to="/analytics">ดูรายละเอียด</Link></div>
          {state.loading ? <div className="daily-loading"><span className="spinner" />กำลังโหลด...</div> : <AnalyticsChart data={state.waste} rows={wasteRows} chartType="line" showLegend showValues={false} includeTotal={false} />}
        </article>
        <article className="analytics-summary-card">
          <div className="card-heading"><div><p className="eyebrow">Executive insight</p><h2>สรุปสำหรับผู้บริหาร</h2></div></div>
          <div className="insight-list">
            <p><strong>ปริมาณสูงสุด:</strong> {formatNumber(state.waste?.kpis?.maximum)} กก. ใน {state.waste?.kpis?.maximumPeriod || "—"}</p>
            <p><strong>ค่าเฉลี่ยต่อเดือน:</strong> {formatNumber(state.waste?.kpis?.average)} กก.</p>
            <p><strong>รายได้เศษวัสดุรวม:</strong> {formatNumber(state.scrap?.kpis?.grandTotal)} บาท</p>
            <p><strong>สถานะข้อมูล:</strong> แสดงจากรายการที่บันทึกจริง ระบบไม่สร้างตัวเลขตัวอย่างแทนข้อมูล</p>
          </div>
        </article>
      </section>
    </>
  );
}
