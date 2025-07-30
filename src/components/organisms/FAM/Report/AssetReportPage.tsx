"use client";

import { useState, useEffect, JSX } from "react";
import {
  Box,
  Tabs,
  Tab,
  Typography,
  Paper,
  Fade,
  useTheme,
  IconButton,
  Tooltip,
} from "@mui/material";
import { FiShoppingBag, FiRepeat, FiClipboard } from "react-icons/fi";
import { useDataFetchHook } from "../../../../hooks/useDataFetchHook";
import FamConfig from "../../../../utils/fam.api.json";
import AssetPage from "./AssetPage";
import dayjs from "dayjs";
import TransferPage from "./TransferPage";
import AuditReport from "./AuditReport";
import { Apirequest } from "../../../../utils/lib";
import { MdOutlineRestartAlt } from "react-icons/md";

function TabPanel(props: any) {
  const { children, value, index, ...other } = props;
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

interface ReportTabConfig {
  id: number;
  title: string;
  icon: JSX.Element;
  getData: (args: {
    dateRange: { startDate: dayjs.Dayjs | null; endDate: dayjs.Dayjs | null };
    refreshKey: number;
  }) => any;
  PageComponent: React.ComponentType<any>;
}

const defaultTabDateRanges = [
  {
    startDate: null,
    endDate: null,
  },
  {
    startDate: dayjs(new Date()).subtract(1, "month"),
    endDate: dayjs(new Date()),
  },
  {
    startDate: null,
    endDate: null,
  },
];

const REPORT_TABS: ReportTabConfig[] = [
  {
    id: 0,
    title: "Asset Report",
    icon: <FiShoppingBag size={20} />,
    getData: ({ dateRange, refreshKey }) => {
      const { startDate, endDate } = dateRange;
      const endpoint =
        !startDate || !endDate
          ? FamConfig.Report.AssetReport.endpoint
          : FamConfig.Report.AssetReportWithDate.endpoint
              .replace("{from}", dayjs(startDate).format("YYYY-MM-DD"))
              .replace("{to}", dayjs(endDate).format("YYYY-MM-DD"));
      return useDataFetchHook(
        endpoint,
        FamConfig.Report.AssetReport.method,
        "fam",
        refreshKey
      );
    },
    PageComponent: AssetPage,
  },
  {
    id: 1,
    title: "Transfer Report",
    icon: <FiRepeat size={20} />,
    getData: ({ dateRange, refreshKey }) =>
      useDataFetchHook(
        FamConfig.Report.TransferReport.endpoint
          .replace(
            "{from}",
            dateRange.startDate
              ? dayjs(dateRange.startDate).format("YYYY-MM-DD")
              : ""
          )
          .replace(
            "{to}",
            dateRange.endDate
              ? dayjs(dateRange.endDate).format("YYYY-MM-DD")
              : ""
          ),
        FamConfig.Report.TransferReport.method,
        "fam",
        refreshKey
      ),
    PageComponent: TransferPage,
  },
  {
    id: 2,
    title: "Audit Report",
    icon: <FiClipboard size={20} />,
    getData: () => ({}),
    PageComponent: AuditReport,
  },
];

export default function AssetReportPage() {
  const theme = useTheme();
  const [value, setValue] = useState(0);
  const [pinnedTabIds, setPinnedTabIds] = useState<number[]>([]);
  const [auditMainData, setAuditMainData] = useState<number[]>([]);
  const [selectedAudit, setSelectedAudit] = useState<any>(null);
  const [refreshKeys, setRefreshKeys] = useState<number[]>(
    REPORT_TABS.map(() => 0)
  );
  const [dateRanges, setDateRanges] = useState([
    {
      startDate: null,
      endDate: null,
    },
    {
      startDate: dayjs(new Date()).subtract(1, "month"),
      endDate: dayjs(new Date()),
    },
    {
      startDate: null,
      endDate: null,
    },
  ]);

  const GetAuditReport = async () => {
    try {
      const { endpoint, method } = FamConfig.Report.AuditReport;
      const response = await Apirequest(
        endpoint.replace("{id}", selectedAudit?.id),
        method,
        null,
        "fam"
      ).then((res) => res.data);
      const { statusCode, data } = response;
      if (statusCode === 200 || statusCode === 201) {
        setAuditMainData(data);
      } else {
        setAuditMainData([]);
      }
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    selectedAudit && GetAuditReport();
  }, [selectedAudit]);

  useEffect(() => {
    const savedPinnedTabs = localStorage.getItem("assetPinnedReportTabs");
    if (savedPinnedTabs !== null) {
      try {
        setPinnedTabIds(JSON.parse(savedPinnedTabs));
      } catch (e) {
        localStorage.removeItem("assetPinnedReportTabs");
      }
    }
  }, []);

  const { data: auditData } = useDataFetchHook(
    FamConfig.Uom.Misc.endpoint.replace("{type}", "AUDITPERIOD"),
    FamConfig.Uom.Misc.method,
    "fam"
  );

  const getSortedTabs = () => {
    if (pinnedTabIds.length === 0) return REPORT_TABS;
    const pinned = pinnedTabIds
      .map((id) => REPORT_TABS.find((tab) => tab.id === id))
      .filter(Boolean) as ReportTabConfig[];
    const unpinned = REPORT_TABS.filter(
      (tab) => !pinnedTabIds.includes(tab.id)
    );
    return [...pinned, ...unpinned];
  };

  const sortedTabs = getSortedTabs();

  const handleChange = (_: any, newValue: number) => setValue(newValue);

  const togglePinTab = (reportId: number) => {
    let newPinnedIds: number[];
    if (pinnedTabIds.includes(reportId)) {
      newPinnedIds = pinnedTabIds.filter((id) => id !== reportId);
    } else {
      newPinnedIds = [...pinnedTabIds, reportId];
    }
    setPinnedTabIds(newPinnedIds);
    localStorage.setItem("assetPinnedReportTabs", JSON.stringify(newPinnedIds));
  };

  const handleDateRangeChange = (tabIdx: number, newRange: any) => {
    setDateRanges((prev) =>
      prev.map((range, idx) => (idx === tabIdx ? newRange : range))
    );
    setRefreshKeys((prev) =>
      prev.map((key, idx) => (idx === tabIdx ? key + 1 : key))
    );
  };

  const handleTabReset = (tabIdx: number) => {
    if (tabIdx === 2) {
      setSelectedAudit(null);
      setAuditMainData([]);
    } else {
      setDateRanges((prev) =>
        prev.map((range, idx) =>
          idx === tabIdx ? defaultTabDateRanges[tabIdx] : range
        )
      );
    }
    setRefreshKeys((prev) =>
      prev.map((key, idx) => (idx === tabIdx ? key + 1 : key))
    );
  };

  return (
    <Box>
      <Typography
        variant="h5"
        gutterBottom
        sx={{
          fontWeight: 600,
          color: theme.palette.primary.main,
          my: 2,
        }}
      >
        Asset Reports
      </Typography>

      <Paper
        elevation={3}
        sx={{
          borderRadius: 2,
          overflow: "hidden",
          backgroundColor: theme.palette.background.paper,
          ".MuiTab-root": {
            minHeight: "auto !important",
          },
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
            {sortedTabs.map((tab, idx) => (
              <Tab
                key={tab.id}
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
                    {tab.icon}
                    <span>{tab.title}</span>
                    <Tooltip
                      title={
                        pinnedTabIds.includes(tab.id)
                          ? "Unpin Tab"
                          : "Pin as Favorite"
                      }
                    >
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          togglePinTab(tab.id);
                        }}
                        sx={{
                          position: "absolute",
                          right: -8,
                          color: pinnedTabIds.includes(tab.id)
                            ? theme.palette.warning.main
                            : theme.palette.text.disabled,
                          "&:hover": {
                            backgroundColor: "transparent",
                            color: pinnedTabIds.includes(tab.id)
                              ? theme.palette.warning.dark
                              : theme.palette.text.primary,
                          },
                        }}
                      >
                        {pinnedTabIds.includes(tab.id) ? "📌" : "📍"}
                      </IconButton>
                    </Tooltip>
                  </Box>
                }
                id={`report-tab-${tab.id}`}
                aria-controls={`report-tabpanel-${tab.id}`}
              />
            ))}
          </Tabs>
        </Box>

        {sortedTabs.map((tab, idx) => {
          const origIdx = REPORT_TABS.findIndex((t) => t.id === tab.id);
          const { data, loading } = tab.getData({
            dateRange: dateRanges[origIdx],
            refreshKey: refreshKeys[origIdx],
          });

          return (
            <TabPanel key={tab.id} value={value} index={idx}>
              <Box
                display="flex"
                justifyContent="flex-end"
                alignItems="center"
                mb={1}
                position={"relative"}
              >
                <Tooltip title="Refresh Report">
                  <IconButton
                    onClick={() => handleTabReset(origIdx)}
                    sx={{
                      background: "#3a8484 !important",
                      p: "4px",
                      position: "absolute",
                      top: 10,
                    }}
                  >
                    <MdOutlineRestartAlt color="#fff" size={20} />
                  </IconButton>
                </Tooltip>
              </Box>

              <Box>
                {tab.id === 2 ? (
                  <AuditReport
                    auditData={auditData}
                    selectedAudit={selectedAudit}
                    setSelectedAudit={setSelectedAudit}
                    assetReportData={auditMainData}
                  />
                ) : (
                  <tab.PageComponent
                    assetReportData={data}
                    dateRange={dateRanges[origIdx]}
                    setDateRange={(range: any) =>
                      handleDateRangeChange(origIdx, range)
                    }
                    loading={loading}
                  />
                )}
              </Box>
            </TabPanel>
          );
        })}
      </Paper>
    </Box>
  );
}
