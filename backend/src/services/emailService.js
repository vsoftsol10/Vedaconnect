import { sendBrevoEmail } from "../config/brevoClient.js";

const ADMIN_EMAIL = process.env.ADMIN_NOTIFY_EMAIL;

export const sendWelcomeCredentialsEmail = async ({ toEmail, fullName, memberId, tempPassword }) => {
  const loginUrl = `${process.env.FRONTEND_ORIGIN}/login`;

  const memberHtml = `
    <div style="font-family: Arial, sans-serif; color:#1A1D23; max-width:480px;">
      <h2>Welcome to VedaConnect, ${fullName}!</h2>
      <p>Your founding membership is now active.</p>
      <p><strong>Member ID:</strong> ${memberId}</p>
      <p><strong>Login Email:</strong> ${toEmail}</p>
      <p><strong>Temporary Password:</strong> ${tempPassword}</p>
      <p>Please log in and change your password from your Profile page as soon as possible.</p>
      <p><a href="${loginUrl}" style="background:#F5A623;color:#1A1D23;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:bold;">Log in to VedaConnect</a></p>
    </div>
  `;

  await sendBrevoEmail({
    to: toEmail,
    subject: "Welcome to VedaConnect - Your Login Details",
    htmlContent: memberHtml,
  });

  if (ADMIN_EMAIL) {
    await sendBrevoEmail({
      to: ADMIN_EMAIL,
      subject: `New Founding Member Activated: ${fullName} (${memberId})`,
      htmlContent: `<p>${fullName} (${toEmail}) has completed payment and is now active as ${memberId}.</p>`,
    });
  }
};