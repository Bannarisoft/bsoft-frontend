"use client";
import React from "react";
import {
  Autocomplete,
  Box,
  Tab,
  Tabs,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  Checkbox,
  TableRow,
  TableCell,
  MenuItem,
  Divider,
  Typography,
  useTheme,
  useMediaQuery,
  TableBody,
  Tooltip,
} from "@mui/material";
import { TabContext, TabPanel } from "@mui/lab";
import QuotationAccountTab from "../Quotation/QuotationAccountTab";
import QuotationTermsTab from "../Quotation/QuotationTermsTab";
import CreateQuotationList from "./CreateQuotation";
import { MuiButton } from "bsoft-base-elements";
import {
  ModernTableContainer,
  ModernTableHead,
  ModernTable,
} from "./component/OuotationSmallcomponents";
import { BiArrowBack } from "react-icons/bi";
import { useRouter } from "next/navigation";

type DialogMode = "MR" | "RFQ" | null;

function QuotationTabs() {
  const router = useRouter();
  const theme = useTheme();
  const isSmDown = useMediaQuery(theme.breakpoints.down("sm"));

  const [value, setValue] = React.useState("1");
  const [getItemsFrom, setGetItemsFrom] = React.useState<string | null>(null);

  const handleChange = (_: React.SyntheticEvent, newValue: string) =>
    setValue(newValue);
  const getItemsOptions = [
    "Manual Entry",
    "Select Material Request",
    "Select Request From Quotation",
  ];

  const [dialogMode, setDialogMode] = React.useState<DialogMode>(null);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [nameFilter, setNameFilter] = React.useState("");
  const [dateFilter, setDateFilter] = React.useState<string>("");
  const [statusFilter, setStatusFilter] = React.useState<string>("");
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);

  const rfqRows = React.useMemo(
    () => [
      {
        id: "rfq-1",
        name: "PUR-RFQ-2025-00001",
        transactionDate: "2025-07-16",
      },
      {
        id: "rfq-5",
        name: "PUR-RFQ-2025-00005",
        transactionDate: "2025-08-14",
      },
    ],
    []
  );

  const mrRows = React.useMemo(
    () => [
      {
        id: "mr-1",
        name: "MAT-MR-2025-00001",
        scheduleDate: "2025-07-31",
        status: "Partially Ordered",
      },
      {
        id: "mr-5",
        name: "MAT-MR-2025-00005",
        scheduleDate: "2025-08-30",
        status: "Pending",
      },
      {
        id: "mr-6",
        name: "MAT-MR-2025-00006",
        scheduleDate: "2025-08-29",
        status: "Pending",
      },
    ],
    []
  );

  const filteredRows = React.useMemo(() => {
    const byName = (n: string) =>
      n.toLowerCase().includes(nameFilter.trim().toLowerCase());
    if (dialogMode === "RFQ") {
      return rfqRows.filter(
        (r) =>
          byName(r.name) && (!dateFilter || r.transactionDate === dateFilter)
      );
    }
    if (dialogMode === "MR") {
      return mrRows.filter(
        (r) =>
          byName(r.name) &&
          (!dateFilter || r.scheduleDate === dateFilter) &&
          (!statusFilter || r.status === statusFilter)
      );
    }
    return [];
  }, [dialogMode, rfqRows, mrRows, nameFilter, dateFilter, statusFilter]);

  const handleGetItemsSource = (_: any, v: string | null) => {
    setGetItemsFrom(v);
    if (v === "Select Material Request") {
      setDialogMode("MR");
      openDialog();
    } else if (v === "Select Request From Quotation") {
      setDialogMode("RFQ");
      openDialog();
    } else {
      setDialogMode(null);
    }
  };

  const openDialog = () => {
    setNameFilter("");
    setDateFilter("");
    setStatusFilter("");
    setSelectedIds([]);
    setDialogOpen(true);
  };

  const closeDialog = () => setDialogOpen(false);
  const toggleId = (id: string) =>
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  const onConfirmGetItems = () => {
    const chosen =
      dialogMode === "RFQ"
        ? rfqRows.filter((r) => selectedIds.includes(r.id))
        : mrRows.filter((r) => selectedIds.includes(r.id));
    setDialogOpen(false);
  };

  const handleBack = React.useCallback(() => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/maintanence/dashboard");
    }
  }, [router]);

  return (
    <TabContext value={value}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 2,
          px: 3,
          py: 2,
          bgcolor: "background.paper",
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Tabs
          value={value}
          onChange={handleChange}
          aria-label="quotation tabs"
          variant={isSmDown ? "scrollable" : "standard"}
          scrollButtons={isSmDown ? "auto" : undefined}
          sx={{ minWidth: 280 }}
        >
          <Tab value="1" label="Details" />
          <Tab value="2" label="Address & Contact" />
          <Tab value="3" label="Terms" />
        </Tabs>

        <Box
          display="flex"
          alignItems="center"
          gap={2}
          sx={{ button: { minWidth: 100 } }}
        >
          <Autocomplete
            options={getItemsOptions}
            value={getItemsFrom}
            onChange={handleGetItemsSource}
            sx={{ width: 300 }}
            clearOnEscape
            renderInput={(params) => (
              <TextField
                {...params}
                size="small"
                label="Get items from"
                placeholder="Select source"
                InputLabelProps={{ shrink: true }}
              />
            )}
          />
          <MuiButton variant="contained" size="medium" sx={{ px: 3 }}>
            Save
          </MuiButton>

          <Tooltip title="Back">
            <MuiButton
              variant="outlined"
              size="medium"
              sx={{ px: 3 }}
              startIcon={<BiArrowBack />}
              onClick={handleBack} // <-- wire up back
            >
              Back
            </MuiButton>
          </Tooltip>
        </Box>
      </Box>

      <TabPanel value="1" sx={{ px: 3, pt: 3 }}>
        <CreateQuotationList />
      </TabPanel>
      <TabPanel value="2" sx={{ px: 3, pt: 3 }}>
        <QuotationAccountTab />
      </TabPanel>
      <TabPanel value="3" sx={{ px: 3, pt: 3 }}>
        <QuotationTermsTab />
      </TabPanel>

      <Dialog
        open={dialogOpen}
        onClose={closeDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { boxShadow: theme.shadows[24] } }}
      >
        <DialogTitle sx={{ fontWeight: "bold", fontSize: "1.25rem" }}>
          {dialogMode === "MR"
            ? "Select Material Request"
            : "Select Request for Quotation"}
        </DialogTitle>

        <DialogContent dividers sx={{ pt: 2, px: 3 }}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            sx={{ mb: 2 }}
            alignItems="center"
          >
            <TextField
              label="Name"
              size="small"
              value={nameFilter}
              onChange={(e) => setNameFilter(e.target.value)}
              sx={{ minWidth: 220 }}
              variant="outlined"
            />
            <TextField
              label={dialogMode === "RFQ" ? "Date" : "Required By"}
              size="small"
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ minWidth: 220 }}
              variant="outlined"
            />
            {dialogMode === "MR" && (
              <TextField
                select
                label="Status"
                size="small"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                sx={{ minWidth: 180 }}
                variant="outlined"
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="Pending">Pending</MenuItem>
                <MenuItem value="Partially Ordered">Partially Ordered</MenuItem>
                <MenuItem value="Approved">Approved</MenuItem>
              </TextField>
            )}
            <Box sx={{ flexGrow: 1 }} />
            <Button
              size="small"
              variant="contained"
              onClick={() => {
                setNameFilter("");
                setDateFilter("");
                setStatusFilter("");
              }}
              sx={{ textTransform: "none" }}
            >
              Clear Filters
            </Button>
          </Stack>

          <Divider sx={{ mb: 2 }} />

          <ModernTableContainer
            sx={{
              maxHeight: "50vh",
              overflow: "auto",
              borderRadius: 1,
              border: `1px solid ${theme.palette.divider}`,
              "&::-webkit-scrollbar": { width: 6, height: 6 },
              "&::-webkit-scrollbar-thumb": {
                backgroundColor: theme.palette.action.hover,
                borderRadius: 3,
              },
              "&::-webkit-scrollbar-thumb:hover": {
                backgroundColor: theme.palette.action.selected,
              },
              "&::-webkit-scrollbar-track": {
                backgroundColor: theme.palette.background.default,
              },
              scrollbarWidth: "thin",
              scrollbarColor: `${theme.palette.action.hover} ${theme.palette.background.default}`,
            }}
          >
            <ModernTable stickyHeader size="small">
              <ModernTableHead>
                <TableRow>
                  <TableCell
                    sx={{
                      width: "8%",
                      bgcolor: "#127c9e",
                      color: "white",
                      fontWeight: 700,
                    }}
                  />
                  <TableCell
                    sx={{
                      width: dialogMode === "RFQ" ? "62%" : "46%",
                      bgcolor: "#127c9e",
                      color: "white",
                      fontWeight: 700,
                    }}
                  >
                    Name
                  </TableCell>
                  {dialogMode === "RFQ" ? (
                    <TableCell
                      sx={{
                        width: "30%",
                        bgcolor: "#127c9e",
                        color: "white",
                        fontWeight: 700,
                      }}
                    >
                      Transaction Date
                    </TableCell>
                  ) : (
                    <>
                      <TableCell
                        sx={{
                          width: "28%",
                          bgcolor: "#127c9e",
                          color: "white",
                          fontWeight: 700,
                        }}
                      >
                        Schedule Date
                      </TableCell>
                      <TableCell
                        sx={{
                          width: "18%",
                          bgcolor: "#127c9e",
                          color: "white",
                          fontWeight: 700,
                        }}
                      >
                        Status
                      </TableCell>
                    </>
                  )}
                </TableRow>
              </ModernTableHead>

              <TableBody>
                {filteredRows.map((r: any, idx) => (
                  <TableRow
                    key={r.id}
                    hover
                    onClick={() => toggleId(r.id)}
                    selected={selectedIds.includes(r.id)}
                    sx={{
                      bgcolor:
                        idx % 2 === 0 ? theme.palette.action.hover : "inherit",
                      cursor: "pointer",
                    }}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox
                        size="small"
                        checked={selectedIds.includes(r.id)}
                        onChange={() => toggleId(r.id)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </TableCell>

                    <TableCell>{r.name}</TableCell>

                    {dialogMode === "RFQ" ? (
                      <TableCell>{r.transactionDate}</TableCell>
                    ) : (
                      <>
                        <TableCell>{r.scheduleDate}</TableCell>
                        <TableCell>{r.status}</TableCell>
                      </>
                    )}
                  </TableRow>
                ))}

                {filteredRows.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={dialogMode === "RFQ" ? 3 : 4}
                      align="center"
                      sx={{ py: 4 }}
                    >
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        fontStyle="italic"
                      >
                        No data available
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </ModernTable>
          </ModernTableContainer>
        </DialogContent>

        <DialogActions sx={{ p: 3 }}>
          <Box flexGrow={1} />
          <Button
            variant="outlined"
            onClick={closeDialog}
            sx={{ textTransform: "none", mr: 1 }}
          >
            {dialogMode === "MR"
              ? "Create Material Request"
              : "Create Request for Quotation"}
          </Button>
          <Button
            variant="contained"
            onClick={onConfirmGetItems}
            disabled={selectedIds.length === 0}
            sx={{ textTransform: "none", px: 3 }}
          >
            Get Items
          </Button>
        </DialogActions>
      </Dialog>
    </TabContext>
  );
}

export default QuotationTabs;
