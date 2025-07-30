import { useEffect, useRef, useState } from "react";
import { getSignalRConnection } from "../../../utils/lib";

interface SignalRMessage {
  logId: number;
  message: string;
  title: string;
  timestamp: string;
  type: string;
}

export interface ApiNotification {
  id: number;
  moduleName: string;
  eventType: string;
  targetType: string;
  channelName: string;
  actionStatus: string;
  readStatus: "UnRead" | "Read";
  messageText: string;
  timestamp: string;
  createdBy: number;
  createdDate: string;
  createdByName: string;
  createdIP: string;
  sendTo: string;
}

export const useNotificationSignalR = () => {
  const [realtimeNotifications, setRealtimeNotifications] = useState<
    ApiNotification[]
  >([]);
  const receivedLogIds = useRef<Set<number>>(new Set());

  useEffect(() => {
    const connection = getSignalRConnection();

    connection.on("ReceiveNotification", (msg: SignalRMessage) => {
      console.log("📩 SignalR message received:", msg);

      if (!receivedLogIds.current.has(msg.logId)) {
        receivedLogIds.current.add(msg.logId);

        const transformed: ApiNotification = {
          id: msg.logId,
          moduleName: msg.title,
          eventType: msg.type,
          targetType: "",
          channelName: "",
          actionStatus: "",
          readStatus: "UnRead",
          messageText: msg.message,
          timestamp: msg.timestamp,
          createdBy: 0,
          createdDate: msg.timestamp,
          createdByName: "",
          createdIP: "",
          sendTo: "",
        };

        setRealtimeNotifications((prev) => [...prev, transformed]);
      } else {
        console.log("⚠️ Duplicate message skipped:", msg.logId);
      }
    });

    connection
      .start()
      .catch((err) => console.error("SignalR connection error:", err));

    // return () => {
    //   connection.stop();
    // };
  }, []);

  return realtimeNotifications;
};
