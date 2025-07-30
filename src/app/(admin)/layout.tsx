"use client";

import { Box, InputAdornment } from "@mui/material";
import React, { useEffect, useState } from "react";
import AdminSidebar from "../../components/molecules/AdminLayout/AdminSidebar";
import AdminHeader from "../../components/organisms/Admin/AdminHeader";
import { useTheme } from "@mui/material/styles";
import { useRecoilState, useRecoilValue } from "recoil";
import {
  SignalRNotifications,
  toggleSidebar,
  UserData,
  UserMenu,
} from "../../utils/atoms";
import InputComponent from "../../components/atoms/Input";
import ButtonComponent from "../../components/atoms/Button";
import { RiSearch2Fill } from "react-icons/ri";
import { FaFilter } from "react-icons/fa6";
import Cookies from "js-cookie";
import { Apirequest, filterMenuItems, tokenDecode } from "../../utils/lib";
import Config from "../../../src/utils/config.api.json";
import { Profile } from "../../types";
import YarnBg from "../../components/atoms/YarnBg";
import Logo from "../../components/atoms/Logo";
import { useRouter } from "next/navigation";
import { useNotificationSignalR } from "../../components/molecules/AdminLayout/NotificationComponent";


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useNotificationSignalR();
  const theme = useTheme();
  const getMenuId = Cookies.get("_ids") ?? "[]";
  const parsedIds = typeof getMenuId === "string" ? JSON.parse(getMenuId) : [];
  const [toggle, setToggle] = useRecoilState(toggleSidebar);
  const [userData, setUserData] = useRecoilState(UserData);
  const [menu, setMenu] = useRecoilState(UserMenu);
  const [menuFlag, setMenuFlag] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [unitData, setUnitData] = useState<Profile[]>([]);
  const [profile, setProfile] = useState<any>({});
  const [selectedUnitId, setSelectedUnitId] = useState<any>("");
  const [trackBg, setTrackBg] = useState<boolean>(false);
  const messages = useRecoilValue(SignalRNotifications);
  const filteredMenuList = filterMenuItems(menu, searchQuery);
  const token = Cookies.get("bsoft");
  const router = useRouter();

  useEffect(() => {
    if (Array.isArray(parsedIds) && parsedIds.length === 0) {
      if (token) {
        return router.push("/choose-module");
      } else {
        return router.push("/login");
      }
    }
  }, [parsedIds, token]);

  const toggleMenu = () => {
    setMenuFlag((prev) => !prev);
    setToggle((prev) => !prev);
  };

  const FetchUserData = () => {
    const decoded = tokenDecode(token || "") ?? {};
    const initialUserData: any = {
      name: decoded?.unique_name,
      email: decoded?.EmailId,
      userId: decoded?.nameid,
      companyId: decoded?.CompanyId,
      unitId: decoded?.UnitId,
      divisionId: decoded?.DivisionId,
      oldUnitId: decoded?.OldUnitId,
      groupCode: decoded?.GroupCode,
      firstName: decoded?.FirstName,
      lastName: decoded?.LastName,
    };

    setUserData(initialUserData);
    setProfile(initialUserData);
  };

  const FetchUnitData = async () => {
    try {
      const { endpoint, method } = Config.SwitchProfile.getUnit;
      const response = await Apirequest(endpoint, method);
      setUnitData(response.data.data || []);
    } catch (error) {
      console.error("Error fetching unit data:", error);
    }
  };

  useEffect(() => {
    if (unitData.length > 0 && profile?.unitId) {
      const currentUnitId = profile?.unitId.toString();
      const unitExists = unitData.some(
        (unit) => unit.unitId.toString() === currentUnitId
      );

      const currentUnit = unitData.find(
        (item: any) => item.unitId.toString() === profile?.unitId.toString()
      );

      if (currentUnit) {
        setUserData((prevData) => ({
          ...prevData,
          companyName: currentUnit.companyName,
          unitName: currentUnit.unitName,
        }));
      }

      if (unitExists) {
        setSelectedUnitId(currentUnitId);
      } else if (unitData.length > 0) {
        setSelectedUnitId(unitData[0].unitId.toString());
      }
    }
  }, [unitData, profile, setUserData]);

  const GetMenu = async () => {
    try {
      const { endpoint, method } = Config.Role.RoleMenu;
      const result = await Apirequest(
        endpoint.replace("{UserId}", userData.userId.toString()),
        method
      ).then((res) => res.data);
      let temp: any = [];
      Array.isArray(parsedIds) &&
        Array.isArray(result?.data) &&
        parsedIds.length > 0 &&
        result?.data.map((list: any) => {
          parsedIds.map((item) => {
            if (list?.id === item) {
              temp.push(list);
            }
          });
        });
      setMenu(Array.isArray(temp) && temp.length > 0 ? temp : result?.data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    if (userData.userId !== "") {
      GetMenu();
    }
  }, [userData.userId]);

  useEffect(() => {
    FetchUserData();
    FetchUnitData();
    window.addEventListener("scroll", function () {
      const currentScrollY = window.scrollY;
      if (currentScrollY <= 50) {
        setTrackBg(false);
      } else {
        setTrackBg(true);
      }
    });
  }, []);

  const sidebarWidth = toggle ? 60 : 280;

  return (
    <Box sx={{ display: "flex" }}>
      {/* <YarnBg /> */}

      <Box
        sx={{
          width: { xs: 0, md: sidebarWidth },
          flexShrink: 0,
          display: { xs: "none", md: "block" },
          transition: "width 0.3s ease-in-out",
          bgcolor:
            theme.palette.mode === "dark"
              ? "#222"
              : "var(--menu-gradient) !important",
          position: "fixed",
          top: 0,
          left: 0,
          // bottom: 0,
          zIndex: 1200,
          overflowY: "auto",
          overflowX: "hidden",
        }}
        className="sidebar-wrapper"
        onMouseEnter={() => !menuFlag && setToggle(false)}
        onMouseLeave={() => !menuFlag && setToggle(true)}
      >
        <Box
          display={"flex"}
          justifyContent={"center"}
          alignItems={"center"}
          pt={2}
        >
          <Logo toggle={toggle} color="#fff" />
        </Box>
        <Box component={"div"} p={"14px"}>
          <Box display={toggle ? "none" : "block"}>
            <InputComponent
              placeholder="Search Menu Items"
              className="menu-search"
              sx={{
                bgcolor: "#fff",
                borderRadius: "24px",
                "& fieldset": {
                  borderRadius: "24px",
                },
                "& input::placeholder": {
                  color: "#3a8484",
                  fontSize: 14,
                },
                "& input": {
                  lineHeight: "32px",
                },
              }}
              onChange={(e) => setSearchQuery(e.target.value)}
              variant="outlined"
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <Box borderRight={"2px solid #e0e0e0"}>
                        <ButtonComponent
                          className="transparent-icon-btn"
                          sx={{
                            minWidth: 0,
                            p: "6px 10px 6px 12px",
                          }}
                        >
                          <FaFilter color="#A6A6A6" />
                        </ButtonComponent>
                      </Box>
                      <Box
                        className="d-grid-center"
                        sx={{
                          "& svg": {
                            transform: "rotate(90deg)",
                          },
                        }}
                        pl={1}
                      >
                        <RiSearch2Fill opacity={0.5} />
                      </Box>
                    </InputAdornment>
                  ),
                },
              }}
              size="small"
            />
          </Box>
        </Box>
        <AdminSidebar modules={filteredMenuList} />
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          ml: { xs: 0, md: `${sidebarWidth}px` },
          transition: "margin-left 0.3s ease-in-out",
          background: "#f4f4f4",
          minHeight: "100vh",
          width: { xs: "100%", md: `calc(100% - ${sidebarWidth}px)` },
          position: "relative",
        }}
      >
        <AdminHeader
          toggleMenu={toggleMenu}
          unitData={unitData}
          selectedUnitId={selectedUnitId}
          setSelectedUnitId={setSelectedUnitId}
          toggle={toggle}
          trackBg={trackBg}
        />
        <Box
          pb={0}
          px={{ xs: 1, sm: 2 }}
          mt={9}
          sx={{
            position: "relative",
            zIndex: 6,
            width: "100%",
            maxWidth: "100%",
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}
