import { toast } from "@/shared/lib/toast";
import React, { useState, useEffect } from "react";
import type { Document, DocumentCreate, OwnerType, DocumentType, DocumentStatus } from "@/entities/documents";

interface DocumentFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: DocumentCreate) => void;
  document?: Document | null;
}

export const DocumentForm: React.FC<DocumentFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  document,
}) => {
  const [formData, setFormData] = useState<DocumentCreate>({
    owner_type: "Student",
    owner_id: 0,
    document_type: "Passport",
    file_url: "",
    status: "Pending",
    is_active: true,
  });

  useEffect(() => {
    queueMicrotask(() => {
      if (document && isOpen) {
        setFormData({
          owner_type: document.owner_type,
          owner_id: document.owner_id,
          document_type: document.document_type,
          file_url: document.file_url,
          status: document.status,
          is_active: document.is_active,
        });
      } else if (isOpen) {
        setFormData({
          owner_type: "Student",
          owner_id: 0,
          document_type: "Passport",
          file_url: "",
          status: "Pending",
          is_active: true,
        });
      }
    });
  }, [document, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      owner_id: Number(formData.owner_id),
    });
  };

  const inputClassName = "w-full text-sm border-b border-neutral-200 focus:border-black focus:outline-none py-2 transition-colors pb-1.5 bg-transparent";

  const ownerTypes: OwnerType[] = ["Student", "Employee"];
  const docTypes: DocumentType[] = ["Passport", "Transcript", "Contract", "ID Card", "Other"];
  const statuses: DocumentStatus[] = ["Pending", "Verified", "Rejected"];

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white max-w-md w-full rounded-xl shadow-xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-6 pb-4 border-b border-neutral-100">
          <h2 className="text-lg font-semibold text-neutral-900 tracking-tight">
            {document ? "Edit Document" : "Add Document"}
          </h2>
          <button type="button" onClick={onClose} className="text-neutral-400 hover:text-neutral-600">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col p-6 gap-6 overflow-y-auto">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-neutral-500 mb-1.5">Owner Type</label>
              <select
                required
                value={formData.owner_type}
                onChange={(e) => setFormData({ ...formData, owner_type: e.target.value as OwnerType })}
                className={inputClassName}
              >
                {ownerTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-500 mb-1.5">Owner ID</label>
              <input
                type="number"
                required
                min="1"
                value={formData.owner_id || ""}
                onChange={(e) => setFormData({ ...formData, owner_id: Number(e.target.value) })}
                className={inputClassName}
                placeholder="e.g. 1001"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-500 mb-1.5">Document Type</label>
              <select
                required
                value={formData.document_type}
                onChange={(e) => setFormData({ ...formData, document_type: e.target.value as DocumentType })}
                className={inputClassName}
              >
                {docTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-500 mb-1.5">File URL</label>
              <input
                type="text"
                required
                value={formData.file_url}
                onChange={(e) => setFormData({ ...formData, file_url: e.target.value })}
                className={inputClassName}
                placeholder="e.g. https://storage/doc.pdf"
              />
            </div>
            
            <div>
              <label className="block text-xs font-medium text-neutral-500 mb-1.5">Status</label>
              <select
                required
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as DocumentStatus })}
                className={inputClassName}
              >
                {statuses.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="rounded border-neutral-300 text-black focus:ring-black"
              />
              <label htmlFor="is_active" className="text-sm font-medium text-neutral-700">
                Active Document
              </label>
            </div>
          </div>

          <div className="flex gap-3 pt-2 border-t border-neutral-100">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-sm font-medium text-neutral-700 border border-neutral-200 rounded-md hover:bg-neutral-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-black rounded-md hover:bg-neutral-900"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
