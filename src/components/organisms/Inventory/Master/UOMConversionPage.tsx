"use client";

import { Box } from "@mui/material";
import React, { useEffect, useState } from "react";
import { MuiButton, MuiTable } from "bsoft-base-elements";
import { GoPlus } from "react-icons/go";
import IconBreadcrumbs from "../../../molecules/AdminLayout/BreadCrumbs";
import GlobalSearch from "../../../molecules/AdminLayout/GlobalSearch";
import InventoryInventoryConfig from "../../../../utils/inventory.api.json";
import { useDebounce } from "../../../../hooks/useDebounceHook";
import { FiEdit } from "react-icons/fi";
import { RiDeleteBin6Line } from "react-icons/ri";
import dayjs from "dayjs";
import NoDataFound from "../../../molecules/AdminLayout/NoDataFound";
import { Apirequest } from "../../../../utils/lib";
import DeleteConfirmation from "../../../molecules/Master/DeleteConfirmation";
import { usePrivilegeCheck } from "../../../../hooks/usePrivilegeCheck";
import ErrorModal from "../../../molecules/Master/Role/ErrorModal";
import SkeletonLoader from "../../../molecules/AdminLayout/SkeletonLoader";
import { useDataFetchHook } from "../../../../hooks/useDataFetchHook";
import toast from "react-hot-toast";
import { GetByUom, UomConversionProps } from "../../../../types/inventoryTypes";
import CreateInveUomConversion from "../../../molecules/Inventory/Master/CreateUOMConversion";
const UomConversionPage = () => {
  const [pathname, setPathName] = useState<string>("");
  const permissions = usePrivilegeCheck(pathname);
  const [page, setPage] = React.useState<number>(1);
  const [size, setSize] = React.useState<number>(15);
  const [search, setSearch] = React.useState("");
  const debouncedSearchTerm = useDebounce(search, 500);
  const [loading, setLoading] = React.useState(true);
  const [umoCovertionData, setUmoCovertionData] = React.useState<any[]>([]);
  const [count, setCount] = React.useState<number>(0);
  const [initFlag, setInitFlag] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const [error, setError] = React.useState<any[]>([]);
  const [selectedUomConversion, setSelectedUomConversion] = React.useState<{
    fromUOM: GetByUom | null;
    toUOM: GetByUom | null;
  }>({
    fromUOM: null,
    toUOM: null,
  });

  const [editFlag, setEditFlag] = React.useState(false);
  const [deleteOpen, setDeleteOpen] = React.useState(false);

  const [uomConversionInput, setUomConversionInput] =
    useState<UomConversionProps>({
      id: 0,
      fromUOMId: 0,
      toUOMId: 0,
      conversionValue: 0,
      isActive: 0,
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
      field: "fromUOM_Code",
      headerName: "From UOM",
      flex: 2,
      minWidth: 200,
      valueGetter: (value: any, row: any) =>
        `${row?.fromUOMCode.toUpperCase() || ""}`,
    },
    {
      field: "toUOM_Code",
      headerName: "To UOM",
      flex: 2,
      minWidth: 200,
      valueGetter: (value: any, row: any) =>
        `${row?.toUOMCode.toUpperCase() || ""}`,
    },
    {
      field: "conversion_Value",
      headerName: "Conversion Value",
      flex: 2,
      minWidth: 200,
      valueGetter: (value: any, row: any) => `${row?.conversionValue || ""}`,
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

  useEffect(() => {
    setInitFlag(true);
    const currentPath = window.location.pathname.split("/bsoft").at(-1) || "";
    setPathName(currentPath);
  }, []);

  const GetUomList = async () => {
    try {
      const { endpoint, method } = InventoryInventoryConfig.UOMConversion;
      const response = await Apirequest(
        endpoint
          .replace("{page}", page.toString())
          .replace("{size}", size.toString())
          .replace("{searchTerm}", search),
        method,
        null,
        "inventory"
      ).then((res) => res.data);
      setLoading(false);
      setUmoCovertionData(response.data);
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
    setUomConversionInput({
      id: 0,
      fromUOMId: 0,
      toUOMId: 0,
      conversionValue: 0,
      isActive: 0,
    });
    setSelectedUomConversion({
      fromUOM: null,
      toUOM: null,
    });

    setError([]);
  };
  const handleEdit = (row: any) => {
    setEditFlag(true);
    setUomConversionInput({
      id: row?.id ?? 0,
      fromUOMId: row?.fromUOMId ?? 0,
      toUOMId: row?.toUOMId ?? 0,
      conversionValue: row?.conversionValue ?? 0,
      isActive: row?.isActive ?? 0,
    });

    setSelectedUomConversion({
      fromUOM: uomData.find((item: any) => item.id === row?.fromUOMId) ?? null,
      toUOM: uomData.find((item: any) => item.id === row?.toUOMId) ?? null,
    });

    setOpen(true);
  };

  const handleSubmit = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    let temp: string[] = [];

    Object.entries(uomConversionInput).forEach(([key, value]) => {
      if (key === "fromUOMId" && (!value || value === 0)) {
        temp.push("fromUOMId");
      } else if (key === "toUOMId" && (!value || value === 0)) {
        temp.push("toUOMId");
      } else if (key === "conversionValue" && (!value || value <= 0)) {
        temp.push("conversionValue");
      }
    });

    setError(temp);

    if (temp.length === 0) {
      if (editFlag) {
        UpdateUomConversion();
      } else {
        AddUomConversion();
        setLoading(true);
      }
    }
  };

  const AddUomConversion = async () => {
    const body = {
      fromUOMId: selectedUomConversion?.fromUOM?.id ?? null,
      toUOMId: selectedUomConversion?.toUOM?.id ?? null,
      conversionValue: Number(uomConversionInput.conversionValue) || 0,
    };

    try {
      const { endpoint, method } =
        InventoryInventoryConfig.UOMConversion.AddUomConversion;

      const response = await Apirequest(
        endpoint,
        method,
        body,
        "inventory"
      ).then((res) => res.data);

      if (response.statusCode === 200 || response.statusCode === 201) {
        toast.success(response.message);
        setOpen(false);
        setUomConversionInput({
          id: 0,
          fromUOMId: 0,
          toUOMId: 0,
          conversionValue: 0,
          isActive: 1,
        });
        setSelectedUomConversion({ fromUOM: null, toUOM: null }); // reset
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
    }
  };

  const UpdateUomConversion = async () => {
    const body = {
      fromUOMId: selectedUomConversion?.fromUOM?.id ?? null,
      toUOMId: selectedUomConversion?.toUOM?.id ?? null,
      conversionValue: Number(uomConversionInput.conversionValue) || 0,
      id: uomConversionInput.id,
      isActive: uomConversionInput.isActive,
    };
    try {
      const { endpoint, method } =
        InventoryInventoryConfig.UOMConversion.UpdateUomConversion;
      const response = await Apirequest(
        endpoint,
        method,
        body,
        "inventory"
      ).then((res) => res.data);

      if (response.statusCode === 200 || response.statusCode === 201) {
        toast.success(response.message);
        setOpen(false);
        setUomConversionInput({ ...uomConversionInput });
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
    }
  };
  const handleSwitch = (e: React.ChangeEvent<HTMLInputElement>) => {
    let { checked } = e.target;
    checked
      ? setUomConversionInput({ ...uomConversionInput, isActive: 1 })
      : setUomConversionInput({ ...uomConversionInput, isActive: 0 });
  };
  const { data: uomData } = useDataFetchHook(
    InventoryInventoryConfig.Uom.GetUomName.endpoint,
    InventoryInventoryConfig.Uom.GetUomName.method,
    "inventory"
  );
  const handleAutocompleteChange = (
    e: React.SyntheticEvent,
    value: GetByUom | GetByUom[] | null,
    field: string
  ) => {
    if (field === "fromUOMId") {
      if (!value || Array.isArray(value)) {
        setUomConversionInput((prev) => ({ ...prev, fromUOMId: 0 }));
        setSelectedUomConversion((prev) => ({ ...prev, fromUOM: null }));
      } else {
        setUomConversionInput((prev) => ({ ...prev, fromUOMId: value.id }));
        setSelectedUomConversion((prev) => ({ ...prev, fromUOM: value }));
      }
    } else if (field === "toUOMId") {
      if (!value || Array.isArray(value)) {
        setUomConversionInput((prev) => ({ ...prev, toUOMId: 0 }));
        setSelectedUomConversion((prev) => ({ ...prev, toUOM: null }));
      } else {
        setUomConversionInput((prev) => ({ ...prev, toUOMId: value.id }));
        setSelectedUomConversion((prev) => ({ ...prev, toUOM: value }));
      }
    }
    setError([]);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let { name, value } = e.target;
    setUomConversionInput({ ...uomConversionInput, [name]: value });
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
    setUomConversionInput({
      id: 0,
      fromUOMId: 0,
      toUOMId: 0,
      conversionValue: 0,
      isActive: 1,
    });
  };

  const DeleteUom = async () => {
    try {
      const body = {
        id: uomConversionInput.id,
      };
      const { endpoint, method } =
        InventoryInventoryConfig.UOMConversion.DeleteUomConversion;
      const response = await Apirequest(
        endpoint.replace("{id}", `${uomConversionInput.id}`),
        method,
        body,
        "inventory"
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
    setUomConversionInput({ ...uomConversionInput, id: id });
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
          <IconBreadcrumbs
            parent={"Inventory"}
            child={"Uom Conversion"}
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
            placeholder="search uom conversion"
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
            rows={umoCovertionData}
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
      <CreateInveUomConversion
        open={open}
        close={handleClose}
        error={error}
        handleAutocompleteChange={handleAutocompleteChange}
        handleChange={handleChange}
        handleSubmit={handleSubmit}
        handleSwitch={handleSwitch}
        editFlag={editFlag}
        uomConversionInput={uomConversionInput}
        uomData={uomData}
        selectedUomConversion={selectedUomConversion}
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

export default UomConversionPage;
