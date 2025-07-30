"use client";
import {
  Box,
  Checkbox,
  Chip,
  DialogTitle,
  Grid2,
  Pagination,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { MuiButton, MuiText } from "bsoft-base-elements";
import IconBreadcrumbs from "../../../molecules/AdminLayout/BreadCrumbs";
import GlobalSearch from "../../../molecules/AdminLayout/GlobalSearch";
import React, { useEffect, useState } from "react";
import { GoPlus } from "react-icons/go";
import MainConfig from "../../../../utils/main.api.json";
import Config from "../../../../utils/config.api.json";
import { Apirequest, DateFormatter } from "../../../../utils/lib";
import { useDataFetchHook } from "../../../../hooks/useDataFetchHook";
import { useDebounce } from "../../../../hooks/useDebounceHook";
import { RequestProps } from "../../../../maintanenceTypes";
import { useRecoilValue } from "recoil";
import { UserData } from "../../../../utils/atoms";
import { FiEdit } from "react-icons/fi";
import CreateExternalRequest from "../../../molecules/Maintanence/External/CreateExternal";
import SkeletonLoader from "../../../molecules/AdminLayout/SkeletonLoader";
import dayjs, { Dayjs } from "dayjs";
import Swal from "sweetalert2";
import ErrorModal from "../../../molecules/Master/Role/ErrorModal";
import { usePrivilegeCheck } from "../../../../hooks/usePrivilegeCheck";
import { CgLock } from "react-icons/cg";
import { BiCheck, BiCloset } from "react-icons/bi";
import { MdOutlineBlindsClosed } from "react-icons/md";
import toast from "react-hot-toast";

function ExternalPage() {
  const userValue = useRecoilValue(UserData);
  const [pathname, setPathName] = useState<string>("");
  const permissions = usePrivilegeCheck(pathname);
  const [initFlag, setInitFlag] = React.useState(false);

  useEffect(() => {
    setInitFlag(true);
    const currentPath = window.location.pathname.split("/bsoft").at(-1) || "";
    setPathName(currentPath);
  }, []);

  const [externalData, setExternalDate] = React.useState<any[]>([]);
  const [page, setPage] = React.useState<number>(1);
  const size = 15;
  const [count, setCount] = React.useState<number>(0);
  const [search, setSearch] = React.useState("");
  const debouncedSearchTerm = useDebounce(search, 500);
  const [open, setOpen] = React.useState(false);
  const [editFlag, setEditFlag] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [fromdate, setFromdate] = React.useState<Dayjs>(
    dayjs().subtract(30, "day")
  );
  const [todate, setTodate] = React.useState<Dayjs>(dayjs());

  const GetExternalRequest = async () => {
    setLoading(true);
    try {
      const formattedFromDate = fromdate ? fromdate.format("YYYY-MM-DD") : "";
      const formattedToDate = todate ? todate.format("YYYY-MM-DD") : "";
      const response = await Apirequest(
        MainConfig.MaintenanceRequest.GetExternalRequest.endpoint
          .replace("{page}", page.toString())
          .replace("{size}", size.toString())
          .replace("{searchTerm}", search)
          .replace("{FromDate}", formattedFromDate)
          .replace("{ToDate}", formattedToDate),
        MainConfig.MaintenanceRequest.GetExternalRequest.method,
        null,
        "main"
      ).then((res) => res.data);
      setLoading(false);
      setCount(response?.totalCount);
      setExternalDate(response.data);
    } catch (err) {
      setLoading(false);
      console.log(err);
    }
  };

  const handleDateChange = (name: string, newValue: Dayjs | null) => {
    setExternalInput((prev) => ({
      ...prev,
      [name]: newValue ? newValue.format("YYYY-MM-DD") : "",
    }));
    setError([]);
  };

  const [error, setError] = React.useState<any[]>([]);
  const [errorModalOpen, setErrorModalOpen] = React.useState(false);
  const [errorMessages, setErrorMessages] = React.useState<string[]>([]);
  const [externalInput, setExternalInput] = React.useState<RequestProps>({
    maintenanceTypeId: 0,
    machineId: 0,
    departmentId: 0,
    remarks: "",
    isActive: 1,
    requestTypeId: 0,
    unitId: 0,
    id: 0,
    sourceId: 0,
    vendorId: 0,
    vendorName: "",
    oldVendorId: "",
    oldVendorName: "",
    serviceTypeId: 0,
    serviceLocationId: 0,
    modeOfDispatchId: 0,
    expectedDispatchDate: "",
    sparesTypeId: 0,
    estimatedServiceCost: 0,
    estimatedSpareCost: 0,
    requestStatusId: 0,
  });

  const debouncedOldVendorId = useDebounce(externalInput.oldVendorId, 500);
  const [selectedServiceType, setSelectedServiceType] = useState<any>(null);
  const [selectedServiceLocation, setSelectedServiceLocation] =
    useState<any>(null);
  const [selectedDispatch, setSelectedDispatch] = useState<any>(null);
  const [selectedSpares, setSelectedSpares] = useState<any>(null);
  const [selectedMaintenanceType, setSelectedMaintenanceType] =
    useState<any>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<any>(null);
  const [selectedmachine, setSelectedmachine] = useState<any>(null);
  const [selectedIds, setSelectedIds] = useState<any[]>([]);
  const [locationFlag, setLocationFlag] = useState<boolean>(false);

  const [checkAll, setCheckAll] = useState(false);
  const handleCheckAllChange = () => {
    if (checkAll) {
      setSelectedIds([]);
    } else {
      setSelectedIds(externalData.map((item) => item.id));
    }
    setCheckAll(!checkAll);
  };

  const handlepageChange = (
    _event: React.ChangeEvent<unknown>,
    newPage: number
  ) => {
    setPage(newPage);
  };

  const handleCheckboxChange = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleAction = async (status: "Approved") => {
    if (selectedIds.length === 0) {
      console.warn("No items selected");
      return;
    }

    try {
      const { endpoint, method } =
        MainConfig.MaintenanceRequest.CreateWorkOrder;
      const payload = { ids: selectedIds };

      const result = await Apirequest(endpoint, method, payload, "main");
      if (result.data.statusCode !== 200 || result.data.statusCode !== 201) {
        setErrorMessages(result.data.errors);
        setErrorModalOpen(true);
      } else {
        Swal.fire({
          title: result.data.message,
          icon: "success",
          confirmButtonText: "okay",
          customClass: {
            title: "custom-title",
          },
        });
      }
      GetExternalRequest();
      setSelectedIds([]);
      setCheckAll(false);
    } catch (err) {
      console.error("Error performing action:", err);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "oldVendorId") {
      value.length === 0 &&
        setExternalInput({
          ...externalInput,
          vendorName: "",
          oldVendorName: "",
        });
    }
    setExternalInput((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError([]);
  };
  const handleClickOpen = () => {
    setOpen(true);
    setEditFlag(false);
    setError([]);
    setSelectedServiceLocation(null);
    setSelectedServiceType(null);
    setSelectedDispatch(null);
    setSelectedSpares(null);
    setSelectedDepartment(null);
    setSelectedMaintenanceType(null);
    setSelectedmachine(null);
    setExternalInput({
      ...externalInput,
      oldVendorId: "",
      oldVendorName: "",
      remarks: "",
      estimatedServiceCost: 0,
      estimatedSpareCost: 0,
      expectedDispatchDate: "",
    });
  };
  const handleClose = () => {
    setOpen(false);
    setEditFlag(false);
  };

  React.useEffect(() => {
    initFlag && search !== "" ? GetExternalRequest() : GetExternalRequest();
  }, [fromdate, todate, debouncedSearchTerm, page, size]);

  useEffect(() => {
    if (fromdate && todate) {
      GetExternalRequest();
    }
  }, [fromdate, todate]);

  const handleSearch = (
    e: React.ChangeEvent<HTMLInputElement> | Dayjs | null,
    name?: string
  ) => {
    let value: any;
    let fieldName: string | undefined;

    if (e && "target" in e) {
      value = e.target.value;
      fieldName = name || e.target.name;
      setSearch(value);
    } else {
      value = e;
      fieldName = name;
    }

    if (fieldName === "fromDate" && value) {
      setFromdate(value);
    } else if (fieldName === "toDate" && value) {
      setTodate(value);
    }
  };

  const handleReject = async (row: any) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "Do you want to close this request?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes",
    });

    if (result.isConfirmed) {
      const { endpoint, method } = MainConfig.MaintenanceRequest.CloseRequest;
      const finalEndpoint = endpoint.replace("{id}", row.id);

      try {
        const response = await Apirequest(
          finalEndpoint,
          method,
          null,
          "main"
        ).then((res) => res.data);

        if (response.statusCode === 200) {
          toast.success(response.message);
          GetExternalRequest();
        } else {
          toast.error(response.message);
          if (Array.isArray(response.errors) && response.errors.length > 0) {
            setErrorModalOpen(true);
            setErrorMessages(response.errors);
          }
        }
      } catch (err: any) {
        console.log(err);
      }
    }
  };

  const handleMaintenanceTypeChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    value: any,
    field: string
  ) => {
    if (field === "code") {
      if (!value?.id) {
        setSelectedMaintenanceType(null);
        setExternalInput((prev: any) => ({ ...prev, code: 0 }));
      } else {
        setSelectedMaintenanceType(value);
        setExternalInput((prev: any) => ({ ...prev, code: value.id }));
      }
    }
  };

  const { data: maintenanceTypeData } = useDataFetchHook(
    MainConfig.MaintenanceRequest.ScheduleMisc.endpoint.replace(
      "{type}",
      "maintenancetype"
    ),
    MainConfig.MaintenanceRequest.ScheduleMisc.method,
    "main"
  );

  const handleServiceLocation = (
    e: React.ChangeEvent<HTMLInputElement>,
    value: any,
    field: string
  ) => {
    if (field === "serviceLocation") {
      if (!value?.id) {
        setSelectedServiceLocation(null);
        setLocationFlag(false);
        setExternalInput((prev: any) => ({ ...prev, code: 0 }));
      } else {
        setSelectedServiceLocation(value);
        setLocationFlag(value?.code === "Unit");
        setExternalInput((prev: any) => ({ ...prev, code: value.id }));
      }
    }
  };

  const { data: serviceLocationData } = useDataFetchHook(
    MainConfig.MaintenanceRequest.GetServiceLocation.endpoint,
    MainConfig.MaintenanceRequest.GetServiceLocation.method,
    "main"
  );

  const handleServiceTypeChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    value: any,
    field: string
  ) => {
    if (field === "serviceCode") {
      if (!value?.id) {
        setSelectedServiceType(null);
        setExternalInput((prev: any) => ({ ...prev, code: 0 }));
      } else {
        setSelectedServiceType(value);
        setExternalInput((prev: any) => ({ ...prev, code: value.id }));
      }
    }
  };

  const { data: serviceTypeData, loading: serviceLoading } = useDataFetchHook(
    MainConfig.MaintenanceRequest.GetServiceType.endpoint,
    MainConfig.MaintenanceRequest.GetServiceType.method,
    "main"
  );

  const handleDispatchChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    value: any,
    field: string
  ) => {
    if (field === "dispatch") {
      if (!value?.id) {
        setSelectedDispatch(null);
        setExternalInput((prev: any) => ({ ...prev, code: 0 }));
      } else {
        setSelectedDispatch(value);
        setExternalInput((prev: any) => ({ ...prev, code: value.id }));
      }
    }
  };
  const { data: dispatchData } = useDataFetchHook(
    MainConfig.MaintenanceRequest.GetDispatch.endpoint,
    MainConfig.MaintenanceRequest.GetDispatch.method,
    "main"
  );

  const handleSparsTypeChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    value: any,
    field: string
  ) => {
    if (field === "spares") {
      if (!value?.id) {
        setSelectedSpares(null);
        setExternalInput((prev: any) => ({ ...prev, code: 0 }));
      } else {
        setSelectedSpares(value);
        setExternalInput((prev: any) => ({ ...prev, code: value.id }));
      }
    }
  };

  const { data: sparesData } = useDataFetchHook(
    MainConfig.MaintenanceRequest.GetSpares.endpoint,
    MainConfig.MaintenanceRequest.GetSpares.method,
    "main"
  );

  const { data: requestTypeData } = useDataFetchHook(
    MainConfig.MaintenanceRequest.RequestType.endpoint
      .replace("{name}", "External")
      .replace("{type}", "RequestType"),
    MainConfig.MaintenanceRequest.RequestType.method,
    "main"
  );

  const handleDepartmentChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    value: any,
    field: string
  ) => {
    if (field === "deptName") {
      if (!value?.id) {
        setSelectedDepartment(null);
        setExternalInput((prev: any) => ({ ...prev, deptName: 0 }));
      } else {
        setSelectedDepartment(value);
        setExternalInput((prev: any) => ({ ...prev, deptName: value.id }));
      }
    }
  };

  const { data: departmentData } = useDataFetchHook(
    Config.Department.getGroupName.endpoint.replace("{name}", "maintenance"),
    Config.Department.getGroupName.method
  );

  const handleMachineChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    value: any,
    field: string
  ) => {
    if (field === "machineName") {
      if (!value?.id) {
        setSelectedmachine(null);
        setExternalInput((prev: any) => ({ ...prev, machineName: 0 }));
      } else {
        setSelectedmachine(value);
        setExternalInput((prev: any) => ({ ...prev, machineName: value.id }));
      }
    }
  };

  const { data: machineData } = useDataFetchHook(
    MainConfig.Machine.GetByMachinName.endpoint,
    MainConfig.Machine.GetByMachinName.method,
    "main"
  );

  const GetVendorDetails = async (oldVendorIdValue: string) => {
    try {
      const { endpoint, method } = MainConfig.MaintenanceRequest.VendorDetails;
      const url = endpoint
        .replace("{oldUnitId}", userValue.oldUnitId.toString())
        .replace("{VendorCode}", oldVendorIdValue);

      const response = await Apirequest(url, method, null, "main").then(
        (res) => res.data
      );
      if (response.statusCode === 200 || response.statusCode === 201) {
        if (Array.isArray(response.data) && response.data.length > 0) {
          const vendor = response?.data?.at(0);
          setExternalInput({
            ...externalInput,
            vendorName: vendor?.vendorName,
            oldVendorName: vendor?.vendorName,
          });
        } else {
          setExternalInput({
            ...externalInput,
            vendorName: "",
            oldVendorName: "",
          });
        }
      }
    } catch (err) {
      console.error("Error fetching vendor details:", err);
    }
  };

  React.useEffect(() => {
    if (debouncedOldVendorId.trim() !== "") {
      GetVendorDetails(debouncedOldVendorId);
    }
  }, [debouncedOldVendorId]);

  const handleSubmit = (e: React.MouseEvent<HTMLButtonElement>) => {
    let temp: any = [];
    Object.entries(externalInput).map(([key, value]) => {
      if (
        key === "oldVendorId" &&
        typeof value == "string" &&
        value?.length == 0
      ) {
        temp.push(key);
      } else if (
        key === "estimatedServiceCost" &&
        typeof value == "string" &&
        (value?.length == 0 || parseFloat(value) <= 0)
      ) {
        temp.push(key);
      } else if (
        key === "estimatedSpareCost" &&
        typeof value == "string" &&
        (value?.length == 0 || parseFloat(value) <= 0)
      ) {
        temp.push(key);
      }
      if (selectedDepartment === null) {
        temp.push("maintenanceTypeId");
      }
      if (selectedMaintenanceType === null) {
        temp.push("departmentId");
      }
      if (selectedServiceType === null) {
        temp.push("serviceTypeId");
      }
      if (selectedServiceLocation === null) {
        temp.push("serviceLocationId");
      }
      // if (selectedDispatch === null) {
      //   temp.push("modeOfDispatchId");
      // }
      if (selectedmachine === null) {
        temp.push("machineId");
      }
      if (selectedMaintenanceType === null) {
        temp.push("maintenanceTypeId");
      }
      if (selectedSpares === null) {
        temp.push("sparesTypeId");
      }
    });
    setError(temp);
    if (temp.length === 0 && editFlag) {
      UpdateExternalRequest();
    } else {
      if (temp.length === 0) {
        AddExternalRequest();
      }
    }
  };

  const AddExternalRequest = async () => {
    try {
      const body: any = {
        requestTypeId:
          requestTypeData && requestTypeData.length > 0
            ? requestTypeData[0].id
            : null,
        maintenanceTypeId: selectedMaintenanceType?.id,
        machineId: selectedmachine?.id,
        productionDepartmentId: selectedmachine?.departmentId,
        maintenanceDepartmentId: selectedDepartment?.id,
        remarks: externalInput.remarks,
        isActive: externalInput.isActive,
        unitId: userValue.unitId,
        sourceId: 0,
        vendorId: null,
        vendorName: null,
        oldVendorId: externalInput.oldVendorId,
        oldVendorName: externalInput.oldVendorName,
        serviceTypeId: selectedServiceType?.id,
        serviceLocationId: selectedServiceLocation?.id,
        modeOfDispatchId: selectedDispatch?.id,
        expectedDispatchDate: externalInput.expectedDispatchDate
          ? dayjs(externalInput.expectedDispatchDate).format("YYYY-MM-DD")
          : null,
        sparesTypeId: selectedSpares?.id,
        estimatedServiceCost: externalInput.estimatedServiceCost,
        estimatedSpareCost: externalInput.estimatedSpareCost,
      };
      const { endpoint, method } = MainConfig.MaintenanceRequest.AddRequest;
      const response = await Apirequest(endpoint, method, body, "main").then(
        (res) => res.data
      );
      if (response.statusCode === 200 || response.statusCode === 201) {
        toast.success(response.message);
        setOpen(false);
        setEditFlag(false);
        setExternalInput({ ...externalInput });
        GetExternalRequest();
      } else {
        toast.error(response.message);
        setErrorMessages(response.errors);
        setErrorModalOpen(true);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const UpdateExternalRequest = async () => {
    try {
      const body: any = {
        requestTypeId:
          requestTypeData && requestTypeData.length > 0
            ? requestTypeData[0].id
            : null,
        maintenanceTypeId: selectedMaintenanceType?.id,
        machineId: selectedmachine?.id,
        productionDepartmentId: selectedmachine?.departmentId,
        maintenanceDepartmentId: selectedDepartment?.id,
        remarks: externalInput.remarks?.trim(),
        isActive: externalInput.isActive,
        unitId: userValue.unitId,
        sourceId: 0,
        vendorId: null,
        vendorName: null,
        oldVendorId: externalInput.oldVendorId?.trim(),
        oldVendorName: externalInput.oldVendorName?.trim(),
        serviceTypeId: selectedServiceType?.id,
        serviceLocationId: selectedServiceLocation?.id,
        modeOfDispatchId: selectedDispatch?.id,
        expectedDispatchDate: externalInput.expectedDispatchDate
          ? dayjs(externalInput.expectedDispatchDate).format("YYYY-MM-DD")
          : null,
        sparesTypeId: selectedSpares?.id,
        estimatedServiceCost: externalInput.estimatedServiceCost,
        estimatedSpareCost: externalInput.estimatedSpareCost,
        requestStatusId: externalInput.requestStatusId,
      };

      if (editFlag) {
        body.id = Number(externalInput.id);
      }
      const { endpoint, method } = MainConfig.MaintenanceRequest.UpdateRequest;
      const response = await Apirequest(endpoint, method, body, "main").then(
        (res) => res.data
      );

      if (response.statusCode === 200 || response.statusCode === 201) {
        toast.success(response.message);
        setOpen(false);
        setEditFlag(false);
        setExternalInput({ ...externalInput });
        GetExternalRequest();
      } else {
        toast.error(response.message);
        setErrorMessages(response.errors);
        setErrorModalOpen(true);
      }
    } catch (err) {
      GetExternalRequest();
      console.log(err);
    }
  };
  const formatDateForInput = (dateStr: string | undefined) => {
    if (!dateStr) return "";
    const [day, month, yearWithTime] = dateStr.split("-");
    const [year] = yearWithTime.split(" ");
    return `${year}-${month}-${day}`;
  };
  const handleEdit = (row: any) => {
    setEditFlag(true);
    setOpen(true);
    setExternalInput({
      maintenanceTypeId: row?.maintenanceTypeId,
      machineId: row?.machineId,
      departmentId: row?.maintenanceDepartmentId,
      remarks: row?.remarks,
      isActive: row?.isActive,
      requestTypeId: row?.requestTypeId,
      unitId: row?.unitId,
      id: row?.id,
      sourceId: row?.sourceId,
      vendorId: row?.vendorId,
      vendorName: row?.vendorName,
      oldVendorId: row?.oldVendorId,
      oldVendorName: row?.oldVendorName,
      serviceTypeId: row?.serviceTypeId,
      serviceLocationId: row?.serviceLocationId,
      modeOfDispatchId: row?.modeOfDispatchId,
      expectedDispatchDate: formatDateForInput(row?.expectedDispatchDate),
      sparesTypeId: row?.sparesTypeId,
      estimatedServiceCost: row?.estimatedServiceCost,
      estimatedSpareCost: row?.estimatedSpareCost,
      requestStatusId: row?.requestStatusId,
    });

    serviceTypeData?.map((item: any) => {
      if (item.id === row?.serviceTypeId) {
        setSelectedServiceType(item);
      }
    });
    serviceLocationData?.map((item: any) => {
      if (item.id === row?.serviceLocationId) {
        setSelectedServiceLocation(item);
      }
    });
    dispatchData?.map((item: any) => {
      if (item.id === row?.modeOfDispatchId) {
        setSelectedDispatch(item);
      }
    });
    departmentData?.map((item: any) => {
      if (item.id === row?.maintenanceDepartmentId) {
        setSelectedDepartment(item);
      }
    });
    machineData?.map((item: any) => {
      if (item.id === row?.machineId) {
        setSelectedmachine(item);
      }
    });
    maintenanceTypeData?.map((item: any) => {
      if (item.id === row?.maintenanceTypeId) {
        setSelectedMaintenanceType(item);
      }
    });
    sparesData?.map((item: any) => {
      if (item.id === row?.sparesTypeId) {
        setSelectedSpares(item);
      }
    });
  };

  useEffect(() => {
    if (
      serviceTypeData ||
      serviceLocationData ||
      dispatchData ||
      requestTypeData ||
      maintenanceTypeData
    ) {
      setExternalInput((prev: any) => ({
        ...prev,
        serviceTypeData,
        serviceLocationData,
        dispatchData,
        requestTypeData,
        maintenanceTypeData,
      }));
    }
  }, [
    serviceTypeData,
    serviceLocationData,
    dispatchData,
    requestTypeData,
    maintenanceTypeData,
  ]);

  const handleSwitch = (e: React.ChangeEvent<HTMLInputElement>) => {
    let { checked } = e.target;
    checked
      ? setExternalInput({ ...externalInput, isActive: 1 })
      : setExternalInput({ ...externalInput, isActive: 0 });
  };

  const getStatusChip = (status: string) => {
    const styles: any = {
      Open: {
        bg: "#e0f7fa",
        color: "#00796b",
        icon: <CgLock style={{ marginRight: 4 }} />,
      },
      InProgress: {
        bg: "#fff8e1",
        color: "#f57c00",
        icon: <CgLock style={{ marginRight: 4 }} />,
      },
      Completed: {
        bg: "#e8f5e9",
        color: "#2e7d32",
        icon: <BiCheck style={{ marginRight: 4 }} />,
      },
      Closed: {
        bg: "#eeeeee",
        color: "#616161",
        icon: <MdOutlineBlindsClosed style={{ marginRight: 4 }} />,
      },
    };

    const { bg, color, icon } = styles[status] || {
      bg: "#e0e0e0",
      color: "#000",
      icon: null,
    };

    return (
      <Box
        sx={{
          display: "inline-flex",
          alignItems: "center",
          px: 1.5,
          py: 0.5,
          borderRadius: "20px",
          fontSize: "0.75rem",
          fontWeight: 500,
          bgcolor: bg,
          color,
        }}
      >
        {icon} {status}
      </Box>
    );
  };

  return (
    <div>
      <Box
        display={"flex"}
        justifyContent={"space-between"}
        alignItems={"center"}
        flexWrap={"wrap"}
        gap={2}
        mt={1}
      >
        <Box>
          <IconBreadcrumbs parent={"Request"} child={"External"} path="" />
        </Box>
        <Box
          display={"flex"}
          justifyContent={"space-between"}
          alignItems={"center"}
          flexWrap={"wrap"}
          gap={2}
        >
          <GlobalSearch
            placeholder="search"
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
                Add Request
              </MuiButton>
            )}
          </Box>
        </Box>
      </Box>
      <Box bgcolor={"#fff"} p={3} pt={0} mt={1.5}>
        <Box position={"relative"}>
          <DialogTitle className="highlighted-header" sx={{ pl: 0 }}>
            External Request
          </DialogTitle>
          <Box
            display={"flex"}
            justifyContent={"center"}
            alignItems={"center"}
            gap={3}
            position={"absolute"}
            top={"12px"}
            right={0}
          >
            <Box
              display={"flex"}
              justifyContent={"center"}
              alignItems={"center"}
              gap={2}
            >
              <MuiText
                variant="h6"
                display={"flex"}
                flex={"none"}
                className="admin-label-title"
                mb={0.5}
              >
                From Date
              </MuiText>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      size: "small",
                      placeholder: "",
                      inputProps: {
                        placeholder: "",
                        value: fromdate ? DateFormatter(fromdate) : "",
                        readOnly: true,
                      },
                    },
                  }}
                  value={fromdate}
                  onChange={(newValue) => handleSearch(newValue, "fromDate")}
                  name="fromDate"
                />
              </LocalizationProvider>
            </Box>
            <Box
              display={"flex"}
              justifyContent={"center"}
              alignItems={"center"}
              gap={2}
            >
              <MuiText
                variant="h6"
                display={"flex"}
                flex={"none"}
                className="admin-label-title"
                mb={0.5}
              >
                To Date
              </MuiText>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      size: "small",
                      placeholder: "",
                      inputProps: {
                        placeholder: "",
                        value: todate ? DateFormatter(todate) : "",
                        readOnly: true,
                      },
                    },
                  }}
                  value={todate}
                  onChange={(newValue) => handleSearch(newValue, "toDate")}
                  name="toDate"
                />
              </LocalizationProvider>
            </Box>
            <Box
              sx={{
                display: "flex",
                justifyContent: "end",
              }}
            >
              {permissions.canApprove && (
                <MuiButton
                  variant="contained"
                  onClick={() => handleAction("Approved")}
                >
                  Approve
                </MuiButton>
              )}
            </Box>
          </Box>
        </Box>
        <Box mt={2}>
          {loading ? (
            <SkeletonLoader />
          ) : (
            <Box>
              <TableContainer
                sx={{
                  maxHeight: 600,
                  borderRadius: 4,
                  boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
                  background:
                    "linear-gradient(135deg, #ffffff 60%, #f0fafa 100%)",
                  mt: 3,
                  mb: 3,
                  border: "1px solid #e0f2f1",
                  overflow: "auto",
                  "&::-webkit-scrollbar": {
                    height: 8,
                    width: 8,
                  },
                  "&::-webkit-scrollbar-thumb": {
                    backgroundColor: "#b2dfdb",
                    borderRadius: 8,
                  },
                }}
              >
                <Table
                  stickyHeader
                  sx={{
                    minWidth: 1200,
                    "& .MuiTableCell-root": {
                      p: "14px",
                      fontSize: "0.875rem",
                      fontFamily: "Poppins, sans-serif",
                    },
                    "& .MuiTableRow-root": {
                      transition: "background 0.2s ease",
                    },
                    "& .MuiTableRow-hover:hover": {
                      background: "rgba(0, 150, 136, 0.06) !important",
                    },
                  }}
                  aria-label="enhanced service request table"
                >
                  <TableHead>
                    <TableRow
                      sx={{
                        position: "sticky",
                        top: 0,
                        zIndex: 9,
                        background: "#327373 !important",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
                      }}
                    >
                      <TableCell
                        sx={{
                          color: "#fff",
                          width: 50,
                          fontWeight: 600,
                          background: "#327373 !important",
                        }}
                      >
                        <Checkbox
                          checked={checkAll}
                          onChange={handleCheckAllChange}
                          sx={{
                            color: "#fff !important",
                            p: 0,
                            "&.Mui-checked": { color: "#004d40" },
                          }}
                        />
                      </TableCell>
                      {[
                        "Request ID",
                        "Requested User",
                        "Requested Date",
                        "Maintenance Type",
                        "Department",
                        "Machine",
                        "Vendor Name",
                        "Service Type",
                        "Service Location",
                        "Mode of Dispatch",
                        "Estimated Service Cost",
                        "Estimated Spare Cost",
                        "Status",
                        "Action",
                      ].map((header) => (
                        <TableCell
                          key={header}
                          sx={{
                            color: "#fff",
                            fontWeight: 600,
                            letterSpacing: 0.5,
                            whiteSpace: "nowrap",
                            background: "#327373 !important",
                            borderBottom: "2px solid #b2dfdb",
                          }}
                        >
                          {header}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {externalData && externalData.length > 0 ? (
                      externalData.map((row, index) => (
                        <TableRow
                          key={row.id}
                          hover
                          sx={{
                            backgroundColor:
                              index % 2 === 0
                                ? "rgba(0, 150, 136, 0.03)"
                                : "transparent",
                          }}
                        >
                          <TableCell>
                            <Checkbox
                              checked={selectedIds.includes(row.id)}
                              onChange={() => handleCheckboxChange(row.id)}
                              sx={{ color: "#26a69a" }}
                            />
                          </TableCell>
                          <TableCell sx={{ fontWeight: 500 }}>
                            {row.id}
                          </TableCell>
                          <TableCell>{row.createdByName}</TableCell>
                          <TableCell>
                            {dayjs(row.createdDate).format("DD-MM-YYYY")}
                          </TableCell>
                          <TableCell>{row.maintenanceType}</TableCell>
                          <TableCell align="center">
                            {row.productionDepartmentName}
                          </TableCell>
                          <TableCell>{row.machineName}</TableCell>
                          <TableCell>{row.oldVendorName}</TableCell>
                          <TableCell>{row.serviceType}</TableCell>
                          <TableCell>{row.serviceLocation}</TableCell>
                          <TableCell>{row.modeOfDispatch}</TableCell>
                          <TableCell sx={{ fontWeight: 500 }}>
                            ₹{row.estimatedServiceCost}
                          </TableCell>
                          <TableCell sx={{ fontWeight: 500 }}>
                            ₹{row.estimatedSpareCost}
                          </TableCell>
                          <TableCell align="center">
                            {getStatusChip(row.requestStatus)}
                          </TableCell>
                          <TableCell>
                            <Box
                              display="flex"
                              gap={2}
                              alignItems={"center"}
                              justifyContent={
                                row.requestStatus === "InProgress" ||
                                row.requestStatus === "Open"
                                  ? "center"
                                  : "end"
                              }
                            >
                              {(row.requestStatus === "InProgress" ||
                                row.requestStatus === "Open") && (
                                <MuiButton
                                  size="small"
                                  sx={{
                                    background: "#ffcdd2",
                                    color: "#b71c1c",
                                    textTransform: "none",
                                    fontWeight: 500,
                                    borderRadius: 2,
                                    px: 2,
                                    "&:hover": { background: "#ef9a9a" },
                                  }}
                                  onClick={() => handleReject(row)}
                                >
                                  Close
                                </MuiButton>
                              )}
                              {permissions.canUpdate && (
                                <FiEdit
                                  fontSize={20}
                                  color="#3a8484"
                                  cursor={"pointer"}
                                  onClick={() => handleEdit(row)}
                                />
                              )}
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={14}>
                          <Box
                            sx={{
                              py: 6,
                              textAlign: "center",
                              color: "text.secondary",
                            }}
                          >
                            No service requests found
                          </Box>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
              <Grid2
                size={12}
                sx={{
                  justifyContent: "space-between",
                  alignItems: "center",
                  display: "flex",
                  position: "sticky",
                  mt: 1,
                }}
              >
                <Box sx={{ display: "flex" }} gap={2}>
                  <MuiText whiteSpace={"nowrap"} fontSize={14}>
                    Page: {page}
                  </MuiText>
                  <MuiText whiteSpace={"nowrap"} fontSize={14}>
                    size: {size}
                  </MuiText>
                  <MuiText whiteSpace={"nowrap"} fontSize={14}>
                    count: {count}
                  </MuiText>
                </Box>
                <Stack spacing={2}>
                  <Pagination
                    count={Math.ceil(count / size)}
                    page={page}
                    color="primary"
                    onChange={handlepageChange}
                  />
                </Stack>
              </Grid2>
            </Box>
          )}
        </Box>
      </Box>

      <CreateExternalRequest
        open={open}
        close={handleClose}
        handleServiceTypeChange={handleServiceTypeChange}
        error={error}
        handleChange={handleChange}
        handleSwitch={handleSwitch}
        handleSubmit={handleSubmit}
        selectedServiceType={selectedServiceType}
        serviceTypeData={serviceTypeData}
        externalInput={externalInput}
        handleServiceLocation={handleServiceLocation}
        selectedServiceLocation={selectedServiceLocation}
        serviceLocationData={serviceLocationData}
        dispatchData={dispatchData}
        handleDispatchChange={handleDispatchChange}
        selectedDispatch={selectedDispatch}
        sparesData={sparesData}
        handleSparsTypeChange={handleSparsTypeChange}
        selectedSpares={selectedSpares}
        handleMaintenanceTypeChange={handleMaintenanceTypeChange}
        selectedMaintenanceType={selectedMaintenanceType}
        maintenanceTypeData={maintenanceTypeData}
        handleDepartmentChange={handleDepartmentChange}
        selectedDepartment={selectedDepartment}
        departmentData={departmentData}
        handleMachineChange={handleMachineChange}
        selectedmachine={selectedmachine}
        machineData={machineData}
        handleDateChange={handleDateChange}
        locationFlag={locationFlag}
      />
      <ErrorModal
        open={errorModalOpen}
        onClose={() => setErrorModalOpen(false)}
        errors={errorMessages}
      />
    </div>
  );
}

export default ExternalPage;
