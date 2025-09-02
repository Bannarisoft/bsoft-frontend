"use client";

import * as React from "react";
import Box from "@mui/material/Box";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import StepContent from "@mui/material/StepContent";
import Typography from "@mui/material/Typography";
import { MuiButton, MuiText } from "bsoft-base-elements";
import IconBreadcrumbs from "../../../molecules/AdminLayout/BreadCrumbs";
import AssetGeneralInformation from "./AssetGeneralInformation";
import AssetLocation from "./AssetLocation";
import PurchaseInformation from "./PurchaseInformation";
import { MdInfo } from "react-icons/md";
import { HiLocationMarker } from "react-icons/hi";
import { BsCreditCard } from "react-icons/bs";
import { assetService, useAssetState } from "./useAssetState";
import { RiCheckDoubleLine } from "react-icons/ri";
import { useRecoilValue } from "recoil";
import { UserData } from "../../../../utils/atoms";
import { usePurchaseForm } from "./usePurchaseForm";
import { useAssetLocation } from "./useAssetLocation";
import {
  Apirequest,
  isSubmitting,
  startLoading,
  stopLoading,
} from "../../../../utils/lib";
import FamConfig from "../../../../utils/fam.api.json";
import dayjs from "dayjs";
import ErrorModal from "../../../molecules/Master/Role/ErrorModal";
import utc from "dayjs/plugin/utc";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { useRouter } from "next/navigation";
import { usePurchaseDetails } from "./usePurchaseDetails";
import GifLoader from "../../../atoms/GifLoader";
import toast from "react-hot-toast";

dayjs.extend(utc);
dayjs.extend(customParseFormat);
export interface LocationState {
  departmentData: any[];
  selectedDepartment: {} | null;
  locationData: any[];
  selectedLocation: {} | null;
  subLocationData: any[];
  selectedSubLocation: {} | null;
  custodianData: any[];
  selectedCustodian: {} | null;
  selectedUser: {} | null;
}

