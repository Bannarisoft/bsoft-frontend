"use client";
import React, { useEffect, useState } from "react";
import IconBreadcrumbs from "../../molecules/AdminLayout/BreadCrumbs";
import { Box } from "@mui/material";
import GlobalSearch from "../../molecules/AdminLayout/GlobalSearch";
import { MuiButton, MuiTable } from "bsoft-base-elements";
import { GoPlus } from "react-icons/go";
import NoDataFound from "../../molecules/AdminLayout/NoDataFound";
import dayjs from "dayjs";
import { FiEdit } from "react-icons/fi";
import { RiDeleteBin6Line } from "react-icons/ri";
import { useDebounce } from "../../../hooks/useDebounceHook";
import DeleteConfirmation from "../../molecules/Master/DeleteConfirmation";
import CreateWorkCenter from "../../molecules/Maintanence/CreateWorkCenter";
import { WorkCenterProps } from "../../../maintanenceTypes";
import { Apirequest } from "../../../utils/lib";
import { useRecoilValue } from "recoil";
import { UserData } from "../../../utils/atoms";
import { useDataFetchHook } from "../../../hooks/useDataFetchHook";
import MainConfig from "../../../utils/main.api.json";
import Config from "../../../utils/config.api.json";
import SkeletonLoader from "../../molecules/AdminLayout/SkeletonLoader";
import ErrorModal from "../../molecules/Master/Role/ErrorModal";
import { usePrivilegeCheck } from "../../../hooks/usePrivilegeCheck";
import toast from "react-hot-toast";

