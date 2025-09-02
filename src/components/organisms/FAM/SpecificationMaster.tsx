"use client";
import { Box } from "@mui/material";
import React, { useEffect, useState } from "react";
import IconBreadcrumbs from "../../molecules/AdminLayout/BreadCrumbs";
import GlobalSearch from "../../molecules/AdminLayout/GlobalSearch";
import { MuiButton, MuiTable } from "bsoft-base-elements";
import { GoPlus } from "react-icons/go";
import SkeletonLoader from "../../molecules/AdminLayout/SkeletonLoader";
import NoDataFound from "../../molecules/AdminLayout/NoDataFound";
import { useDebounce } from "../../../hooks/useDebounceHook";
import dayjs from "dayjs";
import { FiEdit } from "react-icons/fi";
import { RiDeleteBin6Line } from "react-icons/ri";
import {
  Apirequest,
  isSubmitting,
  startLoading,
  stopLoading,
} from "../../../utils/lib";
import FamConfig from "../../../utils/fam.api.json";
import CreateSpecification, {
  SpecificationProps,
} from "../../molecules/FAM/CreateSpecification";
import { useDataFetchHook } from "../../../hooks/useDataFetchHook";
import ErrorModal from "../../molecules/Master/Role/ErrorModal";
import DeleteConfirmation from "../../molecules/Master/DeleteConfirmation";
import { usePrivilegeCheck } from "../../../hooks/usePrivilegeCheck";
import toast from "react-hot-toast";

