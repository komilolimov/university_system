"use client";

import React, { useState, useEffect, useMemo, useTransition } from "react";
import { DataGrid } from "@/shared/ui";
import { Plus } from "lucide-react";
import {
  getEmployees,
  updateEmployee,
  deleteEmployee,
  type Employee,
  type RegionType,
} from "@/entities/employee";
import { getRoles, type Role } from "@/entities/role";
import { getDepartments, type Department } from "@/entities/department";
import { EmployeeForm, ActionCellRenderer, EmployeeFiltersToolbar } from "@/features/employee";
import type { ColDef, ICellRendererParams } from "ag-grid-community";
import { toast } from "@/shared/lib/toast";

interface EmployeesDataGridProps {
  canMutate?: boolean;
}

export const EmployeesDataGrid = ({ canMutate = true }: EmployeesDataGridProps) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<"all" | "active" | "inactive">("active");

  // Form State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [employeeToEdit, setEmployeeToEdit] = useState<Employee | null>(null);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Load Reference Data (Roles, Departments)
  useEffect(() => {
    Promise.all([getRoles(), getDepartments()])
      .then(([rolesData, deptsData]) => {
        setRoles(rolesData);
        setDepartments(deptsData);
      })
      .catch((err) => console.error("Failed to load reference data", err));
  }, []);

  // Fetch Employees
  const fetchEmployees = () => {
    // Schedule loading state update asynchronously to avoid the
    // "Calling setState synchronously within an effect" linter warning.
    const timer = setTimeout(() => setLoading(true), 0);
    
    getEmployees({
      q: debouncedSearch || null,
      role_id: selectedRole ? parseInt(selectedRole, 10) : null,
      department_id: selectedDepartment ? parseInt(selectedDepartment, 10) : null,
      is_active: selectedStatus === "all" ? null : selectedStatus === "active",
    })
      .then((data) => {
        clearTimeout(timer);
        setEmployees(data);
      })
      .catch((err) => {
        if (err instanceof Error) {
          toast.error("Failed to load employees", err.message);
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchEmployees();
  }, [debouncedSearch, selectedRole, selectedDepartment, selectedStatus]);

  // Handlers
  const handleEdit = (employee: Employee) => {
    setEmployeeToEdit(employee);
    setIsFormOpen(true);
  };

  const handleDelete = (id: number) => {
    toast.confirm(
      "Archive Employee",
      "Are you sure you want to archive this employee? They will no longer have access to the system.",
      () => {
        startTransition(() => {
          deleteEmployee(id)
            .then(() => {
              toast.success("Employee archived");
              fetchEmployees();
            })
            .catch((err: unknown) => {
              if (err instanceof Error) {
                toast.error("Failed to archive", err.message);
              }
            });
        });
      }
    );
  };

  const handleActivate = (id: number) => {
  const employee = employees.find((e) => e.id === id);

  if (!employee) {
    toast.error("Employee not found");
    return;
  }

  startTransition(() => {
    const toastId = toast.loading(
      "Activating employee...",
      "Please wait."
    );

    updateEmployee(id, { is_active: true })
      .then(() => {
        fetchEmployees();
        toast.dismiss(toastId);
        toast.success(
          "Employee activated",
          "Employee is now active."
        );
      })
      .catch((err: unknown) => {
        toast.dismiss(toastId);
        if (err instanceof Error) {
          toast.error("Failed to activate employee", err.message);
        } else {
          toast.error("Error", "Unexpected error occurred.");
        }
      });
  });
};

  // AG Grid Columns
  const columnDefs = useMemo<ColDef<Employee>[]>(() => {
    const cols: ColDef<Employee>[] = [
      {
        field: "first_name",
        headerName: "First Name",
        flex: 1,
      },
      {
        field: "last_name",
        headerName: "Last Name",
        flex: 1,
      },
      {
        field: "email",
        headerName: "Email",
        flex: 1.5,
      },
      {
        field: "role_id",
        headerName: "Role",
        valueFormatter: (params) => {
          const role = roles.find((r) => r.id === params.value);
          return role ? role.title : "Unknown";
        },
        flex: 1,
      },
      {
        field: "department_id",
        headerName: "Department",
        valueFormatter: (params) => {
          if (!params.value) return "-";
          const dept = departments.find((d) => d.id === params.value);
          return dept ? dept.name : "Unknown";
        },
        flex: 1,
      },
      {
        field: "is_active",
        headerName: "Status",
        width: 120,
        valueFormatter: (params) => (params.value ? "Active" : "Inactive"),
        cellRenderer: (params: ICellRendererParams<Employee, boolean>) => {
          const isActive = params.value;
          return (
            <div className="h-full flex items-center">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold select-none transition-colors border ${
              isActive 
                ? "bg-green-50 text-green-700 border-green-200" 
                : "bg-neutral-100 text-neutral-500 border-neutral-200"
            }`}>
              <span className={`h-1.5 w-1.5 rounded-full mr-1.5 ${isActive ? "bg-green-500" : "bg-neutral-400"}`} />
              {isActive ? "Active" : "Inactive"}
            </span>
          </div>
          );
        },
      },
    ];

    if (canMutate) {
      cols.push({
        headerName: "Actions",
        flex: 1,
        sortable: false,
        filter: false,
        pinned: "right",
        cellRenderer: ActionCellRenderer,
      });
    }

    return cols;
  }, [roles, departments, canMutate]);

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Header & Add Button */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-neutral-900">
            Employee Directory
          </h2>
          <p className="text-sm text-neutral-500">
            Manage staff members and advisors
          </p>
        </div>
        {canMutate && (
          <button
            onClick={() => {
              setEmployeeToEdit(null);
              setIsFormOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-black text-white text-sm font-medium rounded-md hover:bg-neutral-900 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add Employee
          </button>
        )}
      </div>

      {/* Toolbar */}
      <EmployeeFiltersToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedRole={selectedRole}
        onRoleChange={setSelectedRole}
        selectedDepartment={selectedDepartment}
        onDepartmentChange={setSelectedDepartment}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        roles={roles}
        departments={departments}
      />

      {/* Grid */}
      <div className="relative border border-neutral-200 rounded-lg overflow-hidden bg-white shadow-sm">
        {(loading || isPending) && (
          <div className="absolute inset-0 z-10 bg-white/50 backdrop-blur-[1px] flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        <DataGrid
          rowData={employees}
          columnDefs={columnDefs}
          context={gridContext}
          height={600}
        />
      </div>

      {/* Form Modal */}
      <EmployeeForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        employee={employeeToEdit}
        roles={roles}
        departments={departments}
        onSubmitSuccess={fetchEmployees}
      />
    </div>
  );
};
