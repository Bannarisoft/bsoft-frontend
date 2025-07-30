"use client";

import {
  Box,
  createTheme,
  CssBaseline,
  Paper,
  ThemeProvider,
} from "@mui/material";
import React, { useMemo } from "react";
import { ColDef } from "ag-grid-community";
import AgGridCommon from "./AgGridCommon";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { DateFormatter } from "../../../../utils/lib";

const theme = createTheme({
  palette: {
    primary: {
      main: "#188a71",
    },
    secondary: {
      main: "#2ac0a1",
    },
    background: {
      default: "#f5f5f5",
    },
  },
});

function TransferPage({ assetReportData, dateRange, setDateRange }: any) {
  const columnData: ColDef[] = useMemo(
    () => [
      {
        field: "transferId",
        headerName: "Transfer ID",
      },

      {
        field: "docDate",
        headerName: "Document Date",
        valueFormatter: (p) =>
          p.value ? new Date(p.value).toLocaleDateString("en-Gb") : "-",
      },
      {
        field: "transferTypeDesc",
        headerName: "Transfer Type",
      },
      {
        field: "assetCode",
        headerName: "Asset Code",
      },
      {
        field: "assetName",
        headerName: "Asset Name",
      },
      { field: "status", headerName: "Status" },
      {
        field: "fromUnitName",
        headerName: "From Unit",
      },
      {
        field: "toUnitName",
        headerName: "To Unit",
      },
      {
        field: "fromDepartmentName",
        headerName: "From Department",
      },
      {
        field: "toDepartmentName",
        headerName: "To Department",
      },
      {
        field: "fromCustodianName",
        headerName: "From Custodian",
      },
      {
        field: "toCustodianName",
        headerName: "To Custodian",
      },
    ],
    []
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      <Box
        display={"flex"}
        justifyContent={"start"}
        alignItems={"center"}
        gap={3}
        flexWrap={"wrap"}
        sx={{
          "& .MuiFormHelperText-root": {
            background: "#f4f4f4",
            m: 0,
            pt: "4px",
          },
        }}
      >
        <Box>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              value={dateRange.startDate}
              onChange={(newValue) =>
                setDateRange({ ...dateRange, startDate: newValue })
              }
              format="DD-MM-YYYY"
              slotProps={{
                textField: {
                  fullWidth: true,
                  size: "small",
                  placeholder: "",
                  label: "From Date",
                  sx: {
                    bgcolor: "#fff",
                  },
                  inputProps: {
                    placeholder: "",
                    value: dateRange.startDate
                      ? DateFormatter(dateRange.startDate)
                      : "",
                    readOnly: true,
                  },
                },
              }}
              maxDate={dateRange.endDate || dayjs(new Date())}
            />
          </LocalizationProvider>
        </Box>
        <Box>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              value={dateRange.endDate}
              onChange={(newValue) =>
                setDateRange({ ...dateRange, endDate: newValue })
              }
              format="DD-MM-YYYY"
              slotProps={{
                textField: {
                  fullWidth: true,
                  size: "small",
                  placeholder: "",
                  label: "To Date",
                  disabled: dateRange.startDate === null,
                  sx: {
                    bgcolor: "#fff",
                  },
                  inputProps: {
                    placeholder: "",
                    value: dateRange.endDate
                      ? DateFormatter(dateRange.endDate)
                      : "",
                  },
                },
              }}
            />
          </LocalizationProvider>
        </Box>
      </Box>

      <Paper elevation={3}>
        <div
          className="ag-theme-quartz"
          style={{
            height: 600,
            marginTop: 12,
          }}
        >
          <AgGridCommon rowData={assetReportData} columnData={columnData} />
        </div>
      </Paper>
    </ThemeProvider>
  );
}

export default TransferPage;
