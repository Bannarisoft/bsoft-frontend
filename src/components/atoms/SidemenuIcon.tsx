import { Box } from "@mui/material";
import React from "react";
import { MenuList } from "../../utils/menu";
import { usePathname } from "next/navigation";

function SidemenuIcon() {
  const pathname = usePathname();

  const isActive = (itemPath: string, items?: Array<{ path: string }>) => {
    if (pathname === itemPath) return true;

    if (items) {
      return items.some((subItem) => {
        return pathname.startsWith(subItem.path);
      });
    }

    return false;
  };

  return (
    <Box>
      {MenuList.map((item) => {
        const active = isActive(item.path, item.Items);

        return (
          <Box
            key={item.id}
            bgcolor={active ? "#f0f0f0" : ""}
            borderTop={active ? "1px solid #d8d8d8" : ""}
            borderBottom={active ? "1px solid #d8d8d8" : ""}
          >
            {item.icon}
          </Box>
        );
      })}
    </Box>
  );
}

export default SidemenuIcon;
