import { Box } from "@mui/material";
import React, { useEffect, useState } from "react";
import IconBreadcrumbs from "../../molecules/AdminLayout/BreadCrumbs";
import GlobalSearch from "../../molecules/AdminLayout/GlobalSearch";
import { GoPlus } from "react-icons/go";
import { FiEdit } from "react-icons/fi";
import { RiDeleteBin6Line } from "react-icons/ri";
import { DataGrid } from "@mui/x-data-grid";
import NoDataFound from "../../molecules/AdminLayout/NoDataFound";
import { Apirequest } from "../../../utils/lib";
import Config from "../../../../src/utils/config.api.json";
import { useDebounce } from "../../../hooks/useDebounceHook";
import CreateNewRole from "../../molecules/Master/Role/CreateNewRole";
import { RoleProps } from "../../../types";
import { useRecoilValue } from "recoil";
import { UserData } from "../../../utils/atoms";
import DeleteConfirmation from "../../molecules/Master/DeleteConfirmation";
import { usePrivilegeCheck } from "../../../hooks/usePrivilegeCheck";
import { MuiButton } from "bsoft-base-elements";
import ErrorModal from "../../molecules/Master/Role/ErrorModal";
import SkeletonLoader from "../../molecules/AdminLayout/SkeletonLoader";
import toast from "react-hot-toast";

