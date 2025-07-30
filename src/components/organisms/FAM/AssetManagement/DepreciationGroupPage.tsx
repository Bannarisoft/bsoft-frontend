"use client";

import { Box } from "@mui/material";
import React, { useEffect, useState } from "react";

import { MuiButton, MuiTable } from "bsoft-base-elements";
import { GoPlus } from "react-icons/go";
import IconBreadcrumbs from "../../../molecules/AdminLayout/BreadCrumbs";
import GlobalSearch from "../../../molecules/AdminLayout/GlobalSearch";
import { useDebounce } from "../../../../hooks/useDebounceHook";
import { FiEdit } from "react-icons/fi";
import { RiDeleteBin6Line } from "react-icons/ri";
import { Apirequest } from "../../../../utils/lib";
import dayjs from "dayjs";
import Config from "../../../../utils/fam.api.json";
import NoDataFound from "../../../molecules/AdminLayout/NoDataFound";
import CreateDepreciation, {
  DepreciationProps,
} from "../../../molecules/FAM/CreateDepreciation";
import DeleteConfirmation from "../../../molecules/Master/DeleteConfirmation";
import { usePrivilegeCheck } from "../../../../hooks/usePrivilegeCheck";
import ErrorModal from "../../../molecules/Master/Role/ErrorModal";
import SkeletonLoader from "../../../molecules/AdminLayout/SkeletonLoader";
import toast from "react-hot-toast";

export interface MiscProps {
  miscCode: string;
  description: string;
  id: number;
  isActive: number;
  sortOrder: number;
}

export interface SnackbarTypes {
  open: boolean;
  message: string;
}

