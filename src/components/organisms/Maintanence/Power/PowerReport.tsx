"use client";

import {
  Box,
  createTheme,
  CssBaseline,
  DialogTitle,
  IconButton,
  Paper,
  ThemeProvider,
  Tooltip,
} from "@mui/material";
import React, { useMemo, useState } from "react";
import { ColDef } from "ag-grid-community";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import AgGridCommon from "../Report/AgGridCommon";
import { useDataFetchHook } from "../../../../hooks/useDataFetchHook";
import MainConfig from "../../../../utils/main.api.json";
import { MdOutlineRestartAlt } from "react-icons/md";

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

function PowerReport() {
  const [dateRange, setDateRange] = useState({
    startDate: dayjs(new Date()).subtract(1, "month"),
    endDate: dayjs(new Date()),
  });

  const { data: powerData } = useDataFetchHook(
    MainConfig.Report.PowerReport.endpoint
      .replace("{from}", dayjs(dateRange.startDate).format("YYYY-MM-DD"))
      .replace("{to}", dayjs(dateRange.endDate).format("YYYY-MM-DD")),
    MainConfig.Report.PowerReport.method,
    "main"
  );

  const columnData: ColDef[] = useMemo(
    () => [
      {
        field: "feederGroupCode",
        headerName: "Feeder Group Code",
      },
      {
        field: "feederGroupName",
        headerName: "Feeder Group Name",
      },
      {
        field: "feederType",
        headerName: "Feeder Type",
      },
      {
        field: "feederCode",
        headerName: "Feeder Code",
      },
      {
        field: "feederName",
        headerName: "Feeder Name",
      },
      {
        field: "description",
        headerName: "Description",
      },

      {
        field: "departmentName",
        headerName: "Department Name",
      },
      {
        field: "multiplicationFactor",
        headerName: "Multiplication Factor",

        type: "numericColumn",
      },
      {
        field: "effectiveDate",
        headerName: "Effective Date",
        filter: "agDateColumnFilter",
        valueFormatter: (params) =>
          params.value ? new Date(params.value).toLocaleDateString() : "",
      },
      {
        field: "openingReading",
        headerName: "Opening Reading",

        type: "numericColumn",
      },
      {
        field: "closingReading",
        headerName: "Closing Reading",

        type: "numericColumn",
      },
      {
        field: "totalUnits",
        headerName: "Total Units",

        type: "numericColumn",
      },
      {
        field: "createdByName",
        headerName: "Created By",
      },
      {
        field: "createdDate",
        headerName: "Created Date",
        filter: "agDateColumnFilter",
        valueFormatter: (params) =>
          params.value ? new Date(params.value).toLocaleString() : "",
      },
    ],
    []
  );

  const refreshTab = () => {
    setDateRange({
      startDate: dayjs(new Date()).subtract(1, "month"),
      endDate: dayjs(new Date()),
    });
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      <Box p={2} bgcolor={"#fff"}>
        <DialogTitle
          className="highlighted-header"
          sx={{ pl: 0, pt: 0, mb: 2 }}
        >
          Power Consumption Report
        </DialogTitle>
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
                  value={dateRange.startDate}
                  onChange={(newValue) =>
                    setDateRange({
                      ...dateRange,
                      startDate: newValue || dayjs(new Date()),
                    })
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
                      },
                    },
                  }}
                  format="DD-MM-YYYY"
                  maxDate={dayjs(new Date())}
                />
              </LocalizationProvider>
            </Box>
            <Box>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  value={dateRange.endDate}
                  onChange={(newValue) =>
                    setDateRange({
                      ...dateRange,
                      endDate: newValue || dayjs(new Date()),
                    })
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
                      },
                    },
                  }}
                  format="DD-MM-YYYY"
                />
              </LocalizationProvider>
            </Box>
          </Box>
          <Tooltip title="Refresh Report">
            <IconButton
              onClick={refreshTab}
              sx={{ background: "#3a8484 !important", p: "4px" }}
            >
              <MdOutlineRestartAlt color="#fff" size={20} />
            </IconButton>
          </Tooltip>
        </Box>

        <Paper elevation={3}>
          <div
            className="ag-theme-quartz"
            style={{
              height: 600,
              marginTop: 12,
            }}
          >
            <AgGridCommon rowData={powerData} columnData={columnData} />
          </div>
        </Paper>
      </Box>
    </ThemeProvider>
  );
}

export default PowerReport;
