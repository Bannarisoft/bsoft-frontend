import React from "react";
import { Box, FormControl, Grid, useTheme } from "@mui/material";
import { MuiText } from "bsoft-base-elements";
import {
  StyledAutocomplete,
  StyledDatePickerTextField,
} from "../../../../utils/lib";
import { FieldConfig } from "../PartyMaster/GeneralPartyInfo";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import CustomTextField from "../../../atoms/ModernComponents/CustomTextField";

interface GeneralItemInfoProps {
  formData: Record<string, any>;
  handleInputChange: (name: string, value: any) => void;
  RegistrationTypes: any[];
  DepartmentData: any[];
}

const raisedByOptions = ["User A", "User B", "User C"];
const unitOptions = ["Unit 1", "Unit 2", "Unit 3"];

const GeneralInfoIndent: React.FC<GeneralItemInfoProps> = ({
  formData,
  handleInputChange,
  RegistrationTypes,
  DepartmentData,
}) => {
  const customerGroupFields: FieldConfig[] = [
    { name: "indentDate", label: "Indent Date", field: "picker" },
    {
      name: "indentType",
      label: "Indent Type",
      field: "dropdown",
      options: RegistrationTypes ?? [],
      optionLabel: ["code"],
    },
    {
      name: "unit",
      label: "Unit / Plant",
      field: "input",
      options: unitOptions,
      isDisable: true,
    },
    {
      name: "department",
      label: "Department",
      field: "dropdown",
      options: DepartmentData ?? [],
      optionLabel: ["deptName"],
    },
    {
      name: "raisedBy",
      label: "Raised By",
      field: "input",
      options: raisedByOptions,
      isDisable: true,
    },
    { name: "purpose", label: "Purpose", field: "input" },
  ];

  const theme = useTheme();

  const renderField = (
    {
      label,
      isRequired,
      field = "input",
      options,
      isDisable,
      optionLabel,
    }: FieldConfig,
    value: any,
    onChange: (value: any) => void
  ) => {
    if (field === "checkbox") return null;

    return (
      <Box
        key={label}
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
            <CustomTextField
              fullWidth
              variant="outlined"
              size="small"
              disabled={isDisable}
              value={value || ""}
              onChange={(e) => onChange(e.target.value)}
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
              onChange={(_, newValue) => onChange(newValue || "")}
              getOptionLabel={(option: any) => {
                if (!option) return "";
                if (Array.isArray(optionLabel) && optionLabel.length > 0) {
                  const key = optionLabel[0];
                  return option[key] ?? "";
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
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                slotProps={{
                  textField: {
                    fullWidth: true,
                    size: "small",
                    placeholder: "",
                  },
                }}
                slots={{
                  textField: StyledDatePickerTextField,
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

  const renderFields = (fields: FieldConfig[]) => (
    <Grid container spacing={2}>
      {fields.map((fieldConfig) => (
        <Grid item xs={12} sm={6} md={3} key={fieldConfig.name}>
          {renderField(fieldConfig, formData[fieldConfig.name], (value) =>
            handleInputChange(fieldConfig.name, value)
          )}
        </Grid>
      ))}
    </Grid>
  );

  return <div>{renderFields(customerGroupFields)}</div>;
};

export default GeneralInfoIndent;
