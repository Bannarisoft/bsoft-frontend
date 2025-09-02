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
import { AssetAMCInputTypes } from "./AssetDetailAmc";
import { DateFormatter, isSubmitting } from "../../../../utils/lib";

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
  inputs: AssetAMCInputTypes;
  handleSubmit: () => void;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleDate: (value: dayjs.Dayjs | null, type: string) => void;
  errors: string[];
  handleAutocomplete: (value: any, field: string) => void;
  coverageData?: any[];
  renewalData?: any[];
  handleSwitch?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  editFlag?: boolean;
}

export default function AddAMCPop(props: AddInsurancePropTypes) {
  const {
    open,
    close,
    inputs,
    handleSubmit,
    handleChange,
    handleDate,
    errors,
    handleAutocomplete,
    coverageData,
    renewalData,
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
            {editFlag ? "Edit  AMC" : "Add AMC"}
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
                AMC Period (Months) <span className="mandatory-sign">*</span>
              </MuiText>
              <MuiInputField
                fullWidth
                type="number"
                variant="outlined"
                size="small"
                value={inputs.amcPeriod}
                onChange={handleChange}
                name="amcPeriod"
                onInput={(e: React.FormEvent<HTMLInputElement>) => {
                  const value = parseInt((e.target as HTMLInputElement).value);
                  if (isNaN(value) || value < 0) {
                    (e.target as HTMLInputElement).value = Math.min(
                      Math.max(value, 0)
                    ).toString();
                  }
                }}
                error={errors.includes("amcPeriod")}
                helperText={
                  errors.includes("amcPeriod") && "please enter AMC period"
                }
              />
            </Grid2>
            <Grid2 size={4} my={1}>
              <MuiText variant="h6" className="asset-label-title">
                Start Date <span className="mandatory-sign">*</span>
              </MuiText>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      size: "small",
                      placeholder: "",
                      error: errors.includes("startDate"),
                      helperText:
                        errors.includes("startDate") &&
                        "please select start date",
                      inputProps: {
                        placeholder: "",
                        value: inputs.startDate
                          ? DateFormatter(inputs.startDate)
                          : "",
                        readOnly: true,
                      },
                    },
                  }}
                  format="DD-MM-YYYY"
                  maxDate={dayjs(new Date())}
                  value={inputs.startDate ? dayjs(inputs.startDate) : null}
                  onChange={(value) => handleDate(value, "start")}
                />
              </LocalizationProvider>
            </Grid2>
            <Grid2 size={4} my={1}>
              <MuiText variant="h6" className="asset-label-title">
                End Date <span className="mandatory-sign">*</span>
              </MuiText>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      size: "small",
                      placeholder: "",
                      error: errors.includes("endDate"),
                      helperText:
                        errors.includes("endDate") && "please select end date",
                      inputProps: {
                        placeholder: "",
                        value: inputs.endDate
                          ? DateFormatter(inputs.endDate)
                          : "",
                        readOnly: true,
                      },
                    },
                  }}
                  format="DD-MM-YYYY"
                  disabled={true}
                  minDate={dayjs(new Date())}
                  value={inputs.endDate ? dayjs(inputs.endDate) : null}
                  onChange={(value) => handleDate(value, "end")}
                />
              </LocalizationProvider>
            </Grid2>
          </Grid2>
          <Grid2 container spacing={2}>
            <Grid2 size={4} my={1}>
              <MuiText variant="h6" className="asset-label-title">
                Coverage Scope Code <span className="mandatory-sign">*</span>
              </MuiText>
              <Autocomplete
                options={coverageData || []}
                fullWidth
                value={inputs.coverageScope}
                onChange={(event, value) =>
                  handleAutocomplete(value as string, "coverageScope")
                }
                getOptionLabel={(option: any) => option.code || ""}
                isOptionEqualToValue={(option: any, value: any) =>
                  option.id === value.id
                }
                renderInput={(params) => (
                  <MuiInputField
                    {...params}
                    size="small"
                    error={errors?.includes("coverageScope")}
                    helperText={
                      errors?.includes("coverageScope") &&
                      "please enter coverage scope"
                    }
                  />
                )}
              />
            </Grid2>
            <Grid2 size={4} my={1}>
              <MuiText variant="h6" className="asset-label-title">
                Vendor Code <span className="mandatory-sign">*</span>
              </MuiText>
              <MuiInputField
                fullWidth
                // type="number"
                variant="outlined"
                size="small"
                value={inputs.vendorCode}
                name="vendorCode"
                autoComplete="off"
                onChange={handleChange}
                // onInput={(e: React.FormEvent<HTMLInputElement>) => {
                //   const value = parseInt((e.target as HTMLInputElement).value);
                //   if (isNaN(value) || value < 0) {
                //     (e.target as HTMLInputElement).value = Math.min(
                //       Math.max(value, 0)
                //     ).toString();
                //   }
                // }}
              />
            </Grid2>
            <Grid2 size={4} my={1}>
              <MuiText variant="h6" className="asset-label-title">
                Vendor Name <span className="mandatory-sign">*</span>
              </MuiText>
              <MuiInputField
                fullWidth
                type="text"
                variant="outlined"
                size="small"
                onChange={handleChange}
                name="vendorName"
                disabled={inputs.vendorCode === ""}
                value={inputs.vendorName}
                error={errors.includes("vendorName")}
                helperText={
                  errors.includes("vendorName") && "please enter vendor name"
                }
              />
            </Grid2>
          </Grid2>
          <Grid2 container spacing={2}>
            <Grid2 size={4} my={1}>
              <MuiText variant="h6" className="asset-label-title">
                Next Renewal Due Date
                <span className="mandatory-sign">*</span>
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
                  disabled={true}
                  minDate={dayjs(new Date())}
                  value={
                    inputs.renewalDueDate ? dayjs(inputs.renewalDueDate) : null
                  }
                  format="DD-MM-YYYY"
                  onChange={(value) => handleDate(value, "renewalDueDate")}
                />
              </LocalizationProvider>
            </Grid2>
            <Grid2 size={4} my={1}>
              <MuiText variant="h6" className="asset-label-title">
                Renewal Status Code <span className="mandatory-sign">*</span>
              </MuiText>
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
                  format="DD-MM-YYYY"
                  // minDate={
                  //   inputs.endDate
                  //     ? dayjs(inputs.endDate).subtract(30, "days")
                  //     : undefined
                  // }
                  maxDate={dayjs(inputs.startDate)}
                  value={inputs.renewedDate ? dayjs(inputs.renewedDate) : null}
                  onChange={(value) => handleDate(value, "renewed")}
                />
              </LocalizationProvider>
            </Grid2>
          </Grid2>

          <Grid2 container spacing={2}>
            <Grid2 size={4} my={1}>
              <MuiText variant="h6" className="asset-label-title">
                Vendor Email <span className="mandatory-sign">*</span>
              </MuiText>
              <MuiInputField
                fullWidth
                type="text"
                variant="outlined"
                size="small"
                name="email"
                value={inputs.email}
                disabled={inputs.vendorCode === ""}
                onChange={handleChange}
                error={errors.includes("email")}
                helperText={
                  errors.includes("email") && "please enter valid email"
                }
              />
            </Grid2>
            <Grid2 size={4} my={1}>
              <MuiText variant="h6" className="asset-label-title">
                Vendor Phone <span className="mandatory-sign">*</span>
              </MuiText>
              <MuiInputField
                fullWidth
                type="tel"
                variant="outlined"
                size="small"
                onInput={(e) => {
                  const input = e.target as HTMLInputElement;
                  input.value = input.value.replace(/\D/g, "").slice(0, 10);
                }}
                inputProps={{ maxLength: 10 }}
                name="phone"
                disabled={inputs.vendorCode === ""}
                onChange={handleChange}
                value={inputs.phone}
                error={errors.includes("phone")}
                helperText={
                  errors.includes("phone") && "please enter valid phone"
                }
              />
            </Grid2>
            <Grid2 size={4} my={1}>
              <MuiText variant="h6" className="asset-label-title">
                No. of Free Services
                <span className="mandatory-sign">*</span>
              </MuiText>
              <MuiInputField
                fullWidth
                type="text"
                variant="outlined"
                size="small"
                name="freeServices"
                autoComplete="off"
                value={inputs.freeServices}
                onChange={handleChange}
                error={errors.includes("freeServices")}
                helperText={
                  errors.includes("freeServices") &&
                  "please enter number of free services"
                }
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
              checked={inputs.amcStatus === 1}
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
