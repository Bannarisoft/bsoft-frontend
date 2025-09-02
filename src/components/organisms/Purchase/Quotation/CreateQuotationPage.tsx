import React, { useState, useCallback, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  Select,
  MenuItem,
  FormControl,
  Card,
  CardContent,
  Stepper,
  Step,
  StepLabel,
  Alert,
  Grid,
  Table,
  TableHead,
  TableBody,
  TableCell,
  TableRow,
  IconButton,
  Chip,
  LinearProgress,
  Stack,
  TextField,
  FormHelperText,
  TableContainer,
} from "@mui/material";
import {
  MdAdd,
  MdDelete,
  MdEdit,
  MdSave,
  MdSend,
  MdCheck,
  MdBusiness,
  MdClose,
} from "react-icons/md";
import toast from "react-hot-toast";
import BreadcrumbsNav from "../../../atoms/ModernComponents/BreadcrumbsNav";
import { AiOutlineSave } from "react-icons/ai";

interface RFQItem {
  id: string;
  code: string;
  description: string;
  specifications: string;
  quantity: number;
  uom: string;
  requiredDate: string;
}
interface Supplier {
  id: string;
  name: string;
  email: string;
  type: "registered" | "new";
}
interface RFQData {
  initiationType: "indent" | "master" | "";
  selectedIndent?: string;
  items: RFQItem[];
  suppliers: Supplier[];
  status: "draft" | "submitted" | "sent";
}

const itemMasterData = [
  {
    code: "ITM001",
    description: "Dell Laptop i7 16GB",
    category: "IT Equipment",
  },
  {
    code: "ITM002",
    description: "Office Chair Ergonomic",
    category: "Furniture",
  },
  {
    code: "ITM003",
    description: "Printer Cartridge HP 305A",
    category: "Consumables",
  },
  {
    code: "ITM004",
    description: "Whiteboard Markers Set",
    category: "Office Supplies",
  },
];
const availableIndents = [
  {
    id: "IND001",
    name: "Office Supplies Indent - March 2025",
    items: 12,
    value: "₹2,50,000",
  },
  {
    id: "IND002",
    name: "IT Equipment Indent - Q2 2025",
    items: 8,
    value: "₹15,00,000",
  },
  {
    id: "IND003",
    name: "Maintenance Materials - August 2025",
    items: 15,
    value: "₹5,75,000",
  },
];
const registeredSuppliers = [
  { id: "SUP001", name: "TechCorp Solutions", email: "sales@techcorp.com" },
  { id: "SUP002", name: "Office Depot India", email: "quotes@officedepot.in" },
  { id: "SUP003", name: "Global IT Systems", email: "rfq@globalit.com" },
];

const steps = [
  { label: "Choose Initiation", description: "Select how to start your RFQ" },
  { label: "Select Items", description: "Add and edit items" },
  { label: "Add Suppliers", description: "Choose your suppliers" },
  { label: "Review & Submit", description: "Final review and submit" },
];

const emptyItem: RFQItem = {
  id: "",
  code: "",
  description: "",
  specifications: "",
  quantity: 1,
  uom: "",
  requiredDate: "",
};

