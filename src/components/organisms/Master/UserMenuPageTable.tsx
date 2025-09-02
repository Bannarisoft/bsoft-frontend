import { Box, MenuProps } from "@mui/material";
import React, { useState } from "react";
import IconBreadcrumbs from "../../molecules/AdminLayout/BreadCrumbs";
import GlobalSearch from "../../molecules/AdminLayout/GlobalSearch";
import { MuiButton, MuiTable } from "bsoft-base-elements";
import { GoPlus } from "react-icons/go";
import SkeletonLoader from "../../molecules/AdminLayout/SkeletonLoader";
import NoDataFound from "../../molecules/AdminLayout/NoDataFound";
import {
  Apirequest,
  isSubmitting,
  startLoading,
  stopLoading,
} from "../../../utils/lib";
import Config from "../../../utils/config.api.json";
import { useDebounce } from "../../../hooks/useDebounceHook";
import { GridColDef } from "@mui/x-data-grid";
import dayjs from "dayjs";
import { FiEdit } from "react-icons/fi";
import { RiDeleteBin6Line } from "react-icons/ri";
import CreateNewMenu from "../../molecules/Master/CreateNewMenu";
import { MenuPropsType } from "../../../types/types";
import { useDataFetchHook } from "../../../hooks/useDataFetchHook";
import DeleteConfirmation from "../../molecules/Master/DeleteConfirmation";
import toast from "react-hot-toast";

