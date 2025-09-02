import { Autocomplete, Box, Grid2 } from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { MuiButton, MuiInputField, MuiText } from "bsoft-base-elements";
import dayjs from "dayjs";
import React, { useEffect, useState } from "react";
import {
  Apirequest,
  DateFormatter,
  emailRegex,
  isSubmitting,
  startLoading,
  stopLoading,
} from "../../../../utils/lib";
import FamConfig from "../../../../utils/fam.api.json";
import { WarrantyState } from "./useAssetWarranty";
import Swal from "sweetalert2";
import ErrorModal from "../../../molecules/Master/Role/ErrorModal";
import InputDatePicker from "../../../atoms/Datepicker";
import toast from "react-hot-toast";

interface AssetWarrantyTypes {
  warrantyInputs: WarrantyState;
  handleAutocomplete: (newValue: any, field: string) => void;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleDate: (value: dayjs.Dayjs | null, field?: string) => void;
  errors: string[];
  setErrors: (errors: string[]) => void;
  pathname: string;
  warrantyId: number;
  onUpdated?: any;
  isWarrantyCreated: boolean;
}

function AssetWaranty(props: AssetWarrantyTypes) {
  const {
    warrantyInputs,
    handleAutocomplete,
    handleChange,
    handleDate,
    errors,
    setErrors,
    pathname,
    warrantyId,
    onUpdated,
    isWarrantyCreated,
  } = props;

  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [errorMessages, setErrorMessages] = useState<string[]>([]);

  const warrantyBody: {
    assetId: number;
    startDate: string;
    endDate: string;
    period: number;
    warrantyType: number | null;
    warrantyProvider: string;
    description: string;
    contactPerson: string;
    mobileNumber: string;
    email: string;
    serviceCountryId: number | null;
    serviceStateId: number | null;
    serviceCityId: number | null;
    serviceAddressLine1: string;
    serviceAddressLine2: string;
    servicePinCode: string;
    serviceContactPerson: string;
    serviceMobileNumber: string;
    serviceEmail: string;
    serviceClaimProcessDescription: string;
    serviceClaimStatus: number;
    id?: number;
    serviceLastClaimDate?: string;
  } = {
    assetId: Number(pathname),
    startDate: dayjs(warrantyInputs.startDate).format("YYYY-MM-DD"),
    endDate: dayjs(warrantyInputs.endDate).format("YYYY-MM-DD"),
    period: Number(warrantyInputs.warrantyPeriod),
    warrantyType: warrantyInputs.warrantyType
      ? Number((warrantyInputs.warrantyType as any)?.id)
      : null,
    warrantyProvider: warrantyInputs.warrantyProvider,
    description: warrantyInputs.termsAndCondition?.trim(),
    contactPerson: warrantyInputs.contactPerson?.trim(),
    mobileNumber: warrantyInputs.mobile,
    email: warrantyInputs.email,
    serviceCountryId: warrantyInputs.country
      ? Number((warrantyInputs.country as any)?.id)
      : null,
    serviceStateId:
      typeof warrantyInputs.state === "object" && warrantyInputs.state !== null
        ? Number((warrantyInputs.state as any).id)
        : null,
    serviceCityId:
      typeof warrantyInputs.city === "object" && warrantyInputs.city !== null
        ? Number((warrantyInputs.city as any).id)
        : null,
    serviceAddressLine1: warrantyInputs.address1?.trim(),
    serviceAddressLine2: warrantyInputs.address2?.trim(),
    servicePinCode: warrantyInputs.pincode?.trim(),
    serviceContactPerson: warrantyInputs.centreContactPerson?.trim(),
    serviceMobileNumber: warrantyInputs.centrePhone,
    serviceEmail: warrantyInputs.centreEmail,
    serviceClaimProcessDescription: warrantyInputs.claimProcess?.trim(),
    serviceClaimStatus: Number(warrantyInputs.warrantyClaimStatus?.id),
    id: warrantyId !== 0 ? warrantyId : undefined,
  };

  const handleSubmit = async () => {
    if (isSubmitting()) return;
    let temp: string[] = [];
    Object.entries(warrantyInputs).forEach(([key, value]: any) => {
      if (key === "mobile" || key === "centrePhone") {
        if (!value || value.toString().length !== 10) temp.push(key);
      } else if (key === "email" || key === "centreEmail") {
        if (!emailRegex.test(value)) temp.push(key);
      } else if (
        [
          "warrantyProvider",
          "contactPerson",
          "address1",
          "centreContactPerson",
          "pincode",
        ].includes(key)
      ) {
        if (typeof value !== "string" || value.trim().length === 0)
          temp.push(key);
      } else if (key === "warrantyPeriod") {
        if (value === "" || value == null || Number(value) <= 0) temp.push(key);
      } else if (value === "" || value === null) {
        const skipFieldsOnUpdate = ["termsAndCondition", "address2"];
        if (!(warrantyId !== 0 && skipFieldsOnUpdate.includes(key))) {
          temp.push(key);
        }
      }
    });

    const index = temp.indexOf("document");
    if (index !== -1) temp.splice(index, 1);

    const filterTemp = temp.filter(
      (i: string) =>
        !i.includes("warrantyClaimStatus") &&
        !i.includes("lastWarrantyDate") &&
        !i.includes("claimProcess") &&
        !i.includes("serviceLastClaimDate")
    );

    setErrors(filterTemp);

    if (filterTemp.length === 0) {
      if (warrantyBody.id) {
        warrantyBody.id = warrantyId;
      }
      try {
        startLoading();
        await AddWarranty();
      } catch (error) {
        console.error("Warranty submission failed:", error);
      } finally {
        stopLoading();
      }
    }
  };

  const AddWarranty = async () => {
    try {
      startLoading();
      if (
        warrantyInputs.serviceLastClaimDate &&
        dayjs(warrantyInputs.serviceLastClaimDate).isValid()
      ) {
        warrantyBody.serviceLastClaimDate = dayjs(
          warrantyInputs.serviceLastClaimDate
        ).format("YYYY-MM-DD");
      }

      const { endpoint, method } = !isWarrantyCreated
        ? FamConfig.AssetWarranty.AddWarranty
        : FamConfig.AssetWarranty.UpdateWarranty;
      const response = await Apirequest(
        endpoint,
        method,
        warrantyBody,
        "fam"
      ).then((res) => res.data);

      if (response.statusCode === 201 || response.statusCode === 200) {
        onUpdated && onUpdated();
        Swal.fire({
          title: `Asset Warranty ${
            !isWarrantyCreated ? "Saved" : "Updated"
          } Successfully`,
          icon: "success",
          confirmButtonText: "Okay",
          customClass: {
            title: "custom-title",
          },
        });
      } else {
        toast.error(response?.message);
        if (response?.errors) {
          setErrorMessages(response.errors);
          setErrorModalOpen(true);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      stopLoading();
    }
  };

  return (
    <Box>
      <Grid2 container spacing={2}>
        <Grid2 size={3} my={1}>
          <MuiText variant="h6" className="asset-label-title">
            Warranty Period (Months) <span className="mandatory-sign">*</span>
          </MuiText>
          <MuiInputField
            fullWidth
            type="number"
            variant="outlined"
            size="small"
            name="warrantyPeriod"
            value={warrantyInputs.warrantyPeriod}
            onChange={handleChange}
            inputProps={{ min: 0, max: 200 }}
            error={errors.includes("warrantyPeriod")}
            helperText={
              errors.includes("warrantyPeriod") &&
              "Please enter warranty period"
            }
            onInput={(e: React.FormEvent<HTMLInputElement>) => {
              const value = parseInt((e.target as HTMLInputElement).value);
              if (isNaN(value) || value < 0) {
                (e.target as HTMLInputElement).value = Math.min(
                  Math.max(value, 0)
                ).toString();
              }
            }}
          />
        </Grid2>
        <Grid2 size={3} my={1}>
          <MuiText variant="h6" className="asset-label-title">
            Start Date <span className="mandatory-sign">*</span>
          </MuiText>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              slotProps={{
                textField: {
                  fullWidth: true,
                  size: "small",
                  name: "startDate",
                  placeholder: "",
                  error: errors.includes("startDate"),
                  helperText:
                    errors.includes("startDate") && "Please select start date",
                  inputProps: {
                    placeholder: "",
                    value: warrantyInputs.startDate
                      ? DateFormatter(warrantyInputs.startDate)
                      : "",
                    readOnly: true,
                  },
                },
              }}
              // minDate={dayjs()}
              value={
                warrantyInputs.startDate
                  ? dayjs(warrantyInputs.startDate)
                  : null
              }
              onChange={(value) => handleDate(value, "startDate")}
            />
          </LocalizationProvider>
        </Grid2>
        <Grid2 size={3} my={1}>
          <MuiText variant="h6" className="asset-label-title">
            End Date <span className="mandatory-sign">*</span>
          </MuiText>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              slotProps={{
                textField: {
                  fullWidth: true,
                  size: "small",
                  name: "endDate",
                  placeholder: "",
                  error: errors.includes("endDate"),
                  helperText:
                    errors.includes("endDate") && "Please select end date",
                },
              }}
              format={DateFormatter(warrantyInputs.endDate)}
              disabled={true}
              minDate={
                warrantyInputs.startDate
                  ? dayjs(warrantyInputs.startDate)
                  : dayjs()
              }
              value={
                warrantyInputs.endDate ? dayjs(warrantyInputs.endDate) : null
              }
              // onChange={(value) => handleDate(value, "endDate")}
            />
          </LocalizationProvider>
        </Grid2>
      </Grid2>
      <Grid2 container spacing={2}>
        <Grid2 size={3} my={1}>
          <MuiText variant="h6" className="asset-label-title">
            Warranty Type <span className="mandatory-sign">*</span>
          </MuiText>
          <Autocomplete
            disablePortal
            options={warrantyInputs.warrantyTypeData || []}
            fullWidth
            value={warrantyInputs.warrantyType}
            onChange={(event, value) =>
              handleAutocomplete(value as string, "warrantyType")
            }
            getOptionLabel={(option: any) => option.code || ""}
            isOptionEqualToValue={(option: any, value: any) =>
              option.id === value.id
            }
            renderInput={(params) => (
              <MuiInputField
                {...params}
                size="small"
                error={errors?.includes("warrantyType")}
                helperText={
                  errors?.includes("warrantyType") &&
                  "please select warranty type"
                }
              />
            )}
          />
        </Grid2>
        <Grid2 size={3} my={1}>
          <MuiText variant="h6" className="asset-label-title">
            Warranty Provider <span className="mandatory-sign">*</span>
          </MuiText>
          <MuiInputField
            fullWidth
            type="text"
            variant="outlined"
            size="small"
            name="warrantyProvider"
            autoComplete="off"
            onChange={handleChange}
            InputProps={{
              inputProps: {
                maxLength: 50,
              },
            }}
            value={warrantyInputs.warrantyProvider}
            error={errors?.includes("warrantyProvider")}
            helperText={
              errors?.includes("warrantyProvider") &&
              "please enter warranty provider name"
            }
          />
        </Grid2>
        <Grid2 size={3} my={1}>
          <MuiText variant="h6" className="asset-label-title">
            Mobile Number <span className="mandatory-sign">*</span>
          </MuiText>

          <MuiInputField
            fullWidth
            type="tel"
            variant="outlined"
            size="small"
            name="mobile"
            autoComplete="off"
            onInput={(e) => {
              const input = e.target as HTMLInputElement;
              input.value = input.value.replace(/\D/g, "").slice(0, 10);
            }}
            inputProps={{ maxLength: 10 }}
            onChange={handleChange}
            value={warrantyInputs.mobile}
            error={errors?.includes("mobile")}
            helperText={
              errors?.includes("mobile") && "please enter mobile number"
            }
          />
        </Grid2>
        <Grid2 size={3} my={1}>
          <MuiText variant="h6" className="asset-label-title">
            Contact Person Name <span className="mandatory-sign">*</span>
          </MuiText>
          <MuiInputField
            fullWidth
            type="text"
            variant="outlined"
            autoComplete="off"
            size="small"
            name="contactPerson"
            onChange={handleChange}
            value={warrantyInputs.contactPerson}
            InputProps={{
              inputProps: {
                maxLength: 50,
              },
            }}
            error={errors?.includes("contactPerson")}
            helperText={
              errors?.includes("contactPerson") &&
              "please enter contact person name"
            }
          />
        </Grid2>
      </Grid2>
      <Grid2 container spacing={2}>
        <Grid2 size={6} my={1}>
          <MuiText variant="h6" className="asset-label-title">
            Terms & Condition
          </MuiText>
          <MuiInputField
            fullWidth
            type="text"
            variant="outlined"
            size="small"
            name="termsAndCondition"
            value={warrantyInputs.termsAndCondition}
            multiline
            onChange={handleChange}
            rows={4}
            InputProps={{
              inputProps: {
                maxLength: 500,
              },
            }}
            error={errors?.includes("termsAndCondition")}
            helperText={
              errors?.includes("termsAndCondition") &&
              "please enter terms and condition"
            }
          />
        </Grid2>
        <Grid2 size={3} my={1}>
          <MuiText variant="h6" className="asset-label-title">
            Email <span className="mandatory-sign">*</span>
          </MuiText>
          <MuiInputField
            fullWidth
            type="email"
            variant="outlined"
            size="small"
            name="email"
            autoComplete="off"
            value={warrantyInputs.email}
            onChange={handleChange}
            InputProps={{
              inputProps: {
                maxLength: 50,
              },
            }}
            error={errors?.includes("email")}
            helperText={errors?.includes("email") && "please enter valid email"}
          />
        </Grid2>
      </Grid2>
      <MuiText variant="h6" py={1} className="asset-page-title">
        Service Center Details
      </MuiText>
      <Grid2 container spacing={2}>
        <Grid2 size={3} my={1}>
          <MuiText variant="h6" className="asset-label-title">
            Country Name <span className="mandatory-sign">*</span>
          </MuiText>
          <Autocomplete
            disablePortal
            options={warrantyInputs.countryData || []}
            fullWidth
            value={warrantyInputs.country}
            onChange={(event, value) =>
              handleAutocomplete(value as string, "country")
            }
            getOptionLabel={(option: any) => option.countryName || ""}
            isOptionEqualToValue={(option: any, value: any) =>
              option.id === value.id
            }
            renderInput={(params) => (
              <MuiInputField
                {...params}
                size="small"
                error={errors?.includes("country")}
                helperText={
                  errors?.includes("country") && "please select country"
                }
              />
            )}
          />
        </Grid2>
        <Grid2 size={3} my={1}>
          <MuiText variant="h6" className="asset-label-title">
            State Name <span className="mandatory-sign">*</span>
          </MuiText>
          <Autocomplete
            disablePortal
            options={warrantyInputs.stateData || []}
            fullWidth
            value={warrantyInputs.state}
            onChange={(event, value) =>
              handleAutocomplete(value as string, "state")
            }
            getOptionLabel={(option: any) => option.stateName || ""}
            isOptionEqualToValue={(option: any, value: any) =>
              option.id === value.id
            }
            renderInput={(params) => (
              <MuiInputField
                {...params}
                size="small"
                error={errors?.includes("state")}
                helperText={errors?.includes("state") && "please select state"}
              />
            )}
          />
        </Grid2>
        <Grid2 size={3} my={1}>
          <MuiText variant="h6" className="asset-label-title">
            City Name <span className="mandatory-sign">*</span>
          </MuiText>
          <Autocomplete
            disablePortal
            options={warrantyInputs.cityData || []}
            fullWidth
            value={warrantyInputs.city}
            onChange={(event, value) =>
              handleAutocomplete(value as string, "city")
            }
            getOptionLabel={(option: any) => option.cityName || ""}
            isOptionEqualToValue={(option: any, value: any) =>
              option.id === value.id
            }
            renderInput={(params) => (
              <MuiInputField
                {...params}
                size="small"
                error={errors?.includes("city")}
                helperText={errors?.includes("city") && "please select city"}
              />
            )}
          />
        </Grid2>
        <Grid2 size={3} my={1}>
          <MuiText variant="h6" className="asset-label-title">
            Pincode <span className="mandatory-sign">*</span>
          </MuiText>

          <MuiInputField
            fullWidth
            variant="outlined"
            size="small"
            type="text"
            autoComplete="off"
            name="pincode"
            value={
              warrantyInputs.pincode &&
              warrantyInputs.pincode.toString() !== "0"
                ? warrantyInputs.pincode.toString().slice(0, 6)
                : ""
            }
            error={errors.includes("pincode")}
            helperText={
              errors.includes("pincode") && "please enter valid  pincode"
            }
            InputProps={{
              inputProps: {
                maxLength: 6,
              },
            }}
            onChange={handleChange}
          />
        </Grid2>
      </Grid2>
      <Grid2 container spacing={2}>
        <Grid2 size={3} my={1}>
          <MuiText variant="h6" className="asset-label-title">
            Address Line-1 <span className="mandatory-sign">*</span>
          </MuiText>
          <MuiInputField
            fullWidth
            type="text"
            variant="outlined"
            size="small"
            name="address1"
            autoComplete="off"
            onChange={handleChange}
            value={warrantyInputs.address1}
            InputProps={{
              inputProps: {
                maxLength: 50,
              },
            }}
            error={errors?.includes("address1")}
            helperText={
              errors?.includes("address1") && "please enter address line 1"
            }
          />
        </Grid2>
        <Grid2 size={3} my={1}>
          <MuiText variant="h6" className="asset-label-title">
            Address Line-2
          </MuiText>
          <MuiInputField
            fullWidth
            type="text"
            variant="outlined"
            size="small"
            name="address2"
            autoComplete="off"
            onChange={handleChange}
            value={warrantyInputs.address2}
            InputProps={{
              inputProps: {
                maxLength: 50,
              },
            }}
            error={errors?.includes("address2")}
            helperText={
              errors?.includes("address2") && "please enter address line 2"
            }
          />
        </Grid2>
        <Grid2 size={3} my={1}>
          <MuiText variant="h6" className="asset-label-title">
            Phone <span className="mandatory-sign">*</span>
          </MuiText>
          <MuiInputField
            fullWidth
            type="tel"
            variant="outlined"
            size="small"
            name="centrePhone"
            autoComplete="off"
            onInput={(e) => {
              const input = e.target as HTMLInputElement;
              input.value = input.value.replace(/\D/g, "").slice(0, 10);
            }}
            inputProps={{ maxLength: 10 }}
            onChange={handleChange}
            value={warrantyInputs.centrePhone}
            error={errors?.includes("centrePhone")}
            helperText={
              errors?.includes("centrePhone") && "please enter phone number"
            }
          />
        </Grid2>
        <Grid2 size={3} my={1}>
          <MuiText variant="h6" className="asset-label-title">
            Email <span className="mandatory-sign">*</span>
          </MuiText>
          <MuiInputField
            fullWidth
            type="email"
            variant="outlined"
            size="small"
            name="centreEmail"
            onChange={handleChange}
            autoComplete="off"
            value={warrantyInputs.centreEmail}
            InputProps={{
              inputProps: {
                maxLength: 50,
              },
            }}
            error={errors?.includes("centreEmail")}
            helperText={
              errors?.includes("centreEmail") && "please enter valid email"
            }
          />
        </Grid2>
      </Grid2>
      <Grid2 container spacing={2}>
        <Grid2 size={3} my={1}>
          <MuiText variant="h6" className="asset-label-title">
            Contact Person Name <span className="mandatory-sign">*</span>
          </MuiText>
          <MuiInputField
            fullWidth
            type="text"
            variant="outlined"
            size="small"
            name="centreContactPerson"
            autoComplete="off"
            onChange={handleChange}
            value={warrantyInputs.centreContactPerson}
            InputProps={{
              inputProps: {
                maxLength: 50,
              },
            }}
            error={errors?.includes("centreContactPerson")}
            helperText={
              errors?.includes("centreContactPerson") &&
              "please enter contact person name"
            }
          />
        </Grid2>
        <Grid2 size={3} my={1}>
          <MuiText variant="h6" className="asset-label-title">
            Claim Process
          </MuiText>
          <MuiInputField
            fullWidth
            type="text"
            variant="outlined"
            size="small"
            name="claimProcess"
            onChange={handleChange}
            autoComplete="off"
            value={warrantyInputs.claimProcess}
            InputProps={{
              inputProps: {
                maxLength: 50,
              },
            }}
            error={errors?.includes("claimProcess")}
            helperText={
              errors?.includes("claimProcess") && "please enter claim process"
            }
          />
        </Grid2>
        <Grid2 size={3} my={1}>
          <MuiText variant="h6" className="asset-label-title">
            Last Warranty Claim Date
          </MuiText>
          <InputDatePicker
            sx={{ width: "100%" }}
            format="DD/MM/YYYY"
            slotProps={{
              textField: {
                fullWidth: true,
                size: "small",
                name: "serviceLastClaimDate",
                error: errors.includes("serviceLastClaimDate"),
                helperText:
                  errors.includes("serviceLastClaimDate") &&
                  "Please select service last claim date",
                inputProps: {
                  readOnly: true,
                  placeholder: "",
                  value: warrantyInputs.serviceLastClaimDate
                    ? DateFormatter(warrantyInputs.serviceLastClaimDate)
                    : "",
                },
              },
            }}
            value={
              warrantyInputs.serviceLastClaimDate
                ? dayjs(warrantyInputs.serviceLastClaimDate)
                : null
            }
            onChange={(date) => {
              const fakeEvent = {
                target: {
                  name: "serviceLastClaimDate",
                  value: date ? date : null,
                },
              } as React.ChangeEvent<HTMLInputElement>;
              handleChange(fakeEvent);
            }}
          />
        </Grid2>
        <Grid2 size={3} my={1}>
          <MuiText variant="h6" className="asset-label-title">
            Warranty Claim Status
          </MuiText>
          <Autocomplete
            disablePortal
            options={warrantyInputs.warrantyClaimData || []}
            fullWidth
            value={warrantyInputs.warrantyClaimStatus}
            onChange={(event, value) =>
              handleAutocomplete(value as string, "warrantyClaimStatus")
            }
            getOptionLabel={(option: any) => option.code || ""}
            isOptionEqualToValue={(option: any, value: any) =>
              option.id === value.id
            }
            renderInput={(params) => <MuiInputField {...params} size="small" />}
          />
        </Grid2>
      </Grid2>
      <Box display={"flex"} justifyContent={"end"} alignItems={"center"} my={2}>
        <MuiButton
          variant="contained"
          onClick={handleSubmit}
          disabled={isSubmitting()}
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
        >
          Save
        </MuiButton>
      </Box>{" "}
      <ErrorModal
        open={errorModalOpen}
        onClose={() => setErrorModalOpen(false)}
        errors={errorMessages}
      />
    </Box>
  );
}

export default AssetWaranty;