export default function AddAssetPage({ assetId }: { assetId?: string }) {
  const router = useRouter();

  const {
    purchaseState,
    handlePurchaseAutoComplete,
    additionalCosts,
    handleCostChange,
    handleAddCost,
    handleDeleteCost,
    errors: purchaseErrors,
    validatePurchaseForm,
    handleChange,
    purchaseDispatch,
    itemLoading,
    setAdditionalCosts,
  } = usePurchaseForm();

  const {
    state,
    handleAutoComplete,
    handleInputChange,
    errors,
    setErrors,
    handleImageDrop,
    isUploading,
    dispatch,
  } = useAssetState();

  const {
    locationState,
    handleLocationAutoComplete,
    errors: locationErrors,
    setErrors: setLocationErrors,
    locationDispatch,
  } = useAssetLocation();

  const {
    poDetailsInput,
    handlePoInputChange,
    poDataErrors,
    setPoDataErrors,
    poDataDispatch,
  } = usePurchaseDetails();

  const [activeStep, setActiveStep] = React.useState(0);
  const userValue = useRecoilValue(UserData);
  const [loading, setLoading] = React.useState(false);
  const [errorModalOpen, setErrorModalOpen] = React.useState(false);
  const [errorMessages, setErrorMessages] = React.useState<string[]>([]);
  const [mainAssetData, setMainAssetData] = React.useState<any>({});
  const [stepValidation, setStepValidation] = React.useState({
    0: { validated: false, hasError: false },
    1: { validated: false, hasError: false },
    2: { validated: false, hasError: false },
  });

  const fieldValidations: Record<string, (value: string) => string> = {
    grnNo: (val) => (!val ? "GRN No is required" : ""),
    poNo: (val) => (!val ? "PO No is required" : ""),
    grnDate: (val) => (!val ? "GRN Date is required" : ""),
    poDate: (val) => (!val ? "PO Date is required" : ""),
    billDate: (val) => (!val ? "Bill Date is required" : ""),
    grnSno: (val) => (!val ? "GRN SNo is required" : ""),
    poSno: (val) => (!val ? "PO SNo is required" : ""),
    grnValue: (val) => (!val ? "GRN Value is required" : ""),
    purchaseValue: (val) => (!val ? "Purchase value is required" : ""),
    itemCode: (val) => (!val ? "Item Code is required" : ""),
    itemName: (val) => (!val ? "Item Name is required" : ""),
    acceptedQty: (val) => (!val ? "Accepted Qty is required" : ""),
    vendorCode: (val) => (!val ? "Vendor Code is required" : ""),
    vendorName: (val) => (!val ? "Vendor Name is required" : ""),
    billNo: (val) => (!val ? "Bill No is required" : ""),
    pjYear: (val) => (!val ? "Purchase Journal Year is required" : ""),
    pjDocNo: (val) => (!val ? "Purchase Journal Doc No is required" : ""),
  };

  const validateField = (name: string, value: string): string => {
    const validate = fieldValidations[name];
    return validate ? validate(value) : "";
  };

  const validateAllFields = (): boolean => {
    if (purchaseState.manual) {
      const errors: Record<string, string> = {};
      let isValid = true;
      Object.keys(fieldValidations).forEach((name) => {
        const value = poDetailsInput[name] || "";
        const error = validateField(name, value);
        if (error) {
          isValid = false;
          errors[name] = error;
        }
      });
      setPoDataErrors(errors);
      return isValid;
    }
    return true;
  };

  const handleNext = async () => {
    if (isSubmitting()) return;
    startLoading();

    try {
      switch (activeStep) {
        case 0: {
          const mandatoryGeneralFields = [
            "selectedAssetGroup",
            "selectedAssetCategory",
            "selectedAssetSubCategory",
            "assetName",
            "selectedUom",
            "selectedAssetType",
            "quantity",
            "assetImage",
          ];

          const generalErrors: string[] = Object.entries(state)
            .filter(
              ([key, value]) =>
                mandatoryGeneralFields.includes(key) &&
                (value === null || value === "")
            )
            .map(([key]) => key);

          if (generalErrors.length > 0) {
            setErrors(generalErrors);
            setStepValidation((prev) => ({
              ...prev,
              [activeStep]: { validated: true, hasError: true },
            }));
            throw new Error(
              "Please fill all mandatory fields in General Information"
            );
          }

          setStepValidation((prev) => ({
            ...prev,
            [activeStep]: { validated: true, hasError: false },
          }));
          setActiveStep(1);
          break;
        }

        case 1: {
          const mandatoryLocationFields = [
            "selectedDepartment",
            "selectedLocation",
            "selectedSubLocation",
            "selectedCustodian",
          ];

          const locationErrors: string[] = Object.entries(locationState)
            .filter(
              ([key, value]) => mandatoryLocationFields.includes(key) && !value
            )
            .map(([key]) => key);

          if (locationErrors.length > 0) {
            setLocationErrors(locationErrors);
            setStepValidation((prev) => ({
              ...prev,
              [activeStep]: { validated: true, hasError: true },
            }));
            throw new Error(
              "Please fill all mandatory fields in Asset Location"
            );
          }

          setStepValidation((prev) => ({
            ...prev,
            [activeStep]: { validated: true, hasError: false },
          }));
          setActiveStep(2);
          break;
        }

        case 2: {
          const isPurchaseValid = validatePurchaseForm() && validateAllFields();

          if (!isPurchaseValid) {
            setStepValidation((prev) => ({
              ...prev,
              [activeStep]: { validated: true, hasError: true },
            }));
            toast.error(
              "Please fill all mandatory fields in Purchase Information"
            );
            return;
          }

          setStepValidation((prev) => ({
            ...prev,
            [activeStep]: { validated: true, hasError: false },
          }));

          setLoading(true);
          const result = await AddAsset();

          if (result.statusCode === 200 || result.statusCode === 201) {
            setActiveStep(3);
            setLoading(false);
            setTimeout(() => {
              router.push(`/fam/asset-management/asset-list`);
            }, 500);
          } else {
            setLoading(false);
            if (result.errors) {
              setErrorMessages(result.errors);
              setErrorModalOpen(true);
            }
            toast.error(result?.message || "Something went wrong");
          }
          return;
        }
      }
    } catch (error: any) {
      console.error("Validation Error:", error);
    } finally {
      stopLoading();
    }
  };

  const handleBack = () => {
    setStepValidation((prev) => ({
      ...prev,
      [activeStep]: { validated: false, hasError: false },
    }));
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const GetAssetDetails = async () => {
    try {
      const { endpoint, method } = FamConfig.AssetInfo.GetAssetDetailByIdSplit;
      const response = await Apirequest(
        endpoint.replace("{id}", assetId || ""),
        method,
        null,
        "fam"
      );

      if (!response?.data?.data) throw new Error("No data received");

      const assetData = response.data.data;
      setMainAssetData(assetData);

      dispatch({ type: "assetName", payload: assetData?.assetName });
      dispatch({ type: "assetImage", payload: assetData?.assetImageName });
      dispatch({ type: "assetImageBase64", payload: assetData?.assetImage });
      dispatch({ type: "assetImageFile", payload: assetData?.assetImage });

      const assetGroup = state.assetGroupData.find(
        (i) => i.id == assetData?.assetGroupId
      );
      if (assetGroup) {
        const getCategory = await assetService.getAssetCategories(
          assetGroup.id
        );
        const getSubGroup = await assetService.getAssetSubGroup(assetGroup.id);
        dispatch({ type: "assetCategoryData", payload: getCategory });
        dispatch({ type: "assetSubGroupData", payload: getSubGroup });

        const filterCategory = getCategory.find(
          (i: any) => i.id == assetData?.assetCategoryId
        );
        dispatch({ type: "selectedAssetCategory", payload: filterCategory });

        const filterSubGroup = getSubGroup.find(
          (i: any) => i.id == assetData?.assetSubGroupId
        );
        dispatch({ type: "selectedAssetSubGroup", payload: filterSubGroup });

        if (filterCategory) {
          const getSubCategory = await assetService.getAssetSubCategories(
            filterCategory.id
          );
          dispatch({ type: "assetSubCategoryData", payload: getSubCategory });

          const filterSubCategory = getSubCategory.find(
            (i: any) => i.id == assetData?.assetSubCategoryId
          );
          dispatch({
            type: "selectedAssetSubCategory",
            payload: filterSubCategory,
          });
        }

        dispatch({ type: "selectedAssetGroup", payload: assetGroup });
      }

      dispatch({
        type: "selectedAssetType",
        payload: state.assetTypeData.find((i) => i.id == assetData?.assetType),
      });

      dispatch({
        type: "selectedUom",
        payload: state.uomData.find((i) => i.id == assetData?.uomId),
      });

      dispatch({
        type: "selectedWorkingStatus",
        payload: state.workingStatusData.find(
          (i) => i.id == assetData?.workingStatus
        ),
      });

      dispatch({ type: "quantity", payload: assetData?.quantity });

      // -------------------- LOCATION (IN CORRECT ORDER) ------------------------
      const assetLocation = assetData?.assetLocation;
      if (assetLocation) {
        const selectedLocation = locationState.locationData.find(
          (i) => i.id == assetLocation.locationId
        );
        locationDispatch({
          type: "selectedLocation",
          payload: selectedLocation,
        });

        // Fetch sub-locations AFTER setting selected location
        if (selectedLocation?.id) {
          try {
            const { endpoint, method } = FamConfig.AssetLocation.subLocation;
            const subLocResponse = await Apirequest(
              endpoint.replace("{id}", selectedLocation.id),
              method,
              null,
              "fam"
            );

            const subLocations = subLocResponse?.data?.data || [];
            locationDispatch({
              type: "subLocationData",
              payload: subLocations,
            });

            const selectedSubLocation = subLocations.find(
              (i: any) => i.id === assetLocation.subLocationId
            );
            locationDispatch({
              type: "selectedSubLocation",
              payload: selectedSubLocation,
            });
          } catch (err) {
            console.error("Error fetching sublocation data:", err);
          }
        }

        const selectedDepartment = locationState.departmentData.find(
          (i) => i.id == assetLocation.departmentId
        );
        locationDispatch({
          type: "selectedDepartment",
          payload: selectedDepartment,
        });
      }
      const additionalCosts = (assetData.assetAdditionalCost || []).map(
        (cost: any) => ({
          ...cost,
          costType:
            (purchaseState.additionalCostData || []).find(
              (type: any) => type.id === (cost.costType?.id ?? cost.costType)
            ) || null,
        })
      );

      setAdditionalCosts(additionalCosts);

      // -------------------- PURCHASE ------------------------
      const assetPurchaseDetails = assetData?.assetPurchaseDetails || [];
      const firstPurchase = assetPurchaseDetails[0];
      const source = assetPurchaseDetails[0]?.sourceName;
      if (typeof source === "string" && source.toLowerCase() === "manual") {
        purchaseDispatch({ type: "manual", payload: true });
        Object.entries(firstPurchase).map(([key, value]) => {
          if (typeof key === "string" && key.toLowerCase().includes("date")) {
            const convertFormat = dayjs(
              value as string | number | Date | null | undefined,
              ["YYYY-MM-DDTHH:mm:ssZ", "YYYY-MM-DDTHH:mm:ss", "YYYY-MM-DD"]
            )
              .utc()
              .format("YYYY-MM-DD");
            poDataDispatch({ type: [key] as any, payload: convertFormat });
          } else {
            poDataDispatch({ type: [key] as any, payload: value });
          }
        });
      } else {
        purchaseDispatch({ type: "manual", payload: false });
      }

      const selectedSource = purchaseState.sourceData.find(
        (i) => i?.id == firstPurchase?.assetSourceId
      );
      purchaseDispatch({ type: "selectedSource", payload: selectedSource });

      purchaseDispatch({
        type: "itemDetails",
        payload: assetPurchaseDetails,
      });

      purchaseDispatch({
        type: "capitalisationData",
        payload: firstPurchase?.capitalizationDate,
      });
      purchaseDispatch({
        type: "putToUse",
        payload: dayjs(assetData.putToUseDate).format("YYYY-MM-DD"),
      });
    } catch (err) {
      console.error("Error in GetAssetDetails:", err);
    }
  };

  const GetItemValues = async () => {
    const selectGrn = purchaseState.grnData
      .filter((i) => i?.grnNo == mainAssetData.assetPurchaseDetails[0]?.grnNo)
      ?.at(0);

    if (selectGrn) {
      purchaseDispatch({ type: "selectedGrn", payload: selectGrn });
      try {
        const { endpoint, method } = FamConfig.PurchaseInfo.Items;
        const response = await Apirequest(
          endpoint
            .replace("{oldUnitId}", userValue.oldUnitId.toString())
            .replace(
              "{assetSourceId}",
              purchaseState.selectedSource?.id.toString()
            )
            .replace("{grnNo}", selectGrn.grnNo),
          method,
          null,
          "fam"
        );
        purchaseDispatch({ type: "itemData", payload: response.data?.data });
        const selectItem = response.data?.data
          .filter(
            (i: any) =>
              i?.grnSerialNo == mainAssetData.assetPurchaseDetails[0]?.grnSno
          )
          ?.at(0);
        purchaseDispatch({ type: "selectedItem", payload: selectItem });
        purchaseDispatch({
          type: "capitalisationData",
          payload: mainAssetData.assetPurchaseDetails[0]?.capitalizationDate,
        });
        purchaseDispatch({
          type: "putToUse",
          payload: mainAssetData?.putToUseDate,
        });
      } catch (err) {
        console.error("Error fetching GRN items:", err);
      }
    }
  };

  const AddAsset = async () => {
    try {
      const assetPurchaseDetail: any = {
        budgetType: purchaseState.manual
          ? null
          : purchaseState.itemDetails?.at(0)?.budgetType,
        oldUnitId: userValue.oldUnitId?.toString(),
        vendorCode: purchaseState.manual
          ? poDetailsInput?.vendorCode
          : purchaseState.itemDetails?.at(0)?.vendorCode,
        vendorName: purchaseState.manual
          ? poDetailsInput?.vendorName
          : purchaseState.itemDetails?.at(0)?.vendorName,
        poDate: purchaseState.manual
          ? poDetailsInput?.poDate
          : purchaseState.itemDetails?.at(0)?.poDate
          ? dayjs(purchaseState.itemDetails?.at(0)?.poDate, [
              "YYYY-MM-DDTHH:mm:ssZ",
              "YYYY-MM-DDTHH:mm:ss",
              "YYYY-MM-DD",
            ])
              .utc()
              .format("YYYY-MM-DD")
          : null,
        poNo: Number(purchaseState.manual)
          ? poDetailsInput?.poNo
          : purchaseState.itemDetails?.at(0)?.poNo,
        poSno: purchaseState.manual
          ? Number(poDetailsInput?.poSno)
          : purchaseState.itemDetails?.at(0)?.poSno,
        itemCode: purchaseState.manual
          ? poDetailsInput?.itemCode
          : purchaseState.itemDetails?.at(0)?.itemCode,
        itemName: purchaseState.manual
          ? poDetailsInput?.itemName
          : purchaseState.itemDetails?.at(0)?.itemName,
        grnNo: purchaseState.manual
          ? Number(poDetailsInput?.grnNo)
          : purchaseState.itemDetails?.at(0)?.grnNo,
        grnSno: purchaseState.manual
          ? Number(poDetailsInput?.grnSno)
          : purchaseState.itemDetails?.at(0)?.grnSno,
        grnDate: purchaseState.manual
          ? poDetailsInput?.grnDate
          : purchaseState.itemDetails?.at(0)?.grnDate
          ? dayjs(purchaseState.itemDetails?.at(0)?.grnDate, [
              "YYYY-MM-DDTHH:mm:ssZ",
              "YYYY-MM-DDTHH:mm:ss",
              "YYYY-MM-DD",
            ])
              .utc()
              .format("YYYY-MM-DD")
          : null,
        qcCompleted: purchaseState.manual
          ? poDetailsInput?.qcCompleted
          : purchaseState.itemDetails?.at(0)?.qcCompleted,
        acceptedQty: purchaseState.manual
          ? poDetailsInput?.acceptedQty
          : purchaseState.itemDetails?.at(0)?.acceptedQty,
        purchaseValue: purchaseState.manual
          ? poDetailsInput?.purchaseValue
          : purchaseState.itemDetails?.at(0)?.purchaseValue,
        grnValue: purchaseState.manual
          ? poDetailsInput?.grnValue
          : purchaseState.itemDetails?.at(0)?.grnValue,
        billNo: purchaseState.manual
          ? poDetailsInput?.billNo
          : purchaseState.itemDetails?.at(0)?.billNo,
        billDate: purchaseState.manual
          ? poDetailsInput?.billDate
          : purchaseState.itemDetails?.at(0)?.billDate
          ? dayjs(purchaseState.itemDetails?.at(0)?.billDate, [
              "YYYY-MM-DDTHH:mm:ssZ",
              "YYYY-MM-DDTHH:mm:ss",
              "YYYY-MM-DD",
            ])
              .utc()
              .format("YYYY-MM-DD")
          : null,
        uom: purchaseState.manual
          ? poDetailsInput?.uom
          : purchaseState.itemDetails?.at(0)?.uom,
        binLocation: purchaseState.manual
          ? poDetailsInput?.binLocation
          : purchaseState.itemDetails?.at(0)?.binLocation,
        pjYear: purchaseState.manual
          ? "-"
          : purchaseState.itemDetails?.at(0)?.pjYear,
        pjDocId: purchaseState.manual
          ? "PJ"
          : purchaseState.itemDetails?.at(0)?.pjDocId,
        pjDocSr: purchaseState.manual
          ? null
          : purchaseState.itemDetails?.at(0)?.pjDocSr,
        pjDocNo: purchaseState.manual
          ? Number(poDetailsInput?.pjDocNo)
          : purchaseState.itemDetails?.at(0)?.pjDocNo,
        assetSourceId: purchaseState.manual
          ? 3
          : purchaseState.selectedSource?.id,
      };
      if (purchaseState.capitalisationData) {
        assetPurchaseDetail.capitalizationDate = dayjs(
          purchaseState.capitalisationData
        ).format("YYYY-MM-DD");
      }

      const assetMaster: any = {
        companyId: Number(userValue.companyId),
        companyName: userValue.companyName,
        unitId: Number(userValue.unitId),
        unitName: userValue.unitName,
        assetName: state.assetName,
        assetGroupId: state.selectedAssetGroup?.id,
        assetSubGroupId: state.selectedAssetSubGroup?.id,
        assetCategoryId: state.selectedAssetCategory?.id,
        assetSubCategoryId: state.selectedAssetSubCategory?.id,
        assetParentId: state.selectedParentAsset?.id,
        assetType: state.selectedAssetType?.id,
        machineCode: "",
        quantity: Number(state.quantity),
        uomId: state.selectedUom?.id,
        assetDescription: state.description?.trim(),
        workingStatus: state.selectedWorkingStatus?.id,
        assetImage: state.assetImage,
        nonDepreciated: true,
        tangible: true,
        active: true,
        assetLocation: {
          unitId: Number(userValue.unitId),
          departmentId: locationState.selectedDepartment?.id,
          locationId: locationState.selectedLocation?.id,
          subLocationId: locationState.selectedSubLocation?.id,
          custodianId: locationState.selectedCustodian?.custodianId,
          userId: locationState.selectedUser?.custodianId,
        },
        assetPurchaseDetails: [assetPurchaseDetail],
        assetAdditionalCost:
          Array.isArray(additionalCosts) &&
          additionalCosts.length > 0 &&
          additionalCosts.at(0)?.costType !== null
            ? additionalCosts.map((cost) => ({
                assetSourceId: purchaseState.selectedSource?.id,
                amount: parseFloat(parseFloat(cost.amount).toFixed(2)),
                journalNo: cost.journalNo?.trim(),
                costType: cost.costType?.id,
              }))
            : [],
      };
      if (purchaseState.putToUse) {
        assetMaster.putToUseDate = dayjs(purchaseState.putToUse).format(
          "YYYY-MM-DD"
        );
      }

      if (assetId) {
        assetMaster.id = Number(assetId);
      }

      const body = { assetMaster: assetMaster };

      if (assetId) {
        const { endpoint, method } = FamConfig.AssetGeneral.UpdateAsset;
        const response = await Apirequest(endpoint, method, body, "fam").then(
          (res) => res.data
        );
        return response;
      } else {
        const { endpoint, method } = FamConfig.AssetGeneral.AddAsset;
        const response = await Apirequest(endpoint, method, body, "fam").then(
          (res) => res.data
        );
        return response;
      }
    } catch (err) {
      console.log(err);
    }
  };

  const steps = [
    {
      id: 1,
      label: (
        <MuiText variant="h6" className="admin-page-title">
          General Information
        </MuiText>
      ),
      description: (
        <AssetGeneralInformation
          assetData={state}
          handleAutoComplete={handleAutoComplete}
          handleInputChange={handleInputChange}
          errors={errors}
          handleImageDrop={handleImageDrop}
          isUploading={isUploading}
        />
      ),
      icon: <MdInfo size={18} />,
    },
    {
      id: 2,
      label: (
        <MuiText variant="h6" className="admin-page-title">
          Asset Location
        </MuiText>
      ),
      description: (
        <AssetLocation
          locationState={locationState}
          handleLocationAutoComplete={handleLocationAutoComplete}
          errors={locationErrors}
        />
      ),
      icon: <HiLocationMarker size={18} />,
    },
    {
      id: 3,
      label: (
        <MuiText variant="h6" className="admin-page-title">
          Purchase Information
        </MuiText>
      ),
      description: (
        <PurchaseInformation
          purchaseState={purchaseState}
          handlePurchaseAutoComplete={handlePurchaseAutoComplete}
          purchaseDetails={purchaseState.itemDetails?.at(0)}
          additionalCosts={additionalCosts}
          handleCostChange={handleCostChange}
          handleAddCost={handleAddCost}
          handleDeleteCost={handleDeleteCost}
          errors={purchaseErrors}
          handleChange={handleChange}
          itemLoading={itemLoading}
          poDetailsInput={poDetailsInput}
          handlePoInputChange={handlePoInputChange}
          poDataErrors={poDataErrors}
          setPoDataErrors={setPoDataErrors}
        />
      ),
      icon: <BsCreditCard size={18} />,
    },
  ];

  const CustomStepConnector = React.memo(() => (
    <Box
      sx={{
        position: "absolute",
        left: "18px",
        top: "40px",
        bottom: 0,
        width: "2px",
        background: "linear-gradient(180deg, #107869 50%, #e0e0e0 50%)",
        backgroundSize: "2px 16px",
      }}
    />
  ));

  const CustomStepIcon = React.memo(
    ({
      active,
      completed,
      icon,
    }: {
      active: boolean;
      completed?: boolean;
      icon: React.ReactNode;
    }) => (
      <Box
        sx={{
          width: 40,
          height: 40,
          position: "relative",
          borderRadius: "12px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: active
            ? "linear-gradient(135deg, #107869 0%, #0a5b4f 100%)"
            : completed
            ? "#107869"
            : "#f5f5f5",
          color: active || completed ? "#fff" : "#666",
          transition: "all 0.3s ease",
          transform: active ? "scale(1.1)" : "scale(1)",
          boxShadow: active
            ? "0 8px 16px rgba(16, 120, 105, 0.2)"
            : completed
            ? "0 4px 8px rgba(16, 120, 105, 0.1)"
            : "none",
          "&:before": {
            content: '""',
            position: "absolute",
            top: -2,
            left: -2,
            right: -2,
            bottom: -2,
            background: active
              ? "linear-gradient(135deg, #107869 0%, #0a5b4f 100%)"
              : "transparent",
            borderRadius: "14px",
            opacity: 0.5,
            filter: "blur(8px)",
            zIndex: -1,
          },
        }}
      >
        {icon}
      </Box>
    )
  );

  React.useEffect(() => {
    if (
      mainAssetData?.assetPurchaseDetails?.length > 0 &&
      purchaseState.grnData?.length > 0
    ) {
      GetItemValues();
    }
  }, [mainAssetData, purchaseState.grnData]);

  React.useEffect(() => {
    if (
      mainAssetData?.assetPurchaseDetails?.length > 0 &&
      purchaseState.itemData?.length > 0
    ) {
      const selectItem =
        Array.isArray(purchaseState?.itemData) &&
        purchaseState?.itemData
          ?.filter(
            (i) => i?.grnSno == mainAssetData.assetPurchaseDetails[0]?.grnSno
          )
          ?.at(0);

      if (selectItem) {
        purchaseDispatch({ type: "selectedItem", payload: selectItem });
      }
    }
  }, [mainAssetData, purchaseState.itemData]);

  React.useEffect(() => {
    if (mainAssetData) {
      const selectCustodian =
        Array.isArray(locationState?.custodianData) &&
        locationState.custodianData
          ?.filter(
            (i) => i?.custodianId == mainAssetData?.assetLocation?.custodianId
          )
          .at(0);
      locationDispatch({ type: "selectedCustodian", payload: selectCustodian });
      const selectUser =
        Array.isArray(locationState?.custodianData) &&
        locationState.custodianData
          .filter((i) => i?.custodianId == mainAssetData?.assetLocation?.userId)
          ?.at(0);
      locationDispatch({ type: "selectedUser", payload: selectUser });
    }
  }, [mainAssetData, locationState.custodianData]);

  React.useEffect(() => {
    if (assetId) {
      GetAssetDetails();
    }
  }, [assetId, state.assetGroupData, purchaseState.sourceData]);

  return (
    <Box>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        p={1}
      >
        <IconBreadcrumbs
          parent="Asset Management"
          child="Asset List"
          subParent={assetId ? "Edit Asset" : "Create Asset"}
          path="/fam/asset-management/asset-list"
        />
      </Box>

      <Box
        p={4}
        pt={3}
        bgcolor="#fff"
        mt={1}
        border={"1px solid #cbcbcb"}
        borderRadius={"12px"}
      >
        <Stepper
          activeStep={activeStep}
          orientation="vertical"
          sx={{
            "& .MuiStepConnector-root": {
              display: "none",
            },
            "& .MuiStep-root": {
              position: "relative",
              marginBottom: 3,
            },
          }}
        >
          {steps.map((step, index) => (
            <Step key={step.id}>
              <StepLabel
                StepIconComponent={({ active }) => (
                  <CustomStepIcon
                    active={active || activeStep === index}
                    completed={activeStep > index}
                    icon={step.icon}
                  />
                )}
                sx={{
                  "& .MuiStepLabel-label": {
                    ml: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    color: activeStep >= index ? "#107869" : "#666",
                    fontWeight: activeStep === index ? 600 : 400,
                    transition: "all 0.3s ease",
                    fontSize: activeStep === index ? "1.1rem" : "1rem",
                  },
                }}
              >
                <Box display="flex" alignItems="center" gap={2}>
                  {step.label}
                  {stepValidation[index as 0 | 1 | 2]?.validated && (
                    <Box
                      component={RiCheckDoubleLine}
                      sx={{
                        fontSize: 22,
                        color: stepValidation[index as 0 | 1 | 2]?.hasError
                          ? "#FF4842"
                          : "#107869",
                        animation: "fadeIn 0.3s ease",
                        "@keyframes fadeIn": {
                          "0%": { opacity: 0, transform: "scale(0.8)" },
                          "100%": { opacity: 1, transform: "scale(1)" },
                        },
                      }}
                    />
                  )}
                </Box>
              </StepLabel>

              {index < steps.length - 1 && <CustomStepConnector />}

              <StepContent
                TransitionProps={{ unmountOnExit: false }}
                sx={{
                  ml: 3,
                  pl: 3,
                  borderLeft: "none",
                  "& .MuiStepContent-root": {
                    borderLeft: "none",
                  },
                }}
              >
                <Box
                  sx={{
                    py: 3,
                    position: "relative",
                  }}
                >
                  {step.description}
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    gap: 2,
                    mt: 2,
                  }}
                >
                  <MuiButton
                    variant="contained"
                    onClick={handleNext}
                    disabled={isSubmitting()}
                    sx={{
                      background: "#107869 !important",
                      px: 4,
                      py: 1,
                      borderRadius: "8px",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        background: "#0a5b4f !important",
                        transform: "translateY(-2px)",
                        boxShadow: "0 6px 12px rgba(16, 120, 105, 0.2)",
                      },
                    }}
                  >
                    {index === steps.length - 1 ? "Finish" : "Continue"}
                  </MuiButton>

                  {index !== 0 && (
                    <MuiButton
                      variant="outlined"
                      onClick={handleBack}
                      sx={{
                        borderColor: "#107869 !important",
                        color: "#107869 !important",
                        px: 4,
                        py: 1,
                        borderRadius: "8px",
                        background: "transparent !important",
                        transition: "all 0.3s ease",
                        "&:hover": {
                          borderColor: "#0a5b4f !important",
                          background: "rgba(16, 120, 105, 0.05) !important",
                        },
                      }}
                    >
                      Back
                    </MuiButton>
                  )}
                </Box>
              </StepContent>
            </Step>
          ))}
        </Stepper>

        {activeStep === steps.length && (
          <Box
            sx={{
              p: 6,
              textAlign: "center",
              color: "#107869",
              animation: "slideUp 0.5s ease",
              "@keyframes slideUp": {
                "0%": { opacity: 0, transform: "translateY(20px)" },
                "100%": { opacity: 1, transform: "translateY(0)" },
              },
            }}
          >
            <Typography variant="h5" fontWeight={600}>
              {assetId
                ? "Asset updated successfully! 🎉"
                : "Asset added successfully! 🎉"}
            </Typography>
          </Box>
        )}
      </Box>
      {loading && <GifLoader />}
      <ErrorModal
        open={errorModalOpen}
        onClose={() => setErrorModalOpen(false)}
        errors={errorMessages}
      />
    </Box>
  );
}
