import axios, { AxiosRequestConfig } from "axios";
import { NextResponse } from "next/server";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import dayjs, { Dayjs } from "dayjs";
import {
  Autocomplete,
  styled,
  Switch,
  TableCell,
  tableCellClasses,
  TableRow,
  TextField,
} from "@mui/material";
import { MuiButton } from "bsoft-base-elements";
import * as signalR from "@microsoft/signalr";
import { getBaseUrl } from "./apiBaseUrl";
import { apiDomainConfig } from "./apiDomains";

export type ApiResponse<T = any> = T;

export function getApiBaseUrl(mod: string): string {
  const hostname = window.location.hostname;
  const config = apiDomainConfig[hostname] || apiDomainConfig["121.200.49.254"];
  switch (mod) {
    case "fam":
      return config.fam || config.base || "";
    case "main":
      return config.main || config.base || "";
    case "bg":
      return config.bg || config.base || "";
    default:
      return config.base || "";
  }
}

export const Apirequest = async <T = any>(
  endpoint: string,
  method: string,
  data?: Record<string, any> | FormData | null,
  module?: string
): Promise<ApiResponse<T> | NextResponse> => {
  const mod = module || "base";

  const baseURL = getApiBaseUrl(mod);

  const token = Cookies.get("bsoft");

  const isAuthPage =
    typeof window !== "undefined" &&
    (window.location.pathname === "/bsoft/login" ||
      window.location.pathname === "/bsoft/forgot-password");

  if (!token && !isAuthPage) {
    if (typeof window !== "undefined") {
      window.location.href = "/bsoft/login";
    } else {
      return NextResponse.redirect(new URL("/bsoft/login", baseURL));
    }
    return Promise.reject("Token not found, redirecting to login...");
  }
  const config: AxiosRequestConfig = {
    url: `${baseURL}/${endpoint}`,
    method,
    data,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  try {
    const response = await axios(config);
    return response as ApiResponse<T>;
  } catch (error: any) {
    console.error("API Request Error:", error);
    if (error.response?.statusText?.toLowerCase() === "unauthorized") {
      Cookies.remove("bsoft");
      if (typeof window !== "undefined") {
        window.location.href = "/bsoft/login";
      }
    }
    return error?.response;
  }
};

function stringToColor(string: string) {
  let hash = 0;
  let i;

  /* eslint-disable no-bitwise */
  for (i = 0; i < string?.length; i += 1) {
    hash = typeof string === "string" ? string.charCodeAt(i) + ((hash << 5) - hash) : 0
  }

  let color = "#";

  for (i = 0; i < 3; i += 1) {
    const value = (hash >> (i * 8)) & 0xff;
    color += `00${value.toString(16)}`.slice(-2);
  }
  /* eslint-enable no-bitwise */

  return color;
}

export function stringAvatar(name: string) {
  const checkSpace = typeof name === "string" ? name?.split(" ") ?? [] : ""

  return {
    sx: {
      bgcolor: stringToColor(name),
    },
    children:
      checkSpace.length === 1
        ? `${name?.at(0)}`
        : `${typeof name === "string" && name?.split(" ")[0][0]}${typeof name === "string" && name?.split(" ")[1][0]}`,
  };
}

export const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export const gstRegex =
  /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}[Z]{1}[0-9A-Z]{1}$/;

export const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;

export const tinRegex = /^[0-9]{11}$|^[0-9]{10}[A-Z]{1}$/;

export const tanRegex = /^[A-Z]{4}[0-9]{5}[A-Z]{1}$/;

