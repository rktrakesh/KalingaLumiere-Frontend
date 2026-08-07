import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { LayoutDashboard, Users, Clock, CalendarCheck, Calendar, Timer, CreditCard, Receipt, Wallet, Building2, UserCheck, ShoppingCart, ShoppingBag, Package, Factory, Settings, Lock, FileText, Search, ChevronDown, ChevronRight, Flame, X, Menu, Trophy, IndianRupee, ShieldCheck } from "lucide-react";
import { cn } from "@/utils/cn";
import { useAuthStore } from "@/store/authStore";
import { publicAssetUrl, useCompanyBranding } from "@/services/api/branding.api";
import { canAccessRoute, hasRole } from "@/utils/authorization";

interface NavItem {
  label: string;
  path?: string;
  icon: React.ReactNode;
  children?: NavItem[];
}

const navItems: NavItem[] = [
  { label: "Dashboard", path: "/dashboard", icon: <LayoutDashboard size={18} /> },
  {
    label: "HR",
    icon: <Users size={18} />,
    children: [
      { label: "Employees", path: "/employees", icon: <Users size={16} /> },
      { label: "Attendance", path: "/attendance", icon: <Clock size={16} /> },
      { label: "Leave", path: "/leave", icon: <CalendarCheck size={16} /> },
      { label: "Holidays", path: "/holidays", icon: <Calendar size={16} /> },
      { label: "Overtime", path: "/overtime", icon: <Timer size={16} /> },
    ],
  },
  {
    label: "Payroll",
    icon: <IndianRupee size={18} />,
    children: [
      { label: "Payroll Runs", path: "/payroll", icon: <IndianRupee size={16} /> },
      { label: "Loans", path: "/loans", icon: <CreditCard size={16} /> },
    ],
  },
  {
    label: "Commerce",
    icon: <ShoppingBag size={18} />,
    children: [
      { label: "Customers", path: "/customers", icon: <UserCheck size={16} /> },
      { label: "Sales", path: "/sales", icon: <ShoppingBag size={16} /> },
      { label: "Suppliers", path: "/suppliers", icon: <Building2 size={16} /> },
      { label: "Purchases", path: "/purchases", icon: <ShoppingCart size={16} /> },
    ],
  },
  {
    label: "Inventory",
    icon: <Package size={18} />,
    children: [
      { label: "Materials", path: "/inventory", icon: <Package size={16} /> },
      { label: "Production", path: "/production", icon: <Factory size={16} /> },
    ],
  },
  {
    label: "Finance",
    icon: <Wallet size={18} />,
    children: [
      { label: "Expenses", path: "/expenses", icon: <Receipt size={16} /> },
      { label: "Cashbook", path: "/cashbook", icon: <Wallet size={16} /> },
    ],
  },
  { label: "Reports", path: "/reports", icon: <FileText size={18} /> },
  { label: "Audit", path: "/audit", icon: <Search size={18} /> },
  { label: "Month Closing", path: "/month-closing", icon: <Lock size={18} /> },
  { label: "Settings", path: "/settings", icon: <Settings size={18} /> },
  { label: "User Management", path: "/user-management", icon: <ShieldCheck size={18} /> },
];

const visibleNavigation = (items: NavItem[], user: Parameters<typeof canAccessRoute>[0]): NavItem[] =>
  items.flatMap((item) => {
    if (item.path) return canAccessRoute(user, item.path) ? [item] : [];
    const children = visibleNavigation(item.children ?? [], user);
    return children.length ? [{ ...item, children }] : [];
  });

