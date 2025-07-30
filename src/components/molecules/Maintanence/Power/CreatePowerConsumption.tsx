import React from "react";
import { CreatePowerConsumptionpage } from "../../../../maintanenceTypes";
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
import { MuiButton, MuiInputField, MuiText } from "bsoft-base-elements";
import { IoClose } from "react-icons/io5";

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});
const CreatePowerConsumption = ({
  open,
  close,
  powerInput,
  handleChange,
  handleSubmit,
  error,
  feederTypeData,
  handledAutoComplete,
  selectedValues,
  feederData,
}: CreatePowerConsumptionpage) => {
  return (
    <React.Fragment>
      <Dialog
        open={open}
        TransitionComponent={Transition}
        keepMounted
        aria-describedby="alert-dialog-slide-description"
        sx={{
          "& .MuiPaper-root": {
            width: "40rem",
            borderRadius: "8px",
            maxWidth: "none !important",
          },
        }}
      >
        <Box className="popup-header-wrapper">
          <h2 className="dialog-header">Add</h2>
          <IoClose
            fontSize={24}
            onClick={close}
            cursor={"pointer"}
            color="#fff"
          />
        </Box>

        <DialogContent sx={{ p: "4px 24px 12px" }}>
          <Grid2>
            <Grid2 container spacing={2}>
              <Grid2 size={{ xs: 12, sm: 6, md: 6 }}>
                <MuiText variant="h6" my={1} className="admin-label-title">
                  Feeder Type <span className="mandatory-sign">*</span>
                </MuiText>

                <Autocomplete
                  options={feederTypeData || []}
                  id="state-autocomplete"
                  fullWidth
                  size="small"
                  value={selectedValues["feederTypeId"]?.[0] || null}
                  onChange={(event, newValue: any) =>
                    handledAutoComplete(
                      event,
                      newValue ? newValue : null,
                      "feederTypeId"
                    )
                  }
                  getOptionLabel={(option: any) => option?.code}
                  renderOption={(props, option) => (
                    <li {...props} key={option?.id}>
                      {option?.code}
                    </li>
                  )}
                  renderInput={(params) => (
                    <MuiInputField
                      {...params}
                      name="feederTypeId"
                      error={error.includes("feederTypeId")}
                      helperText={
                        error.includes("feederTypeId") &&
                        "please select a feeder type"
                      }
                    />
                  )}
                />
              </Grid2>
              <Grid2 size={{ xs: 12, sm: 6, md: 6 }}>
                <MuiText variant="h6" my={1} className="admin-label-title">
                  Feeder Name <span className="mandatory-sign">*</span>
                </MuiText>
                <Autocomplete
                  options={feederData || []}
                  id="state-autocomplete"
                  fullWidth
                  size="small"
                  value={selectedValues["feederId"]?.[0] || null}
                  onChange={(event, newValue: any) =>
                    handledAutoComplete(
                      event,
                      newValue ? newValue : null,
                      "feederId"
                    )
                  }
                  getOptionLabel={(option: any) => option?.feederName}
                  renderOption={(props, option) => (
                    <li {...props} key={option?.id}>
                      {option?.feederName}
                    </li>
                  )}
                  renderInput={(params) => (
                    <MuiInputField
                      {...params}
                      name="feederId"
                      error={error.includes("feederId")}
                      helperText={
                        error.includes("feederId") && "please select feeder"
                      }
                    />
                  )}
                />
              </Grid2>
            </Grid2>
            <Grid2 container spacing={2}>
              <Grid2 size={{ xs: 12, sm: 6, md: 6 }}>
                <MuiText variant="h6" my={1} className="admin-label-title">
                  Opening Meter Reading
                  <span className="mandatory-sign"> *</span>
                </MuiText>
                <MuiInputField
                  fullWidth
                  variant="outlined"
                  type="number"
                  size="small"
                  InputProps={{
                    readOnly: true,
                    inputProps: {
                      min: 0,
                    },
                  }}
                  value={
                    powerInput.openingReading === 0
                      ? ""
                      : powerInput.openingReading
                  }
                  name="openingReading"
                  error={error.includes("openingReading")}
                  helperText={
                    error.includes("openingReading") &&
                    "opening reading missed "
                  }
                />
              </Grid2>

              <Grid2 size={{ xs: 12, sm: 6, md: 6 }}>
                <MuiText variant="h6" my={1} className="admin-label-title">
                  Closing Meter Reading
                  <span className="mandatory-sign"> *</span>
                </MuiText>

                <MuiInputField
                  fullWidth
                  variant="outlined"
                  type="number"
                  size="small"
                  InputProps={{
                    inputProps: {
                      min: 0,
                    },
                  }}
                  value={
                    powerInput.closingReading === 0
                      ? ""
                      : powerInput.closingReading
                  }
                  name="closingReading"
                  onChange={handleChange}
                  error={error.includes("closingReading")}
                  helperText={
                    error.includes("closingReading") &&
                    "please enter valid closing reading "
                  }
                />
              </Grid2>
            </Grid2>
            <Grid2 container spacing={2}>
              <Grid2 size={{ xs: 12, sm: 12, md: 12 }}>
                <MuiText variant="h6" my={1} className="admin-label-title">
                  Total Units
                </MuiText>
                <MuiInputField
                  fullWidth
                  variant="outlined"
                  type="number"
                  size="small"
                  InputProps={{
                    readOnly: true,
                  }}
                  value={
                    powerInput.totalUnits === 0 ? "" : powerInput.totalUnits
                  }
                  name="totalUnits"
                />
              </Grid2>
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
          ></FormGroup>
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

export default CreatePowerConsumption;
