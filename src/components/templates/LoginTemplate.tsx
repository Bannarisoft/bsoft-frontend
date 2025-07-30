import { Box, Grid2 } from "@mui/material";
import React from "react";
import LoginHeader from "../molecules/Login/LoginHeader";
import { LoginSwiper } from "bsoft-base-elements";
import LoginFooter from "../molecules/Login/LoginFooter";
interface LayoutProps {
  children: React.ReactNode;
}
function LoginTemplate(props: LayoutProps) {
  return (
    <Box
      maxWidth={{ xs: "1440px", sm: "1000px", md: "1000px", lg: "1440px" }}
      px={2}
      component="div"
    >
      <LoginHeader />
      <Box position={"relative"} sx={{ mt: 2 }}>
        <Grid2
          container
          boxShadow={"3px 3px 10px 3px rgba(0,0,0,0.075)"}
          borderRadius={"14px"}
          overflow={"hidden"}
          bgcolor={"#fff"}
          display={{ xs: "grid", sm: "grid", md: "flex", lg: "flex" }}
          mx={{ xs: "3rem", sm: "5rem", md: "10rem", lg: "12rem" }}
          position={"relative"}
        >
          <Grid2
            size={{ xs: 12, sm: 12, md: 6, lg: 6 }}
            display={{ xs: "block", sm: "block", md: "block", lg: "block" }}
            sx={{ position: "relative" }}
          >
            <LoginSwiper />
          </Grid2>
          <Grid2 size={{ xs: 12, sm: 12, md: 6, lg: 6 }} m={"auto"}>
            <Box p={{ xs: 2, sm: 2, md: 4, lg: 4 }}>{props.children}</Box>
          </Grid2>
        </Grid2>
        <Box
          position={"absolute"}
          bottom={-40}
          left={38}
          display={{ xs: "none", sm: "none", md: "none", lg: "none" }}
        >
          <Box className="swiper-button-prev"></Box>
          <Box className="swiper-button-next"></Box>
        </Box>
      </Box>
      <Box display={{ xs: "none", sm: "none", md: "block", lg: "block" }}>
        <LoginFooter />
      </Box>
    </Box>
  );
}
export default LoginTemplate;
