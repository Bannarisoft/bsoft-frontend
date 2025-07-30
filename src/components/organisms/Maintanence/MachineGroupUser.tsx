import { Box } from "@mui/material";
import React, { useEffect, useState } from "react";
import IconBreadcrumbs from "../../molecules/AdminLayout/BreadCrumbs";
import GlobalSearch from "../../molecules/AdminLayout/GlobalSearch";
import { MuiButton, MuiTable } from "bsoft-base-elements";
import { GoPlus } from "react-icons/go";
import MainConfig from "../../../utils/main.api.json";
import { Apirequest } from "../../../utils/lib";
import { useDebounce } from "../../../hooks/useDebounceHook";
import SkeletonLoader from "../../molecules/AdminLayout/SkeletonLoader";
import { useDataFetchHook } from "../../../hooks/useDataFetchHook";
import NoDataFound from "../../molecules/AdminLayout/NoDataFound";
import dayjs from "dayjs";
import { FiEdit } from "react-icons/fi";
import { RiDeleteBin6Line } from "react-icons/ri";
import CreateMachineGroupUser from "../../molecules/Maintanence/CreateMachineGroupUser";
import Config from "../../../utils/config.api.json";
import { MachineGroupsUserProps } from "../../../maintanenceTypes";
import ErrorModal from "../../molecules/Master/Role/ErrorModal";
import DeleteConfirmation from "../../molecules/Master/DeleteConfirmation";
import { usePrivilegeCheck } from "../../../hooks/usePrivilegeCheck";
import toast from "react-hot-toast";

