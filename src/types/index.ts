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
}
export interface UserProfile {
  id: number;
  username: string;
  fullName: string;
  role: UserRole;
  employeeId?: number;
  status: string;
}
export type UserRole = "ROLE_ADMIN" | "ROLE_MANAGER" | "ROLE_SUPERVISOR" | "ROLE_EMPLOYEE";

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
  name: string;
  phone?: string;
  address?: string;
  joiningDate: string;
  designation?: string;
  currentSalary: number;
  salaryRemarks?: string;
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

export interface PayrollRun {
  id: number;
  runReference: string;
  year: number;
  month: number;
  periodStart: string;
  periodEnd: string;
  status: "GENERATED" | "REGENERATED" | "LOCKED";
  totalEmployees?: number;
  totalGross?: number;
  totalNet?: number;
  generatedBy: string;
  generatedDate: string;
  lockedBy?: string;
  lockedDate?: string;
  remarks?: string;
}
export interface PayrollDetail {
  id: number;
  employeeId: number;
  employeeCode: string;
  employeeName: string;
  baseSalary: number;
  standardWorkDays: number;
  standardWorkHours: number;
  hourlyRate: number;
  workedMinutes: number;
  paidLeaveDays: number;
  overtimeMinutes: number;
  overtimeMultiplier: number;
  grossSalary: number;
  loanInterestDeduction: number;
  loanPrincipalDeduction: number;
  totalDeductions: number;
  netSalary: number;
  salaryCapped: boolean;
  paymentStatus: "PENDING" | "PAID";
  paidDate?: string; // NEW
  paymentMode?: string; // NEW: CASH | BANK
  paidBy?: string; // NEW
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
export interface AppSetting {
  id: number;
  settingKey: string;
  settingValue: string;
  description?: string;
  effectiveFromDate: string;
}

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
