import { Box } from "@mui/material";
import React, { useEffect, useState } from "react";
import IconBreadcrumbs from "../../molecules/AdminLayout/BreadCrumbs";
import GlobalSearch from "../../molecules/AdminLayout/GlobalSearch";
import { GoPlus } from "react-icons/go";
import CreateNewEntity from "../../molecules/Master/CreateNewEntity";
import Config from "../../../../src/utils/config.api.json";
import { Apirequest, emailRegex } from "../../../utils/lib";
import { FiEdit } from "react-icons/fi";
import { RiDeleteBin6Line } from "react-icons/ri";
import { EntiryPropTypes } from "../../../types";
import NoDataFound from "../../molecules/AdminLayout/NoDataFound";
import DeleteConfirmation from "../../molecules/Master/DeleteConfirmation";
import { useDebounce } from "../../../hooks/useDebounceHook";
import { MuiButton, MuiTable } from "bsoft-base-elements";
import { usePrivilegeCheck } from "../../../hooks/usePrivilegeCheck";
import SkeletonLoader from "../../molecules/AdminLayout/SkeletonLoader";
import ErrorModal from "../../molecules/Master/Role/ErrorModal";
import toast from "react-hot-toast";

function EntityPage() {
  const [entityData, setEntityData] = useState<any[]>([]);
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
      flex: 1,
      minWidth: 150,
      sortable: true,
      renderCell: (params: any) => {
        return (
          (page - 1) * size + (params.api.getAllRowIds().indexOf(params.id) + 1)
        );
      },
    },
    {
      field: "entity_code",
      headerName: "Entity Code",
      flex: 1,
      minWidth: 150,
      valueGetter: (value: any, row: any) =>
        `${row?.entityCode.toUpperCase() || ""}`,
    },
    {
      field: "entity_name",
      headerName: "Entity Name",
      sortable: true,
      flex: 2,
      minWidth: 150,
      valueGetter: (value: any, row: any) =>
        `${row?.entityName || ""}`.replace(/\b\w/g, (char) =>
          char.toUpperCase()
        ),
    },
    {
      field: "phone",
      headerName: "Phone",
      sortable: true,
      flex: 2,
      minWidth: 150,
      valueGetter: (value: any, row: any) => `${row?.phone || ""}`,
    },
    {
      field: "email",
      headerName: "Email",
      sortable: true,
      flex: 2,
      minWidth: 150,
      valueGetter: (value: any, row: any) => `${row?.email || ""}`,
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
  const [entityInput, setEntityInput] = useState<EntiryPropTypes>({
    entityName: "",
    entityDescription: "",
    address: "",
    phone: "",
    email: "",
    isActive: 1,
    id: 0,
  });
  const [open, setOpen] = React.useState(false);
  const [error, setError] = useState<any[]>([]);

  const [editFlag, setEditFlag] = React.useState(false);
  const handleClickOpen = () => {
    setOpen(true);
    setError([]);
    setEntityInput({
      entityName: "",
      entityDescription: "",
      address: "",
      phone: "",
      email: "",
      isActive: 1,
      id: 0,
    });
  };
  const [loading, setLoading] = useState(true);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [initFlag, setInitFlag] = React.useState(false);
  const debouncedSearchTerm = useDebounce(search, 500);
  const [count, setCount] = React.useState<number>(0);
  const [page, setPage] = React.useState<number>(1);
  const [size, setSize] = React.useState<number>(15);
  const [errorModalOpen, setErrorModalOpen] = React.useState(false);
  const [errorMessages, setErrorMessages] = React.useState<string[]>([]);
  const handleClose = () => {
    setOpen(false);
    setError([]);
    setEntityInput({
      entityName: "",
      entityDescription: "",
      address: "",
      phone: "",
      email: "",
      isActive: 1,
      id: 0,
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let { name, value } = e.target;
    setEntityInput({ ...entityInput, [name]: value });
    setError([]);
  };

  const handleSwitch = (e: React.ChangeEvent<HTMLInputElement>) => {
    let { checked } = e.target;
    checked
      ? setEntityInput({ ...entityInput, isActive: 1 })
      : setEntityInput({ ...entityInput, isActive: 0 });
  };

  const handleSubmit = (e: React.MouseEvent<HTMLButtonElement>) => {
    let temp: any = [];
    Object.entries(entityInput).map(([key, value]) => {
      if (key === "entityName" && value?.length < 2) {
        temp.push(key);
      } else if (key === "address" && value?.length < 10) {
        temp.push(key);
      } else if (key === "phone" && value.length !== 10) {
        temp.push(key);
      } else if (key === "email" && !emailRegex.test(value)) {
        temp.push(key);
      }
    });
    setError(temp);

    if (temp.length === 0 && editFlag) {
      UpdateEntity();
    } else {
      if (temp.length === 0) {
        AddEntity();
        setLoading(false);
      }
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const handleEdit = (row: any) => {
    setEditFlag(true);
    setOpen(true);
    setEntityInput({
      ...entityInput,
      entityName: row?.entityName,
      entityDescription: row?.entityDescription,
      address: row?.address,
      phone: row?.phone,
      email: row?.email,
      isActive: row?.isActive,
      id: row?.id,
    });
  };

  const handleDelete = (id: any) => {
    setEntityInput({ ...entityInput, id: id });
    setDeleteOpen(true);
    console.log("Deleted user with ID:", id);
  };

  const handleConfirmDelete = async () => {
    DeleteEntity();
    setDeleteOpen(false);
  };
  const DeleteEntity = async () => {
    try {
      const body = {
        entityId: entityInput.id,
      };
      const { endpoint, method } = Config.Entities.deleteEntity;
      const response = await Apirequest(
        endpoint.replace("{id}", `${entityInput.id}`),
        method,
        body
      ).then((res) => res.data);

      if (response.statusCode === 200 || response.statusCode === 201) {
        toast.success(response.message);
        setOpen(false);
        setEntityInput({
          entityName: "",
          entityDescription: "",
          address: "",
          phone: "",
          email: "",
          isActive: 0,
        });
        setEditFlag(false);
        GetEntityList();
      } else {
        toast.error(
          response.message || "Something went wrong, please try again later"
        );
        if (Array.isArray(response.errors) && response.errors.length > 0) {
          setErrorModalOpen(true);
          setErrorMessages(response.errors);
        }
      }
    } catch (err) {
      console.log(err);
    }
  };

  const UpdateEntity = async () => {
    try {
      const body = {
        ...entityInput,
        entityName: entityInput.entityName
          ?.trim()
          .replace(/\b\w/g, (char) => char.toUpperCase()),
      };
      const { endpoint, method } = Config.Entities.updateEntity;
      const response = await Apirequest(endpoint, method, body).then(
        (res) => res.data
      );

      if (response.statusCode === 200 || response.statusCode === 201) {
        toast.success(response.message);
        setOpen(false);
        setEntityInput({
          entityName: "",
          entityDescription: "",
          address: "",
          phone: "",
          email: "",
          isActive: 0,
        });
        setEditFlag(false);
        GetEntityList();
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

  const AddEntity = async () => {
    try {
      const body = {
        ...entityInput,
        entityName: entityInput.entityName
          ?.trim()
          .replace(/\b\w/g, (char) => char.toUpperCase()),
      };
      const { endpoint, method } = Config.Entities.addEntity;
      const response = await Apirequest(endpoint, method, body).then(
        (res) => res.data
      );

      if (response.statusCode === 200 || response.statusCode === 201) {
        toast.success(response.message);
        setOpen(false);
        setEntityInput({
          entityName: "",
          entityDescription: "",
          address: "",
          phone: "",
          email: "",
          isActive: 0,
        });
        setEditFlag(false);
        GetEntityList();
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

  const GetEntityList = async () => {
    try {
      const { endpoint, method } = Config.Entities;
      const result = await Apirequest(
        endpoint
          .replace("{page}", page.toString())
          .replace("{size}", size.toString())
          .replace("{searchTerm}", search),
        method
      ).then((res) => res.data);
      setEntityData(result.data);
      setLoading(false);
      setCount(result.totalCount);
    } catch (err) {
      console.log(err);
      setEntityData([]);
    }
  };

  React.useEffect(() => {
    initFlag && search !== "" ? GetEntityList() : GetEntityList();
  }, [debouncedSearchTerm, page, size]);
  React.useEffect(() => {
    console.log(loading);
  }, [loading]);
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
          <IconBreadcrumbs parent={"Master"} child={"Entity"} path="" />
        </Box>
        <Box
          display={"flex"}
          justifyContent={"space-between"}
          alignItems={"center"}
          flexWrap={"wrap"}
          gap={2}
        >
          <GlobalSearch
            placeholder="search entity"
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
      <Box sx={{ width: "100%", my: 2, height: 700 }} className="main-table">
        {loading ? (
          <SkeletonLoader />
        ) : (
          <MuiTable
            rows={entityData}
            columns={columns}
            paginationMode="server"
            initialState={{
              pagination: {
                paginationModel: {
                  pageSize: size,
                },
              },
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
            slots={{
              noRowsOverlay: () => <NoDataFound />,
            }}
          />
        )}
      </Box>
      <CreateNewEntity
        open={open}
        close={handleClose}
        entityInput={entityInput}
        handleChange={handleChange}
        handleSubmit={handleSubmit}
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

export default EntityPage;
