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
import {
  MuiButton,
  MuiInputField,
  MuiSwitch,
  MuiText,
} from "bsoft-base-elements";
import React from "react";
import { IoClose } from "react-icons/io5";
import { isSubmitting } from "../../../utils/lib";
export interface ManufacturerInputTypes {
  code: string;
  manufactureName: string;
  manufactureType: number;
  countryId: number;
  stateId: number;
  cityId: number;
  addressLine1: string;
  addressLine2: string;
  pinCode: string;
  personName: string;
  phoneNumber: string;
  email: string;
  id: number;
  isActive: number;
}
interface CreateMiscPropTypes {
  open: boolean;
  close: () => void;
  handleSubmit: (e: React.MouseEvent<HTMLButtonElement>) => void;
  handleSwitch: (e: React.ChangeEvent<HTMLInputElement>) => void;
  errors: Array<{}>;
  handleAutocomplete: (
    e: React.SyntheticEvent | any, // <-- Fix here
    value: any,
    field: string
  ) => void;
  handleManufacturertype: (
    e: React.ChangeEvent<HTMLInputElement>,
    value: { id: string; description: string } | null,
    field: string
  ) => void;
  editFlag: boolean;
  countryData: Array<{}>;
  stateData: Array<{}>;
  cityData: Array<{}>;
  selectedCountry: any;
  selectedState: any;
  selectedCity: any;
  selectedManufacturerType: any;
  manufacturerData: any;
  manufacturerType: any;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  manufacturerInput: ManufacturerInputTypes;
}
const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});
export default function CreateManufacturer({
  open,
  close,
  handleAutocomplete,
  countryData,
  selectedCountry,
  stateData,
  selectedState,
  cityData,
  selectedCity,
  errors,
  manufacturerType,
  handleManufacturertype,
  selectedManufacturerType,
  handleSubmit,
  handleSwitch,
  manufacturerInput,
  handleChange,
  editFlag,
}: CreateMiscPropTypes) {
  return (
    <React.Fragment>
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
          <h2 className="dialog-header">
            {editFlag ? "Edit Manufacturer" : "Create Manufacturer"}
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
            <Grid2 size={12} position={"relative"}>
              <Grid2 container spacing={2}>
                <Grid2 size={3}>
                  <FormControl fullWidth>
                    <MuiText variant="h6" mt={1} className="admin-label-title">
                      Manufacturer Code
                      <span className="mandatory-sign"> *</span>
                    </MuiText>
                    <MuiInputField
                      fullWidth
                      variant="outlined"
                      size="small"
                      type="text"
                      name="code"
                      InputProps={{
                        inputProps: {
                          maxLength: 10,
                        },
                      }}
                      disabled={editFlag}
                      autoComplete="off"
                      onChange={handleChange}
                      value={manufacturerInput.code.toUpperCase()}
                      error={errors.includes("code")}
                      helperText={
                        errors.includes("code") &&
                        "please enter valid  manufacturer code"
                      }
                    />
                  </FormControl>
                </Grid2>
                <Grid2 size={3}>
                  <FormControl fullWidth>
                    <MuiText variant="h6" mt={1} className="admin-label-title">
                      Manufacturer Name
                      <span className="mandatory-sign"> *</span>
                    </MuiText>
                    <MuiInputField
                      fullWidth
                      variant="outlined"
                      size="small"
                      type="text"
                      name="manufactureName"
                      InputProps={{
                        inputProps: {
                          maxLength: 45,
                        },
                      }}
                      autoComplete="off"
                      value={manufacturerInput.manufactureName}
                      onChange={handleChange}
                      error={errors.includes("manufactureName")}
                      helperText={
                        errors.includes("manufactureName") &&
                        "please enter valid  manufacturer name"
                      }
                    />
                  </FormControl>
                </Grid2>
                <Grid2 size={3}>
                  <FormControl fullWidth>
                    <MuiText variant="h6" mt={1} className="admin-label-title">
                      Person Name <span className="mandatory-sign">*</span>
                    </MuiText>
                    <MuiInputField
                      fullWidth
                      variant="outlined"
                      size="small"
                      type="text"
                      name="personName"
                      InputProps={{
                        inputProps: {
                          maxLength: 45,
                        },
                      }}
                      autoComplete="off"
                      value={manufacturerInput.personName}
                      onChange={handleChange}
                      error={errors.includes("personName")}
                      helperText={
                        errors.includes("personName") &&
                        "please enter valid  person name"
                      }
                    />
                  </FormControl>
                </Grid2>
                <Grid2 size={3}>
                  <FormControl fullWidth>
                    <MuiText variant="h6" mt={1} className="admin-label-title">
                      Phone Number <span className="mandatory-sign">*</span>
                    </MuiText>
                    <MuiInputField
                      fullWidth
                      variant="outlined"
                      size="small"
                      type="tel"
                      name="phoneNumber"
                      onInput={(e) => {
                        const input = e.target as HTMLInputElement;
                        input.value = input.value
                          .replace(/\D/g, "")
                          .slice(0, 10);
                      }}
                      autoComplete="off"
                      inputProps={{ maxLength: 10 }}
                      value={manufacturerInput.phoneNumber}
                      onChange={handleChange}
                      error={errors.includes("phoneNumber")}
                      helperText={
                        errors.includes("phoneNumber") &&
                        "please enter valid  phone number"
                      }
                    />
                  </FormControl>
                </Grid2>
              </Grid2>
              <Grid2 container spacing={2}>
                <Grid2 size={3}>
                  <FormControl fullWidth>
                    <MuiText variant="h6" mt={1} className="admin-label-title">
                      {" "}
                      Country Name <span className="mandatory-sign">*</span>
                    </MuiText>
                    <Autocomplete
                      options={countryData || []}
                      value={selectedCountry}
                      getOptionLabel={(option: any) => option.countryName}
                      onChange={(event, value) =>
                        handleAutocomplete(event, value, "country")
                      }
                      renderInput={(params) => (
                        <MuiInputField
                          {...params}
                          error={errors.includes("country")}
                          helperText={
                            errors.includes("country") &&
                            "Please select a country"
                          }
                          size="small"
                        />
                      )}
                    />
                  </FormControl>
                </Grid2>

                <Grid2 size={3}>
                  <FormControl fullWidth>
                    <MuiText variant="h6" mt={1} className="admin-label-title">
                      {" "}
                      State Name <span className="mandatory-sign">*</span>
                    </MuiText>
                    <Autocomplete
                      options={stateData || []}
                      value={selectedState}
                      getOptionLabel={(option: any) => option.stateName}
                      onChange={(event, value) =>
                        handleAutocomplete(event, value, "state")
                      }
                      renderInput={(params) => (
                        <MuiInputField
                          {...params}
                          error={errors.includes("state")}
                          helperText={
                            errors.includes("state") && "Please select a state"
                          }
                          size="small"
                        />
                      )}
                    />
                  </FormControl>
                </Grid2>

                <Grid2 size={3}>
                  <FormControl fullWidth>
                    <MuiText variant="h6" mt={1} className="admin-label-title">
                      {" "}
                      City Name <span className="mandatory-sign">*</span>
                    </MuiText>
                    <Autocomplete
                      options={cityData || []}
                      value={selectedCity}
                      getOptionLabel={(option: any) => option.cityName}
                      onChange={(event, value) =>
                        handleAutocomplete(event, value, "city")
                      }
                      renderInput={(params) => (
                        <MuiInputField
                          {...params}
                          error={errors.includes("city")}
                          helperText={
                            errors.includes("city") && "Please select a city"
                          }
                          size="small"
                        />
                      )}
                    />
                  </FormControl>
                </Grid2>

                <Grid2 size={3}>
                  <FormControl fullWidth>
                    <MuiText variant="h6" mt={1} className="admin-label-title">
                      {" "}
                      Manufacture Type <span className="mandatory-sign">*</span>
                    </MuiText>
                    <Autocomplete
                      options={manufacturerType || []}
                      value={selectedManufacturerType}
                      getOptionLabel={(option: any) => option.description}
                      onChange={(event: any, value) =>
                        handleManufacturertype(event, value, "miscTypeId")
                      }
                      renderInput={(params) => (
                        <MuiInputField
                          {...params}
                          error={errors.includes("manufactureType")}
                          helperText={
                            errors.includes("manufactureType") &&
                            "Please select a manufacture type"
                          }
                          size="small"
                        />
                      )}
                    />
                  </FormControl>
                </Grid2>
              </Grid2>

              <Grid2 container spacing={2}>
                <Grid2 size={3}>
                  <FormControl fullWidth>
                    <MuiText variant="h6" mt={1} className="admin-label-title">
                      Email <span className="mandatory-sign">*</span>
                    </MuiText>
                    <MuiInputField
                      fullWidth
                      variant="outlined"
                      size="small"
                      type="text"
                      name="email"
                      autoComplete="off"
                      value={manufacturerInput.email}
                      onChange={handleChange}
                      error={errors.includes("email")}
                      helperText={
                        errors.includes("email") && "please enter valid email "
                      }
                    />
                  </FormControl>
                </Grid2>
                <Grid2 size={3}>
                  <FormControl fullWidth>
                    <MuiText variant="h6" mt={1} className="admin-label-title">
                      Address 1 <span className="mandatory-sign">*</span>
                    </MuiText>
                    <MuiInputField
                      fullWidth
                      variant="outlined"
                      size="small"
                      type="text"
                      autoComplete="off"
                      name="addressLine1"
                      onChange={handleChange}
                      value={manufacturerInput.addressLine1}
                      error={errors.includes("addressLine1")}
                      helperText={
                        errors.includes("addressLine1") &&
                        "please enter address line 1 "
                      }
                    />
                  </FormControl>
                </Grid2>
                <Grid2 size={3}>
                  <FormControl fullWidth>
                    <MuiText variant="h6" mt={1} className="admin-label-title">
                      Address 2 <span className="mandatory-sign">*</span>
                    </MuiText>
                    <MuiInputField
                      fullWidth
                      variant="outlined"
                      size="small"
                      type="text"
                      autoComplete="off"
                      name="addressLine2"
                      value={manufacturerInput.addressLine2}
                      onChange={handleChange}
                      error={errors.includes("addressLine2")}
                      helperText={
                        errors.includes("addressLine2") &&
                        "please enter address line 2 "
                      }
                    />
                  </FormControl>
                </Grid2>
                <Grid2 size={3}>
                  <FormControl fullWidth>
                    <MuiText variant="h6" mt={1} className="admin-label-title">
                      Pincode <span className="mandatory-sign">*</span>
                    </MuiText>
                    <MuiInputField
                      fullWidth
                      variant="outlined"
                      size="small"
                      type="text"
                      autoComplete="off"
                      value={
                        manufacturerInput.pinCode !== undefined
                          ? manufacturerInput.pinCode.toString().slice(0, 6)
                          : ""
                      }
                      name="pinCode"
                      error={errors.includes("pinCode")}
                      helperText={
                        errors.includes("pinCode") &&
                        "please enter valid  pincode"
                      }
                      onChange={handleChange}
                    />
                  </FormControl>
                </Grid2>
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
          >
            <MuiSwitch
              onChange={handleSwitch}
              checked={manufacturerInput.isActive === 1}
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
            <MuiButton
              variant="contained"
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
}
