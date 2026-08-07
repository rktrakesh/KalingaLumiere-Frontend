export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  timestamp: string;
}
export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}
export interface ApiError {
  success: false;
  message: string;
  data?: Record<string, string>;
  timestamp: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}
export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  username: string;
  fullName: string;
  role: UserRole;
  roles: UserRole[];
  /** True right after onboarding or an admin-triggered reset — frontend must route
   *  straight to Change Password and nowhere else until it's changed. */
  mustChangePassword?: boolean;
}
export interface UserProfile {
  id: number;
  username: string;
  fullName: string;
  role: UserRole;
  roles: UserRole[];
  employeeId?: number;
  status: UserStatus;
  mustChangePassword?: boolean;
  credentialsExpired?: boolean;
  failedLoginAttempts: number;
  lockedAt?: string | null;
  lastLoginAt?: string | null;
  temporaryPasswordIssuedAt?: string | null;
  temporaryPasswordExpiresAt?: string | null;
  enabled: boolean;
  accountNonLocked: boolean;
  /** Null for users with no linked Employee (e.g. a system ADMIN account). Drives
   *  Role-Based Dashboard Routing (see utils/routing.ts). */
  employeeCategory?: EmployeeCategory | null;
}
export type AuthenticatedUser = UserProfile;
export type UserProfileResponse = UserProfile;
export type IAMUser = UserProfile;
export type UserRole = "ROLE_ADMIN" | "ROLE_MANAGER" | "ROLE_SUPERVISOR" | "ROLE_HR" | "ROLE_FINANCE" | "ROLE_SALES" | "ROLE_EMPLOYEE";
export type UserStatus = "ACTIVE" | "INACTIVE" | "LOCKED";
export type EmployeeCategory = "FACTORY" | "SALES" | "ADMINISTRATION";

export interface TemporaryPasswordResetResponse {
  temporaryPassword: string;
  temporaryPasswordExpiresAt: string;
  mustChangePassword: boolean;
  emailDeliveryAttempted: boolean;
}

export interface ForgotPasswordRequest {
  email: string;
}
export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface Employee {
  id: number;
  employeeCode: string;
  name: string;
  phone?: string;
  address?: string;
  joiningDate: string;
  designation?: string;
  currentSalary: number;
  status: "ACTIVE" | "INACTIVE";
  createdBy?: string;
  createdDate?: string;
}
export interface CreateEmployeeRequest {
  createLogin: boolean;
  name: string;
  phone?: string;
  address?: string;
  email?: string;
  joiningDate: string;
  designationId: number;
  departmentId?: number;
  employeeCategoryId: number;
  currentSalary: number;
  salaryRemarks?: string;
}
export interface EmployeeMasterData {
  id: number;
  code: string;
  name: string;
  description?: string;
  active: boolean;
}
export interface DesignationMasterData extends EmployeeMasterData {
  categoryId: number;
  categoryCode: string;
  categoryName: string;
}
export interface SalaryHistory {
  id: number;
  salary: number;
  effectiveFrom: string;
  remarks?: string;
  createdBy: string;
  createdDate: string;
}

export type AttendanceStatus = "PRESENT" | "ABSENT" | "PAID_LEAVE" | "HOLIDAY" | "PENDING_CHECKOUT";
export interface AttendanceRecord {
  id: number;
  employeeId: number;
  employeeCode: string;
  employeeName: string;
  attendanceDate: string;
  checkIn?: string;
  checkOut?: string;
  workedMinutes: number;
  status: AttendanceStatus;
  remarks?: string;
  createdBy?: string;
  createdDate?: string;
  updatedBy?: string;
  updatedDate?: string;
}
export interface CheckInRequest {
  employeeId: number;
  attendanceDate: string;
  checkIn: string;
  remarks?: string;
}
export interface CheckOutRequest {
  checkOut: string;
  remarks?: string;
}