const CreateQuotationPage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [rfqData, setRFQData] = useState<RFQData>({
    initiationType: "",
    items: [],
    suppliers: [],
    status: "draft",
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<RFQItem>(emptyItem);
  const [rowErrors, setRowErrors] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [newSupplier, setNewSupplier] = useState({ name: "", email: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pathArr, setPathArr] = useState<string[]>([]);

  const validateItem = (item: RFQItem): Record<string, string> => {
    const errs: Record<string, string> = {};
    if (!item.code.trim()) errs.code = "Code required";
    if (!item.description.trim()) errs.description = "Description required";
    if (!item.quantity || item.quantity <= 0)
      errs.quantity = "Positive quantity required";
    if (!item.uom) errs.uom = "UOM required";
    if (!item.requiredDate) errs.requiredDate = "Required date needed";
    return errs;
  };

  const validateStep = useCallback(
    (step: number): boolean => {
      const newErrors: Record<string, string> = {};
      switch (step) {
        case 0:
          if (!rfqData.initiationType)
            newErrors.initiation = "Please select initiation";
          if (rfqData.initiationType === "indent" && !rfqData.selectedIndent)
            newErrors.indent = "Select approved indent";
          break;
        case 1:
          if (!rfqData.items.length) newErrors.items = "Add at least one item";
          rfqData.items.forEach((item, idx) => {
            const rowErrs = validateItem(item);
            Object.keys(rowErrs).forEach((key) => {
              newErrors[`item-${idx}-${key}`] = rowErrs[key];
            });
          });
          break;
        case 2:
          if (!rfqData.suppliers.length)
            newErrors.suppliers = "Add at least one supplier";
          break;
      }
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    },
    [rfqData]
  );

  const handleEditRow = (item: RFQItem) => {
    setEditingId(item.id);
    setEditingItem(item);
    setRowErrors({});
  };

  const handleSaveRow = () => {
    const itemErrs = validateItem(editingItem);
    if (Object.keys(itemErrs).length) {
      setRowErrors(itemErrs);
      return;
    }
    setRFQData((prev) => ({
      ...prev,
      items: prev.items.map((item) =>
        item.id === editingId ? { ...editingItem } : item
      ),
    }));
    setEditingId(null);
    setEditingItem(emptyItem);
    setRowErrors({});
    toast.success("Item updated!");
  };

  const handleCancelRow = () => {
    setEditingId(null);
    setEditingItem(emptyItem);
    setRowErrors({});
  };

  const addItem = (fromMaster = false, masterItem?: any) => {
    const newItem: RFQItem = {
      id: `item-${Date.now()}`,
      code: masterItem?.code || "",
      description: masterItem?.description || "",
      specifications: "",
      quantity: 1,
      uom: "",
      requiredDate: "",
    };
    setRFQData((prev) => ({ ...prev, items: [...prev.items, newItem] }));
    toast.success("Item added!");
  };
  const removeItem = (id: string) => {
    setRFQData((prev) => ({
      ...prev,
      items: prev.items.filter((item) => item.id !== id),
    }));
    if (editingId === id) handleCancelRow();
    toast("Item removed", { icon: "🗑️" });
  };

  const addSupplier = (supplier: Supplier) => {
    if (!rfqData.suppliers.some((s) => s.id === supplier.id)) {
      setRFQData((prev) => ({
        ...prev,
        suppliers: [...prev.suppliers, supplier],
      }));
      toast.success(`${supplier.name} added`);
    }
  };
  const removeSupplier = (id: string) => {
    setRFQData((prev) => ({
      ...prev,
      suppliers: prev.suppliers.filter((sup) => sup.id !== id),
    }));
  };

  const handleNext = () => {
    if (validateStep(currentStep))
      setCurrentStep((s) => Math.min(s + 1, steps.length - 1));
  };
  const handleBack = () => setCurrentStep((s) => Math.max(s - 1, 0));

  const submitRFQ = async () => {
    if (validateStep(3)) {
      setIsSubmitting(true);
      await new Promise((res) => setTimeout(res, 1200));
      setRFQData((prev) => ({ ...prev, status: "submitted" }));
      toast.success("RFQ submitted!");
      setIsSubmitting(false);
    }
  };
  const saveDraft = () => toast("Draft saved");

  const renderInitiationStep = () => (
    <Card sx={{ mt: 2 }}>
      <CardContent sx={{ p: 3 }}>
        <Typography fontWeight={600}>Choose Initiation</Typography>
        <Grid container spacing={3} sx={{ mt: 0 }}>
          <Grid item xs={6}>
            <Paper
              sx={{
                p: 2,
                cursor: "pointer",
                border: rfqData.initiationType === "indent" ? 2 : 1,
                borderColor:
                  rfqData.initiationType === "indent"
                    ? "primary.main"
                    : "divider",
              }}
              onClick={() =>
                setRFQData((prev) => ({ ...prev, initiationType: "indent" }))
              }
            >
              <Typography variant="subtitle1" color="primary">
                Indent
              </Typography>
              <Typography variant="caption" color="text.secondary">
                From pre-approved indent requests
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={6}>
            <Paper
              sx={{
                p: 2,
                cursor: "pointer",
                border: rfqData.initiationType === "master" ? 2 : 1,
                borderColor:
                  rfqData.initiationType === "master"
                    ? "primary.main"
                    : "divider",
              }}
              onClick={() =>
                setRFQData((prev) => ({ ...prev, initiationType: "master" }))
              }
            >
              <Typography variant="subtitle1" color="primary">
                Item Master
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Select items from catalog
              </Typography>
            </Paper>
          </Grid>
        </Grid>
        {errors.initiation && (
          <Alert severity="error">{errors.initiation}</Alert>
        )}
        {rfqData.initiationType === "indent" && (
          <FormControl fullWidth sx={{ mt: 2 }}>
            <Select
              value={rfqData.selectedIndent || ""}
              onChange={(e) =>
                setRFQData((prev) => ({
                  ...prev,
                  selectedIndent: e.target.value as string,
                }))
              }
              error={!!errors.indent}
            >
              {availableIndents.map((indent) => (
                <MenuItem key={indent.id} value={indent.id}>
                  {indent.name} ({indent.value})
                </MenuItem>
              ))}
            </Select>
            {errors.indent && (
              <FormHelperText error>{errors.indent}</FormHelperText>
            )}
          </FormControl>
        )}
      </CardContent>
    </Card>
  );

  const renderItemsStep = () => (
    <Card sx={{ mt: 2 }}>
      <CardContent sx={{ p: 3 }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ mb: 2 }}
        >
          <Typography fontWeight={600}>Select & Edit Items</Typography>
          <Button
            variant="contained"
            startIcon={<MdAdd />}
            onClick={() => addItem()}
          >
            Add Item
          </Button>
        </Stack>
        {rfqData.initiationType === "master" && (
          <TextField
            placeholder="Search Item Master"
            size="small"
            sx={{ my: 2 }}
            onChange={(e) => {
              const val = e.target.value.trim().toLowerCase();
              const found = itemMasterData.find(
                (item) =>
                  item.code.toLowerCase().includes(val) ||
                  item.description.toLowerCase().includes(val)
              );
              if (found) addItem(true, found);
            }}
          />
        )}

        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Code</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Spec</TableCell>
                <TableCell>Qty</TableCell>
                <TableCell>UOM</TableCell>
                <TableCell>Req Date</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rfqData.items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7}>
                    <Typography>No items added</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                rfqData.items.map((item, idx) =>
                  editingId === item.id ? (
                    <TableRow key={item.id}>
                      <TableCell>
                        <TextField
                          size="small"
                          value={editingItem.code}
                          onChange={(e) =>
                            setEditingItem({
                              ...editingItem,
                              code: e.target.value,
                            })
                          }
                          error={!!rowErrors.code}
                          helperText={rowErrors.code}
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          size="small"
                          value={editingItem.description}
                          onChange={(e) =>
                            setEditingItem({
                              ...editingItem,
                              description: e.target.value,
                            })
                          }
                          error={!!rowErrors.description}
                          helperText={rowErrors.description}
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          size="small"
                          value={editingItem.specifications}
                          onChange={(e) =>
                            setEditingItem({
                              ...editingItem,
                              specifications: e.target.value,
                            })
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          size="small"
                          type="number"
                          InputProps={{ inputProps: { min: 1 } }}
                          value={editingItem.quantity}
                          onChange={(e) =>
                            setEditingItem({
                              ...editingItem,
                              quantity: Number(e.target.value),
                            })
                          }
                          error={!!rowErrors.quantity}
                          helperText={rowErrors.quantity}
                        />
                      </TableCell>
                      <TableCell>
                        <Select
                          size="small"
                          value={editingItem.uom}
                          onChange={(e) =>
                            setEditingItem({
                              ...editingItem,
                              uom: e.target.value,
                            })
                          }
                          error={!!rowErrors.uom}
                        >
                          <MenuItem value="Nos">Nos</MenuItem>
                          <MenuItem value="Kg">Kg</MenuItem>
                          <MenuItem value="Liters">Liters</MenuItem>
                          <MenuItem value="Meters">Meters</MenuItem>
                          <MenuItem value="Boxes">Boxes</MenuItem>
                          <MenuItem value="Sets">Sets</MenuItem>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <TextField
                          size="small"
                          type="date"
                          value={editingItem.requiredDate}
                          onChange={(e) =>
                            setEditingItem({
                              ...editingItem,
                              requiredDate: e.target.value,
                            })
                          }
                          error={!!rowErrors.requiredDate}
                          helperText={rowErrors.requiredDate}
                        />
                      </TableCell>
                      <TableCell>
                        <Stack direction="row">
                          <IconButton color="success" onClick={handleSaveRow}>
                            <AiOutlineSave />
                          </IconButton>
                          <IconButton color="warning" onClick={handleCancelRow}>
                            <MdClose />
                          </IconButton>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ) : (
                    <TableRow key={item.id} hover>
                      <TableCell>{item.code}</TableCell>
                      <TableCell>{item.description}</TableCell>
                      <TableCell>{item.specifications}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>{item.uom}</TableCell>
                      <TableCell>{item.requiredDate}</TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={0}>
                          <IconButton
                            color="primary"
                            onClick={() => handleEditRow(item)}
                          >
                            <MdEdit />
                          </IconButton>
                          <IconButton
                            color="error"
                            onClick={() => removeItem(item.id)}
                          >
                            <MdDelete />
                          </IconButton>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  )
                )
              )}
            </TableBody>
          </Table>
        </TableContainer>
        {errors.items && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {errors.items}
          </Alert>
        )}
        {Object.keys(errors).filter((k) => k.startsWith("item-")).length >
          0 && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {Object.values(errors)
                .filter((v, i) => i < 3)
                .join(", ")}
              ...
            </Alert>
          )}
      </CardContent>
    </Card>
  );

  const renderSuppliersStep = () => (
    <Card sx={{ mt: 2 }}>
      <CardContent sx={{ p: 3 }}>
        <Typography fontWeight={600} variant="h6">
          Add Suppliers
        </Typography>
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={6}>
            <Typography fontWeight={600} variant="subtitle1">
              Registered Suppliers
            </Typography>
            {registeredSuppliers.map((supplier) => {
              const added = rfqData.suppliers.some((s) => s.id === supplier.id);
              return (
                <Paper
                  key={supplier.id}
                  elevation={0}
                  sx={{
                    p: 2,
                    my: 2,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    border: "1px dashed #222",
                  }}
                >
                  <Box>
                    <Typography fontWeight={500}>{supplier.name}</Typography>
                    <Typography variant="caption">{supplier.email}</Typography>
                  </Box>
                  <Button
                    size="small"
                    variant={added ? "outlined" : "contained"}
                    onClick={() =>
                      addSupplier({ ...supplier, type: "registered" })
                    }
                    startIcon={added ? <MdCheck /> : <MdAdd />}
                    disabled={added}
                  >
                    {added ? "Added" : "Add"}
                  </Button>
                </Paper>
              );
            })}
          </Grid>

          <Grid item xs={6}>
            <Typography fontWeight={600} variant="subtitle1" mb={2}>
              Add New Supplier
            </Typography>
            <TextField
              fullWidth
              placeholder="Supplier Name"
              value={newSupplier.name}
              onChange={(e) =>
                setNewSupplier((prev) => ({ ...prev, name: e.target.value }))
              }
              size="small"
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              placeholder="Email"
              type="email"
              size="small"
              value={newSupplier.email}
              onChange={(e) =>
                setNewSupplier((prev) => ({ ...prev, email: e.target.value }))
              }
              sx={{ mb: 2 }}
            />
            <Button
              variant="contained"
              fullWidth
              onClick={() => {
                if (newSupplier.name && newSupplier.email) {
                  addSupplier({
                    id: `new-${Date.now()}`,
                    ...newSupplier,
                    type: "new",
                  });
                  setNewSupplier({ name: "", email: "" });
                }
              }}
              disabled={!newSupplier.name || !newSupplier.email}
              startIcon={<MdAdd />}
            >
              Add New Supplier
            </Button>
          </Grid>
        </Grid>
        <Stack direction="row" spacing={1} flexWrap="wrap">
          {rfqData.suppliers.map((supplier) => (
            <Chip
              key={supplier.id}
              label={`${supplier.name}`}
              onDelete={() => removeSupplier(supplier.id)}
              color={supplier.type === "registered" ? "primary" : "secondary"}
              sx={{ mb: 1 }}
            />
          ))}
        </Stack>
        {errors.suppliers && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {errors.suppliers}
          </Alert>
        )}
      </CardContent>
    </Card>
  );

  const renderReviewStep = () => (
    <Card sx={{ mt: 2 }}>
      <CardContent sx={{ p: 3 }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography fontWeight={600}>Review & Submit RFQ</Typography>
        </Stack>
        <TableContainer component={Paper} sx={{ my: 2 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Code</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Qty</TableCell>
                <TableCell>UOM</TableCell>
                <TableCell>Required Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rfqData.items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.code}</TableCell>
                  <TableCell>{item.description}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>{item.uom}</TableCell>
                  <TableCell>{item.requiredDate}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <Typography variant="subtitle1" sx={{ mb: 1 }}>
          Suppliers:
        </Typography>
        <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 2 }}>
          {rfqData.suppliers.map((supplier) => (
            <Chip key={supplier.id} label={supplier.name} />
          ))}
        </Stack>
        <Alert severity="info" sx={{ mb: 2, alignItems: "center" }}>
          RFQ Status:{" "}
          <Chip
            label={rfqData.status.toUpperCase()}
            color={rfqData.status === "submitted" ? "success" : "default"}
            sx={{ ml: 2 }}
          />
        </Alert>
        {isSubmitting && <LinearProgress sx={{ mb: 2 }} />}
      </CardContent>
    </Card>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0:
        return renderInitiationStep();
      case 1:
        return renderItemsStep();
      case 2:
        return renderSuppliersStep();
      case 3:
        return renderReviewStep();
      default:
        return null;
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const segments: string[] = window.location.pathname
        .split("/")
        .filter(Boolean);
      setPathArr(segments);
    }
  }, []);

  return (
    <>
      <BreadcrumbsNav pathArr={pathArr} />
      <Paper sx={{ maxWidth: 1400, mx: "auto", p: 3, my: 3, pt: 5 }}>
        <Stepper activeStep={currentStep} sx={{ mb: 4 }}>
          {steps.map((step, idx) => (
            <Step key={step.label}>
              <StepLabel>{step.label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        {renderCurrentStep()}
        <Box display="flex" justifyContent="space-between" mt={4}>
          <Button variant="outlined" startIcon={<MdSave />} onClick={saveDraft}>
            Save Draft
          </Button>
          <Stack direction="row" spacing={2}>
            <Button
              onClick={handleBack}
              disabled={currentStep === 0}
              variant="outlined"
            >
              Back
            </Button>
            {currentStep === steps.length - 1 ? (
              <Button
                variant="contained"
                startIcon={<MdSend />}
                onClick={submitRFQ}
                color="success"
              >
                {isSubmitting ? "Submitting..." : "Submit RFQ"}
              </Button>
            ) : (
              <Button
                variant="contained"
                endIcon={<MdCheck />}
                onClick={handleNext}
              >
                Next
              </Button>
            )}
          </Stack>
        </Box>
      </Paper>
    </>
  );
};
export default CreateQuotationPage;
