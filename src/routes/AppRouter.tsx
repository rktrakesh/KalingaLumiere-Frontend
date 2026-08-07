import { lazy, Suspense, type ComponentType, type LazyExoticComponent } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppLayout } from "@/layouts/AppLayout";
import { ProtectedRoute } from "./ProtectedRoute";
import { RootRoute } from "./RootRoute";
import { AuthorizedRoute } from "./AuthorizedRoute";
import LoginPage from "@/features/auth/LoginPage";
import ForgotPasswordPage from "@/features/auth/ForgotPasswordPage";
import ResetPasswordPage from "@/features/auth/ResetPasswordPage";
import ChangePasswordPage from "@/features/auth/ChangePasswordPage";
import AccessDeniedPage from "@/features/auth/AccessDeniedPage";
import ProfilePage from "@/features/auth/ProfilePage";
import { Skeleton } from "@/components/ui/Skeleton";

const lazyImport = (fn: () => Promise<{ default: ComponentType }>) => lazy(fn);

const Dashboard = lazyImport(() => import("@/features/dashboard/DashboardPage"));
const PerformanceMe = lazyImport(() => import("@/features/performance/EmployeePerformanceDashboardPage"));
const Employees = lazyImport(() => import("@/features/employees/EmployeesPage"));
const EmpDetail = lazyImport(() => import("@/features/employees/EmployeeDetailPage"));
const Attendance = lazyImport(() => import("@/features/attendance/AttendancePage"));
const Leave = lazyImport(() => import("@/features/leave/LeavePage"));
const Holiday = lazyImport(() => import("@/features/holiday/HolidayPage"));
const Overtime = lazyImport(() => import("@/features/overtime/OvertimePage"));
const Payroll = lazyImport(() => import("@/features/payroll/PayrollPage"));
const Loans = lazyImport(() => import("@/features/loan/LoanPage"));
const Expenses = lazyImport(() => import("@/features/expense/ExpensePage"));
const Cashbook = lazyImport(() => import("@/features/cashbook/CashbookPage"));
const Suppliers = lazyImport(() => import("@/features/supplier/SupplierPage"));
const Customers = lazyImport(() => import("@/features/customer/CustomerPage"));
const Purchases = lazyImport(() => import("@/features/purchase/PurchasePage"));
const Sales = lazyImport(() => import("@/features/sales/SalesPage"));
const Inventory = lazyImport(() => import("@/features/inventory/InventoryPage"));
const Production = lazyImport(() => import("@/features/production/ProductionPage"));
const Reports = lazyImport(() => import("@/features/reports/ReportsPage"));
const Settings = lazyImport(() => import("@/features/settings/SettingsPage"));
const MonthClosing = lazyImport(() => import("@/features/monthclosing/MonthClosingPage"));
const Notifications = lazyImport(() => import("@/features/notifications/NotificationsPage"));
const Audit = lazyImport(() => import("@/features/audit/AuditPage"));
const UserManagement = lazyImport(() => import("@/features/users/UserManagementPage"));

const Loader = () => (
  <div className="p-6 space-y-4">
    <Skeleton className="h-8 w-64" />
    <div className="grid grid-cols-4 gap-4 mt-6">
      {[...Array(4)].map((_, i) => (
        <Skeleton key={i} className="h-28 rounded-xl" />
      ))}
    </div>
    <Skeleton className="h-64 rounded-xl mt-4" />
  </div>
);

const S = (C: LazyExoticComponent<ComponentType>) => (
  <Suspense fallback={<Loader />}>
    <C />
  </Suspense>
);

export const AppRouter = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<RootRoute />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/change-password" element={<ChangePasswordPage />} />
      </Route>
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/access-denied" element={<AccessDeniedPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route element={<AuthorizedRoute />}>
            <Route path="/dashboard" element={S(Dashboard)} />
            <Route path="/performance-dashboard" element={S(PerformanceMe)} />
            <Route path="/employees" element={S(Employees)} />
            <Route path="/employees/:id" element={S(EmpDetail)} />
            <Route path="/attendance" element={S(Attendance)} />
            <Route path="/leave" element={S(Leave)} />
            <Route path="/holidays" element={S(Holiday)} />
            <Route path="/overtime" element={S(Overtime)} />
            <Route path="/payroll" element={S(Payroll)} />
            <Route path="/loans" element={S(Loans)} />
            <Route path="/expenses" element={S(Expenses)} />
            <Route path="/cashbook" element={S(Cashbook)} />
            <Route path="/suppliers" element={S(Suppliers)} />
            <Route path="/customers" element={S(Customers)} />
            <Route path="/purchases" element={S(Purchases)} />
            <Route path="/sales" element={S(Sales)} />
            <Route path="/inventory" element={S(Inventory)} />
            <Route path="/production" element={S(Production)} />
            <Route path="/reports" element={S(Reports)} />
            <Route path="/settings" element={S(Settings)} />
            <Route path="/month-closing" element={S(MonthClosing)} />
            <Route path="/notifications" element={S(Notifications)} />
            <Route path="/audit" element={S(Audit)} />
            <Route path="/user-management" element={S(UserManagement)} />
          </Route>
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </BrowserRouter>
);
