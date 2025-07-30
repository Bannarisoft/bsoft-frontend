import * as React from "react";
import Timeline from "@mui/lab/Timeline";
import TimelineItem from "@mui/lab/TimelineItem";
import TimelineSeparator from "@mui/lab/TimelineSeparator";
import TimelineConnector from "@mui/lab/TimelineConnector";
import TimelineContent from "@mui/lab/TimelineContent";
import TimelineDot from "@mui/lab/TimelineDot";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";

import dayjs from "dayjs";
import { BsCheck } from "react-icons/bs";
import { MdOutlinePendingActions, MdPending } from "react-icons/md";
import { GiCoffeeCup } from "react-icons/gi";
import { FcWorkflow } from "react-icons/fc";
import { BiSolidBadgeCheck } from "react-icons/bi";

export default function CustomizedTimeline({
  timelineData,
}: {
  timelineData: {
    startTime: string;
    endTime: string;
    isCompleted: number;
  }[];
}) {
  const calculateBreakTimes = (data: any[]) => {
    const breakTimes: { startTime: string; endTime: string }[] = [];
    for (let i = 0; i < data.length - 1; i++) {
      if (data[i].isCompleted === 1) break;
      const currentEnd = dayjs(data[i].endTime);
      const nextStart = dayjs(data[i + 1].startTime);
      if (nextStart.isAfter(currentEnd)) {
        breakTimes.push({
          startTime: currentEnd.toISOString(),
          endTime: nextStart.toISOString(),
        });
      }
    }
    return breakTimes;
  };

  const combinedTimeline = React.useMemo(() => {
    const breakTimes = calculateBreakTimes(timelineData);
    const combined: any[] = [];
    let breakIndex = 0;

    for (let i = 0; i < timelineData.length; i++) {
      combined.push({ ...timelineData[i], type: "work" });
      if (breakIndex < breakTimes.length && i < timelineData.length - 1) {
        combined.push({ ...breakTimes[breakIndex], type: "break" });
        breakIndex++;
      }
    }
    return combined;
  }, [timelineData]);

  const formatTime = (timeString: string) => {
    return dayjs(timeString).format("HH:mm:ss");
  };

  const getColor = (isCompleted: string | number, type: string | number) => {
    if (isCompleted === 1 && type === "work") {
      return "#37b3b3a1";
    } else if (isCompleted === 0 && type === "work") {
      return "#e3f2fd";
    } else {
      return "#fce4ec";
    }
  };

  return (
    <Box
      sx={{
        bgcolor: "#f5f5f5",
        borderRadius: 2,
        px: 5,
        py: 2,
        overflowX: "auto",
        boxShadow: 1,
        height: 400,
        width: 500,
        overflow: "auto",
      }}
    >
      <Timeline
        position="alternate"
        sx={{
          m: 0,
          p: 0,
          "& .MuiTimelineItem-root::before": {
            display: "none",
          },
        }}
      >
        {combinedTimeline.map((item: any, index: number) => (
          <TimelineItem
            key={index}
            sx={{
              minWidth: "150px",
            }}
          >
            <TimelineSeparator>
              <TimelineDot
                color={item.type === "work" ? "primary" : "secondary"}
                variant="outlined"
                sx={{
                  p: 1,
                  border: 2,
                  background: getColor(item.isCompleted, item.type),
                }}
              >
                {item.type === "work" && item.isCompleted === 1 ? (
                  <BiSolidBadgeCheck />
                ) : item.type === "work" && item.isCompleted === 0 ? (
                  <FcWorkflow color="primary" />
                ) : (
                  <GiCoffeeCup color="secondary" />
                )}
              </TimelineDot>
              {index < combinedTimeline.length - 1 && (
                <TimelineConnector sx={{ height: "30px" }} />
              )}
            </TimelineSeparator>
            <TimelineContent>
              <Paper
                elevation={1}
                sx={{
                  p: 1.5,
                  bgcolor: getColor(item.isCompleted, item.type),
                  borderLeft: `4px solid ${
                    item.type === "work" ? "#1976d2" : "#e91e63"
                  }`,
                }}
              >
                <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
                  {item.type === "work" ? "Work" : "Break"}
                </Typography>
                <Typography variant="body2">
                  {formatTime(item.startTime)} - {formatTime(item.endTime)}
                </Typography>
                {item.type === "work" && (
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      mt: 0.5,
                      gap: 1,
                      color: Boolean(item.isCompleted)
                        ? "success.main"
                        : "text.secondary",
                    }}
                  >
                    {Boolean(item.isCompleted) ? (
                      <BsCheck fontSize="medium" style={{ marginRight: 0.5 }} />
                    ) : (
                      <MdOutlinePendingActions
                        fontSize="medium"
                        color="red"
                        style={{ marginRight: 0.5 }}
                      />
                    )}
                    <Typography
                      variant="caption"
                      color={item.isCompleted ? "#000" : "#ff0000"}
                    >
                      {Boolean(item.isCompleted) ? "Completed" : "Pending"}
                    </Typography>
                  </Box>
                )}
              </Paper>
            </TimelineContent>
          </TimelineItem>
        ))}
      </Timeline>
    </Box>
  );
}
