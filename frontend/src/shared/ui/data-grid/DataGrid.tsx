"use client";

import React, { useMemo } from "react";
import { AgGridReact } from "ag-grid-react";
import type { AgGridReactProps } from "ag-grid-react";
import { ModuleRegistry } from "ag-grid-community";
import { AllCommunityModule } from "ag-grid-community";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";

// Register all community features globally for AG Grid v35+
ModuleRegistry.registerModules([AllCommunityModule]);

interface DataGridProps<TData = any> extends AgGridReactProps<TData> {
  className?: string;
  height?: string | number;
}

export const DataGrid = <TData,>({
  rowData,
  columnDefs,
  className = "",
  height = 500,
  ...props
}: DataGridProps<TData>) => {
  const defaultColDef = useMemo(() => ({
    sortable: true,
    filter: true,
    resizable: true,
    flex: 1,
    minWidth: 100,
    ...props.defaultColDef,
  }), [props.defaultColDef]);

  return (
    <div
      className={`ag-theme-quartz w-full border border-neutral-200 rounded-lg overflow-hidden bg-white select-none ${className}`}
      style={{
        height: typeof height === "number" ? `${height}px` : height,
        // Custom Geist CSS variable overrides for ag-theme-quartz
        "--ag-border-color": "#e5e5e5",
        "--ag-header-background-color": "#fafafa",
        "--ag-header-foreground-color": "#737373",
        "--ag-header-cell-hover-background-color": "#f5f5f5",
        "--ag-row-hover-color": "#fafafa",
        "--ag-selected-row-background-color": "#f5f5f5",
        "--ag-odd-row-background-color": "#ffffff",
        "--ag-font-family": "var(--font-sans), system-ui, sans-serif",
        "--ag-font-size": "13px",
        "--ag-row-border-color": "#e5e5e5",
        "--ag-grid-size": "8px",
        "--ag-list-item-height": "32px",
        "--ag-row-height": "48px",
        "--ag-header-height": "40px",
      } as React.CSSProperties}
    >
      <AgGridReact
        theme="legacy"
        rowData={rowData}
        columnDefs={columnDefs}
        defaultColDef={defaultColDef}
        suppressCellFocus={true}
        animateRows={true}
        pagination={true}
        paginationPageSize={10}
        paginationPageSizeSelector={[10, 20, 50]}
        {...props}
      />
    </div>
  );
};
