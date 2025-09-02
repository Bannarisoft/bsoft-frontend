import { Box } from "@mui/material";
import React, { useEffect, useState } from "react";
import { FiEdit } from "react-icons/fi";
import { RiDeleteBin6Line } from "react-icons/ri";
import NoDataFound from "../../molecules/AdminLayout/NoDataFound";
import IconBreadcrumbs from "../../molecules/AdminLayout/BreadCrumbs";
import GlobalSearch from "../../molecules/AdminLayout/GlobalSearch";
import { GoPlus } from "react-icons/go";
import Config from "../../../utils/config.api.json";
import { DepartmentProps } from "../../../types/types";
import CreateNewDepartment from "../../molecules/Master/CreateNewDepartment";
import {
  Apirequest,
  isSubmitting,
  startLoading,
  stopLoading,
} from "../../../utils/lib";
import { useDebounce } from "../../../hooks/useDebounceHook";
import DeleteConfirmation from "../../molecules/Master/DeleteConfirmation";
import { useRecoilValue } from "recoil";
import { UserData } from "../../../utils/atoms";
import { MuiButton, MuiTable } from "bsoft-base-elements";
import { usePrivilegeCheck } from "../../../hooks/usePrivilegeCheck";
import SkeletonLoader from "../../molecules/AdminLayout/SkeletonLoader";
import ErrorModal from "../../molecules/Master/Role/ErrorModal";
import { useDataFetchHook } from "../../../hooks/useDataFetchHook";
import toast from "react-hot-toast";

