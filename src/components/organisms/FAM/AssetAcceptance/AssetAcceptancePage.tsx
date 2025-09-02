import { Box, Card, Checkbox, DialogTitle, Grid2 } from "@mui/material";
import React, { useEffect, useState } from "react";
import IconBreadcrumbs from "../../../molecules/AdminLayout/BreadCrumbs";
import { MuiButton, MuiInputField, MuiText } from "bsoft-base-elements";
import dayjs from "dayjs";
import FamConfig from "../../../../utils/fam.api.json";
import {
  Apirequest,
  isSubmitting,
  startLoading,
  stopLoading,
  StyledAutocomplete,
} from "../../../../utils/lib";
import Swal from "sweetalert2";
import { useRecoilValue } from "recoil";
import { UserData } from "../../../../utils/atoms";
import { useRouter } from "next/navigation";

interface FilterState {
  startDate: dayjs.Dayjs | null;
  endDate: dayjs.Dayjs | null;
  searchText: string;
}

interface Location {
  id: string;
  name?: string;
  locationName?: string;
  [key: string]: any;
}

interface SubLocation {
  id: string;
  name?: string;
  code?: string;
  [key: string]: any;
}

interface User {
  id: string;
  name?: string;
  code?: string;
  [key: string]: any;
}

interface AssetItem {
  assetId: string;
  assetCode?: string;
  assetName?: string;
  [key: string]: any;
}

interface SelectedValue {
  location?: Location | null;
  subLocation?: SubLocation | null;
  user?: User | null;
}

interface AssetAcceptanceListProps {
  acceptanceData?: AssetItem[];
}

interface AutocompleteOption {
  id: string;
  name?: string;
  locationName?: string;
  subLocationName?: string;
  custodianName?: string;
  [key: string]: any;
}

