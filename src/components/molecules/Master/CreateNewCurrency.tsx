import {
  Autocomplete,
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
import TextComponent from "../../atoms/Text";
import InputComponent from "../../atoms/Input";
import ButtonComponent from "../../atoms/Button";
import { TransitionProps } from "@mui/material/transitions";
import { CreateCurrencyPropTypes } from "../../../types/types";
import MyCustomSwitch from "../../atoms/Switch";
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
const CreateNewCurrency = ({
  open,
  close,
  handleChange,
  handleSubmit,
  currencyInput,
  error,
  handleSwitch,
  editFlag,
}: CreateCurrencyPropTypes) => {
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
          },
        }}
      >
        <Box className="popup-header-wrapper">
          <h2 className="dialog-header">
            {editFlag ? "Edit Currency" : "Create Currency"}
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
                Currency Code <span className="mandatory-sign">*</span>
              </MuiText>
              <MuiInputField
                fullWidth
                variant="outlined"
                type="text"
                size="small"
                value={currencyInput.code?.toUpperCase()}
                InputProps={{
                  inputProps: {
                    maxLength: 10,
                  },
                }}
                disabled={editFlag}
                autoComplete="off"
                name="code"
                error={error.includes("code")}
                helperText={error.includes("code") && "please enter valid code"}
                onChange={handleChange}
              />
            </Grid2>
            <Grid2 size={8}>
              <MuiText variant="h6" my={1} className="admin-label-title">
                Currency Name <span className="mandatory-sign">*</span>
              </MuiText>
              <MuiInputField
                fullWidth
                type="text"
                variant="outlined"
                size="small"
                value={currencyInput.name}
                InputProps={{
                  inputProps: {
                    maxLength: 50,
                  },
                }}
                autoComplete="off"
                name="name"
                error={error.includes("name")}
                helperText={
                  error.includes("name") && "please enter valid Currency Name"
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
              checked={currencyInput.isActive === 1}
              onChange={handleSwitch}
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
            <MuiButton className="filled-icon-btn" disabled={isSubmitting()} onClick={handleSubmit}>
              Submit
            </MuiButton>
          </Box>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
};
export default CreateNewCurrency;
