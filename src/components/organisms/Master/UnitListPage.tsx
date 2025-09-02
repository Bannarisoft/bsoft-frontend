import { Box } from "@mui/material";
import React, { useEffect, useState } from "react";
import IconBreadcrumbs from "../../molecules/AdminLayout/BreadCrumbs";
import GlobalSearch from "../../molecules/AdminLayout/GlobalSearch";
import { GoPlus } from "react-icons/go";
import NoDataFound from "../../molecules/AdminLayout/NoDataFound";
import Config from "../../../utils/config.api.json";
import { FiEdit } from "react-icons/fi";
import { RiDeleteBin6Line } from "react-icons/ri";
import {
  Apirequest,
  emailRegex,
  isSubmitting,
  startLoading,
  stopLoading,
} from "../../../utils/lib";
import CreateUnit from "../../molecules/Master/CreateUnit";
import { UnitInputTypes } from "../../../types/types";
import { useDebounce } from "../../../hooks/useDebounceHook";
import { useRecoilValue } from "recoil";
import { UserData } from "../../../utils/atoms";
import DeleteConfirmation from "../../molecules/Master/DeleteConfirmation";
import { MuiButton, MuiTable } from "bsoft-base-elements";
import { usePrivilegeCheck } from "../../../hooks/usePrivilegeCheck";
import SkeletonLoader from "../../molecules/AdminLayout/SkeletonLoader";
import ErrorModal from "../../molecules/Master/Role/ErrorModal";
import toast from "react-hot-toast";

