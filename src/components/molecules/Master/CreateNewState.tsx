import * as React from "react";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import Slide from "@mui/material/Slide";
import { TransitionProps } from "@mui/material/transitions";
import { CreateStatePropsTypes } from "../../../types";
import { Autocomplete, Box, FormGroup, Grid2 } from "@mui/material";
import { IoClose } from "react-icons/io5";
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

export default function CreateNewState({
  open,
  close,
  stateInput,
  handleSubmit,
  handleChange,
  selectedCountry,
  error,
  country,
  handleContryChange,
  handleSwitch,
  editFlag,
}: CreateStatePropsTypes) {
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
            {editFlag ? "Edit State" : "Create State"}
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
                Country Name <span className="mandatory-sign">*</span>
              </MuiText>
              <Autocomplete
                options={country || []}
                id="company-autocomplete"
                fullWidth
                size="small"
                value={selectedCountry}
                defaultValue={selectedCountry}
                onChange={(event, value) =>
                  handleContryChange(
                    event as React.ChangeEvent<HTMLInputElement>,
                    value,
                    "countryId"
                  )
                }
                getOptionLabel={(option: any) => option?.countryName}
                renderOption={(
                  props,
                  option: { id: string; countryName: string }
                ) => (
                  <li {...props} key={option?.id}>
                    {option?.countryName}
                  </li>
                )}
                renderInput={(params) => (
                  <MuiInputField
                    {...params}
                    name="countryId"
                    value={stateInput.countryId}
                    error={error.includes("countryId")}
                    helperText={
                      error.includes("countryId") && "Please select a country"
                    }
                  />
                )}
              />
            </Grid2>
            <Grid2 size={4}>
              <MuiText variant="h6" my={1} className="admin-label-title">
                State Code <span className="mandatory-sign">*</span>
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
                error={error.includes("stateCode")}
                helperText={
                  error.includes("stateCode") && "please enter valid name"
                }
                value={stateInput.stateCode?.trim()?.toUpperCase()}
                name="stateCode"
                type="text"
                onChange={handleChange}
              />
            </Grid2>
            <Grid2 size={4}>
              <MuiText variant="h6" my={1} className="admin-label-title">
                State Name <span className="mandatory-sign">*</span>
              </MuiText>
              <MuiInputField
                fullWidth
                type="text"
                variant="outlined"
                size="small"
                autoComplete="off"
                name="stateName"
                value={stateInput.stateName}
                InputProps={{
                  inputProps: {
                    maxLength: 50,
                  },
                }}
                error={error.includes("stateName")}
                helperText={
                  error.includes("stateName") && "please enter valid name"
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
              checked={stateInput.isActive === 1}
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
}
