import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

export const AppLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  useEffect(() => {
    const stored = localStorage.getItem('sidebar-collapsed');
    if (stored) setCollapsed(stored === 'true');
  }, []);
  const toggle = () => { const n = !collapsed; setCollapsed(n); localStorage.setItem('sidebar-collapsed', String(n)); };
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950 overflow-hidden">
      <Sidebar collapsed={collapsed} onToggle={toggle} />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Topbar onMenuToggle={toggle} />
        <main className="flex-1 overflow-y-auto">
          <motion.div key="page" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="p-6 min-h-full">
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  );
};
