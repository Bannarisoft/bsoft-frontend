"use client";

import { Box, DialogTitle, Grid2, Skeleton } from "@mui/material";
import { MuiInputField, MuiText } from "bsoft-base-elements";
import IconBreadcrumbs from "../../../../components/molecules/AdminLayout/BreadCrumbs";
import React, { use, useEffect, useState } from "react";
import SummaryCard from "./SummaryCard";
import ClockCard from "./ClockCard";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import MainConfig from "../../../../utils/main.api.json";
import Config from "../../../../utils/config.api.json";
import NoData from "../../../../../public/assets/images/noData.jpg";
import ImageComponent from "../../../../components/atoms/Image";
import { useDataFetchHook } from "../../../../hooks/useDataFetchHook";
import { Apirequest, StyledAutocomplete } from "../../../../utils/lib";
import { useRecoilState } from "recoil";
import { WorkOrderFilter, WorkOrderMachineData } from "../../../../utils/atoms";

function WorkOrderPage() {
  const [openStates, setOpenStates] = useState(
    new Map<
      number,
      {
        isOpen: boolean;
        action: string;
        timestamp: string;
        isCompleted?: boolean;
      }
    >()
  );
  const [filter, setFilter] = useRecoilState(WorkOrderFilter);

  const handleToggle = (key: number, workOrderId: number, action: string) => {
    const currentTime = new Date().toISOString();
    setOpenStates((prev) => {
      const newMap = new Map(prev);
      const current = prev.get(key);
      newMap.set(key, {
        isOpen: !(current?.isOpen ?? false),
        action,
        timestamp: currentTime,
      });
      return newMap;
    });
    if (action === "InProgress") {
      StartTimer(workOrderId, currentTime, action);
    } else if (action === "Hold" || action === "Closed") {
      UpdateTimer(workOrderId, currentTime, action);
    }
  };

  const [workorderData, setWorkorderData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [machineData, setMachineData] = useRecoilState(WorkOrderMachineData);

  const { data: TypeData } = useDataFetchHook(
    MainConfig.WorkOrder.Type.endpoint,
    MainConfig.WorkOrder.Type.method,
    "main"
  );

  const { data: workorderStatus } = useDataFetchHook(
    MainConfig.WorkOrder.WorkOrderStatus.endpoint,
    MainConfig.WorkOrder.WorkOrderStatus.method,
    "main"
  );

  const { data: departmentData } = useDataFetchHook(
    Config.Department.departmentGroupName.endpoint.replace(
      "{name}",
      "maintenance"
    ),
    Config.Department.departmentGroupName.method
  );

  const GetWorkOrderData = async () => {
    setLoading(true);
    try {
      const { endpoint, method } = MainConfig.WorkOrder.GetWorkOrders;
      const response = await Apirequest(
        endpoint
          .replace("{dept}", filter.department ? filter.department?.id : "")
          .replace("{type}", filter.type ? filter.type?.id?.toString() : "")
          .replace(
            "{machine}",
            filter.machine ? filter.machine?.id?.toString() : ""
          )
          .replace(
            "{from}",
            dayjs(filter.startDate).format("YYYY-MM-DD").toString()
          )
          .replace(
            "{to}",
            dayjs(filter.endDate).format("YYYY-MM-DD").toString()
          ),
        method,
        null,
        "main"
      ).then((res) => res.data);
      const processedData = response.data.map((li: any) => {
        if (Array.isArray(li.BreakDown)) {
          li.BreakDown = li.BreakDown.map((item: any) => {
            const schedules = item?.schedules;
            if (Array.isArray(schedules) && schedules.length > 0) {
              const startTimeStr = schedules.at(0)?.start;
              const endTimeStr = schedules.at(-1)?.end;
              const lastSchedule = schedules.at(-1);

              if (startTimeStr && endTimeStr) {
                const startTime = new Date(startTimeStr);
                const endTime = new Date(endTimeStr);

                const diffInMs = endTime.getTime() - startTime.getTime();
                const diffInHours = diffInMs / (1000 * 60 * 60);

                return {
                  ...item,
                  isRestricted: lastSchedule?.isCompleted === 1,
                  duration: diffInHours,
                  startTime: startTime,
                  endTime: endTime,
                };
              }
            }

            return {
              ...item,
              isRestricted: false,
              duration: 0,
            };
          });
        }
        return li;
      });

      setWorkorderData(processedData);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      console.log(err);
    }
  };

  const GetMachine = async (id: string | number) => {
    try {
      const { endpoint, method } = MainConfig.WorkOrder.GetMachineByDepartment;
      const response = await Apirequest(
        endpoint.replace("{Id}", id?.toString()).trim(),
        method,
        null,
        "main"
      ).then((res) => res.data);
      setMachineData(response?.data);
    } catch (err) {
      console.log(err);
    }
  };

  const StartTimer = async (id: number, time: string, action: string) => {
    try {
      const status =
        Array.isArray(workorderStatus) &&
        workorderStatus.find((i) => i.code === action);
      const body = {
        woSchedule: {
          workOrderId: id,
          startTime: time,
          endTime: time,
          statusId: status ? status.id : "",
        },
      };
      const { endpoint, method } = MainConfig.WorkOrder.CreateTimer;
      const response = await Apirequest(endpoint, method, body, "main").then(
        (res) => res.data
      );
      if (response.statusCode === 200 || response.statusCode === 201) {
        GetWorkOrderData();
      }
    } catch (err) {
      console.log(err);
    }
  };

  const UpdateTimer = async (id: number, time: string, action: string) => {
    try {
      const status =
        Array.isArray(workorderStatus) &&
        workorderStatus.find((i) => i.code === action);
      const body = {
        woSchedule: {
          workOrderId: id,
          endTime: time,
          isCompleted: action === "Closed" ? 1 : 0,
          statusId: status ? status.id : "",
        },
      };
      const { endpoint, method } = MainConfig.WorkOrder.UpdateTimer;
      const response = await Apirequest(endpoint, method, body, "main").then(
        (res) => res.data
      );
      if (response.statusCode === 200 || response.statusCode === 201) {
        GetWorkOrderData();
      }
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    (filter.startDate !== null && filter.endDate !== null && filter.type) ||
      filter.department ||
      filter.machine;
    GetWorkOrderData();
  }, [
    filter.startDate,
    filter.endDate,
    filter.type,
    filter.department,
    filter.machine,
  ]);

  const NoWorkOrder = (type: string) => {
    return (
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        height="100%"
        p={3}
        borderRadius="12px"
        sx={{
          color: "#000",
          textAlign: "center",
          boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)",
        }}
      >
        <Box
          sx={{
            fontSize: "48px",
            mb: 2,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Box width={170} height={170} sx={{ mixBlendMode: "darken" }}>
            <ImageComponent src={NoData} alt="" />
          </Box>
        </Box>
        <MuiText
          variant="h6"
          fontWeight={600}
          fontSize={18}
          sx={{
            mb: 1,
            "@media (max-width: 600px)": {
              fontSize: 16,
            },
          }}
        >
          No {type} Workorder Found
        </MuiText>
      </Box>
    );
  };

  const breakDownLength = Array.isArray(workorderData)
    ? workorderData.reduce(
        (acc, item: any) =>
          acc + (Array.isArray(item.BreakDown) ? item.BreakDown.length : 0),
        0
      )
    : 0;
  const preventiveLength = Array.isArray(workorderData)
    ? workorderData.reduce(
        (acc, item: any) =>
          acc + (Array.isArray(item.Preventive) ? item.Preventive.length : 0),
        0
      )
    : 0;
  const predictiveLength = Array.isArray(workorderData)
    ? workorderData.reduce(
        (acc, item: any) =>
          acc + (Array.isArray(item.Predictive) ? item.Predictive.length : 0),
        0
      )
    : 0;

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
          <IconBreadcrumbs parent={"Schedule"} child={"Work Order"} path="" />
        </Box>
        <Box
          display={"flex"}
          justifyContent={"center"}
          alignItems={"center"}
          gap={2}
          flexWrap={"wrap"}
          sx={{
            "& .MuiFormHelperText-root": {
              background: "#f4f4f4",
              m: 0,
              pt: "4px",
            },
          }}
        >
          <Box
            display={"flex"}
            justifyContent={"center"}
            alignItems={"center"}
            gap={2}
          >
            <MuiText
              sx={{
                fontSize: "14px",
                fontWeight: 500,
                color: "#666",
                flex: "none",
              }}
            >
              From Date
            </MuiText>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                value={filter.startDate}
                onChange={(newValue) =>
                  setFilter({ ...filter, startDate: newValue })
                }
                slotProps={{
                  textField: {
                    fullWidth: true,
                    size: "small",
                    placeholder: "",
                    sx: {
                      bgcolor: "#fff",
                    },
                    inputProps: {
                      placeholder: "",
                    },
                  },
                }}
                format="DD-MM-YYYY"
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
              sx={{
                fontSize: "14px",
                fontWeight: 500,
                color: "#666",
                flex: "none",
              }}
            >
              To Date
            </MuiText>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                value={filter.endDate}
                onChange={(newValue) =>
                  setFilter({ ...filter, endDate: newValue })
                }
                slotProps={{
                  textField: {
                    fullWidth: true,
                    size: "small",
                    placeholder: "",
                    sx: {
                      bgcolor: "#fff",
                    },
                    inputProps: {
                      placeholder: "",
                    },
                  },
                }}
                format="DD-MM-YYYY"
              />
            </LocalizationProvider>
          </Box>
        </Box>
      </Box>
      <Box bgcolor={"#fff"} p={3} pt={0} mt={1.5}>
        <Box
          position={"relative"}
          display={"flex"}
          justifyContent={"space-between"}
          alignItems={"center"}
        >
          <DialogTitle className="highlighted-header" sx={{ pl: 0 }}>
            Workorder Board
          </DialogTitle>
          <Box
            display={"flex"}
            justifyContent={"start"}
            alignItems={"center"}
            gap={2}
          >
            <Box width={220}>
              <StyledAutocomplete
                options={departmentData || []}
                id="state-autocomplete"
                fullWidth
                size="small"
                value={filter.department}
                onChange={(event, value: any) => {
                  if (!value) {
                    setFilter({ ...filter, department: null, machine: null });
                  } else {
                    setFilter({ ...filter, department: value, machine: null });
                    GetMachine(value?.id);
                  }
                }}
                getOptionLabel={(option: any) => option?.deptName}
                renderOption={(props: any, option: any) => (
                  <li {...props} key={option?.id}>
                    {option?.deptName}
                  </li>
                )}
                renderInput={(params) => (
                  <MuiInputField {...params} placeholder="select department" />
                )}
              />
            </Box>
            <Box width={220}>
              <StyledAutocomplete
                options={machineData || []}
                id="state-autocomplete"
                fullWidth
                size="small"
                value={filter.machine}
                onChange={(event, value) => {
                  setFilter({ ...filter, machine: value });
                }}
                getOptionLabel={(option: any) =>
                  `${option?.machineName} - ${option?.machineCode}`
                }
                renderOption={(props: any, option: any) => (
                  <li {...props} key={option?.id} style={{ fontSize: 14 }}>
                    {option?.machineName} - {option?.machineCode}
                  </li>
                )}
                renderInput={(params) => (
                  <MuiInputField {...params} placeholder="select machine" />
                )}
              />
            </Box>
            <Box width={220}>
              <StyledAutocomplete
                options={
                  (Array.isArray(TypeData) &&
                    TypeData.sort((a, b) => b.code.localeCompare(a.code))) ||
                  []
                }
                fullWidth
                value={filter.type || null}
                onChange={(_: any, value: any) =>
                  setFilter({ ...filter, type: value })
                }
                getOptionLabel={(option: any) => option.code || ""}
                isOptionEqualToValue={(option: any, value: any) =>
                  option?.id === value?.id
                }
                size="small"
                renderInput={(params: any) => (
                  <MuiInputField
                    {...params}
                    name="type"
                    placeholder="select type"
                  />
                )}
              />
            </Box>
          </Box>
        </Box>
        {breakDownLength === 0 &&
        predictiveLength === 0 &&
        preventiveLength === 0 ? (
          <Box
            display="flex"
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
            p={3}
            mt={2}
            borderRadius="12px"
            sx={{
              color: "#000",
              boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)",
              textAlign: "center",
            }}
          >
            <Box
              sx={{
                fontSize: "48px",
                mb: 2,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              📅
            </Box>
            <MuiText
              variant="h6"
              fontWeight={600}
              fontSize={18}
              sx={{
                mb: 1,
                "@media (max-width: 600px)": {
                  fontSize: 16,
                },
              }}
            >
              No Data Available
            </MuiText>
            <MuiText
              variant="caption"
              fontWeight={400}
              fontSize={15}
              sx={{
                mb: 1,
                "@media (max-width: 600px)": {
                  fontSize: 16,
                },
              }}
            >
              Select <b>Department</b> to display work orders
            </MuiText>
          </Box>
        ) : (
          <>
            {loading ? (
              <Grid2 container spacing={2} mt={2}>
                {[0, 1, 2].map((li) => (
                  <Grid2 size={{ xs: 12, sm: 12, md: 4 }} key={li}>
                    <Skeleton
                      variant="rectangular"
                      width={"100%"}
                      height={"400px"}
                      sx={{ borderRadius: "8px" }}
                    />
                  </Grid2>
                ))}
              </Grid2>
            ) : (
              <Grid2 container spacing={2} mt={2}>
                <Grid2
                  size={{
                    xs: 12,
                    sm: 12,
                    md:
                      preventiveLength === 0 || predictiveLength === 0 ? 6 : 4,
                  }}
                  display={breakDownLength > 0 ? "block" : "none"}
                >
                  <Box
                    border={"1px solid #dfdfdf"}
                    sx={{
                      background: "#f4f4f4a1",
                      backdropFilter: "blur( 2px )",
                    }}
                    borderRadius={"18px"}
                    px={2}
                    pt={1}
                    pb={2}
                  >
                    <MuiText
                      // variant="h6"
                      fontWeight={500}
                      fontSize={16}
                      color="#0C4150"
                      pb={1}
                    >
                      Breakdown
                    </MuiText>
                    <Box height={500} overflow={"auto"} p={1}>
                      {Array.isArray(workorderData) &&
                      workorderData.some(
                        (list: any) =>
                          Array.isArray(list.BreakDown) &&
                          list.BreakDown.length > 0
                      )
                        ? workorderData.map((list: any) => {
                            if (
                              Array.isArray(list.BreakDown) &&
                              list.BreakDown.length > 0
                            ) {
                              return list.BreakDown.map((item: any) => {
                                return (
                                  <Box mb={2} key={item?.id}>
                                    <ClockCard
                                      handleToggle={(action: string) =>
                                        handleToggle(item?.id, item?.id, action)
                                      }
                                      clockData={item}
                                      clockState={openStates}
                                    />
                                  </Box>
                                );
                              });
                            }
                            return null;
                          })
                        : NoWorkOrder("Breakdown")}
                    </Box>
                  </Box>
                </Grid2>
                <Grid2
                  size={{
                    xs: 12,
                    sm: 12,
                    md: breakDownLength === 0 || predictiveLength === 0 ? 6 : 4,
                  }}
                  display={preventiveLength > 0 ? "block" : "none"}
                >
                  <Box
                    border={"1px solid #dfdfdf"}
                    sx={{ background: "#f4f4f4a1" }}
                    borderRadius={"18px"}
                    px={2}
                    pt={1}
                    pb={2}
                  >
                    <MuiText
                      // variant="h6"
                      fontWeight={500}
                      fontSize={16}
                      color="#0C4150"
                      pb={1}
                    >
                      Preventive
                    </MuiText>
                    <Box height={500} overflow={"auto"} p={1}>
                      {Array.isArray(workorderData) &&
                      workorderData.some(
                        (list: any) =>
                          Array.isArray(list.Preventive) &&
                          list.Preventive.length > 0
                      )
                        ? workorderData.map((list: any) => {
                            if (
                              Array.isArray(list.Preventive) &&
                              list.Preventive.length > 0
                            ) {
                              return list.Preventive.map((item: any) => {
                                return (
                                  <Box mb={2} key={item?.id}>
                                    <SummaryCard clockData={item} />
                                  </Box>
                                );
                              });
                            }
                            return null;
                          })
                        : NoWorkOrder("Preventive")}
                    </Box>
                  </Box>
                </Grid2>
                <Grid2
                  size={{
                    xs: 12,
                    sm: 12,
                    md: breakDownLength === 0 || preventiveLength === 0 ? 6 : 4,
                  }}
                  display={predictiveLength > 0 ? "block" : "none"}
                >
                  <Box
                    border={"1px solid #dfdfdf"}
                    sx={{ background: "#f4f4f4a1" }}
                    borderRadius={"18px"}
                    px={2}
                    pt={1}
                    pb={2}
                  >
                    <MuiText
                      // variant="h6"
                      fontWeight={500}
                      fontSize={16}
                      color="#0C4150"
                      pb={1}
                    >
                      Predictive
                    </MuiText>
                    <Box height={500} overflow={"auto"} p={1}>
                      {Array.isArray(workorderData) &&
                      workorderData.some(
                        (list: any) =>
                          Array.isArray(list.Predictive) &&
                          list.Predictive.length > 0
                      )
                        ? workorderData.map((list: any) => {
                            if (
                              Array.isArray(list.Predictive) &&
                              list.Predictive.length > 0
                            ) {
                              return list.Predictive.map((item: any) => {
                                return (
                                  <Box mb={2} key={item?.id}>
                                    <SummaryCard clockData={item} />
                                  </Box>
                                );
                              });
                            }
                            return null;
                          })
                        : NoWorkOrder("Predictive")}
                    </Box>
                  </Box>
                </Grid2>
              </Grid2>
            )}
          </>
        )}
      </Box>
    </div>
  );
}

export default WorkOrderPage;
