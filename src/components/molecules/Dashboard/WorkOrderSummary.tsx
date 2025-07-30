"use client";

import React from "react";
import { Paper } from "@mui/material";
import { styled } from "@mui/material/styles";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: 12,
  boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
  border: "1px solid #f0f0f0",
}));

const WorkOrderSummaryChart = ({ data }: any) => {
  const chartOptions = {
    chart: {
      type: "bar",
      height: 320,
      backgroundColor: "transparent",
    },
    title: {
      text: "Work Order Summary",
      style: {
        fontFamily: "Poppins, sans-serif",
        fontWeight: "600",
        fontSize: "16px",
        color: "#333",
      },
    },
    xAxis: {
      categories: data?.categories,
      gridLineWidth: 0,
      lineWidth: 0,
      tickWidth: 0,
    },
    yAxis: {
      title: { text: null },
      gridLineWidth: 1,
      gridLineColor: "#f0f0f0",
      labels: {
        formatter: function (this: any) {
          return this.value;
        },
      },
    },
    legend: {
      enabled: true,
      layout: "horizontal",
      align: "center",
      verticalAlign: "bottom",
      itemStyle: {
        fontFamily: "Poppins, sans-serif",
        fontWeight: "500",
        fontSize: "12px",
      },
    },
    plotOptions: {
      series: {
        dataLabels: {
          enabled: true,
          style: {
            fontWeight: "bold",
            fontFamily: "Poppins, sans-serif",
          },
        },
      },
      area: {
        fillOpacity: 0.3,
        marker: {
          enabled: false,
          states: {
            hover: {
              enabled: true,
              radius: 5,
            },
          },
        },
      },
    },
    series: data?.series,
    credits: {
      enabled: false,
    },
  };

  return (
    <StyledPaper sx={{ bgcolor: "#ffffff9e" }}>
      <HighchartsReact highcharts={Highcharts} options={chartOptions} />
    </StyledPaper>
  );
};

export default WorkOrderSummaryChart;
