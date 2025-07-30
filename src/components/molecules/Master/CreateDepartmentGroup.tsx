import React from "react";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";

import Slide from "@mui/material/Slide";
import { TransitionProps } from "@mui/material/transitions";
import { Box, FormGroup, Grid2 } from "@mui/material";
import { IoClose } from "react-icons/io5";

import { CreateDepartmentGroupType } from "../../../types";
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
const CreateDepartmentGroup = ({
  open,
  close,
  departmentGroupInput,
  handleSubmit,
  handleChange,
  error,
  handleSwitch,
  editFlag,
}: CreateDepartmentGroupType) => {
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
            {editFlag ? "Edit Department Group" : "Create Department Group"}
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
            <Grid2 size={6}>
              <MuiText variant="h6" my={1} className="admin-label-title">
              Department Group Code <span className="mandatory-sign">*</span>
              </MuiText>
              <MuiInputField
                fullWidth
                variant="outlined"
                type="text"
                autoComplete="off"
                size="small"
                disabled={editFlag}
                value={departmentGroupInput.departmentGroupCode?.toUpperCase()}
                InputProps={{
                  inputProps: {
                    maxLength: 45,
                  },
                }}
                name="departmentGroupCode"
                error={error.includes("departmentGroupCode")}
                helperText={
                  error.includes("departmentGroupCode") &&
                  "please enter valid departmentGroupCode"
                }
                onChange={handleChange}
              />
            </Grid2>
            <Grid2 size={6}>
              <MuiText variant="h6" my={1} className="admin-label-title">
                Department Group Name <span className="mandatory-sign">*</span>
              </MuiText>
              <MuiInputField
                fullWidth
                type="text"
                variant="outlined"
                size="small"
                autoComplete="off"
                value={departmentGroupInput.departmentGroupName}
                InputProps={{
                  inputProps: {
                    maxLength: 50,
                  },
                }}
                name="departmentGroupName"
                error={error.includes("departmentGroupName")}
                helperText={
                  error.includes("departmentGroupName") &&
                  "please enter valid department group"
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
              checked={departmentGroupInput.isActive === 1}
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
export default CreateDepartmentGroup;