const UserMenuListPage = () => {
  const [search, setSearch] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const [page, setPage] = React.useState<number>(1);
  const [size, setSize] = React.useState<number>(15);
  const [count, setCount] = React.useState<number>(0);
  const [initFlag, setInitFlag] = React.useState(false);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<string[]>([]);
  const debouncedSearchTerm = useDebounce(search, 500);
  const [editFlag, setEditFlag] = React.useState(false);
  const [deleteOpen, setDeleteOpen] = React.useState(false);

  const [menuInput, setMenuInput] = useState<MenuPropsType>({
    menuName: "",
    menuUrl: "",
    menuIcon: "",
    moduleId: 0,
    parentId: 0,
    id: 0,
    sortOrder: 0,
    isActive: 1,
    menuType: "",
  });
  const [menuData, setMenuData] = useState<any>([]);
  const [selectedValue, setSelectedValue] = useState<{
    selectedModule: any;
    parentId: any;
  }>({
    selectedModule: null,
    parentId: null,
  });
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setMenuInput({ ...menuInput, [name]: value });
  };
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };
  const handleClickOpen = () => {
    setOpen(true);
    setMenuInput({
      menuName: "",
      menuUrl: "",
      menuIcon: "",
      moduleId: 0,
      parentId: 0,
      id: 0,
      sortOrder: 0,
      isActive: 1,
      menuType: "",
    });
    setSelectedValue({
      selectedModule: null,
      parentId: null,
    });
    setErrors([]);
  };
  const handleClose = () => {
    setOpen(false);
    setEditFlag(false);
    setMenuInput({
      menuName: "",
      menuUrl: "",
      menuIcon: "",
      moduleId: 0,
      parentId: 0,
      id: 0,
      sortOrder: 0,
      isActive: 1,
      menuType: "",
    });
    setSelectedValue({
      selectedModule: null,
      parentId: null,
    });
    setErrors([]);
  };
  const handleSwitch = (e: React.ChangeEvent<HTMLInputElement>) => {
    let { checked } = e.target;
    checked
      ? setMenuInput({ ...menuInput, isActive: 1 })
      : setMenuInput({ ...menuInput, isActive: 0 });
  };

  const handleAutocomplete = (
    _event: React.SyntheticEvent,
    value: any,
    field: string
  ) => {
    setErrors([]);

    if (field === "moduleId") {
      setSelectedValue((prev) => ({ ...prev, selectedModule: value }));
      setMenuInput((prev) => ({
        ...prev,
        moduleId: value?.id || 0,
      }));
    } else if (field === "parentId") {
      setSelectedValue((prev) => ({ ...prev, parentId: value }));
      setMenuInput((prev) => ({
        ...prev,
        parentId: value?.id || 0,
      }));
    }
  };

  const columns: GridColDef<(typeof menuData)[number]>[] = [
    {
      field: "s_no",
      headerName: "S.No",
      flex: 1,
      minWidth: 150,
      sortable: true,
      renderCell: (params) => {
        return (
          (page - 1) * size + (params.api.getAllRowIds().indexOf(params.id) + 1)
        );
      },
    },
    {
      field: "module_name",
      headerName: "Module Name",
      sortable: true,
      flex: 2,
      minWidth: 150,
      editable: true,
      valueGetter: (value, row: any) => `${row?.moduleName || ""}`,
    },
    {
      field: "menu_name",
      headerName: "Menu Name",
      sortable: true,
      flex: 2,
      minWidth: 150,
      editable: true,
      valueGetter: (value, row: any) =>
        `${row?.menuName || ""}`.replace(/\b\w/g, (char) => char.toUpperCase()),
    },
    {
      field: "menu_url",
      headerName: "Menu Url",
      sortable: true,
      flex: 2,
      minWidth: 150,
      editable: true,
      valueGetter: (value, row: any) => `${row?.menuUrl || ""}`,
    },
    {
      field: "parent_name",
      headerName: "Parent Menu",
      sortable: true,
      flex: 2,
      minWidth: 150,
      editable: true,
      valueGetter: (value, row: any) => `${row?.parentName || ""}`,
    },

    {
      field: "createdAt",
      headerName: "Created At",
      flex: 2,
      minWidth: 150,
      valueGetter: (value, row: any) =>
        `${dayjs(row?.createdAt).format("DD-MM-YYYY")}`,
    },
    {
      field: "isActive",
      headerName: "Status",
      flex: 1,
      minWidth: 150,
      valueGetter: (value, row: any) =>
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

  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    let temp: string[] = [];
    if (isSubmitting()) return;
    startLoading();

    Object.entries(menuInput).forEach(([key, value]) => {
      if (
        key === "menuName" &&
        (!value || value.toString().trim().length < 1)
      ) {
        temp.push(key);
      }
    });

    if (!selectedValue.selectedModule) temp.push("moduleId");
    // if (!selectedValue.parentId) temp.push("parentId");

    setErrors(temp);

    if (temp.length > 0) {
      toast.error("Please fill all required fields");
      stopLoading();
      return;
    }

    try {
      await AddMenu();
    } catch (err) {
      console.error("Error submitting menu:", err);
      toast.error("Failed to save menu");
    } finally {
      stopLoading();
    }
  };

  const AddMenu = async () => {
    try {
      startLoading();
      const body: any = {
        menuName: menuInput.menuName,
        moduleId: selectedValue.selectedModule?.id || null,
        menuIcon: menuInput.menuIcon,
        menuUrl: menuInput.menuUrl,
        parentId: selectedValue.parentId?.id ?? 0,
        sortOrder: menuInput.sortOrder,
        isActive: menuInput.isActive,
        type: menuInput.menuType
      };

      if (editFlag) {
        body.id = Number(menuInput.id);
      }
      const { endPoint, method } = editFlag
        ? Config.Menu.updateMenu
        : Config.Menu.addMenu;
      const response = await Apirequest(endPoint, method, body).then(
        (res) => res.data
      );
      if (response.statusCode === 200 || response.statusCode === 201) {
        toast.success(response.message);
        setOpen(false);
        setEditFlag(false);
        GetMenuList();
      } else {
        toast.error(response.message);
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
    setErrors([]);
    setMenuInput({
      ...menuInput,
      menuName: row.menuName,
      menuIcon: row.menuIcon,
      menuUrl: row.menuUrl,
      sortOrder: row.sortOrder,
      id: row.id,
      menuType: row.type
    });

    const getModule = moduleData?.find((mod: any) => mod.id === row.moduleId);
    const getParent = parentMenu?.find((p: any) => p.id === row.parentId);

    setSelectedValue({
      selectedModule: getModule || null,
      parentId: getParent || null,
    });
  };

  const handleDelete = (id: number) => {
    setMenuInput({ ...menuInput, id: id });
    setDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    DeleteMenu();
    setDeleteOpen(false);
  };
  const DeleteMenu = async () => {
    try {
      const body = {
        id: menuInput.id,
      };
      const { endpoint, method } = Config.Menu.deleteMenu;
      const result = await Apirequest(
        endpoint.replace("{id}", `${menuInput.id}`),
        method,
        body
      ).then((res) => res.data);
      toast.success(result?.message);
      GetMenuList();
    } catch (err) {
      console.log(err);
    }
  };

  const { data: moduleData } = useDataFetchHook(
    Config.Module.getModule.endpoint,
    Config.Module.getModule.method
  );
  const { data: parentMenu } = useDataFetchHook(
    Config.Menu.getparentMenu.endpoint,
    Config.Menu.getparentMenu.method
  );

  const GetMenuList = async () => {
    try {
      const { endpoint, method } = Config.Menu;
      const result = await Apirequest(
        endpoint
          .replace("{page}", page.toString())
          .replace("{size}", size.toString())
          .replace("{searchTerm}", search),
        method
      ).then((res) => res.data);
      setMenuData(result.data);
      setLoading(false);
      setCount(result.totalCount);
    } catch (err) {
      console.log(err);
      setMenuData([]);
    }
  };
  React.useEffect(() => {
    initFlag && search !== "" ? GetMenuList() : GetMenuList();
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
          <IconBreadcrumbs parent="Master" child="User Menu" path="" />
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
              placeholder="search Menu"
              width={300}
              onChange={handleSearch}
            />

            <MuiButton
              startIcon={<GoPlus />}
              onClick={handleClickOpen}
              variant="contained"
            >
              Create
            </MuiButton>
          </Box>
        </Box>
      </Box>

      <Box sx={{ height: 700, width: "100%", my: 2 }} className="main-table">
        {loading ? (
          <SkeletonLoader />
        ) : (
          <MuiTable
            rows={menuData}
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
            columnHeaderHeight={40}
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

      <CreateNewMenu
        open={open}
        close={handleClose}
        handleSwitch={handleSwitch}
        editFlag={editFlag}
        menuInput={menuInput}
        moduleData={moduleData}
        parentMenu={parentMenu}
        selectedValue={selectedValue}
        handleAutocomplete={handleAutocomplete}
        handleChange={handleChange}
        handleSubmit={handleSubmit}
        errors={errors}
      />

      <DeleteConfirmation
        open={deleteOpen}
        close={() => setDeleteOpen(false)}
        handleDelete={handleConfirmDelete}
      />
    </>
  );
};

export default UserMenuListPage;
