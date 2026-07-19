import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from '@/layouts/AppLayout';
import { ProtectedRoute } from './ProtectedRoute';
import LoginPage from '@/features/auth/LoginPage';
import { Skeleton } from '@/components/ui/Skeleton';

const lazy_import = (fn: () => Promise<any>) => lazy(fn);

const Dashboard     = lazy_import(() => import('@/features/dashboard/DashboardPage'));
const Employees     = lazy_import(() => import('@/features/employees/EmployeesPage'));
const EmpDetail     = lazy_import(() => import('@/features/employees/EmployeeDetailPage'));
const Attendance    = lazy_import(() => import('@/features/attendance/AttendancePage'));
const Leave         = lazy_import(() => import('@/features/leave/LeavePage'));
const Holiday       = lazy_import(() => import('@/features/holiday/HolidayPage'));
const Overtime      = lazy_import(() => import('@/features/overtime/OvertimePage'));
const Payroll       = lazy_import(() => import('@/features/payroll/PayrollPage'));
const Loans         = lazy_import(() => import('@/features/loan/LoanPage'));
const Expenses      = lazy_import(() => import('@/features/expense/ExpensePage'));
const Cashbook      = lazy_import(() => import('@/features/cashbook/CashbookPage'));
const Suppliers     = lazy_import(() => import('@/features/supplier/SupplierPage'));
const Customers     = lazy_import(() => import('@/features/customer/CustomerPage'));
const Purchases     = lazy_import(() => import('@/features/purchase/PurchasePage'));
const Sales         = lazy_import(() => import('@/features/sales/SalesPage'));
const Inventory     = lazy_import(() => import('@/features/inventory/InventoryPage'));
const Production    = lazy_import(() => import('@/features/production/ProductionPage'));
const Reports       = lazy_import(() => import('@/features/reports/ReportsPage'));
const Settings      = lazy_import(() => import('@/features/settings/SettingsPage'));
const MonthClosing  = lazy_import(() => import('@/features/monthclosing/MonthClosingPage'));
const Notifications = lazy_import(() => import('@/features/notifications/NotificationsPage'));
const Audit         = lazy_import(() => import('@/features/audit/AuditPage'));

const Loader = () => (
  <div className="p-6 space-y-4">
    <Skeleton className="h-8 w-64" />
    <div className="grid grid-cols-4 gap-4 mt-6">{[...Array(4)].map((_,i) => <Skeleton key={i} className="h-28 rounded-xl" />)}</div>
    <Skeleton className="h-64 rounded-xl mt-4" />
  </div>
);

const S = (C: React.LazyExoticComponent<any>) => <Suspense fallback={<Loader />}><C /></Suspense>;

export const AppRouter = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/"               element={S(Dashboard)} />
          <Route path="/employees"      element={S(Employees)} />
          <Route path="/employees/:id"  element={S(EmpDetail)} />
          <Route path="/attendance"     element={S(Attendance)} />
          <Route path="/leave"          element={S(Leave)} />
          <Route path="/holidays"       element={S(Holiday)} />
          <Route path="/overtime"       element={S(Overtime)} />
          <Route path="/payroll"        element={S(Payroll)} />
          <Route path="/loans"          element={S(Loans)} />
          <Route path="/expenses"       element={S(Expenses)} />
          <Route path="/cashbook"       element={S(Cashbook)} />
          <Route path="/suppliers"      element={S(Suppliers)} />
          <Route path="/customers"      element={S(Customers)} />
          <Route path="/purchases"      element={S(Purchases)} />
          <Route path="/sales"          element={S(Sales)} />
          <Route path="/inventory"      element={S(Inventory)} />
          <Route path="/production"     element={S(Production)} />
          <Route path="/reports"        element={S(Reports)} />
          <Route path="/settings"       element={S(Settings)} />
          <Route path="/month-closing"  element={S(MonthClosing)} />
          <Route path="/notifications"  element={S(Notifications)} />
          <Route path="/audit"          element={S(Audit)} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </BrowserRouter>
);
