import React from "react";

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
import { IoClose } from "react-icons/io5";
import {
  MuiButton,
  MuiInputField,
  MuiSwitch,
  MuiText,
} from "bsoft-base-elements";
import { CreateExternalProps } from "../../../../types/maintanenceTypes";

import dayjs from "dayjs";

import InputDatePicker from "../../../atoms/Datepicker";
import { isSubmitting } from "../../../../utils/lib";

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});
const CreateExternalRequest = ({
  open,
  close,
  error,
  handleChange,
  handleSubmit,
  handleServiceTypeChange,
  selectedServiceType,
  serviceTypeData,
  externalInput,
  handleServiceLocation,
  selectedServiceLocation,
  serviceLocationData,
  handleDispatchChange,
  selectedDispatch,
  dispatchData,
  handleSparsTypeChange,
  selectedSpares,
  sparesData,
  maintenanceTypeData,
  handleMaintenanceTypeChange,
  selectedMaintenanceType,
  departmentData,
  handleDepartmentChange,
  selectedDepartment,
  machineData,
  handleMachineChange,
  selectedmachine,
  handleDateChange,
  locationFlag,
}: CreateExternalProps) => {
  return (
    <React.Fragment>
      <Dialog
        open={open}
        TransitionComponent={Transition}
        keepMounted
        aria-describedby="alert-dialog-slide-description"
        sx={{
          "& .MuiPaper-root": {
            width: "1200px",
            borderRadius: "8px",
            maxWidth: "none !important",
          },
        }}
      >
        <Box className="popup-header-wrapper">
          <h2 className="dialog-header">Create Request </h2>
          <IoClose
            fontSize={24}
            onClick={close}
            cursor={"pointer"}
            color="#fff"
          />
        </Box>
        <DialogContent sx={{ p: "4px 24px 12px" }}>
          <Grid2
            container
            spacing={2}
            sx={{
              display: {
                xs: "grid",
                sm: "flex",
                md: "flex",
                lg: "flex",
              },
            }}
          >
            <Grid2 size={{ xs: 12, sm: 6, md: 6, lg: locationFlag ? 4 : 3 }}>
              <MuiText
                variant="h6"
                my={{ xs: 0.5, sm: 1, md: 1.5, lg: 1 }}
                className="admin-label-title"
              >
                Service Type <span className="mandatory-sign">*</span>
              </MuiText>

              <Autocomplete
                options={serviceTypeData || []}
                id="state-autocomplete"
                fullWidth
                size="small"
                value={selectedServiceType}
                onChange={(event, value) =>
                  handleServiceTypeChange(
                    event as React.ChangeEvent<HTMLInputElement>,
                    value,
                    "serviceCode"
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
                    name="serviceTypeId"
                    value={externalInput.serviceTypeId}
                    error={error.includes("serviceTypeId")}
                    helperText={
                      error.includes("serviceTypeId") &&
                      "please select a service type"
                    }
                  />
                )}
              />
            </Grid2>
            <Grid2 size={{ xs: 12, sm: 6, md: 6, lg: locationFlag ? 4 : 3 }}>
              <MuiText
                variant="h6"
                my={{ xs: 0.5, sm: 1, md: 1.5, lg: 1 }}
                className="admin-label-title"
              >
                Service Location Name <span className="mandatory-sign">*</span>
              </MuiText>

              <Autocomplete
                options={serviceLocationData || []}
                id="state-autocomplete"
                fullWidth
                size="small"
                value={selectedServiceLocation}
                onChange={(event, value) =>
                  handleServiceLocation(
                    event as React.ChangeEvent<HTMLInputElement>,
                    value,
                    "serviceLocation"
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
                    name="serviceLocationId"
                    value={externalInput.serviceLocationId}
                    error={error.includes("serviceLocationId")}
                    helperText={
                      error.includes("serviceLocationId") &&
                      "please select a service location"
                    }
                  />
                )}
              />
            </Grid2>
            {!locationFlag && (
              <Grid2 size={{ xs: 12, sm: 6, md: 6, lg: 3 }}>
                <MuiText
                  variant="h6"
                  my={{ xs: 0.5, sm: 1, md: 1.5, lg: 1 }}
                  className="admin-label-title"
                >
                  Dispatch Mode Code
                </MuiText>

                <Autocomplete
                  options={dispatchData || []}
                  id="state-autocomplete"
                  fullWidth
                  size="small"
                  value={selectedDispatch}
                  onChange={(event, value) =>
                    handleDispatchChange(
                      event as React.ChangeEvent<HTMLInputElement>,
                      value,
                      "dispatch"
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
                      name="modeOfDispatchId"
                      value={externalInput.modeOfDispatchId}
                      error={error.includes("modeOfDispatchId")}
                      helperText={
                        error.includes("modeOfDispatchId") &&
                        "please select a mode of dispatch"
                      }
                    />
                  )}
                />
              </Grid2>
            )}
            <Grid2 size={{ xs: 12, sm: 6, md: 6, lg: locationFlag ? 4 : 3 }}>
              <MuiText
                variant="h6"
                my={{ xs: 0.5, sm: 1, md: 1.5, lg: 1 }}
                className="admin-label-title"
              >
                Maintenance Department Name{" "}
                <span className="mandatory-sign">*</span>
              </MuiText>

              <Autocomplete
                options={departmentData || []}
                id="state-autocomplete"
                fullWidth
                size="small"
                value={selectedDepartment}
                onChange={(event, value) =>
                  handleDepartmentChange(
                    event as React.ChangeEvent<HTMLInputElement>,
                    value,
                    "deptName"
                  )
                }
                getOptionLabel={(option: any) => option?.deptName}
                renderOption={(props, option) => (
                  <li {...props} key={option?.id}>
                    {option?.deptName}
                  </li>
                )}
                renderInput={(params) => (
                  <MuiInputField
                    {...params}
                    name="departmentId"
                    value={externalInput.departmentId}
                    error={error.includes("departmentId")}
                    helperText={
                      error.includes("departmentId") &&
                      "please select a department"
                    }
                  />
                )}
              />
            </Grid2>
          </Grid2>

          <Grid2
            container
            spacing={2}
            sx={{
              display: {
                xs: "grid",
                sm: "flex",
                md: "flex",
                lg: "flex",
              },
            }}
          >
            <Grid2 size={{ xs: 12, sm: 6, md: 6, lg: 3 }}>
              <MuiText
                variant="h6"
                my={{ xs: 0.5, sm: 1, md: 1.5, lg: 1 }}
                className="admin-label-title"
              >
                Machine Name <span className="mandatory-sign">*</span>
              </MuiText>

              <Autocomplete
                options={machineData || []}
                id="state-autocomplete"
                fullWidth
                size="small"
                value={selectedmachine}
                onChange={(event, value) =>
                  handleMachineChange(
                    event as React.ChangeEvent<HTMLInputElement>,
                    value,
                    "machineName"
                  )
                }
                getOptionLabel={(option: any) => option?.machineName}
                renderOption={(props, option) => (
                  <li {...props} key={option?.id}>
                    {option?.machineName}
                  </li>
                )}
                renderInput={(params) => (
                  <MuiInputField
                    {...params}
                    name="machineId"
                    value={externalInput.machineId}
                    error={error.includes("machineId")}
                    helperText={
                      error.includes("machineId") && "please select a machine"
                    }
                  />
                )}
              />
            </Grid2>
            <Grid2 size={{ xs: 12, sm: 6, md: 6, lg: 3 }}>
              <MuiText
                variant="h6"
                my={{ xs: 0.5, sm: 1, md: 1.5, lg: 1 }}
                className="admin-label-title"
              >
                Old Vendor <span className="mandatory-sign">*</span>
              </MuiText>

              <MuiInputField
                fullWidth
                type="text"
                variant="outlined"
                size="small"
                autoComplete="off"
                value={externalInput.oldVendorId}
                name="oldVendorId"
                onChange={handleChange}
                error={error.includes("oldVendorId")}
                helperText={
                  error.includes("oldVendorId") &&
                  "please enter valid old vendor code"
                }
              />
            </Grid2>
            <Grid2 size={{ xs: 12, sm: 6, md: 6, lg: 3 }}>
              <MuiText
                variant="h6"
                my={{ xs: 0.5, sm: 1, md: 1.5, lg: 1 }}
                className="admin-label-title"
              >
                Old Vendor Name
              </MuiText>

              <MuiInputField
                fullWidth
                type="text"
                variant="outlined"
                size="small"
                value={externalInput.oldVendorName}
                name="oldVendorName"
              />
            </Grid2>
            <Grid2 size={{ xs: 12, sm: 6, md: 6, lg: 3 }}>
              <MuiText
                variant="h6"
                my={{ xs: 0.5, sm: 1, md: 1.5, lg: 1 }}
                className="admin-label-title"
              >
                Expected Dispatch Date
              </MuiText>
              <InputDatePicker
                views={["year", "month", "day"]}
                format="DD-MM-YYYY"
                slotProps={{
                  textField: {
                    fullWidth: true,
                    size: "small",
                  },
                }}
                value={
                  externalInput.expectedDispatchDate
                    ? dayjs(externalInput.expectedDispatchDate)
                    : null
                }
                onChange={(newValue) =>
                  handleDateChange("expectedDispatchDate", newValue)
                }
                name="expectedDispatchDate"
              />
            </Grid2>
          </Grid2>

          <Grid2
            container
            spacing={2}
            sx={{
              display: {
                xs: "grid",
                sm: "flex",
                md: "flex",
                lg: "flex",
              },
            }}
          >
            <Grid2 size={{ xs: 12, sm: 6, md: 6, lg: 3 }}>
              <MuiText
                variant="h6"
                my={{ xs: 0.5, sm: 1, md: 1.5, lg: 1 }}
                className="admin-label-title"
              >
                Maintenance Type <span className="mandatory-sign">*</span>
              </MuiText>

              <Autocomplete
                options={maintenanceTypeData || []}
                id="state-autocomplete"
                fullWidth
                size="small"
                value={selectedMaintenanceType}
                onChange={(event, value) =>
                  handleMaintenanceTypeChange(
                    event as React.ChangeEvent<HTMLInputElement>,
                    value,
                    "code"
                  )
                }
                getOptionLabel={(option: any) =>
                  `${option.code} - ${option.description}` || ""
                }
                renderOption={(props, option) => (
                  <li {...props} key={option?.id}>
                    {`${option.code} - ${option.description}`}
                  </li>
                )}
                renderInput={(params) => (
                  <MuiInputField
                    {...params}
                    name="maintenanceTypeId"
                    value={externalInput.maintenanceTypeId}
                    error={error.includes("maintenanceTypeId")}
                    helperText={
                      error.includes("maintenanceTypeId") &&
                      "please select a maintenance type"
                    }
                  />
                )}
              />
            </Grid2>
            <Grid2 size={{ xs: 12, sm: 6, md: 6, lg: 3 }}>
              <MuiText
                variant="h6"
                my={{ xs: 0.5, sm: 1, md: 1.5, lg: 1 }}
                className="admin-label-title"
              >
                Spares Type <span className="mandatory-sign">*</span>
              </MuiText>

              <Autocomplete
                options={sparesData || []}
                id="state-autocomplete"
                fullWidth
                size="small"
                value={selectedSpares}
                onChange={(event, value) =>
                  handleSparsTypeChange(
                    event as React.ChangeEvent<HTMLInputElement>,
                    value,
                    "spares"
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
                    name="sparesTypeId"
                    value={externalInput.sparesTypeId}
                    error={error.includes("sparesTypeId")}
                    helperText={
                      error.includes("sparesTypeId") && "please select spare"
                    }
                  />
                )}
              />
            </Grid2>
            <Grid2 size={{ xs: 12, sm: 6, md: 6, lg: 3 }}>
              <MuiText
                variant="h6"
                my={{ xs: 0.5, sm: 1, md: 1.5, lg: 1 }}
                className="admin-label-title"
              >
                Estimated Service Cost
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
                value={externalInput.estimatedServiceCost}
                name="estimatedServiceCost"
                onChange={handleChange}
              />
            </Grid2>

            <Grid2 size={{ xs: 12, sm: 6, md: 6, lg: 3 }}>
              <MuiText
                variant="h6"
                my={{ xs: 0.5, sm: 1, md: 1.5, lg: 1 }}
                className="admin-label-title"
              >
                Estimated Spare Parts Cost
              </MuiText>
              <MuiInputField
                fullWidth
                variant="outlined"
                size="small"
                onChange={handleChange}
                value={externalInput.estimatedSpareCost}
                name="estimatedSpareCost"
              />
            </Grid2>
          </Grid2>

          <Grid2 container size={12} spacing={2}>
            <Grid2 size={12}>
              <MuiText
                variant="h6"
                my={{ xs: 0.5, sm: 1, md: 1.5, lg: 1 }}
                className="admin-label-title"
              >
                Remarks
              </MuiText>

              <MuiInputField
                fullWidth
                variant="outlined"
                size="small"
                multiline
                rows={4}
                name="remarks"
                value={(externalInput.remarks ?? "").toString().slice(0, 250)}
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
            {/* <MuiSwitch
              checked={internalInput.isActive === 1}
              onChange={handleSwitch}
              label="Status"
            /> */}
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

export default CreateExternalRequest;
