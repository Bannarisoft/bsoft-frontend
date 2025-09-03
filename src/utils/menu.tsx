import { ReactNode } from "react";
import { RiDashboardLine } from "react-icons/ri";
import { MdControlCamera } from "react-icons/md";
import { IoSettings } from "react-icons/io5";
import { LuLocateFixed } from "react-icons/lu";

export interface MenuItem {
  id: number;
  title: string;
  path: string;
  active: boolean;
  icon: ReactNode;
  Items?: MenuItem[];
}
export const MenuList: MenuItem[] = [
  {
    id: 1,
    title: "Dashboard",
    path: "/dashboard",
    active: true,
    icon: <RiDashboardLine />,
  },
  {
    id: 2,
    title: "Master",
    path: "",
    active: false,
    icon: <MdControlCamera />,
    Items: [
      {
        id: 1,
        title: "Country",
        path: "/master/country",
        active: false,
        icon: null,
      },
      {
        id: 2,
        title: "State",
        path: "/master/state",
        active: false,
        icon: null,
      },
      {
        id: 3,
        title: "City",
        path: "/master/city",
        active: false,
        icon: null,
      },
      {
        id: 4,
        title: "Entity",
        path: "/master/entity",
        active: false,
        icon: null,
      },
      {
        id: 5,
        title: "Company",
        path: "/master/company",
        active: false,
        icon: null,
      },
      {
        id: 6,
        title: "Division",
        path: "/master/division",
        active: false,
        icon: null,
      },
      {
        id: 7,
        title: "Unit",
        path: "/master/unit",
        active: false,
        icon: null,
      },
      {
        id: 8,
        title: "Department",
        path: "/master/department",
        active: false,
        icon: null,
      },
      {
        id: 9,
        title: "Language",
        path: "/master/language",
        active: false,
        icon: null,
      },
      {
        id: 10,
        title: "Currency",
        path: "/master/currency",
        active: false,
        icon: null,
      },
      {
        id: 11,
        title: "Role",
        path: "",
        active: false,
        icon: null,
        Items: [
          {
            id: 11.1,
            title: "Role List",
            path: "/master/role/role-list",
            active: false,
            icon: null,
          },
          {
            id: 11.2,
            title: "Role Privilege",
            path: "/master/role/role-privilege",
            active: false,
            icon: null,
          },
        ],
      },
      {
        id: 12,
        title: "Timezones",
        path: "/master/timezones",
        active: false,
        icon: null,
      },
      {
        id: 13,
        title: "Financial",
        path: "/master/financial",
        active: false,
        icon: null,
      },
      {
        id: 14,
        title: "User",
        path: "/master/user",
        active: false,
        icon: null,
      },
      {
        id: 15,
        title: "Menu",
        path: "/master/user-menu",
        active: false,
        icon: null,
      },
    ],
  },
  {
    id: 3,
    title: "Settings",
    path: "",
    active: false,
    icon: <IoSettings />,
    Items: [
      {
        id: 1.1,
        title: "Company Settings",
        path: "/settings/company-settings",
        active: false,
        icon: null,
      },
    ],
  },
  {
    id: 4,
    title: "FAM",
    path: "",
    active: false,
    icon: <LuLocateFixed />,
    Items: [
      {
        id: 4.1,
        title: "Asset Master",
        path: "",
        active: false,
        icon: null,
        Items: [
          {
            id: 4.2,
            title: "Misc Master",
            path: "/fam/master/misc",
            active: false,
            icon: null,
          },
          {
            id: 4.3,
            title: "Asset Group",
            path: "/fam/master/asset-group",
            active: false,
            icon: null,
          },
          {
            id: 4.4,
            title: "Category",
            path: "/fam/master/category",
            active: false,
            icon: null,
          },
          {
            id: 4.5,
            title: "Sub Category",
            path: "/fam/master/sub-category",
            active: false,
            icon: null,
          },
          {
            id: 4.6,
            title: "Manufacturer",
            path: "/fam/master/manufacturer",
            active: false,
            icon: null,
          },
          {
            id: 4.7,
            title: "Umo",
            path: "/fam/master/uom",
            active: false,
            icon: null,
          },
          {
            id: 4.8,
            title: "Depreciation Group",
            path: "/fam/master/depreciation-group",
            active: false,
            icon: null,
          },
          {
            id: 4.9,
            title: "Location",
            path: "/fam/master/location",
            active: false,
            icon: null,
          },
          {
            id: 4.1,
            title: "Sub Location",
            path: "/fam/master/sub-location",
            active: false,
            icon: null,
          },
        ],
      },
      {
        id: 4.6,
        title: "Asset Management",
        path: "",
        active: false,
        icon: null,
        Items: [
          {
            id: 4.7,
            title: "Asset List",
            path: "/fam/asset-management/asset-list",
            active: false,
            icon: null,
          },
          {
            id: 4.8,
            title: "Asset Import",
            path: "/fam/asset-management/asset-import",
            active: false,
            icon: null,
          },
        ],
      },
      {
        id: 4.8,
        title: "Transfer",
        path: "",
        active: false,
        icon: null,
        Items: [
          {
            id: 4.9,
            title: "Asset Transfer",
            path: "/fam/transfer/asset-transfer",
            active: false,
            icon: null,
          },
          {
            id: 4.1,
            title: "Transfer Approval",
            path: "/fam/transfer/transfer-approval",
            active: false,
            icon: null,
          },
        ],
      },
    ],
  },
];
