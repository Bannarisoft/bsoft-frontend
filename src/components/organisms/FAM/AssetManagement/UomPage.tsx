"use client";

import { Box } from "@mui/material";
import React, { useEffect, useState } from "react";

import { MuiButton, MuiTable } from "bsoft-base-elements";
import { GoPlus } from "react-icons/go";
import IconBreadcrumbs from "../../../molecules/AdminLayout/BreadCrumbs";
import GlobalSearch from "../../../molecules/AdminLayout/GlobalSearch";
import Config from "../../../../utils/fam.api.json";
import { useDebounce } from "../../../../hooks/useDebounceHook";
import { FiEdit } from "react-icons/fi";
import { RiDeleteBin6Line } from "react-icons/ri";
import dayjs from "dayjs";
import NoDataFound from "../../../molecules/AdminLayout/NoDataFound";
import {
  Apirequest,
  isSubmitting,
  startLoading,
  stopLoading,
} from "../../../../utils/lib";
import CreateUom, { UomProps } from "../../../molecules/FAM/CreateUom";
import DeleteConfirmation from "../../../molecules/Master/DeleteConfirmation";
import { usePrivilegeCheck } from "../../../../hooks/usePrivilegeCheck";
import ErrorModal from "../../../molecules/Master/Role/ErrorModal";
import SkeletonLoader from "../../../molecules/AdminLayout/SkeletonLoader";
import { useDataFetchHook } from "../../../../hooks/useDataFetchHook";
import toast from "react-hot-toast";

