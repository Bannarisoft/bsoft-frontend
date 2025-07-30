"use client";
import React, { useEffect, useState } from "react";
import { useDebounce } from "../../../hooks/useDebounceHook";
import { Box, Skeleton } from "@mui/material";
import IconBreadcrumbs from "../../molecules/AdminLayout/BreadCrumbs";
import GlobalSearch from "../../molecules/AdminLayout/GlobalSearch";
import { MuiButton, MuiTable } from "bsoft-base-elements";
import { GoPlus } from "react-icons/go";
import DeleteConfirmation from "../../molecules/Master/DeleteConfirmation";
import NoDataFound from "../../molecules/AdminLayout/NoDataFound";
import { FiEdit } from "react-icons/fi";
import { RiDeleteBin6Line } from "react-icons/ri";
import dayjs from "dayjs";
import { Apirequest } from "../../../utils/lib";
import Config from "../../../../src/utils/fam.api.json";
import config from "../../../utils/config.api.json";
import CreateLocation, {
  LocationProps,
} from "../../molecules/FAM/CreateLocation";
import { useRecoilValue } from "recoil";
import { UserData } from "../../../utils/atoms";
import { usePrivilegeCheck } from "../../../hooks/usePrivilegeCheck";
import ErrorModal from "../../molecules/Master/Role/ErrorModal";
import SkeletonLoader from "../../molecules/AdminLayout/SkeletonLoader";
import toast from "react-hot-toast";

