import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { Eye, EyeOff, Lock, ShieldAlert } from "lucide-react";
import { authApi } from "@/services/api/auth.api";
import { useToast } from "@/hooks/useToast";
import { EmberField } from "@/features/landing/components/EmberField";

const schema = z
  .object({
    newPassword: z.string().min(8, "At least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
type FormData = z.infer<typeof schema>;

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [showPass, setShowPass] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    if (!token) {
      toast.error("This reset link is invalid or incomplete.");
      return;
    }
    try {
      await authApi.resetPassword({ token, newPassword: data.newPassword });
      toast.success("Password reset — please sign in with your new password.");
      navigate("/login");
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "This reset link is invalid or has expired.");
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#070707] p-4 overflow-hidden">
      <div className="pointer-events-none absolute left-1/2 top-1/3 h-[36rem] w-[36rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#D4AF37]/10 blur-[140px]" />
      <EmberField density={34} />

      <motion.div initial={{ opacity: 0, y: 28, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.9, ease: "easeOut" }} className="relative w-full max-w-md">
        <div className="rounded-3xl border border-[#D4AF37]/20 bg-white/[0.04] backdrop-blur-2xl shadow-[0_0_60px_rgba(212,175,55,0.12)] overflow-hidden px-8 py-10">
          <h1 className="font-display text-2xl text-white">Set a New Password</h1>
          <p className="mt-2 text-sm text-[#CFCFCF]">Choose a new password to finish resetting your account.</p>

          {!token && (
            <div className="mt-5 flex items-start gap-2.5 rounded-xl border border-red-500/30 bg-red-500/10 p-3">
              <ShieldAlert size={16} className="mt-0.5 flex-shrink-0 text-red-400" />
              <p className="text-xs text-red-300">This link is missing its reset token. Please use the link from your email exactly as sent, or request a new one.</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="mt-7 space-y-5">
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
                  autoFocus
                  placeholder="Enter a new password"
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
                Confirm Password
              </label>
              <div className="relative">
                <Lock size={15} className="absolute inset-y-0 left-3.5 my-auto text-[#CFCFCF]/60" />
                <input
                  id="confirmPassword"
                  type={showPass ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Re-enter the new password"
                  className="w-full rounded-xl border border-white/10 bg-black/30 pl-10 pr-3.5 py-2.5 text-sm text-white placeholder-[#CFCFCF]/40 transition-all focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/60 focus:border-transparent"
                  {...register("confirmPassword")}
                />
              </div>
              {errors.confirmPassword && <p className="text-xs text-red-400">{errors.confirmPassword.message}</p>}
            </div>

            <p className="text-xs text-[#CFCFCF]/60">Use at least 8 characters, mixing uppercase, lowercase, a number, and a special character.</p>

            <button
              type="submit"
              disabled={isSubmitting || !token}
              className="w-full rounded-full bg-gradient-to-r from-[#D4AF37] to-[#FFD76A] py-3 text-sm font-semibold uppercase tracking-[0.15em] text-[#070707] shadow-[0_0_25px_rgba(212,175,55,0.3)] transition-transform hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Resetting\u2026" : "Reset Password"}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
