import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Checkbox,
  FormControl,
  FormControlLabel,
  Grid,
  TextField,
  useTheme,
  IconButton,
  Paper,
  Stack,
  Avatar,
} from "@mui/material";
import { MuiButton, MuiText } from "bsoft-base-elements";
import { StyledAutocomplete } from "../../../../utils/lib";
import { FieldConfig } from "../PartyMaster/GeneralPartyInfo";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { RiDeleteBin6Line } from "react-icons/ri";
import CustomTextField from "../../../atoms/ModernComponents/CustomTextField";
import dayjs from "dayjs";

interface UOMConversionRow {
  baseUom: string;
  convUom: string;
  convRate: string;
  id?: string;
  convUomId?: string;
}

interface UOMConversionForm {
  baseUom: string;
  convUom: any | null;
  convRate: string;
}

interface GeneralItemInfoProps {
  formData: Record<string, any>;
  handleInputChange: (name: string, value: any) => void;
  GeneralInfoMisc: any[];
  uomConversionForm: UOMConversionForm;
  setUomConversionForm: React.Dispatch<React.SetStateAction<UOMConversionForm>>;
  uomConversionRows: UOMConversionRow[];
  setUomConversionRows: React.Dispatch<
    React.SetStateAction<UOMConversionRow[]>
  >;
  DeleteImage: () => void;
  errors: string[];
  itemId: string;
}

const checkboxFields: FieldConfig[] = [
  { name: "isStockItem", label: "Is Stock Item?", field: "checkbox" },
  { name: "maintainStock", label: "Maintain Stock?", field: "checkbox" },
  { name: "hasVariants", label: "Has Variants?", field: "checkbox" },
];

