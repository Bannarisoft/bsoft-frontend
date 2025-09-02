import React, { useEffect } from "react";
import { FieldConfig } from "./GeneralPartyInfo";
import {
  Box,
  Checkbox,
  FormControl,
  FormControlLabel,
  Grid,
  Stack,
  TextField,
  useTheme,
} from "@mui/material";
import { MuiText } from "bsoft-base-elements";
import { StyledAutocomplete } from "../../../../utils/lib";
import CustomTextField from "../../../atoms/ModernComponents/CustomTextField";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

const checkboxFields: FieldConfig[] = [
  {
    name: "msmeCompliant",
    label: "MSME Compliant",
    field: "checkbox",
  },
  {
    name: "tdsApplicable",
    label: "TDS Applicable",
    field: "checkbox",
  },
  {
    name: "tcsApplicable",
    label: "TCS Applicable",
    field: "checkbox",
  },
  {
    name: "gstReverseChargeApplicable",
    label: "GST Reverse Charge Applicable",
    field: "checkbox",
  },
  {
    name: "sectionApplicable",
    label: "Section 206AB & 206CCA Applicable",
    field: "checkbox",
  },
];

function TaxCompliance({
  formData,
  handleInputChange,
  canEdit,
  msmeOption,
}: {
  formData: Record<string, any>;
  handleInputChange: (name: string, value: any) => void;
  canEdit?: boolean;
  msmeOption: any[];
}) {
  const theme = useTheme();

  const customerGroupFields: FieldConfig[] = [
    // TDS related fields
    {
      name: "tan",
      label: "TAN",
      field: "input",
      category: "tds",
    },
    {
      name: "tdsCategory",
      label: "TDS Category",
      field: "dropdown",
      options: [],
      category: "tds",
    },
    // MSME related fields
    {
      name: "msmeType",
      label: "MSME Type",
      field: "dropdown",
      options: msmeOption ?? [],
      optionLabel: ["code"],
      category: "msme",
    },
    {
      name: "msmeNumber",
      label: "MSME Number",
      field: "input",
      category: "msme",
    },
    {
      name: "msmeRegistrationDate",
      label: "MSME Registration Date",
      field: "picker",
      category: "msme",
    },
    {
      name: "msmeValidUpto",
      label: "MSME Valid Upto",
      field: "picker",
      category: "msme",
    },
    // General fields (always visible)
    {
      name: "slType",
      label: "SL Type",
      field: "dropdown",
      options: ["Payables", "Receivables"],
      category: "general",
    },
    {
      name: "slAccountLink",
      label: "SL Account Link",
      field: "input",
      category: "general",
    },
    {
      name: "cin",
      label: "CIN",
      field: "input",
      category: "general",
    },
    {
      name: "iecode",
      label: "IE Code",
      field: "input",
      category: "general",
    },
  ];

  const renderField = (
    {
      name,
      label,
      type,
      isRequired,
      field = "input",
      options,
      optionLabel,
    }: FieldConfig,
    value: any,
    onChange: (value: any) => void
  ) => (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
      }}
    >
      {field === "input" && (
        <FormControl fullWidth>
          <MuiText
            variant="body2"
            sx={{
              mb: 1,
              fontWeight: 500,
              color: theme.palette.text.primary,
              fontSize: "0.875rem",
            }}
          >
            {label}
            {isRequired && (
              <MuiText
                component="span"
                sx={{
                  color: "error.main",
                  ml: 0.5,
                  fontSize: "inherit !important",
                }}
              >
                *
              </MuiText>
            )}
          </MuiText>
          <TextField
            fullWidth
            type={type || "text"}
            variant="outlined"
            size="small"
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            sx={{
              "& .MuiOutlinedInput-root": {
                height: "40px",
                fontSize: "0.875rem",
              },
            }}
          />
        </FormControl>
      )}
      {field === "picker" && (
        <>
          <MuiText
            variant="body2"
            sx={{
              mb: 1,
              fontWeight: 500,
              color: theme.palette.text.primary,
            }}
          >
            {label}
          </MuiText>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              value={value || null}
              minDate={dayjs(new Date())}
              onChange={(newValue) => onChange(newValue)}
              format="DD-MM-YYYY"
              slots={{
                textField: (params) => (
                  <CustomTextField
                    {...params}
                    fullWidth
                    size="small"
                    placeholder=""
                  />
                ),
              }}
            />
          </LocalizationProvider>
        </>
      )}
      {field === "dropdown" && (
        <FormControl fullWidth>
          <MuiText
            variant="body2"
            sx={{
              mb: 1,
              fontWeight: 500,
              color: theme.palette.text.primary,
              fontSize: "0.875rem",
            }}
          >
            {label}
            {isRequired && (
              <MuiText
                component="span"
                sx={{
                  color: "error.main",
                  ml: 0.5,
                  fontSize: "inherit !important",
                }}
              >
                *
              </MuiText>
            )}
          </MuiText>
          <StyledAutocomplete
            disablePortal
            options={options || []}
            value={value || null}
            onChange={(event, newValue) => onChange(newValue || "")}
            getOptionLabel={(option: any) => {
              if (!option) return "";
              if (Array.isArray(optionLabel) && optionLabel.length > 0) {
                const key1 = optionLabel[0];
                const key2 = optionLabel[1];
                if (key2) {
                  const val1 = option[key1] ?? "";
                  const val2 = option[key2] ?? "";
                  return val2 ? `${val1} - ${val2}` : val1;
                }
                return option[key1] ?? "";
              }
              return typeof option === "string" ? option : "";
            }}
            isOptionEqualToValue={(opt, val) => {
              if (Array.isArray(optionLabel) && optionLabel.length > 0) {
                const key = optionLabel[0];
                return (opt as any)[key] === (val as any)[key];
              }
              return opt === val;
            }}
            renderInput={(params) => (
              <CustomTextField {...params} variant="outlined" size="small" />
            )}
          />
        </FormControl>
      )}
    </Box>
  );

  const renderCheckboxFields = (
    fields: FieldConfig[],
    formData: Record<string, any>,
    handleInputChange: (name: string, value: any) => void
  ) => (
    <Grid item xs={12} mb={2}>
      <Stack direction="row" spacing={4} sx={{ mt: 2 }}>
        {fields.map((f) => (
          <FormControlLabel
            key={f.name}
            control={
              <Checkbox
                checked={formData[f.name] || false}
                onChange={(e) => handleInputChange(f.name, e.target.checked)}
                size="medium"
              />
            }
            label={
              <MuiText variant="body2" sx={{ fontSize: "0.875rem" }}>
                {f.label}
              </MuiText>
            }
            sx={{ m: 0, mr: 3 }}
          />
        ))}
      </Stack>
    </Grid>
  );

  const renderFields = (fields: FieldConfig[]) => (
    <Grid container spacing={2} pl={1}>
      {fields.map((fieldConfig) => (
        <Grid item xs={12} sm={6} md={3} key={fieldConfig.name}>
          {renderField(fieldConfig, formData[fieldConfig.name], (value) =>
            handleInputChange(fieldConfig.name, value)
          )}
        </Grid>
      ))}
    </Grid>
  );

  function GetFields() {
    return customerGroupFields.filter((field) => {
      if (field.category === "general") {
        return true;
      }

      if (field.category === "msme") {
        return formData.msmeCompliant === true;
      }

      if (field.category === "tds") {
        return formData.tdsApplicable === true;
      }

      return true;
    });
  }

  useEffect(() => {
    if (!formData.msmeCompliant) {
      const msmeFields = customerGroupFields
        .filter((field) => field.category === "msme")
        .map((field) => field.name);

      msmeFields.forEach((fieldName) => {
        if (formData[fieldName]) {
          handleInputChange(fieldName, "");
        }
      });
    }
  }, [formData.msmeCompliant]);

  useEffect(() => {
    if (!formData.tdsApplicable) {
      const tdsFields = customerGroupFields
        .filter((field) => field.category === "tds")
        .map((field) => field.name);

      tdsFields.forEach((fieldName) => {
        if (formData[fieldName]) {
          handleInputChange(fieldName, "");
        }
      });
    }
  }, [formData.tdsApplicable]);

  return (
    <div style={{ pointerEvents: !canEdit ? "none" : undefined }}>
      {renderCheckboxFields(checkboxFields, formData, handleInputChange)}
      {renderFields(GetFields())}
    </div>
  );
}

export default TaxCompliance;