export type LeaveStatus = "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";
export interface LeaveRequest {
  id: number;
  employeeId: number;
  employeeCode: string;
  employeeName: string;
  leaveDate: string;
  reason?: string;
  status: LeaveStatus;
  approvedBy?: string;
  approvedDate?: string;
  rejectionReason?: string;
  createdDate?: string;
}
export interface LeaveBalance {
  employeeId: number;
  employeeName: string;
  year: number;
  month: number;
  allocated: number;
  used: number;
  balance: number;
}

export interface Holiday {
  id: number;
  holidayDate: string;
  name: string;
  holidayType: "FACTORY_HOLIDAY" | "NATIONAL_HOLIDAY";
}

export type OvertimeStatus = "PENDING" | "APPROVED" | "REJECTED" | "MODIFIED";
export interface OvertimeRequest {
  id: number;
  employeeId: number;
  employeeCode: string;
  employeeName: string;
  overtimeDate: string;
  requestType: "EXCESS_HOURS" | "LEAVE_CONVERSION";
  requestedMinutes: number;
  approvedMinutes?: number;
  status: OvertimeStatus;
  approvedBy?: string;
  approvedDate?: string;
  remarks?: string;
  createdDate?: string;
  reopenedBy?: string;
  reopenedDate?: string;
  reopenReason?: string;
}

export type LoanStatus = "PENDING_APPROVAL" | "ACTIVE" | "CLOSED" | "REJECTED";
export interface Loan {
  id: number;
  loanReference: string;
  employeeId: number;
  employeeCode: string;
  employeeName: string;
  principalAmount: number;
  interestRate: number;
  monthlyInterest: number;
  monthlyPrincipalPayment: number;
  currentBalance?: number;
  status: LoanStatus;
  disbursementDate?: string;
  approvedBy?: string;
  approvedDate?: string;
  remarks?: string;
  createdDate?: string;
}
export interface LoanLedger {
  id: number;
  transactionDate: string;
  transactionType: string;
  amount: number;
  balanceAfter: number;
  remarks?: string;
  createdBy: string;
}

export type PayrollStatus = "DRAFT" | "CALCULATED" | "VERIFIED" | "APPROVED" | "PROCESSED" | "PAID" | "LOCKED";
export type PaymentMode = "CASH" | "BANK";
export type PayrollPaymentStatus = "PENDING" | "PAID";

export interface PayrollMetrics {
  employeesProcessed: number;
  employeesSkipped: number;
  executionDurationMillis: number;
  totalPayroll: number;
  totalOt: number;
  totalHolidayOt: number;
  totalWeeklyOffPay: number;
  totalLeaveEncashment: number;
  totalLossOfPay: number;
  averageSalary: number;
  averageOt: number;
  averageLeaveDays: number;
}

export interface PayrollGenerationException {
  employeeId: number;
  employeeCode: string;
  employeeName: string;
  reason: "NO_SALARY" | "MISSING_ATTENDANCE" | "DUPLICATE_PAYROLL" | "INVALID_LEAVE" | "INVALID_SNAPSHOT" | "VALIDATION_FAILURE" | "UNKNOWN";
  message: string;
}

export interface PayrollRun {
  id: number;
  runReference: string;
  year: number;
  month: number;
  periodStart: string;
  periodEnd: string;
  status: PayrollStatus;

  calculationVersion: number;
  isCurrentVersion: boolean;
  previousRunId?: number;

  totalEmployees?: number;
  totalGross?: number;
  totalNet?: number;

  generatedBy: string;
  generatedDate: string;
  verifiedBy?: string;
  verifiedDate?: string;
  approvedBy?: string;
  approvedDate?: string;
  processedBy?: string;
  processedDate?: string;
  lockedBy?: string;
  lockedDate?: string;
  reopenedBy?: string;
  reopenedDate?: string;
  reopenReason?: string;

  remarks?: string;

  /** Only populated on the response of generate / recalculate / reopen. */
  metrics?: PayrollMetrics;
  /** Employees skipped during that computation, with reasons. Empty array if none. */
  generationExceptions?: PayrollGenerationException[];
}

