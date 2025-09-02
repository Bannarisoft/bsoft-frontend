"use client";
import { Box } from "@mui/material";
import React, { useCallback, useEffect, useState } from "react";
import IconBreadcrumbs from "../../../molecules/AdminLayout/BreadCrumbs";
import GlobalSearch from "../../../molecules/AdminLayout/GlobalSearch";
import { MuiButton, MuiTable } from "bsoft-base-elements";
import { GoPlus } from "react-icons/go";
import { useDebounce } from "../../../../hooks/useDebounceHook";
import { FiEdit } from "react-icons/fi";
import { RiDeleteBin6Line } from "react-icons/ri";
import { NotificationEventRuleProps } from "../../../../types/types";
import NoDataFound from "../../../molecules/AdminLayout/NoDataFound";
import DeleteConfirmation from "../../../molecules/Master/DeleteConfirmation";
import ErrorModal from "../../../molecules/Master/Role/ErrorModal";
import CreateNotificationEventRule from "../../../molecules/Notification/Master/CreateNotificationEventRule";
import Config from "../../../../utils/config.api.json";
import { Apirequest } from "../../../../utils/lib";
import { useDataFetchHook } from "../../../../hooks/useDataFetchHook";
import SkeletonLoader from "../../../molecules/AdminLayout/SkeletonLoader";
import { useRecoilValue } from "recoil";
import { UserData } from "../../../../utils/atoms";
import toast from "react-hot-toast";
import { usePrivilegeCheck } from "../../../../hooks/usePrivilegeCheck";