export const websiteRegex =
  /^(https?:\/\/)?(www\.)?[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(\/[^\s]*)?$/;

export const tokenDecode = (token: string) => {
  try {
    const decoded = jwtDecode(token);
    return decoded as Record<string, any>;
  } catch (error) {
    console.error("Invalid token", error);
  }
};

export const emailTemplate = (
  verificationCode: string,
  username: string,
  expiryMinutes: string
) => {
  return `<!DOCTYPE html>
<html>
<head>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #F9F9F9;
            margin: 0;
            padding: 0;
        }
        .header {
            background-color: #4CAF50;
            color: white;
            padding: 10px;
            text-align: center;
            font-size: 24px;
        }
        .content {
            padding: 20px;
            background-color: #FFFFFF;
            margin: 20px auto;
            border: 1px solid #ddd;
            border-radius: 5px;
            max-width: 600px;
        }
        .footer {
            text-align: center;
            font-size: 12px;
            color: #777;
            padding: 10px;
            background-color: #F1F1F1;
            border-top: 1px solid #ddd;
        }
        .footer p {
            margin: 5px 0;
        }
    </style>
</head>
<body>
    <div class="header">Bannari Mills Notification</div>
    <div class="content">
   Dear ${username},<br><br>
        We have received a request to reset your password.<br>
        To proceed with resetting your password, please use the verification code below:<br><br>
        Username: ${username}<br>
        Verification Code: ${verificationCode}<br>
        Note: Verification Code will expire in ${expiryMinutes} minutes<br><br>
        Regards,<br>
        Bannari Mills Team
    </div>
    <div class="footer">
        <p>&copy; ${new Date().getFullYear()} Bannari Mills. All rights reserved.</p>
        <p><strong>Note:</strong> This is an automated email. Please do not reply to this email address.</p>
    </div>
</body>
</html>`;
};

interface MenuPrivilege {
  id: number;
  canAdd: number;
  canView: number;
  canUpdate: number;
  canDelete: number;
  canExport: number;
  canApprove: number;
}

interface Menu {
  id: number;
  menuName: string;
  menuUrl: string;
  menuPrivileages: MenuPrivilege[];
  childMenus: Menu[];
}

interface Module {
  id: number;
  moduleName: string;
  menus: Menu[];
}

export const filterMenuItems = (modules: Module[], query: string): Module[] => {
  if (!query) return modules;

  const searchTerm = query.toLowerCase().trim();

  const searchInMenu = (menu: Menu): boolean => {
    if (menu.menuName?.toLowerCase().includes(searchTerm)) {
      return true;
    }

    if (menu.childMenus?.some((child) => searchInMenu(child))) {
      return true;
    }

    return false;
  };

  const filterMenu = (menu: Menu): Menu | null => {
    const menuNameMatches = menu.menuName?.toLowerCase().includes(searchTerm);

    const filteredChildren =
      (menu.childMenus
        ?.map((child) => filterMenu(child))
        .filter((child) => child !== null) as Menu[]) || [];

    if (menuNameMatches || filteredChildren.length > 0) {
      return {
        ...menu,
        childMenus: filteredChildren,
      };
    }

    return null;
  };

  const filteredModules = modules.reduce((result: Module[], module) => {
    const filteredMenus = module.menus
      .map((menu) => filterMenu(menu))
      .filter((menu) => menu !== null) as Menu[];

    if (filteredMenus.length > 0) {
      result.push({
        ...module,
        menus: filteredMenus,
      });
    }

    return result;
  }, []);

  return filteredModules;
};

const ROLES = {
  admin: [
    "canAdd",
    "canView",
    "canUpdate",
    "canDelete",
    "canExport",
    "canApprove",
  ],
} as const;

export type Role = keyof typeof ROLES;
type Permission = (typeof ROLES)[Role][number];

export function hasPermission(role: Role, permission: Permission): boolean {
  return (ROLES[role] as readonly Permission[]).includes(permission);
}

export const assetGradient =
  "linear-gradient(289deg, rgba(16,120,105,1) 0%, rgba(92,216,90,1) 62%)";

export const parseDateString = (dateString: string | undefined) => {
  if (!dateString) return null;
  const [date] = dateString.split(" ");
  const [day, month, year] = date.split("-");
  return dayjs(`${year}-${month}-${day}`);
};

export const StyledButton = styled(MuiButton)(({ theme }) => ({
  borderRadius: "8px",
  padding: "8px 24px",
  textTransform: "capitalize",
  fontWeight: 500,
  transition: "all 0.3s ease",
  "&:hover": {
    transform: "translateY(-2px)",
  },
}));

export const StyledDatePickerTextField = styled(TextField)(({ theme }) => ({
  "& .MuiOutlinedInput-root": {
    height: "44px",
    fontSize: "0.9rem",
    backgroundColor: theme.palette.background.paper,
    borderRadius: "8px",
    transition: "all 0.2s ease-in-out",
    "&:hover": {
      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    },
    "&.Mui-focused": {
      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
    },
    "& fieldset": {
      borderColor: theme.palette.grey[300],
      borderWidth: "1px",
    },
    "&:hover fieldset": {
      borderColor: theme.palette.primary.main,
    },
    "&.Mui-focused fieldset": {
      borderColor: theme.palette.primary.main,
      borderWidth: "2px",
    },
  },
}));

export const StyledAutocomplete = styled(Autocomplete)(({ theme }) => ({
  "& .MuiOutlinedInput-root": {
    // height: "40px",
    fontSize: "0.9rem",
    backgroundColor: theme.palette.background.paper,
    borderRadius: "8px",
    transition: "all 0.2s ease-in-out",
    "&:hover": {
      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    },
    "&.Mui-focused": {
      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
    },
    "& fieldset": {
      borderColor: theme.palette.grey[300],
      borderWidth: "1px",
    },
    "&:hover fieldset": {
      borderColor: theme.palette.primary.main,
    },
    "&.Mui-focused fieldset": {
      borderColor: theme.palette.primary.main,
      borderWidth: "2px",
    },
  },
}));

export const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: "#BBDBDB",
    color: theme.palette.common.black,
    borderRight: "1px solid #D8D8D8",
    padding: "8px",
  },
  [`&.${tableCellClasses.body}`]: {
    backgroundColor: "#fff",
    fontSize: 14,
    borderRight: "1px solid #D8D8D8",
    padding: "8px",
  },
}));

