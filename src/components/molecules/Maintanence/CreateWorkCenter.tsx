import React from "react";
import { CreateworkCenterProps } from "../../../types/maintanenceTypes";
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
import { isSubmitting } from "../../../utils/lib";

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});
const CreateWorkCenter = ({
  open,
  close,
  handleSubmit,
  handleChange,
  error,
  workCenterInput,
  handleSwitch,
  handleDepartmentChange,
  selectedDepartment,
  departmentData,
  editFlag,
}: CreateworkCenterProps) => {
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
            {" "}
            {`${editFlag ? "Edit" : "Create"}`} Work Center{" "}
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
                Work Center Code <span className="mandatory-sign">*</span>
              </MuiText>

              <MuiInputField
                fullWidth
                variant="outlined"
                size="small"
                InputProps={{
                  inputProps: {
                    maxLength: 10,
                  },
                }}
                disabled={editFlag}
                autoComplete="off"
                value={workCenterInput.workCenterCode?.toUpperCase()}
                name="workCenterCode"
                onChange={handleChange}
                error={error.includes("workCenterCode")}
                helperText={
                  error.includes("workCenterCode") && "please enter valid code"
                }
              />
            </Grid2>
            <Grid2 size={4}>
              <MuiText variant="h6" my={1} className="admin-label-title">
                Work Center Name <span className="mandatory-sign">*</span>
              </MuiText>

              <MuiInputField
                fullWidth
                variant="outlined"
                size="small"
                autoComplete="off"
                InputProps={{
                  inputProps: {
                    maxLength: 45,
                  },
                }}
                value={workCenterInput.workCenterName}
                name="workCenterName"
                onChange={handleChange}
                error={error.includes("workCenterName")}
                helperText={
                  error.includes("workCenterName") &&
                  "please enter valid workCenter Name"
                }
              />
            </Grid2>
            <Grid2 size={4}>
              <MuiText variant="h6" my={1} className="admin-label-title">
                Department Name <span className="mandatory-sign">*</span>
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
                    value={workCenterInput.departmentId}
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
              checked={workCenterInput.isActive === 1}
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

export default CreateWorkCenter;
