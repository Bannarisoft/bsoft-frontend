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
import { StyledAutocomplete } from "../../../../utils/lib";
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

function StockReportPage({
  stockMasterData,
  departmentData,
  selectedDepartment,
  setSelectedDepartment,
  refresh,
}: {
  stockMasterData: any;
  departmentData: any;
  selectedDepartment: any;
  setSelectedDepartment: any;
  refresh: (val: string) => void;
}) {
  const columnData: ColDef<any>[] = useMemo(
    () => [
      {
        field: "departmentName",
      },
      {
        field: "itemCode",
      },
      {
        field: "itemName",
      },
      {
        field: "stockQty",
      },
      {
        field: "uom",
      },
      {
        field: "rate",
      },
      {
        field: "stockValue",
      },
    ],
    []
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      <Box
        component={"div"}
        display={"flex"}
        justifyContent={"space-between"}
        alignItems={"center"}
      >
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

        <RefreshReport value="stock" refresh={refresh} />
      </Box>
      <Paper elevation={3}>
        <div
          className="ag-theme-quartz"
          style={{
            height: 600,
            marginTop: 12,
          }}
        >
          <AgGridCommon rowData={stockMasterData} columnData={columnData} />
        </div>
      </Paper>
    </ThemeProvider>
  );
}

export default StockReportPage;