const GeneralItemInfo: React.FC<GeneralItemInfoProps> = ({
  formData,
  handleInputChange,
  GeneralInfoMisc,
  uomConversionForm,
  setUomConversionForm,
  uomConversionRows,
  setUomConversionRows,
  DeleteImage,
  errors,
  itemId,
}) => {
  const theme = useTheme();
  const [preview, setPreview] = useState<string | null>(null);
  useEffect(() => {
    if (formData.itemImage instanceof File) {
      const objectUrl = URL.createObjectURL(formData.itemImage);
      setPreview(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    } else if (typeof formData.itemImage === "string") {
      const base64String = formData.itemImageBase;
      if (base64String) {
        const formattedBase64 = base64String.startsWith("data:image")
          ? base64String
          : `data:image/png;base64,${base64String}`;
        setPreview(formattedBase64);
      } else {
        setPreview(formData.itemImage);
      }
    } else {
      setPreview(null);
    }
  }, [formData.itemImage, formData.itemImageBase]);

  useEffect(() => {
    if (formData.uomConversions && Array.isArray(formData.uomConversions)) {
      const rowsWithIds = formData.uomConversions.map(
        (row: UOMConversionRow, index: number) => ({
          ...row,
          id: row.id || `uom-${Date.now()}-${index}`,
        })
      );
      setUomConversionRows(rowsWithIds);
    }
  }, [formData.uomConversions]);

  const uomOptions = GeneralInfoMisc?.at(5) || [];

  const customerGroupFields: FieldConfig[] = [
    {
      name: "itemCode",
      label: "Item Code",
      field: "input",
      isDisable: true,
    },
    {
      name: "itemName",
      label: "Item Name",
      field: "input",
      isRequired: true,
      error: errors.includes("itemName"),
    },
    {
      name: "hsnCode",
      label: "HSN Code",
      field: "dropdown",
      options: GeneralInfoMisc?.at(2),
      optionLabel: ["hsnCode", "hsnDescription"],
      isRequired: true,
      error: errors.includes("hsnCode"),
    },
    {
      name: "itemGroup",
      label: "Item Group",
      field: "dropdown",
      options: GeneralInfoMisc?.at(3),
      optionLabel: ["itemGroupName"],
      isRequired: true,
      error: errors.includes("itemGroup"),
    },
    {
      name: "itemCategory",
      label: "Item Category",
      field: "dropdown",
      options: GeneralInfoMisc?.at(4),
      optionLabel: ["itemCategoryName"],
      isRequired: true,
      error: errors.includes("itemCategory"),
    },
    {
      name: "defaultUom",
      label: "Default UOM",
      field: "dropdown",
      options: GeneralInfoMisc?.at(5),
      optionLabel: ["uomName"],
      isRequired: true,
      error: errors.includes("defaultUom"),
    },
    {
      name: "itemClassification",
      label: "Item Classification",
      field: "dropdown",
      options: GeneralInfoMisc?.at(0),
      optionLabel: ["code"],
      isRequired: true,
      error: errors.includes("itemClassification"),
    },
    { name: "description", label: "Description", field: "input" },
    { name: "validFrom", label: "Valid From", field: "picker" },
    {
      name: "materialStatus",
      label: "X-plant Material Status",
      field: "dropdown",
      options: GeneralInfoMisc?.at(1),
      optionLabel: ["code"],
    },
    {
      name: "unit",
      label: "Unit",
      field: "dropdown",
      options: GeneralInfoMisc?.at(6),
      optionLabel: ["unitName"],
    },
  ];

  const headerStyle = {
    mb: 1,
    fontWeight: 500,
    color: theme.palette.text.primary,
    fontSize: "0.875rem",
  };

  const handleConvUomChange = useCallback((value: any | null) => {
    setUomConversionForm((prev) => ({ ...prev, convUom: value }));
  }, []);

  const handleBaseUomChange = useCallback((value: string) => {
    setUomConversionForm((prev) => ({ ...prev, baseUom: value }));
  }, []);

  const handleConvRateChange = useCallback((value: string) => {
    if (value === "" || (/^\d*\.?\d*$/.test(value) && parseFloat(value) >= 0)) {
      setUomConversionForm((prev) => ({ ...prev, convRate: value }));
    }
  }, []);

  const isUomFormValid = useCallback(() => {
    const { convUom, convRate } = uomConversionForm;

    if (!convUom || !convRate.trim()) {
      return false;
    }

    const rate = parseFloat(convRate);
    if (isNaN(rate) || rate <= 0) {
      return false;
    }

    const isDuplicate = uomConversionRows.some(
      (row) =>
       typeof row.convUom === "string" && row.convUom.toLowerCase() === (convUom.uomName || convUom).toLowerCase()
    );

    return !isDuplicate;
  }, [uomConversionForm, uomConversionRows]);

  // ---------------- IMAGE HANDLER ----------------

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        alert("Only image files are allowed!");
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        alert("Image must be smaller than 2MB!");
        return;
      }
      handleInputChange("itemImage", file);
    }
  };

  const handleRemoveImage = () => {
    DeleteImage();
    setPreview(null);
  };

  const handleAddUomConversion = useCallback(() => {
    if (!isUomFormValid()) {
      return;
    }

    if (!uomConversionForm.convUom) {
      console.warn("Please select a Conversion UOM before adding.");
      return;
    }

    const convUomValue =
      typeof uomConversionForm.convUom === "object"
        ? uomConversionForm.convUom.uomName
        : (uomConversionForm.convUom as string);

    const convUomId =
      typeof uomConversionForm.convUom === "object"
        ? uomConversionForm.convUom.id
        : undefined;

    const newRow: UOMConversionRow = {
      id: `uom-${Date.now()}-${Math.random()}`,
      baseUom: uomConversionForm.baseUom.trim(),
      convUom: convUomValue,
      convUomId: convUomId,
      convRate: parseFloat(uomConversionForm.convRate).toString(),
    };

    const updatedRows = [...uomConversionRows, newRow];
    setUomConversionRows(updatedRows);
    handleInputChange("uomConversions", updatedRows);

    // Reset form
    setUomConversionForm({ baseUom: "", convUom: null, convRate: "" });
  }, [uomConversionForm, uomConversionRows, handleInputChange, isUomFormValid]);

  const handleDeleteUomConversion = useCallback(
    (id: string) => () => {
      const updatedRows = uomConversionRows.filter((row) => row.id !== id);
      setUomConversionRows(updatedRows);
      handleInputChange("uomConversions", updatedRows);
    },
    [uomConversionRows, handleInputChange]
  );

  const handleUomFormKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
      if (e?.key === "Enter") {
        e.preventDefault();
        if (isUomFormValid()) {
          handleAddUomConversion();
        }
      }
    },
    [isUomFormValid, handleAddUomConversion]
  );

  const renderField = (
    {
      name,
      label,
      type,
      isRequired,
      field = "input",
      options,
      optionLabel,
      isDisable,
      error,
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
              disabled={isDisable}
              value={value || ""}
              onChange={onChange}
              error={error}
              helperText={error && `please enter valid ${label}`}
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
                <CustomTextField
                  {...params}
                  variant="outlined"
                  size="small"
                  error={error}
                  helperText={error && `Please Enter Valid ${label}`}
                />
              )}
            />
          </FormControl>
        )}

        {field === "picker" && (
          <>
            <MuiText variant="body2" sx={headerStyle}>
              {label}
              {isRequired && (
                <span style={{ color: theme.palette.error.main }}>*</span>
              )}
            </MuiText>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                value={value || null}
                minDate={dayjs(new Date())}
                onChange={(newValue) => onChange(newValue)}
                format="DD-MM-YYYY"
                slots={{
                  textField: (params) => (
                    <CustomTextField
                      {...params}
                      fullWidth
                      size="small"
                      placeholder=""
                    />
                  ),
                }}
              />
            </LocalizationProvider>
          </>
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
      <Stack direction="row" spacing={3} sx={{ mt: 2 }}>
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
            sx={{ m: 0, mr: 3 }}
          />
        ))}
      </Stack>
    </Grid>
  );

  const renderUomConversionSection = () => (
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
        <MuiText sx={{ mb: 2, fontWeight: 600 }}>UOM Conversions</MuiText>

        <Grid container spacing={2} alignItems="flex-end">
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <MuiText variant="body2" sx={headerStyle}>
                Base UOM
              </MuiText>
              <CustomTextField
                fullWidth
                variant="outlined"
                size="small"
                disabled={true}
                value={formData?.defaultUom?.uomName}
                onChange={handleBaseUomChange}
                onKeyPress={handleUomFormKeyPress}
              />
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <MuiText variant="body2" sx={headerStyle}>
                Conversion UOM
              </MuiText>
              <StyledAutocomplete
                disablePortal
                options={uomOptions}
                getOptionLabel={(option: any) =>
                  option?.uomName || option?.name || option?.toString() || ""
                }
                value={uomConversionForm.convUom}
                onChange={(event, newValue) => handleConvUomChange(newValue)}
                isOptionEqualToValue={(option: any, value: any) =>
                  option?.id === value?.id
                }
                renderInput={(params) => (
                  <CustomTextField
                    {...params}
                    variant="outlined"
                    size="small"
                    placeholder="Select conversion UOM"
                  />
                )}
              />
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <MuiText variant="body2" sx={headerStyle}>
                Conversion Rate
              </MuiText>
              <CustomTextField
                type="number"
                fullWidth
                variant="outlined"
                size="small"
                value={uomConversionForm.convRate}
                onChange={handleConvRateChange}
                onKeyPress={handleUomFormKeyPress}
                inputProps={{
                  step: "0.01",
                  min: "0.01",
                  style: { appearance: "textfield" },
                }}
                placeholder="Enter rate"
                sx={{
                  "& input[type=number]::-webkit-outer-spin-button": {
                    "-webkit-appearance": "none",
                    margin: 0,
                  },
                  "& input[type=number]::-webkit-inner-spin-button": {
                    "-webkit-appearance": "none",
                    margin: 0,
                  },
                }}
              />
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={3} sx={{ mt: { xs: 2, md: 0 } }}>
            <MuiButton
              variant="contained"
              sx={{
                borderRadius: "6px !important",
                minWidth: 100,
                height: "40px",
                fontWeight: 500,
              }}
              onClick={handleAddUomConversion}
              disabled={!isUomFormValid()}
            >
              Add
            </MuiButton>
          </Grid>
        </Grid>

        {uomConversionRows.length > 0 && (
          <Grid container spacing={2} sx={{ mt: 2 }}>
            <Grid item xs={12}>
              <MuiText variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                Added Conversions ({uomConversionRows.length})
              </MuiText>
            </Grid>
            {uomConversionRows.map((row: any) => (
              <Grid item xs={12} key={row.id}>
                <Paper
                  elevation={1}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    p: 1.5,
                    gap: 2,
                    flexWrap: "wrap",
                    "&:hover": {
                      boxShadow: 2,
                    },
                  }}
                >
                  <MuiText
                    sx={{
                      flex: "1 1 180px",
                      minWidth: 120,
                      fontSize: "0.9rem",
                    }}
                  >
                    <strong>Base UOM:</strong> {formData?.defaultUom?.uomName}
                  </MuiText>
                  <MuiText
                    sx={{
                      flex: "1 1 180px",
                      minWidth: 120,
                      fontSize: "0.9rem",
                    }}
                  >
                    <strong>Conversion UOM:</strong>{" "}
                    {row?.convUom?.uomName || row?.convUom || "-"}
                  </MuiText>
                  <MuiText
                    sx={{
                      flex: "1 1 180px",
                      minWidth: 120,
                      fontSize: "0.9rem",
                    }}
                  >
                    <strong>Rate:</strong> {parseFloat(row.convRate).toFixed(2)}
                  </MuiText>
                  <IconButton
                    onClick={handleDeleteUomConversion(row.id!)}
                    color="error"
                    size="small"
                    sx={{ ml: "auto" }}
                    title="Delete conversion"
                  >
                    <RiDeleteBin6Line color="red" size={20} />
                  </IconButton>
                </Paper>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </Grid>
  );

  const renderImageUpload = () => (
    <Grid item xs={12} sm={6} md={3}>
      <MuiText variant="body2" sx={headerStyle}>
        Item Image
      </MuiText>

      {!preview ? (
        <Box
          component="label"
          sx={{
            border: "2px dashed",
            borderColor: theme.palette.grey[400],
            borderRadius: 2,
            p: 3,
            textAlign: "center",
            cursor: "pointer",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            "&:hover": {
              borderColor: theme.palette.primary.main,
              bgcolor: theme.palette.action.hover,
            },
          }}
        >
          <MuiText variant="body2" sx={{ fontWeight: 500 }}>
            Click or Drag & Drop
          </MuiText>
          <MuiText variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            PNG, JPG (Max 2MB)
          </MuiText>

          <input
            type="file"
            hidden
            accept="image/*"
            onChange={handleImageChange}
          />
        </Box>
      ) : (
        <Paper
          variant="outlined"
          sx={{
            p: 2,
            borderRadius: 2,
            display: "flex",
            alignItems: "center",
            gap: 2,
            bgcolor: "#fafafa",
            "&:hover": { boxShadow: 2 },
          }}
        >
          <Avatar
            src={preview}
            alt="Item Preview"
            sx={{ width: 56, height: 56, borderRadius: 2 }}
          />
          <Box flexGrow={1}>
            <MuiText
              variant="body2"
              sx={{
                fontWeight: 500,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {formData?.itemImage?.name || "Uploaded Image"}
            </MuiText>
            <MuiText variant="caption" color="text.secondary">
              {formData?.itemImage?.size
                ? `${(formData.itemImage.size / 1024).toFixed(1)} KB`
                : ""}
            </MuiText>
          </Box>
          <IconButton onClick={handleRemoveImage} color="error">
            <RiDeleteBin6Line />
          </IconButton>
        </Paper>
      )}
    </Grid>
  );

  const renderFields = (fields: FieldConfig[]) => (
    <Grid container spacing={2} pr={2}>
      {fields.map((fieldConfig, idx) =>
        renderField(
          fieldConfig,
          formData[fieldConfig.name],
          (value) => handleInputChange(fieldConfig.name, value),
          idx
        )
      )}
      {renderImageUpload()}
      {renderCheckboxFields(checkboxFields, formData, handleInputChange)}
      {renderUomConversionSection()}
    </Grid>
  );

  return (
    <Box>
      {renderFields(
        itemId ? customerGroupFields : customerGroupFields.slice(1)
      )}
    </Box>
  );
};

export default GeneralItemInfo;
