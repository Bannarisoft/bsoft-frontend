import { Box, Typography } from "@mui/material";
import Image from "next/image";
import React from "react";
import LogoImage from "../../../public/assets/images/bsoft-logo.webp";
import { useTheme } from "@mui/material/styles";
import Link from "next/link";

function Logo({ toggle, color }: { toggle: boolean; color: string }) {
  return (
    <Box
      display={"flex"}
      justifyContent={"flex-start"}
      alignItems={"center"}
      gap={2}
    >
      <Image
        src={LogoImage}
        alt="logo"
        height={36}
        style={{ objectFit: "contain" }}
      />
      {!toggle && (
        <Typography
          variant="h5"
          fontWeight={500}
          fontSize={22}
          color={color}
          fontFamily={"poppins"}
          sx={{
            "@media (max-width: 600px)": {
              fontSize: 17,
            },
          }}
        >
          BSOFT
        </Typography>
      )}
    </Box>
  );
}

export default Logo;
