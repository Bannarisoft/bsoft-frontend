"use client";

import { Box } from "@mui/material";
import React, { useEffect, useState } from "react";
import IconBreadcrumbs from "../../molecules/AdminLayout/BreadCrumbs";
import GlobalSearch from "../../molecules/AdminLayout/GlobalSearch";
import { MuiButton, MuiTable } from "bsoft-base-elements";
import { GoPlus } from "react-icons/go";
import { useDebounce } from "../../../hooks/useDebounceHook";
import Config from "../../../../src/utils/fam.api.json";
import { Apirequest } from "../../../utils/lib";
import NoDataFound from "../../molecules/AdminLayout/NoDataFound";
import { FiEdit } from "react-icons/fi";
import { RiDeleteBin6Line } from "react-icons/ri";
import dayjs from "dayjs";
import CreateAssetGroup from "../../molecules/FAM/CreateAssetGroup";
import DeleteConfirmation from "../../molecules/Master/DeleteConfirmation";
import { usePrivilegeCheck } from "../../../hooks/usePrivilegeCheck";
import ErrorModal from "../../molecules/Master/Role/ErrorModal";
import SkeletonLoader from "../../molecules/AdminLayout/SkeletonLoader";
import toast from "react-hot-toast";

export interface GroupProps {
  code: string;
  groupName: string;
  id: number;
  isActive: number;
  sortOrder: number;
  groupPercentage: number;
}

