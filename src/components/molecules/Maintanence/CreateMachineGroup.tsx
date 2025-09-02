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
import {
  MuiButton,
  MuiInputField,
  MuiSwitch,
  MuiText,
} from "bsoft-base-elements";
import React from "react";
import { IoClose } from "react-icons/io5";
import { CreatemachinegroupsProps } from "../../../types/maintanenceTypes";
import { isSubmitting } from "../../../utils/lib";
const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});
const CreateMachineGroup = ({
  open,
  close,
  handleSubmit,
  machinegroupInput,
  handleChange,
  error,
  handleSwitch,
  manufactureData,
  selectedmanufacture,
  handleManufactureChange,
  handleDepartmentChange,
  selectedDepartment,
  departmentData,
  editFlag,
}: CreatemachinegroupsProps) => {
  return (
    <React.Fragment>
      <Dialog
        open={open}
        TransitionComponent={Transition}
        keepMounted
        aria-describedby="alert-dialog-slide-description"
        sx={{
          "& .MuiPaper-root": {
            width: "70rem",
            borderRadius: "8px",
            maxWidth: "none !important",
          },
        }}
      >
        <Box className="popup-header-wrapper">
          <h2 className="dialog-header">
            {`${editFlag ? "Edit" : "Create"}`} Machine Group{" "}
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
                Machine Group Name <span className="mandatory-sign">*</span>
              </MuiText>
              <MuiInputField
                fullWidth
                variant="outlined"
                size="small"
                InputProps={{
                  inputProps: {
                    maxLength: 45,
                  },
                }}
                autoComplete="off"
                onChange={handleChange}
                error={error.includes("groupName")}
                helperText={
                  error.includes("groupName") && "please enter valid groupName"
                }
                value={machinegroupInput.groupName}
                name="groupName"
              />
            </Grid2>
            <Grid2 size={4}>
              <MuiText variant="h6" my={1} className="admin-label-title">
                Production Department Name{" "}
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
                    value={machinegroupInput.departmentId}
                    error={error.includes("departmentId")}
                    helperText={
                      error.includes("departmentId") &&
                      "please select a departmentId"
                    }
                  />
                )}
              />
            </Grid2>

            <Grid2 size={4}>
              <MuiText variant="h6" my={1} className="admin-label-title">
                Manufacturer Name <span className="mandatory-sign">*</span>
              </MuiText>
              <Autocomplete
                options={manufactureData || []}
                id="manufacture-type-autocomplete"
                fullWidth
                size="small"
                value={selectedmanufacture}
                getOptionLabel={(option: any) => option?.manufactureName || ""}
                isOptionEqualToValue={(option, value) =>
                  option?.id === value?.id
                }
                onChange={(event, value) =>
                  handleManufactureChange(
                    event as React.ChangeEvent<HTMLInputElement>,
                    value,
                    "manufacturer"
                  )
                }
                renderOption={(
                  props,
                  option: { id: string; manufactureName: string }
                ) => (
                  <li {...props} key={option?.id}>
                    {option?.manufactureName}
                  </li>
                )}
                renderInput={(params) => (
                  <MuiInputField
                    {...params}
                    name="manufactureName"
                    error={error.includes("manufacturer")}
                    helperText={
                      error.includes("manufacturer") &&
                      "Please select a manufacture type"
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
            <Box>
              <MuiSwitch
                checked={machinegroupInput.isActive === 1}
                onChange={(e) => handleSwitch(e, "isActive")}
                label="Status"
              />
              <MuiSwitch
                checked={machinegroupInput.powerSource === 1}
                onChange={(e) => handleSwitch(e, "powerSource")}
                label="Power Source"
              />
            </Box>
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
              disableFocusRipple={isSubmitting()}
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

export default CreateMachineGroup;
