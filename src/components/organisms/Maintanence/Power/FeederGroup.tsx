import { Box } from "@mui/material";
import React, { useEffect, useState } from "react";
import IconBreadcrumbs from "../../../molecules/AdminLayout/BreadCrumbs";
import GlobalSearch from "../../../molecules/AdminLayout/GlobalSearch";
import { MuiButton, MuiTable } from "bsoft-base-elements";
import { GoPlus } from "react-icons/go";
import NoDataFound from "../../../molecules/AdminLayout/NoDataFound";
import { FiEdit } from "react-icons/fi";
import { RiDeleteBin6Line } from "react-icons/ri";
import CreateFeederGroup from "../../../molecules/Maintanence/Power/CreateFeederGroup";
import { feedergroupsProps } from "../../../../maintanenceTypes";
import { useRecoilValue } from "recoil";
import { UserData } from "../../../../utils/atoms";
import { useDebounce } from "../../../../hooks/useDebounceHook";
import { usePrivilegeCheck } from "../../../../hooks/usePrivilegeCheck";
import DeleteConfirmation from "../../../molecules/Master/DeleteConfirmation";
import MainConfig from "../../../../utils/main.api.json";
import SkeletonLoader from "../../../molecules/AdminLayout/SkeletonLoader";
import { Apirequest } from "../../../../utils/lib";
import ErrorModal from "../../../molecules/Master/Role/ErrorModal";
import toast from "react-hot-toast";

