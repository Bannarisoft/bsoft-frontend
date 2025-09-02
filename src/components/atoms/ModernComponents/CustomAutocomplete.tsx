import * as React from "react";
import Autocomplete, {
  AutocompleteProps,
  createFilterOptions,
} from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import { styled } from "@mui/material/styles";

type OptionType = { label: string; inputValue?: string };

export const StyledAutocomplete = styled(Autocomplete)(({ theme }) => ({
  "& .MuiOutlinedInput-root": {
    borderRadius: "8px",
    transition: "all 0.2s ease",
    "&:hover": {
      borderColor: "#3a8484",
    },
    "&.Mui-focused": {
      borderColor: "#3a8484",
      boxShadow: "0 0 0 2px rgba(24, 138, 113, 0.1)",
    },
    fontSize: "14px",
    fontFamily: "var(--poppins-font)",
  },
})) as typeof Autocomplete;

interface CustomAutocompleteProps<T>
  extends Omit<
    AutocompleteProps<T | OptionType, false, false, false>,
    "renderInput" | "options"
  > {
  label?: string;
  options: T[];
  onCreate?: (input: string) => void;
}

const CustomAutocomplete = <T,>(props: CustomAutocompleteProps<T>) => {
  const { label, options, onCreate, ...rest } = props;

  const filter = createFilterOptions<T | OptionType>();

  return (
    <StyledAutocomplete
      {...rest}
      filterOptions={(optionsList, params) => {
        const filtered = filter(optionsList as any, params);
        const { inputValue } = params;
        const isExisting = optionsList.some((option: any) =>
          typeof option === "string"
            ? option === inputValue
            : option.label === inputValue
        );
        if (inputValue !== "" && !isExisting) {
          filtered.push({
            label: `+ Create "${inputValue}"`,
            inputValue,
          });
        }
        return filtered;
      }}
      options={options as (T | OptionType)[]}
      getOptionLabel={(option: T | OptionType) =>
        typeof option === "string"
          ? option
          : (option as OptionType).inputValue ?? (option as OptionType).label
      }
      isOptionEqualToValue={(option, value) =>
        (option as OptionType).label === (value as OptionType).label
      }
      renderOption={(props, option: any) =>
        option.inputValue ? (
          <li {...props} style={{ fontWeight: 600, color: "#3a8484" }}>
            {option.label}
          </li>
        ) : (
          <li {...props}>
            {typeof option === "string" ? option : option.label}
          </li>
        )
      }
      onChange={(event, value, reason, details) => {
        if ((value as OptionType)?.inputValue && onCreate) {
          onCreate((value as OptionType).inputValue!);
        } else if (rest.onChange) {
          rest.onChange(event, value, reason, details);
        }
      }}
      renderInput={(params) => (
        <TextField {...params} label={label} size="small" variant="outlined" />
      )}
    />
  );
};

export default CustomAutocomplete;
