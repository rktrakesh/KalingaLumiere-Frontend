import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Flame, Lock, User, Sun, Moon } from 'lucide-react';
import { authApi } from '@/services/api/auth.api';
import { useAuthStore } from '@/store/authStore';
import { useThemeStore } from '@/store/themeStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/hooks/useToast';

const schema = z.object({ username: z.string().min(1, 'Username required'), password: z.string().min(1, 'Password required') });
type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const navigate = useNavigate();
  const { setTokens, setUser } = useAuthStore();
  const { isDark, toggle } = useThemeStore();
  const toast = useToast();
  const [showPass, setShowPass] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    try {
      const res = await authApi.login(data);
      const token = res.data.data;
      setTokens(token.accessToken, token.refreshToken);
      const profileRes = await authApi.getProfile();
      setUser(profileRes.data.data);
      toast.success(`Welcome back, ${token.fullName}!`);
      navigate('/');
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Invalid credentials');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-50 via-white to-blue-50 dark:from-gray-950 dark:via-gray-900 dark:to-brand-950 p-4 relative">
      <button onClick={toggle} className="absolute top-4 right-4 p-2.5 rounded-xl bg-white dark:bg-gray-800 shadow-card text-gray-500 hover:shadow-elevated transition-all">
        {isDark ? <Sun size={18} /> : <Moon size={18} />}
      </button>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-brand-200/30 dark:bg-brand-900/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-200/30 dark:bg-blue-900/20 rounded-full blur-3xl" />
      </div>
      <motion.div initial={{ opacity: 0, y: 24, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.35 }} className="relative w-full max-w-md">
        <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/60 dark:border-gray-700/60 overflow-hidden">
          <div className="bg-gradient-to-r from-brand-600 to-brand-700 px-8 pt-8 pb-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
                <Flame size={22} className="text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">KalingaLumière</h1>
                <p className="text-brand-200 text-xs">ERP Management System</p>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-white mb-1">Welcome back</h2>
            <p className="text-brand-200 text-sm">Sign in to continue to your dashboard</p>
          </div>
          <div className="-mt-4 h-6 bg-white dark:bg-gray-900 rounded-t-3xl" />
          <div className="px-8 pb-8 pt-2">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input label="Username" placeholder="Enter your username" leftIcon={<User size={15} />} error={errors.username?.message} autoComplete="username" autoFocus {...register('username')} />
              <Input label="Password" type={showPass ? 'text' : 'password'} placeholder="Enter your password" leftIcon={<Lock size={15} />}
                rightIcon={<button type="button" onClick={() => setShowPass(!showPass)} className="hover:text-gray-600 transition-colors">{showPass ? <EyeOff size={15} /> : <Eye size={15} />}</button>}
                error={errors.password?.message} autoComplete="current-password" {...register('password')} />
              <Button type="submit" className="w-full mt-2" size="lg" loading={isSubmitting}>Sign In</Button>
            </form>
            <p className="text-center text-xs text-gray-400 mt-6">KalingaLumière ERP v1.0 — Agarbatti Manufacturing</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
