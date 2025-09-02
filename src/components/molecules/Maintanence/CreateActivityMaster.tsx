import {
  Autocomplete,
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  FormControl,
  FormGroup,
  Grid2,
  Slide,
} from "@mui/material";
import { TransitionProps } from "@mui/material/transitions";
import {
  MuiButton,
  MuiInputField,
  MuiSwitch,
  MuiText,
} from "bsoft-base-elements";
import React from "react";
import { IoClose } from "react-icons/io5";
import { CreateActivityProps } from "../../../types/maintanenceTypes";
import { isSubmitting } from "../../../utils/lib";
const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});
const CreateActivityMaster = ({
  open,
  close,
  handleSubmit,
  handleChange,
  error,
  handleSwitch,
  handleDepartmentChange,
  selectedDepartment,
  departmentData,
  activityinput,
  activityType,
  handleactivitytypeChange,
  selectedActivityType,
  handleMachineGroupChange,
  selectedMachineGroup,
  machineGroupData,
  editFlag,
}: CreateActivityProps) => {
  return (
    <React.Fragment>
      <Dialog
        open={open}
        TransitionComponent={Transition}
        keepMounted
        aria-describedby="alert-dialog-slide-description"
        sx={{
          "& .MuiPaper-root": {
            width: "1000px",
            borderRadius: "8px",
            maxWidth: "none !important",
          },
        }}
      >
        <Box className="popup-header-wrapper">
          <h2 className="dialog-header">
            {" "}
            {`${editFlag ? "Edit" : "Create"}`} Activity Master
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
                Activity Name <span className="mandatory-sign">*</span>
              </MuiText>
              <MuiInputField
                fullWidth
                variant="outlined"
                size="small"
                onChange={handleChange}
                error={error.includes("activityName")}
                helperText={
                  error.includes("activityName") &&
                  "please enter valid activityName"
                }
                autoComplete="off"
                value={activityinput.activityName}
                name="activityName"
              />
            </Grid2>
            <Grid2 size={4}>
              <MuiText variant="h6" my={1} className="admin-label-title">
                Description <span className="mandatory-sign">*</span>
              </MuiText>
              <MuiInputField
                fullWidth
                type="text"
                variant="outlined"
                size="small"
                name="description"
                autoComplete="off"
                multiline
                value={activityinput.description}
                error={error.includes("description")}
                helperText={
                  error.includes("description") &&
                  "please enter valid description"
                }
                InputProps={{
                  inputProps: {
                    maxLength: 250,
                  },
                }}
                onChange={handleChange}
              />
            </Grid2>
            <Grid2 size={4}>
              <MuiText variant="h6" my={1} className="admin-label-title">
                Maintenance Department Name{" "}
                <span className="mandatory-sign">*</span>
              </MuiText>
              <Autocomplete
                options={departmentData || []}
                id="state-autocomplete"
                fullWidth
                size="small"
                value={selectedDepartment}
                onChange={(event, value) =>
                  handleDepartmentChange(
                    event as React.ChangeEvent<HTMLInputElement>,
                    value,
                    "deptName"
                  )
                }
                getOptionLabel={(option: any) => option?.deptName}
                renderOption={(props, option) => (
                  <li {...props} key={option?.id}>
                    {option?.deptName}
                  </li>
                )}
                renderInput={(params) => (
                  <MuiInputField
                    {...params}
                    name="departmentId"
                    value={activityinput.departmentId}
                    error={error.includes("departmentId")}
                    helperText={
                      error.includes("departmentId") &&
                      "please select a departmentId"
                    }
                  />
                )}
              />
            </Grid2>
          </Grid2>
        </DialogContent>
        <DialogContent sx={{ p: "4px 24px 12px" }}>
          <Grid2 container spacing={2}>
            <Grid2 size={4}>
              <MuiText variant="h6" my={1} className="admin-label-title">
                Estimated Duration Hrs <span className="mandatory-sign">*</span>
              </MuiText>
              <MuiInputField
                fullWidth
                type="number"
                variant="outlined"
                size="small"
                inputProps={{ maxLength: 3 }}
                name="estimatedDuration"
                multiline
                value={activityinput.estimatedDuration}
                onChange={handleChange}
                error={error.includes("estimatedDuration")}
                helperText={
                  error.includes("estimatedDuration") &&
                  "please enter a estimated duration"
                }
              />
            </Grid2>
            <Grid2 size={4}>
              <MuiText variant="h6" my={1} className="admin-label-title">
                Activity Type <span className="mandatory-sign">*</span>
              </MuiText>
              <Autocomplete
                options={activityType || []}
                id="manufacture-type-autocomplete"
                fullWidth
                size="small"
                value={selectedActivityType}
                getOptionLabel={(option: any) => option?.description}
                onChange={(event, value) =>
                  handleactivitytypeChange(
                    event as React.ChangeEvent<HTMLInputElement>,
                    value,
                    "activityName"
                  )
                }
                renderOption={(
                  props,
                  option: { id: string; description: string }
                ) => (
                  <li {...props} key={option?.id}>
                    {option?.description}
                  </li>
                )}
                renderInput={(params) => (
                  <MuiInputField
                    {...params}
                    name="activityType"
                    value={activityinput.activityType}
                    error={error.includes("activityType")}
                    helperText={
                      error.includes("activityType") &&
                      "please select a activity type"
                    }
                  />
                )}
              />
            </Grid2>
            <Grid2 size={4}>
              <FormControl fullWidth>
                <MuiText variant="h6" my={1} className="admin-label-title">
                  Machine Group Name <span className="mandatory-sign">*</span>
                </MuiText>
                <Autocomplete
                  multiple
                  options={machineGroupData || []}
                  id="machine-group-autocomplete"
                  fullWidth
                  size="small"
                  value={selectedMachineGroup}
                  getOptionLabel={(option: any) => option?.groupName || ""}
                  onChange={(event, value) =>
                    handleMachineGroupChange(
                      event as React.ChangeEvent<HTMLInputElement>,
                      value,
                      "groupName"
                    )
                  }
                  filterSelectedOptions
                  renderOption={(
                    props,
                    option: { id: string; groupName: string }
                  ) => (
                    <li {...props} key={option?.id}>
                      {option?.groupName}
                    </li>
                  )}
                  renderInput={(params) => (
                    <MuiInputField
                      {...params}
                      name="machineGroupId"
                      value={activityinput.machineGroupId}
                      error={error.includes("machineGroup")}
                      helperText={
                        error.includes("machineGroup") &&
                        "Please select machineGroup"
                      }
                    />
                  )}
                />
              </FormControl>
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
              onChange={handleSwitch}
              checked={activityinput.isActive === 1}
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

export default CreateActivityMaster;
