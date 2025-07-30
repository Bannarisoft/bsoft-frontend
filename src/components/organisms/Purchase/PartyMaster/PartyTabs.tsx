import * as React from "react";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import NavTabs from "../../../atoms/ModernComponents/NavTabs";
import { TabContext, TabPanel } from "@mui/lab";
import GeneralPartyInfo from "./GeneralPartyInfo";
import CustomerGroup from "./CustomerGroup";
import { Box } from "@mui/material";
import UploadDocuments from "./UploadDocuments";
import TaxCompliance from "./TaxCompliance";
import Config from "../../../../utils/config.api.json"
import toast from "react-hot-toast";
import axios from "axios";

const tabStyles = {
  width: "100%",
  mt: 2,
  p: 0,
  "& .MuiAccordionSummary-content": {
    alignItems: "center",
    margin: "0 !important",
    gap: 1.5,
  },
  "& .MuiAccordionSummary-root": {
    minHeight: "56px",
    "&.Mui-expanded": {
      minHeight: "56px",
    },
  },
  "& .MuiAccordionDetails-root": {
    paddingTop: 0,
  },
  "& .MuiButtonBase-root": {
    borderRadius: 0,
    border: "none",
  },
};

interface ContactSection {
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
}

interface AddressSection {
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
}

interface BankSection {
  id: string;
  bankAccountNumber: string;
  bankName: string;
  bankBranch: string;
  ifscCode: string;
  swiftCode: string;
  accountType: string;
  isDefaultAccount: boolean;
  isPrimaryAccount: boolean;
}

interface PartyState {
  formData: Record<string, any>;
  contactSections: ContactSection[];
  addressSections: AddressSection[];
  bankSections: BankSection[];
  expandedAccordion: string | false;
}

export default function PartyTabs() {
  const [value, setValue] = React.useState("1");
  const [isLoadingLocation, setIsLoadingLocation] = React.useState(false);
  const [partyState, setPartyState] = React.useState<PartyState>({
    formData: {},
    contactSections: [
      {
        id: "contact-1",
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
        isBillingContact: false,
        isShippingContact: false,
      },
    ],
    addressSections: [
      {
        id: "address-1",
        addressType: "",
        primaryAddress: false,
        isShippingAddress: false,
        isBillingAddress: false,
        addressLine1: "",
        addressLine2: "",
        pincode: "",
        country: "",
        state: "",
        city: "",
        gstState: "",
        gstStateCode: "",
      },
    ],
    bankSections: [
      {
        id: "bank-1",
        bankAccountNumber: "",
        bankName: "",
        bankBranch: "",
        ifscCode: "",
        swiftCode: "",
        accountType: "",
        isDefaultAccount: false,
        isPrimaryAccount: true,
      },
    ],
    expandedAccordion: "panel1",
  });

  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    setValue(newValue);
  };

  const handleInputChange = (name: string, value: any) => {
    setPartyState((prev) => ({
      ...prev,
      formData: { ...prev.formData, [name]: value },
    }));
  };

  const updateContactSections = (contactSections: ContactSection[]) => {
    setPartyState((prev) => ({ ...prev, contactSections }));
  };

  const updateAddressSections = (addressSections: AddressSection[]) => {
    setPartyState((prev) => ({ ...prev, addressSections }));
  };

  const updateBankSections = (bankSections: BankSection[]) => {
    setPartyState((prev) => ({ ...prev, bankSections }));
  };

  const updateExpandedAccordion = (expandedAccordion: string | false) => {
    setPartyState((prev) => ({ ...prev, expandedAccordion }));
  };

  const GetPostalCode = async (pincode: string) => {
    try {
      if (!pincode || pincode.length !== 6) return null;

      const response = await axios
        .get(`https://api.postalpincode.in/pincode/${pincode}`)
        .then((res) => res.data[0])
        .then((res) => res?.PostOffice?.[0]);
      if (!response) {
        toast.error("No records found");
        setIsLoadingLocation(false);
      }
      return response;
    } catch (err) {
      console.log("Error fetching postal data:", err);
      return null;
    }
  };

  const handlePincodeChange = async (
    sectionId: string,
    pincode: string,
    sectionType: "address"
  ) => {
    if (sectionType === "address") {
      const updatedSections = partyState.addressSections.map((section) =>
        section.id === sectionId ? { ...section, pincode } : section
      );
      updateAddressSections(updatedSections);
    }

    if (pincode && pincode.length === 6) {
      setIsLoadingLocation(true);
      const locationData = await GetPostalCode(pincode);

      if (locationData && sectionType === "address") {
        const updatedSections = partyState.addressSections.map((section) =>
          section.id === sectionId
            ? {
                ...section,
                country: locationData.Country || "",
                state: locationData.State || "",
                city: locationData.District || "",
                gstState: locationData.State || "",
                pincode: pincode,
              }
            : section
        );
        updateAddressSections(updatedSections);
        setIsLoadingLocation(false);
      }
    } else {
      const updatedSections = partyState.addressSections.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              country: "",
              state: "",
              city: "",
              gstState: "",
              pincode: pincode,
            }
          : section
      );
      updateAddressSections(updatedSections);
      setIsLoadingLocation(false);
    }
  };

  return (
    <NavTabs>
      <TabContext value={value}>
        <Tabs
          value={value}
          onChange={handleChange}
          textColor="primary"
          indicatorColor="primary"
          aria-label="primary tabs example"
        >
          <Tab value="1" label="Details" />
          <Tab value="2" label="Tax & Compliance Details" />
          <Tab value="3" label="Payment Preferences" />
          <Tab value="4" label="Upload Documents" />
        </Tabs>

        <TabPanel value="1">
          <Box sx={tabStyles}>
            <GeneralPartyInfo
              formData={partyState.formData}
              handleInputChange={handleInputChange}
              contactSections={partyState.contactSections}
              addressSections={partyState.addressSections}
              bankSections={partyState.bankSections}
              expandedAccordion={partyState.expandedAccordion}
              onContactSectionsChange={updateContactSections}
              onAddressSectionsChange={updateAddressSections}
              onBankSectionsChange={updateBankSections}
              onExpandedAccordionChange={updateExpandedAccordion}
              handlePincodeChange={handlePincodeChange}
              isLoadingLocation={isLoadingLocation}
            />
          </Box>
        </TabPanel>

        <TabPanel value="2">
          <Box sx={tabStyles}>
            <TaxCompliance
              formData={partyState.formData}
              handleInputChange={handleInputChange}
            />
          </Box>
        </TabPanel>

        <TabPanel value="3">
          <Box sx={tabStyles}>
            <CustomerGroup
              formData={partyState.formData}
              handleInputChange={handleInputChange}
            />
          </Box>
        </TabPanel>

        <TabPanel value="4">
          <Box sx={tabStyles}>
            <UploadDocuments />
          </Box>
        </TabPanel>
      </TabContext>
    </NavTabs>
  );
}
