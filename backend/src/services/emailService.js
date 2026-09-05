import { sendBrevoEmail } from "../config/brevoClient.js";

const ADMIN_EMAIL = process.env.ADMIN_NOTIFY_EMAIL;
const DEFAULT_FRONTEND_ORIGIN = "http://localhost:5173";

const escapeHtml = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const displayValue = (value) => {
  if (value === null || value === undefined || value === "") return "Not provided";
  return escapeHtml(value);
};

const formatCurrency = (value) => {
  if (value === null || value === undefined || value === "") return "Not available";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value));
};

const formatDateTime = (value) => {
  if (!value) return "Not available";
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Kolkata",
  }).format(new Date(value));
};

const formatDate = (value) => {
  if (!value) return "Not available";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  }).format(new Date(value));
};

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
  const crore = Math.floor(amount / 10000000);
  amount %= 10000000;
  const lakh = Math.floor(amount / 100000);
  amount %= 100000;
  const thousand = Math.floor(amount / 1000);
  amount %= 1000;
  const parts = [];
  if (crore) parts.push(`${belowThousand(crore)} Crore`);
  if (lakh) parts.push(`${belowThousand(lakh)} Lakh`);
  if (thousand) parts.push(`${belowThousand(thousand)} Thousand`);
  if (amount) parts.push(belowThousand(amount));
  return `Rupees ${parts.join(" ")} Only`;
};

const getFrontendOrigin = () => (process.env.FRONTEND_ORIGIN || DEFAULT_FRONTEND_ORIGIN).replace(/\/$/, "");

const getPaymentBreakdown = (profile = {}) => {
  const baseAmount = Number(profile.membershipBaseAmount || 0);
  const totalAmount = Number(profile.membershipAmount || 0);
  const gstAmount = Math.max(totalAmount - baseAmount, 0);

  return {
    baseAmount,
    gstAmount,
    totalAmount,
    gstPercent: Number(profile.membershipGstPercent || 0),
  };
};

const tableRow = (label, value) => `
  <tr>
    <td style="padding:10px 12px;border-bottom:1px solid #E8E1D3;color:#6B6258;width:38%;font-weight:bold;">${escapeHtml(label)}</td>
    <td style="padding:10px 12px;border-bottom:1px solid #E8E1D3;color:#1A1D23;">${value}</td>
  </tr>
`;

export const buildWelcomeCredentialsEmailContent = ({
  toEmail,
  fullName,
  memberId,
  tempPassword,
  profile = {},
  paymentMethod = "Razorpay",
  paymentReference,
}) => {
  const loginUrl = `${getFrontendOrigin()}/login`;
  const pricing = getPaymentBreakdown(profile);
  const planName = profile.membershipPlanName || profile.membershipType || "Membership";
  const planReceipt = `${escapeHtml(planName)} - ${formatCurrency(pricing.totalAmount)} (${formatCurrency(
    pricing.baseAmount
  )} + ${pricing.gstPercent || 18}% GST)`;
  const registeredAt = profile.registeredAt || profile.joinedAt || new Date();

  const memberHtml = `
    <div style="font-family: Arial, sans-serif; color:#1A1D23; max-width:560px;line-height:1.55;">
      <h2 style="margin:0 0 12px;">Welcome to VedaConnect, ${escapeHtml(fullName)}!</h2>
      <p>Your founding membership is now active.</p>
      <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;background:#FFF9EE;border:1px solid #E8E1D3;border-radius:8px;overflow:hidden;margin:18px 0;">
        ${tableRow("Membership", planReceipt)}
        ${tableRow("Member ID", escapeHtml(memberId))}
        ${tableRow("Login Email", escapeHtml(toEmail))}
        ${tableRow("Temporary Password", escapeHtml(tempPassword))}
      </table>
      <p>Please log in and change your password from your Profile page as soon as possible.</p>
      <p style="margin:24px 0;"><a href="${loginUrl}" style="display:inline-block;background:#F5A623;color:#1A1D23;padding:12px 22px;border-radius:8px;text-decoration:none;font-weight:bold;">Login to VedaConnect</a></p>
      <p style="font-size:13px;color:#6B6258;">If the button does not open, use this link: <a href="${loginUrl}" style="color:#8A5A00;">${loginUrl}</a></p>
    </div>
  `;

  const adminRows = [
    ["Full Name", displayValue(profile.fullName || fullName)],
    ["Email", displayValue(profile.email || toEmail)],
    ["Phone Number", displayValue(profile.phone)],
    ["Location", displayValue(profile.location)],
    ["Business Name", displayValue(profile.businessName)],
    ["Business Category", displayValue(profile.businessCategory)],
    ["Business Location", displayValue(profile.businessLocation)],
    ["Business Description", displayValue(profile.businessDescription)],
    ["Products/Services", displayValue(profile.productsServices)],
    ["Membership Type", displayValue(profile.membershipType)],
    ["Member ID", displayValue(profile.memberId || memberId)],
    ["Base Amount", formatCurrency(pricing.baseAmount)],
    ["GST", `${formatCurrency(pricing.gstAmount)} (${pricing.gstPercent || 18}%)`],
    ["Total Paid", formatCurrency(pricing.totalAmount)],
    ["Payment Method", displayValue(paymentMethod)],
    ["Payment Reference/ID", displayValue(paymentReference || profile.paymentReference)],
    ["Registration Date/Time", formatDateTime(registeredAt)],
    ["Business Certificate Uploaded", profile.certificates?.length ? "Yes" : "No"],
  ];

  const adminHtml = `
    <div style="font-family: Arial, sans-serif; color:#1A1D23; max-width:720px;line-height:1.5;">
      <h2 style="margin:0 0 8px;">New Member Payment Confirmed</h2>
      <p style="margin:0 0 18px;">${escapeHtml(fullName)} has completed payment and is now active as ${escapeHtml(memberId)}.</p>
      <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;border:1px solid #E8E1D3;border-radius:8px;overflow:hidden;">
        ${adminRows.map(([label, value]) => tableRow(label, value)).join("")}
      </table>
      <p style="font-size:13px;color:#6B6258;margin-top:16px;">Certificate review is separate; this email only confirms whether at least one certificate file exists.</p>
    </div>
  `;

  return { memberHtml, adminHtml };
};

