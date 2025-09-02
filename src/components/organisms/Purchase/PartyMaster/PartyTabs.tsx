"use client";

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
import PurchaseConfig from "../../../../utils/purchase.api.json";
import PartyConfig from "../../../../utils/party.api.json";
import toast from "react-hot-toast";
import axios from "axios";
import { Apirequest, validateArray } from "../../../../utils/lib";
import { useDataFetchHook } from "../../../../hooks/useDataFetchHook";
import { MuiButton } from "bsoft-base-elements";
import { useRecoilValue } from "recoil";
import { UserData } from "../../../../utils/atoms";
import GlobalLoader from "../../../atoms/ModernComponents/GlobalLoader";

export const tabStyles = {
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

interface TabErrors {
  [tabIndex: number]: string[];
}

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
  accountType: any;
  isDefaultAccount: boolean;
  isPrimaryAccount: boolean;
}

interface PartyState {
  formData: Record<string, any>;
  contactSections: ContactSection[];
  addressSections: AddressSection[];
  bankSections: BankSection[];
  expandedAccordion: string | false;
  partyType: any[];
  partyGroup: any[];
}

export default function PartyTabs({
  tabs,
  partyId,
}: {
  tabs: any[];
  partyId: string;
}) {
  const userData = useRecoilValue(UserData);
  const [value, setValue] = React.useState("0");
  const [isLoadingLocation, setIsLoadingLocation] = React.useState(false);
  const [isLoadingGst, setIsLoadingGst] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isLoadingPartyDetails, setIsLoadingPartyDetails] =
    React.useState(false);
  const [regFlag, setRegFlag] = React.useState(false);
  const [tabErrors, setTabErrors] = React.useState<TabErrors>({});
  const [errors, setErrors] = React.useState<string[]>([]);
  const [partyState, setPartyState] = React.useState<PartyState>({
    formData: {},
    partyType: [],
    partyGroup: [],
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
        isPrimaryContact: true,
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

  // ---------------- Dropdown API Calls ----------------

  const types = [
    "registration Type",
    "groupType",
    "gender",
    "preferred communication channel",
    "contact type",
    "msmetype",
    "paymentmode",
    "partyduedate",
    "acctype",
    "upload documents",
    "custype",
    "partyzone",
  ];

  const dataFetches = types.reduce((acc, type) => {
    acc[`${type}`] = useDataFetchHook(
      PartyConfig.PartyMisc.endpoint.replace("{type}", type),
      PartyConfig.PartyMisc.method,
      "party"
    ).data;
    return acc;
  }, {} as Record<string, any>);

  const GeneralInfoMisc = [
    dataFetches["registration Type"],
    dataFetches["groupType"],
    dataFetches["gender"],
    dataFetches["preferred communication channel"],
    dataFetches["contact type"],
    dataFetches["partyzone"],
  ];

  const PaymentMisc = [
    dataFetches["paymentmode"],
    dataFetches["partyduedate"],
    dataFetches["acctype"],
    dataFetches["custype"],
  ];

  const getLoaderInfo = () => {
    // if (isLoadingPartyDetails) {
    //   return {
    //     isLoading: true,
    //   };
    // }
    if (isSubmitting) {
      return {
        isLoading: true,
      };
    }
    return {
      isLoading: false,
    };
  };

  const GetItemDetails = async () => {
    const { endpoint, method } = PartyConfig.PartyMaster.GetPartyById;
    setIsLoadingPartyDetails(true);

    try {
      const response = await Apirequest(
        endpoint.replace("{partyId}", partyId ? partyId : ""),
        method,
        null,
        "party"
      ).then((r) => r.data);

      const findOption = (list: any[], id: number, key: string = "id") =>
        Array.isArray(list)
          ? list.find((opt) => opt[key] === id) || null
          : null;

      if (response?.statusCode === 200 && response?.data) {
        const data = response.data;

        const mappedContactSections =
          data.partyContacts?.length > 0
            ? data.partyContacts.map((contact: any, index: number) => ({
                id: contact.id || `contact-${index + 1}`,
                firstName: contact.firstName || "",
                lastName: contact.lastName || "",
                gender: contact.gender || "",
                designation: contact.designation || "",
                emailId: contact.emailID || "",
                mobileNo: contact.mobileNo || "",
                phone: contact.phone || "",
                preferredCommunicationChannel: contact.preferredChannel || "",
                contactType: contact.contactType || "",
                isPrimaryContact:
                  contact.contactBy === "Primary" || index === 0,
                isBillingContact: false,
                isShippingContact: false,
              }))
            : [
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
                  isPrimaryContact: true,
                  isBillingContact: false,
                  isShippingContact: false,
                },
              ];

        const mappedAddressSections =
          data.partyAddresses?.length > 0
            ? data.partyAddresses.map((address: any, index: number) => ({
                id: address.id || `address-${index + 1}`,
                addressType: address.addressType || "",
                primaryAddress:
                  address.addressType === "Primary" || index === 0,
                isShippingAddress: false,
                isBillingAddress: false,
                addressLine1: address.addressLine1 || "",
                addressLine2: address.addressLine2 || "",
                pincode: address.postalCode || "",
                country: address.country || "",
                state: address.state || "",
                city: address.city || "",
                gstState: address.state || "",
                gstStateCode: data.gstStateCode || "",
              }))
            : [
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
              ];

        const mappedBankSections =
          data.partyBanks?.length > 0
            ? data.partyBanks.map((bank: any, index: number) => ({
                id: bank.id || `bank-${index + 1}`,
                bankAccountNumber: bank.bankAccountNumber || "",
                bankName: bank.bankName || "",
                bankBranch: bank.bankBranch || "",
                ifscCode: bank.ifscCode || "",
                swiftCode: bank.swiftCode || "",
                accountType: bank.accountType || "",
                isDefaultAccount: Boolean(bank.isDefaultAccount),
                isPrimaryAccount: Boolean(bank.isPrimaryAccount) || index === 0,
              }))
            : [
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
              ];

        // ✅ everything moved inside setPartyState
        setPartyState((prev) => ({
          ...prev,
          formData: {
            ...prev.formData,
            legalName: data.partyName || "",
            registrationType: findOption(
              dataFetches["registration Type"],
              data?.registrationTypeId,
              "id"
            ),
            gstNumber: data.gstNumber || "",
            gstStateCode: data.gstStateCode || "",
            pan: data.pan || "",
            website: data.website || "",
            tan: data.tan || "",
            msmeType: data.msmeType || null,
            msmeNumber: data.msmeno || "",
            msmeCompliant: Boolean(data.isMsmeCompliant),
            tdsApplicable: Boolean(data.isTDSApplicable),
            tcsApplicable: Boolean(data.isTCSApplicable),
            gstReverseChargeApplicable: Boolean(data.isGstReverseCharge),
            sectionApplicable: Boolean(data.is206AB206CCAApplicable),
            modeOfPayment: data.paymentMode || null,
            preferredCurrencyForPurchase: data.preferredCurrencyPurchase || "",
            preferredCurrencyForSale: data.preferredCurrencySale || "",
            creditDays: data.creditDays || "",
            dueDate: data.dueDateType || null,
            leadTime: data.leadTime || "",
            creditLimit: data.creditLimit || "",
            customerType: data.customerType || null,
            isInternalSupplier: Boolean(data.isInternalSupplier),
            isInternalCustomer: Boolean(data.isInternalCustomer),
            stopPayments: Boolean(data.isStopPayment),
            partyZone: findOption(
              dataFetches["partyzone"],
              data?.partyZoneId,
              "id"
            ),
            partyType: data.partyTypes || [],
            partyGroup: data.partyGroups || [],
            cin: data.cin || "",
            iecode: data.ieCode || "",
          },
          partyType: data.partyTypes || [],
          partyGroup: data.partyGroups || [],
          contactSections: mappedContactSections,
          addressSections: mappedAddressSections,
          bankSections: mappedBankSections,
        }));

        if (
          data.registrationType?.code?.toLowerCase()?.includes("un-registered")
        ) {
          setRegFlag(true);
        }

        toast.success("Party details loaded successfully!");
      } else {
        toast.error("Failed to load party details");
      }
    } catch (err) {
      console.log("Error loading party details:", err);
      toast.error("Error loading party details");
    } finally {
      setIsLoadingPartyDetails(false);
    }
  };

  React.useEffect(() => {
    console.log(partyState.formData);
  }, [partyState.formData]);

  React.useEffect(() => {
    if (
      partyId !== "" &&
      dataFetches["registration Type"] &&
      dataFetches["partyzone"]
    ) {
      GetItemDetails();
    } else if (partyId === "") {
      setIsLoadingPartyDetails(false);
    }
  }, [partyId, dataFetches["registration Type"], dataFetches["partyzone"]]);

  const CheckMandatory = async (body: any) => {
    const mandatories: string[] = [
      "registrationType",
      "legalName",
      "partyType",
      "partyGroup",
      "firstName",
      "emailId",
      "mobileNo",
    ];

    const temp: string[] = [];
    const newTabErrors: TabErrors = {};

    const formDataMandatories = [
      "registrationType",
      "legalName",
      "partyType",
      "partyGroup",
    ];

    formDataMandatories.forEach((field) => {
      if (mandatories.includes(field)) {
        const value = partyState.formData[field];
        if (
          !value ||
          (typeof value === "string" && value.trim() === "") ||
          (Array.isArray(value) && value.length === 0)
        ) {
          temp.push(field);
          if (!newTabErrors[0]) newTabErrors[0] = [];
          newTabErrors[0].push(field);
        }
      }
    });

    const contactMandatories = ["firstName", "emailId", "mobileNo"];
    const hasValidContact = partyState.contactSections.some((contact) => {
      return contactMandatories.every((field) => {
        const value = contact[field as keyof typeof contact];
        return value && (typeof value !== "string" || value.trim() !== "");
      });
    });

    if (!hasValidContact) {
      contactMandatories.forEach((field) => {
        temp.push(field);
        if (!newTabErrors[0]) newTabErrors[0] = [];
        newTabErrors[0].push(field);
      });
    }

    setErrors(temp);
    setTabErrors(newTabErrors);

    if (temp.length > 0) {
      const firstErrorTab = Object.keys(newTabErrors)[0];
      if (firstErrorTab) {
        setValue(firstErrorTab);
      }
      toast.error("Please fix the validation errors before submitting.");
      return false;
    }

    return true;
  };

  const hasTabError = (tabIndex: number): boolean => {
    return tabErrors[tabIndex] && tabErrors[tabIndex].length > 0;
  };

  const getTabStyle = (tabIndex: number) => ({
    color: hasTabError(tabIndex) ? "#d32f2f" : "inherit",
    "& .MuiTab-wrapper": {
      color: hasTabError(tabIndex) ? "#d32f2f" : "inherit",
    },
    "&.Mui-selected": {
      color: hasTabError(tabIndex) ? "#d32f2f" : "primary.main",
    },
  });

  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    setValue(newValue);
  };

  const handleSubmit = async () => {
    const formData = partyState?.formData;
    const body = {
      partyMaster: {
        ...(partyId && { partyId: partyId }),
        companyId: userData.companyId,
        partyName: formData?.legalName,
        partyZoneId: formData?.partyZone?.id,
        registrationTypeId: formData?.registrationType?.id,
        gstNumber: formData?.gstNumber,
        gstStateCode: Number(formData?.gstStateCode),
        pan: formData?.pan,
        website: formData?.website,
        tan: formData?.tan,
        tdsCategoryId: null,
        msmeTypeId: formData?.msmeType?.id,
        msmeno: formData?.msmeNumber,
        msmeValidUpto: null,
        isMsmeCompliant: Boolean(formData?.msmeCompliant) ? 1 : 0,
        isTDSApplicable: Boolean(formData?.tdsApplicable) ? 1 : 0,
        isTCSApplicable: Boolean(formData?.tcsApplicable) ? 1 : 0,
        isGstReverseCharge: Boolean(formData?.gstReverseChargeApplicable)
          ? 1
          : 0,
        is206AB206CCAApplicable: Boolean(formData?.sectionApplicable) ? 1 : 0,
        payementModeId: formData?.modeOfPayment?.id,
        favourOf: null,
        preferredCurrencyPurchase: formData?.preferredCurrencyForPurchase,
        creditDays: formData?.creditDays,
        dueDateTypeId: formData?.dueDate?.id,
        leadTime: formData.leadTime,
        preferredCurrencySale: formData?.preferredCurrencyForSale,
        creditLimit: formData?.creditLimit,
        sellingPriceListId: null,
        customerTypeId: formData?.customerType?.id,
        isInternalSupplier: Boolean(formData?.isInternalSupplier) ? 1 : 0,
        isInternalCustomer: Boolean(formData?.isInternalCustomer) ? 1 : 0,
        isStopPayment: Boolean(formData?.stopPayments) ? 1 : 0,
        gstRegistrationDate: null,
        msmeRegistrationDate: null,
        cin: formData?.cin,
        ieCode: formData?.iecode,
        partyTypes:
          validateArray(formData?.partyType) &&
          formData?.partyType.map((li: any) => {
            return {
              partyTypeId: li?.id,
              partyGroupId: li?.partyGroupId || 2,
            };
          }),
        partyContacts:
          validateArray(partyState?.contactSections) &&
          partyState?.contactSections.map((li: any) => {
            return {
              ...(li.id &&
                li.id !==
                  `contact-${partyState.contactSections.indexOf(li) + 1}` && {
                  contactId: li.id,
                }),
              firstName: li?.firstName,
              lastName: li?.lastName,
              genderId: li?.gender?.id,
              designation: li?.designation,
              emailID: li?.emailId,
              mobileNo: li?.mobileNo,
              phone: li?.phone,
              preferredChannelId: li?.preferredCommunicationChannel?.id,
              contactTypeId: li?.contactType?.id,
              contactBy: li?.isPrimaryContact ? "Primary" : "Secondary",
            };
          }),
        partyAddresses:
          validateArray(partyState?.addressSections) &&
          partyState?.addressSections.map((li) => {
            return {
              ...(li.id &&
                li.id !==
                  `address-${partyState.addressSections.indexOf(li) + 1}` && {
                  addressId: li.id,
                }),
              addressType: li?.primaryAddress ? "Primary" : "Secondary",
              addressLine1: li?.addressLine1,
              addressLine2: li?.addressLine2,
              city: li?.city,
              state: li?.state,
              postalCode: li?.pincode,
              country: li?.country,
            };
          }),
        partyBanks:
          validateArray(partyState?.bankSections) &&
          partyState?.bankSections.map((li) => {
            return {
              ...(li.id &&
                li.id !== `bank-${partyState.bankSections.indexOf(li) + 1}` && {
                  bankId: li.id,
                }),
              bankName: li?.bankName,
              bankAccountNumber: li?.bankAccountNumber,
              bankBranch: li?.bankBranch,
              ifscCode: li?.ifscCode,
              swiftCode: li?.swiftCode,
              accountTypeId: li?.accountType?.id as any,
              isDefaultAccount: li?.isDefaultAccount ? 1 : 0,
              isPrimaryAccount: li?.isPrimaryAccount ? 1 : 0,
            };
          }),
      },
    };

    const isValid = await CheckMandatory(body);

    if (!isValid) {
      return;
    }

    setIsSubmitting(true);

    try {
      const config = partyId
        ? PartyConfig.PartyMaster.UpdateParty // Assuming you have an update endpoint
        : PartyConfig.PartyMaster.AddParty;

      const { endpoint, method } = config;
      const response = await Apirequest(endpoint, method, body, "party").then(
        (r) => r.data
      );

      if (response.statusCode === 200 || response.statusCode === 201) {
        toast.success(
          partyId
            ? "Party updated successfully!"
            : "Party created successfully!"
        );
        // Add any success logic here (e.g., navigation, form reset)
      } else {
        toast.error(
          response.message || `Failed to ${partyId ? "update" : "create"} party`
        );
      }
    } catch (err) {
      console.log(err);
      toast.error(
        `An error occurred while ${partyId ? "updating" : "creating"} the party`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const GetPartyGroup = async (value: any) => {
    try {
      const { endpoint, method } = PartyConfig.PartyGroupLoad;
      const getIds =
        Array.isArray(value) && value.map((li) => li.id).filter(Boolean);
      if (getIds && getIds.length > 0) {
        const query = `${encodeURIComponent(getIds.join(","))}`;
        const response = await Apirequest(
          endpoint.replace("{ids}", query),
          method,
          null,
          "party"
        ).then((r) => r.data);
        const { statusCode, data } = response;
        if (statusCode === 200 || statusCode === 201) {
          setPartyState((prev) => ({
            ...prev,
            partyGroup: data,
          }));
        } else {
          setPartyState((prev) => ({
            ...prev,
            partyGroup: [],
          }));
        }
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleInputChange = (name: string, value: any) => {
    setErrors([]);
    if (name === "registrationType") {
      if (
        typeof value?.code === "string" &&
        value?.code?.toLowerCase()?.includes("un-registered")
      ) {
        setRegFlag(true);
      } else setRegFlag(false);
    }
    setPartyState((prev) => ({
      ...prev,
      formData: { ...prev.formData, [name]: value },
    }));
    if (name === "partyType") {
      if (!!value)
        setPartyState((prev) => ({
          ...prev,
          partyGroup: [],
          formData: { ...prev.formData, partyGroup: [] },
        }));
      GetPartyGroup(value);
    }
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

  const clearGstRelatedData = () => {
    const clearedAddressSections = partyState.addressSections.map(
      (address, index) =>
        index === 0
          ? {
              ...address,
              addressLine1: "",
              addressLine2: "",
              pincode: "",
              country: "",
              state: "",
              city: "",
              gstState: "",
              gstStateCode: "",
            }
          : address
    );
    setPartyState((prevState) => ({
      ...prevState,
      formData: {
        ...prevState.formData,
        legalName: "",
        pan: "",
        gstStateCode: "",
      },
      addressSections: clearedAddressSections,
    }));
  };

  const GetGstDetails = async (gst: string) => {
    const { endpoint, method } = PurchaseConfig.CommonApi.GstInfo;
    setIsLoadingGst(true);
    try {
      const response = await Apirequest(
        endpoint.replace("{gst}", gst.toString()),
        method,
        null,
        "party"
      ).then((res) => res.data);
      const { statusCode, data, message } = response;
      if (statusCode === 200 || statusCode === 201) {
        setIsLoadingGst(false);
        const pincode = data?.addrPncd || "";
        const updatedAddressSections = partyState.addressSections.map(
          (address, index) =>
            index === 0
              ? {
                  ...address,
                  addressLine1: `${data?.addrBno}, ${data?.addrSt}` || "",
                  addressLine2: data?.addrLoc || "",
                  pincode: pincode,
                }
              : address
        );
        toast.success(message);
        setPartyState({
          ...partyState,
          formData: {
            ...partyState.formData,
            legalName: data?.legalName,
            gstStateCode: data?.stateCode,
            pan: gst?.substring(2, 12),
          },
          addressSections: updatedAddressSections,
        });

        if (pincode && pincode.length === 6) {
          setIsLoadingLocation(true);
          const locationData = await GetPostalCode(pincode);

          if (locationData) {
            const finalUpdatedAddressSections = partyState.addressSections.map(
              (address, index) =>
                index === 0
                  ? {
                      ...address,
                      addressLine1: `${data?.addrBno}, ${data?.addrSt}` || "",
                      addressLine2: data?.addrLoc || "",
                      pincode: pincode,
                      country: locationData.Country || "",
                      state: locationData.State || "",
                      city: locationData.District || "",
                      gstState: locationData.State || "",
                    }
                  : address
            );

            setPartyState((prevState) => ({
              ...prevState,
              formData: { ...prevState.formData, legalName: data?.legalName },
              addressSections: finalUpdatedAddressSections,
            }));
          }
          setIsLoadingLocation(false);
        }
      } else {
        setIsLoadingGst(false);
        toast.error(message || "GST details not found");
        clearGstRelatedData();
      }
    } catch (err) {
      console.log(err);
      setIsLoadingGst(false);
      toast.error("Error fetching GST details");
      clearGstRelatedData();
    }
  };

  React.useEffect(() => {
    const GstNumber = partyState.formData?.gstNumber ?? "";

    if (GstNumber && GstNumber.length < 15 && GstNumber.length > 0) {
      clearGstRelatedData();
    }

    if (GstNumber && GstNumber.length === 15) {
      GetGstDetails(GstNumber);
    }

    if (!GstNumber) {
      clearGstRelatedData();
    }
  }, [partyState.formData?.gstNumber]);

  const renderComponent = (menuName: string, privileges: any) => {
    const canEdit =
      validateArray(privileges) &&
      privileges.map((i: any) => Boolean(i.canAdd)).at(0);
    switch (menuName.toLowerCase()) {
      case "details":
        return (
          <GeneralPartyInfo
            partyState={partyState}
            handleInputChange={handleInputChange}
            contactSections={partyState.contactSections}
            addressSections={partyState.addressSections}
            expandedAccordion={partyState.expandedAccordion}
            onContactSectionsChange={updateContactSections}
            onAddressSectionsChange={updateAddressSections}
            onExpandedAccordionChange={updateExpandedAccordion}
            handlePincodeChange={handlePincodeChange}
            isLoadingLocation={isLoadingLocation}
            isLoadingGst={isLoadingGst}
            GeneralInfoMisc={GeneralInfoMisc}
            regFlag={regFlag}
            canEdit={canEdit}
            errors={errors}
          />
        );
      case "tax & compliance":
        return (
          <TaxCompliance
            formData={partyState.formData}
            handleInputChange={handleInputChange}
            canEdit={canEdit}
            msmeOption={dataFetches["msmetype"]}
          />
        );
      case "payment preferences":
        return (
          <CustomerGroup
            formData={partyState.formData}
            handleInputChange={handleInputChange}
            bankSections={partyState.bankSections}
            onBankSectionsChange={updateBankSections}
            canEdit={canEdit}
            PaymentMisc={PaymentMisc}
          />
        );
      case "upload documents":
        return (
          <UploadDocuments
            canEdit={canEdit}
            uploadTypeOptions={dataFetches["upload documents"]}
            onImageUpload={(url, base64) => {
              setPartyState((prev) => ({
                ...prev,
                formData: {
                  ...prev.formData,
                  itemImage: url,
                  itemImageBase: base64,
                },
              }));
            }}
            onImageDelete={() => {
              setPartyState((prev) => ({
                ...prev,
                formData: {
                  ...prev.formData,
                  itemImage: null,
                  itemImageBase: null,
                },
              }));
            }}
          />
        );
      default:
        return <div></div>;
    }
  };

  const loaderInfo = getLoaderInfo();

  return (
    <>
      <GlobalLoader isLoading={loaderInfo.isLoading} />

      <NavTabs>
        <TabContext value={value}>
          <Tabs
            value={value}
            onChange={handleChange}
            textColor="primary"
            indicatorColor="primary"
            aria-label="dynamic party tabs"
          >
            {tabs.map((menu, idx) => (
              <Tab
                key={menu.id}
                value={String(idx)}
                label={menu.menuName}
                sx={getTabStyle(idx)}
              />
            ))}
          </Tabs>

          {tabs.map((menu, idx) => (
            <TabPanel key={menu.id} value={String(idx)}>
              <Box sx={tabStyles}>
                {renderComponent(menu.menuName, menu?.menuPrivileages)}
              </Box>
            </TabPanel>
          ))}
        </TabContext>

        <Box mt={2} pl={1}>
          <MuiButton
            variant="outlined"
            sx={{ borderRadius: "8px !important", minWidth: 120, mr: 3 }}
            disabled={
              isSubmitting ||
              isLoadingGst ||
              isLoadingLocation ||
              isLoadingPartyDetails
            }
          >
            Cancel
          </MuiButton>
          <MuiButton
            variant="contained"
            sx={{ borderRadius: "8px !important", minWidth: 120 }}
            onClick={handleSubmit}
            disabled={
              isSubmitting ||
              isLoadingGst ||
              isLoadingLocation ||
              isLoadingPartyDetails
            }
          >
            {isSubmitting
              ? partyId
                ? "Updating..."
                : "Submitting..."
              : partyId
              ? "Update"
              : "Submit"}
          </MuiButton>
        </Box>
      </NavTabs>
    </>
  );
}
