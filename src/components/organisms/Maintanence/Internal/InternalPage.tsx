"use client";
import {
  Box,
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
import React, { useEffect, useRef, useState } from "react";
import { GoPlus } from "react-icons/go";
import MainConfig from "../../../../utils/main.api.json";
import {
  Apirequest,
  DateFormatter,
  isSubmitting,
  startLoading,
  stopLoading,
} from "../../../../utils/lib";
import { useDataFetchHook } from "../../../../hooks/useDataFetchHook";
import { useDebounce } from "../../../../hooks/useDebounceHook";
import CreateInternalRequest from "../../../molecules/Maintanence/Internal/CreateInternal";
import Config from "../../../../utils/config.api.json";
import { RequestProps } from "../../../../types/maintanenceTypes";
import { useRecoilValue } from "recoil";
import { UserData } from "../../../../utils/atoms";
import { FiEdit } from "react-icons/fi";
import Swal from "sweetalert2";
import SkeletonLoader from "../../../molecules/AdminLayout/SkeletonLoader";
import dayjs, { Dayjs } from "dayjs";
import { usePrivilegeCheck } from "../../../../hooks/usePrivilegeCheck";
import { BiCheck } from "react-icons/bi";
import { CgLock } from "react-icons/cg";
import { MdOutlineBlindsClosed } from "react-icons/md";
import toast from "react-hot-toast";
import ErrorModal from "../../../molecules/Master/Role/ErrorModal";

function InternalPage() {
  const userValue = useRecoilValue(UserData);
  const [pathname, setPathName] = useState<string>("");
  const permissions = usePrivilegeCheck(pathname);
  const [initFlag, setInitFlag] = React.useState(false);

  useEffect(() => {
    setInitFlag(true);
    const currentPath = window.location.pathname.split("/bsoft").at(-1) || "";
    setPathName(currentPath);
  }, []);

  const [internalData, setInternalDate] = React.useState<any[]>([]);
  const [page, setPage] = React.useState<number>(1);
  const [search, setSearch] = React.useState("");
  const debouncedSearchTerm = useDebounce(search, 500);
  const [open, setOpen] = React.useState(false);
  const [editFlag, setEditFlag] = React.useState(false);
  const [fromdate, setFromdate] = React.useState<Dayjs>(
    dayjs().subtract(30, "day")
  );
  const [todate, setTodate] = React.useState<Dayjs>(dayjs());
  const [loading, setLoading] = React.useState(false);
  const isFirstRender = useRef(true);

  const pendingApiCall = React.useRef(false);
  const paramsRef = React.useRef({
    page,
    search: debouncedSearchTerm,
    fromdate: fromdate?.format("YYYY-MM-DD"),
    todate: todate?.format("YYYY-MM-DD"),
  });

  const handleSearch = (
    e: React.ChangeEvent<HTMLInputElement> | Dayjs | null,
    name?: string
  ) => {
    let value: any;

    if (e && "target" in e) {
      value = e.target.value;
      name = e.target.name;
      setSearch(value);
    } else {
      value = e;
    }

    if (name === "fromDate" && value) {
      setFromdate(value);
    } else if (name === "toDate" && value) {
      setTodate(value);
    }
  };

  const GetInternalRequest = async (isInitialCall = false) => {
    const currentParams = {
      page,
      search: debouncedSearchTerm,
      fromdate: fromdate?.format("YYYY-MM-DD"),
      todate: todate?.format("YYYY-MM-DD"),
    };
    const paramsChanged =
      isInitialCall ||
      JSON.stringify(currentParams) !== JSON.stringify(paramsRef.current);
    // if (loading || !paramsChanged) {
    //   return;
    // }
    paramsRef.current = currentParams;
    setLoading(true);
    try {
      const formattedFromDate = fromdate ? fromdate.format("YYYY-MM-DD") : "";
      const formattedToDate = todate ? todate.format("YYYY-MM-DD") : "";
      const searchTermToUse = isInitialCall ? "" : debouncedSearchTerm;
      const response = await Apirequest(
        MainConfig.MaintenanceRequest.GetInternalRequest.endpoint
          .replace("{page}", page.toString())
          .replace("{size}", "15")
          .replace("{searchTerm}", searchTermToUse)
          .replace("{FromDate}", formattedFromDate)
          .replace("{ToDate}", formattedToDate),
        MainConfig.MaintenanceRequest.GetInternalRequest.method,
        null,
        "main"
      ).then((res) => res.data);

      setInternalDate(response.data);
      setCount(response?.totalCount);

      if (isInitialCall) {
        setInitFlag(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    GetInternalRequest(true);
  }, []);

  React.useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const timer = setTimeout(() => {
      GetInternalRequest(false);
    }, 0);

    return () => clearTimeout(timer);
  }, [fromdate, todate, debouncedSearchTerm, page]);

  const [error, setError] = React.useState<any[]>([]);
  const [errorModalOpen, setErrorModalOpen] = React.useState(false);
  const [errorMessages, setErrorMessages] = React.useState<string[]>([]);
  const [internalInput, setInternalInput] = React.useState<RequestProps>({
    maintenanceTypeId: 0,
    machineId: 0,
    departmentId: 0,
    remarks: "",
    isActive: 1,
    requestTypeId: 16,
    unitId: 1,
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
  const [selectedDepartment, setSelectedDepartment] = useState<any>(null);
  const [selectedMaintenanceType, setSelectedMaintenanceType] =
    useState<any>(null);
  const [selectedmachine, setSelectedmachine] = useState<any>(null);
  const [count, setCount] = React.useState<number>(15);
  const handlepageChange = (
    _event: React.ChangeEvent<unknown>,
    newPage: number
  ) => {
    setPage(newPage);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let { name, value } = e.target;
    setInternalInput({ ...internalInput, [name]: value });
    setError([]);
  };
  const handleClickOpen = () => {
    setOpen(true);
    setEditFlag(false);
    setError([]);
    setSelectedDepartment(null);
    setSelectedMaintenanceType(null);
    setSelectedmachine(null);
    setInternalInput({
      ...internalInput,
      remarks: "",
    });
  };
  const handleClose = () => {
    setOpen(false);
    setEditFlag(false);
  };

  useEffect(() => {
    if (fromdate && todate) {
      GetInternalRequest();
    }
  }, [page, debouncedSearchTerm, fromdate, todate]);

  const handleDepartmentChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    value: any,
    field: string
  ) => {
    setError([]);
    if (field === "deptName") {
      if (!value?.id) {
        setSelectedDepartment(null);
        setInternalInput((prev: any) => ({ ...prev, deptName: 0 }));
      } else {
        setSelectedDepartment(value);
        setInternalInput((prev: any) => ({ ...prev, deptName: value.id }));
      }
    }
  };
  const { data: departmentData } = useDataFetchHook(
    Config.Department.getGroupName.endpoint.replace("{name}", "maintenance"),
    Config.Department.getGroupName.method
  );

  const handleMaintenanceTypeChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    value: any,
    field: string
  ) => {
    setError([]);
    if (field === "code") {
      if (!value?.id) {
        setSelectedMaintenanceType(null);
        setInternalInput((prev: any) => ({ ...prev, code: 0 }));
      } else {
        setSelectedMaintenanceType(value);
        setInternalInput((prev: any) => ({ ...prev, code: value.id }));
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

  const handleMachineChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    value: any,
    field: string
  ) => {
    setError([]);
    if (field === "machineName") {
      if (!value?.id) {
        setSelectedmachine(null);
        setInternalInput((prev: any) => ({ ...prev, machineName: 0 }));
      } else {
        setSelectedmachine(value);
        setInternalInput((prev: any) => ({ ...prev, machineName: value.id }));
      }
    }
  };

  const { data: machineData } = useDataFetchHook(
    MainConfig.Machine.GetByMachinName.endpoint,
    MainConfig.Machine.GetByMachinName.method,
    "main"
  );

  const { data: requestTypeData } = useDataFetchHook(
    MainConfig.MaintenanceRequest.RequestType.endpoint
      .replace("{name}", "Internal")
      .replace("{type}", "RequestType"),
    MainConfig.MaintenanceRequest.RequestType.method,
    "main"
  );

  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (isSubmitting()) return;
    let temp: string[] = [];

    if (selectedDepartment === null) temp.push("departmentId");
    if (selectedMaintenanceType === null) temp.push("maintenanceTypeId");
    if (selectedmachine === null) temp.push("machineId");

    setError(temp);

    if (temp.length > 0) {
      console.error("Please fill all mandatory fields.");
      return;
    }

    try {
      startLoading();

      if (editFlag) {
        await UpdateInternalRequest();
      } else {
        await AddInternalRequest();
      }
    } catch (error) {
      console.error("Error saving internal request:", error);
    } finally {
      stopLoading();
    }
  };

  const AddInternalRequest = async () => {
    try {
      startLoading();
      const body: any = {
        requestTypeId:
          requestTypeData && requestTypeData.length > 0
            ? requestTypeData[0].id
            : null,
        maintenanceTypeId: selectedMaintenanceType?.id,
        machineId: selectedmachine?.id,
        productionDepartmentId: selectedmachine?.departmentId,
        maintenanceDepartmentId: selectedDepartment?.id,
        remarks: internalInput.remarks,
        isActive: internalInput.isActive,
        unitId: userValue.unitId,
        sourceId: null,
        vendorId: null,
        vendorName: null,
        oldVendorId: null,
        oldVendorName: null,
        serviceTypeId: null,
        serviceLocationId: null,
        modeOfDispatchId: null,
        expectedDispatchDate: null,
        sparesTypeId: null,
        estimatedServiceCost: null,
        estimatedSpareCost: null,
      };
      const { endpoint, method } = MainConfig.MaintenanceRequest.AddRequest;
      const response = await Apirequest(endpoint, method, body, "main").then(
        (res) => res.data
      );
      if (response.statusCode === 200 || response.statusCode === 201) {
        toast.success(response.message);
        setOpen(false);
        setEditFlag(false);
        setInternalInput({ ...internalInput });
        GetInternalRequest(false);
      } else {
        toast.error(response.message);
        if (Array.isArray(response.errors) && response.errors.length > 0) {
          setErrorModalOpen(true);
          setErrorMessages(response.errors);
        }
      }
    } catch (err) {
      console.log(err);
      GetInternalRequest(false);
    } finally {
      stopLoading();
    }
  };

  const UpdateInternalRequest = async () => {
    try {
      startLoading();
      const body: any = {
        maintenanceTypeId: selectedMaintenanceType?.id,
        machineId: selectedmachine?.id,
        productionDepartmentId: selectedmachine?.departmentId,
        maintenanceDepartmentId: selectedDepartment?.id,
        remarks: internalInput.remarks?.trim(),
        isActive: internalInput.isActive,
        requestTypeId: internalInput.requestTypeId,
        unitId: userValue.unitId,
        sourceId: null,
        vendorId: null,
        vendorName: null,
        oldVendorId: null,
        oldVendorName: null,
        serviceTypeId: null,
        serviceLocationId: null,
        modeOfDispatchId: null,
        expectedDispatchDate: null,
        sparesTypeId: null,
        estimatedServiceCost: null,
        estimatedSpareCost: null,
        requestStatusId: internalInput.requestStatusId,
      };

      if (editFlag) {
        body.id = Number(internalInput.id);
      }
      const { endpoint, method } = MainConfig.MaintenanceRequest.UpdateRequest;
      const response = await Apirequest(endpoint, method, body, "main").then(
        (res) => res.data
      );
      if (response.statusCode === 200 || response.statusCode === 201) {
        toast.success(response.message);
        setOpen(false);
        setEditFlag(false);
        setInternalInput({ ...internalInput });
        GetInternalRequest(false);
      } else {
        toast.error(response.message);
        if (Array.isArray(response.errors) && response.errors.length > 0) {
          setErrorModalOpen(true);
          setErrorMessages(response.errors);
        }
      }
    } catch (err) {
      GetInternalRequest(false);
      console.log(err);
    } finally {
      stopLoading();
    }
  };

  const handleEdit = (row: any) => {
    setEditFlag(true);
    setOpen(true);
    setInternalInput({
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
      expectedDispatchDate: row?.expectedDispatchDate,
      sparesTypeId: row?.sparesTypeId,
      estimatedServiceCost: row?.estimatedServiceCost,
      estimatedSpareCost: row?.estimatedSpareCost,
      requestStatusId: row?.requestStatusId,
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

        if (response.statusCode === 200 || response.statusCode === 201) {
          toast.success(response.message);
          GetInternalRequest();
        } else {
          toast.error(response.message);
          if (response.errors) {
            setErrorMessages(response.errors);
            setErrorModalOpen(true);
          }
        }
      } catch (err: any) {
        console.log(err);
      }
    }
  };

  React.useEffect(() => {
    GetInternalRequest();
  }, [fromdate, todate, debouncedSearchTerm, page]);

  useEffect(() => {
    if (
      departmentData ||
      maintenanceTypeData ||
      machineData ||
      requestTypeData
    ) {
      setInternalInput((prev: any) => ({
        ...prev,
        departmentData,
        maintenanceTypeData,
        machineData,
        requestTypeData,
      }));
    }
  }, [departmentData, maintenanceTypeData, machineData, requestTypeData]);

  const handleSwitch = (e: React.ChangeEvent<HTMLInputElement>) => {
    let { checked } = e.target;
    checked
      ? setInternalInput({ ...internalInput, isActive: 1 })
      : setInternalInput({ ...internalInput, isActive: 0 });
  };

  const getStatusChip = (status: string) => {
    const styles: any = {
      Open: {
        bg: "#e3f2fd",
        color: "#0277bd",
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
          <IconBreadcrumbs parent={"Request"} child={"Internal"} path="" />
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
            onChange={(e: any) => setSearch(e.target.value)}
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
            Internal Request
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
                  aria-label="stylish request table"
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
                      {[
                        "Request ID",
                        "Requested User",
                        "Requested Date",
                        "Maintenance Type",
                        "Machine",
                        "Department",
                        "Status",
                        "Action",
                      ].map((label) => (
                        <TableCell
                          key={label}
                          align="center"
                          sx={{
                            color: "#fff",
                            fontWeight: 600,
                            letterSpacing: 0.5,
                            whiteSpace: "nowrap",
                            background: "#327373 !important",
                            borderBottom: "2px solid #b2dfdb",
                          }}
                        >
                          {label}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {internalData && internalData.length > 0 ? (
                      internalData.map((row, index) => (
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
                          <TableCell align="center">{row.id}</TableCell>
                          <TableCell align="center">
                            {row.createdByName}
                          </TableCell>
                          <TableCell align="center">
                            {dayjs(row.createdDate).format("DD-MM-YYYY")}
                          </TableCell>
                          <TableCell align="center">
                            {row.maintenanceType}
                          </TableCell>
                          <TableCell align="center">
                            {row.machineName}
                          </TableCell>
                          <TableCell align="center">
                            {row.productionDepartmentName}
                          </TableCell>
                          <TableCell align="center">
                            {getStatusChip(row.requestStatus)}
                          </TableCell>
                          <TableCell>
                            <Box
                              display="flex"
                              gap={2}
                              alignItems="center"
                              justifyContent={
                                ["Open", "InProgress"].includes(
                                  row.requestStatus
                                )
                                  ? "center"
                                  : "flex-end"
                              }
                            >
                              {["Open", "InProgress"].includes(
                                row.requestStatus
                              ) && (
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
                              {/* {permissions.canUpdate && (
                                <FiEdit
                                  fontSize={20}
                                  color="#00796b"
                                  style={{ cursor: "pointer" }}
                                  onClick={() => handleEdit(row)}
                                />
                              )} */}
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={8} align="center">
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
                <Box sx={{ display: "flex", whiteSpace: "nowrap" }} gap={2}>
                  <MuiText fontSize={14}>Page: {page}</MuiText>
                  <MuiText fontSize={14}>size: 15</MuiText>
                  <MuiText fontSize={14}>count: {count}</MuiText>
                </Box>
                <Stack spacing={2}>
                  <Pagination
                    count={Math.ceil(count / 15)}
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

      <CreateInternalRequest
        open={open}
        close={handleClose}
        selectedDepartment={selectedDepartment}
        departmentData={departmentData}
        handleDepartmentChange={handleDepartmentChange}
        selectedMaintenanceType={selectedMaintenanceType}
        maintenanceTypeData={maintenanceTypeData}
        handleMaintenanceTypeChange={handleMaintenanceTypeChange}
        selectedmachine={selectedmachine}
        machineData={machineData}
        handleMachineChange={handleMachineChange}
        internalInput={internalInput}
        error={error}
        handleChange={handleChange}
        handleSwitch={handleSwitch}
        handleSubmit={handleSubmit}
      />
      <ErrorModal
        open={errorModalOpen}
        onClose={() => setErrorModalOpen(false)}
        errors={errorMessages}
      />
    </div>
  );
}

export default InternalPage;
