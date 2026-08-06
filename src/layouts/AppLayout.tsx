import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

export const AppLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(() => window.matchMedia('(max-width: 767px)').matches);

  useEffect(() => {
    const stored = localStorage.getItem('sidebar-collapsed');
    if (stored) setCollapsed(stored === 'true');
  }, []);

  useEffect(() => {
    const query = window.matchMedia('(max-width: 767px)');
    const compactQuery = window.matchMedia('(min-width: 768px) and (max-width: 1399px)');
    const sync = () => {
      setIsMobile(query.matches);
      if (!query.matches) setMobileOpen(false);
      if (compactQuery.matches) setCollapsed(true);
      if (!query.matches && !compactQuery.matches) {
        setCollapsed(localStorage.getItem('sidebar-collapsed') === 'true');
      }
    };
    sync();
    query.addEventListener('change', sync);
    compactQuery.addEventListener('change', sync);
    return () => {
      query.removeEventListener('change', sync);
      compactQuery.removeEventListener('change', sync);
    };
  }, []);

  const toggle = () => { const n = !collapsed; setCollapsed(n); localStorage.setItem('sidebar-collapsed', String(n)); };
  const handleMenuToggle = () => isMobile ? setMobileOpen(open => !open) : toggle();

  return (
    <div className="erp-shell flex h-[100dvh] bg-gray-50 dark:bg-gray-950 overflow-hidden">
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
      {(!isMobile || mobileOpen) && (
        <Sidebar
          collapsed={collapsed}
          onToggle={toggle}
          isMobile={isMobile}
          mobileOpen={mobileOpen}
          onNavigate={() => setMobileOpen(false)}
        />
      )}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Topbar onMenuToggle={handleMenuToggle} />
        <main className="erp-main flex-1 overflow-y-auto">
          <div className="min-h-full p-3 sm:p-4 lg:p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
