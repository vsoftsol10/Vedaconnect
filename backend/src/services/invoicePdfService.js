import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import PDFDocument from "pdfkit";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FONT_REGULAR = path.join(__dirname, "../assets/fonts/NotoSans-Regular.ttf");
const FONT_BOLD = path.join(__dirname, "../assets/fonts/NotoSans-Bold.ttf");
const LOGO_IMAGE = path.join(__dirname, "../assets/images/vedaconnect-logo.png");
let regularFontName = "Helvetica";
let boldFontName = "Helvetica-Bold";

const GREEN = "#1B4332";
const GOLD = "#F5A623";
const TEXT = "#111827";
const MUTED = "#4B5563";
const BORDER = "#D6D6D6";
const SOFT_GREEN = "#F2F7EF";

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value || 0));

const formatDate = (value) =>
  new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  }).format(new Date(value));

const isLifetimeBillingCycle = (billingCycle) =>
  Boolean(billingCycle && billingCycle.toUpperCase().includes("LIFETIME"));

const formatRenewalDate = ({ expiresAt, billingCycle }) => {
  if (isLifetimeBillingCycle(billingCycle)) return "Lifetime";
  return expiresAt ? formatDate(expiresAt) : "Not provided";
};

const numberToIndianWords = (value) => {
  const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
  const belowHundred = (num) => (num < 20 ? ones[num] : `${tens[Math.floor(num / 10)]}${num % 10 ? ` ${ones[num % 10]}` : ""}`);
  const belowThousand = (num) => {
    const hundred = Math.floor(num / 100);
    const rest = num % 100;
    return `${hundred ? `${ones[hundred]} Hundred` : ""}${hundred && rest ? " " : ""}${rest ? belowHundred(rest) : ""}`.trim();
  };

  let amount = Math.round(Number(value || 0));
  if (!amount) return "Rupees Zero Only";
  const parts = [];
  const crore = Math.floor(amount / 10000000);
  amount %= 10000000;
  const lakh = Math.floor(amount / 100000);
  amount %= 100000;
  const thousand = Math.floor(amount / 1000);
  amount %= 1000;
  if (crore) parts.push(`${belowThousand(crore)} Crore`);
  if (lakh) parts.push(`${belowThousand(lakh)} Lakh`);
  if (thousand) parts.push(`${belowThousand(thousand)} Thousand`);
  if (amount) parts.push(belowThousand(amount));
  return `Rupees ${parts.join(" ")} Only`;
};

const registerFonts = (doc) => {
  if (fs.existsSync(FONT_REGULAR) && fs.existsSync(FONT_BOLD)) {
    doc.registerFont("VedaSans", FONT_REGULAR);
    doc.registerFont("VedaSans-Bold", FONT_BOLD);
    regularFontName = "VedaSans";
    boldFontName = "VedaSans-Bold";
    return;
  }

  regularFontName = "Helvetica";
  boldFontName = "Helvetica-Bold";
};

const drawText = (doc, text, x, y, options = {}) => {
  doc
    .font(options.bold ? boldFontName : regularFontName)
    .fontSize(options.size || 10)
    .fillColor(options.color || TEXT)
    .text(String(text ?? ""), x, y, {
      width: options.width,
      align: options.align || "left",
      continued: options.continued || false,
      lineGap: options.lineGap || 0,
    });
};

const drawLabelValue = (doc, x, y, label, value, options = {}) => {
  drawText(doc, label, x, y, { size: options.size || 10, width: options.labelW || 96 });
  drawText(doc, ":", x + (options.colonX || 105), y, { size: options.size || 10, width: 8 });
  drawText(doc, value || "Not provided", x + (options.valueX || 128), y, {
    size: options.size || 10,
    width: options.valueW || 190,
    lineGap: 2,
  });
};

