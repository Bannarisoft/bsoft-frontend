import React from "react";
import { CreateFeederGroupPropType } from "../../../../types/maintanenceTypes";
import {
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  FormGroup,
  Grid2,
  Slide,
} from "@mui/material";
import { IoClose } from "react-icons/io5";
import {
  MuiButton,
  MuiInputField,
  MuiSwitch,
  MuiText,
} from "bsoft-base-elements";
import { TransitionProps } from "@mui/material/transitions";
import { isSubmitting } from "../../../../utils/lib";
const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});
const CreateFeederGroup = ({
  open,
  close,
  error,
  handleChange,
  handleSubmit,
  feedergroupInput,
  editFlag,
  handleSwitch,
}: CreateFeederGroupPropType) => {
  return (
    <React.Fragment>
      <Dialog
        open={open}
        TransitionComponent={Transition}
        keepMounted
        aria-describedby="alert-dialog-slide-description"
        sx={{
          "& .MuiPaper-root": {
            width: "35rem",
            borderRadius: "8px",
            maxWidth: "none !important",
          },
        }}
      >
        <Box className="popup-header-wrapper">
          <h2 className="dialog-header">
            {`${editFlag ? "Edit" : "Create"}`} Feeder Group{" "}
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
            <Grid2 size={6}>
              <MuiText variant="h6" my={1} className="admin-label-title">
                Feeder Group Code <span className="mandatory-sign">*</span>
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
                disabled={editFlag}
                autoComplete="off"
                value={feedergroupInput.feederGroupCode?.toUpperCase()}
                onChange={handleChange}
                error={error.includes("feederGroupCode")}
                helperText={
                  error.includes("feederGroupCode") && "please enter valid code"
                }
                name="feederGroupCode"
              />
            </Grid2>
            <Grid2 size={6}>
              <MuiText variant="h6" my={1} className="admin-label-title">
                Feeder Group Name <span className="mandatory-sign">*</span>
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
                value={feedergroupInput.feederGroupName}
                onChange={handleChange}
                error={error.includes("feederGroupName")}
                helperText={
                  error.includes("feederGroupName") && "please enter valid name"
                }
                name="feederGroupName"
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
              checked={feedergroupInput.isActive === 1}
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

export default CreateFeederGroup;