export interface PayrollDetail {
  id: number;
  employeeId: number;
  employeeCode: string;
  employeeName: string;
  calculationVersion: number;

  baseSalary: number;
  standardWorkDays: number;
  standardWorkHours: number;
  hourlyRate: number;

  presentDays: number;
  weeklyOffDays: number;
  weeklyOffWorkedDays: number;
  holidayDays: number;
  holidayWorkedDays: number;
  paidLeaveDays: number;
  automaticPaidLeaveDays: number;
  absentDays: number;

  workedMinutes: number;
  overtimeMinutes: number;
  overtimeMultiplier: number;
  holidayOtMinutes: number;
  weeklyOffOtMinutes: number;
  weeklyOffMultiplier: number;
  holidayOtMultiplier: number;

  weeklyOffPay: number;
  holidayOtPay: number;
  overtimePay: number;
  leaveEncashmentDays: number;
  leaveEncashmentAmount: number;
  lossOfPayAmount: number;

  grossSalary: number;
  loanInterestDeduction: number;
  loanPrincipalDeduction: number;
  totalDeductions: number;
  netSalary: number;
  salaryCapped: boolean;

  paymentStatus: PayrollPaymentStatus;
  paidDate?: string;
  paymentMode?: PaymentMode;
  paidBy?: string;
}

export interface PayrollCalculationLog {
  id: number;
  payrollRunId: number;
  employeeId: number;
  employeeCode: string;
  employeeName: string;
  calculationVersion: number;

  monthlySalary: number;
  hourlyRate: number;

  presentDays: number;
  weeklyOffDays: number;
  weeklyOffWorkedDays: number;
  holidayDays: number;
  holidayWorkedDays: number;
  paidLeaveDays: number;
  automaticPaidLeaveDays: number;
  absentDays: number;

  approvedOtMinutes: number;
  holidayOtMinutes: number;
  weeklyOffOtMinutes: number;

  basicSalaryAmount: number;
  overtimeAmount: number;
  weeklyOffPayAmount: number;
  holidayOtAmount: number;
  leaveEncashmentDays: number;
  leaveEncashmentAmount: number;
  lossOfPayAmount: number;

  grossSalary: number;
  finalNetSalary: number;

  calculatedBy: string;
  calculatedDate: string;
  /** Human-readable "why this number" lines, e.g. "Overtime: 34.0 Hours x Rs.49.4500 x 1.5x = Rs.2521.95" */
  breakdown: string[];
}

export interface PayrollDashboard {
  payrollRunId: number;
  year: number;
  month: number;
  status: PayrollStatus;

  totalEmployees: number;
  totalBasicSalary: number;
  totalOvertime: number;
  totalWeeklyOffAmount: number;
  totalHolidayPay: number;
  totalLeaveEncashment: number;
  totalLossOfPay: number;
  grandTotal: number;

  paidCount: number;
  pendingCount: number;
}

export interface PayrollException {
  employeeId: number;
  employeeCode: string;
  employeeName: string;
  /** MISSING_CHECKOUT, MISSING_ATTENDANCE, EXCESSIVE_OVERTIME, PENDING_OT_APPROVAL, LEAVE_CONFLICT, HOLIDAY_CONFLICT, INVALID_ATTENDANCE */
  issues: string[];
  affectedDates: string[];
}

export type ExpenseCategory = "RAW_MATERIAL" | "SALARY" | "ELECTRICITY" | "RENT" | "TRANSPORT" | "PACKAGING" | "MAINTENANCE" | "MISCELLANEOUS";
export type ExpenseStatus = "DRAFT" | "APPROVED" | "CANCELLED";
export interface Expense {
  id: number;
  expenseReference: string;
  expenseDate: string;
  amount: number;
  category: ExpenseCategory;
  remarks?: string;
  status: ExpenseStatus;
  approvedBy?: string;
  approvedDate?: string;
  createdBy?: string;
  createdDate?: string;
}

