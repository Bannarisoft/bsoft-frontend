"use client";

import { Box, Grid2 } from "@mui/material";
import React, { useEffect } from "react";
import IconBreadcrumbs from "../../../molecules/AdminLayout/BreadCrumbs";
import { Apirequest, DateFormatter } from "../../../../utils/lib";
import FamConfig from "../../../../utils/fam.api.json";
import { MuiButton, MuiInputField, MuiTable } from "bsoft-base-elements";
import NoDataFound from "../../../molecules/AdminLayout/NoDataFound";
import SkeletonLoader from "../../../molecules/AdminLayout/SkeletonLoader";
import dayjs from "dayjs";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { GridColDef } from "@mui/x-data-grid";
import { useRouter } from "next/navigation";

interface AssetTransfer {
  assetTransferId: number;
  docDate: string;
  assetCode: string;
  assetName: string;
  transferType: string;
  fromUnitId: number;
  fromUnitname: string;
  toUnitId: number;
  toUnitname: string;
  fromDepartmentId: number;
  fromDepartment: string;
  toDepartmentId: number;
  toDepartment: string;
  fromCustodianId: number;
  fromCustodianName: string;
  toCustodianId: number;
  toCustodianName: string;
  status: string;
}

interface FilterState {
  startDate: dayjs.Dayjs | null;
  endDate: dayjs.Dayjs | null;
  searchText: string;
}

