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
import { DateFormatter, StyledAutocomplete } from "../../../../utils/lib";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { MuiInputField } from "bsoft-base-elements";
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

function ItemConsumptionReport({
  typeData,
  requestStates,
  setRequestStates,
  workorderData,
  refresh,
}: any) {
  const columnData: ColDef[] = useMemo(
    () => [
      {
        field: "description",
        headerName: "Description",
      },
      {
        field: "machineName",
        headerName: "Machine Name",
      },
      {
        field: "machineCode",
        headerName: "Machine Code",
      },
      {
        field: "issuedate",
        headerName: "Issue Date",
        valueGetter: (params) =>
          params.data.issuedate
            ? new Date(params.data.issuedate).toLocaleDateString()
            : "-",
      },
      {
        field: "itemName",
        headerName: "Item Name",
      },
      {
        field: "issueQty",
        headerName: "Issue Quantity",
      },
      {
        field: "issueValue",
        headerName: "Issue Value",
      },
      {
        field: "reqId",
        headerName: "Request ID",
        hide: true,
      },
      {
        field: "reqDate",
        headerName: "Request Date",
        valueGetter: (params) =>
          params.data.reqDate
            ? new Date(params.data.reqDate).toLocaleDateString()
            : "-",
        hide: true,
      },
      {
        field: "workOrderId",
        headerName: "Work Order ID",
        hide: true,
      },
      {
        field: "workOrderDate",
        headerName: "Work Order Date",
        valueGetter: (params) =>
          params.data.workOrderDate
            ? new Date(params.data.workOrderDate).toLocaleDateString()
            : "-",
        hide: true,
      },
      {
        field: "workOrderDocNo",
        headerName: "Work Order No",
        hide: true,
      },

      {
        field: "issueNo",
        headerName: "Issue No",
        hide: true,
      },

      {
        field: "itemCode",
        headerName: "Item Code",
        hide: true,
      },

      {
        field: "rate",
        headerName: "Rate",
        hide: true,
      },
      {
        field: "unitId",
        headerName: "Unit ID",
        hide: true,
      },
      {
        field: "unitName",
        headerName: "Unit Name",
        hide: true,
      },
      {
        field: "oldUnitCode",
        headerName: "Old Unit Code",
        hide: true,
      },
      {
        field: "lastChangedDate",
        headerName: "Last Changed Date",
        valueGetter: (params) =>
          params.data.lastChangedDate
            ? new Date(params.data.lastChangedDate).toLocaleString()
            : "-",
        hide: true,
      },
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
                onChange={(newValue) =>
                  setRequestStates({ ...requestStates, endDate: newValue })
                }
                format="DD-MM-YYYY"
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
                  },
                }}
              />
            </LocalizationProvider>
          </Box>
        </Box>
        <RefreshReport value="itemConsumption" refresh={refresh} />
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

export default ItemConsumptionReport;
