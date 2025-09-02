import React, { useEffect, useState } from "react";
import NavTabs from "../../../atoms/ModernComponents/NavTabs";
import { Box, FormGroup, Tab, Tabs } from "@mui/material";
import { TabContext, TabPanel } from "@mui/lab";
import { tabStyles } from "../PartyMaster/PartyTabs";
import GeneralItemInfo from "./GeneralItemInfo";
import PurchaseItem from "./PurchaseItem";
import ItemInventory from "./ItemInventory";
import ItemQuality from "./ItemQuality";
import ItemVariants from "./ItemVariants";
import { useDataFetchHook } from "../../../../hooks/useDataFetchHook";
import InventoryConfig from "../../../../utils/inventory.api.json";
import Config from "../../../../utils/config.api.json";
import PartyConfig from "../../../../utils/party.api.json";
import { MuiButton, MuiSwitch } from "bsoft-base-elements";
import dayjs from "dayjs";
import { Apirequest } from "../../../../utils/lib";
import toast from "react-hot-toast";
import BsoftLoader from "../../../atoms/ModernComponents/BsoftLoader";
import Swal from "sweetalert2";
import ErrorModal from "../../../molecules/Master/Role/ErrorModal";
import { useRouter } from "next/navigation";

interface ItemState {
  formData: Record<string, any>;
}

interface UOMConversionForm {
  baseUom: string;
  convUom: any | null;
  convRate: string;
}

interface UOMConversionRow {
  baseUom: string;
  convUom: string;
  convRate: string;
  id?: string;
}

type SupplierRow = {
  id?: string;
  supplier: string;
  supplierPartNo: string;
  unit: string;
};

type ForeignTradeData = {
  originCountry: string;
  tariffNumber: string;
};

interface SupplierForm {
  supplier: any | null;
  supplierPartNo: string;
  unit: any | null;
}

type InventoryAttributeRow = {
  id?: string;
  unit: string;
  type: string;
};

interface InventoryAttributeForm {
  unit: any | null;
  type: any | null;
}

interface VariantRow {
  id?: string;
  attributes: string;
  value: string;
}

interface VariantForm {
  attributes: any | null;
  value: string;
}

