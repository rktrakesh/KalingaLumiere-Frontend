import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, X, CheckCircle2, XCircle, Sun, Umbrella, Clock, Calendar, Minus } from "lucide-react";
import { attendanceApi } from "@/services/api/attendance.api";
import { Employee, AttendanceRecord } from "@/types";
import { MONTHS } from "@/utils/format";
import { cn } from "@/utils/cn";

interface Props {
  employee: Employee;
  onClose: () => void;
}

type DayStatus = AttendanceRecord["status"] | "FUTURE" | "BEFORE_JOINING" | "WEEKEND" | "NO_RECORD";

interface DayData {
  date: number;
  fullDate: string;
  status: DayStatus;
  checkIn?: string;
  checkOut?: string;
  workedMinutes?: number;
  remarks?: string;
}

const STATUS_CONFIG: Record<
  DayStatus,
  {
    bg: string;
    text: string;
    icon: React.ReactNode;
    label: string;
  }
> = {
  PRESENT: { bg: "bg-emerald-500", text: "text-white", icon: <CheckCircle2 size={10} />, label: "Present" },
  ABSENT: { bg: "bg-red-400", text: "text-white", icon: <XCircle size={10} />, label: "Absent" },
  PAID_LEAVE: { bg: "bg-blue-400", text: "text-white", icon: <Umbrella size={10} />, label: "Paid Leave" },
  HOLIDAY: { bg: "bg-purple-400", text: "text-white", icon: <Sun size={10} />, label: "Holiday" },
  PENDING_CHECKOUT: { bg: "bg-amber-400", text: "text-white", icon: <Clock size={10} />, label: "Pending Checkout" },
  FUTURE: { bg: "bg-gray-100 dark:bg-gray-800", text: "text-gray-300 dark:text-gray-600", icon: null, label: "" },
  BEFORE_JOINING: { bg: "bg-gray-50 dark:bg-gray-850", text: "text-gray-200 dark:text-gray-700", icon: null, label: "Before Joining" },
  WEEKEND: { bg: "bg-gray-100 dark:bg-gray-800/60", text: "text-gray-400", icon: <Minus size={10} />, label: "Weekend" },
  NO_RECORD: { bg: "bg-gray-100 dark:bg-gray-800", text: "text-gray-500 dark:text-gray-400", icon: null, label: "No Record" },
};

