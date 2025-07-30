import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Button,
  Fade,
  Zoom,
  useTheme,
  alpha,
  Stack,
  Divider,
  IconButton,
  Tooltip,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { Apirequest, tokenDecode } from "../../../utils/lib";
import Cookies from "js-cookie";
import Config from "../../../../src/utils/config.api.json";
import { GrAnalytics, GrClear, GrDashboard } from "react-icons/gr";
import { CiSettings } from "react-icons/ci";
import { BsPeople } from "react-icons/bs";
import {
  MdInventory,
  MdPayment,
  MdRadioButtonUnchecked,
  MdSecurity,
  MdSelectAll,
} from "react-icons/md";
import {
  BiCalendar,
  BiCloud,
  BiCode,
  BiMessage,
  BiRepost,
} from "react-icons/bi";
import { CgCheck } from "react-icons/cg";
import { SiSmartthings } from "react-icons/si";
import { useRouter } from "next/navigation";

const ModuleSelectorDemo = () => {
  const theme = useTheme();
  const token = Cookies.get("bsoft");
  const [menu, setMenu] = useState<any>([]);
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const router = useRouter();
  const getMenuId = Cookies.get("_ids") ?? "[]";
  const parsedIds = typeof getMenuId === "string" ? JSON.parse(getMenuId) : [];
  const FetchUserData = () => {
    const decoded = tokenDecode(token || "") ?? {};
    GetMenu(decoded?.nameid);
  };

  useEffect(() => {
    FetchUserData();
  }, [token]);

  const GetMenu = async (id: number | string) => {
    try {
      const { endpoint, method } = Config.Role.RoleMenu;
      const result = await Apirequest(
        endpoint.replace("{UserId}", id.toString()),
        method
      ).then((res) => res.data);
      setSelectedModules(parsedIds);
      setMenu(result?.data);
    } catch (err) {
      console.log(err);
    }
  };

  const getModuleIcon = (moduleName: string) => {
    const name = moduleName?.toLowerCase();
    if (name?.includes("dashboard")) return <GrDashboard />;
    if (name?.includes("user") || name?.includes("people")) return <BsPeople />;
    if (name?.includes("maintanence") || name?.includes("maintenance"))
      return <CiSettings />;
    if (name?.includes("fixed") || name?.includes("report"))
      return <SiSmartthings />;
    if (name?.includes("security") || name?.includes("auth"))
      return <MdSecurity />;
    if (name?.includes("payment") || name?.includes("billing"))
      return <MdPayment />;
    if (name?.includes("inventory") || name?.includes("stock"))
      return <MdInventory />;
    if (name?.includes("message") || name?.includes("chat"))
      return <BiMessage />;
    if (name?.includes("calendar") || name?.includes("schedule"))
      return <BiCalendar />;
    if (name?.includes("code") || name?.includes("dev")) return <BiCode />;
    if (name?.includes("cloud") || name?.includes("storage"))
      return <BiCloud />;
    return <BiRepost />;
  };

  const getModuleColor = (index: number) => {
    const colors = [
      { primary: "#667eea", secondary: "#764ba2" },
      { primary: "#f093fb", secondary: "#f5576c" },
      { primary: "#4facfe", secondary: "#00f2fe" },
      { primary: "#43e97b", secondary: "#38f9d7" },
      { primary: "#fa709a", secondary: "#fee140" },
      { primary: "#a8edea", secondary: "#fed6e3" },
      { primary: "#ff9a9e", secondary: "#fecfef" },
      { primary: "#ffecd2", secondary: "#fcb69f" },
      { primary: "#a18cd1", secondary: "#fbc2eb" },
      { primary: "#fdbb2d", secondary: "#22c1c3" },
    ];
    return colors[index % colors.length];
  };

  const handleModuleToggle = (moduleId: string) => {
    setSelectedModules((prev) =>
      prev.includes(moduleId)
        ? prev.filter((id) => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  const handleSelectAll = () => {
    if (selectedModules.length === menu.length) {
      setSelectedModules([]);
    } else {
      setSelectedModules(menu.map((module: any) => module.id));
    }
  };

  const handleClearAll = () => {
    setSelectedModules([]);
    Cookies.remove("_ids");
  };

  const GetLink = (menu: any) => {
    if (Array.isArray(menu)) {
      const hasChild =
        Array.isArray(menu[0]?.menus[0]?.childMenus) &&
        menu[0]?.menus[0]?.childMenus.length === 0
          ? false
          : true;
      if (hasChild) {
        return menu[0]?.menus[0]?.childMenus[0]?.menuUrl;
      } else {
        return menu[0]?.menus[0]?.menuUrl;
      }
    }
  };

  const handleSaveModules = () => {
    let temp: Array<number | string> = [];
    selectedModules.map((li) => temp.push(li));
    const stringifyIds = JSON.stringify(temp);
    Cookies.set("_ids", stringifyIds, { expires: 1 });
    const getMenu =
      Array.isArray(menu) && menu.filter((i) => selectedModules.includes(i.id));
    const redirectionLink = GetLink(getMenu);
    router.push(`${redirectionLink}`);
  };

  return (
    <Box
      sx={{
        p: 4,
        minHeight: "100vh",
        background: `linear-gradient(135deg, 
          ${alpha("#667eea", 0.1)} 0%, 
          ${alpha("#764ba2", 0.1)} 25%,
          ${alpha("#f093fb", 0.1)} 50%,
          ${alpha("#4facfe", 0.1)} 75%,
          ${alpha("#43e97b", 0.1)} 100%
        )`,
        position: "relative",
        overflow: "hidden",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `radial-gradient(circle at 20% 20%, ${alpha(
            "#667eea",
            0.3
          )} 0%, transparent 50%),
                      radial-gradient(circle at 80% 80%, ${alpha(
                        "#f093fb",
                        0.3
                      )} 0%, transparent 50%),
                      radial-gradient(circle at 40% 40%, ${alpha(
                        "#43e97b",
                        0.2
                      )} 0%, transparent 50%)`,
          zIndex: 0,
        },
      }}
    >
      <Box sx={{ position: "relative", zIndex: 6 }}>
        <Fade in timeout={800}>
          <Box sx={{ mb: 4, textAlign: "center" }}>
            <Typography
              variant="h6"
              sx={{
                color: "text.secondary",
                fontWeight: 400,
                mb: 3,
              }}
            >
              Choose your modules to customize your experience
            </Typography>
            <Stack
              direction="row"
              spacing={2}
              justifyContent="center"
              sx={{ mb: 3 }}
            >
              <Button
                variant="contained"
                startIcon={<MdSelectAll />}
                onClick={handleSelectAll}
                sx={{
                  background:
                    "linear-gradient(45deg, #3a848430%, #3a8484a1 90%)",
                  borderRadius: "25px",
                  px: 3,
                  py: 1,
                  textTransform: "none",
                  fontWeight: 600,
                  boxShadow: "0 8px 16px #3a8484",
                  "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: "0 12px 20px #3a8484",
                  },
                }}
              >
                {selectedModules.length === menu.length
                  ? "Deselect All"
                  : "Select All"}
              </Button>
              <Button
                variant="outlined"
                startIcon={<GrClear />}
                onClick={handleClearAll}
                disabled={selectedModules.length === 0}
                sx={{
                  borderRadius: "25px",
                  px: 3,
                  py: 1,
                  textTransform: "none",
                  fontWeight: 600,
                  borderColor: "#667eea",
                  color: "#667eea",
                  "&:hover": {
                    borderColor: "#764ba2",
                    color: "#764ba2",
                    transform: "translateY(-2px)",
                  },
                }}
              >
                Clear All
              </Button>
            </Stack>
            <Chip
              label={`${selectedModules.length} of ${menu.length} modules selected`}
              sx={{
                background: "linear-gradient(45deg, #667eea 30%, #764ba2 90%)",
                color: "white",
                fontWeight: 600,
                px: 2,
                "& .MuiChip-label": {
                  fontSize: "0.9rem",
                },
              }}
            />
          </Box>
        </Fade>

        <Divider sx={{ mb: 4, opacity: 0.3 }} />
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 3,
            mb: 4,
          }}
        >
          {Array.isArray(menu) &&
            menu.length > 0 &&
            menu.map((module: any, index: number) => {
              const isSelected = selectedModules.includes(module.id);
              const colors = getModuleColor(index);
              const isHovered = hoveredCard === module.id;

              return (
                <Zoom
                  in
                  timeout={600}
                  style={{ transitionDelay: `${index * 100}ms` }}
                  key={module.id}
                >
                  <Card
                    onClick={() => handleModuleToggle(module.id)}
                    onMouseEnter={() => setHoveredCard(module.id)}
                    onMouseLeave={() => setHoveredCard(null)}
                    sx={{
                      cursor: "pointer",
                      position: "relative",
                      overflow: "hidden",
                      borderRadius: "20px",
                      background: isSelected
                        ? `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`
                        : "rgba(255, 255, 255, 0.9)",
                      backdropFilter: "blur(10px)",
                      border: isSelected
                        ? `2px solid ${colors.primary}`
                        : "2px solid rgba(255, 255, 255, 0.3)",
                      boxShadow: isSelected
                        ? `0 20px 40px ${alpha(colors.primary, 0.3)}`
                        : "0 8px 32px rgba(0, 0, 0, 0.1)",
                      transform: isHovered
                        ? "translateY(-8px) scale(1.02)"
                        : "translateY(0) scale(1)",
                      transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                      "&::before": {
                        content: '""',
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: isSelected
                          ? "none"
                          : `linear-gradient(135deg, ${alpha(
                              colors.primary,
                              0.1
                            )} 0%, ${alpha(colors.secondary, 0.1)} 100%)`,
                        opacity: isHovered ? 1 : 0,
                        transition: "opacity 0.3s ease",
                        zIndex: 0,
                      },
                    }}
                  >
                    <CardContent
                      sx={{
                        position: "relative",
                        zIndex: 1,
                        p: 3,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        textAlign: "center",
                        height: "100%",
                        color: isSelected ? "white" : "inherit",
                      }}
                    >
                      <Box
                        sx={{
                          position: "absolute",
                          top: 12,
                          right: 12,
                          zIndex: 2,
                        }}
                      >
                        <Tooltip
                          title={isSelected ? "Selected" : "Click to select"}
                        >
                          <IconButton
                            size="small"
                            sx={{
                              color: isSelected ? "white" : colors.primary,
                              backgroundColor: isSelected
                                ? "rgba(255,255,255,0.2)"
                                : "rgba(255,255,255,0.8)",
                              "&:hover": {
                                backgroundColor: isSelected
                                  ? "rgba(255,255,255,0.3)"
                                  : "rgba(255,255,255,1)",
                              },
                            }}
                          >
                            {isSelected ? (
                              <CgCheck />
                            ) : (
                              <MdRadioButtonUnchecked />
                            )}
                          </IconButton>
                        </Tooltip>
                      </Box>
                      <Box
                        sx={{
                          fontSize: "3rem",
                          mb: 2,
                          color: isSelected ? "white" : colors.primary,
                          filter: isSelected
                            ? "drop-shadow(0 4px 8px rgba(0,0,0,0.2))"
                            : "none",
                          transform: isHovered
                            ? "scale(1.1) rotate(5deg)"
                            : "scale(1) rotate(0deg)",
                          transition: "all 0.3s ease",
                        }}
                      >
                        {getModuleIcon(module.moduleName)}
                      </Box>
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 700,
                          mb: 1,
                          color: isSelected ? "white" : "text.primary",
                          textShadow: isSelected
                            ? "0 2px 4px rgba(0,0,0,0.2)"
                            : "none",
                        }}
                      >
                        {module.moduleName}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: isSelected
                            ? "rgba(255,255,255,0.9)"
                            : "text.secondary",
                          lineHeight: 1.4,
                          opacity: 0.8,
                        }}
                      >
                        {`Experience the power of ${module.moduleName} module`}
                      </Typography>
                    </CardContent>
                  </Card>
                </Zoom>
              );
            })}
        </Box>

        {selectedModules.length > 0 && (
          <Fade in timeout={500}>
            <Box
              sx={{
                position: "fixed",
                bottom: 24,
                left: "50%",
                transform: "translateX(-50%)",
                background: "linear-gradient(45deg, #3a848430%, #3a8484a1 90%)",
                borderRadius: "50px",
                px: 4,
                py: 2,
                boxShadow: "0 12px 24px #3a8484",
                backdropFilter: "blur(10px)",
                zIndex: 1000,
              }}
            >
              <Stack direction="row" alignItems="center" spacing={2}>
                <Typography
                  variant="body1"
                  sx={{
                    color: "#000",
                    fontWeight: 600,
                  }}
                >
                  {selectedModules.length} modules selected
                </Typography>
                <Button
                  variant="contained"
                  sx={{
                    background: "rgba(255,255,255,0.2)",
                    color: "#000",
                    borderRadius: "25px",
                    px: 3,
                    textTransform: "none",
                    fontWeight: 600,
                    "&:hover": {
                      background: "rgba(255,255,255,0.3)",
                      transform: "scale(1.05)",
                    },
                  }}
                  onClick={handleSaveModules}
                >
                  Continue
                </Button>
              </Stack>
            </Box>
          </Fade>
        )}
      </Box>
    </Box>
  );
};

export default ModuleSelectorDemo;
