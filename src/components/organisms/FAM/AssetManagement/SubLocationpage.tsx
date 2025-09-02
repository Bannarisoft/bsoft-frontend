"use client";
import React, { useEffect, useState } from "react";
import { useDebounce } from "../../../../hooks/useDebounceHook";
import dayjs from "dayjs";
import { Box } from "@mui/material";
import { FiEdit } from "react-icons/fi";
import { RiDeleteBin6Line } from "react-icons/ri";
import {
  Apirequest,
  isSubmitting,
  startLoading,
  stopLoading,
} from "../../../../utils/lib";
import IconBreadcrumbs from "../../../molecules/AdminLayout/BreadCrumbs";
import GlobalSearch from "../../../molecules/AdminLayout/GlobalSearch";
import { MuiButton, MuiTable } from "bsoft-base-elements";
import { GoPlus } from "react-icons/go";
import NoDataFound from "../../../molecules/AdminLayout/NoDataFound";
import Config from "../../../../utils/fam.api.json";
import CreateSubLocation, {
  subLocationProps,
} from "../../../molecules/FAM/CreateSubLocation";
import config from "../../../../utils/config.api.json";
import { useRecoilValue } from "recoil";
import { UserData } from "../../../../utils/atoms";
import DeleteConfirmation from "../../../molecules/Master/DeleteConfirmation";
import { usePrivilegeCheck } from "../../../../hooks/usePrivilegeCheck";
import ErrorModal from "../../../molecules/Master/Role/ErrorModal";
import SkeletonLoader from "../../../molecules/AdminLayout/SkeletonLoader";
import toast from "react-hot-toast";

