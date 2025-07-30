import * as React from "react";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import Slide from "@mui/material/Slide";
import { TransitionProps } from "@mui/material/transitions";
import { Autocomplete, Box, FormGroup, Grid2 } from "@mui/material";
import { IoClose } from "react-icons/io5";
import {
  MuiButton,
  MuiInputField,
  MuiSwitch,
  MuiText,
} from "bsoft-base-elements";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { AssetInsuranceInputTypes } from "./AssetDetailInsurance";
import { DateFormatter } from "../../../../utils/lib";

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

interface AddInsurancePropTypes {
  open: boolean;
  close: () => void;
  inputs: AssetInsuranceInputTypes;
  handleSubmit: () => void;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleDate: (value: dayjs.Dayjs | null, type: string) => void;
  errors: string[];
  renewalData: any[];
  handleAutocomplete: (value: any, field: string) => void;
  handleSwitch: (e: React.ChangeEvent<HTMLInputElement>) => void;
  editFlag: boolean;
}

export default function AddInsurancePop(props: AddInsurancePropTypes) {
  const {
    open,
    close,
    inputs,
    handleSubmit,
    handleChange,
    handleDate,
    errors,
    renewalData,
    handleAutocomplete,
    handleSwitch,
    editFlag,
  } = props;

  return (
    <React.Fragment>
      <Dialog
        open={open}
        TransitionComponent={Transition}
        keepMounted
        aria-describedby="alert-dialog-slide-description"
        sx={{
          "& .MuiPaper-root": {
            width: "55vw",
            maxWidth: "none",
            borderRadius: "8px",
          },
        }}
      >
        <Box className="asset-popup-header-wrapper">
          <h2 className="dialog-header">
            {editFlag ? "Edit  Insurance" : "Add Insurance"}
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
            <Grid2 size={4} my={1}>
              <MuiText variant="h6" className="asset-label-title">
                Policy No. <span className="mandatory-sign">*</span>
              </MuiText>
              <MuiInputField
                fullWidth
                // type="number"
                variant="outlined"
                size="small"
                value={inputs.policyNo}
                onChange={handleChange}
                name="policyNo"
                // onInput={(e: React.FormEvent<HTMLInputElement>) => {
                //   const value = parseInt((e.target as HTMLInputElement).value);
                //   if (isNaN(value) || value < 0) {
                //     (e.target as HTMLInputElement).value = Math.min(
                //       Math.max(value, 0)
                //     ).toString();
                //   }
                // }}
                error={errors.includes("policyNo")}
                helperText={
                  errors.includes("policyNo") && "please enter policy number"
                }
              />
            </Grid2>
            <Grid2 size={4} my={1}>
              <MuiText variant="h6" className="asset-label-title">
                Insurance Period (Months){" "}
                <span className="mandatory-sign">*</span>
              </MuiText>
              <MuiInputField
                fullWidth
                type="number"
                variant="outlined"
                size="small"
                value={inputs.period}
                name="period"
                onChange={handleChange}
                onInput={(e: React.FormEvent<HTMLInputElement>) => {
                  const value = parseInt((e.target as HTMLInputElement).value);
                  if (isNaN(value) || value < 0) {
                    (e.target as HTMLInputElement).value = Math.min(
                      Math.max(value, 0)
                    ).toString();
                  }
                }}
                error={errors.includes("period")}
                helperText={
                  errors.includes("period") && "please enter insurance periods"
                }
              />
            </Grid2>
            <Grid2 size={4} my={1}>
              <MuiText variant="h6" className="asset-label-title">
                Insurance From Date <span className="mandatory-sign">*</span>
              </MuiText>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      size: "small",
                      placeholder: "",
                      error: errors.includes("fromDate"),
                      helperText:
                        errors.includes("fromDate") &&
                        "please select start date",
                      inputProps: {
                        placeholder: "",
                        value: inputs.fromDate
                          ? DateFormatter(inputs.fromDate)
                          : "",
                        readOnly: true, // Prevents user from typing manually, only allows picker
                      },
                    },
                  }}
                  maxDate={dayjs(new Date())}
                  value={inputs.fromDate ? dayjs(inputs.fromDate) : null}
                  onChange={(value) => handleDate(value, "from")}
                />
              </LocalizationProvider>
            </Grid2>
          </Grid2>
          <Grid2 container spacing={2}>
            <Grid2 size={4} my={1}>
              <MuiText variant="h6" className="asset-label-title">
                Insurance To Date <span className="mandatory-sign">*</span>
              </MuiText>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      size: "small",
                      placeholder: "",
                      error: errors.includes("toDate"),
                      helperText:
                        errors.includes("toDate") && "please select end date",
                    },
                  }}
                  format={DateFormatter(inputs.toDate)}
                  disabled={true}
                  minDate={dayjs(new Date())}
                  value={inputs.toDate ? dayjs(inputs.toDate) : null}
                  onChange={(value) => handleDate(value, "to")}
                />
              </LocalizationProvider>
            </Grid2>
            <Grid2 size={4} my={1}>
              <MuiText variant="h6" className="asset-label-title">
                Policy Amount <span className="mandatory-sign">*</span>
              </MuiText>
              <MuiInputField
                fullWidth
                type="number"
                variant="outlined"
                size="small"
                value={inputs.amount}
                name="amount"
                onChange={handleChange}
                onInput={(e: React.FormEvent<HTMLInputElement>) => {
                  const value = parseInt((e.target as HTMLInputElement).value);
                  if (isNaN(value) || value < 0) {
                    (e.target as HTMLInputElement).value = Math.min(
                      Math.max(value, 0)
                    ).toString();
                  }
                }}
                error={errors.includes("amount")}
                helperText={
                  errors.includes("amount") && "please enter policy amount"
                }
              />
            </Grid2>
            <Grid2 size={4} my={1}>
              <MuiText variant="h6" className="asset-label-title">
                Vendor Code <span className="mandatory-sign">*</span>
              </MuiText>
              <MuiInputField
                fullWidth
                type="text"
                variant="outlined"
                size="small"
                onChange={handleChange}
                name="vendor"
                value={inputs.vendor}
                error={errors.includes("vendor")}
                helperText={
                  errors.includes("vendor") && "please enter vendor code"
                }
              />
            </Grid2>
          </Grid2>
          <Grid2 container spacing={2}>
            <Grid2 size={4} my={1}>
              <MuiText variant="h6" className="asset-label-title">
                Next Renewal Due Date
              </MuiText>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      size: "small",
                      placeholder: "",
                    },
                  }}
                  format={DateFormatter(inputs.renewalDate)}
                  disabled={true}
                  minDate={dayjs(new Date())}
                  value={inputs.renewalDate ? dayjs(inputs.renewalDate) : null}
                  onChange={(value) => handleDate(value, "renewable")}
                />
              </LocalizationProvider>
            </Grid2>
            <Grid2 size={4} my={1}>
              <MuiText variant="h6" className="asset-label-title">
                Renewal Status Code <span className="mandatory-sign">*</span>
              </MuiText>
              {/* <Autocomplete
                options={renewalData || []}
                fullWidth
                value={inputs.renewalStatus || null}
                onChange={(_, value) => handleAutocomplete(value)}
                getOptionLabel={(option: any) => option.code || ""}
                isOptionEqualToValue={(option: any, value: any) =>
                  option?.id === value?.id
                }
                renderInput={(params) => (
                  <MuiInputField
                    {...params}
                    size="small"
                    name="renewalStatus"
                    value={inputs.renewalStatus}
                    error={errors.includes("renewalStatus")}
                    onChange={handleChange}
                    helperText={
                      errors.includes("renewalStatus") &&
                      "please select renewal status"
                    }
                  />
                )}
              /> */}

              <Autocomplete
                options={renewalData || []}
                fullWidth
                value={inputs.renewalStatus || null}
                onChange={(_, value) =>
                  handleAutocomplete(value, "renewalStatus")
                }
                getOptionLabel={(option: any) => option.code || ""}
                isOptionEqualToValue={(option: any, value: any) =>
                  option?.id === value?.id
                }
                renderInput={(params) => (
                  <MuiInputField
                    {...params}
                    size="small"
                    error={errors?.includes("renewalStatus")}
                    helperText={
                      errors?.includes("renewalStatus") &&
                      "please select renewal status"
                    }
                  />
                )}
              />
            </Grid2>
            <Grid2 size={4} my={1}>
              <MuiText variant="h6" className="asset-label-title">
                Last Renewed Date <span className="mandatory-sign">*</span>
              </MuiText>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      size: "small",
                      placeholder: "",
                      error: errors.includes("renewedDate"),
                      helperText:
                        errors.includes("renewedDate") &&
                        "please select renewed date",
                      inputProps: {
                        placeholder: "",
                        value: inputs.renewedDate
                          ? DateFormatter(inputs.renewedDate)
                          : "",
                        readOnly: true, // Prevents user from typing manually, only allows picker
                      },
                    },
                  }}
                  // minDate={
                  //   inputs.toDate
                  //     ? dayjs(inputs.toDate).subtract(30, "days")
                  //     : undefined
                  // }

                  maxDate={dayjs(inputs.fromDate)}
                  value={inputs.renewedDate ? dayjs(inputs.renewedDate) : null}
                  onChange={(value) => handleDate(value, "renewedDate")}
                />
              </LocalizationProvider>
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
              checked={inputs.isActive === 1}
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
              className="asset-add-button"
              variant="outlined"
              onClick={close}
              sx={{ textTransform: "capitalize", mb: "0px !important" }}
            >
              Cancel
            </MuiButton>
            <MuiButton
              variant="contained"
              sx={{
                textTransform: "capitalize",
                background: "#3a8484!important",
              }}
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
