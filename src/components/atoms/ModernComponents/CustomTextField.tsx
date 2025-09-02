import React from "react";
import { TextField, TextFieldProps, useTheme } from "@mui/material";

interface CustomTextFieldProps extends Omit<TextFieldProps, "onChange"> {
  value?: any;
  onChange?: (value: any) => void;
  isReadOnly?: boolean;
  isDisable?: boolean;
}

const CustomTextField: React.FC<CustomTextFieldProps> = ({
  value,
  onChange,
  isReadOnly = false,
  isDisable = false,
  ...rest
}) => {
  const theme = useTheme();

  return (
    <TextField
      fullWidth
      variant="outlined"
      size="small"
      value={value || ""}
      disabled={isDisable}
      onChange={(e) => onChange?.(e.target.value)}
      sx={{
        "& .MuiOutlinedInput-root": {
          // height: "40px",
          fontSize: "0.9rem",
          backgroundColor: isReadOnly
            ? theme.palette.grey[50]
            : theme.palette.background.paper,
          borderRadius: "8px",
          transition: "all 0.2s ease-in-out",
          "&:hover": {
            boxShadow: !isReadOnly ? "0 2px 8px rgba(0,0,0,0.1)" : "none",
          },
          "&.Mui-focused": {
            boxShadow: !isReadOnly ? "0 4px 12px rgba(0,0,0,0.15)" : "none",
          },
          "& fieldset": {
            borderColor: isReadOnly
              ? theme.palette.grey[200]
              : theme.palette.grey[300],
            borderWidth: "1px",
          },
          "&:hover fieldset": {
            borderColor: !isReadOnly
              ? theme.palette.primary.main
              : theme.palette.grey[200],
          },
          "&.Mui-focused fieldset": {
            borderColor: theme.palette.primary.main,
            borderWidth: "2px",
          },
        },
        "& .MuiInputBase-input.Mui-disabled": {
          WebkitTextFillColor: theme.palette.text.secondary,
          opacity: 0.8,
        },
      }}
      {...rest}
    />
  );
};

export default CustomTextField;
