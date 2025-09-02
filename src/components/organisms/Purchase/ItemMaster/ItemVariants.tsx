"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Grid,
  FormControl,
  Paper,
  useTheme,
  IconButton,
} from "@mui/material";
import { MuiText, MuiButton } from "bsoft-base-elements";
import { StyledAutocomplete } from "../../../atoms/ModernComponents/CustomAutocomplete";
import CustomTextField from "../../../atoms/ModernComponents/CustomTextField";
import { RiDeleteBin6Line } from "react-icons/ri";

interface VariantRow {
  id?: string;
  attributes: string;
  value: string;
}

interface VariantForm {
  attributes: any | null;
  value: string;
}

interface ItemVariantsProps {
  VariantMisc: any[];
  formData?: Record<string, any>;
  handleInputChange?: (name: string, value: any) => void;
  variantForm: VariantForm;
  setVariantForm: React.Dispatch<React.SetStateAction<VariantForm>>;
  variants: VariantRow[];
  setVariants: React.Dispatch<React.SetStateAction<VariantRow[]>>;
}

const ItemVariants: React.FC<ItemVariantsProps> = ({
  VariantMisc,
  formData,
  handleInputChange,
  variantForm,
  setVariantForm,
  variants,
  setVariants,
}) => {
  const theme = useTheme();

  useEffect(() => {
    if (formData?.itemVariants && Array.isArray(formData.itemVariants)) {
      const withIds = formData.itemVariants.map((row: VariantRow, idx) => ({
        ...row,
        id: row.id || `variant-${Date.now()}-${idx}`,
      }));
      setVariants(withIds);
    }
  }, [formData?.itemVariants, setVariants]);

  const variantBasedOnOptions = VariantMisc?.at(0) || [];
  const attributeGroupOptions = VariantMisc?.at(1) || [];
  const attributesOption = VariantMisc?.at(2) || [];

  const headerStyle = {
    mb: 1,
    fontWeight: 500,
    color: theme.palette.text.primary,
    fontSize: "0.875rem",
  };

  const getAttrLabel = useCallback((attr: any) => {
    if (!attr) return "";
    return (
      attr.code ||
      attr.name ||
      attr.label ||
      attr.description ||
      attr.toString() ||
      ""
    );
  }, []);

  const handleVariantFormChange = useCallback(
    (key: keyof VariantForm, value: any) => {
      setVariantForm((prev) => ({ ...prev, [key]: value }));
    },
    [setVariantForm]
  );

  const isVariantFormValid = useCallback(() => {
    return !!variantForm.attributes && !!variantForm.value?.trim();
  }, [variantForm]);

  const selectedAttrLabels = new Set(variants.map((r) => r.attributes));
  const attributesOptionFiltered = (attributesOption || []).filter(
    (opt: any) => {
      const lbl = getAttrLabel(opt);
      return lbl && !selectedAttrLabels.has(lbl);
    }
  );

  const handleVariantAdd = useCallback(() => {
    if (!isVariantFormValid()) return;

    const attrLabel = getAttrLabel(variantForm.attributes);

    if (variants.some((r) => r.attributes === attrLabel)) {
      return;
    }

    const newRow: VariantRow = {
      id: variantForm?.attributes?.id || "",
      attributes: attrLabel || "",
      value: variantForm.value.trim(),
    };

    const updated = [...variants, newRow];
    setVariants(updated);
    handleInputChange?.("itemVariants", updated);

    setVariantForm({ attributes: null, value: "" });
  }, [
    isVariantFormValid,
    getAttrLabel,
    variantForm,
    variants,
    setVariants,
    handleInputChange,
    setVariantForm,
  ]);

  const handleDeleteVariant = useCallback(
    (id: string) => () => {
      const updated = variants.filter((row) => row.id !== id);
      setVariants(updated);
      handleInputChange?.("itemVariants", updated);
    },
    [variants, setVariants, handleInputChange]
  );

  const handleVariantFormKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
      if (e?.key === "Enter" && isVariantFormValid()) {
        e.preventDefault();
        handleVariantAdd();
      }
    },
    [handleVariantAdd, isVariantFormValid]
  );

  return (
    <Box>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth>
            <MuiText variant="body2" sx={headerStyle}>
              Variant Based On
            </MuiText>
            <StyledAutocomplete
              disablePortal
              options={variantBasedOnOptions}
              getOptionLabel={(option: any) => {
                if (!option) return "";
                return option?.code || option?.name || option?.toString() || "";
              }}
              value={formData?.variantBasedOn || null}
              onChange={(_, newValue) =>
                handleInputChange?.("variantBasedOn", newValue || "")
              }
              isOptionEqualToValue={(option, value) => {
                if (!option || !value) return option === value;
                return (option?.code || option) === (value?.code || value);
              }}
              renderInput={(params) => (
                <CustomTextField {...params} variant="outlined" size="small" />
              )}
            />
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth>
            <MuiText variant="body2" sx={headerStyle}>
              Attribute Group
            </MuiText>
            <StyledAutocomplete
              disablePortal
              options={attributeGroupOptions}
              getOptionLabel={(option: any) => {
                if (!option) return "";
                return option?.description || option?.toString() || "";
              }}
              value={formData?.attributeGroup || null}
              onChange={(_, newValue) =>
                handleInputChange?.("attributeGroup", newValue || "")
              }
              isOptionEqualToValue={(option, value) => {
                if (!option || !value) return option === value;
                return (option?.code || option) === (value?.code || value);
              }}
              renderInput={(params) => (
                <CustomTextField {...params} variant="outlined" size="small" />
              )}
            />
          </FormControl>
        </Grid>

        <Grid item xs={12}>
          <Box
            bgcolor="#fafafa"
            p={3}
            borderRadius={1}
            sx={{
              mt: 2,
              "& .MuiOutlinedInput-root": {
                height: "40px",
                fontSize: "0.875rem",
                background: "#fff",
              },
            }}
          >
            <MuiText sx={{ mb: 2, fontWeight: 600 }}>Variants</MuiText>

            <Grid container spacing={2} alignItems="flex-end">
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth>
                  <MuiText variant="body2" sx={headerStyle}>
                    Attributes
                  </MuiText>
                  <StyledAutocomplete
                    disablePortal
                    options={attributesOptionFiltered}
                    getOptionLabel={(option: any) => getAttrLabel(option)}
                    value={variantForm.attributes}
                    onChange={(_, val: any) =>
                      handleVariantFormChange("attributes", val)
                    }
                    isOptionEqualToValue={(opt, val) => {
                      if (!opt || !val) return opt === val;
                      return getAttrLabel(opt) === getAttrLabel(val);
                    }}
                    renderInput={(params) => (
                      <CustomTextField
                        {...params}
                        variant="outlined"
                        size="small"
                        onKeyPress={handleVariantFormKeyPress}
                      />
                    )}
                  />
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth>
                  <MuiText variant="body2" sx={headerStyle}>
                    Value
                  </MuiText>
                  <CustomTextField
                    fullWidth
                    variant="outlined"
                    size="small"
                    value={variantForm.value}
                    onChange={(value) =>
                      handleVariantFormChange("value", value)
                    }
                    onKeyPress={handleVariantFormKeyPress}
                  />
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <MuiButton
                  variant="contained"
                  sx={{
                    borderRadius: "6px !important",
                    minWidth: 100,
                    height: "40px",
                    fontWeight: 500,
                  }}
                  onClick={handleVariantAdd}
                  disabled={!isVariantFormValid()}
                >
                  Add
                </MuiButton>
              </Grid>
            </Grid>

            {variants.length > 0 && (
              <>
                <MuiText variant="body1" sx={{ mt: 3, mb: 2, fontWeight: 500 }}>
                  Added Variants ({variants.length})
                </MuiText>
                <Grid container spacing={2}>
                  {variants.map((row) => (
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
                          <b>Attribute:</b> {row.attributes}
                        </MuiText>
                        <MuiText
                          sx={{
                            flex: "1 1 200px",
                            minWidth: 150,
                            fontSize: "0.9rem",
                          }}
                        >
                          <b>Value:</b> {row.value}
                        </MuiText>
                        <IconButton
                          onClick={handleDeleteVariant(row.id!)}
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
      </Grid>
    </Box>
  );
};

export default ItemVariants;
