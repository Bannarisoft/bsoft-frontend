import React, { useState } from "react";
import { ColDef, GridApi, GridReadyEvent } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import {
  ColumnMenuModule,
  ColumnsToolPanelModule,
  ContextMenuModule,
  FiltersToolPanelModule,
  PivotModule,
  RowGroupingPanelModule,
  RowGroupingModule,
} from "ag-grid-enterprise";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import "ag-grid-community/styles/ag-theme-material.css";
import "ag-grid-community/styles/ag-theme-balham.css";
import "ag-grid-community/styles/ag-theme-quartz.css";

ModuleRegistry.registerModules([
  ColumnMenuModule,
  ColumnsToolPanelModule,
  ContextMenuModule,
  FiltersToolPanelModule,
  PivotModule,
  RowGroupingPanelModule,
  RowGroupingModule,
]);

function AgGridCommon({ rowData, columnData, loading }: any) {
  const [gridApi, setGridApi] = useState<GridApi | null>(null);
  const onGridReady = (params: GridReadyEvent) => {
    setGridApi(params.api);
    params.api.sizeColumnsToFit();
  };

  const calculateMinWidth = (headerName: string) =>
    Math.max(headerName.length * 15, 100);

  const rawColumnData =
    columnData &&
    columnData.map((col: any) => ({
      ...col,
      minWidth: calculateMinWidth(col.headerName || col.field || ""),
    }));

  return (
    <AgGridReact
      modules={[AllCommunityModule]}
      rowData={rowData}
      columnDefs={rawColumnData}
      defaultColDef={{
        flex: 1,
        sortable: true,
        filter: true,
        resizable: true,
        floatingFilter: true,
        enablePivot: true, // 🔑 allow pivoting via UI
        enableValue: true, // 🔑 allow aggregation via UI
        enableRowGroup: true, // 🔑 allow row grouping via UI
      }}
      theme={"legacy"}
      onGridReady={onGridReady}
      pagination={true}
      paginationPageSize={10}
      enableCellTextSelection={true}
      rowSelection="multiple"
      groupDisplayType="groupRows"
      groupDefaultExpanded={1}
      animateRows={true}
      rowGroupPanelShow="always"
      suppressAggFuncInHeader={true}
      loading={loading}
      sideBar={{
        toolPanels: [
          {
            id: "columns",
            labelDefault: "Pivot Mode",
            labelKey: "columns",
            iconKey: "columns",
            toolPanel: "agColumnsToolPanel",
            toolPanelParams: {
              suppressRowGroups: false,
              suppressValues: false,
              suppressPivots: false,
              suppressPivotMode: false,
            },
          },
        ],
      }}
      pivotMode={false}
    />
  );
}

export default AgGridCommon;
