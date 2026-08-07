import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { Mail, ArrowLeft, CheckCircle2 } from "lucide-react";
import { authApi } from "@/services/api/auth.api";
import { useToast } from "@/hooks/useToast";
import { EmberField } from "@/features/landing/components/EmberField";

const schema = z.object({ email: z.string().email("Enter a valid email address") });
type FormData = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [submitted, setSubmitted] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    try {
      await authApi.forgotPassword(data);
      setSubmitted(true);
    } catch {
      toast.error("The reset request could not be submitted. Please try again.");
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#070707] p-4 overflow-hidden">
      <div className="pointer-events-none absolute left-1/2 top-1/3 h-[36rem] w-[36rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#D4AF37]/10 blur-[140px]" />
      <EmberField density={34} />

      <motion.div initial={{ opacity: 0, y: 28, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.9, ease: "easeOut" }} className="relative w-full max-w-md">
        <div className="rounded-3xl border border-[#D4AF37]/20 bg-white/[0.04] backdrop-blur-2xl shadow-[0_0_60px_rgba(212,175,55,0.12)] overflow-hidden px-8 py-10">
          <button onClick={() => navigate("/login")} className="mb-6 inline-flex items-center gap-1.5 text-xs text-[#CFCFCF]/70 hover:text-[#FFD76A] transition-colors">
            <ArrowLeft size={13} /> Back to Sign In
          </button>

          {submitted ? (
            <div className="text-center">
              <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-[#22C55E]/40 bg-[#22C55E]/10">
                <CheckCircle2 size={22} className="text-[#22C55E]" />
              </span>
              <h1 className="mt-5 font-display text-2xl text-white">Check Your Email</h1>
              <p className="mt-2 text-sm text-[#CFCFCF]">If that email is registered, a password reset link is on its way. It will expire soon, so use it promptly.</p>
            </div>
          ) : (
            <>
              <h1 className="font-display text-2xl text-white">Forgot Password?</h1>
              <p className="mt-2 text-sm text-[#CFCFCF]">Enter the email on file and we'll send you a link to reset your password.</p>

              <form onSubmit={handleSubmit(onSubmit)} className="mt-7 space-y-5">
                <div className="space-y-1.5">
                  <label htmlFor="email" className="block text-xs font-medium uppercase tracking-[0.2em] text-[#D4AF37]">
                    Email
                  </label>
                  <div className="relative">
                    <Mail size={15} className="absolute inset-y-0 left-3.5 my-auto text-[#CFCFCF]/60" />
                    <input
                      id="email"
                      type="email"
                      autoComplete="email"
                      autoFocus
                      placeholder="you@kalingalumiere.com"
                      className="w-full rounded-xl border border-white/10 bg-black/30 pl-10 pr-3.5 py-2.5 text-sm text-white placeholder-[#CFCFCF]/40 transition-all focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/60 focus:border-transparent"
                      {...register("email")}
                    />
                  </div>
                  {errors.email && <p className="text-xs text-red-400">{errors.email.message}</p>}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full rounded-full bg-gradient-to-r from-[#D4AF37] to-[#FFD76A] py-3 text-sm font-semibold uppercase tracking-[0.15em] text-[#070707] shadow-[0_0_25px_rgba(212,175,55,0.3)] transition-transform hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Sending\u2026" : "Send Reset Link"}
                </button>
              </form>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
