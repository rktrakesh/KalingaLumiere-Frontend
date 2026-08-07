import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { User } from "lucide-react";
import { employeesApi } from "@/services/api/employees.api";
import { cn } from "@/utils/cn";

interface EmployeeProfilePhotoProps {
  employeeId: number;
  employeeName: string;
  className?: string;
}

export function EmployeeProfilePhoto({ employeeId, employeeName, className }: EmployeeProfilePhotoProps) {
  const [source, setSource] = useState<string | null>(null);
  const photoQuery = useQuery({
    queryKey: ["employee-profile-photo", employeeId],
    queryFn: () => employeesApi.getProfilePhoto(employeeId),
    retry: false,
  });

  useEffect(() => {
    const objectUrl = photoQuery.data ? URL.createObjectURL(photoQuery.data.data) : null;
    setSource(objectUrl);
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [photoQuery.data]);

  return (
    <div className={cn("flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full border border-gray-200 bg-gray-100 text-gray-400 dark:border-gray-700 dark:bg-gray-800", className)}>
      {source ? <img src={source} alt={`${employeeName} profile`} className="h-full w-full object-cover" /> : <User size={22} aria-hidden="true" />}
    </div>
  );
}
