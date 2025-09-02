import React from "react";
import { CreateMachineGroupUserProps } from "../../../types/maintanenceTypes";
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
import { IoClose } from "react-icons/io5";
import { TransitionProps } from "@mui/material/transitions";
import {
  MuiButton,
  MuiInputField,
  MuiSwitch,
  MuiText,
} from "bsoft-base-elements";
import { isSubmitting } from "../../../utils/lib";
const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});
const CreateMachineGroupUser = ({
  open,
  close,
  handleDepartmentChange,
  selectedDepartment,
  departmentData,
  handleMachineGroupChange,
  selectedMachineGroup,
  machineGroupDate,
  machineGroupUserInput,
  error,
  handleUserChange,
  selectedUser,
  userIdData,
  handleSwitch,
  handleSubmit,
  editFlag,
}: CreateMachineGroupUserProps) => {
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
            {`${editFlag ? "Edit" : "Create"}`} Machine Group User{" "}
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

              <Autocomplete
                options={machineGroupDate || []}
                id="state-autocomplete"
                fullWidth
                size="small"
                value={selectedMachineGroup}
                onChange={(event, value) =>
                  handleMachineGroupChange(
                    event as React.ChangeEvent<HTMLInputElement>,
                    value,
                    "GroupName"
                  )
                }
                getOptionLabel={(option: any) => option?.groupName}
                renderOption={(props, option) => (
                  <li {...props} key={option?.id}>
                    {option?.groupName}
                  </li>
                )}
                renderInput={(params) => (
                  <MuiInputField
                    {...params}
                    name="machineGroupId"
                    value={machineGroupUserInput.machineGroupId}
                    error={error.includes("machineGroupId")}
                    helperText={
                      error.includes("machineGroupId") &&
                      "please select a machine"
                    }
                  />
                )}
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
                    value={machineGroupUserInput.departmentId}
                    error={error.includes("departmentId")}
                    helperText={
                      error.includes("departmentId") &&
                      "please select a department"
                    }
                  />
                )}
              />
            </Grid2>

            <Grid2 size={4}>
              <MuiText variant="h6" my={1} className="admin-label-title">
                User Name <span className="mandatory-sign">*</span>
              </MuiText>
              <Autocomplete
                options={userIdData || []}
                id="user-autocomplete"
                fullWidth
                size="small"
                value={selectedUser}
                getOptionLabel={(option: any) => option?.userName || ""}
                isOptionEqualToValue={(option, value) =>
                  option.userId === value.userId
                }
                onChange={(event, value) =>
                  handleUserChange(event as any, value, "UserName")
                }
                renderOption={(props, option) => (
                  <li {...props} key={option.userId}>
                    {option.userName}
                  </li>
                )}
                renderInput={(params) => (
                  <MuiInputField
                    {...params}
                    name="user"
                    value={machineGroupUserInput.userId}
                    error={error.includes("user")}
                    helperText={
                      error.includes("user") && "please select a user"
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
              checked={machineGroupUserInput.isActive === 1}
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

export default CreateMachineGroupUser;