const MachineGroupUser = () => {
  const [pathname, setPathName] = useState<string>("");
  const permissions = usePrivilegeCheck(pathname);

  useEffect(() => {
    setInitFlag(true);
    const currentPath = window.location.pathname.split("/bsoft").at(-1) || "";
    setPathName(currentPath);
  }, []);
  const [open, setOpen] = React.useState(false);
  const [error, setError] = React.useState<any[]>([]);
  const [page, setPage] = React.useState<number>(1);
  const [size, setSize] = React.useState<number>(15);
  const [search, setSearch] = React.useState("");
  const [initFlag, setInitFlag] = React.useState(false);
  const debouncedSearchTerm = useDebounce(search, 500);
  const [selectedDepartment, setSelectedDepartment] = useState<any>(null);
  const [selectedMachineGroup, setSelectedMachineGroup] = useState<any>(null);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [editFlag, setEditFlag] = React.useState(false);
  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [loading, setLoading] = useState(true);
  const [count, setCount] = React.useState<number>(0);
  const [errorMessages, setErrorMessages] = useState<string[]>([]);
  const [machineGroupUserInput, setMachineGroupUserInput] =
    useState<MachineGroupsUserProps>({
      machineGroupId: 0,
      departmentId: 0,
      userId: 0,
      id: 0,
      isActive: 1,
    });
  const [machinegroupUserData, setMachinegroupUserData] = React.useState<any[]>(
    []
  );

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
      field: "deptName",
      headerName: "Department Name",
      flex: 2,
      minWidth: 200,
      valueGetter: (value: any, row: any) => `${row?.departmentName || ""}`,
    },
    {
      field: "userName",
      headerName: "User Name",
      flex: 2,
      minWidth: 200,
      valueGetter: (value: any, row: any) => `${row?.userName || ""}`,
    },
    {
      field: "groupName",
      headerName: "Group Name",
      flex: 2,
      minWidth: 200,
      valueGetter: (value: any, row: any) => `${row?.groupName || ""}`,
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
    setSelectedDepartment(null);
    setSelectedMachineGroup(null);
    setSelectedUser(null);
    setError([]);
  };
  const handleClose = () => {
    setOpen(false);
    setError([]);
    setMachineGroupUserInput({
      ...machineGroupUserInput,
      isActive: 1,
    });
  };

  const handleSwitch = (e: React.ChangeEvent<HTMLInputElement>) => {
    let { checked } = e.target;
    checked
      ? setMachineGroupUserInput({ ...machineGroupUserInput, isActive: 1 })
      : setMachineGroupUserInput({ ...machineGroupUserInput, isActive: 0 });
  };

  const handleEdit = (row: any) => {
    console.log(row);
    setOpen(true);
    setEditFlag(true);
    setMachineGroupUserInput({
      machineGroupId: row.machineGroupId,
      departmentId: row.departmentId,
      userId: row.userId,
      id: row.id,
      isActive: row.isActive,
    });
    departmentData?.map((item: any) => {
      if (item.id === row?.departmentId) {
        setSelectedDepartment(item);
      }
    });
    const selectedUser = userIdData?.find(
      (item: any) => item.userId === row?.userId
    );
    if (selectedUser) setSelectedUser(selectedUser);
    machineGroupDate?.map((item: any) => {
      if (item.id === row?.machineGroupId) {
        setSelectedMachineGroup(item);
      }
    });
  };
  const handleSubmit = (e: React.MouseEvent<HTMLButtonElement>) => {
    let temp: string[] = [];

    if (selectedDepartment === null) {
      temp.push("departmentId");
    }
    if (selectedUser === null) temp.push("user");
    if (selectedMachineGroup === null) temp.push("machineGroupId");

    setError(temp);

    if (temp.length === 0 && editFlag) {
      UpdateMachinGroupUser();
    } else {
      if (temp.length === 0) {
        AddMachinGroupUser();
      }
    }
  };

  const AddMachinGroupUser = async () => {
    try {
      const body: any = {
        departmentId: selectedDepartment?.id,
        machineGroupId: selectedMachineGroup?.id,
        userId: selectedUser?.userId,
      };
      if (editFlag) {
        body.id = Number(machineGroupUserInput.id);
      }
      const { endpoint, method } =
        MainConfig.MachineGroupUser.AddMachineGroupUser;
      const response = await Apirequest(endpoint, method, body, "main").then(
        (res) => res.data
      );
      if (response.statusCode === 200 || response.statusCode === 201) {
        toast.success(response.message);
        setOpen(false);
        setEditFlag(false);
        GetMachineGroupUserList();
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

  const UpdateMachinGroupUser = async () => {
    try {
      const body: any = {
        departmentId: selectedDepartment?.id,
        id: machineGroupUserInput.id,
        isActive: machineGroupUserInput.isActive,
        machineGroupId: selectedMachineGroup?.id,
        userId: selectedUser?.userId,
      };

      const { endpoint, method } =
        MainConfig.MachineGroupUser.UpdateMachineGroupUser;
      const response = await Apirequest(endpoint, method, body, "main").then(
        (res) => res.data
      );
      if (response.statusCode === 200) {
        toast.success(response.message);
        setOpen(false);
        setMachineGroupUserInput({ ...machineGroupUserInput });
        setEditFlag(false);
        GetMachineGroupUserList();
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

  const handleDelete = (id: number) => {
    setMachineGroupUserInput({ ...machineGroupUserInput, id: id });
    setDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    DeleteMachine();
    setDeleteOpen(false);
  };

  const DeleteMachine = async () => {
    try {
      const body = {
        id: machineGroupUserInput.id,
      };
      const { endpoint, method } =
        MainConfig.MachineGroupUser.DeleteMachineGroupUser;
      const result = await Apirequest(
        endpoint.replace("{id}", `${machineGroupUserInput.id}`),
        method,
        body,
        "main"
      ).then((res) => res.data);
      toast.success(result?.message);
      GetMachineGroupUserList();
    } catch (err) {
      console.log(err);
      GetMachineGroupUserList();
    }
  };

  const handleDepartmentChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    value: any,
    field: string
  ) => {
    if (field === "deptName") {
      if (!value?.id) {
        setSelectedDepartment(null);
        setMachineGroupUserInput((prev) => ({ ...prev, deptName: 0 }));
      } else {
        setSelectedDepartment(value);
        setMachineGroupUserInput((prev) => ({ ...prev, deptName: value.id }));
      }
    }
  };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setMachineGroupUserInput({ ...machineGroupUserInput, [name]: value });
    setError([]);
  };

  const handleUserChange = (
    e: React.ChangeEvent<HTMLInputElement> | null,
    value: any,
    field: string
  ) => {
    if (field === "UserName") {
      if (!value?.userId) {
        setSelectedUser(null);
        setMachineGroupUserInput((prev) => ({ ...prev, userId: 0 }));
      } else {
        setSelectedUser(value);
        setMachineGroupUserInput((prev) => ({
          ...prev,
          userId: value.userId,
        }));
      }
    }
  };

  const handleMachineGroupChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    value: any,
    field: string
  ) => {
    if (field === "GroupName") {
      if (!value?.id) {
        setSelectedMachineGroup(null);
        setMachineGroupUserInput((prev) => ({ ...prev, groupName: 0 }));
      } else {
        setSelectedMachineGroup(value);
        setMachineGroupUserInput((prev) => ({ ...prev, groupName: value.id }));
      }
    }
  };

  const { data: departmentData } = useDataFetchHook(
    Config.Department.getDepartment.endpoint,
    Config.Department.getDepartment.method
  );
  const { data: userIdData } = useDataFetchHook(
    Config.User.getByuser.endpoint,
    Config.User.getByuser.method
  );

  const { data: machineGroupDate } = useDataFetchHook(
    MainConfig.Machine.MachineGroupByName.endpoint,
    MainConfig.Machine.MachineGroupByName.method,
    "main"
  );

  const GetMachineGroupUserList = async () => {
    try {
      const response = await Apirequest(
        MainConfig.MachineGroupUser.GetMachineGroupUser.endpoint
          .replace("{page}", page.toString())
          .replace("{size}", size.toString())
          .replace("{searchTerm}", search),
        MainConfig.MachineGroupUser.GetMachineGroupUser.method,
        null,
        "main"
      ).then((res) => res.data);
      const { totalCount, statusCode, data } = response;
      if (statusCode === 200 || statusCode === 201) {
        setMachinegroupUserData(data);
        setLoading(false);
        setCount(totalCount);
      } else {
        setCount(0);
        setMachinegroupUserData([]);
        setLoading(false);
      }
    } catch (err) {
      console.log(err);
      setMachinegroupUserData([]);
    }
  };

  React.useEffect(() => {
    initFlag && search !== ""
      ? GetMachineGroupUserList()
      : GetMachineGroupUserList();
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
          <IconBreadcrumbs
            parent="Maintenance"
            child=" Machine Group User"
            path=""
          />
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
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setSearch(e.target.value)
              }
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
            rows={machinegroupUserData || []}
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
      <CreateMachineGroupUser
        open={open}
        close={handleClose}
        handleDepartmentChange={handleDepartmentChange}
        selectedDepartment={selectedDepartment}
        handleMachineGroupChange={handleMachineGroupChange}
        selectedMachineGroup={selectedMachineGroup}
        departmentData={departmentData}
        machineGroupDate={machineGroupDate}
        machineGroupUserInput={machineGroupUserInput}
        error={error}
        userIdData={userIdData}
        handleUserChange={handleUserChange}
        selectedUser={selectedUser}
        handleSwitch={handleSwitch}
        handleSubmit={handleSubmit}
        handleChange={handleChange}
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

export default MachineGroupUser;
