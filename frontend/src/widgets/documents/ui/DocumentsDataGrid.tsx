"use client";

import React, { useState, useEffect, useMemo } from "react";
import { DataGrid } from "@/shared/ui";
import { ColDef, ICellRendererParams } from "ag-grid-community";
import { Plus, Search } from "lucide-react";
import { toast } from "@/shared/lib/toast";

import { Document, DocumentCreate, DocumentUpdate, getDocuments, createDocument, updateDocument, deleteDocument } from "@/entities/documents";
import { ActionCellRenderer, DocumentForm } from "@/features/documents";

interface DocumentsDataGridProps {
  canWrite?: boolean;
  canDelete?: boolean;
}

export const DocumentsDataGrid: React.FC<DocumentsDataGridProps> = ({ canWrite = true, canDelete = true }) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [documentToEdit, setDocumentToEdit] = useState<Document | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getDocuments();
      setDocuments(data);
    } catch (err) {
      if (err instanceof Error) {
        toast.error("Failed to load documents", err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const data = await getDocuments();
        setDocuments(data);
      } catch (err) {
        if (err instanceof Error) {
          toast.error("Failed to load documents", err.message);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => {
      const ownerTypeStr = doc.owner_type || "";
      const docTypeStr = doc.document_type || "";
      const statusStr = doc.status || "";
      
      return (
        ownerTypeStr.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        docTypeStr.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        statusStr.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        doc.owner_id.toString().includes(debouncedSearch)
      );
    });
  }, [documents, debouncedSearch]);

  const handleEdit = (doc: Document) => {
    setDocumentToEdit(doc);
    setIsFormOpen(true);
  };

  const handleDelete = (id: number) => {
    toast.confirm(
      "Delete Document",
      "Are you sure you want to delete this document?",
      async () => {
        try {
          await deleteDocument(id);
          toast.success("Document deleted successfully");
          fetchData();
        } catch (error) {
          if (error instanceof Error) {
            toast.error("Failed to delete document", error.message);
          }
        }
      }
    );
  };

  const handleFormSubmit = async (data: DocumentCreate) => {
    try {
      if (documentToEdit) {
        await updateDocument(documentToEdit.id, data as DocumentUpdate);
        toast.success("Document updated successfully");
      } else {
        await createDocument(data);
        toast.success("Document created successfully");
      }
      setIsFormOpen(false);
      fetchData();
    } catch (error) {
      if (error instanceof Error) {
        toast.error(`Failed to ${documentToEdit ? 'update' : 'create'} document`, error.message);
      }
    }
  };

  const columnDefs = useMemo<ColDef<Document>[]>(() => {
    const cols: ColDef<Document>[] = [
      {
        field: "id",
        headerName: "ID",
        width: 80,
      },
      {
        field: "owner_type",
        headerName: "Owner Type",
        flex: 1,
      },
      {
        field: "owner_id",
        headerName: "Owner ID",
        flex: 1,
      },
      {
        field: "document_type",
        headerName: "Document Type",
        flex: 1,
      },
      {
        field: "file_url",
        headerName: "File URL",
        flex: 1.5,
      },
      {
        field: "status",
        headerName: "Status",
        flex: 1,
      },
      {
        field: "is_active",
        headerName: "Active",
        width: 100,
        valueFormatter: (params) => params.value ? "Yes" : "No",
        cellRenderer: (params: ICellRendererParams<Document, boolean>) => {
          const isActive = params.value;
          return (
            <div className="h-full flex items-center">
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold select-none transition-colors border ${
                  isActive
                    ? "bg-green-50 text-green-700 border-green-200"
                    : "bg-neutral-100 text-neutral-500 border-neutral-200"
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full mr-1.5 ${
                    isActive ? "bg-green-500" : "bg-neutral-400"
                  }`}
                />
                {isActive ? "Active" : "Inactive"}
              </span>
            </div>
          );
        },
      },
    ];

    if (canWrite || canDelete) {
      cols.push({
        headerName: "",
        width: 100,
        cellRenderer: ActionCellRenderer,
        cellRendererParams: {
          onEdit: handleEdit,
          onDelete: handleDelete,
          canEdit: canWrite,
          canDelete: canDelete,
        },
        sortable: false,
        filter: false,
      });
    }

    return cols;
  }, [canWrite, canDelete]);

  const defaultColDef = useMemo<ColDef>(() => {
    return {
      sortable: true,
      filter: true,
      resizable: true,
    };
  }, []);

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Action Header bar */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-neutral-900">
            Documents
          </h2>
          <p className="text-sm text-neutral-500">
            Manage student and employee documents
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-neutral-200 rounded-md focus:border-black focus:outline-none transition-colors bg-white"
            />
          </div>
          {canWrite && (
            <button
              onClick={() => {
                setDocumentToEdit(null);
                setIsFormOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-black text-white text-sm font-medium rounded-md hover:bg-neutral-900 transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Add Document
            </button>
          )}
        </div>
      </div>

      {/* Grid */}
      <div className="relative border border-neutral-200 rounded-lg overflow-hidden bg-white shadow-sm">
        {loading && (
          <div className="absolute inset-0 z-10 bg-white/50 backdrop-blur-[1px] flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        <DataGrid
          rowData={filteredDocuments}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          height={600}
        />
      </div>

      <DocumentForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        document={documentToEdit}
      />
    </div>
  );
};
