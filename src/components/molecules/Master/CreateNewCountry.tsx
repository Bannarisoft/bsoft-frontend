import * as React from "react";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import Slide from "@mui/material/Slide";
import { TransitionProps } from "@mui/material/transitions";
import { CreateCountryPropTypes } from "../../../types/types";
import { Box, FormGroup, Grid2 } from "@mui/material";
import { IoClose } from "react-icons/io5";
import {
  MuiButton,
  MuiInputField,
  MuiSwitch,
  MuiText,
} from "bsoft-base-elements";
import { isSubmitting } from "../../../utils/lib";

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & { children: React.ReactElement<any, any> },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

type Props = CreateCountryPropTypes & {
  disableSubmit: boolean; // Coming from parent: whether to disable Submit button
};

export default function CreateNewCountry({
  open,
  close,
  countryInput,
  handleSubmit,
  handleChange,
  error,
  handleSwitch,
  editFlag,
  disableSubmit,
}: Props) {
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
            borderRadius: "8px",
          },
        }}
      >
        <Box className="popup-header-wrapper">
          <h2 className="dialog-header">
            {editFlag ? "Edit Country" : "Create Country"}
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
                Country Code <span className="mandatory-sign">*</span>
              </MuiText>
              <MuiInputField
                fullWidth
                variant="outlined"
                size="small"
                InputProps={{ inputProps: { maxLength: 8 } }}
                disabled={editFlag} // lock during edit
                autoComplete="off"
                error={error.includes("countryCode")}
                helperText={
                  error.includes("countryCode") && "Invalid country code length"
                }
                value={(countryInput.countryCode || "").toUpperCase()}
                name="countryCode"
                onChange={handleChange}
              />
            </Grid2>

            <Grid2 size={8}>
              <MuiText variant="h6" my={1} className="admin-label-title">
                Country Name <span className="mandatory-sign">*</span>
              </MuiText>
              <MuiInputField
                fullWidth
                type="text"
                variant="outlined"
                size="small"
                name="countryName"
                autoComplete="off"
                value={countryInput.countryName || ""}
                error={error.includes("countryName")}
                helperText={
                  error.includes("countryName") &&
                  "Please enter valid country name"
                }
                onChange={handleChange}
                InputProps={{ inputProps: { maxLength: 50 } }}
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
          <FormGroup sx={{ pl: 2 }}>
            <MuiSwitch
              checked={countryInput.isActive === 1}
              onChange={handleSwitch}
              label="Status"
            />
          </FormGroup>

          <Box
            display={"flex"}
            alignItems={"center"}
            gap={2}
            sx={{ button: { minWidth: "70px !important" } }}
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
              onClick={handleSubmit}
              disabled={disableSubmit || isSubmitting()} // Prevents clicks until valid & dirty (or just valid in create mode)
            >
              Submit
            </MuiButton>
          </Box>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}
