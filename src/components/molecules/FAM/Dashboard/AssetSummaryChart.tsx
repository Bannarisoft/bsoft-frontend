import React, { useCallback, useMemo, useState } from "react";
import { Box, Button, Paper, styled, Typography } from "@mui/material";
import ReactECharts from "echarts-for-react";
export const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: 16,
  boxShadow: "0 6px 20px rgba(0,0,0,0.06)",
  border: "1px solid #eee",
  background: "#ffffff9e",
}));
interface Props {
  data: {
    categories?: string[];
    series?: { name: string; data: number[] }[];
  };
  onDrilldownFetch?: (
    payload: any,
    level: number
  ) => Promise<{
    categories: string[];
    series: { name: string; data: number[] }[];
  }>;
}
const AssetSummaryChart: React.FC<Props> = ({ data, onDrilldownFetch }) => {
  const [drillStack, setDrillStack] = useState<
    {
      title: string;
      categories: string[];
      series: { name: string; data: number[] }[];
      payload?: any;
    }[]
  >([]);
  const currentLevel = drillStack.length;
  const currentCategories = useMemo(() => {
    if (currentLevel === 0) return data?.categories || [];
    return drillStack[currentLevel - 1]?.categories || [];
  }, [data, drillStack, currentLevel]);

  const currentSeries = useMemo(() => {
    if (currentLevel === 0) return data?.series || [];
    return drillStack[currentLevel - 1]?.series || [];
  }, [data, drillStack, currentLevel]);
  const currentTitle =
    currentLevel === 0 ? "Asset Summary" : drillStack[currentLevel - 1]?.title;
  const getOption = useMemo((): echarts.EChartsOption => {
    return {
      title: {
        text: currentTitle,
        left: "center",
      },
      tooltip: {
        trigger: "axis",
        axisPointer: { type: "shadow" },
      },
      xAxis: {
        type: "category",
        data: currentCategories.map((name) =>
          name.replace(/-\s*\d+$/, "").trim()
        ),
        axisLabel: {
          interval: 0,
          rotate: 20,
          fontSize: 10,
        },
      },
      yAxis: {
        type: "value",
        name: "",
        nameLocation: "middle",
        nameGap: 35,
        nameTextStyle: {
          fontSize: 14,
          fontWeight: "bold",
          fontFamily: "poppins",
        },
      },
      series: currentSeries.map((s, i) => ({
        name: s.name,
        type: "bar",
        stack: "total",
        barGap: 0.2,
        label: {
          show: true,
          position: "top",
        },
        itemStyle: {
          borderRadius: [4, 4, 0, 0],
          color:
            i === 0
              ? "#3a7bd5" 
              : "#a8e063", 
        },
        data: s.data,
      })),
    };
  }, [currentCategories, currentSeries, currentTitle]);

  const handleChartClick = useCallback(
    async (params: any) => {
      const clickedIndex = params.dataIndex;
      const clickedName = currentCategories[clickedIndex];
      const payload = {
        name: clickedName,
        ...drillStack[currentLevel - 1]?.payload,
      };

      if (!onDrilldownFetch) return;

      const response = await onDrilldownFetch(payload, currentLevel + 1);
      if (
        response?.categories?.length &&
        response.series?.length &&
        response.series.length >= 2
      ) {
        setDrillStack((prev) => [
          ...prev,
          {
            title: `${clickedName}`,
            categories: response.categories,
            series: response.series,
            payload: {
              dept: payload.name,
              group: response.categories[clickedIndex],
            },
          },
        ]);
      }
    },
    [currentLevel, currentCategories, onDrilldownFetch, drillStack]
  );
  return (
    <StyledPaper>
      <Typography
        variant="h6"
        mb={2}
        fontWeight={600}
        fontSize={16}
        fontFamily={"poppins"}
      >
        {currentTitle}
      </Typography>
      <ReactECharts
        option={getOption}
        style={{ height: 400 }}
        onEvents={{ click: handleChartClick }}
      />

    
    </StyledPaper>
  );
};

export default AssetSummaryChart;
