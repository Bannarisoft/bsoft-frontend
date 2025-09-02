import { Autocomplete, Box, Card, DialogTitle, Grid2 } from "@mui/material";
import IconBreadcrumbs from "../../../molecules/AdminLayout/BreadCrumbs";
import { MuiButton, MuiInputField, MuiText } from "bsoft-base-elements";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { GoPlus } from "react-icons/go";
import { BsTrash } from "react-icons/bs";
import FamConfig from "../../../../utils/fam.api.json";
import config from "../../../../utils/config.api.json";
import {
  Apirequest,
  DateFormatter,
  isSubmitting,
  startLoading,
  stopLoading,
} from "../../../../utils/lib";
import { useEffect, useState } from "react";
import { useRecoilValue } from "recoil";
import { UserData } from "../../../../utils/atoms";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import ErrorModal from "../../../molecules/Master/Role/ErrorModal";

export default function CreateAssetTransfer() {
  const userValue = useRecoilValue(UserData);
  const [deptData, setDeptData] = useState([]);
  const [deptByData, setDeptByData] = useState([]);
  const [gatePass, setGatePass] = useState("");
  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [errorMessages, setErrorMessages] = useState<string[]>([]);
  const [selectedValue, setSelectedValue] = useState({
    department: null as any,
    category: "" as any,
    assetName: "" as any,
    toUnit: "" as any,
    toDepartment: "" as any,
    toCustodian: "" as any,
  });
  const [custodian, setCustodian] = useState({
    data: [],
    selected: "" as any,
  });

  const [unit, setUnit] = useState({
    data: [],
    selected: "" as any,
  });

  const [transferType, setTransferType] = useState({
    data: [],
    selected: "" as any,
  });

  const [category, setCategory] = useState({
    data: [],
    selected: null as any,
  });

  const [asset, setAsset] = useState({
    data: [],
    selected: null as any,
    filteredData: [],
  });

  const [assetDetails, setAssetDetails] = useState<any>({});
  const [assetList, setAssetList] = useState<any>([]);
  const [transferDate, setTransferDate] = useState(dayjs(new Date()));

  const GetDepartment = async () => {
    try {
      const { endpoint, method } = config.Department.withoutControl;
      const result = await Apirequest(endpoint, method).then(
        (res) => res?.data
      );
      setDeptData(result?.data);
    } catch (err) {
      console.log(err);
      setDeptData([]);
    }
  };
  const GetByDepartment = async () => {
    try {
      const { endpoint, method } = config.Department.getDepartment;
      const result = await Apirequest(endpoint, method).then(
        (res) => res?.data
      );
      setDeptByData(result?.data);
    } catch (err) {
      console.log(err);
      setDeptByData([]);
    }
  };

  const FetchCustodian = async (unitId: string) => {
    if (!unitId) return;

    try {
      const { endpoint, method } = FamConfig.AssetLocation.custodian;
      const response = await Apirequest(
        endpoint.replace("{id}", unitId.toString()),
        method,
        null,
        "fam"
      ).then((res) => res?.data);
      const { data } = response;
      setCustodian({ ...custodian, data: data });
    } catch (err) {
      console.error("Error fetching custodian data:", err);
    }
  };

  const GetTransferTypes = async () => {
    try {
      const { endpoint, method } = FamConfig.AssetTransfer.AssetTransferTypes;
      const response = await Apirequest(endpoint, method, null, "fam").then(
        (res) => res?.data
      );
      const { data } = response;
      setTransferType({ ...transferType, data: data });
    } catch (err) {
      console.error("Error fetching transfer type data:", err);
    }
  };

  const GetUnitByCompany = async () => {
    if (!userValue.companyId) return;

    try {
      const { endpoint, method } = config.Unit.getUnitByCompany;
      const result = await Apirequest(
        endpoint.replace("{id}", userValue.companyId.toString()),
        method
      ).then((res) => res.data);
      const { data } = result;
      setUnit({ ...unit, data: data });
    } catch (err) {
      console.log(err);
    }
  };

  const GetCategoryByDepartment = async (deptId: string) => {
    if (!deptId) return;

    try {
      const { endpoint, method } = FamConfig.AssetTransfer.CategoryByDepartment;
      const result = await Apirequest(
        endpoint.replace("{id}", deptId.toString()),
        method,
        null,
        "fam"
      ).then((res) => res.data);
      const { data } = result;
      setCategory({ ...category, data: data, selected: null });
      setAsset({ data: [], selected: null, filteredData: [] });
      setAssetDetails({});
    } catch (err) {
      console.log(err);
    }
  };

  const GetAssetByCategoryDept = async (categoryId: string) => {
    try {
      if (!selectedValue.department?.id || !categoryId) {
        console.warn("Missing parameters:", {
          dept: selectedValue.department?.id,
          cat: categoryId,
        });
        return;
      }

      const { endpoint, method } =
        FamConfig.AssetTransfer.AssetByCategoryDepartment;
      const result = await Apirequest(
        endpoint
          .replace("{category}", categoryId.toString())
          .replace("{department}", selectedValue.department?.id.toString()),
        method,
        null,
        "fam"
      ).then((res) => res.data);

      const fetchedAssets = result?.data || [];

      const filteredAssets = fetchedAssets.filter(
        (fetchedAsset: any) =>
          !assetList.some((item: any) => item.id === fetchedAsset.assetId)
      );

      setAsset({
        data: fetchedAssets,
        filteredData: filteredAssets,
        selected: null,
      });
    } catch (err) {
      console.error("Error fetching assets:", err);
      setAsset({ data: [], selected: null, filteredData: [] });
    }
  };

  const GetAssetDetails = async (assetId: any) => {
    if (!assetId) return;

    try {
      const { endpoint, method } = FamConfig.AssetTransfer.AssetDetails;
      const result = await Apirequest(
        endpoint.replace("{assetId}", assetId.toString()),
        method,
        null,
        "fam"
      ).then((res) => res.data);
      const { data, message, statusCode } = result;
      if (statusCode === 200 || statusCode === 201) {
        setAssetDetails(data);
        typeof message === "string" && toast.success(message);
      } else {
        typeof message === "string" && toast.error(message);
      }
    } catch (err) {
      console.log(err);
      setAssetDetails({});
    }
  };

  const handleAutocomplete = (newValue: any, field: string) => {
    if (
      field === "dept" ||
      field === "category" ||
      field === "asset" ||
      field === "type"
    ) {
      if (!newValue && field === "dept") {
        setSelectedValue((prev) => ({ ...prev, department: null }));
        setCategory((prev) => ({ ...prev, data: [], selected: null }));
        setAsset((prev) => ({
          ...prev,
          data: [],
          filteredData: [],
          selected: null,
        }));
        setAssetDetails({});
        return;
      }

      if (!newValue && field === "category") {
        setCategory((prev) => ({ ...prev, selected: null }));
        setAsset((prev) => ({
          ...prev,
          data: [],
          filteredData: [],
          selected: null,
        }));
        setAssetDetails({});
        return;
      }

      if (!newValue && field === "asset") {
        setAsset((prev) => ({ ...prev, selected: null }));
        setAssetDetails({});
        return;
      }

      if (!newValue && field === "type") {
        setTransferType((prev: any) => ({ ...prev, selected: null }));
        return;
      }
    }

    switch (field) {
      case "dept":
        setSelectedValue((prev) => ({ ...prev, department: newValue }));
        GetCategoryByDepartment(newValue.id);
        break;

      case "category":
        setCategory((prev) => ({ ...prev, selected: newValue }));
        GetAssetByCategoryDept(newValue?.categoryID);
        break;

      case "asset":
        setAsset((prev) => ({ ...prev, selected: newValue }));
        if (newValue?.assetId) {
          GetAssetDetails(newValue.assetId);
        }
        break;

      case "type":
        setTransferType((prev) => ({ ...prev, selected: newValue }));
        break;

      case "toUnit":
        setUnit((prev) => ({ ...prev, selected: newValue }));
        if (newValue?.id) {
          FetchCustodian(userValue.oldUnitId.toString());
          // FetchCustodian(newValue.id);
        } else {
          setCustodian((prev) => ({ ...prev, data: [], selected: "" }));
        }
        break;

      case "toDept":
        setSelectedValue((prev) => ({ ...prev, toDepartment: newValue }));
        break;

      case "toCustodian":
        setCustodian((prev) => ({ ...prev, selected: newValue }));
        break;
    }
  };

  const handleAddItems = () => {
    if (!assetDetails || !asset.selected) {
      toast.error("Missing asset details or selection");
      return;
    }

    if (
      assetList.some((item: any) => item.assetCode === assetDetails.assetCode)
    ) {
      toast.error("Asset already added to the list");
      return;
    }

    const newItem = {
      assetId: assetDetails?.assetID,
      assetCode: assetDetails?.assetCode,
      assetName: assetDetails?.assetName,
      unit: assetDetails?.unitName,
      department: assetDetails?.departmentName,
      location: assetDetails?.locationName,
      subLocation: assetDetails?.subLocationName,
      assetValue: assetDetails?.getAssetDetailToTransfer?.at(0)?.assetValue,
      fromCustodianId: assetDetails?.fromCustodianId,
      fromCustodianName: assetDetails?.fromCustodianName,
    };

    setAssetList((prev: any) => [...prev, newItem]);

    setAsset((prev: any) => ({
      ...prev,
      filteredData: prev.filteredData.filter(
        (item: any) => item.assetID !== assetDetails.assetID
      ),
      selected: null,
    }));

    setAssetDetails({});
  };

  const handleDeleteItem = (indexToDelete: any) => {
    const removedAsset = assetList[indexToDelete];

    setAssetList((prev: any) =>
      prev.filter((_: any, index: number) => index !== indexToDelete)
    );

    if (removedAsset && removedAsset.id) {
      const assetToRestore = asset.data.find(
        (item: any) => item.assetId === removedAsset.id
      );

      if (assetToRestore) {
        setAsset((prev) => ({
          ...prev,
          filteredData: [...prev.filteredData, assetToRestore],
        }));
      }
    }
  };

  const handleDateChange = (newDate: any) => {
    setTransferDate(newDate);
  };

  const router = useRouter();

  const handleSave = async () => {
    if (
      assetList.length === 0 ||
      !transferType.selected ||
      !unit.selected ||
      !selectedValue.toDepartment ||
      !custodian.selected
    ) {
      return;
    }

    if (isSubmitting()) return;
    startLoading();

    try {
      const body = {
        assetTransferIssueHdrDto: {
          docDate: dayjs(transferDate).format("YYYY-MM-DD"),
          transferType: transferType.selected?.id,
          fromUnitId: userValue.unitId,
          toUnitId: unit.selected?.id,
          fromDepartmentId: selectedValue.department?.id,
          toDepartmentId: selectedValue.toDepartment?.id,
          fromCustodianId: assetList?.[0]?.fromCustodianId,
          fromCustodianName: assetList?.[0]?.fromCustodianName,
          toCustodianId: custodian.selected?.custodianId,
          toCustodianName: custodian.selected?.custodianName,
          status: "pending",
          gatePassNo: gatePass,
          assetTransferIssueDtls:
            assetList.length > 0
              ? assetList.map((item: any) => ({
                  assetId: item?.assetId,
                  assetValue: item?.assetValue,
                }))
              : [],
        },
      };

      console.log("Submitting Asset Transfer:", body);

      const { endpoint, method } = FamConfig.AssetTransfer.AddAssetTransfer;
      const response = await Apirequest(endpoint, method, body, "fam").then(
        (res) => res.data
      );

      const { statusCode, errors, message } = response;

      if (statusCode === 200 || statusCode === 201) {
        await Swal.fire({
          title: "Asset Transfer Receipt updated successfully",
          icon: "success",
          confirmButtonText: "Okay",
          customClass: { title: "custom-title" },
        });

        router.push(`/fam/transfer/asset-transfer`);
      } else {
        toast.error(message);
        if (errors) {
          setErrorMessages(errors);
          setErrorModalOpen(true);
        }
      }
    } catch (err) {
      console.error("Error saving transfer:", err);
    } finally {
      stopLoading();
    }
  };

  const resetForm = () => {
    setSelectedValue({
      department: null,
      category: "",
      assetName: "",
      toUnit: "",
      toDepartment: "",
      toCustodian: "",
    });
    setCategory({ data: [], selected: null });
    setAsset({ data: [], selected: null, filteredData: [] });
    setAssetDetails({});
    setAssetList([]);
    setTransferDate(dayjs(new Date()));
    setTransferType((prev) => ({ ...prev, selected: "" }));
    setUnit((prev) => ({ ...prev, selected: "" }));
    setCustodian((prev) => ({ ...prev, selected: "", data: [] }));
  };

  const handleCancel = () => {
    resetForm();
  };

  useEffect(() => {
    if (userValue.companyId) {
      GetUnitByCompany();
    }
  }, [userValue.companyId]);

  useEffect(() => {
    GetDepartment();
    GetTransferTypes();
    GetByDepartment();
  }, []);

  useEffect(() => {
    if (asset.data.length > 0) {
      const filtered = asset.data.filter(
        (dataAsset: any) =>
          !assetList.some((item: any) => item.id === dataAsset.assetId)
      );
      setAsset((prev) => ({ ...prev, filteredData: filtered }));
    }
  }, [assetList]);

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
          parent={"Transfer"}
          child={"Asset Transfer"}
          subParent="Create Asset Transfer"
          path="/fam/transfer/asset-transfer"
        />
      </Box>
      <Box p={"0 24px 16px"} my={1} bgcolor={"#fff"}>
        <DialogTitle className="highlighted-header" sx={{ pl: 0 }}>
          Asset Transfer
        </DialogTitle>
        <Box mt={3}>
          <Grid2 container spacing={4} pb={2}>
            <Grid2
              size={4}
              display={"flex"}
              justifyContent={"start"}
              alignItems={"center"}
              gap={2}
            >
              <MuiText variant="h6" my={1} className="admin-label-title">
                Date
              </MuiText>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  value={transferDate}
                  onChange={handleDateChange}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      size: "small",
                      placeholder: "",
                      inputProps: {
                        placeholder: "",
                        value: transferDate ? DateFormatter(transferDate) : "",
                        readOnly: true,
                      },
                      sx: {
                        width: 300,
                      },
                    },
                  }}
                  minDate={dayjs(new Date())}
                />
              </LocalizationProvider>
            </Grid2>
            <Grid2
              size={4}
              display={"flex"}
              justifyContent={"start"}
              alignItems={"center"}
              gap={2}
            >
              <MuiText
                variant="h6"
                width={120}
                my={1}
                className="admin-label-title"
              >
                Transfer type
              </MuiText>
              <Autocomplete
                options={transferType.data || []}
                fullWidth
                value={transferType.selected || null}
                getOptionLabel={(option: any) => option.code || ""}
                isOptionEqualToValue={(option: any, value) =>
                  option.id === value.id
                }
                onChange={(event, value) => handleAutocomplete(value, "type")}
                renderInput={(params) => (
                  <MuiInputField
                    {...params}
                    size="small"
                    sx={{ width: 300 }}
                    error={assetList.length > 0 && !transferType.selected}
                    helperText={
                      assetList.length > 0 && !transferType.selected
                        ? "Required"
                        : ""
                    }
                  />
                )}
              />
            </Grid2>
            <Grid2
              size={4}
              display={"flex"}
              justifyContent={"start"}
              alignItems={"center"}
              gap={2}
            >
              <MuiText
                variant="h6"
                width={100}
                my={1}
                className="admin-label-title"
              >
                Gate Pass No
              </MuiText>
              <MuiInputField
                size="small"
                sx={{ width: 300 }}
                value={gatePass}
                onChange={(e) => setGatePass(e.target.value)}
              />
            </Grid2>
          </Grid2>
          <Box
            border={"1px solid #E8E8E8"}
            my={2}
            p={2}
            position={"relative"}
            borderRadius={"8px"}
          >
            <MuiText
              variant="caption"
              position={"absolute"}
              top={-15}
              left={30}
              bgcolor={"#fff"}
              fontSize={17}
              fontWeight={600}
            >
              From Location
            </MuiText>
            <Box
              display={"flex"}
              justifyContent={"space-between"}
              flexWrap={"wrap"}
              gap={4}
              alignItems={"center"}
            >
              <Box>
                <MuiText className="admin-label-title">
                  Department Name{" "}
                </MuiText>
                <Autocomplete
                  options={deptByData || []}
                  sx={{ width: 200 }}
                  value={selectedValue.department}
                  onChange={(event, value) => handleAutocomplete(value, "dept")}
                  getOptionLabel={(option) => option.deptName || ""}
                  isOptionEqualToValue={(option, value) =>
                    option.id === value.id
                  }
                  renderInput={(params) => (
                    <MuiInputField {...params} size="small" />
                  )}
                />
              </Box>
              <Box>
                <MuiText className="admin-label-title">Category Name</MuiText>
                <Autocomplete
                  options={category.data || []}
                  sx={{ width: 200 }}
                  onChange={(event, value) =>
                    handleAutocomplete(value, "category")
                  }
                  value={category.selected}
                  getOptionLabel={(option: any) => option.categoryName || ""}
                  isOptionEqualToValue={(option, value) =>
                    option.id === value.id
                  }
                  renderInput={(params) => (
                    <MuiInputField
                      {...params}
                      size="small"
                      disabled={!selectedValue.department}
                    />
                  )}
                />
              </Box>
              <Box>
                <MuiText className="admin-label-title">Asset Name</MuiText>
                <Autocomplete
                  options={asset.filteredData || []}
                  sx={{ width: 200 }}
                  getOptionLabel={(option: any) => option.assetName || ""}
                  isOptionEqualToValue={(option, value) =>
                    option.assetId === value.assetId
                  }
                  value={asset.selected}
                  onChange={(event, value) =>
                    handleAutocomplete(value, "asset")
                  }
                  renderInput={(params) => (
                    <MuiInputField
                      {...params}
                      size="small"
                      disabled={!category.selected}
                      placeholder={
                        asset.filteredData?.length === 0 && category.selected
                          ? "No available assets"
                          : ""
                      }
                    />
                  )}
                />
              </Box>
              <Box>
                <Box>
                  <MuiText className="admin-label-title">Unit</MuiText>
                  <MuiText variant="h6" className="admin-page-title">
                    {assetDetails?.unitName || "-"}
                  </MuiText>
                </Box>
              </Box>

              <Box>
                <MuiText className="admin-label-title">Department</MuiText>
                <MuiText variant="h6" className="admin-page-title">
                  {assetDetails?.departmentName || "-"}
                </MuiText>
              </Box>
              <Box>
                <MuiText className="admin-label-title">From Custodian</MuiText>
                <MuiText variant="h6" className="admin-page-title">
                  {assetDetails?.fromCustodianName || "-"}
                </MuiText>
              </Box>
              <Box>
                <MuiButton
                  startIcon={<GoPlus />}
                  variant="contained"
                  onClick={handleAddItems}
                  disabled={!asset.selected}
                >
                  Add New
                </MuiButton>
              </Box>
            </Box>
            <Box mt={2}>
              <MuiText variant="caption" fontSize={14}>
                List of Items{" "}
                {assetList.length > 0 ? `(${assetList.length})` : ""}
              </MuiText>
              {Array.isArray(assetList) && assetList.length > 0 ? (
                assetList.map((li, index) => (
                  <Card
                    sx={{
                      p: 2,
                      boxShadow: "none",
                      border: "1px solid #e8e8e8",
                      my: 1,
                    }}
                    key={index}
                  >
                    <Box
                      display={"flex"}
                      justifyContent={"space-between"}
                      flexWrap={"wrap"}
                      gap={4}
                      alignItems={"center"}
                    >
                      <Box
                        display={"flex"}
                        alignItems={"baseline"}
                        justifyContent={"center"}
                      >
                        <MuiText className="admin-label-title">
                          {index + 1}
                        </MuiText>
                      </Box>
                      <Box>
                        {" "}
                        <MuiText className="admin-label-title">
                          {li.assetCode || "-"}
                        </MuiText>
                        <MuiText variant="h6" className="admin-page-title">
                          {li.assetName || "-"}
                        </MuiText>
                      </Box>
                      <Box>
                        <MuiText className="admin-label-title">
                          Unit Name
                        </MuiText>
                        <MuiText variant="h6" className="admin-page-title">
                          {li.unit || "-"}
                        </MuiText>
                      </Box>
                      <Box>
                        <MuiText className="admin-label-title">
                          Department Name
                        </MuiText>
                        <MuiText variant="h6" className="admin-page-title">
                          {li.department || "-"}
                        </MuiText>
                      </Box>
                      <Box>
                        <MuiText className="admin-label-title">
                          Location Name
                        </MuiText>
                        <MuiText variant="h6" className="admin-page-title">
                          {li.location || "-"}
                        </MuiText>
                      </Box>
                      <Box>
                        <MuiText className="admin-label-title">
                          Sub Location Name
                        </MuiText>
                        <MuiText variant="h6" className="admin-page-title">
                          {li.subLocation || "-"}
                        </MuiText>
                      </Box>
                      <Box display={"grid"} sx={{ placeItems: "center" }}>
                        <BsTrash
                          color="red"
                          fontSize={20}
                          onClick={() => handleDeleteItem(index)}
                          style={{ cursor: "pointer" }}
                        />
                      </Box>
                    </Box>
                  </Card>
                ))
              ) : (
                <Box
                  p={2}
                  textAlign="center"
                  sx={{
                    border: "1px dashed #ccc",
                    borderRadius: "4px",
                    color: "#666",
                    my: 2,
                  }}
                >
                  No items added. Please select and add assets from above.
                </Box>
              )}
            </Box>
          </Box>

          <Box
            border={"1px solid #E8E8E8"}
            my={2}
            p={2}
            position={"relative"}
            borderRadius={"8px"}
          >
            <MuiText
              variant="caption"
              position={"absolute"}
              top={-15}
              left={30}
              bgcolor={"#fff"}
              fontSize={17}
              fontWeight={600}
            >
              To Location
            </MuiText>
            <Grid2 container spacing={2} mt={1}>
              <Grid2 size={2}>
                <MuiText className="admin-label-title">To Unit Name</MuiText>
                <Autocomplete
                  options={unit.data || []}
                  fullWidth
                  value={unit.selected || null}
                  onChange={(event, value) =>
                    handleAutocomplete(value, "toUnit")
                  }
                  getOptionLabel={(option: any) => option.unitName || ""}
                  isOptionEqualToValue={(option: any, value: any) =>
                    option.id === value.id
                  }
                  renderInput={(params) => (
                    <MuiInputField
                      {...params}
                      size="small"
                      error={assetList.length > 0 && !unit.selected}
                      helperText={
                        assetList.length > 0 && !unit.selected ? "Required" : ""
                      }
                    />
                  )}
                />
              </Grid2>
              <Grid2 size={2}>
                <MuiText className="admin-label-title">
                  To Department Name
                </MuiText>
                <Autocomplete
                  options={deptData || []}
                  fullWidth
                  value={selectedValue.toDepartment || null}
                  onChange={(event, value) =>
                    handleAutocomplete(value, "toDept")
                  }
                  getOptionLabel={(option: any) => option.deptName || ""}
                  isOptionEqualToValue={(option: any, value: any) =>
                    option.id === value.id
                  }
                  renderInput={(params) => (
                    <MuiInputField
                      {...params}
                      size="small"
                      error={
                        assetList.length > 0 && !selectedValue.toDepartment
                      }
                      helperText={
                        assetList.length > 0 && !selectedValue.toDepartment
                          ? "Required"
                          : ""
                      }
                    />
                  )}
                />
              </Grid2>
              <Grid2 size={3}>
                <MuiText className="admin-label-title">
                  To Custodian Name
                </MuiText>
                <Autocomplete
                  options={custodian.data || []}
                  fullWidth
                  value={custodian.selected || null}
                  onChange={(event, value) =>
                    handleAutocomplete(value, "toCustodian")
                  }
                  getOptionLabel={(option: any) =>
                    option
                      ? `${option.custodianName || ""} - ${
                          option?.custodianId || ""
                        }`
                      : ""
                  }
                  isOptionEqualToValue={(option: any, value: any) =>
                    option.id === value.id
                  }
                  renderInput={(params) => (
                    <MuiInputField
                      {...params}
                      size="small"
                      error={assetList.length > 0 && !custodian.selected}
                      helperText={
                        assetList.length > 0 && !custodian.selected
                          ? "Required"
                          : ""
                      }
                      disabled={!unit.selected}
                    />
                  )}
                />
              </Grid2>

              <Grid2
                size={5}
                display={"flex"}
                justifyContent={"end"}
                alignItems={"center"}
              >
                <Box display={"flex"} gap={2} mt={3}>
                  <MuiButton
                    className="dialog-cancel-btn"
                    variant="outlined"
                    onClick={handleCancel}
                  >
                    Clear
                  </MuiButton>
                  <MuiButton
                    variant="contained"
                    onClick={handleSave}
                    disabled={
                      assetList.length === 0 ||
                      !transferType.selected ||
                      !unit.selected ||
                      !selectedValue.toDepartment ||
                      !custodian.selected ||
                      isSubmitting()
                    }
                  >
                    Save
                  </MuiButton>
                </Box>
              </Grid2>
            </Grid2>
          </Box>
        </Box>
      </Box>
      <ErrorModal
        open={errorModalOpen}
        onClose={() => setErrorModalOpen(false)}
        errors={errorMessages}
      />
    </Box>
  );
}