function DepartmentPageTable() {
  const [DepartmentData, setDepartmentData] = useState<any[]>([]);
  const [pathname, setPathName] = useState<string>("");
  const permissions = usePrivilegeCheck(pathname);
  useEffect(() => {
    setInitFlag(true);
    const currentPath = window.location.pathname.split("/bsoft").at(-1) || "";
    setPathName(currentPath);
  }, []);

  const columns = [
    {
      field: "s_no",
      headerName: "S.No",
      minWidth: 150,
      flex: 1,
      sortable: true,
      renderCell: (params: any) => {
        return (
          (page - 1) * size + (params.api.getAllRowIds().indexOf(params.id) + 1)
        );
      },
    },
    {
      field: "Department_code",
      headerName: "Short Name",
      flex: 1,
      minWidth: 150,
      valueGetter: (value: any, row: any) =>
        `${row?.shortName.toUpperCase() || ""}`,
    },
    {
      field: "Department_name",
      headerName: "Department Name",
      sortable: true,
      flex: 2,
      valueGetter: (value: any, row: any) =>
        `${row?.deptName || ""}`.replace(/\b\w/g, (char) => char.toUpperCase()),
    },
    {
      field: "Department_Group",
      headerName: "Department Group",
      sortable: true,
      flex: 2,
      valueGetter: (value: any, row: any) =>
        `${row?.departmentGroupName || ""}`,
    },
    {
      field: "isActive",
      headerName: "Status",
      flex: 1,
      minWidth: 150,
      valueGetter: (value: any, row: any) =>
        `${row?.isActive ? "Active" : "Inactive"}`,
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
          {permissions.canDelete && (
            <RiDeleteBin6Line
              fontSize={20}
              color="red"
              cursor={"pointer"}
              onClick={() => handleDelete(params.row.id)}
            />
          )}
        </Box>
      ),
    },
  ];
  const [error, setError] = useState<any>([]);
  const [loading, setLoading] = useState(true);
  const [editFlag, setEditFlag] = React.useState(false);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const debouncedSearchTerm = useDebounce(search, 500);
  const [initFlag, setInitFlag] = React.useState(false);
  const userValue = useRecoilValue(UserData);
  const [selectedDepartmentGroup, setSelectedDepartmentGroup] =
    useState<any>(null);
  const [departmentInput, setDepartmentInput] = useState<DepartmentProps>({
    shortName: "",
    deptName: "",
    companyId: 0,
    departmentGroupId: 0,
    id: 0,
    isActive: 1,
  });
  const [errorModalOpen, setErrorModalOpen] = React.useState(false);
  const [errorMessages, setErrorMessages] = React.useState<string[]>([]);
  const [open, setOpen] = React.useState(false);
  const [count, setCount] = React.useState<number>(0);
  const [page, setPage] = React.useState<number>(1);
  const [size, setSize] = React.useState<number>(15);

  const handleClickOpen = () => {
    setOpen(true);
    setError([]);
    setSelectedDepartmentGroup(null);
  };
  const handleClose = () => {
    setOpen(false);
    setEditFlag(false);
    setDepartmentInput({
      shortName: "",
      deptName: "",
      companyId: 0,
      departmentGroupId: 0,
      id: 0,
      isActive: 1,
    });
  };

  const { data: departmentGroupData } = useDataFetchHook(
    Config.DepartmentGroup.DepartmentGroupByName.endpoint,
    Config.DepartmentGroup.DepartmentGroupByName.method
  );
  const handleDepartmentGroupChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    value: any,
    field: string
  ) => {
    if (field === "deptGroupName") {
      if (!value?.id) {
        setSelectedDepartmentGroup(null);
        setDepartmentInput((prev) => ({ ...prev, departmentGroupName: 0 }));
      } else {
        setSelectedDepartmentGroup(value);
        setDepartmentInput((prev) => ({
          ...prev,
          departmentGroupName: value.id,
        }));
      }
    }
  };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let { name, value } = e.target;
    setDepartmentInput({ ...departmentInput, [name]: value });
    setError([]);
  };
  const handleSwitch = (e: React.ChangeEvent<HTMLInputElement>) => {
    let { checked } = e.target;
    checked
      ? setDepartmentInput({ ...departmentInput, isActive: 1 })
      : setDepartmentInput({ ...departmentInput, isActive: 0 });
  };
  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    let temp: string[] = [];
    if (isSubmitting()) return;

    Object.entries(departmentInput).forEach(([key, value]) => {
      if (
        key === "shortName" &&
        (!value || typeof value !== "string" || value.trim().length < 2)
      ) {
        temp.push(key);
      } else if (
        key === "deptName" &&
        (!value || typeof value !== "string" || value.trim().length < 4)
      ) {
        temp.push(key);
      }
    });

    if (selectedDepartmentGroup === null) {
      temp.push("departmentGroupId");
    }

    setError(temp);

    if (temp.length > 0) {
      toast.error("Please fill all required fields");
      stopLoading();
      return;
    }

    try {
      if (editFlag) {
        await Updatedepartment();
      } else {
        await AddDepartment();
        setLoading(false);
      }
    } catch (err) {
      console.error("Error in handleSubmit:", err);
    } finally {
      stopLoading();
    }
  };

  const AddDepartment = async () => {
    try {
      startLoading();
      const body = {
        shortName: departmentInput.shortName?.trim(),
        deptName: departmentInput.deptName
          ?.trim()
          .replace(/\b\w/g, (char) => char.toUpperCase()),
        companyId: userValue.companyId,
        departmentGroupId: selectedDepartmentGroup.id,
        isActive: 1,
      };
      const { endpoint, method } = Config.Department.addDepartment;
      const response = await Apirequest(endpoint, method, body).then(
        (res) => res.data
      );

      if (response.statusCode === 200 || response.statusCode === 201) {
        toast.success(response.message);
        setOpen(false);
        setDepartmentInput({
          shortName: "",
          deptName: "",
          companyId: 0,
          departmentGroupId: 0,
          id: 0,
          isActive: 1,
        });
        setEditFlag(false);
        GetDepartmentList();
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
  const Updatedepartment = async () => {
    try {
      startLoading();
      const body = {
        shortName: departmentInput.shortName?.trim(),
        deptName: departmentInput.deptName
          ?.trim()
          .replace(/\b\w/g, (char) => char.toUpperCase()),
        companyId: userValue.companyId,
        departmentGroupId: selectedDepartmentGroup.id,
        id: departmentInput.id,
        isActive: departmentInput.isActive,
      };
      const { endpoint, method } = Config.Department.updateDepartment;
      const response = await Apirequest(endpoint, method, body).then(
        (res) => res.data
      );

      if (response.statusCode === 200 || response.statusCode === 201) {
        toast.success(response.message);
        setOpen(false);
        setDepartmentInput({
          shortName: "",
          deptName: "",
          companyId: 0,
          departmentGroupId: 0,
          id: 0,
          isActive: 1,
        });
        setEditFlag(false);
        GetDepartmentList();
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

  const handleEdit = (row: any) => {
    setEditFlag(true);
    setOpen(true);
    setDepartmentInput({
      shortName: row.shortName,
      deptName: row.deptName,
      companyId: row.companyId,
      departmentGroupId: row.departmentGroupId,
      id: row.id,
      isActive: row?.isActive,
    });
    setSelectedDepartmentGroup(
      departmentGroupData.find((item: any) => item.id === row.departmentGroupId)
    );
  };

  const handleDelete = (id: number) => {
    setDepartmentInput({ ...departmentInput, id: id });
    setDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    DeleteDepartment();
    setDeleteOpen(false);
  };

  const DeleteDepartment = async () => {
    try {
      const body = {
        id: departmentInput.id,
      };
      const { endpoint, method } = Config.Department.deleteDepartment;
      const response = await Apirequest(
        endpoint.replace("{id}", `${departmentInput.id}`),
        method,
        body
      ).then((res) => res.data);

      if (response.statusCode === 200 || response.statusCode === 201) {
        toast.success(response.message);
        setOpen(false);
        setEditFlag(false);
        GetDepartmentList();
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
  const GetDepartmentList = async () => {
    try {
      const { endpoint, method } = Config.Department;
      const result = await Apirequest(
        endpoint
          .replace("{page}", page.toString())
          .replace("{size}", size.toString())
          .replace("{searchTerm}", search),
        method
      ).then((res) => res.data);
      setDepartmentData(result.data);
      setLoading(false);
      setCount(result.totalCount);
    } catch (err) {
      console.log(err);
      setDepartmentData([]);
      setLoading(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  React.useEffect(() => {
    initFlag && search !== "" ? GetDepartmentList() : GetDepartmentList();
  }, [debouncedSearchTerm, page, size]);
  useEffect(() => {
    setInitFlag(true);
  }, []);

  return (
    <>
      <Box
        display={"flex"}
        justifyContent={"space-between"}
        alignItems={"center"}
        flexWrap={"wrap"}
        gap={2}
      >
        <Box display={"flex"}>
          <IconBreadcrumbs parent={"Master"} child={"Department"} path="" />
        </Box>
        <Box display={"flex"} gap={3}>
          <GlobalSearch
            width={300}
            placeholder={"search department"}
            onChange={handleSearch}
          />
          <Box
            display={"flex"}
            justifyContent={"space-between"}
            alignItems={"center"}
            flexWrap={"wrap"}
            gap={2}
          >
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
            rows={DepartmentData}
            columns={columns}
            initialState={{
              pagination: {
                paginationModel: {
                  pageSize: size,
                },
              },
            }}
            slots={{
              noRowsOverlay: () => <NoDataFound />,
            }}
            onPaginationModelChange={(newPage) => {
              setPage(newPage.page + 1);
              setSize(newPage.pageSize);
            }}
            rowCount={count}
            rowHeight={40}
            columnHeaderHeight={40}
            pageSizeOptions={[15, 30, 50]}
            disableRowSelectionOnClick
          />
        )}
      </Box>

      <CreateNewDepartment
        open={open}
        close={handleClose}
        departmentInput={departmentInput}
        handleSubmit={handleSubmit}
        handleChange={handleChange}
        error={error}
        handleSwitch={handleSwitch}
        departmentGroupData={departmentGroupData}
        handleDepartmentGroupChange={handleDepartmentGroupChange}
        selectedDepartmentGroup={selectedDepartmentGroup}
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
}

export default DepartmentPageTable;
