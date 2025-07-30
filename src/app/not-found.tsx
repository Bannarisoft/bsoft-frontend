"use client";

import { Box } from "@mui/material";
import TextComponent from "../components/atoms/Text";
import { useRouter } from "next/navigation";
import { MuiButton } from "bsoft-base-elements";
import NotFoundImage from "../../public/assets/images/not-found.jpg";
import Image from "next/image";

export default function NotFound() {
  const router = useRouter();

  return (
    <Box className="d-grid-center">
      <Box>
        <Image
          src={NotFoundImage}
          alt="not found"
          width={1200}
          height={800}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </Box>
      <TextComponent variant="h6" mb={2}>
        Page Not Found
      </TextComponent>

      <MuiButton variant="contained" onClick={() => router.back()}>
        Back
      </MuiButton>
    </Box>
  );
}
