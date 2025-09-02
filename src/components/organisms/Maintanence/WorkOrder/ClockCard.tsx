import { Box, Card, IconButton, Chip } from "@mui/material";
import { MuiText } from "bsoft-base-elements";
import { ClockCardProps } from"../../../../types/maintanenceTypes";
import React, { useCallback } from "react";
import {
  FaArrowRightLong,
  FaPause,
  FaPlay,
  FaStop,
  FaCircle,
} from "react-icons/fa6";
import dayjs from "dayjs";
import Link from "next/link";

function ClockCard(props: ClockCardProps) {
  const { clockData, clockState, handleToggle } = props;

  const clockStatus = clockData?.scheduleStatus ?? "";

  const renderStatusBadge = (status: string) => {
    if (status === "start" || status === "resume") {
      let borderColor = "#dd5061";
      let label = "Open";
      let icon = <FaPlay style={{ marginRight: 4 }} />;

      if (status === "start" || status === "resume") {
        borderColor = "#FFA500";
        label = "In Progress";
        icon = <FaPause style={{ marginRight: 4 }} />;
      }

      return (
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: "50%",
            transform: "translateX(-50%)",
            padding: "4px 12px",
            border: `2px solid ${borderColor}`,
            borderRadius: "20px",
            backgroundColor: "#fff",
            color: borderColor,
            fontWeight: 600,
            fontSize: "12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            animation: "pulse 1.5s infinite",
            "@keyframes pulse": {
              "0%": {
                boxShadow: `0 0 0 0 ${borderColor}`,
              },
              "70%": {
                boxShadow: `0 0 10px 5px rgba(0, 0, 0, 0)`,
              },
              "100%": {
                boxShadow: `0 0 0 0 rgba(0, 0, 0, 0)`,
              },
            },
          }}
        >
          {label}
        </Box>
      );
    }

    return null;
  };

  const getStatusChipColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "cancelled":
        return { bg: "#ffebee", text: "#c62828", icon: "#c62828" };
      case "closed":
        return { bg: "#e0f2f1", text: "#00796b", icon: "#00796b" };
      case "hold":
        return { bg: "#fff8e1", text: "#ff8f00", icon: "#ff8f00" };
      case "inprogress":
        return { bg: "#e8f5e9", text: "#2e7d32", icon: "#2e7d32" };
      case "open":
        return { bg: "#ff000040", text: "#ff0000", icon: "#ff0000" };
      default:
        return { bg: "#f5f5f5", text: "#757575", icon: "#757575" };
    }
  };

  const renderClockStatusChip = () => {
    if (!clockStatus) return null;

    const colors = getStatusChipColor(clockStatus);

    return (
      <Chip
        icon={<FaCircle size={8} color={colors.icon} />}
        label={clockStatus}
        sx={{
          backgroundColor: colors.bg,
          color: colors.text,
          fontWeight: 500,
          fontSize: "11px",
          height: "24px",
          borderRadius: "12px",
          ml: 1,
        }}
        size="small"
      />
    );
  };

  const itemState = clockState.get(clockData?.id);
  const action = itemState?.action || "default";

  const renderActionButtons = useCallback(() => {
    if (clockStatus !== "") {
      switch (clockStatus.toLowerCase()) {
        case "open":
          return (
            <IconButton onClick={() => handleToggle("InProgress")}>
              <FaPlay color="#42AAEA" />
            </IconButton>
          );
        case "inprogress":
          return (
            <Box display="flex" gap={2} position={"relative"}>
              <IconButton onClick={() => handleToggle("Hold")}>
                <FaPause color="#42AAEA" />
              </IconButton>
              <IconButton onClick={() => handleToggle("Closed")}>
                <FaStop color="#42AAEA" />
              </IconButton>
            </Box>
          );
        case "hold":
          return (
            <Box display="flex" gap={2} position={"relative"}>
              <IconButton onClick={() => handleToggle("InProgress")}>
                <FaPlay color="#42AAEA" />
              </IconButton>
              <IconButton onClick={() => handleToggle("Closed")}>
                <FaStop color="#42AAEA" />
              </IconButton>
            </Box>
          );
        case "Closed":
          return (
            <IconButton onClick={() => handleToggle("start")}>
              <FaPlay color="#42AAEA" />
            </IconButton>
          );
        default:
          return (
            <IconButton onClick={() => handleToggle("InProgress")}>
              <FaPlay color="#42AAEA" />
            </IconButton>
          );
      }
    }
  }, [clockStatus]);

  return (
    <Card
      variant="outlined"
      sx={{
        p: 2,
        borderRadius: "12px",
        // position: "relative",
        "@media (max-width: 600px)": {
          p: 1,
        },
      }}
    >
      {/* {renderWorkOrderStatusRibbon()} */}
      <Box
        display={"flex"}
        justifyContent={"space-between"}
        alignItems={"center"}
        position={"relative"}
        flexWrap="wrap"
      >
        <Box>
          <Box display="flex" alignItems="center">
            <MuiText
              // variant="h6"
              fontWeight={500}
              fontSize={13}
              color="#0C4150"
              sx={{
                "@media (max-width: 600px)": {
                  fontSize: 11,
                },
              }}
            >
              WO: {clockData?.workOrderDocNo}
            </MuiText>
            {renderClockStatusChip()}
          </Box>
          <MuiText
            // variant="h6"
            fontWeight={500}
            fontSize={17}
            color="#0C4150"
            mt={1}
            sx={{
              "@media (max-width: 600px)": {
                fontSize: 14,
              },
            }}
          >
            Machine - {clockData?.machineName}
          </MuiText>
          <MuiText
            // variant="h6"
            fontWeight={500}
            fontSize={13}
            color="#0C4150"
            mt={1}
            sx={{
              "@media (max-width: 600px)": {
                fontSize: 14,
              },
            }}
          >
            Code - {clockData?.machine}
          </MuiText>
        </Box>
        {renderStatusBadge(action)}
        {!clockData?.isRestricted && (
          <Box position={"relative"} top={-8}>
            {renderActionButtons()}
          </Box>
        )}
      </Box>

      <Box
        display={"flex"}
        justifyContent={"space-between"}
        alignItems={"center"}
        mt={1}
        flexWrap="wrap"
      >
        {typeof clockStatus === "string" &&
          clockStatus.toLowerCase() === "closed" && (
            <MuiText
              // variant="h6"
              fontWeight={500}
              fontSize={13}
              color="#0C4150"
              sx={{
                "@media (max-width:  600px)": {
                  fontSize: 11,
                },
              }}
            >
              From: {`${dayjs(clockData?.startTime).format("hh:mm a")}`} - To:{" "}
              {`${dayjs(clockData?.endTime).format("hh:mm a")}`}
            </MuiText>
          )}

        <MuiText
          // variant="h6"
          fontWeight={500}
          fontSize={13}
          color="#0C4150"
          sx={{
            "@media (max-width: 600px)": {
              fontSize: 11,
            },
          }}
        >
          {clockData?.duration > 0
            ? ` Duration: ${clockData?.duration.toFixed(2)}hrs`
            : ``}
        </MuiText>
      </Box>

      <Box
        display={"flex"}
        justifyContent={"space-between"}
        alignItems={"center"}
        mt={1}
        borderTop={"1px solid #DFDFDF"}
        pt={1.5}
        flexWrap="wrap"
      >
        <MuiText
          // variant="h6"
          fontWeight={500}
          fontSize={13}
          color="#0C4150"
          sx={{
            "@media (max-width: 600px)": {
              fontSize: 11,
            },
          }}
        >
          Req Date:{" "}
          {`${dayjs(clockData?.requestDate).format("DD-MM-YYYY")}`}
        </MuiText>
        <MuiText
          // variant="h6"
          fontWeight={500}
          fontSize={13}
          color="#0C4150"
          sx={{
            "@media (max-width: 600px)": {
              fontSize: 11,
            },
          }}
        >
          Req Id: {`${clockData?.requestId}`}
        </MuiText>
        <Link href={`/maintanence/work-order-detail/${clockData?.id}`}>
          <FaArrowRightLong size={20} />
        </Link>
      </Box>
    </Card>
  );
}

export default ClockCard;
