import * as expenseService from "../services/expenseService.js";
import { getMonthlyExpenseNotificationLogs, sendMonthlyExpenseSummaryForHub } from "../services/monthlyExpenseNotificationService.js";

export const create = async (req, res, next) => { try { res.status(201).json({ success: true, data: await expenseService.createExpense(req.validatedBody, req.user.userId, req.file) }); } catch (error) { next(error); } };
export const list = async (req, res, next) => { try { res.json({ success: true, data: await expenseService.getExpenses(req.validatedQuery) }); } catch (error) { next(error); } };
export const update = async (req, res, next) => { try { res.json({ success: true, data: await expenseService.updateExpense(req.params.id, req.validatedBody, req.file) }); } catch (error) { next(error); } };
export const remove = async (req, res, next) => { try { res.json({ success: true, data: await expenseService.deleteExpense(req.params.id) }); } catch (error) { next(error); } };
export const summary = async (req, res, next) => { try { const hubId = req.user.role === "ADMIN" ? req.validatedQuery.hubId : await expenseService.getMemberHubId(req.user.userId); const now = new Date(); const month = req.validatedQuery.month || now.getMonth() + 1; const year = req.validatedQuery.year || now.getFullYear(); res.json({ success: true, data: await expenseService.getMonthlySummary(hubId, month, year) }); } catch (error) { next(error); } };
export const notify = async (req, res, next) => { try { res.json({ success: true, data: await sendMonthlyExpenseSummaryForHub(req.validatedBody.hubId, req.validatedBody.month, req.validatedBody.year) }); } catch (error) { next(error); } };
export const notificationLogs = async (req, res, next) => { try { res.json({ success: true, data: await getMonthlyExpenseNotificationLogs(req.validatedQuery) }); } catch (error) { next(error); } };
