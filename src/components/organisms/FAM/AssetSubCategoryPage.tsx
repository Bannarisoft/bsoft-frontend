"use client";
import { Box } from "@mui/material";
import React, { useEffect, useState } from "react";
import IconBreadcrumbs from "../../molecules/AdminLayout/BreadCrumbs";
import GlobalSearch from "../../molecules/AdminLayout/GlobalSearch";
import { MuiButton, MuiTable } from "bsoft-base-elements";
import { GoPlus } from "react-icons/go";
import { FiEdit } from "react-icons/fi";
import { RiDeleteBin6Line } from "react-icons/ri";
import dayjs from "dayjs";
import {
  Apirequest,
  isSubmitting,
  startLoading,
  stopLoading,
} from "../../../utils/lib";
import NoDataFound from "../../molecules/AdminLayout/NoDataFound";
import Config from "../../../../src/utils/fam.api.json";
import CreateAssetSubCategory from "../../molecules/FAM/CreateAssetSubCategory";
import { useDebounce } from "../../../hooks/useDebounceHook";
import DeleteConfirmation from "../../molecules/Master/DeleteConfirmation";
import { usePrivilegeCheck } from "../../../hooks/usePrivilegeCheck";
import ErrorModal from "../../molecules/Master/Role/ErrorModal";
import SkeletonLoader from "../../molecules/AdminLayout/SkeletonLoader";
import toast from "react-hot-toast";

