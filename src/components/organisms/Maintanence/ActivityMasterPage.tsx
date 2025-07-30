"use client";
import { Box, Skeleton, SnackbarCloseReason } from "@mui/material";
import React, { useEffect, useState } from "react";
import IconBreadcrumbs from "../../molecules/AdminLayout/BreadCrumbs";
import GlobalSearch from "../../molecules/AdminLayout/GlobalSearch";
import { MuiButton, MuiTable } from "bsoft-base-elements";
import { GoPlus } from "react-icons/go";
import Config from "../../../utils/main.api.json";
import config from "../../../utils/config.api.json";
import ConfigMain from "../../../utils/main.api.json";
import MainConfig from "../../../utils/main.api.json";
import NoDataFound from "../../molecules/AdminLayout/NoDataFound";
import dayjs from "dayjs";
import { FiEdit } from "react-icons/fi";
import { activityProps } from "../../../maintanenceTypes";
import { Apirequest } from "../../../utils/lib";
import { useDebounce } from "../../../hooks/useDebounceHook";
import { useDataFetchHook } from "../../../hooks/useDataFetchHook";
import CreateActivityMaster from "../../molecules/Maintanence/CreateActivityMaster";
import ErrorModal from "../../molecules/Master/Role/ErrorModal";
import SkeletonLoader from "../../molecules/AdminLayout/SkeletonLoader";
import { usePrivilegeCheck } from "../../../hooks/usePrivilegeCheck";
import { useRecoilValue } from "recoil";
import { UserData } from "../../../utils/atoms";
import toast from "react-hot-toast";

