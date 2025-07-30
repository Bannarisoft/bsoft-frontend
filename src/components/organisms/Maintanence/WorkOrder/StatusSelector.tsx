import React from "react";
import { styled } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";

type StatusType = "open" | "onHold" | "inProgress" | "done";

interface StatusSelectorProps {
  value: StatusType;
  onChange: (status: StatusType) => void;
  disabled?: boolean;
  statusOptions: any;
}

const StatusToggleButton = styled(Button)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  padding: "12px 8px",
  minWidth: "100px",
  height: "80px",
  borderRadius: "8px",
  gap: theme.spacing(1),
  transition: "all 0.2s ease-in-out",
  border: `1px solid ${theme.palette.divider}`,
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow: theme.shadows[2],
  },
  [theme.breakpoints.down("sm")]: {
    minWidth: "80px",
  },
}));

const IconWrapper = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  "& svg": {
    fontSize: "24px",
  },
}));

const StatusSelector: React.FC<StatusSelectorProps> = ({
  value,
  onChange,
  disabled = false,
  statusOptions,
}) => {
  return (
    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
      {Array.isArray(statusOptions) &&
        statusOptions.map((option: any) => {
          const isSelected = value === option.value;
          const isDone = option.value === "done";

          return (
            <StatusToggleButton
              key={option.value}
              onClick={() => onChange(option.value)}
              disabled={disabled}
              sx={{
                backgroundColor: isSelected ? option.selectedBg : "white",
                borderColor: isSelected ? option.selectedBorder : "divider",
                color: isSelected
                  ? option.selectedTextColor
                  : option.normalTextColor,
                ...(isDone &&
                  isSelected && {
                    backgroundColor: option.selectedBg,
                    color: option.selectedTextColor,
                    "&:hover": {
                      backgroundColor: option.selectedBg,
                    },
                  }),
              }}
            >
              <IconWrapper>{option.icon}</IconWrapper>
              <Typography variant="body2" fontWeight={isSelected ? 600 : 500}>
                {option.label}
              </Typography>
            </StatusToggleButton>
          );
        })}
    </Box>
  );
};

export { StatusSelector };
