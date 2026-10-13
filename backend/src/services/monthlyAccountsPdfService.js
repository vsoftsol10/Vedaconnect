import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import PDFDocument from "pdfkit";
import { prisma } from "../config/prismaClient.js";
import { AppError } from "../middleware/errorHandler.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LOGO_IMAGE = path.join(__dirname, "../assets/images/vedaconnect-logo.png");
const PAGE = { width: 842, height: 595, margin: 34 };
const COLORS = { green: "#287A38", gold: "#FFC32B", paleGreen: "#E8F3E9", paleGold: "#FFF5D9", border: "#B7B7B7", text: "#111111", greenText: "#176B2A" };
const monthName = (month, year) => new Intl.DateTimeFormat("en-IN", { month: "long" }).format(new Date(year, month - 1, 1));
const money = (value) => new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 }).format(Number(value || 0));
const dateLabel = (value) => new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric", timeZone: "Asia/Kolkata" }).format(new Date(value));
const dateKey = (value) => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(value));
const getPaidDateRange = (month, year) => ({
  gte: new Date(`${year}-${String(month).padStart(2, "0")}-01T00:00:00+05:30`),
  lt: new Date(month === 12 ? `${year + 1}-01-01T00:00:00+05:30` : `${year}-${String(month + 1).padStart(2, "0")}-01T00:00:00+05:30`),
});

const setFont = (doc, bold = false) => doc.font(bold ? "Helvetica-Bold" : "Helvetica");

const drawSectionTitle = (doc, x, y, width, title, color) => {
  doc.fillColor(color).rect(x, y, width, 17).fill();
  setFont(doc, true);
  doc.fontSize(9).fillColor(color === COLORS.green ? "#FFFFFF" : "#111111").text(title, x + 3, y + 4, { width: width - 6, align: "center", lineBreak: false });
  return y + 17;
};

const drawTable = (doc, x, y, widths, headers, rows, options = {}) => {
  const totalWidth = widths.reduce((sum, width) => sum + width, 0);
  const headerHeight = 16;
  const rowHeight = options.rowHeight || 14;
  const drawHeader = (top) => {
    doc.fillColor(options.headerColor || "#F6F6F6").rect(x, top, totalWidth, headerHeight).fill();
    let left = x;
    headers.forEach((header, index) => {
      doc.rect(left, top, widths[index], headerHeight).lineWidth(0.35).strokeColor(COLORS.border).stroke();
      setFont(doc, true);
      doc.fontSize(7.5).fillColor(COLORS.text).text(header, left + 3, top + 4, { width: widths[index] - 6, align: options.headerAlign?.[index] || "left", lineBreak: false, ellipsis: true });
      left += widths[index];
    });
    return top + headerHeight;
  };
  let cursor = drawHeader(y);
  rows.forEach((row, rowIndex) => {
    if (cursor + rowHeight > PAGE.height - 28) {
      doc.addPage({ size: "A4", layout: "landscape", margin: PAGE.margin });
      cursor = drawHeader(38);
    }
    let left = x;
    const fill = row.fill || (rowIndex % 2 ? "#FAFAFA" : "#FFFFFF");
    doc.fillColor(fill).rect(x, cursor, totalWidth, rowHeight).fill();
    row.cells.forEach((cell, index) => {
      doc.rect(left, cursor, widths[index], rowHeight).lineWidth(0.35).strokeColor(COLORS.border).stroke();
      setFont(doc, row.bold);
      doc.fontSize(7.5).fillColor(row.amount && index === row.cells.length - 1 ? COLORS.greenText : COLORS.text)
        .text(String(cell ?? ""), left + 3, cursor + 3, { width: widths[index] - 6, align: options.align?.[index] || "left", lineBreak: false, ellipsis: true });
      left += widths[index];
    });
    cursor += rowHeight;
  });
  return cursor;
};

