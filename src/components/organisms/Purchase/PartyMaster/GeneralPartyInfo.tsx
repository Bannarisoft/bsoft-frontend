"use client";

import React from "react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  Box,
  Grid,
  useTheme,
  Button,
  Checkbox,
  FormControlLabel,
  Typography,
  FormControl,
  Divider,
  IconButton,
  InputAdornment,
  CircularProgress,
} from "@mui/material";
import { FaCirclePlus } from "react-icons/fa6";
import { FaMinusCircle } from "react-icons/fa";
import { MdAdd } from "react-icons/md";
import { RiDeleteBin6Line } from "react-icons/ri";
import { StyledAutocomplete } from "../../../../utils/lib";

interface GeneralPartyInfoProps {
  formData: Record<string, any>;
  handleInputChange: (name: string, value: any) => void;
  contactSections: ContactSection[];
  addressSections: AddressSection[];
  bankSections: BankSection[];
  expandedAccordion: string | false;
  onContactSectionsChange: (sections: ContactSection[]) => void;
  onAddressSectionsChange: (sections: AddressSection[]) => void;
  onBankSectionsChange: (sections: BankSection[]) => void;
  onExpandedAccordionChange: (expanded: string | false) => void;
  handlePincodeChange: (
    sectionId: string,
    pincode: string,
    sectionType: "address"
  ) => void;
  isLoadingLocation: boolean;
}

export type FieldConfig = {
  name: string;
  label: string;
  type?: string;
  isRequired?: boolean;
  field?: "input" | "dropdown" | "switch" | "image" | "checkbox";
  options?: any;
};

type ContactSection = {
  id: string;
  firstName: string;
  lastName: string;
  gender: string;
  designation: string;
  emailId: string;
  mobileNo: string;
  phone: string;
  preferredCommunicationChannel: string;
  contactType: string;
  isPrimaryContact: boolean;
  isBillingContact: boolean;
  isShippingContact: boolean;
};

type AddressSection = {
  id: string;
  addressType: string;
  primaryAddress: boolean;
  isShippingAddress: boolean;
  isBillingAddress: boolean;
  addressLine1: string;
  addressLine2: string;
  pincode: string;
  country: string;
  state: string;
  city: string;
  gstState: string;
  gstStateCode: string;
};

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

const sampleOptions = ["Option 1", "Option 2", "Option 3"];
const partyTypeOptions = ["Supplier", "Customer", "Agent", "Transporter"];
const partyGroupOptions = ["Cotton Suppliers", "Yarn Customers", "Transporter"];
const status = ["Active", "In-Active", "Block"];
const genderOptions = ["Male", "Female", "Others"];
const prefferedCommunication = ["Whatsapp", "Email", "SMS", "Telegram"];
const registartionOption = [
  "Company",
  "Individual",
  "Partnership",
  "Un-Registered",
];

const partyDetailsFields: FieldConfig[] = [
  { name: "legalName", label: "Legal Name", isRequired: true, field: "input" },
  {
    name: "registrationType",
    label: "Registration Type",
    isRequired: true,
    field: "dropdown",
    options: registartionOption,
  },
  {
    name: "partyType",
    label: "Party Type",
    isRequired: true,
    field: "dropdown",
    options: partyTypeOptions,
  },
  { name: "gstNumber", label: "GST Number", field: "input" },
  {
    name: "partyGroup",
    label: "Party Group",
    isRequired: true,
    field: "dropdown",
    options: partyGroupOptions,
  },
  { name: "status", label: "Status", field: "dropdown", options: status },
];

const contactInfoFields: FieldConfig[] = [
  { name: "firstName", label: "First Name", isRequired: true, field: "input" },
  { name: "lastName", label: "Last Name", field: "input" },
  {
    name: "gender",
    label: "Gender",
    field: "dropdown",
    options: genderOptions,
  },
  { name: "designation", label: "Designation", field: "input" },
  { name: "emailId", label: "Email ID", type: "email", field: "input" },
  {
    name: "mobileNo",
    label: "Mobile No",
    type: "tel",
    isRequired: true,
    field: "input",
  },
  { name: "phone", label: "Phone", type: "tel", field: "input" },
  {
    name: "preferredCommunicationChannel",
    label: "Preferred Communication Channel",
    field: "dropdown",
    options: prefferedCommunication,
  },
  {
    name: "contactType",
    label: "Contact Type",
    field: "dropdown",
    options: ["Personal", "Business"],
  },
];