function ItemMasterTabs({ itemId }: { itemId?: string }) {
  const router = useRouter();
  const [value, setValue] = React.useState("1");
  const [loading, setLoading] = React.useState(true);
  const [partyState, setPartyState] = React.useState<ItemState>({
    formData: {
      itemImage: null,
      validFrom: dayjs(new Date()),
    },
  });
  const [uomConversionForm, setUomConversionForm] = useState<UOMConversionForm>(
    {
      baseUom: "",
      convUom: null,
      convRate: "",
    }
  );
  const [uomConversionRows, setUomConversionRows] = useState<
    UOMConversionRow[]
  >([]);
  const [supplierForm, setSupplierForm] = useState<SupplierForm>({
    supplier: null,
    supplierPartNo: "",
    unit: null,
  });
  const [supplierRows, setSupplierRows] = useState<SupplierRow[]>([]);
  const [foreignTradeData, setForeignTradeData] = useState<ForeignTradeData>({
    originCountry: "",
    tariffNumber: "",
  });
  const [attrForm, setAttrForm] = useState<InventoryAttributeForm>({
    unit: null,
    type: null,
  });
  const [attrRows, setAttrRows] = useState<InventoryAttributeRow[]>([]);
  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    setValue(newValue);
  };

  const [variantForm, setVariantForm] = useState<VariantForm>({
    attributes: null,
    value: "",
  });
  const [variants, setVariants] = useState<VariantRow[]>([]);
  const [errorModalOpen, setErrorModalOpen] = React.useState(false);
  const [errorMessages, setErrorMessages] = React.useState<string[]>([]);
  const [errors, setErrors] = useState<string[]>([]);

  const GetAttributes = async (value: string) => {
    try {
      const { endpoint, method } = InventoryConfig.InventoryMisc.MiscMasterDesc;
      const response = await Apirequest(
        endpoint.replace("{desc}", value),
        method,
        null,
        "inventory"
      ).then((res) => res.data);
      setPartyState((prev) => ({
        ...prev,
        formData: { ...prev.formData, attributes: response?.data },
      }));
    } catch (err) {
      console.log(err);
    }
  };

  const UploadImage = async (value: File | Blob) => {
    try {
      const formData = new FormData();
      formData.append("file", value);
      const { endpoint, method } = InventoryConfig.ItemImageUpload.UploadImage;
      const response = await Apirequest(
        endpoint,
        method,
        formData,
        "inventory"
      ).then((r) => r.data);

      const { statusCode, message, data } = response;
      if (statusCode === 200 || statusCode === 201) {
        toast.success(message);
        setPartyState((prev) => ({
          ...prev,
          formData: {
            ...prev.formData,
            itemImage: data?.assetImage,
            itemImageBase: data?.assetImageBase64,
          },
        }));
      } else {
        toast.error(message);
        setPartyState((prev) => ({
          ...prev,
          formData: { ...prev.formData, itemImage: null, itemImageBase: null },
        }));
      }
    } catch (err) {
      console.error("Upload failed:", err);
    }
  };

  const DeleteImage = async () => {
    try {
      const body = { imagePath: partyState?.formData?.itemImage };
      const { endpoint, method } = InventoryConfig.ItemImageUpload.DeleteImage;
      const response = await Apirequest(
        endpoint,
        method,
        body,
        "inventory"
      ).then((r) => r.data);

      const { statusCode, message } = response;
      if (statusCode === 200 || statusCode === 201) {
        toast.success(message);
        setPartyState((prev) => ({
          ...prev,
          formData: { ...prev.formData, itemImage: null, itemImageBase: null },
        }));
      }
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const handleInputChange = (name: string, value: any) => {
    setErrors([]);
    if (name === "itemImage") {
      UploadImage(value);
    } else if (name === "attributeGroup") {
      if (!value) {
        setPartyState((prev) => ({
          ...prev,
          formData: { ...prev.formData, attributes: [] },
        }));
      }
      GetAttributes(value?.description);
    }

    setPartyState((prev) => ({
      ...prev,
      formData: { ...prev.formData, [name]: value },
    }));
  };

  // useEffect(() => {
  //   console.log(uomConversionRows);
  // }, [uomConversionRows]);

  const types = [
    "ItemClassification",
    "MaterialStatus",
    "CertificateType",
    "ManufactureType",
    "MaterialRequestType",
    "ValuationMethod",
    "RequestType",
    "VariantBasedOn",
    "AttributeName",
    "AttributeGroup",
  ];

  const dataFetches = types.reduce((acc, type) => {
    acc[`${type}Data`] = useDataFetchHook(
      InventoryConfig.InventoryMisc.endpoint.replace("{type}", type),
      InventoryConfig.InventoryMisc.method,
      "inventory"
    ).data;
    return acc;
  }, {} as Record<string, any>);

  const {
    ItemClassificationData,
    MaterialStatusData,
    CertificateTypeData,
    ManufactureTypeData,
    MaterialRequestTypeData,
    ValuationMethodData,
    RequestTypeData,
    VariantBasedOnData,
  } = dataFetches;

  const mandatoryFields = [
    "itemName",
    "hsnCode",
    "itemGroup",
    "itemCategory",
    "defaultUom",
    "itemClassification",
  ];

  const checkValidation = () => {
    let temp: string[] = [];
    Object.entries(partyState.formData).map(([key, value]) => {
      if (mandatoryFields.includes(key)) {
        if (value === "" || !value) {
          temp.push(key);
          setErrors(temp);
        }
      }
    });
    return temp;
  };

  const GetItemDetails = async () => {
    const { endpoint, method } = InventoryConfig.ItemMaster.GetItem;
    try {
      const response = await Apirequest(
        endpoint.replace("{id}", itemId ? itemId : ""),
        method,
        null,
        "inventory"
      ).then((r) => r.data);

      if (response?.statusCode === 200 && response?.data) {
        const data = response.data;
        setLoading(false);
        const findOption = (list: any[], id: number, key: string = "id") =>
          Array.isArray(list)
            ? list.find((opt) => opt[key] === id) || null
            : null;

        setPartyState((prev) => ({
          ...prev,
          formData: {
            ...prev.formData,
            id: data.id,
            itemCode: data.itemCode,
            itemName: data.itemName,
            description: data.description,
            validFrom: dayjs(data.validFrom),
            isStockItem: data.isStockItem,
            maintainStock: data.maintainStock,
            hasVariants: data.hasVariants,
            isActive: data.isActive === 1,
            itemImage: data.itemImage,
            hsnCode: findOption(HsnCodeData, data.hsnId, "id"),
            itemGroup: findOption(ItemGroupData, data.itemGroupId, "id"),
            itemCategory: findOption(
              ItemCategoryData,
              data.itemCategoryId,
              "id"
            ),
            defaultUom: findOption(UomData, data.stockUomId, "id"),
            itemClassification: findOption(
              ItemClassificationData,
              data.itemClassificationId,
              "id"
            ),
            materialStatus: findOption(
              MaterialStatusData,
              data.xPlantMaterialStatusId,
              "id"
            ),
            unit: findOption(UnitData, data.unitId, "unitId"),
          },
        }));

        if (data.purchase) {
          setPartyState((prev) => ({
            ...prev,
            formData: {
              ...prev.formData,
              purchaseUom: findOption(
                UomData,
                data.purchase.purchaseUomId,
                "id"
              ),
              leadTime: data.purchase.leadTimeDays,
              safetyStock: data.purchase.safetyStock,
              grProcessingTime: data.purchase.grProcessingTimeDays,
              automaticPO: data.purchase.automaticPo,
              foreignTradeDetails: {
                originCountry: findOption(
                  CountryData,
                  data.purchase.originCountryId,
                  "id"
                ),
                tariffNumber: data.purchase.tariffNumber,
              },
            },
          }));
        }

        if (data.inventory) {
          setPartyState((prev) => ({
            ...prev,
            formData: {
              ...prev.formData,
              weight: data.inventory.weight,
              weightUom: findOption(UomData, data.inventory.weightUomId, "id"),
              defaultMaterialRequestType: findOption(
                MaterialRequestTypeData,
                data.inventory.defaultMaterialRequestTypeId,
                "id"
              ),
              valuationMethod: findOption(
                ValuationMethodData,
                data.inventory.valuationMethodId,
                "id"
              ),
              requestType: findOption(
                RequestTypeData,
                data.inventory.requestTypeId,
                "id"
              ),
              shelfLife: data.inventory.shelfLife,
              upperTolerance: data.inventory.upperTolerance,
              lowerTolerance: data.inventory.lowerTolerance,
              batchNumberSeries: data.inventory.batchNumberSeries,
              serialNumberSeries: data.inventory.serialNumberSeries,
              reorderLevel: data.inventory.reorderLevel,
              reorderQty: data.inventory.reorderQty,
              allowNegativeStock: data.inventory.allowNegativeStock,
              batchManagement: data.inventory.batchManagement,
              applyBatchNumber: data.inventory.applyBatchNumber,
            },
          }));
        }

        if (data.quality) {
          setPartyState((prev) => ({
            ...prev,
            formData: {
              ...prev.formData,
              inspectionTemplate: findOption(
                templateData,
                data.quality.inspectionTemplateId,
                "id"
              ),
              certificateType: findOption(
                CertificateTypeData,
                data.quality.certificateTypeId,
                "id"
              ),
              inspLotProcessingTime: data.quality.inspLotProcessingTime,
              inspectionRequired: data.quality.inspectionRequired,
              qualityInspectionFree: data.quality.qualityInspectionFree,
              isCertificateRequired:
                data.quality.isCertificateRequiredFromSupplier,
            },
          }));
        }

        if (Array.isArray(data.suppliers)) {
          setSupplierRows(
            data.suppliers.map((s: any, index: number) => ({
              id: index + 1,
              supplierId: s.supplierId,
              supplier: findOption(SupplierData, s.supplierId, "id"),
              supplierPartNo: s.supplierPartNo,
              unit: findOption(UnitData, s.unitId, "unitId"),
              leadTime: s.leadTime,
              moq: s.moq,
              moqUomId: s.moqUomId,
              packageValue: s.packageValue,
              packageUomId: s.packageUomId,
              defaultSupplier: s.defaultSupplier,
            }))
          );
        }

        // ------------ Manufacture ------------
        if (Array.isArray(data.manufacture)) {
          const rows = data.manufacture.map((m: any, idx: number) => {
            const unitOption = findOption(UnitData, m.unitId, "unitId");
            const typeOption = findOption(
              ManufactureTypeData,
              m.manufacturingTypeId,
              "id"
            );

            return {
              id: `manufacture-${idx}`,
              unit: unitOption ? unitOption.unitName : m.unitName || "",
              type: typeOption ? typeOption.code : m.manufacturingType || "",
            };
          });

          setAttrRows(rows);
        }

        // ------------ UOM Conversions ------------
        if (Array.isArray(data.uoms)) {
          const uomRows = data.uoms.map((u: any, idx: number) => {
            const convOption = findOption(UomData, u.conversionUOMId, "id");
            const baseOption = findOption(UomData, data.stockUomId, "id");
            return {
              id: `uom-${idx}`,
              baseUom: baseOption ? baseOption.uomName : data.stockUOM || "",
              convUom: convOption || null,
              convUomName: convOption
                ? convOption.uomName || convOption.name
                : "",
              convRate: u.conversionRate ? String(u.conversionRate) : "0",
            };
          });
          setUomConversionRows(uomRows);
        }

        // ------------ Variants ------------
        if (Array.isArray(data.variantValues)) {
          setVariants(
            data.variantValues.map((v: any, idx: number) => ({
              id: `variant-${idx}`,
              attributes: v.attributeName,
              value: v.optionValue,
            }))
          );
          setPartyState((prev) => ({
            ...prev,
            formData: {
              ...prev.formData,
              variantBasedOn: findOption(
                VariantMisc?.at(0),
                data.variantValues[0]?.variantBasedOn,
                "id"
              ),
              attributeGroup: findOption(
                VariantMisc?.at(1),
                data.variantValues[0]?.attributeGroupId,
                "id"
              ),
            },
          }));
          if (data?.variantValues[0]?.attributeGroupId) {
            GetAttributes(data?.variantValues[0]?.attributeGroup);
          }
        }
      } else setLoading(false);
    } catch (err) {
      setLoading(false);
      console.log(err);
    }
  };

  useEffect(() => {
    if (!partyState?.formData.hasVariants && value === "6") {
      setValue("1");
    }
  }, [partyState?.formData.hasVariants, value]);

  useEffect(() => {
    if (partyState?.formData.uomConversions) {
      console.log(
        "UOM Conversions updated:",
        partyState.formData.uomConversions
      );
    }
  }, [partyState?.formData.uomConversions]);

  // ---------------- Dropdown API Calls ----------------

  const { data: SupplierData } = useDataFetchHook(
    PartyConfig.PartyMaster.endpoint.replace("{ids}", "1"),
    PartyConfig.PartyMaster.method,
    "party"
  );

  const { data: HsnCodeData } = useDataFetchHook(
    InventoryConfig.HsnCode.GetHsnCodeByName.endpoint,
    InventoryConfig.HsnCode.GetHsnCodeByName.method,
    "inventory"
  );

  const { data: ItemGroupData } = useDataFetchHook(
    InventoryConfig.ItemGroup.GetByGroup.endpoint,
    InventoryConfig.ItemGroup.GetByGroup.method,
    "inventory"
  );

  const { data: ItemCategoryData } = useDataFetchHook(
    InventoryConfig.ItemCategory.GetByCategory.endpoint,
    InventoryConfig.ItemCategory.GetByCategory.method,
    "inventory"
  );

  const { data: UomData } = useDataFetchHook(
    InventoryConfig.Uom.GetUomName.endpoint,
    InventoryConfig.Uom.GetUomName.method,
    "inventory"
  );

  const { data: templateData } = useDataFetchHook(
    InventoryConfig.Template.GetTemplate.endpoint,
    InventoryConfig.Template.GetTemplate.method,
    "inventory"
  );

  const { data: AttributeGroupData } = useDataFetchHook(
    InventoryConfig.InventoryMisc.MiscTypeMaster.endpoint.replace(
      "{name}",
      "AttributeGroup"
    ),
    InventoryConfig.InventoryMisc.MiscTypeMaster.method,
    "inventory"
  );

  const { data: UnitData } = useDataFetchHook(
    Config.SwitchProfile.getUnit.endpoint,
    Config.SwitchProfile.getUnit.method
  );

  const { data: CountryData } = useDataFetchHook(
    Config.Countries.getCountry.endpoint,
    Config.Countries.getCountry.method
  );

  // -------------------------------

  const GeneralInfoMisc = [
    ItemClassificationData,
    MaterialStatusData,
    HsnCodeData,
    ItemGroupData,
    ItemCategoryData,
    UomData,
    UnitData,
  ];

  const InventoryMisc = [
    MaterialRequestTypeData,
    ValuationMethodData,
    RequestTypeData,
    ManufactureTypeData,
    UnitData,
    UomData,
  ];

  const VariantMisc = [
    VariantBasedOnData,
    AttributeGroupData,
    partyState.formData?.attributes,
  ];
  const PurchaseMisc = [UomData, UnitData, CountryData, SupplierData];

  const AddItem = async (body: any) => {
    try {
      const { endpoint, method } = itemId
        ? InventoryConfig.ItemMaster.UpdateItem
        : InventoryConfig.ItemMaster.AddItem;
      const response = await Apirequest(
        endpoint,
        method,
        body,
        "inventory"
      ).then((res) => res.data);
      if (response.statusCode === 200 || response.statusCode === 201) {
        Swal.fire({
          title: response?.message || "Item Added Successfully",
          icon: "success",
          confirmButtonText: "okay",
          customClass: {
            title: "custom-title",
          },
          allowOutsideClick: false,
          allowEscapeKey: false,
          allowEnterKey: true,
        }).then((res) => {
          if (res.isConfirmed) {
            router.push("/purchase/item-list");
          }
        });
      } else {
        toast.error(response.message);
        if (Array.isArray(response.errors) && response.errors.length > 0) {
          setErrorModalOpen(true);
          setErrorMessages(response.errors);
        }
      }
      console.log(response);
    } catch (err) {
      console.log(err);
    }
  };

  // useEffect(() => {
  //   console.log(supplierRows)
  // }, [supplierRows])

  const handleSubmit = () => {
    const body: any = {
      payload: {
        unitId: partyState.formData?.unit?.unitId,
        itemCode: itemId ? partyState.formData?.itemCode : "",
        itemName: partyState.formData?.itemName,
        hsnId: partyState.formData?.hsnCode?.id,
        itemGroupId: partyState.formData?.itemGroup?.id,
        itemCategoryId: partyState.formData?.itemCategory?.id,
        stockUomId: partyState.formData?.defaultUom?.id,
        itemClassificationId: partyState.formData?.itemClassification?.id,
        description: partyState.formData?.description,
        validFrom: dayjs(partyState.formData?.validFrom).format("YYYY-MM-DD"),
        xPlantMaterialStatusId: partyState.formData?.materialStatus?.id,
        isStockItem: partyState.formData?.isStockItem,
        maintainStock: partyState.formData?.maintainStock,
        hasVariants: partyState.formData?.hasVariants,
        parentItemId: 0, // ------------
        itemImage: partyState.formData?.itemImage,
        isActive: partyState.formData?.isActive ? 1 : 0,
        purchase: {
          purchaseUomId: partyState.formData?.purchaseUom?.id,
          leadTimeDays: partyState.formData?.leadTime,
          safetyStock: partyState.formData?.safetyStock,
          grProcessingTimeDays: partyState.formData?.grProcessingTime,
          automaticPo: partyState.formData?.automaticPO,
          originCountryId:
            partyState.formData?.foreignTradeDetails?.originCountry?.id,
          tariffNumber: partyState.formData?.foreignTradeDetails?.tariffNumber,
        },
        inventory: {
          weight: partyState.formData?.weight,
          weightUomId: partyState.formData?.weightUom?.id,
          defaultMaterialRequestTypeId:
            partyState.formData?.defaultMaterialRequestType?.id,
          valuationMethodId: partyState.formData?.valuationMethod?.id,
          shelfLife: partyState.formData?.shelfLife,
          upperTolerance: partyState.formData?.upperTolerance,
          lowerTolerance: partyState.formData?.lowerTolerance,
          batchNumberSeries: partyState.formData?.batchNumberSeries,
          serialNumberSeries: partyState.formData?.serialNumberSeries,
          reorderLevel: partyState.formData?.reorderLevel,
          reorderQty: partyState.formData?.reorderQty,
          requestTypeId: partyState.formData?.requestType?.id,
          allowNegativeStock: partyState.formData?.allowNegativeStock,
          batchManagement: partyState.formData?.batchManagement,
          applyBatchNumber: partyState.formData?.applyBatchNumber,
        },
        quality: {
          inspectionTemplateId: partyState.formData?.inspectionTemplate?.id,
          certificateTypeId: partyState.formData?.certificateType?.id,
          inspLotProcessingTime: partyState.formData?.inspLotProcessingTime,
          inspectionRequired: partyState.formData?.inspectionRequired,
          qualityInspectionFree: partyState.formData?.qualityInspectionFree,
          isCertificateRequiredFromSupplier:
            partyState.formData?.isCertificateRequired,
        },
        suppliers:
          Array.isArray(supplierRows) &&
          supplierRows.map((list: any) => {
            return {
              supplierId: list?.supplierId,
              unitId: list.unitId,
              supplierPartNo: list.supplierPartNo,
              leadTime: list?.leadTime,
              moq: list?.moq,
              moqUomId: list?.moqUom?.id,
              packageValue: list?.packageValue,
              packageUomId: list?.packageUom?.id,
              defaultSupplier: list?.isDefault,
            };
          }),
        manufacture:
          Array.isArray(attrRows) &&
          attrRows.map((list) => {
            return {
              unitId: list.unit,
              manufacturingTypeId: list.type,
            };
          }),
        uoms:
          Array.isArray(uomConversionRows) &&
          uomConversionRows.map((list: any) => {
            return {
              conversionUOMId: list?.convUomId,
              conversionRate: list.convRate,
            };
          }),
        variantValues:
          Array.isArray(variants) &&
          variants.map((list) => {
            return {
              attributeId: list.id,
              optionValue: list.value,
              variantBasedOn: partyState.formData?.variantBasedOn?.id,
              attributeGroupId: partyState.formData?.attributeGroup?.id,
            };
          }),
      },
    };
    if (itemId) {
      body.payload["id"] = itemId;
    }
    const errorLength = checkValidation();
    if (errorLength.length === 0) {
      AddItem(body);
    }
  };

  useEffect(() => {
    console.log(attrRows);
  }, [attrRows]);

  useEffect(() => {
    if (
      itemId !== "" &&
      HsnCodeData &&
      ItemGroupData &&
      ItemCategoryData &&
      UomData &&
      ItemClassificationData &&
      MaterialStatusData &&
      UnitData &&
      SupplierData &&
      CountryData &&
      CertificateTypeData &&
      ManufactureTypeData &&
      MaterialRequestTypeData &&
      ValuationMethodData &&
      RequestTypeData &&
      templateData
    ) {
      GetItemDetails();
    } else if (itemId === "") {
      setLoading(false);
    }
  }, [
    itemId,
    HsnCodeData,
    ItemGroupData,
    ItemCategoryData,
    UomData,
    ItemClassificationData,
    MaterialStatusData,
    UnitData,
    SupplierData,
    CountryData,
    CertificateTypeData,
    ManufactureTypeData,
    MaterialRequestTypeData,
    ValuationMethodData,
    RequestTypeData,
    templateData,
  ]);

  return (
    <>
      <Box
        sx={{
          opacity: loading ? 0.5 : 1,
          pointerEvents: loading ? "none" : "",
        }}
      >
        <NavTabs>
          <TabContext value={value}>
            <Tabs
              value={value}
              onChange={handleChange}
              textColor="primary"
              indicatorColor="primary"
              aria-label="primary tabs example"
            >
              <Tab value="1" label="General Details" />
              <Tab value="2" label="Purchase" />
              <Tab value="4" label="Inventory" />
              <Tab value="5" label="Quality" />
              {partyState?.formData.hasVariants && (
                <Tab value="6" label="Variants/Attributes" />
              )}
            </Tabs>
            <Box height={580} overflow={"auto"}>
              <TabPanel value="1">
                <Box sx={tabStyles}>
                  <GeneralItemInfo
                    formData={partyState.formData}
                    handleInputChange={handleInputChange}
                    GeneralInfoMisc={GeneralInfoMisc}
                    uomConversionForm={uomConversionForm}
                    setUomConversionForm={setUomConversionForm}
                    uomConversionRows={uomConversionRows}
                    setUomConversionRows={setUomConversionRows}
                    DeleteImage={DeleteImage}
                    errors={errors}
                    itemId={itemId ? itemId : ""}
                  />
                </Box>
              </TabPanel>
              <TabPanel value="2">
                <Box sx={tabStyles}>
                  <PurchaseItem
                    formData={partyState.formData}
                    handleInputChange={handleInputChange}
                    PurchaseMisc={PurchaseMisc}
                    supplierForm={supplierForm}
                    setSupplierForm={setSupplierForm}
                    supplierRows={supplierRows}
                    setSupplierRows={setSupplierRows}
                    foreignTradeData={foreignTradeData}
                    setForeignTradeData={setForeignTradeData}
                  />
                </Box>
              </TabPanel>
              <TabPanel value="4">
                <Box sx={tabStyles}>
                  <ItemInventory
                    formData={partyState.formData}
                    handleInputChange={handleInputChange}
                    InventoryMisc={InventoryMisc}
                    attrForm={attrForm}
                    setAttrForm={setAttrForm}
                    attrRows={attrRows}
                    setAttrRows={setAttrRows}
                  />
                </Box>
              </TabPanel>
              <TabPanel value="5">
                <Box sx={tabStyles}>
                  <ItemQuality
                    formData={partyState.formData}
                    handleInputChange={handleInputChange}
                    CertificateTypeData={CertificateTypeData}
                    templateData={templateData}
                  />
                </Box>
              </TabPanel>
              {partyState?.formData.hasVariants && (
                <TabPanel value="6">
                  <Box sx={tabStyles}>
                    <ItemVariants
                      VariantMisc={VariantMisc}
                      formData={partyState.formData}
                      handleInputChange={handleInputChange}
                      variantForm={variantForm}
                      setVariantForm={setVariantForm}
                      variants={variants}
                      setVariants={setVariants}
                    />
                  </Box>
                </TabPanel>
              )}
            </Box>
          </TabContext>
          <Box
            display={"flex"}
            gap={2}
            justifyContent={"space-between"}
            alignItems={"center"}
            sx={tabStyles}
            mt={"0px !important"}
          >
            <FormGroup
              sx={{
                pl: 2,
              }}
            >
              <MuiSwitch
                // checked={true}
                onChange={(e) =>
                  handleInputChange("isActive", e.target.checked)
                }
                label="Status"
              />
            </FormGroup>
            <Box>
              <MuiButton
                variant="outlined"
                sx={{ borderRadius: "8px !important", minWidth: 120 }}
              >
                Cancel
              </MuiButton>
              <MuiButton
                variant="contained"
                sx={{ borderRadius: "8px !important", minWidth: 120 }}
                onClick={handleSubmit}
              >
                Submit
              </MuiButton>
            </Box>
          </Box>
        </NavTabs>
      </Box>
      {loading && (
        <Box
          position={"absolute"}
          top={"50%"}
          left={"50%"}
          sx={{ transform: "translate(-50%, -50%)", zIndex: 10 }}
        >
          <BsoftLoader />
        </Box>
      )}
      <ErrorModal
        open={errorModalOpen}
        onClose={() => setErrorModalOpen(false)}
        errors={errorMessages}
      />
    </>
  );
}

export default ItemMasterTabs;
