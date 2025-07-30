"use client";
import { Box } from "@mui/material";
import React, { useEffect, useState } from "react";
import IconBreadcrumbs from "../../molecules/AdminLayout/BreadCrumbs";
import GlobalSearch from "../../molecules/AdminLayout/GlobalSearch";
import { MuiButton, MuiTable } from "bsoft-base-elements";
import { GoPlus } from "react-icons/go";
import NoDataFound from "../../molecules/AdminLayout/NoDataFound";
import { Apirequest, emailRegex } from "../../../utils/lib";
import Config from "../../../../src/utils/fam.api.json";
import config from "../../../utils/config.api.json";
import { FiEdit } from "react-icons/fi";
import { RiDeleteBin6Line } from "react-icons/ri";
import { useDebounce } from "../../../hooks/useDebounceHook";
import CreateManufacturer, {
  ManufacturerInputTypes,
} from "../../molecules/FAM/CreateManufacturer";
import DeleteConfirmation from "../../molecules/Master/DeleteConfirmation";
import { usePrivilegeCheck } from "../../../hooks/usePrivilegeCheck";
import dayjs from "dayjs";
import ErrorModal from "../../molecules/Master/Role/ErrorModal";
import SkeletonLoader from "../../molecules/AdminLayout/SkeletonLoader";
import toast from "react-hot-toast";

