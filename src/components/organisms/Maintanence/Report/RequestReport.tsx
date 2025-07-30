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
import Link from "next/link";
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

function RequestReport({
  requestReportData,
  departmentData,
  typeData,
  workorderStatus,
  requestStates,
  setRequestStates,
  refresh,
}: any) {
  const columnData: ColDef<any>[] = useMemo(
    () => [
      {
        field: "requestDate",
        headerName: "Request Date",
        valueFormatter: ({ value }: any) =>
          value && value !== "0001-01-01T00:00:00+00:00"
            ? new Date(value).toLocaleString("en-GB", { hour12: false })
            : "-",
      },
      { field: "requestCreatedName", headerName: "Requested By" },
      { field: "department", headerName: "Department" },
      { field: "machineName", headerName: "Machine Name" },
      {
        field: "status",
        headerName: "Status",
        valueFormatter: ({ value }: any) => value ?? "-",
      },
      {
        field: "requestMinutesDifference",
        headerName: "Request Minutes Difference",
        valueFormatter: ({ value }: any) => (value != null ? value : "-"),
      },
      {
        field: "downTime",
        headerName: "Down Time",
        valueFormatter: ({ value }: any) => (value != null ? value : "-"),
      },
      {
        field: "timeTakenToRepair",
        headerName: "Time Taken to Repair",
        valueFormatter: ({ value }: any) => (value != null ? value : "-"),
      },
      { field: "unitName", headerName: "Unit Name", hide: true },

      {
        field: "workOrderId",
        headerName: "Work Order Number",
        cellRenderer: (params: any) => {
          const id = params.value;
          if (!id) return "-";
          return (
            <Link
              href={{
                pathname: `/maintanence/work-order-detail/${id}`,
                query: {
                  requestId: params.data.requestId,
                  status: params.data.status,
                },
              }}
              style={{
                color: "#188a71",
                textDecoration: "underline",
                fontWeight: 500,
              }}
              target="_blank"
              rel="noopener noreferrer"
            >
              {id}
            </Link>
          );
        },
        hide: true,
      },
      { field: "createdBy", headerName: "Created By", hide: true },

      { field: "maintenanceType", headerName: "Maintenance Type", hide: true },

      {
        field: "oldVendorId",
        headerName: "Old Vendor ID",
        valueFormatter: ({ value }: any) => value ?? "-",
        hide: true,
      },
      {
        field: "oldVendorName",
        headerName: "Old Vendor Name",
        valueFormatter: ({ value }: any) => value ?? "-",
        hide: true,
      },
      {
        field: "expectedDispatchDate",
        headerName: "Expected Dispatch Date",
        valueFormatter: ({ value }: any) =>
          value && value !== "0001-01-01T00:00:00+00:00"
            ? new Date(value).toLocaleString("en-GB", { hour12: false })
            : "-",
        hide: true,
      },
      {
        field: "estimatedSpareCost",
        headerName: "Estimated Spare Cost",
        valueFormatter: ({ value }: any) => (value != null ? value : "-"),
        hide: true,
      },
      {
        field: "estimatedServiceCost",
        headerName: "Estimated Service Cost",
        valueFormatter: ({ value }: any) => (value != null ? value : "-"),
        hide: true,
      },
      {
        field: "serviceLocationId",
        headerName: "Service Location ID",
        valueFormatter: ({ value }: any) => value ?? "-",
        hide: true,
      },
      {
        field: "serviceLocation",
        headerName: "Service Location",
        valueFormatter: ({ value }: any) => value ?? "-",
        hide: true,
      },
      {
        field: "serviceTypeId",
        headerName: "Service Type ID",
        valueFormatter: ({ value }: any) => value ?? "-",
        hide: true,
      },
      {
        field: "serviceType",
        headerName: "Service Type",
        valueFormatter: ({ value }: any) => value ?? "-",
        hide: true,
      },
      {
        field: "sparesTypeId",
        headerName: "Spares Type ID",
        valueFormatter: ({ value }: any) => value ?? "-",
        hide: true,
      },
      {
        field: "sparesType",
        headerName: "Spares Type",
        valueFormatter: ({ value }: any) => value ?? "-",
        hide: true,
      },
      {
        field: "modeOfDispatchId",
        headerName: "Dispatch Mode ID",
        valueFormatter: ({ value }: any) => value ?? "-",
        hide: true,
      },
      {
        field: "modeOfDispatch",
        headerName: "Dispatch Mode",
        valueFormatter: ({ value }: any) => value ?? "-",
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
          gap={4}
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
                      readOnly: true,
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

          <Box width={{ xs: 200, sm: 200, md: 230 }}>
            <StyledAutocomplete
              options={(Array.isArray(typeData) && typeData) || []}
              fullWidth
              value={requestStates?.selectedType || null}
              onChange={(_: any, value: any) => {
                setRequestStates({ ...requestStates, selectedType: value });
              }}
              getOptionLabel={(option: any) => option.code || ""}
              isOptionEqualToValue={(option: any, value: any) =>
                option?.id === value?.id
              }
              size="small"
              renderInput={(params) => (
                <MuiInputField {...params} label="Request Type" />
              )}
            />
          </Box>
        </Box>
        <RefreshReport value="request" refresh={refresh} />
      </Box>
      <Paper elevation={3}>
        <div
          className="ag-theme-quartz"
          style={{
            height: 600,
            marginTop: 12,
          }}
        >
          <AgGridCommon rowData={requestReportData} columnData={columnData} />
        </div>
      </Paper>
    </ThemeProvider>
  );
}

export default RequestReport;
