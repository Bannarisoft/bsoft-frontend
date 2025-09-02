import { Box } from "@mui/material";
import React, { ReactNode } from "react";

type Props = {
  children: ReactNode;
  sticky?: boolean;
};

function NavTabss({ children, sticky = false }: Props) {
  const styles = {
    root: {
      position: sticky ? "sticky" : "static",
      top: 0,
      zIndex: 5,
      bgcolor: "background.paper",
      marginleft: 30,
    },
    tabs: {
      "& .MuiTabs-indicator": { display: "none" },
      "& .MuiTabs-flexContainer": {
        gap: 0.75,
        borderBottom: "1px solid",
        borderColor: "divider",
        alignItems: "flex-end",
      },
    },
    tab: {
      textTransform: "none",
      fontSize: 16,
      fontWeight: 600,
      fontFamily: "var(--poppins-font, inherit)",
      minHeight: 0,
      px: 2,
      py: 1,
      position: "relative",
      border: "1px solid",
      borderColor: "rgba(0,0,0,0.09)",
      borderBottomColor: "divider",
      color: "text.secondary",
      backgroundColor: "transparent",
    },
    activeTab: {
      color: "text.primary",
      borderColor: "primary.main",
      borderBottomColor: "background.paper",
      borderTopWidth: 4,
      borderTopStyle: "solid",
      borderTopColor: "primary.main",
      zIndex: 2,
      top: 1, // tiny nudge to sit over the bottom border
      backgroundColor: "background.paper",
    },
    tabPanel: {
      px: 0,
      py: 1,
    },
  };

  return (
    <Box sx={styles.root}>
      {children}
    </Box>
  );
}

export default NavTabss;