"use client";

import React, { useEffect, useState } from "react";
import DashboardCard from "../../molecules/Dashboard/DashboardCard";
import { Box, Grid2, Skeleton } from "@mui/material";
import { Apirequest } from "../../../utils/lib";
import MainConfig from "../../../../src/utils/main.api.json";
import Config from "../../../../src/utils/config.api.json";
import TopConsumptionTable from "../../molecules/Dashboard/TopConsumptionTable";
import WorkOrderSummaryChart from "../../molecules/Dashboard/WorkOrderSummary";
import MachineHoursChart from "../../molecules/Dashboard/MachineHoursChart";
import dayjs from "dayjs";
import DashboardFilter from "../../molecules/Dashboard/DashboardFilter";
import { useDataFetchHook } from "../../../hooks/useDataFetchHook";
import DrilldownPieChart from "../../molecules/Dashboard/DrilldownPieChart";
interface DashboardApiProps {
  endpoint: string;
  from: string;
  to: string;
  dept?: string;
  group?: string;
  item?: string;
  type?: string;
}

interface CardDataType {
  fromDate: string | null;
  toDate: string | null;
  dept: string | null;
  group: string | null;
  item: string | null;
  type: string | null;
  data: {
    topConsumptions?: any[];
    [key: string]: any;
  };
}

