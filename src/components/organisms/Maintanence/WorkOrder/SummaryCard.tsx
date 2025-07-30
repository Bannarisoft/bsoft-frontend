import { Box, Card, Chip, Stack } from "@mui/material";
import { MuiText } from "bsoft-base-elements";
import { SummaryCardProps } from "../../../../maintanenceTypes";
import React from "react";
import { FaArrowRightLong } from "react-icons/fa6";
import dayjs from "dayjs";
import Link from "next/link";
import { MdTaskAlt } from "react-icons/md";

function SummaryCard(props: SummaryCardProps) {
  const { clockData } = props;
  const activities =
    clockData?.activityName?.split(",").map((a: string) => a.trim()) || [];

  return (
    <Card
      variant="outlined"
      sx={{
        p: 2,
        borderRadius: "12px",
        "@media (max-width: 600px)": {
          p: 1,
        },
      }}
    >
      <Box
        display={"flex"}
        justifyContent={"space-between"}
        alignItems={"center"}
        position={"relative"}
        flexWrap="wrap"
      >
        <Box>
          <MuiText
            // variant="h6"
            fontWeight={500}
            fontSize={17}
            color="#0C4150"
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
            sx={{
              "@media (max-width: 600px)": {
                fontSize: 14,
              },
            }}
          >
            Machine Code - {clockData?.machine}
          </MuiText>
        </Box>
      </Box>
      {activities.length > 0 && (
        <Box my={1}>
          <Stack direction="row" spacing={1} flexWrap="wrap">
            {activities.map((activity: string, idx: number) => (
              <Chip
                key={idx}
                label={activity}
                color="primary"
                variant="outlined"
                size="small"
                sx={{
                  bgcolor: "#f0f7ff",
                  color: "#3a8484",
                  fontWeight: 500,
                  fontSize: 12,
                  fontFamily: "var(--poppins-font)",
                  mb: 0.5,
                  letterSpacing: 1,
                  borderRadius: "8px",
                  border: "1px solid #3a8484",
                  "& .MuiChip-icon": { color: "#10b981" },
                }}
                icon={<MdTaskAlt />}
              />
            ))}
          </Stack>
        </Box>
      )}
      <Box
        display={"flex"}
        justifyContent={"space-between"}
        alignItems={"center"}
        mt={1}
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
        {clockData?.dueDate && (
          <MuiText
            // variant="h6"
            fontWeight={500}
            fontSize={13}
            color="#dd5061"
            sx={{
              "@media (max-width: 600px)": {
                fontSize: 11,
              },
            }}
          >
            Due Date: {`${dayjs(clockData?.dueDate).format("DD-MM-YYYY")}`}
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
          Req Id: {`${clockData?.requestId}`}
        </MuiText>
        <Link href={`/maintanence/work-order-detail/${clockData?.id}`}>
          <FaArrowRightLong size={20} />
        </Link>
      </Box>
    </Card>
  );
}

export default SummaryCard;
