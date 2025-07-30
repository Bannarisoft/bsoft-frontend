import {
  Autocomplete,
  Box,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  FormGroup,
  Grid2,
} from "@mui/material";
import { MuiInputField, MuiText } from "bsoft-base-elements";
import React from "react";
import { useRecoilValue } from "recoil";
import { UserData } from "../../../../utils/atoms";
import {
  AdditionalCost,
  PurchaseDetails,
  PurchaseState,
} from "../../../../types";
import dayjs from "dayjs";
import { RiDeleteBin6Line } from "react-icons/ri";
import { MdOutlineLibraryAdd } from "react-icons/md";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { PoDetailsData, usePurchaseDetails } from "./usePurchaseDetails";

const manualPoFields = [
  { label: "Item Code", name: "itemCode" },
  { label: "Item Name", name: "itemName" },
  { label: "Accepted Quantity", name: "acceptedQty" },
  { label: "UOM", name: "uom", isRequired: true },
  { label: "PO No", name: "poNo" },
  { label: "PO Date", name: "poDate", type: "date" },
  { label: "PO S.no", name: "poSno" },
  { label: "Purchase Value", name: "purchaseValue" },
  { label: "GRN No", name: "grnNo" },
  { label: "GRN Date", name: "grnDate", type: "date" },
  { label: "GRN S.no", name: "grnSno" },
  { label: "GRN Value", name: "grnValue" },
  { label: "Vendor Code", name: "vendorCode" },
  { label: "Vendor Name", name: "vendorName" },
  { label: "Vendor Bill No", name: "billNo" },
  { label: "Vendor Bill Date", name: "billDate", type: "date" },
  { label: "Bin Location", name: "binLocation", isRequired: true },
  { label: "Purchase Journal Year", name: "pjYear" },
  { label: "Purchase Journal Doc Sr", name: "pjDocSr", isRequired: true },
  { label: "Purchase Journal Doc No", name: "pjDocNo" },
  { label: "QC Completed", name: "qcCompleted", field: "checkbox" },
];

interface PurchaseAssetPropTypes {
  purchaseState: PurchaseState;
  handlePurchaseAutoComplete: (newValue: any, name: string) => void;
  purchaseDetails?: PurchaseDetails;
  additionalCosts: AdditionalCost[];
  handleCostChange: (
    id: number,
    field: keyof AdditionalCost,
    value: any
  ) => void;
  handleAddCost: () => void;
  handleDeleteCost: (id: number) => void;
  errors: string[];
  handleChange: (e: React.ChangeEvent<HTMLInputElement>, field: string) => void;
  itemLoading: boolean;
  loadingStates?: any;
  poDetailsInput: PoDetailsData;
  handlePoInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  poDataErrors: Record<string, string>;
  setPoDataErrors: any;
}

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

