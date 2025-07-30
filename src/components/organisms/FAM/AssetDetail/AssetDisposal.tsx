import { Autocomplete, Box, Grid2 } from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { MuiButton, MuiInputField, MuiText } from "bsoft-base-elements";
import dayjs from "dayjs";
import React from "react";
import { DateFormatter } from "../../../../utils/lib";

function AssetDisposal({
  disposal,
  handleAutocomplete,
  handleDate,
  handleChange,
  handleSubmit,
}: any) {
  return (
    <Box>
      <Grid2 container spacing={2}>
        <Grid2 size={4} my={1}>
          <MuiText variant="h6" className="asset-label-title">
            Disposal Type <span className="mandatory-sign">*</span>
          </MuiText>
          <Autocomplete
            options={disposal?.disposalData || []}
            fullWidth
            value={disposal?.disposalType}
            onChange={(event, value) => handleAutocomplete(value as string)}
            getOptionLabel={(option: any) => option.code || ""}
            isOptionEqualToValue={(option: any, value: any) =>
              option.id === value.id
            }
            renderInput={(params) => (
              <MuiInputField
                {...params}
                size="small"
                // error={errors?.includes("coverageScope")}
                // helperText={
                //   errors?.includes("coverageScope") &&
                //   "please enter coverage scope"
                // }
              />
            )}
          />
        </Grid2>
        <Grid2 size={4} my={1}>
          <MuiText variant="h6" className="asset-label-title">
            Disposal Date <span className="mandatory-sign">*</span>
          </MuiText>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              slotProps={{
                textField: {
                  fullWidth: true,
                  size: "small",
                  placeholder: "",
                  inputProps: {
                    placeholder: "",
                    value: disposal.disposalDate
                      ? DateFormatter(disposal.disposalDate)
                      : "",
                    readOnly: true, 
                  },
                },
              }}
              maxDate={dayjs(new Date())}
              value={
                disposal.disposalDate ? dayjs(disposal.disposalDate) : null
              }
              onChange={(value) => handleDate(value)}
            />
          </LocalizationProvider>
        </Grid2>
        <Grid2 size={4} my={1}>
          <MuiText variant="h6" className="asset-label-title">
            Disposal Amount <span className="mandatory-sign">*</span>
          </MuiText>
          <MuiInputField
            fullWidth
            type="text"
            variant="outlined"
            size="small"
            name="amount"
            onChange={handleChange}
            value={disposal?.amount}
          />
        </Grid2>
        <Grid2 size={8} my={1}>
          <MuiText variant="h6" className="asset-label-title">
            Disposal Reason <span className="mandatory-sign">*</span>
          </MuiText>
          <MuiInputField
            fullWidth
            type="text"
            variant="outlined"
            size="small"
            name="reason"
            onChange={handleChange}
            value={disposal?.reason}
            multiline
            rows={4}
          />
        </Grid2>
      </Grid2>
      <Box display={"flex"} justifyContent={"end"} alignItems={"center"} my={2}>
        <MuiButton
          variant="contained"
          onClick={handleSubmit}
          sx={{
            background: "#107869 !important",
            px: 4,
            py: 1,
            borderRadius: "8px",
            transition: "all 0.3s ease",
            "&:hover": {
              background: "#0a5b4f !important",
              transform: "translateY(-2px)",
              boxShadow: "0 6px 12px rgba(16, 120, 105, 0.2)",
            },
          }}
          disabled={
            !disposal?.disposalType ||
            !disposal.disposalDate ||
            !disposal.amount ||
            !disposal.reason
          }
        >
          Save
        </MuiButton>
      </Box>
    </Box>
  );
}

export default AssetDisposal;
