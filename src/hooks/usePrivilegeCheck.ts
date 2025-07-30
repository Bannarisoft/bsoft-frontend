import { useState, useEffect, useCallback } from "react";
import { useRecoilValue } from "recoil";
import { UserMenu } from "../utils/atoms";

interface Privilege {
  id: number;
  canAdd: number;
  canView: number;
  canUpdate: number;
  canDelete: number;
  canExport: number;
  canApprove: number;
}

interface MenuItem {
  id: number;
  menuName: string;
  menuUrl: string;
  menuPrivileages: Privilege[];
  childMenus: MenuItem[];
}

interface Module {
  id: number;
  moduleName: string;
  menus: MenuItem[];
}

export const usePrivilegeCheck = (pathname: string) => {
  const [privileges, setPrivileges] = useState<Privilege[]>([]);
  const [permissions, setPermissions] = useState({
    canAdd: false,
    canView: false,
    canUpdate: false,
    canDelete: false,
    canExport: false,
    canApprove: false,
  });

  const userMenu = useRecoilValue(UserMenu) as Module[];

  const findPrivilegesInMenu = useCallback(
    (items: MenuItem[]): Privilege[] | null => {
      if (!Array.isArray(items)) return null;

      for (const item of items) {
        // Check current menu item
        if (item.menuUrl === pathname) {
          return item.menuPrivileages;
        }

        // Check child menus
        if (item.childMenus?.length > 0) {
          const nestedPrivileges = findPrivilegesInMenu(item.childMenus);
          if (nestedPrivileges) {
            return nestedPrivileges;
          }
        }
      }
      return null;
    },
    [pathname]
  );

  useEffect(() => {
    if (Array.isArray(userMenu) && userMenu.length > 0 && pathname) {
      for (const module of userMenu) {
        // Check menus in each module
        if (Array.isArray(module.menus)) {
          const foundPrivileges = findPrivilegesInMenu(module.menus);
          if (foundPrivileges) {
            setPrivileges(foundPrivileges);
            break;
          }
        }
      }
    }
  }, [userMenu, pathname, findPrivilegesInMenu]);

  useEffect(() => {
    if (Array.isArray(privileges) && privileges.length > 0) {
      const newPermissions = privileges.reduce(
        (acc, privilege) => {
          Object.entries(privilege).forEach(([key, value]) => {
            if (key !== "id" && value === 1) {
              acc[key as keyof typeof acc] = true;
            }
          });
          return acc;
        },
        { ...permissions }
      );

      setPermissions(newPermissions);
    }
  }, [privileges]);

  return permissions;
};
