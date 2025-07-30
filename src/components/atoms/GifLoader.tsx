import { Box, Typography } from "@mui/material";
import Image from "next/image";
import React from "react";
import CreateGif from "../../../public/assets/images/create-animation.gif";

function GifLoader() {
  return (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(255, 255, 255, 0.8)",
        backdropFilter: "blur(3px)",
        zIndex: 1200,
        transition: "all 0.3s ease-in-out",
      }}
    >
      <Box
        sx={{
          position: "relative",
          width: 400,
          height: 400,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          animation: "pulse 2s infinite ease-in-out",
          "@keyframes pulse": {
            "0%": { transform: "scale(0.95)" },
            "50%": { transform: "scale(1)" },
            "100%": { transform: "scale(0.95)" },
          },
        }}
      >
        <Image src={CreateGif} alt="Loading..." />
        <Typography
          variant="h6"
          color="#107869"
          sx={{
            mt: 3,
            fontWeight: 600,
            animation: "fadeInOut 1.5s infinite ease-in-out",
            "@keyframes fadeInOut": {
              "0%": { opacity: 0.6 },
              "50%": { opacity: 1 },
              "100%": { opacity: 0.6 },
            },
          }}
        >
          Preparing your asset...
        </Typography>
      </Box>
    </Box>
  );
}

export default GifLoader;
