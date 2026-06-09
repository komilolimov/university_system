"use client";

import { useState, useEffect, useMemo, useTransition } from "react";
import { DataGrid } from "@/shared/ui";
import { 
  getStudentPrograms, 
  deleteStudentProgram, 
  getStudentsList,
  getDegreePrograms,
  type StudentProgram, 
  type Student, 
  type DegreeProgram,
  type ProgramType
} from "@/entities/student-programs";
import { 
  StudentProgramForm, 
  ActionCellRenderer, 
  StudentProgramFiltersToolbar 
} from "@/features/student-programs";
import type { ColDef } from "ag-grid-community";
import { toast } from "@/shared/lib/toast";
import { Plus } from "lucide-react";

interface StudentProgramsDataGridProps {
  canMutate?: boolean;
}

export const StudentProgramsDataGrid = ({ canMutate = true }: StudentProgramsDataGridProps) => {
  const [records, setRecords] = useState<StudentProgram[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [programs, setPrograms] = useState<DegreeProgram[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<ProgramType | "all">("all");

  // Form Modal States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<StudentProgram | null>(null);

  const [isPending, startTransition] = useTransition();

  const [isDataLoaded, setIsDataLoaded] = useState(false);

  useEffect(() => {
    Promise.all([
      getStudentsList().catch(() => []),
      getDegreePrograms().catch(() => [])
    ]).then(([studentsData, programsData]) => {
      setStudents(studentsData);
      setPrograms(programsData);
      setIsDataLoaded(true);
    });
  }, []);

  const fetchRecords = () => {
    setLoading(true);
    getStudentPrograms()
      .then((data) => {
        let filteredData = data;
        
        if (selectedType !== "all") {
          filteredData = filteredData.filter(d => d.type === selectedType);
        }

        if (searchQuery.trim()) {
          const lowerQuery = searchQuery.toLowerCase();
          filteredData = filteredData.filter(d => {
            const student = students.find(s => s.id === d.student_id);
            const program = programs.find(p => p.id === d.program_id);
            
            const studentName = student ? `${student.first_name} ${student.last_name}`.toLowerCase() : "";
            const programName = program ? program.title.toLowerCase() : "";
            
            return studentName.includes(lowerQuery) || programName.includes(lowerQuery);
          });
        }

        setRecords(filteredData);
      })
      .catch((err: unknown) => {
        if (err instanceof Error) {
          toast.error("Failed to load student programs", err.message);
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (isDataLoaded) {
      fetchRecords();
    }
  }, [searchQuery, selectedType, isDataLoaded]);

  const handleEdit = (record: StudentProgram) => {
    setEditingRecord(record);
    setIsFormOpen(true);
  };

  const handleDelete = (studentId: number, programId: number) => {
    toast.confirm(
      "Delete Program Enrollment",
      "Are you sure you want to remove this program enrollment? This action cannot be undone.",
      () => {
        startTransition(() => {
          deleteStudentProgram(studentId, programId)
            .then(() => {
              toast.success("Enrollment deleted successfully");
              fetchRecords();
            })
            .catch((err: unknown) => {
              if (err instanceof Error) {
                toast.error("Failed to delete", err.message);
              }
            });
        });
      }
    );
  };

  const columnDefs = useMemo<ColDef<StudentProgram>[]>(() => {
    const cols: ColDef<StudentProgram>[] = [
      {
        headerName: "Student",
        flex: 1.5,
        valueGetter: (params) => {
          const data = params.data;
          if (!data) return "Unknown";
          const student = students.find((s) => s.id === data.student_id);
          return student ? `${student.first_name} ${student.last_name}` : "Unknown Student";
        },
      },
      {
        headerName: "Program",
        flex: 2,
        valueGetter: (params) => {
          const data = params.data;
          if (!data) return "Unknown";
          const program = programs.find((p) => p.id === data.program_id);
          return program ? program.title : "Unknown Program";
        },
      },
      {
        field: "type",
        headerName: "Type",
        flex: 1,
      },
      {
        field: "declared_date",
        headerName: "Declared Date",
        flex: 1,
      },
    ];

    if (canMutate) {
      cols.push({
        headerName: "Actions",
        flex: 0.5,
        minWidth: 100,
        sortable: false,
        filter: false,
        pinned: "right",
        cellRenderer: ActionCellRenderer,
      });
    }

    return cols;
  }, [students, programs, canMutate]);

  const handleAddNew = () => {
    setEditingRecord(null);
    setIsFormOpen(true);
  };

  return (
    <div className="w-full flex flex-col gap-4">  
      {/* Action Header bar */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-neutral-900">
            Student Programs
          </h2>
          <p className="text-sm text-neutral-500">
            Manage student enrollments in academic programs
          </p>
        </div>

        {canMutate && (
          <button
            onClick={handleAddNew}
            className="flex items-center gap-2 px-4 py-2 bg-black text-white text-sm font-medium rounded-md hover:bg-neutral-900 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add Program
          </button>
        )}
      </div>

      {/* Filter Toolbar */}
      <StudentProgramFiltersToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedType={selectedType}
        onTypeChange={setSelectedType}
      />

      {/* Main Grid Wrapper */}
      <div className="relative border border-neutral-200 rounded-lg overflow-hidden bg-white shadow-sm">
        {(loading || isPending) && (
          <div className="absolute inset-0 z-10 bg-white/50 backdrop-blur-[1px] flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        <DataGrid
          rowData={records}
          columnDefs={columnDefs}
          context={{
            canMutate,
            onEdit: handleEdit,
            onDelete: handleDelete,
          }}
          height={600}
        />
      </div>

      <StudentProgramForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        studentProgram={editingRecord}
        students={students}
        programs={programs}
        onSubmitSuccess={fetchRecords}
      />
    </div>
  );
};