export interface Supplier {
  id: number;
  supplierCode: string;
  name: string;
  phone?: string;
  address?: string;
  materialsSupplied?: string;
  status: "ACTIVE" | "INACTIVE";
  outstandingPayable?: number;
}
export interface Customer {
  id: number;
  customerCode: string;
  name: string;
  phone?: string;
  address?: string;
  gstNumber?: string;
  creditDays: number;
  status: "ACTIVE" | "INACTIVE";
  outstandingReceivable?: number;
}

export type MaterialUnit = "KG" | "GRAM" | "LITRE" | "PIECE" | "PACKET" | "BOX";
export type MaterialType = "RAW_MATERIAL" | "FINISHED_GOODS" | "PACKAGING";
export interface Material {
  id: number;
  materialCode: string;
  name: string;
  unit: MaterialUnit;
  materialType: MaterialType;
  reorderLevel: number;
  currentStock?: number;
  status: "ACTIVE" | "INACTIVE";
  lowStock?: boolean;
}
export interface InventoryLedgerEntry {
  id: number;
  transactionDate: string;
  transactionType: string;
  quantity: number;
  balanceAfter: number;
  unitCost?: number;
  referenceType?: string;
  referenceId?: number;
  remarks?: string;
  createdBy: string;
}

export type PaymentStatus = "UNPAID" | "PARTIAL" | "PAID";
export interface PurchaseItem {
  id: number;
  materialId: number;
  materialName: string;
  quantity: number;
  unitRate: number;
  totalAmount: number;
}
export interface Purchase {
  id: number;
  purchaseReference: string;
  supplierId: number;
  supplierName: string;
  purchaseDate: string;
  totalAmount: number;
  paidAmount: number;
  outstandingAmount: number;
  paymentStatus: PaymentStatus;
  status: "ACTIVE" | "CANCELLED";
  remarks?: string;
  items: PurchaseItem[];
}

export interface SaleItem {
  id: number;
  materialId: number;
  materialName: string;
  quantityKg: number;
  unitRate: number;
  totalAmount: number;
}
export interface Sale {
  id: number;
  invoiceReference: string;
  customerId: number;
  customerName: string;
  invoiceDate: string;
  dueDate: string;
  totalAmount: number;
  paidAmount: number;
  outstandingAmount: number;
  paymentStatus: PaymentStatus;
  status: "ACTIVE" | "CANCELLED";
  remarks?: string;
  items: SaleItem[];
}

export interface ProductionBatch {
  id: number;
  batchNumber: string;
  batchDate: string;
  managerName?: string;
  status: "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  remarks?: string;
  inputs: { materialId: number; materialName: string; quantityUsed: number }[];
  outputs: { materialId: number; materialName: string; finishedQuantity: number; wasteQuantity: number; efficiencyPercent: number }[];
}

export interface CashbookSummary {
  cashInHand: number;
  bankBalance: number;
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpense: number;
  monthlyNet: number;
}
export interface CashbookTransaction {
  id: number;
  accountId: number;
  accountName: string;
  transactionDate: string;
  transactionType: string;
  flowType: "CREDIT" | "DEBIT";
  amount: number;
  balanceAfter: number;
  referenceType?: string;
  referenceId?: number;
  description?: string;
  createdBy: string;
  createdDate: string;
}

export interface Notification {
  id: number;
  notificationType: string;
  title: string;
  message: string;
  referenceType?: string;
  referenceId?: number;
  status: "UNREAD" | "READ";
  createdDate: string;
  readDate?: string;
}
export type SettingUpdateMode = "IMMEDIATE" | "SCHEDULED";

/** Mirrors the backend SettingResponse, including its temporary settingValue alias. */
export interface SettingResponse {
  id: number;
  settingKey: string;
  settingCategory: SettingCategory;
  dataType: string;
  editable: boolean;
  description: string;
  /** Compatibility alias for activeValue. */
  settingValue: string;
  activeValue: string;
  activeEffectiveFromDate: string;
  pendingValue: string | null;
  pendingEffectiveDate: string | null;
  pendingStatus: string | null;
  updateMode: SettingUpdateMode;
  /** Compatibility alias retained while older clients migrate. */
  effectiveFromDate?: string;
}

