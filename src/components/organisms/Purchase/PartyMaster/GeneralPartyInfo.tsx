"use client";

import React from "react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Box,
  Grid,
  useTheme,
  Button,
  Checkbox,
  FormControlLabel,
  FormControl,
  Divider,
  IconButton,
  InputAdornment,
  CircularProgress,
  TextField,
} from "@mui/material";
import { FaCirclePlus } from "react-icons/fa6";
import { FaMinusCircle } from "react-icons/fa";
import { MdAdd } from "react-icons/md";
import { RiDeleteBin6Line } from "react-icons/ri";
import { StyledAutocomplete } from "../../../../utils/lib";
import { MuiText } from "bsoft-base-elements";
import CustomTextField from "../../../atoms/ModernComponents/CustomTextField";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";

interface GeneralPartyInfoProps {
  partyState: Record<string, any>;
  handleInputChange: (name: string, value: any) => void;
  contactSections: ContactSection[];
  addressSections: AddressSection[];
  expandedAccordion: string | false;
  onContactSectionsChange: (sections: ContactSection[]) => void;
  onAddressSectionsChange: (sections: AddressSection[]) => void;
  onExpandedAccordionChange: (expanded: string | false) => void;
  handlePincodeChange: (
    sectionId: string,
    pincode: string,
    sectionType: "address"
  ) => void;
  isLoadingLocation: boolean;
  isLoadingGst: boolean;
  regFlag: boolean;
  GeneralInfoMisc: any[];
  canEdit?: boolean;
  errors: string[];
  // setErrors: React.Dispatch<React.SetStateAction<string[]>>;
}

