"use client";

import { Box } from "@mui/material";
import React, { useEffect, useState } from "react";
import IconBreadcrumbs from "../../../molecules/AdminLayout/BreadCrumbs";
import GlobalSearch from "../../../molecules/AdminLayout/GlobalSearch";
import { MuiButton, MuiTable } from "bsoft-base-elements";
import { GoPlus } from "react-icons/go";
import NoDataFound from "../../../molecules/AdminLayout/NoDataFound";
import { FiEdit } from "react-icons/fi";
import dayjs from "dayjs";
import { GroupMembersProps } from  "../../../../types/types";
import CreateNotificationMember from "../../../molecules/Notification/Master/CreateNotificationMember";
import { useDataFetchHook } from "../../../../hooks/useDataFetchHook";
import Config from "../../../../utils/config.api.json";
import ErrorModal from "../../../molecules/Master/Role/ErrorModal";
import { useDebounce } from "../../../../hooks/useDebounceHook";
import { Apirequest } from "../../../../utils/lib";
import toast from "react-hot-toast";
import SkeletonLoader from "../../../molecules/AdminLayout/SkeletonLoader";
import { usePrivilegeCheck } from "../../../../hooks/usePrivilegeCheck";
const NotificationGroupMembersPage = () => {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [page, setPage] = React.useState<number>(1);
  const [size, setSize] = React.useState<number>(15);
  const [initFlag, setInitFlag] = React.useState(false);
  const debouncedSearchTerm = useDebounce(search, 500);
  const [notificationGroupMembersData, setNotificationGroupMembersData] =
    React.useState<any[]>([]);
  const [count, setCount] = React.useState<number>(0);
  const [editFlag, setEditFlag] = React.useState(false);
  const [error, setError] = React.useState<any[]>([]);
  const [errorModalOpen, setErrorModalOpen] = React.useState(false);
  const [errorMessages, setErrorMessages] = React.useState<string[]>([]);
  const [selectedValues, setSelectedValues] = useState<{
    groupId: any | null;
    userId: any | null;
  }>({
    groupId: null,
    userId: [],
  });
  const [loading, setLoading] = React.useState(true);
  const [pathname, setPathName] = useState<string>("");
  const permissions = usePrivilegeCheck(pathname);
  const [groupMemberInput, setGroupMemberInput] =
    React.useState<GroupMembersProps>({
      groupId: 0,
      userId: [],
      id: 0,
      isActive: 1,
    });
  const handleSwitch = (e: React.ChangeEvent<HTMLInputElement>) => {
    let { checked } = e.target;
    checked
      ? setGroupMemberInput({
          ...groupMemberInput,
          isActive: 1,
        })
      : setGroupMemberInput({
          ...groupMemberInput,
          isActive: 0,
        });
  };
  const handleEdit = (row: any) => {
    setEditFlag(true);
    setOpen(true);

    const userIds = row?.users?.map((u: any) => u.userId) || [];

    setGroupMemberInput({
      ...groupMemberInput,
      id: row?.id,
      groupId: row?.groupId,
      userId: userIds,
      isActive: row?.isActive,
    });

    const selectedGroup = groupData.find(
      (item: any) => item.id === row.groupId
    );

    const selectedUsers = userData.filter((user: any) =>
      userIds.includes(user.userId)
    );

    setSelectedValues({
      groupId: selectedGroup || null,
      userId: selectedUsers,
    });

    console.log("SelectedValues:", {
      groupId: selectedGroup || null,
      userId: selectedUsers,
    });
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
      field: "groupName",
      headerName: "Group Name",
      flex: 1,
      minWidth: 200,
      valueGetter: (value: any, row: any) =>
        `${row?.groupName || ""}`.replace(/\b\w/g, (char) =>
          char.toUpperCase()
        ),
    },
    {
      field: "userName",
      headerName: "User Name",
      flex: 2,
      minWidth: 200,
      valueGetter: (value: any, row: any) =>
        row?.users
          ?.map((user: any) => user?.userName)
          .filter(Boolean)
          .join(", ") || "",
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
      flex: 1,
      minWidth: 200,
      valueGetter: (value: any, row: any) =>
        `${dayjs(row?.createdDate).format("DD-MM-YYYY")}`,
    },
    {
      field: "actions",
      headerName: "Actions",
      flex: 1,
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
          <FiEdit
            fontSize={20}
            color="black"
            cursor={"pointer"}
            onClick={() => handleEdit(params.row)}
          />
        </Box>
      ),
    },
  ];

  const GetNotificationGroupMemberList = async () => {
    try {
      const { endpoint, method } = Config.Notification.NotificationGroupMember;
      const result = await Apirequest(
        endpoint
          .replace("{page}", page.toString())
          .replace("{size}", size.toString())
          .replace("{searchTerm}", search),
        method,
        null,
        "bg"
      ).then((res) => res.data);
      setLoading(false);
      setNotificationGroupMembersData(result.data);
      setCount(result.totalCount);
    } catch (err) {
      console.log(err);
      setLoading(false);
    }
  };
  useEffect(() => {
    initFlag && search !== ""
      ? GetNotificationGroupMemberList()
      : GetNotificationGroupMemberList();
  }, [debouncedSearchTerm, page, size]);
  useEffect(() => {
    setInitFlag(true);
    const currentPath = window.location.pathname.split("/bsoft").at(-1) || "";
    setPathName(currentPath);
  }, []);
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };
  const handleClickOpen = () => {
    setOpen(true);
    setGroupMemberInput({
      ...groupMemberInput,
      id: 0,
      isActive: 1,
    });
  };
  const handleClose = () => {
    setOpen(false);
    setSelectedValues({
      groupId: 0,
      userId: [],
    });
    setEditFlag(false);
    setError([]);
  };
  const { data: groupData } = useDataFetchHook(
    Config.Notification.NotificationGroup.GetByNotificationGroup.endpoint,
    Config.Notification.NotificationGroup.GetByNotificationGroup.method,
    "bg"
  );
  const { data: userData } = useDataFetchHook(
    Config.User.getByuser.endpoint,
    Config.User.getByuser.method
  );
  const handleAutocompleteChange = (
    e: React.SyntheticEvent | React.ChangeEvent<HTMLInputElement>,
    value: any[] | any | null,
    field: string
  ) => {
    setError([]);

    switch (field) {
      case "groupId":
        if (!value) {
          setSelectedValues((prev) => ({ ...prev, groupId: null }));
          setGroupMemberInput((prev) => ({ ...prev, groupId: 0 }));
        } else {
          setSelectedValues((prev) => ({ ...prev, groupId: value }));
          setGroupMemberInput((prev) => ({ ...prev, groupId: value.id }));
        }
        break;

      case "userId":
        if (!value || value.length === 0) {
          setSelectedValues((prev) => ({ ...prev, userId: [] }));
          setGroupMemberInput((prev) => ({ ...prev, userId: [] }));
        } else {
          setSelectedValues((prev) => ({ ...prev, userId: value }));
          setGroupMemberInput((prev) => ({
            ...prev,
            userId: value.map((v: any) => v.id),
          }));
        }
        break;
    }
  };

  const handleSubmit = (e: React.MouseEvent<HTMLButtonElement>) => {
    let temp: string[] = [];

    if (!groupMemberInput.groupId || groupMemberInput.groupId === 0) {
      temp.push("groupId");
    }

    if (!groupMemberInput.userId || groupMemberInput.userId.length === 0) {
      temp.push("userId");
    }
    setError(temp);
    if (temp.length === 0) {
      setLoading(true);
      if (editFlag) {
        UpdateNotificationGrouMember();
      } else {
        AddNotificationGroupMember();
      }
    }
  };
  const AddNotificationGroupMember = async () => {
    try {
      const body = {
        groupId: selectedValues.groupId?.id || 0,
        userIds: selectedValues.userId.map((user: any) => user.userId),
      };

      const { endpoint, method } =
        Config.Notification.NotificationGroupMember.AddNotificationGroupMember;

      const response = await Apirequest(endpoint, method, body, "bg").then(
        (res) => res.data
      );

      if (response.statusCode === 200 || response.statusCode === 201) {
        toast.success(response.message);
        setOpen(false);
        setEditFlag(false);
        setSelectedValues({ groupId: 0, userId: [] });
        GetNotificationGroupMemberList();
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
      setLoading(false);
    }
  };
  const UpdateNotificationGrouMember = async () => {
    try {
      const body: any = {
        groupId: selectedValues.groupId?.id || 0,
        isActive: groupMemberInput.isActive,
        userIds: selectedValues.userId
          .filter(
            (user: any) =>
              user && user.userId !== null && user.userId !== undefined
          )
          .map((user: any) => user.userId),
      };

      const { endpoint, method } =
        Config.Notification.NotificationGroupMember
          .UpdateNotificationGroupMember;

      const response = await Apirequest(endpoint, method, body, "bg").then(
        (res) => res.data
      );

      if (response.statusCode === 200 || response.statusCode === 201) {
        toast.success(response.message);
        setOpen(false);
        setEditFlag(false);
        setSelectedValues({ groupId: null, userId: [] });
        GetNotificationGroupMemberList();
      } else {
        toast.error(response.message);
        if (Array.isArray(response.errors) && response.errors.length > 0) {
          setErrorModalOpen(true);
          setErrorMessages(response.errors);
          setEditFlag(false);
        }
        setOpen(false);
        setLoading(false);
      }
    } catch (err) {
      console.log(err);
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
      >
        <Box>
          <IconBreadcrumbs
            parent={"Notification"}
            child={"Notification Group Members"}
            path=""
          />
        </Box>
        <Box
          display={"flex"}
          justifyContent={"space-between"}
          alignItems={"center"}
          flexWrap={"wrap"}
          gap={2}
        >
          <GlobalSearch
            placeholder="search group members"
            width={300}
            onChange={handleSearch}
          />
          <Box className="d-flex-center" gap={2}>
            {/* {permissions.canAdd && ( */}
            <MuiButton
              startIcon={<GoPlus />}
              onClick={handleClickOpen}
              variant="contained"
            >
              Create
            </MuiButton>
            {/* )} */}
          </Box>
        </Box>
      </Box>

      <Box sx={{ width: "100%", my: 2, height: 700 }} className="main-table">
        {loading ? (
          <SkeletonLoader />
        ) : (
          <MuiTable
            rows={notificationGroupMembersData}
            getRowId={(row) => row.groupId}
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
            pageSizeOptions={[15, 30, 50]}
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
      <CreateNotificationMember
        open={open}
        close={handleClose}
        groupMemberInput={groupMemberInput}
        error={error}
        editFlag={editFlag}
        selectedValues={selectedValues}
        handleAutocompleteChange={handleAutocompleteChange}
        groupData={groupData}
        userData={userData}
        handleSubmit={handleSubmit}
        handleSwitch={handleSwitch}
      />
      <ErrorModal
        open={errorModalOpen}
        onClose={() => setErrorModalOpen(false)}
        errors={errorMessages}
      />
    </>
  );
};

export default NotificationGroupMembersPage;
