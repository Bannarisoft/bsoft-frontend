"use client";
import React, { useEffect, useState } from "react";
import { Box } from "@mui/material";
import IconBreadcrumbs from "../../molecules/AdminLayout/BreadCrumbs";
import GlobalSearch from "../../molecules/AdminLayout/GlobalSearch";
import { MuiButton, MuiTable } from "bsoft-base-elements";
import { GoPlus } from "react-icons/go";
import NoDataFound from "../../molecules/AdminLayout/NoDataFound";
import dayjs from "dayjs";
import { FiEdit } from "react-icons/fi";
import { checklistProps } from "../../../types/maintanenceTypes";
import { useDebounce } from "../../../hooks/useDebounceHook";
import { useDataFetchHook } from "../../../hooks/useDataFetchHook";
import MainConfig from "../../../utils/main.api.json";
import {
  Apirequest,
  isSubmitting,
  startLoading,
  stopLoading,
} from "../../../utils/lib";
import CreateActivityCheckList from "../../molecules/Maintanence/CreateActivityCheckList";
import SkeletonLoader from "../../molecules/AdminLayout/SkeletonLoader";
import ErrorModal from "../../molecules/Master/Role/ErrorModal";
import { usePrivilegeCheck } from "../../../hooks/usePrivilegeCheck";
import { useRecoilValue } from "recoil";
import { UserData } from "../../../utils/atoms";
import toast from "react-hot-toast";
const ActivityCheckListPage = () => {
  const [open, setOpen] = React.useState(false);
  const [ChickListData, setChickListData] = React.useState<any[]>([]);
  const [pathname, setPathName] = useState<string>("");
  const permissions = usePrivilegeCheck(pathname);

  useEffect(() => {
    setInitFlag(true);
    const currentPath = window.location.pathname.split("/bsoft").at(-1) || "";
    setPathName(currentPath);
  }, []);

  const [error, setError] = React.useState<any[]>([]);
  const [search, setSearch] = React.useState("");
  const [page, setPage] = React.useState<number>(1);
  const [size, setSize] = React.useState<number>(15);
  const [editFlag, setEditFlag] = React.useState(false);
  const [initFlag, setInitFlag] = React.useState(false);
  const debouncedSearchTerm = useDebounce(search, 500);
  const [errorModalOpen, setErrorModalOpen] = React.useState(false);
  const [errorMessages, setErrorMessages] = React.useState<string[]>([]);
  const [selectedActivity, setSelectedActivity] = useState<any>(null);
  const [loading, setLoading] = React.useState(false);
  const [count, setCount] = React.useState(0);
  const userValue = useRecoilValue(UserData);

  const [checkListInput, setcheckListInput] = React.useState<checklistProps>({
    activityCheckList: "",
    activityID: 0,
    checklistId: 0,
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
      field: "activityChecklist",
      headerName: "Activity Checklist",
      flex: 2,
      minWidth: 200,
      valueGetter: (value: any, row: any) => `${row?.activityChecklist || ""}`,
    },
    {
      field: "unit",
      headerName: "Unit",
      flex: 2,
      minWidth: 200,
      valueGetter: (value: any, row: any) => `${row?.unitName || ""}`,
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
        </Box>
      ),
    },
  ];
  const { data: activityDate, loading: activityLoading } = useDataFetchHook(
    MainConfig.ActivityMaster.GetMiscType.endpoint,
    MainConfig.ActivityMaster.GetMiscType.method,
    "main"
  );
  useEffect(() => {
    if (activityDate) {
    }
  }, [activityDate]);
  const handleActivityChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    value: any,
    field: string
  ) => {
    if (field === "activity") {
      if (!value?.id) {
        setSelectedActivity(null);
        setcheckListInput((prev) => ({ ...prev, activityName: 0 }));
      } else {
        setSelectedActivity(value);
        setcheckListInput((prev) => ({ ...prev, activityName: value.id }));
      }
    }
  };

  const handleClickOpen = () => {
    setOpen(true);
    setEditFlag(false);
    setcheckListInput({ ...checkListInput, activityCheckList: "" });
    setSelectedActivity(null);
    setError([]);
  };
  const handleClose = () => {
    setOpen(false);
    setcheckListInput({ ...checkListInput, activityCheckList: "" });
    setEditFlag(false);
    setError([]);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let { name, value } = e.target;
    setcheckListInput({ ...checkListInput, [name]: value });
    setError([]);
  };

  const AddCheckList = async () => {
    try {
      startLoading();
      const body: any = {
        activityID: selectedActivity.id,
        activityCheckList: checkListInput.activityCheckList
          ?.trim()
          .replace(/\b\w/g, (char: string) => char.toUpperCase()),
        isActive: checkListInput.isActive,
        unitId: userValue.unitId,
      };

      const { endpoint, method } =
        MainConfig.ActivityCheckListMaster.AddCheckList;
      const response = await Apirequest(endpoint, method, body, "main").then(
        (res) => res.data
      );

      if (response.statusCode === 200 || response.statusCode === 201) {
        toast.success(response.message);
        setOpen(false);
        setEditFlag(false);
        GetCheckList();
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

  const UpdateCheckList = async () => {
    try {
      startLoading();
      const body: any = {
        activityID: selectedActivity.id,
        activityCheckList: checkListInput.activityCheckList?.trim(),
        id: checkListInput.checklistId,
        isActive: checkListInput.isActive,
        unitId: userValue.unitId,
      };

      const { endpoint, method } =
        MainConfig.ActivityCheckListMaster.UpdateCheckList;
      const response = await Apirequest(endpoint, method, body, "main").then(
        (res) => res.data
      );

      if (response.statusCode === 200) {
        toast.success(response.message);
        setOpen(false);
        setEditFlag(false);
        GetCheckList();
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
  const handleSwitch = (e: React.ChangeEvent<HTMLInputElement>) => {
    let { checked } = e.target;
    checked
      ? setcheckListInput({ ...checkListInput, isActive: 1 })
      : setcheckListInput({ ...checkListInput, isActive: 0 });
  };

  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    if (isSubmitting()) return;

    let temp: string[] = [];

    Object.entries(checkListInput).forEach(([key, value]) => {
      if (key === "activityCheckList" && (!value || value.length === 0)) {
        temp.push(key);
      }
    });

    if (selectedActivity === null) {
      temp.push("activityId");
    }

    setError(temp);

    if (temp.length > 0) {
      toast.error("Please fill all mandatory fields.");
      return;
    }

    try {
      startLoading();

      if (editFlag) {
        await UpdateCheckList();
      } else {
        await AddCheckList();
      }
    } catch (error) {
      console.error("Error saving checklist:", error);
    } finally {
      stopLoading();
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const handleEdit = (row: any) => {
    setEditFlag(true);
    setOpen(true);
    const getactivity = activityDate.find(
      (i: { id: string }) => i.id === row.activityID
    );
    setSelectedActivity(getactivity);
    setcheckListInput({
      ...checkListInput,
      activityCheckList: row.activityChecklist,
      activityID: row.activityID,
      checklistId: row.checklistId,
    });
  };

  const GetCheckList = async () => {
    try {
      setLoading(true);
      const response = await Apirequest(
        MainConfig.ActivityCheckListMaster.GetCheckList.endpoint
          .replace("{page}", page.toString())
          .replace("{size}", size.toString())
          .replace("{searchTerm}", search),
        MainConfig.ActivityCheckListMaster.GetCheckList.method,
        null,
        "main"
      ).then((res) => res.data);
      const { totalCount, statusCode, data } = response;
      if (statusCode === 200 || statusCode === 201) {
        setCount(totalCount);
        setChickListData(data);
        setLoading(false);
      } else {
        setCount(0);
        setChickListData([]);
        setLoading(false);
      }
    } catch (err) {
      setLoading(false);
      console.log(err);
    }
  };

  React.useEffect(() => {
    initFlag && search !== "" ? GetCheckList() : GetCheckList();
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
            child="Activity CheckList"
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
            rows={ChickListData || []}
            columns={columns}
            getRowId={(row) => row.checklistId}
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
      <CreateActivityCheckList
        open={open}
        close={handleClose}
        handleSubmit={handleSubmit}
        handleChange={handleChange}
        error={error}
        checkListInput={checkListInput}
        handleSwitch={handleSwitch}
        handleActivityChange={handleActivityChange}
        selectedActivity={selectedActivity}
        activityDate={activityDate}
        editFlag={editFlag}
      />
    </>
  );
};

export default ActivityCheckListPage;
