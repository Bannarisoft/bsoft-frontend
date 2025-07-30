import { TextField, TextFieldProps } from "@mui/material";
import React from "react";

function InputComponent(props: TextFieldProps) {
  const { onChange, children, className, slotProps, ...args } = props;

  return (
    <TextField
      variant="outlined"
      onChange={onChange}
      {...args}
      className={className}
      slotProps={slotProps} 
      autoComplete="off"
    >
      {children}
    </TextField>
  );
}

export default InputComponent;