function PurchaseInformation(props: PurchaseAssetPropTypes) {
  const {
    purchaseState,
    handlePurchaseAutoComplete,
    purchaseDetails,
    additionalCosts,
    handleAddCost,
    handleCostChange,
    handleDeleteCost,
    errors,
    handleChange,
    itemLoading,
    setPoDataErrors,
    poDetailsInput,
    handlePoInputChange,
    poDataErrors,
  } = props;

  const { poDataDispatch } = usePurchaseDetails();

  const userValue = useRecoilValue(UserData);

  const getFilteredCostTypes = (currentId: number) => {
    const selectedTypes = additionalCosts
      .filter((cost) => cost.id !== currentId && cost.costType !== null)
      .map((cost) => cost.costType.id);

    return (purchaseState.additionalCostData || []).filter(
      (option) => !selectedTypes.includes(option.id)
    );
  };

  const handleCheck = (
    event: React.SyntheticEvent<Element, Event>,
    checked: boolean
  ) => {
    if (checked) {
      poDataDispatch({ type: "qcCompleted", payload: "Y" });
    } else {
      poDataDispatch({ type: "qcCompleted", payload: "N" });
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    return dateString
      ? dayjs(dateString, [
          "YYYY-MM-DDTHH:mm:ssZ",
          "YYYY-MM-DDTHH:mm:ss",
          "YYYY-MM-DD",
        ])
          .utc()
          .format("YYYY-MM-DD")
      : null;
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
    if (!purchaseDetails) return [];

    const excludeFields = [
      "id",
      "pjDocId",
      "pjDocSr",
      "pjDocNo",
      "pjYear",
      "oldUnitId",
    ];
    const displayOrder = [
      "itemCode",
      "itemName",
      "acceptedQty",
      "uom",
      "poNo",
      "poDate",
      "poSno",
      "purchaseValue",
      "grnNo",
      "grnDate",
      "grnSno",
      "grnValue",
      "vendorCode",
      "vendorName",
      "billNo",
      "billDate",
      "budgetType",
      "binLocation",
      "qcCompleted",
    ];

    return displayOrder
      .filter((key) => key in purchaseDetails && !excludeFields.includes(key))
      .map((key, index) => {
        let value = purchaseDetails[key as keyof PurchaseDetails];
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
  }, [purchaseDetails]);

  return (
    <Grid2 container spacing={2}>
      <Grid2
        size={{ xs: 12, sm: 12, md: 7 }}
        borderRight={"1.5px solid #d8d8d8a1"}
        pr={2}
      >
        <Grid2 container spacing={2}>
          <Grid2 size={{ xs: 12, sm: 6, md: 6 }}>
            <MuiText variant="h6" my={1} pt={1} className="admin-label-title">
              Source Name of Entry <span className="mandatory-sign">*</span>
            </MuiText>
            <Autocomplete
              disablePortal
              options={purchaseState.sourceData || []}
              fullWidth
              value={purchaseState.selectedSource}
              onChange={(event, newValue) => {
                handlePurchaseAutoComplete(newValue, "source");
              }}
              getOptionLabel={(option: any) => option.sourceName || ""}
              isOptionEqualToValue={(option: any, value: any) =>
                option.id === value.id
              }
              renderInput={(params) => (
                <MuiInputField
                  {...params}
                  size="small"
                  error={errors.includes("selectedSource")}
                  helperText={
                    errors.includes("selectedSource") &&
                    "please select source of entry"
                  }
                />
              )}
            />
          </Grid2>
          <Grid2 size={{ xs: 12, sm: 6, md: 6 }}>
            <MuiText variant="h6" my={1} pt={1} className="admin-label-title">
              Unit Name
            </MuiText>
            <MuiInputField value={userValue.unitName} size="small" fullWidth />
          </Grid2>
        </Grid2>
        <Grid2 container spacing={2} mt={1}>
          <Grid2
            size={{ xs: 12, sm: 6, md: 6 }}
            display={purchaseState.manual ? "none" : "block"}
          >
            <MuiText variant="h6" pt={1} className="admin-label-title">
              GRN No. <span className="mandatory-sign">*</span>
            </MuiText>
            <Autocomplete
              disablePortal
              options={purchaseState.grnData || []}
              fullWidth
              value={purchaseState.selectedGrn}
              onChange={(event, newValue) => {
                handlePurchaseAutoComplete(newValue, "grn");
              }}
              getOptionLabel={(option: any) => option.grnNo || ""}
              isOptionEqualToValue={(option: any, value: any) =>
                option.id === value.id
              }
              renderInput={(params) => (
                <MuiInputField
                  {...params}
                  size="small"
                  error={errors.includes("selectedGrn")}
                  helperText={
                    errors.includes("selectedGrn") && "please select GRN number"
                  }
                />
              )}
            />
          </Grid2>
          <Grid2
            size={{ xs: 12, sm: 6, md: 6 }}
            display={purchaseState.manual ? "none" : "block"}
          >
            <MuiText variant="h6" pt={1} className="admin-label-title">
              Item Name <span className="mandatory-sign">*</span>
            </MuiText>
            <Autocomplete
              disablePortal
              options={purchaseState.itemData || []}
              fullWidth
              value={purchaseState.selectedItem}
              onChange={(event, newValue) => {
                handlePurchaseAutoComplete(newValue, "items");
              }}
              getOptionLabel={(option: any) => option.itemName || ""}
              isOptionEqualToValue={(option: any, value: any) =>
                option.id === value.id
              }
              renderInput={(params) => (
                <MuiInputField
                  {...params}
                  size="small"
                  error={errors.includes("selectedItem")}
                  helperText={
                    errors.includes("selectedItem") && "please select Item"
                  }
                />
              )}
            />
          </Grid2>
          <Grid2 size={{ xs: 12, sm: 6, md: 6 }}>
            <MuiText variant="h6" className="admin-label-title" my={1}>
              Date of Capitalisation
            </MuiText>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                slotProps={{
                  textField: {
                    fullWidth: true,
                    size: "small",
                  },
                }}
                onChange={(value) =>
                  handleChange(
                    {
                      target: { value: value?.toString() || "" },
                    } as unknown as React.ChangeEvent<HTMLInputElement>,
                    "capitalisationData"
                  )
                }
                format="DD-MM-YYYY"
                value={
                  purchaseState.capitalisationData
                    ? dayjs(purchaseState.capitalisationData)
                    : null
                }
              />
            </LocalizationProvider>
          </Grid2>
          <Grid2 size={{ xs: 12, sm: 6, md: 6 }}>
            <MuiText variant="h6" className="admin-label-title" my={1}>
              Date Put To Use
            </MuiText>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                slotProps={{
                  textField: {
                    fullWidth: true,
                    size: "small",
                  },
                }}
                onChange={(value) =>
                  handleChange(
                    {
                      target: { value: value?.toString() || "" },
                    } as unknown as React.ChangeEvent<HTMLInputElement>,
                    "putToUse"
                  )
                }
                format="DD-MM-YYYY"
                value={
                  purchaseState.putToUse ? dayjs(purchaseState.putToUse) : null
                }
              />
            </LocalizationProvider>
          </Grid2>
        </Grid2>
        <Box
          component={"section"}
          bgcolor={"#e6e6e6a1"}
          p={"20px"}
          mt={2}
          borderRadius={"12px"}
          sx={{
            "& .MuiInputBase-root": {
              background: "#fff",
              borderRadius: "4px",
            },
            "& .MuiFormHelperText-root": {
              background: "transparent",
            },
          }}
          display={purchaseState.manual ? "block" : "none"}
        >
          <Grid2 container spacing={2}>
            {manualPoFields.map((field) => (
              <Grid2 key={field.name} size={4}>
                <MuiText
                  variant="h6"
                  my={1}
                  pt={1}
                  className="admin-label-title"
                >
                  {field.field !== "checkbox" && (
                    <>
                      {field.label}{" "}
                      {!field?.isRequired && (
                        <span className="mandatory-sign">*</span>
                      )}
                    </>
                  )}
                </MuiText>

                {field.type === "date" && (
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      format="DD-MM-YYYY"
                      value={
                        poDetailsInput?.[field.name]
                          ? dayjs(poDetailsInput[field.name])
                          : null
                      }
                      onChange={(value) => {
                        handlePoInputChange({
                          target: {
                            name: field.name,
                            value: value ? value.toISOString() : "",
                          },
                        } as React.ChangeEvent<HTMLInputElement>);
                        setPoDataErrors({});
                      }}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          size: "small",
                          error: Object.keys(poDataErrors).includes(field.name),
                          helperText:
                            poDataErrors?.[field.name] !== ""
                              ? poDataErrors?.[field.name]
                              : "",
                        },
                      }}
                    />
                  </LocalizationProvider>
                )}
                {field.type !== "date" && field.field !== "checkbox" && (
                  <MuiInputField
                    size="small"
                    fullWidth
                    name={field.name}
                    value={poDetailsInput?.[field.name] || ""}
                    onChange={handlePoInputChange}
                    error={Object.keys(poDataErrors).includes(field.name)}
                    helperText={
                      poDataErrors?.[field.name] !== ""
                        ? poDataErrors?.[field.name]
                        : ""
                    }
                  />
                )}
                {field.field === "checkbox" && (
                  <FormGroup sx={{ mt: "30px" }}>
                    <FormControlLabel
                      control={<Checkbox defaultChecked />}
                      label={field.label}
                      sx={{ width: "fit-content" }}
                      name={field.name}
                      onChange={handleCheck}
                    />
                  </FormGroup>
                )}
              </Grid2>
            ))}
          </Grid2>
        </Box>

        {itemLoading ? (
          <Box p={4} display={"grid"} sx={{ placeItems: "center" }}>
            <CircularProgress size={24} />
          </Box>
        ) : (
          <Box display={purchaseState.manual ? "none" : "block"}>
            <Grid2
              container
              spacing={4}
              mt={2}
              bgcolor={"#e6e6e6a1"}
              p={"30px"}
              borderRadius={"12px"}
              display={
                Array.isArray(detailsData) && detailsData.length > 0
                  ? "flex"
                  : "none"
              }
            >
              {Array.isArray(detailsData) &&
                detailsData.map((item) => (
                  <Grid2 size={4} key={item.id}>
                    <Box>
                      <MuiText variant="caption">{item.title}</MuiText>
                      <MuiText className="admin-page-title" fontSize={16}>
                        {item.value === "" ? "-" : item.value}
                      </MuiText>
                    </Box>
                  </Grid2>
                ))}
            </Grid2>
          </Box>
        )}
      </Grid2>
      <Grid2 size={{ xs: 12, sm: 12, md: 5 }}>
        <Grid2 size={{ xs: 12, sm: 12, md: 12 }}>
          <Grid2 size={{ xs: 12, sm: 12, md: 12 }}>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
              <MuiText variant="h6" my={1} pt={1} className="admin-page-title">
                Additional Cost
              </MuiText>
              {additionalCosts.length <
                (purchaseState.additionalCostData?.length || 0) && (
                <MdOutlineLibraryAdd
                  size={24}
                  onClick={handleAddCost}
                  color="#222"
                  cursor="pointer"
                />
              )}
            </Box>
            <Grid2 container spacing={2} borderTop="1px solid #d8d8d8a1">
              {additionalCosts.map((costEntry) => (
                <React.Fragment key={costEntry.id}>
                  <Grid2 size={{ xs: 12, sm: 6, md: 4 }}>
                    <MuiText
                      variant="h6"
                      my={1}
                      pt={1}
                      className="admin-label-title"
                    >
                      Cost Type
                    </MuiText>
                    <Autocomplete
                      disablePortal
                      options={getFilteredCostTypes(costEntry.id)}
                      fullWidth
                      value={costEntry.costType}
                      onChange={(_, newValue) =>
                        handleCostChange(costEntry.id, "costType", newValue)
                      }
                      getOptionLabel={(option: any) => option.code || ""}
                      isOptionEqualToValue={(option: any, value: any) =>
                        option.id === value.id
                      }
                      renderInput={(params) => (
                        <MuiInputField {...params} size="small" />
                      )}
                    />
                  </Grid2>
                  <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                    <MuiText
                      variant="h6"
                      my={1}
                      pt={1}
                      className="admin-label-title"
                    >
                      Cost
                    </MuiText>
                    <MuiInputField
                      fullWidth
                      type="text"
                      variant="outlined"
                      size="small"
                      value={costEntry.amount}
                      onChange={(e) =>
                        handleCostChange(costEntry.id, "amount", e.target.value)
                      }
                    />
                  </Grid2>
                  <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                    <MuiText
                      variant="h6"
                      my={1}
                      pt={1}
                      className="admin-label-title"
                    >
                      JV No.
                    </MuiText>
                    <MuiInputField
                      fullWidth
                      type="text"
                      variant="outlined"
                      size="small"
                      value={costEntry.journalNo}
                      onChange={(e) =>
                        handleCostChange(costEntry.id, "journalNo", e.target.value)
                      }
                    />
                  </Grid2>
                  <Grid2 size={{ xs: 12, sm: 6, md: 2 }} pt={6}>
                    {additionalCosts.length > 1 && (
                      <RiDeleteBin6Line
                        size={24}
                        color="red"
                        cursor="pointer"
                        onClick={() => handleDeleteCost(costEntry.id)}
                      />
                    )}
                  </Grid2>
                </React.Fragment>
              ))}
            </Grid2>
          </Grid2>
        </Grid2>
      </Grid2>
    </Grid2>
  );
}

export default PurchaseInformation;
