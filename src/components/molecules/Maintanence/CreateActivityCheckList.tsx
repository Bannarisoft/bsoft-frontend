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
import {
  MuiButton,
  MuiInputField,
  MuiSwitch,
  MuiText,
} from "bsoft-base-elements";
import React from "react";
import { IoClose } from "react-icons/io5";
import { CreateActivityCheckListProps } from "../../../types/maintanenceTypes";
import { isSubmitting } from "../../../utils/lib";

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const CreateActivityCheckList = ({
  open,
  close,
  handleSubmit,
  handleChange,
  error,
  checkListInput,
  handleSwitch,
  handleActivityChange,
  selectedActivity,
  activityDate,
  editFlag,
}: CreateActivityCheckListProps) => {
  return (
    <React.Fragment>
      <Dialog
        open={open}
        TransitionComponent={Transition}
        keepMounted
        aria-describedby="alert-dialog-slide-description"
        sx={{
          "& .MuiPaper-root": {
            width: "600px",
            borderRadius: "8px",
          },
        }}
      >
        <Box className="popup-header-wrapper">
          <h2 className="dialog-header">
            {" "}
            {`${editFlag ? "Edit" : "Create"}`} Activity Checklist{" "}
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
                Activity Name <span className="mandatory-sign">*</span>
              </MuiText>
              <Autocomplete
                options={activityDate || []}
                id="manufacture-type-autocomplete"
                fullWidth
                size="small"
                value={selectedActivity}
                getOptionLabel={(option: any) => option?.activityName}
                onChange={(event, value) =>
                  handleActivityChange(
                    event as React.ChangeEvent<HTMLInputElement>,
                    value,
                    "activity"
                  )
                }
                renderOption={(
                  props,
                  option: { id: string; activityName: string }
                ) => (
                  <li {...props} key={option?.id}>
                    {option?.activityName}
                  </li>
                )}
                renderInput={(params) => (
                  <MuiInputField
                    {...params}
                    name="activityID"
                    value={checkListInput.activityID}
                    error={error.includes("activityId")}
                    helperText={
                      error.includes("activityId") &&
                      "please select a activityId"
                    }
                  />
                )}
              />
            </Grid2>
            <Grid2 size={6}>
              <MuiText variant="h6" my={1} className="admin-label-title">
                Activity Check List <span className="mandatory-sign">*</span>
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
                value={checkListInput.activityCheckList}
                name="activityCheckList"
                onChange={handleChange}
                error={error.includes("activityCheckList")}
                helperText={
                  error.includes("activityCheckList") &&
                  "please enter valid activityCheckList "
                }
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
              checked={checkListInput.isActive === 1}
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

export default CreateActivityCheckList;
