'use client'

import { AppBar, Box, Divider, Drawer, IconButton, Popover } from "@mui/material";
import React, { useState } from "react";
import Logo from "../../atoms/Logo";
import ButtonComponent from "../../atoms/Button";
import { IoIosClose, IoMdCall } from "react-icons/io";
import FaqIcon from "../../../../public/assets/images/faq.png";
import Image from "next/image";
import { MdEast } from "react-icons/md";
import { CgMenuRightAlt } from "react-icons/cg";
import { MuiButton } from "bsoft-base-elements";

function LoginHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const toggleDrawer = (newOpen: boolean) => () => {
    setMobileOpen(newOpen);
  };
  return (
    <AppBar elevation={0} sx={{ bgcolor: "transparent", py: 2 }}>
      <Box
        maxWidth={1440}
        px={2}
        width={"100%"}
        m={"auto"}
        display={"flex"}
        justifyContent={"space-between"}
        alignItems={"center"}
      >
        <Logo toggle={false} color="#000" />
        <Box display={{ xs: "block", sm: "block", md: "none" }}>
          <IconButton onClick={() => setMobileOpen(true)}>
            <CgMenuRightAlt fontSize={28} color="#3ab4c6" />
          </IconButton>
        </Box>
        <Box justifyContent={"flex-start"} alignItems={"center"} gap={2}
          sx={{ display: { xs: "none", sm: "none", md: "flex" } }} >
          <MuiButton
            startIcon={<IoMdCall fill="#3ab4c6" />}
            className="transparent-icon-btn"
          >
            For Support
          </MuiButton>
          <MuiButton
            startIcon={<Image src={FaqIcon} alt="faq" />}
            className="transparent-icon-btn"
          >
            FAQs
          </MuiButton>
          {/* <MuiButton
            endIcon={<MdEast />}
            className="filled-icon-btn"
          >
            Alternative login?
          </MuiButton> */}
        </Box>
      </Box>
      <Popover open={mobileOpen} onClose={toggleDrawer(false)} sx={{ mt: 5, width: { xs: "100%", sm: "100%", md: "auto" } }} anchorOrigin={{ vertical: "top", horizontal: "right" }}>
        <Box p={2}>
          <Box>
            <MuiButton
              startIcon={<IoMdCall fill="#3ab4c6" />}
              sx={{
                my: 1,
              }}
              className="transparent-icon-btn"
            >
              For Support
            </MuiButton>
            <br />
            <MuiButton
              startIcon={<Image src={FaqIcon} alt="faq" />}
              className="transparent-icon-btn"
            >
              FAQs
            </MuiButton>
            <br />
            <Box display={"flex"} justifyContent={"center"} mt={2}>
              <MuiButton
                endIcon={<MdEast />}
                className="filled-icon-btn"
              >
                Alternative login?
              </MuiButton>
            </Box>
          </Box>
        </Box>
      </Popover>
    </AppBar>
  );
}
export default LoginHeader;
