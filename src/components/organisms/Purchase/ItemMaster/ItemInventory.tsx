import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Checkbox,
  FormControl,
  FormControlLabel,
  Grid,
  useTheme,
  IconButton,
  Paper,
  Stack,
} from "@mui/material";
import { MuiButton, MuiText } from "bsoft-base-elements";
import { StyledAutocomplete } from "../../../../utils/lib";
import { FieldConfig } from "../PartyMaster/GeneralPartyInfo";
import { RiDeleteBin6Line } from "react-icons/ri";
import CustomTextField from "../../../atoms/ModernComponents/CustomTextField";

type InventoryAttributeRow = {
  id?: string;
  unit: string;
  type: string;
  typeName?: string;
  unitName?: string;
};

interface InventoryAttributeForm {
  unit: any | null;
  type: any | null;
}

interface ItemInventoryProps {
  formData: Record<string, any>;
  handleInputChange: (name: string, value: any) => void;
  InventoryMisc: any[];
  attrForm: InventoryAttributeForm;
  setAttrForm: React.Dispatch<React.SetStateAction<InventoryAttributeForm>>;
  attrRows: InventoryAttributeRow[];
  setAttrRows: React.Dispatch<React.SetStateAction<InventoryAttributeRow[]>>;
}

const checkboxFields: FieldConfig[] = [
  {
    name: "allowNegativeStock",
    label: "Allow Negative Stock",
    field: "checkbox",
  },
  { name: "batchManagement", label: "Batch Management", field: "checkbox" },
];

