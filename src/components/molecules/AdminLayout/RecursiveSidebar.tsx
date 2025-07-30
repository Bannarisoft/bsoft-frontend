"use client";

import React, { ReactNode, useState, useEffect } from "react";
import {
  List,
  ListItem,
  ListItemText,
  Collapse,
  IconButton,
  ListItemIcon,
  Link,
  Box,
} from "@mui/material";
import { MdExpandLess, MdExpandMore } from "react-icons/md";
import NextLink from "next/link";
import { usePathname } from "next/navigation";

interface SidebarProps {
  menu: MenuItem[];
}

interface MenuItem {
  id: number;
  title: string;
  path: string;
  active: boolean;
  icon: ReactNode;
  Items?: MenuItem[];
}

const RecursiveSidebar: React.FC<SidebarProps> = ({ menu }) => {
  const [openMenu, setOpenMenu] = useState<Set<number>>(new Set());
  const [isMounted, setIsMounted] = useState(false);
  const [currentPath, setCurrentPath] = useState<string | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsMounted(true);
      updateCurrentPath();
    }
  }, [pathname]);

  const updateCurrentPath = () => {
    const path = window.location.pathname.split("/bsoft")[1];
    setCurrentPath(path);
  };

  const isMenuItemActive = (item: MenuItem): boolean => {
    if (item.path === currentPath) {
      return true;
    }
    if (item.Items) {
      return item.Items.some(isMenuItemActive);
    }
    return false;
  };

  const handleToggle = (id: number) => {
    const newOpenMenu = new Set(openMenu);
    if (newOpenMenu.has(id)) {
      newOpenMenu.delete(id);
    } else {
      newOpenMenu.add(id);
    }
    setOpenMenu(newOpenMenu);
  };

  const renderMenuItem = (item: MenuItem, isParent: boolean = false) => {
    return (
      <ListItem
        disablePadding
        onClick={() => {
          handleToggle(item.id);
        }}
        sx={{
          gap: 2,
          fontFamily: "var(--poppins-font)",
          fontWeight: 500,
          "& svg": {
            fontWeight: 600,
            color: "#0c4252",
            fontSize: 22,
          },
          p: 2,
        }}
      >
        <ListItemIcon sx={{ minWidth: 0 }}>{item.icon}</ListItemIcon>
        <ListItemText
          primary={item.title}
          sx={{
            color: item.icon === null && item.path === "" ? "#222" : "",
            fontWeight: item.icon === null && item.path === "" ? "600 !important" : "",
          }}
        />
        {item.Items && !isParent && (
          <IconButton edge="end">
            {openMenu.has(item.id) ? <MdExpandLess /> : <MdExpandMore />}
          </IconButton>
        )}
      </ListItem>
    );
  };

  if (!isMounted) {
    return null;
  }

  return (
    <List sx={{ borderRadius: "5px" }}>
      {menu.map((item) => {
        const isMainSettings = item.title === "Fixed Asset Management";
        const isActive = isMenuItemActive(item);

        return (
          <Box
            key={item.id}
            sx={{
              ...(isActive
                ? {
                    backgroundColor: "#e0f7fa",
                  }
                : {
                    backgroundColor: "#fff",
                  }),
            }}
          >
            <NextLink href={item.path} passHref>
              <Link
                sx={{
                  textDecoration: "none",
                  display: "block",
                }}
              >
                {renderMenuItem(item, isMainSettings)}
              </Link>
            </NextLink>

            {item.Items && (
              <Collapse
                in={isMainSettings || openMenu.has(item.id)}
                timeout="auto"
                unmountOnExit
              >
                <List component="div" disablePadding sx={{ px: 2 }}>
                  <RecursiveSidebar menu={item.Items} />
                </List>
              </Collapse>
            )}
          </Box>
        );
      })}
    </List>
  );
};

export default RecursiveSidebar;
