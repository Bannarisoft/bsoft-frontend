import React from "react";
import {
  Box,
  Checkbox,
  FormControl,
  FormControlLabel,
  Grid,
  useTheme,
  Stack,
} from "@mui/material";
import { MuiText } from "bsoft-base-elements";
import { StyledAutocomplete } from "../../../../utils/lib";
import { FieldConfig } from "../PartyMaster/GeneralPartyInfo";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import CustomTextField from "../../../atoms/ModernComponents/CustomTextField";

interface GeneralItemInfoProps {
  formData: Record<string, any>;
  handleInputChange: (name: string, value: any) => void;
  CertificateTypeData?: any[];
  templateData?: any[];
}

const checkboxFields: FieldConfig[] = [
  {
    name: "inspectionRequired",
    label: "Inspection Required?",
    field: "checkbox",
  },
  {
    name: "isCertificateRequired",
    label: "Is Certificate Required from Supplier?",
    field: "checkbox",
  },
];

const ItemQuality: React.FC<GeneralItemInfoProps> = ({
  formData,
  handleInputChange,
  CertificateTypeData,
  templateData,
}) => {
  const theme = useTheme();

  const customerGroupFields: FieldConfig[] = [
    {
      name: "inspectionTemplate",
      label: "Inspection Template",
      field: "dropdown",
      options: templateData ?? [],
      optionLabel: ["templateName"],
    },
    {
      name: "certificateType",
      label: "Certificate Type",
      field: "dropdown",
      options: CertificateTypeData ?? [],
      optionLabel: ["code"],
    },
    {
      name: "inspLotProcessingTime",
      label: "Insp. Lot Processing Time",
      field: "input",
    },
  ];

  const headerStyle = {
    mb: 1,
    fontWeight: 500,
    color: theme.palette.text.primary,
    fontSize: "0.875rem",
  };

  const renderField = (
    {
      label,
      type,
      isRequired,
      field = "input",
      options,
      optionLabel,
    }: FieldConfig,
    value: any,
    onChange: (value: any) => void,
    idx: number
  ) => {
    if (field === "checkbox") return null;
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-start",
        }}
        pl={1.5}
      >
        {field === "input" && (
          <FormControl fullWidth>
            <MuiText variant="body2" sx={headerStyle}>
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
            <CustomTextField
              fullWidth
              type={type || "text"}
              variant="outlined"
              size="small"
              value={value || ""}
              onChange={(value) => onChange(value)}
            />
          </FormControl>
        )}

        {field === "dropdown" && (
          <FormControl fullWidth>
            <MuiText variant="body2" sx={headerStyle}>
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
              onChange={(_, newValue) => onChange(newValue || "")}
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

        {field === "picker" && (
          <>
            <MuiText variant="body2" sx={headerStyle}>
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
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                slotProps={{
                  textField: {
                    fullWidth: true,
                    size: "small",
                    placeholder: "",
                  },
                }}
                format={"MM-DD-YYYY"}
                value={value || null}
                onChange={onChange}
              />
            </LocalizationProvider>
          </>
        )}
      </Box>
    );
  };

  const renderCheckboxFields = (
    fields: FieldConfig[],
    formData: Record<string, any>,
    handleInputChange: (name: string, value: any) => void
  ) => (
    <Box sx={{ mt: 1 }}>
      <Stack direction="row" spacing={3}>
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
              <MuiText
                variant="body2"
                sx={{
                  mb: 0,
                  fontWeight: 500,
                  color: theme.palette.text.primary,
                  fontSize: "0.875rem",
                }}
              >
                {f.label}
              </MuiText>
            }
            sx={{ m: 0, mr: 3 }}
          />
        ))}
      </Stack>
    </Box>
  );

  const renderFields = (fields: FieldConfig[]) => (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        {renderCheckboxFields(checkboxFields, formData, handleInputChange)}
      </Grid>
      {fields.map((fieldConfig, idx) => (
        <Grid item xs={12} sm={6} md={3} key={fieldConfig.name}>
          {renderField(
            fieldConfig,
            formData[fieldConfig.name],
            (value) => handleInputChange(fieldConfig.name, value),
            idx
          )}
        </Grid>
      ))}
    </Grid>
  );

  function GetField() {
    if (formData?.isCertificateRequired && formData?.inspectionRequired) {
      return customerGroupFields;
    }
    if (formData?.inspectionRequired) {
      return customerGroupFields.filter((i) => i.name.includes("insp"));
    } else if (formData?.isCertificateRequired) {
      return customerGroupFields.filter((i) => i.name.includes("certificate"));
    }
    return [];
  }

  return <div>{renderFields(GetField())}</div>;
};

export default ItemQuality;
