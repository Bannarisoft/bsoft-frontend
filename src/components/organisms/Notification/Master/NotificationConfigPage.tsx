"use client";

import { Box } from "@mui/material";
import React, { useEffect, useState } from "react";
import { MuiButton, MuiTable } from "bsoft-base-elements";
import { GoPlus } from "react-icons/go";
import { FiEdit } from "react-icons/fi";
import { RiDeleteBin6Line } from "react-icons/ri";
import dayjs from "dayjs";
import { usePrivilegeCheck } from "../../../../hooks/usePrivilegeCheck";
import { useDebounce } from "../../../../hooks/useDebounceHook";
import IconBreadcrumbs from "../../../molecules/AdminLayout/BreadCrumbs";
import GlobalSearch from "../../../molecules/AdminLayout/GlobalSearch";
import ErrorModal from "../../../molecules/Master/Role/ErrorModal";
import DeleteConfirmation from "../../../molecules/Master/DeleteConfirmation";
import NoDataFound from "../../../molecules/AdminLayout/NoDataFound";
import { NotificationProps } from  "../../../../types/types";
import CreateNotificationConfig from "../../../molecules/Notification/Master/CreateNotificationConfig";
import { Apirequest } from "../../../../utils/lib";
import Config from "../../../../utils/config.api.json";
import { useDataFetchHook } from "../../../../hooks/useDataFetchHook";
import toast from "react-hot-toast";
import SkeletonLoader from "../../../molecules/AdminLayout/SkeletonLoader";

