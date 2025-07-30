import React, { useState } from "react";
import {
  Box,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Paper,
  Typography,
  TextField,
  Chip,
  Grid,
  Divider,
  Fade,
  createFilterOptions,
} from "@mui/material";
import { BsCheckCircle } from "react-icons/bs";
import { MdCancel } from "react-icons/md";
import { MuiInputField, MuiText } from "bsoft-base-elements";
import { StyledAutocomplete } from "../../../../utils/lib";

const defaultFilter = createFilterOptions();

function CheckLists({
  selectedActivities,
  checklistItems,
  activities,
  handleActivityChange,
  handleStatusChange,
  handleRemarksChange,
  activityMasterData,
}: any) {
  return (
    <Paper
      elevation={3}
      sx={{
        borderRadius: "16px",
        overflow: "hidden",
        bgcolor: "#ffffff",
        "&:hover": {
          boxShadow: "0 8px 24px rgba(0, 0, 0, 0.12)",
        },
        "@media (max-width: 600px)": {
          fontSize: 11,
        },
      }}
    >
      {/* <Box
        sx={{
          p: 2,
          background: "linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)",
          color: "white",
          display: "flex",
          alignItems: "center",
          gap: 1,
        }}
      >
        <MdAssignment fontSize="medium" />
        <Typography variant="h6" fontWeight={500}>
          Activity Checklist
        </Typography>
      </Box> */}

      <Box sx={{ p: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <MuiText
              fontWeight={500}
              mb={"2px"}
              fontSize={14}
              color="#000"
            >
              Select Activities
            </MuiText>

            <StyledAutocomplete
              multiple
              id="activities-autocomplete"
              options={activityMasterData || []}
              getOptionLabel={(option: any) => option.activityName}
              value={selectedActivities}
              onChange={handleActivityChange}
              renderInput={(params) => (
                <TextField
                  {...params}
                  variant="outlined"
                  placeholder="Select activities"
                  size="small"
                  fullWidth
                />
              )}
              filterOptions={(options, state) =>
                defaultFilter(
                  options.filter(
                    (option: any) =>
                      !selectedActivities.some(
                        (selected: any) => selected.id === option.id
                      )
                  ),
                  state
                )
              }
              renderTags={(selected, getTagProps) =>
                selected.map((option: any, index) => (
                  <Chip
                    label={option.activityName}
                    {...getTagProps({ index })}
                    sx={{
                      color: "#222",
                      fontWeight: 400,
                      border: `1px solid #f4f4f4`,
                    }}
                  />
                ))
              }
              renderOption={(props, option: any) => (
                <Box
                  component="li"
                  {...props}
                  sx={{ display: "flex", alignItems: "center", gap: 1 }}
                >
                  {option.activityName}
                </Box>
              )}
              sx={{
                "& .MuiOutlinedInput-root": {
                  "&.Mui-focused fieldset": {
                    borderColor: "#1976d2",
                  },
                },
              }}
            />
          </Grid>

          {Array.isArray(checklistItems) && checklistItems.length > 0 && (
            <Grid item xs={12} md={8}>
              <Box
                sx={{
                  mb: 2,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography variant="subtitle1" fontWeight={500} fontSize={14}>
                  Checklist Items
                </Typography>
                <Chip
                  label={`${
                    Array.isArray(checklistItems) &&
                    checklistItems.filter((item: any) => item.isCompleted === 1)
                      .length
                  }/${
                    Array.isArray(checklistItems) && checklistItems.length
                  } Completed`}
                  color="primary"
                  size="small"
                  variant="outlined"
                />
              </Box>

              <Divider sx={{ mb: 2 }} />
              <Box maxHeight={300} overflow={"auto"} pr={1}>
                {Array.isArray(checklistItems) &&
                  checklistItems.map((item: any, index: number) => (
                    <Paper
                      elevation={0}
                      sx={{
                        p: 1,
                        mb: 2,
                        borderRadius: "8px",
                        // border: "1px solid #e0e0e0",
                        bgcolor: item.isCompleted === 1 ? "#e8f5e9" : "#ffebee",
                        "&:hover": {
                          borderColor: "#bbdefb",
                          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
                        },
                      }}
                      key={index}
                    >
                      <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} sm={4}>
                          <Typography
                            variant="subtitle1"
                            fontWeight={500}
                            color={
                              item.isCompleted
                                ? item.isCompleted === 1
                                  ? "success.main"
                                  : "error.main"
                                : "text.primary"
                            }
                          >
                            {item?.activityChecklist}
                          </Typography>
                          {/* <Typography
                            variant="subtitle1"
                            fontWeight={400}
                            color={
                              item.isCompleted
                                ? item.isCompleted === 1
                                  ? "success.main"
                                  : "error.main"
                                : "text.primary"
                            }
                          >
                            ({item?.activityName})
                          </Typography> */}
                        </Grid>

                        <Grid item xs={12} sm={3}>
                          <FormGroup row sx={{ gap: 2 }}>
                            <FormControlLabel
                              control={
                                <Checkbox
                                  icon={<BsCheckCircle />}
                                  checkedIcon={<BsCheckCircle />}
                                  checked={item.isCompleted === 1}
                                  onChange={() => handleStatusChange(index, 1)}
                                  sx={{
                                    color: "#9e9e9e",
                                    "&.Mui-checked": {
                                      color: "#4caf50",
                                    },
                                  }}
                                />
                              }
                              label="Yes"
                            />
                            <FormControlLabel
                              control={
                                <Checkbox
                                  icon={<MdCancel />}
                                  checkedIcon={<MdCancel />}
                                  checked={item.isCompleted === 0}
                                  onChange={() => handleStatusChange(index, 0)}
                                  sx={{
                                    color: "#9e9e9e",
                                    "&.Mui-checked": {
                                      color: "#f44336",
                                    },
                                  }}
                                />
                              }
                              label="No"
                            />
                          </FormGroup>
                        </Grid>

                        <Grid item xs={12} sm={5}>
                          <Box sx={{ position: "relative" }}>
                            <MuiInputField
                              multiline
                              rows={2}
                              disabled={item.isCompleted !== 0}
                              placeholder="Add remarks..."
                              size="small"
                              fullWidth
                              value={item.description}
                              onChange={(e) =>
                                handleRemarksChange(index, e.target.value)
                              }
                              sx={{
                                bgcolor:
                                  item.isCompleted === 0
                                    ? "#fff"
                                    : "transparent",
                                "& .MuiOutlinedInput-root": {
                                  "&.Mui-focused fieldset": {
                                    borderColor: "#1976d2",
                                  },
                                },
                              }}
                            />
                          </Box>
                        </Grid>
                      </Grid>
                    </Paper>
                  ))}
              </Box>
            </Grid>
          )}
        </Grid>
      </Box>
    </Paper>
  );
}

export default CheckLists;
