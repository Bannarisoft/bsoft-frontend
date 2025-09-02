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
import { ApprovalDetailProps } from "../../../../types/types";
import toast from "react-hot-toast";
import ErrorModal from "../../../molecules/Master/Role/ErrorModal";
import DeleteConfirmation from "../../../molecules/Master/DeleteConfirmation";
import { useRecoilValue } from "recoil";
import { UserData } from "../../../../utils/atoms";
import CreateApprovalStepDetails from "../../../molecules/Workflow/Master/CreateApprovalStepDetail";

const ApprovalDetail = () => {
  const userValue = useRecoilValue(UserData);
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const debouncedSearchTerm = useDebounce(search, 500);
  const [selectedValue, setSelectedValue] = useState<any>({
    unitId: null,
    workflowTypeId: null,
  });
  const [page, setPage] = React.useState<number>(1);
  const [size, setSize] = React.useState<number>(15);
  const [count, setCount] = React.useState<number>(0);
  const [approvalDetailData, setApprovalDetailData] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [initFlag, setInitFlag] = React.useState(false);
  const [editFlag, setEditFlag] = React.useState(false);
  const [error, setError] = React.useState<any[]>([]);
  const [errorModalOpen, setErrorModalOpen] = React.useState(false);
  const [errorMessages, setErrorMessages] = React.useState<string[]>([]);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [approvalDetailInput, setApprovalDetailInput] =
    React.useState<ApprovalDetailProps>({
      workFlowTypeId: 0,
      stepOrder: 0,
      targetTypeId: 0,
      approvalStepId: 0,
      approvalTypeId: 0,
      slaHours: 0,
      onSLAAction: "",
      approvalStepUnitMappings: [],
      ruleSkipApproverMappings: [],
      approvalStepDepartmentMappings: [],
      isActive: 1,
      id: 0,
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
      field: "approvalStepName",
      headerName: "Approval Step",
      flex: 2,
      minWidth: 200,
      valueGetter: (value: any, row: any) =>
        `${row?.approvalStepName || ""}`.replace(/\b\w/g, (char) =>
          char.toUpperCase()
        ),
    },
    {
      field: "approvalTypeName",
      headerName: "Approval Type",
      flex: 2,
      minWidth: 200,
      valueGetter: (value: any, row: any) =>
        `${row?.approvalTypeName || ""}`.replace(/\b\w/g, (char) =>
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
      field: "createdByName",
      headerName: "Created By",
      sortable: true,
      flex: 2,
      minWidth: 150,
      valueGetter: (value: any, row: any) => `${row?.createdByName ?? ""}`,
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
  const GetApprovalDetailList = async () => {
    try {
      const { endpoint, method } = Config.Workflow.ApprovalDetail;
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
      setApprovalDetailData(result.data);
      setCount(result.totalCount);
    } catch (err) {
      console.log(err);
      setLoading(false);
    }
  };
  useEffect(() => {
    initFlag && search !== ""
      ? GetApprovalDetailList()
      : GetApprovalDetailList();
  }, [debouncedSearchTerm, page, size]);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const newValue =
      name === "stepOrder" || name === "slaHours" ? Number(value) : value;

    setApprovalDetailInput((prev) => ({
      ...prev,
      [name]: newValue,
    }));

    setError([]);
  };
  const handleSubmit = (e: React.MouseEvent<HTMLButtonElement>) => {
    let temp: string[] = [];
    const requiredFields = [
      "workFlowTypeId",
      "stepOrder",
      "targetTypeId",
      "approvalStepId",
      "approvalTypeId",
    ];

    requiredFields.forEach((field) => {
      const value = approvalDetailInput[field as keyof ApprovalDetailProps];
      if (
        value === undefined ||
        value === null ||
        (typeof value === "string" && value.trim() === "") ||
        (typeof value === "number" && value === 0)
      ) {
        temp.push(field);
      }
    });
    if (!selectedValue.unitId || selectedValue.unitId.length === 0) {
      temp.push("unitId");
    }
    if (
      !selectedValue.departmentId ||
      selectedValue.departmentId.length === 0
    ) {
      temp.push("departmentId");
    }

    setError(temp);

    if (temp.length === 0) {
      setLoading(true);
      if (editFlag) {
        UpdateApprovalStep();
      } else {
        AddApprovalDetail();
      }
    }
  };
  const AddApprovalDetail = async () => {
    try {
      const body = {
        workFlowTypeId: selectedValue.workFlowTypeId?.id,
        stepOrder: approvalDetailInput.stepOrder,
        targetTypeId: approvalDetailInput.targetTypeId,
        approvalStepId: selectedValue.approvalStepId?.id,
        approvalTypeId: selectedValue.approvalTypeId?.id,
        slaHours: approvalDetailInput.slaHours,
        onSLAAction: approvalDetailInput.onSLAAction?.trim(),

        approvalStepUnitMappings: selectedValue.unitId.map((unit: any) => ({
          unitId: unit.id,
        })),

        ruleSkipApproverMappings: selectedValue.ruleId.map((rule: any) => ({
          ruleId: rule.id,
        })),

        approvalStepDepartmentMappings: selectedValue.departmentId.map(
          (dept: any) => ({
            departmentId: dept.id,
          })
        ),
      };

      const { endpoint, method } =
        Config.Workflow.ApprovalDetail.AddApprovalDetail;
      const response = await Apirequest(endpoint, method, body, "bg").then(
        (res) => res.data
      );

      if (response.statusCode === 200 || response.statusCode === 201) {
        toast.success(response.message);
        setOpen(false);
        setEditFlag(false);
        setApprovalDetailInput({ ...approvalDetailInput });
        GetApprovalDetailList();
      } else {
        toast.error(response.message);
        if (Array.isArray(response.errors) && response.errors.length > 0) {
          setErrorModalOpen(true);
          setErrorMessages(response.errors);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  const UpdateApprovalStep = async () => {
    try {
      const body = {
        id: approvalDetailInput.id,
        isActive: approvalDetailInput.isActive,
        workFlowTypeId: selectedValue.workFlowTypeId?.id,
        stepOrder: approvalDetailInput.stepOrder,
        targetTypeId: approvalDetailInput.targetTypeId,
        approvalStepId: selectedValue.approvalStepId?.id,
        approvalTypeId: selectedValue.approvalTypeId?.id,
        slaHours: approvalDetailInput.slaHours,
        onSLAAction: approvalDetailInput.onSLAAction?.trim(),

        approvalStepUnitMappings: selectedValue.unitId.map((unit: any) => ({
          unitId: unit.id,
        })),

        ruleSkipApproverMappings: selectedValue.ruleId.map((rule: any) => ({
          ruleId: rule.id,
        })),

        approvalStepDepartmentMappings: selectedValue.departmentId.map(
          (dept: any) => ({
            departmentId: dept.id,
          })
        ),
      };
      const { endpoint, method } =
        Config.Workflow.ApprovalDetail.UpdateApprovalDetail;
      const response = await Apirequest(endpoint, method, body, "bg").then(
        (res) => res.data
      );

      if (response.statusCode === 200) {
        toast.success(response.message);
        setOpen(false);
        setEditFlag(false);
        setApprovalDetailInput({ ...approvalDetailInput });
        GetApprovalDetailList();
      } else {
        toast.error(response.message);
        if (Array.isArray(response.errors) && response.errors.length > 0) {
          setErrorModalOpen(true);
          setErrorMessages(response.errors);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };
  const handleClickOpen = () => {
    setOpen(true);
    setApprovalDetailInput({
      ...approvalDetailInput,
      workFlowTypeId: 0,
      stepOrder: 0,
      targetTypeId: 0,
      approvalStepId: 0,
      approvalTypeId: 0,
      slaHours: 0,
      onSLAAction: "",
      approvalStepUnitMappings: [],
      ruleSkipApproverMappings: [],
      approvalStepDepartmentMappings: [],
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
    setApprovalDetailInput({
      ...approvalDetailInput,
      workFlowTypeId: 0,
      stepOrder: 0,
      targetTypeId: 0,
      approvalStepId: 0,
      approvalTypeId: 0,
      slaHours: 0,
      onSLAAction: "",
      approvalStepUnitMappings: [],
      ruleSkipApproverMappings: [],
      approvalStepDepartmentMappings: [],
      isActive: 1,
    });
    setSelectedValue({
      unitId: null,
      workflowTypeId: null,
    });
    setError([]);
  };

  const { data: WorkflowTypeData } = useDataFetchHook(
    Config.Workflow.WorkflowType.GetByWorkflowType.endpoint,
    Config.Workflow.WorkflowType.GetByWorkflowType.method,
    "bg"
  );
  const { data: UserIdData } = useDataFetchHook(
    Config.User.getByuser.endpoint,
    Config.User.getByuser.method
  );
  const { data: ApproverType } = useDataFetchHook(
    Config.Workflow.Misc.endpoint.replace("{type}", "ApproverType"),
    Config.Workflow.Misc.method,
    "bg"
  );
  const { data: ApprovalStep } = useDataFetchHook(
    Config.Workflow.Misc.endpoint.replace("{type}", "ApprovalStep"),
    Config.Workflow.Misc.method,
    "bg"
  );
  const { data: UnitData } = useDataFetchHook(
    Config.Unit.getUnitByUser.endpoint
      .replace("{companyId}", userValue.companyId)
      .replace("{userId}", userValue.userId),
    Config.Unit.getUnitByUser.method
  );
  const { data: RuleId } = useDataFetchHook(
    Config.Workflow.ApprovalRule.GetByApprovalRule.endpoint,
    Config.Workflow.ApprovalRule.GetByApprovalRule.method,
    "bg"
  );
  const { data: DepartmentData } = useDataFetchHook(
    Config.Department.getDepartment.endpoint,
    Config.Department.getDepartment.method
  );

  const handleSwitch = (e: React.ChangeEvent<HTMLInputElement>) => {
    let { checked } = e.target;
    checked
      ? setApprovalDetailInput({
          ...approvalDetailInput,
          isActive: 1,
        })
      : setApprovalDetailInput({
          ...approvalDetailInput,
          isActive: 0,
        });
  };
  const DeleteWorkflow = async () => {
    try {
      const body = {
        id: approvalDetailInput.id,
      };
      const { endpoint, method } =
        Config.Workflow.ApprovalDetail.DeleteApprovalDetail;
      const response = await Apirequest(
        endpoint.replace("{id}", `${approvalDetailInput.id}`),
        method,
        body,
        "bg"
      ).then((res) => res.data);

      if (response.statusCode === 200 || response.statusCode === 201) {
        toast.success(response.message);
        setOpen(false);
        setEditFlag(false);
        GetApprovalDetailList();
      } else {
        toast.error(response.message);
        if (Array.isArray(response.errors) && response.errors.length > 0) {
          setErrorModalOpen(true);
          setErrorMessages(response.errors);
        }
      }
    } catch (err) {
      console.log(err);
      GetApprovalDetailList();
    }
  };
  const handleDelete = (id: number) => {
    setApprovalDetailInput({ ...approvalDetailInput, id: id });
    setDeleteOpen(true);
  };
  const handleConfirmDelete = async () => {
    DeleteWorkflow();
    setDeleteOpen(false);
  };
  const handleEdit = (row: any) => {
    setEditFlag(true);
    setOpen(true);
    GetOverallDeleteList(row.id);
  };

  const handleAutocomplete = (name: string, value: any) => {
    setError([]);

    setSelectedValue((prev: any) => ({
      ...prev,
      [name]: value,
    }));

    switch (name) {
      case "targetTypeId":
        setApprovalDetailInput((prev: any) => ({
          ...prev,
          [name]: value?.userId || 0,
        }));
        break;

      case "workFlowTypeId":
      case "approvalStepId":
      case "approvalTypeId":
      case "unitId":
      case "ruleId":
      case "departmentId":
        setApprovalDetailInput((prev: any) => ({
          ...prev,
          [name]: value?.id || 0,
        }));
        break;

      default:
        break;
    }
  };

  const GetOverallDeleteList = async (id: number) => {
    try {
      const { endpoint, method } =
        Config.Workflow.ApprovalDetail.getoveralLDetail;
      const url = endpoint.replace("{id}", id?.toString() ?? id);
      const response = await Apirequest(url, method, null, "bg").then(
        (res) => res.data
      );
      if (response?.data) {
        const data = response.data;

        setApprovalDetailInput({
          workFlowTypeId: data.workFlowTypeId || 0,
          stepOrder: data.stepOrder || 0,
          targetTypeId: data.targetTypeId || 0,
          approvalStepId: data.approvalStepId || 0,
          approvalTypeId: data.approvalTypeId || 0,
          slaHours: data.slaHours || 0,
          onSLAAction: data.onSLAAction || "",
          approvalStepUnitMappings: data.approvalStepUnitMappings || [],
          ruleSkipApproverMappings: data.ruleSkipApproverMappings || [],
          approvalStepDepartmentMappings:
            data.approvalStepDepartmentMappings || [],
          isActive: data.isActive ?? 1,
          id: data.id || 0,
        });
        const selectedUnitList =
          data?.approvalStepUnitMappings
            ?.map((u: any) =>
              UnitData.find((item: any) => item.id === u.unitId)
            )
            .filter(Boolean) || [];

        const selectedWorkflow = WorkflowTypeData.find(
          (item: any) => item.id === data.workFlowTypeId
        );

        const selectedApprovalStep = ApprovalStep.find(
          (item: any) => item.id === data.approvalStepId
        );

        const selectedApprovalType = ApproverType.find(
          (item: any) => item.id === data.approvalTypeId
        );

        const selectedTarget = UserIdData.find(
          (item: any) => item.userId === data.targetTypeId
        );

        const selectedRuleList =
          data?.ruleSkipApproverMappings
            ?.map((r: any) => RuleId.find((item: any) => item.id === r.ruleId))
            .filter(Boolean) || [];

        const selectedDepartmentList =
          data?.approvalStepDepartmentMappings
            ?.map((d: any) =>
              DepartmentData.find((item: any) => item.id === d.departmentId)
            )
            .filter(Boolean) || [];

        setSelectedValue({
          unitId: selectedUnitList,
          workFlowTypeId: selectedWorkflow || null,
          approvalStepId: selectedApprovalStep || null,
          approvalTypeId: selectedApprovalType || null,
          targetTypeId: selectedTarget || null,
          ruleId: selectedRuleList,
          departmentId: selectedDepartmentList,
        });
      }
    } catch (err) {
      console.error("Error fetching approval detail by ID", err);
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
            parent={"Workflow"}
            child={"Approval Detail"}
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
            placeholder="search approval detail"
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
            rows={approvalDetailData}
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
      <CreateApprovalStepDetails
        open={open}
        close={handleClose}
        editFlag={editFlag}
        selectedValue={selectedValue}
        error={error}
        handleAutocomplete={handleAutocomplete}
        handleChange={handleChange}
        approvalDetailInput={approvalDetailInput}
        workflowTypeOptions={WorkflowTypeData}
        targetTypeOptions={UserIdData}
        approvalStepOptions={ApprovalStep}
        approvalTypeOptions={ApproverType}
        unitOptions={UnitData}
        ruleOptions={RuleId}
        departmentOptions={DepartmentData}
        handleSwitch={handleSwitch}
        handleSubmit={handleSubmit}
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

export default ApprovalDetail;