// const contactCheckboxFields: FieldConfig[] = [
//   { name: "isPrimaryContact", label: "Is Primary Contact", field: "checkbox" },
//   { name: "isBillingContact", label: "Is Billing Contact", field: "checkbox" },
//   {
//     name: "isShippingContact",
//     label: "Is Shipping Contact",
//     field: "checkbox",
//   },
// ];

const addressFields: FieldConfig[] = [
  {
    name: "addressLine1",
    label: "Address Line 1",
    type: "text",
    field: "input",
  },
  {
    name: "addressLine2",
    label: "Address Line 2",
    type: "text",
    field: "input",
  },
  { name: "pincode", label: "Pincode", field: "input" },
  { name: "country", label: "Country", field: "input" },
  { name: "state", label: "State", field: "input" },
  { name: "city", label: "City", field: "input" },
];

const addressCheckboxFields: FieldConfig[] = [
  { name: "primaryAddress", label: "Primary Address", field: "checkbox" },
  {
    name: "isShippingAddress",
    label: "Is Shipping Address",
    field: "checkbox",
  },
  { name: "isBillingAddress", label: "Is Billing Address", field: "checkbox" },
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
    options: ["Savings", "Current"],
  },
];

const bankCheckboxFields: FieldConfig[] = [
  { name: "isDefaultAccount", label: "Is Default Account", field: "checkbox" },
  { name: "isPrimaryAccount", label: "Is Primary Account", field: "checkbox" },
];

