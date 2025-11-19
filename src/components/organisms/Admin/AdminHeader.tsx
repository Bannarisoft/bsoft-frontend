import {
  alpha,
  Avatar,
  Badge,
  Box,
  Button,
  Collapse,
  Divider,
  Drawer,
  FormControlLabel,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Popover,
  Radio,
  RadioGroup,
  Typography,
  useTheme,
} from "@mui/material";
import React, { useState, useCallback, useEffect } from "react";
import { Apirequest, stringAvatar } from "../../../utils/lib";
import { IoMdPower } from "react-icons/io";
import { BsFillBellFill } from "react-icons/bs";
import { HiMenuAlt1 } from "react-icons/hi";
import AdminSidebar from "../../molecules/AdminLayout/AdminSidebar";
import Cookies from "js-cookie";
import Config from "../../../utils/config.api.json";
import { useRecoilState, useRecoilValue } from "recoil";
import { mobileSidebarState, UserData, UserMenu } from "../../../utils/atoms";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { MuiText } from "bsoft-base-elements";
import { RiLockPasswordLine, RiUserCommunityLine } from "react-icons/ri";
import { FaAngleDown, FaAngleUp } from "react-icons/fa6";
import { Profile } from "../../../types/types";
import { MenuItem } from "../../molecules/AdminLayout/MenuItem";
import Link from "next/link";
import { VscFileSubmodule } from "react-icons/vsc";
import Image from "next/image";
import BellRang from "../../../../public/assets/images/notification.gif";
import Bell from "../../../../public/assets/images/bell.png";
import NotificationPopOver, {
  ApiNotification,
} from "../Notification/NotificationPopOver";
import { useDataFetchHook } from "../../../hooks/useDataFetchHook";
import { useNotificationSignalR } from "../../molecules/AdminLayout/NotificationComponent";

interface ToggleTypes {
  toggleMenu: () => void;
  unitData: Profile[];
  selectedUnitId: "";
  setSelectedUnitId: any;
  toggle: boolean;
  trackBg: boolean;
}

// Internal Error Boundary Component
class InternalErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(_: any) {
    return { hasError: true };
  }
  componentDidCatch(error: any, errorInfo: any) {
    console.error("AdminHeader render error:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <Box
          sx={{
            padding: 4,
            textAlign: "center",
            backgroundColor: "#fff3f3",
            color: "red",
            borderRadius: 2,
          }}
        >
          <Typography variant="h6" fontWeight="bold" mb={1}>
            Something went wrong in the header.
          </Typography>
          <Typography>Please try refreshing the page.</Typography>
        </Box>
      );
    }
    return this.props.children;
  }
}

