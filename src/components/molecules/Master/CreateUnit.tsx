import {
  Autocomplete,
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  FormControl,
  FormGroup,
  Grid2,
  Slide,
} from "@mui/material";
import { TransitionProps } from "@mui/material/transitions";
import React from "react";
import { IoClose } from "react-icons/io5";
import { CreateUnitProps } from "../../../types";
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

function CreateUnit(props: CreateUnitProps) {
  const {
    open,
    handleClose,
    divisionData,
    unitInput,
    handleInputChange,
    handleSubmit,
    errors,
    handleAutocomplete,
    handleSwitch,
    countryData,
    stateData,
    cityData,
    selectedCountry,
    selectedState,
    selectedCity,
    selectedDivision,
  } = props;

  return (
    <>
      <Dialog
        open={open}
        TransitionComponent={Transition}
        keepMounted
        aria-describedby="alert-dialog-slide-description"
        sx={{
          "& .MuiPaper-root": {
            minWidth: "70vw",
            borderRadius: "8px",
          },
        }}
      >
        <Box className="popup-header-wrapper">
          <h2 className="dialog-header">Create New Unit</h2>
          <IoClose
            fontSize={24}
            onClick={handleClose}
            cursor={"pointer"}
            color="#fff"
          />
        </Box>
        <DialogContent>
          <Grid2 container spacing={2}>
            <Grid2
              size={8}
              className="company-right-border"
              pr={2}
              position={"relative"}
            >
              <MuiText variant="h5" className="admin-page-title">
                General Information
              </MuiText>
              <Grid2 size={12} my={2}>
                <FormControl fullWidth>
                  <MuiText variant="h6" mt={1} className="admin-label-title">
                    Unit Name <span className="mandatory-sign">*</span>
                  </MuiText>
                  <MuiInputField
                    fullWidth
                    variant="outlined"
                    size="small"
                    type="text"
                    name="unitName"
                    error={errors.includes("unitName")}
                    helperText={
                      errors.includes("unitName") &&
                      "please enter valid unit name"
                    }
                    autoComplete="off"
                    value={unitInput.unitName}
                    onChange={handleInputChange}
                  />
                </FormControl>
              </Grid2>
              <Grid2 container spacing={2} my={2}>
                <Grid2 size={6}>
                  <FormControl fullWidth>
                    <MuiText variant="h6" mt={1} className="admin-label-title">
                      Old Unit ID <span className="mandatory-sign">*</span>
                    </MuiText>
                    <MuiInputField
                      fullWidth
                      variant="outlined"
                      size="small"
                      type="text"
                      name="oldUnitId"
                      autoComplete="off"
                      error={errors.includes("oldUnitId")}
                      helperText={
                        errors.includes("oldUnitId") &&
                        "please enter valid old Unit Id"
                      }
                      value={unitInput.oldUnitId}
                      onChange={handleInputChange}
                    />
                  </FormControl>
                </Grid2>
                <Grid2 size={6}>
                  <FormControl fullWidth>
                    <MuiText variant="h6" mt={1} className="admin-label-title">
                      Short Name <span className="mandatory-sign">*</span>
                    </MuiText>
                    <MuiInputField
                      fullWidth
                      variant="outlined"
                      size="small"
                      type="text"
                      name="shortName"
                      autoComplete="off"
                      error={errors.includes("shortName")}
                      helperText={
                        errors.includes("shortName") &&
                        "please enter valid short name"
                      }
                      value={unitInput.shortName}
                      onChange={handleInputChange}
                    />
                  </FormControl>
                </Grid2>
              </Grid2>

              <Grid2 container spacing={2}>
                <Grid2 size={6}>
                  <FormControl fullWidth>
                    <MuiText variant="h6" mt={1} className="admin-label-title">
                      Division Name <span className="mandatory-sign">*</span>
                    </MuiText>
                    <Autocomplete
                      options={divisionData || []}
                      id="division-autocomplete"
                      fullWidth
                      size="small"
                      value={selectedDivision}
                      defaultValue={selectedDivision}
                      getOptionLabel={(option: any) => option?.name}
                      onChange={(event, value) =>
                        handleAutocomplete(
                          event as React.ChangeEvent<HTMLInputElement>,
                          value,
                          "division"
                        )
                      }
                      renderOption={(
                        props,
                        option: { id: string; name: string }
                      ) => (
                        <li {...props} key={option?.id}>
                          {option?.name}
                        </li>
                      )}
                      renderInput={(params) => (
                        <MuiInputField
                          {...params}
                          name="division"
                          error={errors.includes("division")}
                          helperText={
                            errors.includes("division") &&
                            "Please select a division"
                          }
                        />
                      )}
                    />
                  </FormControl>
                </Grid2>

                <Grid2 size={6}>
                  <FormControl fullWidth>
                    <MuiText variant="h6" mt={1} className="admin-label-title">
                      Unit Head Name <span className="mandatory-sign">*</span>
                    </MuiText>
                    <MuiInputField
                      fullWidth
                      variant="outlined"
                      size="small"
                      name="unitHeadName"
                      error={errors.includes("unitHeadName")}
                      helperText={
                        errors.includes("unitHeadName") &&
                        "please enter valid unit head name"
                      }
                      autoComplete="off"
                      value={unitInput.unitHeadName}
                      onChange={handleInputChange}
                    />
                  </FormControl>
                </Grid2>
              </Grid2>

              <MuiText variant="h5" mt={2} className="admin-page-title">
                Unit Address
              </MuiText>

              <Grid2 container spacing={2} mt={1} mb={2}>
                <Grid2 size={6}>
                  <FormControl fullWidth>
                    <MuiText variant="h6" mt={1} className="admin-label-title">
                      Country Name <span className="mandatory-sign">*</span>
                    </MuiText>
                    <Autocomplete
                      options={countryData || []}
                      id="country-autocomplete"
                      fullWidth
                      size="small"
                      value={selectedCountry}
                      defaultValue={selectedCountry}
                      getOptionLabel={(option: any) => option?.countryName}
                      onChange={(event, value) =>
                        handleAutocomplete(
                          event as React.ChangeEvent<HTMLInputElement>,
                          value,
                          "country"
                        )
                      }
                      renderOption={(
                        props,
                        option: { countryCode: string; countryName: string }
                      ) => (
                        <li {...props} key={option?.countryCode}>
                          {option?.countryName}
                        </li>
                      )}
                      renderInput={(params) => (
                        <MuiInputField
                          {...params}
                          name="country"
                          error={errors.includes("country")}
                          helperText={
                            errors.includes("country") &&
                            "Please select a country"
                          }
                        />
                      )}
                    />
                  </FormControl>
                </Grid2>
                <Grid2 size={6}>
                  <FormControl fullWidth>
                    <MuiText variant="h6" mt={1} className="admin-label-title">
                      State Name <span className="mandatory-sign">*</span>
                    </MuiText>
                    <Autocomplete
                      options={stateData || []}
                      id="state-autocomplete"
                      fullWidth
                      size="small"
                      value={selectedState}
                      onChange={(event, value) =>
                        handleAutocomplete(
                          event as React.ChangeEvent<HTMLInputElement>,
                          value,
                          "state"
                        )
                      }
                      getOptionLabel={(option: any) => option?.stateName}
                      renderOption={(
                        props,
                        option: { stateCode: string; stateName: string }
                      ) => (
                        <li {...props} key={option?.stateCode}>
                          {option?.stateName}
                        </li>
                      )}
                      renderInput={(params) => (
                        <MuiInputField
                          {...params}
                          error={errors.includes("state")}
                          helperText={
                            errors.includes("state") && "Please select a state"
                          }
                        />
                      )}
                    />
                  </FormControl>
                </Grid2>
              </Grid2>

              <Grid2 container spacing={2} mb={2}>
                <Grid2 size={6}>
                  <FormControl fullWidth>
                    <MuiText variant="h6" mt={1} className="admin-label-title">
                      City Name <span className="mandatory-sign">*</span>
                    </MuiText>
                    <Autocomplete
                      options={cityData || []}
                      id="city-autocomplete"
                      fullWidth
                      size="small"
                      value={selectedCity}
                      onChange={(event, value) =>
                        handleAutocomplete(
                          event as React.ChangeEvent<HTMLInputElement>,
                          value,
                          "city"
                        )
                      }
                      getOptionLabel={(option: any) => option?.cityName}
                      renderOption={(
                        props,
                        option: { cityCode: string; cityName: string }
                      ) => (
                        <li {...props} key={option?.cityCode}>
                          {option?.cityName}
                        </li>
                      )}
                      renderInput={(params) => (
                        <MuiInputField
                          {...params}
                          error={errors.includes("city")}
                          helperText={
                            errors.includes("city") && "Please select a city"
                          }
                        />
                      )}
                    />
                  </FormControl>
                </Grid2>
                <Grid2 size={6}>
                  <FormControl fullWidth>
                    <MuiText variant="h6" mt={1} className="admin-label-title">
                      Pincode <span className="mandatory-sign">*</span>
                    </MuiText>
                    <MuiInputField
                      fullWidth
                      variant="outlined"
                      size="small"
                      type="text"
                      value={
                        unitInput.pincode &&
                        unitInput.pincode.toString() !== "0"
                          ? unitInput.pincode.toString().slice(0, 6)
                          : ""
                      }
                      autoComplete="off"
                      name="pincode"
                      error={errors.includes("pincode")}
                      helperText={
                        errors.includes("pincode") &&
                        "please enter valid pincode"
                      }
                      onChange={handleInputChange}
                    />
                  </FormControl>
                </Grid2>
              </Grid2>

              <Grid2 container spacing={2} mb={2}>
                <Grid2 size={6}>
                  <FormControl fullWidth>
                    <MuiText variant="h6" mt={1} className="admin-label-title">
                      Contact Number <span className="mandatory-sign">*</span>
                    </MuiText>
                    <MuiInputField
                      fullWidth
                      variant="outlined"
                      size="small"
                      type="tel"
                      name="contact"
                      value={
                        unitInput.contact !== undefined
                          ? unitInput.contact.toString()
                          : ""
                      }
                      autoComplete="off"
                      onInput={(e) => {
                        const input = e.target as HTMLInputElement;
                        input.value = input.value
                          .replace(/\D/g, "")
                          .slice(0, 10);
                      }}
                      inputProps={{ maxLength: 10 }}
                      onChange={handleInputChange}
                      error={errors.includes("contact")}
                      helperText={
                        errors.includes("contact") &&
                        "please enter valid contact number"
                      }
                    />
                  </FormControl>
                </Grid2>
                <Grid2 size={6}>
                  <FormControl fullWidth>
                    <MuiText variant="h6" mt={1} className="admin-label-title">
                      Alternate Contact Number{" "}
                    </MuiText>
                    <MuiInputField
                      fullWidth
                      variant="outlined"
                      size="small"
                      name="alternateContact"
                      type="tel"
                      onInput={(e) => {
                        const input = e.target as HTMLInputElement;
                        input.value = input.value
                          .replace(/\D/g, "")
                          .slice(0, 10);
                      }}
                      autoComplete="off"
                      inputProps={{ maxLength: 10 }}
                      value={
                        unitInput.alternateContact !== undefined
                          ? unitInput.alternateContact.toString()
                          : ""
                      }
                      onChange={handleInputChange}
                    />
                  </FormControl>
                </Grid2>
              </Grid2>

              <Grid2 container spacing={2}>
                <Grid2 size={6}>
                  <FormControl fullWidth>
                    <MuiText variant="h6" mt={1} className="admin-label-title">
                      Address Line 1 <span className="mandatory-sign">*</span>
                    </MuiText>
                    <MuiInputField
                      fullWidth
                      variant="outlined"
                      size="small"
                      rows={2}
                      multiline
                      name="address1"
                      autoComplete="off"
                      error={errors.includes("address1")}
                      helperText={
                        errors.includes("address1") &&
                        "please enter valid address line 1"
                      }
                      value={
                        unitInput.address1 !== undefined
                          ? unitInput.address1.toString()
                          : ""
                      }
                      onChange={handleInputChange}
                    />
                  </FormControl>
                </Grid2>
                <Grid2 size={6}>
                  <FormControl fullWidth>
                    <MuiText variant="h6" mt={1} className="admin-label-title">
                      Address Line 2
                    </MuiText>
                    <MuiInputField
                      fullWidth
                      variant="outlined"
                      size="small"
                      name="address2"
                      rows={2}
                      multiline
                      value={
                        unitInput.address2 !== undefined
                          ? unitInput.address2.toString()
                          : ""
                      }
                      onChange={handleInputChange}
                    />
                  </FormControl>
                </Grid2>
              </Grid2>
            </Grid2>
            <Grid2 size={4}>
              <MuiText variant="h5" className="admin-page-title">
                Unit Contact Information
              </MuiText>
              <FormControl fullWidth>
                <MuiText variant="h6" mt={3} className="admin-label-title">
                  Name <span className="mandatory-sign">*</span>
                </MuiText>
                <MuiInputField
                  fullWidth
                  variant="outlined"
                  size="small"
                  name="contactName"
                  value={
                    unitInput.contactName !== undefined
                      ? unitInput.contactName.toString()
                      : ""
                  }
                  autoComplete="off"
                  onChange={handleInputChange}
                  error={errors.includes("contactName")}
                  helperText={
                    errors.includes("contactName") &&
                    "please enter valid contact name"
                  }
                />
              </FormControl>
              <FormControl fullWidth>
                <MuiText variant="h6" mt={3} className="admin-label-title">
                  Designation <span className="mandatory-sign">*</span>
                </MuiText>
                <MuiInputField
                  fullWidth
                  variant="outlined"
                  size="small"
                  name="designation"
                  value={
                    unitInput.designation !== undefined
                      ? unitInput.designation.toString()
                      : ""
                  }
                  autoComplete="off"
                  onChange={handleInputChange}
                  error={errors.includes("designation")}
                  helperText={
                    errors.includes("designation") &&
                    "please enter valid designation"
                  }
                />
              </FormControl>
              <FormControl fullWidth>
                <MuiText variant="h6" mt={3} className="admin-label-title">
                  Email <span className="mandatory-sign">*</span>
                </MuiText>
                <MuiInputField
                  fullWidth
                  variant="outlined"
                  size="small"
                  name="email"
                  value={
                    unitInput.email !== undefined
                      ? unitInput.email.toString()
                      : ""
                  }
                  autoComplete="off"
                  onChange={handleInputChange}
                  error={errors.includes("email")}
                  helperText={
                    errors.includes("email") && "please enter valid email"
                  }
                />
              </FormControl>

              <FormControl fullWidth>
                <MuiText variant="h6" mt={3} className="admin-label-title">
                  Phone <span className="mandatory-sign">*</span>
                </MuiText>
                <MuiInputField
                  fullWidth
                  type="tel"
                  variant="outlined"
                  size="small"
                  name="phone"
                  onInput={(e) => {
                    const input = e.target as HTMLInputElement;
                    input.value = input.value.replace(/\D/g, "").slice(0, 10);
                  }}
                  autoComplete="off"
                  inputProps={{ maxLength: 10 }}
                  value={
                    unitInput.phone !== undefined
                      ? unitInput.phone.toString()
                      : ""
                  }
                  onChange={handleInputChange}
                  error={errors.includes("phone")}
                  helperText={
                    errors.includes("phone") &&
                    "please enter valid phone number"
                  }
                />
              </FormControl>

              <FormControl fullWidth>
                <MuiText variant="h6" mt={3} className="admin-label-title">
                  Remarks
                </MuiText>
                <MuiInputField
                  fullWidth
                  variant="outlined"
                  size="small"
                  multiline
                  rows={4}
                  name="remarks"
                  value={
                    unitInput.remarks !== undefined
                      ? unitInput.remarks.toString()
                      : ""
                  }
                  onChange={handleInputChange}
                />
              </FormControl>
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
              checked={unitInput.isActive === 1}
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
              onClick={handleClose}
            >
              Cancel
            </MuiButton>
            <MuiButton className="filled-icon-btn" onClick={handleSubmit}>
              Submit
            </MuiButton>
          </Box>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default CreateUnit;
