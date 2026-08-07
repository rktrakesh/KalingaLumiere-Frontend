import axios from "axios";
import { useQuery } from "@tanstack/react-query";

const baseURL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:9090/api/v1";

export interface Branding {
  companyName: string;
  companyShortName: string;
  companyLogoUrl: string;
  companyAddress: string;
  companyPhone: string;
  companyEmail: string;
  companyWebsite: string;
}

export const DEFAULT_BRANDING: Branding = {
  companyName: "ERP System",
  companyShortName: "ERP",
  companyLogoUrl: "",
  companyAddress: "",
  companyPhone: "",
  companyEmail: "",
  companyWebsite: "",
};

const normalizeBranding = (branding?: Partial<Branding>): Branding => ({
  companyName: branding?.companyName?.trim() || DEFAULT_BRANDING.companyName,
  companyShortName: branding?.companyShortName?.trim() || DEFAULT_BRANDING.companyShortName,
  companyLogoUrl: branding?.companyLogoUrl?.trim() || "",
  companyAddress: branding?.companyAddress?.trim() || "",
  companyPhone: branding?.companyPhone?.trim() || "",
  companyEmail: branding?.companyEmail?.trim() || "",
  companyWebsite: branding?.companyWebsite?.trim() || "",
});

export const useCompanyBranding = () =>
  useQuery({
    queryKey: ["public-branding"],
    queryFn: async () => {
      const response = await axios.get(`${baseURL}/public/branding`);
      return normalizeBranding(response.data.data as Partial<Branding>);
    },
    placeholderData: DEFAULT_BRANDING,
    staleTime: 60_000,
  });

export const useBranding = useCompanyBranding;

export const publicAssetUrl = (url?: string): string | undefined => {
  if (!url?.trim()) return undefined;
  if (/^https?:\/\//i.test(url)) return url;
  return `${baseURL.replace(/\/api\/v1$/, "")}${url.startsWith("/") ? url : `/${url}`}`;
};

export const logoUrl = publicAssetUrl;
