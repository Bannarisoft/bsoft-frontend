import React from "react";
import { Box } from "@mui/material";
import Image from "next/image";
import Yarn from "../../../public/assets/images/ai.jpg";

const YarnBg = () => (
  <Box
    sx={{
      position: "fixed",
      inset: 0,
      zIndex: 5,
      overflow: "hidden",
      filter: "blur(12px)",
      opacity: 0.5,
      pointerEvents: "none",
    }}
  >
    <Image
      src={Yarn}
      alt="Background Yarn"
      fill
      style={{
        objectFit: "cover",
        objectPosition: "center",
      }}
    />
  </Box>
);

export default YarnBg;
