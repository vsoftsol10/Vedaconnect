export const buildTransactions = (income = [], expenses = []) => [
  ...income.map((item) => ({ id: `income-${item.id || item.userId}-${item.paidAt}`, date: item.paidAt, type: "Income", category: item.note || "Meeting fee collected", amount: Number(item.amount || 0) })),
  ...expenses.map((item) => ({ id: `expense-${item.id}`, date: item.date, type: "Expense", category: item.category, description: item.description, amount: Number(item.amount || 0) })),
].filter((item) => item.date).sort((a, b) => new Date(b.date) - new Date(a.date));
