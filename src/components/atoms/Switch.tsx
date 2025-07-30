import React from "react";
import { Switch, FormControlLabel, styled } from "@mui/material";
import { CustomSwitch } from "../../utils/lib";

interface MyCustomSwitchProps {
  checked?: boolean;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  label?: string;
}

const MyCustomSwitch: React.FC<MyCustomSwitchProps> = ({
  checked,
  onChange,
  label,
}) => {
  return (
    <FormControlLabel
      control={<CustomSwitch checked={checked} onChange={onChange} />}
      label={label}
    />
  );
};

export default MyCustomSwitch;
