import { Box } from "@mui/material";
import { GridColDef } from "@mui/x-data-grid";
import dayjs from "dayjs";
import React, { useEffect, useState } from "react";
import IconBreadcrumbs from "../../molecules/AdminLayout/BreadCrumbs";
import GlobalSearch from "../../molecules/AdminLayout/GlobalSearch";
import { GoPlus } from "react-icons/go";
import CreateNewCity from "../../molecules/Master/CreateNewCity";
import config from "../../../utils/config.api.json";
import {
  Apirequest,
  isSubmitting,
  startLoading,
  stopLoading,
} from "../../../utils/lib";
import { CityProps } from "../../../types/types";
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

const CityPageTable = () => {
  const [CityData, setCityData] = useState<any>([]);
  const [pathname, setPathName] = useState<string>("");
  const permissions = usePrivilegeCheck(pathname);

  useEffect(() => {
    setInitFlag(true);
    const currentPath = window.location.pathname.split("/bsoft").at(-1) || "";
    setPathName(currentPath);
  }, []);

  const columns: GridColDef<(typeof CityData)[number]>[] = [
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
      field: "city_code",
      headerName: "City Code",
      flex: 1,
      minWidth: 150,
      editable: true,
      valueGetter: (value, row: any) => `${row?.cityCode.toUpperCase() || ""}`,
    },
    {
      field: "city_name",
      headerName: "City Name",
      sortable: true,
      flex: 2,
      minWidth: 150,
      editable: true,
      valueGetter: (value, row: any) =>
        `${row?.cityName || ""}`.replace(/\b\w/g, (char) => char.toUpperCase()),
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
      field: "createdAt",
      headerName: "Created At",
      flex: 2,
      minWidth: 150,
      valueGetter: (value, row: any) =>
        `${dayjs(row?.createdAt).format("DD-MM-YYYY")}`,
    },
    {
      field: "createdByName",
      headerName: "Created By",
      sortable: true,
      flex: 2,
      minWidth: 150,
      valueGetter: (value, row: any) => `${row?.createdByName || ""}`,
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
  const [cityInput, setCityInput] = useState<CityProps>({
    cityCode: "",
    cityName: "",
    stateId: 0,
    id: 0,
    isActive: 1,
  });
  const [editFlag, setEditFlag] = React.useState(false);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [error, setError] = useState<any>([]);
  const [search, setSearch] = React.useState("");
  const [initFlag, setInitFlag] = React.useState(false);
  const [loading, setLoading] = useState(true);
  const debouncedSearchTerm = useDebounce(search, 500);
  const [errorModalOpen, setErrorModalOpen] = React.useState(false);
  const [errorMessages, setErrorMessages] = React.useState<string[]>([]);
  const [count, setCount] = React.useState<number>(0);
  const [page, setPage] = React.useState<number>(1);
  const [size, setSize] = React.useState<number>(15);
  const [selectedstate, setSelectedState] = useState<any>(null);
  const [stateData, setStateData] = useState<any[]>([]);
  const handleClickOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
    setEditFlag(false);
    setCityInput({
      cityCode: "",
      cityName: "",
      stateId: 0,
      id: 0,
      isActive: 1,
    });
    setSelectedState(null);
  };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const filteredValue =
      name === "cityCode" ? value.replace(/[^a-zA-Z0-9]/g, "") : value;
    setCityInput({ ...cityInput, [name]: filteredValue });
    setError([]);
  };
  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    let temp: any = [];
    if (isSubmitting()) return;

    Object.entries(cityInput).map(([key, value]) => {
      if (
        key === "cityCode" &&
        (!value || typeof value !== "string" || value.trim().length < 2)
      ) {
        temp.push(key);
      } else if (
        key === "cityName" &&
        (!value || typeof value !== "string" || value.trim().length < 4)
      ) {
        temp.push(key);
      } else if (key === "stateId" && (!value || value === 0)) {
        temp.push(key);
      }
    });

    setError(temp);

    if (temp.length === 0) {
      try {
        if (editFlag) {
          await UpdateCity();
        } else {
          await AddCity();
          setSelectedState(null);
          setLoading(false);
        }
      } catch (err) {
        console.error("Error in handleSubmit:", err);
      } finally {
        stopLoading();
      }
    } else {
      toast.error("Please fill all required fields");
      stopLoading();
    }
  };

  const AddCity = async () => {
    try {
      startLoading();
      const body = {
        ...cityInput,
        cityCode: cityInput.cityCode?.trim().toUpperCase(),
        cityName: cityInput.cityName
          ?.trim()
          .replace(/\b\w/g, (char) => char.toUpperCase()),
      };
      const { endpoint, method } = config.City.addCity;
      const response = await Apirequest(endpoint, method, body).then(
        (res) => res.data
      );

      if (response.statusCode === 200 || response.statusCode === 201) {
        toast.success(response.message);
        setOpen(false);
        setCityInput({
          cityCode: "",
          cityName: "",
          stateId: 0,
          id: 0,
          isActive: 1,
        });
        setEditFlag(false);
        GetCityList();
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
  const handleSwitch = (e: React.ChangeEvent<HTMLInputElement>) => {
    let { checked } = e.target;
    checked
      ? setCityInput({ ...cityInput, isActive: 1 })
      : setCityInput({ ...cityInput, isActive: 0 });
  };

  const UpdateCity = async () => {
    try {
      startLoading();
      const body = {
        ...cityInput,
        cityCode: cityInput.cityCode?.trim().toUpperCase(),
        cityName: cityInput.cityName
          ?.trim()
          .replace(/\b\w/g, (char) => char.toUpperCase()),
      };
      const { endpoint, method } = config.City.updateCity;
      const response = await Apirequest(endpoint, method, body).then(
        (res) => res.data
      );

      if (response.statusCode === 200 || response.statusCode === 201) {
        toast.success(response.message);
        setOpen(false);
        setCityInput({
          cityCode: "",
          cityName: "",
          stateId: 0,
          id: 0,
          isActive: 1,
        });
        setEditFlag(false);
        GetCityList();
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
      startLoading();
    }
  };
  const handleEdit = (row: any) => {
    console.log(row);
    setOpen(true);
    setEditFlag(true);
    setCityInput({
      cityCode: row.cityCode,
      cityName: row.cityName,
      stateId: row.stateId,
      id: row.id,
      isActive: row.isActive,
    });
    const getState = stateData
      ?.filter((list) => list.id === row.stateId)
      ?.at(0);
    setSelectedState(getState);
  };
  const handleDelete = (id: number) => {
    setCityInput({ ...cityInput, id: id });
    setDeleteOpen(true);
  };
  const handleConfirmDeleteCity = async () => {
    DeleteCity();
    setDeleteOpen(false);
  };
  const DeleteCity = async () => {
    try {
      const body = {
        id: cityInput.id,
      };
      const { endpoint, method } = config.City.DeleteCity;
      const response = await Apirequest(
        endpoint.replace("{id}", `${cityInput.id}`),
        method,
        body
      ).then((res) => res.data);

      if (response.statusCode === 200 || response.statusCode === 201) {
        toast.success(response.message);
        setOpen(false);
        setEditFlag(false);
        GetCityList();
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

  const handleStateChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    value: any,
    field: string
  ) => {
    if (field === "stateId") {
      if (!value?.id) {
        setSelectedState(null);
        setCityInput((prev) => ({ ...prev, stateId: 0 }));
      } else {
        setSelectedState(value);
        setCityInput((prev) => ({ ...prev, stateId: value.id }));
        GetState();
      }
    }
  };
  const GetCityList = async () => {
    try {
      const { endpoint, method } = config.City;
      const result = await Apirequest(
        endpoint
          .replace("{page}", page.toString())
          .replace("{size}", size.toString())
          .replace("{searchTerm}", search),
        method
      ).then((res) => res.data);
      setCityData(result.data);
      setLoading(false);
      setCount(result.totalCount);
    } catch (err) {
      console.log(err);
      setCityData([]);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const GetState = async () => {
    try {
      const { endpoint, method } = config.State.getState;
      const result = await Apirequest(endpoint, method);
      setStateData(result?.data?.data);
    } catch (err) {
      console.log(err);
      setStateData([]);
    }
  };
  React.useEffect(() => {
    initFlag && search !== "" ? GetCityList() : GetCityList();
  }, [debouncedSearchTerm, page, size]);
  useEffect(() => {
    GetState();
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
          <IconBreadcrumbs parent="Master" child="City" path="" />
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
              placeholder="search city"
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
      <CreateNewCity
        open={open}
        close={handleClose}
        cityInput={cityInput}
        handleSubmit={handleSubmit}
        handleChange={handleChange}
        state={stateData}
        error={error}
        selectedState={selectedstate}
        handleStateChange={handleStateChange}
        handleSwitch={handleSwitch}
        editFlag={editFlag}
      />
      <Box sx={{ height: 700, width: "100%", my: 2 }} className="main-table">
        {loading ? (
          <SkeletonLoader />
        ) : (
          <MuiTable
            rows={CityData}
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
      <ErrorModal
        open={errorModalOpen}
        onClose={() => setErrorModalOpen(false)}
        errors={errorMessages}
      />
      <DeleteConfirmation
        open={deleteOpen}
        close={() => setDeleteOpen(false)}
        handleDelete={handleConfirmDeleteCity}
      />
    </>
  );
};
export default CityPageTable;