function UomPage() {
  const [pathname, setPathName] = useState<string>("");
  const permissions = usePrivilegeCheck(pathname);
  const [page, setPage] = React.useState<number>(1);
  const [size, setSize] = React.useState<number>(15);
  const [search, setSearch] = React.useState("");
  const debouncedSearchTerm = useDebounce(search, 500);
  const [loading, setLoading] = React.useState(true);
  const [umoData, setUmoData] = React.useState<any[]>([]);
  const [count, setCount] = React.useState<number>(0);
  const [initFlag, setInitFlag] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const [error, setError] = React.useState<any[]>([]);
  const [selectedUomType, setSelectedUomType] = React.useState<any>(null);
  const [editFlag, setEditFlag] = React.useState(false);
  const [deleteOpen, setDeleteOpen] = React.useState(false);

  const [uomInput, setUomInput] = useState<UomProps>({
    code: "",
    uomName: "",
    uomTypeId: 0,
    uomType: "",
    id: 0,
    isActive: 1,
    sortOrder: 1,
  });
  const [errorModalOpen, setErrorModalOpen] = React.useState(false);
  const [errorMessages, setErrorMessages] = React.useState<string[]>([]);

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
      field: "Uom_code",
      headerName: "Uom Code",
      flex: 2,
      minWidth: 200,
      valueGetter: (value: any, row: any) => `${row?.code.toUpperCase() || ""}`,
    },
    {
      field: "Uom_Name",
      headerName: "Uom Name",
      flex: 2,
      minWidth: 200,
      valueGetter: (value: any, row: any) =>
        `${row?.uomName || ""}`.replace(/\b\w/g, (char) => char.toUpperCase()),
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
      field: "createdDate ",
      headerName: "Created Date ",
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

  const GetUomList = async () => {
    try {
      const { endpoint, method } = Config.Uom;
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
      setUmoData(response.data);
      setCount(response.totalCount);
    } catch (err) {
      console.log(err);
      setLoading(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };
  const handleClose = () => {
    setOpen(false);
    setEditFlag(false);
    setUomInput({
      code: "",
      uomName: "",
      uomTypeId: 0,
      uomType: "",
      id: 0,
      isActive: 1,
      sortOrder: 1,
    });
    setSelectedUomType(null);

    setError([]);
  };
  const handleEdit = (row: any) => {
    setEditFlag(true);
    setUomInput({
      ...uomInput,
      code: row?.code,
      uomName: row?.uomName,
      uomTypeId: row?.uomTypeId,
      uomType: row?.uomType,
      id: row?.id,
      isActive: row?.isActive,
      sortOrder: row?.sortOrder,
    });
    setSelectedUomType(uomType.find((item: any) => item.id === row.uomTypeId));
    setOpen(true);
  };

  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    let temp: string[] = [];
    if (isSubmitting()) return;
    startLoading();

    Object.entries(uomInput).forEach(([key, value]) => {
      if (key === "code" && (!value || value.toString().trim().length < 1)) {
        temp.push(key);
      } else if (
        key === "uomName" &&
        (!value || value.toString().trim().length < 1)
      ) {
        temp.push(key);
      }
    });

    if (selectedUomType === null) temp.push("uomType");

    setError(temp);

    if (temp.length > 0) {
      toast.error("Please fill all required fields");
      stopLoading();
      return;
    }

    try {
      if (editFlag) {
        await UpdateUom();
      } else {
        await AddMisc();
        setLoading(true);
      }
    } catch (err) {
      console.error("Error in handleSubmit:", err);
      toast.error("Failed to save UOM");
    } finally {
      stopLoading();
    }
  };

  const AddMisc = async () => {
    const body = {
      code: uomInput.code?.trim()?.toUpperCase(),
      uomName: uomInput.uomName
        ?.trim()
        .replace(/\b\w/g, (char) => char.toUpperCase()),
      uomTypeId: selectedUomType.id,
      uomType: uomInput.uomType,
      sortOrder: uomInput.sortOrder,
    };
    try {
      startLoading();
      const { endpoint, method } = Config.Uom.AddUom;
      const response = await Apirequest(endpoint, method, body, "fam").then(
        (res) => res.data
      );

      if (response.statusCode === 200 || response.statusCode === 201) {
        toast.success(response.message);
        setOpen(false);
        setUomInput({ ...uomInput });
        setEditFlag(false);
        GetUomList();
      } else {
        toast.error(response.message);
        if (Array.isArray(response.errors) && response.errors.length > 0) {
          setErrorModalOpen(true);
          setErrorMessages(response.errors);
        }
        GetUomList();
      }
    } catch (err) {
      console.log(err);
    } finally {
      stopLoading();
    }
  };
  const UpdateUom = async () => {
    const body = {
      code: uomInput.code?.trim()?.toUpperCase(),
      uomName: uomInput.uomName
        ?.trim()
        .replace(/\b\w/g, (char) => char.toUpperCase()),
      uomTypeId: selectedUomType.id,
      uomType: uomInput.uomType,
      id: uomInput.id,
      sortOrder: uomInput.sortOrder,
      isActive: uomInput.isActive,
    };
    try {
      startLoading();
      const { endpoint, method } = Config.Uom.UpdateUom;
      const response = await Apirequest(endpoint, method, body, "fam").then(
        (res) => res.data
      );

      if (response.statusCode === 200 || response.statusCode === 201) {
        toast.success(response.message);
        setOpen(false);
        setUomInput({ ...uomInput });
        setEditFlag(false);
        GetUomList();
      } else {
        toast.error(response.message);
        if (Array.isArray(response.errors) && response.errors.length > 0) {
          setErrorModalOpen(true);
          setErrorMessages(response.errors);
        }
      }
    } catch (err) {
      GetUomList();
      console.log(err);
    } finally {
      stopLoading();
    }
  };
  const handleSwitch = (e: React.ChangeEvent<HTMLInputElement>) => {
    let { checked } = e.target;
    checked
      ? setUomInput({ ...uomInput, isActive: 1 })
      : setUomInput({ ...uomInput, isActive: 0 });
  };
  const { data: uomType } = useDataFetchHook(
    Config.Uom.Misc.endpoint.replace("{type}", "uomtype"),
    Config.Uom.Misc.method,
    "fam"
  );
  const handleUomType = (
    e: React.ChangeEvent<HTMLInputElement>,
    value: { id: string; uomType: string } | null,
    field: string
  ) => {
    if (field === "uomType") {
      if (!value?.id) {
        setSelectedUomType(null);
        setUomInput((prev) => ({ ...prev, uomTypeId: 0 }));
      } else {
        setSelectedUomType(value);
        setUomInput((prev) => ({ ...prev, uomType: value.id }));
      }
    }
  };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let { name, value } = e.target;
    const filteredValue =
      name === "code" ? value.replace(/[^a-zA-Z0-9]/g, "") : value;
    setUomInput({ ...uomInput, [name]: filteredValue });
    setError([]);
  };

  useEffect(() => {
    initFlag && search !== "" ? GetUomList() : GetUomList();
  }, [debouncedSearchTerm, page, size]);
  useEffect(() => {
    setInitFlag(true);
    GetUomList();
  }, []);

  const handleClickOpen = () => {
    setEditFlag(false);
    setOpen(true);
    setUomInput({
      ...uomInput,
      id: 0,
      code: "",
      uomName: "",
      uomTypeId: 0,
      uomType: "",
      isActive: 1,
      sortOrder: 1,
    });
    setSelectedUomType(null);
  };
  const DeleteUom = async () => {
    try {
      const body = {
        id: uomInput.id,
      };
      const { endpoint, method } = Config.Uom.DeleteUom;
      const response = await Apirequest(
        endpoint.replace("{id}", `${uomInput.id}`),
        method,
        body,
        "fam"
      ).then((res) => res.data);

      if (response.statusCode === 200 || response.statusCode === 201) {
        toast.success(response.message);
        setOpen(false);
        setEditFlag(false);
        GetUomList();
      } else {
        toast.error(response.message);
        if (Array.isArray(response.errors) && response.errors.length > 0) {
          setErrorModalOpen(true);
          setErrorMessages(response.errors);
        }
      }
    } catch (err) {
      console.log(err);
      GetUomList();
    }
  };
  const handleDelete = (id: number) => {
    setUomInput({ ...uomInput, id: id });
    setDeleteOpen(true);
  };
  const handleConfirmDelete = async () => {
    DeleteUom();
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
          <IconBreadcrumbs parent={"Asset Master"} child={"UOM"} path="" />
        </Box>
        <Box
          display={"flex"}
          justifyContent={"space-between"}
          alignItems={"center"}
          flexWrap={"wrap"}
          gap={2}
        >
          <GlobalSearch
            placeholder="search uom"
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
            rows={umoData}
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
      <CreateUom
        open={open}
        close={handleClose}
        error={error}
        uomInput={uomInput}
        uomType={uomType}
        selectedUomType={selectedUomType}
        handleUomType={handleUomType}
        handleChange={handleChange}
        handleSubmit={handleSubmit}
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

export default UomPage;