function UnitListPage() {
  const [pathname, setPathName] = useState<string>("");
  const permissions = usePrivilegeCheck(pathname);

  useEffect(() => {
    setInitFlag(true);
    const currentPath = window.location.pathname.split("/bsoft").at(-1) || "";
    setPathName(currentPath);
  }, []);
  const [loading, setLoading] = useState(true);
  const [createPopOpen, setCreatePopOpen] = useState(false);
  const [unitData, setUnitData] = useState<any[]>([]);
  const [divisionData, setDivisionData] = React.useState([]);
  const [countryData, setCountryData] = React.useState([]);
  const [stateData, setStateData] = React.useState([]);
  const [cityData, setCityData] = React.useState([]);
  const [selectedCountry, setSelectedCountry] = useState<any>(null);
  const [selectedState, setSelectedState] = useState<any>(null);
  const [selectedCity, setSelectedCity] = useState<any>(null);
  const [selectedDivision, setSelectedDivision] = useState<any>(null);
  const [errorModalOpen, setErrorModalOpen] = React.useState(false);
  const [errorMessages, setErrorMessages] = React.useState<string[]>([]);
  const [editFlag, setEditFlag] = useState(false);
  const userValue = useRecoilValue(UserData);
  const [unitInput, setUnitInput] = useState<UnitInputTypes>({
    unitName: "",
    oldUnitId: "",
    shortName: "",
    unitHeadName: "",
    pincode: 0,
    contact: "",
    alternateContact: "",
    address1: "",
    address2: "",
    contactName: "",
    designation: "",
    email: "",
    phone: "",
    remarks: "",
    companyId: 0,
    id: 0,
    isActive: 1,
  });

  const [errors, setErrors] = useState<string[]>([]);
  const columns = [
    {
      field: "s_no",
      headerName: "S.No",
      minWidth: 150,
      flex: 1,
      sortable: true,
      renderCell: (params: any) => {
        return (
          (page - 1) * size + (params.api.getAllRowIds().indexOf(params.id) + 1)
        );
      },
    },
    {
      field: "name",
      headerName: "Unit Name",
      flex: 3,
      minWidth: 150,
      valueGetter: (value: any, row: any) =>
        `${row?.unitName || ""}`.replace(/\b\w/g, (char) => char.toUpperCase()),
    },
    {
      field: "shortName",
      headerName: "Short Name",
      sortable: true,
      flex: 2,
      valueGetter: (value: any, row: any) => `${row?.shortName || ""}`,
    },
    {
      field: "unitHeadName",
      headerName: "Unit Head Name",
      sortable: true,
      flex: 2,
      valueGetter: (value: any, row: any) => `${row?.unitHeadName || ""}`,
    },
    {
      field: "isActive",
      headerName: "Status",
      flex: 2,
      minWidth: 150,
      valueGetter: (value: any, row: any) =>
        `${row?.isActive ? "Active" : "Inactive"}`,
    },
    {
      field: "actions",
      headerName: "Actions",
      flex: 2,
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

  const [count, setCount] = React.useState<number>(0);
  const [page, setPage] = React.useState<number>(1);
  const [size, setSize] = React.useState<number>(15);
  const [search, setSearch] = React.useState("");
  const debouncedSearchTerm = useDebounce(search, 500);
  const [initFlag, setInitFlag] = React.useState(false);
  const [deleteOpen, setDeleteOpen] = React.useState(false);

  const handleEdit = (row: any) => {
    GetOverallList(row.id);
    setEditFlag(true);
    setCreatePopOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let { name, value } = e.target;
    setUnitInput({ ...unitInput, [name]: value });
    setErrors([]);
  };

  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    let temp: string[] = [];
    if (isSubmitting()) return;
    startLoading();

    Object.entries(unitInput).forEach(([key, value]) => {
      if (key === "unitName" && (!value || value.toString().length <= 3)) {
        temp.push(key);
      } else if (
        key === "oldUnitId" &&
        (!value || value.toString().length === 0)
      ) {
        temp.push(key);
      } else if (
        key === "shortName" &&
        (!value || value.toString().length <= 1)
      ) {
        temp.push(key);
      } else if (
        key === "unitHeadName" &&
        (!value || value.toString().length <= 3)
      ) {
        temp.push(key);
      } else if (key === "pincode" && (!value || value.toString().length < 6)) {
        temp.push(key);
      } else if (
        key === "contact" &&
        (!value || value.toString().length !== 10)
      ) {
        temp.push(key);
      } else if (
        key === "alternateContact" &&
        value &&
        value.toString().length !== 10
      ) {
        temp.push(key);
      } else if (
        key === "address1" &&
        (!value || value.toString().length === 0)
      ) {
        temp.push(key);
      } else if (
        key === "contactName" &&
        (!value || value.toString().length <= 3)
      ) {
        temp.push(key);
      } else if (
        key === "designation" &&
        (!value || value.toString().length <= 3)
      ) {
        temp.push(key);
      } else if (
        key === "email" &&
        (!value || !emailRegex.test(value.toString()))
      ) {
        temp.push(key);
      } else if (
        key === "phone" &&
        (!value || value.toString().length !== 10)
      ) {
        temp.push(key);
      }
    });

    if (selectedCountry === null) temp.push("country");
    if (selectedState === null) temp.push("state");
    if (selectedCity === null) temp.push("city");
    if (selectedDivision === null) temp.push("division");

    setErrors(temp);

    if (temp.length > 0) {
      toast.error("Please fill all required fields");
      stopLoading();
      return;
    }

    try {
      if (editFlag) {
        await UpdateUnit();
      } else {
        await AddUnit();
        setLoading(false);
      }
    } catch (err) {
      toast.error("Failed to save unit");
    } finally {
      stopLoading();
    }
  };

  const UpdateUnit = async () => {
    try {
      startLoading();
      const body = {
        updateUnitDto: {
          id: unitInput.id,
          unitName: unitInput.unitName
            ?.trim()
            .replace(/\b\w/g, (char) => char.toUpperCase()),
          oldUnitId: unitInput.oldUnitId?.trim(),
          shortName: unitInput.shortName?.trim(),
          divisionId: selectedDivision.id,
          unitHeadName: unitInput.unitHeadName?.trim(),
          cinno: "string",
          companyId: userValue.companyId,
          isActive: unitInput.isActive,

          unitAddressDto: {
            countryId: selectedCountry.id,
            stateId: selectedState.id,
            cityId: selectedCity.id,
            addressLine1: unitInput.address1?.trim(),
            addressLine2: unitInput.address2?.trim(),
            pinCode: unitInput.pincode,
            contactNumber: unitInput.contact?.trim(),
            alternateNumber: unitInput.alternateContact?.trim(),
          },
          unitContactsDto: {
            name: unitInput.contactName?.trim(),
            designation: unitInput.designation?.trim(),
            email: unitInput.email?.trim(),
            phoneNo: unitInput.phone?.trim(),
            remarks: unitInput.remarks?.trim(),
          },
        },
      };
      const { endpoint, method } = Config.Unit.updateUnit;
      const response = await Apirequest(endpoint, method, body).then(
        (res) => res.data
      );

      if (response.statusCode === 200 || response.statusCode === 201) {
        toast.success(response.message);
        setCreatePopOpen(false);
        setEditFlag(false);
        GetUnitList();
      } else {
        toast.error(response.message);
        if (Array.isArray(response.errors) && response.errors.length > 0) {
          setErrorModalOpen(true);
          setErrorMessages(response.errors);
        }
      }

      setLoading(false);
    } catch (err) {
      console.log(err);
    } finally {
      stopLoading();
    }
  };

  const AddUnit = async () => {
    try {
      startLoading();
      const body = {
        unitName: unitInput.unitName
          ?.trim()
          .replace(/\b\w/g, (char) => char.toUpperCase()),
        oldUnitId: unitInput.oldUnitId?.trim(),
        shortName: unitInput.shortName?.trim(),
        divisionId: selectedDivision.id,
        unitHeadName: unitInput.unitHeadName?.trim(),
        cinno: "string",
        companyId: userValue.companyId,
        unitAddressDto: {
          countryId: selectedCountry.id,
          stateId: selectedState.id,
          cityId: selectedCity.id,
          addressLine1: unitInput.address1?.trim(),
          addressLine2: unitInput.address2?.trim(),
          pinCode: unitInput.pincode,
          contactNumber: unitInput.contact?.trim(),
          alternateNumber: unitInput.alternateContact?.trim(),
        },
        unitContactsDto: {
          name: unitInput.contactName?.trim(),
          designation: unitInput.designation?.trim(),
          email: unitInput.email?.trim(),
          phoneNo: unitInput.phone?.trim(),
          remarks: unitInput.remarks?.trim(),
        },
      };

      const { endpoint, method } = Config.Unit.addUnit;
      const response = await Apirequest(endpoint, method, body).then(
        (res) => res.data
      );

      if (response.statusCode === 200 || response.statusCode === 201) {
        toast.success(response.message);
        setCreatePopOpen(false);
        setEditFlag(false);
        GetUnitList();
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

  const GetUnitList = async () => {
    try {
      const { endpoint, method } = Config.Unit;
      const result = await Apirequest(
        endpoint
          .replace("{page}", page.toString())
          .replace("{size}", size.toString())
          .replace("{searchTerm}", search),
        method
      ).then((res) => res.data);
      setLoading(false);
      setUnitData(result.data);
      setCount(result.totalCount);
    } catch (err) {
      console.log(err);
      setLoading(false);
    }
  };
  const GetDivisionList = async () => {
    try {
      const { endpoint, method } = Config.Division.getDivision;
      const result = await Apirequest(endpoint, method).then((res) => res.data);
      setDivisionData(result.data);
    } catch (err) {
      console.log(err);
      setDivisionData([]);
    }
  };

  const GetCountryList = async () => {
    try {
      const { endpoint, method } = Config.Countries.getCountry;
      const result = await Apirequest(endpoint, method).then((res) => res.data);
      setCountryData(result.data);
    } catch (err) {
      console.log(err);
      setCountryData([]);
    }
  };

  const GetState = async (id: number) => {
    try {
      const { endpoint, method } = Config.State.getById;
      const result = await Apirequest(
        endpoint.replace(`{countryId}`, id ? id.toString() : ""),
        method
      ).then((res) => res.data);
      setStateData(result.data);
      return result;
    } catch (err) {
      console.log(err);
      setStateData([]);
    }
  };

  const GetCity = async (id: number) => {
    try {
      const { endpoint, method } = Config.City.getById;
      const result = await Apirequest(
        endpoint.replace(`{stateId}`, id ? id.toString() : ""),
        method
      ).then((res) => res.data);
      setCityData(result.data);
      return result.data;
    } catch (err) {
      console.log(err);
      setCityData([]);
    }
  };

  const GetOverallList = async (id: string) => {
    try {
      const { endpoint, method } = Config.Unit.getOverallUnit;
      const result = await Apirequest(
        endpoint.replace("{id}", id?.toString() ?? id),
        method
      ).then((res) => res.data);
      setUnitInput({
        ...unitInput,
        id: result.data?.id,
        unitName: result.data?.unitName,
        oldUnitId: result.data?.oldUnitId,
        shortName: result.data?.shortName,
        unitHeadName: result.data?.unitHeadName,
        pincode: result.data?.unitAddressDto?.pinCode,
        contact: result.data?.unitAddressDto?.contactNumber,
        alternateContact: result.data?.unitAddressDto?.alternateNumber,
        address1: result.data?.unitAddressDto?.addressLine1,
        address2: result.data?.unitAddressDto?.addressLine2,
        contactName: result.data?.unitContactsDto?.name,
        designation: result.data?.unitContactsDto?.designation,
        email: result.data?.unitContactsDto?.email,
        phone: result.data?.unitContactsDto?.phoneNo,
        remarks: result.data?.unitContactsDto?.remarks,
        isActive: result.data?.isActive,
      });
      const getDivision = divisionData.find((item: any) => {
        return item?.id === result.data?.divisionId;
      });

      const getCountry: any = countryData.find((item: any) => {
        return item?.id === result.data?.unitAddressDto?.countryId;
      });

      const getStateList = await GetState(getCountry?.id).then(
        (res) => res.data.data
      );
      setStateData(getStateList);

      const getState = getStateList.find((item: any) => {
        return item?.id === result.data?.unitAddressDto?.stateId;
      });

      const getCityList = await GetCity(getState?.id);
      setCityData(getCityList);

      const getCity = getCityList.find((item: any) => {
        return item?.id === result.data?.unitAddressDto?.cityId;
      });

      setSelectedCountry(getCountry);
      setSelectedState(getState);
      setSelectedCity(getCity);
      setSelectedDivision(getDivision);
    } catch (err) {
      console.error("Error fetching data:", err);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const handleAutocomplete = (
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
        setSelectedDivision(null);
        setStateData([]);
        setCityData([]);
      } else {
        setSelectedCountry(value);
        GetState(value.id);
      }
    } else if (field === "state") {
      if (!value) {
        setSelectedState(null);
        setSelectedCity(null);
        setSelectedDivision(null);
        setCityData([]);
      } else {
        setSelectedState(value);
        GetCity(value.id);
      }
    } else if (field === "city") {
      setSelectedCity(value);
    } else if (field === "division") {
      setSelectedDivision(value);
    }
  };

  const handleDelete = (id: number) => {
    setUnitInput({ ...unitInput, id: id });
    setDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    DeleteUnit();
    setDeleteOpen(false);
  };

  const DeleteUnit = async () => {
    try {
      const body = {
        id: unitInput.id,
      };
      const { endpoint, method } = Config.Unit.deleteUnit;
      const response = await Apirequest(
        endpoint.replace("{id}", `${unitInput.id}`),
        method,
        body
      ).then((res) => res.data);

      if (response.statusCode === 200 || response.statusCode === 201) {
        toast.success(response.message);
        setCreatePopOpen(false);
        setEditFlag(false);
        GetUnitList();
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

  useEffect(() => {
    GetDivisionList();
    GetCountryList();
    setInitFlag(true);
  }, []);

  React.useEffect(() => {
    initFlag && search !== "" ? GetUnitList() : GetUnitList();
  }, [debouncedSearchTerm, page, size]);

  const handleClickOpen = () => {
    setCreatePopOpen(true);
    setUnitInput({
      unitName: "",
      oldUnitId: "",
      shortName: "",
      unitHeadName: "",
      pincode: 0,
      contact: "",
      alternateContact: "",
      address1: "",
      address2: "",
      contactName: "",
      designation: "",
      email: "",
      phone: "",
      remarks: "",
      companyId: 0,
      id: 0,
      isActive: 1,
    });
    setErrors([]);
    setSelectedCountry(null);
    setSelectedState(null);
    setSelectedCity(null);
    setSelectedDivision(null);
    setEditFlag(false);
  };
  const handleClose = () => {
    setCreatePopOpen(false);
    setErrors([]);
    setUnitInput({
      unitName: "",
      oldUnitId: "",
      shortName: "",
      unitHeadName: "",
      pincode: 0,
      contact: "",
      alternateContact: "",
      address1: "",
      address2: "",
      contactName: "",
      designation: "",
      email: "",
      phone: "",
      remarks: "",
      companyId: 0,
      id: 0,
      isActive: 1,
    });
    setSelectedCountry(null);
    setSelectedState(null);
    setSelectedCity(null);
    setSelectedDivision(null);
    setEditFlag(false);
  };
  const handleSwitch = (e: React.ChangeEvent<HTMLInputElement>) => {
    let { checked } = e.target;
    checked
      ? setUnitInput({ ...unitInput, isActive: 1 })
      : setUnitInput({ ...unitInput, isActive: 0 });
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
          <IconBreadcrumbs parent={"Master"} child={"Unit"} path="" />
        </Box>
        <Box
          display={"flex"}
          justifyContent={"space-between"}
          alignItems={"center"}
          flexWrap={"wrap"}
          gap={2}
        >
          <GlobalSearch
            placeholder="search unit"
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
      <Box sx={{ width: "100%", my: 2, maxHeight: 700 }} className="main-table">
        {loading ? (
          <SkeletonLoader />
        ) : (
          <MuiTable
            rows={unitData}
            columns={columns}
            paginationMode="server"
            initialState={{
              pagination: {
                paginationModel: {
                  pageSize: size,
                },
              },
            }}
            slots={{
              noRowsOverlay: () => <NoDataFound />,
            }}
            onPaginationModelChange={(newPage) => {
              setPage(newPage.page + 1);
              setSize(newPage.pageSize);
            }}
            rowCount={count}
            rowHeight={40}
            columnHeaderHeight={40}
            pageSizeOptions={[15, 30, 50]}
            disableRowSelectionOnClick
          />
        )}
      </Box>
      <CreateUnit
        open={createPopOpen}
        handleClose={handleClose}
        divisionData={divisionData}
        unitInput={unitInput}
        handleInputChange={handleInputChange}
        handleSubmit={handleSubmit}
        handleSwitch={handleSwitch}
        errors={errors}
        handleAutocomplete={handleAutocomplete}
        countryData={countryData}
        stateData={stateData}
        cityData={cityData}
        selectedCountry={selectedCountry}
        selectedState={selectedState}
        selectedCity={selectedCity}
        selectedDivision={selectedDivision}
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

export default UnitListPage;
