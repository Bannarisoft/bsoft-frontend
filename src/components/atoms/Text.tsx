import { Typography, TypographyProps } from "@mui/material";
import React from "react";

function TextComponent(props: TypographyProps) {
  const { variant, children, className, ...args } = props;

  return (
    <Typography variant={variant} className={className} {...args}>
      {children}
    </Typography>
  );
}

export default TextComponent;