function ManufacturerPage() {
  const [pathname, setPathName] = useState<string>("");
  const permissions = usePrivilegeCheck(pathname);
  const [page, setPage] = React.useState<number>(1);
  const [size, setSize] = React.useState<number>(15);
  const [loading, setLoading] = React.useState(true);
  const [count, setCount] = React.useState<number>(0);
  const [search, setSearch] = React.useState("");
  const debouncedSearchTerm = useDebounce(search, 500);
  const [initFlag, setInitFlag] = React.useState(false);
  const [manufacturerData, setManufacturerData] = React.useState<any[]>([]);
  const [open, setOpen] = React.useState(false);
  const [countryData, setCountryData] = React.useState([]);
  const [stateData, setStateData] = React.useState([]);
  const [editFlag, setEditFlag] = React.useState(false);
  const [cityData, setCityData] = React.useState([]);
  const [selectedCountry, setSelectedCountry] = useState<any>(null);
  const [selectedState, setSelectedState] = useState<any>(null);
  const [selectedCity, setSelectedCity] = useState<any>(null);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [errorModalOpen, setErrorModalOpen] = React.useState(false);
  const [errorMessages, setErrorMessages] = React.useState<string[]>([]);
  const [selectedManufacturerType, setselectedManufacturerType] =
    useState<any>(null);
  const [errors, setErrors] = useState<string[]>([]);

  const [manufacturerType, setManufacturerType] = React.useState<any[]>([]);
  const [manufacturerInput, setManufacturerInput] =
    useState<ManufacturerInputTypes>({
      code: "",
      manufactureName: "",
      manufactureType: 0,
      countryId: 0,
      stateId: 0,
      cityId: 0,
      addressLine1: "",
      addressLine2: "",
      pinCode: "",
      personName: "",
      phoneNumber: "",
      email: "",
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
      field: "manufacture_code",
      headerName: "Manufacturer Code",
      flex: 1,
      minWidth: 200,
      valueGetter: (value: any, row: any) => `${row?.code.toUpperCase() || ""}`,
    },
    {
      field: "manufacture_name",
      headerName: "Manufacturer Name",
      flex: 2,
      minWidth: 200,
      valueGetter: (value: any, row: any) =>
        `${row?.manufactureName || ""}`.replace(/\b\w/g, (char) =>
          char.toUpperCase()
        ),
    },
    {
      field: "manufactureType",
      headerName: "Manufacturer Type",
      flex: 2,
      minWidth: 200,
      valueGetter: (value: any, row: any) =>
        `${row?.manufactureTypeDescription || ""}`,
    },
    {
      field: "city_name",
      headerName: "City",
      flex: 2,
      minWidth: 200,
      valueGetter: (value: any, row: any) => `${row?.cityName || ""}`,
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
      field: "createdAt",
      headerName: "Created At",
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
      valueGetter: (value: any, row: any) => `${row?.createdByName ?? ""}`,
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

  useEffect(() => {
    setInitFlag(true);
    const currentPath = window.location.pathname.split("/bsoft").at(-1) || "";
    setPathName(currentPath);
  }, []);
  const handleClickOpen = () => {
    setOpen(true);
    setEditFlag(false);
    setManufacturerInput({
      ...manufacturerInput,
      id: 0,
      code: "",
      manufactureName: "",
      manufactureType: 0,
      countryId: 0,
      stateId: 0,
      cityId: 0,
      addressLine1: "",
      addressLine2: "",
      pinCode: "",
      personName: "",
      phoneNumber: "",
      email: "",
      isActive: 1,
    });
    setErrors([]);
    setSelectedCountry(null);
    setSelectedState(null);
    setSelectedCity(null);
    setselectedManufacturerType(null);
  };
  const handleClose = () => {
    setOpen(false);
    setEditFlag(false);
    setManufacturerInput({
      ...manufacturerInput,
      id: 0,
      code: "",
      manufactureName: "",
      manufactureType: 0,
      countryId: 0,
      stateId: 0,
      cityId: 0,
      addressLine1: "",
      addressLine2: "",
      pinCode: "",
      personName: "",
      phoneNumber: "",
      email: "",
      isActive: 1,
    });
    setStateData([]);
    setCityData([]);
    setErrors([]);
    setSelectedCountry(null);
    setSelectedState(null);
    setSelectedCity(null);
    setselectedManufacturerType(null);
  };

  const handleEdit = (row: any) => {
    setEditFlag(true);
    GetOverAllManufacturer(row.id);
    setOpen(true);
  };
  const GetCountryList = async () => {
    try {
      const { endpoint, method } = config.Countries.getCountry;
      const response = await Apirequest(endpoint, method).then(
        (res) => res.data
      );
      setCountryData(response.data);
    } catch (err) {
      console.log(err);
      setCountryData([]);
    }
  };
  const GetState = async (id: number) => {
    try {
      const { endpoint, method } = config.State.getById;
      const response = await Apirequest(
        endpoint.replace(`{countryId}`, id ? id.toString() : ""),
        method
      ).then((res) => res.data);
      setStateData(response.data.data);
    } catch (err) {
      console.log(err);
      setStateData([]);
    }
  };

  useEffect(() => {
    if (editFlag) {
      const getState = stateData
        .filter((i: any) => i.id == manufacturerInput.stateId)
        .at(0);
      setSelectedState(getState);
      const getCity = cityData
        .filter((i: any) => i.id == manufacturerInput.cityId)
        .at(0);
      setSelectedState(getState);
      setSelectedCity(getCity);
    }
  }, [editFlag, stateData, cityData]);

  const GetCity = async (id: number) => {
    try {
      const { endpoint, method } = config.City.getById;
      const response = await Apirequest(
        endpoint.replace(`{stateId}`, id ? id.toString() : ""),
        method
      ).then((res) => res.data);
      setCityData(response.data.data);
    } catch (err) {
      console.log(err);
      setCityData([]);
    }
  };
  const GetManufacturerType = async () => {
    try {
      const { endpoint, method } = Config.Manufacturer.Manufacturertype;
      const response = await Apirequest(endpoint, method, null, "fam").then(
        (res) => res.data
      );
      setManufacturerType(response.data);
    } catch (err) {
      console.log(err);
      setManufacturerType([]);
    }
  };
  const handleManufacturertype = (
    e: React.ChangeEvent<HTMLInputElement>,
    value: { id: string; description: string } | null,
    field: string
  ) => {
    if (field === "miscTypeId") {
      if (!value?.id) {
        setselectedManufacturerType(null);
        setManufacturerInput((prev) => ({ ...prev, description: 0 }));
      } else {
        setselectedManufacturerType(value);
        setManufacturerInput((prev) => ({ ...prev, description: value.id }));
        GetManufacturerType();
      }
    }
  };
  const handleAutocomplete = async (
    e: React.ChangeEvent<HTMLInputElement>,
    value: any,
    field: string
  ) => {
    setErrors([]);

    if (field === "country") {
      if (!value) {
        setSelectedCountry(null);
        setSelectedState(null);
        setSelectedCity(null);
        setStateData([]);
        setCityData([]);
      } else {
        setSelectedCountry(value);
        await GetState(value.id); // Wait for states to load
      }
    } else if (field === "state") {
      if (!value) {
        setSelectedState(null);
        setSelectedCity(null);
        setCityData([]);
      } else {
        setSelectedState(value);
        await GetCity(value.id); // Wait for cities to load
      }
    } else if (field === "city") {
      setSelectedCity(value);
    }
  };

  const GetManufacturerList = async () => {
    try {
      const { endpoint, method } = Config.Manufacturer;
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
      setManufacturerData(response.data);
      setCount(response.totalCount);
    } catch (err) {
      console.log(err);
      setLoading(false);
    }
  };
  const GetOverAllManufacturer = async (id: number) => {
    setEditFlag(true);
    try {
      const { endpoint, method } = Config.Manufacturer.GetManufacturer;
      const url = endpoint.replace("{id}", id?.toString() ?? id);
      const response = await Apirequest(url, method, null, "fam").then(
        (res) => res.data
      );

      setManufacturerInput({
        ...manufacturerInput,
        id: response.data.id,
        code: response.data.code,
        manufactureName: response.data.manufactureName,
        phoneNumber: response.data.phoneNumber,
        personName: response.data.personName,
        isActive: response.data.isActive,
        pinCode: response.data.pinCode,
        addressLine1: response.data.addressLine1,
        addressLine2: response.data.addressLine2,
        email: response.data.email,
        manufactureType: response.data?.manufactureType ?? 0,
        stateId: response.data?.stateId,
        cityId: response.data?.cityId,
      });
      const getCountry =
        countryData.find(
          (item: any) => item?.id === response.data?.countryId
        ) || null;

      setSelectedCountry(getCountry);
      setselectedManufacturerType({
        id: response.data?.manufactureType,
        description: response.data?.manufactureTypeDescription,
      });

      if (response.data?.countryId) {
        await GetState(response.data?.countryId);
      }
      if (response.data?.stateId) {
        await GetCity(response.data?.stateId);
      }
    } catch (err) {
      console.error("Error fetching data:", err);
    }
  };
  useEffect(() => {
    initFlag && search !== "" ? GetManufacturerList() : GetManufacturerList();
  }, [debouncedSearchTerm, page, size]);
  useEffect(() => {
    GetCountryList();
    GetManufacturerType();
    setInitFlag(true);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let { name, value } = e.target;
    const filteredValue =
      name === "code" ? value.replace(/[^a-zA-Z0-9]/g, "") : value;
    setManufacturerInput({ ...manufacturerInput, [name]: filteredValue });
    setErrors([]);
  };
  const AddManufacturer = async () => {
    const body = {
      code: manufacturerInput.code.trim()?.toUpperCase(),
      manufactureName: manufacturerInput.manufactureName
        .trim()
        .replace(/\b\w/g, (char) => char.toUpperCase()),
      manufactureType: selectedManufacturerType.id,
      countryId: selectedCountry.id,
      stateId: selectedState.id,
      cityId: selectedCity.id,
      addressLine1: manufacturerInput.addressLine1.trim(),
      addressLine2: manufacturerInput.addressLine2.trim(),
      pinCode: manufacturerInput.pinCode.trim(),
      personName: manufacturerInput.personName.trim(),
      phoneNumber: manufacturerInput.phoneNumber.trim(),
      email: manufacturerInput.email,
    };
    try {
      const { endpoint, method } = Config.Manufacturer.AddManufacturer;
      const response = await Apirequest(endpoint, method, body, "fam").then(
        (res) => res.data
      );

      if (response.statusCode === 200 || response.statusCode === 201) {
        toast.success(response.message);
        setOpen(false);
        setManufacturerInput({ ...manufacturerInput });
        setEditFlag(false);
        GetManufacturerList();
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
  const UpdateManufacturer = async () => {
    const body = {
      id: manufacturerInput.id,
      code: manufacturerInput.code.trim()?.toUpperCase(),
      manufactureName: manufacturerInput.manufactureName
        .trim()
        .replace(/\b\w/g, (char) => char.toUpperCase()),
      manufactureType: selectedManufacturerType.id,
      countryId: selectedCountry.id,
      stateId: selectedState.id,
      cityId: selectedCity.id,
      addressLine1: manufacturerInput.addressLine1.trim(),
      addressLine2: manufacturerInput.addressLine2.trim(),
      pinCode: manufacturerInput.pinCode.trim(),
      personName: manufacturerInput.personName.trim(),
      phoneNumber: manufacturerInput.phoneNumber.trim(),
      email: manufacturerInput.email,
      isActive: manufacturerInput.isActive,
    };
    try {
      const { endpoint, method } = Config.Manufacturer.UpdateManufacturer;
      const response = await Apirequest(endpoint, method, body, "fam").then(
        (res) => res.data
      );

      if (response.statusCode === 200 || response.statusCode === 201) {
        toast.success(response.message);
        setOpen(false);
        setManufacturerInput({
          ...manufacturerInput,
          code: "",
          manufactureName: "",
          manufactureType: selectedManufacturerType.id,
          countryId: selectedCountry.id,
          stateId: selectedState.id,
          cityId: selectedCity.id,
          addressLine1: "",
          addressLine2: "",
          pinCode: "",
          personName: "",
          phoneNumber: "",
          email: "",
          isActive: 1,
        });
        setEditFlag(false);
        GetManufacturerList();
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

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };
  const handleSwitch = (e: React.ChangeEvent<HTMLInputElement>) => {
    let { checked } = e.target;
    checked
      ? setManufacturerInput({ ...manufacturerInput, isActive: 1 })
      : setManufacturerInput({ ...manufacturerInput, isActive: 0 });
  };
  const handleDelete = (id: number) => {
    setManufacturerInput({ ...manufacturerInput, id: id });
    setDeleteOpen(true);
  };
  const DeleteManufacturer = async () => {
    try {
      const body = {
        id: manufacturerInput.id,
      };
      const { endpoint, method } = Config.Manufacturer.DeleteManufacturer;
      const response = await Apirequest(
        endpoint.replace("{id}", `${manufacturerInput.id}`),
        method,
        body,
        "fam"
      ).then((res) => res.data);

      if (response.statusCode === 200 || response.statusCode === 201) {
        toast.success(response.message);
        setOpen(false);
        setEditFlag(false);
        GetManufacturerList();
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
  const handleConfirmDelete = async () => {
    DeleteManufacturer();
    setDeleteOpen(false);
  };
  const handleSubmit = (e: React.MouseEvent<HTMLButtonElement>) => {
    let temp: any = [];
    Object.entries(manufacturerInput).map(([key, value]) => {
      if (key === "code" && value?.length < 1) {
        temp.push(key);
      } else if (key === "manufactureName" && value?.length < 1) {
        temp.push(key);
      } else if (key === "addressLine1" && value?.length === 0) {
        temp.push(key);
      } else if (key === "addressLine2" && value?.length === 0) {
        temp.push(key);
      } else if (key === "personName" && value?.length < 1) {
        temp.push(key);
      } else if (key === "phoneNumber" && value?.length < 10) {
        temp.push(key);
      } else if (key === "email" && !emailRegex.test(value)) {
        temp.push(key);
      } else if (key === "pinCode" && value?.length < 6) {
        temp.push(key);
      }

      if (selectedCountry === null) {
        temp.push("country");
      }
      if (selectedState === null) {
        temp.push("state");
      }
      if (selectedCity === null) {
        temp.push("city");
      }
      if (selectedManufacturerType === null) {
        temp.push("manufactureType");
      }
    });
    // selectedManufacturerType === null && temp.push("miscType");
    setErrors(temp);
    if (temp.length === 0 && editFlag) {
      UpdateManufacturer();
    } else {
      if (temp.length === 0) {
        AddManufacturer();
        setLoading(true);
      }
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
          <IconBreadcrumbs
            parent={"Asset Master"}
            child={"Manufacturer"}
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
            placeholder="search Manufacturer"
            width={300}
            onChange={handleSearch}
          />
          <Box className="d-flex-center" gap={2}>
            {permissions.canAdd && (
              <MuiButton
                startIcon={<GoPlus />}
                variant="contained"
                onClick={handleClickOpen}
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
            rows={manufacturerData}
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
      <CreateManufacturer
        open={open}
        close={handleClose}
        errors={errors}
        handleAutocomplete={handleAutocomplete}
        countryData={countryData}
        stateData={stateData}
        cityData={cityData}
        selectedCountry={selectedCountry}
        selectedState={selectedState}
        selectedCity={selectedCity}
        manufacturerData={manufacturerData}
        manufacturerType={manufacturerType}
        handleManufacturertype={handleManufacturertype}
        selectedManufacturerType={selectedManufacturerType}
        handleSwitch={handleSwitch}
        handleSubmit={handleSubmit}
        handleChange={handleChange}
        manufacturerInput={manufacturerInput}
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

export default ManufacturerPage;