function LocationPage() {
  const [pathname, setPathName] = useState<string>("");
  const permissions = usePrivilegeCheck(pathname);
  const [page, setPage] = React.useState<number>(1);
  const [size, setSize] = React.useState<number>(15);
  const [search, setSearch] = React.useState("");
  const debouncedSearchTerm = useDebounce(search, 500);
  const [loading, setLoading] = React.useState(true);
  const [locationData, setLocationData] = React.useState<any[]>([]);
  const [count, setCount] = React.useState<number>(0);
  const [initFlag, setInitFlag] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const [editFlag, setEditFlag] = React.useState(false);
  const [error, setError] = React.useState<any[]>([]);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [departmentData, setDepartmentData] = React.useState<any>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<any>(null);
  const userValue = useRecoilValue(UserData);
  const [errorModalOpen, setErrorModalOpen] = React.useState(false);
  const [errorMessages, setErrorMessages] = React.useState<string[]>([]);
  const [locationInput, setLocationInput] = React.useState<LocationProps>({
    code: "",
    locationName: "",
    description: "",
    sortOrder: 1,
    unitId: 1,
    departmentId: 0,
    id: 0,
    isActive: 1,
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
      field: "location_code",
      headerName: "Location Name",
      flex: 2,
      minWidth: 200,
      valueGetter: (value: any, row: any) =>
        `${row?.locationName.toUpperCase() || ""}`,
    },
    {
      field: "department",
      headerName: "Department",
      flex: 2,
      minWidth: 200,
      valueGetter: (value: any, row: any) =>
        `${row?.departmentName || ""}`.replace(/\b\w/g, (char) =>
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
      headerName: "Created Date  ",
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
  const handleClickOpen = () => {
    setOpen(true);
    setEditFlag(false);
    setLocationInput({
      ...locationInput,
      code: "",
      locationName: "",
      description: "",
      sortOrder: 1,
      unitId: 1,
      departmentId: 0,
      id: 0,
    });
    setSelectedDepartment(null);
  };
  const handleEdit = (row: any) => {
    setEditFlag(true);
    setOpen(true);
    GetOverAllLocation(row.id);
  };
  const handleClose = () => {
    setOpen(false);
    setLocationInput({
      ...locationInput,
      code: "",
      locationName: "",
      description: "",
      sortOrder: 1,
      unitId: 1,
      departmentId: 0,
      id: 0,
    });
    setEditFlag(false);

    setError([]);
  };
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const handleSubmit = (e: React.MouseEvent<HTMLButtonElement>) => {
    let temp: any = [];
    Object.entries(locationInput).map(([key, value]) => {
      if (key === "code" && value?.length < 2) {
        temp.push(key);
      } else if (key === "locationName" && value?.length < 1) {
        temp.push(key);
      }
      if (selectedDepartment === null) {
        temp.push("departmentId");
      }
    });
    setError(temp);
    if (temp.length === 0 && editFlag) {
      UpdateLocation();
    } else {
      if (temp.length === 0) {
        AddLocation();
        setLoading(true);
      }
    }
  };
  const AddLocation = async () => {
    const body = {
      code: locationInput.code?.trim()?.toUpperCase(),
      locationName: locationInput.locationName
        ?.trim()
        .replace(/\b\w/g, (char) => char.toUpperCase()),
      description: locationInput.description?.trim(),
      departmentId: selectedDepartment.id,
      sortOrder: locationInput.sortOrder,
      unitId: userValue.unitId,
    };
    try {
      const { endpoint, method } = Config.Location.AddLocation;
      const response = await Apirequest(endpoint, method, body, "fam").then(
        (res) => res.data
      );

      if (response.statusCode === 200 || response.statusCode === 201) {
        toast.success(response.message);
        setOpen(false);
        setEditFlag(false);
        GetLocationList();
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
  const UpdateLocation = async () => {
    const body = {
      code: locationInput.code.trim()?.toUpperCase(),
      locationName: locationInput.locationName
        .trim()
        .replace(/\b\w/g, (char) => char.toUpperCase()),
      description: locationInput.description.trim(),
      departmentId: selectedDepartment.id,
      sortOrder: locationInput.sortOrder,
      unitId: userValue.unitId,
      id: locationInput.id,
      isActive: locationInput.isActive,
    };

    try {
      const { endpoint, method } = Config.Location.UpdateLocation;
      const response = await Apirequest(endpoint, method, body, "fam").then(
        (res) => res.data
      );

      if (response.statusCode === 200 || response.statusCode === 201) {
        toast.success(response.message);
        setOpen(false);
        setEditFlag(false);
        setLocationInput({ ...locationInput });

        GetLocationList();
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
    setLocationInput({ ...locationInput, id: id });
    setDeleteOpen(true);
    console.log("Deleted user with ID:", id);
  };
  const handleConfirmDelete = async () => {
    DeleteLocation();
    setDeleteOpen(false);
  };
  const DeleteLocation = async () => {
    try {
      const body = {
        id: locationInput.id,
      };
      const { endpoint, method } = Config.Location.DeleteLocation;
      const response = await Apirequest(
        endpoint.replace("{id}", `${locationInput.id}`),
        method,
        body,
        "fam"
      ).then((res) => res.data);

      if (response.statusCode === 200 || response.statusCode === 201) {
        toast.success(response.message);
        setOpen(false);
        setEditFlag(false);
        GetLocationList();
      } else {
        toast.error(response.message);
        if (response.errors) {
          setErrorMessages(response.errors);
          setErrorModalOpen(true);
        }
      }
    } catch (err) {
      console.log(err);
    }
  };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let { name, value } = e.target;
    const filteredValue =
      name === "code" ? value.replace(/[^a-zA-Z0-9]/g, "") : value;
    setLocationInput({ ...locationInput, [name]: filteredValue });
    setError([]);
  };
  const handleSwitch = (e: React.ChangeEvent<HTMLInputElement>) => {
    let { checked } = e.target;
    checked
      ? setLocationInput({ ...locationInput, isActive: 1 })
      : setLocationInput({ ...locationInput, isActive: 0 });
  };
  const GetLocationList = async () => {
    try {
      const { endpoint, method } = Config.Location;
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
      setLocationData(response.data);
      setCount(response.totalCount);
    } catch (err) {
      console.log(err);
      setLoading(false);
    }
  };
  const GetDepartment = async () => {
    try {
      const { endpoint, method } = config.Department.withoutControl;
      const response = await Apirequest(endpoint, method);
      setDepartmentData(response?.data?.data);
    } catch (err) {
      console.log(err);
      setDepartmentData([]);
    }
  };
  const handleDepartmentChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    value: any,
    field: string
  ) => {
    if (field === "deptName") {
      if (!value?.id) {
        setSelectedDepartment(null);
        setLocationInput((prev) => ({ ...prev, deptName: 0 }));
      } else {
        setSelectedDepartment(value);
        setLocationInput((prev) => ({ ...prev, deptName: value.id }));
        GetDepartment();
      }
    }
  };

  const GetOverAllLocation = async (id: number) => {
    setEditFlag(true);
    try {
      const { endpoint, method } = Config.Location.Getlocation;
      const url = endpoint.replace("{id}", id?.toString() ?? id);
      const response = await Apirequest(url, method, null, "fam").then(
        (res) => res.data
      );

      setLocationInput({
        ...locationInput,
        id: response.data.id,
        code: response.data.code,
        locationName: response.data.locationName,
        description: response.data.description,
        sortOrder: response.data.sortOrder,
        unitId: response.data.unitId,
        departmentId: response.data.departmentId,
        isActive: response.data.isActive,
      });
      const getCountry =
        departmentData.find(
          (item: any) => item?.id === response.data?.departmentId
        ) || null;
      setSelectedDepartment(getCountry);
    } catch (err) {
      console.error("Error fetching data:", err);
    }
  };

  useEffect(() => {
    initFlag && search !== "" ? GetLocationList() : GetLocationList();
  }, [debouncedSearchTerm, page, size]);
  useEffect(() => {
    setInitFlag(true);
    GetLocationList();
    GetDepartment();
  }, []);

  const skeletonRows = Array.from({ length: 10 }).map((_, rowIndex) => (
    <tr key={rowIndex}>
      {[0, 1, 2, 3, 4, 5, 6].map((colIndex) => (
        <td key={colIndex}>
          <Skeleton variant="text" width={"95%"} height={50} />
        </td>
      ))}
    </tr>
  ));
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
          <IconBreadcrumbs parent={"Asset Master"} child={"Location"} path="" />
        </Box>
        <Box
          display={"flex"}
          justifyContent={"space-between"}
          alignItems={"center"}
          flexWrap={"wrap"}
          gap={2}
        >
          <GlobalSearch
            placeholder="search location"
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
            rows={locationData}
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
      <CreateLocation
        open={open}
        close={handleClose}
        error={error}
        selectedDepartment={selectedDepartment}
        departmentData={departmentData}
        locationInput={locationInput}
        handleDepartmentChange={handleDepartmentChange}
        handleChange={handleChange}
        handleSubmit={handleSubmit}
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

export default LocationPage;
