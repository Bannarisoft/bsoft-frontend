import React from "react";
import { DatePicker, DatePickerProps } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

function InputDatePicker(props: DatePickerProps<any>) {
  const { onChange, className, slotProps, ...args } = props;

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DatePicker
        onChange={onChange}
        {...args}
        className={className}
        slotProps={slotProps}
      />
    </LocalizationProvider>
  );
}

export default InputDatePicker;
