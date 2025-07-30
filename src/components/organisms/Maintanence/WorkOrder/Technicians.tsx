import {
  Box,
  IconButton,
  Card,
  Stack,
  Tooltip,
  Grid,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { StyledAutocomplete, StyledButton } from "../../../../utils/lib";
import { MuiInputField, MuiText } from "bsoft-base-elements";
import React from "react";
import { LuCircleFadingPlus, LuTrash2, LuClock } from "react-icons/lu";
import { TechnicianProps, TechnicianRow } from "../../../../maintanenceTypes";

function Technicians({
  custodianData,
  rows,
  handleAddRow,
  handleDeleteRow,
  handleInputChange,
  totalTime,
  mainTime,
  handleTechnicianInputChange,
  errorRowIds,
}: TechnicianProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));

  const getFilteredOptions = (
    currentTechnician: any,
    allOptions: any[],
    currentRowId: number
  ) => {
    const selectedIds = rows
      .filter(
        (row: TechnicianRow) =>
          row.technician?.custodianId && row.id !== currentRowId
      )
      .map((row: TechnicianRow) => row.technician!.custodianId);

    return allOptions.filter(
      (option) =>
        !selectedIds.includes(option.custodianId) ||
        option.custodianId === currentTechnician?.custodianId
    );
  };

  const handleClearTechnicianField = (rowId: number | string) => {
    const numericId = typeof rowId === "string" ? parseInt(rowId) : rowId;
    handleTechnicianInputChange(numericId, "technician", null);
    handleTechnicianInputChange(numericId, "hours", "");
    handleTechnicianInputChange(numericId, "minutes", "");
  };

  return (
    <Box>
      <Card
        elevation={0}
        sx={{
          backgroundColor: "#f0f7ff",
          borderRadius: "10px",
          mb: 2,
          border: "1px solid #d0e0f5",
          overflow: "visible",
        }}
      >
        <Box sx={{ p: 2 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: isMobile ? 1 : 0,
            }}
          >
            <MuiText
              // variant="h6"
              fontWeight={600}
              fontSize={16}
              color="#2c5282"
            >
              Technicians & Time Allocation
            </MuiText>

            <Box>
              <Tooltip title="Total Time">
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    bgcolor: "#e6f2ff",
                    px: 2,
                    py: 0.5,
                    borderRadius: "20px",
                    border: "1px solid #b3d7ff",
                  }}
                >
                  <LuClock style={{ color: "#3182ce", marginRight: "8px" }} />
                  <MuiText fontSize={14} fontWeight={600} color="#2c5282">
                    {totalTime.hours}h {totalTime.minutes}m
                  </MuiText>
                </Box>
              </Tooltip>
            </Box>
          </Box>

          {!isMobile && (
            <Grid container spacing={1} sx={{ mt: 1 }}>
              <Grid item xs={12} md={5}>
                <MuiText
                  variant="body2"
                  fontWeight={600}
                  fontSize={14}
                  color="#4a5568"
                >
                  Technician Name
                </MuiText>
              </Grid>
              <Grid item xs={6} md={3}>
                <MuiText
                  variant="body2"
                  fontWeight={600}
                  fontSize={14}
                  color="#4a5568"
                >
                  Hours Spent
                </MuiText>
              </Grid>
              <Grid item xs={6} md={3}>
                <MuiText
                  variant="body2"
                  fontWeight={600}
                  fontSize={14}
                  color="#4a5568"
                >
                  Minutes Spent
                </MuiText>
              </Grid>
              <Grid item xs={12} md={1}></Grid>
            </Grid>
          )}
        </Box>
      </Card>

      <Stack spacing={2} sx={{ mb: 3 }}>
        {rows.map((row: TechnicianRow) => (
          <Card
            key={row.id}
            elevation={0}
            sx={{
              p: 2,
              borderRadius: "10px",
              backgroundColor: "#ffffff",
              border: "1px solid #eaeef2",
              transition: "all 0.2s ease",
              "&:hover": {
                boxShadow: "0px 4px 12px rgba(0,0,0,0.08)",
                borderColor: "#d0e0f5",
              },
            }}
          >
            <Grid container spacing={isMobile ? 1 : 2} alignItems="center">
              <Grid item xs={12} md={5}>
                {row.isEdit ? (
                  <StyledAutocomplete
                    key={row.id}
                    options={getFilteredOptions(
                      row.technician,
                      custodianData,
                      row.id
                    )}
                    fullWidth
                    size="small"
                    getOptionLabel={(option: any) =>
                      option?.custodianName && option?.custodianId
                        ? `${option.custodianName} - ${option.custodianId}`
                        : ""
                    }
                    isOptionEqualToValue={(option: any, value: any) =>
                      option?.custodianId === value?.custodianId
                    }
                    onChange={(e, newValue) => {
                      if (!newValue) {
                        handleClearTechnicianField(row.id);
                      } else {
                        handleTechnicianInputChange(
                          row.id,
                          "technician",
                          newValue
                        );
                      }
                    }}
                    value={row.technician || null}
                    renderInput={(params) => (
                      <MuiInputField
                        {...params}
                        name="technician"
                        placeholder="Select Technician"
                        error={row.isEdit && errorRowIds.tech}
                        helperText={
                          row.isEdit && errorRowIds.tech
                            ? "Technician is required."
                            : ""
                        }
                      />
                    )}
                  />
                ) : (
                  <MuiInputField
                    size="small"
                    fullWidth
                    disabled
                    value={
                      row.technician?.custodianName &&
                      row.technician?.custodianId
                        ? `${row.technician.custodianName} - ${row.technician.custodianId}`
                        : ""
                    }
                    placeholder="Technician"
                  />
                )}
              </Grid>

              <Grid item xs={12} md={6}>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    {row.isEdit ? (
                      <MuiInputField
                        size="small"
                        fullWidth
                        type="number"
                        placeholder="Hours"
                        value={row.hours}
                        onInput={(e: React.FormEvent<HTMLInputElement>) => {
                          const input = e.target as HTMLInputElement;
                          let value = parseInt(input.value);
                          if (isNaN(value) || value < 0) value = 0;

                          const thisMinutes = parseInt(row.minutes || "0");
                          const totalInMinWithoutThis =
                            totalTime.hours * 60 +
                            totalTime.minutes -
                            (parseInt(row.hours || "0") * 60 + thisMinutes);
                          const newTotal = totalInMinWithoutThis + value * 60;

                          const mainMatch = mainTime.match(
                            /(\d+)\s*hrs\s+(\d+)\s*mins/i
                          );
                          const mainLimit = mainMatch
                            ? parseInt(mainMatch[1]) * 60 +
                              parseInt(mainMatch[2])
                            : 0;

                          if (newTotal > mainLimit) {
                            value = Math.floor(
                              (mainLimit - totalInMinWithoutThis) / 60
                            );
                          }

                          input.value = value.toString();
                        }}
                        onChange={(e) =>
                          handleInputChange(row.id, "hours", e.target.value)
                        }
                      />
                    ) : (
                      <MuiInputField
                        size="small"
                        fullWidth
                        placeholder="Hours"
                        value={row.hours || "0"}
                        disabled
                      />
                    )}
                  </Grid>

                  <Grid item xs={6}>
                    {row.isEdit ? (
                      <MuiInputField
                        size="small"
                        fullWidth
                        type="number"
                        placeholder="Minutes"
                        value={row.minutes}
                        onInput={(e: React.FormEvent<HTMLInputElement>) => {
                          const input = e.target as HTMLInputElement;
                          let value = parseInt(input.value);
                          if (isNaN(value) || value < 0) value = 0;

                          const currentHours = parseInt(row.hours || "0");

                          const mainMatch = mainTime.match(
                            /(\d+)\s*hrs\s+(\d+)\s*mins/i
                          );
                          const mainLimit = mainMatch
                            ? parseInt(mainMatch[1]) * 60 +
                              parseInt(mainMatch[2])
                            : 0;
                          const currentRowMinutes = parseInt(
                            row.minutes || "0"
                          );
                          const otherTotal =
                            totalTime.hours * 60 +
                            totalTime.minutes -
                            (currentHours * 60 + currentRowMinutes);

                          const remaining = mainLimit - otherTotal;
                          const allowedMinutes = remaining - currentHours * 60;

                          if (value > allowedMinutes) {
                            value = allowedMinutes;
                          }

                          input.value = value.toString();
                        }}
                        onChange={(e) =>
                          handleInputChange(row.id, "minutes", e.target.value)
                        }
                      />
                    ) : (
                      <MuiInputField
                        size="small"
                        fullWidth
                        placeholder="Minutes"
                        value={row.minutes || "0"}
                        disabled
                      />
                    )}
                  </Grid>
                </Grid>
              </Grid>

              {/* Delete Button */}
              <Grid item xs={12} md={1} sx={{ textAlign: "center" }}>
                <IconButton
                  onClick={() =>
                    handleDeleteRow(row.id, row?.technician?.custodianId)
                  }
                  disabled={rows.length <= 0}
                  sx={{
                    color: rows.length <= 0 ? "#bdbdbd" : "#e53935",
                    "&:hover": {
                      backgroundColor:
                        rows.length <= 1
                          ? "transparent"
                          : "rgba(229, 57, 53, 0.08)",
                    },
                  }}
                >
                  <LuTrash2 />
                </IconButton>
              </Grid>
            </Grid>
          </Card>
        ))}
      </Stack>

      <Box
        sx={{
          display: "flex",
          justifyContent: isMobile ? "center" : "flex-end",
          mt: 2,
        }}
      >
        <StyledButton
          startIcon={<LuCircleFadingPlus />}
          variant="contained"
          onClick={handleAddRow}
          sx={{
            backgroundColor: "#107869",
            borderRadius: "8px",
            boxShadow: "0px 3px 8px rgba(0,0,0,0.15)",
            "&:hover": { backgroundColor: "#0e6b5e" },
            width: isMobile ? "100%" : "auto",
            maxWidth: isMobile ? "300px" : "none",
            py: 1,
          }}
        >
          Add Technician
        </StyledButton>
      </Box>
    </Box>
  );
}

export default Technicians;