function ActivityMasterPage() {
  const [open, setOpen] = React.useState(false);
  const [activityData, setActivityData] = useState<any[]>([]);
  const [pathname, setPathName] = useState<string>("");
  const permissions = usePrivilegeCheck(pathname);
  useEffect(() => {
    setInitFlag(true);
    const currentPath = window.location.pathname.split("/bsoft").at(-1) || "";
    setPathName(currentPath);
  }, []);
  const [page, setPage] = React.useState<number>(1);
  const [size, setSize] = React.useState<number>(15);
  const [search, setSearch] = React.useState("");
  const [initFlag, setInitFlag] = React.useState(false);
  const [error, setError] = React.useState<any[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<any>(null);
  const [selectedActivityType, setSelectedActivityType] = useState<any>(null);
  const [selectedMachineGroup, setSelectedMachineGroup] = useState<any[]>([]);
  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [errorMessages, setErrorMessages] = useState<string[]>([]);
  const [activityInput, setActivityInput] = React.useState<activityProps>({
    activityName: "",
    description: "",
    departmentId: 0,
    id: 0,
    estimatedDuration: 0,
    activityType: 0,
    isActive: 1,
    machineGroupId: 0,
  });
  const [loading, setLoading] = useState(true);
  const [count, setCount] = React.useState<number>(0);
  const debouncedSearchTerm = useDebounce(search, 500);
  const userValue = useRecoilValue(UserData);

  const [editFlag, setEditFlag] = React.useState(false);

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
      field: "activityName",
      headerName: "Activity Name",
      flex: 2,
      minWidth: 200,
      valueGetter: (value: any, row: any) =>
        `${row?.activityName || ""}`.replace(/\b\w/g, (char) =>
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
      field: "unit",
      headerName: "Unit",
      flex: 2,
      minWidth: 200,
      valueGetter: (value: any, row: any) => `${row?.unitName || ""}`,
    },
    {
      field: "activityTypeDescription",
      headerName: "Activity Type ",
      flex: 2,
      minWidth: 200,
      valueGetter: (value: any, row: any) =>
        `${row?.activityTypeDescription || ""}`,
    },
    {
      field: "isActive",
      headerName: "Status",
      flex: 2,
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
        </Box>
      ),
    },
  ];
  const handleClickOpen = () => {
    setOpen(true);
    setEditFlag(false);
    setActivityInput({
      ...activityInput,
      activityName: "",
      description: "",
      estimatedDuration: 0,
    });
    setError([]);
    selectedDepartment && setSelectedDepartment(null);
    selectedActivityType && setSelectedActivityType(null);
    selectedMachineGroup && setSelectedMachineGroup([]);
  };
  const handleClose = () => {
    setOpen(false);
    // setMachinegroupInput({ ...machinegroupInput, groupName: "" });
    setEditFlag(false);
    setError([]);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let { name, value } = e.target;
    setActivityInput({ ...activityInput, [name]: value });
    setError([]);
  };
  const handleSwitch = (e: React.ChangeEvent<HTMLInputElement>) => {
    let { checked } = e.target;
    checked
      ? setActivityInput({ ...activityInput, isActive: 1 })
      : setActivityInput({ ...activityInput, isActive: 0 });
  };

  const handleDepartmentChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    value: any,
    field: string
  ) => {
    if (field === "deptName") {
      if (!value?.id) {
        setSelectedDepartment(null);
        setActivityInput((prev) => ({ ...prev, deptName: 0 }));
      } else {
        setSelectedDepartment(value);
        setActivityInput((prev) => ({ ...prev, deptName: value.id }));
        // GetDepartment();
      }
    }
  };

  const handleactivitytypeChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    value: any,
    field: string
  ) => {
    if (field === "activityName") {
      if (!value) {
        setSelectedActivityType(null);
        setActivityInput((prev) => ({ ...prev, activitytype: 0 }));
      } else {
        setSelectedActivityType(value);
        setActivityInput((prev) => ({ ...prev, activitytype: value.id }));
      }
    }
  };
  const handleMachineGroupChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    value: any[],
    field: string
  ) => {
    if (field === "groupName") {
      setSelectedMachineGroup(value);
      setActivityInput((prev) => ({
        ...prev,
        machineGroup: value.map((item) => item.id), // Store array of ids
      }));
    }
  };

  const handleSubmit = (e: React.MouseEvent<HTMLButtonElement>) => {
    let temp: string[] = [];
    Object.entries(activityInput).map(([key, value]) => {
      if (
        key === "activityName" &&
        typeof value == "string" &&
        value?.length == 0
      ) {
        temp.push(key);
      } else if (
        key === "description" &&
        typeof value == "string" &&
        value?.length == 0
      ) {
        temp.push(key);
      } else if (
        key === "estimatedDuration" &&
        (value === 0 || value.toString().length < 1)
      ) {
        temp.push(key);
      }
    });

    if (selectedDepartment === null) {
      temp.push("departmentId");
    }
    if (selectedActivityType === null) {
      temp.push("activityType");
    }
    if (!selectedMachineGroup.some((item) => item)) {
      temp.push("machineGroup");
    }

    setError(temp);

    if (temp.length === 0) {
      if (editFlag) {
        UpdateActivity();
      } else {
        AddActivty();
      }
    } else {
      toast.error("Please fill all mandatory fields.");
    }
  };

  const AddActivty = async () => {
    try {
      const body: any = {
        createActivityMasterDto: {
          activityName: activityInput.activityName
            ?.trim()
            .replace(/\b\w/g, (char: any) => char.toUpperCase()),
          description: activityInput.description?.trim(),
          departmentId: selectedDepartment?.id,
          unitId: userValue.unitId,
          estimatedDuration: activityInput.estimatedDuration,
          activityType: selectedActivityType?.id,
          activityMachineGroup:
            Array.isArray(selectedMachineGroup) &&
            selectedMachineGroup.length > 0
              ? selectedMachineGroup.map((group) => ({
                  machineGroupId: group?.id,
                }))
              : [],
        },
      };
      if (editFlag) {
        body.id = Number(activityInput.id);
      }
      const { endpoint, method } = Config.ActivityMaster.AddActivety;
      const response = await Apirequest(endpoint, method, body, "main").then(
        (res) => res.data
      );
      if (response.statusCode === 200 || response.statusCode === 201) {
        toast.success(response.message);
        setOpen(false);
        setEditFlag(false);
        GetActivityList();
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

  const UpdateActivity = async () => {
    try {
      const body: any = {
        updateActivityMaster: {
          activityId: activityInput.id,
          activityName: activityInput.activityName
            ?.trim()
            .replace(/\b\w/g, (char: any) => char.toUpperCase()),
          description: activityInput.description?.trim(),
          isActive: activityInput.isActive,
          departmentId: selectedDepartment?.id ?? 0,
          estimatedDuration: activityInput.estimatedDuration,
          activityType: selectedActivityType?.id ?? 0,
          unitId: userValue.unitId,
          updateActivityMachineGroup:
            Array.isArray(selectedMachineGroup) &&
            selectedMachineGroup.length > 0
              ? selectedMachineGroup.map((group) => ({
                  activityMasterId: activityInput.id,
                  machineGroupId: group?.id,
                }))
              : [],
        },
      };

      const { endpoint, method } = Config.ActivityMaster.UpdateActivety;
      const response = await Apirequest(endpoint, method, body, "main").then(
        (res) => res.data
      );

      if (response.statusCode === 200 || response.statusCode === 201) {
        toast.success(response.message);
        setOpen(false);
        setEditFlag(false);
        GetActivityList();
      } else {
        toast.error(response.message);
        if (Array.isArray(response.errors) && response.errors.length > 0) {
          setErrorModalOpen(true);
          setErrorMessages(response.errors);
        }
      }
    } catch (err) {
      console.error("Error updating activity:", err);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };
  const handleEdit = (row: any) => {
    setEditFlag(true);
    setOpen(true);

    departmentData?.map((item: any) => {
      if (item.id === row?.departmentId) {
        setSelectedDepartment(item);
      }
    });
    setSelectedActivityType(
      activityType.find((item: any) => item.id === row.activityType)
    );
    GetOverallActivityList(row.id);
  };

  const GetActivityList = async () => {
    try {
      const response = await Apirequest(
        MainConfig.ActivityMaster.GetActivity.endpoint
          .replace("{page}", page.toString())
          .replace("{size}", size.toString())
          .replace("{searchTerm}", search),
        MainConfig.ActivityMaster.GetActivity.method,
        null,
        "main"
      ).then((res) => res.data);
      const { totalCount, statusCode, data } = response;
      if (statusCode === 200 || statusCode === 201) {
        setActivityData(data);
        setLoading(false);
        setCount(totalCount);
      } else {
        setCount(0);
        setActivityData([]);
        setLoading(false);
      }
    } catch (err) {
      console.log(err);
      setActivityData([]);
    }
  };

  React.useEffect(() => {
    initFlag && search !== "" ? GetActivityList() : GetActivityList();
  }, [debouncedSearchTerm, page, size]);

  const { data: departmentData } = useDataFetchHook(
    config.Department.getGroupName.endpoint.replace("{name}", "maintenance"),
    config.Department.getGroupName.method
  );

  const { data: activityType } = useDataFetchHook(
    MainConfig.ActivityMaster.ActivityType.endpoint.replace(
      "{type}",
      "ActivityType"
    ),
    MainConfig.ActivityMaster.ActivityType.method,
    "main"
  );
  const { data: machineGroupDate, loading: machineGroupLoading } =
    useDataFetchHook(
      MainConfig.Machine.MachineGroupByName.endpoint,
      MainConfig.Machine.MachineGroupByName.method,
      "main"
    );

  const GetOverallActivityList = async (id: number) => {
    try {
      const { endpoint, method } = ConfigMain.ActivityMaster.GetMachineGroup;
      const result = await Apirequest(
        endpoint.replace("{id}", id?.toString() ?? id),
        method,
        null,
        "main"
      ).then((res) => res.data);

      setActivityInput({
        ...activityInput,
        activityName: result.data?.activityName ?? "",
        description: result.data?.description ?? "",
        departmentId: result.data?.departmentId ?? 0,
        estimatedDuration: result.data?.estimatedDuration ?? 0,
        id: result.data?.id ?? 0,
        activityType: result.data?.activityType ?? 0,
        isActive: result.data?.isActive,
      });

      const getuserDepartmentIds =
        result.data?.getAllMachineGroupDto?.map(
          (item: any) => item.machineGroupId
        ) ?? [];

      const selectedGroups =
        machineGroupDate?.filter((group: any) =>
          getuserDepartmentIds.includes(group.id)
        ) ?? [];

      setSelectedMachineGroup(selectedGroups);
    } catch (err) {
      console.error("Error fetching data:", err);
    }
  };

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
            child=" Activity Master"
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
            rows={activityData || []}
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
      <ErrorModal
        open={errorModalOpen}
        onClose={() => setErrorModalOpen(false)}
        errors={errorMessages}
      />

      <CreateActivityMaster
        open={open}
        close={handleClose}
        handleSubmit={handleSubmit}
        handleChange={handleChange}
        error={error}
        handleSwitch={handleSwitch}
        handleDepartmentChange={handleDepartmentChange}
        selectedDepartment={selectedDepartment}
        departmentData={departmentData}
        handleactivitytypeChange={handleactivitytypeChange}
        selectedActivityType={selectedActivityType}
        activityinput={activityInput}
        activityType={activityType}
        handleMachineGroupChange={handleMachineGroupChange}
        selectedMachineGroup={selectedMachineGroup}
        machineGroupData={machineGroupDate}
        editFlag={editFlag}
      />
    </>
  );
}

export default ActivityMasterPage;
