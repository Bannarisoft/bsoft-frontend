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
import CreateAssetCategory from "../../molecules/FAM/CreateAssetCategory";
import DeleteConfirmation from "../../molecules/Master/DeleteConfirmation";
import { usePrivilegeCheck } from "../../../hooks/usePrivilegeCheck";
import ErrorModal from "../../molecules/Master/Role/ErrorModal";
import SkeletonLoader from "../../molecules/AdminLayout/SkeletonLoader";
import toast from "react-hot-toast";

export interface AssetCategoryProps {
  categoryName: string;
  description: string;
  id: number;
  isActive: number;
  sortOrder: number;
}

function AssetCategoryPage() {
  const [pathname, setPathName] = useState<string>("");
  const permissions = usePrivilegeCheck(pathname);
  const [page, setPage] = React.useState<number>(1);
  const [size, setSize] = React.useState<number>(15);
  const [search, setSearch] = React.useState("");
  const debouncedSearchTerm = useDebounce(search, 500);
  const [loading, setLoading] = React.useState(true);
  const [categoryData, setCategoryData] = React.useState<any[]>([]);
  const [assetGroup, setAssetGroup] = React.useState<any[]>([]);
  const [count, setCount] = React.useState<number>(0);
  const [initFlag, setInitFlag] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const [categoryInput, setCategoryInput] = React.useState<AssetCategoryProps>({
    categoryName: "",
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
  const [selectedGroup, setSelectedGroup] = React.useState<any>(null);

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
      field: "category_code",
      headerName: "Category Code",
      flex: 1,
      minWidth: 200,
      valueGetter: (value: any, row: any) => `${row?.code.toUpperCase() || ""}`,
    },
    {
      field: "categoryName",
      headerName: "Category Name",
      flex: 2,
      minWidth: 200,
      valueGetter: (value: any, row: any) =>
        `${row?.categoryName || ""}`.replace(/\b\w/g, (char) =>
          char.toUpperCase()
        ),
    },
    {
      field: "assetGroupName",
      headerName: "Asset Group Name",
      flex: 2,
      minWidth: 200,
      valueGetter: (value: any, row: any) =>
        `${row?.assetGroupName || ""}`.replace(/\b\w/g, (char) =>
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

  const GetAssetCategoryList = async () => {
    try {
      const { endpoint, method } = Config.Category;
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
      setCategoryData(response.data);
      setCount(response.totalCount);
    } catch (err) {
      console.log(err);
      setLoading(false);
    }
  };

  const GetAssetGroupList = async () => {
    try {
      const { endpoint, method } = Config.AssetGroup.AssetGroupName;
      const response = await Apirequest(endpoint, method, null, "fam").then(
        (res) => res.data
      );
      setLoading(false);
      setAssetGroup(response.data);
      setCount(response.totalCount);
    } catch (err) {
      console.log(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    GetAssetGroupList();
  }, []);

  useEffect(() => {
    initFlag && search !== "" ? GetAssetCategoryList() : GetAssetCategoryList();
  }, [debouncedSearchTerm, page, size]);

  useEffect(() => {
    setInitFlag(true);
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const handleClose = () => {
    setOpen(false);
    setCategoryInput({
      ...categoryInput,
      description: "",
      categoryName: "",
    });
    setEditFlag(false);
    setError([]);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let { name, value } = e.target;
    setCategoryInput({ ...categoryInput, [name]: value });
    setError([]);
  };

  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    let temp: string[] = [];
    if (isSubmitting()) return;
    startLoading();

    Object.entries(categoryInput).forEach(([key, value]) => {
      if (
        key === "categoryName" &&
        (!value || value.toString().trim().length < 1)
      ) {
        temp.push(key);
      }
    });

    if (selectedGroup === null) temp.push("group");

    setError(temp);

    if (temp.length > 0) {
      toast.error("Please fill all required fields");
      stopLoading();
      return;
    }

    try {
      if (editFlag) {
        await UpdateCategory();
      } else {
        await AddCategory();
        setLoading(true);
      }
    } catch (err) {
      console.error("Error in handleSubmit:", err);
      toast.error("Failed to save category");
    } finally {
      stopLoading();
    }
  };

  const AddCategory = async () => {
    const body = {
      categoryName: categoryInput.categoryName
        ?.trim()
        .replace(/\b\w/g, (char) => char.toUpperCase()),
      description: categoryInput.description?.trim(),
      assetGroupId: selectedGroup?.id,
    };

    try {
      startLoading();
      const { endpoint, method } = Config.Category.AddAssetCategory;
      const response = await Apirequest(endpoint, method, body, "fam").then(
        (res) => res.data
      );

      if (response.statusCode === 200 || response.statusCode === 201) {
        toast.success(response.message);
        setOpen(false);
        setCategoryInput({
          ...categoryInput,
          description: "",
          categoryName: "",
        });
        setEditFlag(false);
        GetAssetCategoryList();
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

  const UpdateCategory = async () => {
    const body = {
      id: categoryInput.id,
      categoryName: categoryInput.categoryName
        ?.trim()
        .replace(/\b\w/g, (char) => char.toUpperCase()),
      description: categoryInput.description?.trim(),
      sortOrder: categoryInput.sortOrder,
      assetGroupId: selectedGroup?.id,
      isActive: categoryInput.isActive,
    };
    try {
      startLoading();
      const { endpoint, method } = Config.Category.UpdateAssetCategory;
      const response = await Apirequest(endpoint, method, body, "fam").then(
        (res) => res.data
      );

      if (response.statusCode === 200 || response.statusCode === 201) {
        toast.success(response.message);
        setOpen(false);
        setCategoryInput({
          ...categoryInput,
          description: "",
          categoryName: "",
        });
        setEditFlag(false);
        GetAssetCategoryList();
      } else {
        toast.error(response.message);
        if (Array.isArray(response.errors) && response.errors.length > 0) {
          setErrorModalOpen(true);
          setErrorMessages(response.errors);
        }
      }
    } catch (err) {
      GetAssetCategoryList();
      console.log(err);
    } finally {
      stopLoading();
    }
  };

  const DeleteCategory = async () => {
    try {
      const body = {
        id: categoryInput.id,
      };
      const { endpoint, method } = Config.Category.DeleteAssetCategory;
      const response = await Apirequest(
        endpoint.replace("{id}", `${categoryInput.id}`),
        method,
        body,
        "fam"
      ).then((res) => res.data);

      if (response.statusCode === 200 || response.statusCode === 201) {
        toast.success(response.message);
        setOpen(false);
        setEditFlag(false);
        GetAssetCategoryList();
      } else {
        toast.error(response.message);
        if (Array.isArray(response.errors) && response.errors.length > 0) {
          setErrorModalOpen(true);
          setErrorMessages(response.errors);
        }
      }
    } catch (err) {
      console.log(err);
      GetAssetCategoryList();
    }
  };

  const handleSwitch = (e: React.ChangeEvent<HTMLInputElement>) => {
    let { checked } = e.target;
    checked
      ? setCategoryInput({ ...categoryInput, isActive: 1 })
      : setCategoryInput({ ...categoryInput, isActive: 0 });
  };

  const handleAutocomplete = (
    e: React.ChangeEvent<HTMLInputElement>,
    value: any
  ) => {
    setError([]);
    if (!value) {
      setSelectedGroup(null);
    } else {
      setSelectedGroup(value);
    }
  };

  const handleClickOpen = () => {
    setOpen(true);
    setSelectedGroup(null);
  };

  const handleEdit = (row: any) => {
    setEditFlag(true);
    setOpen(true);
    setCategoryInput({
      description: row?.description,
      categoryName: row?.categoryName,
      id: row?.id,
      isActive: row?.isActive,
      sortOrder: row?.sortOrder,
    });
    const getGroup = assetGroup
      .filter((i) => i?.id === row?.assetGroupId)
      ?.at(0);
    setSelectedGroup(getGroup);
  };

  const handleDelete = (id: number) => {
    setCategoryInput({ ...categoryInput, id: id });
    setDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    DeleteCategory();
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
            parent={"Asset Master"}
            child={"Asset Categories"}
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
            placeholder="search asset category"
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
            rows={categoryData}
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
      <CreateAssetCategory
        open={open}
        close={handleClose}
        categoryInput={categoryInput}
        handleSubmit={handleSubmit}
        handleChange={handleChange}
        error={error}
        handleSwitch={handleSwitch}
        assetGroup={assetGroup}
        handleAutocomplete={handleAutocomplete}
        selectedGroup={selectedGroup}
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

export default AssetCategoryPage;
