import React from "react";
import { CreateFeederPropType } from "../../../../types/maintanenceTypes";
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
import { IoClose } from "react-icons/io5";
import {
  MuiButton,
  MuiInputField,
  MuiSwitch,
  MuiText,
} from "bsoft-base-elements";
import { TransitionProps } from "@mui/material/transitions";
import InputDatePicker from "../../../atoms/Datepicker";
import dayjs from "dayjs";
import { isSubmitting } from "../../../../utils/lib";
const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});
const CreateFeeder = ({
  open,
  close,
  handleSwitch,
  editFlag,
  feederInput,
  handleChange,
  handleSubmit,
  error,
  feederTypeFlag,
  selectedValues,
  handledAutoComplete,
  feederGroupData,
  departmentData,
  parentFeederData,
  feederTypeData,
  meterTypeData,
}: CreateFeederPropType) => {
  return (
    <React.Fragment>
      <Dialog
        open={open}
        TransitionComponent={Transition}
        keepMounted
        aria-describedby="alert-dialog-slide-description"
        sx={{
          "& .MuiPaper-root": {
            width: "65rem",
            borderRadius: "8px",
            maxWidth: "none !important",
          },
        }}
      >
        <Box className="popup-header-wrapper">
          <h2 className="dialog-header">
            {" "}
            {`${editFlag ? "Edit" : "Create"}`} Feeder{" "}
          </h2>
          <IoClose
            fontSize={24}
            onClick={close}
            cursor={"pointer"}
            color="#fff"
          />
        </Box>

        <DialogContent sx={{ p: "8px 24px 12px" }}>
          <Grid2 container spacing={2}>
            <Grid2 size={{ xs: 12, sm: 6, md: 6, lg: 4 }}>
              <MuiText variant="h6" my={1} className="admin-label-title">
                Feeder Code <span className="mandatory-sign">*</span>
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
                disabled={editFlag}
                autoComplete="off"
                value={feederInput.feederCode?.toUpperCase()}
                name="feederCode"
                onChange={handleChange}
                error={error.includes("feederCode")}
                helperText={
                  error.includes("feederCode") && "please enter valid code"
                }
              />
            </Grid2>
            <Grid2 size={{ xs: 12, sm: 6, md: 6, lg: 4 }}>
              <MuiText variant="h6" my={1} className="admin-label-title">
                Feeder Name <span className="mandatory-sign">*</span>
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
                value={feederInput.feederName}
                name="feederName"
                onChange={handleChange}
                error={error.includes("feederName")}
                helperText={
                  error.includes("feederName") && "please enter valid  name"
                }
              />
            </Grid2>
            <Grid2 size={{ xs: 12, sm: 6, md: 6, lg: 4 }}>
              <MuiText variant="h6" my={1} className="admin-label-title">
                Feeder Group Name <span className="mandatory-sign">*</span>
              </MuiText>

              <Autocomplete
                options={feederGroupData || []}
                id="state-autocomplete"
                fullWidth
                size="small"
                value={selectedValues["feederGroupId"]?.[0] || null}
                onChange={(event, newValue: any) =>
                  handledAutoComplete(
                    event,
                    newValue ? newValue : null,
                    "feederGroupId"
                  )
                }
                getOptionLabel={(option: any) => option?.feederGroupName}
                renderOption={(props, option) => (
                  <li {...props} key={option?.id}>
                    {option?.feederGroupName}
                  </li>
                )}
                renderInput={(params) => (
                  <MuiInputField
                    {...params}
                    name="feederGroupId"
                    value={feederInput.feederGroupId}
                    error={error.includes("feederGroupId")}
                    helperText={
                      error.includes("feederGroupId") &&
                      "please select a feeder group"
                    }
                  />
                )}
              />
            </Grid2>
            <Grid2 size={{ xs: 12, sm: 6, md: 6, lg: 4 }}>
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
                disabled={editFlag}
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
            {!feederTypeFlag && (
              <Grid2 size={{ xs: 6, sm: 6, md: 6, lg: 4 }}>
                <MuiText
                  variant="h6"
                  my={{ xs: 0.5, sm: 1, md: 1.5, lg: 1 }}
                  className="admin-label-title"
                >
                  Parent Feeder Name<span className="mandatory-sign"> *</span>
                </MuiText>

                <Autocomplete
                  options={parentFeederData || []}
                  id="state-autocomplete"
                  fullWidth
                  size="small"
                  value={selectedValues["parentFeederId"]?.[0] || null}
                  onChange={(event, value) =>
                    handledAutoComplete(
                      event as React.ChangeEvent<HTMLInputElement>,
                      value,
                      "parentFeederId"
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
                      name="parentFeederId"
                      error={error.includes("parentFeederId")}
                      helperText={
                        error.includes("parentFeederId") &&
                        "please select a parent feeder"
                      }
                    />
                  )}
                />
              </Grid2>
            )}
            <Grid2 size={{ xs: 12, sm: 6, md: 6, lg: 4 }}>
              <MuiText variant="h6" my={1} className="admin-label-title">
                Multiplication Factor
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
                  feederInput.multiplicationFactor === 0
                    ? ""
                    : feederInput.multiplicationFactor
                }
                name="multiplicationFactor"
                onChange={handleChange}
                error={error.includes("multiplicationFactor")}
                helperText={
                  error.includes("multiplicationFactor") &&
                  "please enter valid Multiplication Factor"
                }
              />
            </Grid2>
            <Grid2 size={{ xs: 12, sm: 6, md: 6, lg: 4 }}>
              <MuiText
                variant="h6"
                my={{ xs: 0.5, sm: 1, md: 1.5, lg: 1 }}
                className="admin-label-title"
              >
                Effective Date <span className="mandatory-sign">*</span>
              </MuiText>
              <InputDatePicker
                format="DD-MM-YYYY"
                slotProps={{
                  textField: {
                    size: "small",
                    fullWidth: true,
                    error: error.includes("effectiveDate"),
                    helperText: error.includes("effectiveDate")
                      ? "please select valid effective date"
                      : "",
                  },
                }}
                value={
                  feederInput.effectiveDate
                    ? dayjs(feederInput.effectiveDate)
                    : null
                }
                onChange={(date) => {
                  handleChange({
                    target: {
                      name: "effectiveDate",
                      value: date ? dayjs(date).format("YYYY-MM-DD") : "",
                    },
                  } as React.ChangeEvent<HTMLInputElement>);
                }}
                name="effectiveDate"
              />
            </Grid2>
            <Grid2 size={{ xs: 12, sm: 6, md: 6, lg: 4 }}>
              <MuiText
                variant="h6"
                my={{ xs: 0.5, sm: 1, md: 1.5, lg: 1 }}
                className="admin-label-title"
              >
                Opening Reading
                <span className="mandatory-sign"> *</span>
              </MuiText>

              <MuiInputField
                fullWidth
                variant="outlined"
                type="number"
                size="small"
                InputProps={{ inputProps: { min: 0 } }}
                value={
                  feederInput.openingReading === 0
                    ? ""
                    : feederInput.openingReading
                }
                name="openingReading"
                onChange={handleChange}
                error={error.includes("openingReading")}
                helperText={
                  error.includes("openingReading") &&
                  "please enter valid opening reading"
                }
              />
            </Grid2>
            <Grid2 size={{ xs: 12, sm: 6, md: 6, lg: 4 }}>
              <MuiText
                variant="h6"
                my={{ xs: 0.5, sm: 1, md: 1.5, lg: 1 }}
                className="admin-label-title"
              >
                Target <span className="mandatory-sign">*</span>
              </MuiText>

              <MuiInputField
                fullWidth
                variant="outlined"
                type="number"
                size="small"
                InputProps={{ inputProps: { min: 0 } }}
                value={feederInput.target === 0 ? "" : feederInput.target}
                name="target"
                onChange={handleChange}
                error={error.includes("target")}
                helperText={
                  error.includes("target") && "please enter valid target "
                }
              />
            </Grid2>
            <Grid2 size={{ xs: 12, sm: 6, md: 6, lg: feederTypeFlag ? 4 : 6 }}>
              <MuiText variant="h6" my={1} className="admin-label-title">
                Department Name <span className="mandatory-sign">*</span>
              </MuiText>

              <Autocomplete
                options={departmentData || []}
                id="department-autocomplete"
                fullWidth
                size="small"
                value={selectedValues["departmentId"]?.[0] || null}
                onChange={(event, value) =>
                  handledAutoComplete(
                    event as React.ChangeEvent<HTMLInputElement>,
                    value,
                    "departmentId"
                  )
                }
                getOptionLabel={(option: any) => option?.deptName || ""}
                renderOption={(props, option) => (
                  <li {...props} key={option?.id}>
                    {option?.deptName}
                  </li>
                )}
                renderInput={(params) => (
                  <MuiInputField
                    {...params}
                    name="departmentId"
                    error={error.includes("departmentId")}
                    helperText={
                      error.includes("departmentId") &&
                      "please select a department"
                    }
                  />
                )}
              />
            </Grid2>
            {feederInput.meterAvailable === 1 && (
              <Grid2
                size={{ xs: 12, sm: 6, md: 6, lg: feederTypeFlag ? 4 : 6 }}
              >
                <MuiText variant="h6" my={1} className="admin-label-title">
                  Meter Type
                </MuiText>

                <Autocomplete
                  options={meterTypeData || []}
                  id="meter-type-autocomplete"
                  fullWidth
                  size="small"
                  value={selectedValues["meterTypeId"]?.[0] || null}
                  onChange={(event, newValue: any) =>
                    handledAutoComplete(
                      event,
                      newValue ? newValue : null,
                      "meterTypeId"
                    )
                  }
                  getOptionLabel={(option: any) => option?.code}
                  renderOption={(props, option) => (
                    <li {...props} key={option?.id}>
                      {option?.code}
                    </li>
                  )}
                  renderInput={(params) => (
                    <MuiInputField {...params} name="meterTypeId" />
                  )}
                />
              </Grid2>
            )}
            <Grid2
              size={{ xs: 12, sm: 6, md: 6, lg: feederTypeFlag ? 12 : 12 }}
            >
              <MuiText variant="h6" my={1} className="admin-label-title">
                Description
              </MuiText>

              <MuiInputField
                fullWidth
                variant="outlined"
                size="small"
                type="text"
                InputProps={{
                  inputProps: {
                    maxLength: 250,
                  },
                }}
                rows={3}
                multiline
                value={feederInput.description}
                name="description"
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
            <Box>
              <MuiSwitch
                checked={feederInput.isActive === 1}
                onChange={(e) => handleSwitch(e, "isActive")}
                label="Status"
              />
              <MuiSwitch
                checked={feederInput.highPriority === 1}
                onChange={(e) => handleSwitch(e, "highPriority")}
                label="Priority"
              />
              <MuiSwitch
                checked={feederInput.meterAvailable === 1}
                onChange={(e) => handleSwitch(e, "meterAvailable")}
                label="Meter Available"
              />
            </Box>
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

export default CreateFeeder;