function GeneralPartyInfo({
  formData,
  handleInputChange,
  contactSections,
  addressSections,
  bankSections,
  expandedAccordion,
  onContactSectionsChange,
  onAddressSectionsChange,
  onBankSectionsChange,
  onExpandedAccordionChange,
  handlePincodeChange,
  isLoadingLocation,
}: GeneralPartyInfoProps) {
  const theme = useTheme();

  const needsBillingContact = !contactSections.some(
    (contact) => contact.isBillingContact
  );
  const needsShippingContact = !contactSections.some(
    (contact) => contact.isShippingContact
  );
  const needsBillingAddress = !addressSections.some(
    (address) => address.isBillingAddress
  );
  const needsShippingAddress = !addressSections.some(
    (address) => address.isShippingAddress
  );

  const canAddSecondBank = bankSections.length < 2;

  const addContactSection = (type: "billing" | "shipping") => {
    const newContact: ContactSection = {
      id: `contact-${Date.now()}`,
      firstName: "",
      lastName: "",
      gender: "",
      designation: "",
      emailId: "",
      mobileNo: "",
      phone: "",
      preferredCommunicationChannel: "",
      contactType: "",
      isPrimaryContact: false,
      isBillingContact: type === "billing",
      isShippingContact: type === "shipping",
    };
    onContactSectionsChange([...contactSections, newContact]);
  };

  const addAddressSection = (type: "billing" | "shipping") => {
    const newAddress: AddressSection = {
      id: `address-${Date.now()}`,
      addressType: "",
      primaryAddress: false,
      isShippingAddress: type === "shipping",
      isBillingAddress: type === "billing",
      addressLine1: "",
      addressLine2: "",
      pincode: "",
      country: "",
      state: "",
      city: "",
      gstState: "",
      gstStateCode: "",
    };
    onAddressSectionsChange([...addressSections, newAddress]);
  };

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

  const removeContactSection = (id: string) => {
    if (contactSections.length > 1) {
      onContactSectionsChange(
        contactSections.filter((section) => section.id !== id)
      );
    }
  };

  const removeAddressSection = (id: string) => {
    if (addressSections.length > 1) {
      onAddressSectionsChange(
        addressSections.filter((section) => section.id !== id)
      );
    }
  };

  const removeBankSection = (id: string) => {
    if (bankSections.length > 1) {
      onBankSectionsChange(bankSections.filter((section) => section.id !== id));
    }
  };

  const updateContactSection = (id: string, field: string, value: any) => {
    onContactSectionsChange(
      contactSections.map((section) =>
        section.id === id ? { ...section, [field]: value } : section
      )
    );
  };

  const updateAddressSection = (id: string, field: string, value: any) => {
    onAddressSectionsChange(
      addressSections.map((section) =>
        section.id === id ? { ...section, [field]: value } : section
      )
    );
  };

  const updateBankSection = (id: string, field: string, value: any) => {
    onBankSectionsChange(
      bankSections.map((section) =>
        section.id === id ? { ...section, [field]: value } : section
      )
    );
  };

  const renderField = (
    { name, label, type, isRequired, field = "input", options }: FieldConfig,
    value: any,
    onChange: (value: any) => void
  ) => (
    <Box
      sx={{
        minHeight: "80px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
      }}
    >
      {field === "input" && (
        <FormControl fullWidth>
          <Typography
            variant="body2"
            sx={{
              mb: 1,
              fontWeight: 500,
              color: theme.palette.text.primary,
              fontSize: "0.875rem",
            }}
          >
            {label}
            {isRequired && (
              <Typography
                component="span"
                sx={{
                  color: "error.main",
                  ml: 0.5,
                  fontSize: "inherit !important",
                }}
              >
                *
              </Typography>
            )}
          </Typography>
          <TextField
            fullWidth
            type={type || "text"}
            variant="outlined"
            size="small"
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            sx={{
              "& .MuiOutlinedInput-root": {
                height: "40px",
                fontSize: "0.875rem",
              },
            }}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    {["country", "state", "city", "gstState"].includes(
                      label.toLowerCase()
                    ) &&
                      isLoadingLocation && <CircularProgress size={20} />}
                  </InputAdornment>
                ),
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
              fontSize: "0.875rem",
            }}
          >
            {label}
            {isRequired && (
              <Typography
                component="span"
                sx={{
                  color: "error.main",
                  ml: 0.5,
                  fontSize: "inherit !important",
                }}
              >
                *
              </Typography>
            )}
          </Typography>
          <StyledAutocomplete
            disablePortal
            options={options || sampleOptions}
            value={value || null}
            onChange={(_, newValue) => onChange(newValue)}
            renderInput={(params) => (
              <TextField
                {...params}
                variant="outlined"
                size="small"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    height: "40px",
                    fontSize: "0.875rem",
                  },
                }}
              />
            )}
          />
        </FormControl>
      )}

      {field === "checkbox" && (
        <Box sx={{ my: "auto" }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={value || false}
                onChange={(e) => onChange(e.target.checked)}
                size="medium"
              />
            }
            label={
              <Typography
                variant="body2"
                sx={{ fontSize: "0.875rem", fontWeight: 500 }}
              >
                {label}
              </Typography>
            }
          />
        </Box>
      )}
    </Box>
  );

  const renderFields = (fields: FieldConfig[]) => (
    <Grid container spacing={2}>
      {fields.map((fieldConfig) => (
        <Grid item xs={12} sm={6} md={4} key={fieldConfig.name}>
          {renderField(fieldConfig, formData[fieldConfig.name], (value) =>
            handleInputChange(fieldConfig.name, value)
          )}
        </Grid>
      ))}
    </Grid>
  );

  const renderContactSection = (contact: ContactSection, index: number) => (
    <Box key={contact.id} sx={{ mb: 3 }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 2,
        }}
      >
        <Typography
          variant="subtitle1"
          sx={{ fontWeight: 600, color: theme.palette.text.primary }}
        >
          Contact {index + 1}
          {contact.isBillingContact && (
            <Typography
              component="span"
              sx={{
                ml: 1,
                color: "primary.main",
                fontSize: "0.75rem",
                fontWeight: 500,
              }}
            >
              (Billing)
            </Typography>
          )}
          {contact.isShippingContact && (
            <Typography
              component="span"
              sx={{
                ml: 1,
                color: "secondary.main",
                fontSize: "0.75rem",
                fontWeight: 500,
              }}
            >
              (Shipping)
            </Typography>
          )}
        </Typography>
        {contactSections.length > 1 && (
          <IconButton
            onClick={() => removeContactSection(contact.id)}
            size="small"
            sx={{ color: "error.main" }}
          >
            <RiDeleteBin6Line size={20} />
          </IconButton>
        )}
      </Box>

      <Grid container spacing={2}>
        {/* {contactCheckboxFields.map((field) => (
          <Grid item xs={12} sm={6} md={4} key={field.name}>
            {renderField(
              field,
              contact[field.name as keyof ContactSection],
              (value) => updateContactSection(contact.id, field.name, value)
            )}
          </Grid>
        ))} */}
        {contactInfoFields.map((field) => (
          <Grid item xs={12} sm={6} md={4} key={field.name}>
            {renderField(
              field,
              contact[field.name as keyof ContactSection],
              (value) => updateContactSection(contact.id, field.name, value)
            )}
          </Grid>
        ))}
      </Grid>

      {index < contactSections.length - 1 && <Divider sx={{ mt: 3 }} />}
    </Box>
  );

  const renderAddressSection = (address: AddressSection, index: number) => (
    <Box key={address.id} sx={{ mb: 3 }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 2,
        }}
      >
        <Typography
          variant="subtitle1"
          sx={{ fontWeight: 600, color: theme.palette.text.primary }}
        >
          Address {index + 1}
          {address.isBillingAddress && (
            <Typography
              component="span"
              sx={{
                ml: 1,
                color: "primary.main",
                fontSize: "0.75rem",
                fontWeight: 500,
              }}
            >
              (Billing)
            </Typography>
          )}
          {address.isShippingAddress && (
            <Typography
              component="span"
              sx={{
                ml: 1,
                color: "secondary.main",
                fontSize: "0.75rem",
                fontWeight: 500,
              }}
            >
              (Shipping)
            </Typography>
          )}
        </Typography>
        {addressSections.length > 1 && (
          <IconButton
            onClick={() => removeAddressSection(address.id)}
            size="small"
            sx={{ color: "error.main" }}
          >
            <RiDeleteBin6Line size={20} />
          </IconButton>
        )}
      </Box>

      <Grid container spacing={2}>
        {addressCheckboxFields.map((field) => (
          <Grid item xs={12} sm={6} md={4} key={field.name}>
            {renderField(
              field,
              address[field.name as keyof AddressSection],
              (value) => updateAddressSection(address.id, field.name, value)
            )}
          </Grid>
        ))}

        {addressFields.map((field) => (
          <Grid item xs={12} sm={6} md={4} key={field.name}>
            {field.name === "pincode" ? (
              <Box
                sx={{
                  minHeight: "80px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "flex-start",
                }}
              >
                <FormControl fullWidth>
                  <Typography
                    variant="body2"
                    sx={{
                      mb: 1,
                      fontWeight: 500,
                      color: theme.palette.text.primary,
                      fontSize: "0.875rem",
                    }}
                  >
                    {field.label}
                    {field.isRequired && (
                      <Typography
                        component="span"
                        sx={{
                          color: "error.main",
                          ml: 0.5,
                          fontSize: "inherit !important",
                        }}
                      >
                        *
                      </Typography>
                    )}
                  </Typography>
                  <TextField
                    fullWidth
                    type="text"
                    variant="outlined"
                    size="small"
                    value={address.pincode || ""}
                    onChange={(e) => {
                      const newPincode = e.target.value;
                      if (/^\d{0,6}$/.test(newPincode)) {
                        handlePincodeChange(address.id, newPincode, "address");
                      }
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        height: "40px",
                        fontSize: "0.875rem",
                      },
                    }}
                  />
                </FormControl>
              </Box>
            ) : (
              renderField(
                field,
                address[field.name as keyof AddressSection],
                (value) => updateAddressSection(address.id, field.name, value)
              )
            )}
          </Grid>
        ))}
      </Grid>

      {index < addressSections.length - 1 && <Divider sx={{ mt: 3 }} />}
    </Box>
  );

  const renderBankSection = (bank: BankSection, index: number) => (
    <Box key={bank.id} sx={{ mb: 3 }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 2,
        }}
      >
        <Typography
          variant="subtitle1"
          sx={{ fontWeight: 600, color: theme.palette.text.primary }}
        >
          Bank Account {index + 1}
          {bank.isPrimaryAccount && (
            <Typography
              component="span"
              sx={{
                ml: 1,
                color: "primary.main",
                fontSize: "0.75rem",
                fontWeight: 500,
              }}
            >
              (Primary)
            </Typography>
          )}
          {!bank.isPrimaryAccount && index === 1 && (
            <Typography
              component="span"
              sx={{
                ml: 1,
                color: "secondary.main",
                fontSize: "0.75rem",
                fontWeight: 500,
              }}
            >
              (Secondary)
            </Typography>
          )}
          {bank.isDefaultAccount && (
            <Typography
              component="span"
              sx={{
                ml: 1,
                color: "success.main",
                fontSize: "0.75rem",
                fontWeight: 500,
              }}
            >
              (Default)
            </Typography>
          )}
        </Typography>
        {bankSections.length > 1 && (
          <IconButton
            onClick={() => removeBankSection(bank.id)}
            size="small"
            sx={{ color: "error.main" }}
          >
            <RiDeleteBin6Line size={20} />
          </IconButton>
        )}
      </Box>

      <Grid container spacing={2}>
        {bankCheckboxFields.map((field) => (
          <Grid item xs={12} sm={6} md={4} key={field.name}>
            {renderField(
              field,
              bank[field.name as keyof BankSection],
              (value) => updateBankSection(bank.id, field.name, value)
            )}
          </Grid>
        ))}
      </Grid>
      <Grid container spacing={2}>
        {bankDetailsFields.map((field) => (
          <Grid item xs={12} sm={6} md={4} key={field.name}>
            {renderField(
              field,
              bank[field.name as keyof BankSection],
              (value) => updateBankSection(bank.id, field.name, value)
            )}
          </Grid>
        ))}
      </Grid>

      {index < bankSections.length - 1 && <Divider sx={{ mt: 3 }} />}
    </Box>
  );

  const accordionSx = (panelKey: string) => ({
    borderRadius: 2,
    border: "1px solid #e0e0e0",
    backgroundColor: "#fafafa",
    boxShadow:
      expandedAccordion === panelKey ? "0 4px 12px rgba(0,0,0,0.05)" : "none",
    borderLeft:
      expandedAccordion === panelKey
        ? `4px solid ${theme.palette.primary.main}`
        : "4px solid #e0e0e0",
    transition: "all 0.3s ease-in-out",
    "&:before": { display: "none" },
    mb: 2,
  });

  return (
    <Box>
      <Accordion
        expanded={expandedAccordion === "panel1"}
        onChange={(_, isExp) =>
          onExpandedAccordionChange(isExp ? "panel1" : false)
        }
        sx={accordionSx("panel1")}
        elevation={0}
        defaultExpanded
      >
        <AccordionSummary aria-controls="panel1d-content" id="panel1d-header">
          {expandedAccordion === "panel1" ? (
            <FaMinusCircle
              color={theme.palette.primary.main}
              size={20}
              style={{ flexShrink: 0 }}
            />
          ) : (
            <FaCirclePlus color="#79C7C7" size={20} style={{ flexShrink: 0 }} />
          )}
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              fontSize: "1.1rem",
              color: theme.palette.text.primary,
              ml: 1,
            }}
          >
            Party Details
          </Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ px: 3, pb: 3, mt: 2 }}>
          {renderFields(partyDetailsFields)}
        </AccordionDetails>
      </Accordion>

      <Accordion
        expanded={expandedAccordion === "panel2"}
        onChange={(_, isExp) =>
          onExpandedAccordionChange(isExp ? "panel2" : false)
        }
        sx={accordionSx("panel2")}
        elevation={0}
      >
        <AccordionSummary aria-controls="panel2d-content" id="panel2d-header">
          {expandedAccordion === "panel2" ? (
            <FaMinusCircle
              color={theme.palette.primary.main}
              size={20}
              style={{ flexShrink: 0 }}
            />
          ) : (
            <FaCirclePlus color="#79C7C7" size={20} style={{ flexShrink: 0 }} />
          )}
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              fontSize: "1.1rem",
              color: theme.palette.text.primary,
              ml: 1,
            }}
          >
            Contact Details
          </Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ px: 3, pb: 3, mt: 2 }}>
          {contactSections.map((contact, index) =>
            renderContactSection(contact, index)
          )}
          {/* <Box sx={{ display: "flex", gap: 2, mt: 3, flexWrap: "wrap" }}>
            {needsBillingContact && (
              <Button
                variant="outlined"
                startIcon={<MdAdd />}
                onClick={() => addContactSection("billing")}
                sx={{
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
                Add Billing Contact
              </Button>
            )}
            {needsShippingContact && (
              <Button
                variant="outlined"
                startIcon={<MdAdd />}
                onClick={() => addContactSection("shipping")}
                sx={{
                  borderColor: theme.palette.secondary.main,
                  color: theme.palette.secondary.main,
                  "&:hover": {
                    backgroundColor: theme.palette.secondary.light,
                    borderColor: theme.palette.secondary.main,
                    color: "#fff",
                    borderRadius: 1,
                  },
                }}
              >
                Add Shipping Contact
              </Button>
            )}
          </Box> */}
        </AccordionDetails>
      </Accordion>

      <Accordion
        expanded={expandedAccordion === "panel3"}
        onChange={(_, isExp) =>
          onExpandedAccordionChange(isExp ? "panel3" : false)
        }
        sx={accordionSx("panel3")}
        elevation={0}
      >
        <AccordionSummary aria-controls="panel3d-content" id="panel3d-header">
          {expandedAccordion === "panel3" ? (
            <FaMinusCircle
              color={theme.palette.primary.main}
              size={20}
              style={{ flexShrink: 0 }}
            />
          ) : (
            <FaCirclePlus color="#79C7C7" size={20} style={{ flexShrink: 0 }} />
          )}
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              fontSize: "1.1rem",
              color: theme.palette.text.primary,
              ml: 1,
            }}
          >
            Address Details
          </Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ px: 3, pb: 3, mt: 2 }}>
          {addressSections.map((address, index) =>
            renderAddressSection(address, index)
          )}
          <Box sx={{ display: "flex", gap: 2, mt: 3, flexWrap: "wrap" }}>
            {needsBillingAddress && (
              <Button
                variant="outlined"
                startIcon={<MdAdd />}
                onClick={() => addAddressSection("billing")}
                sx={{
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
                Add Billing Address
              </Button>
            )}
            {needsShippingAddress && (
              <Button
                variant="outlined"
                startIcon={<MdAdd />}
                onClick={() => addAddressSection("shipping")}
                sx={{
                  borderColor: theme.palette.secondary.main,
                  color: theme.palette.secondary.main,
                  "&:hover": {
                    backgroundColor: theme.palette.secondary.light,
                    borderColor: theme.palette.secondary.main,
                    color: "#fff",
                    borderRadius: 1,
                  },
                }}
              >
                Add Shipping Address
              </Button>
            )}
          </Box>
        </AccordionDetails>
      </Accordion>

      <Accordion
        expanded={expandedAccordion === "panel4"}
        onChange={(_, isExp) =>
          onExpandedAccordionChange(isExp ? "panel4" : false)
        }
        sx={accordionSx("panel4")}
        elevation={0}
      >
        <AccordionSummary aria-controls="panel4d-content" id="panel4d-header">
          {expandedAccordion === "panel4" ? (
            <FaMinusCircle
              color={theme.palette.primary.main}
              size={20}
              style={{ flexShrink: 0 }}
            />
          ) : (
            <FaCirclePlus color="#79C7C7" size={20} style={{ flexShrink: 0 }} />
          )}
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              fontSize: "1.1rem",
              color: theme.palette.text.primary,
              ml: 1,
            }}
          >
            Bank Details
          </Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ px: 3, pb: 3, mt: 2 }}>
          {bankSections.map((bank, index) => renderBankSection(bank, index))}
          {canAddSecondBank && (
            <Box sx={{ display: "flex", gap: 2, mt: 3, flexWrap: "wrap" }}>
              <Button
                variant="outlined"
                startIcon={<MdAdd />}
                onClick={addBankSection}
                sx={{
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
            </Box>
          )}
        </AccordionDetails>
      </Accordion>
    </Box>
  );
}

export default GeneralPartyInfo;
