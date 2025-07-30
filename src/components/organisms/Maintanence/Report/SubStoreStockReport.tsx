"use client";

import {
  Box,
  createTheme,
  CssBaseline,
  Paper,
  TextField,
  ThemeProvider,
} from "@mui/material";
import React, { useMemo } from "react";
import { ColDef } from "ag-grid-community";
import AgGridCommon from "./AgGridCommon";
import { DateFormatter, StyledAutocomplete } from "../../../../utils/lib";
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

function SubStoreStockReport({
  requestStates,
  setRequestStates,
  workorderData,
  departmentData,
  selectedDepartment,
  setSelectedDepartment,
  refresh,
}: any) {
  const columnData: ColDef[] = useMemo(
    () => [
      {
        field: "itemCode",
        headerName: "Item Code",
      },
      {
        field: "itemName",
        headerName: "Item Name",
      },
      { field: "uom", headerName: "UOM" },

      { field: "openingQty", headerName: "Opening Qty", type: "numericColumn" },
      {
        field: "openingValue",
        headerName: "Opening Value",
        type: "numericColumn",
      },

      { field: "receiptQty", headerName: "Receipt Qty", type: "numericColumn" },
      {
        field: "receiptValue",
        headerName: "Receipt Value",
        type: "numericColumn",
      },

      { field: "issueQty", headerName: "Issue Qty", type: "numericColumn" },
      { field: "issueValue", headerName: "Issue Value", type: "numericColumn" },

      { field: "returnQty", headerName: "Return Qty", type: "numericColumn" },
      {
        field: "returnValue",
        headerName: "Return Value",
        type: "numericColumn",
      },

      {
        field: "scrapReceiptQty",
        headerName: "Scrap Receipt Qty",
        type: "numericColumn",
      },
      {
        field: "scrapReceiptValue",
        headerName: "Scrap Receipt Value",
        type: "numericColumn",
      },

      {
        field: "scrapIssueQty",
        headerName: "Scrap Issue Qty",
        type: "numericColumn",
      },
      {
        field: "scrapIssueValue",
        headerName: "Scrap Issue Value",
        type: "numericColumn",
      },

      { field: "closingQty", headerName: "Closing Qty", type: "numericColumn" },
      {
        field: "closingValue",
        headerName: "Closing Value",
        type: "numericColumn",
      },
      {
        field: "reusableReceiptQty",
        headerName: "Reusable Receipt Qty",
        type: "numericColumn",
      },
      {
        field: "reusableReceiptValue",
        headerName: "Reusable Receipt Value",
        type: "numericColumn",
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
          <StyledAutocomplete
            options={departmentData || []}
            sx={{ width: 300, background: "#fff", borderRadius: "12px" }}
            value={selectedDepartment}
            onChange={(event, value) => {
              setSelectedDepartment(value);
            }}
            getOptionLabel={(option: any) => option.deptName || ""}
            renderInput={(params) => (
              <TextField
                {...params}
                variant="outlined"
                size="small"
                fullWidth
                placeholder="Select Department"
              />
            )}
          />
        </Box>
        <RefreshReport value="subStoreStock" refresh={refresh} />
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

export default SubStoreStockReport;