export const sendWelcomeCredentialsEmail = async (params) => {
  const { toEmail, fullName, memberId } = params;
  const { memberHtml, adminHtml } = buildWelcomeCredentialsEmailContent(params);

  await sendBrevoEmail({
    to: toEmail,
    subject: "Welcome to VedaConnect - Your Login Details",
    htmlContent: memberHtml,
  });

  if (ADMIN_EMAIL) {
    await sendBrevoEmail({
      to: ADMIN_EMAIL,
      subject: `New Founding Member Activated: ${fullName} (${memberId})`,
      htmlContent: adminHtml,
    });
  }
};

export const buildPaymentInvoiceHtml = ({
  paymentType = "MEMBERSHIP",
  invoiceNumber,
  invoiceDate = new Date(),
  memberName,
  businessName,
  email,
  phone,
  address,
  itemName,
  membershipType,
  billingCycle,
  joinedAt,
  expiresAt,
  baseAmount,
  gstPercent = 18,
  gstAmount,
  totalAmount,
  paymentMethod,
  transactionId,
}) => {
  const isEvent = paymentType === "EVENT";
  const halfGstPercent = Number(gstPercent) / 2;
  const halfGstAmount = Number(gstAmount || 0) / 2;
  const itemHeading = isEvent ? "Event Registration" : "Founding Membership";
  const detailHeading = isEvent ? "Event Details" : "Membership Details";
  const feeLabel = isEvent ? "Event Fee" : "Founding Membership Fee";
  const typeLabel = isEvent ? "Event" : "Membership Type";

  return `
    <div style="font-family:Arial,'Helvetica Neue',sans-serif;color:#101820;max-width:920px;margin:0 auto;background:#ffffff;border:1px solid #eeeeee;position:relative;overflow:hidden;">
      <div style="height:56px;background:linear-gradient(135deg,#00552e 0,#00552e 32px,#f7b718 32px,#f7b718 44px,transparent 44px);"></div>
      <div style="padding:22px 44px 20px;">
        <div style="display:flex;justify-content:space-between;gap:32px;align-items:flex-start;">
          <div style="max-width:440px;">
            <h1 style="margin:0 0 10px;color:#00552e;font-size:28px;font-weight:800;letter-spacing:.2px;">V SOFT SOLUTIONS</h1>
            <p style="margin:0 0 10px;font-size:16px;font-weight:800;">GSTIN 33CIEPB9324G1ZL</p>
            <p style="margin:0;font-size:16px;line-height:1.55;">93/2, 2 Floor, Lakshmi complex<br/>North Byepassroad, Tirunelveli<br/>Tirunelveli, TAMIL NADU, 627003</p>
          </div>
          <div style="text-align:right;min-width:300px;">
            <div style="font-size:42px;line-height:1;color:#43b02a;margin-bottom:8px;">⌄⌄</div>
            <h2 style="margin:0;color:#111;font-size:36px;font-weight:800;letter-spacing:-.5px;"><span style="color:#f7b718;">V</span>edaconnect</h2>
            <p style="margin:8px 0 0;font-size:18px;color:#222;">Connect | Collaborate | Grow</p>
          </div>
        </div>
        <p style="margin:28px 0 0;font-size:14px;line-height:1.7;"><b>Mobile</b> +91 9095422237, 82707 67468 &nbsp;&nbsp; | &nbsp;&nbsp; <b>Email</b> vedaconnecttvl@gmail.com &nbsp;&nbsp; | &nbsp;&nbsp; <b>Website</b> www.vedaconnectcommunity.in</p>
      </div>

      <div style="height:1px;background:#d6d6d6;margin:0 44px;"></div>

      <div style="padding:30px 44px 26px;display:grid;grid-template-columns:1fr 1fr;gap:34px;">
        <div style="padding-right:30px;border-right:1px solid #d0d0d0;">
          <h3 style="margin:0 0 24px;color:#00552e;font-size:20px;font-weight:800;">TAX INVOICE</h3>
          <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;font-size:15px;">
            ${tableRow("Invoice No.", escapeHtml(invoiceNumber))}
            ${tableRow("Invoice Date", escapeHtml(formatDate(invoiceDate)))}
            ${tableRow("Place of Supply", "Tamil Nadu (33)")}
            ${tableRow(isEvent ? "Payment Type" : "Membership Type", escapeHtml(membershipType || itemName))}
            ${!isEvent ? tableRow("Joined Date", escapeHtml(formatDate(joinedAt))) : ""}
            ${!isEvent ? tableRow("Renewal Date", escapeHtml(formatRenewalDate({ expiresAt, billingCycle }))) : ""}
          </table>
        </div>
        <div>
          <h3 style="margin:0 0 24px;color:#00552e;font-size:20px;font-weight:800;">BILL TO</h3>
          <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;font-size:15px;">
            ${tableRow("Member Name", displayValue(memberName))}
            ${tableRow("Business Name", displayValue(businessName))}
            ${tableRow("Email", displayValue(email))}
            ${tableRow("Phone", displayValue(phone))}
            ${tableRow("Address", displayValue(address))}
          </table>
        </div>
      </div>

      <div style="padding:0 38px 24px;">
        <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;border:1px solid #d8ded7;border-radius:6px;overflow:hidden;font-size:15px;">
          <thead>
            <tr style="background:#00552e;color:#fff;">
              <th style="padding:12px 14px;text-align:center;width:42px;">#</th>
              <th style="padding:12px 18px;text-align:left;">Item</th>
              <th style="padding:12px 14px;text-align:right;width:110px;">MRP</th>
              <th style="padding:12px 14px;text-align:right;width:130px;">Selling Price</th>
              <th style="padding:12px 14px;text-align:center;width:70px;">Qty</th>
              <th style="padding:12px 14px;text-align:right;width:120px;">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="padding:18px 14px;text-align:center;vertical-align:top;border-right:1px solid #d8ded7;">1</td>
              <td style="padding:18px 18px;vertical-align:top;border-right:1px solid #d8ded7;">
                <p style="font-weight:800;font-size:18px;margin:0 0 18px;">${escapeHtml(itemHeading)}</p>
                <p style="margin:0 0 8px;color:#00552e;font-weight:800;">${detailHeading}</p>
                <ul style="margin:0 0 18px 18px;padding:0;line-height:1.7;">
                  <li>${feeLabel}: ${formatCurrency(baseAmount)}</li>
                  <li>${typeLabel}: ${escapeHtml(isEvent ? itemName : membershipType || itemName)}</li>
                </ul>
                <p style="margin:0 0 8px;color:#00552e;font-weight:800;">Community Benefits</p>
                <ul style="margin:0 0 18px 18px;padding:0;line-height:1.7;">
                  <li>Benefits: Connect • Collaborate • Grow</li>
                  <li>Business Networking & Collaboration Opportunities</li>
                </ul>
                <p style="margin:0 0 8px;color:#00552e;font-weight:800;">GST Details</p>
                <ul style="margin:0 0 0 18px;padding:0;line-height:1.7;">
                  <li>SGST @ ${halfGstPercent}%: ${formatCurrency(halfGstAmount)}</li>
                  <li>CGST @ ${halfGstPercent}%: ${formatCurrency(halfGstAmount)}</li>
                  <li>Total GST @ ${gstPercent}%: ${formatCurrency(gstAmount)}</li>
                </ul>
                <p style="margin:18px 0 0;font-size:19px;font-weight:800;">Total Payable: <span style="color:#00552e;">${formatCurrency(totalAmount)}</span></p>
              </td>
              <td style="padding:18px 14px;text-align:right;vertical-align:top;border-right:1px solid #d8ded7;">${formatCurrency(totalAmount)}</td>
              <td style="padding:18px 14px;text-align:right;vertical-align:top;border-right:1px solid #d8ded7;">${formatCurrency(totalAmount)}</td>
              <td style="padding:18px 14px;text-align:center;vertical-align:top;border-right:1px solid #d8ded7;">1</td>
              <td style="padding:18px 14px;text-align:right;vertical-align:top;">${formatCurrency(totalAmount)}</td>
            </tr>
            <tr style="background:#f3f8f0;">
              <td colspan="5" style="padding:14px 18px;text-align:right;font-weight:800;font-size:18px;">Total</td>
              <td style="padding:14px;text-align:right;font-weight:800;font-size:20px;color:#00552e;">${formatCurrency(totalAmount)}</td>
            </tr>
          </tbody>
        </table>

        <p style="margin:16px 0 24px;font-size:14px;"><b>Amount in Words:</b> <i>${escapeHtml(numberToIndianWords(totalAmount))}</i></p>

        <div style="border-top:1px solid #d6d6d6;padding-top:20px;">
          <h3 style="margin:0 0 14px;color:#00552e;font-size:18px;font-weight:800;border-bottom:4px solid #f7b718;display:inline-block;padding-bottom:5px;">PAYMENT DETAILS</h3>
          <table role="presentation" cellpadding="0" cellspacing="0" style="width:380px;border-collapse:collapse;font-size:14px;margin-top:8px;">
            ${tableRow("Payment Status", "<span style='background:#00552e;color:#fff;border-radius:14px;padding:3px 10px;font-size:12px;font-weight:800;'>PAID</span>")}
            ${tableRow("Payment Date", escapeHtml(formatDate(invoiceDate)))}
            ${tableRow("Payment Method", displayValue(paymentMethod))}
            ${tableRow("Transaction ID", displayValue(transactionId))}
          </table>
        </div>
        <p style="margin:28px 0 0;font-size:15px;">Thank you for your payment. Your ${isEvent ? "event registration" : "membership"} is now confirmed.</p>
      </div>
      <div style="height:72px;background:linear-gradient(135deg,transparent 0,transparent calc(100% - 120px),#f7b718 calc(100% - 120px),#f7b718 calc(100% - 106px),#00552e calc(100% - 106px),#00552e 100%);"></div>
    </div>
  `;
};

