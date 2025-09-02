"use client";

import {
  Box,
  createTheme,
  CssBaseline,
  Paper,
  ThemeProvider,
} from "@mui/material";
import React, { useMemo, useState } from "react";
import { ColDef } from "ag-grid-community";
import AgGridCommon from "./AgGridCommon";
import { DateFormatter, StyledAutocomplete } from "../../../../utils/lib";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { MuiInputField, MuiText } from "bsoft-base-elements";
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

function WorkOrderReport({
  typeData,
  requestStates,
  setRequestStates,
  workorderData,
  refresh,
}: any) {
  const columnData: ColDef[] = useMemo(
    () => [
      {
        field: "productionDepartment",
        headerName: "Production Department",
      },
      {
        field: "machine",
        headerName: "Machine Code",
      },
      {
        field: "createdUser",
        headerName: "Requested By",
        hide: true,
      },
      {
        field: "department",
        headerName: "Department",
        hide: true,
      },
      {
        field: "machineName",
        headerName: "Machine",
      },
      {
        field: "activityName",
        headerName: "Activity Name",
      },
      {
        field: "woDate",
        headerName: "Open Date",
        valueGetter: (params) =>
          params.data.woDate
            ? dayjs(params.data.woDate).format("DD-MM-YYYY hh:mm a")
            : "-",
      },
      {
        field: "closedDate",
        headerName: "Closed Date",
        valueGetter: (params) =>
          params.data.closedDate
            ? dayjs(params.data.closedDate).format("DD-MM-YYYY hh:mm a")
            : "-",
      },
      {
        field: "closedUser",
        headerName: "Submitted By",
      },
      {
        field: "status",
        headerName: "Status",
        sortable: true,
        filter: true,
      },
      {
        field: "totalDownTime",
        headerName: "Total Downtime",
      },
      {
        field: "maintenanceStartTime",
        headerName: "Maintenance Start Time",
        valueGetter: (params) =>
          params.data.maintenanceStartTime
            ? dayjs(params.data.maintenanceStartTime).format(
                "DD-MM-YYYY hh:mm a"
              )
            : "-",
      },
      {
        field: "maintenanceEndTime",
        headerName: "Maintenance End Time",
        valueGetter: (params) =>
          params.data.maintenanceEndTime
            ? dayjs(params.data.maintenanceEndTime).format("DD-MM-YYYY hh:mm a")
            : "-",
      },
      {
        field: "totalMaintenanceTime",
        headerName: "Total Maintenance Time",
      },
      {
        field: "maintenanceType",
        headerName: "Maintenance Type",
        hide: true,
      },

      {
        field: "workOrderDocNo",
        headerName: "Work Order No",
        hide: true,
      },

      {
        field: "downtimeStart",
        headerName: "Downtime Start",
        valueGetter: (params) =>
          params.data.downtimeStart
            ? dayjs(params.data.downtimeStart).format("DD-MM-YYYY hh:mm a")
            : "-",
        hide: true,
      },
      {
        field: "downtimeEnd",
        headerName: "Downtime End",
        valueGetter: (params) =>
          params.data.downtimeEnd
            ? dayjs(params.data.downtimeEnd).format("DD-MM-YYYY hh:mm a")
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
                onChange={(newValue) =>
                  setRequestStates({ ...requestStates, startDate: newValue })
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
        <RefreshReport value="workOrder" refresh={refresh} />
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

export default WorkOrderReport;
