import React from "react";
import { FieldConfig } from "./GeneralPartyInfo";
import {
  Box,
  Checkbox,
  FormControl,
  FormControlLabel,
  TextField,
  useTheme,
  Typography,
  Button,
  IconButton,
  Divider,
  Grid2,
} from "@mui/material";
import { StyledAutocomplete, validateArray } from "../../../../utils/lib";
import { MdAdd } from "react-icons/md";
import { RiDeleteBin6Line } from "react-icons/ri";
import CustomTextField from "../../../atoms/ModernComponents/CustomTextField";

const paymentOptions = ["Cash", "Online", "Cheque"];

const bankCheckboxFields: FieldConfig[] = [
  { name: "isDefaultAccount", label: "Is Default Account", field: "checkbox" },
  { name: "isPrimaryAccount", label: "Is Primary Account", field: "checkbox" },
];

type BankSection = {
  id: string;
  bankAccountNumber: string;
  bankName: string;
  bankBranch: string;
  ifscCode: string;
  swiftCode: string;
  accountType: string;
  isDefaultAccount: boolean;
  isPrimaryAccount: boolean;
};

interface CustomerGroupProps {
  formData: Record<string, any>;
  handleInputChange: (name: string, value: any) => void;
  bankSections: BankSection[];
  onBankSectionsChange: (sections: BankSection[]) => void;
  canEdit?: boolean;
  PaymentMisc: any[];
}

