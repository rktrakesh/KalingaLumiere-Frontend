# KalingaLumière — Frontend

Production-grade ERP frontend for Agarbatti Manufacturing.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18 + TypeScript |
| Build | Vite 5 |
| Styling | Tailwind CSS 3 |
| State | Zustand (auth + theme) |
| Server State | TanStack Query v5 |
| Forms | React Hook Form + Zod |
| HTTP | Axios (with auto token refresh) |
| Animations | Framer Motion |
| Charts | Recharts |
| Icons | Lucide React |
| Routing | React Router v6 |
| Notifications | React Hot Toast |

## Quick Start

```bash
cd KalingaLumiere-Frontend
npm install
cp .env.example .env        # edit VITE_API_BASE_URL if needed
npm run dev                  # http://localhost:5173
```

## Environment Variables

```
VITE_API_BASE_URL=http://localhost:9090/api/v1
VITE_APP_NAME=KalingaLumière ERP
VITE_APP_VERSION=1.0.0
```

## Features

| Module | Features |
|--------|---------|
| Login | JWT auth, auto refresh, dark mode toggle |
| Dashboard | KPI cards, revenue chart, stock overview |
| Employees | Create/edit/salary history/deactivate |
| Attendance | Check-in/out, correct, pending checkouts |
| Leave | Request/approve/reject, balance view |
| Holiday | Add/delete with auto attendance update |
| Overtime | Approve/reject/modify, leave conversion |
| Payroll | Generate, regenerate, view payslips |
| Loans | Create/approve/reject, ledger view |
| Expenses | Create/approve/cancel |
| Suppliers | CRUD + ledger |
| Customers | CRUD + outstanding view |
| Inventory | Materials, stock adjustment, ledger |
| Purchases | PO creation, supplier payment |
| Sales | Invoice creation, customer collection |
| Production | Batch create/complete with efficiency % |
| Cashbook | Summary cards + transaction register |
| Reports | P&L with charts, attendance summary |
| Settings | All configurable business rules |
| Month Closing | Pre-check validation, close/reopen |
| Notifications | Real-time badge, mark read |
| Audit | Full diff view with before/after |

## Folder Structure

```
src/
├── app/              Application bootstrap
├── components/
│   ├── common/       DataTable, KPICard, PageHeader, SearchFilter…
│   └── ui/           Button, Card, Input, Select, Modal, Badge…
├── features/         One folder per domain module
├── hooks/            useToast, useDebounce, usePagination
├── layouts/          AppLayout, Sidebar, Topbar
├── routes/           AppRouter, ProtectedRoute
├── services/
│   ├── api/          One file per backend module
│   └── interceptors/ Axios instance + JWT refresh
├── store/            authStore, themeStore (Zustand)
├── types/            All TypeScript interfaces
└── utils/            cn, format helpers
```