const drawSummaryRows = (doc, x, y, width, rows) => {
  let cursor = y;
  rows.forEach((row) => {
    doc.fillColor(COLORS.paleGreen).rect(x, cursor, width, 16).fill();
    doc.rect(x, cursor, width, 16).lineWidth(0.35).strokeColor(COLORS.border).stroke();
    setFont(doc, true);
    doc.fontSize(8).fillColor(COLORS.text).text(row.label, x + 4, cursor + 4, { width: width - 100, lineBreak: false });
    doc.text(row.value, x + width - 92, cursor + 4, { width: 88, align: "right", lineBreak: false });
    cursor += 16;
  });
  return cursor;
};

const drawHeader = (doc, hubName, month, year, meetingDates) => {
  if (fs.existsSync(LOGO_IMAGE)) doc.image(LOGO_IMAGE, PAGE.margin, 22, { width: 82 });
  setFont(doc, true);
  doc.fontSize(14).fillColor(COLORS.text).text(`VEDACONNECT ${hubName.toLocaleUpperCase()}`, 0, 24, { width: PAGE.width, align: "center", lineBreak: false });
  doc.fontSize(12).text(`${monthName(month, year).toLocaleUpperCase()} ${year} ACCOUNTS`, 0, 42, { width: PAGE.width, align: "center", lineBreak: false });
  setFont(doc);
  const meetingLine = meetingDates.length
    ? `Meetings held on ${meetingDates.map((date) => new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "long", year: "numeric", timeZone: "Asia/Kolkata" }).format(date)).join(", ")}`
    : "Monthly meeting fee income and expense statement";
  doc.fontSize(8).fillColor("#444444").text(meetingLine, PAGE.margin, 64, { width: PAGE.width - PAGE.margin * 2, align: "center", lineBreak: false });
};

