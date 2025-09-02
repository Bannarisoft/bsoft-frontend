import React, { useEffect, useCallback, useMemo } from "react";
import {
  Box,
  Checkbox,
  FormControl,
  FormControlLabel,
  Grid,
  useTheme,
  IconButton,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from "@mui/material";
import { MuiButton, MuiText } from "bsoft-base-elements";
import { StyledAutocomplete } from "../../../../utils/lib";
import { FieldConfig } from "../PartyMaster/GeneralPartyInfo";
import { RiDeleteBin6Line } from "react-icons/ri";
import CustomTextField from "../../../atoms/ModernComponents/CustomTextField";
import { BiEdit, BiSave } from "react-icons/bi";

type SupplierRow = {
  id?: string;
  supplier: any;
  supplierId?: string | number;
  supplierPartNo: string;
  unit: any;
  unitId?: string | number;
  leadTime?: string;
  moq?: string;
  moqUom?: any;
  packageValue?: string;
  packageUom?: any;
  isDefault?: boolean;
  isEditing?: boolean;
};

type ForeignTradeData = {
  originCountry: any | string;
  tariffNumber: string;
};

interface SupplierForm {
  supplier: any | null;
  supplierPartNo: string;
  unit: any | null;
  leadTime?: string;
  moq?: string;
  moqUom?: any;
  packageValue?: string;
  packageUom?: any;
}

interface PurchaseItemProps {
  formData: Record<string, any>;
  handleInputChange: (name: string, value: any) => void;
  PurchaseMisc: any[];
  supplierForm: SupplierForm;
  setSupplierForm: React.Dispatch<React.SetStateAction<SupplierForm>>;
  supplierRows: SupplierRow[];
  setSupplierRows: React.Dispatch<React.SetStateAction<SupplierRow[]>>;
  foreignTradeData: ForeignTradeData;
  setForeignTradeData: React.Dispatch<React.SetStateAction<ForeignTradeData>>;
}

const PurchaseItem: React.FC<PurchaseItemProps> = ({
  formData,
  handleInputChange,
  PurchaseMisc,
  supplierForm,
  setSupplierForm,
  supplierRows,
  setSupplierRows,
  foreignTradeData,
  setForeignTradeData,
}) => {
  const theme = useTheme();

  const uomOptions = PurchaseMisc?.at(0) || [];
  const unitOptions = PurchaseMisc?.at(1) || [];
  const countryOptions = PurchaseMisc?.at(2) || [];
  const supplierOptions = PurchaseMisc?.at(3) || [];

  useEffect(() => {
    if (Array.isArray(formData.supplierDetails)) {
      const rowsWithIds = formData.supplierDetails.map(
        (row: SupplierRow, index: number) => ({
          ...row,
          id: row.id || `supplier-${Date.now()}-${index}`,
          isEditing: false,
        })
      );
      setSupplierRows(rowsWithIds);
    }
  }, [formData.supplierDetails, setSupplierRows]);

  // preload foreign trade when present
  useEffect(() => {
    if (formData.foreignTradeDetails) {
      setForeignTradeData({
        originCountry: formData.foreignTradeDetails.originCountry || "",
        tariffNumber: formData.foreignTradeDetails.tariffNumber || "",
      });
    }
  }, [formData.foreignTradeDetails, setForeignTradeData]);

  // console.profile("PurchaseItem");

  const purchaseFields: FieldConfig[] = useMemo(
    () => [
      {
        name: "purchaseUom",
        label: "Purchase UOM",
        field: "dropdown",
        options: uomOptions,
        optionLabel: ["uomName"],
      },
      {
        name: "leadTime",
        label: "Lead Time (Days)",
        field: "input",
        type: "number",
      },
      {
        name: "safetyStock",
        label: "Safety Stock",
        field: "input",
        type: "number",
      },
      {
        name: "grProcessingTime",
        label: "GR Processing Time (Days)",
        field: "input",
        type: "number",
      },
      {
        name: "purchaseRate",
        label: "Purchase Rate",
        field: "input",
        type: "number",
      },
      { name: "automaticPO", label: "Automatic PO", field: "checkbox" },
    ],
    [uomOptions]
  );

  const headerStyle = useMemo(
    () => ({
      mb: 1,
      fontWeight: 500,
      color: theme.palette.text.primary,
      fontSize: "0.875rem",
    }),
    [theme]
  );

  const handleSupplierFormChange = useCallback(
    (field: keyof SupplierForm, value: any) =>
      setSupplierForm((prev) => ({ ...prev, [field]: value })),
    [setSupplierForm]
  );

  const handleForeignTradeChange = useCallback(
    (field: keyof ForeignTradeData, value: any) => {
      const updatedData = { ...foreignTradeData, [field]: value };
      setForeignTradeData(updatedData);
      handleInputChange("foreignTradeDetails", updatedData);
    },
    [foreignTradeData, setForeignTradeData, handleInputChange]
  );

  const handleSupplierAdd = useCallback(() => {
    const newRow: SupplierRow = {
      id: `supplier-${Date.now()}-${Math.random()}`,
      supplier: supplierForm.supplier,
      supplierId: supplierForm.supplier?.id || "",
      supplierPartNo: supplierForm.supplierPartNo?.trim() || "",
      unit: supplierForm.unit,
      unitId: supplierForm.unit?.unitId || "",
      leadTime: supplierForm.leadTime || "",
      moq: supplierForm.moq || "",
      moqUom: supplierForm.moqUom || null,
      packageValue: supplierForm.packageValue || "",
      packageUom: supplierForm.packageUom || null,
      isDefault: supplierRows.length === 0, // first add becomes default
      isEditing: false,
    };

    const updatedRows = [...supplierRows, newRow];
    setSupplierRows(updatedRows);
    handleInputChange("supplierDetails", updatedRows);

    setSupplierForm({
      supplier: null,
      supplierPartNo: "",
      unit: null,
      leadTime: "",
      moq: "",
      moqUom: null,
      packageValue: "",
      packageUom: null,
    });
  }, [
    supplierForm,
    supplierRows,
    setSupplierRows,
    handleInputChange,
    setSupplierForm,
  ]);

  const handleSupplierDelete = useCallback(
    (id: string) => {
      const updatedRows = supplierRows.filter((row) => row.id !== id);
      setSupplierRows(updatedRows);
      handleInputChange("supplierDetails", updatedRows);
    },
    [supplierRows, setSupplierRows, handleInputChange]
  );

  const handleEditToggle = useCallback(
    (id: string, save = false) => {
      setSupplierRows((prev) =>
        prev.map((s) =>
          s.id === id ? { ...s, isEditing: save ? false : !s.isEditing } : s
        )
      );
    },
    [setSupplierRows]
  );

  const handleRowChange = useCallback(
    (id: string, field: keyof SupplierRow, value: any) => {
      setSupplierRows((prev) =>
        prev.map((s) => (s.id === id ? { ...s, [field]: value } : s))
      );
    },
    [setSupplierRows]
  );

  const handleDefaultSupplier = useCallback(
    (id: string) => {
      setSupplierRows((prev) =>
        prev.map((s) => ({ ...s, isDefault: s.id === id }))
      );
    },
    [setSupplierRows]
  );

  const labelSupplier = useCallback((opt: any) => {
    if (!opt) return "";
    const name = opt?.partyName ?? opt?.name ?? "";
    const code = opt?.partyCode ?? opt?.code ?? "";
    const label = [name, code].filter(Boolean).join(" - ");
    return String(label);
  }, []);

  const labelUnit = useCallback((opt: any) => {
    if (!opt) return "";
    return String(opt?.unitName ?? opt?.name ?? "");
  }, []);

  const labelUom = useCallback((opt: any) => {
    if (!opt) return "";
    return String(opt?.uomName ?? opt?.name ?? "");
  }, []);

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
    return (
      <FormControl fullWidth key={`${name}-${idx}`}>
        <MuiText variant="body2" sx={headerStyle}>
          {label}
          {isRequired && (
            <span style={{ color: theme.palette.error.main }}>*</span>
          )}
        </MuiText>

        {field === "input" && (
          <CustomTextField
            fullWidth
            variant="outlined"
            size="small"
            type={type || "text"}
            value={value ?? ""}
            onChange={onChange}
          />
        )}

        {field === "checkbox" && (
          <FormControlLabel
            control={
              <Checkbox
                checked={!!value}
                onChange={(e) => onChange(e.target.checked)}
              />
            }
            label={label}
          />
        )}

        {field === "dropdown" && (
          <StyledAutocomplete
            disablePortal
            options={options || []}
            value={value || null}
            getOptionLabel={(option: any) => {
              if (!option) return "";
              if (Array.isArray(optionLabel) && optionLabel.length > 0) {
                return optionLabel
                  .map((key) => option?.[key] ?? "")
                  .filter(Boolean)
                  .join(" - ");
              }
              return String(option ?? "");
            }}
            onChange={(_, newValue) => onChange(newValue || "")}
            renderInput={(params) => (
              <CustomTextField {...params} variant="outlined" size="small" />
            )}
          />
        )}
      </FormControl>
    );
  };

  const renderForeignTradeSection = () => (
    <Grid container spacing={2} p={4}>
      <Grid item xs={12}>
        <MuiText sx={{ mb: 2, fontWeight: 600 }}>Foreign Trade Details</MuiText>
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <FormControl fullWidth>
          <MuiText variant="body2" sx={headerStyle}>
            Origin Country
          </MuiText>
          <StyledAutocomplete
            disablePortal
            options={countryOptions || []}
            value={foreignTradeData.originCountry || null}
            getOptionLabel={(option: any) =>
              option
                ? `${option?.countryName ?? ""} - ${option?.countryCode ?? ""}`
                : ""
            }
            onChange={(_, newValue: any) =>
              handleForeignTradeChange("originCountry", newValue || "")
            }
            renderInput={(params) => (
              <CustomTextField {...params} variant="outlined" size="small" />
            )}
          />
        </FormControl>
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <FormControl fullWidth>
          <MuiText variant="body2" sx={headerStyle}>
            Tariff Number
          </MuiText>
          <CustomTextField
            fullWidth
            variant="outlined"
            size="small"
            value={foreignTradeData.tariffNumber ?? ""}
            onChange={(val) => handleForeignTradeChange("tariffNumber", val)}
          />
        </FormControl>
      </Grid>
    </Grid>
  );

  const renderSupplierSection = () => (
    <Grid item xs={12}>
      <Box bgcolor="#fafafa" p={3} borderRadius={1}>
        <MuiText sx={{ mb: 2, fontWeight: 600 }}>Supplier Details</MuiText>

        <Grid container spacing={2} mb={2}>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <MuiText variant="body2" sx={headerStyle}>
                Supplier
              </MuiText>
              <StyledAutocomplete
                disablePortal
                options={supplierOptions || []}
                value={supplierForm.supplier || null}
                onChange={(_, val) => handleSupplierFormChange("supplier", val)}
                getOptionLabel={labelSupplier}
                renderInput={(params) => (
                  <CustomTextField {...params} size="small" />
                )}
              />
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={1}>
            <FormControl fullWidth>
              <MuiText variant="body2" sx={headerStyle}>
                Supplier Part No.
              </MuiText>
              <CustomTextField
                size="small"
                value={supplierForm.supplierPartNo ?? ""}
                onChange={(val) =>
                  handleSupplierFormChange("supplierPartNo", val)
                }
              />
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={1}>
            <FormControl fullWidth>
              <MuiText variant="body2" sx={headerStyle}>
                Unit
              </MuiText>
              <StyledAutocomplete
                disablePortal
                options={unitOptions || []}
                value={supplierForm.unit || null}
                onChange={(_, val) => handleSupplierFormChange("unit", val)}
                getOptionLabel={labelUnit}
                renderInput={(params) => (
                  <CustomTextField {...params} size="small" />
                )}
              />
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={4} md={1}>
            <FormControl fullWidth>
              <MuiText variant="body2" sx={headerStyle}>
                Lead Time
              </MuiText>
              <CustomTextField
                size="small"
                value={supplierForm.leadTime ?? ""}
                onChange={(val) => handleSupplierFormChange("leadTime", val)}
              />
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={4} md={1}>
            <FormControl fullWidth>
              <MuiText variant="body2" sx={headerStyle}>
                MOQ
              </MuiText>
              <CustomTextField
                size="small"
                value={supplierForm.moq ?? ""}
                onChange={(val) => handleSupplierFormChange("moq", val)}
              />
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={4} md={1}>
            <FormControl fullWidth>
              <MuiText variant="body2" sx={headerStyle}>
                MOQ UOM
              </MuiText>
              <StyledAutocomplete
                disablePortal
                options={uomOptions || []}
                value={supplierForm.moqUom || null}
                onChange={(_, val) => handleSupplierFormChange("moqUom", val)}
                getOptionLabel={labelUom}
                renderInput={(params) => (
                  <CustomTextField {...params} size="small" />
                )}
              />
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={4} md={1}>
            <FormControl fullWidth>
              <MuiText variant="body2" sx={headerStyle}>
                Package Value
              </MuiText>
              <CustomTextField
                size="small"
                value={supplierForm.packageValue ?? ""}
                onChange={(val) =>
                  handleSupplierFormChange("packageValue", val)
                }
              />
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={4} md={1}>
            <FormControl fullWidth>
              <MuiText variant="body2" sx={headerStyle}>
                Package UOM
              </MuiText>
              <StyledAutocomplete
                disablePortal
                options={uomOptions || []}
                value={supplierForm.packageUom || null}
                onChange={(_, val) =>
                  handleSupplierFormChange("packageUom", val)
                }
                getOptionLabel={labelUom}
                renderInput={(params) => (
                  <CustomTextField {...params} size="small" />
                )}
              />
            </FormControl>
          </Grid>

          <Grid
            item
            xs={12}
            sm={12}
            md={2}
            display="flex"
            alignItems="flex-end"
          >
            <MuiButton variant="contained" onClick={handleSupplierAdd} sx={{borderRadius: "6px !important"}}>
              Add Supplier
            </MuiButton>
          </Grid>
        </Grid>

        <Paper variant="outlined">
          <Table size="small">
            <TableHead sx={{ background: "#f5f5f5" }}>
              <TableRow>
                <TableCell>Supplier</TableCell>
                <TableCell>Part No.</TableCell>
                <TableCell>Unit</TableCell>
                <TableCell>Lead Time</TableCell>
                <TableCell>MOQ</TableCell>
                <TableCell>MOQ UOM</TableCell>
                <TableCell>Package Value</TableCell>
                <TableCell>Package UOM</TableCell>
                <TableCell>Default</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {supplierRows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>
                    {row.isEditing ? (
                      <StyledAutocomplete
                        disablePortal
                        options={supplierOptions || []}
                        value={row.supplier || null}
                        onChange={(_, val) =>
                          handleRowChange(row.id!, "supplier", val)
                        }
                        getOptionLabel={labelSupplier}
                        renderInput={(params) => (
                          <CustomTextField {...params} size="small" />
                        )}
                      />
                    ) : (
                      labelSupplier(row.supplier)
                    )}
                  </TableCell>

                  <TableCell>
                    {row.isEditing ? (
                      <CustomTextField
                        size="small"
                        sx={{ width: 80 }}
                        value={row.supplierPartNo ?? ""}
                        onChange={(val) =>
                          handleRowChange(row.id!, "supplierPartNo", val)
                        }
                      />
                    ) : (
                      row.supplierPartNo
                    )}
                  </TableCell>

                  <TableCell>
                    {row.isEditing ? (
                      <StyledAutocomplete
                        disablePortal
                        options={unitOptions || []}
                        value={row.unit || null}
                        onChange={(_, val) =>
                          handleRowChange(row.id!, "unit", val)
                        }
                        getOptionLabel={labelUnit}
                        renderInput={(params) => (
                          <CustomTextField {...params} size="small" />
                        )}
                      />
                    ) : (
                      labelUnit(row.unit)
                    )}
                  </TableCell>

                  <TableCell>
                    {row.isEditing ? (
                      <CustomTextField
                        size="small"
                        sx={{ width: 80 }}
                        value={row.leadTime ?? ""}
                        onChange={(val) =>
                          handleRowChange(row.id!, "leadTime", val)
                        }
                      />
                    ) : (
                      row.leadTime
                    )}
                  </TableCell>

                  <TableCell>
                    {row.isEditing ? (
                      <CustomTextField
                        size="small"
                        value={row.moq ?? ""}
                        sx={{ width: 80 }}
                        onChange={(val) => handleRowChange(row.id!, "moq", val)}
                      />
                    ) : (
                      row.moq
                    )}
                  </TableCell>

                  <TableCell>
                    {row.isEditing ? (
                      <StyledAutocomplete
                        disablePortal
                        options={uomOptions || []}
                        value={row.moqUom || null}
                        onChange={(_, val) =>
                          handleRowChange(row.id!, "moqUom", val)
                        }
                        getOptionLabel={labelUom}
                        renderInput={(params) => (
                          <CustomTextField {...params} size="small" />
                        )}
                      />
                    ) : (
                      labelUom(row.moqUom)
                    )}
                  </TableCell>

                  <TableCell>
                    {row.isEditing ? (
                      <CustomTextField
                        size="small"
                        value={row.packageValue ?? ""}
                        sx={{ width: 80 }}
                        onChange={(val) =>
                          handleRowChange(row.id!, "packageValue", val)
                        }
                      />
                    ) : (
                      row.packageValue
                    )}
                  </TableCell>

                  <TableCell>
                    {row.isEditing ? (
                      <StyledAutocomplete
                        disablePortal
                        options={uomOptions || []}
                        value={row.packageUom || null}
                        onChange={(_, val) =>
                          handleRowChange(row.id!, "packageUom", val)
                        }
                        getOptionLabel={labelUom}
                        renderInput={(params) => (
                          <CustomTextField {...params} size="small" />
                        )}
                      />
                    ) : (
                      labelUom(row.packageUom)
                    )}
                  </TableCell>

                  <TableCell>
                    <Checkbox
                      checked={!!row.isDefault}
                      onChange={() => handleDefaultSupplier(row.id!)}
                      disabled={row.isEditing}
                    />
                  </TableCell>

                  <TableCell align="right">
                    {row.isEditing ? (
                      <>
                        <IconButton
                          color="success"
                          onClick={() => handleEditToggle(row.id!, true)}
                        >
                          <BiSave />
                        </IconButton>
                        <IconButton
                          color="error"
                          onClick={() => handleSupplierDelete(row.id!)}
                        >
                          <RiDeleteBin6Line />
                        </IconButton>
                      </>
                    ) : (
                      <>
                        <IconButton
                          color="primary"
                          onClick={() => handleEditToggle(row.id!)}
                        >
                          <BiEdit />
                        </IconButton>
                        <IconButton
                          color="error"
                          onClick={() => handleSupplierDelete(row.id!)}
                        >
                          <RiDeleteBin6Line />
                        </IconButton>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      </Box>
    </Grid>
  );

  const renderFields = (fields: FieldConfig[]) => (
    <Grid container spacing={2}>
      {fields.map((fieldConfig, idx) => (
        <Grid item xs={12} sm={6} md={3} key={idx}>
          {renderField(
            fieldConfig,
            formData[fieldConfig.name],
            (value) => handleInputChange(fieldConfig.name, value),
            idx
          )}
        </Grid>
      ))}

      {renderForeignTradeSection()}
      {renderSupplierSection()}
    </Grid>
  );

  return <Box>{renderFields(purchaseFields)}</Box>;
};

export default PurchaseItem;
