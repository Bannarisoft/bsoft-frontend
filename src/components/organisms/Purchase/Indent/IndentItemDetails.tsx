import React from "react";
import {
  useTheme,
  IconButton,
  Chip,
  PaletteColor,
  TableRow,
  TableCell,
  styled,
  alpha,
  Box,
} from "@mui/material";
import { StyledAutocomplete } from "../../../../utils/lib";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { IoTrashOutline } from "react-icons/io5";
import { LuPackage, LuClock } from "react-icons/lu";
import CustomTextField from "../../../atoms/ModernComponents/CustomTextField";

// Styled table row
const StyledTableRow = styled(TableRow)(({ theme }) => ({
  transition: "all 0.2s ease",
  "&:hover": {
    backgroundColor: alpha(theme.palette.primary.main, 0.03),
  },
  "&:not(:last-child)": {
    borderBottom: `1px solid ${theme.palette.grey[100]}`,
  },
}));

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  padding: "10px 12px",
  fontSize: "0.85rem",
  verticalAlign: "middle",
  borderBottom: "none",
}));

const ActionCell = styled(StyledTableCell)(() => ({
  width: 60,
  textAlign: "center",
}));

interface GeneralItemInfoProps {
  formData: Record<string, any>;
  handleInputChange: (name: string, value: any) => void;
  index: number;
  onRemove: (id: string) => void;
}

const formFieldConfig = [
  {
    name: "category",
    label: "Category",
    type: "dropdown",
    options: ["Electronics", "Furniture", "Stationery"],
    placeholder: "Category",
    width: 140,
  },
  {
    name: "item",
    label: "Item",
    type: "dropdown",
    options: ["Laptop", "Chair", "Pen"],
    placeholder: "Select Item",
    width: 200,
  },
  {
    name: "quantityRequired",
    label: "Qty",
    type: "number",
    placeholder: "0",
    width: 100,
  },
  {
    name: "lastPurchaseRate",
    label: "Rate",
    type: "number",
    placeholder: "0",
    width: 100,
  },
  {
    name: "uom",
    label: "UOM",
    type: "dropdown",
    options: ["Pieces", "Boxes", "Kg"],
    placeholder: "UOM",
    width: 80,
  },
  { name: "requiredDate", label: "Date", type: "date", width: 140 },
  {
    name: "totalEstimatedCost",
    label: "Cost",
    type: "number",
    placeholder: "0.00",
    width: 120,
  },
];

const chipConfig = [
  {
    field: "currentStock",
    label: "Stock",
    color: "success",
    defaultValue: 0,
    icon: LuPackage,
  },
  {
    field: "pendingQty",
    label: "Pending",
    color: "warning",
    defaultValue: 0,
    icon: LuClock,
  },
];

const IndentItemDetails: React.FC<GeneralItemInfoProps> = ({
  formData,
  handleInputChange,
  index,
  onRemove,
}) => {
  const theme = useTheme();

  const renderField = (fieldConfig: any) => {
    const { name, type, options, placeholder } = fieldConfig;
    const value = formData[name];

    const commonSx = {
      "& .MuiOutlinedInput-root": {
        height: "36px",
        fontSize: "0.85rem",
        backgroundColor: "white",
        "&:hover": {
          backgroundColor: alpha(theme.palette.primary.main, 0.02),
        },
      },
    };

    if (type === "dropdown") {
      return (
        <StyledAutocomplete
          disablePortal
          options={options || []}
          value={value || null}
          onChange={(_, newValue) => handleInputChange(name, newValue || "")}
          size="small"
          renderInput={(params) => (
            <CustomTextField
              {...params}
              variant="outlined"
              size="small"
              placeholder={placeholder}
              sx={commonSx}
            />
          )}
        />
      );
    }

    if (type === "number" || type === "text") {
      return (
        <CustomTextField
          fullWidth
          variant="outlined"
          size="small"
          type={type}
          value={value || ""}
          onChange={(e) => handleInputChange(name, e.target.value)}
          placeholder={placeholder}
          sx={commonSx}
        />
      );
    }

    if (type === "date") {
      return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            slotProps={{
              textField: {
                fullWidth: true,
                size: "small",
                sx: commonSx,
              },
            }}
            format="MM-DD-YYYY"
            value={value || null}
            onChange={(value) => handleInputChange(name, value)}
          />
        </LocalizationProvider>
      );
    }

    return null;
  };

  const renderChips = () => (
    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
      {chipConfig.map(({ field, label, color, defaultValue, icon: Icon }) => {
        const val = formData[field] || defaultValue;
        const paletteColor = theme.palette[
          color as keyof typeof theme.palette
        ] as PaletteColor;
        return (
          <Chip
            key={field}
            icon={<Icon size={12} />}
            label={`${label}: ${val}`}
            size="small"
            variant="outlined"
            sx={{
              fontSize: "0.7rem",
              height: "24px",
              color: paletteColor?.main,
              borderColor: paletteColor?.main,
              backgroundColor: alpha(paletteColor?.main, 0.08),
              "& .MuiChip-icon": { color: "inherit" },
            }}
          />
        );
      })}
    </Box>
  );

  return (
    <StyledTableRow>
      <StyledTableCell
        sx={{
          textAlign: "center",
          fontWeight: 600,
          color: theme.palette.primary.main,
        }}
      >
        {index + 1}
      </StyledTableCell>

      <StyledTableCell>{renderField(formFieldConfig[0])}</StyledTableCell>
      <StyledTableCell>{renderField(formFieldConfig[1])}</StyledTableCell>
      <StyledTableCell align="center" sx={{ width: formFieldConfig[2].width }}>
        {renderField(formFieldConfig[2])}
      </StyledTableCell>
      <StyledTableCell align="center" sx={{ width: formFieldConfig[3].width }}>
        {renderField(formFieldConfig[3])}
      </StyledTableCell>
      <StyledTableCell align="center">
        {renderField(formFieldConfig[4])}
      </StyledTableCell>
      <StyledTableCell>{renderField(formFieldConfig[5])}</StyledTableCell>
      <StyledTableCell>{renderField(formFieldConfig[6])}</StyledTableCell>

      <StyledTableCell>{renderChips()}</StyledTableCell>

      <ActionCell>
        <IconButton
          onClick={() => onRemove(formData.id)}
          size="small"
          sx={{
            color: theme.palette.error.main,
            backgroundColor: alpha(theme.palette.error.main, 0.1),
            "&:hover": {
              backgroundColor: alpha(theme.palette.error.main, 0.2),
            },
          }}
        >
          <IoTrashOutline size={16} />
        </IconButton>
      </ActionCell>
    </StyledTableRow>
  );
};

export default IndentItemDetails;
