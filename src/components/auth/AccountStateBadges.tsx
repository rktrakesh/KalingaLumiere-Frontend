import { AlertTriangle, CheckCircle2, KeyRound, LockKeyhole, UserX } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import type { UserProfile } from "@/types";

type AccountState = Pick<UserProfile, "status" | "enabled" | "accountNonLocked" | "credentialsExpired" | "mustChangePassword" | "temporaryPasswordExpiresAt">;

export const AccountStateBadges = ({ user }: { user: AccountState }) => {
  const temporaryExpired = Boolean(user.temporaryPasswordExpiresAt && new Date(user.temporaryPasswordExpiresAt).getTime() < Date.now() && user.mustChangePassword);
  return (
    <div className="flex flex-wrap gap-1.5" aria-label="Account state">
      <Badge variant={user.status === "ACTIVE" ? "success" : user.status === "LOCKED" ? "danger" : "neutral"}>
        {user.status === "ACTIVE" ? <CheckCircle2 size={11} className="mr-1" /> : <UserX size={11} className="mr-1" />}{user.status}
      </Badge>
      {!user.enabled && <Badge variant="danger"><UserX size={11} className="mr-1" />Disabled</Badge>}
      {!user.accountNonLocked && <Badge variant="danger"><LockKeyhole size={11} className="mr-1" />Account locked</Badge>}
      {user.credentialsExpired && <Badge variant="warning"><AlertTriangle size={11} className="mr-1" />Credentials expired</Badge>}
      {user.mustChangePassword && <Badge variant="warning"><KeyRound size={11} className="mr-1" />Must change password</Badge>}
      {temporaryExpired && <Badge variant="danger"><AlertTriangle size={11} className="mr-1" />Temporary password expired</Badge>}
    </div>
  );
};
