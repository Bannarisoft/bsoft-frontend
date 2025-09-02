"use client";
import { Box } from "@mui/material";
import React, { useEffect, useState } from "react";
import IconBreadcrumbs from "../../molecules/AdminLayout/BreadCrumbs";
import GlobalSearch from "../../molecules/AdminLayout/GlobalSearch";
import { MuiButton, MuiTable } from "bsoft-base-elements";
import { GoPlus } from "react-icons/go";
import CreateMaintanenceCategory from "../../molecules/Maintanence/CreateMaintanenceCategory";
import NoDataFound from "../../molecules/AdminLayout/NoDataFound";
import dayjs from "dayjs";
import { FiEdit } from "react-icons/fi";
import { RiDeleteBin6Line } from "react-icons/ri";
import DeleteConfirmation from "../../molecules/Master/DeleteConfirmation";
import {
  Apirequest,
  isSubmitting,
  startLoading,
  stopLoading,
} from "../../../utils/lib";
import { useDebounce } from "../../../hooks/useDebounceHook";
import MainConfig from "../../../utils/main.api.json";
import config from "../../../utils/main.api.json";
import SkeletonLoader from "../../molecules/AdminLayout/SkeletonLoader";
import ErrorModal from "../../molecules/Master/Role/ErrorModal";
import { usePrivilegeCheck } from "../../../hooks/usePrivilegeCheck";
import toast from "react-hot-toast";
export interface SnackbarTypes {
  open: boolean;
  message: string;
}
function MaintanenceCategoryPage() {
  const [pathname, setPathName] = useState<string>("");
  const permissions = usePrivilegeCheck(pathname);
  const [open, setOpen] = React.useState(false);
  const [maintanenceCategoryData, setMaintanenceCategoryData] = React.useState<
    any[]
  >([]);
  const [loading, setLoading] = React.useState(false);
  const [count, setCount] = React.useState(0);
  const [page, setPage] = React.useState<number>(1);
  const [size, setSize] = React.useState<number>(15);
  const [search, setSearch] = React.useState("");
  const [initFlag, setInitFlag] = React.useState(false);
  const [error, setError] = React.useState<any[]>([]);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const debouncedSearchTerm = useDebounce(search, 500);
  const [errorModalOpen, setErrorModalOpen] = React.useState(false);
  const [errorMessages, setErrorMessages] = React.useState<string[]>([]);
  const [snackbarMisc, setSnackbarMisc] = React.useState<SnackbarTypes>({
    open: false,
    message: "",
  });
  useEffect(() => {
    setInitFlag(true);
    const currentPath = window.location.pathname.split("/bsoft").at(-1) || "";
    setPathName(currentPath);
  }, []);
  const [maintanenceInput, setMaintanenceInput] = React.useState<any>({
    categoryName: "",
    description: "",
    id: 0,
    isActive: 1,
  });
  const [editFlag, setEditFlag] = React.useState(false);

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
      field: "categoryName",
      headerName: "Category Name",
      flex: 1,
      minWidth: 200,
      valueGetter: (value: any, row: any) =>
        `${row?.categoryName || ""}`.replace(/\b\w/g, (char) =>
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
    setMaintanenceInput({
      ...maintanenceInput,
      categoryName: "",
      description: "",
      isActive: 1,
    });
  };
  const handleClose = () => {
    setOpen(false);
    setMaintanenceInput({
      ...maintanenceInput,
      categoryName: "",
      description: "",
    });
    setEditFlag(false);
    setError([]);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let { name, value } = e.target;
    setMaintanenceInput({ ...maintanenceInput, [name]: value });
    setError([]);
  };

  const AddMaintanence = async () => {
    try {
      startLoading();
      const body: any = {
        categoryName: maintanenceInput.categoryName
          ?.trim()
          .replace(/\b\w/g, (char: any) => char.toUpperCase()),
        description: maintanenceInput.description?.trim(),
      };

      if (editFlag) {
        body.id = Number(maintanenceInput.id);
      }
      const { endpoint, method } = config.Maintanence.AddMaintanence;
      const response = await Apirequest(endpoint, method, body, "main").then(
        (res) => res.data
      );

      if (response.statusCode === 200 || response.statusCode === 201) {
        toast.success(response.message);
        setOpen(false);
        setEditFlag(false);
        setMaintanenceInput({ ...maintanenceInput });
        GetmaintanenceList();
      } else {
        toast.error(response.message);
        if (Array.isArray(response.errors) && response.errors.length > 0) {
          setErrorModalOpen(true);
          setErrorMessages(response.errors);
        }
      }
    } catch (err) {
      stopLoading();
      console.log(err);
    }
  };

  const UpdateMaintanence = async () => {
    try {
      startLoading();
      const body: any = {
        categoryName: maintanenceInput.categoryName
          ?.trim()
          .replace(/\b\w/g, (char: any) => char.toUpperCase()),
        decription: maintanenceInput.description?.trim(),
        id: maintanenceInput.id,
        isActive: maintanenceInput.isActive,
      };
      const { endpoint, method } = config.Maintanence.UpdateMaintanence;
      const response = await Apirequest(endpoint, method, body, "main").then(
        (res) => res.data
      );
      if (response.statusCode === 200) {
        toast.success(response.message);
        setOpen(false);
        setMaintanenceInput({ ...maintanenceInput });
        setEditFlag(false);
        GetmaintanenceList();
      } else {
        toast.error(response.message);
        if (Array.isArray(response.errors) && response.errors.length > 0) {
          setErrorModalOpen(true);
          setErrorMessages(response.errors);
        }
      }
    } catch (err) {
      stopLoading();
      console.log(err);
    }
  };
  const handleSwitch = (e: React.ChangeEvent<HTMLInputElement>) => {
    let { checked } = e.target;
    checked
      ? setMaintanenceInput({ ...maintanenceInput, isActive: 1 })
      : setMaintanenceInput({ ...maintanenceInput, isActive: 0 });
  };
  const DeleteMaintanence = async (id: number) => {
    try {
      const { endpoint, method } = config.Maintanence.DeleteMaintanence;
      const deleteEndpoint = endpoint.replace("{id}", id.toString());

      const result = await Apirequest(
        deleteEndpoint,
        method,
        null,
        "main"
      ).then((res) => res.data);
      toast.success(result?.message);
      GetmaintanenceList();

      setSnackbarMisc({
        ...snackbarMisc,
        open: true,
        message: result.data.message,
      });
    } catch (err) {
      console.log(err);
    }
  };
  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    if (isSubmitting()) return;

    let temp: string[] = [];

    Object.entries(maintanenceInput).forEach(([key, value]) => {
      if (
        key === "categoryName" &&
        (!value || String(value).trim().length === 0)
      ) {
        temp.push(key);
      }
      if (
        key === "decription" &&
        (!value || String(value).trim().length === 0)
      ) {
        temp.push(key);
      }
    });

    setError(temp);

    if (temp.length > 0) {
      console.error("Please fill all mandatory fields.");
      return;
    }

    try {
      startLoading();
      if (editFlag) {
        await UpdateMaintanence();
      } else {
        await AddMaintanence();
      }
    } catch (error) {
      console.error("Error submitting maintenance:", error);
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
    setMaintanenceInput({
      ...maintanenceInput,
      categoryName: row?.categoryName,
      description: row?.description,
      id: row?.id,
      isActive: row?.isActive,
    });
  };
  const handleConfirmDelete = async () => {
    if (maintanenceInput.id) {
      await DeleteMaintanence(maintanenceInput.id);
    }
    setDeleteOpen(false);
  };

  const handleDelete = (id: number) => {
    setMaintanenceInput({ ...maintanenceInput, id: id });
    setDeleteOpen(true);
  };

  const GetmaintanenceList = async () => {
    try {
      setLoading(true);
      const response = await Apirequest(
        MainConfig.Maintanence.GetMaintanence.endpoint
          .replace("{page}", page.toString())
          .replace("{size}", size.toString())
          .replace("{searchTerm}", search),
        MainConfig.Maintanence.GetMaintanence.method,
        null,
        "main"
      ).then((res) => res.data);
      const { totalCount, statusCode, data } = response;
      if (statusCode === 200 || statusCode === 201) {
        setCount(totalCount);
        setMaintanenceCategoryData(data);
        setLoading(false);
      } else {
        setCount(0);
        setMaintanenceCategoryData([]);
        setLoading(false);
      }
    } catch (err) {
      setLoading(false);
      console.log(err);
    }
  };

  React.useEffect(() => {
    initFlag && search !== "" ? GetmaintanenceList() : GetmaintanenceList();
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
            child="Maintenance Category"
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
            rows={maintanenceCategoryData || []}
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

      <CreateMaintanenceCategory
        open={open}
        close={handleClose}
        handleSubmit={handleSubmit}
        handleChange={handleChange}
        error={error}
        maintanenceInput={maintanenceInput}
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

export default MaintanenceCategoryPage;
