import { autoDeleteExpiredSuspensions } from "../services/adminService.js";

const DAY_MS = 24 * 60 * 60 * 1000;

export const runMemberLifecycleJob = async () => {
  try {
    const result = await autoDeleteExpiredSuspensions();
    if (result.count) console.info(`[MEMBER_LIFECYCLE] Soft-deleted ${result.count} expired suspension(s).`);
    return result;
  } catch (error) {
    console.error("[MEMBER_LIFECYCLE] Failed", error);
    return { count: 0, error };
  }
};

export const scheduleMemberLifecycleJob = () => {
  runMemberLifecycleJob();
  return setInterval(runMemberLifecycleJob, DAY_MS);
};
