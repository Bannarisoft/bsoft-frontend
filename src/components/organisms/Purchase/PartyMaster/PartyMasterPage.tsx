"use client";

import React, { useEffect, useState } from "react";
import BreadcrumbsNav from "../../../atoms/ModernComponents/BreadcrumbsNav";
import { Box } from "@mui/material";
import PartyTabs from "./PartyTabs";
import { useRecoilValue } from "recoil";
import { UserMenu } from "../../../../utils/atoms";
import { validateArray } from "../../../../utils/lib";

function PartyMasterPage({ partyId }: { partyId?: string }) {
  const [pathArr, setPathArr] = useState<string[]>([]);
  const menuData = useRecoilValue(UserMenu);
  const [lastChildMenus, setLastChildMenus] = useState<any[]>([]);

  const getLastChildMenus = (menus: any[]): any[] => {
    if (!menus || menus.length === 0) return [];
    let result: any[] = [];

    menus.forEach((menu) => {
      if (menu.childMenus && menu.childMenus.length > 0) {
        const deeper = getLastChildMenus(menu.childMenus);
        result = result.concat(deeper);
      } else {
        result.push(menu);
      }
    });

    return result;
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const segments: string[] = window.location.pathname
        .split("/")
        .filter(Boolean);
      setPathArr(segments);
    }
  }, []);

  useEffect(() => {
    if (validateArray(menuData) && menuData.length > 0) {
      const purchaseModule: any = menuData.find(
        (li: any) =>
          typeof li.moduleName === "string" &&
          li.moduleName.toLowerCase() === "purchase"
      );

      if (purchaseModule) {
        const lastChildren = getLastChildMenus(purchaseModule?.menus)?.filter(
          (i) => i.type === "tab"
        );
        setLastChildMenus(lastChildren);
      }
    }
  }, [menuData]);

  return (
    <Box component={"main"}>
      <BreadcrumbsNav pathArr={pathArr} />
      <Box component={"div"} className="main-content-wrapper">
        <PartyTabs tabs={lastChildMenus} partyId={partyId ? partyId : ""} />
      </Box>
    </Box>
  );
}

export default PartyMasterPage;
