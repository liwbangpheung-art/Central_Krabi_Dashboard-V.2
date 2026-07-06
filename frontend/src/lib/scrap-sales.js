import { bangkokTodayValue } from "./daily-entry.js";

export function todayValue(date = new Date()) {
  return bangkokTodayValue(date);
}

export function currentMonthValue(date = new Date()) {
  return todayValue(date).slice(0, 7);
}


export function lastDateInMonth(month) {
  const [year, monthNumber] = month.split("-").map(Number);
  const day = new Date(year, monthNumber, 0).getDate();
  return `${month}-${String(day).padStart(2, "0")}`;
}

export function firstDateInMonth(month) {
  const today = todayValue();
  return today.startsWith(`${month}-`) ? today : `${month}-01`;
}

export function formatMoney(value) {
  return Number(value || 0).toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function formatQuantity(value, maximumFractionDigits = 4) {
  return Number(value || 0).toLocaleString("th-TH", { maximumFractionDigits });
}

export function calculateAmount(weightKg, pricePerKg) {
  const weight = Number(weightKg);
  const price = Number(pricePerKg);
  if (!Number.isFinite(weight) || !Number.isFinite(price)) return 0;
  return Number((weight * price).toFixed(2));
}

export function validateScrapSaleForm(form, month) {
  if (!form.saleDate || !form.saleDate.startsWith(`${month}-`)) return "วันที่ขายต้องอยู่ในเดือนที่เลือก";
  if (form.saleDate > todayValue()) return "ไม่สามารถบันทึกรายการขายล่วงหน้าได้";
  if (!form.categoryId) return "กรุณาเลือกประเภทวัสดุ";
  const weight = Number(form.weightKg);
  if (!Number.isFinite(weight) || weight <= 0) return "กรุณากรอกน้ำหนักมากกว่า 0 กิโลกรัม";
  if (String(form.weightKg).split(".")[1]?.length > 2) return "น้ำหนักมีทศนิยมได้ไม่เกิน 2 ตำแหน่ง";
  if (form.pricePerKg === "" || form.pricePerKg === null || form.pricePerKg === undefined) return "กรุณากรอกราคาต่อกิโลกรัม หรือกดใช้ราคาตามวันที่";
  const price = Number(form.pricePerKg);
  if (!Number.isFinite(price) || price < 0) return "ราคาต่อกิโลกรัมต้องเป็น 0 หรือมากกว่า";
  if (String(form.pricePerKg).split(".")[1]?.length > 2) return "ราคามีทศนิยมได้ไม่เกิน 2 ตำแหน่ง";
  if ((form.note || "").trim().length > 500) return "หมายเหตุต้องไม่เกิน 500 ตัวอักษร";
  return null;
}
