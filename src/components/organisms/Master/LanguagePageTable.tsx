import React, { useEffect, useState } from "react";
import GlobalSearch from "../../molecules/AdminLayout/GlobalSearch";
import IconBreadcrumbs from "../../molecules/AdminLayout/BreadCrumbs";
import { Box, Skeleton } from "@mui/material";
import { GoPlus } from "react-icons/go";
import NoDataFound from "../../molecules/AdminLayout/NoDataFound";
import { FiEdit } from "react-icons/fi";
import { RiDeleteBin6Line } from "react-icons/ri";
import {
  Apirequest,
  isSubmitting,
  startLoading,
  stopLoading,
} from "../../../utils/lib";
import Config from "../../../utils/config.api.json";
import { useDebounce } from "../../../hooks/useDebounceHook";
import { CreateNewLanguage } from "../../molecules/Master/CreateNewLanguage";
import { LanguageProps } from "../../../types/types";
import DeleteConfirmation from "../../molecules/Master/DeleteConfirmation";
import { MuiButton, MuiTable } from "bsoft-base-elements";
import { usePrivilegeCheck } from "../../../hooks/usePrivilegeCheck";
import ErrorModal from "../../molecules/Master/Role/ErrorModal";
import SkeletonLoader from "../../molecules/AdminLayout/SkeletonLoader";
import toast from "react-hot-toast";

function LanguagePageTable() {
  const [LanguageData, setLanguageData] = useState<any[]>([]);
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
      field: "Language_code",
      headerName: "Language code",
      flex: 1,
      minWidth: 150,
      valueGetter: (value: any, row: any) => `${row?.code.toUpperCase() || ""}`,
    },
    {
      field: "Language_name",
      headerName: "Language name",
      sortable: true,
      flex: 2,
      valueGetter: (value: any, row: any) =>
        `${row?.name || ""}`.replace(/\b\w/g, (char) => char.toUpperCase()),
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
  const [editFlag, setEditFlag] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [count, setCount] = React.useState<number>(0);
  const [page, setPage] = React.useState<number>(1);
  const [size, setSize] = React.useState<number>(15);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [initFlag, setInitFlag] = React.useState(false);
  const [loading, setLoading] = useState(true);
  const debouncedSearchTerm = useDebounce(search, 500);
  const [errorModalOpen, setErrorModalOpen] = React.useState(false);
  const [errorMessages, setErrorMessages] = React.useState<string[]>([]);

  const [languageInput, setLanguageInput] = useState<LanguageProps>({
    code: "",
    name: "",
    id: 0,
    isActive: 1,
  });
  const handleClickOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
    setEditFlag(false);
    setLanguageInput({
      code: "",
      name: "",
      id: 0,
      isActive: 1,
    });
  };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let { name, value } = e.target;
    const filteredValue =
      name === "code" ? value.replace(/[^a-zA-Z0-9]/g, "") : value;
    setLanguageInput({ ...languageInput, [name]: filteredValue });
    setError([]);
  };
  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    let temp: string[] = [];
    if (isSubmitting()) return;

    Object.entries(languageInput).forEach(([key, value]) => {
      if (
        key === "code" &&
        (!value || typeof value !== "string" || value.trim().length < 2)
      ) {
        temp.push(key);
      } else if (
        key === "name" &&
        (!value || typeof value !== "string" || value.trim().length < 4)
      ) {
        temp.push(key);
      }
    });

    setError(temp);

    if (temp.length > 0) {
      toast.error("Please fill all required fields");
      stopLoading();
      return;
    }

    try {
      if (editFlag) {
        await Updatelanguage();
      } else {
        await Addlanguage();
        setLoading(false);
      }
    } catch (err) {
      console.error("Error in handleSubmit:", err);
    } finally {
      stopLoading();
    }
  };

  const Addlanguage = async () => {
    try {
      startLoading();
      const body = {
        ...languageInput,
        code: languageInput.code?.trim().toUpperCase(),
        name: languageInput.name
          ?.trim()
          .replace(/\b\w/g, (char) => char.toUpperCase()),
      };
      const { endpoint, method } = Config.Language.addLanguage;
      const response = await Apirequest(endpoint, method, body).then(
        (res) => res.data
      );

      if (response.statusCode === 200 || response.statusCode === 201) {
        toast.success(response.message);
        setOpen(false);
        setLanguageInput({
          code: "",
          name: "",
          id: 0,
          isActive: 1,
        });
        setEditFlag(false);
        GetLanguageList();
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
  const Updatelanguage = async () => {
    try {
      startLoading();
      const body = {
        ...languageInput,
        code: languageInput.code?.trim().toUpperCase(),
        name: languageInput.name
          ?.trim()
          .replace(/\b\w/g, (char) => char.toUpperCase()),
      };
      const { endpoint, method } = Config.Language.updateLanguage;
      const response = await Apirequest(endpoint, method, body).then(
        (res) => res.data
      );

      if (response.statusCode === 200 || response.statusCode === 201) {
        toast.success(response.message);
        setOpen(false);
        setLanguageInput({
          code: "",
          name: "",
          id: 0,
          isActive: 1,
        });
        setEditFlag(false);
        GetLanguageList();
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
    setLanguageInput({
      code: row.code,
      name: row.name,
      id: row.id,
      isActive: row.isActive,
    });
  };
  const handleDelete = (id: number) => {
    setLanguageInput({ ...languageInput, id: id });
    setDeleteOpen(true);
  };
  const handleConfirmDelete = async () => {
    Deletelanguage();
    setDeleteOpen(false);
  };
  const Deletelanguage = async () => {
    try {
      const body = {
        id: languageInput.id,
      };
      const { endpoint, method } = Config.Language.deleteLanguage;
      const response = await Apirequest(
        endpoint.replace("{id}", `${languageInput.id}`),
        method,
        body
      ).then((res) => res.data);

      if (response.statusCode === 200 || response.statusCode === 201) {
        toast.success(response.message);
        setOpen(false);
        setEditFlag(false);
        GetLanguageList();
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
  const GetLanguageList = async () => {
    try {
      const { endpoint, method } = Config.Language;
      const response = await Apirequest(
        endpoint
          .replace("{page}", page.toString())
          .replace("{size}", size.toString())
          .replace("{searchTerm}", search),
        method
      ).then((res) => res.data);
      setLanguageData(response.data);
      setLoading(false);
      setCount(response.totalCount);
    } catch (err) {
      console.log(err);
      setLanguageData([]);
    }
  };

  useEffect(() => {
    initFlag && search !== "" ? GetLanguageList() : GetLanguageList();
  }, [debouncedSearchTerm, page, size]);
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const handleSwitch = (e: React.ChangeEvent<HTMLInputElement>) => {
    let { checked } = e.target;
    checked
      ? setLanguageInput({ ...languageInput, isActive: 1 })
      : setLanguageInput({ ...languageInput, isActive: 0 });
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
          <IconBreadcrumbs parent={"Master"} child={"Language"} path="" />
        </Box>
        <Box
          display={"flex"}
          justifyContent={"space-between"}
          alignItems={"center"}
          flexWrap={"wrap"}
          gap={2}
        >
          <GlobalSearch
            placeholder="search language"
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
            rows={LanguageData}
            columns={columns}
            paginationMode="server"
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

      <CreateNewLanguage
        open={open}
        close={handleClose}
        languageInput={languageInput}
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

export default LanguagePageTable;