function DashboardPage() {
  const [workOrderSummary, setWorkOrderSummary] = useState<CardDataType>({
    fromDate: null,
    toDate: null,
    dept: null,
    group: null,
    item: null,
    type: null,
    data: {},
  });
  const [cardData, setCardData] = useState<CardDataType>({
    fromDate: null,
    toDate: null,
    dept: null,
    group: null,
    item: null,
    type: null,
    data: {},
  });
  const [itemConsumption, setItemConsumption] = useState<CardDataType>({
    fromDate: null,
    toDate: null,
    dept: null,
    group: null,
    item: null,
    type: null,
    data: {},
  });
  const [maintanenceHrs, setMaintanenceHrs] = useState<CardDataType>({
    fromDate: null,
    toDate: null,
    dept: null,
    group: null,
    item: null,
    type: null,
    data: {},
  });

  const [filters, setFilters] = useState({
    department: null as any,
    group: "",
    from: dayjs(new Date()).subtract(1, "month").format("YYYY-MM-DD"),
    to: dayjs(new Date()).format("YYYY-MM-DD"),
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const { data: departmentData } = useDataFetchHook(
    Config.Department.departmentGroupName.endpoint.replace(
      "{name}",
      "maintenance"
    ),
    Config.Department.departmentGroupName.method
  );

  const { data: machineGroupData } = useDataFetchHook(
    MainConfig.Dashboard.GetAllItems.endpoint
      .replace("{oldUnitId}", "02")
      .replace("{dept}", filters.department?.id),
    MainConfig.Dashboard.GetAllItems.method,
    "main"
  );

  const GetDashboardData = async ({
    endpoint,
    from,
    to,
    dept,
    group,
    item,
    type,
  }: DashboardApiProps) => {
    try {
      const response = await Apirequest(
        endpoint
          .replace("{from}", from)
          .replace("{to}", to)
          .replace("{dept}", dept || "")
          .replace("{group}", group || "")
          .replace("{item}", item || "")
          .replace("{type}", type || ""),
        "GET",
        null,
        "main"
      ).then((res) => res.data);
      return response;
    } catch (err) {
      console.log(err);
    }
  };

  const WorkOrderSummary = async (customFilters = filters) => {
    const { endpoint } = MainConfig.Dashboard.WorkOrderSummary;
    const data = await GetDashboardData({
      endpoint,
      from: customFilters.from,
      to: customFilters.to,
      dept: customFilters.department?.id,
      group: customFilters.group,
    });
    setWorkOrderSummary((prev) => ({ ...prev, data }));
  };

  const DashboardCards = async (customFilters = filters) => {
    const { endpoint } = MainConfig.Dashboard.Cards;
    const data = await GetDashboardData({
      endpoint,
      from: customFilters.from,
      to: customFilters.to,
      dept: customFilters.department?.id,
      group: customFilters.group,
    });
    setCardData((prev) => ({ ...prev, data }));
  };

  const ItemConsumption = async (customFilters = filters) => {
    const { endpoint } = MainConfig.Dashboard.ItemConsumption;
    const data = await GetDashboardData({
      endpoint,
      from: customFilters.from,
      to: customFilters.to,
      dept: customFilters.department?.id,
      group: customFilters.group,
    });
    setItemConsumption((prev) => ({ ...prev, data }));
  };

  const MaintanenceHours = async (customFilters = filters) => {
    const { endpoint } = MainConfig.Dashboard.MaintanenceHoursDept;
    const data = await GetDashboardData({
      endpoint,
      from: customFilters.from,
      to: customFilters.to,
      dept: customFilters.department?.id,
    });
    setMaintanenceHrs((prev) => ({ ...prev, data }));
  };

  const handleDrilldownFetch = async (
    payload: any,
    level: number
  ): Promise<{
    categories: string[];
    series: { name: string; data: number[] }[];
  }> => {
    let endpoint = "";
    let dept = "";
    let group = "";

    if (level === 1) {
      endpoint = MainConfig.Dashboard.MaintanenceHours.endpoint;
      dept =
        (typeof payload?.name === "string" &&
          payload?.name?.split("-")?.at(-1)) ||
        "";
      group = "";
    } else if (level === 2) {
      endpoint = MainConfig.Dashboard.MaintanenceHours.endpoint;
      dept = payload?.dept?.split("-")?.at(-1) || "";
      group = payload?.group?.split("-")?.at(-1) || "";
    } else {
      return { categories: [], series: [] };
    }

    const data = await GetDashboardData({
      endpoint,
      from: filters.from,
      to: filters.to,
      dept,
      group,
    });

    return {
      categories: Array.isArray(data?.categories) ? data.categories : [],
      series: Array.isArray(data?.series) ? data.series : [],
    };
  };

  const handleFilterApply = (newFilters: typeof filters) => {
    setFilters(newFilters);
    loadDashboardData(newFilters);
  };

  const loadDashboardData = async (customFilters = filters) => {
    setIsLoading(true);
    try {
      await Promise.all([
        DashboardCards(customFilters),
        WorkOrderSummary(customFilters),
        ItemConsumption(customFilters),
        MaintanenceHours(customFilters),
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData(filters);
  }, []);

  useEffect(() => {
    if (departmentData && departmentData.length > 0 && !filters.department) {
      const sorted = [...departmentData].sort((a, b) =>
        String(b.code).localeCompare(String(a.code))
      );
      setFilters((prev) => ({ ...prev, department: sorted[0] }));
    }
  }, [departmentData]);

  return (
    <Box px={2} sx={{ fontFamily: "poppins !important" }}>
      {isLoading ? (
        <Grid2 container spacing={2}>
          {[...Array(8)].map((_, li) => (
            <Grid2 size={{ xs: 3 }} key={li}>
              <Skeleton
                variant="rectangular"
                width="100%"
                height={180}
                sx={{ borderRadius: "12px" }}
              />
            </Grid2>
          ))}
          {[0, 1].map((li) => (
            <Grid2 size={{ xs: 6 }} key={li}>
              <Skeleton
                variant="rectangular"
                width="100%"
                height={420}
                sx={{ borderRadius: "12px" }}
              />
            </Grid2>
          ))}
        </Grid2>
      ) : (
        <Box>
          <DashboardFilter
            departmentData={departmentData}
            filters={filters}
            setFilters={setFilters}
            handleChange={handleChange}
            machineGroupData={machineGroupData}
            onApply={handleFilterApply}
          />
          <DashboardCard data={cardData.data} />
          <Grid2 container spacing={2} my={3}>
            <Grid2 size={{ xs: 12, sm: 12, md: 6 }}>
              <MachineHoursChart
                data={{
                  categories: maintanenceHrs.data.categories || [],
                  series: maintanenceHrs.data.series || [],
                }}
                onDrilldownFetch={handleDrilldownFetch}
              />
              <Box my={2}>
                <TopConsumptionTable cardData={cardData.data.topConsumptions} />
              </Box>
            </Grid2>
            <Grid2 size={{ xs: 12, sm: 12, md: 6 }}>
              <WorkOrderSummaryChart data={workOrderSummary.data} />
              <Box my={2}>
                <DrilldownPieChart filters={filters} />
              </Box>
            </Grid2>
          </Grid2>
        </Box>
      )}
    </Box>
  );
}

export default DashboardPage;
