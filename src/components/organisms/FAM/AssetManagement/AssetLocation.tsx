import { Autocomplete, Grid2 } from "@mui/material";
import { MuiInputField, MuiText } from "bsoft-base-elements";
import React from "react";
import { useRecoilValue } from "recoil";
import { UserData } from "../../../../utils/atoms";
import { LocationState } from "./AddAssetPage";

interface AssetLocationPropTypes {
  locationState: LocationState;
  handleLocationAutoComplete: (newValue: any, name: string) => void;
  errors: string[];
  loadingStates?: any;
}

function AssetLocation(props: AssetLocationPropTypes) {
  const { locationState, handleLocationAutoComplete, errors, loadingStates } = props;
  const userValue = useRecoilValue(UserData);


  return (
    <Grid2 container spacing={2}>
      <Grid2 size={{ xs: 12, sm: 12, md: 8 }}>
        <Grid2 container spacing={2}>
          <Grid2 size={{ xs: 12, sm: 6, md: 4 }}>
            <MuiText variant="h6" my={1} pt={1} className="admin-label-title">
              Unit Name <span className="mandatory-sign">*</span>
            </MuiText>
            <MuiInputField fullWidth value={userValue.unitName} size="small" />
          </Grid2>
          <Grid2 size={{ xs: 12, sm: 6, md: 4 }}>
            <MuiText variant="h6" my={1} pt={1} className="admin-label-title">
              Department Name <span className="mandatory-sign">*</span>
            </MuiText>
            <Autocomplete
              disablePortal
              options={locationState.departmentData || []}
              fullWidth
              value={locationState.selectedDepartment}
              onChange={(event, newValue) => {
                handleLocationAutoComplete(newValue, "dept");
              }}
              getOptionLabel={(option: any) => option.deptName || ""}
              isOptionEqualToValue={(option: any, value: any) =>
                option.id === value.id
              }
              renderInput={(params) => (
                <MuiInputField
                  {...params}
                  size="small"
                  error={errors.includes("selectedDepartment")}
                  helperText={
                    errors.includes("selectedDepartment") &&
                    "please select department"
                  }
                />
              )}
            />
          </Grid2>
          <Grid2 size={{ xs: 12, sm: 6, md: 4 }}>
            <MuiText variant="h6" my={1} pt={1} className="admin-label-title">
              Location Name <span className="mandatory-sign">*</span>
            </MuiText>
            <Autocomplete
              disablePortal
              options={locationState.locationData || []}
              fullWidth
              value={locationState.selectedLocation}
              onChange={(event, newValue) => {
                handleLocationAutoComplete(newValue, "location");
              }}
              getOptionLabel={(option: any) => option.locationName || ""}
              isOptionEqualToValue={(option: any, value: any) =>
                option.id === value.id
              }
              renderInput={(params) => (
                <MuiInputField
                  {...params}
                  size="small"
                  error={errors.includes("selectedLocation")}
                  helperText={
                    errors.includes("selectedLocation") &&
                    "please select location"
                  }
                />
              )}
            />
          </Grid2>
        </Grid2>
        <Grid2 container spacing={2} mt={1}>
          <Grid2 size={{ xs: 12, sm: 6, md: 4 }}>
            <MuiText
              variant="h6"
              mb={"2px"}
              pt={1}
              className="admin-label-title"
            >
              Sub Location Name <span className="mandatory-sign">*</span>
            </MuiText>
            <Autocomplete
              disablePortal
              options={locationState.subLocationData || []}
              fullWidth
              value={locationState.selectedSubLocation}
              onChange={(event, newValue) => {
                handleLocationAutoComplete(newValue, "subLocation");
              }}
              getOptionLabel={(option: any) => option.subLocationName || ""}
              isOptionEqualToValue={(option: any, value: any) =>
                option.id === value.id
              }
              renderInput={(params) => (
                <MuiInputField
                  {...params}
                  size="small"
                  error={errors.includes("selectedSubLocation")}
                  helperText={
                    errors.includes("selectedSubLocation") &&
                    "please select sub location"
                  }
                />
              )}
            />
          </Grid2>
          <Grid2 size={{ xs: 12, sm: 6, md: 4 }}>
            <MuiText
              variant="h6"
              mb={"2px"}
              pt={1}
              className="admin-label-title"
            >
              Custodian Name <span className="mandatory-sign">*</span>
            </MuiText>
            <Autocomplete
              disablePortal
              options={locationState.custodianData || []}
              fullWidth
              value={locationState.selectedCustodian}
              onChange={(event, newValue) => {
                handleLocationAutoComplete(newValue, "custodian");
              }}
              getOptionLabel={(option: any) =>
                `${option.custodianName} - ${option.custodianId}` || ""
              }
              isOptionEqualToValue={(option: any, value: any) =>
                option.id === value.id
              }
              renderInput={(params) => (
                <MuiInputField
                  {...params}
                  size="small"
                  error={errors.includes("selectedCustodian")}
                  helperText={
                    errors.includes("selectedCustodian") &&
                    "please select custodian"
                  }
                />
              )}
            />
          </Grid2>
          <Grid2 size={{ xs: 12, sm: 6, md: 4 }}>
            <MuiText
              variant="h6"
              mb={"2px"}
              pt={1}
              className="admin-label-title"
            >
              User Name
            </MuiText>
            <Autocomplete
              disablePortal
              options={locationState.custodianData || []}
              fullWidth
              value={locationState.selectedUser}
              onChange={(event, newValue) => {
                handleLocationAutoComplete(newValue, "user");
              }}
              getOptionLabel={(option: any) =>
                `${option.custodianName} - ${option.custodianId}` || ""
              }
              isOptionEqualToValue={(option: any, value: any) =>
                option.id === value.id
              }
              renderInput={(params) => (
                <MuiInputField {...params} size="small" />
              )}
            />
          </Grid2>
        </Grid2>
      </Grid2>
      <Grid2 size={{ xs: 12, sm: 12, md: 4 }}></Grid2>
    </Grid2>
  );
}

export default AssetLocation;
