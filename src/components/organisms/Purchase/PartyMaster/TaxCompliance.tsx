import React from "react";
import { FieldConfig } from "./GeneralPartyInfo";
import {
  Box,
  Checkbox,
  FormControl,
  FormControlLabel,
  Grid,
  TextField,
  useTheme,
} from "@mui/material";
import { MuiText } from "bsoft-base-elements";
import { StyledAutocomplete } from "../../../../utils/lib";

const paymentOptions = ["Cash", "Online", "Cheque"];

const customerGroupFields: FieldConfig[] = [
  {
    name: "gstNo",
    label: "GST Number",
    field: "input",
  },
  {
    name: "gstStateCode",
    label: "GST State Code",
    field: "input",
  },
  {
    name: "pan",
    label: "PAN",
    field: "input",
  },
  {
    name: "tan",
    label: "TAN",
    field: "input",
  },

  {
    name: "msmeType",
    label: "MSME Type",
    field: "dropdown",
    options: ["Micro", "Small", "Medium"],
  },
  {
    name: "msmeNumber",
    label: "MSME Number",
    field: "input",
  },

  {
    name: "tdsCategory",
    label: "TDS Category",
    field: "dropdown",
    options: [],
  },
  {
    name: "slType",
    label: "SL Type",
    field: "dropdown",
    options: ["Payables", "Receivables"],
  },
  {
    name: "slAccountLink",
    label: "SL Account Link",
    field: "input",
  },
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
}: {
  formData: Record<string, any>;
  handleInputChange: (name: string, value: any) => void;
}) {
  const theme = useTheme();

  const renderField = (
    { name, label, type, isRequired, field = "input", options }: FieldConfig,
    value: any,
    onChange: (value: any) => void
  ) => (
    <Box
      sx={{
        // minHeight: "80px",
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
            onChange={(_, newValue) => onChange(newValue)}
            renderInput={(params) => (
              <TextField
                {...params}
                variant="outlined"
                size="small"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    height: "40px",
                    fontSize: "0.875rem",
                  },
                }}
              />
            )}
          />
        </FormControl>
      )}

      {field === "checkbox" && (
        <Box sx={{ my: "auto" }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={value || false}
                onChange={(e) => onChange(e.target.checked)}
                size="medium"
              />
            }
            label={
              <MuiText
                variant="body2"
                sx={{ fontSize: "0.875rem", fontWeight: 500 }}
              >
                {label}
              </MuiText>
            }
          />
        </Box>
      )}
    </Box>
  );

  const renderFields = (fields: FieldConfig[]) => (
    <Grid container spacing={2}>
      {fields.map((fieldConfig) => (
        <Grid item xs={12} sm={6} md={4} key={fieldConfig.name}>
          {renderField(fieldConfig, formData[fieldConfig.name], (value) =>
            handleInputChange(fieldConfig.name, value)
          )}
        </Grid>
      ))}
    </Grid>
  );
  return <div>{renderFields(customerGroupFields)}</div>;
}

export default TaxCompliance;
