import React from "react";
import {
  Box,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Grid2,
} from "@mui/material";
import { MuiInputField, MuiText } from "bsoft-base-elements";
import {
  CustomSwitch,
  DateFormatter,
  StyledAutocomplete,
} from "../../../../utils/lib";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import { MainSchedulePropTypes } from "../../../../maintanenceTypes";

function MainScheduler({
  formData,
  errors,
  handleChange,
  validate,
  frequencyTypeData,
  periodTypeData,
  sheduleId,
}: MainSchedulePropTypes) {
  return (
    <Box
      sx={{
        p: 3,
        backgroundColor: "#f9f9f9",
        borderRadius: "12px",
        boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
        margin: "0 auto",
        pt: 1,
      }}
    >
      <FormControlLabel
        control={<CustomSwitch defaultChecked />}
        label={"Days"}
      />
      <Grid2 container spacing={2}>
        <Grid2 size={{ xs: 12, md: 4 }}>
          <MuiText variant="h6" my={1} className="admin-label-title">
            Frequency Type
          </MuiText>
          <StyledAutocomplete
            options={frequencyTypeData || []}
            getOptionLabel={(option: any) =>
              `${option.code}` || ""
            }
            fullWidth
            value={formData.frequencyType || null}
            onChange={(_, value) => handleChange("frequencyType", value ?? "")}
            size="small"
            sx={{ bgcolor: "#fff" }}
            renderInput={(params) => (
              <MuiInputField
                {...params}
                placeholder="Item"
                error={errors.frequencyType}
              />
            )}
          />
        </Grid2>

        <Grid2 size={{ xs: 12, md: 4 }}>
          <MuiText variant="h6" my={1} className="admin-label-title">
            Frequency Code
          </MuiText>
          <MuiInputField
            type="number"
            size="small"
            sx={{ bgcolor: "#fff" }}
            fullWidth
            InputProps={{ inputProps: { min: 0 } }}
            placeholder="Period"
            value={formData.period}
            onChange={(e) => handleChange("period", e.target.value)}
            error={errors.period}
          />
        </Grid2>

        <Grid2 size={{ xs: 12, md: 4 }}>
          <MuiText variant="h6" my={1} className="admin-label-title">
            Period Type
          </MuiText>
          <StyledAutocomplete
            options={periodTypeData || []}
            getOptionLabel={(option: any) =>
              `${option.code}` || ""
            }
            value={formData.periodType || null}
            onChange={(_, value) => handleChange("periodType", value ?? "")}
            fullWidth
            size="small"
            renderInput={(params) => (
              <MuiInputField
                {...params}
                placeholder="Item"
                sx={{ bgcolor: "#fff" }}
                error={errors.periodType}
              />
            )}
          />
        </Grid2>
      </Grid2>

      <Grid2 container spacing={2} mt={1}>
        <Grid2 size={{ xs: 12, md: 4 }}>
          <MuiText variant="h6" my={1} className="admin-label-title">
            Grace Days
          </MuiText>
          <MuiInputField
            type="number"
            size="small"
            sx={{ bgcolor: "#fff" }}
            InputProps={{ inputProps: { min: 0 } }}
            fullWidth
            placeholder="Grace Days"
            value={formData.graceDays}
            onChange={(e) => handleChange("graceDays", e.target.value)}
          />
        </Grid2>

        <Grid2 size={{ xs: 12, md: 4 }}>
          <MuiText variant="h6" my={1} className="admin-label-title">
            Reminder WorkOrder Days
          </MuiText>
          <MuiInputField
            size="small"
            sx={{ bgcolor: "#fff" }}
            fullWidth
            placeholder="Work Order"
            value={formData.workOrder}
            onChange={(e) => handleChange("workOrder", e.target.value)}
          />
        </Grid2>

        <Grid2 size={{ xs: 12, md: 4 }}>
          <MuiText variant="h6" my={1} className="admin-label-title">
            Material Request Days
          </MuiText>
          <MuiInputField
            size="small"
            sx={{ bgcolor: "#fff" }}
            fullWidth
            placeholder="Material Request"
            value={formData.materialRequest}
            onChange={(e) => handleChange("materialRequest", e.target.value)}
          />
        </Grid2>
      </Grid2>

      <Grid2 container spacing={2} mt={1}>
        <Grid2 size={{ xs: 12, md: 4 }}>
          <MuiText variant="h6" my={1} className="admin-label-title">
            Effective Date
          </MuiText>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              value={formData.effectiveDate}
              onChange={(newValue) =>
                handleChange("effectiveDate", newValue ?? null)
              }
              slotProps={{
                textField: {
                  fullWidth: true,
                  size: "small",
                  placeholder: "",
                  inputProps: {
                    placeholder: "",
                    value: formData.effectiveDate
                      ? DateFormatter(formData.effectiveDate)
                      : "",
                    readOnly: true,
                  },
                  sx: { bgcolor: "#fff" },
                  error: errors.effectiveDate,
                },
              }}
              minDate={dayjs(new Date())}
              disabled={sheduleId !== '' ? true : false}
            />
          </LocalizationProvider>
        </Grid2>

        <Grid2 size={{ xs: 12, md: 4 }}>
          <FormGroup sx={{ pt: { xs: 0, sm: 0, md: 4 } }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.isDowntimeRequired}
                  onChange={(e) =>
                    handleChange("isDowntimeRequired", e.target.checked)
                  }
                />
              }
              label="Is Downtime Required?"
            />
          </FormGroup>
        </Grid2>

        {formData.isDowntimeRequired && (
          <Grid2 size={{ xs: 12, md: 4 }}>
            <MuiText variant="h6" my={1} className="admin-label-title">
              Downtime Estimate Hrs
            </MuiText>
            <MuiInputField
              type="number"
              size="small"
              sx={{ bgcolor: "#fff" }}
              fullWidth
              placeholder="Downtime Estimate Hrs"
              value={formData.downtimeEstimate}
              onChange={(e) => handleChange("downtimeEstimate", e.target.value)}
            />
          </Grid2>
        )}
      </Grid2>
    </Box>
  );
}

export default MainScheduler;
