"use client";

import { Box } from "@mui/material";
import React, { useEffect, useState } from "react";

import { MuiButton, MuiTable } from "bsoft-base-elements";
import { GoPlus } from "react-icons/go";
import Config from "../../../../utils/config.api.json";
import { FiEdit } from "react-icons/fi";
import { RiDeleteBin6Line } from "react-icons/ri";
import dayjs from "dayjs";
import { useDebounce } from "../../../../hooks/useDebounceHook";
import IconBreadcrumbs from "../../../molecules/AdminLayout/BreadCrumbs";
import GlobalSearch from "../../../molecules/AdminLayout/GlobalSearch";
import ErrorModal from "../../../molecules/Master/Role/ErrorModal";
import DeleteConfirmation from "../../../molecules/Master/DeleteConfirmation";
import NoDataFound from "../../../molecules/AdminLayout/NoDataFound";
import { NotificationGroupProps } from  "../../../../types/types";
import CreateNotificationGroup from "../../../molecules/Notification/Master/CreateNotificationGroup";
import { Apirequest } from "../../../../utils/lib";
import toast from "react-hot-toast";
import SkeletonLoader from "../../../molecules/AdminLayout/SkeletonLoader";
const NotificationGroupPage = () => {
  const [search, setSearch] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const [page, setPage] = React.useState<number>(1);
  const [size, setSize] = React.useState<number>(15);
  const [editFlag, setEditFlag] = React.useState(false);
  const [count, setCount] = React.useState<number>(0);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [initFlag, setInitFlag] = React.useState(false);
  const debouncedSearchTerm = useDebounce(search, 500);
  const [error, setError] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [errorModalOpen, setErrorModalOpen] = React.useState(false);
  const [errorMessages, setErrorMessages] = React.useState<string[]>([]);
  const [notificationGroupInput, setNotificationGroupInput] =
    React.useState<NotificationGroupProps>({
      groupName: "",
      id: 0,
      isActive: 1,
    });
  const [notificationGroupData, setNotificationGroupData] = React.useState<
    any[]
  >([]);
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
      flex: 2,
      minWidth: 200,
      valueGetter: (value: any, row: any) =>
        `${row?.groupName.toUpperCase() || ""}`,
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
      field: "createdByName",
      headerName: "Created By",
      sortable: true,
      flex: 1,
      minWidth: 150,
      valueGetter: (value: any, row: any) => `${row?.createdByName ?? ""}`,
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
          {/* {permissions.canUpdate && ( */}
          <FiEdit
            fontSize={20}
            color="black"
            cursor={"pointer"}
            onClick={() => handleEdit(params.row)}
          />
          {/* )} */}
          {/* {permissions.canDelete && ( */}
          <RiDeleteBin6Line
            fontSize={20}
            color="red"
            cursor={"pointer"}
            onClick={() => handleDelete(params.row.id)}
          />
          {/* )} */}
        </Box>
      ),
    },
  ];
  const GetNotificationGroupList = async () => {
    try {
      const { endpoint, method } = Config.Notification.NotificationGroup;
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
      setNotificationGroupData(result.data);
      setCount(result.totalCount);
    } catch (err) {
      console.log(err);
      setLoading(false);
    }
  };
  useEffect(() => {
    initFlag && search !== ""
      ? GetNotificationGroupList()
      : GetNotificationGroupList();
  }, [debouncedSearchTerm, page, size]);
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };
  const handleClickOpen = () => {
    setOpen(true);
    setNotificationGroupInput({ ...notificationGroupInput, groupName: "" });
  };
  const handleEdit = (row: any) => {
    setEditFlag(true);
    setOpen(true);
    setNotificationGroupInput({
      groupName: row?.groupName,
      id: row?.id,
      isActive: row?.isActive,
    });
  };

  const DeleteNotificationGroup = async () => {
    try {
      const body = {
        id: notificationGroupInput.id,
      };
      const { endpoint, method } =
        Config.Notification.NotificationGroup.DeleteNotificationGroup;
      const response = await Apirequest(
        endpoint.replace("{id}", `${notificationGroupInput.id}`),
        method,
        body,
        "bg"
      ).then((res) => res.data);

      if (response.statusCode === 200 || response.statusCode === 201) {
        toast.success(response.message);
        setOpen(false);
        setEditFlag(false);
        GetNotificationGroupList();
      } else {
        toast.error(response.message);
        if (Array.isArray(response.errors) && response.errors.length > 0) {
          setErrorModalOpen(true);
          setErrorMessages(response.errors);
        }
      }
    } catch (err) {
      console.log(err);
      GetNotificationGroupList();
    }
  };
  const handleDelete = (id: number) => {
    setNotificationGroupInput({ ...notificationGroupInput, id: id });
    setDeleteOpen(true);
  };
  const handleConfirmDelete = async () => {
    DeleteNotificationGroup();
    setDeleteOpen(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNotificationGroupInput({
      ...notificationGroupInput,
      [name]: value,
    });
    setError([]);
  };
  const handleClose = () => {
    setOpen(false);
    setNotificationGroupInput({ ...notificationGroupInput, groupName: "" });
    setEditFlag(false);
    setError([]);
  };
  const handleSwitch = (e: React.ChangeEvent<HTMLInputElement>) => {
    let { checked } = e.target;
    checked
      ? setNotificationGroupInput({ ...notificationGroupInput, isActive: 1 })
      : setNotificationGroupInput({ ...notificationGroupInput, isActive: 0 });
  };
  const handleSubmit = (e: React.MouseEvent<HTMLButtonElement>) => {
    let temp: any = [];
    Object.entries(notificationGroupInput).map(([key, value]) => {
      if (key === "groupName" && value?.length == 0) {
        temp.push(key);
      }
    });
    setError(temp);
    if (temp.length === 0 && editFlag) {
      UpdateNotificationGroup();
    } else {
      if (temp.length === 0) {
        AddNotificationGroup();
        setLoading(true);
      }
    }
  };

  const AddNotificationGroup = async () => {
    try {
      const body: any = {
        groupName: notificationGroupInput.groupName
          ?.trim()
          .replace(/\b\w/g, (char: any) => char.toUpperCase()),
      };

      if (editFlag) {
        body.id = Number(notificationGroupInput.id);
      }
      const { endpoint, method } =
        Config.Notification.NotificationGroup.AddNotificationGroup;
      const response = await Apirequest(endpoint, method, body, "bg").then(
        (res) => res.data
      );

      if (response.statusCode === 200 || response.statusCode === 201) {
        toast.success(response.message);
        setOpen(false);
        setEditFlag(false);
        setNotificationGroupInput({ ...notificationGroupInput });
        GetNotificationGroupList();
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

  const UpdateNotificationGroup = async () => {
    try {
      const body: any = {
        groupName: notificationGroupInput.groupName
          ?.trim()
          .replace(/\b\w/g, (char: any) => char.toUpperCase()),
        id: notificationGroupInput.id,
        isActive: notificationGroupInput.isActive,
      };

      const { endpoint, method } =
        Config.Notification.NotificationGroup.UpdateNotificationGroup;
      const response = await Apirequest(endpoint, method, body, "bg").then(
        (res) => res.data
      );
      if (response.statusCode === 200) {
        toast.success(response.message);
        setOpen(false);
        setNotificationGroupInput({ ...notificationGroupInput });
        setEditFlag(false);
        GetNotificationGroupList();
      } else {
        toast.error(response.message);
        if (Array.isArray(response.errors) && response.errors.length > 0) {
          setErrorModalOpen(true);
          setErrorMessages(response.errors);
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
            child={"Notification Group"}
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
            placeholder="search group"
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
            rows={notificationGroupData}
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
      <CreateNotificationGroup
        open={open}
        close={handleClose}
        notificationGroupInput={notificationGroupInput}
        handleSubmit={handleSubmit}
        handleChange={handleChange}
        error={error}
        handleSwitch={handleSwitch}
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

export default NotificationGroupPage;
