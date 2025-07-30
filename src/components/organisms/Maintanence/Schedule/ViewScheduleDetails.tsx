"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  Grid,
  Stack,
  TableContainer,
  Dialog,
  Fade,
  DialogTitle,
  Chip,
  IconButton,
  DialogContent,
  Button,
  FormControlLabel,
  Avatar,
  Tooltip,
  InputAdornment,
} from "@mui/material";
import {
  MdAutoAwesome,
  MdClose,
  MdPrecisionManufacturing,
  MdSchedule,
} from "react-icons/md";
import { RiTimeLine } from "react-icons/ri";
import { useDataFetchHook } from "../../../../hooks/useDataFetchHook";
import MainConfig from "../../../../utils/main.api.json";
import IconBreadcrumbs from "../../../molecules/AdminLayout/BreadCrumbs";
import { MuiButton, MuiInputField } from "bsoft-base-elements";
import { Apirequest, CustomSwitch } from "../../../../utils/lib";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import ErrorModal from "../../../molecules/Master/Role/ErrorModal";
import { BiSearch } from "react-icons/bi";
import Swal from "sweetalert2";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import toast from "react-hot-toast";
import { useLoadingHook } from "../../../../hooks/useLoadingHook";

interface FrquencyUpdateProps {
  id: number;
  frequencyInterval: number;
  isActive: number;
}

