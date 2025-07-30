import { Box } from "@mui/material";
import React, { ReactNode } from "react";

function NavTabs({ children }: { children: ReactNode }) {
  return (
    <Box
      sx={{
        bgcolor: "background.paper",
        "& .MuiTabs-indicator": {
          top: 0,
          display: "none",
        },
        "& .MuiButtonBase-root": {
          textTransform: "capitalize",
          fontSize: 16,
          fontFamily: "var(--poppins-font)",
          border: "1px solid  rgba(0, 0, 0, 0.09)",
          p: 1,
          minHeight: 0,
          borderRadius: "12px 12px 0 0",
        },
        "& .MuiTabs-list": {
          gap: "5px",
          borderBottom: "1px solid #3a8484",
        },
        "& .Mui-selected": {
          border: "1px solid #3a8484",
          borderBottom: "1px solid #fff",
          borderTop: "4px solid #3a8484",
          zIndex: 2,
          top: 1,
          borderRadius: "12px 12px 0 0",
        },
        "& .MuiTabPanel-root": {
          px: 0,
          py: 1
        },
      }}
    >
      {children}
    </Box>
  );
}

export default NavTabs;