function FeederGroup() {
  const [pathname, setPathName] = useState<string>("");
  const permissions = usePrivilegeCheck(pathname);
  useEffect(() => {
    setInitFlag(true);
    const currentPath = window.location.pathname.split("/bsoft").at(-1) || "";
    setPathName(currentPath);
  }, []);
  const columns = [
    {
      field: "s_no",
      headerName: "S.No",
      minWidth: 50,
      flex: 0.5,
      sortable: true,
      renderCell: (params: any) => {
        return (
          (page - 1) * size + (params.api.getAllRowIds().indexOf(params.id) + 1)
        );
      },
    },
    {
      field: "feederGroupCode",
      headerName: "Group Code",
      flex: 1,
      minWidth: 200,
      valueGetter: (value: any, row: any) =>
        `${row?.feederGroupCode.toUpperCase() || ""}`,
    },
    {
      field: "feederGroupName",
      headerName: "Group Name",
      flex: 1,
      minWidth: 200,
      valueGetter: (value: any, row: any) => `${row?.feederGroupName || ""}`,
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
      field: "actions",
      headerName: "Actions",
      flex: 1,
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
  const [page, setPage] = React.useState<number>(1);
  const [size, setSize] = React.useState<number>(15);
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const debouncedSearchTerm = useDebounce(search, 500);
  const [initFlag, setInitFlag] = React.useState(false);
  const [error, setError] = React.useState<any[]>([]);
  const userValue = useRecoilValue(UserData);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [feedgroupData, setFeederGroupData] = useState<any[]>([]);
  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [errorMessages, setErrorMessages] = useState<string[]>([]);
  const [editFlag, setEditFlag] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [count, setCount] = React.useState(0);
  const [feedergroupInput, setFeedergroupInput] =
    React.useState<feedergroupsProps>({
      id: 0,
      feederGroupCode: "",
      feederGroupName: "",
      isActive: 1,
      unitId: 1,
    });
  const handleClickOpen = () => {
    setOpen(true);
    setFeedergroupInput({
      ...feedergroupInput,
      feederGroupCode: "",
      feederGroupName: "",
      unitId: 1,
    });
    setError([]);
    setEditFlag(false);
  };
  const handleClose = () => {
    setOpen(false);
    setFeedergroupInput({
      ...feedergroupInput,
      feederGroupCode: "",
      feederGroupName: "",
      unitId: 1,
    });
    setError([]);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let { name, value } = e.target;
    const filteredValue =
      name === "feederGroupCode" ? value.replace(/[^a-zA-Z0-9]/g, "") : value;
    setFeedergroupInput({ ...feedergroupInput, [name]: filteredValue });
    setError([]);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };
  const handleEdit = (row: any) => {
    setFeedergroupInput({
      ...feedergroupInput,
      feederGroupCode: row?.feederGroupCode,
      feederGroupName: row?.feederGroupName,
      id: row?.id,
      isActive: row?.isActive,
    });
    setEditFlag(true);
    setOpen(true);
  };
  const handleDelete = (id: number) => {
    setFeedergroupInput({ ...feedergroupInput, id: id });
    setDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    DeleteFeederGroup();
    setDeleteOpen(false);
  };

  const DeleteFeederGroup = async () => {
    try {
      const body = {
        id: feedergroupInput.id,
      };
      const { endpoint, method } = MainConfig.FeederGroup.DeleteFeederGroup;
      const result = await Apirequest(
        endpoint.replace("{id}", `${feedergroupInput.id}`),
        method,
        body,
        "main"
      ).then((res) => res.data);
      toast.success(result?.message);
      GetFeederGroupList();
    } catch (err) {
      console.log(err);
    }
  };
  const handleSwitch = (e: React.ChangeEvent<HTMLInputElement>) => {
    let { checked } = e.target;
    checked
      ? setFeedergroupInput({ ...feedergroupInput, isActive: 1 })
      : setFeedergroupInput({ ...feedergroupInput, isActive: 0 });
  };

  const handleSubmit = (e: React.MouseEvent<HTMLButtonElement>) => {
    let temp: any = [];
    Object.entries(feedergroupInput).map(([key, value]) => {
      if (key === "feederGroupCode" && value?.length == 0) {
        temp.push(key);
      } else if (key === "feederGroupName" && value?.length == 0) {
        temp.push(key);
      }
    });
    setError(temp);

    if (temp.length === 0 && editFlag) {
      UpdateFeederGroup();
    } else {
      if (temp.length === 0) {
        AddFeederGroup();
      }
    }
  };

  const AddFeederGroup = async () => {
    try {
      const body: any = {
        feederGroupCode: feedergroupInput.feederGroupCode
          ?.trim()
          ?.toUpperCase(),
        feederGroupName: feedergroupInput.feederGroupName
          ?.trim()
          .replace(/\b\w/g, (char: any) => char.toUpperCase()),
        unitId: userValue.unitId,
      };

      if (editFlag) {
        body.id = Number(feedergroupInput.id);
      }
      const { endpoint, method } = MainConfig.FeederGroup.AddFeederGroup;
      const response = await Apirequest(endpoint, method, body, "main").then(
        (res) => res.data
      );

      if (response.statusCode === 201) {
        toast.success(response.message);
        setOpen(false);
        setFeedergroupInput({ ...feedergroupInput });
        setEditFlag(false);
        GetFeederGroupList();
      } else {
        toast.error(response.message);
        setErrorMessages(response.errors);
        setErrorModalOpen(true);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const UpdateFeederGroup = async () => {
    try {
      const body: any = {
        feederGroupCode: feedergroupInput.feederGroupCode
          ?.trim()
          ?.toUpperCase(),
        feederGroupName: feedergroupInput.feederGroupName
          ?.trim()
          .replace(/\b\w/g, (char: any) => char.toUpperCase()),
        unitId: userValue.unitId,
        id: feedergroupInput.id,
        isActive: feedergroupInput.isActive,
      };

      const { endpoint, method } = MainConfig.FeederGroup.UpdateFeederGroup;
      const response = await Apirequest(endpoint, method, body, "main").then(
        (res) => res.data
      );
      if (response.statusCode === 200 || response.statusCode === 201) {
        toast.success(response.message);
        setOpen(false);
        setEditFlag(false);
        setFeedergroupInput({ ...feedergroupInput });
        GetFeederGroupList();
      } else {
        toast.error(response.message);
        setErrorMessages(response.errors);
        setErrorModalOpen(true);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const GetFeederGroupList = async () => {
    try {
      const response = await Apirequest(
        MainConfig.FeederGroup.GetFeederGroup.endpoint
          .replace("{page}", page.toString())
          .replace("{size}", size.toString())
          .replace("{searchTerm}", search),
        MainConfig.FeederGroup.GetFeederGroup.method,
        null,
        "main"
      ).then((res) => res.data);
      const { totalCount, statusCode, data } = response;
      if (statusCode === 200 || statusCode === 201) {
        setFeederGroupData(data);
        setLoading(false);
        setCount(totalCount);
      } else {
        setCount(0);
        setFeederGroupData([]);
        setLoading(false);
      }
    } catch (err) {
      setLoading(false);
      console.log(err);
    }
  };

  React.useEffect(() => {
    initFlag && search !== "" ? GetFeederGroupList() : GetFeederGroupList();
  }, [debouncedSearchTerm, page, size]);

  return (
    <>
      <Box
        display={"flex"}
        justifyContent={"space-between"}
        alignItems={"center"}
        flexWrap={"wrap"}
        gap={2}
        mt={1}
      >
        <Box>
          <IconBreadcrumbs parent="Maintanence" child="Feeder Group" path="" />
        </Box>

        <Box>
          <Box
            display={"flex"}
            justifyContent={"space-between"}
            alignItems={"center"}
            gap={2}
          >
            <GlobalSearch
              placeholder="search"
              width={200}
              onChange={handleSearch}
            />
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
            rows={feedgroupData}
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

      <CreateFeederGroup
        open={open}
        close={handleClose}
        error={error}
        feedergroupInput={feedergroupInput}
        handleSubmit={handleSubmit}
        handleChange={handleChange}
        editFlag={editFlag}
        handleSwitch={handleSwitch}
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

export default FeederGroup;