function SubLocationpage() {
  const [pathname, setPathName] = useState<string>("");
  const permissions = usePrivilegeCheck(pathname);
  const [page, setPage] = React.useState<number>(1);
  const [size, setSize] = React.useState<number>(15);
  const [search, setSearch] = React.useState("");
  const debouncedSearchTerm = useDebounce(search, 500);
  const [loading, setLoading] = React.useState(true);
  const [SublocationData, setSubLocationData] = React.useState<any[]>([]);
  const [count, setCount] = React.useState<number>(0);
  const [initFlag, setInitFlag] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const [editFlag, setEditFlag] = React.useState(false);
  const [error, setError] = React.useState<any[]>([]);
  const [departmentData, setDepartmentData] = useState<any[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<any>(null);
  const [selectedLocation, setSelectedLocation] = useState<any>(null);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [errorModalOpen, setErrorModalOpen] = React.useState(false);
  const [errorMessages, setErrorMessages] = React.useState<string[]>([]);
  const [locationData, setLocationData] = useState<any>(null);
  const [SublocationInput, setSubLocationInput] =
    React.useState<subLocationProps>({
      code: "",
      subLocationName: "",
      locationId: 0,
      description: "",
      unitId: 0,
      departmentId: 0,
      id: 0,
      isActive: 1,
    });
  const userValue = useRecoilValue(UserData);
  useEffect(() => {
    const newUnitId =
      typeof userValue.unitId === "string" &&
      (userValue.unitId.startsWith("{") || userValue.unitId.startsWith("["))
        ? JSON.parse(userValue.unitId).at(1)?.UnitId ?? ""
        : "";
    setSubLocationInput((prevSublocationInput) => ({
      ...prevSublocationInput,
      unitId: newUnitId,
    }));
  }, [userValue]);

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
      field: "sublocation_Code",
      headerName: "Sub Location Code",
      flex: 1,
      minWidth: 200,
      valueGetter: (value: any, row: any) => `${row?.code.toUpperCase() || ""}`,
    },
    {
      field: "sublocation_Name",
      headerName: "Sub Location Name",
      flex: 2,
      minWidth: 200,
      valueGetter: (value: any, row: any) =>
        `${row?.subLocationName || ""}`.replace(/\b\w/g, (char) =>
          char.toUpperCase()
        ),
    },
    {
      field: "department",
      headerName: "Department",
      flex: 2,
      minWidth: 200,
      valueGetter: (value: any, row: any) => `${row?.departmentName || ""}`,
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
      field: "createdDate",
      headerName: "Created Date",
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
    setSubLocationInput({
      ...SublocationInput,
      code: "",
      subLocationName: "",
      locationId: 0,
      description: "",
      unitId: 0,
      departmentId: 0,
      id: 0,
    });
    setSelectedDepartment(null);
    setSelectedLocation(null);
  };

  const handleClose = () => {
    setOpen(false);
    setSubLocationInput({
      ...SublocationInput,
      code: "",
      subLocationName: "",
      locationId: 0,
      description: "",

      unitId: 0,
      departmentId: 0,
      id: 0,
    });
    setEditFlag(false);
    setSelectedDepartment(null);
    setSelectedLocation(null);
    setError([]);
  };
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };
  const handleEdit = (row: any) => {
    setOpen(true);
    setEditFlag(true);
    GetOverAllSubLocation(row.id);
  };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let { name, value } = e.target;
    const filteredValue =
      name === "code" ? value.replace(/[^a-zA-Z0-9]/g, "") : value;
    setSubLocationInput({ ...SublocationInput, [name]: filteredValue });
    setError([]);
  };
  const handleSwitch = (e: React.ChangeEvent<HTMLInputElement>) => {
    let { checked } = e.target;
    checked
      ? setSubLocationInput({ ...SublocationInput, isActive: 1 })
      : setSubLocationInput({ ...SublocationInput, isActive: 0 });
  };
  const GetSubLocationList = async () => {
    try {
      const { endpoint, method } = Config.SubLocation;
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
      setSubLocationData(response.data);
      setCount(response.totalCount);
    } catch (err) {
      console.log(err);
      setLoading(false);
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
        setSubLocationInput((prev) => ({ ...prev, deptName: 0 }));
      } else {
        setSelectedDepartment(value);
        setSubLocationInput((prev) => ({ ...prev, deptName: value.id }));
        GetDepartment();
      }
    }
  };

  const handleLocationChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    value: any,
    field: string
  ) => {
    if (field === "locationName") {
      if (!value?.id) {
        setSelectedLocation(null);
        setSubLocationInput((prev) => ({ ...prev, locationName: 0 }));
      } else {
        setSelectedLocation(value);
        setSubLocationInput((prev) => ({ ...prev, locationName: value.id }));
        GetLocation();
      }
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
  const GetLocation = async () => {
    try {
      const { endpoint, method } = Config.Location.ByName;
      const response = await Apirequest(endpoint, method, null, "fam");
      setLocationData(response?.data?.data);
    } catch (err) {
      console.log(err);
      setLocationData([]);
    }
  };
  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    let temp: string[] = [];
    if (isSubmitting()) return;
    startLoading();

    Object.entries(SublocationInput).forEach(([key, value]) => {
      if (key === "code" && (!value || value.toString().trim().length < 1)) {
        temp.push(key);
      } else if (
        key === "subLocationName" &&
        (!value || value.toString().trim().length < 1)
      ) {
        temp.push(key);
      }
    });

    if (selectedDepartment === null) temp.push("departmentId");
    if (selectedLocation === null) temp.push("locationId");

    setError(temp);

    if (temp.length > 0) {
      toast.error("Please fill all required fields");
      stopLoading();
      return;
    }

    try {
      if (editFlag) {
        await UpdateSubLocation();
      } else {
        await AddSubLocation();
        setLoading(true);
      }
    } catch (err) {
      console.error("Error in handleSubmit:", err);
      toast.error("Failed to save sub-location");
    } finally {
      stopLoading();
    }
  };
  const AddSubLocation = async () => {
    const body = {
      code: SublocationInput.code?.trim()?.toUpperCase(),
      subLocationName: SublocationInput.subLocationName
        ?.trim()
        .replace(/\b\w/g, (char) => char.toUpperCase()),
      description: SublocationInput.description?.trim(),
      departmentId: selectedDepartment.id,
      locationId: selectedLocation.id,
      unitId: userValue.unitId,
      id: SublocationInput.id,
    };
    try {
      startLoading();
      const { endpoint, method } = Config.SubLocation.AddSubLocation;
      const response = await Apirequest(endpoint, method, body, "fam").then(
        (res) => res.data
      );

      if (response.statusCode === 200 || response.statusCode === 201) {
        toast.success(response.message);
        setOpen(false);
        setEditFlag(false);
        GetSubLocationList();
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
  const UpdateSubLocation = async () => {
    const body = {
      id: SublocationInput.id,
      code: SublocationInput.code?.trim()?.toUpperCase(),
      subLocationName: SublocationInput.subLocationName
        ?.trim()
        .replace(/\b\w/g, (char) => char.toUpperCase()),
      description: SublocationInput.description?.trim(),
      departmentId: selectedDepartment.id,
      locationId: selectedLocation.id,
      unitId: userValue.unitId,
      isActive: SublocationInput.isActive,
    };

    try {
      startLoading();
      const { endpoint, method } = Config.SubLocation.UpdateSubLocation;
      const response = await Apirequest(endpoint, method, body, "fam").then(
        (res) => res.data
      );

      if (response.statusCode === 200 || response.statusCode === 201) {
        toast.success(response.message);
        setOpen(false);
        setEditFlag(false);
        GetSubLocationList();
      } else {
        toast.error(response.message);
        if (Array.isArray(response.errors) && response.errors.length > 0) {
          setErrorModalOpen(true);
          setErrorMessages(response.errors);
        }
      }
    } catch (err) {
      GetSubLocationList();
      console.log(err);
    } finally {
      stopLoading();
    }
  };
  const handleDelete = (id: number) => {
    setSubLocationInput({ ...SublocationInput, id: id });
    setDeleteOpen(true);
  };
  const handleConfirmDelete = async () => {
    DeleteSubLocation();
    setDeleteOpen(false);
  };
  const DeleteSubLocation = async () => {
    try {
      const body = {
        id: SublocationInput.id,
      };
      const { endpoint, method } = Config.SubLocation.DeleteSubLocation;
      const response = await Apirequest(
        endpoint.replace("{id}", `${SublocationInput.id}`),
        method,
        body,
        "fam"
      ).then((res) => res.data);

      if (response.statusCode === 200 || response.statusCode === 201) {
        toast.success(response.message);
        setOpen(false);
        setEditFlag(false);
        GetSubLocationList();
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
  const GetOverAllSubLocation = async (id: number) => {
    setEditFlag(true);
    try {
      const { endpoint, method } = Config.SubLocation.GetSublocation;
      const url = endpoint.replace("{id}", id?.toString() ?? id);
      const response = await Apirequest(url, method, null, "fam").then(
        (res) => res.data
      );

      setSubLocationInput({
        ...SublocationInput,
        id: response.data.id,
        code: response.data.code,
        subLocationName: response.data.subLocationName,
        description: response.data.description,
        unitId: response.data.unitId,
        departmentId: response.data.departmentId,
        locationId: response.data.locationId,
        isActive: response.data.isActive,
      });
      const getCountry =
        departmentData.find(
          (item: any) => item?.id === response.data?.departmentId
        ) || null;
      setSelectedDepartment(getCountry);
      const getLocation =
        locationData.find(
          (item: any) => item?.id === response.data?.locationId
        ) || null;
      setSelectedDepartment(getCountry);
      setSelectedLocation(getLocation);
      // setselectedManufacturerType({
      //   id: response.data?.manufactureType,
      //   description: response.data?.manufactureTypeDescription,
      // });
    } catch (err) {
      console.error("Error fetching data:", err);
    }
  };
  useEffect(() => {
    initFlag && search !== "" ? GetSubLocationList() : GetSubLocationList();
  }, [debouncedSearchTerm, page, size]);
  useEffect(() => {
    setInitFlag(true);
    GetDepartment();
    GetSubLocationList();
    GetLocation();
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
            child={"Sub Location"}
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
            placeholder="search sublocation"
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
            rows={SublocationData}
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
      <CreateSubLocation
        open={open}
        close={handleClose}
        error={error}
        department={departmentData}
        selectedDepartment={selectedDepartment}
        handleDepartmentChange={handleDepartmentChange}
        handleLocationChange={handleLocationChange}
        SublocationInput={SublocationInput}
        locationData={locationData}
        selectedLocation={selectedLocation}
        handleSwitch={handleSwitch}
        handleChange={handleChange}
        handleSubmit={handleSubmit}
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

export default SubLocationpage;