function AdminHeader({
  toggleMenu,
  unitData,
  selectedUnitId,
  setSelectedUnitId,
  toggle,
  trackBg,
}: ToggleTypes) {
  const router = useRouter();
  const userValue = useRecoilValue(UserData) || {};
  const [mobileSidebar, setMobileSidebar] = useRecoilState(mobileSidebarState);
  const theme = useTheme();
  const [companyCollapseOpen, setCompanyCollapseOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<HTMLDivElement | null>(null);
  const open = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;
  const menuData = useRecoilValue(UserMenu) || [];
  const [profileAnchorEl, setProfileAnchorEl] = useState<HTMLElement | null>(
    null
  );
  const profileOpen = Boolean(profileAnchorEl);
  const profileId = profileOpen ? "profile-popover" : undefined;
  const liveNotifications = useNotificationSignalR();
  const [notifications, setNotifications] = useState<ApiNotification[]>([]);

  const { data: notificationData } = useDataFetchHook(
    `api/NotificationDetail/detail/${userValue.userId ?? ""}`,
    Config.Notification.Detail.method,
    "bg"
  );

  useEffect(() => {
    const staticData = notificationData ?? [];
    const liveData = liveNotifications ?? [];

    const allNotifications = [...staticData, ...liveData];

    const deduped = Array.from(
      new Map(allNotifications.map((item) => [item.id, item])).values()
    ).reverse();

    setNotifications(deduped);
  }, [notificationData, liveNotifications]);

  const [notifyEl, setNotifyEl] = React.useState(false);

  const toggleDrawer = (newOpen: boolean) => () => {
    setNotifyEl(newOpen);
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLDivElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleProfileClick = (event: React.MouseEvent<HTMLElement>) => {
    setProfileAnchorEl(event.currentTarget);
  };

  const handleProfileClose = () => {
    setProfileAnchorEl(null);
  };

  const toggleCompanyCollapse = useCallback(() => {
    setCompanyCollapseOpen((prev) => !prev);
  }, []);

  const handleUnitSelect = useCallback(
    (profile: Profile) => {
      switchUnit(profile);
    },
    [] // Ensure stable: no dependencies, switchUnit defined below
  );

  const switchUnit = async (profile: Profile) => {
    try {
      const body = {
        unitId: profile.unitId,
        companyId: profile.companyId,
        divisionId: profile.divisionId,
        oldUnitId: profile.oldUnitId,
      };

      const { endpoint, method } = Config.SwitchProfile.postUnit;
      const result = await Apirequest(endpoint, method, body);

      if (result?.data) {
        Cookies.set("bsoft", result.data.data.token, { expires: 1 });
        window.location.reload();
      }
    } catch (error) {
      console.error("Error switching unit:", error);
      Swal.fire({
        icon: "error",
        title: "Switch Unit Failed",
        text: "Unable to switch unit. Please try again later.",
      });
    }
  };

  const handleLogout = useCallback(() => {
    Swal.fire({
      title: "Are you sure want to Logout?",
      icon: "question",
      confirmButtonText: "Okay",
      showCancelButton: true,
      customClass: { title: "custom-title" },
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const { endpoint, method } = Config.AuthLogin.Logout;
          const userId = userValue.userId?.toString() || "";
          await Apirequest(endpoint.replace("{id}", userId), method);
          Cookies.remove("bsoft");
          router.push("/login");
        } catch (error) {
          console.error("Logout error:", error);
          Swal.fire({
            icon: "error",
            title: "Logout Failed",
            text: "Please try again.",
          });
        }
      }
    });

    setProfileAnchorEl(null);
  }, [userValue.userId, router]);

  const handleToggleMenu = useCallback(() => {
    setMobileSidebar((prev) => !prev);
  }, [setMobileSidebar]);

  // Safe render helpers for userValue props with fallbacks
  const safeCompanyName = userValue.companyName || "";
  const safeUnitName = userValue.unitName || "";
  const safeFirstName = userValue.firstName || "";
  const safeLastName = userValue.lastName || "";
  const safeUserName = userValue.name || "";
  const safeUnitId = userValue.unitId || "0";

  return (
    <InternalErrorBoundary>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        p={"6px 12px"}
        position="fixed"
        top={0}
        left={{ xs: 0, lg: toggle ? 60 : 280 }}
        right={0}
        zIndex={10}
        boxShadow="0px 5px 13px -12px rgba(0,0,0,0.75)"
        sx={{ background: !trackBg ? "transparent" : "#fff" }}
      >
        <Box
          display="flex"
          justifyContent="flex-start"
          alignItems="center"
          textAlign="center"
          gap={2}
        >
          <Box display={{ xs: "none", sm: "none", md: "none", lg: "block" }}>
            <HiMenuAlt1 fontSize={24} cursor="pointer" onClick={toggleMenu} />
          </Box>
          <Box display={{ xs: "block", sm: "block", md: "block", lg: "none" }}>
            <HiMenuAlt1
              fontSize={24}
              cursor="pointer"
              onClick={handleToggleMenu}
            />
          </Box>

          {safeUnitId !== "0" && (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                backgroundColor: alpha(theme.palette.primary.main, 0.05),
                borderRadius: 4,
                px: "12px",
              }}
            >
              <Typography
                sx={{
                  fontWeight: 600,
                  textTransform: "uppercase",
                  fontSize: "14px",
                  background:
                    "linear-gradient(90deg, #147d9e 0%, #65a6a2 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  "@media (max-width: 600px)": {
                    fontSize: 11,
                  },
                }}
                fontFamily={"poppins"}
                fontSize={13}
              >
                {safeCompanyName} - &nbsp;
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  opacity: 0.7,
                  fontWeight: 600,
                  "@media (max-width: 600px)": {
                    fontSize: 11,
                  },
                }}
                fontSize={13}
                fontFamily={"poppins"}
              >
                {safeUnitName}
              </Typography>
            </Box>
          )}
        </Box>

        <Box
          component="div"
          display={{ xs: "none", sm: "none", md: "flex", lg: "flex" }}
          alignItems="center"
          gap={4}
          sx={{ "& svg": { cursor: "pointer" } }}
        >
          <IconButton onClick={toggleDrawer(true)}>
            <Badge
              badgeContent={
                Array.isArray(notifications) ? notifications.length : 0
              }
              color="primary"
            >
              <Image
                alt=""
                src={
                  Array.isArray(notifications) && notifications.length > 0
                    ? BellRang
                    : Bell
                }
                width={
                  Array.isArray(notifications) && notifications.length > 0
                    ? 30
                    : 22
                }
                height={
                  Array.isArray(notifications) && notifications.length > 0
                    ? 30
                    : 22
                }
              />
            </Badge>
          </IconButton>
          <Drawer open={notifyEl} anchor="right" onClose={toggleDrawer(false)}>
            <NotificationPopOver notificationData={notifications} />
          </Drawer>

          <Box
            display={{ xs: "none", sm: "none", md: "flex", lg: "flex" }}
            alignItems="center"
            gap={2}
          >
            <Avatar
              {...stringAvatar(safeFirstName.toLocaleUpperCase())}
              sx={{
                ...stringAvatar(safeFirstName.toLocaleUpperCase()).sx,
                height: 35,
                width: 35,
                fontSize: 16,
              }}
            />

            <Popover
              id={profileId}
              open={profileOpen}
              anchorEl={profileAnchorEl}
              onClose={handleProfileClose}
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              transformOrigin={{ vertical: "top", horizontal: "right" }}
              PaperProps={{
                elevation: 8,
                sx: {
                  width: 320,
                  overflow: "visible",
                  mt: 1.5,
                  "&:before": {
                    content: '""',
                    display: "block",
                    position: "absolute",
                    top: 0,
                    right: 20,
                    width: 10,
                    height: 10,
                    bgcolor: "#65a6a2",
                    transform: "translateY(-50%) rotate(45deg)",
                    zIndex: 0,
                  },
                  borderRadius: 2,
                },
              }}
            >
              <Box
                sx={{
                  p: 2,
                  display: "flex",
                  alignItems: "center",
                  background:
                    "linear-gradient(90deg, #147d9e 0%, #65a6a2 100%)",
                  color: "white",
                }}
              >
                <Avatar
                  {...stringAvatar(safeFirstName.toLocaleUpperCase())}
                  sx={{
                    ...stringAvatar(safeFirstName.toLocaleUpperCase()).sx,
                    height: 35,
                    width: 35,
                    fontSize: 16,
                  }}
                />
                <Box sx={{ ml: 2 }}>
                  <Box
                    display={"flex"}
                    justifyContent={"center"}
                    alignItems={"center"}
                    gap={1}
                    flexWrap={"wrap"}
                  >
                    <MuiText fontSize={14} fontFamily="var(--poppins-font)">
                      {`${safeFirstName.toLocaleUpperCase()} ${safeLastName.toLocaleUpperCase()}`}{" "}
                    </MuiText>
                    <MuiText fontSize={12} fontFamily="poppins">
                      {typeof safeUserName === "string"
                        ? safeUserName.toUpperCase()
                        : ""}
                    </MuiText>
                  </Box>
                  {safeUnitId !== "0" && (
                    <MuiText variant="body2" sx={{ opacity: 0.8 }}>
                      {safeCompanyName} - {safeUnitName}
                    </MuiText>
                  )}
                </Box>
              </Box>

              <Divider />
              <Box sx={{ py: 1 }}>
                <Link href={"/change-password"}>
                  <MenuItem
                    icon={<RiLockPasswordLine />}
                    text="Change Password"
                  />
                </Link>
                {safeUnitId !== "0" && (
                  <>
                    <MenuItem
                      icon={<RiUserCommunityLine />}
                      text="Change Unit"
                      onClick={toggleCompanyCollapse}
                      endIcon={
                        companyCollapseOpen ? <FaAngleDown /> : <FaAngleUp />
                      }
                    />

                    <Collapse
                      in={companyCollapseOpen}
                      timeout="auto"
                      unmountOnExit
                    >
                      <Box
                        sx={{
                          p: "4px",
                          bgcolor: "rgba(63, 81, 181, 0.04)",
                          borderRadius: 2,
                          border: "1px solid rgba(63, 81, 181, 0.1)",
                        }}
                      >
                        <RadioGroup
                          value={selectedUnitId}
                          onChange={(e) => {
                            const value = e.target.value;
                            setSelectedUnitId(value);
                            const selectedUnit = unitData.find(
                              (unit) => unit.unitId.toString() === value
                            );
                            if (selectedUnit) {
                              handleUnitSelect(selectedUnit);
                            }
                          }}
                        >
                          {Array.isArray(unitData) &&
                            unitData.map((company) => (
                              <FormControlLabel
                                key={company.unitId}
                                value={company.unitId.toString()}
                                control={
                                  <Radio
                                    size="small"
                                    sx={{
                                      color: "#3f51b5",
                                      "&.Mui-checked": { color: "#3f51b5" },
                                    }}
                                  />
                                }
                                label={
                                  <Typography variant="body2">
                                    {company.unitName}
                                  </Typography>
                                }
                                sx={{
                                  margin: "0",
                                  transition: "all 0.2s",
                                  borderRadius: 1,
                                  pl: 1,
                                  "&:hover": {
                                    bgcolor: "rgba(63, 81, 181, 0.08)",
                                  },
                                }}
                              />
                            ))}
                        </RadioGroup>
                      </Box>
                    </Collapse>
                  </>
                )}
                <Link href={"/choose-module"}>
                  <MenuItem icon={<VscFileSubmodule />} text="Select Module" />
                </Link>
              </Box>

              <Divider />
              <Box sx={{ p: 2, display: "flex", justifyContent: "center" }}>
                <Button
                  variant="contained"
                  color="error"
                  startIcon={<IoMdPower />}
                  onClick={handleLogout}
                  sx={{
                    borderRadius: 2,
                    textTransform: "none",
                    py: 1,
                    fontWeight: "bold",
                    background:
                      "linear-gradient(90deg, #147d9e 0%, #65a6a2 100%)",
                    boxShadow: "0 4px 6px rgba(211, 47, 47, 0.25)",
                    "&:hover": {
                      boxShadow: "0 6px 10px rgba(211, 47, 47, 0.3)",
                      background:
                        "linear-gradient(90deg, #147d9e 0%, #65a6a2 100%)",
                    },
                  }}
                >
                  Sign Out
                </Button>
              </Box>
            </Popover>

            <Box pr={2} onClick={handleProfileClick} sx={{ cursor: "pointer" }}>
              <MuiText
                fontSize={13}
                fontFamily="poppins"
                color="text.secondary"
              >
                { typeof safeUserName === "string" && safeUserName.toLocaleUpperCase()}
              </MuiText>
              <MuiText
                fontSize={16}
                fontFamily="poppins !important"
                fontWeight={500}
              >
                {`${safeFirstName.toLocaleUpperCase()} ${safeLastName.toLocaleUpperCase()}`}{" "}
              </MuiText>
            </Box>
          </Box>
        </Box>

        <Box
          display={{ xs: "flex", sm: "flex", md: "none", lg: "none" }}
          gap={2}
          alignItems="center"
        >
          <Badge badgeContent={4} color="error" sx={{ fontSize: 12 }}>
            <Image alt="" src={Bell} width={40} height={40} />
          </Badge>

          <Avatar {...stringAvatar(safeUserName)} onClick={handleMenuClick} />

          <Popover
            id={id}
            open={open}
            anchorEl={anchorEl}
            onClose={handleMenuClose}
            anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
          >
            <Box p={2}>
              <MuiText fontSize={15} fontFamily="var(--poppins-font)" pb={0.6}>
                Welcome, <b>{safeUserName}</b>
              </MuiText>

              {[
                {
                  id: 1,
                  title: "Settings",
                  icon: <HiMenuAlt1 fontSize={20} />,
                  action: () => {},
                },
                {
                  id: 2,
                  title: "Logout",
                  icon: <IoMdPower fontSize={20} />,
                  action: handleLogout,
                },
              ].map((item) => (
                <ListItem disablePadding key={item.id}>
                  <ListItemButton onClick={item.action}>
                    <ListItemIcon>{item.icon}</ListItemIcon>
                    <ListItemText
                      sx={{ fontFamily: "var(--poppins-font)" }}
                      primary={item.title}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </Box>
          </Popover>
        </Box>

        <Drawer
          anchor="left"
          open={mobileSidebar}
          onClose={() => setMobileSidebar(false)}
        >
          <Box p={1} width={300} height={"100%"} bgcolor={"#366d6d"}>
            <Box
              sx={{
                display: "grid",
                placeItems: "center",
                borderBottom: "1px solid #f1f1f1",
                pb: 2,
                mb: 1,
              }}
            >
              {/* Logo placeholder */}
            </Box>
            <AdminSidebar modules={menuData} />
          </Box>
        </Drawer>
      </Box>
    </InternalErrorBoundary>
  );
}

export default AdminHeader;