export const buildMonthlyAccountsPdf = async ({ hubId, month, year }) => {
  if (!hubId || !month || !year) throw new AppError("Hub, month, and year are required.", 400);

  const [hub, expenses, payments] = await Promise.all([
    prisma.hub.findUnique({ where: { id: hubId }, select: { name: true } }),
    prisma.expense.findMany({
      where: { hubId, date: { gte: new Date(year, month - 1, 1), lt: new Date(year, month, 1) } },
      select: { date: true, category: true, description: true, amount: true },
      orderBy: [{ date: "asc" }, { createdAt: "asc" }],
    }),
    prisma.meetingFeePayment.findMany({
      where: { month: `${year}-${String(month).padStart(2, "0")}`, paymentStatus: "PAID", paidAt: getPaidDateRange(month, year), user: { memberProfile: { hubId } } },
      select: {
        amount: true, paymentMode: true, paymentSource: true, meetingWeek: true, paidAt: true,
        user: { select: { email: true, memberProfile: { select: { fullName: true, businessName: true } } } },
      },
      orderBy: [{ paidAt: "asc" }, { createdAt: "asc" }],
    }),
  ]);
  if (!hub) throw new AppError("Hub not found.", 404);

  const totalIncome = payments.reduce((total, item) => total + Number(item.amount), 0);
  const totalExpenses = expenses.reduce((total, item) => total + Number(item.amount), 0);
  const meetings = new Map();
  expenses.forEach((item) => {
    const key = dateKey(item.date);
    const current = meetings.get(key) || { date: item.date, total: 0 };
    current.total += Number(item.amount);
    meetings.set(key, current);
  });

  const doc = new PDFDocument({ size: "A4", layout: "landscape", margins: PAGE.margin, bufferPages: true });
  const chunks = [];
  doc.on("data", (chunk) => chunks.push(chunk));
  const result = new Promise((resolve, reject) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
  });

  drawHeader(doc, hub.name, month, year, [...meetings.values()].map((meeting) => meeting.date));
  const gap = 14;
  const colWidth = (PAGE.width - PAGE.margin * 2 - gap) / 2;
  const leftX = PAGE.margin;
  const rightX = leftX + colWidth + gap;
  const bodyY = 92;

  let leftY = drawSectionTitle(doc, leftX, bodyY, colWidth, "INCOME - MEMBER MEETING FEES", COLORS.green);
  const incomeRows = payments.length ? payments.map((payment, index) => ({
    cells: [
      String(index + 1),
      payment.user.memberProfile?.fullName || payment.user.email || "Member",
      payment.paymentSource === "MANUAL" ? `Manual fee (${payment.paymentMode || "other"})` : "Monthly meeting fee",
      money(payment.amount),
    ],
    amount: true,
  })) : [{ cells: ["-", "No meeting fees collected", "-", "0"] }];
  leftY = drawTable(doc, leftX, leftY, [28, 142, 147, colWidth - 317], ["S.No", "Member", "Details", "Amount (Rs.)"], incomeRows, { headerColor: COLORS.paleGreen, align: ["center", "left", "left", "right"], headerAlign: ["center", "left", "left", "right"] });
  leftY = drawSummaryRows(doc, leftX, leftY, colWidth, [{ label: "TOTAL INCOME", value: money(totalIncome) }]) + 14;

  leftY = drawSectionTitle(doc, leftX, leftY, colWidth, "MEETING-WISE EXPENSES", COLORS.gold);
  const meetingRows = [...meetings.values()].map((meeting, index) => ({
    cells: [String(index + 1), `Meeting ${index + 1}`, dateLabel(meeting.date), money(meeting.total)],
    amount: true,
  }));
  if (!meetingRows.length) meetingRows.push({ cells: ["-", "No meeting expenses", "-", "0"] });
  leftY = drawTable(doc, leftX, leftY, [28, 125, 143, colWidth - 296], ["S.No", "Meeting", "Date", "Expenses (Rs.)"], meetingRows, { headerColor: COLORS.paleGold, align: ["center", "left", "center", "right"], headerAlign: ["center", "left", "center", "right"] });
  leftY = drawSummaryRows(doc, leftX, leftY, colWidth, [{ label: "TOTAL", value: money(totalExpenses) }]) + 14;

  leftY = drawSectionTitle(doc, leftX, leftY, colWidth, "SUMMARY", COLORS.green);
  leftY = drawSummaryRows(doc, leftX, leftY, colWidth, [
    { label: "Total income", value: money(totalIncome) },
    { label: "Total expenses", value: money(totalExpenses) },
    { label: "Balance (income - expenses)", value: money(totalIncome - totalExpenses) },
  ]);
  setFont(doc);
  doc.fontSize(8).fillColor("#333333").text(totalExpenses > totalIncome ? `Expenses exceeded income by Rs. ${money(totalExpenses - totalIncome)}` : `Balance remaining: Rs. ${money(totalIncome - totalExpenses)}`, leftX, leftY + 5, { width: colWidth, lineBreak: false });

  const rightY = drawSectionTitle(doc, rightX, bodyY, colWidth, "EXPENSES", COLORS.gold);
  const expenseRows = expenses.length ? expenses.map((expense, index) => ({
    cells: [String(index + 1), dateLabel(expense.date), expense.category, expense.description, money(expense.amount)],
    amount: true,
  })) : [{ cells: ["-", "-", "-", "No expenses recorded", "0"] }];
  const rightBottom = drawTable(doc, rightX, rightY, [27, 76, 83, colWidth - 27 - 76 - 83 - 68, 68], ["S.No", "Meeting date", "Category", "Expense details", "Amount (Rs.)"], expenseRows, { headerColor: COLORS.paleGold, align: ["center", "center", "left", "left", "right"], headerAlign: ["center", "center", "left", "left", "right"] });
  drawSummaryRows(doc, rightX, rightBottom, colWidth, [{ label: "TOTAL EXPENSES", value: money(totalExpenses) }]);

  doc.end();
  const buffer = await result;
  return { buffer, filename: monthlyAccountsPdfFilename(hub.name, month, year) };
};

export const monthlyAccountsPdfFilename = (hubName, month, year) => {
  const safeHub = hubName.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "");
  return `Vedaconnect-${safeHub}-${monthName(month, year)}-${year}-Accounts.pdf`;
};
