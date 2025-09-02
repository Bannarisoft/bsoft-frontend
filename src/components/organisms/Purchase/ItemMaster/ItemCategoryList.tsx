import React, { useState } from "react";
import CreateItemGroup from "../../../molecules/Purchase/ItemMaster/CreateItemGroup";
import NoDataFound from "../../../molecules/AdminLayout/NoDataFound";
import { Box, Checkbox } from "@mui/material";
import IconBreadcrumbs from "../../../molecules/AdminLayout/BreadCrumbs";
import GlobalSearch from "../../../molecules/AdminLayout/GlobalSearch";
import { MuiButton, MuiTable } from "bsoft-base-elements";
import { GoPlus } from "react-icons/go";
import {
  GetByCategory,
  GetByGroup,
  ItemCategory,
} from "../../../../types/PurchaseTypes";
import dayjs from "dayjs";
import { FiEdit } from "react-icons/fi";
import { RiDeleteBin6Line } from "react-icons/ri";
import CreateItemCategory from "../../../molecules/Purchase/ItemMaster/CreateItemCategory";
import ErrorModal from "../../../molecules/Master/Role/ErrorModal";
import DeleteConfirmation from "../../../molecules/Master/DeleteConfirmation";
import { useDataFetchHook } from "../../../../hooks/useDataFetchHook";
import InventoryConfig from "../../../../utils/inventory.api.json";
import { Apirequest } from "../../../../utils/lib";
import toast from "react-hot-toast";
import { useDebounce } from "../../../../hooks/useDebounceHook";
import SkeletonLoader from "../../../molecules/AdminLayout/SkeletonLoader";
import { GridColDef } from "@mui/x-data-grid";

