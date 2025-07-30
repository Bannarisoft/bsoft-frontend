"use client";
import { useState, useEffect, JSX, useCallback, useMemo, useRef } from "react";
import {
  Box,
  Tabs,
  Tab,
  Typography,
  Paper,
  Fade,
  useTheme,
  CircularProgress,
  IconButton,
  Tooltip,
} from "@mui/material";
import { FiShoppingBag } from "react-icons/fi";
import StockReportPage from "./StockReportPage";
import { useDataFetchHook } from "../../../../hooks/useDataFetchHook";
import MainConfig from "../../../../utils/main.api.json";
import Config from "../../../../utils/config.api.json";
import {
  RiAlignItemVerticalCenterLine,
  RiGitPullRequestFill,
  RiMindMap,
} from "react-icons/ri";
import RequestReport from "./RequestReport";
import dayjs from "dayjs";
import { FaNetworkWired } from "react-icons/fa6";
import WorkOrderReport from "./WorkOrderReport";
import ItemConsumptionReport from "./ItemConsumptionReport";
import { useRecoilValue } from "recoil";
import { UserData } from "../../../../utils/atoms";
import { MdOutlineInventory2 } from "react-icons/md";
import SubStoreStockReport from "./SubStoreStockReport";
import WorkOrderChecklistReport from "./WorkOrderChecklistReport";
import { LuListCheck } from "react-icons/lu";
import { SiMaterialdesignicons } from "react-icons/si";
import { GrSchedulePlay } from "react-icons/gr";
import MRSReport from "./MRSReport";
import ScheduleReport from "./ScheduleReport";
import MaterialPlanningReport from "./MaterialPlanningReport";
interface BaseTypeData {
  id: number;
  code: string;
}

interface WorkOrderStatus extends BaseTypeData {
  name: string;
}

interface DepartmentData extends BaseTypeData {
  name: string;
}

interface MaintenanceType extends BaseTypeData {
  name: string;
}
interface DateRangeState {
  startDate: dayjs.Dayjs;
  endDate: dayjs.Dayjs;
}
interface ReportState extends DateRangeState {
  selectedType?: BaseTypeData | null;
  selectedDepartment?: DepartmentData | null;
  selectedStatus?: WorkOrderStatus | null;
  refreshToken: number;
}

