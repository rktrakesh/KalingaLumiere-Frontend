import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Download, Eye, FileText, Plus, Trash2, Upload } from "lucide-react";
import { employeesApi } from "@/services/api/employees.api";
import type { EmployeeDocument, EmployeeDocumentType } from "@/types";
import { Badge, statusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { DataTable, type Column } from "@/components/common/DataTable";
import { ConfirmModal } from "@/components/common/ConfirmModal";
import { useToast } from "@/hooks/useToast";
import { getApiErrorMessage } from "@/utils/apiError";
import { formatDate } from "@/utils/format";

const DOCUMENT_LABELS: Record<EmployeeDocumentType, string> = {
  PROFILE_PHOTO: "Profile Photo",
  IDENTITY_PROOF: "Identity Proof",
  PAN: "PAN",
  BANK_PROOF: "Bank Proof",
  CERTIFICATE: "Certificate",
  DRIVING_LICENSE: "Driving License",
  APPOINTMENT_LETTER: "Appointment Letter",
  SALARY_SLIP_ACKNOWLEDGEMENT: "Salary Slip Acknowledgement",
};

const IMAGE_TYPES = new Set<EmployeeDocumentType>(["PROFILE_PHOTO"]);

interface EmployeeDocumentsPanelProps {
  employeeId: number;
}

export function EmployeeDocumentsPanel({ employeeId }: EmployeeDocumentsPanelProps) {
  const queryClient = useQueryClient();
  const toast = useToast();
  const [showUpload, setShowUpload] = useState(false);
  const [documentType, setDocumentType] = useState<EmployeeDocumentType>("PROFILE_PHOTO");
  const [expiryDate, setExpiryDate] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [archiveTarget, setArchiveTarget] = useState<EmployeeDocument | null>(null);
  const [preview, setPreview] = useState<{ document: EmployeeDocument; url: string } | null>(null);

  const documentsQuery = useQuery({
    queryKey: ["employee-documents", employeeId],
    queryFn: () => employeesApi.getDocuments(employeeId),
    enabled: employeeId > 0,
  });
  const result = documentsQuery.data?.data.data;
  const documents = result?.documents ?? [];
  const currentTypes = useMemo(() => new Set(documents.map((item) => item.documentType)), [documents]);

  useEffect(() => () => {
    if (preview) URL.revokeObjectURL(preview.url);
  }, [preview]);

  const resetUpload = () => {
    setShowUpload(false);
    setFile(null);
    setExpiryDate("");
    setDocumentType("PROFILE_PHOTO");
  };

  const openUpload = (type: EmployeeDocumentType = "PROFILE_PHOTO") => {
    setDocumentType(type);
    setFile(null);
    setExpiryDate("");
    setShowUpload(true);
  };

  const uploadMutation = useMutation({
    mutationFn: () => {
      if (!file) throw new Error("Select a file to upload");
      return employeesApi.uploadDocument(employeeId, documentType, file, expiryDate || undefined);
    },
    onSuccess: () => {
      toast.success("Employee document uploaded");
      queryClient.invalidateQueries({ queryKey: ["employee-documents", employeeId] });
      queryClient.invalidateQueries({ queryKey: ["employee-profile-photo", employeeId] });
      resetUpload();
    },
    onError: (error: unknown) => toast.error(getApiErrorMessage(error, "Unable to upload document")),
  });

  const archiveMutation = useMutation({
    mutationFn: (document: EmployeeDocument) => employeesApi.archiveDocument(employeeId, document.id),
    onSuccess: () => {
      toast.success("Employee document archived");
      queryClient.invalidateQueries({ queryKey: ["employee-documents", employeeId] });
      setArchiveTarget(null);
    },
    onError: (error: unknown) => toast.error(getApiErrorMessage(error, "Unable to archive document")),
  });

  const viewDocument = async (document: EmployeeDocument) => {
    try {
      const response = await employeesApi.getDocumentContent(employeeId, document.id);
      if (preview) URL.revokeObjectURL(preview.url);
      setPreview({ document, url: URL.createObjectURL(response.data) });
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Unable to view document"));
    }
  };

  const downloadDocument = async (document: EmployeeDocument) => {
    try {
      const response = await employeesApi.getDocumentContent(employeeId, document.id, true);
      const url = URL.createObjectURL(response.data);
      const anchor = window.document.createElement("a");
      anchor.href = url;
      anchor.download = document.originalFileName;
      window.document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 0);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Unable to download document"));
    }
  };

  const columns: Column<EmployeeDocument>[] = [
    { key: "type", header: "Document", render: (item) => <div><p className="font-medium text-gray-900 dark:text-white">{DOCUMENT_LABELS[item.documentType]}</p><p className="text-xs text-gray-500">{item.required ? "Required" : "Optional"}</p></div> },
    { key: "file", header: "File", render: (item) => <div><p className="max-w-56 truncate" title={item.originalFileName}>{item.originalFileName}</p><p className="text-xs text-gray-500">{formatBytes(item.fileSize)}</p></div> },
    { key: "uploaded", header: "Uploaded", render: (item) => <div><p>{formatDate(item.uploadedAt)}</p><p className="text-xs text-gray-500">{item.uploadedBy ?? "System"}</p></div> },
    { key: "expiry", header: "Expiry", render: (item) => item.expiryDate ? formatDate(item.expiryDate) : "—" },
    { key: "status", header: "Status", render: (item) => <Badge variant={statusBadge(item.status)}>{item.status}</Badge> },
    { key: "actions", header: "Actions", render: (item) => <div className="flex flex-wrap items-center gap-1"><Button size="sm" variant="ghost" icon={<Eye size={14} />} onClick={() => viewDocument(item)}>View</Button><Button size="sm" variant="ghost" icon={<Download size={14} />} onClick={() => downloadDocument(item)}>Download</Button>{result?.canManage && item.documentType !== "CERTIFICATE" && <Button size="sm" variant="ghost" icon={<Upload size={14} />} onClick={() => openUpload(item.documentType)}>Replace</Button>}{result?.canManage && <Button size="sm" variant="ghost" icon={<Trash2 size={14} />} className="text-red-600" onClick={() => setArchiveTarget(item)}>Archive</Button>}</div> },
  ];

  if (documentsQuery.isError) {
    return <Card padding="md"><p className="text-sm text-red-600 dark:text-red-400">Employee documents could not be loaded.</p></Card>;
  }

  return (
    <div className="space-y-5">
      <Card padding="md">
        <CardHeader className="items-start">
          <div><CardTitle>Mandatory documents</CardTitle><p className="mt-1 text-xs text-gray-500">Both documents are required before a draft employee can be activated.</p></div>
          {result?.canManage && <Button size="sm" icon={<Upload size={14} />} onClick={() => openUpload()}>Upload document</Button>}
        </CardHeader>
        <div className="grid gap-3 sm:grid-cols-2">
          {(result?.requiredDocumentTypes ?? ["PROFILE_PHOTO", "IDENTITY_PROOF"] as EmployeeDocumentType[]).map((type) => (
            <div key={type} className="flex items-center justify-between rounded-lg border border-gray-200 p-3 dark:border-gray-700">
              <div className="flex items-center gap-2"><FileText size={16} className="text-gray-400" /><span className="text-sm font-medium">{DOCUMENT_LABELS[type]}</span></div>
              <Badge variant={currentTypes.has(type) ? "success" : "warning"}>{currentTypes.has(type) ? "Uploaded" : "Missing"}</Badge>
            </div>
          ))}
        </div>
      </Card>

      <Card padding="md">
        <CardHeader><CardTitle>Current documents</CardTitle>{result?.canManage && <Button size="sm" variant="outline" icon={<Plus size={14} />} onClick={() => openUpload()}>Add</Button>}</CardHeader>
        <DataTable columns={columns} data={documents} loading={documentsQuery.isLoading} rowKey={(item) => item.id} emptyMessage="No employee documents have been uploaded." />
      </Card>

      <Modal isOpen={showUpload} onClose={resetUpload} title="Upload employee document" size="md" footer={<><Button variant="outline" onClick={resetUpload}>Cancel</Button><Button loading={uploadMutation.isPending} disabled={!file} onClick={() => uploadMutation.mutate()}>Upload</Button></>}>
        <div className="space-y-4">
          <Select label="Document type" value={documentType} onChange={(event) => { setDocumentType(event.target.value as EmployeeDocumentType); setFile(null); }} options={(result?.supportedDocumentTypes ?? []).map((type) => ({ value: type, label: DOCUMENT_LABELS[type] }))} />
          <Input label="Expiry date" type="date" value={expiryDate} onChange={(event) => setExpiryDate(event.target.value)} hint="Optional. No reminder workflow is enabled in Phase 4." />
          <div className="space-y-1.5"><label htmlFor="employee-document-file" className="block text-sm font-medium text-gray-700 dark:text-gray-300">File</label><input id="employee-document-file" type="file" accept={IMAGE_TYPES.has(documentType) ? ".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp" : ".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"} onChange={(event) => setFile(event.target.files?.[0] ?? null)} className="block w-full rounded-md border border-gray-300 bg-white p-2.5 text-sm text-gray-700 file:mr-3 file:rounded file:border-0 file:bg-brand-500 file:px-3 file:py-1.5 file:font-semibold file:text-gray-950 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-300" /></div>
          <p className="text-xs text-gray-500">Uploading a singleton document type safely supersedes its current version. Historical files are retained.</p>
        </div>
      </Modal>

      <Modal isOpen={!!preview} onClose={() => { if (preview) URL.revokeObjectURL(preview.url); setPreview(null); }} title={preview ? DOCUMENT_LABELS[preview.document.documentType] : "Document preview"} size="2xl">
        {preview && (preview.document.mimeType.startsWith("image/") ? <img src={preview.url} alt={preview.document.originalFileName} className="mx-auto max-h-[70vh] max-w-full object-contain" /> : <iframe src={preview.url} title={preview.document.originalFileName} className="h-[70vh] w-full rounded border border-gray-200 dark:border-gray-700" />)}
      </Modal>

      <ConfirmModal isOpen={!!archiveTarget} onClose={() => setArchiveTarget(null)} onConfirm={() => archiveTarget && archiveMutation.mutate(archiveTarget)} loading={archiveMutation.isPending} title="Archive employee document?" message="The document will no longer be current. Its metadata and physical file will be retained." confirmLabel="Archive" />
    </div>
  );
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
