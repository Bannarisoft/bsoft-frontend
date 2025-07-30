"use client";

import {
  Box,
  createTheme,
  CssBaseline,
  Paper,
  ThemeProvider,
  Typography,
} from "@mui/material";
import React, { useMemo } from "react";
import { ColDef } from "ag-grid-community";
import AgGridCommon from "./AgGridCommon";
import dayjs from "dayjs";
import { MuiInputField } from "bsoft-base-elements";
import { StyledAutocomplete } from "../../../../utils/lib";

const theme = createTheme({
  palette: {
    primary: { main: "#188a71" },
    secondary: { main: "#2ac0a1" },
    background: { default: "#f5f5f5" },
  },
});

function AuditReport({
  auditData,
  selectedAudit,
  setSelectedAudit,
  assetReportData,
}: any) {
  const columnData: ColDef<any>[] = useMemo(
    () => [
      {
        field: "audit_UnitName",
        headerName: "Audit Unit",
        valueGetter: ({ data }) => data?.audit_UnitName || "-",
      },
      {
        field: "audit_AssetCode",
        headerName: "Audit Asset Code",
        valueGetter: ({ data }) => data?.audit_AssetCode || "-",
      },
      {
        field: "audit_AssetName",
        headerName: "Audit Asset Name",
        valueGetter: ({ data }) => data?.audit_AssetName || "-",
      },
      {
        field: "audit_Department",
        headerName: "Audit Department",
        valueGetter: ({ data }) => data?.audit_Department || "-",
      },
      {
        field: "auditorName",
        headerName: "Auditor Name",
        valueGetter: ({ data }) => data?.auditorName || "-",
      },
      {
        field: "auditDate",
        headerName: "Audit Date",
        valueFormatter: ({ value }) =>
          value ? dayjs(value).format("DD-MM-YYYY") : "-",
      },
      {
        field: "sourceFileName",
        headerName: "Source File",
        valueGetter: ({ data }) => data?.sourceFileName || "-",
      },
      {
        field: "scanType",
        headerName: "Scan Type",
        valueGetter: ({ data }) => data?.scanType || "-",
      },
      {
        field: "auditFinancialYear",
        headerName: "Financial Year",
        valueGetter: ({ data }) => data?.auditFinancialYear || "-",
      },
      {
        field: "comparisonStatus",
        headerName: "Comparison Status",
        valueGetter: ({ data }) => data?.comparisonStatus || "-",
      },
      {
        field: "unitChange",
        headerName: "Unit Change",
        valueGetter: ({ data }) => data?.unitChange || "-",
      },
      {
        field: "departmentChange",
        headerName: "Department Change",
        valueGetter: ({ data }) => data?.departmentChange || "-",
      },
      {
        field: "book_AssetCode",
        headerName: "Book Asset Code",
        valueGetter: ({ data }) => data?.book_AssetCode || "-",
      },
      {
        field: "book_AssetName",
        headerName: "Book Asset Name",
        valueGetter: ({ data }) => data?.book_AssetName || "-",
      },
      {
        field: "book_Department",
        headerName: "Book Department",
        valueGetter: ({ data }) => data?.book_Department || "-",
      },
      {
        field: "book_UnitName",
        headerName: "Book Unit",
        valueGetter: ({ data }) => data?.book_UnitName || "-",
      },
    ],
    []
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box>
        <StyledAutocomplete
          options={auditData || []}
          value={selectedAudit}
          onChange={(_, newValue: any) => {
            setSelectedAudit(newValue);
          }}
          fullWidth
          getOptionLabel={(option: any) =>
            `${option.description} - ${option.code}` || ""
          }
          isOptionEqualToValue={(option: any, value: any) =>
            option.id === value.id
          }
          renderInput={(params) => (
            <MuiInputField
              {...params}
              size="small"
              label="Audit Cycle"
              sx={{
                "& .MuiOutlinedInput-root": {
                  backgroundColor: "#f8f9fa",
                },
                width: 250,
              }}
            />
          )}
        />
      </Box>
      <Paper elevation={3}>
        <div className="ag-theme-quartz" style={{ height: 600, marginTop: 12 }}>
          <AgGridCommon rowData={assetReportData} columnData={columnData} />
        </div>
      </Paper>
    </ThemeProvider>
  );
}

export default AuditReport;
