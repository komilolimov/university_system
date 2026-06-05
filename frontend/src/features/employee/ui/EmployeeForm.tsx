"use client";

import React, { useState, useEffect, useTransition } from "react";
import { X, Key } from "lucide-react";
import {
  type Employee,
  type EmployeeCreate,
  type EmployeeUpdate,
  type RegionType,
  createEmployee,
  updateEmployee,
} from "@/entities/employee";
import type { Role } from "@/entities/role";
import type { Department } from "@/entities/department";
import { toast } from "@/shared/lib/toast";

interface EmployeeFormProps {
  isOpen: boolean;
  onClose: () => void;
  employee: Employee | null;
  roles: Role[];
  departments: Department[];
  onSubmitSuccess: () => void;
}

export const EmployeeForm = ({
  isOpen,
  onClose,
  employee,
  roles,
  departments,
  onSubmitSuccess,
}: EmployeeFormProps) => {
  const isEditing = !!employee;
  const [isPending, startTransition] = useTransition();

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    role_id: "",
    department_id: "",
    region: "Domestic" as RegionType,
    hire_date: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    if (isOpen) {
      // Defer state update to avoid "Calling setState synchronously within an effect" warning
      setTimeout(() => {
        if (employee) {
          setFormData({
            first_name: employee.first_name,
            last_name: employee.last_name,
            email: employee.email,
            password: "",
            role_id: employee.role_id.toString(),
            department_id: employee.department_id ? employee.department_id.toString() : "",
            region: employee.region,
            hire_date: employee.hire_date,
          });
        } else {
          setFormData({
            first_name: "",
            last_name: "",
            email: "",
            password: "",
            role_id: roles.length > 0 ? roles[0].id.toString() : "",
            department_id: "",
            region: "Domestic",
            hire_date: new Date().toISOString().split("T")[0],
          });
        }
      }, 0);
    }
  }, [isOpen, employee, roles]);

  if (!isOpen) return null;

  const generatePassword = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
    let newPassword = "";
    for (let i = 0; i < 12; i++) {
      newPassword += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData((prev) => ({ ...prev, password: newPassword }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    startTransition(async () => {
      try {
        const payload = {
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email,
          role_id: parseInt(formData.role_id, 10),
          department_id: formData.department_id ? parseInt(formData.department_id, 10) : null,
          office_room_id: null,
          region: formData.region,
          hire_date: formData.hire_date,
          is_active: true,
        };

        if (isEditing) {
          await updateEmployee(employee.id, payload as EmployeeUpdate);
          toast.success("Employee updated", "Changes saved successfully.");
        } else {
          if (!formData.password) {
            toast.error("Validation Error", "Password is required for new employees.");
            return;
          }
          await createEmployee({ ...payload, password: formData.password } as EmployeeCreate);
          toast.success("Employee created", "New employee has been added.");
        }

        onSubmitSuccess();
        onClose();
      } catch (error: unknown) {
        if (error instanceof Error) {
          toast.error("Error", error.message);
        } else {
          toast.error("Error", "An unexpected error occurred.");
        }
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-lg rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
          <h3 className="text-lg font-semibold text-neutral-900 tracking-tight">
            {isEditing ? "Edit Employee" : "Add New Employee"}
          </h3>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-neutral-700">First Name</label>
              <input
                required
                type="text"
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                className="w-full px-3 py-2 border border-neutral-200 rounded-md focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-neutral-700">Last Name</label>
              <input
                required
                type="text"
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                className="w-full px-3 py-2 border border-neutral-200 rounded-md focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black text-sm"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-neutral-700">Email Address</label>
            <input
              required
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border border-neutral-200 rounded-md focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black text-sm"
            />
          </div>

          {!isEditing && (
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-neutral-700">Password</label>
              <div className="flex gap-2">
                <input
                  required
                  type="text"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3 py-2 border border-neutral-200 rounded-md focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black text-sm"
                  placeholder="Create a secure password"
                />
                <button
                  type="button"
                  onClick={generatePassword}
                  className="px-3 py-2 border border-neutral-200 rounded-md bg-neutral-50 hover:bg-neutral-100 transition-colors flex items-center justify-center text-neutral-600"
                  title="Generate Password"
                >
                  <Key className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-neutral-700">Role</label>
              <select
                required
                value={formData.role_id}
                onChange={(e) => setFormData({ ...formData, role_id: e.target.value })}
                className="w-full px-3 py-2 border border-neutral-200 rounded-md focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black text-sm bg-white"
              >
                {roles.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.title}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-neutral-700">Department</label>
              <select
                value={formData.department_id}
                onChange={(e) => setFormData({ ...formData, department_id: e.target.value })}
                className="w-full px-3 py-2 border border-neutral-200 rounded-md focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black text-sm bg-white"
              >
                <option value="">No Department</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-neutral-700">Region</label>
              <select
                required
                value={formData.region}
                onChange={(e) => setFormData({ ...formData, region: e.target.value as RegionType })}
                className="w-full px-3 py-2 border border-neutral-200 rounded-md focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black text-sm bg-white"
              >
                <option value="Domestic">Domestic</option>
                <option value="EU">EU</option>
                <option value="Non-EU">Non-EU</option>
                <option value="USA">USA</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-neutral-700">Hire Date</label>
              <input
                required
                type="date"
                value={formData.hire_date}
                onChange={(e) => setFormData({ ...formData, hire_date: e.target.value })}
                className="w-full px-3 py-2 border border-neutral-200 rounded-md focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black text-sm"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-neutral-100 mt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-4 py-2 text-sm font-medium text-white bg-black hover:bg-neutral-900 active:bg-black rounded-md transition-colors disabled:opacity-50"
            >
              {isPending ? "Saving..." : "Save Employee"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