export const sendPaymentInvoiceEmail = async (params) => {
  const { buildInvoicePdfBuffer } = await import("./invoicePdfService.js");
  const pdfBuffer = await buildInvoicePdfBuffer(params);
  const dateParts = new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  }).formatToParts(new Date(params.invoiceDate));
  const day = dateParts.find((part) => part.type === "day")?.value || "01";
  const month = (dateParts.find((part) => part.type === "month")?.value || "Jan").replace(/\.$/, "").slice(0, 3);
  const year = dateParts.find((part) => part.type === "year")?.value || new Date().getFullYear();
  const dateStr = `${day}-${month}-${year}`;
  const safeName = (params.memberName || params.businessName || "Member")
    .trim()
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  const fileName = `Invoice_${safeName}_${dateStr}.pdf`;
  const htmlContent = `
    <div style="font-family:Arial,sans-serif;color:#1A1D23;line-height:1.55;">
      <p>Dear ${escapeHtml(params.memberName || "Member")},</p>
      <p>Thank you for your payment. Your VedaConnect tax invoice is attached as a PDF.</p>
      <p><strong>Invoice No:</strong> ${escapeHtml(params.invoiceNumber)}<br/>
      <strong>Total Paid:</strong> ${formatCurrency(params.totalAmount)}</p>
      <p>Regards,<br/>VedaConnect</p>
    </div>
  `;
  await sendBrevoEmail({
    to: params.email,
    subject: `VedaConnect Tax Invoice ${params.invoiceNumber}`,
    htmlContent,
    attachment: [{
      name: fileName,
      content: pdfBuffer.toString("base64"),
    }],
  });
  return { htmlContent, pdfBuffer };
};