function ViewScheduleDetails({ scheduleId }: { scheduleId: string | number }) {
  const [refreshKey, setRefreshKey] = useState(0);
  const [lastDates, setLastDates] = useState<Record<number, Dayjs | null>>({});
  const [lastDatesUnmapped, setLastDatesUnmapped] = useState<
    Record<number, Dayjs | null>
  >({});
  const [errorModalOpen, setErrorModalOpen] = React.useState(false);
  const [errorMessages, setErrorMessages] = React.useState<string[]>([]);
  const [data, setData] = useState<any>([]);
  const [open, setOpen] = useState<boolean>(false);
  const [previousValues, setPreviousValues] = useState<Record<number, string>>(
    {}
  );
  const [search, setSearch] = useState("");
  const { withLoader, isLoading } = useLoadingHook();

  const filteredMachines = useMemo(() => {
    if (!data?.preventiveSchedulerDtl) return [];
    return data.preventiveSchedulerDtl.filter(
      (row: any) =>
        row.machineCode?.toLowerCase().includes(search.toLowerCase()) ||
        row.machineName?.toLowerCase().includes(search.toLowerCase())
    );
  }, [data?.preventiveSchedulerDtl, search]);

  const { data: unmappedData } = useDataFetchHook(
    MainConfig.WorkOrder.Schedule.UnmappedMachines.endpoint.replace(
      "{scheduleId}",
      scheduleId ? scheduleId.toString() : ""
    ),
    MainConfig.WorkOrder.Schedule.UnmappedMachines.method,
    "main",
    refreshKey
  );

  const GetMachinesBySchedule = async () => {
    try {
      const { endpoint, method } =
        MainConfig.WorkOrder.Schedule.GetMachinesBySchedule;
      const response = await Apirequest(
        endpoint.replace(
          "{scheduleId}",
          scheduleId ? scheduleId.toString() : ""
        ),
        method,
        null,
        "main"
      ).then((res) => res.data);
      setData(response?.data);
    } catch (err) {
      setData([]);
      console.log(err);
    }
  };

  useEffect(() => {
    GetMachinesBySchedule();
  }, []);

  useEffect(() => {
    if (data?.preventiveSchedulerDtl) {
      const initialValues = data.preventiveSchedulerDtl.reduce(
        (acc: any, item: any, index: number) => {
          acc[index] = item.frequencyInterval || "";
          return acc;
        },
        {} as Record<number, string>
      );
      setPreviousValues(initialValues);
    }
  }, [data?.preventiveSchedulerDtl]);

  const InfoCard = ({ icon, label, value, color = "primary" }: any) => (
    <Box
      sx={{
        p: 2,
        borderRadius: 2,
        bgcolor: "background.paper",
        border: 1,
        borderColor: "divider",
        transition: "all 0.2s ease",
        "&:hover": {
          borderColor: `${color}.main`,
          transform: "translateY(-2px)",
          boxShadow: 2,
        },
      }}
    >
      <Stack direction="row" alignItems="center" spacing={1.5}>
        <Box
          sx={{
            p: 1,
            borderRadius: 1,
            bgcolor: `${color}.50`,
            color: `${color}.main`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {icon}
        </Box>
        <Box>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ fontSize: "0.75rem" }}
          >
            {label}
          </Typography>
          <Typography variant="body2" fontWeight={600}>
            {value}
          </Typography>
        </Box>
      </Stack>
    </Box>
  );

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    index: number
  ) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 4) value = value.slice(0, 4);

    const updatedData = { ...data };
    updatedData.preventiveSchedulerDtl[index].frequencyInterval = value;
    setData(updatedData);
  };

  const handleBlur = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    idx: number
  ) => {
    const getData = { ...data };
    const currentValue = getData.preventiveSchedulerDtl[idx]?.frequencyInterval;
    const previousValue = previousValues[idx];

    if (currentValue !== previousValue) {
      const body = {
        id: getData.preventiveSchedulerDtl[idx]?.id,
        frequencyInterval: Number(currentValue),
        isActive: getData.preventiveSchedulerDtl[idx]?.isActive,
        lastMaintenanceActivityDate:
          getData.preventiveSchedulerDtl[idx]?.lastMaintenanceActivityDate !==
          "0001-01-01"
            ? dayjs(
                getData.preventiveSchedulerDtl[idx]?.lastMaintenanceActivityDate
              ).format("YYYY-MM-DD")
            : getData.preventiveSchedulerDtl[idx]?.lastMaintenanceActivityDate,
      };
      FrequencyUpdate(body);
      setPreviousValues((prev) => ({
        ...prev,
        [idx]: currentValue,
      }));
    }
  };

  const handleSwitch = async (
    e: React.ChangeEvent<HTMLInputElement>,
    idx: any
  ) => {
    const { checked } = e.target;
    const updatedData = { ...data };
    if (checked) {
      updatedData.preventiveSchedulerDtl[idx].isActive = 1;
      const body = {
        id: updatedData.preventiveSchedulerDtl[idx]?.id,
        frequencyInterval: Number(
          updatedData.preventiveSchedulerDtl[idx]?.frequencyInterval
        ),
        isActive: 1,
        lastMaintenanceActivityDate:
          updatedData.preventiveSchedulerDtl[idx]
            ?.lastMaintenanceActivityDate !== "0001-01-01"
            ? dayjs(
                updatedData.preventiveSchedulerDtl[idx]
                  ?.lastMaintenanceActivityDate
              ).format("YYYY-MM-DD")
            : updatedData.preventiveSchedulerDtl[idx]
                ?.lastMaintenanceActivityDate,
      };
      FrequencyUpdate(body, "status");
    } else {
      updatedData.preventiveSchedulerDtl[idx].isActive = 0;
      const body = {
        id: updatedData.preventiveSchedulerDtl[idx]?.id,
        frequencyInterval: Number(
          updatedData.preventiveSchedulerDtl[idx]?.frequencyInterval
        ),
        isActive: 0,
        lastMaintenanceActivityDate:
          updatedData.preventiveSchedulerDtl[idx]
            ?.lastMaintenanceActivityDate !== "0001-01-01"
            ? dayjs(
                updatedData.preventiveSchedulerDtl[idx]
                  ?.lastMaintenanceActivityDate
              ).format("YYYY-MM-DD")
            : updatedData.preventiveSchedulerDtl[idx]
                ?.lastMaintenanceActivityDate,
      };
      FrequencyUpdate(body, "status");
    }
  };

  const FrequencyUpdate = async (
    body: FrquencyUpdateProps,
    status?: string
  ) => {
    try {
      const { endpoint, method } =
        MainConfig.WorkOrder.Schedule.FrequencyUpdater;
      const response = await Apirequest(endpoint, method, body, "main").then(
        (res) => res.data
      );
      if (response?.statusCode === 200 || response?.statusCode === 201) {
        Swal.fire({
          title: response.message || "Status Updated Successfully",
          icon: "success",
          confirmButtonText: "okay",
          customClass: {
            title: "custom-title",
          },
        }).then((res) => {
          if (res.isConfirmed) {
            setRefreshKey((prev) => prev + 1);
            GetMachinesBySchedule();
          }
        });
      } else {
        toast.error(response?.message);
        if (Array.isArray(response.errors) && response.errors.length > 0) {
          setErrorMessages(response.errors);
          setErrorModalOpen(true);
        }
      }
    } catch (err) {
      GetMachinesBySchedule();
      console.log(err);
    }
  };

  const handleMapMachineById = async (machineId: number): Promise<void> => {
    await withLoader(async () => {
      try {
        if (!lastDatesUnmapped[machineId]) {
          toast.error("Please select date to map the machine");
          return;
        }

        const body = {
          id: Number(scheduleId),
          machineId: Number(machineId),
          lastMaintenanceActivityDate:
            lastDatesUnmapped[machineId]?.format("YYYY-MM-DD"),
        };

        const { endpoint, method } = MainConfig.WorkOrder.Schedule.mapMachines;

        const response = await Apirequest(endpoint, method, body, "main").then(
          (res) => res.data
        );

        if (response?.statusCode === 200 || response?.statusCode === 201) {
          toast.success(response?.message);
          setOpen(false);
          setLastDatesUnmapped({});
          GetMachinesBySchedule();
          setRefreshKey((prev) => prev + 1);
        } else {
          toast.error(response?.message);
          if (Array.isArray(response.errors) && response.errors.length > 0) {
            setErrorMessages(response.errors);
            setErrorModalOpen(true);
          }
        }
      } catch (err) {
        console.error("Mapping failed", err);
      }
    });
  };

  const handleLastDateChange = (newValue: Dayjs | null, idx: number) => {
    setLastDates((prev) => ({
      ...prev,
      [idx]: newValue,
    }));
    const updated = { ...data };
    updated.preventiveSchedulerDtl[idx].lastMaintenanceActivityDate =
      newValue?.toISOString() || null;
    const body = {
      id: updated.preventiveSchedulerDtl[idx]?.id,
      frequencyInterval: Number(
        updated.preventiveSchedulerDtl[idx]?.frequencyInterval
      ),
      isActive: updated.preventiveSchedulerDtl[idx]?.isActive,
      lastMaintenanceActivityDate:
        updated.preventiveSchedulerDtl[idx]?.lastMaintenanceActivityDate !==
        "0001-01-01"
          ? dayjs(
              updated.preventiveSchedulerDtl[idx]?.lastMaintenanceActivityDate
            ).format("YYYY-MM-DD")
          : updated.preventiveSchedulerDtl[idx]?.lastMaintenanceActivityDate,
    };
    FrequencyUpdate(body);
  };

  const UnmappedLastDateChange = (newValue: Dayjs | null, idx: number) => {
    setLastDatesUnmapped((prev) => ({
      ...prev,
      [idx]: newValue,
    }));
  };

  const exportToExcel = () => {
    const tableData = (data?.preventiveSchedulerDtl || []).map(
      (row: any, idx: number) => ({
        "#": idx + 1,
        "Machine Code": row.machineCode,
        "Machine Name": row.machineName,
        "Last Maintenance":
          row.lastMaintenanceActivityDate !== "0001-01-01"
            ? new Date(row.lastMaintenanceActivityDate).toLocaleDateString(
                "en-GB"
              )
            : "N/A",
        Frequency: row.frequencyInterval,
        "Due Date": row.actualWorkOrderDate
          ? new Date(row.actualWorkOrderDate).toLocaleDateString("en-GB")
          : "-",
        "WO Creation Start Date": row.workOrderCreationStartDate
          ? new Date(row.workOrderCreationStartDate).toLocaleDateString("en-GB")
          : "-",
        Status: row.isActive === 1 ? "Active" : "Inactive",
      })
    );

    const worksheet = XLSX.utils.json_to_sheet(tableData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      data?.preventiveSchedulerName
    );

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    saveAs(blob, `${data?.preventiveSchedulerName}.xlsx`);
  };

  return (
    <Box sx={{ p: 3, bgcolor: "#fafbfc" }}>
      <Box
        display={"flex"}
        justifyContent={"space-between"}
        alignItems={"center"}
        flexWrap={"wrap"}
        gap={2}
        mb={2}
      >
        <Box>
          <IconBreadcrumbs
            parent="Maintenance"
            child="Schedule List"
            subParent={"View Schedule"}
            path="/maintanence/schedule-list"
          />
        </Box>
      </Box>

      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} sm={6} md={12}>
          <InfoCard
            icon={<RiTimeLine fontSize="small" />}
            label="Activity"
            value={
              <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                {Array.isArray(data?.activity) &&
                  data?.activity.map((act: any, idx: number) => (
                    <Box
                      key={idx}
                      sx={{
                        borderRadius: 2,
                        bgcolor: "primary.50",
                        color: "primary.main",
                        py: 0.5,
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{ textDecoration: "underline" }}
                        fontWeight={500}
                      >
                        {act?.activityName}
                        {idx < data.activity.length - 1 && ","}
                      </Typography>
                    </Box>
                  ))}
              </Stack>
            }
            color="warning"
          />
        </Grid>
      </Grid>

      <Card
        sx={{
          borderRadius: 3,
          overflow: "hidden",
          boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
        }}
      >
        <CardContent sx={{ p: 0 }}>
          <Box
            sx={{ p: 2 }}
            display={"flex"}
            justifyContent={"space-between"}
            alignItems={"center"}
          >
            <Typography variant="h6" fontWeight={600} color="primary.main">
              Machine Details
            </Typography>
            <Box display={"flex"} alignItems={"center"} gap={2}>
              <MuiInputField
                size="small"
                placeholder="Search by Machine Name or Code"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                sx={{ minWidth: 300 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <BiSearch />
                    </InputAdornment>
                  ),
                }}
              />
              {Array.isArray(data?.preventiveSchedulerDtl) &&
                data?.preventiveSchedulerDtl?.length > 0 && (
                  <MuiButton variant="contained" onClick={exportToExcel}>
                    Export to Excel
                  </MuiButton>
                )}

              {Array.isArray(unmappedData) && unmappedData.length > 0 && (
                <MuiButton variant="outlined" onClick={() => setOpen(true)}>
                  Link Machines
                </MuiButton>
              )}
            </Box>
          </Box>
          <TableContainer
            component={Paper}
            sx={{
              maxHeight: 600,
              borderRadius: 2,
              boxShadow: 1,
            }}
          >
            <Table stickyHeader>
              <TableHead>
                <TableRow sx={{ bgcolor: "#f8fafc" }}>
                  {[
                    "#",
                    "Machine Code",
                    "Machine Name",
                    "Last Maintenance",
                    "Frequency",
                    "Due Date",
                    "WO Creation Start Date",
                    "Status",
                  ].map((header) => (
                    <TableCell
                      key={header}
                      sx={{
                        fontWeight: 600,
                        color: "text.primary",
                        backgroundColor: "#f8fafc",
                        position: "sticky",
                        top: 0,
                        zIndex: 1,
                      }}
                    >
                      {header}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {(filteredMachines || []).map((row: any, idx: number) => (
                  <TableRow
                    key={row?.machineCode}
                    sx={{
                      "&:hover": {
                        bgcolor: "action.hover",
                      },
                      "& .MuiTableCell-root": {
                        padding: "6px 12px !important",
                      },
                    }}
                  >
                    <TableCell>
                      <Box
                        sx={{
                          width: 24,
                          height: 24,
                          borderRadius: "50%",
                          bgcolor: "primary.main",
                          color: "white",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "0.75rem",
                          fontWeight: 600,
                        }}
                      >
                        {idx + 1}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        fontWeight={600}
                        color="primary.main"
                      >
                        {row?.machineCode}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {row?.machineName}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {row?.lastMaintenanceActivityDate &&
                        row?.lastMaintenanceActivityDate !== "0001-01-01" ? (
                          new Date(
                            row?.lastMaintenanceActivityDate
                          ).toLocaleDateString("en-GB")
                        ) : (
                          <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DatePicker
                              value={lastDates[idx] || null}
                              onChange={(newValue) =>
                                handleLastDateChange(newValue, idx)
                              }
                              format="DD-MM-YYYY"
                              slotProps={{
                                textField: {
                                  size: "small",
                                  sx: {
                                    bgcolor: "#fff",
                                  },
                                },
                              }}
                              maxDate={dayjs(new Date())}
                            />
                          </LocalizationProvider>
                        )}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ width: 120 }}>
                      <MuiInputField
                        size="small"
                        variant="outlined"
                        value={row?.frequencyInterval}
                        onChange={(e) => handleChange(e, idx)}
                        onBlur={(e) => handleBlur(e, idx)}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {row?.actualWorkOrderDate
                          ? new Date(
                              row?.actualWorkOrderDate
                            ).toLocaleDateString("en-GB")
                          : "-"}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {row?.workOrderCreationStartDate
                          ? new Date(
                              row?.workOrderCreationStartDate
                            ).toLocaleDateString("en-GB")
                          : "-"}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <FormControlLabel
                        sx={{ mr: 0 }}
                        control={
                          <CustomSwitch
                            checked={row?.isActive === 1}
                            onChange={(e) => handleSwitch(e, idx)}
                          />
                        }
                        label={""}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Dialog
          open={open}
          fullWidth
          maxWidth="md"
          TransitionComponent={Fade}
          transitionDuration={600}
          PaperProps={{
            sx: {
              borderRadius: 4,
              boxShadow: "0 24px 48px rgba(0,0,0,0.12)",
              overflow: "hidden",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              p: 0,
            },
          }}
        >
          <DialogTitle
            sx={{
              background: "rgba(255,255,255,0.95)",
              backdropFilter: "blur(10px)",
              borderBottom: "1px solid rgba(255,255,255,0.1)",
              p: 3,
              position: "relative",
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background:
                  "linear-gradient(45deg, rgba(102,126,234,0.05) 25%, transparent 25%, transparent 75%, rgba(102,126,234,0.05) 75%)",
                backgroundSize: "20px 20px",
                zIndex: 0,
              }}
            />

            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              sx={{ position: "relative", zIndex: 1 }}
            >
              <Stack direction="row" alignItems="center" spacing={2}>
                <Box>
                  <Typography
                    variant="h5"
                    fontWeight="700"
                    color="primary.main"
                    sx={{ mb: 0.5 }}
                  >
                    Unmapped Machines
                  </Typography>
                </Box>
              </Stack>

              <Stack direction="row" alignItems="center" spacing={2}>
                <Tooltip title="Close dialog">
                  <IconButton
                    onClick={() => {
                      setOpen(false);
                      setLastDatesUnmapped({});
                    }}
                    sx={{
                      bgcolor: "rgba(0,0,0,0.04)",
                      border: "1px solid rgba(0,0,0,0.1)",
                      "&:hover": {
                        bgcolor: "error.light",
                        color: "white",
                        transform: "scale(1.1)",
                      },
                      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    }}
                  >
                    <MdClose size={20} />
                  </IconButton>
                </Tooltip>
              </Stack>
            </Stack>
          </DialogTitle>
          <DialogContent
            sx={{
              p: 0,
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(248,250,252,0.98) 100%)",
              minHeight: 400,
            }}
          >
            {Array.isArray(unmappedData) && unmappedData.length === 0 ? (
              <Box
                sx={{
                  textAlign: "center",
                  py: 8,
                  px: 4,
                }}
              >
                <Box
                  sx={{
                    width: 120,
                    height: 120,
                    borderRadius: "50%",
                    bgcolor: "success.light",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mx: "auto",
                    mb: 3,
                    boxShadow: "0 12px 24px rgba(76,175,80,0.2)",
                  }}
                >
                  <MdAutoAwesome size={48} color="white" />
                </Box>
                <Typography
                  variant="h6"
                  fontWeight="600"
                  color="text.primary"
                  sx={{ mb: 1 }}
                >
                  All Machines Mapped!
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Great job! All your machines are properly configured and
                  mapped.
                </Typography>
              </Box>
            ) : (
              <Box sx={{ p: 2 }}>
                <Stack spacing={2}>
                  {Array.isArray(unmappedData) &&
                    unmappedData.map((machine, index) => (
                      <Card
                        key={machine.id}
                        sx={{
                          borderRadius: 3,
                          boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                          border: "1px solid rgba(0,0,0,0.06)",
                          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                          "&:hover": {
                            transform: "translateY(-2px)",
                            boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                            borderColor: "primary.main",
                          },
                        }}
                      >
                        <CardContent sx={{ p: 3 }}>
                          <Stack
                            direction="row"
                            alignItems="center"
                            spacing={3}
                          >
                            <Avatar
                              sx={{
                                width: 56,
                                height: 56,
                                bgcolor: "primary.main",
                                boxShadow: "0 8px 16px rgba(102,126,234,0.25)",
                              }}
                            >
                              <MdPrecisionManufacturing size={28} />
                            </Avatar>

                            <Box sx={{ flex: 1 }}>
                              <Stack
                                direction="row"
                                alignItems="center"
                                spacing={2}
                                sx={{ mb: 1 }}
                              >
                                <Typography
                                  variant="h6"
                                  fontWeight="600"
                                  color="text.primary"
                                >
                                  {machine.machineName}
                                </Typography>
                                <Chip
                                  label={machine.machineCode}
                                  size="small"
                                  variant="outlined"
                                  sx={{
                                    borderColor: "primary.main",
                                    color: "primary.main",
                                    fontWeight: 600,
                                    fontSize: "0.75rem",
                                  }}
                                />
                              </Stack>

                              <Stack
                                direction="row"
                                alignItems="center"
                                spacing={2}
                              >
                                <Stack
                                  direction="row"
                                  alignItems="center"
                                  spacing={1}
                                >
                                  <MdSchedule size={16} color="#666" />
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                  >
                                    Last Maintenance Date:
                                  </Typography>
                                </Stack>

                                <DatePicker
                                  value={lastDatesUnmapped[machine.id] || null}
                                  onChange={(newValue) =>
                                    UnmappedLastDateChange(newValue, machine.id)
                                  }
                                  format="DD-MM-YYYY"
                                  slotProps={{
                                    textField: {
                                      size: "small",
                                      sx: {
                                        minWidth: 160,
                                        "& .MuiOutlinedInput-root": {
                                          borderRadius: 2,
                                          bgcolor: "background.paper",
                                          "&:hover": {
                                            borderColor: "primary.main",
                                          },
                                        },
                                      },
                                    },
                                  }}
                                  maxDate={dayjs(new Date())}
                                />
                              </Stack>
                            </Box>
                            <Tooltip title="Map this machine">
                              <Button
                                variant="contained"
                                color="success"
                                onClick={() => handleMapMachineById(machine.id)}
                                disabled={isLoading(machine.id)}
                                sx={{
                                  borderRadius: 2,
                                  px: 3,
                                  py: 1.5,
                                  fontWeight: 600,
                                  minWidth: 120,
                                  boxShadow: "0 4px 12px rgba(76,175,80,0.3)",
                                  "&:hover": {
                                    boxShadow: "0 6px 16px rgba(76,175,80,0.4)",
                                    transform: "translateY(-1px)",
                                  },
                                  "&:disabled": {
                                    bgcolor: "action.disabledBackground",
                                  },
                                }}
                              >
                                {isLoading(machine.id)
                                  ? "Mapping..."
                                  : "Map Machine"}
                              </Button>
                            </Tooltip>
                          </Stack>
                        </CardContent>
                      </Card>
                    ))}
                </Stack>
              </Box>
            )}
          </DialogContent>
        </Dialog>
      </LocalizationProvider>
      <ErrorModal
        open={errorModalOpen}
        onClose={() => setErrorModalOpen(false)}
        errors={errorMessages}
      />
    </Box>
  );
}

export default ViewScheduleDetails;
