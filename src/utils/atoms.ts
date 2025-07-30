import dayjs, { Dayjs } from "dayjs";
import { atom } from "recoil";

interface NotificationMessage {
  logId: number;
  message: string;
  title: string;
  timestamp: string;
  type: string;
}

export const toggleSidebar = atom({
  key: "sidebar-toggle",
  default: true,
});
export const mobileSidebarState = atom({
  key: "mobileSidebar",
  default: false,
});

export const UserData = atom({
  key: "user-data-from-token",
  default: {
    name: "",
    email: "",
    userId: "",
    companyId: "",
    unitId: "",
    divisionId: "",
    companyName: "",
    unitName: "",
    oldUnitId: "",
    groupCode: "",
    firstName: "",
    lastName: "",
  },
});

export const UserMenu = atom({
  key: "menu-based-on-roles",
  default: [],
});

export const WorkOrderFilter = atom({
  key: "filters",
  default: {
    startDate: dayjs(new Date()).subtract(1, "month") as Dayjs | null,
    endDate: dayjs(new Date()) as Dayjs | null,
    department: null as any,
    machine: null as any,
    type: null as any,
  },
});

export const WorkOrderMachineData = atom({
  key: "work-order-machine-data",
  default: [],
});

export const AssetCheckedList = atom({
  key: "asset-checked-list",
  default: [],
});

export const SignalRNotifications = atom<NotificationMessage[]>({
  key: "SignalRNotifications",
  default: [],
});