const NotificationConfig = () => {
  const [pathname, setPathName] = useState<string>("");
  const permissions = usePrivilegeCheck(pathname);
  const [page, setPage] = React.useState<number>(1);
  const [size, setSize] = React.useState<number>(15);
  const [search, setSearch] = React.useState("");
  const debouncedSearchTerm = useDebounce(search, 500);
  const [loading, setLoading] = React.useState(true);
  const [notificationConfigData, setNotificationConfigData] = React.useState<
    any[]
  >([]);
  const [count, setCount] = React.useState<number>(0);
  const [initFlag, setInitFlag] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const [notificationInput, setNotificationInput] =
    React.useState<NotificationProps>({
      moduleName: "",
      notificationEventTypeId: 0,
      id: 0,
      isActive: 1,
    });
  const [errorModalOpen, setErrorModalOpen] = React.useState(false);
  const [errorMessages, setErrorMessages] = React.useState<string[]>([]);
  const [editFlag, setEditFlag] = React.useState(false);
  const [error, setError] = React.useState<any[]>([]);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [selectedValue, setSelectedValue] = React.useState<any>(null);

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
      field: "module_Name",
      headerName: "Module Name",
      flex: 1,
      minWidth: 200,
      valueGetter: (value: any, row: any) =>
        `${row?.moduleName || ""}`.replace(/\b\w/g, (char) =>
          char.toUpperCase()
        ),
    },
    {
      field: "code",
      headerName: "Event Type",
      flex: 1,
      minWidth: 200,
      valueGetter: (value: any, row: any) =>
        `${row?.code || ""}`.replace(/\b\w/g, (char) => char.toUpperCase()),
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
  useEffect(() => {
    setInitFlag(true);
    const currentPath = window.location.pathname.split("/bsoft").at(-1) || "";
    setPathName(currentPath);
  }, []);

  const GetNotificationConfigList = async () => {
    try {
      const { endpoint, method } = Config.Notification.NotificationConfig;
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
      setNotificationConfigData(result.data);
      setCount(result.totalCount);
    } catch (err) {
      console.log(err);
      setLoading(false);
    }
  };
  useEffect(() => {
    initFlag && search !== ""
      ? GetNotificationConfigList()
      : GetNotificationConfigList();
  }, [debouncedSearchTerm, page, size]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };
  const handleClose = () => {
    setOpen(false);
    setNotificationInput({ ...notificationInput, moduleName: "" });
    setEditFlag(false);
    setSelectedValue(null);
    setError([]);
  };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNotificationInput({ ...notificationInput, [name]: value });
    setError([]);
  };
  const handleSubmit = (e: React.MouseEvent<HTMLButtonElement>) => {
    let temp: any = [];
    Object.entries(notificationInput).map(([key, value]) => {
      if (key === "moduleName" && value?.length == 0) {
        temp.push(key);
      }
    });
    if (selectedValue === null) {
      temp.push("notificationEventTypeId");
    }

    setError(temp);
    if (temp.length === 0 && editFlag) {
      UpdateNotificationConfig();
    } else {
      if (temp.length === 0) {
        AddNotificationConfig();
        setLoading(true);
      }
    }
  };

  const AddNotificationConfig = async () => {
    try {
      const body: any = {
        moduleName: notificationInput.moduleName?.trim(),
        notificationEventTypeId: selectedValue.notificationEventTypeId?.id,
      };

      if (editFlag) {
        body.id = Number(notificationInput.id);
      }
      const { endpoint, method } =
        Config.Notification.NotificationConfig.AddNotificationConfig;
      const response = await Apirequest(endpoint, method, body, "bg").then(
        (res) => res.data
      );

      if (response.statusCode === 200 || response.statusCode === 201) {
        toast.success(response.message);
        setOpen(false);
        setEditFlag(false);
        setNotificationInput({ ...notificationInput });
        GetNotificationConfigList();
      } else {
        toast.error(response.message);
        if (Array.isArray(response.errors) && response.errors.length > 0) {
          setErrorModalOpen(true);
          setErrorMessages(response.errors);
          setOpen(false);
          setLoading(false);
        }
      }
    } catch (err) {
      console.log(err);
    }
  };
  const UpdateNotificationConfig = async () => {
    try {
      const body: any = {
        moduleName: notificationInput.moduleName?.trim(),
        notificationEventTypeId: selectedValue.notificationEventTypeId?.id,
        id: notificationInput.id,
        isActive: notificationInput.isActive,
      };

      if (editFlag) {
        body.id = Number(notificationInput.id);
      }
      const { endpoint, method } =
        Config.Notification.NotificationConfig.UpdateNotificationConfig;
      const response = await Apirequest(endpoint, method, body, "bg").then(
        (res) => res.data
      );

      if (response.statusCode === 200 || response.statusCode === 201) {
        toast.success(response.message);
        setOpen(false);
        setEditFlag(false);
        setNotificationInput({ ...notificationInput });
        GetNotificationConfigList();
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

  const handleSwitch = (e: React.ChangeEvent<HTMLInputElement>) => {
    let { checked } = e.target;
    checked
      ? setNotificationInput({ ...notificationInput, isActive: 1 })
      : setNotificationInput({ ...notificationInput, isActive: 0 });
  };
  const handleClickOpen = () => {
    setOpen(true);
    setSelectedValue(null);
    setNotificationInput({
      ...notificationInput,
      moduleName: "",
      isActive: 1,
    });
  };
  const handleEdit = (row: any) => {
    setEditFlag(true);
    setOpen(true);
    setNotificationInput({
      ...notificationInput,
      moduleName: row?.moduleName,
      id: row?.id,
      isActive: row?.isActive,
    });

    const selectedNotificationType = NotificationType.find(
      (item: any) => item.id === row.notificationEventTypeId
    );

    setSelectedValue({
      notificationEventTypeId: selectedNotificationType || null,
    });
  };
  const handleDelete = (id: number) => {
    setNotificationInput({ ...notificationInput, id: id });
    setDeleteOpen(true);
  };
  const { data: NotificationType } = useDataFetchHook(
    Config.Workflow.Misc.endpoint.replace("{type}", "EventType"),
    Config.Workflow.Misc.method,
    "bg"
  );
  const handleAutocomplete = (
    name: string,
    value: { id: number; label: string } | null
  ) => {
    setError((prev) => prev.filter((e) => e !== name));
    setSelectedValue((prev: any) => ({
      ...prev,
      [name]: value,
    }));

    setNotificationInput((prev) => ({
      ...prev,
      [name]: value ? value.id : 0,
    }));
  };

  const DeleteConfig = async () => {
    try {
      const body = {
        id: notificationInput.id,
      };
      const { endpoint, method } =
        Config.Notification.NotificationConfig.DeleteNotificationConfig;
      const response = await Apirequest(
        endpoint.replace("{id}", `${notificationInput.id}`),
        method,
        body,
        "bg"
      ).then((res) => res.data);

      if (response.statusCode === 200 || response.statusCode === 201) {
        toast.success(response.message);
        setOpen(false);
        setEditFlag(false);
        GetNotificationConfigList();
      } else {
        toast.error(response.message);
        if (Array.isArray(response.errors) && response.errors.length > 0) {
          setErrorModalOpen(true);
          setErrorMessages(response.errors);
        }
      }
    } catch (err) {
      console.log(err);
      GetNotificationConfigList();
    }
  };

  const handleConfirmDelete = async () => {
    DeleteConfig();
    setDeleteOpen(false);
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
            child={"Notification Config"}
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
            placeholder="search notification"
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
            rows={notificationConfigData}
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
      <CreateNotificationConfig
        open={open}
        close={handleClose}
        notificationInput={notificationInput}
        handleSubmit={handleSubmit}
        handleChange={handleChange}
        error={error}
        handleSwitch={handleSwitch}
        NotificationType={NotificationType}
        handleAutocomplete={handleAutocomplete}
        selectedValue={selectedValue}
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

export default NotificationConfig;
