import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { Eye, EyeOff, Lock, User } from "lucide-react";
import { authApi } from "@/services/api/auth.api";
import { useAuthStore } from "@/store/authStore";
import { useToast } from "@/hooks/useToast";
import { EmberField } from "@/features/landing/components/EmberField";

const schema = z.object({ username: z.string().min(1, "Username required"), password: z.string().min(1, "Password required") });
type FormData = z.infer<typeof schema>;

// Slow, deliberate stagger — mirrors the pacing of the landing page's hero reveal.
const fieldVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay, ease: "easeOut" as const },
  }),
};

export default function LoginPage() {
  const navigate = useNavigate();
  const { setTokens, setUser } = useAuthStore();
  const toast = useToast();
  const [showPass, setShowPass] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    try {
      const res = await authApi.login(data);
      const token = res.data.data;
      setTokens(token.accessToken, token.refreshToken);
      const profileRes = await authApi.getProfile();
      setUser(profileRes.data.data);
      toast.success(`Welcome back, ${token.fullName}!`);
      navigate("/");
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Invalid credentials");
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#070707] p-4 overflow-hidden">
      <div className="pointer-events-none absolute left-1/2 top-1/3 h-[36rem] w-[36rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#D4AF37]/10 blur-[140px]" />
      <EmberField density={34} />

      <motion.div initial={{ opacity: 0, y: 28, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.9, ease: "easeOut" }} className="relative w-full max-w-md">
        <div className="rounded-3xl border border-[#D4AF37]/20 bg-white/[0.04] backdrop-blur-2xl shadow-[0_0_60px_rgba(212,175,55,0.12)] overflow-hidden">
          <div className="px-8 pt-10 pb-8 flex flex-col items-center text-center">
            <motion.button type="button" onClick={() => navigate("/")} custom={0.2} initial="hidden" animate="visible" variants={fieldVariants} className="mb-6 cursor-pointer transition-opacity hover:opacity-80" aria-label="Back to Kalinga Lumière">
              <img
                src="/assets/logo/kalinga-lumiere.png"
                alt="Kalinga Lumière"
                className="h-20 w-auto object-contain mx-auto"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = "none";
                  e.currentTarget.nextElementSibling?.classList.remove("hidden");
                }}
              />
              <span className="hidden font-display text-xl tracking-[0.18em] text-white">KALINGA LUMI&Egrave;RE</span>
            </motion.button>

            <motion.h1 custom={0.35} initial="hidden" animate="visible" variants={fieldVariants} className="font-display text-3xl text-white">
              Welcome Back
            </motion.h1>
            <motion.p custom={0.5} initial="hidden" animate="visible" variants={fieldVariants} className="mt-2 text-sm text-[#CFCFCF]">
              Sign in to continue to your dashboard
            </motion.p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="px-8 pb-9 space-y-5">
            <motion.div custom={0.65} initial="hidden" animate="visible" variants={fieldVariants} className="space-y-1.5">
              <label htmlFor="username" className="block text-xs font-medium uppercase tracking-[0.2em] text-[#D4AF37]">
                Username
              </label>
              <div className="relative">
                <User size={15} className="absolute inset-y-0 left-3.5 my-auto text-[#CFCFCF]/60" />
                <input
                  id="username"
                  autoComplete="username"
                  autoFocus
                  placeholder="Enter your username"
                  className="w-full rounded-xl border border-white/10 bg-black/30 pl-10 pr-3.5 py-2.5 text-sm text-white placeholder-[#CFCFCF]/40 transition-all focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/60 focus:border-transparent"
                  {...register("username")}
                />
              </div>
              {errors.username && <p className="text-xs text-red-400">{errors.username.message}</p>}
            </motion.div>

            <motion.div custom={0.8} initial="hidden" animate="visible" variants={fieldVariants} className="space-y-1.5">
              <label htmlFor="password" className="block text-xs font-medium uppercase tracking-[0.2em] text-[#D4AF37]">
                Password
              </label>
              <div className="relative">
                <Lock size={15} className="absolute inset-y-0 left-3.5 my-auto text-[#CFCFCF]/60" />
                <input
                  id="password"
                  type={showPass ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  className="w-full rounded-xl border border-white/10 bg-black/30 pl-10 pr-10 py-2.5 text-sm text-white placeholder-[#CFCFCF]/40 transition-all focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/60 focus:border-transparent"
                  {...register("password")}
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute inset-y-0 right-3.5 my-auto text-[#CFCFCF]/60 hover:text-[#FFD76A] transition-colors">
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-400">{errors.password.message}</p>}
            </motion.div>

            <motion.button
              custom={0.3} // Reduced from 0.95 so it animates in much faster
              initial="hidden"
              animate="visible"
              variants={fieldVariants}
              type="submit"
              disabled={isSubmitting}
              whileHover={{ scale: isSubmitting ? 1 : 1.02 }} // Let Framer Motion handle hover smoothly
              whileTap={{ scale: isSubmitting ? 1 : 0.97 }} // Handled natively by Framer Motion
              className="w-full mt-2 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#FFD76A] py-3 text-sm font-semibold uppercase tracking-[0.15em] text-[#070707] shadow-[0_0_25px_rgba(212,175,55,0.3)] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Signing In…" : "Sign In"}
            </motion.button>

            <motion.p custom={1.1} initial="hidden" animate="visible" variants={fieldVariants} className="text-center text-xs text-[#CFCFCF]/60">
              Kalinga Lumi&egrave;re ERP v1.0 &mdash; Agarbatti Manufacturing
            </motion.p>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
