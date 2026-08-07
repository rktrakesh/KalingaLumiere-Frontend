import { useEffect, useState } from "react";
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
import { resolveDashboardRoute } from "@/utils/routing";
import { publicAssetUrl, useCompanyBranding } from "@/services/api/branding.api";
import { isTemporaryPasswordExpiredError } from "@/utils/apiError";

const schema = z.object({ username: z.string().min(1, "Username or employee code required"), password: z.string().min(1, "Password required") });
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
  const { data: branding } = useCompanyBranding();
  const companyName = branding?.companyName ?? "ERP System";
  const companyShortName = branding?.companyShortName ?? "ERP";
  const companyLogoUrl = publicAssetUrl(branding?.companyLogoUrl);
  const navigate = useNavigate();
  const { setTokens, setUser } = useAuthStore();
  const toast = useToast();
  const [showPass, setShowPass] = useState(false);
  const [logoFailed, setLogoFailed] = useState(false);
  const [temporaryPasswordExpired, setTemporaryPasswordExpired] = useState(false);
  useEffect(() => {
    setLogoFailed(false);
  }, [companyLogoUrl]);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setTemporaryPasswordExpired(false);
    try {
      const res = await authApi.login(data);
      const token = res.data.data;
      setTokens(token.accessToken, token.refreshToken);
      const profileRes = await authApi.getProfile();
      const profile = profileRes.data.data;
      setUser(profile);
      toast.success(`Welcome back, ${token.fullName}!`);

      // Forced First-Login Password Change takes priority over everything else.
      if (profile.mustChangePassword) {
        navigate("/change-password");
        return;
      }
      navigate(resolveDashboardRoute(profile));
    } catch (err: unknown) {
      if (isTemporaryPasswordExpiredError(err)) {
        setTemporaryPasswordExpired(true);
        return;
      }
      toast.error("Unable to sign in with those credentials.");
    }
  };

  return (
    <div className="relative flex min-h-[100dvh] items-center justify-center overflow-x-hidden overflow-y-auto bg-[#070707] px-3 py-5 sm:p-4">
      <div className="pointer-events-none absolute left-1/2 top-1/3 h-[36rem] w-[36rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#D4AF37]/10 blur-[140px]" />
      <EmberField density={34} />

      <motion.div initial={{ opacity: 0, y: 28, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.9, ease: "easeOut" }} className="relative w-full max-w-md">
        <div className="overflow-hidden rounded-2xl border border-[#D4AF37]/20 bg-white/[0.04] backdrop-blur-2xl shadow-[0_0_60px_rgba(212,175,55,0.12)] sm:rounded-3xl">
          <div className="flex flex-col items-center px-5 pb-5 pt-6 text-center sm:px-8 sm:pb-8 sm:pt-10">
            <motion.button type="button" onClick={() => navigate("/")} custom={0.2} initial="hidden" animate="visible" variants={fieldVariants} className="mb-4 cursor-pointer transition-opacity hover:opacity-80 sm:mb-6" aria-label={`Back to ${companyName}`}>
              {companyLogoUrl && !logoFailed && <img
                src={companyLogoUrl}
                alt={`${companyName} logo`}
                className="mx-auto h-14 w-auto object-contain sm:h-20"
                onError={() => setLogoFailed(true)}
              />}
              {(!companyLogoUrl || logoFailed) && <span className="font-display text-xl tracking-[0.18em] text-white">{companyShortName}</span>}
            </motion.button>

            <motion.h1 custom={0.35} initial="hidden" animate="visible" variants={fieldVariants} className="font-display text-2xl text-white sm:text-3xl">
              Welcome Back
            </motion.h1>
            <motion.p custom={0.5} initial="hidden" animate="visible" variants={fieldVariants} className="mt-2 text-sm text-[#CFCFCF]">
              Sign in to continue to your dashboard
            </motion.p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 px-5 pb-6 sm:space-y-5 sm:px-8 sm:pb-9">
            <motion.div custom={0.65} initial="hidden" animate="visible" variants={fieldVariants} className="space-y-1.5">
              <label htmlFor="username" className="block text-xs font-medium uppercase tracking-[0.2em] text-[#D4AF37]">
                Username or Employee Code
              </label>
              <div className="relative">
                <User size={15} className="absolute inset-y-0 left-3.5 my-auto text-[#CFCFCF]/60" />
                <input
                  id="username"
                  autoComplete="username"
                  placeholder="Enter username or employee code"
                  className="min-h-11 w-full rounded-xl border border-white/10 bg-black/30 py-2.5 pl-10 pr-3.5 text-sm text-white placeholder-[#CFCFCF]/40 transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/60"
                  {...register("username")}
                />
              </div>
              {errors.username && <p className="text-xs text-red-400">{errors.username.message}</p>}
              {temporaryPasswordExpired && (
                <div className="rounded-xl border border-amber-400/30 bg-amber-400/10 p-3 text-left text-xs text-amber-100" role="alert">
                  <p>Your temporary password has expired. Use Forgot Password to create a new password.</p>
                  <button type="button" onClick={() => navigate("/forgot-password")} className="mt-2 font-semibold text-[#FFD76A] hover:underline">Go to Forgot Password</button>
                </div>
              )}
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
                  className="min-h-11 w-full rounded-xl border border-white/10 bg-black/30 py-2.5 pl-10 pr-10 text-sm text-white placeholder-[#CFCFCF]/40 transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/60"
                  {...register("password")}
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute inset-y-0 right-3.5 my-auto text-[#CFCFCF]/60 hover:text-[#FFD76A] transition-colors">
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-400">{errors.password.message}</p>}
              <div className="text-right">
                <button type="button" onClick={() => navigate("/forgot-password")} className="text-xs text-[#CFCFCF]/70 hover:text-[#FFD76A] transition-colors">
                  Forgot password?
                </button>
              </div>
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
              {companyName} ERP v1.0
            </motion.p>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