function NavItemComp({ item, collapsed, showLabels, onNavigate, onExpand }: { item: NavItem; collapsed: boolean; showLabels: boolean; onNavigate?: () => void; onExpand?: () => void }) {
  const location = useLocation();
  const isChildActive = item.children?.some((c) => c.path && location.pathname.startsWith(c.path));
  const [open, setOpen] = useState(isChildActive ?? false);
  const [openAfterExpand, setOpenAfterExpand] = useState(false);

  useEffect(() => {
    if (collapsed || !openAfterExpand) return;
    const timer = window.setTimeout(() => {
      setOpen(true);
      setOpenAfterExpand(false);
    }, 130);
    return () => window.clearTimeout(timer);
  }, [collapsed, openAfterExpand]);

  if (item.children) {
    return (
      <div>
        <button
          onClick={() => {
            if (collapsed) {
              setOpenAfterExpand(true);
              onExpand?.();
              return;
            }
            setOpen(!open);
          }}
          aria-expanded={!collapsed && open}
          aria-label={collapsed ? `Open ${item.label} menu` : undefined}
          title={collapsed ? item.label : undefined}
          className={cn("w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors duration-100", isChildActive ? "bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300" : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800")}
        >
          <span className="flex-shrink-0">{item.icon}</span>
          {showLabels && (
            <>
              <span className={cn("erp-sidebar-label flex-1 text-left", collapsed && "erp-sidebar-label-out")}>{item.label}</span>
              <span className={cn("erp-sidebar-label flex-shrink-0 text-gray-400", collapsed && "erp-sidebar-label-out")}>{open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}</span>
            </>
          )}
        </button>
        <AnimatePresence>
          {open && !collapsed && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.14, ease: "easeOut" }} className="overflow-hidden ml-3 pl-3 border-l border-gray-200 dark:border-gray-700 mt-0.5 space-y-0.5">
              {item.children.map((child) => (
                <NavItemComp key={child.label} item={child} collapsed={false} showLabels onNavigate={onNavigate} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <NavLink
      to={item.path!}
      end={item.path === "/dashboard"}
      onClick={onNavigate}
      className={({ isActive }) => cn("flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors duration-100", isActive ? "bg-brand-600 text-white shadow-sm" : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800")}
    >
      <span className="flex-shrink-0">{item.icon}</span>
      {showLabels && <span className={cn("erp-sidebar-label flex-1 truncate", collapsed && "erp-sidebar-label-out")}>{item.label}</span>}
    </NavLink>
  );
}

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  isMobile: boolean;
  mobileOpen: boolean;
  onNavigate: () => void;
}

export const Sidebar = ({ collapsed, onToggle, isMobile, mobileOpen, onNavigate }: SidebarProps) => {
  const { user } = useAuthStore();
  const { data: branding } = useCompanyBranding();
  const companyName = branding?.companyName ?? "ERP System";
  const companyShortName = branding?.companyShortName ?? "ERP";
  const companyLogoUrl = publicAssetUrl(branding?.companyLogoUrl);
  const [logoFailed, setLogoFailed] = useState(false);
  const [keepExpandedContent, setKeepExpandedContent] = useState(!collapsed);
  const showLogo = Boolean(companyLogoUrl) && !logoFailed;
  useEffect(() => {
    setLogoFailed(false);
  }, [companyLogoUrl]);
  useEffect(() => {
    if (isMobile || !collapsed) {
      setKeepExpandedContent(true);
      return;
    }
    const timer = window.setTimeout(() => setKeepExpandedContent(false), 120);
    return () => window.clearTimeout(timer);
  }, [collapsed, isMobile]);
  const showExpandedContent = isMobile || !collapsed || keepExpandedContent;
  // Performance Dashboard is only relevant (and only reachable — the backend has no
  // linked-employee data to show anyone else) for SALES-category employees.
  const withPerformance = hasRole(user, "ROLE_SALES") || user?.employeeCategory === "SALES"
    ? [navItems[0], { label: "Performance", path: "/performance-dashboard", icon: <Trophy size={18} /> }, ...navItems.slice(1)]
    : navItems;
  const items = visibleNavigation(withPerformance, user);

  return (
    <motion.aside
      initial={isMobile ? { x: -280 } : false}
      animate={isMobile ? { x: 0 } : undefined}
      transition={isMobile ? { duration: 0.16, ease: "easeOut" } : undefined}
      style={{ width: isMobile ? 272 : collapsed ? 72 : 248 }}
      aria-hidden={isMobile && !mobileOpen}
      className={cn("erp-sidebar fixed inset-y-0 left-0 z-50 flex h-full flex-none flex-col overflow-hidden border-r bg-white dark:bg-gray-900 md:relative md:inset-auto md:z-auto", isMobile && "will-change-transform", isMobile && !mobileOpen && "pointer-events-none")}
    >
      <div className="erp-sidebar-brand flex min-h-16 items-center justify-between border-b px-4 py-3 flex-shrink-0">
        {showExpandedContent && (
            <div className={cn("erp-sidebar-label flex items-center gap-2.5 min-w-0", collapsed && !isMobile && "erp-sidebar-label-out")}>
              <button type="button" onClick={isMobile ? onNavigate : onToggle} className="erp-brand-mark flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-brand-400 to-brand-700" aria-label={isMobile ? "Close navigation" : "Collapse navigation"} title={isMobile ? "Close navigation" : "Collapse navigation"}>
                {showLogo ? <img src={companyLogoUrl} alt={`${companyName} logo`} className="h-6 w-6 object-contain" onError={() => setLogoFailed(true)} /> : <Flame size={16} className="text-white" aria-label={companyShortName} />}
              </button>
              <div className="min-w-0">
                <p className="erp-brand-name text-sm font-bold text-gray-900 dark:text-white truncate">{companyName}</p>
                <p className="text-[9px] uppercase tracking-[0.2em] text-gray-400 truncate">{companyShortName} command center</p>
              </div>
            </div>
        )}
        {collapsed && !isMobile && !showExpandedContent && (
          <button type="button" onClick={onToggle} className="erp-brand-mark mx-auto flex h-9 w-9 items-center justify-center rounded-md bg-gradient-to-br from-brand-400 to-brand-700" aria-label="Expand navigation" title="Expand navigation">
            {showLogo ? <img src={companyLogoUrl} alt={`${companyName} logo`} className="h-6 w-6 object-contain" onError={() => setLogoFailed(true)} /> : <Flame size={16} className="text-white" aria-label={companyShortName} />}
          </button>
        )}
        {isMobile && (
          <button onClick={onNavigate} className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 flex-shrink-0" aria-label="Close sidebar">
            <X size={16} />
          </button>
        )}
      </div>
      <nav className="erp-nav flex-1 overflow-y-auto overflow-x-hidden p-3 space-y-0.5">
        {items.map((item) => (
          <NavItemComp key={item.label} item={item} collapsed={isMobile ? false : collapsed} showLabels={showExpandedContent} onNavigate={isMobile ? onNavigate : undefined} onExpand={!isMobile ? onToggle : undefined} />
        ))}
      </nav>
      {collapsed && !isMobile && (
        <div className="p-3 border-t border-gray-200 dark:border-gray-800">
          <button onClick={onToggle} className="w-full flex items-center justify-center p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500">
            <Menu size={18} />
          </button>
        </div>
      )}
    </motion.aside>
  );
};
