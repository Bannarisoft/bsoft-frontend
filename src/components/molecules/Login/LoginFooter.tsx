import { Box } from "@mui/material";
import React from "react";
import NavigationLink from "../../atoms/NavigationLink";

function LoginFooter() {
  return (
    <Box
      sx={{ bgcolor: "transparent", py: 2, bottom: 0, left: 0, right: 0 }}
      position="fixed"
      display={"flex"}
      justifyContent={"center"}
      alignItems={"center"}
      flexWrap={"wrap"}
      gap={4}
    >
      <NavigationLink title="2025 | © All Rights Reserved" redirectLink="" />
      <NavigationLink title="Privacy Policy" redirectLink="privacy-policy" />
      <NavigationLink
        title="Terms & Conditions"
        redirectLink="terms-and-conditions"
      />
    </Box>
  );
}

export default LoginFooter;