function RolePageList() {
  const [roleData, setRoleData] = useState<any[]>([]);
  const [pathname, setPathName] = useState<string>("");
  const permissions = usePrivilegeCheck(pathname);
  useEffect(() => {
    setInitFlag(true);
    const currentPath = window.location.pathname.split("/bsoft").at(-1) || "";
    setPathName(currentPath);
  }, []);
  const [errorModalOpen, setErrorModalOpen] = React.useState(false);
  const [errorMessages, setErrorMessages] = React.useState<string[]>([]);

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
      field: "Role_Name",
      headerName: "Role Name",
      flex: 2,
      minWidth: 150,
      valueGetter: (value: any, row: any) =>
        `${row?.roleName || ""}`.replace(/\b\w/g, (char) => char.toUpperCase()),
    },
    {
      field: "Description",
      headerName: "Description",
      sortable: true,
      flex: 2,
      valueGetter: (value: any, row: any) => `${row?.description || ""}`,
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

  const [editFlag, setEditFlag] = React.useState(false);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = React.useState<number>(1);
  const [size, setSize] = React.useState<number>(15);
  const [count, setCount] = React.useState<number>(0);
  const [search, setSearch] = React.useState("");
  const [initFlag, setInitFlag] = React.useState(false);
  const debouncedSearchTerm = useDebounce(search, 500);
  const [open, setOpen] = React.useState(false);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const userValue = useRecoilValue(UserData);
  const [roleInput, setRoleInput] = useState<RoleProps>({
    roleName: "",
    description: "",
    companyId: 0,
    id: 0,
    isActive: 1,
  });
  useEffect(() => {
    setRoleInput({
      ...roleInput,
      companyId:
        typeof userValue.companyId === "string" &&
        (userValue.companyId.startsWith("{") ||
          userValue.companyId.startsWith("["))
          ? JSON.parse(userValue.companyId).at(0)?.CompanyId ?? ""
          : "",
    });
  }, [userValue]);
  const [error, setError] = useState<any[]>([]);

  const handleClickOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
    setRoleInput({ ...roleInput, roleName: "", description: "", id: 0 });
    setEditFlag(false);
  };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let { name, value } = e.target;
    setRoleInput({ ...roleInput, [name]: value });
    setError([]);
  };
  const handleSwitch = (e: React.ChangeEvent<HTMLInputElement>) => {
    let { checked } = e.target;
    checked
      ? setRoleInput({ ...roleInput, isActive: 1 })
      : setRoleInput({ ...roleInput, isActive: 0 });
  };

  const handleEdit = (row: any) => {
    setEditFlag(true);
    setOpen(true);
    setRoleInput({
      ...roleInput,
      roleName: row.roleName,
      description: row.description,
      id: row.id,
      isActive: row.isActive,
    });
  };
  const GetRoleList = async () => {
    try {
      const { endpoint, method } = Config.Role;
      const response = await Apirequest(
        endpoint
          .replace("{page}", page.toString())
          .replace("{size}", size.toString())
          .replace("{searchTerm}", search),
        method
      ).then((res) => res.data);
      setLoading(false);
      setRoleData(response.data);
      setCount(response.totalCount);
    } catch (err) {
      console.log(err);
      setLoading(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const handleSubmit = (e: React.MouseEvent<HTMLButtonElement>) => {
    let temp: any = [];
    Object.entries(roleInput).map(([key, value]) => {
      if (key === "roleName" && value?.length === 0) {
        temp.push(key);
      } else if (key === "description" && value?.length === 0) {
        temp.push(key);
      }
    });
    setError(temp);
    if (temp.length === 0 && editFlag) {
      UpdateRole();
    } else if (temp.length === 0) {
      AddRole();
      setLoading(false);
    }
  };

  const AddRole = async () => {
    try {
      const body = {
        companyId: userValue.companyId,
        roleName: roleInput.roleName?.trim().toUpperCase(),
        description: roleInput.description?.trim(),
        isActive: roleInput.isActive,
      };
      const { endpoint, method } = Config.Role.addrole;
      const response = await Apirequest(endpoint, method, body).then(
        (res) => res.data
      );
      if (response.statusCode === 200 || response.statusCode === 201) {
        toast.success(response.message);
        setOpen(false);
        setRoleInput({
          ...roleInput,
          roleName: "",
          description: "",
          companyId: roleInput.companyId,
          id: 0,
          isActive: 1,
        });
        setEditFlag(false);
        GetRoleList();
      } else {
        toast.error(response.message);
        if (Array.isArray(response.errors) && response.errors.length > 0) {
          setErrorModalOpen(true);
          if (Array.isArray(response.errors) && response.errors.length > 0) {
            setErrorModalOpen(true);
            setErrorMessages(response.errors);
          }
        }
      }
    } catch (err) {
      console.log(err);
    }
  };

  const UpdateRole = async () => {
    try {
      const body = {
        companyId: userValue.companyId,
        roleName: roleInput.roleName?.trim().toUpperCase(),
        description: roleInput.description?.trim(),
        isActive: roleInput.isActive,
        id: roleInput.id,
      };
      const { endpoint, method } = Config.Role.updaterole;
      const response = await Apirequest(endpoint, method, body).then(
        (res) => res.data
      );
      if (response.statusCode === 200 || response.statusCode === 201) {
        toast.success(response.message);
        setOpen(false);
        setRoleInput({
          ...roleInput,
          roleName: "",
          description: "",
          id: 0,
          isActive: 1,
          companyId: roleInput.companyId,
        });
        setEditFlag(false);
        GetRoleList();
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
  const handleDelete = (id: number) => {
    setRoleInput({ ...roleInput, id: id });
    setDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    DeleteRole();
    setDeleteOpen(false);
  };

  const DeleteRole = async () => {
    try {
      const body = {
        id: roleInput.id,
      };
      const { endpoint, method } = Config.Role.deleterole;
      const response = await Apirequest(
        endpoint.replace("{id}", `${roleInput.id}`),
        method,
        body
      ).then((res) => res.data);
      if (response.statusCode === 200 || response.statusCode === 201) {
        toast.success(response.message);
        setOpen(false);

        setEditFlag(false);
        GetRoleList();
      } else {
        toast.error(response.message);
        if (Array.isArray(response.errors) && response.errors.length > 0) {
          setErrorModalOpen(true);
          setErrorMessages(response.errors);
        }
      }
    } catch (err) {
      console.log(err);
      GetRoleList();
    }
  };

  React.useEffect(() => {
    initFlag && search !== "" ? GetRoleList() : GetRoleList();
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
        <Box>
          <IconBreadcrumbs parent={"Master"} child={"Role"} path="" />
        </Box>
        <Box
          display={"flex"}
          justifyContent={"space-between"}
          alignItems={"center"}
          flexWrap={"wrap"}
          gap={2}
        >
          <GlobalSearch
            placeholder="search role"
            width={300}
            onChange={handleSearch}
          />
          <Box className="d-flex-center" gap={2}>
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

      <Box sx={{ width: "100%", my: 3, height: 700 }} className="main-table">
        {loading ? (
          <SkeletonLoader />
        ) : (
          <DataGrid
            rows={roleData}
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
            rowHeight={40}
            columnHeaderHeight={40}
            pageSizeOptions={[15, 30, 50]}
            disableRowSelectionOnClick
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
      <CreateNewRole
        open={open}
        close={handleClose}
        roleInput={roleInput}
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
}

export default RolePageList;
