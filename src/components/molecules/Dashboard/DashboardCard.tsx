import React from "react";
import {
  alpha,
  Avatar,
  Box,
  Card,
  CardContent,
  Grid2,
  Typography,
} from "@mui/material";
import { GoClockFill } from "react-icons/go";
import { FaTools } from "react-icons/fa";
import { HiTrendingDown } from "react-icons/hi";
import { IoMdCart } from "react-icons/io";
import { PiNotepadFill } from "react-icons/pi";
import { GiProgression } from "react-icons/gi";
import { BsPatchCheckFill } from "react-icons/bs";
import Link from "next/link";


const StatCard = ({
  title,
  value,
  icon: Icon,
  color,
  trend,
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  trend:any
}) => {
  const styleVars = {
    "--bg-start": `${color}15`,
    "--bg-end": `${color}05`,
    "--border-color": alpha(color, 0.1),
    "--before-start": `${color}20`,
    "--before-mid": `${color}50`,
    "--before-end": `${color}`,
    "--after-start": alpha(color, 0.6),
    "--after-mid": alpha("#ffffff", 0.4),
    "--after-end": alpha(color, 0.6),
  } as React.CSSProperties;

  return (
    <Card className="card" style={styleVars} sx={{ borderRadius: "16px", transition: "all 0.5s ease" }}>
      <CardContent sx={{ p: 3 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Typography variant="h5" fontWeight="bold" color={color}>
            {value}
          </Typography>
          <Avatar sx={{ bgcolor: alpha(color, 0.1), width: 56, height: 56 }}>
            <Icon size={28} color={color} />
          </Avatar>
        </Box>
        <Typography variant="h6" fontWeight={600} sx={{ mt: 2 }}>
          {title}
        </Typography>
      </CardContent>
    </Card>
  );
};


const cardConfig = [
  {
    title: "Total Schedules",
    key: "totalSchedules",
    icon: <GoClockFill color="#1976d2" size={28} />,
    color: "#1976d2",
    bg: "#e3f2fd",
    format: (v: any) => v?.toLocaleString(),
    change: null,
    value: 1464,
    link: "/maintanence/schedule-list",
  },
  {
    title: "Maintenance Hours",
    key: "maintenanceHrs",
    icon: <FaTools color="#388e3c" size={28} />,
    color: "#388e3c",
    bg: "#e8f5e9",
    format: (v: any) =>
      v?.toLocaleString(undefined, { maximumFractionDigits: 2 }),
    change: null,
    value: 320.23,
  },
  {
    title: "Downtime Hours",
    key: "downtimeHrs",
    icon: <HiTrendingDown color="#fbc02d" size={28} />,
    color: "#fbc02d",
    bg: "#fffde7",
    format: (v: any) =>
      v?.toLocaleString(undefined, { maximumFractionDigits: 2 }),
    change: null,
    value: 320.21,
  },
  {
    title: "Item Consumption Value",
    key: "consumptionValue",
    icon: <IoMdCart color="#d32f2f" size={28} />,
    color: "#d32f2f",
    bg: "#ffebee",
    format: (v: any) =>
      `₹${v?.toLocaleString(undefined, { maximumFractionDigits: 2 })}`,
    change: null,
    value: 163259.67,
  },
  {
    title: "Open Work Orders",
    key: "openWorkOrder",
    icon: <PiNotepadFill color="#0288d1" size={28} />,
    color: "#0288d1",
    bg: "#e1f5fe",
    format: (v: any) => v?.toLocaleString(),
    change: null,
    value: 659,
    link: "/maintanence/work-order",
  },
  {
    title: "In Progress Work Orders",
    key: "inProgressWorkOrder",
    icon: <GiProgression color="#7b1fa2" size={28} />,
    color: "#7b1fa2",
    bg: "#f3e5f5",
    format: (v: any) => v?.toLocaleString(),
    change: null,
    value: 32,
    link: "/maintanence/work-order",
  },
  {
    title: "Closed Work Orders",
    key: "closedWorkOrder",
    icon: <BsPatchCheckFill color="#388e3c" size={28} />,
    color: "#388e3c",
    bg: "#e8f5e9",
    format: (v: any) => v?.toLocaleString(),
    change: null,
    value: 198,
    link: "/maintanence/work-order",
  },
];

function DashboardCard({ data }: any) {
  const mockData = cardConfig.reduce((acc: any, item) => {
    acc[item.key] = item.value;
    return acc;
  }, {});

  const displayData = data || mockData;

  return (
    <Box p={2} bgcolor={"#fff"} borderRadius={"0 0 12px 12px"}>
      <Grid2 container spacing={3}>
        {Array.isArray(cardConfig) &&
          cardConfig.map((item, idx) => (
            <Grid2
              size={{ xs: 12, sm: 6, md: 4, lg: 3 }}
              key={idx}
              sx={{
                WebkitBackdropFilter: "blur(15px)",
                backdropFilter: "blur(5px)",
                border: "1px solid rgba(255,255,255,0.15)",
                position: "relative",
                zIndex: 6,
                borderRadius: 3,
              }}
              component={"div"}
              className="card-container"
            >
              <Link href={item?.link ? item?.link : ""}>
                <StatCard
                  title={item.title}
                  value={
                    item.format
                      ? item.format(displayData[item.key])
                      : displayData[item.key]
                  }
                  icon={() => item.icon}
                  color={item.color}
                  trend={item.change}
                />
              </Link>
            </Grid2>
          ))}
      </Grid2>
    </Box>
  );
}

export default DashboardCard;
