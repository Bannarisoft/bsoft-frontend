import {
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  FormGroup,
  Grid2,
  Slide,
  Switch,
} from "@mui/material";
import React from "react";
import { IoClose } from "react-icons/io5";
import TextComponent from "../../../atoms/Text";
import InputComponent from "../../../atoms/Input";
import ButtonComponent from "../../../atoms/Button";
import { TransitionProps } from "@mui/material/transitions";
import { CreateRoleProps } from "../../../../types/types";
import MyCustomSwitch from "../../../atoms/Switch";
import {
  MuiButton,
  MuiInputField,
  MuiSwitch,
  MuiText,
} from "bsoft-base-elements";
import { isSubmitting } from "../../../../utils/lib";

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});
export default function CreateNewRole({
  open,
  close,
  roleInput,
  handleSubmit,
  handleChange,
  error,
  handleSwitch,
  editFlag,
}: CreateRoleProps) {
  return (
    <React.Fragment>
      <Dialog
        open={open}
        TransitionComponent={Transition}
        keepMounted
        aria-describedby="alert-dialog-slide-description"
        sx={{
          "& .MuiPaper-root": {
            width: "500px",
          },
        }}
      >
        <Box className="popup-header-wrapper">
          <h2 className="dialog-header">
            {editFlag ? "Edit Role" : "Create Role"}
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
                Role Name <span className="mandatory-sign">*</span>
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
                error={error.includes("roleName")}
                helperText={
                  error.includes("roleName") && "please enter valid name"
                }
                value={roleInput.roleName}
                name="roleName"
                onChange={handleChange}
              />
            </Grid2>
            <Grid2 size={8}>
              <MuiText variant="h6" my={1} className="admin-label-title">
                Description <span className="mandatory-sign">*</span>
              </MuiText>
              <MuiInputField
                fullWidth
                type="text"
                variant="outlined"
                size="small"
                name="description"
                value={roleInput.description}
                error={error.includes("description")}
                helperText={
                  error.includes("description") && "please enter valid name"
                }
                onChange={handleChange}
                InputProps={{
                  inputProps: {
                    maxLength: 50,
                  },
                }}
              />
            </Grid2>
          </Grid2>
        </DialogContent>
        <DialogActions
          sx={{
            borderTop: "1px solid #f1f1f1",
            py: 2,
            justifyContent: "space-between",
          }}
        >
          <FormGroup
            sx={{
              pl: 2,
            }}
          >
            <MuiSwitch
              onChange={handleSwitch}
              checked={roleInput.isActive === 1}
              label="Status"
            />
          </FormGroup>
          <Box display={"flex"} alignItems={"center"} gap={2}>
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
}
