import { ShieldX } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useAuthStore } from "@/store/authStore";
import { resolveDashboardRoute } from "@/utils/routing";

export default function AccessDeniedPage() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-xl items-center justify-center">
      <Card className="w-full p-8 text-center">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 text-red-500">
          <ShieldX size={24} aria-hidden="true" />
        </span>
        <h1 className="mt-4 text-xl font-semibold text-gray-900 dark:text-white">Access denied</h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Your account does not have access to this area. Contact an administrator if you believe this is incorrect.
        </p>
        <Button className="mt-6" onClick={() => navigate(user ? resolveDashboardRoute(user) : "/login", { replace: true })}>
          Return to your workspace
        </Button>
      </Card>
    </div>
  );
}