/** Backwards-compatible name used by existing settings UI code. */
export type AppSetting = SettingResponse;

export interface SettingUpdateResult {
  setting: SettingResponse;
  updateMode: SettingUpdateMode;
  replacedExistingPending: boolean;
  message: string;
}

export type SettingCategory = "ORGANIZATION" | "EMPLOYEE_HR" | "ATTENDANCE" | "LEAVE" | "PAYROLL" | "PERFORMANCE_INCENTIVE" | "PRODUCTION" | "INVENTORY" | "NOTIFICATIONS" | "SECURITY_IAM" | "FINANCE" | "SYSTEM";

export interface MonthClosing {
  id?: number;
  year: number;
  month: number;
  status: "OPEN" | "CLOSED";
  closedBy?: string;
  closedDate?: string;
  reopenedBy?: string;
  reopenedDate?: string;
  reopenRemarks?: string;
}
export interface PreCloseCheck {
  canClose: boolean;
  pendingCheckouts: number;
  pendingOvertime: number;
  payrollGenerated: boolean;
  blockers: string[];
}

export interface AdminDashboard {
  presentToday: number;
  absentToday: number;
  pendingCheckouts: number;
  pendingOvertimeApprovals: number;
  pendingLoanApprovals: number;
  pendingLeaveApprovals: number;
  rawMaterialStock: { materialName: string; currentStock: number; unit: string }[];
  finishedGoodsStock: { materialName: string; currentStock: number; unit: string }[];
  lowStockAlerts: number;
  customerOutstanding: number;
  supplierOutstanding: number;
  monthlyRevenue: number;
  monthlyExpenses: number;
  monthlyProfit: number;
  outstandingLoanBalance: number;
  cashInHand: number;
  bankBalance: number;
}

export interface AuditLog {
  id: number;
  username: string;
  module: string;
  action: string;
  entityType?: string;
  entityId?: number;
  oldValue?: string;
  newValue?: string;
  ipAddress?: string;
  createdAt: string;
}
export interface ProfitLossReport {
  year: number;
  month: number;
  totalRevenue: number;
  totalExpenses: number;
  expenseByCategory: Record<string, number>;
  grossProfit: number;
  netProfit: number;
}
export interface AttendanceReport {
  year: number;
  month: number;
  totalEmployees: number;
  employees: { employeeId: number; employeeCode: string; employeeName: string; presentDays: number; absentDays: number; paidLeaveDays: number; holidayDays: number; totalWorkedMinutes: number }[];
}

// ---------------------------------------------------------------- Performance Engine
export interface EmployeePerformanceDashboard {
  employeeId: number;
  employeeName: string;
  periodYear: number;
  periodMonth: number;
  monthlyTarget: number;
  monthlySales: number;
  achievementPct: number;
  incentiveEarned: number;
  assignedCustomers: number;
  activeCustomers: number;
  inactiveCustomers: number;
  ordersThisMonth: number;
  averageOrderValue: number;
  collectionPending: number;
  newCustomers: number;
  repeatCustomers: number;
  largestOrder: number;
  recommendationLabel: string;
  recommendationSuggestion?: string;
}
export interface PerformanceRankingEntry {
  employeeId: number;
  employeeName: string;
  monthlyTarget: number;
  monthlySales: number;
  achievementPct: number;
  incentiveEarned: number;
  recommendationLabel: string;
}
export interface ManagementPerformanceDashboard {
  periodYear: number;
  periodMonth: number;
  topPerformers: PerformanceRankingEntry[];
  lowestPerformers: PerformanceRankingEntry[];
  targetAchievementRanking: PerformanceRankingEntry[];
  monthlySalesRanking: PerformanceRankingEntry[];
  totalAssignedCustomers: number;
  totalActiveCustomers: number;
  totalInactiveCustomers: number;
  totalCollectionsPending: number;
  totalMonthlySales: number;
  totalIncentivePayout: number;
}