const drawLogo = (doc, x, y) => {
  try {
    doc.image(LOGO_IMAGE, x, y + 20, { width: 200 });
  } catch {
    drawText(doc, "VedaConnect", x, y + 46, { bold: true, size: 31, color: "#050505" });
  }
  drawText(doc, "Connect | Collaborate | Grow", x + 15, y + 84, {
    size: 12,
    color: "#1F2937",
    width: 200,
    align: "center",
  });
};

const drawTableFrame = (doc, x, y, widths, bodyH) => {
  const headerH = 29;
  const rowH = headerH + bodyH;
  const totalW = widths.reduce((sum, width) => sum + width, 0);
  const xs = widths.reduce((acc, width, i) => {
    acc.push(i === 0 ? x : acc[i - 1] + widths[i - 1]);
    return acc;
  }, []);

  doc.roundedRect(x, y, totalW, rowH + 30, 4).strokeColor(BORDER).lineWidth(0.6).stroke();
  doc.rect(x, y, totalW, headerH).fill(GREEN);
  ["#", "Item", "MRP", "Selling Price", "Qty", "Amount"].forEach((header, i) => {
    drawText(doc, header, xs[i] + 6, y + 8, {
      bold: true,
      size: 9.5,
      color: "#FFFFFF",
      width: widths[i] - 12,
      align: i === 1 ? "left" : "center",
    });
  });

  xs.slice(1).forEach((lineX) => {
    doc.moveTo(lineX, y).lineTo(lineX, y + rowH + 30).strokeColor(BORDER).lineWidth(0.6).stroke();
  });
  doc.moveTo(x, y + headerH).lineTo(x + totalW, y + headerH).strokeColor(BORDER).stroke();
  doc.moveTo(x, y + rowH).lineTo(x + totalW, y + rowH).strokeColor(BORDER).stroke();
  doc.rect(x, y + rowH, totalW, 30).fillOpacity(0.8).fill(SOFT_GREEN).fillOpacity(1);

  return { xs, headerH, totalY: y + rowH };
};

