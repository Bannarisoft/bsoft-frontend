import { Box } from "@mui/material";
import React, { useEffect, useState } from "react";
import IconBreadcrumbs from "../../../molecules/AdminLayout/BreadCrumbs";
import GlobalSearch from "../../../molecules/AdminLayout/GlobalSearch";
import { MuiButton, MuiTable } from "bsoft-base-elements";
import { GoPlus } from "react-icons/go";
import { useDebounce } from "../../../../hooks/useDebounceHook";
import NoDataFound from "../../../molecules/AdminLayout/NoDataFound";
import { FiEdit } from "react-icons/fi";
import { RiDeleteBin6Line } from "react-icons/ri";
import dayjs from "dayjs";
import { Apirequest } from "../../../../utils/lib";
import Config from "../../../../utils/config.api.json";
import SkeletonLoader from "../../../molecules/AdminLayout/SkeletonLoader";
import { useDataFetchHook } from "../../../../hooks/useDataFetchHook";
import { ApprovalRuleProps } from "../../../../types/types";
import toast from "react-hot-toast";
import ErrorModal from "../../../molecules/Master/Role/ErrorModal";
import DeleteConfirmation from "../../../molecules/Master/DeleteConfirmation";
import CreateApprovalRule from "../../../molecules/Workflow/Master/CreateApprovalRule";
import { useRecoilValue } from "recoil";
import { UserData } from "../../../../utils/atoms";

