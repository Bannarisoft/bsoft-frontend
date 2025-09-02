import { Box } from "@mui/material";
import React, { useEffect, useState } from "react";
import IconBreadcrumbs from "../../../molecules/AdminLayout/BreadCrumbs";
import GlobalSearch from "../../../molecules/AdminLayout/GlobalSearch";
import { MuiButton, MuiTable } from "bsoft-base-elements";
import { GoPlus } from "react-icons/go";
import dayjs from "dayjs";
import { FiEdit } from "react-icons/fi";
import { RiDeleteBin6Line } from "react-icons/ri";
import { NotificationTemplateProps } from  "../../../../types/types";
import NoDataFound from "../../../molecules/AdminLayout/NoDataFound";
import CreateNotificationTemplate from "../../../molecules/Notification/Master/CreateNotificationTemplate";
import ErrorModal from "../../../molecules/Master/Role/ErrorModal";
import DeleteConfirmation from "../../../molecules/Master/DeleteConfirmation";
import { Apirequest } from "../../../../utils/lib";
import { useDebounce } from "../../../../hooks/useDebounceHook";
import Config from "../../../../utils/config.api.json";
import { useDataFetchHook } from "../../../../hooks/useDataFetchHook";
import toast from "react-hot-toast";
import SkeletonLoader from "../../../molecules/AdminLayout/SkeletonLoader";

