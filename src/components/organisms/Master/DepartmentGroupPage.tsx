import { Box } from "@mui/material";
import dayjs from "dayjs";
import React, { useEffect, useState } from "react";
import { FiEdit } from "react-icons/fi";
import NoDataFound from "../../molecules/AdminLayout/NoDataFound";
import IconBreadcrumbs from "../../molecules/AdminLayout/BreadCrumbs";
import GlobalSearch from "../../molecules/AdminLayout/GlobalSearch";
import { GoPlus } from "react-icons/go";
import Config from "../../../utils/config.api.json";
import { DepartmentGroupProps } from "../../../types";
import { Apirequest } from "../../../utils/lib";
import { useDebounce } from "../../../hooks/useDebounceHook";
import { MuiButton, MuiTable } from "bsoft-base-elements";
import { usePrivilegeCheck } from "../../../hooks/usePrivilegeCheck";
import SkeletonLoader from "../../molecules/AdminLayout/SkeletonLoader";
import ErrorModal from "../../molecules/Master/Role/ErrorModal";
import CreateDepartmentGroup from "../../molecules/Master/CreateDepartmentGroup";
import toast from "react-hot-toast";

function DepartmentGroupPageTable() {
  const [departmentGroupData, setDepartmentGroupData] = useState<any[]>([]);
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
      headerName: "Group Code",
      flex: 1,
      minWidth: 150,
      valueGetter: (value: any, row: any) =>
        `${row?.departmentGroupCode.toUpperCase() || ""}`,
    },
    {
      field: "Department_name",
      headerName: "Department Group Name",
      sortable: true,
      flex: 2,
      valueGetter: (value: any, row: any) =>
        `${row?.departmentGroupName || ""}`.replace(/\b\w/g, (char) =>
          char.toUpperCase()
        ),
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
      headerName: "created Date ",
      flex: 2,
      minWidth: 150,
      valueGetter: (value: any, row: any) =>
        `${dayjs(row?.createdAt).format("DD-MM-YYYY")}`,
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
  const [departmentGroupInput, setDepartmentGroupInput] =
    useState<DepartmentGroupProps>({
      departmentGroupCode: "",
      departmentGroupName: "",
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
  };
  const handleClose = () => {
    setOpen(false);
    setEditFlag(false);
    setDepartmentGroupInput({
      departmentGroupCode: "",
      departmentGroupName: "",
      id: 0,
      isActive: 1,
    });
  };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let { name, value } = e.target;
    const filteredValue =
      name === "departmentGroupCode"
        ? value.replace(/[^a-zA-Z0-9]/g, "")
        : value;
    setDepartmentGroupInput({ ...departmentGroupInput, [name]: filteredValue });
    setError([]);
  };
  const handleSwitch = (e: React.ChangeEvent<HTMLInputElement>) => {
    let { checked } = e.target;
    checked
      ? setDepartmentGroupInput({ ...departmentGroupInput, isActive: 1 })
      : setDepartmentGroupInput({ ...departmentGroupInput, isActive: 0 });
  };
  const handleSubmit = (e: React.MouseEvent<HTMLButtonElement>) => {
    let temp: any = [];
    Object.entries(departmentGroupInput).map(([key, value]) => {
      if (
        key === "departmentGroupCode" &&
        (!value || typeof value !== "string" || value.trim().length < 0)
      ) {
        temp.push(key);
        console.log("Invalid departmentGroupCode");
      } else if (
        key === "departmentGroupName" &&
        (!value || typeof value !== "string" || value.trim().length < 0)
      ) {
        temp.push(key);
        console.log("Invalid departmentGroupName");
      }
    });
    setError(temp);
    if (temp.length === 0 && editFlag) {
      UpdateDepartmentGroup();
    } else {
      if (temp.length === 0) {
        AddDepartmentGroup();
        setLoading(false);
      }
    }
  };
  const AddDepartmentGroup = async () => {
    try {
      const body = {
        departmentGroupCode: departmentGroupInput.departmentGroupCode
          ?.trim()
          ?.toUpperCase(),
        departmentGroupName: departmentGroupInput.departmentGroupName
          ?.trim()
          .replace(/\b\w/g, (char) => char.toUpperCase()),
      };
      const { endpoint, method } = Config.DepartmentGroup.AddDepartmentGroup;
      const response = await Apirequest(endpoint, method, body).then(
        (res) => res.data
      );

      if (response.statusCode === 200 || response.statusCode === 201) {
        toast.success(response.message);
        setOpen(false);
        setDepartmentGroupInput({
          departmentGroupCode: "",
          departmentGroupName: "",
          id: 0,
          isActive: 1,
        });
        setEditFlag(false);
        GetDepartmentGroupList();
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
  const UpdateDepartmentGroup = async () => {
    try {
      const body = {
        departmentGroupCode: departmentGroupInput.departmentGroupCode
          ?.trim()
          ?.toUpperCase(),
        departmentGroupName: departmentGroupInput.departmentGroupName
          ?.trim()
          .replace(/\b\w/g, (char) => char.toUpperCase()),
        id: departmentGroupInput.id,
        isActive: departmentGroupInput.isActive,
      };
      const { endpoint, method } = Config.DepartmentGroup.UpdateDepartmentGroup;
      const response = await Apirequest(endpoint, method, body).then(
        (res) => res.data
      );

      if (response.statusCode === 200 || response.statusCode === 201) {
        toast.success(response.message);
        setOpen(false);
        setDepartmentGroupInput({
          departmentGroupCode: "",
          departmentGroupName: "",
          id: 0,
          isActive: 1,
        });
        setEditFlag(false);
        GetDepartmentGroupList();
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

  const handleEdit = (row: any) => {
    setEditFlag(true);
    setOpen(true);
    setDepartmentGroupInput({
      departmentGroupCode: row.departmentGroupCode,
      departmentGroupName: row.departmentGroupName,
      id: row.id,
      isActive: row?.isActive,
    });
  };

  const GetDepartmentGroupList = async () => {
    try {
      const { endpoint, method } = Config.DepartmentGroup;
      const result = await Apirequest(
        endpoint
          .replace("{page}", page.toString())
          .replace("{size}", size.toString())
          .replace("{searchTerm}", search),
        method
      ).then((res) => res.data);
      setDepartmentGroupData(result.data);
      setLoading(false);
      setCount(result.totalCount);
    } catch (err) {
      console.log(err);
      setDepartmentGroupData([]);
      setLoading(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  React.useEffect(() => {
    initFlag && search !== ""
      ? GetDepartmentGroupList()
      : GetDepartmentGroupList();
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
          <IconBreadcrumbs
            parent={"Master"}
            child={"Department Group"}
            path=""
          />
        </Box>
        <Box display={"flex"} gap={3}>
          <GlobalSearch
            width={300}
            placeholder={"search department-group"}
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
            rows={departmentGroupData}
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

      <CreateDepartmentGroup
        open={open}
        close={handleClose}
        departmentGroupInput={departmentGroupInput}
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
    </>
  );
}

export default DepartmentGroupPageTable;