const SpecificationMaster = () => {
  const [pathname, setPathName] = useState<string>("");
  const permissions = usePrivilegeCheck(pathname);

  useEffect(() => {
    setInitFlag(true);
    const currentPath = window.location.pathname.split("/bsoft").at(-1) || "";
    setPathName(currentPath);
  }, []);
  const [page, setPage] = React.useState<number>(1);
  const [size, setSize] = React.useState<number>(15);
  const [search, setSearch] = React.useState("");
  const debouncedSearchTerm = useDebounce(search, 500);
  const [loading, setLoading] = React.useState(true);
  const [specificationData, setSpecificationData] = React.useState<any[]>([]);
  const [count, setCount] = React.useState<number>(0);
  const [initFlag, setInitFlag] = React.useState(false);
  const [editFlag, setEditFlag] = React.useState(false);
  const [error, setError] = React.useState<string[]>([]);
  const [open, setOpen] = React.useState(false);
  const [selectedAssetGroup, setSelectedAssetGroup] = React.useState<any>(null);
  const [errorModalOpen, setErrorModalOpen] = React.useState(false);
  const [errorMessages, setErrorMessages] = React.useState<string[]>([]);
  const [deleteOpen, setDeleteOpen] = React.useState(false);

  const [specificationInput, setSpecifcationInput] =
    useState<SpecificationProps>({
      id: 0,
      isActive: 1,
      specificationName: "",
      assetGroupId: 0,
      isDefault: 1,
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
      field: "Specification_Name",
      headerName: "Specification Name",
      flex: 2,
      minWidth: 200,
      valueGetter: (value: any, row: any) =>
        `${row?.specificationName || ""}`.replace(/\b\w/g, (char) =>
          char.toUpperCase()
        ),
    },
    {
      field: "AssetGroup_Name",
      headerName: "AssetGroup Name",
      flex: 2,
      minWidth: 200,
      valueGetter: (value: any, row: any) => `${row?.groupName || ""}`,
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
      field: "isActive",
      headerName: "Status",
      flex: 2,
      minWidth: 200,
      valueGetter: (value: any, row: any) =>
        `${row?.isActive ? "Active" : "Inactive"}`,
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
    setEditFlag(false);
    setOpen(true);
    setSpecifcationInput({
      ...specificationInput,
      specificationName: "",
    });
    setSelectedAssetGroup(null);
    setError([]);
  };
  const handleClose = () => {
    setOpen(false);
    setError([]);
  };
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const handleEdit = (row: any) => {
    setEditFlag(true);
    setSpecifcationInput({
      ...specificationInput,
      specificationName: row?.specificationName,
      assetGroupId: row?.assetGroupId,

      id: row?.id,
      isActive: row?.isActive,
      isDefault: row?.isDefault,
    });
    setOpen(true);
    const getAssetGroup = assetGroup.find(
      (i: { id: string; groupName: string }) => i.id === row?.assetGroupId
    );
    setSelectedAssetGroup(getAssetGroup);
  };

  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    let temp: string[] = [];
    if (isSubmitting()) return;
    startLoading();

    Object.entries(specificationInput).forEach(([key, value]) => {
      if (
        key === "specificationName" &&
        (!value || value.toString().trim().length < 1)
      ) {
        temp.push(key);
      }
    });

    if (selectedAssetGroup === null) temp.push("assetGroup");

    setError(temp);

    if (temp.length > 0) {
      toast.error("Please fill all required fields");
      stopLoading();
      return;
    }

    try {
      if (editFlag) {
        await UpdateSpecificaation();
      } else {
        await AddSpecificaation();
        setLoading(true);
      }
    } catch (err) {
      console.error("Error in handleSubmit:", err);
      toast.error("Failed to save specification");
    } finally {
      stopLoading();
    }
  };

  const AddSpecificaation = async () => {
    const body = {
      specificationName: specificationInput.specificationName
        ?.trim()
        .replace(/\b\w/g, (char) => char.toUpperCase()),
      assetGroupId: selectedAssetGroup.id,
      isDefault: specificationInput.isDefault,
    };
    try {
      startLoading();
      const { endpoint, method } = FamConfig.Specificaton.AddSpecification;
      const response = await Apirequest(endpoint, method, body, "fam").then(
        (res) => res.data
      );

      if (response.statusCode === 200 || response.statusCode === 201) {
        toast.success(response.message);
        setOpen(false);
        setSpecifcationInput({ ...specificationInput });
        setEditFlag(false);
        GetSpecificationList();
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
  const UpdateSpecificaation = async () => {
    const body = {
      specificationName: specificationInput.specificationName
        ?.trim()
        .replace(/\b\w/g, (char) => char.toUpperCase()),
      assetGroupId: specificationInput.assetGroupId,
      isDefault: specificationInput.isDefault,
      id: specificationInput.id,
      isActive: specificationInput.isActive,
    };
    try {
      startLoading();
      const { endpoint, method } = FamConfig.Specificaton.UpdateSpecification;
      const response = await Apirequest(endpoint, method, body, "fam").then(
        (res) => res.data
      );

      if (response.statusCode === 200 || response.statusCode === 201) {
        toast.success(response.message);
        setOpen(false);
        setSpecifcationInput({ ...specificationInput });
        setEditFlag(false);
        GetSpecificationList();
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

  const DeleteUom = async () => {
    try {
      const body = {
        id: specificationInput.id,
      };
      const { endpoint, method } = FamConfig.Specificaton.Delete;
      const response = await Apirequest(
        endpoint.replace("{id}", `${specificationInput.id}`),
        method,
        body,
        "fam"
      ).then((res) => res.data);

      if (response.statusCode === 200 || response.statusCode === 201) {
        toast.success(response.message);
        setOpen(false);
        setEditFlag(false);
        GetSpecificationList();
      } else {
        toast.error(response.message);
        if (Array.isArray(response.errors) && response.errors.length > 0) {
          setErrorModalOpen(true);
          setErrorMessages(response.errors);
        }
      }
    } catch (err) {
      console.log(err);
      GetSpecificationList();
    }
  };
  const handleDelete = (id: number) => {
    setSpecifcationInput({ ...specificationInput, id: id });
    setDeleteOpen(true);
  };
  const handleConfirmDelete = async () => {
    DeleteUom();
    setDeleteOpen(false);
  };

  const { data: assetGroup } = useDataFetchHook(
    FamConfig.AssetGroup.AssetGroupName.endpoint,
    FamConfig.AssetGroup.AssetGroupName.method,
    "fam"
  );

  const HandleAssetGroup = (
    e: React.ChangeEvent<HTMLInputElement>,
    value: { id: string; groupName: string } | null,
    field: string
  ) => {
    setError([]);
    if (field === "groupName") {
      if (!value?.id) {
        setSelectedAssetGroup(null);
        setSpecifcationInput((prev) => ({ ...prev, assetGroupId: 0 }));
      } else {
        setSelectedAssetGroup(value);
        setSpecifcationInput((prev) => ({ ...prev, groupName: value.id }));
      }
    }
  };
  const handleSwitch = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: "isActive" | "isDefault"
  ) => {
    const { checked } = e.target;

    if (field === "isActive") {
      setSpecifcationInput({
        ...specificationInput,
        isActive: checked ? 1 : 0,
      });
    } else if (field === "isDefault") {
      setSpecifcationInput({
        ...specificationInput,
        isDefault: checked ? 1 : 0,
      });
    }
  };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let { name, value } = e.target;
    setSpecifcationInput({ ...specificationInput, [name]: value });
    setError([]);
  };

  const GetSpecificationList = async () => {
    try {
      const { endpoint, method } = FamConfig.Specificaton;
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
      setSpecificationData(response.data);
      setCount(response.totalCount);
    } catch (err) {
      console.log(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    initFlag && search !== "" ? GetSpecificationList() : GetSpecificationList();
  }, [debouncedSearchTerm, page, size]);
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
            parent={"Asset Master"}
            child={"Specification"}
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
            placeholder="search specification"
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
            rows={specificationData}
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
      <CreateSpecification
        open={open}
        close={handleClose}
        editFlag={editFlag}
        error={error}
        HandleAssetGroup={HandleAssetGroup}
        assetGroup={assetGroup}
        selectedAssetGroup={selectedAssetGroup}
        specificationInput={specificationInput}
        handleSwitch={handleSwitch}
        handleChange={handleChange}
        handleSubmit={handleSubmit}
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

export default SpecificationMaster;
