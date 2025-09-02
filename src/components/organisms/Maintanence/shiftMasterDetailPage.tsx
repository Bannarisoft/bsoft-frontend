"use client";

import React, { useEffect, useState } from "react";
import IconBreadcrumbs from "../../molecules/AdminLayout/BreadCrumbs";
import { Box } from "@mui/material";
import GlobalSearch from "../../molecules/AdminLayout/GlobalSearch";
import { MuiButton, MuiTable } from "bsoft-base-elements";
import { GoPlus } from "react-icons/go";
import { useDebounce } from "../../../hooks/useDebounceHook";
import DeleteConfirmation from "../../molecules/Master/DeleteConfirmation";
import ErrorModal from "../../molecules/Master/Role/ErrorModal";
import { usePrivilegeCheck } from "../../../hooks/usePrivilegeCheck";
import CreateShiftMasterDetail from "../../molecules/Maintanence/CreateShiftMasterDetail";
import ConfigMain from "../../../utils/main.api.json";
import ConfigFam from "../../../utils/fam.api.json";
import { useDataFetchHook } from "../../../hooks/useDataFetchHook";
import { ShiftDetailProps } from "../../../types/maintanenceTypes";
import { useRecoilValue } from "recoil";
import { UserData } from "../../../utils/atoms";
import {
  Apirequest,
  isSubmitting,
  startLoading,
  stopLoading,
} from "../../../utils/lib";
import dayjs from "dayjs";
import { RiDeleteBin6Line } from "react-icons/ri";
import { FiEdit } from "react-icons/fi";
import SkeletonLoader from "../../molecules/AdminLayout/SkeletonLoader";
import NoDataFound from "../../molecules/AdminLayout/NoDataFound";
import toast from "react-hot-toast";

