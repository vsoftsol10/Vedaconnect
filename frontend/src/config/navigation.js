import { Building2, Calendar, CircleUser, CreditCard, Handshake, LayoutGrid, Receipt, Trophy, Users, WalletCards } from "lucide-react";

export const navigationItems = [
  { to: "/admin/dashboard", label: "Dashboard", icon: LayoutGrid, roles: ["ADMIN"], keywords: ["overview", "home"] },
  { to: "/admin/members", label: "Members", icon: Users, roles: ["ADMIN"], keywords: ["people", "business"] },
  { to: "/admin/hubs", label: "Hubs", icon: Building2, roles: ["ADMIN"], keywords: ["locations"] },
  { to: "/admin/events", label: "Events", icon: Calendar, roles: ["ADMIN"], keywords: ["meetings"] },
  { to: "/admin/leaderboard", label: "Awards", icon: Trophy, roles: ["ADMIN"], keywords: ["leaderboard", "referrals", "business"] },
  { to: "/admin/attendance", label: "Attendance", icon: Calendar, roles: ["ADMIN"], keywords: ["meeting", "present"] },
  { to: "/admin/meeting-fees", label: "Meeting Fees", icon: Receipt, roles: ["ADMIN"], keywords: ["fees", "payments"] },
  { to: "/admin/subscriptions", label: "Subscriptions", icon: CreditCard, roles: ["ADMIN"], keywords: ["plans"] },
  { to: "/admin/payment-history", label: "Payment History", icon: Receipt, roles: ["ADMIN"], keywords: ["pay", "invoices"] },
  { to: "/admin/expenses", label: "Expenses", icon: WalletCards, roles: ["ADMIN"], keywords: ["income", "finance"] },
  { to: "/admin/profile", label: "Profile", icon: CircleUser, roles: ["ADMIN"], keywords: ["account"] },
  { to: "/dashboard", label: "Dashboard", icon: LayoutGrid, roles: ["MEMBER"], keywords: ["overview", "home"] },
  { to: "/members", label: "Members", icon: Users, roles: ["MEMBER"], keywords: ["directory", "people"] },
  { to: "/networking", label: "Networking", icon: Handshake, roles: ["MEMBER"], keywords: ["referrals", "business"] },
  { to: "/events", label: "Events", icon: Calendar, roles: ["MEMBER"], keywords: ["meetings"] },
  { to: "/meeting-fee", label: "Meeting Fee", icon: CreditCard, roles: ["MEMBER"], keywords: ["fees", "payment"] },
  { to: "/meeting-expenses", label: "Meeting Expenses", icon: WalletCards, roles: ["MEMBER"], keywords: ["income", "expense", "finance"] },
  { to: "/profile", label: "Profile", icon: CircleUser, roles: ["MEMBER"], keywords: ["account", "settings"] },
];

export const itemsForRole = (role) => navigationItems.filter((item) => item.roles.includes(role));
