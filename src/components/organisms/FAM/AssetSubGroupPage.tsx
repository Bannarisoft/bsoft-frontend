import { Box } from "@mui/material";
import React, { useEffect, useState } from "react";
import IconBreadcrumbs from "../../molecules/AdminLayout/BreadCrumbs";
import GlobalSearch from "../../molecules/AdminLayout/GlobalSearch";
import { MuiButton, MuiTable } from "bsoft-base-elements";
import { GoPlus } from "react-icons/go";
import SkeletonLoader from "../../molecules/AdminLayout/SkeletonLoader";
import NoDataFound from "../../molecules/AdminLayout/NoDataFound";
import { usePrivilegeCheck } from "../../../hooks/usePrivilegeCheck";
import { useDebounce } from "../../../hooks/useDebounceHook";
import dayjs from "dayjs";
import { FiEdit } from "react-icons/fi";
import { RiDeleteBin6Line } from "react-icons/ri";
import { Apirequest } from "../../../utils/lib";
import Config from "../../../../src/utils/fam.api.json";
import ErrorModal from "../../molecules/Master/Role/ErrorModal";
import DeleteConfirmation from "../../molecules/Master/DeleteConfirmation";
import CreateAssetSubGroup from "../../molecules/FAM/CreateAssetSubGroup";
import { useDataFetchHook } from "../../../hooks/useDataFetchHook";
import toast from "react-hot-toast";

interface GroupSubProps {
  code: string;
  subGroupName: string;
  groupId: number;
  subGroupPercentage: number;
  additionalDepreciation: number;
  id: number;
  isActive: number;
  sortOrder: number;
}