const NotificationTemplatePage = () => {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [page, setPage] = React.useState<number>(1);
  const [size, setSize] = React.useState<number>(15);
  const [editFlag, setEditFlag] = React.useState(false);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [count, setCount] = React.useState<number>(0);
  const debouncedSearchTerm = useDebounce(search, 500);
  const [initFlag, setInitFlag] = React.useState(false);
  const [notificationTempletData, setNotificationTempletData] = React.useState<
    any[]
  >([]);
  const [loading, setLoading] = React.useState(true);
  const [selectedValues, setSelectedValues] = useState<{
    [key: string]: any[];
  }>({});
  const [error, setError] = React.useState<any[]>([]);
  const [errorModalOpen, setErrorModalOpen] = React.useState(false);
  const [errorMessages, setErrorMessages] = React.useState<string[]>([]);
  const [notificationTemplateInput, setNotificationTempletInput] =
    React.useState<NotificationTemplateProps>({
      notificationTypeId: 0,
      notificationConfigId: 0,
      subjectTemplate: "",
      bodyTemplate: "",
      footerTemplate: "",
      languageCode: "",
      headerTemplate: "",
      id: 0,
      isActive: 1,
    });
  const columns = [
    {
      field: "s_no",
      headerName: "S.No",
      minWidth: 100,
      flex: 1,
      sortable: true,
      renderCell: (params: any) => {
        return (
          (page - 1) * size + (params.api.getAllRowIds().indexOf(params.id) + 1)
        );
      },
    },
    {
      field: "subjectTemplate",
      headerName: "Subject Template",
      flex: 2,
      minWidth: 200,
      valueGetter: (value: any, row: any) =>
        `${row?.subjectTemplate || ""}`.replace(/\b\w/g, (char) =>
          char.toUpperCase()
        ),
    },
    {
      field: "headerTemplate",
      headerName: "Header Template",
      flex: 2,
      minWidth: 200,
      valueGetter: (value: any, row: any) =>
        `${row?.headerTemplate || ""}`.replace(/\b\w/g, (char) =>
          char.toUpperCase()
        ),
    },
    {
      field: "bodyTemplate",
      headerName: "Body Template",
      flex: 2,
      minWidth: 200,
      valueGetter: (value: any, row: any) =>
        `${row?.bodyTemplate || ""}`.replace(/\b\w/g, (char) =>
          char.toUpperCase()
        ),
    },
    {
      field: "footerTemplate",
      headerName: "Footer Template",
      flex: 2,
      minWidth: 200,
      valueGetter: (value: any, row: any) =>
        `${row?.footerTemplate || ""}`.replace(/\b\w/g, (char) =>
          char.toUpperCase()
        ),
    },
    {
      field: "languageCode",
      headerName: "Language",
      flex: 2,
      minWidth: 200,
      valueGetter: (value: any, row: any) =>
        `${row?.languageCode || ""}`.replace(/\b\w/g, (char) =>
          char.toUpperCase()
        ),
    },
    {
      field: "channelName",
      headerName: "Channel",
      flex: 2,
      minWidth: 200,
      valueGetter: (value: any, row: any) =>
        `${row?.channelName || ""}`.replace(/\b\w/g, (char) =>
          char.toUpperCase()
        ),
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
      field: "createdByName",
      headerName: "Created By",
      sortable: true,
      flex: 2,
      minWidth: 150,
      valueGetter: (value: any, row: any) => `${row?.createdByName ?? ""}`,
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
      const { endpoint, method } = Config.Notification.NotificationTemplate;
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
      setNotificationTempletData(result.data);
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
  const { data: NotificationType } = useDataFetchHook(
    Config.Workflow.Misc.endpoint.replace("{type}", "NotificationChannel"),
    Config.Workflow.Misc.method,
    "bg"
  );
  const { data: NotificationConfig } = useDataFetchHook(
    Config.Notification.NotificationConfig.GetByNotificationConfig.endpoint,
    Config.Notification.NotificationConfig.GetByNotificationConfig.method,
    "bg"
  );
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };
  const handleClickOpen = () => {
    setOpen(true);
    setNotificationTempletInput({
      ...notificationTemplateInput,
      subjectTemplate: "",
      bodyTemplate: "",
      footerTemplate: "",
      languageCode: "",
      headerTemplate: "",
      id: 0,
      isActive: 1,
    });
    setSelectedValues({});
  };
  const handleEdit = (row: any) => {
    setEditFlag(true);
    setOpen(true);
    setError([]);
    setNotificationTempletInput({
      ...notificationTemplateInput,
      id: row.id,
      subjectTemplate: row.subjectTemplate,
      headerTemplate: row.headerTemplate,
      bodyTemplate: row.bodyTemplate,
      footerTemplate: row.footerTemplate,
      languageCode: row.languageCode,
      isActive: row.isActive,
    });
    setSelectedValues({
      notificationConfigId: NotificationConfig
        ? [
            NotificationConfig.find(
              (item: any) => item.id === row.notificationConfigId
            ),
          ].filter(Boolean)
        : [],
      notificationTypeId: NotificationType
        ? [
            NotificationType.find(
              (item: any) => item.id === row.notificationTypeId
            ),
          ].filter(Boolean)
        : [],
    });
  };

  const handleConfirmDelete = async () => {
    DeleteNotificationTemplet();
    setDeleteOpen(false);
  };
  const DeleteNotificationTemplet = async () => {
    try {
      const body = {
        id: notificationTemplateInput.id,
      };
      const { endpoint, method } =
        Config.Notification.NotificationTemplate.DeleteNotificationTemplet;
      const result = await Apirequest(
        endpoint.replace("{id}", `${notificationTemplateInput.id}`),
        method,
        body,
        "bg"
      ).then((res) => res.data);
      toast.success(result?.message);
      GetNotificationGroupList();
    } catch (err) {
      console.log(err);
    }
  };
  const handleClose = () => {
    setOpen(false);
    setNotificationTempletInput({
      ...notificationTemplateInput,
      subjectTemplate: "",
      bodyTemplate: "",
      footerTemplate: "",
      languageCode: "",
      headerTemplate: "",
    });
    setSelectedValues({});
    setEditFlag(false);
    setError([]);
  };
  const handleDelete = (id: number) => {
    setNotificationTempletInput({ ...notificationTemplateInput, id: id });
    setDeleteOpen(true);
  };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let { name, value } = e.target;
    setNotificationTempletInput({
      ...notificationTemplateInput,
      [name]: value,
    });
    setError([]);
  };
  const handleSwitch = (e: React.ChangeEvent<HTMLInputElement>) => {
    let { checked } = e.target;
    checked
      ? setNotificationTempletInput({
          ...notificationTemplateInput,
          isActive: 1,
        })
      : setNotificationTempletInput({
          ...notificationTemplateInput,
          isActive: 0,
        });
  };
  const handleSubmit = (e: React.MouseEvent<HTMLButtonElement>) => {
    let temp: string[] = [];
    Object.entries(notificationTemplateInput).forEach(([key, value]) => {
      if (
        (key === "subjectTemplate" ||
          key === "bodyTemplate" ||
          key === "headerTemplate") &&
        (!value || value.trim() === "")
      ) {
        temp.push(key);
      }
    });
    if (
      !selectedValues.notificationTypeId ||
      selectedValues.notificationTypeId.length === 0
    ) {
      temp.push("notificationTypeId");
    }

    if (
      !selectedValues.notificationConfigId ||
      selectedValues.notificationConfigId.length === 0
    ) {
      temp.push("notificationConfigId");
    }

    setError(temp);

    if (temp.length === 0) {
      setLoading(true);
      if (editFlag) {
        UpdateNotificationTemplate();
      } else {
        AddNotificationTemplate();
      }
    }
  };
  const AddNotificationTemplate = async () => {
    try {
      const body = {
        notificationTypeId: selectedValues.notificationTypeId?.[0]?.id || 0,
        notificationConfigId: selectedValues.notificationConfigId?.[0]?.id || 0,
        subjectTemplate:
          notificationTemplateInput.subjectTemplate?.trim() || "",
        headerTemplate: notificationTemplateInput.headerTemplate?.trim() || "",
        bodyTemplate: notificationTemplateInput.bodyTemplate?.trim() || "",
        footerTemplate: notificationTemplateInput.footerTemplate?.trim() || "",
        languageCode: notificationTemplateInput.languageCode?.trim() || "en",
      };

      const { endpoint, method } =
        Config.Notification.NotificationTemplate.AddNotificationTemplet;

      const response = await Apirequest(endpoint, method, body, "bg").then(
        (res) => res.data
      );

      if (response.statusCode === 200 || response.statusCode === 201) {
        toast.success(response.message);
        setOpen(false);
        setEditFlag(false);
        setNotificationTempletInput({ ...notificationTemplateInput });
        GetNotificationGroupList(); // Or replace with GetNotificationTemplateList()
      } else {
        toast.error(response.message);
        if (Array.isArray(response.errors)) {
          setErrorMessages(response.errors);
          setErrorModalOpen(true);
        }
      }
    } catch (err) {
      console.error("Create Error:", err);
    } finally {
      setLoading(false);
    }
  };
  const UpdateNotificationTemplate = async () => {
    try {
      const body = {
        id: notificationTemplateInput.id,
        notificationTypeId: selectedValues.notificationTypeId?.[0]?.id || 0,
        notificationConfigId: selectedValues.notificationConfigId?.[0]?.id || 0,
        subjectTemplate:
          notificationTemplateInput.subjectTemplate?.trim() || "",
        headerTemplate: notificationTemplateInput.headerTemplate?.trim() || "",
        bodyTemplate: notificationTemplateInput.bodyTemplate?.trim() || "",
        footerTemplate: notificationTemplateInput.footerTemplate?.trim() || "",
        languageCode: notificationTemplateInput.languageCode?.trim() || "en",
        isActive: notificationTemplateInput.isActive ?? 1,
      };

      const { endpoint, method } =
        Config.Notification.NotificationTemplate.UpdateNotificationTemplet;

      const response = await Apirequest(endpoint, method, body, "bg").then(
        (res) => res.data
      );

      if (response.statusCode === 200 || response.statusCode === 201) {
        toast.success(response.message);
        setOpen(false);
        setEditFlag(false);
        setNotificationTempletInput({ ...notificationTemplateInput });
        GetNotificationGroupList();
      } else {
        toast.error(response.message);
        if (Array.isArray(response.errors)) {
          setErrorMessages(response.errors);
          setErrorModalOpen(true);
        }
        setOpen(false);
        setLoading(false);
      }
    } catch (err) {
      console.error("Update Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAutocompleteChange = (
    name: string,
    value: { id: number; code: string; name?: string } | null
  ) => {
    setError([]);
    switch (name) {
      case "notificationTypeId":
      case "notificationConfigId":
        if (!value) {
          setSelectedValues((prev) => ({
            ...prev,
            [name]: [],
          }));
          setNotificationTempletInput((prev) => ({
            ...prev,
            [name]: 0,
          }));
        } else {
          setSelectedValues((prev) => ({
            ...prev,
            [name]: [value],
          }));
          setNotificationTempletInput((prev) => ({
            ...prev,
            [name]: value.id || 0,
          }));
        }
        break;

      default:
        break;
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
            child={"Notification Template "}
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
            placeholder="search template"
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
            rows={notificationTempletData}
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
      <CreateNotificationTemplate
        open={open}
        close={handleClose}
        notificationTemplateInput={notificationTemplateInput}
        editFlag={editFlag}
        error={error}
        handleSwitch={handleSwitch}
        handleChange={handleChange}
        handleSubmit={handleSubmit}
        handleAutocompleteChange={handleAutocompleteChange}
        NotificationType={NotificationType}
        NotificationConfig={NotificationConfig}
        selectedValues={selectedValues}
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

export default NotificationTemplatePage;
