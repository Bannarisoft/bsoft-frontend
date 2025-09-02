"use client";
import React, { useEffect, useState } from "react";
import { Box } from "@mui/material";
import IconBreadcrumbs from "../../molecules/AdminLayout/BreadCrumbs";
import GlobalSearch from "../../molecules/AdminLayout/GlobalSearch";
import { MuiButton, MuiTable } from "bsoft-base-elements";
import { GoPlus } from "react-icons/go";
import NoDataFound from "../../molecules/AdminLayout/NoDataFound";
import dayjs from "dayjs";
import { FiEdit } from "react-icons/fi";
import { RiDeleteBin6Line } from "react-icons/ri";
import CreateMaintanenceType from "../../molecules/Maintanence/CreateMaintanenceType";
import { useDebounce } from "../../../hooks/useDebounceHook";
import DeleteConfirmation from "../../molecules/Master/DeleteConfirmation";
import MainConfig from "../../../utils/main.api.json";
import {
  Apirequest,
  isSubmitting,
  startLoading,
  stopLoading,
} from "../../../utils/lib";
import config from "../../../utils/main.api.json";
import SkeletonLoader from "../../molecules/AdminLayout/SkeletonLoader";
import ErrorModal from "../../molecules/Master/Role/ErrorModal";
import { usePrivilegeCheck } from "../../../hooks/usePrivilegeCheck";
import toast from "react-hot-toast";
const MaintanenceTypePage = () => {
  const [pathname, setPathName] = useState<string>("");
  const permissions = usePrivilegeCheck(pathname);
  useEffect(() => {
    setInitFlag(true);
    const currentPath = window.location.pathname.split("/bsoft").at(-1) || "";
    setPathName(currentPath);
  }, []);
  const [open, setOpen] = React.useState(false);
  const [maintanenceTypeData, setMaintanenceTypeData] = React.useState<any[]>(
    []
  );

  const [error, setError] = React.useState<any[]>([]);
  const [search, setSearch] = React.useState("");
  const [page, setPage] = React.useState<number>(1);
  const [size, setSize] = React.useState<number>(15);
  const [loading, setLoading] = React.useState(false);
  const [count, setCount] = React.useState(0);
  const [editFlag, setEditFlag] = React.useState(false);
  const [initFlag, setInitFlag] = React.useState(false);
  const debouncedSearchTerm = useDebounce(search, 500);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [errorModalOpen, setErrorModalOpen] = React.useState(false);
  const [errorMessages, setErrorMessages] = React.useState<string[]>([]);
  const [maintanenceTypeInput, setMaintanenceTypeInput] = React.useState<any>({
    typeName: "",
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
      field: "maitenenceType",
      headerName: "Maintanence Type",
      flex: 2,
      minWidth: 200,
      valueGetter: (value: any, row: any) =>
        `${row?.typeName || ""}`.replace(/\b\w/g, (char) => char.toUpperCase()),
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
  const handleClickOpen = () => {
    setOpen(true);
    setEditFlag(false);
    setMaintanenceTypeInput({ ...maintanenceTypeInput, typeName: "" });
    setError([]);
  };
  const handleClose = () => {
    setOpen(false);
    setMaintanenceTypeInput({ ...maintanenceTypeInput, typeName: "" });
    setEditFlag(false);
    setError([]);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let { name, value } = e.target;
    setMaintanenceTypeInput({ ...maintanenceTypeInput, [name]: value });
    setError([]);
  };

  const AddMaintanencetype = async () => {
    try {
      startLoading();
      const body: any = {
        typeName: maintanenceTypeInput.typeName
          ?.trim()
          .replace(/\b\w/g, (char: any) => char.toUpperCase()),
      };

      if (editFlag) {
        body.id = Number(maintanenceTypeInput.id);
      }
      const { endpoint, method } = config.MaintanenceType.PostMaintanenceType;
      const response = await Apirequest(endpoint, method, body, "main").then(
        (res) => res.data
      );

      if (response.statusCode === 200 || response.statusCode === 201) {
        toast.success(response.message);
        setOpen(false);
        setEditFlag(false);
        setMaintanenceTypeInput({ ...maintanenceTypeInput });
        GetMaintanenceTypeList();
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

  const UpdateMaintanencetype = async () => {
    try {
      startLoading();
      const body: any = {
        typeName: maintanenceTypeInput.typeName
          ?.trim()
          .replace(/\b\w/g, (char: any) => char.toUpperCase()),
        id: maintanenceTypeInput.id,
        isActive: maintanenceTypeInput.isActive,
      };

      const { endpoint, method } = config.MaintanenceType.UpdateMaintanenceType;
      const response = await Apirequest(endpoint, method, body, "main").then(
        (res) => res.data
      );
      if (response.statusCode === 200) {
        toast.success(response.message);
        setOpen(false);
        setMaintanenceTypeInput({ ...maintanenceTypeInput });
        setEditFlag(false);
        GetMaintanenceTypeList();
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
  const handleSwitch = (e: React.ChangeEvent<HTMLInputElement>) => {
    let { checked } = e.target;
    checked
      ? setMaintanenceTypeInput({ ...maintanenceTypeInput, isActive: 1 })
      : setMaintanenceTypeInput({ ...maintanenceTypeInput, isActive: 0 });
  };

  const DeleteMaintanencetype = async (id: number) => {
    try {
      const { endpoint, method } = config.MaintanenceType.DeleteMaintanenceType;
      const deleteEndpoint = endpoint.replace("{id}", id.toString());

      const result = await Apirequest(
        deleteEndpoint,
        method,
        null,
        "main"
      ).then((res) => res.data);
      toast.success(result?.message);
      GetMaintanenceTypeList();
    } catch (err) {
      console.log(err);
    }
  };
  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    if (isSubmitting()) return; // Prevent multiple submissions

    let temp: string[] = [];

    Object.entries(maintanenceTypeInput).forEach(([key, value]) => {
      if (
        key === "maitenenceType" &&
        typeof value === "string" &&
        value.trim().length === 0
      ) {
        temp.push(key);
      }
    });

    setError(temp);

    if (temp.length > 0) {
      toast.error("Please fill all mandatory fields.");
      return;
    }

    try {
      startLoading();

      if (editFlag) {
        await UpdateMaintanencetype();
      } else {
        await AddMaintanencetype();
      }
    } catch (error) {
      console.error("Error submitting maintenance type:", error);
    } finally {
      stopLoading();
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };
  const handleEdit = (row: any) => {
    setEditFlag(true);
    setOpen(true);
    setMaintanenceTypeInput({
      typeName: row?.typeName,
      id: row?.id,
      isActive: row?.isActive,
    });
  };
  const handleConfirmDelete = async () => {
    if (maintanenceTypeInput.id) {
      await DeleteMaintanencetype(maintanenceTypeInput.id);
    }
    setDeleteOpen(false);
  };
  const handleDelete = (id: number) => {
    setMaintanenceTypeInput({ ...maintanenceTypeInput, id: id });
    setDeleteOpen(true);
  };

  const GetMaintanenceTypeList = async () => {
    try {
      setLoading(true);
      const response = await Apirequest(
        MainConfig.MaintanenceType.GetMaintanenceType.endpoint
          .replace("{page}", page.toString())
          .replace("{size}", size.toString())
          .replace("{searchTerm}", search),
        MainConfig.MaintanenceType.GetMaintanenceType.method,
        null,
        "main"
      ).then((res) => res.data);
      const { totalCount, statusCode, data } = response;
      if (statusCode === 200 || statusCode === 201) {
        setCount(totalCount);
        setMaintanenceTypeData(data);
        setLoading(false);
      } else {
        setCount(0);
        setMaintanenceTypeData([]);
        setLoading(false);
      }
    } catch (err) {
      setLoading(false);
      console.log(err);
    }
  };
  React.useEffect(() => {
    initFlag && search !== ""
      ? GetMaintanenceTypeList()
      : GetMaintanenceTypeList();
  }, [debouncedSearchTerm, page, size]);

  return (
    <>
      <Box
        display={"flex"}
        justifyContent={"space-between"}
        alignItems={"center"}
        flexWrap={"wrap"}
        gap={2}
        mt={1}
      >
        <Box>
          <IconBreadcrumbs
            parent="Maintenance"
            child="Maintenance Type"
            path=""
          />
        </Box>
        <Box>
          <Box
            display={"flex"}
            justifyContent={"space-between"}
            alignItems={"center"}
            flexWrap={"wrap"}
            gap={2}
          >
            <GlobalSearch
              placeholder="search"
              width={200}
              onChange={handleSearch}
            />
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
            rows={maintanenceTypeData || []}
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
      <CreateMaintanenceType
        open={open}
        close={handleClose}
        handleSubmit={handleSubmit}
        handleChange={handleChange}
        error={error}
        maintanenceTypeInput={maintanenceTypeInput}
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
};

export default MaintanenceTypePage;
