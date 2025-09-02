"use client";

import * as React from "react";
import {
  Autocomplete,
  Box,
  Chip,
  Divider,
  Grid,
  IconButton,
  MenuItem,
  Stack,
  TableBody,
  TableCell,
  TableRow,
  TextField,
  Tooltip,
  Button,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Typography,
} from "@mui/material";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { MuiButton, MuiText } from "bsoft-base-elements";
import { HiSquaresPlus } from "react-icons/hi2";
import { RiDeleteBin6Line, RiPercentLine } from "react-icons/ri";
import { IoCloudUploadOutline, IoDownloadOutline } from "react-icons/io5";
import { FiFileText, FiPackage } from "react-icons/fi";
import dayjs, { Dayjs } from "dayjs";
import { useDataFetchHook } from "../../../../hooks/useDataFetchHook";
import PurchaseConfig from "../../../../utils/purchase.api.json";
import {
  Supplier,
  FieldDef,
  QuotationForm,
  QuotationStatus,
  ItemSource,
  ItemRowEx,
  Attachment,
} from "../../../../types/PurchaseTypes";
import {
  Pane,
  Scroll,
  Side,
  Card,
  SectionTitle,
  ModernTableContainer,
  ModernTableHead,
  ModernTable,
  TableHeaderCell,
  StickyFooter,
} from "./component/OuotationSmallcomponents";

const ITEM_CATALOG = [
  { code: "BRG-6205ZZ", name: "Ball Bearing 6205ZZ", uom: "Nos" },
  { code: "BR001-LMW-90099", name: "V-Belt A42", uom: "Nos" },
  { code: "GRS-NLGI2", name: "Bearing Grease NLGI-2", uom: "Kg" },
];

