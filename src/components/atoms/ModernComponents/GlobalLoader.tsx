import React from "react";
import { Backdrop, Typography, Box } from "@mui/material";
import Image from "next/image";
import LoaderGif from "../../../../public/assets/images/process.gif";

const GlobalLoader = ({ isLoading }: { isLoading: boolean }) => {
  return (
    <Backdrop
      sx={{
        color: "#fff",
        zIndex: (theme) => theme.zIndex.drawer + 9999,
        backgroundColor: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(4px)",
        flexDirection: "column",
      }}
      open={isLoading}
    >
      <Image
        src={LoaderGif}
        alt="Loading..."
        width={80}
        height={80}
        style={{ borderRadius: "50%", marginBottom: "16px" }}
      />

      <Box textAlign="center">
        <Typography
          variant="h6"
          sx={{ fontWeight: 500, letterSpacing: "0.5px" }}
        >
          Loading...
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.8, mt: 0.5 }}>
          Please wait while we process your request
        </Typography>
      </Box>
    </Backdrop>
  );
};

export default GlobalLoader;