export interface SnackbarTypes {
  open: boolean;
  message: string;
}
const ShiftMasterDetailPage = () => {
  const [pathname, setPathName] = useState<string>("");
  const permissions = usePrivilegeCheck(pathname);

  useEffect(() => {
    setInitFlag(true);
    const currentPath = window.location.pathname.split("/bsoft").at(-1) || "";
    setPathName(currentPath);
  }, []);

  const [open, setOpen] = React.useState(false);
  const [page, setPage] = React.useState<number>(1);
  const [size, setSize] = React.useState<number>(15);
  const [error, setError] = React.useState<any[]>([]);
  const [search, setSearch] = React.useState("");
  const [editFlag, setEditFlag] = React.useState(false);
  const [initFlag, setInitFlag] = React.useState(false);
  const debouncedSearchTerm = useDebounce(search, 500);
  const [errorModalOpen, setErrorModalOpen] = React.useState(false);
  const [errorMessages, setErrorMessages] = React.useState<string[]>([]);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [selectedShift, setSelectedShift] = useState<any>(null);
  const [shiftSupervisorData, setshiftSupervisorData] = React.useState<any[]>(
    []
  );
  const [shiftDetailData, setShiftDetailData] = React.useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [count, setCount] = React.useState<number>(0);
  const [selectedshiftSupervisor, setSelectedshiftSupervisor] = useState<
    any | null
  >(null);

  const [shiftDeatailInput, setShiftDetailInput] =
    React.useState<ShiftDetailProps>({
      oldUnitId: 0,
      shiftMasterId: 0,
      unitId: 1,
      startTime: "",
      endTime: "",
      breakDurationInMinutes: 0,
      effectiveDate: "",
      shiftSupervisorId: 0,
      id: 0,
      isActive: 1,
    });
  const userValue = useRecoilValue(UserData);

  useEffect(() => {
    if (userValue) {
      setShiftDetailInput((prevState) => ({
        ...prevState,
        oldUnitId:
          typeof userValue.oldUnitId === "string" &&
          (userValue.oldUnitId.startsWith("{") ||
            userValue.oldUnitId.startsWith("["))
            ? JSON.parse(userValue.oldUnitId)?.[0]?.oldUnitId ??
              prevState.oldUnitId
            : userValue.oldUnitId ?? prevState.oldUnitId,

        unitId:
          typeof userValue.unitId === "string" &&
          (userValue.unitId.startsWith("{") || userValue.unitId.startsWith("["))
            ? JSON.parse(userValue.unitId)?.[0]?.unitId ?? prevState.unitId
            : userValue.unitId ?? prevState.unitId,
      }));
    }
  }, [userValue]);

  const { data: oldUnit } = useDataFetchHook(
    ConfigFam.GetResponsiblePerson.endpoint
      .replace("{OldUnitId}", userValue.oldUnitId?.toString() || "")
      .replace("{SearchEmployee}", ""),
    ConfigFam.GetResponsiblePerson.method,
    "fam"
  );
  useEffect(() => {
    if (oldUnit && Array.isArray(oldUnit) && oldUnit.length > 0) {
      setShiftDetailInput((prev) => ({
        ...prev,
        oldUnitId: oldUnit[0].oldUnitId ?? prev.oldUnitId,
      }));
      setshiftSupervisorData(oldUnit || []);
    }
  }, [oldUnit]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const handleShiftSupervisorChange = (
    e: React.ChangeEvent<HTMLInputElement> | null,
    value: any,
    field: string
  ) => {
    if (field === "ShiftSupervisor") {
      setSelectedshiftSupervisor(value || null);

      setShiftDetailInput((prev) => ({
        ...prev,
        shiftSupervisorId: value?.custodianId || 0,
      }));
    }
  };

  const handleSwitch = (e: React.ChangeEvent<HTMLInputElement>) => {
    let { checked } = e.target;
    checked
      ? setShiftDetailInput({ ...shiftDeatailInput, isActive: 1 })
      : setShiftDetailInput({ ...shiftDeatailInput, isActive: 0 });
  };

  const columns = [
    {
      field: "s_no",
      headerName: "S.No",
      minWidth: 50,
      flex: 1,
      sortable: true,
      renderCell: (params: any) => {
        return (
          (page - 1) * size + (params.api.getAllRowIds().indexOf(params.id) + 1)
        );
      },
    },
    {
      field: "shiftCode",
      headerName: "Shift Code",
      flex: 1,
      minWidth: 200,
      valueGetter: (value: any, row: any) =>
        `${row?.shiftCode.toUpperCase() || ""}`,
    },

    {
      field: "shiftName",
      headerName: "shift Name",
      flex: 2,
      minWidth: 200,
      valueGetter: (value: any, row: any) => `${row?.shiftName || ""}`,
    },
    {
      field: "effectiveDate",
      headerName: "Effective Date",
      flex: 2,
      minWidth: 200,
      valueGetter: (value: any, row: any) => {
        return row?.effectiveDate ? row?.effectiveDate?.split(" ").at(0) : null;
      },
    },
    {
      field: "isActive",
      headerName: "Status",
      flex: 1,
      minWidth: 200,
      valueGetter: (value: any, row: any) =>
        `${row?.isActive ? "Active" : "Inactive"}`,
    },
    {
      field: "createdDate",
      headerName: "Created Date",
      flex: 2,
      minWidth: 200,
      valueGetter: (value: any, row: any) =>
        `${dayjs(row?.createdDate).format("DD-MM-YYYY")}`,
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
          gap={2}
          height={"100%"}
        >
          {permissions.canUpdate && (
            <FiEdit
              fontSize={20}
              color="black"
              cursor={"pointer"}
              onClick={() => handleEdit(params.row)}
            />
          )}
          {permissions.canDelete && (
            <RiDeleteBin6Line
              fontSize={20}
              color="red"
              cursor={"pointer"}
              onClick={() => handleDelete(params.row.id)}
            />
          )}
        </Box>
      ),
    },
  ];

  const handleClickOpen = () => {
    setOpen(true);
    setEditFlag(false);
    setSelectedShift(null);
    setSelectedshiftSupervisor(null);
    setShiftDetailInput({
      ...shiftDeatailInput,
      startTime: "",
      endTime: "",
      effectiveDate: "",
      breakDurationInMinutes: 0,
      isActive: 1,
    });
    setError([]);
  };

  const handleClose = () => {
    setOpen(false);
    setShiftDetailInput({
      ...shiftDeatailInput,
      startTime: "",
      endTime: "",
      effectiveDate: "",
      isActive: 1,
    });
    setEditFlag(false);
    setError([]);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let { name, value } = e.target;
    setShiftDetailInput({ ...shiftDeatailInput, [name]: value });
    setError([]);
  };

  const handleShiftChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    value: any,
    field: string
  ) => {
    if (field === "shiftName") {
      if (!value?.id) {
        setSelectedShift(null);
        setShiftDetailInput((prev) => ({ ...prev, shiftName: 0 }));
      } else {
        setSelectedShift(value);
        setShiftDetailInput((prev) => ({ ...prev, shiftName: value.id }));
      }
    }
  };

  const { data: shiftData } = useDataFetchHook(
    ConfigMain.ShiftMaster.GetShiftByName.endpoint,
    ConfigMain.ShiftMaster.GetShiftByName.method,
    "main"
  );

  useEffect(() => {
    if (shiftData) {
      setShiftDetailInput((prev) => ({ ...prev, shiftData }));
    }
  }, [shiftData]);

  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    if (isSubmitting()) return;

    let temp: string[] = [];

    if (selectedShift === null) temp.push("shiftMasterId");

    if (
      !shiftDeatailInput.startTime ||
      !dayjs(shiftDeatailInput.startTime, "HH:mm:ss", true).isValid()
    ) {
      temp.push("startTime");
    }

    if (
      !shiftDeatailInput.endTime ||
      !dayjs(shiftDeatailInput.endTime, "HH:mm:ss", true).isValid()
    ) {
      temp.push("endTime");
    }

    if (!shiftDeatailInput.effectiveDate) temp.push("effectiveDate");

    if (
      shiftDeatailInput.breakDurationInMinutes === undefined ||
      isNaN(Number(shiftDeatailInput.breakDurationInMinutes)) ||
      Number(shiftDeatailInput.breakDurationInMinutes) <= 0
    ) {
      temp.push("breakDuration");
    }

    if (selectedshiftSupervisor === null) temp.push("shiftSupervisorId");

    setError(temp);

    if (temp.length > 0) {
      console.error("Please fill all mandatory fields correctly.");
      return;
    }

    try {
      startLoading();

      if (editFlag) {
        await UpdateShiftDetail();
      } else {
        await AddShiftDetail();
      }
    } catch (error) {
      console.error("Error saving shift detail:", error);
    } finally {
      stopLoading();
    }
  };

  const AddShiftDetail = async () => {
    try {
      startLoading();
      const body: any = {
        shiftMasterId: selectedShift?.id,
        unitId: userValue.unitId,
        startTime: shiftDeatailInput.startTime,
        endTime: shiftDeatailInput.endTime,
        breakDurationInMinutes: shiftDeatailInput.breakDurationInMinutes,
        effectiveDate: shiftDeatailInput.effectiveDate,
        shiftSupervisorId: selectedshiftSupervisor?.custodianId,
        isActive: shiftDeatailInput.isActive,
      };
      if (editFlag) {
        body.id = Number(shiftDeatailInput.id);
      }
      const { endpoint, method } = ConfigMain.ShiftMasterDetail.AddShiftDetail;
      const response = await Apirequest(endpoint, method, body, "main").then(
        (res) => res.data
      );
      if (response.statusCode === 200 || response.statusCode === 201) {
        toast.success(response.message);
        setOpen(false);
        setEditFlag(false);
        setShiftDetailInput({ ...shiftDeatailInput });
        GetShiftDetailList();
      } else {
        toast.error(response.message);
        if (Array.isArray(response.errors) && response.errors.length > 0) {
          setErrorModalOpen(true);
          setErrorMessages(response.errors);
        }
      }
    } catch (err) {
      console.log(err);
    } finally {
      stopLoading();
    }
  };

  const handleEdit = (row: any) => {
    setEditFlag(true);
    setOpen(true);
    setShiftDetailInput({
      ...shiftDeatailInput,
      startTime: row.startTime,
      endTime: row.endTime,
      breakDurationInMinutes: row.breakDurationInMinutes,
      effectiveDate: row.effectiveDate,
      shiftSupervisorId: row.shiftSupervisorId,
      id: row.id,
    });
    const superviserData = shiftSupervisorData.find(
      (item: any) => item.custodianId === row.shiftSupervisorId
    );
    const shift = shiftData.find(
      (item: any) => item?.shiftCode === row?.shiftCode
    );
    setSelectedShift(shift);
    setSelectedshiftSupervisor(superviserData);
  };

  const UpdateShiftDetail = async () => {
    try {
      startLoading();
      const body: any = {
        shiftMasterId: selectedShift?.id,
        unitId: userValue.unitId,
        startTime: shiftDeatailInput.startTime,
        endTime: shiftDeatailInput.endTime,
        breakDurationInMinutes: shiftDeatailInput.breakDurationInMinutes,
        effectiveDate: dayjs(shiftDeatailInput.effectiveDate).format(
          "YYYY-MM-DD"
        ),
        shiftSupervisorId: selectedshiftSupervisor?.custodianId,
        isActive: shiftDeatailInput.isActive,
        id: shiftDeatailInput.id,
      };
      if (editFlag) {
        body.id = Number(shiftDeatailInput.id);
      }
      const { endpoint, method } =
        ConfigMain.ShiftMasterDetail.UpdateShiftDetail;
      const response = await Apirequest(endpoint, method, body, "main").then(
        (res) => res.data
      );
      if (response.statusCode === 200 || response.statusCode === 201) {
        toast.success(response.message);
        setOpen(false);
        setEditFlag(false);
        setShiftDetailInput({ ...shiftDeatailInput });
        GetShiftDetailList();
      } else {
        toast.error(response.message);
        if (Array.isArray(response.errors) && response.errors.length > 0) {
          setErrorModalOpen(true);
          setErrorMessages(response.errors);
        }
      }
    } catch (err) {
      console.log(err);
    } finally {
      stopLoading();
    }
  };

  const handleDelete = (id: number) => {
    setShiftDetailInput({ ...shiftDeatailInput, id: id });
    setDeleteOpen(true);
  };

  const DeleteShift = async (id: number) => {
    try {
      const { endpoint, method } = ConfigMain.ShiftMasterDetail.DeleteShift;
      const deleteEndpoint = endpoint.replace("{id}", id.toString());
      const result = await Apirequest(
        deleteEndpoint,
        method,
        null,
        "main"
      ).then((res) => res.data);
      toast.success(result?.message);
      GetShiftDetailList();
    } catch (err) {
      console.log(err);
    }
  };

  const handleConfirmDelete = async () => {
    if (shiftDeatailInput.id) {
      await DeleteShift(shiftDeatailInput.id);
    }
    setDeleteOpen(false);
  };

  const GetShiftDetailList = async () => {
    try {
      const response = await Apirequest(
        ConfigMain.ShiftMasterDetail.GetShiftDetail.endpoint
          .replace("{page}", page.toString())
          .replace("{size}", size.toString())
          .replace("{searchTerm}", search),
        ConfigMain.ShiftMasterDetail.GetShiftDetail.method,
        null,
        "main"
      ).then((res) => res.data);
      const { totalCount, statusCode, data } = response;
      if (statusCode === 200 || statusCode === 201) {
        setShiftDetailData(data);
        setLoading(false);
        setCount(totalCount);
      } else {
        setCount(0);
        setShiftDetailData([]);
        setLoading(false);
      }
    } catch (err) {
      console.log(err);
      setShiftDetailData([]);
    }
  };

  React.useEffect(() => {
    initFlag && search !== "" ? GetShiftDetailList() : GetShiftDetailList();
  }, [debouncedSearchTerm, page, size]);

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
          <IconBreadcrumbs parent="Maintenance" child="Shift Timing" path="" />
        </Box>
        <Box>
          <Box
            display={"flex"}
            justifyContent={"space-between"}
            alignItems={"center"}
            flexWrap={"wrap"}
            gap={2}
          >
            <GlobalSearch
              placeholder="search"
              width={200}
              onChange={handleSearch}
            />
            {permissions.canAdd && (
              <MuiButton
                startIcon={<GoPlus />}
                onClick={handleClickOpen}
                variant="contained"
              >
                Create
              </MuiButton>
            )}
          </Box>
        </Box>
      </Box>
      <Box sx={{ width: "100%", my: 2, height: 700 }} className="main-table">
        {loading ? (
          <SkeletonLoader />
        ) : (
          <MuiTable
            rows={shiftDetailData || []}
            columns={columns}
            paginationMode="server"
            initialState={{
              pagination: {
                paginationModel: {
                  pageSize: size,
                },
              },
            }}
            rowCount={count}
            rowHeight={40}
            pageSizeOptions={[15, 30, 50]}
            disableRowSelectionOnClick
            slots={{
              noRowsOverlay: () => <NoDataFound />,
            }}
            onPaginationModelChange={(newPage) => {
              setPage(newPage.page + 1);
              setSize(newPage.pageSize);
            }}
          />
        )}
      </Box>

      <CreateShiftMasterDetail
        open={open}
        close={handleClose}
        handleShiftChange={handleShiftChange}
        selectedShift={selectedShift}
        shiftData={shiftData}
        handleChange={handleChange}
        shiftDeatailInput={shiftDeatailInput}
        shiftSupervisorData={shiftSupervisorData}
        handleShiftSupervisorChange={handleShiftSupervisorChange}
        selectedshiftSupervisor={selectedshiftSupervisor}
        handleSwitch={handleSwitch}
        handleSubmit={handleSubmit}
        error={error}
        editFlag={editFlag}
      />
      <ErrorModal
        open={errorModalOpen}
        onClose={() => setErrorModalOpen(false)}
        errors={errorMessages}
      />
      <DeleteConfirmation
        open={deleteOpen}
        close={() => setDeleteOpen(false)}
        handleDelete={handleConfirmDelete}
      />
    </>
  );
};

export default ShiftMasterDetailPage;