function CustomerGroup({
  formData,
  handleInputChange,
  bankSections,
  onBankSectionsChange,
  canEdit,
  PaymentMisc,
}: CustomerGroupProps) {
  const theme = useTheme();

  const mopOptions = PaymentMisc?.at(0);
  const dueDateOptions = PaymentMisc?.at(1);
  const accOptions = PaymentMisc?.at(2);
  const cusOptions = PaymentMisc?.at(3);

  const customerGroupFields: FieldConfig[] = [
    {
      name: "modeOfPayment",
      label: "Mode of Payment",
      field: "dropdown",
      options: mopOptions || [],
      optionLabel: ["code"],
    },
    {
      name: "preferredCurrencyForPurchase",
      label: "Preferred Currency for Purchase",
      field: "input",
      type: "supplier",
    },
    {
      name: "creditDays",
      label: "Credit Days",
      field: "input",
    },
    {
      name: "dueDate",
      label: "Due Date Based On",
      field: "dropdown",
      options: dueDateOptions || [],
      optionLabel: ["code"],
    },
    {
      name: "leadTime",
      label: "Lead Time",
      field: "input",
      type: "supplier",
    },
    {
      name: "preferredCurrencyForSale",
      label: "Preferred Currency for Sale",
      field: "input",
      type: "customer",
    },
    {
      name: "creditLimit",
      label: "Credit Limit",
      field: "input",
    },
    {
      name: "priceList",
      label: "Price List (Selling)",
      field: "dropdown",
      type: "customer",
    },
    {
      name: "customerType",
      label: "Customer Type",
      field: "dropdown",
      options: cusOptions || [],
      type: "customer",
      optionLabel: ["code"],
    },
    {
      name: "isInternalSupplier",
      label: "Is Internal Supplier",
      field: "checkbox",
      type: "supplier",
    },
    {
      name: "isInternalCustomer",
      label: "Is Internal Customer",
      field: "checkbox",
      type: "customer",
    },
    {
      name: "stopPayments",
      label: "Stop Payments",
      field: "checkbox",
    },
  ];

  const bankDetailsFields: FieldConfig[] = [
    {
      name: "bankAccountNumber",
      label: "Bank Account Number",
      isRequired: true,
      field: "input",
    },
    { name: "bankName", label: "Bank Name", isRequired: true, field: "input" },
    { name: "bankBranch", label: "Bank Branch", field: "input" },
    { name: "ifscCode", label: "IFSC Code", isRequired: true, field: "input" },
    { name: "swiftCode", label: "SWIFT Code", field: "input" },
    {
      name: "accountType",
      label: "Account Type",
      field: "dropdown",
      options: accOptions || [],
      optionLabel: ["code"],
    },
  ];

  const canAddSecondBank = bankSections.length < 2;

  const addBankSection = () => {
    if (bankSections.length < 2) {
      const newBank: BankSection = {
        id: `bank-${Date.now()}`,
        bankAccountNumber: "",
        bankName: "",
        bankBranch: "",
        ifscCode: "",
        swiftCode: "",
        accountType: "",
        isDefaultAccount: false,
        isPrimaryAccount: false,
      };
      onBankSectionsChange([...bankSections, newBank]);
    }
  };

  const removeBankSection = (id: string) => {
    if (bankSections.length > 1) {
      onBankSectionsChange(bankSections.filter((section) => section.id !== id));
    }
  };

  const updateBankSection = (id: string, field: string, value: any) => {
    onBankSectionsChange(
      bankSections.map((section) =>
        section.id === id ? { ...section, [field]: value } : section
      )
    );
  };

  function GetFields() {
    const isSupplier =
      validateArray(formData.partyType) &&
      formData.partyType.some((i: any) =>
        i.code.toLowerCase().includes("supplier")
      );
    const isCustomer =
      validateArray(formData.partyType) &&
      formData.partyType.some((i: any) =>
        i.code.toLowerCase().includes("customer")
      );
    const isBoth = isSupplier && isCustomer;

    if (isCustomer) {
      return customerGroupFields.filter((i) => !i.type?.includes("supplier"));
    }
    if (isSupplier) {
      return customerGroupFields.filter((i) => !i.type?.includes("customer"));
    }
    if (isBoth) {
      return customerGroupFields;
    } else {
      return customerGroupFields.filter(
        (i) => i.type !== "supplier" && i.type !== "customer"
      );
    }
  }

  const renderField = (
    {
      name,
      label,
      type,
      isRequired,
      field = "input",
      options,
      multiple,
      optionLabel,
      isDisable,
    }: FieldConfig,
    value: any,
    onChange: (value: any) => void
  ) => (
    <Grid2 size={{ xs: 12, sm: 6, md: 3 }} key={name}>
      {field === "input" && (
        <FormControl fullWidth>
          <Typography
            variant="body2"
            sx={{
              mb: 1,
              fontWeight: 500,
              color: theme.palette.text.primary,
            }}
          >
            {label}
            {isRequired && (
              <Typography
                component="span"
                sx={{ fontSize: "initial !important" }}
                color="error.main"
              >
                *
              </Typography>
            )}
          </Typography>
          <TextField
            fullWidth
            type={type}
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            sx={{
              "& .MuiOutlinedInput-root": {
                height: "40px",
                fontSize: "0.875rem",
              },
            }}
          />
        </FormControl>
      )}
      {field === "dropdown" && (
        <FormControl fullWidth>
          <Typography
            variant="body2"
            sx={{
              mb: 1,
              fontWeight: 500,
              color: theme.palette.text.primary,
            }}
          >
            {label}
            {isRequired && (
              <Typography
                component="span"
                sx={{ fontSize: "initial !important" }}
                color="error.main"
              >
                *
              </Typography>
            )}
          </Typography>
          <StyledAutocomplete
            multiple={multiple || false}
            options={options || []}
            disableCloseOnSelect={multiple}
            value={multiple ? value || [] : value}
            onChange={(event, newValue) => onChange(newValue || "")}
            className="styledAutocomplete"
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
      {field === "checkbox" && (
        <FormControlLabel
          control={
            <Checkbox
              checked={value || false}
              onChange={(e) => onChange(e.target.checked)}
              size="medium"
            />
          }
          sx={{ mt: 3 }}
          label={
            <Typography
              variant="body2"
              sx={{
                fontWeight: 500,
                color: theme.palette.text.primary,
              }}
            >
              {label}
            </Typography>
          }
        />
      )}
    </Grid2>
  );

  const renderFields = (fields: FieldConfig[]) => (
    <Grid2 container spacing={2}>
      {fields.map((fieldConfig) => (
        <React.Fragment key={fieldConfig.name}>
          {renderField(fieldConfig, formData[fieldConfig.name], (value) =>
            handleInputChange(fieldConfig.name, value)
          )}
        </React.Fragment>
      ))}
    </Grid2>
  );

  const renderBankSection = (bank: BankSection, index: number) => (
    <Box key={bank.id}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Bank Account {index + 1}
        </Typography>
        {bank.isPrimaryAccount && (
          <Typography
            variant="caption"
            sx={{
              bgcolor: "primary.main",
              color: "white",
              px: 1,
              py: 0.25,
              borderRadius: 1,
              fontSize: "0.75rem",
            }}
          >
            (Primary)
          </Typography>
        )}
        {!bank.isPrimaryAccount && index === 1 && (
          <Typography
            variant="caption"
            sx={{
              bgcolor: "secondary.main",
              color: "white",
              px: 1,
              py: 0.25,
              borderRadius: 1,
              fontSize: "0.75rem",
            }}
          >
            (Secondary)
          </Typography>
        )}
        {bank.isDefaultAccount && (
          <Typography
            variant="caption"
            sx={{
              bgcolor: "success.main",
              color: "white",
              px: 1,
              py: 0.25,
              borderRadius: 1,
              fontSize: "0.75rem",
            }}
          >
            (Default)
          </Typography>
        )}
        {bankSections.length > 1 && (
          <IconButton
            onClick={() => removeBankSection(bank.id)}
            size="small"
            sx={{ color: "error.main" }}
          >
            <RiDeleteBin6Line />
          </IconButton>
        )}
      </Box>
      <Box display={"flex"} alignItems={"center"} mb={2} gap={3}>
        {bankCheckboxFields.map((field) => (
          <React.Fragment key={field.name}>
            {renderField(
              field,
              bank[field.name as keyof BankSection],
              (value) => updateBankSection(bank.id, field.name, value)
            )}
          </React.Fragment>
        ))}
      </Box>
      <Grid2 container spacing={2}>
        {bankDetailsFields.map((field) => (
          <React.Fragment key={field.name}>
            {renderField(
              field,
              bank[field.name as keyof BankSection],
              (value) => updateBankSection(bank.id, field.name, value)
            )}
          </React.Fragment>
        ))}
      </Grid2>
      {index < bankSections.length - 1 && <Divider sx={{ my: 3 }} />}
    </Box>
  );

  return (
    <Box sx={{ pointerEvents: !canEdit ? "none" : undefined }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
          Payment Preferences
        </Typography>
        {renderFields(GetFields())}
      </Box>

      <Box p={2} bgcolor={"#fafafa"}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
          Bank Details
        </Typography>
        {bankSections.map((bank, index) => renderBankSection(bank, index))}
        {canAddSecondBank && (
          <Button
            variant="outlined"
            startIcon={<MdAdd />}
            onClick={addBankSection}
            sx={{
              mt: 2,
              borderColor: theme.palette.primary.main,
              color: theme.palette.primary.main,
              "&:hover": {
                backgroundColor: theme.palette.primary.light,
                borderColor: theme.palette.primary.main,
                color: "#fff",
                borderRadius: 1,
              },
            }}
          >
            Add Second Bank Account
          </Button>
        )}
      </Box>
    </Box>
  );
}

export default CustomerGroup;
