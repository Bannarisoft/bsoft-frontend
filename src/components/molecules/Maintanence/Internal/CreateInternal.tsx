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
import { CreateInternalProps } from "../../../../maintanenceTypes";

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});
const CreateInternalRequest = ({
  open,
  close,
  handleDepartmentChange,
  selectedDepartment,
  departmentData,
  handleMaintenanceTypeChange,
  selectedMaintenanceType,
  maintenanceTypeData,
  handleMachineChange,
  selectedmachine,
  machineData,
  internalInput,
  error,
  handleChange,
  handleSwitch,
  handleSubmit,
}: CreateInternalProps) => {
  return (
    <React.Fragment>
      <Dialog
        open={open}
        TransitionComponent={Transition}
        keepMounted
        aria-describedby="alert-dialog-slide-description"
        sx={{
          "& .MuiPaper-root": {
            width: "1000px",
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
            <Grid2 size={{ xs: 12, sm: 6, md: 6, lg: 4 }}>
              <MuiText
                variant="h6"
                my={{ xs: 0.5, sm: 1, md: 1, lg: 1 }}
                className="admin-label-title"
              >
                Maintenance Category <span className="mandatory-sign">*</span>
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
                    value={internalInput.maintenanceTypeId}
                    error={error.includes("maintenanceTypeId")}
                    helperText={
                      error.includes("maintenanceTypeId") &&
                      "please select a maintenanceTypeId"
                    }
                  />
                )}
              />
            </Grid2>
            <Grid2 size={{ xs: 12, sm: 6, md: 6, lg: 4 }}>
              <MuiText
                variant="h6"
                my={{ xs: 0.5, sm: 1, md: 1, lg: 1 }}
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
                getOptionLabel={(option: any) =>
                  `${option.machineCode} - ${option.machineName}`
                }
                renderOption={(props, option) => (
                  <li {...props} key={option?.id}>
                    {`${option.machineCode} - ${option.machineName}`}
                  </li>
                )}
                renderInput={(params) => (
                  <MuiInputField
                    {...params}
                    name="machineId"
                    value={internalInput.machineId}
                    error={error.includes("machineId")}
                    helperText={
                      error.includes("machineId") && "please select a machineId"
                    }
                  />
                )}
              />
            </Grid2>
            <Grid2 size={{ xs: 12, sm: 12, md: 12, lg: 4 }}>
              <MuiText
                variant="h6"
                my={{ xs: 0.5, sm: 1, md: 1, lg: 1 }}
                className="admin-label-title"
              >
                Maintenance Department Name <span className="mandatory-sign">*</span>
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
                    value={internalInput.departmentId}
                    error={error.includes("departmentId")}
                    helperText={
                      error.includes("departmentId") &&
                      "please select a departmentId"
                    }
                  />
                )}
              />
            </Grid2>
          </Grid2>

          <Grid2 container size={12} spacing={2}>
            <Grid2 size={12}>
              <MuiText
                variant="h6"
                my={{ xs: 0.5, sm: 1, md: 1, lg: 1 }}
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
                value={(internalInput.remarks ?? "").toString().slice(0, 250)}
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

export default CreateInternalRequest;