const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function minutesToHours(mins: number) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h}h ${m}m`;
}

export function EmployeeCalendarModal({ employee, onClose }: Props) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1); // 1-based
  const [selectedDay, setSelectedDay] = useState<DayData | null>(null);

  // Fetch attendance for this employee + month
  const { data, isLoading } = useQuery({
    queryKey: ["emp-calendar", employee.id, year, month],
    queryFn: () => attendanceApi.getMonthly(employee.id, year, month),
  });

  const records: AttendanceRecord[] = data?.data?.data ?? [];

  // Build a lookup map: "YYYY-MM-DD" → AttendanceRecord
  const recordMap: Record<string, AttendanceRecord> = {};
  records.forEach((r) => {
    recordMap[r.attendanceDate] = r;
  });

  // Build calendar grid
  const joiningDate = new Date(employee.joiningDate);
  const firstDayOfMonth = new Date(year, month - 1, 1);
  const daysInMonth = new Date(year, month, 0).getDate();
  const startWeekday = firstDayOfMonth.getDay(); // 0=Sun

  // Stats for current month
  const stats = records.reduce(
    (acc, r) => {
      if (r.status === "PRESENT") acc.present++;
      else if (r.status === "ABSENT") acc.absent++;
      else if (r.status === "PAID_LEAVE") acc.leave++;
      else if (r.status === "HOLIDAY") acc.holiday++;
      return acc;
    },
    { present: 0, absent: 0, leave: 0, holiday: 0 },
  );

  const getDayData = (day: number): DayData => {
    const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const date = new Date(year, month - 1, day);
    const isFuture = date > today;
    const isBeforeJoining = date < joiningDate;
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    const record = recordMap[dateStr];

    if (isBeforeJoining) return { date: day, fullDate: dateStr, status: "BEFORE_JOINING" };
    if (isFuture) return { date: day, fullDate: dateStr, status: "FUTURE" };
    if (record) return { date: day, fullDate: dateStr, status: record.status, checkIn: record.checkIn, checkOut: record.checkOut, workedMinutes: record.workedMinutes, remarks: record.remarks };
    if (isWeekend) return { date: day, fullDate: dateStr, status: "WEEKEND" };
    return { date: day, fullDate: dateStr, status: "NO_RECORD" };
  };

  const goToPrevMonth = () => {
    if (month === 1) {
      setMonth(12);
      setYear((y) => y - 1);
    } else setMonth((m) => m - 1);
    setSelectedDay(null);
  };

  const goToNextMonth = () => {
    const isCurrentMonth = year === today.getFullYear() && month === today.getMonth() + 1;
    if (isCurrentMonth) return; // can't go to future months
    if (month === 12) {
      setMonth(1);
      setYear((y) => y + 1);
    } else setMonth((m) => m + 1);
    setSelectedDay(null);
  };

  const yearOptions = Array.from({ length: today.getFullYear() - joiningDate.getFullYear() + 1 }, (_, i) => joiningDate.getFullYear() + i);

  const isCurrentMonth = year === today.getFullYear() && month === today.getMonth() + 1;

  // Grid: blank cells before day 1
  const blanksBefore = Array(startWeekday).fill(null);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 12 }}
        transition={{ duration: 0.22, ease: "easeOut" }}
        className="relative w-full max-w-2xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-brand-600 to-brand-700">
          <div>
            <h2 className="text-base font-bold text-white">{employee.name}</h2>
            <p className="text-brand-200 text-xs mt-0.5">
              {employee.employeeCode} · Joined {new Date(employee.joiningDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="p-5">
          {/* Month/Year Navigation */}
          <div className="flex items-center justify-between mb-4">
            <button onClick={goToPrevMonth} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors">
              <ChevronLeft size={18} />
            </button>

            <div className="flex items-center gap-2">
              {/* Month selector */}
              <select
                value={month}
                onChange={(e) => {
                  setMonth(Number(e.target.value));
                  setSelectedDay(null);
                }}
                className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm font-semibold text-gray-900 dark:text-white px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                {MONTHS.map((m, i) => {
                  const mNum = i + 1;
                  const isFuture = year === today.getFullYear() && mNum > today.getMonth() + 1;
                  const isBeforeJoin = year === joiningDate.getFullYear() && mNum < joiningDate.getMonth() + 1;
                  return (
                    <option key={m} value={mNum} disabled={isFuture || isBeforeJoin}>
                      {m}
                    </option>
                  );
                })}
              </select>

              {/* Year selector */}
              <select
                value={year}
                onChange={(e) => {
                  setYear(Number(e.target.value));
                  setSelectedDay(null);
                }}
                className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm font-semibold text-gray-900 dark:text-white px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                {yearOptions.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>

            <button onClick={goToNextMonth} disabled={isCurrentMonth} className={cn("p-2 rounded-xl transition-colors", isCurrentMonth ? "text-gray-300 dark:text-gray-700 cursor-not-allowed" : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400")}>
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-4 gap-2 mb-4">
            {[
              { label: "Present", value: stats.present, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-950/30" },
              { label: "Absent", value: stats.absent, color: "text-red-600 dark:text-red-400", bg: "bg-red-50 dark:bg-red-950/30" },
              { label: "Paid Leave", value: stats.leave, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-950/30" },
              { label: "Holidays", value: stats.holiday, color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-50 dark:bg-purple-950/30" },
            ].map((s) => (
              <div key={s.label} className={cn("rounded-xl p-2.5 text-center", s.bg)}>
                <p className={cn("text-xl font-bold", s.color)}>{s.value}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Days of week header */}
          <div className="grid grid-cols-7 mb-1">
            {DAYS_OF_WEEK.map((d) => (
              <div key={d} className={cn("text-center text-xs font-semibold py-1.5", d === "Sun" || d === "Sat" ? "text-red-400 dark:text-red-500" : "text-gray-400 dark:text-gray-500")}>
                {d}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          {isLoading ? (
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: 35 }).map((_, i) => (
                <div key={i} className="h-10 rounded-lg bg-gray-200 dark:bg-gray-700 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-7 gap-1">
              {/* Blank cells */}
              {blanksBefore.map((_, i) => (
                <div key={`blank-${i}`} />
              ))}

              {/* Day cells */}
              {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                const dayData = getDayData(day);
                const cfg = STATUS_CONFIG[dayData.status];
                const isSelected = selectedDay?.date === day;
                const isToday = day === today.getDate() && month === today.getMonth() + 1 && year === today.getFullYear();
                const clickable = !["FUTURE", "BEFORE_JOINING"].includes(dayData.status);

                return (
                  <motion.button
                    key={day}
                    whileHover={clickable ? { scale: 1.08 } : {}}
                    whileTap={clickable ? { scale: 0.95 } : {}}
                    onClick={() => clickable && setSelectedDay(isSelected ? null : dayData)}
                    className={cn(
                      "relative h-10 rounded-lg flex flex-col items-center justify-center transition-all text-xs font-medium",
                      cfg.bg,
                      cfg.text,
                      isSelected && "ring-2 ring-brand-500 ring-offset-1",
                      isToday && !isSelected && "ring-2 ring-brand-400 ring-offset-1",
                      clickable ? "cursor-pointer" : "cursor-default",
                    )}
                  >
                    <span className={cn("leading-none", isToday && "font-bold")}>{day}</span>
                    {cfg.icon && <span className="mt-0.5 opacity-80">{cfg.icon}</span>}
                  </motion.button>
                );
              })}
            </div>
          )}

          {/* Day detail panel */}
          <AnimatePresence>
            {selectedDay && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                <div className="mt-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{new Date(selectedDay.fullDate).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</p>
                    <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium", STATUS_CONFIG[selectedDay.status].bg, STATUS_CONFIG[selectedDay.status].text)}>
                      {STATUS_CONFIG[selectedDay.status].icon}
                      {STATUS_CONFIG[selectedDay.status].label || selectedDay.status.replace(/_/g, " ")}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-sm">
                    <div>
                      <p className="text-xs text-gray-400 mb-0.5">Check In</p>
                      <p className="font-semibold text-gray-900 dark:text-white">{selectedDay.checkIn ?? "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-0.5">Check Out</p>
                      <p className="font-semibold text-gray-900 dark:text-white">{selectedDay.checkOut ?? "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-0.5">Hours Worked</p>
                      <p className="font-semibold text-gray-900 dark:text-white">{selectedDay.workedMinutes && selectedDay.workedMinutes > 0 ? minutesToHours(selectedDay.workedMinutes) : "—"}</p>
                    </div>
                  </div>
                  {selectedDay.remarks && (
                    <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 pt-2">
                      <span className="font-medium">Remarks:</span> {selectedDay.remarks}
                    </p>
                  )}
                  {selectedDay.status === "NO_RECORD" && <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">No attendance record found for this working day.</p>}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Legend */}
          <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            {(
              [
                ["PRESENT", "Present"],
                ["ABSENT", "Absent"],
                ["PAID_LEAVE", "Paid Leave"],
                ["HOLIDAY", "Holiday"],
                ["PENDING_CHECKOUT", "Pending Checkout"],
                ["WEEKEND", "Weekend"],
                ["NO_RECORD", "No Record"],
              ] as [DayStatus, string][]
            ).map(([status, label]) => (
              <div key={status} className="flex items-center gap-1.5">
                <div className={cn("w-3 h-3 rounded-sm", STATUS_CONFIG[status].bg)} />
                <span className="text-xs text-gray-500 dark:text-gray-400">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
