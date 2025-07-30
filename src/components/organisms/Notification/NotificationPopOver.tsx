import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Button,
  Avatar,
  Divider,
  Paper,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemButton,
  Chip,
  useTheme,
  alpha,
} from "@mui/material";
import {
  IoNotifications,
  IoCheckmarkCircle,
  IoCart,
  IoCard,
  IoWarning,
} from "react-icons/io5";
import dayjs from "dayjs";

const typeIconMap: any = {
  WorkOrder: { icon: <IoCart size={20} />, colorKey: "info" },
  Schedule: { icon: <IoCard size={20} />, colorKey: "primary" },
  Request: { icon: <IoWarning size={20} />, colorKey: "warning" },
};

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

interface NotificationPopOverProps {
  notificationData: ApiNotification[];
}

const formatTimestamp = (timestamp: string): string => {
  const dateObj = new Date(timestamp);
  return dayjs(dateObj).format("DD-MM-YYYY hh:mm A");
};

const NotificationPopOver: React.FC<NotificationPopOverProps> = ({
  notificationData,
}) => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState<number>(0);

  const [notifications, setNotifications] = useState<ApiNotification[]>([]);

  useEffect(() => {
    setNotifications(notificationData);
  }, [notificationData]);

  const unreadCount = notifications.filter(
    (n) => n.readStatus === "UnRead"
  ).length;
  const readCount = notifications.filter((n) => n.readStatus === "Read").length;

  const getFilteredNotifications = (): ApiNotification[] => {
    switch (activeTab) {
      case 1:
        return notifications.filter((n) => n.readStatus === "UnRead");
      case 2:
        return notifications.filter((n) => n.readStatus === "Read");
      default:
        return notifications;
    }
  };

  function markAsRead(id: number) {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, readStatus: "Read" } : n))
    );
  }

  function markAllAsRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, readStatus: "Read" })));
  }
  const getAvatarColor = (type: string) => {
    const colorKey = typeIconMap[type]?.colorKey || "secondary";
    return (theme.palette as any)[colorKey]?.main || theme.palette.grey[500];
  };

  const filteredNotifications = getFilteredNotifications();

  return (
    <Paper
      elevation={8}
      sx={{
        width: 450,
        overflow: "hidden",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
      }}
    >
      <Box
        sx={{
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
          color: "white",
          p: 3,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Box
              sx={{
                p: 1.5,
                bgcolor: alpha("#fff", 0.2),
                borderRadius: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <IoNotifications size={24} />
            </Box>
            <Box>
              <Typography variant="h6" fontWeight="bold">
                Notifications
              </Typography>
              <Typography variant="body2" sx={{ color: alpha("#fff", 0.8) }}>
                Stay updated with your activities
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
      <Box>
        <Box
          sx={{ borderBottom: 1, borderColor: "divider", bgcolor: "grey.50" }}
        >
          <Tabs
            value={activeTab}
            onChange={(_, val: number) => setActiveTab(val)}
            variant="fullWidth"
            sx={{
              "& .MuiTab-root": {
                textTransform: "none",
                fontWeight: 600,
                minHeight: 60,
              },
            }}
          >
            <Tab
              label={
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <span>All</span>
                  <Chip
                    label={notifications.length}
                    size="small"
                    variant="filled"
                    sx={{
                      height: 20,
                      fontSize: "0.75rem",
                      bgcolor: activeTab === 0 ? "primary.main" : "grey.300",
                      color: activeTab === 0 ? "white" : "text.secondary",
                    }}
                  />
                </Box>
              }
            />
            <Tab
              label={
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <span>Unread</span>
                  <Chip
                    label={unreadCount}
                    size="small"
                    variant="filled"
                    sx={{
                      height: 20,
                      fontSize: "0.75rem",
                      bgcolor: activeTab === 1 ? "primary.main" : "grey.300",
                      color: activeTab === 1 ? "white" : "text.secondary",
                    }}
                  />
                </Box>
              }
            />
            <Tab
              label={
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <span>Read</span>
                  <Chip
                    label={readCount}
                    size="small"
                    variant="filled"
                    sx={{
                      height: 20,
                      fontSize: "0.75rem",
                      bgcolor: activeTab === 2 ? "primary.main" : "grey.300",
                      color: activeTab === 2 ? "white" : "text.secondary",
                    }}
                  />
                </Box>
              }
            />
          </Tabs>
        </Box>
        <Box maxHeight={"77dvh"} sx={{ overflow: "auto" }}>
          {filteredNotifications.length === 0 ? (
            <Box
              sx={{
                p: 4,
                textAlign: "center",
                color: "text.secondary",
              }}
            >
              <Avatar
                sx={{
                  width: 64,
                  height: 64,
                  mx: "auto",
                  mb: 2,
                  bgcolor: "grey.100",
                  color: "grey.400",
                }}
              >
                <IoNotifications size={32} />
              </Avatar>
              <Typography variant="h6" fontWeight="600" color="text.primary">
                No notifications
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                You're all caught up!
              </Typography>
            </Box>
          ) : (
            <List disablePadding sx={{ height: "100%" }}>
              {filteredNotifications.map((notification, index) => (
                <React.Fragment key={notification.id}>
                  <ListItem
                    disablePadding
                    sx={{
                      bgcolor:
                        notification.readStatus === "UnRead"
                          ? alpha(theme.palette.primary.main, 0.13)
                          : "transparent",
                      borderLeft:
                        notification.readStatus === "UnRead"
                          ? `4px solid ${theme.palette.primary.main}`
                          : "none",
                    }}
                  >
                    <ListItemButton
                      onClick={() => markAsRead(notification.id)}
                      sx={{
                        py: 2,
                        px: 3,
                        "&:hover": {
                          bgcolor: alpha(theme.palette.primary.main, 0.05),
                        },
                      }}
                    >
                      <ListItemAvatar>
                        <Avatar
                          sx={{
                            bgcolor: alpha(
                              getAvatarColor(notification.moduleName),
                              0.1
                            ),
                            color: getAvatarColor(notification.moduleName),
                          }}
                        >
                          {typeIconMap[notification.moduleName]?.icon || (
                            <IoNotifications size={20} />
                          )}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                            }}
                          >
                            <Typography
                              variant="subtitle2"
                              fontWeight={
                                notification.readStatus === "UnRead" ? 700 : 600
                              }
                              color="text.primary"
                            >
                              {notification.moduleName +
                                " " +
                                notification.eventType}
                            </Typography>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                              }}
                            >
                              {notification.readStatus === "UnRead" && (
                                <Box
                                  sx={{
                                    width: 8,
                                    height: 8,
                                    bgcolor: "primary.main",
                                    borderRadius: "50%",
                                  }}
                                />
                              )}
                              <Typography
                                variant="caption"
                                color="#525252"
                                fontWeight={600}
                              >
                                {formatTimestamp(notification.timestamp)}
                              </Typography>
                            </Box>
                          </Box>
                        }
                        secondary={
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                              mt: 0.5,
                              display: "-webkit-box",
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: "vertical",
                              overflow: "hidden",
                            }}
                          >
                            {notification.messageText}
                          </Typography>
                        }
                      />
                    </ListItemButton>
                  </ListItem>
                  {index < filteredNotifications.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          )}
        </Box>
      </Box>
      <Box
        sx={{
          p: 0,
          bgcolor: "grey.50",
          borderTop: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Button
          fullWidth
          variant="text"
          sx={{
            textTransform: "none",
            fontWeight: 600,
            py: 1.5,
            color: "primary.main",
            "&:hover": {
              bgcolor: alpha(theme.palette.primary.main, 0.05),
            },
          }}
        >
          View All Notifications
        </Button>
      </Box>
    </Paper>
  );
};

export default NotificationPopOver;
