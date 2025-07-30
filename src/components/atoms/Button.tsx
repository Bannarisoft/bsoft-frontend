import React from "react";
import Button, { ButtonProps } from "@mui/material/Button";

function ButtonComponent(props: ButtonProps) {
  const { variant, children, ...args } = props;
  return (
    <Button sx={{color: "#fff"}} variant={variant} {...args}>
      {children}
    </Button>
  );
}

export default ButtonComponent;
