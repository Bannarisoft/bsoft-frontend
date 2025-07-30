import React from "react";
import { CreateGeneratorConsumptionpage } from "../../../../maintanenceTypes";
import {
  Autocomplete,
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  FormGroup,
  Grid2,
  Slide,
} from "@mui/material";
import { TransitionProps } from "@mui/material/transitions";
import { MuiButton, MuiInputField, MuiText } from "bsoft-base-elements";
import { IoClose } from "react-icons/io5";
import { DesktopTimePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const CreateGeneratorConsumption = ({
  open,
  close,
  generatorTypeData,
  handledAutoComplete,
  selectedValues,
  error,
  handleChange,
  generatorInput,
  runningHours,
  purposeData,
  handleSubmit,
}: CreateGeneratorConsumptionpage) => {
  return (
    <React.Fragment>
      <Dialog
        open={open}
        TransitionComponent={Transition}
        keepMounted
        aria-describedby="alert-dialog-slide-description"
        sx={{
          "& .MuiPaper-root": {
            width: "60rem",
            borderRadius: "8px",
            maxWidth: "none !important",
          },
        }}
      >
        <Box className="popup-header-wrapper">
          <h2 className="dialog-header">Add</h2>
          <IoClose
            fontSize={24}
            onClick={close}
            cursor={"pointer"}
            color="#fff"
          />
        </Box>

        <DialogContent sx={{ p: "4px 24px 12px" }}>
          <Grid2>
            <Grid2 container spacing={2}>
              <Grid2 size={{ xs: 12, sm: 6, md: 6, lg: 4 }}>
                <MuiText variant="h6" my={1} className="admin-label-title">
                  Generator <span className="mandatory-sign">*</span>
                </MuiText>

                <Autocomplete
                  options={generatorTypeData || []}
                  id="state-autocomplete"
                  fullWidth
                  size="small"
                  value={selectedValues["generatorId"]?.[0] || null}
                  onChange={(event, newValue: any) =>
                    handledAutoComplete(
                      event,
                      newValue ? newValue : null,
                      "generatorId"
                    )
                  }
                  getOptionLabel={(option: any) => option?.machineCode}
                  renderOption={(props, option) => (
                    <li {...props} key={option?.id}>
                      {option?.machineCode}
                    </li>
                  )}
                  renderInput={(params) => (
                    <MuiInputField
                      {...params}
                      name="generatorId"
                      error={error.includes("generatorId")}
                      helperText={
                        error.includes("generatorId") &&
                        "please select a generator"
                      }
                    />
                  )}
                />
              </Grid2>
              <Grid2 size={{ xs: 12, sm: 6, md: 6, lg: 4 }}>
                <MuiText variant="h6" my={1} className="admin-label-title">
                  Start Time <span className="mandatory-sign">*</span>
                </MuiText>

                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DesktopTimePicker
                    slotProps={{
                      textField: {
                        size: "small",
                        placeholder: "",
                        fullWidth: true,
                        error: error.includes("startTime"),
                        helperText: error.includes("startTime")
                          ? "please enter a valid start time"
                          : "",
                      },
                    }}
                    value={
                      generatorInput.startTime
                        ? dayjs(generatorInput.startTime, "HH:mm:ss")
                        : null
                    }
                    onChange={(time) => {
                      handleChange({
                        target: {
                          name: "startTime",
                          value: time ? dayjs(time).format("HH:mm:ss") : "",
                        },
                      } as React.ChangeEvent<HTMLInputElement>);
                    }}
                    name="startTime"
                  />
                </LocalizationProvider>
              </Grid2>
              <Grid2 size={{ xs: 12, sm: 6, md: 6, lg: 4 }}>
                <MuiText variant="h6" my={1} className="admin-label-title">
                  End Time <span className="mandatory-sign">*</span>
                </MuiText>

                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DesktopTimePicker
                    slotProps={{
                      textField: {
                        size: "small",
                        placeholder: "",
                        fullWidth: true,
                        error: error.includes("endTime"),
                        helperText: error.includes("endTime")
                          ? "please enter a valid end time"
                          : "",
                      },
                    }}
                    value={
                      generatorInput.endTime
                        ? dayjs(generatorInput.endTime, "HH:mm:ss")
                        : null
                    }
                    onChange={(time) => {
                      handleChange({
                        target: {
                          name: "endTime",
                          value: time ? dayjs(time).format("HH:mm:ss") : "",
                        },
                      } as React.ChangeEvent<HTMLInputElement>);
                    }}
                    name="endTime"
                  />
                </LocalizationProvider>
              </Grid2>
              <Grid2 size={{ xs: 12, sm: 6, md: 4, lg: 4 }}>
                <MuiText variant="h6" my={1} className="admin-label-title">
                  Running Hours
                </MuiText>
                <MuiInputField
                  fullWidth
                  variant="outlined"
                  type="number"
                  size="small"
                  InputProps={{
                    readOnly: true,
                    inputProps: { min: 0 },
                  }}
                  value={generatorInput.runningHours || ""}
                  name="runningHours"
                  error={error.includes("runningHours")}
                  helperText={
                    error.includes("runningHours") && "Running hours missed"
                  }
                />
              </Grid2>
              <Grid2 size={{ xs: 12, sm: 6, md: 4, lg: 4 }}>
                <MuiText variant="h6" my={1} className="admin-label-title">
                  Diesel Consumption (L)
                  <span className="mandatory-sign"> *</span>
                </MuiText>
                <MuiInputField
                  fullWidth
                  variant="outlined"
                  type="number"
                  size="small"
                  InputProps={{
                    inputProps: {
                      min: 0,
                    },
                  }}
                  value={
                    generatorInput.dieselConsumption === 0
                      ? ""
                      : generatorInput.dieselConsumption
                  }
                  name="dieselConsumption"
                  onChange={handleChange}
                  error={error.includes("dieselConsumption")}
                  helperText={
                    error.includes("dieselConsumption") &&
                    "please enter a valid diesel consumption"
                  }
                />
              </Grid2>
              <Grid2 size={{ xs: 12, sm: 6, md: 4, lg: 4 }}>
                <MuiText variant="h6" my={1} className="admin-label-title">
                  Opening Meter Reading
                  <span className="mandatory-sign"> *</span>
                </MuiText>
                <MuiInputField
                  fullWidth
                  variant="outlined"
                  type="number"
                  size="small"
                  InputProps={{
                    readOnly: true,
                    inputProps: {
                      min: 0,
                    },
                  }}
                  value={
                    generatorInput.openingEnergyReading === 0
                      ? ""
                      : generatorInput.openingEnergyReading
                  }
                  name="openingEnergyReading"
                  error={error.includes("openingEnergyReading")}
                  helperText={
                    error.includes("openingEnergyReading") &&
                    "please enter  opening energy reading"
                  }
                />
              </Grid2>
              <Grid2 size={{ xs: 12, sm: 6, md: 4, lg: 4 }}>
                <MuiText variant="h6" my={1} className="admin-label-title">
                  Closing Meter Reading
                  <span className="mandatory-sign"> *</span>
                </MuiText>

                <MuiInputField
                  fullWidth
                  variant="outlined"
                  type="number"
                  size="small"
                  InputProps={{
                    inputProps: {
                      min: 0,
                    },
                  }}
                  value={
                    generatorInput.closingEnergyReading === 0
                      ? ""
                      : generatorInput.closingEnergyReading
                  }
                  name="closingEnergyReading"
                  onChange={handleChange}
                  error={error.includes("closingEnergyReading")}
                  helperText={
                    error.includes("closingEnergyReading") &&
                    "please enter closing energy reading"
                  }
                />
              </Grid2>
              <Grid2 size={{ xs: 12, sm: 6, md: 4, lg: 4 }}>
                <MuiText variant="h6" my={1} className="admin-label-title">
                  Total Unit
                </MuiText>

                <MuiInputField
                  fullWidth
                  variant="outlined"
                  type="number"
                  size="small"
                  InputProps={{
                    readOnly: true,
                  }}
                  value={
                    generatorInput.totalUnits === 0
                      ? ""
                      : generatorInput.totalUnits
                  }
                  name="totalUnits"
                />
              </Grid2>
              <Grid2 size={{ xs: 12, sm: 6, md: 6, lg: 4 }}>
                <MuiText variant="h6" my={1} className="admin-label-title">
                  Purpose <span className="mandatory-sign">*</span>
                </MuiText>

                <Autocomplete
                  options={purposeData || []}
                  id="state-autocomplete"
                  fullWidth
                  size="small"
                  value={selectedValues["purposeId"]?.[0] || null}
                  onChange={(event, newValue: any) =>
                    handledAutoComplete(
                      event,
                      newValue ? newValue : null,
                      "purposeId"
                    )
                  }
                  getOptionLabel={(option: any) => option?.code}
                  renderOption={(props, option) => (
                    <li {...props} key={option?.id}>
                      {option?.code}
                    </li>
                  )}
                  renderInput={(params) => (
                    <MuiInputField
                      {...params}
                      name="purposeId"
                      error={error.includes("purposeId")}
                      helperText={
                        error.includes("purposeId") && "please select a purpose"
                      }
                    />
                  )}
                />
              </Grid2>
            </Grid2>
          </Grid2>
        </DialogContent>

        <DialogActions
          sx={{
            borderTop: "1px solid #f1f1f1",
            py: 2,
            justifyContent: "space-between",
            pr: "22px",
          }}
        >
          <FormGroup
            sx={{
              pl: 2,
            }}
          ></FormGroup>
          <Box
            display={"flex"}
            alignItems={"center"}
            gap={2}
            sx={{
              button: {
                minWidth: "70px !important",
              },
            }}
          >
            <MuiButton
              className="dialog-cancel-btn"
              variant="outlined"
              onClick={close}
            >
              Cancel
            </MuiButton>
            <MuiButton className="filled-icon-btn" onClick={handleSubmit}>
              Submit
            </MuiButton>
          </Box>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
};

export default CreateGeneratorConsumption;
