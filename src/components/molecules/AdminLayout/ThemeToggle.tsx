import { Box } from "@mui/material";
import Link from "next/link";
import ImageComponent from "../../atoms/Image";
import Sun from "../../../../public/assets/images/sun.png";
import Moon from "../../../../public/assets/images/moon.png";
import { ThemeToggleProps } from "../../../types/types";

export const ThemeToggle = ({ mode, toggleTheme }: ThemeToggleProps) => (
  <Box
    px={2}
    sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}
  >
    <Box width={18} height={18} onClick={toggleTheme}>
      <Link href="">
        <ImageComponent
          src={mode !== "light" ? Sun : Moon}
          alt="Theme Toggle"
        />
      </Link>
    </Box>
  </Box>
);