function TabPanel({ children, value, index, ...other }: any) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`report-tabpanel-${index}`}
      aria-labelledby={`report-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Fade in={value === index} timeout={500}>
          <Box sx={{ p: 3 }}>{children}</Box>
        </Fade>
      )}
    </div>
  );
}
interface ReportData {
  id: number;
  title: string;
  icon: JSX.Element;
  loading: boolean;
  component: JSX.Element;
  stateKey: string;
}

export default function ReportsPage() {
  const theme = useTheme();
  const [value, setValue] = useState(0);
  const [pinnedTabIds, setPinnedTabIds] = useState<number[]>([]);
  const userValue = useRecoilValue(UserData);
  const [stockRefresh, setStockRefresh] = useState<number>(0);
  const [stockDeptRefresh, setStockDeptRefresh] = useState<number>(0);
  const [selectedDepartment, setSelectedDepartment] = useState<any>(null);
  const [selectedDepartmentSub, setSelectedDepartmentSub] = useState<any>(null);

  const initialDateRange = {
    startDate: dayjs(new Date()).subtract(1, "month"),
    endDate: dayjs(new Date()),
  };

  const initialStates: Record<string, Partial<ReportState>> = {
    request: {
      ...initialDateRange,
      selectedDepartment: null,
      selectedType: null,
      selectedStatus: null,
    },
    workOrder: {
      ...initialDateRange,
      selectedType: null,
    },
    itemConsumption: {
      ...initialDateRange,
      selectedType: null,
    },
    subStoreStock: {
      ...initialDateRange,
    },
    workOrderChecklist: {
      ...initialDateRange,
    },
    mrs: {
      ...initialDateRange,
    },
    schedule: {
      ...initialDateRange,
    },
    materialPlanning: {
      ...initialDateRange,
    },
  };

  const debounceTimers = useRef<Record<string, NodeJS.Timeout>>({});

  const updateReportState = useCallback(
    (stateKey: string, newState: Partial<ReportState>) => {
      setReportStates((prevStates) => ({
        ...prevStates,
        [stateKey]: {
          ...prevStates[stateKey],
          ...newState,
          refreshToken: prevStates[stateKey].refreshToken + 1,
        },
      }));
    },
    []
  );

  const debouncedUpdateReportState = useCallback(
    (stateKey: string, newState: Partial<ReportState>, debounceMs = 400) => {
      if (debounceTimers.current[stateKey]) {
        clearTimeout(debounceTimers.current[stateKey]);
      }
      debounceTimers.current[stateKey] = setTimeout(() => {
        updateReportState(stateKey, newState);
        delete debounceTimers.current[stateKey];
      }, debounceMs);
    },
    [updateReportState]
  );

  const [reportStates, setReportStates] = useState<Record<string, ReportState>>(
    {
      request: {
        ...initialDateRange,
        selectedDepartment: null,
        selectedType: null,
        selectedStatus: null,
        refreshToken: 0,
      },
      workOrder: {
        ...initialDateRange,
        selectedType: null,
        refreshToken: 0,
      },
      itemConsumption: {
        ...initialDateRange,
        selectedType: null,
        refreshToken: 0,
      },
      subStoreStock: {
        ...initialDateRange,
        refreshToken: 0,
      },
      workOrderChecklist: {
        ...initialDateRange,
        refreshToken: 0,
      },
      mrs: {
        ...initialDateRange,
        refreshToken: 0,
      },
      schedule: {
        ...initialDateRange,
        refreshToken: 0,
      },
      materialPlanning: {
        ...initialDateRange,
        refreshToken: 0,
      },
    }
  );

  useEffect(() => {
    const savedPinnedTabs = localStorage.getItem("pinnedReportTabs");
    if (savedPinnedTabs !== null) {
      try {
        setPinnedTabIds(JSON.parse(savedPinnedTabs));
      } catch (e) {
        localStorage.removeItem("pinnedReportTabs");
      }
    }
  }, []);

  const getEndpoints = useMemo(() => {
    const oldUnit = userValue?.oldUnitId ? userValue.oldUnitId.toString() : "";

    return {
      stockReport: MainConfig.Report.StockReport.endpoint
        .replace("{oldUnit}", oldUnit)
        .replace("{dept}", selectedDepartment ? selectedDepartment?.id : ""),

      requestReport: () =>
        MainConfig.Report.RequestReport.endpoint
          .replace(
            "{from}",
            reportStates.request.startDate
              ? dayjs(reportStates.request.startDate).format("YYYY-MM-DD")
              : ""
          )
          .replace(
            "{to}",
            reportStates.request.endDate
              ? dayjs(reportStates.request.endDate).format("YYYY-MM-DD")
              : ""
          )
          .replace(
            "{req}",
            reportStates.request.selectedType
              ? reportStates.request.selectedType?.id?.toString()
              : "0"
          )
          .replace(
            "{status}",
            reportStates.request.selectedStatus
              ? reportStates.request.selectedStatus?.id?.toString()
              : "0"
          )
          .replace(
            "{dept}",
            reportStates.request.selectedDepartment
              ? reportStates.request.selectedDepartment?.id?.toString()
              : "0"
          ),

      workOrderReport: () =>
        MainConfig.Report.WorkOrderReport.endpoint
          .replace(
            "{from}",
            reportStates.workOrder.startDate
              ? dayjs(reportStates.workOrder.startDate).format("YYYY-MM-DD")
              : ""
          )
          .replace(
            "{to}",
            reportStates.workOrder.endDate
              ? dayjs(reportStates.workOrder.endDate).format("YYYY-MM-DD")
              : ""
          )
          .replace(
            "{req}",
            reportStates.workOrder.selectedType
              ? reportStates.workOrder.selectedType?.id?.toString()
              : "0"
          ),

      itemConsumption: () =>
        MainConfig.Report.ItemConsumption.endpoint
          .replace(
            "{from}",
            reportStates.itemConsumption.startDate
              ? dayjs(reportStates.itemConsumption.startDate).format(
                  "YYYY-MM-DD"
                )
              : ""
          )
          .replace(
            "{to}",
            reportStates.itemConsumption.endDate
              ? dayjs(reportStates.itemConsumption.endDate).format("YYYY-MM-DD")
              : ""
          ),
      subStoreStock: () => {
        if (!oldUnit) return null;
        return MainConfig.Report.SubStoreStockLedger.endpoint
          .replace("{oldUnit}", oldUnit)
          .replace(
            "{from}",
            reportStates.subStoreStock.startDate
              ? dayjs(reportStates.subStoreStock.startDate).format("YYYY-MM-DD")
              : ""
          )
          .replace(
            "{to}",
            reportStates.subStoreStock.endDate
              ? dayjs(reportStates.subStoreStock.endDate).format("YYYY-MM-DD")
              : ""
          )
          .replace(
            "{dept}",
            selectedDepartmentSub ? selectedDepartmentSub?.id : ""
          );
      },

      workOrderChecklist: () =>
        MainConfig.Report.WorkOrderChecklistReport.endpoint
          .replace(
            "{from}",
            reportStates.workOrderChecklist.startDate
              ? dayjs(reportStates.workOrderChecklist.startDate).format(
                  "YYYY-MM-DD"
                )
              : ""
          )
          .replace(
            "{to}",
            reportStates.workOrderChecklist.endDate
              ? dayjs(reportStates.workOrderChecklist.endDate).format(
                  "YYYY-MM-DD"
                )
              : ""
          ),

      mrsReport: () =>
        MainConfig.Report.MRSReport.endpoint
          .replace(
            "{from}",
            reportStates.mrs.startDate
              ? dayjs(reportStates.mrs.startDate).format("YYYY-MM-DD")
              : ""
          )
          .replace(
            "{to}",
            reportStates.mrs.endDate
              ? dayjs(reportStates.mrs.endDate).format("YYYY-MM-DD")
              : ""
          )
          .replace("{oldUnit}", oldUnit),

      scheduleReport: () => {
        if (!oldUnit) return null;
        return MainConfig.Report.ScheduleReport.endpoint
          .replace(
            "{from}",
            reportStates.schedule.startDate
              ? dayjs(reportStates.schedule.startDate).format("YYYY-MM-DD")
              : ""
          )
          .replace(
            "{to}",
            reportStates.schedule.endDate
              ? dayjs(reportStates.schedule.endDate).format("YYYY-MM-DD")
              : ""
          )
          .replace("{oldUnit}", oldUnit);
      },

      materialPlanning: () =>
        MainConfig.Report.MaterialPlanningReport.endpoint
          .replace(
            "{from}",
            reportStates.materialPlanning.startDate
              ? dayjs(reportStates.materialPlanning.startDate).format(
                  "YYYY-MM-DD"
                )
              : ""
          )
          .replace(
            "{to}",
            reportStates.materialPlanning.endDate
              ? dayjs(reportStates.materialPlanning.endDate).format(
                  "YYYY-MM-DD"
                )
              : ""
          ),
    };
  }, [
    reportStates,
    userValue?.oldUnitId,
    selectedDepartment,
    selectedDepartmentSub,
  ]);

  const safeUseDataFetchHook = (
    endpoint: any,
    method: string,
    source?: string,
    refreshToken?: number
  ) => {
    const result = useDataFetchHook(
      endpoint || null,
      method,
      source,
      refreshToken
    );

    return result;
  };

  const { data: stockMasterData } = safeUseDataFetchHook(
    getEndpoints.stockReport,
    MainConfig.Report.StockReport.method,
    "main",
    stockRefresh
  );

  const { data: departmentDataForStock } = useDataFetchHook(
    Config.Department.departmentGroupName.endpoint.replace(
      "{name}",
      "maintenance"
    ),
    Config.Department.departmentGroupName.method
  );

  useEffect(() => {
    if (departmentDataForStock && departmentDataForStock.length > 0) {
      const sortedTypes: any =
        Array.isArray(departmentDataForStock) &&
        departmentDataForStock.sort((a, b) =>
          String(b.code ?? "").localeCompare(String(a.code ?? ""))
        );
      setSelectedDepartment(sortedTypes[0] || null);
      setSelectedDepartmentSub(sortedTypes[0] || null);
      setStockRefresh((prev) => prev + 1);
    }
  }, [departmentDataForStock, stockDeptRefresh]);

  const { data: requestReportData } = safeUseDataFetchHook(
    getEndpoints.requestReport(),
    MainConfig.Report.RequestReport.method,
    "main",
    reportStates.request.refreshToken
  );

  const { data: workorderData } = safeUseDataFetchHook(
    getEndpoints.workOrderReport(),
    MainConfig.Report.WorkOrderReport.method,
    "main",
    reportStates.workOrder.refreshToken
  );

  const { data: itemConsumptionData } = safeUseDataFetchHook(
    getEndpoints.itemConsumption(),
    MainConfig.Report.ItemConsumption.method,
    "main",
    reportStates.itemConsumption.refreshToken
  );

  const { data: subStoreStockData } = safeUseDataFetchHook(
    getEndpoints.subStoreStock(),
    MainConfig.Report.SubStoreStockLedger.method,
    "main",
    reportStates.subStoreStock.refreshToken
  );

  const { data: workOrderChecklistData } = safeUseDataFetchHook(
    getEndpoints.workOrderChecklist(),
    MainConfig.Report.WorkOrderChecklistReport.method,
    "main",
    reportStates.workOrderChecklist.refreshToken
  );

  const { data: mrsReportData } = safeUseDataFetchHook(
    getEndpoints.mrsReport(),
    MainConfig.Report.MRSReport.method,
    "main",
    reportStates.mrs.refreshToken
  );

  const { data: scheduleData } = safeUseDataFetchHook(
    getEndpoints.scheduleReport(),
    MainConfig.Report.ScheduleReport.method,
    "main",
    reportStates.schedule.refreshToken
  );

  const { data: materialPlanningData } = safeUseDataFetchHook(
    getEndpoints.materialPlanning(),
    MainConfig.Report.MaterialPlanningReport.method,
    "main",
    reportStates.materialPlanning.refreshToken
  );

  const { data: departmentData } = safeUseDataFetchHook(
    Config.Department.getDepartment.endpoint,
    Config.Department.getDepartment.method
  );

  const { data: TypeData } = safeUseDataFetchHook(
    MainConfig.WorkOrder.Type.endpoint,
    MainConfig.WorkOrder.Type.method,
    "main"
  );

  const { data: workorderStatus } = safeUseDataFetchHook(
    MainConfig.WorkOrder.WorkOrderStatus.endpoint,
    MainConfig.WorkOrder.WorkOrderStatus.method,
    "main"
  );

  const { data: maintenanceTypeData } = safeUseDataFetchHook(
    MainConfig.MaintenanceRequest.ScheduleMisc.endpoint.replace(
      "{type}",
      "maintenancetype"
    ),
    MainConfig.MaintenanceRequest.ScheduleMisc.method,
    "main"
  );

  const updateLoadingState = useCallback(
    (stateKey: string, isLoading: boolean) => {
      setLoadingStates((prev) => ({
        ...prev,
        [stateKey]: isLoading,
      }));
    },
    []
  );

  useEffect(() => {
    const reportKeys = Object.keys(reportStates);
    reportKeys.forEach((key) => {
      if (reportStates[key].refreshToken > 0) {
        updateLoadingState(key, true);

        const timer = setTimeout(() => {
          updateLoadingState(key, false);
        }, 1000);

        return () => clearTimeout(timer);
      }
    });
  }, [reportStates, updateLoadingState]);

  useEffect(() => {
    if (maintenanceTypeData && maintenanceTypeData.length > 0) {
      const sortedTypes: any =
        Array.isArray(maintenanceTypeData) &&
        maintenanceTypeData.sort((a, b) => a.code.localeCompare(b.code));

      updateReportState("itemConsumption", {
        selectedType: sortedTypes[0] || null,
      });
    }
  }, [maintenanceTypeData, updateReportState]);

  const refreshTab = (stateKey: string) => {
    if (stateKey === "stock") {
      setStockRefresh((prev) => prev + 1);
      setStockDeptRefresh((prev) => prev + 1);
    } else {
      setReportStates((prevStates: any) => ({
        ...prevStates,
        [stateKey]: {
          ...initialStates[stateKey],
          refreshToken: (prevStates[stateKey]?.refreshToken ?? 0) + 1,
        },
      }));
    }
  };

  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({
    stock: false,
    request: false,
    workOrder: false,
    itemConsumption: false,
    subStoreStock: false,
    workOrderChecklist: false,
    mrs: false,
    schedule: false,
    materialPlanning: false,
  });

  const baseReportData: ReportData[] = useMemo(
    () => [
      {
        id: 0,
        title: "Stock Report",
        icon: <FiShoppingBag size={20} />,
        loading: loadingStates["stock"] || false,
        stateKey: "stock",
        component: (
          <StockReportPage
            stockMasterData={stockMasterData}
            departmentData={departmentDataForStock}
            selectedDepartment={selectedDepartment}
            setSelectedDepartment={setSelectedDepartment}
            refresh={() => refreshTab("stock")}
          />
        ),
      },
      {
        id: 1,
        title: "Request Report",
        icon: <RiGitPullRequestFill size={20} />,
        loading: loadingStates["request"] || !requestReportData,
        stateKey: "request",
        component: (
          <RequestReport
            requestReportData={requestReportData}
            typeData={TypeData}
            departmentData={departmentData}
            workorderStatus={workorderStatus}
            requestStates={reportStates.request}
            setRequestStates={(newState: any) =>
              debouncedUpdateReportState("request", newState)
            }
            refresh={() => refreshTab("request")}
          />
        ),
      },
      {
        id: 2,
        title: "Work Order Report",
        icon: <FaNetworkWired size={20} />,
        loading: loadingStates["workOrder"] || !workorderData,
        stateKey: "workOrder",
        component: (
          <WorkOrderReport
            workorderData={workorderData}
            typeData={TypeData}
            requestStates={reportStates.workOrder}
            setRequestStates={(newState: any) =>
              debouncedUpdateReportState("workOrder", newState)
            }
            refresh={() => refreshTab("workOrder")}
          />
        ),
      },
      {
        id: 3,
        title: "Item Consumption Report",
        icon: <RiAlignItemVerticalCenterLine size={20} />,
        loading: loadingStates["itemConsumption"] || !itemConsumptionData,
        stateKey: "itemConsumption",
        component: (
          <ItemConsumptionReport
            workorderData={itemConsumptionData}
            typeData={maintenanceTypeData}
            requestStates={reportStates.itemConsumption}
            setRequestStates={(newState: any) =>
              debouncedUpdateReportState("itemConsumption", newState)
            }
            refresh={() => refreshTab("itemConsumption")}
          />
        ),
      },
      {
        id: 4,
        title: "Sub Store Stock Ledger",
        icon: <MdOutlineInventory2 size={20} />,
        loading: loadingStates["subStoreStock"] || !subStoreStockData,
        stateKey: "subStoreStock",
        component: (
          <SubStoreStockReport
            workorderData={subStoreStockData}
            requestStates={reportStates.subStoreStock}
            setRequestStates={(newState: any) =>
              debouncedUpdateReportState("subStoreStock", newState)
            }
            departmentData={departmentDataForStock}
            selectedDepartment={selectedDepartmentSub}
            setSelectedDepartment={setSelectedDepartmentSub}
            refresh={() => refreshTab("subStoreStock")}
          />
        ),
      },
      {
        id: 5,
        title: "Work Order Checklist Report",
        icon: <LuListCheck size={20} />,
        loading: loadingStates["workOrderChecklist"] || !workOrderChecklistData,
        stateKey: "workOrderChecklist",
        component: (
          <WorkOrderChecklistReport
            workorderData={workOrderChecklistData}
            requestStates={reportStates.workOrderChecklist}
            setRequestStates={(newState: any) =>
              debouncedUpdateReportState("workOrderChecklist", newState)
            }
            refresh={() => refreshTab("workOrderChecklist")}
          />
        ),
      },
      {
        id: 6,
        title: "MRS Report",
        icon: <SiMaterialdesignicons size={20} />,
        loading: loadingStates["mrs"] || !mrsReportData,
        stateKey: "mrs",
        component: (
          <MRSReport
            workorderData={mrsReportData}
            requestStates={reportStates.mrs}
            setRequestStates={(newState: any) =>
              debouncedUpdateReportState("mrs", newState)
            }
            refresh={() => refreshTab("mrs")}
          />
        ),
      },
      {
        id: 7,
        title: "Schedule Report",
        icon: <GrSchedulePlay size={20} />,
        loading: loadingStates["schedule"] || !scheduleData,
        stateKey: "schedule",
        component: (
          <ScheduleReport
            workorderData={scheduleData}
            requestStates={reportStates.schedule}
            setRequestStates={(newState: any) =>
              debouncedUpdateReportState("schedule", newState)
            }
            refresh={() => refreshTab("schedule")}
          />
        ),
      },
      {
        id: 8,
        title: "Material Planning Report",
        icon: <RiMindMap size={20} />,
        loading: loadingStates["materialPlanning"] || !materialPlanningData,
        stateKey: "materialPlanning",
        component: (
          <MaterialPlanningReport
            workorderData={materialPlanningData}
            requestStates={reportStates.materialPlanning}
            setRequestStates={(newState: any) =>
              debouncedUpdateReportState("materialPlanning", newState)
            }
            refresh={() => refreshTab("materialPlanning")}
          />
        ),
      },
    ],
    [
      stockMasterData,
      requestReportData,
      workorderData,
      itemConsumptionData,
      subStoreStockData,
      workOrderChecklistData,
      mrsReportData,
      scheduleData,
      materialPlanningData,
      TypeData,
      departmentData,
      workorderStatus,
      maintenanceTypeData,
      reportStates,
      debouncedUpdateReportState,
    ]
  );

  const sortedReportData = useMemo(() => {
    if (pinnedTabIds.length === 0) return baseReportData;

    const pinnedReports = pinnedTabIds
      .map((id) => baseReportData.find((report) => report.id === id))
      .filter((report) => report !== undefined) as ReportData[];

    const unpinnedReports = baseReportData.filter(
      (report) => !pinnedTabIds.includes(report.id)
    );

    return [...pinnedReports, ...unpinnedReports];
  }, [baseReportData, pinnedTabIds]);

  const handleChange = (event: any, newValue: number) => {
    setValue(newValue);
  };

  const togglePinTab = useCallback(
    (reportId: number) => {
      setPinnedTabIds((prevPinned) => {
        let newPinnedIds: number[];

        if (prevPinned.includes(reportId)) {
          newPinnedIds = prevPinned.filter((id) => id !== reportId);

          if (sortedReportData[value].id === reportId) {
            const newSortedReports = baseReportData.filter(
              (report) =>
                !newPinnedIds.includes(report.id) || report.id === reportId
            );
            const newIndex = newSortedReports.findIndex(
              (report) => report.id === reportId
            );
            setValue(newPinnedIds.length + newIndex);
          }
        } else {
          newPinnedIds = [...prevPinned, reportId];

          if (sortedReportData[value].id === reportId) {
            setValue(newPinnedIds.length - 1);
          }
        }

        localStorage.setItem("pinnedReportTabs", JSON.stringify(newPinnedIds));
        return newPinnedIds;
      });
    },
    [baseReportData, sortedReportData, value]
  );

  useEffect(() => {
    const horizontalEl = document.querySelector(
      ".ag-body-horizontal-scroll-viewport"
    );
    if (horizontalEl) {
      (horizontalEl as HTMLElement).style.height = "12px";
      (horizontalEl as HTMLElement).style.maxHeight = "12px";
      (horizontalEl as HTMLElement).style.minHeight = "12px";
    }

    const wrapper = document.querySelector(".ag-body-horizontal-scroll");
    if (wrapper) {
      (wrapper as HTMLElement).style.height = "12px";
      (wrapper as HTMLElement).style.maxHeight = "12px";
      (wrapper as HTMLElement).style.minHeight = "12px";
    }
  }, []);

  return (
    <Box>
      <Typography
        variant="h5"
        gutterBottom
        sx={{ fontWeight: 600, color: theme.palette.primary.main, my: 2 }}
      >
        Maintenance Reports
      </Typography>
      <Paper
        elevation={3}
        sx={{
          borderRadius: 2,
          overflow: "hidden",
          backgroundColor: theme.palette.background.paper,
          ".MuiTab-root": { minHeight: "auto !important" },
        }}
      >
        <Box
          sx={{
            borderBottom: 1,
            borderColor: "divider",
            bgcolor: theme.palette.grey[50],
          }}
        >
          <Tabs
            value={value}
            onChange={handleChange}
            variant="scrollable"
            scrollButtons="auto"
            aria-label="report tabs"
            sx={{
              "& .MuiTab-root": {
                minHeight: 64,
                textTransform: "none",
                fontSize: "0.95rem",
                fontWeight: 500,
                color: theme.palette.text.secondary,
                "&.Mui-selected": {
                  color: theme.palette.primary.main,
                  fontWeight: 600,
                },
              },
              "& .MuiTabs-indicator": {
                height: 3,
                borderTopLeftRadius: 3,
                borderTopRightRadius: 3,
              },
            }}
          >
            {sortedReportData.map((report) => (
              <Tab
                key={report.id}
                label={
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      position: "relative",
                      pr: 4,
                    }}
                  >
                    {report.icon}
                    <span>{report.title}</span>
                    {/* {report.loading && (
                      <CircularProgress
                        size={16}
                        thickness={5}
                        sx={{ ml: 1 }}
                      />
                    )} */}
                    <Tooltip
                      title={
                        pinnedTabIds.includes(report.id)
                          ? "Unpin Tab"
                          : "Pin as Favorite"
                      }
                    >
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          togglePinTab(report.id);
                        }}
                        sx={{
                          position: "absolute",
                          right: -8,
                          color: pinnedTabIds.includes(report.id)
                            ? theme.palette.warning.main
                            : theme.palette.action.active,
                        }}
                      >
                        {pinnedTabIds.includes(report.id) ? "📌" : "📍"}
                      </IconButton>
                    </Tooltip>
                  </Box>
                }
              />
            ))}
          </Tabs>
        </Box>
        {sortedReportData.map((report, index) => (
          <TabPanel key={report.id} value={value} index={index}>
            {report.component}
          </TabPanel>
        ))}
      </Paper>
    </Box>
  );
}