export interface SubCategoryProps {
  subcategoryName: string;
  description: string;
  id: number;
  isActive: number;
  sortOrder: number;
}
function AssetSubCategoryPage() {
  const [pathname, setPathName] = useState<string>("");
  const permissions = usePrivilegeCheck(pathname);
  const [page, setPage] = React.useState<number>(1);
  const [size, setSize] = React.useState<number>(15);
  const [loading, setLoading] = React.useState(true);
  const [count, setCount] = React.useState<number>(0);
  const [search, setSearch] = React.useState("");
  const debouncedSearchTerm = useDebounce(search, 500);
  const [initFlag, setInitFlag] = React.useState(false);
  const [editFlag, setEditFlag] = React.useState(false);
  const [subCategoryData, setSubCategoryData] = React.useState<any[]>([]);
  const [open, setOpen] = React.useState(false);
  const [selectedCategory, setSelectedCategory] = React.useState<any>(null);
  const [error, setError] = React.useState<any[]>([]);
  const [assetCategory, setAssetCategory] = React.useState<any[]>([]);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [errorModalOpen, setErrorModalOpen] = React.useState(false);
  const [errorMessages, setErrorMessages] = React.useState<string[]>([]);
  const [subCategoryInput, setSubCategoryInput] =
    React.useState<SubCategoryProps>({
      subcategoryName: "",
      description: "",
      id: 0,
      isActive: 1,
      sortOrder: 0,
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
      field: "subcategory_code",
      headerName: "Sub Category Code",
      flex: 1,
      minWidth: 200,
      valueGetter: (value: any, row: any) => `${row?.code.toUpperCase() || ""}`,
    },
    {
      field: "subcategory_name",
      headerName: "Sub Category Name",
      flex: 2,
      minWidth: 200,
      valueGetter: (value: any, row: any) =>
        `${row?.subCategoryName || ""}`.replace(/\b\w/g, (char) =>
          char.toUpperCase()
        ),
    },
    {
      field: "assetCategoriesName",
      headerName: "Asset Categories Name",
      flex: 2,
      minWidth: 200,
      valueGetter: (value: any, row: any) =>
        `${row?.assetCategoriesName || ""}`.replace(/\b\w/g, (char) =>
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

  const GetSubCategoryList = async () => {
    try {
      const { endpoint, method } = Config.SubCategory;
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
      setSubCategoryData(response.data);
      setCount(response.totalCount);
    } catch (err) {
      console.log(err);
      setLoading(false);
    }
  };

  const GetAssetCategoryList = async () => {
    try {
      const { endpoint, method } = Config.Category.AssetCategoryName;
      const response = await Apirequest(endpoint, method, null, "fam").then(
        (res) => res.data
      );
      setLoading(false);
      setAssetCategory(response.data);
      setCount(response.totalCount);
    } catch (err) {
      console.log(err);
      setLoading(false);
    }
  };
  useEffect(() => {
    GetAssetCategoryList();
  }, []);

  useEffect(() => {
    initFlag && search !== "" ? GetSubCategoryList() : GetSubCategoryList();
  }, [debouncedSearchTerm, page, size]);
  useEffect(() => {
    setInitFlag(true);
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };
  const handleClose = () => {
    setOpen(false);
    setSubCategoryInput({
      ...subCategoryInput,
      subcategoryName: "",
      description: "",
    });
    setEditFlag(false);
    setError([]);
  };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let { name, value } = e.target;
    setSubCategoryInput({ ...subCategoryInput, [name]: value });
    setError([]);
  };

  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    let temp: string[] = [];
    if (isSubmitting()) return;
    startLoading();

    Object.entries(subCategoryInput).forEach(([key, value]) => {
      if (
        key === "subcategoryName" &&
        (!value || value.toString().trim().length < 1)
      ) {
        temp.push(key);
      }
    });

    if (selectedCategory === null) temp.push("category");

    setError(temp);

    if (temp.length > 0) {
      toast.error("Please fill all required fields");
      stopLoading();
      return;
    }

    try {
      if (editFlag) {
        await UpdateSubCategory();
      } else {
        await AddSubCategory();
        setLoading(true);
      }
    } catch (err) {
      console.error("Error in handleSubmit:", err);
      toast.error("Failed to save subcategory");
    } finally {
      stopLoading();
    }
  };

  const AddSubCategory = async () => {
    const body = {
      subCategoryName: subCategoryInput.subcategoryName
        ?.trim()
        .replace(/\b\w/g, (char) => char.toUpperCase()),
      description: subCategoryInput.description?.trim(),
      assetCategoriesId: selectedCategory?.id,
    };

    try {
      startLoading();
      const { endpoint, method } = Config.SubCategory.AddAssetSubCategory;
      const response = await Apirequest(endpoint, method, body, "fam").then(
        (res) => res.data
      );

      if (response.statusCode === 200 || response.statusCode === 201) {
        toast.success(response.message);
        setOpen(false);
        setSubCategoryInput({
          ...subCategoryInput,
          subcategoryName: "",
          description: "",
        });
        setEditFlag(false);
        GetSubCategoryList();
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

  const UpdateSubCategory = async () => {
    const body = {
      id: subCategoryInput.id,
      subcategoryName: subCategoryInput.subcategoryName
        ?.trim()
        .replace(/\b\w/g, (char) => char.toUpperCase()),
      description: subCategoryInput.description?.trim(),
      sortOrder: subCategoryInput.sortOrder,
      assetCategoriesId: selectedCategory?.id,
      isActive: subCategoryInput.isActive,
    };
    try {
      startLoading();
      const { endpoint, method } = Config.SubCategory.UpdateAssetsubCategory;
      const response = await Apirequest(endpoint, method, body, "fam").then(
        (res) => res.data
      );

      if (response.statusCode === 200 || response.statusCode === 201) {
        toast.success(response.message);
        setOpen(false);
        setSubCategoryInput({
          ...subCategoryInput,
          description: "",
          subcategoryName: "",
        });
        setEditFlag(false);
        GetSubCategoryList();
      } else {
        toast.error(response.message);
        if (Array.isArray(response.errors) && response.errors.length > 0) {
          setErrorModalOpen(true);
          setErrorMessages(response.errors);
        }
      }
    } catch (err) {
      GetSubCategoryList();
      console.log(err);
    } finally {
      stopLoading();
    }
  };

  const DeleteCategory = async () => {
    try {
      const body = {
        id: subCategoryInput.id,
      };
      const { endpoint, method } = Config.SubCategory.DeleteAssetSubCategory;
      const response = await Apirequest(
        endpoint.replace("{id}", `${subCategoryInput.id}`),
        method,
        body,
        "fam"
      ).then((res) => res.data);

      if (response.statusCode === 200 || response.statusCode === 201) {
        toast.success(response.message);
        setOpen(false);
        setEditFlag(false);
        GetSubCategoryList();
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
  const handleSwitch = (e: React.ChangeEvent<HTMLInputElement>) => {
    let { checked } = e.target;
    checked
      ? setSubCategoryInput({ ...subCategoryInput, isActive: 1 })
      : setSubCategoryInput({ ...subCategoryInput, isActive: 0 });
  };
  const handleAutocomplete = (
    e: React.ChangeEvent<HTMLInputElement>,
    value: any
  ) => {
    setError([]);
    if (!value) {
      setSelectedCategory(null);
    } else {
      setSelectedCategory(value);
    }
  };

  const handleClickOpen = () => {
    setOpen(true);
    setSelectedCategory(null);
  };

  const handleEdit = (row: any) => {
    setEditFlag(true);
    setOpen(true);
    setSubCategoryInput({
      subcategoryName: row?.subCategoryName,
      description: row?.description,
      id: row?.id,
      isActive: row?.isActive,
      sortOrder: row?.sortOrder,
    });

    const getCategory = assetCategory
      .filter((i) => i?.id === row?.assetCategoriesId)
      ?.at(0);
    setSelectedCategory(getCategory);
  };

  const handleDelete = (id: number) => {
    setSubCategoryInput({ ...subCategoryInput, id: id });
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
            child={"Asset Sub Categories"}
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
            placeholder="search asset sub category"
            width={300}
            onChange={handleSearch}
          />
          <Box className="d-flex-center" gap={2}>
            {permissions.canAdd && (
              <MuiButton
                startIcon={<GoPlus />}
                variant="contained"
                onClick={handleClickOpen}
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
            rows={subCategoryData}
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
      <CreateAssetSubCategory
        open={open}
        close={handleClose}
        subCategoryInput={subCategoryInput}
        handleChange={handleChange}
        error={error}
        handleAutocomplete={handleAutocomplete}
        selectedCategory={selectedCategory}
        handleSubmit={handleSubmit}
        handleSwitch={handleSwitch}
        assetCategory={assetCategory}
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

export default AssetSubCategoryPage;
