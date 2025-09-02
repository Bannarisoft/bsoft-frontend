"use client";

import * as React from "react";
import { Paper, Box } from "@mui/material";
import { MuiText, MuiSwitch } from "bsoft-base-elements";
import type { ToggleTileProps } from "../../../../types/warehouseTypes";

const ToggleTile: React.FC<ToggleTileProps> = ({
  checked,
  onChange,
  label,
  subtitle,
  icon,
  disabled,
}) => {
  return (
    <Paper
      role="button"
      aria-pressed={checked}
      onClick={() => !disabled && onChange(!checked)}
      elevation={0}
      sx={{
        p: 1.5,
        pr: 1,
        borderRadius: 2,
        border: "1px solid",
        borderColor: checked ? "#127C9E" : "#e5e7eb",
        background: checked
          ? "linear-gradient(180deg, #EFF8FF 0%, #FFFFFF 100%)"
          : "transparent",
        cursor: disabled ? "not-allowed" : "pointer",
        transition: "all .2s ease",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        "&:hover": {
          boxShadow: "0 0 0 2px rgba(18,124,158,.12)",
        },
      }}
    >
      <Box display="flex" alignItems="center" gap={2.1}>
        <Box
          className="d-grid-center"
          sx={{
            width: 38,
            height: 38,
            borderRadius: "50%",
            border: "1px solid #e5e7eb",
            bgcolor: checked ? "rgba(18,124,158,.06)" : "transparent",
          }}
        >
          {icon}
        </Box>
        <Box>
          <MuiText variant="h6" className="admin-label-title" sx={{ m: 0 }}>
            {label}
          </MuiText>
          {subtitle ? (
            <MuiText variant="body2" sx={{ color: "#6b7280", mt: 0.25 }}>
              {subtitle}
            </MuiText>
          ) : null}
        </Box>
      </Box>

      <MuiSwitch
        checked={checked}
        label=""
              />
    </Paper>
  );
};

export default ToggleTile;