const ApprovalRulePage = () => {
  const userValue = useRecoilValue(UserData);
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const debouncedSearchTerm = useDebounce(search, 500);
  const [selectedValue, setSelectedValue] = useState<{
    unitId: { id: number; unitName: string } | null;
    workflowTypeId: { id: number; moduleTypeName: string } | null;
  }>({
    unitId: null,
    workflowTypeId: null,
  });
  const [page, setPage] = React.useState<number>(1);
  const [size, setSize] = React.useState<number>(15);
  const [count, setCount] = React.useState<number>(0);
  const [approvalRuleData, setApprovalRuleData] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [initFlag, setInitFlag] = React.useState(false);
  const [editFlag, setEditFlag] = React.useState(false);
  const [error, setError] = React.useState<any[]>([]);
  const [errorModalOpen, setErrorModalOpen] = React.useState(false);
  const [errorMessages, setErrorMessages] = React.useState<string[]>([]);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [approvalRuleInput, setApprovalRuleInput] =
    React.useState<ApprovalRuleProps>({
      unitId: 0,
      workflowTypeId: 0,
      conditionKey: "",
      operator: "",
      value: "",
      action: "",
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
      field: "moduleTypeName",
      headerName: "ModuleType",
      flex: 1,
      minWidth: 200,
      valueGetter: (value: any, row: any) =>
        `${row?.moduleTypeName || ""}`.replace(/\b\w/g, (char) =>
          char.toUpperCase()
        ),
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
  const GetApprovalRuleList = async () => {
    try {
      const { endpoint, method } = Config.Workflow.ApprovalRule;
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
      setApprovalRuleData(result.data);
      setCount(result.totalCount);
    } catch (err) {
      console.log(err);
      setLoading(false);
    }
  };
  useEffect(() => {
    initFlag && search !== "" ? GetApprovalRuleList() : GetApprovalRuleList();
  }, [debouncedSearchTerm, page, size]);
  const { data: UnitData } = useDataFetchHook(
    Config.Unit.getUnitByUser.endpoint
      .replace("{companyId}", userValue.companyId)
      .replace("{userId}", userValue.userId),
    Config.Unit.getUnitByUser.method
  );

  const { data: WorkflowTypeData } = useDataFetchHook(
    Config.Workflow.WorkflowType.GetByWorkflowType.endpoint,
    Config.Workflow.WorkflowType.GetByWorkflowType.method,
    "bg"
  );

  const handleEdit = (row: any) => {
    setEditFlag(true);
    setOpen(true);
    setApprovalRuleInput({
      ...approvalRuleInput,
      conditionKey: row?.conditionKey,
      operator: row?.operator,
      value: row?.value,
      action: row?.action,
      id: row?.id,
      isActive: row?.isActive,
    });

    const selectedUnit = UnitData.find((item: any) => item.id === row.unitId);
    const selectedWorkflow = WorkflowTypeData.find(
      (item: any) => item.id === row.workflowTypeId
    );

    setSelectedValue({
      unitId: selectedUnit || null,
      workflowTypeId: selectedWorkflow || null,
    });
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };
  const handleClickOpen = () => {
    setOpen(true);
    setApprovalRuleInput({
      ...approvalRuleInput,
      conditionKey: "",
      operator: "",
      value: "",
      action: "",
      isActive: 1,
    });
    setSelectedValue({
      unitId: null,
      workflowTypeId: null,
    });
  };
  const handleClose = () => {
    setOpen(false);
    setEditFlag(false);
    setApprovalRuleInput({
      ...approvalRuleInput,
      conditionKey: "",
      operator: "",
      value: "",
      action: "",
    });
    setSelectedValue({
      unitId: null,
      workflowTypeId: null,
    });
    setError([]);
  };
  const handleAutocomplete = (
    name: string,
    value: { id: number; name: string } | null
  ) => {
    setSelectedValue((prev: any) => ({
      ...prev,
      [name]: value,
    }));

    setApprovalRuleInput((prev: any) => ({
      ...prev,
      [name]: value?.id || 0,
    }));

    setError([]);
  };

  const handleSwitch = (e: React.ChangeEvent<HTMLInputElement>) => {
    let { checked } = e.target;
    checked
      ? setApprovalRuleInput({
          ...approvalRuleInput,
          isActive: 1,
        })
      : setApprovalRuleInput({
          ...approvalRuleInput,
          isActive: 0,
        });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const allowedOperators = ["==", "!=", ">", "<", ">=", "<="];
    if (name === "operator") {
      // Allow partial matches of allowed operators
      const isValid = allowedOperators.some((op) => op.startsWith(value));
      if (!isValid) return;
    }

    setApprovalRuleInput({
      ...approvalRuleInput,
      [name]: value,
    });
    setError([]);
  };

  const handleSubmit = (e: React.MouseEvent<HTMLButtonElement>) => {
    let temp: string[] = [];
    Object.entries(approvalRuleInput).map(([key, value]) => {
      if (
        key === "conditionKey" &&
        (value === undefined ||
          value === null ||
          value.toString().trim() === "")
      ) {
        temp.push(key);
      } else if (
        key === "operator" &&
        (value === undefined ||
          value === null ||
          value.toString().trim() === "")
      ) {
        temp.push(key);
      } else if (
        key === "action" &&
        (value === undefined ||
          value === null ||
          value.toString().trim() === "")
      ) {
        temp.push(key);
      } else if (
        key === "value" &&
        (value === undefined ||
          value === null ||
          value.toString().trim() === "")
      ) {
        temp.push(key);
      }
    });

    if (
      !approvalRuleInput.workflowTypeId ||
      approvalRuleInput.workflowTypeId === 0
    ) {
      temp.push("workflowTypeId");
    }
    if (!approvalRuleInput.unitId || approvalRuleInput.unitId === 0) {
      temp.push("unitId");
    }

    setError(temp);
    if (temp.length === 0) {
      setLoading(true);
      if (editFlag) {
        UpdateApprovalRule();
      } else {
        AddApprovalRule();
      }
    }
  };

  const AddApprovalRule = async () => {
    try {
      const body: any = {
        conditionKey: approvalRuleInput.conditionKey?.trim(),
        operator: approvalRuleInput.operator?.trim(),
        value: approvalRuleInput.value?.trim(),
        action: approvalRuleInput.action?.trim(),
        unitId: selectedValue.unitId?.id,
        workflowTypeId: selectedValue.workflowTypeId?.id,
      };

      if (editFlag) {
        body.id = Number(approvalRuleInput.id);
      }
      const { endpoint, method } = Config.Workflow.ApprovalRule.AddApprovalRule;
      const response = await Apirequest(endpoint, method, body, "bg").then(
        (res) => res.data
      );

      if (response.statusCode === 200 || response.statusCode === 201) {
        toast.success(response.message);
        setOpen(false);
        setEditFlag(false);
        setApprovalRuleInput({ ...approvalRuleInput });
        GetApprovalRuleList();
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

  const UpdateApprovalRule = async () => {
    try {
      const body: any = {
        conditionKey: approvalRuleInput.conditionKey?.trim(),
        operator: approvalRuleInput.operator?.trim(),
        value: approvalRuleInput.value?.trim(),
        action: approvalRuleInput.action?.trim(),
        unitId: selectedValue.unitId?.id,
        workflowTypeId: selectedValue.workflowTypeId?.id,
        id: approvalRuleInput.id,
        isActive: approvalRuleInput.isActive,
      };
      const { endpoint, method } =
        Config.Workflow.ApprovalRule.UpdateApprovalRule;

      const response = await Apirequest(endpoint, method, body, "bg").then(
        (res) => res.data
      );
      if (response.statusCode === 200) {
        toast.success(response.message);
        setOpen(false);
        setApprovalRuleInput({ ...approvalRuleInput });
        setEditFlag(false);
        GetApprovalRuleList();
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
  const DeleteWorkflow = async () => {
    try {
      const body = {
        id: approvalRuleInput.id,
      };
      const { endpoint, method } =
        Config.Workflow.ApprovalRule.DeleteApprovalRule;
      const response = await Apirequest(
        endpoint.replace("{id}", `${approvalRuleInput.id}`),
        method,
        body,
        "bg"
      ).then((res) => res.data);

      if (response.statusCode === 200 || response.statusCode === 201) {
        toast.success(response.message);
        setOpen(false);
        setEditFlag(false);
        GetApprovalRuleList();
      } else {
        toast.error(response.message);
        if (Array.isArray(response.errors) && response.errors.length > 0) {
          setErrorModalOpen(true);
          setErrorMessages(response.errors);
        }
      }
    } catch (err) {
      console.log(err);
      GetApprovalRuleList();
    }
  };
  const handleDelete = (id: number) => {
    setApprovalRuleInput({ ...approvalRuleInput, id: id });
    setDeleteOpen(true);
  };
  const handleConfirmDelete = async () => {
    DeleteWorkflow();
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
            parent={"Workflow"}
            child={"Approval Rule"}
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
            placeholder="search approval"
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
            rows={approvalRuleData}
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
      <CreateApprovalRule
        open={open}
        close={handleClose}
        editFlag={editFlag}
        UnitData={UnitData}
        handleAutocomplete={handleAutocomplete}
        selectedValue={selectedValue}
        approvalRuleInput={approvalRuleInput}
        handleChange={handleChange}
        error={error}
        handleSubmit={handleSubmit}
        handleSwitch={handleSwitch}
        WorkflowTypeData={WorkflowTypeData}
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

export default ApprovalRulePage;
