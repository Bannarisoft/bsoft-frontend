import React from "react";
import { Button, TextField, Paper, useTheme } from "@mui/material";
import { StyledAutocomplete } from "../../../utils/lib";

function DashboardFilter({
  departmentData,
  machineGroupData,
  filters,
  setFilters,
  onApply,
  handleChange,
}: {
  departmentData: any[];
  machineGroupData: any[];
  filters: any;
  setFilters: any;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onApply: (filters: any) => void;
}) {
  const theme = useTheme();

  const handleApply = () => {
    onApply(filters);
  };

  return (
    <Paper
      elevation={3}
      sx={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "end",
        gap: 2,
        alignItems: "center",
        padding: 2,
        borderRadius: "12px 12px 0 0",
        boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
        background: theme.palette.background.paper,
      }}
    >
      <StyledAutocomplete
        options={departmentData || []}
        value={filters.department}
        onChange={(_, value: any | null) =>
          setFilters({ ...filters, department: value })
        }
        getOptionLabel={(option: any) => option.deptName || ""}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Department"
            variant="outlined"
            size="small"
            sx={{ minWidth: 200 }}
          />
        )}
      />

      <TextField
        label="Start Date"
        name="from"
        type="date"
        value={filters.from}
        onChange={handleChange}
        InputLabelProps={{ shrink: true }}
        variant="outlined"
        size="small"
      />

      <TextField
        label="End Date"
        name="to"
        type="date"
        value={filters.to}
        onChange={handleChange}
        InputLabelProps={{ shrink: true }}
        variant="outlined"
        size="small"
      />

      <Button
        variant="contained"
        color="primary"
        onClick={handleApply}
        sx={{ height: 40, px: 3 }}
      >
        APPLY
      </Button>
    </Paper>
  );
}

export default DashboardFilter;