function AssetAcceptancePage({ assetTransferId }: { assetTransferId: string }) {
  const [count, setCount] = React.useState<number>(0);
  const [acceptanceData, setAcceptanceData] = React.useState<any[]>([]);
  const [assetCommonData, setAssetCommonData] = React.useState<any>({});
  const [locations, setLocations] = useState<Location[]>([]);
  const [subLocations, setSubLocations] = useState<
    Record<string, SubLocation[]>
  >({});
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [filterValues, setFilterValues] = React.useState<FilterState>({
    startDate: null,
    endDate: null,
    searchText: "",
  });
  const [selectedValues, setSelectedValues] = useState<
    Record<string, SelectedValue>
  >({});
  const [errors, setErrors] = useState<any>({});
  const [checked, setChecked] = useState<AssetItem[]>([]);
  const [inputs, setInputs] = useState({
    remarks: "",
  });
  const userValue = useRecoilValue(UserData);
  const router = useRouter();
  const GetTransferList = async () => {
    try {
      setLoading(true);
      const { endpoint, method } = FamConfig.AssetAcceptance.GetById;
      const result = await Apirequest(
        endpoint.replace("{id}", assetTransferId),
        method,
        null,
        "fam"
      ).then((res) => res.data);
      if (result.data) {
        const headers = {
          assetTransferId: result.data?.assetTransferId,
          docDate: result.data?.docDate,
          gatePassNo: result.data?.gatePassNo,
          remarks: result.data?.remarks,
          transferType: result.data?.transferType,
          fromUnitname: result.data?.fromUnitname,
          fromDepartment: result.data?.fromDepartment,
          toUnitname: result.data?.toUnitname,
          toDepartment: result.data?.toDepartment,
          fromCustodianName: result.data?.fromCustodianName,
          toCustodianName: result.data?.toCustodianName,
        };
        setAcceptanceData(result.data.assetTransferPendingDtl);
        setCount(result.totalCount);
        setAssetCommonData(headers);
        setInputs({
          ...inputs,
          remarks: headers.remarks,
        });
      } else {
        setAcceptanceData([]);
        setCount(0);
        setAssetCommonData({});
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchLocations = async (): Promise<void> => {
    setLoading(true);
    try {
      const { endpoint, method } = FamConfig.AssetLocation.location;
      const response = await Apirequest(endpoint, method, null, "fam").then(
        (res) => res.data
      );

      if (response && Array.isArray(response.data)) {
        setLocations(response.data);
      } else {
        console.warn("Location data is not an array:", response?.data);
        setLocations([]);
      }
    } catch (err) {
      console.error("Error fetching location data:", err);
      setLocations([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubLocations = async (locationId: string): Promise<void> => {
    if (!locationId) return;

    try {
      const { endpoint, method } = FamConfig.AssetLocation.subLocation;
      const response = await Apirequest(
        endpoint.replace("{id}", locationId),
        method,
        null,
        "fam"
      ).then((res) => res.data);

      if (response && Array.isArray(response.data)) {
        setSubLocations((prev) => ({
          ...prev,
          [locationId]: response.data,
        }));
      } else {
        console.warn("Sublocation data is not an array:", response?.data);
        setSubLocations((prev) => ({
          ...prev,
          [locationId]: [],
        }));
      }
    } catch (err) {
      console.error("Error fetching sublocation data:", err);
      setSubLocations((prev) => ({
        ...prev,
        [locationId]: [],
      }));
    }
  };

  const getCustodian = async () => {
    try {
      const { endpoint, method } = FamConfig.AssetLocation.custodian;
      const response = await Apirequest(
        endpoint.replace("{id}", userValue.oldUnitId.toString()),
        method,
        null,
        "fam"
      ).then((res) => res.data);
      setUsers(response?.data);
    } catch (err) {
      console.error("Error fetching custodian data:", err);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  useEffect(() => {
    if (userValue.oldUnitId) {
      getCustodian();
    }
  }, [userValue.oldUnitId]);

  useEffect(() => {
    if (assetTransferId) {
      GetTransferList();
    }
  }, [assetTransferId]);

  const handleLocationChange = (
    assetId: string,
    locationValue: Location | null
  ): void => {
    setErrors([]);
    if (locationValue && locationValue.id) {
      fetchSubLocations(locationValue.id);

      setSelectedValues((prev) => ({
        ...prev,
        [assetId]: {
          ...prev[assetId],
          location: locationValue,
          subLocation: null,
        },
      }));
    }
  };

  const handleSubLocationChange = (
    assetId: string,
    subLocationValue: SubLocation | null
  ): void => {
    setErrors([]);
    setSelectedValues((prev) => ({
      ...prev,
      [assetId]: {
        ...prev[assetId],
        subLocation: subLocationValue,
      },
    }));
  };

  const handleUserChange = (assetId: string, userValue: User | null): void => {
    setErrors([]);
    setSelectedValues((prev) => ({
      ...prev,
      [assetId]: {
        ...prev[assetId],
        user: userValue,
      },
    }));
  };

  const handleSubmit = async () => {
    if (isSubmitting()) return;
    startLoading();

    const newErrors: Record<
      string,
      { location?: string; subLocation?: string }
    > = {};

    acceptanceData.forEach((li) => {
      const isChecked = checked.some(
        (checkedItem) => checkedItem.assetId === li?.assetId
      );

      if (isChecked) {
        if (!selectedValues[li?.assetId]?.location) {
          newErrors[li?.assetId] = {
            ...newErrors[li?.assetId],
            location: "Location is required",
          };
        }
        if (!selectedValues[li?.assetId]?.subLocation) {
          newErrors[li?.assetId] = {
            ...newErrors[li?.assetId],
            subLocation: "Sub Location is required",
          };
        }
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      stopLoading();
      return;
    }

    try {
      await AddAssetAcceptance();
    } catch (err) {
    } finally {
      stopLoading();
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    let { name, value } = event.target;
    setErrors([]);
    setInputs({ ...inputs, [name]: value });
  };

  const handleChecked = (
    event: React.ChangeEvent<HTMLInputElement>,
    item: AssetItem
  ) => {
    const { checked: isChecked } = event.target;

    const isRowComplete =
      selectedValues[item?.assetId]?.location &&
      selectedValues[item?.assetId]?.subLocation;
    // selectedValues[item?.assetId]?.user;

    if (!isRowComplete) {
      return;
    }

    if (isChecked) {
      const completeRowData = {
        ...item,
        location: selectedValues[item.assetId]?.location,
        subLocation: selectedValues[item.assetId]?.subLocation,
        user: selectedValues[item.assetId]?.user,
      };
      setChecked((prev) => [...prev, completeRowData]);
    } else {
      setChecked((prev) =>
        prev.filter((checkedItem) => checkedItem.assetId !== item.assetId)
      );
    }
  };

  const AddAssetAcceptance = async () => {
    try {
      startLoading();
      const checkedMap: any = checked.reduce((acc: any, item) => {
        acc[item.assetId] = item;
        return acc;
      }, {});

      const body = {
        assetTransferReceiptHdrDto: {
          assetTransferId: assetTransferId,
          docDate: dayjs(assetCommonData?.docDate).format("YYYY-MM-DD"),
          sdcno: assetCommonData?.sdcno,
          remarks: inputs.remarks,
          assetTransferReceiptDtl: acceptanceData.map((asset) => {
            const isChecked = checkedMap.hasOwnProperty(asset.assetId);
            if (isChecked) {
              const checkedItem = checkedMap[asset.assetId];
              return {
                assetId: asset.assetId,
                locationId: selectedValues[asset.assetId]?.location?.id,
                subLocationId: selectedValues[asset.assetId]?.subLocation?.id,
                userID: selectedValues[asset.assetId]?.user?.custodianId
                  ? String(selectedValues[asset.assetId]?.user?.custodianId)
                  : 0,
                userName: selectedValues[asset.assetId]?.user?.custodianName
                  ? selectedValues[asset.assetId]?.user?.custodianName
                  : null,
                ackStatus: 1,
              };
            } else {
              return {
                assetId: asset.assetId,
                locationId: null,
                subLocationId: null,
                userID: null,
                userName: null,
                ackStatus: 0,
              };
            }
          }),
        },
      };

      const { endpoint, method } = FamConfig.AssetAcceptance.AssetAcknowledge;
      const response = await Apirequest(endpoint, method, body, "fam").then(
        (res) => res.data
      );

      const { statusCode } = response;
      if (statusCode === 200 || statusCode === 201) {
        Swal.fire({
          title: "Asset Transfer Receipt updated successfully",
          icon: "success",
          confirmButtonText: "okay",
          customClass: {
            title: "custom-title",
          },
        }).then((res) => {
          if (res.isConfirmed) {
            router.push(`/fam/acceptance`);
          }
        });
      }
    } catch (err) {
      console.log(err);
    } finally {
      stopLoading();
    }
  };

  return (
    <Box>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        px={3}
        py={1}
        bgcolor="#fff"
        borderBottom="1px solid #eee"
      >
        <IconBreadcrumbs
          parent={"Fixed Asset Management"}
          child={"Transfer Acceptance"}
          path=""
        />
      </Box>
      <Box p={"0 24px 16px"} my={1} bgcolor={"#fff"}>
        <DialogTitle className="highlighted-header" sx={{ pl: 0 }}>
          Transfer Acceptance
        </DialogTitle>
        <Box mt={2}>
          <Box
            display={"flex"}
            justifyContent={"space-between"}
            flexWrap={"wrap"}
            gap={4}
          >
            <Box>
              <MuiText my={1} className="asset-label-title">
                Transfer ID
              </MuiText>
              <MuiText className="asset-page-title">
                {assetCommonData?.assetTransferId &&
                  assetCommonData?.assetTransferId}
              </MuiText>
            </Box>
            <Box>
              <MuiText my={1} className="asset-label-title">
                Date
              </MuiText>
              <MuiText className="asset-page-title">
                {assetCommonData?.docDate &&
                  dayjs(assetCommonData?.docDate).format("DD-MM-YYYY")}
              </MuiText>
            </Box>
            <Box>
              <MuiText my={1} className="asset-label-title">
                Transfer type
              </MuiText>
              <MuiText className="asset-page-title">
                {assetCommonData?.transferType && assetCommonData?.transferType}
              </MuiText>
            </Box>
            <Box>
              <MuiText my={1} className="asset-label-title">
                From Unit
              </MuiText>
              <MuiText className="asset-page-title">
                {assetCommonData?.fromUnitname && assetCommonData?.fromUnitname}
              </MuiText>
            </Box>
            <Box>
              <MuiText my={1} className="asset-label-title">
                From Department
              </MuiText>
              <MuiText className="asset-page-title">
                {assetCommonData?.fromDepartment &&
                  assetCommonData?.fromDepartment}
              </MuiText>
            </Box>
            <Box>
              <MuiText my={1} className="asset-label-title">
                To Unit
              </MuiText>
              <MuiText className="asset-page-title">
                {assetCommonData?.toUnitname && assetCommonData?.toUnitname}
              </MuiText>
            </Box>
            <Box>
              <MuiText my={1} className="asset-label-title">
                To Department
              </MuiText>
              <MuiText className="asset-page-title">
                {assetCommonData?.toDepartment && assetCommonData?.toDepartment}
              </MuiText>
            </Box>
            <Box>
              <MuiText my={1} className="asset-label-title">
                From Custodian
              </MuiText>
              <MuiText className="asset-page-title">
                {assetCommonData?.fromCustodianName &&
                  assetCommonData?.fromCustodianName}
              </MuiText>
            </Box>
            <Box>
              <MuiText my={1} className="asset-label-title">
                Gate Pass No.
              </MuiText>
              <MuiText className="asset-page-title">
                {assetCommonData?.gatePassNo
                  ? assetCommonData?.gatePassNo
                  : "-"}
              </MuiText>
            </Box>
          </Box>
          <Box mt={2}>
            <MuiText variant="caption" fontSize={14}>
              List of Items
            </MuiText>
            {Array.isArray(acceptanceData) &&
              acceptanceData.map((li) => {
                const isRowComplete =
                  selectedValues[li?.assetId]?.location &&
                  selectedValues[li?.assetId]?.subLocation;

                return (
                  <Card
                    sx={{
                      p: { xs: 2, sm: 2.5, md: 3 },
                      boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                      border: "1px solid #e0e0e0",
                      borderRadius: 2,
                      my: 2,
                      transition: "all 0.2s ease-in-out",
                      "&:hover": {
                        boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
                        borderColor: "#1976d2",
                      },
                    }}
                    key={li?.assetId}
                  >
                    <Grid2
                      container
                      spacing={{ xs: 1.5, sm: 2, md: 3 }}
                      alignItems="flex-start"
                    >
                      {/* Checkbox Section */}
                      <Grid2 size={{ xs: 1, sm: 0.7, md: 0.5 }}>
                        <Box
                          display="flex"
                          justifyContent={{ xs: "flex-start", sm: "center" }}
                          pt={0}
                        >
                          <Checkbox
                            disabled={!isRowComplete}
                            checked={checked.some(
                              (checkedItem) =>
                                checkedItem.assetId === li?.assetId
                            )}
                            onChange={(e) => handleChecked(e, li)}
                            sx={{
                              "&.Mui-disabled": {
                                opacity: 0.5,
                              },
                            }}
                          />
                        </Box>
                      </Grid2>

                      {/* Asset Information Section */}
                      <Grid2 size={{ xs: 11, sm: 5.3, md: 3 }}>
                        <Grid2 container spacing={{ xs: 1, sm: 1.5, md: 2 }}>
                          <Grid2 size={{ xs: 12, sm: 6 }}>
                            <Box>
                              <MuiText
                                className="asset-label-title"
                                sx={{
                                  fontSize: {
                                    xs: "0.6rem",
                                    sm: "0.62rem",
                                    md: "0.65rem",
                                  },
                                  fontWeight: 600,
                                  color: "text.secondary",
                                  mb: 0.5,
                                  textTransform: "capitalize",
                                  letterSpacing: "0.5px",
                                }}
                              >
                                Asset Code
                              </MuiText>
                              <MuiText
                                className="asset-page-title"
                                sx={{
                                  fontSize: {
                                    xs: "0.85rem",
                                    sm: "0.9rem",
                                    md: "0.95rem",
                                  },
                                  fontWeight: "600 !important",
                                  color: "#3a8484",
                                  wordBreak: "break-word",
                                }}
                              >
                                {li?.assetCode}
                              </MuiText>
                            </Box>
                          </Grid2>

                          <Grid2 size={{ xs: 12, sm: 6 }}>
                            <Box>
                              <MuiText
                                className="asset-label-title"
                                sx={{
                                  fontSize: {
                                    xs: "0.6rem",
                                    sm: "0.62rem",
                                    md: "0.65rem",
                                  },
                                  fontWeight: 600,
                                  color: "text.secondary",
                                  mb: 0.5,
                                  textTransform: "capitalize",
                                  letterSpacing: "0.5px",
                                }}
                              >
                                Asset Name
                              </MuiText>
                              <MuiText
                                className="asset-page-title"
                                sx={{
                                  fontSize: {
                                    xs: "0.85rem",
                                    sm: "0.9rem",
                                    md: "0.95rem",
                                  },
                                  fontWeight: "600 !important",
                                  color: "#3a8484",
                                  wordBreak: "break-word",
                                }}
                              >
                                {li?.assetName}
                              </MuiText>
                            </Box>
                          </Grid2>
                        </Grid2>
                      </Grid2>

                      {/* To Custodian Section */}
                      <Grid2 size={{ xs: 12, sm: 6, md: 2 }}>
                        <Box>
                          <MuiText
                            className="asset-label-title"
                            sx={{
                              fontSize: {
                                xs: "0.6rem",
                                sm: "0.62rem",
                                md: "0.65rem",
                              },
                              fontWeight: 600,
                              color: "text.secondary",
                              mb: 0.5,
                              textTransform: "capitalize",
                              letterSpacing: "0.5px",
                            }}
                          >
                            To Custodian
                          </MuiText>
                          <MuiText
                            className="asset-page-title"
                            sx={{
                              fontSize: {
                                xs: "0.85rem",
                                sm: "0.9rem",
                                md: "0.95rem",
                              },
                              fontWeight: "600 !important",
                              color: "#3a8484",
                              wordBreak: "break-word",
                            }}
                          >
                            {assetCommonData?.toCustodianName}
                          </MuiText>
                        </Box>
                      </Grid2>

                      {/* Form Fields Section */}
                      <Grid2 size={{ xs: 12, sm: 12, md: 6 }}>
                        <Grid2 container spacing={{ xs: 1.5, sm: 2 }}>
                          {/* Location Field */}
                          <Grid2 size={{ xs: 12, sm: 4, md: 4 }}>
                            <Box>
                              <MuiText
                                className="asset-label-title"
                                sx={{
                                  fontSize: {
                                    xs: "0.6rem",
                                    sm: "0.62rem",
                                    md: "0.65rem",
                                  },
                                  fontWeight: 600,
                                  color: "text.secondary",
                                  mb: 1,
                                  textTransform: "capitalize",
                                  letterSpacing: "0.5px",
                                }}
                              >
                                To Location Name{" "}
                                <MuiText
                                  component="span"
                                  color="error.main"
                                  sx={{ fontSize: "unset !important" }}
                                >
                                  *
                                </MuiText>
                              </MuiText>
                              <StyledAutocomplete
                                options={locations || []}
                                fullWidth
                                loading={loading}
                                value={
                                  selectedValues[li?.assetId]?.location || null
                                }
                                getOptionLabel={(option) =>
                                  (option as AutocompleteOption)?.name ||
                                  (option as AutocompleteOption)
                                    ?.locationName ||
                                  ""
                                }
                                isOptionEqualToValue={(option, value) =>
                                  (option as AutocompleteOption)?.id ===
                                  (value as AutocompleteOption)?.id
                                }
                                onChange={(_, value, reason) =>
                                  handleLocationChange(
                                    li?.assetId || "",
                                    value as AutocompleteOption | null
                                  )
                                }
                                renderInput={(params) => (
                                  <MuiInputField
                                    {...params}
                                    size="small"
                                    error={!!errors[li?.assetId]?.location}
                                    helperText={errors[li?.assetId]?.location}
                                    sx={{
                                      "& .MuiOutlinedInput-root": {
                                        borderRadius: 1.5,
                                        fontSize: {
                                          xs: "0.8rem",
                                          sm: "0.875rem",
                                        },
                                      },
                                    }}
                                  />
                                )}
                              />
                            </Box>
                          </Grid2>

                          {/* Sub Location Field */}
                          <Grid2 size={{ xs: 12, sm: 4, md: 4 }}>
                            <Box>
                              <MuiText
                                className="asset-label-title"
                                sx={{
                                  fontSize: {
                                    xs: "0.6rem",
                                    sm: "0.62rem",
                                    md: "0.65rem",
                                  },
                                  fontWeight: 600,
                                  color: "text.secondary",
                                  mb: 1,
                                  textTransform: "capitalize",
                                  letterSpacing: "0.5px",
                                }}
                              >
                                To Sub Location Name{" "}
                                <MuiText
                                  component="span"
                                  color="error.main"
                                  sx={{ fontSize: "unset !important" }}
                                >
                                  *
                                </MuiText>
                              </MuiText>
                              <StyledAutocomplete
                                options={(() => {
                                  const locationId =
                                    selectedValues[li?.assetId]?.location?.id;
                                  return locationId
                                    ? subLocations[locationId] || []
                                    : [];
                                })()}
                                fullWidth
                                disabled={
                                  !selectedValues[li?.assetId]?.location
                                }
                                value={
                                  selectedValues[li?.assetId]?.subLocation ||
                                  null
                                }
                                getOptionLabel={(option) =>
                                  (option as AutocompleteOption)?.name ||
                                  (option as AutocompleteOption)
                                    ?.subLocationName ||
                                  ""
                                }
                                isOptionEqualToValue={(option, value) =>
                                  (option as AutocompleteOption)?.id ===
                                  (value as AutocompleteOption)?.id
                                }
                                onChange={(_, value, reason) =>
                                  handleSubLocationChange(
                                    li?.assetId || "",
                                    value as AutocompleteOption | null
                                  )
                                }
                                renderInput={(params) => (
                                  <MuiInputField
                                    {...params}
                                    size="small"
                                    error={!!errors[li?.assetId]?.subLocation}
                                    helperText={
                                      errors[li?.assetId]?.subLocation
                                    }
                                    sx={{
                                      "& .MuiOutlinedInput-root": {
                                        borderRadius: 1.5,
                                        fontSize: {
                                          xs: "0.8rem",
                                          sm: "0.875rem",
                                        },
                                      },
                                    }}
                                  />
                                )}
                              />
                            </Box>
                          </Grid2>

                          {/* User Field */}
                          <Grid2 size={{ xs: 12, sm: 4, md: 4 }}>
                            <Box>
                              <MuiText
                                className="asset-label-title"
                                sx={{
                                  fontSize: {
                                    xs: "0.6rem",
                                    sm: "0.62rem",
                                    md: "0.65rem",
                                  },
                                  fontWeight: 600,
                                  color: "text.secondary",
                                  mb: 1,
                                  textTransform: "capitalize",
                                  letterSpacing: "0.5px",
                                }}
                              >
                                To User Name
                              </MuiText>
                              <StyledAutocomplete
                                options={users || []}
                                fullWidth
                                value={
                                  selectedValues[li?.assetId]?.user || null
                                }
                                getOptionLabel={(option) =>
                                  (option as AutocompleteOption)?.name ||
                                  (option as AutocompleteOption)
                                    ?.custodianName ||
                                  ""
                                }
                                isOptionEqualToValue={(option, value) =>
                                  (option as AutocompleteOption)?.id ===
                                  (value as AutocompleteOption)?.id
                                }
                                onChange={(_, value, reason) =>
                                  handleUserChange(
                                    li?.assetId || "",
                                    value as AutocompleteOption | null
                                  )
                                }
                                renderInput={(params) => (
                                  <MuiInputField
                                    {...params}
                                    size="small"
                                    error={!!errors[li?.assetId]?.user}
                                    helperText={errors[li?.assetId]?.user}
                                    sx={{
                                      "& .MuiOutlinedInput-root": {
                                        borderRadius: 1.5,
                                        fontSize: {
                                          xs: "0.8rem",
                                          sm: "0.875rem",
                                        },
                                      },
                                    }}
                                  />
                                )}
                              />
                            </Box>
                          </Grid2>
                        </Grid2>
                      </Grid2>
                    </Grid2>

                    {/* Optional: Status Indicator */}
                    {!isRowComplete && (
                      <Box
                        sx={{
                          mt: 2,
                          pt: 2,
                          borderTop: "1px solid #f0f0f0",
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          flexDirection: { xs: "column", sm: "row" },
                          textAlign: { xs: "center", sm: "left" },
                        }}
                      >
                        <Box
                          sx={{
                            width: 6,
                            height: 6,
                            borderRadius: "50%",
                            bgcolor: "warning.main",
                            flexShrink: 0,
                          }}
                        />
                        <MuiText
                          sx={{
                            fontSize: { xs: "0.75rem", sm: "0.8rem" },
                            color: "warning.main",
                            fontWeight: 500,
                          }}
                        >
                          Please complete all required fields to enable
                          selection
                        </MuiText>
                      </Box>
                    )}
                  </Card>
                );
              })}

            <Box mt={2}>
              <Grid2 size={6}>
                <MuiText className="asset-label-title" mb={1}>
                  Remarks
                </MuiText>
                <MuiInputField
                  size="small"
                  fullWidth
                  multiline
                  rows={4}
                  value={inputs.remarks}
                  name="remarks"
                  onChange={handleChange}
                />
              </Grid2>
            </Box>
            <Box
              display={"flex"}
              alignItems={"center"}
              gap={2}
              mt={2}
              sx={{
                button: {
                  minWidth: "70px !important",
                },
              }}
            >
              <MuiButton
                className="asset-add-button"
                variant="outlined"
                sx={{ textTransform: "capitalize", mb: "0px !important" }}
                onClick={() => router.back()}
              >
                Cancel
              </MuiButton>
              <MuiButton
                variant="contained"
                sx={{
                  textTransform: "capitalize",
                  background: "#3a8484!important",
                }}
                disabled={checked.length === 0 || isSubmitting()}
                onClick={handleSubmit}
              >
                Submit
              </MuiButton>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export default AssetAcceptancePage;
