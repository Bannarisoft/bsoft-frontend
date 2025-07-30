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
  AllCommunityModule,
  ColumnMenuModule,
  ColumnsToolPanelModule,
  ContextMenuModule,
  FiltersToolPanelModule,
  PivotModule,
  RowGroupingPanelModule,
  RowGroupingModule,
]);

function AgGridCommon({ rowData, columnData }: any) {
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
      aggFunc: col.aggFunc || "sum",
      enablePivot: true,
      enableValue: true,
      enableRowGroup: true,
    }));
  return (
    <AgGridReact
      rowData={rowData}
      columnDefs={rawColumnData}
      defaultColDef={{
        flex: 1,
        sortable: true,
        filter: true,
        resizable: true,
        floatingFilter: true,
        enablePivot: true,
        enableValue: true,
        autoHeaderHeight: false,
        wrapHeaderText: false,
        enableRowGroup: true,
        rowGroup: false,
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
    />
  );
}

export default AgGridCommon;
