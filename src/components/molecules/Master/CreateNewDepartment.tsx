import React from "react";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import Slide from "@mui/material/Slide";
import { TransitionProps } from "@mui/material/transitions";
import { Autocomplete, Box, FormGroup, Grid2 } from "@mui/material";
import { IoClose } from "react-icons/io5";
import { CreateDepartmentPropTypes } from "../../../types";
import {
  MuiButton,
  MuiInputField,
  MuiSwitch,
  MuiText,
} from "bsoft-base-elements";

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});
const CreateNewDepartment = ({
  open,
  close,
  departmentInput,
  handleSubmit,
  handleChange,
  error,
  handleSwitch,
  editFlag,
  departmentGroupData,
  selectedDepartmentGroup,
  handleDepartmentGroupChange,
}: CreateDepartmentPropTypes) => {
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
            maxWidth: "inherit",
            borderRadius: "8px",
          },
        }}
      >
        <Box className="popup-header-wrapper">
          <h2 className="dialog-header">
            {editFlag ? "Edit Department" : "Create Department"}
          </h2>
          <IoClose
            fontSize={24}
            onClick={close}
            cursor={"pointer"}
            color="#fff"
          />
        </Box>
        <DialogContent>
          <Grid2 container spacing={2}>
            <Grid2 size={4}>
              <MuiText variant="h6" my={1} className="admin-label-title">
                Department Group Name <span className="mandatory-sign">*</span>
              </MuiText>

              <Autocomplete
                options={departmentGroupData || []}
                id="state-autocomplete"
                fullWidth
                size="small"
                value={selectedDepartmentGroup}
                onChange={(event, value) =>
                  handleDepartmentGroupChange(
                    event as React.ChangeEvent<HTMLInputElement>,
                    value,
                    "deptGroupName"
                  )
                }
                getOptionLabel={(option: any) => option?.departmentGroupName}
                renderOption={(props, option) => (
                  <li {...props} key={option?.id}>
                    {option?.departmentGroupName}
                  </li>
                )}
                renderInput={(params) => (
                  <MuiInputField
                    {...params}
                    name="departmentGroupId"
                    value={departmentInput.departmentGroupId}
                    error={error.includes("departmentGroupId")}
                    helperText={
                      error.includes("departmentGroupId") &&
                      "please select a department GroupId"
                    }
                  />
                )}
              />
            </Grid2>
            <Grid2 size={4}>
              <MuiText variant="h6" my={1} className="admin-label-title">
                Short Name <span className="mandatory-sign">*</span>
              </MuiText>
              <MuiInputField
                fullWidth
                variant="outlined"
                type="text"
                size="small"
                value={departmentInput.shortName}
                InputProps={{
                  inputProps: {
                    maxLength: 45,
                  },
                }}
                autoComplete="off"
                name="shortName"
                error={error.includes("shortName")}
                helperText={
                  error.includes("shortName") && "please enter valid shortName"
                }
                onChange={handleChange}
              />
            </Grid2>
            <Grid2 size={4}>
              <MuiText variant="h6" my={1} className="admin-label-title">
                Department Name <span className="mandatory-sign">*</span>
              </MuiText>
              <MuiInputField
                fullWidth
                type="text"
                variant="outlined"
                size="small"
                value={departmentInput.deptName}
                InputProps={{
                  inputProps: {
                    maxLength: 50,
                  },
                }}
                autoComplete="off"
                name="deptName"
                error={error.includes("deptName")}
                helperText={
                  error.includes("deptName") && "please enter valid deptName"
                }
                onChange={handleChange}
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
              onChange={handleSwitch}
              checked={departmentInput.isActive === 1}
              label="Status"
            />
          </FormGroup>
          <Box
            display={"flex"}
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
export default CreateNewDepartment;