function DepreciationGroup() {
  const [pathname, setPathName] = useState<string>("");
  const permissions = usePrivilegeCheck(pathname);
  const [page, setPage] = React.useState<number>(1);
  const [size, setSize] = React.useState<number>(15);
  const [search, setSearch] = React.useState("");
  const debouncedSearchTerm = useDebounce(search, 500);
  const [loading, setLoading] = React.useState(true);
  const [depreciationData, setDepreciationData] = React.useState<any[]>([]);
  const [count, setCount] = React.useState<number>(0);
  const [initFlag, setInitFlag] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const [error, setError] = React.useState<any[]>([]);
  const [bookType, setBookType] = React.useState<any[]>([]);
  const [depreciationMethod, setDepreciationMethod] = React.useState<any[]>([]);
  const [selectedBookType, setSelectedBookType] = React.useState<any>(null);
  const [editFlag, setEditFlag] = React.useState(false);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [assetGroupId, setAssetGroupId] = React.useState<any[]>([]);
  const [selectedAssetGroup, setSelectedAssetGroup] = React.useState<any>(null);
  const [errorModalOpen, setErrorModalOpen] = React.useState(false);
  const [errorMessages, setErrorMessages] = React.useState<string[]>([]);
  const [selectedDepreciationMethod, setSelectedDepreciationMethod] =
    React.useState<any>(null);
  const [depreciationInput, setDepreciationInput] =
    React.useState<DepreciationProps>({
      code: "",
      depreciationGroupName: "",
      id: 0,
      isActive: 1,
      sortOrder: 0,
      bookType: 0,
      depreciationMethod: 0,
      usefulLife: 0,
      residualValue: 0,
    });
  const [snackbarMisc, setSnackbarMisc] = React.useState<SnackbarTypes>({
    open: false,
    message: "",
  });

  const handleClickOpen = () => {
    setOpen(true);
    setEditFlag(false);
    setDepreciationInput({
      ...depreciationInput,
      code: "",
      depreciationGroupName: "",
      id: 0,
      isActive: 1,
      sortOrder: 0,
      bookType: 0,
      depreciationMethod: 0,
      usefulLife: 0,
      residualValue: 0,
    });
    setSelectedBookType(null);
    setSelectedDepreciationMethod(null);
    setSelectedAssetGroup(null);
  };

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
      field: "Depreciation_code",
      headerName: "Depreciation Code",
      flex: 2,
      minWidth: 200,
      valueGetter: (value: any, row: any) => `${row?.code.toUpperCase() || ""}`,
    },
    {
      field: "Depreciation_Name",
      headerName: "Depreciation Name",
      flex: 2,
      minWidth: 200,
      valueGetter: (value: any, row: any) =>
        `${row?.depreciationGroupName || ""}`.replace(/\b\w/g, (char) =>
          char.toUpperCase()
        ),
    },
    {
      field: "AssetGroup_Name",
      headerName: "AssetGroup Name",
      flex: 2,
      minWidth: 200,
      valueGetter: (value: any, row: any) => `${row?.assetGroupName || ""}`,
    },
    {
      field: "depreciation_MethodDesc",
      headerName: "Depreciation Method",
      flex: 3,
      minWidth: 200,
      valueGetter: (value: any, row: any) =>
        `${row?.depreciationMethodDesc || ""}`,
    },
    {
      field: "BookTypeDesc",
      headerName: "Book Type ",
      flex: 2,
      minWidth: 200,
      valueGetter: (value: any, row: any) => `${row?.bookTypeDesc || ""}`,
    },
    {
      field: "createdAt",
      headerName: "Created At ",
      flex: 2,
      minWidth: 150,
      valueGetter: (value: any, row: any) =>
        `${dayjs(row?.createdAt).format("DD-MM-YYYY")}`,
    },

    {
      field: "isActive",
      headerName: "Status",
      flex: 1,
      minWidth: 100,
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
  useEffect(() => {
    setInitFlag(true);
    const currentPath = window.location.pathname.split("/bsoft").at(-1) || "";
    setPathName(currentPath);
  }, []);

  const handleClose = () => {
    setOpen(false);
    setDepreciationInput({
      code: "",
      depreciationGroupName: "",
      // assetGroupId: 0,
      id: 0,
      isActive: 1,
      sortOrder: 0,
      bookType: 0,
      depreciationMethod: 0,
      usefulLife: 0,
      residualValue: 0,
    });
    setError([]);
  };

  const handleSwitch = (e: React.ChangeEvent<HTMLInputElement>) => {
    let { checked } = e.target;
    checked
      ? setDepreciationInput({ ...depreciationInput, isActive: 1 })
      : setDepreciationInput({ ...depreciationInput, isActive: 0 });
  };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let { name, value } = e.target;
    const filteredValue =
      name === "code" ? value.replace(/[^a-zA-Z0-9]/g, "") : value;
    setDepreciationInput({ ...depreciationInput, [name]: filteredValue });
    setError([]);
  };
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };
  const handleEdit = (row: any) => {
    setEditFlag(true);
    setOpen(true);
    setDepreciationInput({
      code: row?.code,
      depreciationGroupName: row?.depreciationGroupName,
      id: row?.id,
      isActive: row?.isActive,
      sortOrder: row?.sortOrder,
      bookType: row?.bookType,
      depreciationMethod: row?.depreciationMethod,
      usefulLife: row?.usefulLife,
      residualValue: row?.residualValue,
    });
    const getGroup = assetGroupId
      .filter((i) => i?.id === row?.assetGroupId)
      ?.at(0);
    setSelectedAssetGroup(getGroup);

    const getBookType = bookType
      .filter((i: any) => i.id == row?.bookType)
      .at(0);
    setSelectedBookType(getBookType);
    const GetDepreciationMethod = depreciationMethod
      .filter((i: any) => i.id == row?.depreciationMethod)
      .at(0);
    setSelectedDepreciationMethod(GetDepreciationMethod);
    setSelectedBookType(getBookType);
  };

  const handleSubmit = (e: React.MouseEvent<HTMLButtonElement>) => {
    let temp: any = [];
    Object.entries(depreciationInput).map(([key, value]) => {
      if (key === "code" && value?.length < 1) {
        temp.push(key);
      } else if (key === "depreciationGroupName" && value?.length < 1) {
        temp.push(key);
      }
      if (selectedBookType === null) {
        temp.push("bookType");
      }
      if (selectedDepreciationMethod === null) {
        temp.push("depreciationMethod");
      }
      if (selectedAssetGroup === null) {
        temp.push("assetGroupId");
      }
      if (
        !depreciationInput.usefulLife ||
        Number(depreciationInput.usefulLife) <= 0
      ) {
        temp.push("usefulLife");
      }

      if (
        !depreciationInput.residualValue ||
        Number(depreciationInput.residualValue) <= 0
      ) {
        temp.push("residualValue");
      }
    });
    setError(temp);
    if (temp.length === 0 && editFlag) {
      UpdateDepreciationGroup();
    } else {
      if (temp.length === 0) {
        AddDepreciationGroup();
        setLoading(true);
      }
    }
  };

  const AddDepreciationGroup = async () => {
    const body = {
      code: depreciationInput.code.trim()?.toUpperCase(),
      depreciationGroupName: depreciationInput.depreciationGroupName
        ?.trim()
        .replace(/\b\w/g, (char) => char.toUpperCase()),
      assetGroupId: selectedAssetGroup.id,
      depreciationMethod: selectedDepreciationMethod.id,
      bookType: selectedBookType.id,
      usefulLife: depreciationInput.usefulLife,
      residualValue: depreciationInput.residualValue,
    };

    try {
      const { endpoint, method } = Config.Depreciation.AddDepreciationGroup;
      const response = await Apirequest(endpoint, method, body, "fam").then(
        (res) => res.data
      );

      if (response.statusCode === 200 || response.statusCode === 201) {
        toast.success(response.message);
        setOpen(false);
        setDepreciationInput({ ...depreciationInput });
        setEditFlag(false);
        GetDepreciationList();
      } else {
        toast.error(response.message);
        if (Array.isArray(response.errors) && response.errors.length > 0) {
          setErrorModalOpen(true);
          setErrorMessages(response.errors);
        }
        GetDepreciationList();
      }
    } catch (err) {
      console.log(err);
    }
  };

  const UpdateDepreciationGroup = async () => {
    const body = {
      code: depreciationInput.code.trim()?.toUpperCase(),
      depreciationGroupName: depreciationInput.depreciationGroupName
        ?.trim()
        .replace(/\b\w/g, (char) => char.toUpperCase()),
      assetGroupId: selectedAssetGroup.id,
      depreciationMethod: selectedDepreciationMethod.id,
      bookType: selectedBookType.id,
      usefulLife: depreciationInput.usefulLife,
      residualValue: depreciationInput.residualValue,
      id: depreciationInput.id,
      isActive: depreciationInput.isActive,
      sortOrder: depreciationInput.sortOrder,
    };
    try {
      const { endpoint, method } = Config.Depreciation.UpdateDepreciationGroup;
      const response = await Apirequest(endpoint, method, body, "fam").then(
        (res) => res.data
      );

      if (response.statusCode === 200 || response.statusCode === 201) {
        toast.success(response.message);
        setOpen(false);
        setDepreciationInput({ ...depreciationInput });
        setEditFlag(false);
        GetDepreciationList();
      } else {
        toast.error(response.message);
        setErrorMessages(response.errors);
      }
    } catch (err) {
      GetDepreciationList();
      console.log(err);
    }
  };
  const handleBooktypeChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    value: { id: string; description: string } | null,
    field: string
  ) => {
    if (field === "bookType") {
      if (!value?.id) {
        setSelectedBookType(null);
        setDepreciationInput((prev) => ({ ...prev, description: 0 }));
      } else {
        setSelectedBookType(value);
        setDepreciationInput((prev) => ({ ...prev, description: value.id }));
        GetBookType();
      }
    }
  };
  const handleDepreciationMethodChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    value: { id: string; description: string } | null,
    field: string
  ) => {
    if (field === "depreciationMethod") {
      if (!value?.id) {
        setSelectedDepreciationMethod(null);
        setDepreciationInput((prev) => ({ ...prev, description: 0 }));
      } else {
        setSelectedDepreciationMethod(value);
        setDepreciationInput((prev) => ({ ...prev, description: value.id }));
        GetBookType();
      }
    }
  };

  const handleAssetGroupChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    value: any
  ) => {
    setError([]);
    if (!value) {
      setSelectedAssetGroup(null);
    } else {
      setSelectedAssetGroup(value);
    }
  };
  const GetBookType = async () => {
    try {
      const { endpoint, method } = Config.Depreciation.BookType;
      const result = await Apirequest(endpoint, method, null, "fam").then(
        (res) => res.data
      );
      setBookType(result.data);
    } catch (err) {
      console.log(err);
      setBookType([]);
    }
  };
  const GetAssetGroupList = async () => {
    try {
      const { endpoint, method } = Config.AssetGroup.AssetGroupName;
      const result = await Apirequest(endpoint, method, null, "fam").then(
        (res) => res.data
      );
      setLoading(false);
      setAssetGroupId(result.data);
      setCount(result.totalCount);
    } catch (err) {
      console.log(err);
      setLoading(false);
    }
  };
  const GetDepreciationMethod = async () => {
    try {
      const { endpoint, method } = Config.Depreciation.DepreciationMethod;
      const result = await Apirequest(endpoint, method, null, "fam").then(
        (res) => res.data
      );
      setDepreciationMethod(result.data);
    } catch (err) {
      console.log(err);
      setDepreciationMethod([]);
    }
  };

  useEffect(() => {
    GetBookType();
    GetAssetGroupList();
    GetDepreciationMethod();
  }, []);

  const GetDepreciationList = async () => {
    try {
      const { endpoint, method } = Config.Depreciation;
      const result = await Apirequest(
        endpoint
          .replace("{page}", page.toString())
          .replace("{size}", size.toString())
          .replace("{searchTerm}", search),
        method,
        null,
        "fam"
      ).then((res) => res.data);
      setLoading(false);
      setDepreciationData(result.data);
      setCount(result.totalCount);
    } catch (err) {
      console.log(err);
      setLoading(false);
    }
  };

  const DeleteDepreciationGroup = async () => {
    try {
      const body = {
        id: depreciationInput.id,
      };
      const { endpoint, method } = Config.Depreciation.DeleteDepreciationGroup;
      const response = await Apirequest(
        endpoint.replace("{id}", `${depreciationInput.id}`),
        method,
        body,
        "fam"
      ).then((res) => res.data);

      if (response.statusCode === 200 || response.statusCode === 201) {
        toast.success(response.message);
        setOpen(false);
        setEditFlag(false);
        GetDepreciationList();
      } else {
        toast.error(response.message);
        setErrorMessages(response.errors);
      }
    } catch (err) {
      console.log(err);
      GetDepreciationList();
    }
  };

  const handleDelete = (id: number) => {
    setDepreciationInput({ ...depreciationInput, id: id });
    setDeleteOpen(true);
  };
  const handleConfirmDelete = async () => {
    DeleteDepreciationGroup();
    setDeleteOpen(false);
  };
  useEffect(() => {
    initFlag && search !== "" ? GetDepreciationList() : GetDepreciationList();
  }, [debouncedSearchTerm, page, size]);
  useEffect(() => {
    setInitFlag(true);
  }, []);
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
            child={"Depreciation Group"}
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
            placeholder="search depreciation group"
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
            rows={depreciationData}
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
      <CreateDepreciation
        open={open}
        close={handleClose}
        error={error}
        bookType={bookType}
        depreciationMethod={depreciationMethod}
        depreciationInput={depreciationInput}
        handleBooktypeChange={handleBooktypeChange}
        handleDepreciationMethodChange={handleDepreciationMethodChange}
        selectedBookType={selectedBookType}
        selectedDepreciationMethod={selectedDepreciationMethod}
        handleSwitch={handleSwitch}
        handleChange={handleChange}
        handleSubmit={handleSubmit}
        assetGroupId={assetGroupId}
        handleAssetGroupChange={handleAssetGroupChange}
        selectedAssetGroup={selectedAssetGroup}
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

export default DepreciationGroup;
