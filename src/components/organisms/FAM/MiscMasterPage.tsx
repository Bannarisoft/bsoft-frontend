"use client";

import { Box } from "@mui/material";
import React, { useEffect, useState } from "react";
import IconBreadcrumbs from "../../molecules/AdminLayout/BreadCrumbs";
import GlobalSearch from "../../molecules/AdminLayout/GlobalSearch";
import { MuiButton, MuiTable } from "bsoft-base-elements";
import { GoPlus } from "react-icons/go";
import Config from "../../../../src/utils/fam.api.json";
import {
  Apirequest,
  isSubmitting,
  startLoading,
  stopLoading,
} from "../../../utils/lib";
import { useDebounce } from "../../../hooks/useDebounceHook";
import { FiEdit } from "react-icons/fi";
import { RiDeleteBin6Line } from "react-icons/ri";
import dayjs from "dayjs";
import NoDataFound from "../../molecules/AdminLayout/NoDataFound";
import CreateMisc from "../../molecules/FAM/CreateMisc";
import DeleteConfirmation from "../../molecules/Master/DeleteConfirmation";
import { usePrivilegeCheck } from "../../../hooks/usePrivilegeCheck";
import SkeletonLoader from "../../molecules/AdminLayout/SkeletonLoader";
import ErrorModal from "../../molecules/Master/Role/ErrorModal";
import toast from "react-hot-toast";

export interface MiscProps {
  miscCode: string;
  description: string;
  id: number;
  isActive: number;
  sortOrder: number;
}

