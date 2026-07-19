import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, Users, Clock, CalendarCheck, Calendar, Timer, CreditCard, DollarSign, Receipt, Wallet, Building2, UserCheck, ShoppingCart, ShoppingBag, Package, Factory, Settings, Lock, Bell, FileText, Search, ChevronDown, ChevronRight, Flame, X, Menu } from 'lucide-react';
import { cn } from '@/utils/cn';

interface NavItem { label: string; path?: string; icon: React.ReactNode; children?: NavItem[]; }

const navItems: NavItem[] = [
  { label: 'Dashboard',    path: '/',              icon: <LayoutDashboard size={18}/> },
  { label: 'HR', icon: <Users size={18}/>, children: [
    { label: 'Employees',  path: '/employees',     icon: <Users size={16}/> },
    { label: 'Attendance', path: '/attendance',    icon: <Clock size={16}/> },
    { label: 'Leave',      path: '/leave',         icon: <CalendarCheck size={16}/> },
    { label: 'Holidays',   path: '/holidays',      icon: <Calendar size={16}/> },
    { label: 'Overtime',   path: '/overtime',      icon: <Timer size={16}/> },
  ]},
  { label: 'Payroll', icon: <DollarSign size={18}/>, children: [
    { label: 'Payroll Runs', path: '/payroll',     icon: <DollarSign size={16}/> },
    { label: 'Loans',        path: '/loans',       icon: <CreditCard size={16}/> },
  ]},
  { label: 'Commerce', icon: <ShoppingBag size={18}/>, children: [
    { label: 'Customers',  path: '/customers',     icon: <UserCheck size={16}/> },
    { label: 'Sales',      path: '/sales',         icon: <ShoppingBag size={16}/> },
    { label: 'Suppliers',  path: '/suppliers',     icon: <Building2 size={16}/> },
    { label: 'Purchases',  path: '/purchases',     icon: <ShoppingCart size={16}/> },
  ]},
  { label: 'Inventory', icon: <Package size={18}/>, children: [
    { label: 'Materials',   path: '/inventory',    icon: <Package size={16}/> },
    { label: 'Production',  path: '/production',   icon: <Factory size={16}/> },
  ]},
  { label: 'Finance', icon: <Wallet size={18}/>, children: [
    { label: 'Expenses',   path: '/expenses',      icon: <Receipt size={16}/> },
    { label: 'Cashbook',   path: '/cashbook',      icon: <Wallet size={16}/> },
  ]},
  { label: 'Reports',       path: '/reports',      icon: <FileText size={18}/> },
  { label: 'Audit',         path: '/audit',        icon: <Search size={18}/> },
  { label: 'Month Closing', path: '/month-closing',icon: <Lock size={18}/> },
  { label: 'Settings',      path: '/settings',     icon: <Settings size={18}/> },
];

function NavItemComp({ item, collapsed }: { item: NavItem; collapsed: boolean }) {
  const location = useLocation();
  const isChildActive = item.children?.some(c => c.path && location.pathname.startsWith(c.path));
  const [open, setOpen] = useState(isChildActive ?? false);

  if (item.children) {
    return (
      <div>
        <button onClick={() => !collapsed && setOpen(!open)}
          className={cn('w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
            isChildActive ? 'bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800')}>
          <span className="flex-shrink-0">{item.icon}</span>
          {!collapsed && <><span className="flex-1 text-left">{item.label}</span><span className="flex-shrink-0 text-gray-400">{open ? <ChevronDown size={14}/> : <ChevronRight size={14}/>}</span></>}
        </button>
        <AnimatePresence>
          {open && !collapsed && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}
              className="overflow-hidden ml-3 pl-3 border-l border-gray-200 dark:border-gray-700 mt-0.5 space-y-0.5">
              {item.children.map(child => <NavItemComp key={child.label} item={child} collapsed={false} />)}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <NavLink to={item.path!} end={item.path === '/'}
      className={({ isActive }) => cn('flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
        isActive ? 'bg-brand-600 text-white shadow-sm' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800')}>
      <span className="flex-shrink-0">{item.icon}</span>
      {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
    </NavLink>
  );
}

interface SidebarProps { collapsed: boolean; onToggle: () => void; }

export const Sidebar = ({ collapsed, onToggle }: SidebarProps) => (
  <motion.aside animate={{ width: collapsed ? 72 : 248 }} transition={{ duration: 0.25, ease: 'easeInOut' }}
    className="flex flex-col h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 overflow-hidden">
    <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200 dark:border-gray-800 flex-shrink-0">
      <AnimatePresence>
        {!collapsed && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center flex-shrink-0"><Flame size={16} className="text-white" /></div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-gray-900 dark:text-white truncate">KalingaLumière</p>
              <p className="text-[10px] text-gray-400 truncate">ERP System</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {collapsed && <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center mx-auto"><Flame size={16} className="text-white" /></div>}
      {!collapsed && <button onClick={onToggle} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 flex-shrink-0"><X size={16} /></button>}
    </div>
    <nav className="flex-1 overflow-y-auto overflow-x-hidden p-3 space-y-0.5">
      {navItems.map(item => <NavItemComp key={item.label} item={item} collapsed={collapsed} />)}
    </nav>
    {collapsed && (
      <div className="p-3 border-t border-gray-200 dark:border-gray-800">
        <button onClick={onToggle} className="w-full flex items-center justify-center p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"><Menu size={18} /></button>
      </div>
    )}
  </motion.aside>
);
