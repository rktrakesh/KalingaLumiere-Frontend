import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { Eye, EyeOff, Lock, ShieldCheck } from "lucide-react";
import { authApi } from "@/services/api/auth.api";
import { useAuthStore } from "@/store/authStore";
import { useToast } from "@/hooks/useToast";
import { EmberField } from "@/features/landing/components/EmberField";
import { resolveDashboardRoute } from "@/utils/routing";

const schema = z
  .object({
    currentPassword: z.string().min(1, "Required"),
    newPassword: z.string().min(8, "At least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
type FormData = z.infer<typeof schema>;

export default function ChangePasswordPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const { user, setUser, logout, mustChangePassword } = useAuthStore();
  const forced = mustChangePassword();
  const [showPass, setShowPass] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    try {
      await authApi.changePassword({ currentPassword: data.currentPassword, newPassword: data.newPassword });
      toast.success("Password changed successfully");
      if (user) {
        setUser({ ...user, mustChangePassword: false });
        navigate(resolveDashboardRoute(user));
      } else {
        navigate("/login");
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Could not change password. Please try again.");
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#070707] p-4 overflow-hidden">
      <div className="pointer-events-none absolute left-1/2 top-1/3 h-[36rem] w-[36rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#D4AF37]/10 blur-[140px]" />
      <EmberField density={34} />

      <motion.div initial={{ opacity: 0, y: 28, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.9, ease: "easeOut" }} className="relative w-full max-w-md">
        <div className="rounded-3xl border border-[#D4AF37]/20 bg-white/[0.04] backdrop-blur-2xl shadow-[0_0_60px_rgba(212,175,55,0.12)] overflow-hidden px-8 py-10">
          <span className="flex h-11 w-11 items-center justify-center rounded-full border border-[#D4AF37]/40 bg-[#D4AF37]/10">
            <ShieldCheck size={19} className="text-[#FFD76A]" />
          </span>
          <h1 className="mt-4 font-display text-2xl text-white">{forced ? "Set Your Permanent Password" : "Change Password"}</h1>
          <p className="mt-2 text-sm text-[#CFCFCF]">{forced ? "For your security, you must set a new password before continuing to your dashboard." : "Enter your current password and choose a new one."}</p>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-7 space-y-5">
            <div className="space-y-1.5">
              <label htmlFor="currentPassword" className="block text-xs font-medium uppercase tracking-[0.2em] text-[#D4AF37]">
                {forced ? "Temporary Password" : "Current Password"}
              </label>
              <div className="relative">
                <Lock size={15} className="absolute inset-y-0 left-3.5 my-auto text-[#CFCFCF]/60" />
                <input
                  id="currentPassword"
                  type={showPass ? "text" : "password"}
                  autoComplete="current-password"
                  autoFocus
                  className="w-full rounded-xl border border-white/10 bg-black/30 pl-10 pr-3.5 py-2.5 text-sm text-white placeholder-[#CFCFCF]/40 transition-all focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/60 focus:border-transparent"
                  {...register("currentPassword")}
                />
              </div>
              {errors.currentPassword && <p className="text-xs text-red-400">{errors.currentPassword.message}</p>}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="newPassword" className="block text-xs font-medium uppercase tracking-[0.2em] text-[#D4AF37]">
                New Password
              </label>
              <div className="relative">
                <Lock size={15} className="absolute inset-y-0 left-3.5 my-auto text-[#CFCFCF]/60" />
                <input
                  id="newPassword"
                  type={showPass ? "text" : "password"}
                  autoComplete="new-password"
                  className="w-full rounded-xl border border-white/10 bg-black/30 pl-10 pr-10 py-2.5 text-sm text-white placeholder-[#CFCFCF]/40 transition-all focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/60 focus:border-transparent"
                  {...register("newPassword")}
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute inset-y-0 right-3.5 my-auto text-[#CFCFCF]/60 hover:text-[#FFD76A] transition-colors">
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.newPassword && <p className="text-xs text-red-400">{errors.newPassword.message}</p>}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="confirmPassword" className="block text-xs font-medium uppercase tracking-[0.2em] text-[#D4AF37]">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock size={15} className="absolute inset-y-0 left-3.5 my-auto text-[#CFCFCF]/60" />
                <input
                  id="confirmPassword"
                  type={showPass ? "text" : "password"}
                  autoComplete="new-password"
                  className="w-full rounded-xl border border-white/10 bg-black/30 pl-10 pr-3.5 py-2.5 text-sm text-white placeholder-[#CFCFCF]/40 transition-all focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/60 focus:border-transparent"
                  {...register("confirmPassword")}
                />
              </div>
              {errors.confirmPassword && <p className="text-xs text-red-400">{errors.confirmPassword.message}</p>}
            </div>

            <p className="text-xs text-[#CFCFCF]/60">Use at least 8 characters, mixing uppercase, lowercase, a number, and a special character.</p>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-full bg-gradient-to-r from-[#D4AF37] to-[#FFD76A] py-3 text-sm font-semibold uppercase tracking-[0.15em] text-[#070707] shadow-[0_0_25px_rgba(212,175,55,0.3)] transition-transform hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Saving\u2026" : "Save New Password"}
            </button>

            {!forced && (
              <button type="button" onClick={() => navigate(-1)} className="w-full text-center text-xs text-[#CFCFCF]/60 hover:text-[#FFD76A] transition-colors">
                Cancel
              </button>
            )}
            {forced && (
              <button
                type="button"
                onClick={() => {
                  logout();
                  navigate("/login");
                }}
                className="w-full text-center text-xs text-[#CFCFCF]/60 hover:text-[#FFD76A] transition-colors"
              >
                Sign out instead
              </button>
            )}
          </form>
        </div>
      </motion.div>
    </div>
  );
}
