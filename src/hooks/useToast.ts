import toast from 'react-hot-toast';
export const useToast = () => ({
  success: (m: string) => toast.success(m, { duration: 3000 }),
  error:   (m: string) => toast.error(m,   { duration: 4000 }),
  info:    (m: string) => toast(m),
  loading: (m: string) => toast.loading(m),
  dismiss: (id?: string) => toast.dismiss(id),
});