const ItemInventory: React.FC<ItemInventoryProps> = ({
  formData,
  handleInputChange,
  InventoryMisc,
  attrForm,
  setAttrForm,
  attrRows,
  setAttrRows,
}) => {
  const theme = useTheme();

  useEffect(() => {
    if (
      formData.inventoryAttributes &&
      Array.isArray(formData.inventoryAttributes)
    ) {
      const rowsWithIds = formData.inventoryAttributes.map(
        (row: InventoryAttributeRow, index: number) => ({
          ...row,
          id: row.id || `attr-${Date.now()}-${index}`,
        })
      );
      setAttrRows(rowsWithIds);
    }
  }, [formData.inventoryAttributes]);

  const materialRequestTypeOptions = InventoryMisc?.at(0) || [];
  const valuationMethodOptions = InventoryMisc?.at(1) || [];
  const requestTypeOptions = InventoryMisc?.at(2) || [];
  const manufactureTypeOptions = InventoryMisc?.at(3) || [];
  const unitOptions = InventoryMisc?.at(4) || [];
  const uomOptions = InventoryMisc?.at(5) || [];

  const customerGroupFields: FieldConfig[] = [
    { name: "weight", label: "Weight", field: "input", type: "number" },
    {
      name: "weightUom",
      label: "Weight UOM",
      field: "dropdown",
      options: uomOptions,
      optionLabel: ["uomName"],
    },
    {
      name: "defaultMaterialRequestType",
      label: "Default Material Request Type",
      field: "dropdown",
      options: materialRequestTypeOptions,
      optionLabel: ["code"],
    },
    {
      name: "valuationMethod",
      label: "Valuation Method",
      field: "dropdown",
      options: valuationMethodOptions,
      optionLabel: ["code"],
    },
    {
      name: "shelfLife",
      label: "Shelf Life (Days)",
      field: "input",
      type: "number",
    },
    {
      name: "upperTolerance",
      label: "Upper Tolerance %",
      field: "input",
      type: "number",
    },
    {
      name: "lowerTolerance",
      label: "Lower Tolerance %",
      field: "input",
      type: "number",
    },
    {
      name: "reorderQty",
      label: "Re-order Quantity",
      field: "input",
      type: "number",
    },
    {
      name: "requestType",
      label: "Request Type",
      field: "dropdown",
      options: requestTypeOptions,
      optionLabel: ["code"],
    },
  ];

  const headerStyle = {
    mb: 1,
    fontWeight: 500,
    color: theme.palette.text.primary,
    fontSize: "0.875rem",
  };

  const handleAttrFormChange = useCallback(
    (field: keyof InventoryAttributeForm, value: any) => {
      setAttrForm((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const isAttrFormValid = useCallback(() => {
    return attrForm.unit && attrForm.type;
  }, [attrForm]);

  const handleAttrAdd = useCallback(() => {
    if (!isAttrFormValid()) {
      return;
    }

    const unitName =
      typeof attrForm.unit === "object"
        ? attrForm.unit?.unitName ||
          attrForm.unit?.name ||
          attrForm.unit?.toString()
        : attrForm.unit?.toString();

    const typeName =
      typeof attrForm.type === "object"
        ? attrForm.type?.code ||
          attrForm.type?.name ||
          attrForm.type?.toString()
        : attrForm.type?.toString();

    const newRow: InventoryAttributeRow = {
      id: `attr-${Date.now()}-${Math.random()}`,
      unit: attrForm.unit?.unitId || "",
      type: attrForm.type?.id || "",
      typeName: typeName || "",
      unitName: unitName || "",
    };

    const updatedRows = [...attrRows, newRow];
    setAttrRows(updatedRows);
    handleInputChange("inventoryAttributes", updatedRows);

    setAttrForm({ unit: null, type: null });
  }, [attrForm, attrRows, handleInputChange, isAttrFormValid]);

  const handleAttrDelete = useCallback(
    (id: string) => () => {
      const updatedRows = attrRows.filter((row) => row.id !== id);
      setAttrRows(updatedRows);
      handleInputChange("inventoryAttributes", updatedRows);
    },
    [attrRows, handleInputChange]
  );

  const handleAttrFormKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
      if (e?.key === "Enter") {
        e.preventDefault();
        if (isAttrFormValid()) {
          handleAttrAdd();
        }
      }
    },
    [isAttrFormValid, handleAttrAdd]
  );

  function GetField(): FieldConfig[] {
    const a: FieldConfig[] = [
      {
        name: "batchNumberSeries",
        label: "Batch Number Series",
        field: "input",
        type: "number",
      },
      {
        name: "serialNumberSeries",
        label: "Serial Number Series",
        field: "input",
        type: "number",
      },
      {
        name: "reorderLevel",
        label: "Re-order Level",
        field: "input",
        type: "number",
      },
    ];
    if (formData?.batchManagement) {
      return [...customerGroupFields, ...a];
    }
    return customerGroupFields;
  }

  function GetCheckField(): FieldConfig[] {
    const a: FieldConfig[] = [
      {
        name: "applyBatchNumber",
        label: "Apply Batch Number?",
        field: "checkbox",
      },
    ];
    if (formData?.batchManagement) {
      return [...checkboxFields, ...a];
    }
    return checkboxFields;
  }

  const renderField = (
    {
      name,
      label,
      type,
      isRequired,
      field = "input",
      options,
      optionLabel,
    }: FieldConfig,
    value: any,
    onChange: (value: any) => void,
    idx: number
  ) => {
    if (field === "checkbox") return null;

    return (
      <Grid item xs={12} sm={6} md={3} key={`${name}-${idx}`}>
        {field === "input" && (
          <FormControl fullWidth>
            <MuiText variant="body2" sx={headerStyle}>
              {label}
              {isRequired && (
                <span style={{ color: theme.palette.error.main }}>*</span>
              )}
            </MuiText>
            <CustomTextField
              fullWidth
              variant="outlined"
              size="small"
              type={type || "text"}
              value={value || ""}
              onChange={onChange}
              inputProps={{
                step: type === "number" ? "0.01" : undefined,
                min: type === "number" ? "0" : undefined,
              }}
            />
          </FormControl>
        )}

        {field === "dropdown" && (
          <FormControl fullWidth>
            <MuiText variant="body2" sx={headerStyle}>
              {label}
              {isRequired && (
                <span style={{ color: theme.palette.error.main }}>*</span>
              )}
            </MuiText>
            <StyledAutocomplete
              disablePortal
              options={options || []}
              value={value || null}
              onChange={(event, newValue) => onChange(newValue || "")}
              getOptionLabel={(option: any) => {
                if (!option) return "";
                if (Array.isArray(optionLabel) && optionLabel.length > 0) {
                  const key1 = optionLabel[0];
                  const key2 = optionLabel[1];
                  if (key2) {
                    const val1 = option[key1] ?? "";
                    const val2 = option[key2] ?? "";
                    return val2 ? `${val1} - ${val2}` : val1;
                  }
                  return option[key1] ?? "";
                }
                return typeof option === "string" ? option : "";
              }}
              isOptionEqualToValue={(opt, val) => {
                if (Array.isArray(optionLabel) && optionLabel.length > 0) {
                  const key = optionLabel[0];
                  return (opt as any)[key] === (val as any)[key];
                }
                return opt === val;
              }}
              renderInput={(params) => (
                <CustomTextField {...params} variant="outlined" size="small" />
              )}
            />
          </FormControl>
        )}
      </Grid>
    );
  };

  const renderCheckboxFields = (
    fields: FieldConfig[],
    formData: Record<string, any>,
    handleInputChange: (name: string, value: any) => void
  ) => (
    <Grid item xs={12}>
      <Stack direction="row" spacing={3} sx={{ mt: 2, flexWrap: "wrap" }}>
        {fields.map((f) => (
          <FormControlLabel
            key={f.name}
            control={
              <Checkbox
                checked={formData[f.name] || false}
                onChange={(e) => handleInputChange(f.name, e.target.checked)}
                size="medium"
              />
            }
            label={
              <MuiText variant="body2" sx={{ fontSize: "0.875rem" }}>
                {f.label}
              </MuiText>
            }
            sx={{ m: 0, mr: 3, mb: 1 }}
          />
        ))}
      </Stack>
    </Grid>
  );

  const renderManufacturingSection = () => (
    <Grid item xs={12}>
      <Box
        bgcolor="#fafafa"
        p={3}
        borderRadius={1}
        sx={{
          "& .MuiOutlinedInput-root": {
            height: "40px",
            fontSize: "0.875rem",
            background: "#fff",
          },
        }}
      >
        <MuiText sx={{ mb: 2, fontWeight: 600 }}>
          Manufacturing Attributes
        </MuiText>

        <Grid container spacing={2} alignItems="flex-end">
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <MuiText variant="body2" sx={headerStyle}>
                Unit
              </MuiText>
              <StyledAutocomplete
                disablePortal
                options={unitOptions}
                getOptionLabel={(option: any) => {
                  if (!option) return "";
                  return option?.unitName || option?.toString() || "";
                }}
                value={attrForm.unit}
                onChange={(_, val: any) => handleAttrFormChange("unit", val)}
                isOptionEqualToValue={(option: any, value: any) => {
                  if (!option || !value) return option === value;
                  return (
                    (option?.unitName || option) === (value?.unitName || value)
                  );
                }}
                renderInput={(params) => (
                  <CustomTextField
                    {...params}
                    variant="outlined"
                    size="small"
                    onKeyPress={handleAttrFormKeyPress}
                  />
                )}
              />
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <MuiText variant="body2" sx={headerStyle}>
                Type
              </MuiText>
              <StyledAutocomplete
                disablePortal
                options={manufactureTypeOptions}
                getOptionLabel={(option: any) => {
                  if (!option) return "";
                  return option?.code || option?.toString() || "";
                }}
                value={attrForm.type}
                onChange={(_, val: any) => handleAttrFormChange("type", val)}
                isOptionEqualToValue={(option: any, value: any) => {
                  if (!option || !value) return option === value;
                  return (option?.code || option) === (value?.code || value);
                }}
                renderInput={(params) => (
                  <CustomTextField
                    {...params}
                    variant="outlined"
                    size="small"
                    onKeyPress={handleAttrFormKeyPress}
                  />
                )}
              />
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <MuiButton
              variant="contained"
              sx={{
                borderRadius: "6px !important",
                minWidth: 100,
                height: "40px",
                fontWeight: 500,
              }}
              onClick={handleAttrAdd}
              disabled={!isAttrFormValid()}
            >
              Add
            </MuiButton>
          </Grid>
        </Grid>

        {attrRows.length > 0 && (
          <>
            <MuiText variant="body1" sx={{ mt: 3, mb: 2, fontWeight: 500 }}>
              Added Attributes ({attrRows.length})
            </MuiText>
            <Grid container spacing={2}>
              {attrRows.map((row) => (
                <Grid item xs={12} key={row.id}>
                  <Paper
                    elevation={1}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      p: 1.5,
                      gap: 2,
                      flexWrap: "wrap",
                    }}
                  >
                    <MuiText
                      sx={{
                        flex: "1 1 200px",
                        minWidth: 150,
                        fontSize: "0.9rem",
                      }}
                    >
                      <b>Unit:</b> {row.unitName}
                    </MuiText>
                    <MuiText
                      sx={{
                        flex: "1 1 200px",
                        minWidth: 150,
                        fontSize: "0.9rem",
                      }}
                    >
                      <b>Type:</b> {row.typeName}
                    </MuiText>
                    <IconButton
                      onClick={handleAttrDelete(row.id!)}
                      color="error"
                      size="small"
                      sx={{ ml: "auto" }}
                    >
                      <RiDeleteBin6Line color="red" size={20} />
                    </IconButton>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </>
        )}
      </Box>
    </Grid>
  );

  const renderFields = (fields: FieldConfig[]) => (
    <Grid container spacing={2}>
      {fields.map((fieldConfig, idx) =>
        renderField(
          fieldConfig,
          formData[fieldConfig.name],
          (value) => handleInputChange(fieldConfig.name, value),
          idx
        )
      )}

      {renderCheckboxFields(GetCheckField(), formData, handleInputChange)}
      {renderManufacturingSection()}
    </Grid>
  );

  return <Box>{renderFields(GetField())}</Box>;
};

export default ItemInventory;