function AssetAcceptanceListPage() {
  const [page, setPage] = React.useState<number>(1);
  const [size, setSize] = React.useState<number>(15);
  const [loading, setLoading] = React.useState(true);
  const [count, setCount] = React.useState<number>(0);
  const [acceptanceData, setAcceptanceData] = React.useState<any[]>([]);
  const router = useRouter();
  const [filterValues, setFilterValues] = React.useState<FilterState>({
    startDate: null,
    endDate: null,
    searchText: "",
  });

  const handleFilterApply = () => {
    GetTransferList();
  };

  const columns: GridColDef[] = [
    {
      field: "s_no",
      headerName: "S.No",
      minWidth: 80,
      flex: 0,
      width: 80,
      sortable: true,
      renderCell: (params: any) => {
        return (
          (page - 1) * size + (params.api.getAllRowIds().indexOf(params.id) + 1)
        );
      },
    },
    {
      field: "assetTransferId",
      headerName: "Transfer Id",
      minWidth: 180,
      flex: 0,
      width: 180,
      valueGetter: (value: any, row: any) => `${row?.assetTransferId || ""}`,
    },
    {
      field: "docDate",
      headerName: "Transfer Date",
      minWidth: 180,
      flex: 0,
      width: 180,
      valueGetter: (value: any, row: any) =>
        `${dayjs(row?.docDate).format("DD-MM-YYYY") || ""}`,
    },
    {
      field: "fromUnitName",
      headerName: "From Unit",
      flex: 2,
      minWidth: 200,
      valueGetter: (value: any, row: any) => `${row?.fromUnitname || ""}`,
    },
    {
      field: "fromDepartmentName",
      headerName: "From Department",
      flex: 2,
      minWidth: 200,
      valueGetter: (value: any, row: any) => `${row?.fromDepartment || ""}`,
    },
    {
      field: "fromCustodianName",
      headerName: "From Custodian",
      flex: 2,
      minWidth: 200,
      valueGetter: (value: any, row: any) => `${row?.fromCustodianName || ""}`,
    },
    {
      field: "Status",
      headerName: "Status",
      flex: 2,
      minWidth: 200,
      valueGetter: (value: any, row: any) => `${row?.status}`,
    },
  ].map((column) => {
    if (column.field === "asset_name") {
      return { ...column, pinned: "left" };
    }
    return column;
  });

  const GetTransferList = async () => {
    try {
      setLoading(true);
      const { endpoint, method } = FamConfig.AssetAcceptance;
      const startDate = filterValues.startDate?.format("YYYY-MM-DD") || "";
      const endDate = filterValues.endDate?.format("YYYY-MM-DD") || "";
      const result = await Apirequest(
        endpoint
          .replace("{page}", page.toString())
          .replace("{size}", size.toString())
          .replace("{transferId}", filterValues.searchText)
          .replace("{from}", startDate)
          .replace("{to}", endDate),
        method,
        null,
        "fam"
      ).then((res) => res.data);

      setAcceptanceData(result.data);
      setCount(result.totalCount);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    GetTransferList();
  }, []);

  const handleRowClick = (params: any) => {
    router.push(`/fam/acceptance/${params.row.assetTransferId}`);
  };

  return (
    <Box component={"main"} p={2}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        px={3}
        py={1}
        bgcolor="#fff"
        borderRadius={1}
        borderBottom="1px solid #eee"
      >
        <IconBreadcrumbs
          parent={"Transfer"}
          child={"Transfer  Acceptance"}
          path=""
        />
        <Box>
          <Grid2 container spacing={2}>
            <Grid2 size={3}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label="From Date"
                  value={filterValues.startDate}
                  onChange={(newValue) =>
                    setFilterValues((prev) => ({
                      ...prev,
                      startDate: newValue,
                    }))
                  }
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      size: "small",
                      inputProps: {
                        placeholder: "",
                        value: filterValues.startDate
                          ? DateFormatter(filterValues.startDate)
                          : "",
                        readOnly: true,
                      },
                      sx: {
                        "& .MuiOutlinedInput-root": {
                          borderRadius: "8px",
                        },
                      },
                    },
                  }}
                />
              </LocalizationProvider>
            </Grid2>
            <Grid2 size={3}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label="To Date"
                  value={filterValues.endDate}
                  onChange={(newValue) =>
                    setFilterValues((prev) => ({ ...prev, endDate: newValue }))
                  }
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      size: "small",
                      inputProps: {
                        placeholder: "",
                        value: filterValues.endDate
                          ? DateFormatter(filterValues.endDate)
                          : "",
                        readOnly: true,
                      },
                      sx: {
                        "& .MuiOutlinedInput-root": {
                          borderRadius: "8px",
                        },
                      },
                    },
                  }}
                />
              </LocalizationProvider>
            </Grid2>
            <Grid2 size={4}>
              <MuiInputField
                fullWidth
                size="small"
                label="Transfer Id"
                value={filterValues.searchText}
                onChange={(e) =>
                  setFilterValues((prev) => ({
                    ...prev,
                    searchText: e.target.value,
                  }))
                }
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "8px",
                  },
                }}
              />
            </Grid2>
            <Grid2 size={2}>
              <MuiButton
                onClick={handleFilterApply}
                fullWidth
                sx={{
                  background:
                    "linear-gradient(45deg, #106d8b 30%, #2D9CDB 90%)",
                  color: "#fff",
                  py: 1,
                  borderRadius: "8px",
                  transition: "all 0.3s ease",
                  // width: 100,
                  "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: "0 4px 12px rgba(16, 109, 139, 0.2)",
                  },
                }}
              >
                Apply
              </MuiButton>
            </Grid2>
          </Grid2>
        </Box>
      </Box>

      <Box
        sx={{
          width: "100%",
          my: 2,
          maxHeight: 700,
          overflowX: "auto",
        }}
        className="main-table"
      >
        {loading ? (
          <SkeletonLoader />
        ) : (
          <MuiTable
            rows={acceptanceData}
            columns={columns}
            paginationMode="server"
            getRowId={(row: AssetTransfer) => row.assetTransferId}
            initialState={{
              pagination: {
                paginationModel: {
                  pageSize: size,
                },
              },
            }}
            slots={{
              noRowsOverlay: () => <NoDataFound />,
            }}
            onRowClick={handleRowClick}
            disableRowSelectionOnClick
            rowCount={count}
            pageSizeOptions={[15, 30, 50]}
            onPaginationModelChange={(newPage) => {
              setPage(newPage.page + 1);
              setSize(newPage.pageSize);
            }}
          />
        )}
      </Box>
    </Box>
  );
}

export default AssetAcceptanceListPage;