function AssetGroupPage() {
  const [pathname, setPathName] = useState<string>("");
  const permissions = usePrivilegeCheck(pathname);
  const [page, setPage] = React.useState<number>(1);
  const [size, setSize] = React.useState<number>(15);
  const [search, setSearch] = React.useState("");
  const debouncedSearchTerm = useDebounce(search, 500);
  const [loading, setLoading] = React.useState(true);
  const [groupData, setGroupData] = React.useState<any[]>([]);
  const [count, setCount] = React.useState<number>(0);
  const [initFlag, setInitFlag] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const [groupInput, setGroupInput] = React.useState<GroupProps>({
    code: "",
    groupName: "",
    id: 0,
    isActive: 1,
    sortOrder: 0,
    groupPercentage: 0,
  });
  const [editFlag, setEditFlag] = React.useState(false);
  const [error, setError] = React.useState<any[]>([]);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
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
      field: "group_code",
      headerName: "Asset Group Code",
      flex: 1,
      minWidth: 200,
      valueGetter: (value: any, row: any) => `${row?.code.toUpperCase() || ""}`,
    },
    {
      field: "group_name",
      headerName: "Group Name",
      flex: 2,
      minWidth: 200,
      valueGetter: (value: any, row: any) =>
        `${row?.groupName || ""}`.replace(/\b\w/g, (char) =>
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

  const GetAssetGroupList = async () => {
    try {
      const { endpoint, method } = Config.AssetGroup;
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
      setGroupData(response.data);
      setCount(response.totalCount);
    } catch (err) {
      console.log(err);
      setLoading(false);
    }
  };

  const AddAssetGroup = async () => {
    const body = {
      code: groupInput.code?.trim()?.toUpperCase(),
      groupName: groupInput.groupName
        ?.trim()
        .replace(/\b\w/g, (char) => char.toUpperCase()),
      groupPercentage: groupInput.groupPercentage,
    };

    try {
      const { endpoint, method } = Config.AssetGroup.AddAssetGroup;
      const response = await Apirequest(endpoint, method, body, "fam").then(
        (res) => res.data
      );

      if (response.statusCode === 200 || response.statusCode === 201) {
        toast.success(response.message);
        setOpen(false);
        setGroupInput({ ...groupInput, code: "", groupName: "" });
        setEditFlag(false);
        GetAssetGroupList();
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

  const UpdateAssetGroup = async () => {
    const body = {
      // code: groupInput.code?.trim(),
      groupName: groupInput.groupName
        ?.trim()
        .replace(/\b\w/g, (char) => char.toUpperCase()),
      sortOrder: groupInput.sortOrder,
      id: groupInput.id,
      isActive: groupInput.isActive,
      groupPercentage: groupInput.groupPercentage,
    };
    try {
      const { endpoint, method } = Config.AssetGroup.UpdateAssetGroup;
      const response = await Apirequest(endpoint, method, body, "fam").then(
        (res) => res.data
      );

      if (response.statusCode === 200 || response.statusCode === 201) {
        toast.success(response.message);
        setOpen(false);
        setGroupInput({ ...groupInput, code: "", groupName: "" });
        setEditFlag(false);
        GetAssetGroupList();
      } else {
        toast.error(response.message);
        if (Array.isArray(response.errors) && response.errors.length > 0) {
          setErrorModalOpen(true);
          setErrorMessages(response.errors);
        }
      }
    } catch (err) {
      GetAssetGroupList();
      console.log(err);
    }
  };

  const DeleteAssetGroup = async () => {
    try {
      const body = {
        id: groupInput.id,
      };
      const { endpoint, method } = Config.AssetGroup.DeleteAssetGroup;
      const response = await Apirequest(
        endpoint.replace("{id}", `${groupInput.id}`),
        method,
        body,
        "fam"
      ).then((res) => res.data);

      if (response.statusCode === 200 || response.statusCode === 201) {
        toast.success(response.message);
        setOpen(false);
        setGroupInput({ ...groupInput, code: "", groupName: "" });
        setEditFlag(false);
        GetAssetGroupList();
      } else {
        toast.error(response.message);
        if (Array.isArray(response.errors) && response.errors.length > 0) {
          setErrorModalOpen(true);
          setErrorMessages(response.errors);
        }
      }
    } catch (err) {
      console.log(err);
      GetAssetGroupList();
    }
  };

  useEffect(() => {
    initFlag && search !== "" ? GetAssetGroupList() : GetAssetGroupList();
  }, [debouncedSearchTerm, page, size]);

  useEffect(() => {
    setInitFlag(true);
  }, []);

  const handleClose = () => {
    setOpen(false);
    setGroupInput({
      ...groupInput,
      code: "",
      groupName: "",
      groupPercentage: 0,
    });
    setEditFlag(false);
    setError([]);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let { name, value } = e.target;
    const filteredValue =
      name === "code" ? value.replace(/[^a-zA-Z0-9]/g, "") : value;
    setGroupInput({ ...groupInput, [name]: filteredValue });
    setError([]);
  };

  const handleSubmit = (e: React.MouseEvent<HTMLButtonElement>) => {
    let temp: string[] = [];

    Object.entries(groupInput).forEach(([key, value]) => {
      if (key === "code" && value.trim().length < 1) {
        temp.push(key);
      } else if (key === "groupName" && value.trim().length < 1) {
        temp.push(key);
      }
    });
    setError(temp);
    if (temp.length === 0) {
      setLoading(true);
      if (editFlag) {
        UpdateAssetGroup();
      } else {
        AddAssetGroup();
      }
    }
  };

  const handleSwitch = (e: React.ChangeEvent<HTMLInputElement>) => {
    let { checked } = e.target;
    checked
      ? setGroupInput({ ...groupInput, isActive: 1 })
      : setGroupInput({ ...groupInput, isActive: 0 });
  };

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleEdit = (row: any) => {
    setEditFlag(true);
    setOpen(true);
    setGroupInput({
      code: row?.code,
      groupName: row?.groupName,
      id: row?.id,
      isActive: row?.isActive,
      sortOrder: row?.sortOrder,
      groupPercentage: row?.groupPercentage,
    });
  };

  const handleDelete = (id: number) => {
    setGroupInput({ ...groupInput, id: id });
    setDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    DeleteAssetGroup();
    setDeleteOpen(false);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
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
            child={"Asset Group"}
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
            placeholder="search asset group"
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
            rows={groupData}
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
      <CreateAssetGroup
        open={open}
        close={handleClose}
        groupInput={groupInput}
        handleSubmit={handleSubmit}
        handleChange={handleChange}
        error={error}
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

export default AssetGroupPage;
