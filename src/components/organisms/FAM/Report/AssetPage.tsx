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

function AssetPage({ assetReportData, dateRange, setDateRange, loading }: any) {
  const columnData: ColDef<any>[] = useMemo(
    () => [
      {
        field: "companyName",
        headerName: "Company Name",
      },
      {
        field: "unitName",
        headerName: "Unit Name",
      },
      {
        field: "assetCode",
        headerName: "Asset Code",
      },
      {
        field: "assetName",
        headerName: "Asset Name",
      },
      {
        field: "groupName",
        headerName: "Group Name",
      },
      {
        field: "categoryName",
        headerName: "Category Name",
      },
      {
        field: "subCategoryName",
        headerName: "Sub Category Name",
      },
      {
        field: "department",
        headerName: "Department",
      },
      {
        field: "location",
        headerName: "Location",
      },
      {
        field: "subLocation",
        headerName: "Sub Location",
      },
      {
        field: "custodianName",
        headerName: "Custodian",
      },
      {
        field: "userName",
        headerName: "User",
      },
      {
        field: "parentAssetName",
        headerName: "Parent Asset Name",
      },
      {
        field: "depreciationGroup",
        headerName: "Depreciation Group",
      },
      {
        field: "grnNumber",
        headerName: "GRN Number",
      },
      {
        field: "grnValue",
        headerName: "GRN Value",
      },
      {
        field: "purchaseValue",
        headerName: "Purchase Value",
      },
      {
        field: "billNumber",
        headerName: "Bill Number",
      },
      {
        field: "billDate",
        headerName: "Bill Date",
        valueGetter: (params) =>
          params.data.billDate
            ? new Date(params.data.billDate).toLocaleDateString("en-GB")
            : "-",
      },
      {
        field: "capitalizationDate",
        headerName: "Capitalization Date",
        valueGetter: (params) =>
          params.data.capitalizationDate
            ? new Date(params.data.capitalizationDate).toLocaleDateString("en-GB")
            : "-",
      },
      {
        field: "itemCode",
        headerName: "Item Code",
      },
      {
        field: "itemName",
        headerName: "Item Name",
      },
      {
        field: "poNumber",
        headerName: "PO Number",
      },
      {
        field: "vendorName",
        headerName: "Vendor Number",
      },
      {
        field: "uom",
        headerName: "UOM",
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
              format="DD-MM-YYYY"
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
                    readOnly: true, 
                  },
                },
              }}
              minDate={dateRange.endDate || dayjs(new Date())}
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
          <AgGridCommon
            rowData={assetReportData}
            columnData={columnData}
            loading={loading}
          />
        </div>
      </Paper>
    </ThemeProvider>
  );
}

export default AssetPage;