export interface SnackbarTypes {
  open: boolean;
  message: string;
}
const WorkCenterPage = () => {
  const [pathname, setPathName] = useState<string>("");
  const permissions = usePrivilegeCheck(pathname);
  useEffect(() => {
    setInitFlag(true);
    const currentPath = window.location.pathname.split("/bsoft").at(-1) || "";
    setPathName(currentPath);
  }, []);
  const [open, setOpen] = React.useState(false);
  const [workCenterData, setWorkCenterData] = React.useState<any[]>([]);
  const [page, setPage] = React.useState<number>(1);
  const [size, setSize] = React.useState<number>(15);
  const [error, setError] = React.useState<any[]>([]);
  const [search, setSearch] = React.useState("");
  const [editFlag, setEditFlag] = React.useState(false);
  const [initFlag, setInitFlag] = React.useState(false);
  const debouncedSearchTerm = useDebounce(search, 500);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [count, setCount] = React.useState(0);
  const [errorModalOpen, setErrorModalOpen] = React.useState(false);
  const [errorMessages, setErrorMessages] = React.useState<string[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<any>(null);
  const userValue = useRecoilValue(UserData);

  useEffect(() => {
    setWorkCenterInput({
      ...workCenterInput,
      unitId:
        typeof userValue.unitId === "string" &&
        (userValue.unitId.startsWith("{") || userValue.unitId.startsWith("["))
          ? JSON.parse(userValue.unitId).at(0)?.UnitId ?? ""
          : "",
    });
  }, [userValue]);

  const [workCenterInput, setWorkCenterInput] = React.useState<any>({
    workCenterCode: "",
    workCenterName: "",
    unitId: 1,
    departmentId: 0,
    id: 0,
    isActive: 1,
  });

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
      field: "workCenterCode",
      headerName: "Work Center Code",
      flex: 1,
      minWidth: 200,
      valueGetter: (value: any, row: any) =>
        `${row?.workCenterCode.toUpperCase() || ""}`,
    },

    {
      field: "workCenterName",
      headerName: "work Center Name",
      flex: 2,
      minWidth: 200,
      valueGetter: (value: any, row: any) =>
        `${row?.workCenterName || ""}`.replace(/\b\w/g, (char) =>
          char.toUpperCase()
        ),
    },
    {
      field: "department",
      headerName: "Department",
      flex: 2,
      minWidth: 200,
      valueGetter: (value: any, row: any) => `${row?.departmentName || ""}`,
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
    setWorkCenterInput({
      ...workCenterInput,
      workCenterName: "",
      workCenterCode: "",
    });
    setError([]);
  };
  const handleSwitch = (e: React.ChangeEvent<HTMLInputElement>) => {
    let { checked } = e.target;
    checked
      ? setWorkCenterInput({ ...workCenterInput, isActive: 1 })
      : setWorkCenterInput({ ...workCenterInput, isActive: 0 });
  };

  const { data: departmentData, loading: departmentLoading } = useDataFetchHook(
    Config.Department.withoutControl.endpoint,
    Config.Department.withoutControl.method
  );

  const handleDepartmentChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    value: any,
    field: string
  ) => {
    if (field === "deptName") {
      if (!value?.id) {
        setSelectedDepartment(null);
        setWorkCenterInput((prev: any) => ({ ...prev, deptName: 0 }));
      } else {
        setSelectedDepartment(value);
        setWorkCenterInput((prev: any) => ({ ...prev, deptName: value.id }));
        // GetDepartment();
      }
    }
  };
  const AddWorkCenter = async () => {
    try {
      const body: any = {
        workCenterName: workCenterInput.workCenterName
          ?.trim()
          .replace(/\b\w/g, (char: any) => char.toUpperCase()),
        workCenterCode: workCenterInput.workCenterCode?.trim()?.toUpperCase(),
        unitId: userValue.unitId,
        departmentId: selectedDepartment?.id,
        isActive: workCenterInput.isActive,
      };

      if (editFlag) {
        body.id = Number(workCenterInput.id);
      }
      const { endpoint, method } = MainConfig.WorkCenter.AddWorkCenter;
      const response = await Apirequest(endpoint, method, body, "main").then(
        (res) => res.data
      );
      if (response.statusCode === 200 || response.statusCode === 201) {
        toast.success(response.message);
        setOpen(false);
        setEditFlag(false);
        setWorkCenterInput({ ...workCenterInput });
        GetWorkCenterList();
      } else {
        toast.error(response.message);
        if (Array.isArray(response.errors) && response.errors.length > 0) {
          setErrorModalOpen(true);
          setErrorMessages(response.errors);
        }
      }
    } catch (err) {
      console.log(err);
    }
  };

  const UpdateWorkCenter = async () => {
    try {
      const body: any = {
        workCenterName: workCenterInput.workCenterName
          ?.trim()
          .replace(/\b\w/g, (char: any) => char.toUpperCase()),
        workCenterCode: workCenterInput.workCenterCode?.trim()?.toUpperCase(),
        unitId: userValue.unitId,
        departmentId: selectedDepartment?.id,
        isActive: workCenterInput.isActive,
        id: workCenterInput.id,
      };

      if (editFlag) {
        body.id = Number(workCenterInput.id);
      }
      const { endpoint, method } = MainConfig.WorkCenter.UpdateWorkCenter;
      const response = await Apirequest(endpoint, method, body, "main").then(
        (res) => res.data
      );

      if (response.statusCode === 200 || response.statusCode === 201) {
        toast.success(response.message);
        setOpen(false);
        setEditFlag(false);
        setWorkCenterInput({ ...workCenterInput });
        GetWorkCenterList();
      } else {
        toast.error(response.message);
        if (Array.isArray(response.errors) && response.errors.length > 0) {
          setErrorModalOpen(true);
          setErrorMessages(response.errors);
        }
      }
    } catch (err) {
      GetWorkCenterList();
      console.log(err);
    }
  };
  const handleSubmit = (e: React.MouseEvent<HTMLButtonElement>) => {
    let temp: any = [];
    Object.entries(workCenterInput).map(([key, value]) => {
      if (
        key === "workCenterCode" &&
        typeof value == "string" &&
        value?.length < 1
      ) {
        temp.push(key);
      } else if (
        key === "workCenterName" &&
        typeof value == "string" &&
        value?.length < 1
      ) {
        temp.push(key);
      }
      if (selectedDepartment === null) {
        temp.push("departmentId");
      }
    });
    setError(temp);
    if (temp.length === 0 && editFlag) {
      UpdateWorkCenter();
    } else {
      if (temp.length === 0) {
        AddWorkCenter();
      }
    }
  };
  const handleEdit = (row: any) => {
    setEditFlag(true);
    setOpen(true);
    setWorkCenterInput({
      workCenterCode: row?.workCenterCode,
      workCenterName: row?.workCenterName,
      unitId: row?.unitId,
      id: row?.id,
      isActive: row?.isActive,
      departmentId: row?.departmentId,
    });
    departmentData?.map((item: any) => {
      if (item.id === row?.departmentId) {
        setSelectedDepartment(item);
      }
    });
  };

  const handleDelete = (id: number) => {
    setWorkCenterInput({ ...workCenterInput, id: id });
    setDeleteOpen(true);
  };
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };
  const handleClose = () => {
    setOpen(false);
    setWorkCenterInput({
      ...workCenterInput,
      workCenterName: "",
      workCenterCode: "",
    });
    setEditFlag(false);
    setError([]);
    setSelectedDepartment(null);
  };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let { name, value } = e.target;
    const filteredValue =
      name === "workCenterCode" ? value.replace(/[^a-zA-Z0-9]/g, "") : value;
    setWorkCenterInput({ ...workCenterInput, [name]: filteredValue });
    setError([]);
  };

  const DeleteWorkCenter = async (id: number) => {
    try {
      const { endpoint, method } = MainConfig.WorkCenter.DeleteWorkCenter;
      const deleteEndpoint = endpoint.replace("{id}", id.toString());

      const result = await Apirequest(
        deleteEndpoint,
        method,
        null,
        "main"
      ).then((res) => res.data);
      toast.success(result?.message);
      GetWorkCenterList();
    } catch (err) {
      console.log(err);
    }
  };

  const handleConfirmDelete = async () => {
    if (workCenterInput.id) {
      await DeleteWorkCenter(workCenterInput.id);
    }
    setDeleteOpen(false);
  };

  const GetWorkCenterList = async () => {
    try {
      setLoading(true);
      const response = await Apirequest(
        MainConfig.WorkCenter.GetWorkCenter.endpoint
          .replace("{page}", page.toString())
          .replace("{size}", size.toString())
          .replace("{searchTerm}", search),
        MainConfig.WorkCenter.GetWorkCenter.method,
        null,
        "main"
      ).then((res) => res.data);
      const { totalCount, statusCode, data } = response;
      if (statusCode === 200 || statusCode === 201) {
        setCount(totalCount);
        setWorkCenterData(data);
        setLoading(false);
      } else {
        setCount(0);
        setWorkCenterData([]);
        setLoading(false);
      }
    } catch (err) {
      setLoading(false);
      console.log(err);
    }
  };
  React.useEffect(() => {
    initFlag && search !== "" ? GetWorkCenterList() : GetWorkCenterList();
  }, [debouncedSearchTerm, page, size]);

  useEffect(() => {
    if (departmentData) {
      setWorkCenterInput((prev: any) => ({ ...prev, departmentData }));
    }
  }, [departmentData]);

  React.useEffect(() => {
    initFlag && search !== "" ? GetWorkCenterList() : GetWorkCenterList();
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
          <IconBreadcrumbs parent="Maintenance" child="Work Center" path="" />
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
            rows={workCenterData || []}
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
      <CreateWorkCenter
        open={open}
        close={handleClose}
        handleSubmit={handleSubmit}
        handleChange={handleChange}
        error={error}
        workCenterInput={workCenterInput}
        handleSwitch={handleSwitch}
        handleDepartmentChange={handleDepartmentChange}
        selectedDepartment={selectedDepartment}
        departmentData={departmentData}
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

export default WorkCenterPage;