export const buildInvoicePdfBuffer = (data) =>
  new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 0 });
    // Layout is fixed/absolute-positioned to fit exactly one A4 page.
    // PDFKit's auto page-break incorrectly triggers on `continued: true` text
    // chains when margin is 0 — disable it since content is designed for one page.
    doc.addPage = function () { return doc; };
    const chunks = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    try {
      registerFonts(doc);

      const isEvent = data.paymentType === "EVENT";
      const pageW = 595.28;
      const pageH = 841.89;
      const marginX = 36;
      const contentW = pageW - marginX * 2;
      const baseAmount = Number(data.baseAmount || 0);
      const gstPercent = Number(data.gstPercent || 18);
      const gstAmount = Number(data.gstAmount || 0);
      const totalAmount = Number(data.totalAmount || 0);
      const halfGstPercent = gstPercent / 2;
      const halfGstAmount = gstAmount / 2;
      const totalCurrency = formatCurrency(totalAmount);

      doc.polygon([0, 0], [66, 0], [0, 66]).fill(GREEN);
      doc.polygon([23, 0], [39, 0], [0, 39], [0, 23]).fill(GOLD);
      doc.polygon([pageW, pageH], [pageW - 94, pageH], [pageW, pageH - 94]).fill(GREEN);
      doc.polygon([pageW, pageH - 34], [pageW, pageH - 50], [pageW - 50, pageH], [pageW - 34, pageH]).fill(GOLD);

      drawText(doc, "V SOFT SOLUTIONS", marginX, 80, { bold: true, size: 18, color: GREEN });
      drawText(doc, "GSTIN 33CIEPB9324G1ZL", marginX, 112, { bold: true, size: 10.5 });
      drawText(doc, "93/2, 2 Floor, Lakshmi complex", marginX, 135, { size: 10.5 });
      drawText(doc, "North Byepassroad, Tirunelveli", marginX, 154, { size: 10.5 });
      drawText(doc, "Tirunelveli, TAMIL NADU, 627003", marginX, 173, { size: 10.5 });
      drawLogo(doc, 370, 34);

      drawText(doc, "Mobile", marginX, 209, { bold: true, size: 9, continued: true });
      drawText(doc, " +91 9095422237, 82707 67468    |    ", marginX + 35, 209, { size: 9, continued: true });
      drawText(doc, "Email", marginX + 222, 209, { bold: true, size: 9, continued: true });
      drawText(doc, " vedaconnecttvl@gmail.com    |    ", marginX + 250, 209, { size: 9, continued: true });
      drawText(doc, "Website", marginX + 390, 209, { bold: true, size: 9, continued: true });
      drawText(doc, " www.vedaconnectcommunity.in", marginX + 428, 209, { size: 9 });
      doc.moveTo(marginX, 236).lineTo(pageW - marginX, 236).strokeColor(BORDER).lineWidth(0.8).stroke();

      drawText(doc, "TAX INVOICE", marginX, 262, { bold: true, size: 14.5, color: GREEN });
      drawLabelValue(doc, marginX, 300, "Invoice No.", data.invoiceNumber);
      drawLabelValue(doc, marginX, 334, "Invoice Date", formatDate(data.invoiceDate));
      drawLabelValue(doc, marginX, 368, "Place of Supply", "Tamil Nadu (33)");
      drawLabelValue(doc, marginX, 402, isEvent ? "Payment Type" : "Membership Type", data.membershipType || data.itemName);
      if (!isEvent) {
        drawLabelValue(doc, marginX, 436, "Joined Date", data.joinedAt ? formatDate(data.joinedAt) : null);
        drawLabelValue(doc, marginX, 470, "Renewal Date", formatRenewalDate(data));
      }

      doc.moveTo(298, 258).lineTo(298, 428).strokeColor(BORDER).lineWidth(0.8).stroke();
      drawText(doc, "BILL TO", 318, 262, { bold: true, size: 14.5, color: GREEN });
      drawLabelValue(doc, 318, 300, "Member Name", data.memberName, { valueW: 165 });
      drawLabelValue(doc, 318, 334, "Business Name", data.businessName, { valueW: 165 });
      drawLabelValue(doc, 318, 368, "Email", data.email, { valueW: 165 });
      drawLabelValue(doc, 318, 402, "Phone", data.phone, { valueW: 165 });
      drawLabelValue(doc, 318, 436, "Address", data.address, { valueW: 165 });

      const tableY = 487;
      const widths = [26, 244, 74, 78, 54, 86];
      const bodyH = 251;
      const { xs, headerH, totalY } = drawTableFrame(doc, marginX, tableY, widths, bodyH);
      const bodyTop = tableY + headerH;

      drawText(doc, "1", xs[0] + 6, bodyTop + 14, { size: 10, width: widths[0] - 12, align: "center" });
      let y = bodyTop + 13;
      drawText(doc, isEvent ? "Event Registration" : "Member Onboarding", xs[1] + 12, y, { bold: true, size: 11.5, width: widths[1] - 24 });
      y += 30;
      drawText(doc, isEvent ? "Event Details" : "Membership Details", xs[1] + 12, y, { bold: true, size: 9.3, color: GREEN });
      y += 17;
      drawText(doc, `• ${isEvent ? "Event Fee" : "Membership Onboarding Fee"}: ${formatCurrency(baseAmount)}`, xs[1] + 16, y, { size: 9.2, width: widths[1] - 28 });
      y += 17;
      drawText(doc, `• ${isEvent ? "Event" : "Membership Type"}: ${isEvent ? data.itemName : data.membershipType || data.itemName}`, xs[1] + 16, y, { size: 9.2, width: widths[1] - 28 });
      y += 29;
      drawText(doc, "Community Benefits", xs[1] + 12, y, { bold: true, size: 9.3, color: GREEN });
      y += 17;
      drawText(doc, "• Benefits: Connect • Collaborate • Grow", xs[1] + 16, y, { size: 9.2, width: widths[1] - 28 });
      y += 17;
      drawText(doc, "• Business Networking & Collaboration Opportunities", xs[1] + 16, y, { size: 9.2, width: widths[1] - 28 });
      y += 29;
      drawText(doc, "GST Details", xs[1] + 12, y, { bold: true, size: 9.3, color: GREEN });
      y += 17;
      drawText(doc, `• SGST @ ${halfGstPercent}%: ${formatCurrency(halfGstAmount)}`, xs[1] + 16, y, { size: 9.2 });
      y += 17;
      drawText(doc, `• CGST @ ${halfGstPercent}%: ${formatCurrency(halfGstAmount)}`, xs[1] + 16, y, { size: 9.2 });
      y += 17;
      drawText(doc, `• Total GST @ ${gstPercent}%: ${formatCurrency(gstAmount)}`, xs[1] + 16, y, { size: 9.2 });
      y += 29;
      drawText(doc, "Total Payable: ", xs[1] + 12, y, { bold: true, size: 11.5, continued: true });
      drawText(doc, totalCurrency, xs[1] + 91, y, { bold: true, size: 11.5, color: GREEN });

      [2, 3, 5].forEach((i) => {
        drawText(doc, totalCurrency, xs[i] + 8, bodyTop + 14, {
          size: 10,
          width: widths[i] - 16,
          align: "right",
        });
      });
      drawText(doc, "1", xs[4] + 8, bodyTop + 14, { size: 10, width: widths[4] - 16, align: "center" });
      drawText(doc, "Total", marginX, totalY + 8, {
        bold: true,
        size: 12,
        width: contentW - widths[5] - 14,
        align: "right",
      });
      drawText(doc, totalCurrency, xs[5] + 8, totalY + 6, {
        bold: true,
        size: 14,
        color: GREEN,
        width: widths[5] - 16,
        align: "right",
      });

      drawText(doc, "Amount in Words:", marginX, totalY + 47, { bold: true, size: 8.6 });
      drawText(doc, numberToIndianWords(totalAmount), marginX + 90, totalY + 47, {
        size: 8.6,
        color: MUTED,
        width: 390,
      });
      doc.moveTo(marginX, totalY + 70).lineTo(pageW - marginX, totalY + 70).strokeColor(BORDER).lineWidth(0.7).stroke();

      const payY = totalY + 89;
      drawText(doc, "PAYMENT DETAILS", marginX, payY, { bold: true, size: 12.5, color: GREEN });
      doc.moveTo(marginX, payY + 18).lineTo(marginX + 72, payY + 18).strokeColor(GOLD).lineWidth(2).stroke();
      drawText(doc, "Payment Status", marginX + 20, payY + 36, { size: 9 });
      drawText(doc, ":", marginX + 116, payY + 36, { size: 9 });
      doc.roundedRect(marginX + 145, payY + 32, 34, 15, 7).fill(GREEN);
      drawText(doc, "PAID", marginX + 151, payY + 34, { bold: true, size: 7.6, color: "#FFFFFF" });
      drawLabelValue(doc, marginX + 20, payY + 57, "Payment Date", formatDate(data.invoiceDate), { size: 9, colonX: 96, valueX: 125 });
      drawLabelValue(doc, marginX + 20, payY + 78, "Payment Method", data.paymentMethod, { size: 9, colonX: 96, valueX: 125 });
      drawLabelValue(doc, marginX + 20, payY + 99, "Transaction ID", data.transactionId, { size: 9, colonX: 96, valueX: 125, valueW: 250 });

      doc.rect(0, pageH - 35, pageW, 35).fill("#F3F4F6");
      drawText(doc, `Thank you for your payment. Your ${isEvent ? "event registration" : "membership"} is now ${isEvent ? "confirmed" : "active"}.`, marginX, pageH - 24, {
        size: 9.5,
      });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
