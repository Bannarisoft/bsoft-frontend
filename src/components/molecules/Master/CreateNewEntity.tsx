import * as React from "react";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import Slide from "@mui/material/Slide";
import { TransitionProps } from "@mui/material/transitions";
import { Box, FormGroup, Grid2 } from "@mui/material";
import { IoClose } from "react-icons/io5";
import { CreateEntiryPropTypes } from "../../../types/types";
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

export default function CreateNewEntity({
  open,
  close,
  entityInput,
  handleChange,
  handleSubmit,
  error,
  handleSwitch,
  editFlag,
}: CreateEntiryPropTypes) {
  return (
    <React.Fragment>
      <Dialog
        open={open}
        TransitionComponent={Transition}
        keepMounted
        aria-describedby="alert-dialog-slide-description"
        sx={{
          "& .MuiPaper-root": {
            maxWidth: "100vw",
            width: "50em",
            borderRadius: "8px",
          },
        }}
      >
        <Box className="popup-header-wrapper">
          <h2 className="dialog-header">
            {editFlag ? "Edit Entity" : "Create Entity"}
          </h2>

          <IoClose
            fontSize={24}
            onClick={close}
            cursor={"pointer"}
            color="#fff"
          />
        </Box>

        <DialogContent>
          <Grid2 container>
            <Grid2 size={12}>
              <MuiText variant="h6" mb={1} className="admin-label-title">
                Entity Name <span className="mandatory-sign">*</span>
              </MuiText>
              <MuiInputField
                fullWidth
                type="text"
                variant="outlined"
                size="small"
                name="entityName"
                value={entityInput.entityName}
                onChange={handleChange}
                autoComplete="off"
                error={error.includes("entityName")}
                helperText={
                  error.includes("entityName") && "Please enter valid name"
                }
                InputProps={{
                  inputProps: {
                    maxLength: 100,
                  },
                }}
              />
            </Grid2>
          </Grid2>
          <Grid2 size={12}>
            <MuiText variant="h6" my={1} className="admin-label-title">
              Entity Description
            </MuiText>
            <MuiInputField
              fullWidth
              type="text"
              variant="outlined"
              size="small"
              multiline
              rows={4}
              autoComplete="off"
              name="entityDescription"
              value={entityInput.entityDescription}
              onChange={handleChange}
              InputProps={{
                inputProps: {
                  maxLength: 250,
                },
              }}
            />
          </Grid2>
          <Grid2 size={12}>
            <MuiText variant="h6" my={1} className="admin-label-title">
              Head office Address <span className="mandatory-sign">*</span>
            </MuiText>
            <MuiInputField
              fullWidth
              type="text"
              variant="outlined"
              size="small"
              multiline
              rows={3}
              autoComplete="off"
              name="address"
              value={entityInput.address}
              onChange={handleChange}
              error={error.includes("address")}
              helperText={
                error.includes("address") && "Please enter valid address"
              }
              InputProps={{
                inputProps: {
                  maxLength: 200,
                },
              }}
            />
          </Grid2>
          <Grid2 container spacing={2}>
            <Grid2 size={6}>
              <MuiText variant="h6" my={1} className="admin-label-title">
                Phone <span className="mandatory-sign">*</span>
              </MuiText>
              <MuiInputField
                fullWidth
                type="tel"
                variant="outlined"
                size="small"
                name="phone"
                autoComplete="off"
                onInput={(e) => {
                  const input = e.target as HTMLInputElement;
                  input.value = input.value.replace(/\D/g, "").slice(0, 10);
                }}
                inputProps={{ maxLength: 10 }}
                value={entityInput.phone}
                onChange={handleChange}
                error={error.includes("phone")}
                helperText={
                  error.includes("phone") && "Please enter valid phone number"
                }
              />
            </Grid2>
            <Grid2 size={6}>
              <MuiText variant="h6" my={1} className="admin-label-title">
                Email <span className="mandatory-sign">*</span>
              </MuiText>
              <MuiInputField
                fullWidth
                type="email"
                variant="outlined"
                size="small"
                name="email"
                autoComplete="off"
                error={error.includes("email")}
                helperText={
                  error.includes("email") && "Please enter valid email"
                }
                value={entityInput.email}
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
              checked={entityInput.isActive === 1}
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
            <MuiButton className="filled-icon-btn" disabled={isSubmitting()} onClick={handleSubmit}>
              Submit
            </MuiButton>
          </Box>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}
