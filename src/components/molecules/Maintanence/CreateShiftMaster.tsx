import React from "react";
import { CreateShiftProps } from "../../../maintanenceTypes";
import {
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
import InputDatePicker from "../../atoms/Datepicker";
import dayjs from "dayjs";

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});
const CreateShiftMaster = ({
  open,
  close,
  handleSubmit,
  handleChange,
  error,
  shiftInput,
  handleSwitch,
  editFlag,
}: CreateShiftProps) => {
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
            {`${editFlag ? "Edit" : "Create"}`} Shift{" "}
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
               Shift Code <span className="mandatory-sign">*</span>
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
                disabled={editFlag}
                value={shiftInput.shiftCode.toUpperCase()}
                name="shiftCode"
                onChange={handleChange}
                error={error.includes("shiftCode")}
                helperText={
                  error.includes("shiftCode") && "please enter valid code"
                }
              />
            </Grid2>
            <Grid2 size={4}>
              <MuiText variant="h6" my={1} className="admin-label-title">
               Shift Name <span className="mandatory-sign">*</span>
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
                value={shiftInput.shiftName}
                name="shiftName"
                onChange={handleChange}
                error={error.includes("shiftName")}
                helperText={
                  error.includes("shiftName") &&
                  "please enter valid workCenter Name"
                }
              />
            </Grid2>
            <Grid2 size={4}>
              <MuiText variant="h6" my={1} className="admin-label-title">
                EffectiveDate <span className="mandatory-sign">*</span>
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
                  shiftInput.effectiveDate
                    ? dayjs(shiftInput.effectiveDate)
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
              checked={shiftInput.isActive === 1}
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
            <MuiButton className="filled-icon-btn" onClick={handleSubmit}>
              Submit
            </MuiButton>
          </Box>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
};

export default CreateShiftMaster;
