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
import {
  MdAccountBalance,
  MdAddBox,
  MdAddShoppingCart,
  MdBarChart,
  MdDeleteSweep,
} from "react-icons/md";
const StatCard = ({
  title,
  value,
  icon: Icon,
  color,
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
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
    title: "Total Assets",
    key: "totalAssets",
    icon: MdBarChart,
    color: "#1976d2",
    bg: "#e3f2fd",
    format: (v: any) => v?.toLocaleString(),
    change: null,
  },
  {
    title: "Total Asset Value",
    key: "totalAssetValue",
    icon: MdAccountBalance,
    color: "#d32f2f",
    bg: "#ffebee",
    format: (v: any) =>
      `₹${v?.toLocaleString(undefined, { maximumFractionDigits: 2 })}`,
    change: null,
  },
  {
    title: "New Assets",
    key: "newAssets",
    icon: MdAddBox,
    color: "#388e3c",
    bg: "#e8f5e9",
    format: (v: any) =>
      v?.toLocaleString(undefined, { maximumFractionDigits: 2 }),
    change: null,
  },
  {
    title: "New Assets Value",
    key: "newAssetsValue",
    icon: MdAddShoppingCart,
    color: "#fbc02d",
    bg: "#fffde7",
    format: (v: any) =>
      v?.toLocaleString(undefined, { maximumFractionDigits: 2 }),
    change: null,
  },
  {
    title: "Asset Disposed",
    key: "assetDisposed",
    icon: MdDeleteSweep,
    color: "#0288d1",
    bg: "#e1f5fe",
    format: (v: any) => v?.toLocaleString(),
    change: null,
  },
];

const FamDashboardCard = ({ data }: any) => {
  const mockData = cardConfig.reduce((acc: any, item) => {
    return acc;
  }, {});

  const displayData = data || mockData;
  return (
    <Box p={2} bgcolor={"#fff"} borderRadius={3}>
      <Grid2 container spacing={3}>
        {Array.isArray(cardConfig) &&
          cardConfig.map((item, idx) => (
            <Grid2
              size={{ xs: 12, sm: 6, md: 2.4, lg: 2.4 }}
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
              <StatCard
                title={item.title}
                value={
                  item.format
                    ? item.format(displayData[item.key])
                    : displayData[item.key]
                }
                icon={item.icon}
                color={item.color}
              />
            </Grid2>
          ))}
      </Grid2>
    </Box>
  );
};

export default FamDashboardCard;
