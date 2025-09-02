import { Box } from "@mui/material";
import React, { useEffect, useState } from "react";
import IconBreadcrumbs from "../../molecules/AdminLayout/BreadCrumbs";
import GlobalSearch from "../../molecules/AdminLayout/GlobalSearch";
import { GoPlus } from "react-icons/go";
import { StateProps } from "../../../types/types";
import CreateNewState from "../../molecules/Master/CreateNewState";
import dayjs from "dayjs";
import Config from "../../../utils/config.api.json";
import {
  Apirequest,
  isSubmitting,
  startLoading,
  stopLoading,
} from "../../../utils/lib";
import { FiEdit } from "react-icons/fi";
import { RiDeleteBin6Line } from "react-icons/ri";
import DeleteConfirmation from "../../molecules/Master/DeleteConfirmation";
import { useDebounce } from "../../../hooks/useDebounceHook";
import NoDataFound from "../../molecules/AdminLayout/NoDataFound";
import { MuiButton, MuiTable } from "bsoft-base-elements";
import { usePrivilegeCheck } from "../../../hooks/usePrivilegeCheck";
import ErrorModal from "../../molecules/Master/Role/ErrorModal";
import SkeletonLoader from "../../molecules/AdminLayout/SkeletonLoader";
import toast from "react-hot-toast";

