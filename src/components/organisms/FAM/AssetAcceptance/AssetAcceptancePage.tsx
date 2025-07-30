import { Box, Card, Checkbox, DialogTitle, Grid2 } from "@mui/material";
import React, { useEffect, useState } from "react";
import IconBreadcrumbs from "../../../molecules/AdminLayout/BreadCrumbs";
import { MuiButton, MuiInputField, MuiText } from "bsoft-base-elements";
import dayjs from "dayjs";
import FamConfig from "../../../../utils/fam.api.json";
import { Apirequest, StyledAutocomplete } from "../../../../utils/lib";
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

  useEffect(() => {
    console.log(checked);
  }, [checked]);

  const handleSubmit = () => {
    const newErrors: any = {};

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
        // if (!selectedValues[li?.assetId]?.user) {
        //   newErrors[li?.assetId] = {
        //     ...newErrors[li?.assetId],
        //     user: "User is required",
        //   };
        // }
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    AddAssetAcceptance();
    console.log("Form submitted successfully!");
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
              <MuiText variant="h6" my={1} className="asset-label-title">
                Transfer ID
              </MuiText>
              <MuiText variant="h6" className="asset-page-title">
                {assetCommonData?.assetTransferId &&
                  assetCommonData?.assetTransferId}
              </MuiText>
            </Box>
            <Box>
              <MuiText variant="h6" my={1} className="asset-label-title">
                Date
              </MuiText>
              <MuiText variant="h6" className="asset-page-title">
                {assetCommonData?.docDate &&
                  dayjs(assetCommonData?.docDate).format("DD-MM-YYYY")}
              </MuiText>
            </Box>
            <Box>
              <MuiText variant="h6" my={1} className="asset-label-title">
                Transfer type
              </MuiText>
              <MuiText variant="h6" className="asset-page-title">
                {assetCommonData?.transferType && assetCommonData?.transferType}
              </MuiText>
            </Box>
            <Box>
              <MuiText variant="h6" my={1} className="asset-label-title">
                From Unit
              </MuiText>
              <MuiText variant="h6" className="asset-page-title">
                {assetCommonData?.fromUnitname && assetCommonData?.fromUnitname}
              </MuiText>
            </Box>
            <Box>
              <MuiText variant="h6" my={1} className="asset-label-title">
                From Department
              </MuiText>
              <MuiText variant="h6" className="asset-page-title">
                {assetCommonData?.fromDepartment &&
                  assetCommonData?.fromDepartment}
              </MuiText>
            </Box>
            <Box>
              <MuiText variant="h6" my={1} className="asset-label-title">
                To Unit
              </MuiText>
              <MuiText variant="h6" className="asset-page-title">
                {assetCommonData?.toUnitname && assetCommonData?.toUnitname}
              </MuiText>
            </Box>
            <Box>
              <MuiText variant="h6" my={1} className="asset-label-title">
                To Department
              </MuiText>
              <MuiText variant="h6" className="asset-page-title">
                {assetCommonData?.toDepartment && assetCommonData?.toDepartment}
              </MuiText>
            </Box>
            <Box>
              <MuiText variant="h6" my={1} className="asset-label-title">
                From Custodian
              </MuiText>
              <MuiText variant="h6" className="asset-page-title">
                {assetCommonData?.fromCustodianName &&
                  assetCommonData?.fromCustodianName}
              </MuiText>
            </Box>
            <Box>
              <MuiText variant="h6" my={1} className="asset-label-title">
                Gate Pass No.
              </MuiText>
              <MuiText variant="h6" className="asset-page-title">
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
                // selectedValues[li?.assetId]?.user;

                return (
                  <Card
                    sx={{
                      p: 2,
                      boxShadow: "none",
                      border: "1px solid #e8e8e8",
                      my: 1,
                    }}
                    key={li?.assetId}
                  >
                    <Grid2 container spacing={2}>
                      <Grid2
                        size={0.5}
                        display={"flex"}
                        alignItems={"baseline"}
                        justifyContent={"center"}
                      >
                        <Checkbox
                          disabled={!isRowComplete}
                          checked={checked.some(
                            (checkedItem) => checkedItem.assetId === li?.assetId
                          )}
                          onChange={(e) => handleChecked(e, li)}
                        />
                      </Grid2>
                      <Grid2 size={1.5}>
                        <Box>
                          <MuiText className="asset-label-title">
                            Asset Code
                          </MuiText>
                          <MuiText variant="h6" className="asset-page-title">
                            {li?.assetCode}
                          </MuiText>
                        </Box>
                      </Grid2>
                      <Grid2 size={1.5}>
                        <Box>
                          <MuiText className="asset-label-title">
                            Asset Name
                          </MuiText>
                          <MuiText variant="h6" className="asset-page-title">
                            {li?.assetName}
                          </MuiText>
                        </Box>
                      </Grid2>
                      <Grid2 size={1}>
                        <Box>
                          <MuiText className="asset-label-title">
                            To Custodian
                          </MuiText>
                          <MuiText variant="h6" className="asset-page-title">
                            {assetCommonData?.toCustodianName}
                          </MuiText>
                        </Box>
                      </Grid2>
                      <Grid2 size={2}>
                        <Box>
                          <MuiText className="asset-label-title">
                            To Location Name
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
                              (option as AutocompleteOption)?.locationName ||
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
                              />
                            )}
                          />
                        </Box>
                      </Grid2>

                      <Grid2 size={2}>
                        <Box>
                          <MuiText className="asset-label-title">
                            To Sub Location Name
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
                            value={
                              selectedValues[li?.assetId]?.subLocation || null
                            }
                            getOptionLabel={(option) =>
                              (option as AutocompleteOption)?.name ||
                              (option as AutocompleteOption)?.subLocationName ||
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
                                helperText={errors[li?.assetId]?.subLocation}
                              />
                            )}
                          />
                        </Box>
                      </Grid2>

                      <Grid2 size={2}>
                        <Box>
                          <MuiText className="asset-label-title">
                            To User Name
                          </MuiText>
                          <StyledAutocomplete
                            options={users || []}
                            fullWidth
                            value={selectedValues[li?.assetId]?.user || null}
                            getOptionLabel={(option) =>
                              (option as AutocompleteOption)?.name ||
                              (option as AutocompleteOption)?.custodianName ||
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
                              />
                            )}
                          />
                        </Box>
                      </Grid2>
                    </Grid2>
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
                disabled={checked.length === 0}
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
