"use client";

import { useMemo } from "react";
import { AgGridReact, type AgGridReactProps } from "ag-grid-react";
import { ModuleRegistry, AllCommunityModule, themeQuartz } from "ag-grid-community";


ModuleRegistry.registerModules([AllCommunityModule]);


const geistTheme = themeQuartz.withParams({
  accentColor: "#000000",
  backgroundColor: "#ffffff",
  borderColor: "#e5e5e5",
  headerBackgroundColor: "#fafafa",
  headerTextColor: "#737373",
  rowHoverColor: "#fafafa",
  selectedRowBackgroundColor: "#f5f5f5",
  oddRowBackgroundColor: "#ffffff",
  fontFamily: "var(--font-sans), system-ui, sans-serif",
  fontSize: "13px",
  wrapperBorderRadius: "8px",
  headerHeight: 40,
  rowHeight: 48,
});


interface DataGridProps<TData = unknown> extends AgGridReactProps<TData> {
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
      className={`w-full overflow-hidden select-none ${className}`}
      style={{ height: typeof height === "number" ? `${height}px` : height }}
    >
      <AgGridReact
        theme={geistTheme} 
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