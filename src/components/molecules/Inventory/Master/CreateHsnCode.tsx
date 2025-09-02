import * as React from "react";
import {
  Autocomplete,
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  FormGroup,
  Slide,
  TextField,
} from "@mui/material";
import { TransitionProps } from "@mui/material/transitions";
import { IoClose } from "react-icons/io5";
import { MuiButton, MuiSwitch, MuiText } from "bsoft-base-elements";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import Grid from "@mui/material/Grid";

import {
  CreateHsnCodeProps,
  HsnForm,
  HsnCategoryOption,
  HsnTypeOption,
} from "../../../../types/maintanenceTypes";

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & { children: React.ReactElement<any, any> },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const CreateHsnCode: React.FC<CreateHsnCodeProps> = ({
  open,
  close,
  editFlag,
  form,
  errorFields,
  onChange,
  onDateChange,
  onSwitch,
  onSubmit,
  gstCategories,
  hsnSacTypes,
  submitDisabled,
}) => {
  const normalize = (src: any) =>
    Array.isArray(src) ? src : Array.isArray(src?.data) ? src.data : [];

  const gstCategoryOptions: HsnCategoryOption[] = normalize(gstCategories);
  const hsnTypeOptions: HsnTypeOption[] = normalize(hsnSacTypes);

  const sameOption = (a: any, b: any) => {
    if (!a || !b) return false;
    const aKey = a.id ?? a.code;
    const bKey = b.id ?? b.code;
    return String(aKey) === String(bKey);
  };

  const currentTypeObj =
    hsnTypeOptions.find(
      (o) =>
        Number(o.id) === Number(form.typeId || 0) ||
        String(o.code) === String(form.type || "")
    ) ?? null;

  const currentGstObj =
    gstCategoryOptions.find(
      (o) => Number(o.id) === Number((form as any).gstCategoryId || 0)
    ) ??
    gstCategoryOptions.find(
      (o) =>
        String(o.code ?? "").toLowerCase() ===
        String(form.gstCategoryName ?? "").toLowerCase() ||
        String(o.description ?? "").toLowerCase() ===
        String(form.gstCategoryName ?? "").toLowerCase()
    ) ??
    null;

  // show errors only after submit click
  const [showErrors, setShowErrors] = React.useState(false);
  React.useEffect(() => {
    if (!open) setShowErrors(false);
  }, [open]);

  const hasErr = (name: keyof HsnForm): boolean =>
    showErrors ? (errorFields as string[]).includes(name as string) : false;

  const help = (name: keyof HsnForm, label: string): string =>
    hasErr(name) ? `${label} is required.` : "";

  type FieldDef = {
    label: string;
    name: keyof HsnForm;
    type?: "text" | "number" | "date" | "autocomplete-type" | "autocomplete-gst";
    isRequired?: boolean;
    size: { xs: number; sm: number; md: number; lg: number };
    min?: number;
    max?: number;
    maxLength?: number;
  };

  const Fields: Array<FieldDef> = [
    { label: "Type", name: "type", type: "autocomplete-type", isRequired: true, size: { xs: 12, sm: 6, md: 4, lg: 3 } },
    { label: "HSN Code", name: "hsnCode", type: "text", isRequired: true, size: { xs: 12, sm: 6, md: 4, lg: 3 }, maxLength: 8 },
    { label: "GST Category", name: "gstCategoryName", type: "autocomplete-gst", isRequired: true, size: { xs: 12, sm: 6, md: 4, lg: 3 } },
    { label: "GST %", name: "gstPercentage", type: "number", isRequired: true, size: { xs: 12, sm: 6, md: 4, lg: 3 }, min: 0, max: 100 },
    { label: "CGST %", name: "cgstPercentage", type: "number", size: { xs: 12, sm: 6, md: 4, lg: 3 }, min: 0, max: 100 },
    { label: "SGST %", name: "sgstPercentage", type: "number", size: { xs: 12, sm: 6, md: 4, lg: 3 }, min: 0, max: 100 },
    { label: "IGST %", name: "igstPercentage", type: "number", size: { xs: 12, sm: 6, md: 6, lg: 3 }, min: 0, max: 100 },
    { label: "Valid From", name: "validFrom", type: "date", isRequired: true, size: { xs: 12, sm: 6, md: 6, lg: 3 } },
    { label: "Description", name: "description", type: "text", size: { xs: 12, sm: 12, md: 12, lg: 12 }, maxLength: 500 },
  ];

  const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));
  const isTaxSplitField = (name: keyof HsnForm) =>
    name === "cgstPercentage" || name === "sgstPercentage" || name === "igstPercentage";

  return (
    <Dialog
      open={open}
      onClose={close}
      TransitionComponent={Transition}
      keepMounted
      aria-describedby="alert-dialog-slide-description"
      sx={{ "& .MuiPaper-root": { minWidth: "55vw", borderRadius: "8px" } }}
    >
      {/* Header */}
      <Box className="popup-header-wrapper">
        <h2 className="dialog-header">{editFlag ? "Edit" : "Create"} HSN Code</h2>
        <IoClose fontSize={24} onClick={close} cursor="pointer" color="#fff" />
      </Box>

      {/* Body */}
      <DialogContent sx={{ p: "4px 24px 12px" }}>
        <Grid container spacing={2}>
          {Fields.map((field) => {
            const disabled = isTaxSplitField(field.name);
            return (
              <Grid key={String(field.name)} item xs={field.size.xs} sm={field.size.sm} md={field.size.md} lg={field.size.lg}>
                <MuiText variant="h6" my={1} className="admin-label-title">
                  {field.label} {field.isRequired && <span className="mandatory-sign">*</span>}
                </MuiText>

                {field.type === "autocomplete-type" ? (
                  <Autocomplete<HsnTypeOption>
                    options={hsnTypeOptions}
                    fullWidth
                    size="small"
                    value={currentTypeObj}
                    onChange={(_e, v) => {
                      onChange("type", v?.code ?? "");
                      onChange("typeId", v?.id ?? 0);
                    }}
                    getOptionLabel={(o) => o?.code ?? ""}
                    isOptionEqualToValue={(a, b) => String(a.id ?? a.code) === String(b.id ?? b.code)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        size="small"
                        name="type"
                        placeholder="Select"
                        error={hasErr("type")}
                        helperText={help("type", "Type")}
                      />
                    )}
                  />
                ) : field.type === "autocomplete-gst" ? (
                  <Autocomplete<HsnCategoryOption>
                    options={gstCategoryOptions}
                    fullWidth
                    size="small"
                    value={currentGstObj}
                    onChange={(_e, v) => {
                      onChange("gstCategoryId", v?.id ?? 0);
                      onChange("gstCategoryName", v?.code ?? v?.description ?? "");
                    }}
                    getOptionLabel={(o) => o?.code ?? o?.description ?? ""}
                    isOptionEqualToValue={sameOption}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        size="small"
                        name="gstCategoryName"
                        placeholder="Select"
                        error={hasErr("gstCategoryName")}
                        helperText={help("gstCategoryName", "GST Category")}
                      />
                    )}
                    noOptionsText="No categories"
                  />
                ) : field.type === "date" ? (
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      value={form.validFrom ? dayjs(form.validFrom) : null}
                      onChange={(date) => onDateChange(date ? dayjs(date).format("YYYY-MM-DD") : "")}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          size: "small",
                          error: hasErr("validFrom"),
                          helperText: help("validFrom", "Valid From"),
                        },
                      }}
                    />
                  </LocalizationProvider>
                ) : (
                  <TextField
                    fullWidth
                    size="small"
                    type={field.type === "number" ? "number" : "text"}
                    name={String(field.name)}
                    value={String(form[field.name] ?? "")}
                    onChange={(e) => {
                      if (disabled) return; // read-only
                      if (field.type === "number") {
                        const raw = e.target.value;
                        if (raw === "") {
                          onChange(field.name, "");
                          return;
                        }
                        const n = Number(raw);
                        if (Number.isNaN(n)) return;
                        const min = typeof field.min === "number" ? field.min : 0;
                        const max = typeof field.max === "number" ? field.max : 100;
                        onChange(field.name, clamp(n, min, max) as any);
                        return;
                      }
                      const val = e.target.value;
                      if (field.maxLength && typeof field.maxLength === "number") {
                        onChange(field.name, val.slice(0, field.maxLength));
                        return;
                      }
                      onChange(field.name, val);
                    }}
                    inputProps={{
                      maxLength: field.maxLength ?? undefined,
                      min: field.min ?? undefined,
                      max: field.max ?? undefined,
                      readOnly: disabled || undefined,
                      "aria-readonly": disabled || undefined,
                    }}
                    disabled={disabled}
                    multiline={field.name === "description"}
                    minRows={field.name === "description" ? 3 : undefined}
                    error={hasErr(field.name)}
                    helperText={help(field.name, field.label)}
                  />
                )}
              </Grid>
            );
          })}
        </Grid>
      </DialogContent>

      {/* Footer */}
      <DialogActions
        sx={{
          borderTop: "1px solid #f1f1f1",
          py: 2,
          justifyContent: "space-between",
          px: { xs: 2, md: 3 },
        }}
      >
        <FormGroup>
          <MuiSwitch checked={!!form.isActive} onChange={(e) => onSwitch(!!e.target.checked)} label="Status" />
        </FormGroup>

        <Box display="flex" alignItems="center" gap={1.5}>
          <MuiButton variant="outlined" onClick={close}>
            Cancel
          </MuiButton>
          <MuiButton
            variant="contained"
            onClick={() => {
              setShowErrors(true);
              onSubmit();
            }}
            disabled={submitDisabled}
          >
            Submit
          </MuiButton>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default CreateHsnCode;
