"use client";

import {
  Autocomplete,
  Box,
  DialogTitle,
  Grid,
  Grid2,
  Tab,
  Tabs,
} from "@mui/material";
import React, { useCallback, useEffect, useState } from "react";
import IconBreadcrumbs from "../../../molecules/AdminLayout/BreadCrumbs";
import AssetCommonDetails from "./AssetCommonDetails";
import { TabContext, TabPanel } from "@mui/lab";
import { MuiButton, MuiInputField, MuiText } from "bsoft-base-elements";
import {
  MdClose,
  MdEdit,
  MdOutlineEditNote,
  MdOutlineLibraryAdd,
  MdSave,
} from "react-icons/md";
import AssetDetailInsurance from "./AssetDetailInsurance";
import AssetDetailAmc from "./AssetDetailAmc";
import AssetWaranty from "./AssetWaranty";
import AssetDisposal from "./AssetDisposal";
import FamConfig from "../../../../utils/fam.api.json";
import Config from "../../../../utils/config.api.json";
import {
  Apirequest,
  isSubmitting,
  parseDateString,
  startLoading,
  stopLoading,
} from "../../../../utils/lib";
import { useAssetWarranty } from "./useAssetWarranty";
import dayjs from "dayjs";
import { PurchaseDetails } from "../../../../types/types";
import Swal from "sweetalert2";
import Link from "next/link";
import { HiViewfinderCircle } from "react-icons/hi2";

import utc from "dayjs/plugin/utc";
import customParseFormat from "dayjs/plugin/customParseFormat";
import toast from "react-hot-toast";

dayjs.extend(utc);
dayjs.extend(customParseFormat);

