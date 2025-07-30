import { MenuItem, NativeSelect, Select } from "@mui/material";
import React from "react";
import { SelectComponentProps } from "../../types";
import { IoIosArrowDown } from "react-icons/io";

function SelectComponent({
  options,
  selectedValue = "",
  handleChange,
  name,
  data,
}: SelectComponentProps) {
  return (
    <Select
      fullWidth
      size="small"
      value={selectedValue}
      defaultValue=""
      variant="standard"
      name={name}
      onChange={handleChange}
      IconComponent={(props) => <IoIosArrowDown {...props} />}
    >
      {Array.isArray(options) &&
        options.map((item: any, index) => (
          <MenuItem key={index} value={item?.id}>
            {item[data]}
          </MenuItem>
        ))}
    </Select>
  );
}

export default SelectComponent;
