import { format, parseISO } from 'date-fns';
export const formatCurrency = (a: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(a);
export const formatNumber   = (n: number) => new Intl.NumberFormat('en-IN').format(n);
export const formatDate     = (s: string) => { try { return format(parseISO(s), 'dd MMM yyyy'); } catch { return s; } };
export const formatDateTime = (s: string) => { try { return format(parseISO(s), 'dd MMM yyyy, HH:mm'); } catch { return s; } };
export const minutesToHours = (m: number) => `${Math.floor(m/60)}h ${m%60}m`;
export const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
export const currentYear  = () => new Date().getFullYear();
export const currentMonth = () => new Date().getMonth() + 1;
