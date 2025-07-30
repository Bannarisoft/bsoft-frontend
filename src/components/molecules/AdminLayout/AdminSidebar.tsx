import React, { useEffect, useState } from "react";
import { Box, ListItem, Typography, Tooltip } from "@mui/material";
import { usePathname } from "next/navigation";
import SideMenuButton from "../../atoms/SideMenuButton";
import { useTheme } from "@mui/material/styles";
import { useRecoilState, useRecoilValue } from "recoil";
import { mobileSidebarState, toggleSidebar } from "../../../utils/atoms";
import { MenuItem } from "../../../types";
import { motion } from "framer-motion";
import { getIconByMenuItem } from "./IconsPack";

interface AdminSidebarProps {
  modules: any[];
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ modules }) => {
  const [openSection, setOpenSection] = useState<number | null>(null);
  const pathname = usePathname();
  const theme = useTheme();

  const isSidebarToggled = useRecoilValue(toggleSidebar);
  const [mobileSidebar, setMobileSidebar] = useRecoilState(mobileSidebarState);
  const [hoveredItem, setHoveredItem] = useState<number | null>(null);

  const primaryColor = "#3a8484";
  const primaryLighter = "#4ba3a3";
  const primaryDarker = "#2e6b6b";
  const accentColor = "#d8ff02";

  const handleToggle = (id: number) => {
    setOpenSection(openSection === id ? null : id);
  };

  const ToggleSidebarclose = () => {
    if (window.innerWidth < window.innerHeight * window.devicePixelRatio) {
      setMobileSidebar(false);
    }
  };

  const isActive = (itemPath: string, items?: MenuItem[]) => {
    if (!itemPath && !items) return false;

    const checkNestedItems = (subItems: MenuItem[]): boolean => {
      return subItems.some((subItem) => {
        if (subItem.menuUrl && pathname.startsWith(subItem.menuUrl)) {
          return true;
        }
        if (subItem.childMenus?.length) {
          return checkNestedItems(subItem.childMenus);
        }
        return false;
      });
    };

    if (itemPath && pathname === itemPath) return true;
    if (itemPath && itemPath !== "/" && pathname.startsWith(itemPath))
      return true;
    if (items?.length) return checkNestedItems(items);

    return false;
  };

  const isChildActive = (items?: MenuItem[]): boolean => {
    if (!items?.length) return false;

    return items.some((item) => {
      if (item.menuUrl && pathname.startsWith(item.menuUrl)) return true;
      if (item.childMenus?.length) return isChildActive(item.childMenus);
      return false;
    });
  };

  useEffect(() => {
    Array.isArray(modules) &&
      modules.length > 0 &&
      modules.forEach((module) => {
        module.menus.forEach((menu: any) => {
          if (isActive(menu.menuUrl, menu.childMenus)) {
            setOpenSection(menu.id);
          }
        });
      });
  }, [pathname, modules]);

  useEffect(() => {
    window.addEventListener("resize", ToggleSidebarclose);
    return () => {
      window.removeEventListener("resize", ToggleSidebarclose);
    };
  }, []);

  // const itemVariants = {
  //   initial: { scale: 1 },
  //   hover: {
  //     scale: 1.035,
  //     transition: {
  //       type: "spring",
  //       stiffness: 500,
  //       damping: 20,
  //     },
  //   },
  // };

  // const moduleVariants = {
  //   hidden: { opacity: 0, y: 20 },
  //   visible: (i: number) => ({
  //     opacity: 1,
  //     y: 0,
  //     transition: {
  //       delay: i * 0.1,
  //       duration: 0.5,
  //     },
  //   }),
  // };

  return (
    <Box
      sx={{
        px: { xs: 1, sm: 1.5, md: 2 },
        py: { xs: 1.5, sm: 2 },
        color: "#fff",
        // background: `#3a8484`,
        height: "92dvh",
        overflowY: "auto",
        "&::-webkit-scrollbar": {
          width: { xs: "3px", sm: "4px" },
        },
        "&::-webkit-scrollbar-track": {
          background: "rgba(255, 255, 255, 0.05)",
        },
        "&::-webkit-scrollbar-thumb": {
          background: "rgba(255, 255, 255, 0.2)",
          borderRadius: "4px",
        },
        "&::-webkit-scrollbar-thumb:hover": {
          background: "rgba(255, 255, 255, 0.3)",
        },
      }}
    >
      {Array.isArray(modules) &&
        modules.length > 0 &&
        modules.map((module, index) => (
          <motion.div
            key={module.id}
            custom={index}
            initial="hidden"
            animate="visible"
            // variants={moduleVariants}
          >
            <Box
              mb={{ xs: 2, sm: 2.5, md: 3 }}
              pb={{ xs: 1.5, sm: 2 }}
              sx={{
                borderBottom: "1px solid rgba(255,255,255,0.15)",
                position: "relative",
                "&::after": {
                  content: '""',
                  position: "absolute",
                  bottom: 0,
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: { xs: "25%", sm: "30%" },
                  height: "2px",
                  // background: `rgba(92, 218, 218, 0.5)`,
                  borderRadius: "2px",
                },
              }}
            >
              {!isSidebarToggled && (
                <Typography
                  variant="subtitle2"
                  sx={{
                    color: "rgba(255, 255, 255, 0.85)",
                    fontSize: { xs: 11, sm: 12, md: 13 },
                    fontFamily: "var(--inter-font)",
                    fontWeight: 600,
                    letterSpacing: { xs: "0.5px", sm: "1px" },
                    mb: { xs: 1, sm: 1.2, md: 1.5 },
                    textTransform: "uppercase",
                    textShadow: "0px 1px 2px rgba(0,0,0,0.2)",
                    display: "flex",
                    alignItems: "center",
                    "&::before": {
                      content: '""',
                      width: { xs: "5px", sm: "6px" },
                      height: { xs: "5px", sm: "6px" },
                      borderRadius: "50%",
                      backgroundColor: accentColor,
                      marginRight: { xs: "6px", sm: "8px" },
                      boxShadow: `0 0 10px ${accentColor}`,
                    },
                  }}
                >
                  {module.moduleName}
                </Typography>
              )}

              <Box
                sx={{
                  "& .active-tree": {
                    position: "relative",
                  },
                }}
              >
                {module.menus.map((item: any) => {
                  const active = isActive(item.menuUrl, item.childMenus);
                  const hasActiveChild = isChildActive(item.childMenus);
                  const isHovered = hoveredItem === item.id;

                  const menuIcon = getIconByMenuItem(item);

                  return (
                    <motion.div
                      key={item.id}
                      // variants={itemVariants}
                      initial="initial"
                      whileHover="hover"
                      onMouseEnter={() => setHoveredItem(item.id)}
                      onMouseLeave={() => setHoveredItem(null)}
                    >
                      <Box
                        sx={{
                          transition: "all 0.3s ease",
                          borderRadius: { xs: "10px", sm: "12px" },
                          mb: { xs: 0.5, sm: 0.75, md: 1 },
                          background: active
                            ? "linear-gradient(90deg, rgba(58, 132, 132, 0.7) 0%, rgba(92, 218, 218, 0.2) 100%)"
                            : "",
                          "& li": {
                            color: active
                              ? "#fff"
                              : "rgba(255, 255, 255, 0.85)",
                            fontWeight: 400,
                            padding: {
                              xs: "6px 10px",
                              sm: "7px 12px",
                              md: "8px 14px",
                            },
                            borderRadius: { xs: "10px", sm: "12px" },
                            transition: "all 0.3s ease",
                            fontSize: { xs: "13px", sm: "14px", md: "15px" },
                            "&:hover": {
                              backgroundColor: "rgba(92, 218, 218, 0.1)",
                            },
                          },
                          "& .sub-menu": {
                            ml: { xs: 2, sm: 2.5, md: 3 },
                            borderLeft: `2px solid ${
                              active || hasActiveChild
                                ? accentColor
                                : "transparent"
                            }`,
                            position: "relative",
                            "&::before": {
                              content: '""',
                              position: "absolute",
                              left: -2,
                              top: 0,
                              width: "2px",
                              height: "100%",
                              background:
                                active || hasActiveChild
                                  ? `linear-gradient(to bottom, rgba(92, 218, 218, 0.7), rgba(92, 218, 218, 0))`
                                  : "transparent",
                            },
                          },
                        }}
                        className={`
                        ${active || hasActiveChild ? "active-tree" : ""}
                        ${hasActiveChild ? "parent-active" : ""}
                        ${
                          active && item.childMenus?.length
                            ? "child-active"
                            : ""
                        }
                      `}
                      >
                        {isSidebarToggled ? (
                          <Tooltip
                            title={item.menuName}
                            placement="right"
                            arrow
                          >
                            <ListItem
                              sx={{
                                fontSize: { xs: 18, sm: 18, md: 18 },
                                textAlign: "center",
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                fontFamily: "var(--inter-font)",
                                borderRadius: { xs: "12px", sm: "14px" },
                                px: 0,
                                py: { xs: 1, sm: 1.25, md: 1.5 },
                                cursor: "pointer",
                                "&:hover": {
                                  backgroundColor: "rgba(92, 218, 218, 0.15)",
                                },
                                "& svg": {
                                  transition: "all 0.3s ease",
                                  transform: active ? "scale(1.2)" : "scale(1)",
                                  color: active ? accentColor : "#fff",
                                  filter: active
                                    ? `drop-shadow(0 0 6px rgba(92, 218, 218, 0.6))`
                                    : "none",
                                  fontSize: {
                                    xs: "18px",
                                    sm: "20px",
                                    md: "22px",
                                  },
                                },
                              }}
                            >
                              <Box>{menuIcon}</Box>
                            </ListItem>
                          </Tooltip>
                        ) : (
                          <SideMenuButton
                            icon={menuIcon}
                            title={item.menuName}
                            items={item.childMenus}
                            isOpen={openSection === item.id}
                            onToggle={() => handleToggle(item.id)}
                            closeToggle={ToggleSidebarclose}
                            isActive={active}
                            path={item.menuUrl}
                            pathname={pathname}
                          />
                        )}
                      </Box>
                    </motion.div>
                  );
                })}
              </Box>
            </Box>
          </motion.div>
        ))}
    </Box>
  );
};

export default React.memo(AdminSidebar);
