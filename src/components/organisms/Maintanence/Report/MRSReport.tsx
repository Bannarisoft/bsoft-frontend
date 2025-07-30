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
import { DateFormatter } from "../../../../utils/lib";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import RefreshReport from "../../../molecules/AdminLayout/RefreshReport";

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

function MRSReport({
  requestStates,
  setRequestStates,
  workorderData,
  refresh,
}: any) {
  const columnData: ColDef[] = useMemo(
    () => [
      { field: "irNo", headerName: "IR No" },
      {
        field: "irDate",
        headerName: "IR Date",
        valueGetter: (params) =>
          params.data.irDate
            ? new Date(params.data.irDate).toLocaleDateString("en-GB")
            : "-",
      },
      { field: "woNo", headerName: "Work Order No" },
      { field: "remarks", headerName: "Remarks" },
      { field: "type", headerName: "Type" },
      { field: "depname", headerName: "Department" },
      { field: "subDept", headerName: "Sub Department" },
      { field: "irSno", headerName: "IR Serial No" },
      { field: "itemCode", headerName: "Item Code" },
      { field: "itemName", headerName: "Item Name" },
      { field: "machineCode", headerName: "Machine Code" },
      { field: "machineName", headerName: "Machine Name" },
      { field: "qty", headerName: "Quantity" },
      { field: "catdesc", headerName: "Category Description" },
      { field: "consumption", headerName: "Consumption" },
      { field: "rate", headerName: "Rate" },
      { field: "value", headerName: "Value" },
    ],
    []
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        display={"flex"}
        justifyContent={"space-between"}
        alignItems={"center"}
        flexWrap={"wrap"}
      >
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
                value={requestStates.startDate}
                format="DD-MM-YYYY"
                onChange={(newValue) =>
                  setRequestStates({ ...requestStates, startDate: newValue })
                }
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
                      value: requestStates.startDate
                        ? DateFormatter(requestStates.startDate)
                        : "",
                      readOnly: true, // Prevents user from typing manually, only allows picker
                    },
                  },
                }}
                maxDate={dayjs(new Date())}
              />
            </LocalizationProvider>
          </Box>
          <Box>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                value={requestStates.endDate}
                format="DD-MM-YYYY"
                onChange={(newValue) =>
                  setRequestStates({ ...requestStates, endDate: newValue })
                }
                slotProps={{
                  textField: {
                    fullWidth: true,
                    size: "small",
                    placeholder: "",
                    label: "To Date",
                    disabled: requestStates.startDate === null,
                    sx: {
                      bgcolor: "#fff",
                    },
                    inputProps: {
                      placeholder: "",
                      value: requestStates.endDate
                        ? DateFormatter(requestStates.endDate)
                        : "",
                      readOnly: true,
                    },
                  },
                }}
                maxDate={dayjs(new Date())}
              />
            </LocalizationProvider>
          </Box>
        </Box>
        <RefreshReport value="mrs" refresh={refresh} />
      </Box>
      <Paper elevation={3}>
        <div
          className="ag-theme-quartz"
          style={{
            height: 600,
            marginTop: 12,
          }}
        >
          <AgGridCommon rowData={workorderData} columnData={columnData} />
        </div>
      </Paper>
    </ThemeProvider>
  );
}

export default MRSReport;