export type FieldConfig = {
  name: string;
  label: string;
  type?: string;
  isRequired?: boolean;
  field?: "input" | "dropdown" | "switch" | "image" | "checkbox" | "picker";
  options?: any;
  isDisable?: boolean;
  multiple?: boolean;
  error?: boolean;
  optionLabel?: any[];
  category?: string;
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

function GeneralPartyInfo({
  partyState,
  handleInputChange,
  contactSections,
  addressSections,
  expandedAccordion,
  onContactSectionsChange,
  onAddressSectionsChange,
  onExpandedAccordionChange,
  handlePincodeChange,
  isLoadingLocation,
  isLoadingGst,
  GeneralInfoMisc,
  regFlag,
  canEdit,
  errors,
}: // setErrors,
GeneralPartyInfoProps) {
  const theme = useTheme();

  const registrationOptions = GeneralInfoMisc?.at(0) || [];
  const partyTypeOptions = GeneralInfoMisc?.at(1) || [];
  const partyZoneOptions = GeneralInfoMisc?.at(5) || [];
  const genderOptions = GeneralInfoMisc?.at(2) || [];
  const communicationOptions = GeneralInfoMisc?.at(3) || [];
  const contactOptions = GeneralInfoMisc?.at(4) || [];

  const partyDetailsFields: FieldConfig[] = [
    {
      name: "registrationType",
      label: "Registration Type",
      isRequired: true,
      field: "dropdown",
      options: registrationOptions,
      optionLabel: ["code"],
      error: errors.includes("registrationType"),
    },
    {
      name: "legalName",
      label: "Legal Name",
      isRequired: true,
      isDisable: regFlag ? false : true,
      field: "input",
      error: errors.includes("legalName"),
    },
    {
      name: "partyType",
      label: "Party Type",
      isRequired: true,
      field: "dropdown",
      options: partyTypeOptions,
      optionLabel: ["code"],
      multiple: true,
      error: errors.includes("partyType"),
    },
    {
      name: "partyZone",
      label: "Party Zone",
      field: "dropdown",
      options: partyZoneOptions,
      optionLabel: ["code"],
    },
    { name: "gstNumber", label: "GST Number", field: "input" },
    {
      name: "partyGroup",
      label: "Party Group",
      isRequired: true,
      field: "dropdown",
      options: partyState?.partyGroup || [],
      optionLabel: ["partyGroupName"],
      multiple: true,
      error: errors.includes("partyGroup"),
    },
    {
      name: "gstStateCode",
      label: "GST State Code",
      field: "input",
      isDisable: true,
    },
    {
      name: "pan",
      label: "PAN",
      field: "input",
      isDisable: true,
    },
    { name: "validFrom", label: "GST Registration Date", field: "picker" },
    { name: "website", label: "Website", field: "input" },
  ];

  const contactInfoFields: FieldConfig[] = [
    {
      name: "firstName",
      label: "First Name",
      isRequired: true,
      field: "input",
      error: errors.includes("firstName"),
    },
    { name: "lastName", label: "Last Name", field: "input" },
    {
      name: "gender",
      label: "Gender",
      field: "dropdown",
      options: genderOptions,
      optionLabel: ["code"],
    },
    { name: "designation", label: "Designation", field: "input" },
    {
      name: "emailId",
      label: "Email ID",
      type: "email",
      field: "input",
      isRequired: true,
      error: errors.includes("emailId"),
    },
    {
      name: "mobileNo",
      label: "Mobile No",
      type: "tel",
      isRequired: true,
      field: "input",
      error: errors.includes("mobileNo"),
    },
    { name: "phone", label: "Phone", type: "tel", field: "input" },
    {
      name: "preferredCommunicationChannel",
      label: "Preferred Communication Channel",
      field: "dropdown",
      options: communicationOptions,
      optionLabel: ["code"],
    },
    {
      name: "contactType",
      label: "Contact Type",
      field: "dropdown",
      options: contactOptions,
      optionLabel: ["code"],
    },
  ];

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

  const addContactSection = (type: "billing" | "shipping" | "secondary") => {
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
      isPrimaryContact: type === "secondary" ? false : false,
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

  const renderField = (
    {
      name,
      label,
      type,
      isRequired,
      field = "input",
      options,
      isDisable,
      multiple,
      optionLabel,
      error,
    }: FieldConfig,
    value: any,
    onChange: (value: any) => void,
    disabled: boolean = false
  ) => (
    <Grid item xs={12} sm={6} md={3} key={name}>
      {field === "input" && (
        <FormControl fullWidth>
          <MuiText
            variant="body2"
            sx={{
              mb: 1,
              fontWeight: 500,
              color: theme.palette.text.primary,
            }}
          >
            {label}
            {isRequired && (
              <MuiText
                component="span"
                color="error.main"
                sx={{ fontSize: "unset !important" }}
              >
                *
              </MuiText>
            )}
          </MuiText>
          <CustomTextField
            fullWidth
            type={type}
            value={value || ""}
            disabled={isDisable || disabled}
            onChange={onChange}
            error={error}
            helperText={error && `please enter valid ${label.toLowerCase()}`}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    {([
                      "country",
                      "state",
                      "city",
                      "gstState",
                      "gstNumber",
                    ].includes(label.toLowerCase()) &&
                      isLoadingLocation) ||
                      (isLoadingGst && <CircularProgress size={16} />)}
                  </InputAdornment>
                ),
              },
            }}
          />
        </FormControl>
      )}
      {field === "picker" && (
        <>
          <MuiText
            variant="body2"
            sx={{
              mb: 1,
              fontWeight: 500,
              color: theme.palette.text.primary,
            }}
          >
            {label}
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
      {field === "dropdown" && (
        <FormControl fullWidth>
          <MuiText
            variant="body2"
            sx={{
              mb: 1,
              fontWeight: 500,
              color: theme.palette.text.primary,
            }}
          >
            {label}
            {isRequired && (
              <MuiText
                component="span"
                color="error.main"
                sx={{ fontSize: "unset !important" }}
              >
                *
              </MuiText>
            )}
          </MuiText>
          <StyledAutocomplete
            multiple={multiple || false}
            options={options || []}
            disableCloseOnSelect={multiple}
            value={multiple ? value || [] : value}
            onChange={(event, newValue) => onChange(newValue || "")}
            disabled={disabled || isDisable}
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
              <CustomTextField
                {...params}
                variant="outlined"
                size="small"
                error={error}
                helperText={error && `please select  ${label.toLowerCase()}`}
              />
            )}
          />
        </FormControl>
      )}
      {field === "checkbox" && (
        <FormControlLabel
          control={
            <Checkbox
              checked={value || false || name.includes("primaryAddress")}
              onChange={(e) => onChange(e.target.checked)}
              size="medium"
            />
          }
          label={
            <MuiText
              variant="body2"
              sx={{
                fontWeight: 500,
                color: theme.palette.text.primary,
              }}
            >
              {label}
            </MuiText>
          }
        />
      )}
    </Grid>
  );

  const renderFields = (fields: FieldConfig[]) => (
    <Grid container spacing={2}>
      {fields.map((fieldConfig) =>
        renderField(
          fieldConfig,
          partyState?.formData[fieldConfig.name],
          (value) => handleInputChange(fieldConfig.name, value),
          false
        )
      )}
    </Grid>
  );

  const renderContactSection = (contact: ContactSection, index: number) => (
    <Box key={contact.id}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          mb: 2,
        }}
      >
        <MuiText sx={{ fontWeight: 550 }}>Contact {index + 1}</MuiText>
        {contact.isPrimaryContact && (
          <MuiText
            variant="caption"
            sx={{
              bgcolor: "primary.main",
              color: "white",
              px: 1,
              py: 0.25,
              borderRadius: 1,
              fontSize: "0.65rem",
            }}
          >
            (Primary)
          </MuiText>
        )}
        {!contact.isPrimaryContact && index === 1 && (
          <MuiText
            variant="caption"
            sx={{
              bgcolor: "secondary.main",
              color: "white",
              px: 1,
              py: 0.25,
              borderRadius: 1,
              fontSize: "0.65rem",
            }}
          >
            (Secondary)
          </MuiText>
        )}
        {contact.isBillingContact && (
          <MuiText
            variant="caption"
            sx={{
              bgcolor: "info.main",
              color: "white",
              px: 1,
              py: 0.25,
              borderRadius: 1,
              fontSize: "0.65rem",
            }}
          >
            (Billing)
          </MuiText>
        )}
        {contact.isShippingContact && (
          <MuiText
            variant="caption"
            sx={{
              bgcolor: "warning.main",
              color: "white",
              px: 1,
              py: 0.25,
              borderRadius: 1,
              fontSize: "0.65rem",
            }}
          >
            (Shipping)
          </MuiText>
        )}
        {contactSections.length > 1 && (
          <IconButton
            onClick={() => removeContactSection(contact.id)}
            size="small"
            sx={{ color: "error.main" }}
          >
            <RiDeleteBin6Line />
          </IconButton>
        )}
      </Box>
      <Grid container spacing={2}>
        {contactInfoFields.map((field) =>
          renderField(
            field,
            contact[field.name as keyof ContactSection],
            (value) => updateContactSection(contact.id, field.name, value),
            false
          )
        )}
      </Grid>
      {index < contactSections.length - 1 && <Divider sx={{ my: 3 }} />}
    </Box>
  );

  const renderAddressSection = (address: AddressSection, index: number) => (
    <Box key={address.id}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          mb: 2,
        }}
      >
        <MuiText sx={{ fontWeight: 600 }}>Address {index + 1}</MuiText>
        {address.isBillingAddress && (
          <MuiText
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
            (Billing)
          </MuiText>
        )}
        {address.isShippingAddress && (
          <MuiText
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
            (Shipping)
          </MuiText>
        )}
        {addressSections.length > 1 && (
          <IconButton
            onClick={() => removeAddressSection(address.id)}
            size="small"
            sx={{ color: "error.main" }}
          >
            <RiDeleteBin6Line />
          </IconButton>
        )}
      </Box>
      <Box display={"flex"} alignItems={"center"} mb={2} gap={3}>
        {addressCheckboxFields.map((field) =>
          renderField(
            field,
            address[field.name as keyof AddressSection],
            (value) => updateAddressSection(address.id, field.name, value),
            false
          )
        )}
      </Box>
      <Grid container spacing={2}>
        {addressFields.map((field) => {
          const shouldDisableField = index === 0;
          return field.name === "pincode" ? (
            <Grid item xs={12} sm={6} md={3} key={field.name}>
              <FormControl fullWidth>
                <MuiText
                  variant="body2"
                  sx={{
                    mb: 1,
                    fontWeight: 500,
                    color: theme.palette.text.primary,
                  }}
                >
                  {field.label}
                  {field.isRequired && (
                    <MuiText
                      component="span"
                      color="error.main"
                      sx={{ fontSize: "unset !important" }}
                    >
                      *
                    </MuiText>
                  )}
                </MuiText>
                <CustomTextField
                  fullWidth
                  disabled={index === 0}
                  value={address.pincode || ""}
                  onChange={(newvalue) => {
                    const newPincode = newvalue;
                    if (/^\d{0,6}$/.test(newPincode)) {
                      handlePincodeChange(address.id, newPincode, "address");
                    }
                  }}
                />
              </FormControl>
            </Grid>
          ) : (
            renderField(
              field,
              address[field.name as keyof AddressSection],
              (value) => updateAddressSection(address.id, field.name, value),
              shouldDisableField
            )
          );
        })}
      </Grid>
      {index < addressSections.length - 1 && <Divider sx={{ my: 3 }} />}
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
    <Box sx={{ pointerEvents: !canEdit ? "none" : undefined }}>
      <Accordion
        expanded={expandedAccordion === "panel1"}
        onChange={(event, isExp) =>
          onExpandedAccordionChange(isExp ? "panel1" : false)
        }
        sx={accordionSx("panel1")}
        elevation={0}
        defaultExpanded
      >
        <AccordionSummary>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            {expandedAccordion === "panel1" ? (
              <FaMinusCircle color="#38b5c6" />
            ) : (
              <FaCirclePlus color="#38b5c6" />
            )}
            <MuiText sx={{ fontWeight: 600 }}>Party Details</MuiText>
          </Box>
        </AccordionSummary>
        <AccordionDetails>{renderFields(partyDetailsFields)}</AccordionDetails>
      </Accordion>

      <Accordion
        expanded={expandedAccordion === "panel2"}
        onChange={(event, isExp) =>
          onExpandedAccordionChange(isExp ? "panel2" : false)
        }
        sx={accordionSx("panel2")}
        elevation={0}
      >
        <AccordionSummary>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            {expandedAccordion === "panel2" ? (
              <FaMinusCircle color="#38b5c6" />
            ) : (
              <FaCirclePlus color="#38b5c6" />
            )}
            <MuiText sx={{ fontWeight: 600 }}>Contact Details</MuiText>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          {contactSections.map((contact, index) =>
            renderContactSection(contact, index)
          )}

          {/* Add Secondary Contact Button */}
          {contactSections.length < 2 && (
            <Box sx={{ mt: 2 }}>
              <Button
                variant="outlined"
                startIcon={<MdAdd />}
                onClick={() => addContactSection("secondary")}
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
                Add Secondary Contact
              </Button>
            </Box>
          )}
        </AccordionDetails>
      </Accordion>

      <Accordion
        expanded={expandedAccordion === "panel3"}
        onChange={(event, isExp) =>
          onExpandedAccordionChange(isExp ? "panel3" : false)
        }
        sx={accordionSx("panel3")}
        elevation={0}
      >
        <AccordionSummary>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            {expandedAccordion === "panel3" ? (
              <FaMinusCircle color="#38b5c6" />
            ) : (
              <FaCirclePlus color="#38b5c6" />
            )}
            <MuiText sx={{ fontWeight: 600 }}>Address Details</MuiText>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          {addressSections.map((address, index) =>
            renderAddressSection(address, index)
          )}
          <Box mt={2}>
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
                  ml: 1,
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
    </Box>
  );
}

export default GeneralPartyInfo;