export const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:nth-of-type(odd)": {
    backgroundColor: theme.palette.action.hover,
  },
  "&:last-child td, &:last-child th": {
    borderBottom: 0,
  },
}));

export const CustomSwitch = styled(Switch)(() => ({
  width: 60,
  height: 36,
  padding: 5,
  "& .MuiSwitch-switchBase": {
    padding: 2,
    transform: "translateX(5px)",

    "&.Mui-checked": {
      transform: "translateX(30px)",
      color: "#004358",
      "& + .MuiSwitch-track": {
        backgroundColor: "#fff",
      },
      "& .MuiSwitch-thumb": {
        backgroundColor: "#004358",
        borderColor: "#e8e8e8",
      },
    },
  },
  "& .MuiSwitch-track": {
    borderRadius: 50,
    backgroundColor: "#fff",
    opacity: 1,
    transition: "background-color 0.2s ease",
    border: "1px solid #e8e8e8",
  },
  "& .MuiSwitch-thumb": {
    position: "relative",
    top: "5px",
    border: "4px solid #e8e8e8",
    background: "#ccc",
    transition: "background-color 0.3s, border-color 0.3s",
  },
}));

export function formatIndianCurrency(amount: string) {
  if (amount) {
    const [integer, decimal] = amount.toString().split(".");
    const lastThree = integer.slice(-3);
    const otherNumbers = integer.slice(0, -3);
    const formatted =
      otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") +
      (otherNumbers ? "," : "") +
      lastThree;
    return decimal ? `${formatted}.${decimal}` : formatted;
  }
}

export function DateFormatter(date: Dayjs | string) {
  return dayjs(date).format("DD/MM/YYYY");
}

let connection: signalR.HubConnection | null = null;

export const getSignalRConnection = (): signalR.HubConnection => {
  if (!connection) {
    connection = new signalR.HubConnectionBuilder()
      .withUrl(`${process.env.NEXT_PUBLIC_SERVICE_URL}/notificationHub`, {
        accessTokenFactory: () => Cookies.get("bsoft") || "",
      })
      .configureLogging(signalR.LogLevel.Information)
      .withAutomaticReconnect()
      .build();

    connection
      .start()
      .then(() => {
        console.log("✅ SignalR connected");
      })
      .catch((err) => {
        console.error("❌ SignalR Connection failed:", err);
      });
  }
  return connection;
};

export const connectToHub = async (
  onReceiveMessage: (message: any) => void
): Promise<void> => {
  try {
    const conn = getSignalRConnection();

    conn.off("ReceiveMessage");
    conn.off("receiveMessage");
    conn.off("ReceiveNotification");
    conn.off("receiveNotification");
    conn.off("NotificationReceived");
    conn.off("SendMessage");
    conn.off("BroadcastMessage");

    const methodNames = [
      "ReceiveMessage",
      "receiveMessage",
      "ReceiveNotification",
      "receiveNotification",
      "NotificationReceived",
      "SendMessage",
      "BroadcastMessage",
      "Notification",
      "Message",
    ];

    methodNames.forEach((methodName) => {
      conn.on(methodName, (...args) => {
        const messageData = args.length === 1 ? args[0] : args;
        onReceiveMessage?.(messageData);
      });
    });

    conn.onreconnected((connectionId) => {
      methodNames.forEach((methodName) => {
        conn.on(methodName, (...args) => {
          const messageData = args.length === 1 ? args[0] : args;
          onReceiveMessage?.(messageData);
        });
      });
    });

    if (conn.state === signalR.HubConnectionState.Disconnected) {
      await conn.start();

      try {
        await conn.invoke("JoinGroup", "test-group");
      } catch (invokeError) {
        console.log(invokeError);
      }

      try {
        const result = await conn.invoke("Echo", "test message from client");
      } catch (echoError) {
        console.log(echoError);
      }
    } else {
    }
  } catch (error) {
    console.error("💥 Connection failed:", error);
    connection = null;
    throw error;
  }
};

export const disconnectFromHub = async (): Promise<void> => {
  if (
    connection &&
    connection.state !== signalR.HubConnectionState.Disconnected
  ) {
    try {
      await connection.stop();
    } catch (err) {
      console.error("❌ Error disconnecting:", err);
    }
    connection = null;
  }
};

class SubmitManager {
  private submitting = false;
  startLoading() {
    this.submitting = true;
  }
  stopLoading() {
    this.submitting = false;
  }
  isSubmitting() {
    return this.submitting;
  }
}
const submitManager = new SubmitManager();
export const startLoading = () => submitManager.startLoading();
export const stopLoading = () => submitManager.stopLoading();
export const isSubmitting = () => submitManager.isSubmitting();

export function validateArray(arr: any[]) {
  return Array.isArray(arr);
}