const ItemCategoryListPage = () => {
  const [search, setSearch] = React.useState("");
  const [page, setPage] = React.useState<number>(0);
  const [size, setSize] = React.useState<number>(15);
  const [count, setCount] = React.useState<number>(0);
  const [open, setOpen] = React.useState(false);
  const [editFlag, setEditFlag] = React.useState(false);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [errorModalOpen, setErrorModalOpen] = React.useState(false);
  const [errorMessages, setErrorMessages] = React.useState<string[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [itemCategoryData, setItemCategoryData] = React.useState<any[]>([]);
  const [error, setError] = React.useState<any[]>([]);
  const debouncedSearchTerm = useDebounce(search, 500);
  const [initFlag, setInitFlag] = React.useState(false);
  const [allData, setAllData] = React.useState<any[]>([]);

  const [selectedValues, setSelectedValues] = useState<{
    itemGroupId: any | null;
    parentCategoryId: any | null;
  }>({
    itemGroupId: null,
    parentCategoryId: null,
  });
  const [itemCategoryInput, setItemCategoryInput] =
    React.useState<ItemCategory>({
      itemGroupId: 0,
      parentCategoryId: 0,
      itemCategoryName: "",
      id: 0,
      isActive: 1,
      isGroup: 0,
      isBudgetApplicable: 0,
    });
  const columns: GridColDef<ItemCategory>[] = [
    {
      field: "s_no",
      headerName: "S.No",
      minWidth: 50,
      flex: 1,
      sortable: false,
      renderCell: (params: any) => {
        const rowIndex = params.api.getRowIndexRelativeToVisibleRows(params.id);
        return page * size + (rowIndex + 1); // ✅ correct S.No
      },
    },
    {
      field: "itemCategoryName",
      headerName: "Category Name",
      flex: 2,
      minWidth: 200,
      valueGetter: (_value: any, row: any) =>
        `${row?.itemCategoryName || ""}`.replace(/\b\w/g, (char) =>
          char.toUpperCase()
        ),
    },
    {
      field: "parentCategoryName",
      headerName: "Parent Category",
      flex: 2,
      minWidth: 200,
      valueGetter: (_value: any, row: any) =>
        `${row?.parentCategoryName || ""}`.replace(/\b\w/g, (char) =>
          char.toUpperCase()
        ),
    },
    {
      field: "itemGroupName",
      headerName: "Group Name",
      flex: 2,
      minWidth: 200,
      valueGetter: (_value: any, row: any) =>
        `${row?.itemGroupName || ""}`.replace(/\b\w/g, (char) =>
          char.toUpperCase()
        ),
    },
    {
      field: "isGroup",
      headerName: "Is Group",
      flex: 1,
      minWidth: 120,
      sortable: false,
      filterable: false,
      renderCell: (params: any) => (
        <Checkbox
          checked={params.row.isGroup === 1}
          disableRipple
          disableFocusRipple
          disabled
          readOnly
          sx={{
            pointerEvents: "none",
          }}
        />
      ),
    },
    {
      field: "isActive",
      headerName: "Status",
      flex: 2,
      minWidth: 200,
      valueGetter: (_value: any, row: any) =>
        `${row?.isActive ? "Active" : "Inactive"}`,
    },
    {
      field: "createdDate",
      headerName: "Created Date",
      flex: 2,
      minWidth: 150,
      valueGetter: (_value: any, row: any) =>
        `${dayjs(row?.createdDate).format("DD-MM-YYYY")}`,
    },
    {
      field: "createdByName",
      headerName: "Created By",
      sortable: true,
      flex: 2,
      minWidth: 150,
      valueGetter: (_value: any, row: any) => `${row?.createdByName ?? ""}`,
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
          <FiEdit
            fontSize={20}
            color="black"
            cursor={"pointer"}
            onClick={() => handleEdit(params.row)}
          />
          <RiDeleteBin6Line
            fontSize={20}
            color="red"
            cursor={"pointer"}
            onClick={() => handleDelete(params.row.id)}
          />
        </Box>
      ),
    },
  ];

  const handleClickOpen = () => {
    setSelectedValues({
      itemGroupId: null,
      parentCategoryId: null,
    });
    setItemCategoryInput({
      ...itemCategoryInput,
      itemCategoryName: "",
    });
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
    setEditFlag(false);
    setSelectedValues({
      itemGroupId: null,
      parentCategoryId: null,
    });
    setItemCategoryInput({
      ...itemCategoryInput,
      itemCategoryName: "",
    });
    setError([]);
  };
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const handleEdit = (row: any) => {
    if (!row) {
      console.warn("handleEdit called with empty row:", row);
      return;
    }

    console.log("Editing row:", row);

    setEditFlag(true);
    setOpen(true);

    setItemCategoryInput((prev) => ({
      ...prev,
      itemCategoryName: row?.itemCategoryName || "",
      isGroup: row?.isGroup,
      id: row?.id ?? 0,
      isActive: row?.isActive ?? true,
    }));

    const selectedCategory =
      itemcategoryData?.find?.(
        (item: any) => item.id === row?.parentCategoryId
      ) || null;

    const selectedGroup =
      itemgroupData?.find?.((item: any) => item.id === row?.itemGroupId) ||
      null;

    setSelectedValues({
      itemGroupId: selectedGroup,
      parentCategoryId: selectedCategory,
    });
  };

  const [refreshKey, setRefreshKey] = useState(0);

  const { data: itemcategoryData } = useDataFetchHook(
    InventoryConfig.ItemCategory.GetByCategory.endpoint,
    InventoryConfig.ItemCategory.GetByCategory.method,
    "inventory",
    refreshKey
  );
  const { data: itemgroupData } = useDataFetchHook(
    InventoryConfig.ItemGroup.GetByGroup.endpoint,
    InventoryConfig.ItemGroup.GetByGroup.method,
    "inventory"
  );
  const handleAutocompleteChange = (
    e: React.SyntheticEvent | React.ChangeEvent<HTMLInputElement>,
    value: GetByGroup | GetByCategory | GetByGroup[] | GetByCategory[] | null,
    field: string
  ) => {
    setError([]);

    if (field === "itemGroupId") {
      if (!value || Array.isArray(value)) {
        setSelectedValues((prev) => ({ ...prev, itemGroupId: null }));
        setItemCategoryInput((prev) => ({ ...prev, itemGroupId: 0 }));
      } else {
        setSelectedValues((prev) => ({ ...prev, itemGroupId: value }));
        setItemCategoryInput((prev) => ({ ...prev, itemGroupId: value.id }));
      }
    }

    if (field === "parentCategoryId") {
      if (!value || Array.isArray(value)) {
        setSelectedValues((prev) => ({ ...prev, parentCategoryId: null }));
        setItemCategoryInput((prev) => ({ ...prev, parentCategoryId: 0 }));
      } else {
        setSelectedValues((prev) => ({ ...prev, parentCategoryId: value }));
        setItemCategoryInput((prev) => ({
          ...prev,
          parentCategoryId: value.id,
        }));
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let { name, value } = e.target;
    setItemCategoryInput({ ...itemCategoryInput, [name]: value });
    setError([]);
  };
  const handleSwitch = (e: React.ChangeEvent<HTMLInputElement>) => {
    let { checked } = e.target;
    checked
      ? setItemCategoryInput({
          ...itemCategoryInput,
          isActive: 1,
        })
      : setItemCategoryInput({
          ...itemCategoryInput,
          isActive: 0,
        });
  };
  const handleCheck = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setItemCategoryInput((prev) => ({
      ...prev,
      [name]: checked ? 1 : 0,
    }));
  };

  const GetItemCategoryList = async () => {
    try {
      setLoading(true);
      const { endpoint, method } =
        InventoryConfig.ItemCategory.ItemCategoryList;
      const result = await Apirequest(
        endpoint
          .replace("{page}", page.toString())
          .replace("{size}", size.toString())
          .replace("{searchTerm}", search),
        method,
        null,
        "inventory"
      ).then((res) => res.data);

      const flatData = flattenCategories(result.data);
      const uniqueData = removeDuplicates(flatData, "id");
      setItemCategoryData(uniqueData);
      setCount(uniqueData.length);
    } catch (err) {
      console.error(err);
      setAllData([]);
      setItemCategoryData([]);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    initFlag && search !== "" ? GetItemCategoryList() : GetItemCategoryList();
  }, [debouncedSearchTerm, page, size]);
  React.useEffect(() => {
    const start = page * size;
    const end = start + size;
    setItemCategoryData(allData.slice(start, end));
  }, [page, size, allData]);
  const handleSubmit = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    const temp: string[] = [];

    if (!itemCategoryInput.itemCategoryName?.trim()) {
      temp.push("itemCategoryName");
    }
    if (
      !selectedValues.itemGroupId?.id ||
      selectedValues.itemGroupId?.id === 0
    ) {
      temp.push("itemGroupId");
    }
    // if (
    //   !selectedValues.parentCategoryId?.id ||
    //   selectedValues.parentCategoryId?.id === 0
    // ) {
    //   temp.push("parentCategoryId");
    // }

    setError(temp);

    if (temp.length > 0) return;

    if (editFlag) {
      UpdateItemCategory();
    } else {
      AddItemCategory();
    }
  };

  const AddItemCategory = async () => {
    try {
      setLoading(true);
      const body: any = {
        itemCategoryName: itemCategoryInput.itemCategoryName
          ?.trim()
          .replace(/\b\w/g, (char) => char.toUpperCase()),
        itemGroupId: selectedValues.itemGroupId?.id,
        parentCategoryId: selectedValues.parentCategoryId?.id,
        isGroup: itemCategoryInput.isGroup,
        isBudgetApplicable: itemCategoryInput.isBudgetApplicable,
      };
      const { endpoint, method } = InventoryConfig.ItemCategory.AddCategory;
      const response = await Apirequest(
        endpoint,
        method,
        body,
        "inventory"
      ).then((res) => res.data);

      if (response.statusCode === 200 || response.statusCode === 201) {
        toast.success(response.message);
        setOpen(false);
        setItemCategoryInput({
          ...itemCategoryInput,
          itemCategoryName: "",
        });
        setSelectedValues({ parentCategoryId: null, itemGroupId: null });
        setEditFlag(false);
        setRefreshKey((prev) => prev + 1);
        GetItemCategoryList();
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
      setLoading(false);
    }
  };
  const UpdateItemCategory = async () => {
    try {
      setLoading(true); // ✅ Start loading

      const body: any = {
        itemCategoryName: itemCategoryInput.itemCategoryName
          ?.trim()
          .replace(/\b\w/g, (char) => char.toUpperCase()),
        itemGroupId: selectedValues.itemGroupId?.id,
        parentCategoryId: selectedValues.parentCategoryId?.id,
        isGroup: itemCategoryInput.isGroup,
        isBudgetApplicable: itemCategoryInput.isBudgetApplicable,
        id: itemCategoryInput.id,
        isActive: itemCategoryInput.isActive,
      };

      const { endpoint, method } = InventoryConfig.ItemCategory.UpdateCategory;
      const response = await Apirequest(
        endpoint,
        method,
        body,
        "inventory"
      ).then((res) => res.data);

      if (response.statusCode === 200 || response.statusCode === 201) {
        toast.success(response.message);
        setOpen(false);
        setEditFlag(false);
        setSelectedValues({ parentCategoryId: null, itemGroupId: null });
        GetItemCategoryList();
      } else {
        toast.error(response.message);
        if (Array.isArray(response.errors) && response.errors.length > 0) {
          setErrorModalOpen(true);
          setErrorMessages(response.errors);
          setEditFlag(false);
        }
        setOpen(false);
      }
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false); // ✅ Stop loading
    }
  };
  const handleConfirmDelete = async () => {
    DeleteItemGroup();
    setDeleteOpen(false);
  };
  const handleDelete = (id: number) => {
    setItemCategoryInput({ ...itemCategoryInput, id: id });
    setDeleteOpen(true);
  };
  const DeleteItemGroup = async () => {
    try {
      const body = {
        id: itemCategoryInput.id,
      };
      const { endpoint, method } = InventoryConfig.ItemCategory.DeleteCategory;
      const result = await Apirequest(
        endpoint.replace("{id}", `${itemCategoryInput.id}`),
        method,
        body,
        "inventory"
      ).then((res) => res.data);
      toast.success(result?.message);
      setRefreshKey((prev) => prev - 1);
      GetItemCategoryList();
    } catch (err) {
      console.log(err);
      GetItemCategoryList();
    }
  };

  const flattenCategories = (categories: any[]): any[] => {
    let flatList: any[] = [];
    categories.forEach((category) => {
      flatList.push({
        ...category,
        parentCategoryName: category.parentCategoryName ?? null,
      });
      if (Array.isArray(category.subGroups) && category.subGroups.length > 0) {
        flatList = flatList.concat(flattenCategories(category.subGroups));
      }
    });
    return flatList;
  };
  const removeDuplicates = (list: any[], key: string) => {
    const seen = new Set();
    return list.filter((item) => {
      const val = item[key];
      if (seen.has(val)) return false;
      seen.add(val);
      return true;
    });
  };
  React.useEffect(() => {
    if (!loading && Array.isArray(itemCategoryData)) {
      const flatData = flattenCategories(itemCategoryData);
      const uniqueData = removeDuplicates(flatData, "id");
      setItemCategoryData(uniqueData);
    }
  }, [loading]);

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
            parent={"Purchase"}
            child={"Item Category"}
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
            placeholder="search item category"
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
            rows={itemCategoryData}
            columns={columns}
            rowCount={count}
            paginationMode="client" 
            paginationModel={{
              page,
              pageSize: size,
            }}
            onPaginationModelChange={({ page: newPage, pageSize }) => {
              setPage(newPage);
              setSize(pageSize);
            }}
            pageSizeOptions={[15, 30, 50]}
            disableRowSelectionOnClick
            slots={{
              noRowsOverlay: () => <NoDataFound />,
            }}
          />
        )}
      </Box>

      <CreateItemCategory
        open={open}
        close={handleClose}
        editFlag={editFlag}
        itemCategoryInput={itemCategoryInput}
        itemcategoryData={itemcategoryData}
        itemgroupData={itemgroupData}
        handleAutocompleteChange={handleAutocompleteChange}
        handleSwitch={handleSwitch}
        handleCheck={handleCheck}
        selectedValues={selectedValues}
        handleSubmit={handleSubmit}
        error={error}
        handleChange={handleChange}
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

export default ItemCategoryListPage;
