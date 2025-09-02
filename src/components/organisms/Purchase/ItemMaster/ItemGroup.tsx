import { Box } from "@mui/material";
import React, { useState } from "react";
import IconBreadcrumbs from "../../../molecules/AdminLayout/BreadCrumbs";
import GlobalSearch from "../../../molecules/AdminLayout/GlobalSearch";
import { MuiButton, MuiTable } from "bsoft-base-elements";
import { GoPlus } from "react-icons/go";
import NoDataFound from "../../../molecules/AdminLayout/NoDataFound";
import { FiEdit } from "react-icons/fi";
import { RiDeleteBin6Line } from "react-icons/ri";
import dayjs from "dayjs";
import CreateItemGroup from "../../../molecules/Purchase/ItemMaster/CreateItemGroup";
import { ItemGroup } from "../../../../types/PurchaseTypes";
import { Apirequest } from "../../../../utils/lib";
import { useDebounce } from "../../../../hooks/useDebounceHook";
import InventoryConfig from "../../../../utils/inventory.api.json";
import toast from "react-hot-toast";
import ErrorModal from "../../../molecules/Master/Role/ErrorModal";
import DeleteConfirmation from "../../../molecules/Master/DeleteConfirmation";
import SkeletonLoader from "../../../molecules/AdminLayout/SkeletonLoader";

const ItemGroupPage = () => {
  const [page, setPage] = React.useState<number>(1);
  const [size, setSize] = React.useState<number>(15);
  const [search, setSearch] = React.useState("");
  const debouncedSearchTerm = useDebounce(search, 500);
  const [initFlag, setInitFlag] = React.useState(false);
  const [count, setCount] = React.useState<number>(0);
  const [open, setOpen] = React.useState(false);
  const [editFlag, setEditFlag] = React.useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = React.useState<any[]>([]);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [errorModalOpen, setErrorModalOpen] = React.useState(false);
  const [errorMessages, setErrorMessages] = React.useState<string[]>([]);
  const [itemGroupInput, setItemGroupInput] = React.useState<ItemGroup>({
    itemGroupCode: "",
    itemGroupName: "",
    id: 0,
    isActive: 1,
  });
  const [itemGroupData, setItemGroupData] = React.useState<any[]>([]);
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
      field: "item_code",
      headerName: "Code",
      flex: 1,
      minWidth: 200,
      valueGetter: (value: any, row: any) =>
        `${row?.itemGroupCode.toUpperCase() || ""}`,
    },
    {
      field: "item_name",
      headerName: "Item Name",
      flex: 2,
      minWidth: 200,
      valueGetter: (value: any, row: any) =>
        `${row?.itemGroupName || ""}`.replace(/\b\w/g, (char) =>
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
  const GetItemGroupList = async () => {
    try {
      const response = await Apirequest(
        InventoryConfig.ItemGroup.ItemGroupList.endpoint
          .replace("{page}", page.toString())
          .replace("{size}", size.toString())
          .replace("{searchTerm}", search),
        InventoryConfig.ItemGroup.ItemGroupList.method,
        null,
        "inventory"
      ).then((res) => res.data);
      const { totalCount, statusCode, data } = response;
      if (statusCode === 200 || statusCode === 201) {
        setItemGroupData(data);
        setLoading(false);
        setCount(totalCount);
      } else {
        setCount(0);
        setItemGroupData([]);
        setLoading(false);
      }
    } catch (err) {
      console.log(err);
      setItemGroupData([]);
    }
  };

  React.useEffect(() => {
    initFlag && search !== "" ? GetItemGroupList() : GetItemGroupList();
  }, [debouncedSearchTerm, page, size]);

  const handleClickOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
    setEditFlag(false);
  };
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let { name, value } = e.target;
    setItemGroupInput({ ...itemGroupInput, [name]: value });
    setError([]);
  };
  const handleEdit = (row: any) => {
    console.log(row);
    setOpen(true);
    setEditFlag(true);
    setItemGroupInput({
      itemGroupCode: row.itemGroupCode,
      itemGroupName: row.itemGroupName,
      id: row.id,
      isActive: row.isActive,
    });
  };
  const handleSubmit = (e: React.MouseEvent<HTMLButtonElement>) => {
    let temp: any = [];
    Object.entries(itemGroupInput).map(([key, value]) => {
      if (key === "itemGroupCode" && value?.length == 0) {
        temp.push(key);
      } else if (key === "itemGroupName" && value?.length == 0) {
        temp.push(key);
      }
    });
    setError(temp);
    if (temp.length === 0 && editFlag) {
      UpdateItemGroup();
    } else {
      if (temp.length === 0) {
        AddItemGroup();
      }
    }
  };
  const AddItemGroup = async () => {
    try {
      const body: any = {
        itemGroupCode: itemGroupInput.itemGroupCode?.trim()?.toUpperCase(),
        itemGroupName: itemGroupInput.itemGroupName
          ?.trim()
          .replace(/\b\w/g, (char) => char.toUpperCase()),
      };

      const { endpoint, method } = InventoryConfig.ItemGroup.AddItemGroup;
      const response = await Apirequest(endpoint, method, body, "inventory").then(
        (res) => res.data
      );
      if (response.statusCode === 200 || response.statusCode === 201) {
        toast.success(response.message);
        setOpen(false);
        setItemGroupInput({
          ...itemGroupInput,
          itemGroupCode: "",
          itemGroupName: "",
        });
        setEditFlag(false);
        GetItemGroupList();
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
  const UpdateItemGroup = async () => {
    try {
      const body: any = {
        itemGroupCode: itemGroupInput.itemGroupCode?.trim()?.toUpperCase(),
        itemGroupName: itemGroupInput.itemGroupName
          ?.trim()
          .replace(/\b\w/g, (char) => char.toUpperCase()),
        id: itemGroupInput.id,
        isActive: itemGroupInput.isActive,
      };

      const { endpoint, method } = InventoryConfig.ItemGroup.UpdateItemGroup;
      const response = await Apirequest(endpoint, method, body, "inventory").then(
        (res) => res.data
      );
      if (response.statusCode === 200) {
        toast.success(response.message);
        setOpen(false);
        setEditFlag(false);
        GetItemGroupList();
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
  const handleDelete = (id: number) => {
    setItemGroupInput({ ...itemGroupInput, id: id });
    setDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    DeleteItemGroup();
    setDeleteOpen(false);
  };
  const DeleteItemGroup = async () => {
    try {
      const body = {
        id: itemGroupInput.id,
      };
      const { endpoint, method } = InventoryConfig.ItemGroup.DeleteItemGroup;
      const result = await Apirequest(
        endpoint.replace("{id}", `${itemGroupInput.id}`),
        method,
        body,
        "inventory"
      ).then((res) => res.data);
      toast.success(result?.message);
      GetItemGroupList();
    } catch (err) {
      console.log(err);
      GetItemGroupList();
    }
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
          <IconBreadcrumbs parent={"Purchase"} child={"Item Group"} path="" />
        </Box>
        <Box
          display={"flex"}
          justifyContent={"space-between"}
          alignItems={"center"}
          flexWrap={"wrap"}
          gap={2}
        >
          <GlobalSearch
            placeholder="search item group"
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
            rows={itemGroupData}
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

      <CreateItemGroup
        open={open}
        close={handleClose}
        editFlag={editFlag}
        itemGroupInput={itemGroupInput}
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

export default ItemGroupPage;
