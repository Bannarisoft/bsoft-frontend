import { Box } from "@mui/material";
import { MuiText } from "bsoft-base-elements";
import { MenuItemProps } from "../../../types/types";

export const MenuItem = ({ icon, text, onClick, endIcon }: MenuItemProps) => (
  <Box
    sx={{
      display: "flex",
      alignItems: "center",
      px: 2,
      py: 1,
      cursor: "pointer",
      transition: "all 0.2s",
      "&:hover": {
        backgroundColor: "rgba(20, 125, 158, 0.2)",
        transform: "scale(1.01)",
      },
    }}
    onClick={onClick}
  >
    <Box
      sx={{
        color: "#147d9e",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "50%",
        p: 1,
        backgroundColor: "rgba(20, 125, 158, 0.2)",
      }}
    >
      {icon}
    </Box>
    <MuiText sx={{ ml: 2 }}>{text}</MuiText>
    {endIcon && <Box sx={{ ml: "auto" }}>{endIcon}</Box>}
  </Box>
);
