import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon, Bell, LogOut, User, ChevronDown, Menu } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useThemeStore } from '@/store/themeStore';
import { useAuthStore } from '@/store/authStore';
import { notificationsApi } from '@/services/api/notifications.api';
import { authApi } from '@/services/api/auth.api';
import { Notification } from '@/types';
import { formatDateTime } from '@/utils/format';
import { cn } from '@/utils/cn';

interface TopbarProps { onMenuToggle: () => void; }

const TYPE_COLORS: Record<string, string> = {
  PENDING_OT_APPROVAL: 'bg-amber-400', PENDING_LOAN_APPROVAL: 'bg-blue-400',
  PENDING_LEAVE_APPROVAL: 'bg-green-400', FORGOTTEN_CHECKOUT: 'bg-red-400',
  LOW_INVENTORY: 'bg-orange-400', PAYROLL_PENDING: 'bg-purple-400', MONTH_CLOSING_PENDING: 'bg-pink-400',
};

export const Topbar = ({ onMenuToggle }: TopbarProps) => {
  const { isDark, toggle } = useThemeStore();
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [showUser, setShowUser] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const userRef  = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const { data: countData } = useQuery({ queryKey: ['notif-count'], queryFn: () => notificationsApi.getCount(), refetchInterval: 30000 });
  const { data: notifData } = useQuery({ queryKey: ['notifications'], queryFn: () => notificationsApi.getAll(), enabled: showNotif });
  const unread = countData?.data?.data?.unread ?? 0;
  const notifications: Notification[] = notifData?.data?.data ?? [];

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (userRef.current && !userRef.current.contains(e.target as Node)) setShowUser(false);
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotif(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const handleLogout = async () => { try { await authApi.logout(); } catch {} logout(); navigate('/login'); };

  return (
    <header className="h-14 flex items-center gap-4 px-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex-shrink-0">
      <button onClick={onMenuToggle} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"><Menu size={18} /></button>
      <div className="flex-1" />
      <motion.button whileTap={{ scale: 0.9 }} onClick={toggle} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors">
        <AnimatePresence mode="wait">
          <motion.div key={isDark ? 'moon' : 'sun'} initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </motion.div>
        </AnimatePresence>
      </motion.button>

      <div className="relative" ref={notifRef}>
        <button onClick={() => setShowNotif(!showNotif)} className="relative p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors">
          <Bell size={18} />
          {unread > 0 && <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">{unread > 9 ? '9+' : unread}</span>}
        </button>
        <AnimatePresence>
          {showNotif && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
              className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">Notifications</p>
                {unread > 0 && <span className="text-xs text-brand-600 dark:text-brand-400 font-medium">{unread} unread</span>}
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800">
                {notifications.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-8">No notifications</p>
                ) : notifications.slice(0,8).map(n => (
                  <div key={n.id} className={cn('flex gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors', n.status==='UNREAD' && 'bg-brand-50/50 dark:bg-brand-950/20')}>
                    <div className={cn('w-2 h-2 rounded-full mt-1.5 flex-shrink-0', TYPE_COLORS[n.notificationType] ?? 'bg-gray-300')} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-900 dark:text-white truncate">{n.title}</p>
                      <p className="text-xs text-gray-500 truncate">{n.message}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">{formatDateTime(n.createdDate)}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-4 py-2.5 border-t border-gray-200 dark:border-gray-700">
                <button onClick={() => { navigate('/notifications'); setShowNotif(false); }} className="text-xs text-brand-600 dark:text-brand-400 font-medium hover:underline">View all</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="relative" ref={userRef}>
        <button onClick={() => setShowUser(!showUser)} className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">{user?.fullName?.[0]?.toUpperCase() ?? 'U'}</div>
          <div className="text-left hidden sm:block">
            <p className="text-xs font-semibold text-gray-900 dark:text-white leading-tight truncate max-w-28">{user?.fullName}</p>
            <p className="text-[10px] text-gray-400 leading-tight">{user?.role?.replace('ROLE_','')}</p>
          </div>
          <ChevronDown size={14} className="text-gray-400" />
        </button>
        <AnimatePresence>
          {showUser && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
              className="absolute right-0 top-full mt-2 w-52 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden py-1.5">
              <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{user?.fullName}</p>
                <p className="text-xs text-gray-400">{user?.username}</p>
              </div>
              <button onClick={() => { navigate('/profile'); setShowUser(false); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
                <User size={15} /> Profile
              </button>
              <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30">
                <LogOut size={15} /> Sign out
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
};
