import React from "react";
import InputComponent from "../../atoms/Input";
import { InputAdornment } from "@mui/material";
import { RiSearchLine } from "react-icons/ri";
import { GlobalSearchProps } from "../../../types/types";

function GlobalSearch({
  width,
  placeholder,
  onChange,
  ...args
}: GlobalSearchProps) {
  return (
    <InputComponent
      size="small"
      placeholder={placeholder}
      {...args}
      sx={{
        width: width,
        bgcolor: "#fff",
        borderRadius: "8px",
        "& fieldset": {
          borderRadius: "8px",
        },
        "& input::placeholder": {
          color: "#3a8484",
        },
      }}
      onChange={onChange}
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <RiSearchLine color={"#3a8484"} />
            </InputAdornment>
          ),
        },
      }}
    ></InputComponent>
  );
}

export default GlobalSearch;
