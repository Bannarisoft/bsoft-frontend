import { Checkbox, CheckboxProps, FormControlLabel } from "@mui/material";
import React from "react";

function CheckboxComponent(props: CheckboxProps) {
  const { title, ...args } = props;
  return (
    <FormControlLabel
      control={<Checkbox {...args} />}
      label={title}
      sx={{
        "& span": {
          fontSize: 14,
          fontFamily: "var(--poppins-font)",
          fontWeight: 400,
        },
      }}
    />
  );
}

export default CheckboxComponent;
