import React from "react";
import {
  CreateCostCenterProps,
  CreateworkCenterProps,
} from "../../../maintanenceTypes";
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
import InputDatePicker from "../../atoms/Datepicker";
import dayjs from "dayjs";

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});
const CreateCostCenter = ({
  open,
  close,
  handleSubmit,
  handleChange,
  error,
  costCenterInput,
  handleSwitch,
  handleDepartmentChange,
  selectedDepartment,
  departmentData,
  handleResponsiblePersonChange,
  selectedResponsiblePerson,
  responsiblePersonData,
  editFlag,
}: CreateCostCenterProps) => {
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
          <h2 className="dialog-header">
            {`${editFlag ? "Edit" : "Create"}`} Cost Center{" "}
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
            <Grid2 size={4}>
              <MuiText variant="h6" my={1} className="admin-label-title">
                Cost Center Code <span className="mandatory-sign">*</span>
              </MuiText>

              <MuiInputField
                fullWidth
                variant="outlined"
                size="small"
                value={costCenterInput.costCenterCode?.toUpperCase()}
                name="costCenterCode"
                autoComplete="off"
                onChange={handleChange}
                disabled={editFlag}
                error={error.includes("costCenterCode")}
                helperText={
                  error.includes("costCenterCode") && "please enter valid code"
                }
              />
            </Grid2>
            <Grid2 size={4}>
              <MuiText variant="h6" my={1} className="admin-label-title">
                Cost Center Name <span className="mandatory-sign">*</span>
              </MuiText>

              <MuiInputField
                fullWidth
                variant="outlined"
                size="small"
                type="text"
                autoComplete="off"
                value={costCenterInput.costCenterName}
                name="costCenterName"
                onChange={handleChange}
                error={error.includes("costCenterName")}
                helperText={
                  error.includes("costCenterName") &&
                  "please enter valid costCenter name"
                }
              />
            </Grid2>
            <Grid2 size={4}>
              <MuiText variant="h6" my={1} className="admin-label-title">
                Department Name <span className="mandatory-sign">*</span>
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
                    value={costCenterInput.departmentId}
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
          <Grid2 container spacing={2}>
            <Grid2 size={4}>
              <MuiText variant="h6" my={1} className="admin-label-title">
                Effective Date <span className="mandatory-sign">*</span>
              </MuiText>

              <InputDatePicker
                sx={{ width: "100%" }}
                format="DD/MM/YYYY"
                name="effectiveDate"
                value={
                  costCenterInput.effectiveDate
                    ? dayjs(costCenterInput.effectiveDate)
                    : null
                }
                onChange={(date) => {
                  const fakeEvent = {
                    target: {
                      name: "effectiveDate",
                      value: date ? date : null,
                    },
                  } as React.ChangeEvent<HTMLInputElement>;
                  handleChange(fakeEvent);
                }}
                slotProps={{
                  textField: {
                    size: "small",
                    error: error.includes("effectiveDate"),
                    helperText: error.includes("effectiveDate")
                      ? "Please enter a valid effective date"
                      : "",
                  },
                }}
              />
            </Grid2>
            <Grid2 size={4}>
              <MuiText variant="h6" my={1} className="admin-label-title">
                Responsible Person Name <span className="mandatory-sign">*</span>
              </MuiText>

              <Autocomplete
                options={responsiblePersonData || []}
                fullWidth
                size="small"
                value={selectedResponsiblePerson}
                onChange={(event, value) =>
                  handleResponsiblePersonChange(
                    event as React.ChangeEvent<HTMLInputElement>,
                    value,
                    "ResponsiblePerson"
                  )
                }
                getOptionLabel={(option: any) => option?.custodianName || ""}
                isOptionEqualToValue={(option, value) =>
                  option?.custodianId === value?.custodianId
                }
                renderOption={(props, option) => (
                  <li {...props} key={option?.custodianId}>
                    {option?.custodianName}
                  </li>
                )}
                renderInput={(params) => (
                  <MuiInputField
                    {...params}
                    name="ResponsiblePerson"
                    error={error.includes("responsiblePerson")}
                    helperText={
                      error.includes("responsiblePerson") &&
                      "Please select a responsible person"
                    }
                  />
                )}
              />
            </Grid2>
            <Grid2 size={4}>
              <MuiText variant="h6" my={1} className="admin-label-title">
                Budget Allocation
              </MuiText>

              <MuiInputField
                fullWidth
                type="number"
                size="small"
                InputProps={{ inputProps: { min: 0 } }}
                value={costCenterInput.budgetAllocated}
                name="budgetAllocated"
                onChange={handleChange}
                error={error.includes("budgetallocation")}
                helperText={
                  error.includes("budgetallocation") &&
                  "please enter valid budgetallocation"
                }
              />
            </Grid2>
          </Grid2>
          <Grid2 container size={12} spacing={2}>
            <Grid2 size={12}>
              <MuiText variant="h6" my={1} className="admin-label-title">
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
                  costCenterInput.remarks !== undefined
                    ? costCenterInput.remarks.toString().slice(0, 250)
                    : "remarks"
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
              checked={costCenterInput.isActive === 1}
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
            <MuiButton className="filled-icon-btn" onClick={handleSubmit}>
              Submit
            </MuiButton>
          </Box>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
};

export default CreateCostCenter;
