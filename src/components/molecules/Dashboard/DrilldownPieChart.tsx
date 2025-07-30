"use client";

import React, { useEffect, useState } from "react";
import ReactECharts from "echarts-for-react";
import { Box, Button } from "@mui/material";
import dayjs from "dayjs";
import { Apirequest } from "../../../utils/lib";
import { StyledPaper } from "./MachineHoursChart";
import MainConfig from "../../../../src/utils/main.api.json";

interface ChartData {
  categories: string[];
  series: { name: string; data: number[] }[];
}

interface DrillMeta {
  label: string;
  deptId?: string;
  groupId?: string;
}

interface FiltersProps {
  from: string;
  to: string;
  department: { id: string } | null;
  group: string;
}

interface DataPoint {
  label: string; // e.g., "Mechanical"
  id: string; // e.g., "2"
  value: number;
}

const DrilldownPieChart = ({ filters }: { filters: FiltersProps }) => {
  const [level, setLevel] = useState(0);
  const [title, setTitle] = useState("Item Consumption Overview");
  const [drillMeta, setDrillMeta] = useState<DrillMeta>({ label: "" });
  const [chartData, setChartData] = useState<DataPoint[]>([]);

  const fetchDeptData = async () => {
    const { endpoint, method } = MainConfig.Dashboard.itemConsumptionByDept;
    const res = await Apirequest(
      endpoint.replace("{from}", filters.from).replace("{to}", filters.to),
      method,
      null,
      "main"
    );
    const formatted = res.data.categories.map((cat: string, i: number) => {
      const [label, id] = cat.split("-").map((s: string) => s.trim());
      return {
        label,
        id,
        value: res.data.series[0]?.data[i] ?? 0,
      };
    });
    setChartData(formatted);
    setLevel(0);
    setTitle("Item Consumption Overview");
    setDrillMeta({ label: "" });
  };

  const fetchMachineGroupData = async (deptId: string, deptName: string) => {
    const { endpoint, method } = MainConfig.Dashboard.itemConsumptionByGroup;
    const res = await Apirequest(
      endpoint
        .replace("{from}", filters.from)
        .replace("{to}", filters.to)
        .replace("{dept}", deptId),
      method,
      null,
      "main"
    );
    const formatted = res.data.categories.map((cat: string, i: number) => {
      const [label, id] = cat.split("-").map((s: string) => s.trim());
      return {
        label,
        id,
        value: res.data.series[0]?.data[i] ?? 0,
      };
    });
    setChartData(formatted);
    setLevel(1);
    setTitle(`${deptName} - Machine Groups`);
    setDrillMeta({ label: deptName, deptId });
  };

  const handleChartClick = (params: any) => {
    const clicked = chartData.find((d) => d.label === params.name);
    if (!clicked) return;

    if (level === 0) {
      fetchMachineGroupData(clicked.id, clicked.label);
    }
  };

  const handleBack = () => {
    if (level === 2 && drillMeta.deptId) {
      fetchMachineGroupData(drillMeta.deptId, drillMeta.label);
    } else if (level === 1) {
      fetchDeptData();
    }
  };

  const getChartOption = (): echarts.EChartsOption => {
    const colors = [
      "#1976d2",
      "#4FC3F7",
      "#FFCA28",
      "#F44336",
      "#AED581",
      "#BA68C8",
      "#FFEB3B",
      "#81C784",
      "#009688",
      "#FF8A65",
      "#9C27B0",
      "#90A4AE",
      "#00ACC1",
      "#F06292",
      "#8D6E63",
    ];

    return {
      title: {
        text: title,
        left: "center",
        top: 0,
        textStyle: {
          fontSize: 16,
          fontWeight: 600,
          overflow: "break",
        },
      },
      tooltip: {
        trigger: "item",
        formatter: "{b}: {c} ({d}%)",
      },
      legend: {
        show: true,
        orient: "vertical",
        left: "right",
        top: "middle",
        type: "scroll",
      },
      animationDuration: 600,
      animationEasing: "cubicOut",
      series: [
        {
          name: "Consumption",
          type: "pie",
          radius: ["40%", "80%"],
          label: {
            show: true,
            formatter: ({ name, value, percent }: any) =>
              `${name}\n${value} (${percent}%)`,
            fontSize: 12,
            fontWeight: 500,
          },
          labelLine: {
            length: 10,
            length2: 10,
          },
          universalTransition: true,
          data: chartData.map((point, i) => ({
            name: point.label,
            value: point.value,
            itemStyle: {
              color: colors[i % colors.length],
            },
          })),
        },
      ],
    };
  };

  useEffect(() => {
    fetchDeptData();
  }, [filters.from, filters.to]);

  return (
    <StyledPaper>
      {level > 0 && (
        <Box mb={2} textAlign="left">
          <Button
            onClick={handleBack}
            variant="outlined"
            sx={{ fontWeight: 600 }}
          >
            ⬅ Back
          </Button>
        </Box>
      )}
      <ReactECharts
        option={getChartOption()}
        onEvents={{ click: handleChartClick }}
        style={{ height: 450 }}
      />
    </StyledPaper>
  );
};

export default DrilldownPieChart;