export default function CreateQuotation() {
  const suppliers: Supplier[] = [
    { id: 1, name: "Acme Inc." },
    { id: 2, name: "Sre Ram Textiles" },
    { id: 3, name: "Vendor Labs" },
  ];

  const { data: costCenters } = useDataFetchHook(
    PurchaseConfig.PurchaseMisc.endpoint.replace("{type}", "CostCenter"),
    PurchaseConfig.PurchaseMisc.method,
    "purchase"
  );
  const { data: projects } = useDataFetchHook(
    PurchaseConfig.PurchaseMisc.endpoint.replace("{type}", "Project"),
    PurchaseConfig.PurchaseMisc.method,
    "purchase"
  );
  const { data: uoms } = useDataFetchHook(
    PurchaseConfig.PurchaseMisc.endpoint.replace("{type}", "UOM"),
    PurchaseConfig.PurchaseMisc.method,
    "purchase"
  );

  const [source] = React.useState<ItemSource>("Manual");
  const [currency] = React.useState("INR");
  const [showErrors, setShowErrors] = React.useState(false);

  const [form, setForm] = React.useState<QuotationForm>({
    series: "PUR-SQTN.-YYYY.-",
    status: "Draft",
    supplierId: null,
    date: dayjs(),
    validTill: dayjs().add(30, "day"),
    quotationNo: "",
    costCenterId: null,
    projectId: null,
  });

  const FIELD_DEFS: FieldDef[] = [
    {
      label: "Series",
      name: "series",
      type: "text",
      isRequired: true,
      size: { xs: 12, md: 2 },
    },
    {
      label: "Status",
      name: "status",
      type: "select-status",
      isRequired: true,
      size: { xs: 12, md: 2 },
    },
    {
      label: "Supplier",
      name: "supplierId",
      type: "autocomplete-supplier",
      isRequired: true,
      size: { xs: 12, md: 2 },
    },
    {
      label: "Date",
      name: "date",
      type: "datepicker",
      isRequired: true,
      size: { xs: 12, md: 2 },
    },
    {
      label: "Valid Till",
      name: "validTill",
      type: "datepicker",
      size: { xs: 12, md: 2 },
    },
    {
      label: "Quotation Number",
      name: "quotationNo",
      type: "text",
      size: { xs: 12, md: 2 },
      maxLength: 50,
    },
  ];

  const onChange = (name: keyof QuotationForm, value: any) =>
    setForm((p) => ({ ...p, [name]: value }));

  const hasErr = (name: keyof QuotationForm) =>
    showErrors &&
    [...FIELD_DEFS].some((f) => f.name === name && f.isRequired) &&
    (form[name] === null || form[name] === "" || form[name] === undefined);

  const supplierLabel = (s: Supplier) =>
    s?.name ?? s?.displayName ?? s?.supplierName ?? "";

  const idRef = React.useRef(0);
  const nextId = () => `${++idRef.current}`;

  const emptyItem = (): ItemRowEx => ({
    id: nextId(),
    itemCode: "",
    quantity: "",
    uom: "",
    rate: "",
    amount: 0,
    gstPercent: 0,
    gstAmount: 0,
    deduction: "",
    taxable: 0,
  });

  const [items, setItems] = React.useState<ItemRowEx[]>([emptyItem()]);
  const fmt = (n: number) =>
    (isFinite(n) ? n : 0).toLocaleString("en-IN", {
      style: "currency",
      currency,
    });

  const recomputeLine = (row: ItemRowEx) => {
    const qty = Number(row.quantity) || 0;
    const rate = Number(row.rate) || 0;
    const amount = qty * rate;

    const lineDeduction = Number(row.deduction) || 0;
    const taxable = Math.max(amount - lineDeduction, 0);
    const gstPct = Number(row.gstPercent) || 0;
    const gstAmount = (taxable * gstPct) / 100;

    return { ...row, amount, taxable, gstAmount };
  };

  const patchItem = (id: string, patch: Partial<ItemRowEx>) =>
    setItems((prev) =>
      prev.map((r) => (r.id === id ? recomputeLine({ ...r, ...patch }) : r))
    );

  const addItem = () => setItems((p) => [...p, emptyItem()]);
  const addMultiple = () =>
    setItems((p) => [...p, emptyItem(), emptyItem(), emptyItem()]);
  const removeItem = (id: string) =>
    setItems((p) => p.filter((r) => r.id !== id));

  const [catalogChoice, setCatalogChoice] = React.useState<
    (typeof ITEM_CATALOG)[number] | null
  >(null);

  const addFromCatalog = () => {
    if (!catalogChoice) return;
    setItems((p) => [
      ...p,
      recomputeLine({
        ...emptyItem(),
        itemCode: catalogChoice.code,
        uom: catalogChoice.uom,
        quantity: 1,
        rate: "",
      }),
    ]);
    setCatalogChoice(null);
  };

  const [freightMode, setFreightMode] = React.useState<string>("");
  const [freightCharges, setFreightCharges] = React.useState<number | "">("");
  const [paymentTerms, setPaymentTerms] = React.useState<string>("");
  const [incoterm, setIncoterm] = React.useState<string>("");

  const subTotal = React.useMemo(
    () => items.reduce((s, r) => s + (Number(r.taxable) || 0), 0),
    [items]
  );
  const gstTotal = React.useMemo(
    () => items.reduce((s, r) => s + (Number(r.gstAmount) || 0), 0),
    [items]
  );
  const deductionTotal = React.useMemo(
    () => items.reduce((s, r) => s + (Number(r.deduction) || 0), 0),
    [items]
  );
  const linesTotal = subTotal + gstTotal; // total of all rows (before freight)
  const freightAmt = Number(freightCharges) || 0;
  const grandTotal = linesTotal + freightAmt;

  const [attachments, setAttachments] = React.useState<Attachment[]>([]);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const onPickFile = () => fileInputRef.current?.click();
  const onFileSelected: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setAttachments((prev) => [
      ...prev,
      { name: f.name, at: nowStr(), by: "Current User" },
    ]);
    e.currentTarget.value = "";
  };
  const removeAttachment = (idx: number) =>
    setAttachments((prev) => prev.filter((_, i) => i !== idx));

  const onSave = () => {
    setShowErrors(true);
    if (FIELD_DEFS.some((f) => f.isRequired && hasErr(f.name))) return;

    const payload = {
      header: {
        ...form,
        date: form.date?.toISOString(),
        validTill: form.validTill?.toISOString(),
        currency,
        source,
      },
      items: items.map(({ id, gstAmount, taxable, ...rest }) => rest),
      charges: {
        freightMode,
        freightCharges: freightAmt,
        paymentTerms,
        incoterm,
      },
      totals: {
        deductionTotal,
        subTotal,
        gstTotal,
        linesTotal,
        freightAmt,
        grandTotal,
      },
      attachments,
    };
  };

  const FREIGHT_MODES = ["Road", "Courier", "Air", "Sea", "Rail"];
  const PAYMENT_TERMS = [
    "Immediate",
    "15 Days",
    "30 Days",
    "45 Days",
    "60 Days",
  ];
  const INCOTERMS = ["EXW", "FCA", "FOB", "CFR", "CIF", "DAP", "DDP"];
  function nowStr() {
    const d = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${pad(d.getDate())}-${pad(
      d.getMonth() + 1
    )}-${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  const statusColor =
    form.status === "Draft"
      ? "default"
      : form.status === "Submitted"
      ? "info"
      : form.status === "Accepted"
      ? "success"
      : "error";

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Pane>
        <Scroll>
          <Card
            elevation={2}
            sx={{
              mb: 2,
              position: "sticky",
              top: 0,
              zIndex: (theme) => theme.zIndex.modal - 1,
              borderBottom: "1px solid",
              borderColor: "divider",
            }}
          >
            <SectionTitle icon={<FiFileText />} title="Details" />
            <Divider sx={{ my: 1.5 }} />
            <Grid container spacing={1}>
              {FIELD_DEFS.map((f) => (
                <Grid item key={String(f.name)} {...f.size}>
                  <MuiText
                    variant="caption"
                    sx={{ fontWeight: 700, letterSpacing: 0.3 }}
                  >
                    {f.label}
                  </MuiText>

                  {f.type === "text" && (
                    <TextField
                      fullWidth
                      size="small"
                      value={String((form as any)[f.name] ?? "")}
                      onChange={(e) => onChange(f.name, e.target.value)}
                      error={hasErr(f.name)}
                      helperText={hasErr(f.name) ? "Required" : " "}
                      inputProps={
                        f.maxLength ? { maxLength: f.maxLength } : undefined
                      }
                    />
                  )}

                  {f.type === "select-status" && (
                    <TextField
                      select
                      fullWidth
                      size="small"
                      value={form.status}
                      onChange={(e) =>
                        onChange("status", e.target.value as QuotationStatus)
                      }
                      helperText=" "
                    >
                      {["Draft", "Submitted", "Accepted", "Rejected"].map(
                        (s) => (
                          <MenuItem key={s} value={s}>
                            {s}
                          </MenuItem>
                        )
                      )}
                    </TextField>
                  )}

                  {f.type === "autocomplete-supplier" && (
                    <Autocomplete<Supplier>
                      options={suppliers}
                      value={
                        suppliers.find((x) => x.id === form.supplierId) ?? null
                      }
                      onChange={(_e, v) =>
                        onChange("supplierId", v ? v.id : null)
                      }
                      getOptionLabel={supplierLabel}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          size="small"
                          error={hasErr("supplierId")}
                          helperText={hasErr("supplierId") ? "Required" : " "}
                        />
                      )}
                    />
                  )}

                  {f.type === "datepicker" && (
                    <DatePicker
                      value={(form as any)[f.name] as Dayjs | null}
                      onChange={(v) => onChange(f.name, v)}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          size: "small",
                          error: hasErr(f.name),
                          helperText: hasErr(f.name) ? "Required" : " ",
                        },
                      }}
                      {...(f.name === "date" ? { maxDate: dayjs() } : {})}
                    />
                  )}
                </Grid>
              ))}
            </Grid>

            {showErrors &&
              FIELD_DEFS.some((f) => f.isRequired && hasErr(f.name)) && (
                <Alert severity="warning" sx={{ mt: 1.5 }}>
                  Please fill all required fields before saving.
                </Alert>
              )}
          </Card>
          <Box>
            <Card
              elevation={2}
              sx={{
                mb: 2,
                display: "flex",
                flexDirection: "column",
                height: { xs: "75vh", md: "47.5vh" },
                overflow: "hidden",
                position: "relative",
              }}
            >
              <Box
                sx={{
                  position: "sticky",
                  top: 0,
                  zIndex: 2,
                  bgcolor: "background.paper",
                  borderBottom: "1px solid",
                  borderColor: "divider",
                }}
              >
                <Stack
                  direction={{ xs: "column", md: "row" }}
                  alignItems={{ xs: "flex-start", md: "center" }}
                  justifyContent="space-between"
                  sx={{ px: 2, py: 1 }}
                  gap={1.5}
                >
                  <SectionTitle icon={<FiPackage />} title="Items" />
                  <Stack
                    direction="row"
                    gap={1.5}
                    alignItems="center"
                    sx={{ width: { xs: "100%", md: 520 } }}
                  >
                    <Autocomplete
                      sx={{ flex: 1 }}
                      options={ITEM_CATALOG}
                      value={catalogChoice}
                      onChange={(_e, v) => setCatalogChoice(v)}
                      getOptionLabel={(o) => `${o.code} — ${o.name}`}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          size="small"
                          label="Add item from catalog"
                        />
                      )}
                    />
                    <MuiButton
                      variant="contained"
                      onClick={addFromCatalog}
                      disabled={!catalogChoice}
                      startIcon={<HiSquaresPlus />}
                    >
                      Add
                    </MuiButton>
                  </Stack>
                </Stack>
              </Box>
              <ModernTableContainer
                sx={{
                  flex: 1,
                  minHeight: 0,
                  overflowY: "auto",
                  "&::-webkit-scrollbar": { width: 6, height: 6 },
                  "&::-webkit-scrollbar-thumb": {
                    backgroundColor: "#9e9e9e",
                    borderRadius: 3,
                  },
                  scrollbarWidth: "thin",
                }}
              >
                <ModernTable stickyHeader size="small">
                  <ModernTableHead>
                    <TableRow>
                      <TableHeaderCell width="5%">S.No</TableHeaderCell>
                      <TableHeaderCell width="24%">
                        Item Code / Name
                      </TableHeaderCell>
                      <TableHeaderCell width="10%">Quantity</TableHeaderCell>
                      <TableHeaderCell width="10%">UOM</TableHeaderCell>
                      <TableHeaderCell width="14%">Rate</TableHeaderCell>
                      <TableHeaderCell width="14%">Deduction</TableHeaderCell>
                      <TableHeaderCell width="9%">GST %</TableHeaderCell>
                      <TableHeaderCell width="14%">Line Total</TableHeaderCell>
                      <TableHeaderCell width="6%">Action</TableHeaderCell>
                    </TableRow>
                  </ModernTableHead>
                  <TableBody>
                    {items.map((r, idx) => {
                      const lineTotal =
                        (Number(r.taxable) || 0) + (Number(r.gstAmount) || 0);
                      return (
                        <TableRow key={r.id} hover>
                          <TableCell>{idx + 1}</TableCell>

                          <TableCell>
                            <TextField
                              fullWidth
                              size="small"
                              placeholder="BR001 - LMW - 90099"
                              value={r.itemCode}
                              onChange={(e) =>
                                patchItem(r.id, { itemCode: e.target.value })
                              }
                            />
                          </TableCell>
                          <TableCell>
                            <TextField
                              fullWidth
                              size="small"
                              placeholder="Qty"
                              type="number"
                              value={r.quantity}
                              onChange={(e) =>
                                patchItem(r.id, {
                                  quantity: Number(e.target.value) || "",
                                })
                              }
                            />
                          </TableCell>
                          <TableCell>
                            <TextField
                              select
                              fullWidth
                              size="small"
                              placeholder="UOM"
                              value={r.uom}
                              onChange={(e) =>
                                patchItem(r.id, { uom: e.target.value })
                              }
                            >
                              {(Array.isArray(uoms) ? uoms : []).map(
                                (u: any) => (
                                  <MenuItem
                                    key={u.id ?? u.code}
                                    value={u.name ?? u.text ?? u.code}
                                  >
                                    {u.name ?? u.text ?? u.code}
                                  </MenuItem>
                                )
                              )}
                            </TextField>
                          </TableCell>
                          <TableCell>
                            <TextField
                              fullWidth
                              size="small"
                              type="number"
                              placeholder="Rate"
                              value={r.rate}
                              onChange={(e) =>
                                patchItem(r.id, {
                                  rate: Number(e.target.value) || "",
                                })
                              }
                            />
                          </TableCell>
                          <TableCell>
                            <TextField
                              fullWidth
                              size="small"
                              placeholder="Deduction"
                              type="number"
                              value={r.deduction === "" ? "" : r.deduction}
                              onChange={(e) =>
                                patchItem(r.id, {
                                  deduction:
                                    e.target.value === ""
                                      ? ""
                                      : Number(e.target.value),
                                })
                              }
                            />
                          </TableCell>
                          <TableCell align="right">
                            <TextField
                              size="small"
                              type="number"
                              value={r.gstPercent === "" ? "" : r.gstPercent}
                              onChange={(e) =>
                                patchItem(r.id, {
                                  gstPercent:
                                    e.target.value === ""
                                      ? ""
                                      : Number(e.target.value),
                                })
                              }
                              inputProps={{ style: { textAlign: "right" } }}
                            />
                          </TableCell>
                          <TableCell align="right">
                            <TextField
                              size="small"
                              value={fmt(lineTotal)}
                              InputProps={{ readOnly: true }}
                            />
                          </TableCell>
                          <TableCell sx={{ textAlign: "center" }}>
                            <Tooltip title="Remove">
                              <IconButton
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeItem(r.id);
                                }}
                                sx={{ color: "red" }}
                              >
                                <RiDeleteBin6Line />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </ModernTable>
              </ModernTableContainer>

              <StickyFooter>
                <Stack direction="row" gap={1.5}>
                  <MuiButton
                    startIcon={<HiSquaresPlus />}
                    variant="contained"
                    onClick={addItem}
                  >
                    Add Row
                  </MuiButton>
                  <MuiButton variant="outlined" onClick={addMultiple}>
                    Add Multiple
                  </MuiButton>
                  <Box flexGrow={1} />
                  <Button startIcon={<IoDownloadOutline />} variant="outlined">
                    Download
                  </Button>
                  <Button
                    startIcon={<IoCloudUploadOutline />}
                    variant="outlined"
                    onClick={onPickFile}
                  >
                    Upload
                  </Button>
                </Stack>
              </StickyFooter>
            </Card>
          </Box>
        </Scroll>

        <Side sx={{ mt: -2 }}>
          <Stack gap={2} position="sticky">
            <Card>
              <SectionTitle icon={<RiPercentLine />} title="Taxes & Charges" />
              <Divider sx={{ my: 1.5 }} />
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    select
                    size="small"
                    fullWidth
                    label="Freight Mode"
                    value={freightMode}
                    onChange={(e) => setFreightMode(e.target.value)}
                    placeholder="Select mode"
                  >
                    {FREIGHT_MODES.map((m) => (
                      <MenuItem key={m} value={m}>
                        {m}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    size="small"
                    fullWidth
                    type="number"
                    label={`Freight Charges (${currency})`}
                    value={freightCharges}
                    onChange={(e) =>
                      setFreightCharges(
                        e.target.value === "" ? "" : Number(e.target.value)
                      )
                    }
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    select
                    size="small"
                    fullWidth
                    label="Payment Terms"
                    value={paymentTerms}
                    onChange={(e) => setPaymentTerms(e.target.value)}
                  >
                    {PAYMENT_TERMS.map((p) => (
                      <MenuItem key={p} value={p}>
                        {p}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    select
                    size="small"
                    fullWidth
                    label="Incoterms"
                    value={incoterm}
                    onChange={(e) => setIncoterm(e.target.value)}
                  >
                    {INCOTERMS.map((i) => (
                      <MenuItem key={i} value={i}>
                        {i}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
              </Grid>
            </Card>

            <Card sx={{ p: 2, borderRadius: 1 }}>
              <SectionTitle icon={<FiFileText />} title="Summary" />
              <Stack direction="row" gap={1} flexWrap="wrap" sx={{ mb: 1 }}>
                <Chip label={`Items: ${items.length}`} size="small" />
                <Chip
                  label={`Deductions: ${fmt(deductionTotal)}`}
                  size="small"
                />
              </Stack>{" "}
              <Divider sx={{ my: 1.5 }} />
              <Stack gap={1.7}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography color="#000" variant="body2">
                    Taxable Subtotal
                  </Typography>
                  <Typography fontWeight={600} variant="body1">
                    {fmt(subTotal)}
                  </Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography color="#000" variant="body2">
                    GST Total
                  </Typography>
                  <Typography fontWeight={600} variant="body1">
                    {fmt(gstTotal)}
                  </Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography
                    sx={{ color: "success.main", fontWeight: 700 }}
                    variant="body2"
                  >
                    Items Total{" "}
                  </Typography>{" "}
                  <Typography fontWeight={700} variant="body1">
                    {fmt(linesTotal)}
                  </Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography color="#000" variant="body2">
                    Freight
                  </Typography>
                  <Typography fontWeight={600} variant="body1">
                    {fmt(freightAmt)}
                  </Typography>
                </Stack>
                <Divider />
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  sx={{
                    px: 1.25,
                    py: 0.75,
                    borderRadius: 1,
                    bgcolor: (t) => t.palette.success.light,
                    border: "1px solid",
                    borderColor: "divider",
                  }}
                >
                  <Typography fontWeight={700} variant="subtitle1">
                    Grand Total
                  </Typography>
                  <Typography fontWeight={800} variant="subtitle1">
                    {fmt(grandTotal)}
                  </Typography>
                </Stack>
              </Stack>
            </Card>
            <Card>
              <SectionTitle icon={<FiFileText />} title="Attachments" />
              <Divider sx={{ my: 1.5 }} />
              <Stack direction="row" gap={1} sx={{ mb: 1 }}>
                <Button
                  startIcon={<IoCloudUploadOutline />}
                  variant="contained"
                  onClick={onPickFile}
                  sx={{ textTransform: "none" }}
                >
                  Upload File
                </Button>
                <MuiText
                  variant="caption"
                  sx={{ alignSelf: "center", color: "text.secondary" }}
                >
                  PDF, Image, or DOC
                </MuiText>
              </Stack>
              <List dense disablePadding>
                {attachments.length === 0 && (
                  <ListItem sx={{ py: 1.25, px: 0.5 }}>
                    <ListItemAvatar>
                      <Avatar
                        variant="rounded"
                        sx={{ bgcolor: "grey.200", color: "text.secondary" }}
                      >
                        <FiFileText />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary="No files uploaded yet"
                      secondary="Use the Upload button to attach documents"
                      primaryTypographyProps={{ color: "text.secondary" }}
                      secondaryTypographyProps={{ color: "text.disabled" }}
                    />
                  </ListItem>
                )}
                {attachments.map((a, idx) => {
                  const ext = a.name.split(".").pop()?.toUpperCase() || "FILE";
                  return (
                    <ListItem
                      key={`${a.name}-${idx}`}
                      sx={{
                        px: 0.5,
                        "&:hover": { bgcolor: "action.hover", borderRadius: 1 },
                      }}
                      secondaryAction={
                        <Stack direction="row" gap={0.5}>
                          <Tooltip title="Download">
                            <IconButton size="small">
                              <IoDownloadOutline />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Remove">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => removeAttachment(idx)}
                            >
                              <RiDeleteBin6Line />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      }
                    >
                      <ListItemAvatar>
                        <Avatar
                          variant="rounded"
                          sx={{ bgcolor: "grey.100", color: "text.primary" }}
                        >
                          <FiFileText />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Stack
                            direction="row"
                            gap={1}
                            alignItems="center"
                            flexWrap="wrap"
                          >
                            <Typography fontWeight={600} sx={{ mr: 0.5 }}>
                              {a.name}
                            </Typography>
                            <Chip size="small" variant="outlined" label={ext} />
                          </Stack>
                        }
                        secondary={`Uploaded ${a.at} by ${a.by}`}
                        primaryTypographyProps={{ fontSize: 13 }}
                        secondaryTypographyProps={{
                          fontSize: 12,
                          color: "text.secondary",
                        }}
                      />
                    </ListItem>
                  );
                })}
              </List>
              <input
                ref={fileInputRef}
                type="file"
                hidden
                onChange={onFileSelected}
              />
            </Card>
          </Stack>
        </Side>
      </Pane>
    </LocalizationProvider>
  );
}
