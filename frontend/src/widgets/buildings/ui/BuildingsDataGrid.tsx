"use client";

import React, { useState, useEffect, useMemo } from "react";
import { DataGrid } from "@/shared/ui";
import { ColDef } from "ag-grid-community";
import { Plus, Search } from "lucide-react";
import { toast } from "@/shared/lib/toast";

import { Building, BuildingCreate, BuildingUpdate, getBuildings, createBuilding, updateBuilding, deleteBuilding } from "@/entities/buildings";
import { ActionCellRenderer, BuildingForm } from "@/features/buildings";

interface BuildingsDataGridProps {
  canMutate?: boolean;
}

export const BuildingsDataGrid: React.FC<BuildingsDataGridProps> = ({ canMutate = true }) => {
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [buildingToEdit, setBuildingToEdit] = useState<Building | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchBuildings = () => {
    setLoading(true);
    getBuildings()
      .then((data) => setBuildings(data))
      .catch((err) => {
        if (err instanceof Error) {
          toast.error("Failed to load buildings", err.message);
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchBuildings();
  }, []);

  const filteredBuildings = useMemo(() => {
    return buildings.filter((building) => {
      const codeString = building.code || "";
      const nameString = building.name || "";
      return (
        codeString.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        nameString.toLowerCase().includes(debouncedSearch.toLowerCase())
      );
    });
  }, [buildings, debouncedSearch]);

  const handleEdit = (building: Building) => {
    setBuildingToEdit(building);
    setIsFormOpen(true);
  };

  const handleDelete = (id: number) => {
    toast.confirm(
      "Delete Building",
      "Are you sure you want to delete this building?",
      async () => {
        try {
          await deleteBuilding(id);
          toast.success("Building deleted successfully");
          fetchBuildings();
        } catch (error) {
          if (error instanceof Error) {
            toast.error("Failed to delete building", error.message);
          }
        }
      }
    );
  };

  const handleFormSubmit = async (data: BuildingCreate) => {
    try {
      if (buildingToEdit) {
        await updateBuilding(buildingToEdit.id, data as BuildingUpdate);
        toast.success("Building updated successfully");
      } else {
        await createBuilding(data);
        toast.success("Building created successfully");
      }
      setIsFormOpen(false);
      fetchBuildings();
    } catch (error) {
      if (error instanceof Error) {
        toast.error(`Failed to ${buildingToEdit ? 'update' : 'create'} building`, error.message);
      }
    }
  };

  const columnDefs = useMemo<ColDef<Building>[]>(() => {
    const cols: ColDef<Building>[] = [
      {
        field: "id",
        headerName: "ID",
        width: 80,
      },
      {
        field: "code",
        headerName: "Code",
        flex: 1,
      },
      {
        field: "name",
        headerName: "Name",
        flex: 2,
        valueFormatter: (params) => params.value ? params.value : "N/A",
      },
    ];

    if (canMutate) {
      cols.push({
        headerName: "",
        width: 100,
        cellRenderer: ActionCellRenderer,
        cellRendererParams: {
          onEdit: handleEdit,
          onDelete: handleDelete,
        },
        sortable: false,
        filter: false,
      });
    }

    return cols;
  }, [canMutate]);

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
            Buildings
          </h2>
          <p className="text-sm text-neutral-500">
            Manage university buildings and facilities
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Search buildings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-neutral-200 rounded-md focus:border-black focus:outline-none transition-colors bg-white"
            />
          </div>
          {canMutate && (
            <button
              onClick={() => {
                setBuildingToEdit(null);
                setIsFormOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-black text-white text-sm font-medium rounded-md hover:bg-neutral-900 transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Add Building
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
          rowData={filteredBuildings}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          height={600}
        />
      </div>

      <BuildingForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        building={buildingToEdit}
      />
    </div>
  );
};