const NotificationEventRule = () => {
  const userValue = useRecoilValue(UserData);
  const [pathname, setPathName] = useState<string>("");
  const permissions = usePrivilegeCheck(pathname);
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const debouncedSearchTerm = useDebounce(search, 500);
  const [initFlag, setInitFlag] = React.useState(false);
  const [notificationLevelData, setNotificationLevelData] = React.useState<
    any[]
  >([]);
  const [page, setPage] = React.useState<number>(1);
  const [size, setSize] = React.useState<number>(15);
  const [editFlag, setEditFlag] = React.useState(false);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [count, setCount] = React.useState<number>(0);
  const [error, setError] = React.useState<any[]>([]);
  const [errorModalOpen, setErrorModalOpen] = React.useState(false);
  const [errorMessages, setErrorMessages] = React.useState<string[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [selectedValues, setSelectedValues] = useState<{
    [key: string]: any[];
  }>({});
  const [targetOptions, setTargetOptions] = useState<any[]>([]);

  const [notificationLevelInput, setNotificationLevelInput] =
    useState<NotificationEventRuleProps>({
      id: 0,
      notificationConfigId: 0,
      targetTypeId: 0,
      targetId: 0,
      approvalModeId: 0,
      description: "",
      isActive: 1,
      notificationEventRules: [],
    });

  useEffect(() => {
    if (notificationLevelInput.notificationEventRules.length === 0) {
      setNotificationLevelInput((prev) => ({
        ...prev,
        notificationEventRules: [
          {
            id: 0,
            notificationChannelId: 0,
            recipientTypeId: 0,
            templateId: 0,
            notificationTypeId: 0,
            receipientTypeId: 0,
            notificationTempletId: 0,
            isNew: true,
          },
        ],
      }));
    }
  }, [notificationLevelInput.notificationEventRules.length]);

  const columns = [
    {
      field: "s_no",
      headerName: "S.No",
      minWidth: 50,
      flex: 1,
      sortable: true,
      renderCell: (params: any) =>
        (page - 1) * size + (params.api.getAllRowIds().indexOf(params.id) + 1),
    },
    {
      field: "description",
      headerName: "Description",
      flex: 1,
      minWidth: 200,
      valueGetter: (value: any, row: any) =>
        `${row?.description || ""}`.replace(/\b\w/g, (char) =>
          char.toUpperCase()
        ),
    },
    {
      field: "notificationEventRules",
      headerName: "Event Rules Count",
      flex: 1,
      minWidth: 150,
      valueGetter: (value: any, row: any) =>
        row?.notificationEventRules?.length ?? 0,
    },
    {
      field: "isActive",
      headerName: "Status",
      flex: 1,
      minWidth: 150,
      valueGetter: (value: any, row: any) =>
        row?.isActive === 1 ? "Active" : "Inactive",
    },
    {
      field: "actions",
      headerName: "Actions",
      flex: 1,
      minWidth: 150,
      sortable: false,
      filterable: false,
      renderCell: (params: any) => (
        <Box
          component="div"
          display="flex"
          alignItems="center"
          gap={2}
          height="100%"
        >
          <FiEdit
            fontSize={20}
            color="black"
            cursor="pointer"
            onClick={() => handleEdit(params.row)}
          />
          <RiDeleteBin6Line
            fontSize={20}
            color="red"
            cursor="pointer"
            onClick={() => handleDelete(params.row.id)}
          />
        </Box>
      ),
    },
  ];

  const { data: TargetType } = useDataFetchHook(
    Config.Workflow.Misc.endpoint.replace("{type}", "TargetType"),
    Config.Workflow.Misc.method,
    "bg"
  );
  const { data: ApprovalMode } = useDataFetchHook(
    Config.Workflow.Misc.endpoint.replace("{type}", "ApprovalMode"),
    Config.Workflow.Misc.method,
    "bg"
  );
  const { data: NotificationConfig } = useDataFetchHook(
    Config.Notification.NotificationConfig.GetByNotificationConfig.endpoint,
    Config.Notification.NotificationConfig.GetByNotificationConfig.method,
    "bg"
  );
  const { data: userData } = useDataFetchHook(
    Config.User.getByuser.endpoint,
    Config.User.getByuser.method
  );
  const { data: RoleData } = useDataFetchHook(
    Config.Role.getRole.endpoint,
    Config.Role.getRole.method
  );
  const { data: GroupData } = useDataFetchHook(
    Config.UserGroup.endpoint,
    Config.UserGroup.method
  );
  const { data: DepartmentData } = useDataFetchHook(
    Config.Department.getDepartment.endpoint,
    Config.Department.getDepartment.method
  );

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };
  const handleClickOpen = () => {
    setOpen(true);
    setError([]);
    setNotificationLevelInput({
      ...notificationLevelInput,
      description: "",
    });
    setSelectedValues({});
    setEditFlag(false);
  };
  const handleClose = () => {
    setOpen(false);
    setNotificationLevelInput({
      id: 0,
      description: "",
      notificationConfigId: 0,
      targetTypeId: 0,
      targetId: 0,
      approvalModeId: 0,
      isActive: 1,
      notificationEventRules: [],
    });
    setSelectedValues({});
    setEditFlag(false);
    setError([]);
  };
  const handleEdit = (row: any) => {
    setEditFlag(true);
    setOpen(true);
    setError([]);

    const targetTypeCode = TargetType.find(
      (t: any) => t.id === row.targetTypeId
    )?.code;

    const getTargetOptions = (list: any[], key: string, value: number) =>
      list.filter((item: any) => item[key] === value);

    const targetOptionMap: any = {
      USER: { data: userData, key: "userId", label: "userName" },
      ROLE: { data: RoleData, key: "id", label: "roleName" },
      GROUP: { data: GroupData, key: "id", label: "groupName" },
      DEPT: { data: DepartmentData, key: "id", label: "departmentName" },
    };

    const { data, key, label } = targetOptionMap[targetTypeCode] || {};
    const matchedTarget = data ? getTargetOptions(data, key, row.targetId) : [];

    if (data) {
      setTargetOptions(
        data.map((item: any) => ({ id: item[key], code: item[label] }))
      );
    } else {
      setTargetOptions([]);
    }

    // 🔹 Store all rules
    setNotificationLevelInput({
      ...notificationLevelInput,
      id: row.id,
      description: row.description,
      notificationConfigId: row.notificationConfigId,
      targetTypeId: row.targetTypeId,
      targetId: row.targetId,
      approvalModeId: row.approvalModeId,
      isActive: row.isActive ?? 1,
      notificationEventRules: row.notificationEventRules.map((rule: any) => ({
        id: rule.id,
        notificationChannelId: rule.notificationChannelId || 0,
        templateId: rule.templateId || 0,
        recipientTypeId: rule.recipientTypeId || 0,
      })),
    });

    //  Selected values for top-level fields
    setSelectedValues({
      notificationConfigId: NotificationConfig.filter(
        (i: any) => i.id === row.notificationConfigId
      ),
      targetTypeId: TargetType.filter((i: any) => i.id === row.targetTypeId),
      targetId: matchedTarget,
      approvalModeId: ApprovalMode.filter(
        (i: any) => i.id === row.approvalModeId
      ),
    });

    //  Selected values for each rule (optional — depends on how you store them)
    row.notificationEventRules.forEach((rule: any) => {
      setSelectedValues((prev: any) => ({
        ...prev,
        [`notificationChannelId_${rule.id}`]: NotificationType.filter(
          (i: any) => i.id === rule.notificationChannelId
        ),
        [`templateId_${rule.id}`]: NotificationTemplet.filter(
          (i: any) => i.id === rule.templateId
        ),
        [`recipientTypeId_${rule.id}`]: ReceipientType.filter(
          (i: any) => i.id === rule.recipientTypeId
        ),
      }));
    });
  };

  const handleDelete = (id: number) => {
    setNotificationLevelInput({ ...notificationLevelInput, id: id });
    setDeleteOpen(true);
  };
  const handleSwitch = (e: React.ChangeEvent<HTMLInputElement>) => {
    let { checked } = e.target;
    checked
      ? setNotificationLevelInput({ ...notificationLevelInput, isActive: 1 })
      : setNotificationLevelInput({ ...notificationLevelInput, isActive: 0 });
  };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let { name, value } = e.target;
    setNotificationLevelInput({ ...notificationLevelInput, [name]: value });
    setError([]);
  };
  const handleSubmit = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    let temp: string[] = [];

    if (!selectedValues.notificationConfigId?.[0]) {
      temp.push("notificationConfigId");
    }
    if (!selectedValues.targetTypeId?.[0]) {
      temp.push("targetTypeId");
    }
    if (!selectedValues.targetId?.[0]) {
      temp.push("targetId");
    }
    if (!selectedValues.approvalModeId?.[0]) {
      temp.push("approvalModeId");
    }
    if (
      !notificationLevelInput.description ||
      notificationLevelInput.description.trim() === ""
    ) {
      temp.push("description");
    }

    //  New validation for notificationEventRules
    if (
      !notificationLevelInput.notificationEventRules ||
      notificationLevelInput.notificationEventRules.length === 0
    ) {
      toast.error("Add the Notification Rules");
      return;
    }

    notificationLevelInput.notificationEventRules.forEach((rule) => {
      if (!rule.notificationChannelId) {
        temp.push(`notificationChannelId_${rule.id}`);
      }
      if (!rule.recipientTypeId) {
        temp.push(`recipientTypeId_${rule.id}`);
      }
      if (!rule.templateId) {
        temp.push(`templateId_${rule.id}`);
      }
    });

    setError(temp);

    if (temp.length === 0) {
      setLoading(true);
      if (editFlag) {
        UpdateNotificationLevel();
      } else {
        AddNotificationEventRule();
      }
    }
  };

  const AddNotificationEventRule = async () => {
    try {
      const body = {
        // id: notificationLevelInput.id,
        notificationConfigId: notificationLevelInput.notificationConfigId,
        targetTypeId: notificationLevelInput.targetTypeId,
        targetId: notificationLevelInput.targetId,
        approvalModeId: notificationLevelInput.approvalModeId,
        description: notificationLevelInput.description?.trim() || "",
        notificationEventRules:
          notificationLevelInput.notificationEventRules.map((rule) => ({
            id: rule.id || 0,
            notificationChannelId: rule.notificationChannelId || 0,
            recipientTypeId: rule.recipientTypeId || 0,
            templateId: rule.templateId || 0,
          })),
      };

      const { endpoint, method } =
        Config.Notification.NotificationEventRule.AddNotificationEventRule;

      const response = await Apirequest(endpoint, method, body, "bg").then(
        (res) => res.data
      );

      if (response.statusCode === 200 || response.statusCode === 201) {
        toast.success(response.message);
        setOpen(false);
        setEditFlag(false);
        GetNotificationHierarchyList();
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
  const UpdateNotificationLevel = async () => {
    try {
      const body = {
        notificationLevelHierarchyId: notificationLevelInput.id,
        notificationConfigId: notificationLevelInput.notificationConfigId,
        targetTypeId: notificationLevelInput.targetTypeId,
        targetId: notificationLevelInput.targetId,
        approvalModeId: notificationLevelInput.approvalModeId,
        description: notificationLevelInput.description?.trim() || "",
        notificationEventRules:
          notificationLevelInput.notificationEventRules.map((rule) => ({
            id: rule.id || 0,
            notificationChannelId: rule.notificationChannelId || 0,
            recipientTypeId: rule.recipientTypeId || 0,
            templateId: rule.templateId || 0,
          })),
        isActive: notificationLevelInput.isActive,
      };

      const { endpoint, method } =
        Config.Notification.NotificationEventRule.UpdateNotificationEventRule;

      const response = await Apirequest(endpoint, method, body, "bg").then(
        (res) => res.data
      );
      if (response.statusCode === 200 || response.statusCode === 201) {
        toast.success(response.message);
        setOpen(false);
        setEditFlag(false);
        setNotificationLevelInput({ ...notificationLevelInput });
        GetNotificationHierarchyList();
      } else {
        toast.error(response.message);
        setErrorMessages(response.errors);
        setErrorModalOpen(true);
      }
    } catch (err) {
      console.log(err);
    }
  };
  const DeleteNotificationLevel = async () => {
    try {
      const body = {
        id: notificationLevelInput.id,
      };
      const { endpoint, method } =
        Config.Notification.NotificationEventRule.DeleteNotificationEventRule;
      const result = await Apirequest(
        endpoint.replace("{id}", `${notificationLevelInput.id}`),
        method,
        body,
        "bg"
      ).then((res) => res.data);
      toast.success(result?.message);
      GetNotificationHierarchyList();
    } catch (err) {
      console.log(err);
    }
  };
  const handleConfirmDelete = async () => {
    DeleteNotificationLevel();
    setDeleteOpen(false);
  };

  const handleAutocompleteChange = (
    name: string,
    value: { id: number; code: string; name?: string } | null,
    ruleId?: number
  ) => {
    setError([]);

    const eventRuleFields = [
      "notificationChannelId",
      "recipientTypeId",
      "templateId",
    ];

    if (eventRuleFields.includes(name)) {
      setSelectedValues((prev) => ({
        ...prev,
        [name]: value ? [value] : [],
      }));

      setNotificationLevelInput((prev) => ({
        ...prev,
        notificationEventRules: prev.notificationEventRules.map((rule) =>
          rule.id === ruleId ? { ...rule, [name]: value?.id || 0 } : rule
        ),
      }));
      return;
    }

    switch (name) {
      case "targetTypeId":
        if (!value) {
          setSelectedValues((prev) => ({
            ...prev,
            [name]: [],
            targetId: [],
          }));
          setNotificationLevelInput((prev) => ({
            ...prev,
            [name]: 0,
            targetId: 0,
          }));
          setTargetOptions([]);
        } else {
          setSelectedValues((prev) => ({
            ...prev,
            [name]: [value],
            targetId: [],
          }));
          setNotificationLevelInput((prev) => ({
            ...prev,
            [name]: value.id,
            targetId: 0,
          }));
          switch (value.code) {
            case "USER":
              setTargetOptions(
                userData.map((u: any) => ({ id: u.userId, code: u.userName }))
              );
              break;
            case "ROLE":
              setTargetOptions(
                RoleData.map((r: any) => ({ id: r.id, code: r.roleName }))
              );
              break;
            case "GROUP":
              setTargetOptions(
                GroupData.map((g: any) => ({ id: g.id, code: g.groupName }))
              );
              break;
            case "DEPT":
              setTargetOptions(
                DepartmentData.map((d: any) => ({ id: d.id, code: d.deptName }))
              );
              break;
            default:
              setTargetOptions([]);
          }
        }
        break;

      default:
        setSelectedValues((prev) => ({
          ...prev,
          [name]: value ? [value] : [],
        }));
        setNotificationLevelInput((prev) => ({
          ...prev,
          [name]: value?.id || 0,
        }));
        break;
    }
  };

  const { data: NotificationType } = useDataFetchHook(
    Config.Workflow.Misc.endpoint.replace("{type}", "NotificationChannel"),
    Config.Workflow.Misc.method,
    "bg"
  );
  const { data: ReceipientType } = useDataFetchHook(
    Config.Workflow.Misc.endpoint.replace("{type}", "ReceipientType"),
    Config.Workflow.Misc.method,
    "bg"
  );

  const { data: NotificationTemplet } = useDataFetchHook(
    Config.Notification.NotificationTemplate.GetByNotificationTemplet.endpoint,
    Config.Notification.NotificationTemplate.GetByNotificationTemplet.method,
    "bg"
  );

  const handleAddNotificationRule = useCallback(() => {
    const hasUnselected = notificationLevelInput.notificationEventRules.some(
      (rule) =>
        !rule.notificationChannelId || !rule.recipientTypeId || !rule.templateId
    );

    if (hasUnselected) {
      toast.error("Please fill all fields before adding a new rule.");
      return;
    }

    setNotificationLevelInput((prev) => {
      // Find the maximum ID in the current rules
      const maxId = prev.notificationEventRules.length
        ? Math.max(...prev.notificationEventRules.map((rule) => rule.id))
        : 0;

      return {
        ...prev,
        notificationEventRules: [
          ...prev.notificationEventRules,
          {
            id: maxId + 1,
            notificationChannelId: 0,
            recipientTypeId: 0,
            templateId: 0,
            notificationTypeId: 0,
            receipientTypeId: 0,
            notificationTempletId: 0,
            isNew: true,
          },
        ],
      };
    });
  }, [notificationLevelInput.notificationEventRules]);
  const handleDeleteNotificationRule = (id: number) => {
    setNotificationLevelInput((prev) => ({
      ...prev,
      notificationEventRules: prev.notificationEventRules.filter(
        (rule) => rule.id !== id
      ),
    }));
  };

  const getFilteredOptions = (
    currentValue: any | null,
    allOptions: any[],
    currentRuleId: number,
    allRules: any[] | null | undefined,
    fieldName: string
  ) => {
    if (!Array.isArray(allRules)) return allOptions;

    const selectedIds = allRules
      .filter((rule) => rule[fieldName] && rule.id !== currentRuleId)
      .map((rule) => rule[fieldName]);

    return allOptions.filter(
      (opt) => !selectedIds.includes(opt.id) || opt.id === currentValue?.id
    );
  };

  const GetNotificationHierarchyList = async () => {
    try {
      const { endpoint, method } = Config.Notification.NotificationEventRule;
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
      setNotificationLevelData(result.data.data);
      setCount(result.data.totalCount);
    } catch (err) {
      console.log(err);
      setLoading(false);
    }
  };
  useEffect(() => {
    initFlag && search !== ""
      ? GetNotificationHierarchyList()
      : GetNotificationHierarchyList();
  }, [debouncedSearchTerm, page, size]);

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
            child={"Notification Event Rule "}
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
            placeholder="search event"
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
            rows={notificationLevelData}
            columns={columns}
            rowCount={count}
            paginationMode="server"
            paginationModel={{
              page: page - 1,
              pageSize: size,
            }}
            onPaginationModelChange={({ page: newPage, pageSize }) => {
              setPage(newPage + 1);
              setSize(pageSize);
            }}
            pageSizeOptions={[15, 30, 50]}
            disableRowSelectionOnClick
            slots={{
              noRowsOverlay: () => <NoDataFound />,
            }}
          />
        )}
      </Box>

      <CreateNotificationEventRule
        open={open}
        close={handleClose}
        notificationGroupInput={notificationLevelInput}
        editFlag={editFlag}
        error={error}
        handleSwitch={handleSwitch}
        handleChange={handleChange}
        handleSubmit={handleSubmit}
        handleAutocompleteChange={handleAutocompleteChange}
        targetType={TargetType}
        selectedValues={selectedValues}
        targetOptions={targetOptions}
        ApprovalMode={ApprovalMode}
        NotificationConfig={NotificationConfig}
        DepartmentData={DepartmentData}
        NotificationType={NotificationType}
        NotificationTemplet={NotificationTemplet}
        ReceipientType={ReceipientType}
        handleAddNotificationRule={handleAddNotificationRule}
        handleDeleteNotificationRule={handleDeleteNotificationRule}
        getFilteredOptions={getFilteredOptions}
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

export default NotificationEventRule;
