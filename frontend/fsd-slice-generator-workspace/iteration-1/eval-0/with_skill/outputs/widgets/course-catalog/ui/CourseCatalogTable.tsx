"use client";

import React, { useMemo } from "react";
import { AgGridReact } from "ag-grid-react";
import { ColDef } from "ag-grid-community";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { Course } from "@/entities/course";
import { EnrollButton } from "@/features/enroll-course";

interface CourseCatalogTableProps {
  courses: Course[];
}

export const CourseCatalogTable: React.FC<CourseCatalogTableProps> = ({ courses }) => {
  const columnDefs = useMemo<ColDef<Course>[]>(() => [
    { field: "code", headerName: "Code", sortable: true, filter: true },
    { field: "title", headerName: "Title", sortable: true, filter: true, flex: 1 },
    { field: "credits", headerName: "Credits", sortable: true, filter: true, width: 100 },
    {
      headerName: "Action",
      cellRenderer: (params: any) => {
        if (!params.data) return null;
        return <EnrollButton courseId={params.data.id} />;
      },
      sortable: false,
      filter: false,
      width: 120,
    },
  ], []);

  return (
    <div className="ag-theme-alpine w-full" style={{ height: 400 }}>
      <AgGridReact
        rowData={courses}
        columnDefs={columnDefs}
        animateRows={true}
        rowSelection="single"
      />
    </div>
  );
};
