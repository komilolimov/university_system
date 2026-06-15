"use client";

import React, { useState, useEffect, useMemo } from "react";
import { DataGrid } from "@/shared/ui";
import { ColDef } from "ag-grid-community";
import { Plus, Search } from "lucide-react";
import { toast } from "@/shared/lib/toast";

import { Room, RoomCreate, RoomUpdate, getRooms, createRoom, updateRoom, deleteRoom } from "@/entities/rooms";
import { getBuildings, type Building } from "@/entities/buildings";
import { ActionCellRenderer, RoomForm } from "@/features/rooms";

interface RoomsDataGridProps {
  canWrite?: boolean;
  canDelete?: boolean;
}

export const RoomsDataGrid: React.FC<RoomsDataGridProps> = ({ canWrite = true, canDelete = true }) => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [buildingsMap, setBuildingsMap] = useState<Record<number, Building>>({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [roomToEdit, setRoomToEdit] = useState<Room | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [roomsData, buildingsData] = await Promise.all([
        getRooms(),
        getBuildings()
      ]);
      setRooms(roomsData);
      
      const bMap: Record<number, Building> = {};
      for (const b of buildingsData) {
        bMap[b.id] = b;
      }
      setBuildingsMap(bMap);
    } catch (err) {
      if (err instanceof Error) {
        toast.error("Failed to load rooms", err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const [roomsData, buildingsData] = await Promise.all([
          getRooms(),
          getBuildings()
        ]);
        setRooms(roomsData);
        
        const bMap: Record<number, Building> = {};
        for (const b of buildingsData) {
          bMap[b.id] = b;
        }
        setBuildingsMap(bMap);
      } catch (err) {
        if (err instanceof Error) {
          toast.error("Failed to load rooms", err.message);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filteredRooms = useMemo(() => {
    return rooms.filter((room) => {
      const roomString = room.room_number || "";
      const buildingName = buildingsMap[room.building_id]?.name || "";
      const typeString = room.type || "";
      
      return (
        roomString.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        buildingName.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        typeString.toLowerCase().includes(debouncedSearch.toLowerCase())
      );
    });
  }, [rooms, buildingsMap, debouncedSearch]);

  const handleEdit = (room: Room) => {
    setRoomToEdit(room);
    setIsFormOpen(true);
  };

  const handleDelete = (id: number) => {
    toast.confirm(
      "Delete Room",
      "Are you sure you want to delete this room?",
      async () => {
        try {
          await deleteRoom(id);
          toast.success("Room deleted successfully");
          fetchData();
        } catch (error) {
          if (error instanceof Error) {
            toast.error("Failed to delete room", error.message);
          }
        }
      }
    );
  };

  const handleFormSubmit = async (data: RoomCreate) => {
    try {
      if (roomToEdit) {
        await updateRoom(roomToEdit.id, data as RoomUpdate);
        toast.success("Room updated successfully");
      } else {
        await createRoom(data);
        toast.success("Room created successfully");
      }
      setIsFormOpen(false);
      fetchData();
    } catch (error) {
      if (error instanceof Error) {
        toast.error(`Failed to ${roomToEdit ? 'update' : 'create'} room`, error.message);
      }
    }
  };

  const columnDefs = useMemo<ColDef<Room>[]>(() => {
    const cols: ColDef<Room>[] = [
      {
        field: "id",
        headerName: "ID",
        width: 80,
      },
      {
        field: "room_number",
        headerName: "Room Number",
        flex: 1,
      },
      {
        headerName: "Building",
        flex: 2,
        valueGetter: (params) => {
          if (!params.data) return "N/A";
          const building = buildingsMap[params.data.building_id];
          return building ? `${building.name} (${building.code})` : params.data.building_id;
        },
      },
      {
        field: "type",
        headerName: "Type",
        flex: 1,
      },
      {
        field: "capacity",
        headerName: "Capacity",
        flex: 1,
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
  }, [buildingsMap, canWrite, canDelete]);

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
            Rooms
          </h2>
          <p className="text-sm text-neutral-500">
            Manage university rooms and facilities
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Search rooms..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-neutral-200 rounded-md focus:border-black focus:outline-none transition-colors bg-white"
            />
          </div>
          {canWrite && (
            <button
              onClick={() => {
                setRoomToEdit(null);
                setIsFormOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-black text-white text-sm font-medium rounded-md hover:bg-neutral-900 transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Add Room
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
          rowData={filteredRooms}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          height={600}
        />
      </div>

      <RoomForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        room={roomToEdit}
      />
    </div>
  );
};
