import { Box } from "@mui/material";
import React, { useEffect } from "react";
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
import CreateWorkflowType from "../../../molecules/Workflow/Master/CreateWorkflowType";
import { useDataFetchHook } from "../../../../hooks/useDataFetchHook";
import { WorkflowTypesProps } from  "../../../../types/types";
import toast from "react-hot-toast";
import ErrorModal from "../../../molecules/Master/Role/ErrorModal";
import DeleteConfirmation from "../../../molecules/Master/DeleteConfirmation";

const WorkflowTypePage = () => {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const debouncedSearchTerm = useDebounce(search, 500);
  const [selectedValue, setSelectedValue] = React.useState<any>(null);
  const [page, setPage] = React.useState<number>(1);
  const [size, setSize] = React.useState<number>(15);
  const [count, setCount] = React.useState<number>(0);
  const [workflowTypeData, setWorkflowTypeData] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [initFlag, setInitFlag] = React.useState(false);
  const [editFlag, setEditFlag] = React.useState(false);
  const [error, setError] = React.useState<any[]>([]);
  const [errorModalOpen, setErrorModalOpen] = React.useState(false);
  const [errorMessages, setErrorMessages] = React.useState<string[]>([]);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [workflowInput, setWorkflowInput] = React.useState<WorkflowTypesProps>({
    moduleTypeName: "",
    moduleId: 0,
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
  const GetWorkflowTypeList = async () => {
    try {
      const { endpoint, method } = Config.Workflow.WorkflowType;
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
      setWorkflowTypeData(result.data);
      setCount(result.totalCount);
    } catch (err) {
      console.log(err);
      setLoading(false);
    }
  };
  useEffect(() => {
    initFlag && search !== "" ? GetWorkflowTypeList() : GetWorkflowTypeList();
  }, [debouncedSearchTerm, page, size]);
  const { data: ModuleData } = useDataFetchHook(
    Config.Module.getModule.endpoint,
    Config.Module.getModule.method
  );

  const handleEdit = (row: any) => {
    setEditFlag(true);
    setOpen(true);
    setWorkflowInput({
      ...workflowInput,
      moduleTypeName: row?.moduleTypeName,
      moduleId: row?.moduleId,
      id: row?.id,
      isActive: row?.isActive,
    });
    const selectedModule = ModuleData.find(
      (item: any) => item.id === row.moduleId
    );
    setSelectedValue(selectedModule || null);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };
  const handleClickOpen = () => {
    setOpen(true);
    setSelectedValue(null);
    setWorkflowInput({
      ...workflowInput,
      moduleTypeName: "",
      isActive: 1,
    });
  };
  const handleClose = () => {
    setOpen(false);
    setEditFlag(false);
    setSelectedValue(null);
    setWorkflowInput({
      ...workflowInput,
      moduleTypeName: "",
    });
    setError([]);
  };
  const handleAutocomplete = (
    e: React.SyntheticEvent,
    value: { id: number; moduleName: string } | null
  ) => {
    setError([]);
    if (!value) {
      setSelectedValue(null);
    } else {
      setSelectedValue(value);
    }
  };
  const handleSwitch = (e: React.ChangeEvent<HTMLInputElement>) => {
    let { checked } = e.target;
    checked
      ? setWorkflowInput({
          ...workflowInput,
          isActive: 1,
        })
      : setWorkflowInput({
          ...workflowInput,
          isActive: 0,
        });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setWorkflowInput({
      ...workflowInput,
      [name]: value,
    });
    setError([]);
  };

  const handleSubmit = (e: React.MouseEvent<HTMLButtonElement>) => {
    let tempErrors: string[] = [];
    if (
      !workflowInput.moduleTypeName ||
      workflowInput.moduleTypeName.trim() === ""
    ) {
      tempErrors.push("moduleTypeName");
    }
    if (
      !selectedValue ||
      !selectedValue.moduleName ||
      selectedValue.moduleName.trim() === ""
    ) {
      tempErrors.push("moduleId");
    }
    setError(tempErrors);
    if (tempErrors.length === 0) {
      setLoading(true);
      if (editFlag) {
        UpdateWorkflow();
      } else {
        AddWorkflow();
      }
    }
  };

  const AddWorkflow = async () => {
    try {
      const body: any = {
        moduleTypeName: workflowInput.moduleTypeName
          ?.trim()
          .replace(/\b\w/g, (char: any) => char.toUpperCase()),
        moduleId: selectedValue.id,
      };

      if (editFlag) {
        body.id = Number(workflowInput.id);
      }
      const { endpoint, method } = Config.Workflow.WorkflowType.AddWorkflowType;
      const response = await Apirequest(endpoint, method, body, "bg").then(
        (res) => res.data
      );

      if (response.statusCode === 200 || response.statusCode === 201) {
        toast.success(response.message);
        setOpen(false);
        setEditFlag(false);
        setWorkflowInput({ ...workflowInput });
        GetWorkflowTypeList();
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

  const UpdateWorkflow = async () => {
    try {
      const body: any = {
        moduleTypeName: workflowInput.moduleTypeName
          ?.trim()
          .replace(/\b\w/g, (char: any) => char.toUpperCase()),
        moduleId: selectedValue.id,
        id: workflowInput.id,
        isActive: workflowInput.isActive,
      };
      const { endpoint, method } =
        Config.Workflow.WorkflowType.UpdateWorkflowType;

      const response = await Apirequest(endpoint, method, body, "bg").then(
        (res) => res.data
      );
      if (response.statusCode === 200) {
        toast.success(response.message);
        setOpen(false);
        setWorkflowInput({ ...workflowInput });
        setEditFlag(false);
        GetWorkflowTypeList();
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
        id: workflowInput.id,
      };
      const { endpoint, method } =
        Config.Workflow.WorkflowType.DeleteWorkflowType;
      const response = await Apirequest(
        endpoint.replace("{id}", `${workflowInput.id}`),
        method,
        body,
        "bg"
      ).then((res) => res.data);

      if (response.statusCode === 200 || response.statusCode === 201) {
        toast.success(response.message);
        setOpen(false);
        setEditFlag(false);
        GetWorkflowTypeList();
      } else {
        toast.error(response.message);
        if (Array.isArray(response.errors) && response.errors.length > 0) {
          setErrorModalOpen(true);
          setErrorMessages(response.errors);
        }
      }
    } catch (err) {
      console.log(err);
      GetWorkflowTypeList();
    }
  };
  const handleDelete = (id: number) => {
    setWorkflowInput({ ...workflowInput, id: id });
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
            child={"Workflow Type"}
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
            placeholder="search workflow"
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
            rows={workflowTypeData}
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
      <CreateWorkflowType
        open={open}
        close={handleClose}
        editFlag={editFlag}
        ModuleData={ModuleData}
        handleAutocomplete={handleAutocomplete}
        selectedValue={selectedValue}
        workflowInput={workflowInput}
        handleChange={handleChange}
        error={error}
        handleSubmit={handleSubmit}
        handleSwitch={handleSwitch}
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

export default WorkflowTypePage;