function StatePageTable() {
  const [stateData, setstateData] = useState<any[]>([]);
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
      flex: 1,
      minWidth: 150,
      sortable: true,
      renderCell: (params: any) => {
        return (
          (page - 1) * size + (params.api.getAllRowIds().indexOf(params.id) + 1)
        );
      },
    },
    {
      field: "state_code",
      headerName: "State Code",
      flex: 1,
      minWidth: 150,
      editable: true,
      valueGetter: (value: any, row: any) =>
        `${row?.stateCode.toUpperCase() || ""}`,
    },
    {
      field: "state_name",
      headerName: "State Name",
      sortable: true,
      flex: 2,
      minWidth: 150,
      editable: true,
      valueGetter: (value: any, row: any) =>
        `${row?.stateName || ""}`.replace(/\b\w/g, (char) =>
          char.toUpperCase()
        ),
    },
    {
      field: "isActive",
      headerName: "Status",
      flex: 1,
      minWidth: 150,
      editable: true,
      valueGetter: (value: any, row: any) =>
        `${row?.isActive ? "Active" : "Inactive"}`,
    },
    {
      field: "createdAt",
      headerName: "Created Date",
      flex: 2,
      minWidth: 150,
      valueGetter: (value: any, row: any) =>
        `${dayjs(row?.createdAt).format("DD-MM-YYYY")}`,
    },
    {
      field: "createdByName",
      headerName: "Created By",
      sortable: true,
      flex: 2,
      minWidth: 150,
      valueGetter: (value: any, row: any) => `${row?.createdByName || ""}`,
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
  const [open, setOpen] = React.useState(false);
  const [stateInput, setStateInput] = useState<StateProps>({
    stateCode: "",
    stateName: "",
    countryId: 0,
    id: 0,
    isActive: 1,
  });
  const [error, setError] = useState<any[]>([]);
  const [editFlag, setEditFlag] = React.useState(false);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [initFlag, setInitFlag] = React.useState(false);
  const [loading, setLoading] = useState(true);
  const debouncedSearchTerm = useDebounce(search, 500);

  const [count, setCount] = React.useState<number>(0);
  const [page, setPage] = React.useState<number>(1);
  const [size, setSize] = React.useState<number>(15);
  const [selectedCountry, setSelectedCounty] = useState<any>(null);
  const [countryData, setCountryData] = useState<any[]>([]);
  const [errorModalOpen, setErrorModalOpen] = React.useState(false);
  const [errorMessages, setErrorMessages] = React.useState<string[]>([]);
  const handleClickOpen = () => {
    setOpen(true);
    setSelectedCounty(null);
  };

  const handleSwitch = (e: React.ChangeEvent<HTMLInputElement>) => {
    let { checked } = e.target;
    checked
      ? setStateInput({ ...stateInput, isActive: 1 })
      : setStateInput({ ...stateInput, isActive: 0 });
  };

  const handleClose = () => {
    setOpen(false);
    setEditFlag(false);
    setStateInput({
      stateCode: "",
      stateName: "",
      countryId: 0,
      id: 0,
      isActive: 1,
    });
    setSelectedCounty(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const filteredValue =
      name === "stateCode" ? value.replace(/[^a-zA-Z0-9]/g, "") : value;
    setStateInput({ ...stateInput, [name]: filteredValue });
    setError([]);
  };

  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    let temp: string[] = [];
    if (isSubmitting()) return;
    startLoading();

    Object.entries(stateInput).forEach(([key, value]) => {
      if (
        key === "stateCode" &&
        (!value || typeof value !== "string" || value.trim().length < 2)
      ) {
        temp.push(key);
      } else if (
        key === "stateName" &&
        (!value || typeof value !== "string" || value.trim().length < 3)
      ) {
        temp.push(key);
      } else if (key === "countryId" && (!value || value === 0)) {
        temp.push(key);
      }
    });

    setError(temp);

    if (temp.length > 0) {
      toast.error("Please fill all required fields");
      stopLoading();
      return;
    }

    try {
      if (editFlag) {
        await UpdateState();
      } else {
        await AddState();
        setSelectedCounty(null);
        setLoading(false);
      }
    } catch (err) {
      console.error("Error in handleSubmit:", err);
      toast.error("Failed to save state");
    } finally {
      stopLoading();
    }
  };

  const AddState = async () => {
    try {
      startLoading();
      const body = {
        ...stateInput,
        stateCode: stateInput.stateCode?.trim().toUpperCase(),
        stateName: stateInput.stateName
          ?.trim()
          .replace(/\b\w/g, (char) => char.toUpperCase()),
      };
      const { endpoint, method } = Config.State.addState;
      const response = await Apirequest(endpoint, method, body).then(
        (res) => res.data
      );

      if (response.statusCode === 200 || response.statusCode === 201) {
        toast.success(response.message);
        setOpen(false);
        setStateInput({
          stateCode: "",
          stateName: "",
          countryId: 0,
          id: 0,
          isActive: 0,
        });
        setEditFlag(false);
        GetstateList();
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

  const UpdateState = async () => {
    try {
      startLoading();
      const body = {
        ...stateInput,
        stateCode: stateInput.stateCode?.trim().toUpperCase(),
        stateName: stateInput.stateName
          ?.trim()
          .replace(/\b\w/g, (char) => char.toUpperCase()),
      };
      const { endpoint, method } = Config.State.updateState;
      const response = await Apirequest(endpoint, method, body).then(
        (res) => res.data
      );

      if (response.statusCode === 200 || response.statusCode === 201) {
        toast.success(response.message);
        setStateInput({
          stateCode: "",
          stateName: "",
          countryId: 0,
          id: 0,
          isActive: 0,
        });
        setOpen(false);
        setEditFlag(false);
        GetstateList();
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

  const handleEdit = (row: any) => {
    setOpen(true);
    setEditFlag(true);
    setStateInput({
      stateCode: row.stateCode,
      stateName: row.stateName,
      countryId: row.countryId,
      id: row.id,
      isActive: row?.isActive,
    });
    const getCountry = countryData
      ?.filter((list) => list.id === row.countryId)
      ?.at(0);
    setSelectedCounty(getCountry);
  };

  const handleDelete = (id: number) => {
    setStateInput({ ...stateInput, id: id });
    setDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    DeleteState();
    setDeleteOpen(false);
  };

  const DeleteState = async () => {
    try {
      const body = {
        id: stateInput.id,
      };
      const { endpoint, method } = Config.State.deleteState;
      const response = await Apirequest(
        endpoint.replace("{id}", `${stateInput.id}`),
        method,
        body
      ).then((res) => res.data);

      if (response.statusCode === 200 || response.statusCode === 201) {
        toast.success(response.message);
        setOpen(false);
        setEditFlag(false);
        GetstateList();
      } else {
        toast.error(
          response.message || "Something went wrong, please try again later"
        );
        if (Array.isArray(response.errors) && response.errors.length > 0) {
          setErrorModalOpen(true);
          setErrorMessages(response.errors);
        }
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleContryChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    value: any,
    field: string
  ) => {
    if (field === "countryId") {
      if (!value?.id) {
        setSelectedCounty(null);
        setStateInput((prev) => ({ ...prev, countryId: 0 }));
      } else {
        setSelectedCounty(value);
        setStateInput((prev) => ({ ...prev, countryId: value.id }));
        GetCountry();
      }
    }
  };
  const GetCountry = async () => {
    try {
      const { endpoint, method } = Config.Countries.getCountry;
      const result = await Apirequest(endpoint, method);
      setCountryData(result?.data?.data);
    } catch (err) {
      console.log(err);
      setCountryData([]);
    }
  };

  const GetstateList = async () => {
    try {
      const { endpoint, method } = Config.State;
      const result = await Apirequest(
        endpoint
          .replace("{page}", page.toString())
          .replace("{size}", size.toString())
          .replace("{searchTerm}", search),
        method
      ).then((res) => res.data);
      setstateData(result.data);
      setLoading(false);
      setCount(result.totalCount);
    } catch (err) {
      console.log(err);
      setstateData([]);
    }
  };

  const Searchstate = async () => {
    try {
      const { endpoint, method } = Config.State;
      const result = await Apirequest(
        endpoint
          .replace("{page}", page.toString())
          .replace("{size}", size.toString())
          .replace("{searchTerm}", search),
        method
      ).then((res) => res.data);
      setstateData(result.data);
      setLoading(false);
      setCount(result.totalCount);
    } catch (err: any) {
      setstateData([]);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  React.useEffect(() => {
    initFlag && search !== "" ? Searchstate() : GetstateList();
  }, [debouncedSearchTerm, page, size]);

  useEffect(() => {
    GetCountry();
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
          <IconBreadcrumbs parent="Master" child="State" path="" />
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
              placeholder="search state"
              width={300}
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
      <Box sx={{ height: 700, width: "100%", my: 2 }} className="main-table">
        {loading ? (
          <SkeletonLoader />
        ) : (
          <MuiTable
            rows={stateData}
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
      <CreateNewState
        open={open}
        close={handleClose}
        stateInput={stateInput}
        handleSubmit={handleSubmit}
        handleChange={handleChange}
        error={error}
        country={countryData}
        selectedCountry={selectedCountry}
        handleContryChange={handleContryChange}
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
export default StatePageTable;