function AssetSubGroupPage() {
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
  const [groupInput, setGroupInput] = React.useState<GroupSubProps>({
    code: "",
    subGroupName: "",
    groupId: 0,
    subGroupPercentage: 0,
    additionalDepreciation: 0,
    id: 0,
    isActive: 1,
    sortOrder: 0,
  });
  const [editFlag, setEditFlag] = React.useState(false);
  const [error, setError] = React.useState<any[]>([]);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [errorModalOpen, setErrorModalOpen] = React.useState(false);
  const [errorMessages, setErrorMessages] = React.useState<string[]>([]);
  const [selectedSubGroup, setSelectedSubGroup] = React.useState<any>(null);

  const columns = [
    {
      field: "s_no",
      headerName: "S.No",
      minWidth: 50,
      flex: 0,
      sortable: true,
      renderCell: (params: any) => {
        return (
          (page - 1) * size + (params.api.getAllRowIds().indexOf(params.id) + 1)
        );
      },
    },
    {
      field: "code",
      headerName: "Sub Group Code",
      flex: 1,
      minWidth: 200,
      valueGetter: (value: any, row: any) => `${row?.code.toUpperCase() || ""}`,
    },
    {
      field: "subGroupName",
      headerName: "Sub Group Name",
      flex: 2,
      minWidth: 200,
      valueGetter: (value: any, row: any) =>
        `${row?.subGroupName || ""}`.replace(/\b\w/g, (char) =>
          char.toUpperCase()
        ),
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
      field: "createdDate ",
      headerName: "Created Date ",
      flex: 1,
      minWidth: 150,
      valueGetter: (value: any, row: any) =>
        `${dayjs(row?.createdDate).format("DD-MM-YYYY")}`,
    },
    {
      field: "createdByName",
      headerName: "Created By",
      sortable: true,
      flex: 1,
      minWidth: 150,
      valueGetter: (value: any, row: any) => `${row?.createdByName ?? ""}`,
    },
  ];

  if (permissions.canUpdate || permissions.canDelete) {
    columns.push({
      field: "actions",
      headerName: "Actions",
      flex: 1,
      minWidth: 200,
      sortable: false,
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
    });
  }

  const { data: assetGroupData } = useDataFetchHook(
    Config.AssetGroup.AssetGroupName.endpoint,
    Config.AssetGroup.AssetGroupName.method,
    "fam"
  );
  useEffect(() => {
    setInitFlag(true);
    const currentPath = window.location.pathname.split("/bsoft").at(-1) || "";
    setPathName(currentPath);
  }, []);

  const GetAssetGroupList = async () => {
    try {
      const { endpoint, method } = Config.AssetSubGroup;
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

  const UpdateAssetGroup = async () => {
    const body: any = {
      code: groupInput.code?.trim()?.toUpperCase(),
      subGroupName: groupInput.subGroupName?.trim().replace(/\b\w/g, (char) => char.toUpperCase()),
      groupId: selectedSubGroup.id,
      subGroupPercentage: groupInput?.subGroupPercentage,
      sortOrder: groupInput.sortOrder,
      additionalDepreciation: groupInput?.additionalDepreciation ? 1 : 0,
      isActive: groupInput.isActive,
    };
    if (groupInput.id) {
      body.id = groupInput.id;
    }
    try {
      const { endpoint, method } = editFlag
        ? Config.AssetSubGroup.UpdateAssetGroup
        : Config.AssetSubGroup.AddAssetGroup;
      const response = await Apirequest(endpoint, method, body, "fam").then(
        (res) => res.data
      );

      if (response.statusCode === 200 || response.statusCode === 201) {
        toast.success(response.message);
        setOpen(false);
        setGroupInput({
          ...groupInput,
          code: "",
          subGroupName: "",
          subGroupPercentage: 0,
        });
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
      const { endpoint, method } = Config.AssetSubGroup.DeleteAssetGroup;
      const response = await Apirequest(
        endpoint.replace("{id}", `${groupInput.id}`),
        method,
        body,
        "fam"
      ).then((res) => res.data);

      if (response.statusCode === 200 || response.statusCode === 201) {
        toast.success(response.message);
        setOpen(false);
        setGroupInput({ ...groupInput, code: "", subGroupName: "" });
        setEditFlag(false);
        GetAssetGroupList();
      } else {
        toast.error(response.message);
        setErrorModalOpen(true);
        setErrorMessages(response.errors);
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
      subGroupName: "",
      groupId: 0,
      subGroupPercentage: 0,
      additionalDepreciation: 0,
      id: 0,
      isActive: 1,
      sortOrder: 0,
    });

    setEditFlag(false);
    setError([]);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let { name, value } = e.target;

    if (name === "code") {
      value = value.replace(/[^a-zA-Z0-9]/g, "");
    }
    if (name === "subGroupPercentage") {
      const numericValue = Math.min(Number(value), 100);
      value = numericValue.toString();
    }

    setGroupInput({ ...groupInput, [name]: value });
    setError([]);
  };

  const handleGroupChange = (value: any) => {
    setGroupInput({ ...groupInput, groupId: value });
    setError([]);
  };

  const handleChecked = (e: React.ChangeEvent<HTMLInputElement>) => {
    let { checked, value } = e.target;
    checked;
    setGroupInput({
      ...groupInput,
      additionalDepreciation: checked ? 1 : 0,
    });
    setError([]);
  };

  const handleSubmit = (e: React.MouseEvent<HTMLButtonElement>) => {
    let temp: string[] = [];

    Object.entries(groupInput).forEach(([key, value]) => {
      if (key === "code" && value.trim().length < 1) {
        temp.push(key);
      } else if (key === "subGroupName" && value.trim().length < 1) {
        temp.push(key);
      }
      if (selectedSubGroup === null) {
        temp.push("assetSubGroupId");
      }
    });
    setError(temp);
    if (temp.length === 0) {
      setLoading(true);
      UpdateAssetGroup();
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
    setSelectedSubGroup(null);
  };
  const handleSubGroupChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    value: any
  ) => {
    setError([]);
    if (!value) {
      setSelectedSubGroup(null);
    } else {
      setSelectedSubGroup(value);
    }
  };

  const handleEdit = (row: any) => {
    setEditFlag(true);
    setOpen(true);

    const getGroup = assetGroupData.find((i: any) => i?.id === row?.groupId);

    setSelectedSubGroup(getGroup || null);
    setGroupInput({
      code: row?.code || "",
      subGroupName: row?.subGroupName || "",
      id: row?.id || 0,
      isActive: row?.isActive ?? 1,
      sortOrder: row?.sortOrder || 0,
      groupId: getGroup?.id || 0,
      subGroupPercentage: row?.subGroupPercentage || 0,
      additionalDepreciation: row?.additionalDepreciation ? 1 : 0,
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
    <Box>
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
            child={"Asset Sub Group"}
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
            placeholder="search asset sub group"
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
      <Box className="main-table">
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
      <CreateAssetSubGroup
        open={open}
        close={handleClose}
        groupInput={groupInput}
        handleSubmit={handleSubmit}
        handleChange={handleChange}
        error={error}
        handleSwitch={handleSwitch}
        editFlag={editFlag}
        assetGroupData={assetGroupData}
        handleGroupChange={handleGroupChange}
        handleChecked={handleChecked}
        selectedSubGroup={selectedSubGroup}
        handleSubGroupChange={handleSubGroupChange}
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
    </Box>
  );
}

export default AssetSubGroupPage;
