"use client";

import React, { useCallback, useMemo, useState } from "react";
import { Typography, Paper, Box, styled, Button } from "@mui/material";
import ReactECharts from "echarts-for-react";

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: 16,
  boxShadow: "0 6px 20px rgba(0,0,0,0.06)",
  border: "1px solid #eee",
  background: "#ffffff9e",
}));

interface ChartSeries {
  name: string;
  data: number[];
}

interface ChartData {
  categories?: string[];
  series?: ChartSeries[];
}

interface Props {
  data: ChartData;
  onDrilldownFetch?: (
    payload: any,
    level: number
  ) => Promise<{
    categories: string[];
    series: ChartSeries[];
  }>;
}

const AssetExpirySummaryChart: React.FC<Props> = ({ data, onDrilldownFetch }) => {
  const [drillStack, setDrillStack] = useState<
    {
      title: string;
      categories: string[];
      series: ChartSeries[];
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
    currentLevel === 0 ? "Asset Expiry Summary" : drillStack[currentLevel - 1]?.title;

  const options = useMemo(() => ({
    animation: true,
    animationDuration: 600,
    animationEasing: "cubicOut",
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
        label: { backgroundColor: '#6a7985' },
      },
    },
    legend: {
      top: 10,
      data: currentSeries.map((s) => s.name),
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: currentCategories,
      axisLabel: { rotate: 30 },
    },
    yAxis: {
      type: 'value',
    },
    series: currentSeries.map((s: ChartSeries) => ({
      name: s.name,
      data: s.data,
      type: 'line',
      stack: 'Total',
      areaStyle: {},       
      smooth: true,            
      emphasis: { focus: 'series' },
    })),
  }), [currentCategories, currentSeries]);

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
        fontFamily="Poppins"
      >
        {currentTitle}
      </Typography>

      <ReactECharts
        option={options}
        style={{ height: 400 }}
        onEvents={{ click: handleChartClick }}
      />

    </StyledPaper>
  );
};

export default AssetExpirySummaryChart;
