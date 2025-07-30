"use client";
import React, { useEffect, useState } from "react";
import {
  Box,
  DialogTitle,
  FormControlLabel,
  InputAdornment,
} from "@mui/material";
import { MuiButton, MuiInputField, MuiTable } from "bsoft-base-elements";
import { GoPlus } from "react-icons/go";
import IconBreadcrumbs from "../../../molecules/AdminLayout/BreadCrumbs";
import SkeletonLoader from "../../../molecules/AdminLayout/SkeletonLoader";
import NoDataFound from "../../../molecules/AdminLayout/NoDataFound";
import { useDataFetchHook } from "../../../../hooks/useDataFetchHook";
import dayjs from "dayjs";
import { FiEdit } from "react-icons/fi";
import MainConfig from "../../../../utils/main.api.json";
import { useDebounce } from "../../../../hooks/useDebounceHook";
import { Apirequest, CustomSwitch } from "../../../../utils/lib";
import { GridColDef, GridPaginationModel } from "@mui/x-data-grid";
import Link from "next/link";
import Swal from "sweetalert2";
import { RiSearchLine } from "react-icons/ri";
import { MdScheduleSend } from "react-icons/md";
import toast from "react-hot-toast";

const ScheduleListPage = () => {
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 15,
  });

  const [search, setSearch] = useState("");
  const debouncedSearchTerm = useDebounce(search, 600);
  const [refreshKey, setRefreshKey] = useState(0);

  const page = paginationModel.page + 1;
  const size = paginationModel.pageSize;

  const {
    data: scheduleData,
    loading,
    count,
  } = useDataFetchHook(
    MainConfig.WorkOrder.Schedule.PreventiveScheduler.endpoint
      .replace("{page}", page.toString())
      .replace("{size}", size.toString())
      .replace("{searchTerm}", debouncedSearchTerm),
    MainConfig.WorkOrder.Schedule.PreventiveScheduler.method,
    "main",
    refreshKey
  );

  useEffect(() => {
    setPaginationModel((prev) => ({ ...prev, page: 0 }));
    setRefreshKey((prev) => prev + 1);
  }, [debouncedSearchTerm]);

  const handleSwitch = async (
    e: React.ChangeEvent<HTMLInputElement>,
    row: any
  ) => {
    if (row?.isActive === "True") {
      Swal.fire({
        title:
          "Deactivating this schedule will remove permanently. would you like to proceed?",
        icon: "warning",
        confirmButtonText: "Okay",
        showCancelButton: true,
        customClass: { title: "custom-title" },
      }).then(async (res) => {
        if (res.isConfirmed) {
          try {
            const body = {
              id: Number(row?.id),
              isActive: 0,
            };
            const { endpoint, method } =
              MainConfig.WorkOrder.Schedule.UpdateActive;
            const response = await Apirequest(
              endpoint,
              method,
              body,
              "main"
            ).then((res) => res.data);
            if (response?.statusCode === 200 || response?.statusCode === 201) {
              toast.success(response?.message || "Status updated successfully");
              setRefreshKey((prev) => prev + 1);
            } else {
              toast.error(response?.message || "Failed to update status");
            }
          } catch (error) {
            console.error("Error in handleSwitch:", error);
            toast.error("An error occurred while updating the status");
          }
        }
      });
    } else {
      try {
        const body = {
          id: Number(row?.id),
          isActive: 1,
        };
        const { endpoint, method } = MainConfig.WorkOrder.Schedule.UpdateActive;
        const response = await Apirequest(endpoint, method, body, "main").then(
          (res) => res.data
        );
        if (response?.statusCode === 200 || response?.statusCode === 201) {
          toast.success(response?.message || "Status updated successfully");
          setRefreshKey((prev) => prev + 1);
        } else {
          toast.error(response?.message || "Failed to update status");
        }
      } catch (error) {
        console.error("Error in handleSwitch:", error);
        toast.error("An error occurred while updating the status");
      }
    }
  };

  const columns: GridColDef[] = [
    {
      field: "preventiveSchedulerName",
      headerName: "Schedule Name",
      minWidth: 200,
      flex: 2,
      sortable: true,
      valueGetter: (value: any, row: any) =>
        `${row?.preventiveSchedulerName || ""}`.replace(/\b\w/g, char => char.toUpperCase()),
    },
    {
      field: "departmentName",
      headerName: "Department",
      flex: 1,
      minWidth: 200,
      valueGetter: (value: any, row: any) => `${row?.departmentName || ""}`,
    },
    {
      field: "machineGroup",
      headerName: "Machine Group",
      flex: 2,
      minWidth: 200,
      valueGetter: (value: any, row: any) => `${row?.machineGroup || ""}`,
    },
    {
      field: "createdAt",
      headerName: "Created At",
      flex: 2,
      minWidth: 150,
      valueGetter: (value: any, row: any) =>
        `${dayjs(row?.createdDate).format("DD-MM-YYYY")}`,
    },
    {
      field: "createdByName",
      headerName: "Created By",
      sortable: true,
      flex: 2,
      minWidth: 150,
      valueGetter: (value: any, row: any) => `${row?.createdByName || ""}`,
    },
    {
      field: "actions",
      headerName: "Actions",
      flex: 2,
      minWidth: 200,
      sortable: false,
      filterable: false,
      renderCell: (params: any) => (
        <Box
          component={"div"}
          display={"flex"}
          alignItems={"center"}
          justifyContent={"start"}
          height={"100%"}
          gap={3}
        >
          <FormControlLabel
            sx={{ mr: 0 }}
            control={
              <CustomSwitch
                checked={params.row?.isActive === "True"}
                onChange={(e) => handleSwitch(e, params.row)}
              />
            }
            label={""}
          />
          <Link href={`/maintanence/my-schedule/${params.row?.id}`}>
            <FiEdit fontSize={20} color="black" cursor={"pointer"} />
          </Link>
          <Link href={`/maintanence/view-schedule/${params.row?.id}`}>
            <MdScheduleSend fontSize={20} color="#3a8484" cursor={"pointer"} />
          </Link>
        </Box>
      ),
    },
  ];

  return (
    <>
      <Box
        display={"flex"}
        justifyContent={"space-between"}
        alignItems={"center"}
        flexWrap={"wrap"}
        gap={2}
        mt={1}
      >
        <Box>
          <IconBreadcrumbs parent="Schedule" child="Schedule List" path="" />
        </Box>
        <Box>
          <Box
            display={"flex"}
            justifyContent={"space-between"}
            alignItems={"center"}
            flexWrap={"wrap"}
            gap={2}
          >
            <MuiInputField
              placeholder="search"
              sx={{ width: 200, bgcolor: "#fff" }}
              onChange={(e) => setSearch(e.target.value)}
              value={search}
              size="small"
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <RiSearchLine color={"#3a8484"} />
                    </InputAdornment>
                  ),
                },
              }}
            />
            <Link href={`/maintanence/create-schedule`}>
              <MuiButton startIcon={<GoPlus />} variant="contained">
                Create
              </MuiButton>
            </Link>
          </Box>
        </Box>
      </Box>

      <Box p={2} bgcolor={"#fff"} mt={2} borderRadius={2}>
        <DialogTitle className="highlighted-header" sx={{ pl: 0, pt: 0 }}>
          Schedule List
        </DialogTitle>
        {loading ? (
          <SkeletonLoader />
        ) : (
          <Box
            sx={{ width: "100%", my: 2, height: 700 }}
            className="main-table"
          >
            <MuiTable
              rows={scheduleData || []}
              columns={columns}
              paginationMode="server"
              paginationModel={paginationModel}
              onPaginationModelChange={(newModel) => {
                if (
                  newModel.page !== paginationModel.page ||
                  newModel.pageSize !== paginationModel.pageSize
                ) {
                  setPaginationModel(newModel);
                  setRefreshKey((prev) => prev + 1);
                }
              }}
              rowCount={count}
              rowHeight={40}
              pageSizeOptions={[15, 30, 50]}
              disableRowSelectionOnClick
              slots={{
                noRowsOverlay: () => <NoDataFound />,
              }}
              sx={{ mt: 2 }}
            />
          </Box>
        )}
      </Box>
    </>
  );
};

export default ScheduleListPage;