function MiscMasterPage() {
  const [pathname, setPathName] = useState<string>("");
  const permissions = usePrivilegeCheck(pathname);
  const [page, setPage] = React.useState<number>(1);
  const [size, setSize] = React.useState<number>(15);
  const [search, setSearch] = React.useState("");
  const debouncedSearchTerm = useDebounce(search, 500);
  const [loading, setLoading] = React.useState(true);
  const [miscData, setMiscData] = React.useState<any[]>([]);
  const [count, setCount] = React.useState<number>(0);
  const [initFlag, setInitFlag] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const [miscInput, setMiscInput] = React.useState<MiscProps>({
    miscCode: "",
    description: "",
    id: 0,
    isActive: 1,
    sortOrder: 0,
  });
  const [errorModalOpen, setErrorModalOpen] = React.useState(false);
  const [errorMessages, setErrorMessages] = React.useState<string[]>([]);
  const [editFlag, setEditFlag] = React.useState(false);
  const [error, setError] = React.useState<any[]>([]);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [miscType, setMiscType] = React.useState<any[]>([]);
  const [selectedMisc, setSelectedMisc] = React.useState<any>(null);

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
      field: "misc_code",
      headerName: "Misc Code",
      flex: 1,
      minWidth: 200,
      valueGetter: (value: any, row: any) => `${row?.code.toUpperCase() || ""}`,
    },
    {
      field: "description",
      headerName: "Description",
      flex: 1,
      minWidth: 200,
      valueGetter: (value: any, row: any) =>
        `${row?.description || ""}`.replace(/\b\w/g, (char) =>
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
      field: "createdAt",
      headerName: "Created At",
      flex: 2,
      minWidth: 150,
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
  useEffect(() => {
    setInitFlag(true);
    const currentPath = window.location.pathname.split("/bsoft").at(-1) || "";
    setPathName(currentPath);
  }, []);

  const GetMiscList = async () => {
    try {
      const { endpoint, method } = Config.Misc;
      const response = await Apirequest(
        endpoint
          .replace("{page}", page.toString())
          .replace("{size}", size.toString())
          .replace("{searchTerm}", search),
        method,
        null,
        "fam"
      ).then((res) => res.data);
      setLoading(false);
      setMiscData(response.data);
      setCount(response.totalCount);
    } catch (err) {
      console.log(err);
      setLoading(false);
    }
  };

  const GetMiscType = async () => {
    try {
      const { endpoint, method } = Config.Misc.MiscType;
      const response = await Apirequest(endpoint, method, null, "fam").then(
        (res) => res.data
      );
      setMiscType(response.data);
    } catch (err) {
      console.log(err);
      setMiscType([]);
    }
  };

  const SearchMisc = async () => {
    try {
      const { endpoint, method } = Config.Misc;
      const response = await Apirequest(
        endpoint
          .replace("{page}", page.toString())
          .replace("{size}", size.toString())
          .replace("{searchTerm}", search),
        method,
        null,
        "fam"
      ).then((res) => res.data);
      setLoading(false);
      setMiscData(response.data);
      setCount(response.totalCount);
    } catch (err) {
      console.log(err);
      setLoading(false);
    }
  };

  const AddMisc = async () => {
    const body = {
      miscTypeId: selectedMisc.id,
      description: miscInput.description?.trim(),
      code: miscInput.miscCode?.trim()?.toUpperCase(),
    };

    try {
      startLoading();
      const { endpoint, method } = Config.Misc.AddMisc;
      const response = await Apirequest(endpoint, method, body, "fam").then(
        (res) => res.data
      );

      if (response.statusCode === 200 || response.statusCode === 201) {
        toast.success(response.message);
        setOpen(false);
        setMiscInput({ ...miscInput, miscCode: "", description: "" });
        setEditFlag(false);
        GetMiscList();
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

  const UpdateMisc = async () => {
    const body = {
      miscTypeId: selectedMisc.id,
      description: miscInput.description?.trim(),
      code: miscInput.miscCode?.trim()?.toUpperCase(),
      id: miscInput.id,
      isActive: miscInput.isActive,
      sortOrder: miscInput.sortOrder,
    };
    try {
      startLoading();
      const { endpoint, method } = Config.Misc.UpdateMisc;
      const response = await Apirequest(endpoint, method, body, "fam").then(
        (res) => res.data
      );

      if (response.statusCode === 200 || response.statusCode === 201) {
        toast.success(response.message);
        setOpen(false);
        setMiscInput({ ...miscInput, miscCode: "", description: "" });
        setEditFlag(false);
        GetMiscList();
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

  const DeleteMisc = async () => {
    try {
      const body = {
        id: miscInput.id,
      };
      const { endpoint, method } = Config.Misc.DeleteMisc;
      const response = await Apirequest(
        endpoint.replace("{id}", `${miscInput.id}`),
        method,
        body,
        "fam"
      ).then((res) => res.data);

      if (response.statusCode === 200 || response.statusCode === 201) {
        toast.success(response.message);
        setOpen(false);
        setEditFlag(false);
        GetMiscList();
      } else {
        toast.error(response.message);
        if (Array.isArray(response.errors) && response.errors.length > 0) {
          setErrorModalOpen(true);
          setErrorMessages(response.errors);
        }
      }
    } catch (err) {
      console.log(err);
      GetMiscList();
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  useEffect(() => {
    initFlag && search !== "" ? SearchMisc() : GetMiscList();
  }, [debouncedSearchTerm, page, size]);

  useEffect(() => {
    setInitFlag(true);
    GetMiscType();
  }, []);

  const handleClose = () => {
    setOpen(false);
    setMiscInput({ ...miscInput, miscCode: "", description: "" });
    setEditFlag(false);
    setSelectedMisc(null);
    setError([]);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let { name, value } = e.target;
    const filteredValue =
      name === "miscCode" ? value.replace(/[^a-zA-Z0-9]/g, "") : value;
    setMiscInput({ ...miscInput, [name]: filteredValue });
    setError([]);
  };

  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    let temp: string[] = [];
    if (isSubmitting()) return;
    startLoading();

    Object.entries(miscInput).forEach(([key, value]) => {
      if (
        key === "miscCode" &&
        (!value || value.toString().trim().length === 0)
      ) {
        temp.push(key);
      } else if (
        key === "description" &&
        (!value || value.toString().trim().length === 0)
      ) {
        temp.push(key);
      }
    });

    if (selectedMisc === null) temp.push("miscType");

    setError(temp);

    if (temp.length > 0) {
      toast.error("Please fill all required fields");
      stopLoading();
      return;
    }

    try {
      if (editFlag) {
        await UpdateMisc();
      } else {
        await AddMisc();
        setLoading(true);
      }
    } catch (err) {
      console.error("Error in handleSubmit:", err);
      toast.error("Failed to save misc");
    } finally {
      stopLoading();
    }
  };

  const handleSwitch = (e: React.ChangeEvent<HTMLInputElement>) => {
    let { checked } = e.target;
    checked
      ? setMiscInput({ ...miscInput, isActive: 1 })
      : setMiscInput({ ...miscInput, isActive: 0 });
  };

  const handleClickOpen = () => {
    setOpen(true);
    setSelectedMisc(null);
  };

  const handleEdit = (row: any) => {
    setEditFlag(true);
    setOpen(true);
    setMiscInput({
      miscCode: row?.code,
      description: row?.description,
      id: row?.id,
      isActive: row?.isActive,
      sortOrder: row?.sortOrder,
    });
    const getMiscType = miscType
      .filter((i) => i?.id === row?.miscTypeId)
      ?.at(0);
    setSelectedMisc(getMiscType);
  };

  const handleDelete = (id: number) => {
    setMiscInput({ ...miscInput, id: id });
    setDeleteOpen(true);
  };

  const handleAutocomplete = (
    e: React.ChangeEvent<HTMLInputElement>,
    value: any
  ) => {
    setError([]);
    if (!value) {
      setSelectedMisc(null);
    } else {
      setSelectedMisc(value);
    }
  };

  const handleConfirmDelete = async () => {
    DeleteMisc();
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
            parent={" Asset Master"}
            child={"Misc Master"}
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
            placeholder="search misc"
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
                Create Misc
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
            rows={miscData}
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
      <CreateMisc
        open={open}
        close={handleClose}
        miscInput={miscInput}
        handleSubmit={handleSubmit}
        handleChange={handleChange}
        error={error}
        handleSwitch={handleSwitch}
        miscType={miscType}
        handleAutocomplete={handleAutocomplete}
        selectedMisc={selectedMisc}
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

export default MiscMasterPage;
