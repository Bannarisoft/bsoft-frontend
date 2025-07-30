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
    name: "modeOfPayment",
    label: "Mode of Payment",
    field: "dropdown",
    options: paymentOptions,
  },
  {
    name: "preferredCurrencyForPurchase",
    label: "Preferred Currency for Purchase",
    field: "input",
  },
  {
    name: "creditDays",
    label: "Credit Days",
    field: "input",
  },
  {
    name: "dueDate",
    label: "Due Date Based On",
    field: "dropdown",
    options: ["Invoice Date", "Delivery Date"],
  },
  {
    name: "leadTime",
    label: "Lead Time",
    field: "input",
  },
  {
    name: "preferredCurrencyForSale",
    label: "Preferred Currency for Sale",
    field: "input",
  },
  {
    name: "creditLimit",
    label: "Credit Limit",
    field: "input",
  },
  {
    name: "priceList",
    label: "Price List (Selling)",
    field: "input",
  },
  {
    name: "customerType",
    label: "Customer Type",
    field: "dropdown",
    options: ["Individual", "Company", "Distributor"],
  },
  {
    name: "isInternalSupplier",
    label: "Is Internal Supplier",
    field: "checkbox",
  },
  {
    name: "isInternalCustomer",
    label: "Is Internal Customer",
    field: "checkbox",
  },
  {
    name: "stopPayments",
    label: "Stop Payments",
    field: "checkbox",
  },
];

function CustomerGroup({
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

export default CustomerGroup;
