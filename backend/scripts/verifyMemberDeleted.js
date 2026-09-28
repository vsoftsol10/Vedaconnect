import { prisma } from "../src/config/prismaClient.js";
import { supabaseStorage } from "../src/config/supabaseStorageClient.js";

const [userId, email] = process.argv.slice(2);

if (!userId || !email) {
  console.error("Usage: node scripts/verifyMemberDeleted.js <user-id> <email>");
  process.exitCode = 1;
} else {
  const normalizedEmail = email.toLowerCase();
  const listCertificateFiles = async (path) => {
    const { data, error } = await supabaseStorage.storage.from("business-certificates").list(path, { limit: 1000 });
    if (error) throw error;
    const files = [];
    for (const item of data || []) {
      const itemPath = `${path}/${item.name}`;
      if (item.id) files.push(itemPath);
      else files.push(...await listCertificateFiles(itemPath));
    }
    return files;
  };

  const findAuthUsers = async () => {
    const matches = [];
    for (let page = 1; ; page += 1) {
      const { data, error } = await supabaseStorage.auth.admin.listUsers({ page, perPage: 1000 });
      if (error) throw error;
      matches.push(...data.users.filter((user) => user.id === userId || user.email?.toLowerCase() === normalizedEmail));
      if (data.users.length < 1000) return matches;
    }
  };

  try {
    const [
      usersById, usersByEmail, memberProfiles, memberships, businessCertificates,
      eventRegistrations, notificationsToMember, notificationsAboutMember, birthdayReminders,
      manualPaymentSubmissions, referralsGiven, referralsReceived, businessReceived,
      businessReferred, meetingAttendance, meetingFeePayments, paymentInvoices, expenses,
      notificationLogs, whatsAppDeliveryLogs, emailDeliveryLogs, certificateFiles, authUsers,
    ] = await Promise.all([
      prisma.user.count({ where: { id: userId } }),
      prisma.user.count({ where: { email: { equals: email, mode: "insensitive" } } }),
      prisma.memberProfile.count({ where: { userId } }),
      prisma.membership.count({ where: { userId } }),
      prisma.businessCertificate.count({ where: { userId } }),
      prisma.eventRegistration.count({ where: { userId } }),
      prisma.notification.count({ where: { userId } }),
      prisma.notification.count({ where: { relatedUserId: userId } }),
      prisma.birthdayReminder.count({ where: { memberId: userId } }),
      prisma.manualPaymentSubmission.count({ where: { userId } }),
      prisma.referralGiven.count({ where: { giverId: userId } }),
      prisma.referralGiven.count({ where: { receiverId: userId } }),
      prisma.businessReceived.count({ where: { receiverId: userId } }),
      prisma.businessReceived.count({ where: { referrerId: userId } }),
      prisma.meetingAttendance.count({ where: { userId } }),
      prisma.meetingFeePayment.count({ where: { userId } }),
      prisma.paymentInvoice.count({ where: { userId } }),
      prisma.expense.count({ where: { createdBy: userId } }),
      prisma.notificationLog.count({ where: { memberId: userId } }),
      prisma.whatsAppDeliveryLog.count({ where: { memberId: userId } }),
      prisma.emailDeliveryLog.count({ where: { memberId: userId } }),
      listCertificateFiles(userId),
      findAuthUsers(),
    ]);

    const rows = {
      users_by_id: usersById,
      users_by_email: usersByEmail,
      member_profiles: memberProfiles,
      memberships: memberships,
      business_certificates: businessCertificates,
      event_registrations: eventRegistrations,
      notifications_to_member: notificationsToMember,
      notifications_about_member: notificationsAboutMember,
      birthday_reminders: birthdayReminders,
      manual_payment_submissions: manualPaymentSubmissions,
      referrals_given: referralsGiven,
      referrals_received: referralsReceived,
      business_received: businessReceived,
      business_referred: businessReferred,
      meeting_attendance: meetingAttendance,
      meeting_fee_payments: meetingFeePayments,
      payment_invoices: paymentInvoices,
      expenses: expenses,
      notification_logs: notificationLogs,
      whatsapp_delivery_logs: whatsAppDeliveryLogs,
      email_delivery_logs: emailDeliveryLogs,
    };
    console.log(JSON.stringify({ userId, email, remainingRows: rows, storage: { businessCertificates: certificateFiles }, authUsers: authUsers.map((user) => ({ id: user.id, email: user.email, createdAt: user.created_at })) }, null, 2));
  } finally {
    await prisma.$disconnect();
  }
}