const specificationStyles = {
  container: {
    backgroundColor: "#fff",
    borderRadius: "12px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    overflow: "hidden",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px",
    borderBottom: "1px solid #f0f0f0",
    backgroundColor: "#fafafa",
  },
  addButton: {
    display: "flex",
    alignItems: "center",
    gap: 1,
    color: "#107869",
    cursor: "pointer",
    padding: "8px 16px",
    borderRadius: "8px",
    transition: "all 0.2s ease",
    border: "1px dashed #107869",
    "&:hover": {
      backgroundColor: "rgba(16, 120, 105, 0.04)",
      transform: "translateY(-1px)",
    },
  },
  specGrid: {
    padding: "10px",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  specCard: {
    padding: "6px 12px",
    borderRadius: "8px",
    border: "1px solid #f0f0f0",
    transition: "all 0.2s ease",
    backgroundColor: "#fff",
    "&:hover": {
      boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
      borderColor: "#e6e6e6",
    },
  },
  actionButton: {
    padding: "6px",
    borderRadius: "6px",
    cursor: "pointer",
    transition: "all 0.2s ease",
    "&:hover": {
      transform: "translateY(-1px)",
    },
  },
};

const formatHeading = (key: string): string => {
  const words = key.split(/(?=[A-Z])/).join(" ");
  const specialCases: { [key: string]: string } = {
    grn: "GRN",
    po: "PO",
    uom: "UOM",
    qty: "Quantity",
    pj: "PJ",
  };

  return words
    .split(" ")
    .map((word) => {
      const lowerWord = word.toLowerCase();
      return (
        specialCases[lowerWord] || word.charAt(0).toUpperCase() + word.slice(1)
      );
    })
    .join(" ");
};

function AssetDetailPage() {
  const [value, setValue] = React.useState(0);
  interface AssetDetails {
    assetLocation?: {
      unitName?: string;
      deptName?: string;
      locationName?: string;
      subLocationName?: string;
      custodianName?: string;
      userName?: string;
    };
    assetPurchaseDetails?: any[];
    assetSpecification?: any[];
    assetInsurance?: any[];
    assetAmc?: any[];
    assetGroupId?: any;
    assetCode?: string;
    putToUseDate?: string;
    assetAdditionalCost?: any[];
  }

  interface AssetSpecs {
    specificationName: string;
    specificationValue: string;
    isNew?: boolean;
    isEditing?: boolean;
  }
  interface InvoiceData {
    imageName: string;
    imageBase64: string;
  }
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [assetDetails, setAssetDetails] = React.useState<AssetDetails>({});
  const [pathname, setPathname] = useState("");
  const [warrantyId, setWarrantyId] = useState(0);
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };
  const [invoiceFile, setInvoiceFile] = useState<any>(null);
  const [invoiceError, setInvoiceError] = useState<string>("");
  const [invoiceDoc, setInvoiceDoc] = useState<InvoiceData>({
    imageName: "",
    imageBase64: "",
  });
  const [pdfFlag, setPdfFlag] = useState(false);
  const {
    warrantyInputs,
    handleAutocomplete,
    handleChange,
    handleDate,
    errors,
    setErrors,
    setWarrantyInputs,
  } = useAssetWarranty();

  const [disposal, setDisposal] = useState({
    disposalType: "" as any,
    disposalData: [],
    disposalDate: "" as any,
    reason: "",
    amount: "",
    assetPurchaseId: 0,
    disposalId: 0,
  });
  const [renewalData, setRenewalData] = useState([]);

  const formatDate = (dateString: string) => {
    if (!dateString || typeof dateString !== "string") return "-";

    const parsedDate = dayjs(dateString, [
      "YYYY-MM-DDTHH:mm:ssZ",
      "YYYY-MM-DDTHH:mm:ss",
      "YYYY-MM-DD",
    ]);

    if (!parsedDate.isValid()) return "-";

    return parsedDate.utc().format("DD MMMM YYYY");
  };

  const formatAmount = (amount: number) => {
    if (!amount) return "-";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const detailsData = React.useMemo(() => {
    if (!assetDetails.assetPurchaseDetails) return [];

    const excludeFields = [
      "id",
      "pjDocId",
      "pjDocSr",
      "pjDocNo",
      "pjYear",
      "oldUnitId",
    ];
    const displayOrder = [
      "grnDate",
      "grnNo",
      "grnSno",
      "grnValue",
      "poNo",
      "poDate",
      "poSno",
      "purchaseValue",
      "itemCode",
      "itemName",
      "acceptedQty",
      "uom",
      "vendorCode",
      "vendorName",
      "budgetType",
      "billNo",
      "billDate",
      "binLocation",
      "qcCompleted",
      "capitalizationDate",
    ];

    return displayOrder
      .filter(
        (key) =>
          key in assetDetails?.assetPurchaseDetails?.at(0) &&
          !excludeFields.includes(key)
      )
      .map((key, index) => {
        let value =
          assetDetails?.assetPurchaseDetails?.at(0)[
            key as keyof PurchaseDetails
          ];
        if (typeof value === "string") {
          value = value.trim();
        }

        if (key.toLowerCase().includes("date")) {
          value = formatDate(value as string);
        }

        if (key.toLowerCase().includes("value")) {
          value = formatAmount(value as number);
        }

        if (key === "qcCompleted") {
          value = value === "Y" ? "Yes" : "No";
        }

        return {
          id: index + 1,
          title: formatHeading(key),
          value: value || "-",
        };
      });
  }, [assetDetails?.assetPurchaseDetails?.at(0)]);

  const sampleObj = [
    {
      id: 1,
      title: "Unit",
      value: assetDetails?.assetLocation?.unitName,
    },
    {
      id: 2,
      title: "Department",
      value: assetDetails?.assetLocation?.deptName,
    },
    {
      id: 3,
      title: "Location",
      value: assetDetails?.assetLocation?.locationName,
    },
    {
      id: 4,
      title: "Sub Location",
      value: assetDetails?.assetLocation?.subLocationName,
    },
    {
      id: 5,
      title: "Custodian",
      value: assetDetails?.assetLocation?.custodianName,
    },
    {
      id: 6,
      title: "User",
      value: assetDetails?.assetLocation?.userName,
    },
  ];

  const GetRenewStatus = async () => {
    try {
      const { endpoint, method } = FamConfig.AssetWarranty.RenewStatus;
      const response = await Apirequest(endpoint, method, null, "fam");

      if (response?.data?.data) {
        setRenewalData(response.data.data);
      }
    } catch (err) {
      console.error("Error fetching renewal status:", err);
      setRenewalData([]);
    }
  };

  const DeleteAssetSpec = async () => {
    try {
      const { endpoint, method } = FamConfig.Specificaton.DeleteAssetSpec;
      const response = await Apirequest(
        endpoint.replace("{id}", pathname.toString()),
        method,
        null,
        "fam"
      ).then((res) => res.data);
      return response;
    } catch (err) {
      console.log(err);
    }
  };
  const [isWarrantyCreated, setIsWarrantyCreated] = useState(false);

  const GetAssetDetails = async () => {
    try {
      const { endpoint, method } = FamConfig.AssetInfo.GetAssetDetailById;
      const response = await Apirequest(
        endpoint.replace("{id}", pathname),
        method,
        null,
        "fam"
      ).then((res) => res.data);

      setAssetDetails(response?.data);
      const warrantyData =
        Array.isArray(response.data.assetWarranty) &&
        response.data.assetWarranty.length > 0 &&
        response.data.assetWarranty?.at(0);
      setIsWarrantyCreated(!!warrantyData);
      const warrentyType = warrantyInputs.warrantyTypeData?.find(
        (i: any) => i.id === warrantyData?.warrantyTypeId
      );
      const claimStatus = warrantyInputs.warrantyClaimData?.find(
        (i: any) => i.id === Number(warrantyData?.serviceClaimStatusId)
      );

      const country = warrantyInputs.countryData?.find(
        (i: any) => i.id === warrantyData?.serviceCountryId
      );
      warrantyData?.id ? setWarrantyId(warrantyData?.id) : setWarrantyId(0);

      let stateData = [];
      let selectedState = null;
      if (warrantyData?.serviceCountryId) {
        const states = await GetState(warrantyData.serviceCountryId);
        stateData = states?.data?.data || [];
        selectedState = stateData.find(
          (s: any) => s.id === warrantyData?.serviceStateId
        );
      }

      let cityData = [];
      let selectedCity = null;
      if (warrantyData?.serviceStateId) {
        const cities = await GetCity(warrantyData.serviceStateId);
        cityData = cities?.data?.data || [];
        selectedCity = cityData.find(
          (c: any) => c.id === warrantyData?.serviceCityId
        );
      }
      setInvoiceDoc({
        ...invoiceDoc,
        imageBase64: warrantyData?.assetDocument,
      });
      setPdfFlag(true);
      setWarrantyInputs({
        type: "SET_ALL",
        payload: {
          startDate: parseDateString(warrantyData?.startDate),
          endDate: parseDateString(warrantyData?.endDate),
          warrantyPeriod: warrantyData?.period,
          warrantyProvider: warrantyData?.warrantyProvider,
          mobile: warrantyData?.mobileNumber,
          contactPerson: warrantyData?.contactPerson,
          email: warrantyData?.email,
          document: warrantyData?.document,
          termsAndCondition: warrantyData?.description,
          pincode: warrantyData?.servicePinCode,
          address1: warrantyData?.serviceAddressLine1,
          address2: warrantyData?.serviceAddressLine2,
          centrePhone: warrantyData?.serviceMobileNumber,
          centreEmail: warrantyData?.serviceEmail,
          centreContactPerson: warrantyData?.serviceContactPerson,
          claimProcess: warrantyData?.serviceClaimProcessDescription,
          serviceLastClaimDate: parseDateString(
            warrantyData?.serviceLastClaimDate
          ),
          warrantyType: warrentyType || null,
          warrantyClaimStatus: claimStatus || null,
          country: country || null,
          state: selectedState || null,
          city: selectedCity || null,
          stateData,
          cityData,
        },
      });
      const disposalType = disposal.disposalData
        ?.filter(
          (i: any) => i.id === response.data.assetDisposal?.disposalTypeId
        )
        ?.at(0);
      setDisposal({
        ...disposal,
        disposalDate: parseDateString(
          response.data.assetDisposal?.disposalDate
        ),
        amount: response.data.assetDisposal?.disposalAmount,
        reason: response.data.assetDisposal?.disposalReason,
        disposalType: disposalType,
        assetPurchaseId: response.data?.assetPurchaseDetails?.at(0)?.id,
        disposalId: response.data.assetDisposal?.id,
      });
      setInvoiceDoc({
        imageName: response?.data?.assetDocumentName,
        imageBase64: response?.data?.assetDocument,
      });
      setInvoiceFile(response?.data?.assetDocumentName);
    } catch (err) {
      console.error("Error fetching asset details:", err);
    }
  };

  const GetState = useCallback(
    async (id: number) => {
      try {
        if (warrantyInputs.stateData.length > 0) {
          const existingState = warrantyInputs.stateData.find(
            (state: any) => state.countryId === id
          );
          if (existingState) {
            return { data: { data: warrantyInputs.stateData } };
          }
        }

        const { endpoint, method } = Config.State.getById;
        const result = await Apirequest(
          endpoint.replace(`{countryId}`, id?.toString() || ""),
          method
        );

        setWarrantyInputs({
          type: "stateData",
          payload: result?.data?.data || [],
        });
        return result?.data;
      } catch (err) {
        console.error("Error fetching states:", err);
        setWarrantyInputs({ type: "stateData", payload: [] });
        return null;
      }
    },
    [warrantyInputs.stateData]
  );

  const GetCity = useCallback(
    async (id: number) => {
      try {
        if (warrantyInputs.cityData.length > 0) {
          const existingCity = warrantyInputs.cityData.find(
            (city: any) => city.stateId === id
          );
          if (existingCity) {
            return { data: { data: warrantyInputs.cityData } };
          }
        }

        const { endpoint, method } = Config.City.getById;
        const result = await Apirequest(
          endpoint.replace(`{stateId}`, id?.toString() || ""),
          method
        );

        setWarrantyInputs({
          type: "cityData",
          payload: result?.data?.data || [],
        });
        return result?.data;
      } catch (err) {
        console.error("Error fetching cities:", err);
        setWarrantyInputs({ type: "cityData", payload: [] });
        return null;
      }
    },
    [warrantyInputs.cityData]
  );

  useEffect(() => {
    const currentPath = window.location.pathname.split("/").at(-1);
    setPathname(currentPath as string);
    GetDisposalType();
    GetRenewStatus();
  }, []);

  const [mandatorySpecs, setMandatorySpecs] = useState<AssetSpecs[]>([]);
  const [optionalSpecs, setOptionalSpecs] = useState<AssetSpecs[]>([]);
  const [specErrors, setSpecErrors] = useState<string[]>([]);

  const GetSpecification = async (groupId: string) => {
    try {
      const { endpoint, method } = FamConfig.AssetInfo.Specification;
      const response = await Apirequest(
        endpoint.replace("{id}", groupId.toString()),
        method,
        null,
        "fam"
      ).then((res) => res.data);

      const specs = response.data;

      const mandatory = specs.filter((spec: any) => spec.isDefault === 1);
      const optional = specs.filter((spec: any) => spec.isDefault === 0);

      setMandatorySpecs(
        mandatory.map((spec: any) => ({
          specificationId: spec.id,
          specificationName: spec.specificationName,
          specificationValue: spec.specificationValue || "",
          isNew: false,
          isEditing: false,
        }))
      );

      setOptionalSpecs(
        optional.map((spec: any) => ({
          specificationName: spec.specificationName,
          specificationValue: spec.specificationValue || "",
          specificationId: spec.id,
          isNew: false,
          isEditing: false,
        }))
      );
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    if (
      Array.isArray(assetDetails.assetSpecification) &&
      assetDetails.assetSpecification.length > 0
    ) {
      setMandatorySpecs(
        assetDetails.assetSpecification.map((spec) => ({
          specificationId: spec.specificationId,
          specificationName: spec.specificationName,
          specificationValue: spec.specificationValue || "",
          isNew: false,
          isEditing: false,
        }))
      );
    }
  }, [assetDetails?.assetSpecification]);

  const validateMandatorySpecs = (): boolean => {
    const errors: string[] = [];
    mandatorySpecs.forEach((spec, index) => {
      if (!spec.specificationValue.trim()) {
        errors[index] = `${spec.specificationName} is required`;
      }
    });
    setSpecErrors(errors);
    return errors.length === 0;
  };

  const handleSpec = async () => {
    if (isSubmitting()) return;
    try {
      if (!validateMandatorySpecs()) {
        return;
      }
      const checkExist =
        Array.isArray(mandatorySpecs) &&
        mandatorySpecs.every((i) => i.specificationValue === "");

      if (!checkExist) {
        if (
          Array.isArray(assetDetails.assetSpecification) &&
          assetDetails.assetSpecification.length === 0
        ) {
          AddSpecification();
        } else {
          const res = await DeleteAssetSpec();
          if (res?.statusCode === 200 || res?.statusCode === 201) {
            AddSpecification();
          } else {
            toast.error("Something went wrong");
          }
        }
      }
    } catch (err) {
      console.log(err);
    }
  };

  const AddSpecification = async () => {
    try {
      startLoading();
      const body = {
        assetId: Number(pathname),
        specifications: mandatorySpecs.map((spec: any) => ({
          specificationId: spec.specificationId,
          specificationName: spec.specificationName,
          specificationValue: spec.specificationValue,
        })),
      };
      const { endpoint, method } =
        FamConfig.AssetInfo.Specification.AddSpecification;
      const response = await Apirequest(endpoint, method, body, "fam").then(
        (res) => res.data
      );
      if (response.statusCode === 200 || response.statusCode === 201) {
        GetAssetDetails();
        Swal.fire({
          title: "Specifications Saved Successfully",
          icon: "success",
          confirmButtonText: "Okay",
        });
      } else {
        toast.error(response.message);
      }
    } catch (err) {
      console.log(err);
    } finally {
      stopLoading();
    }
  };

  useEffect(() => {
    if (assetDetails?.assetGroupId) {
      GetSpecification(assetDetails?.assetGroupId);
    }
  }, [assetDetails?.assetGroupId]);

  useEffect(() => {
    if (
      (pathname && warrantyInputs.warrantyTypeData.length > 0) ||
      warrantyInputs.warrantyClaimData.length > 0 ||
      warrantyInputs.countryData.length > 0
    ) {
      GetAssetDetails();
    }
  }, [
    pathname,
    warrantyInputs.warrantyClaimData,
    warrantyInputs.warrantyTypeData,
    warrantyInputs.countryData,
  ]);

  const GetDisposalType = async () => {
    try {
      const { endpoint, method } = FamConfig.AssetDisposal.DisposalType;
      const response = await Apirequest(endpoint, method, null, "fam").then(
        (res) => res.data
      );
      setDisposal({ ...disposal, disposalData: response.data });
    } catch (err) {
      console.log(err);
    }
  };

  const disposalPayload: {
    assetId: number;
    disposalDate: string;
    disposalType?: number;
    disposalReason: string;
    disposalAmount: string;
    assetPurchaseId: number;
    id?: number;
  } = {
    assetId: Number(pathname),
    disposalDate: dayjs(disposal.disposalDate).format("YYYY-MM-DD"),
    disposalType: disposal.disposalType?.id,
    disposalReason: disposal.reason,
    disposalAmount: disposal.amount,
    assetPurchaseId: disposal.assetPurchaseId,
    id: disposal.disposalId ? disposal.disposalId : undefined,
  };

  const handleSubmitDisposal = async () => {
    if (isSubmitting()) return;
    try {
      startLoading();
      if (!disposal.disposalId) {
        delete disposalPayload.id;
        const { endpoint, method } = FamConfig.AssetDisposal.AddDisposal;
        const response = await Apirequest(
          endpoint,
          method,
          disposalPayload,
          "fam"
        ).then((res) => res.data);
        if (response.statusCode === 200 || response.statusCode === 201) {
          Swal.fire({
            title: "Asset Disposal Added Successfully",
            icon: "success",
            confirmButtonText: "okay",
            customClass: {
              title: "custom-title",
            },
          });
          GetAssetDetails();
        } else {
          toast.error(response.message);
        }
      } else {
        const { endpoint, method } = FamConfig.AssetDisposal.UpdateDisposal;
        const response = await Apirequest(
          endpoint,
          method,
          disposalPayload,
          "fam"
        ).then((res) => res.data);
        if (response.statusCode === 200 || response.statusCode === 201) {
          Swal.fire({
            title: "Asset Disposal Updated Successfully",
            icon: "success",
            confirmButtonText: "okay",
            customClass: {
              title: "custom-title",
            },
          });
          GetAssetDetails();
        } else {
          toast.error(response.message);
        }
      }
    } catch (err) {
      console.log(err);
    } finally {
      stopLoading();
    }
  };

  useEffect(() => {
    const currentPath = window.location.pathname.split("/").at(-1);
    setPathname(currentPath as string);
    if (isInitialLoad) {
      Promise.all([GetDisposalType(), GetRenewStatus()]).catch(console.error);
      setIsInitialLoad(false);
    }
  }, [isInitialLoad]);

  const handleInvoiceFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPdfFlag(false);
    setInvoiceError("");
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== "application/pdf") {
      setInvoiceError("Only PDF files are allowed.");
      setInvoiceFile(null);
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setInvoiceError("File size must be less than 2MB.");
      setInvoiceFile(null);
      return;
    }
    const formData = new FormData();
    formData.append("file", file);
    UploadInvoice(formData);
    setInvoiceFile(file);
  };

  const handleInvoiceUpload = async () => {
    setPdfFlag(false);
    if (!invoiceFile) return;
    try {
      const body = {
        id: Number(pathname),
        assetCode: assetDetails?.assetCode?.trim(),
        assetPath: invoiceDoc.imageName?.trim(),
      };
      const { endpoint, method } = FamConfig.AssetMasterGeneral.SaveInvoice;
      const result = await Apirequest(endpoint, method, body, "fam").then(
        (res) => res.data
      );
      if (result.statusCode === 200 || result.statusCode === 201) {
        toast.success("Document Saved successfully");
      } else {
        toast.error("Please upload valid document");
      }
    } catch (err) {
      setInvoiceError("Failed to upload invoice. Please try again.");
    }
  };

  const UploadInvoice = async (formData: FormData) => {
    try {
      const { endpoint, method } = FamConfig.AssetMasterGeneral.InvoiceUpload;
      const result = await Apirequest(endpoint, method, formData, "fam").then(
        (res) => res.data
      );
      if (result.statusCode === 200 || result.statusCode === 201) {
        setInvoiceDoc({
          ...invoiceDoc,
          imageName: result?.data?.assetDocument,
          imageBase64: result?.data?.assetDocumentBase64,
        });
        toast.success("Document uploaded successfully");
      } else {
        toast.error("Please upload valid document");
      }
    } catch (err) {
      console.log(err);
    }
  };

  const DeleteInvoice = async () => {
    setPdfFlag(false);
    try {
      const body = {
        assetPath: invoiceDoc.imageName,
      };
      const { endpoint, method } = FamConfig.AssetMasterGeneral.InvoiceDelete;
      const result = await Apirequest(endpoint, method, body, "fam").then(
        (res) => res.data
      );
      if (result.statusCode === 200 || result.statusCode === 201) {
        setInvoiceDoc({
          imageName: "",
          imageBase64: "",
        });
        setInvoiceFile(null);
        setInvoiceError("");
        toast.success("Document deleted successfully");
      } else {
        toast.error("Please upload valid document");
      }
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <Box component={"section"}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        p={1}
      >
        <IconBreadcrumbs
          parent="Asset Management"
          child={"Asset List"}
          subParent="Asset Detail"
          path="/fam/asset-management/asset-list"
        />
      </Box>
      <Box
        component={"section"}
        p={2}
        pt={0}
        mb={1}
        bgcolor={"#fff"}
        borderRadius={"12px"}
        border={"1px solid #cbcbcb"}
      >
        <Box position={"relative"}>
          <DialogTitle className="highlighted-header" sx={{ pl: 0 }}>
            Asset Detailed Page
          </DialogTitle>
          <Link href={`/fam/asset-management/edit-asset/${pathname}`}>
            <MuiButton
              startIcon={<MdOutlineEditNote size={24} />}
              sx={{
                background: "#3a8484!important",
                color: "#fff",
                position: "absolute",
                right: 0,
                top: 15,
              }}
            >
              Edit Asset
            </MuiButton>
          </Link>
        </Box>
        <AssetCommonDetails assetDetails={assetDetails} />

        <TabContext value={value}>
          <Box
            mt={0}
            sx={{
              bgcolor: "background.paper",
              "& .MuiTabs-indicator": {
                top: 0,
                display: "none",
              },
              "& .MuiButtonBase-root": {
                textTransform: "capitalize",
                fontSize: 16,
                fontFamily: "var(--poppins-font)",
                border: "1px solid  rgba(0, 0, 0, 0.09)",
                p: 1,
                minHeight: 0,
                borderRadius: "12px 12px 0 0",
              },
              "& .MuiTabs-list": {
                gap: "5px",
                borderBottom: "1px solid #3a8484",
              },
              "& .Mui-selected": {
                border: "1px solid #3a8484",
                borderBottom: "1px solid #fff",
                borderTop: "4px solid #3a8484",
                zIndex: 2,
                top: 1,
                borderRadius: "12px 12px 0 0",
              },
            }}
          >
            <Tabs
              value={value}
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
              aria-label="scrollable auto tabs example"
            >
              <Tab label="Asset Location" value={0} />
              <Tab label="Purchase Information" value={1} />
              <Tab label="Specification" value={2} />
              <Tab label="Warranty" value={3} />
              <Tab label="AMC" value={4} />
              <Tab label="Disposal" value={5} />
              <Tab label="Insurance" value={6} />
            </Tabs>
          </Box>
          <TabPanel value={0} sx={{ p: "4px" }}>
            <Grid2 container spacing={0}>
              {sampleObj.map((item) => (
                <Grid2 size={3} key={item.id}>
                  <Box mt={2}>
                    <MuiText variant="caption" fontSize={14}>
                      {item.title}
                    </MuiText>
                    <MuiText
                      variant="h6"
                      fontSize={18}
                      className="asset-page-title"
                    >
                      {item.value}
                    </MuiText>
                  </Box>
                </Grid2>
              ))}
            </Grid2>
          </TabPanel>
          <TabPanel value={1} sx={{ p: "4px" }}>
            <Grid container spacing={1}>
              <Grid xs={12} sm={6} md={9} lg={9}>
                <Grid container spacing={1}>
                  {Array.isArray(detailsData) &&
                    detailsData.map((item) => (
                      <Grid xs={12} sm={6} md={4} lg={3} key={item.id}>
                        <Box
                          sx={{
                            p: 1,
                            m: 2,
                            height: "100%",
                            // borderRadius: "10px",
                            boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
                            background: "#fff",
                            transition: "all 0.3s ease",
                            "&:hover": {
                              transform: "translateY(-3px)",
                              boxShadow: "0 8px 25px rgba(58,132,132,0.12)",
                            },
                          }}
                        >
                          <MuiText
                            variant="caption"
                            fontSize={14}
                            sx={{
                              color: "#3a8484",
                              fontWeight: 500,
                              letterSpacing: "0.3px",
                              textTransform: "uppercase",
                              display: "block",
                              mb: 0.5,
                            }}
                          >
                            {item.title}
                          </MuiText>
                          <MuiText
                            variant="h6"
                            fontSize={20}
                            fontWeight={600}
                            className="asset-page-title"
                            sx={{ color: "#2c3e50" }}
                          >
                            {item.value === "" ? "—" : item.value}
                          </MuiText>
                        </Box>
                      </Grid>
                    ))}
                  <Grid xs={12} sm={6} md={4} lg={3}>
                    <Box
                      sx={{
                        p: 1,
                        m: 2,
                        height: "100%",
                        // borderRadius: "10px",
                        boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
                        background: "#fff",
                        transition: "all 0.3s ease",
                        "&:hover": {
                          transform: "translateY(-3px)",
                          boxShadow: "0 8px 25px rgba(58,132,132,0.12)",
                        },
                      }}
                    >
                      <MuiText
                        variant="caption"
                        fontSize={14}
                        sx={{
                          color: "#3a8484",
                          fontWeight: 500,
                          letterSpacing: "0.3px",
                          textTransform: "uppercase",
                          display: "block",
                          mb: 0.5,
                        }}
                      >
                        Date Put To Use
                      </MuiText>
                      <MuiText
                        variant="h6"
                        fontSize={20}
                        fontWeight={600}
                        className="asset-page-title"
                        sx={{ color: "#2c3e50" }}
                      >
                        {assetDetails?.putToUseDate
                          ? formatDate(assetDetails?.putToUseDate)
                          : "-"}
                      </MuiText>
                    </Box>
                  </Grid>
                  <Grid xs={12} sm={6} md={9} lg={9}>
                    <Box
                      sx={{
                        p: 2,
                        m: 2,
                        height: "100%",
                        // borderRadius: "10px",
                        boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
                        background: "#fff",
                        transition: "all 0.3s ease",
                        "&:hover": {
                          transform: "translateY(-3px)",
                          boxShadow: "0 8px 25px rgba(58,132,132,0.12)",
                        },
                      }}
                    >
                      <MuiText
                        variant="caption"
                        fontSize={14}
                        sx={{
                          color: "#3a8484",
                          fontWeight: 500,
                          letterSpacing: "0.3px",
                          textTransform: "uppercase",
                          display: "block",
                          mb: 0.5,
                        }}
                      >
                        Additional Cost
                      </MuiText>
                      {Array.isArray(assetDetails?.assetAdditionalCost) &&
                      assetDetails?.assetAdditionalCost.length > 0 ? (
                        <>
                          <Grid2 container spacing={2}>
                            {["Cost Type", "Journal Number", "Amount"].map(
                              (li) => (
                                <Grid2 size={{ xs: 4 }}>
                                  <MuiText
                                    variant="caption"
                                    fontSize={14}
                                    key={li}
                                    sx={{
                                      color: "#3a8484",
                                      fontWeight: 500,
                                      letterSpacing: "0.3px",
                                      textTransform: "uppercase",
                                      display: "block",
                                      mb: 0.5,
                                    }}
                                  >
                                    {li}
                                  </MuiText>
                                </Grid2>
                              )
                            )}
                          </Grid2>
                          {Array.isArray(assetDetails?.assetAdditionalCost) &&
                            assetDetails?.assetAdditionalCost.map(
                              (li, index) => (
                                <Grid2 container spacing={4} key={index}>
                                  <Grid2 size={{ xs: 4 }}>
                                    <MuiText
                                      variant="h6"
                                      fontSize={20}
                                      fontWeight={600}
                                      className="asset-page-title"
                                      sx={{ color: "#2c3e50" }}
                                    >
                                      {li?.costTypeDesc}
                                    </MuiText>
                                  </Grid2>
                                  <Grid2 size={{ xs: 4 }}>
                                    <MuiText
                                      variant="h6"
                                      fontSize={20}
                                      fontWeight={600}
                                      className="asset-page-title"
                                      sx={{ color: "#2c3e50" }}
                                    >
                                      {li?.journalNo}
                                    </MuiText>
                                  </Grid2>
                                  <Grid2 size={{ xs: 4 }}>
                                    <MuiText
                                      variant="h6"
                                      fontSize={20}
                                      fontWeight={600}
                                      className="asset-page-title"
                                      sx={{ color: "#2c3e50" }}
                                    >
                                      ₹ {li?.amount}
                                    </MuiText>
                                  </Grid2>
                                </Grid2>
                              )
                            )}
                        </>
                      ) : (
                        "-"
                      )}
                    </Box>
                  </Grid>
                </Grid>
              </Grid>
              <Grid xs={12} sm={6} md={3} lg={3} pt={2}>
                <Box
                  sx={{
                    p: 3,
                    borderRadius: "10px",
                    background:
                      "linear-gradient(135deg, #e0f7fa 0%, #f5f5f5 100%)",
                    boxShadow: "0 8px 24px rgba(58,132,132,0.09)",
                    border: "1.5px dashed #3a8484",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    position: "relative",
                    // height: "100%",
                    minHeight: 220,
                    transition: "all 0.3s ease",
                    "&:hover": {
                      boxShadow: "0 12px 28px rgba(58,132,132,0.15)",
                    },
                  }}
                >
                  <input
                    type="file"
                    accept="application/pdf"
                    id="invoice-upload"
                    style={{ display: "none" }}
                    onChange={handleInvoiceFileChange}
                  />
                  <label
                    htmlFor="invoice-upload"
                    style={{ width: "100%", cursor: "pointer" }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        height: 140,
                        width: "100%",
                        transition: "all 0.25s ease",
                        borderRadius: "8px",
                        "&:hover": {
                          background: "rgba(58,132,132,0.08)",
                        },
                      }}
                    >
                      <MdOutlineLibraryAdd
                        size={52}
                        color="#3a8484"
                        style={{
                          filter: "drop-shadow(0 3px 5px rgba(58,132,132,0.2))",
                        }}
                      />
                      <MuiText
                        variant="subtitle1"
                        sx={{
                          color: "#3a8484",
                          fontWeight: 600,
                          mt: 2,
                          fontSize: "1rem",
                        }}
                      >
                        Upload Invoice (PDF, &lt; 2MB)
                      </MuiText>
                      <MuiText
                        variant="caption"
                        sx={{
                          color: "#637381",
                          mt: 0.5,
                          fontSize: "0.85rem",
                        }}
                      >
                        Drag & drop or click to select file
                      </MuiText>
                    </Box>
                  </label>

                  {invoiceDoc.imageName !== "" && (
                    <Box
                      sx={{
                        mt: 2,
                        p: 2,
                        background: "#fff",
                        borderRadius: "8px",
                        boxShadow: "0 4px 12px rgba(58,132,132,0.08)",
                        width: "100%",
                        textAlign: "center",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 1,
                      }}
                    >
                      <MuiText
                        variant="body2"
                        sx={{ fontWeight: 500, color: "#2c3e50" }}
                      >
                        {invoiceDoc.imageName}
                      </MuiText>
                      <Box
                        sx={{
                          display: "flex",
                          gap: 1,
                          justifyContent: "center",
                        }}
                      >
                        <MuiButton
                          color="primary"
                          size="small"
                          startIcon={<HiViewfinderCircle />}
                          sx={{
                            borderRadius: "6px",
                            textTransform: "none",
                            fontWeight: 500,
                          }}
                          onClick={() => {
                            if (pdfFlag) {
                              window.open(invoiceDoc.imageBase64, "_blank");
                            } else if (!pdfFlag && invoiceDoc.imageBase64) {
                              const pdfWindow = window.open();
                              pdfWindow?.document.write(
                                `<iframe width='100%' height='100%' src='data:application/pdf;base64,${invoiceDoc.imageBase64}'></iframe>`
                              );
                            }
                          }}
                        >
                          View
                        </MuiButton>
                        <MuiButton
                          color="error"
                          size="small"
                          startIcon={<MdClose />}
                          sx={{
                            borderRadius: "6px",
                            textTransform: "none",
                            fontWeight: 500,
                          }}
                          onClick={DeleteInvoice}
                        >
                          Remove
                        </MuiButton>
                      </Box>
                    </Box>
                  )}

                  {invoiceError && (
                    <MuiText color="error" sx={{ mt: 1, fontWeight: 500 }}>
                      {invoiceError}
                    </MuiText>
                  )}

                  <MuiButton
                    variant="contained"
                    sx={{
                      mt: 2,
                      background:
                        "linear-gradient(135deg, #3a84840%, #2e6d6d 100%) !important",
                      color: "#fff",
                      fontWeight: 600,
                      px: 4,
                      py: 1,
                      borderRadius: "8px",
                      boxShadow: "0 6px 16px rgba(58,132,132,0.2)",
                      textTransform: "none",
                      fontSize: "0.95rem",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        transform: "translateY(-2px)",
                        boxShadow: "0 8px 20px rgba(58,132,132,0.25)",
                      },
                      "&:disabled": {
                        background:
                          "linear-gradient(135deg, #b7b7b7 0%, #a0a0a0 100%) !important",
                        color: "#f0f0f0",
                      },
                    }}
                    disabled={!invoiceFile}
                    onClick={handleInvoiceUpload}
                  >
                    Upload Invoice
                  </MuiButton>
                </Box>
              </Grid>
            </Grid>
          </TabPanel>
          <TabPanel value={2} sx={{ p: 0 }}>
            <Box sx={specificationStyles.container}>
              <Box
                sx={specificationStyles.header}
                display={"flex"}
                justifyContent={"space-between"}
              >
                <MuiText
                  variant="h6"
                  sx={{ color: "#107869", fontWeight: 600 }}
                >
                  Asset Specifications
                </MuiText>
                <Box sx={{ textAlign: "right" }}>
                  <MuiButton
                    variant="contained"
                    color="primary"
                    onClick={handleSpec}
                    disabled={isSubmitting()}
                    sx={{
                      border: "1px solid #3a8484!important",
                      background: "#fff !important",
                      color: "#3a8484!important",
                    }}
                  >
                    Save Specifications
                  </MuiButton>
                </Box>
              </Box>

              <Box sx={specificationStyles.specGrid}>
                {mandatorySpecs.map((spec, index) => (
                  <Box key={index} sx={specificationStyles.specCard}>
                    <Grid2 container spacing={3} alignItems="center">
                      <Grid2 size={6}>
                        <MuiText variant="body1" sx={{ fontWeight: 500 }}>
                          {spec.specificationName}
                        </MuiText>
                      </Grid2>
                      <Grid2 size={6}>
                        <MuiInputField
                          fullWidth
                          size="small"
                          value={spec.specificationValue}
                          onChange={(e) => {
                            setSpecErrors([]);
                            setMandatorySpecs((prev) =>
                              prev.map((s, i) =>
                                i === index
                                  ? { ...s, specificationValue: e.target.value }
                                  : s
                              )
                            );
                          }}
                          error={!!specErrors[index]}
                          helperText={specErrors[index]}
                        />
                      </Grid2>
                    </Grid2>
                  </Box>
                ))}
                <Box sx={specificationStyles.specCard}>
                  <Grid2 container spacing={3} alignItems="center">
                    <Grid2 size={6}>
                      <Autocomplete
                        size="small"
                        options={optionalSpecs.map(
                          (spec) => spec.specificationName
                        )}
                        onChange={(_, newValue) => {
                          const selectedSpec = optionalSpecs.find(
                            (spec) => spec.specificationName === newValue
                          );
                          if (selectedSpec) {
                            setMandatorySpecs((prev) => [
                              ...prev,
                              { ...selectedSpec, isNew: true },
                            ]);
                            setOptionalSpecs((prev) =>
                              prev.filter(
                                (spec) => spec.specificationName !== newValue
                              )
                            );
                          }
                        }}
                        renderInput={(params) => (
                          <MuiInputField
                            {...params}
                            label="Add Optional Specification"
                            size="small"
                          />
                        )}
                      />
                    </Grid2>
                  </Grid2>
                </Box>
              </Box>
            </Box>
          </TabPanel>
          <TabPanel value={3} sx={{ p: 0, py: 1.2 }}>
            <AssetWaranty
              warrantyInputs={warrantyInputs}
              handleAutocomplete={handleAutocomplete}
              handleChange={handleChange}
              handleDate={handleDate}
              errors={errors}
              setErrors={setErrors}
              pathname={pathname}
              warrantyId={warrantyId}
              onUpdated={GetAssetDetails}
              isWarrantyCreated={isWarrantyCreated}
            />
          </TabPanel>
          <TabPanel value={4} sx={{ p: 0, py: 1.2 }}>
            <AssetDetailAmc
              amcList={assetDetails?.assetAmc}
              pathname={pathname}
              renewalData={renewalData}
              onUpdated={GetAssetDetails}
            />
          </TabPanel>
          <TabPanel value={5} sx={{ p: 0, py: 1.2 }}>
            <AssetDisposal
              disposal={disposal}
              handleAutocomplete={(newvalue: any) =>
                setDisposal({ ...disposal, disposalType: newvalue })
              }
              handleDate={(value: dayjs.Dayjs | null) =>
                setDisposal({
                  ...disposal,
                  disposalDate: value ? dayjs(value).format("YYYY-MM-DD") : "",
                })
              }
              handleChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setDisposal({ ...disposal, [e.target.name]: e.target.value });
              }}
              handleSubmit={handleSubmitDisposal}
            />
          </TabPanel>
          <TabPanel value={6} sx={{ p: 0, py: 1.2 }}>
            <AssetDetailInsurance
              insuranceList={assetDetails?.assetInsurance}
              renewalData={renewalData}
              pathname={pathname}
              onUpdated={GetAssetDetails}
            />
          </TabPanel>
        </TabContext>
      </Box>
    </Box>
  );
}

export default AssetDetailPage;
