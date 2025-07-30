import React from "react";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import Slide from "@mui/material/Slide";
import { TransitionProps } from "@mui/material/transitions";
import { Autocomplete, Box, FormGroup, Grid2 } from "@mui/material";
import { IoClose } from "react-icons/io5";
import { CreateCityPropsTypes } from "../../../types";
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
const CreateNewCity = ({
  open,
  close,
  cityInput,
  handleSubmit,
  handleChange,
  selectedState,
  error,
  state,
  handleStateChange,
  handleSwitch,
  editFlag,
}: CreateCityPropsTypes) => {
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
            {editFlag ? "Edit City" : "Create City"}
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
                State Name <span className="mandatory-sign">*</span>
              </MuiText>
              <Autocomplete
                options={state || []}
                id="state-autocomplete"
                fullWidth
                size="small"
                value={selectedState}
                onChange={(event, value) =>
                  handleStateChange(
                    event as React.ChangeEvent<HTMLInputElement>,
                    value,
                    "stateId"
                  )
                }
                getOptionLabel={(option: any) => option?.stateName}
                renderOption={(
                  props,
                  option: { id: string; stateName: string }
                ) => (
                  <li {...props} key={option?.id}>
                    {option?.stateName}
                  </li>
                )}
                renderInput={(params) => (
                  <MuiInputField
                    {...params}
                    name="stateId"
                    value={cityInput.stateId}
                    error={error.includes("stateId")}
                    helperText={
                      error.includes("stateId") && "Please select a state"
                    }
                  />
                )}
              />
            </Grid2>
            <Grid2 size={4}>
              <MuiText variant="h6" my={1} className="admin-label-title">
                City Code <span className="mandatory-sign">*</span>
              </MuiText>
              <MuiInputField
                fullWidth
                variant="outlined"
                size="small"
                onChange={handleChange}
                InputProps={{
                  inputProps: {
                    maxLength: 10,
                  },
                }}
                disabled={editFlag}
                autoComplete="off"
                error={error.includes("cityCode")}
                helperText={
                  error.includes("cityCode") && "please enter valid name"
                }
                value={cityInput.cityCode?.toUpperCase()}
                name="cityCode"
                type="text"
              />
            </Grid2>
            <Grid2 size={4}>
              <MuiText variant="h6" my={1} className="admin-label-title">
                City Name <span className="mandatory-sign">*</span>
              </MuiText>
              <MuiInputField
                fullWidth
                type="text"
                variant="outlined"
                autoComplete="off"
                size="small"
                value={cityInput.cityName}
                onChange={handleChange}
                error={error.includes("cityName")}
                helperText={
                  error.includes("cityName") && "please enter valid name"
                }
                InputProps={{
                  inputProps: {
                    maxLength: 50,
                  },
                }}
                name="cityName"
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
              checked={cityInput.isActive === 1}
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
            <MuiButton className="filled-icon-btn" onClick={handleSubmit}>
              Submit
            </MuiButton>
          </Box>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
};
export default CreateNewCity;
