'use client';

import React, { useMemo } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ColDef } from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

export interface Course {
  id: string | number;
  title: string;
  code: string;
  credits: number;
}

interface CourseCatalogGridProps {
  courses: Course[];
}

export function CourseCatalogGrid({ courses }: CourseCatalogGridProps) {
  const columnDefs = useMemo<ColDef[]>(
    () => [
      { field: 'title', headerName: 'Title', flex: 2, minWidth: 200 },
      { field: 'code', headerName: 'Course Code', flex: 1, minWidth: 120 },
      { field: 'credits', headerName: 'Credits', flex: 1, minWidth: 100 },
      {
        headerName: 'Action',
        flex: 1,
        minWidth: 120,
        sortable: false,
        filter: false,
        cellRenderer: () => (
          <button 
            onClick={() => alert('Enrollment requested!')}
            className="px-4 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Enroll
          </button>
        ),
      },
    ],
    []
  );

  const defaultColDef = useMemo<ColDef>(() => ({
    sortable: true,
    filter: true,
    resizable: true,
  }), []);

  return (
    <div className="ag-theme-alpine w-full h-[500px]">
      <AgGridReact 
        rowData={courses} 
        columnDefs={columnDefs}
        defaultColDef={defaultColDef}
        domLayout="normal"
      />
    </div>
  );
}
