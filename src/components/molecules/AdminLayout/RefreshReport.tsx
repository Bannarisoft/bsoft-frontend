import { IconButton, Tooltip } from "@mui/material";
import React from "react";
import { MdOutlineRestartAlt } from "react-icons/md";

function RefreshReport({
  value,
  refresh,
}: {
  value: string;
  refresh: (value: string) => void;
}) {
  return (
    <Tooltip title="Refresh Report">
      <IconButton
        onClick={() => refresh(value)}
        sx={{ background: "#3a8484 !important", p: "4px" }}
      >
        <MdOutlineRestartAlt color="#fff" size={20} />
      </IconButton>
    </Tooltip>
  );
}

export default RefreshReport;
