import React from "react";
import { CreateShiftDetailProps } from "../../../types/maintanenceTypes";
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
import { IoClose } from "react-icons/io5";
import {
  MuiButton,
  MuiInputField,
  MuiSwitch,
  MuiText,
} from "bsoft-base-elements";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
dayjs.extend(customParseFormat);

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DesktopTimePicker } from "@mui/x-date-pickers/DesktopTimePicker";
import InputDatePicker from "../../atoms/Datepicker";
import { isSubmitting } from "../../../utils/lib";
const CreateShiftMasterDetail = ({
  open,
  close,
  handleShiftChange,
  handleChange,
  selectedShift,
  shiftData,
  shiftDeatailInput,
  shiftSupervisorData,
  handleShiftSupervisorChange,
  selectedshiftSupervisor,
  handleSwitch,
  handleSubmit,
  error,
  editFlag,
}: CreateShiftDetailProps) => {
  return (
    <React.Fragment>
      <Dialog
        open={open}
        TransitionComponent={Transition}
        keepMounted
        aria-describedby="alert-dialog-slide-description"
        sx={{
          "& .MuiPaper-root": {
            width: "800px",
            borderRadius: "8px",
            maxWidth: "none !important",
          },
        }}
      >
        <Box className="popup-header-wrapper">
          <h2 className="dialog-header">
            {`${editFlag ? "Edit" : "Create"}`} Shift Timing{" "}
          </h2>
          <IoClose
            fontSize={24}
            onClick={close}
            cursor={"pointer"}
            color="#fff"
          />
        </Box>
        <DialogContent sx={{ p: "4px 24px 12px" }}>
          <Grid2 container spacing={2}>
            <Grid2 size={4}>
              <MuiText variant="h6" my={1} className="admin-label-title">
                Shift Name <span className="mandatory-sign">*</span>
              </MuiText>

              <Autocomplete
                options={shiftData || []}
                id="state-autocomplete"
                fullWidth
                size="small"
                value={selectedShift}
                onChange={(event, value) =>
                  handleShiftChange(
                    event as React.ChangeEvent<HTMLInputElement>,
                    value,
                    "shiftName"
                  )
                }
                getOptionLabel={(option: any) => option?.shiftName}
                renderOption={(props, option) => (
                  <li {...props} key={option?.id}>
                    {option?.shiftName}
                  </li>
                )}
                renderInput={(params) => (
                  <MuiInputField
                    {...params}
                    name="shiftMasterId"
                    value={shiftDeatailInput.shiftMasterId}
                    error={error.includes("shiftMasterId")}
                    helperText={
                      error.includes("shiftMasterId") && "Please select a shift"
                    }
                  />
                )}
              />
            </Grid2>
            <Grid2 size={4}>
              <MuiText variant="h6" my={1} className="admin-label-title">
                Start Time <span className="mandatory-sign">*</span>
              </MuiText>

              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DesktopTimePicker
                  slotProps={{
                    textField: {
                      size: "small",
                      placeholder: "",
                      error: error.includes("startTime"),
                      helperText: error.includes("startTime")
                        ? "Please enter a valid start time"
                        : "",
                    },
                  }}
                  value={
                    shiftDeatailInput.startTime
                      ? dayjs(shiftDeatailInput.startTime, "HH:mm:ss")
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
            <Grid2 size={4}>
              <MuiText variant="h6" my={1} className="admin-label-title">
                End Time <span className="mandatory-sign">*</span>
              </MuiText>

              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DesktopTimePicker
                  slotProps={{
                    textField: {
                      size: "small",
                      placeholder: "",
                      error: error.includes("endTime"),
                      helperText: error.includes("endTime")
                        ? "Please enter a valid end time"
                        : "",
                    },
                  }}
                  value={
                    shiftDeatailInput.endTime
                      ? dayjs(shiftDeatailInput.endTime, "HH:mm:ss")
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

            <Grid2 size={4}>
              <MuiText variant="h6" my={1} className="admin-label-title">
                Break Duration Minutes <span className="mandatory-sign">*</span>
              </MuiText>
              <MuiInputField
                fullWidth
                type="number"
                variant="outlined"
                size="small"
                name="breakDurationInMinutes"
                multiline
                value={shiftDeatailInput.breakDurationInMinutes}
                onChange={handleChange}
                error={error.includes("breakDuration")}
                helperText={
                  error.includes("breakDuration") &&
                  "please enter valid break duration"
                }
              />
            </Grid2>

            <Grid2 size={4}>
              <MuiText variant="h6" my={1} className="admin-label-title">
                Effective Date <span className="mandatory-sign">*</span>
              </MuiText>
              <InputDatePicker
                format="DD-MM-YYYY"
                slotProps={{
                  textField: {
                    size: "small",
                    error: error.includes("effectiveDate"),
                    helperText: error.includes("effectiveDate")
                      ? "Please enter a valid date"
                      : "",
                  },
                }}
                value={
                  shiftDeatailInput.effectiveDate
                    ? dayjs(shiftDeatailInput.effectiveDate)
                    : null
                }
                onChange={(date) => {
                  handleChange({
                    target: {
                      name: "effectiveDate",
                      value: date ? dayjs(date).format("YYYY-MM-DD") : "",
                    },
                  } as React.ChangeEvent<HTMLInputElement>);
                }}
                name="effectiveDate"
              />
            </Grid2>

            <Grid2 size={4}>
              <MuiText variant="h6" my={1} className="admin-label-title">
                Shift Supervisor Name <span className="mandatory-sign">*</span>
              </MuiText>

              <Autocomplete
                options={shiftSupervisorData || []}
                fullWidth
                size="small"
                value={selectedshiftSupervisor}
                onChange={(event, value) =>
                  handleShiftSupervisorChange(
                    event as React.ChangeEvent<HTMLInputElement>,
                    value,
                    "ShiftSupervisor"
                  )
                }
                getOptionLabel={(option: any) => option?.custodianName || ""}
                isOptionEqualToValue={(option, value) =>
                  option?.custodianId === value?.custodianId
                }
                renderOption={(props, option) => (
                  <li {...props} key={option?.custodianId}>
                    {option?.custodianName}
                  </li>
                )}
                renderInput={(params) => (
                  <MuiInputField
                    {...params}
                    name="shiftSupervisorId"
                    error={error.includes("shiftSupervisorId")}
                    helperText={
                      error.includes("shiftSupervisorId") &&
                      "Please select a responsible person"
                    }
                  />
                )}
              />
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
          >
            <MuiSwitch
              checked={shiftDeatailInput.isActive === 1}
              onChange={handleSwitch}
              label="Status"
            />
          </FormGroup>
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
            <MuiButton
              className="filled-icon-btn"
              disabled={isSubmitting()}
              onClick={handleSubmit}
            >
              Submit
            </MuiButton>
          </Box>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
};

export default CreateShiftMasterDetail;
