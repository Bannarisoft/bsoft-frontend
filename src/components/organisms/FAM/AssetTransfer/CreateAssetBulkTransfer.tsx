import {
  Autocomplete,
  Box,
  Chip,
  DialogTitle,
  Grid2,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import IconBreadcrumbs from "../../../molecules/AdminLayout/BreadCrumbs";
import {
  MuiButton,
  MuiInputField,
  MuiTable,
  MuiText,
} from "bsoft-base-elements";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import SkeletonLoader from "../../../molecules/AdminLayout/SkeletonLoader";
import NoDataFound from "../../../molecules/AdminLayout/NoDataFound";
import { useRecoilValue } from "recoil";
import { UserData } from "../../../../utils/atoms";
import { DataGrid, GridRowSelectionModel } from "@mui/x-data-grid";
import { Apirequest, DateFormatter } from "../../../../utils/lib";
import FamConfig from "../../../../utils/fam.api.json";
import config from "../../../../utils/config.api.json";
import Swal from "sweetalert2";
import ErrorModal from "../../../molecules/Master/Role/ErrorModal";
import toast from "react-hot-toast";

const CreateAssetBulkTransfer = () => {
  const userValue = useRecoilValue(UserData);
  const [loading, setLoading] = useState<boolean>(true);
  const [gatePass, setGatePass] = useState("");
  const [selectedRowIds, setSelectedRowIds] = useState<GridRowSelectionModel>(
    []
  );
  const [errorModalOpen, setErrorModalOpen] = React.useState(false);
  const [errorMessages, setErrorMessages] = React.useState<string[]>([]);
  const [selectedAssets, setSelectedAssets] = useState<any[]>([]);

  const [selectedValue, setSelectedValue] = useState({
    department: null as any,
    custodian: "" as any,
    category: "" as any,
    assetName: "" as any,
    toUnit: "" as any,
    toDepartment: "" as any,
    toCustodian: "" as any,
  });

  const [transferDate, setTransferDate] = useState(dayjs(new Date()));
  const handleDateChange = (newDate: any) => {
    setTransferDate(newDate);
  };

  const columns = [
    {
      field: "s_no",
      headerName: "S.No",
      minWidth: 50,
      flex: 1,
      sortable: true,
      renderCell: (params: any) => {
        return params.api.getAllRowIds().indexOf(params.id) + 1;
      },
    },
    {
      field: "assetCode",
      headerName: "Asset Code",
      flex: 1,
      minWidth: 200,
      valueGetter: (value: any, row: any) =>
        `${row?.assetCode.toUpperCase() || ""}`,
    },
    {
      field: "assetName",
      headerName: "Asset Name",
      flex: 1,
      minWidth: 200,
      valueGetter: (value: any, row: any) => `${row?.assetName || ""}`,
    },
    {
      field: "unitName",
      headerName: "Unit Name",
      flex: 1,
      minWidth: 200,
      valueGetter: (value: any, row: any) => `${row?.unitName || ""}`,
    },
    {
      field: "departmentName",
      headerName: "Department Name",
      flex: 1,
      minWidth: 200,
      valueGetter: (value: any, row: any) => `${row?.departmentName || ""}`,
    },
    {
      field: "locationName",
      headerName: "Location Name",
      flex: 1,
      minWidth: 200,
      valueGetter: (value: any, row: any) => `${row?.locationName || ""}`,
    },
    {
      field: "subLocationName",
      headerName: "Sub Location Name",
      flex: 1,
      minWidth: 200,
      valueGetter: (value: any, row: any) => `${row?.subLocationName || ""}`,
    },
  ];
  const [assetList, setAssetList] = useState<any>([]);
  const [deptData, setDeptData] = useState([]);
  const [deptByData, setDeptByData] = useState([]);

  const [transferType, setTransferType] = useState({
    data: [],
    selected: "" as any,
  });
  const [unit, setUnit] = useState({
    data: [],
    selected: "" as any,
  });
  const [custodian, setCustodian] = useState({
    data: [],
    selected: "" as any,
  });
  const [depByCustodian, setDepByCustodian] = useState({
    data: [],
    selected: "" as any,
  });
  const [category, setCategory] = useState({
    data: [],
    selected: [] as any[],
  });

  const handleAutocomplete = async (newValue: any, field: string) => {
    if (
      field === "type" ||
      field === "dept" ||
      field === "custodian" ||
      field === "category"
    ) {
      if (!newValue && field === "dept") {
        setLoading(true);
        setSelectedValue((prev) => ({ ...prev, department: null }));
        setDepByCustodian((prev) => ({ ...prev, data: [], selected: null }));
        setCategory((prev) => ({ ...prev, data: [], selected: [] }));
        setAssetList([]);
        setLoading(false);
        return;
      }

      if (!newValue && field === "custodian") {
        setLoading(true);
        setSelectedValue((prev) => ({ ...prev, custodian: null }));
        setDepByCustodian((prev) => ({ ...prev, selected: null }));
        setCategory((prev) => ({ ...prev, data: [], selected: [] }));
        setAssetList([]);
        setLoading(false);
        return;
      }
      if (!newValue && field === "category") {
        setLoading(true);
        setCategory((prev) => ({ ...prev, selected: [] }));
        setAssetList([]);
        setLoading(false);
        return;
      }
      if (!newValue && field === "type") {
        setTransferType((prev: any) => ({ ...prev, selected: null }));
        return;
      }
    }

    switch (field) {
      case "type":
        setTransferType((prev) => ({ ...prev, selected: newValue }));
        break;

      case "dept":
        setLoading(true);
        setSelectedValue((prev) => ({ ...prev, department: newValue }));
        GetCustodiansByDepartment(newValue.id);
        setLoading(false);
        break;
      case "custodian":
        setLoading(true);
        setAssetList([]);
        setDepByCustodian((prev) => ({ ...prev, selected: newValue }));
        GetByCustodianDept(newValue?.empcode);
        setLoading(false);
        break;
      case "category":
        if (!newValue || newValue.length === 0) {
          setCategory((prev) => ({ ...prev, selected: [] }));
          setAssetList([]);
          return;
        }
        setCategory((prev) => ({ ...prev, selected: newValue }));
        setTimeout(() => {
          const deptId = selectedValue.department?.id;
          const custodianId = depByCustodian.selected?.empcode;
          const catIds = newValue.map((c: any) => c.categoryID).join(",");

          if (deptId && custodianId && catIds) {
            GetBulkAssetsToTransfer(deptId, custodianId, catIds);
          }
        }, 0);
        break;

      case "toUnit":
        setUnit((prev) => ({ ...prev, selected: newValue }));
        if (newValue?.id) {
          FetchCustodian(userValue.oldUnitId.toString());
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
  const resetForm = () => {
    setSelectedValue({
      department: null,
      custodian: "",
      category: "",
      assetName: "",
      toUnit: "",
      toDepartment: "",
      toCustodian: "",
    });
    setCategory({ data: [], selected: [] });
    setAssetList([]);
    setTransferDate(dayjs(new Date()));
    setTransferType((prev) => ({ ...prev, selected: "" }));
    setUnit((prev) => ({ ...prev, selected: "" }));
    setDepByCustodian((prev) => ({ ...prev, selected: "", data: [] }));
    setCustodian((prev) => ({ ...prev, selected: "", data: [] }));
  };
  const handleCancel = () => {
    resetForm();
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
      setLoading(false);
    } catch (err) {
      console.log(err);
      setDeptByData([]);
    }
  };
  const GetCustodiansByDepartment = async (deptId: string) => {
    if (!deptId) return;

    try {
      const { endpoint, method } =
        FamConfig.AssetTransfer.GetCustodiansByDepartment;

      const url = endpoint
        .replace("{oldUnitId}", userValue.oldUnitId?.toString())
        .replace("{departmentId}", deptId.toString());

      const response = await Apirequest(url, method, null, "fam").then(
        (res) => res.data
      );
      const { data } = response;
      setDepByCustodian({ ...depByCustodian, data: data, selected: null });

      if (
        (response?.statusCode === 200 || response?.statusCode === 201) &&
        Array.isArray(response.data) &&
        response.data.length > 0
      ) {
        console.log("Custodian data:", response.data);
      }
    } catch (err) {
      console.error("Error fetching custodians:", err);
    }
  };
  const GetByCustodianDept = async (custodianId: string) => {
    try {
      const { endpoint, method } =
        FamConfig.AssetTransfer.GetCustodiansByCategory;

      const deptId = selectedValue.department?.id;
      if (!deptId || !custodianId) return;

      const result = await Apirequest(
        endpoint
          .replace("{departmentId}", deptId.toString())
          .replace("{custodianId}", custodianId.toString()?.trim()),
        method,
        null,
        "fam"
      ).then((res) => res.data);

      const fetchedAssets = result?.data || [];
      setCategory({
        ...category,
        data: fetchedAssets,
        selected: [],
      });
    } catch (err) {
      console.error("Error fetching assets:", err);
    }
  };
  const GetBulkAssetsToTransfer = async (
    deptId: number,
    custodianId: string,
    catIds: string
  ) => {
    try {
      setLoading(true);
      const { endpoint, method } =
        FamConfig.AssetTransfer.GetBulkAssetToTransfer;

      const finalEndpoint = endpoint
        .replace("{departmentId}", deptId.toString())
        .replace("{custodianId}", custodianId.trim())
        .replace("{categoryId}", catIds);

      const result = await Apirequest(finalEndpoint, method, null, "fam");

      const assets = result?.data?.data || [];
      const formattedAssets = assets.map((item: any) => ({
        id: item.assetID,
        ...item,
      }));

      setAssetList(formattedAssets);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching bulk assets:", err);
      setLoading(false);
    }
  };
  const handleSave = async () => {
    try {
      setLoading(true);
      const body = {
        assetTransferIssueHdrDto: {
          docDate: dayjs(transferDate).format("YYYY-MM-DD"),
          transferType: transferType.selected?.id,
          fromUnitId: userValue.unitId,
          toUnitId: unit.selected?.id,
          fromDepartmentId: selectedValue.department?.id,
          toDepartmentId: selectedValue.toDepartment?.id,
          fromCustodianId: selectedAssets?.[0]?.fromCustodianId,
          fromCustodianName: selectedAssets?.[0]?.fromCustodianName,
          toCustodianId: custodian.selected?.custodianId,
          toCustodianName: custodian.selected?.custodianName,
          status: "pending",
          gatePassNo: gatePass,
          assetTransferIssueDtls: selectedAssets.map((item) => ({
            assetId: item.assetID,
            assetValue: item.getAssetDetailToTransfer?.[0]?.assetValue || 0,
          })),
        },
      };

      console.log("Final Payload:", body);

      const { endpoint, method } = FamConfig.AssetTransfer.AddAssetTransfer;
      const response = await Apirequest(endpoint, method, body, "fam").then(
        (res) => res.data
      );

      const { statusCode } = response;
      if (statusCode === 200 || statusCode === 201) {
        Swal.fire({
          title: "Asset Bulk Transfer Receipt updated successfully",
          icon: "success",
          confirmButtonText: "Okay",
          customClass: {
            title: "custom-title",
          },
        }).then(() => {
          setSelectedRowIds([]);
          setSelectedAssets([]);
          setAssetList([]);
          resetForm();
          setLoading(false);
        });
      } else {
        toast.error(response.message);
        setErrorMessages(response.errors);
        setErrorModalOpen(true);
      }
    } catch (err) {
      console.error("Error saving transfer:", err);
      toast.error("API error while saving transfer");
    }
  };
  useEffect(() => {
    if (userValue.companyId) {
      GetUnitByCompany();
    }
  }, [userValue.companyId]);

  useEffect(() => {
    GetTransferTypes();
    GetDepartment();
    GetByDepartment();
  }, []);

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
          child={"Create Asset Bulk Transfer"}
          path="/"
        />
      </Box>
      <Box p={"0 24px 16px"} my={1} bgcolor={"#fff"}>
        <DialogTitle className="highlighted-header" sx={{ pl: 0 }}>
          Asset Bulk Transfer
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
            border="1px solid #E8E8E8"
            borderRadius="8px"
            my={2}
            overflow="hidden"
          >
            <Typography
              sx={{
                bgcolor: "#3a8484",
                color: "#fff",
                px: 2,
                py: 1,
                fontSize: 16,
                fontWeight: 600,
                fontFamily: "poppins",
                borderBottom: "1px solid #ccc",
              }}
            >
              From Location
            </Typography>
            <Box>
              <Box
                display={"flex"}
                justifyContent={"space-around"}
                flexWrap={"wrap"}
                p={2}
                alignItems={"center"}
              >
                <Box>
                  <MuiText className="admin-label-title">
                    Department Name
                  </MuiText>
                  <Autocomplete
                    options={deptByData || []}
                    sx={{ width: 300 }}
                    value={selectedValue.department}
                    onChange={(event, value) =>
                      handleAutocomplete(value, "dept")
                    }
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
                  <MuiText className="admin-label-title">
                    Custodian Name
                  </MuiText>
                  <Autocomplete
                    options={depByCustodian.data || []}
                    sx={{ width: 300 }}
                    onChange={(event, value) =>
                      handleAutocomplete(value, "custodian")
                    }
                    value={depByCustodian.selected}
                    getOptionLabel={(option: any) => option.empname || ""}
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
                  <MuiText className="admin-label-title">Category Name</MuiText>
                  <Autocomplete
                    multiple
                    options={category.data || []}
                    sx={{ width: 300 }}
                    onChange={(event, value) =>
                      handleAutocomplete(value, "category")
                    }
                    value={category.selected || []}
                    getOptionLabel={(option: any) => option.categoryName || ""}
                    isOptionEqualToValue={(option, value) =>
                      option.categoryID === value.categoryID
                    }
                    renderTags={(value: any[], getTagProps) =>
                      value.map((option, index) => (
                        <Chip
                          label={option.categoryName}
                          size="small"
                          {...getTagProps({ index })}
                        />
                      ))
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
              </Box>

              <Box sx={{ px: 5, my: 2, height: 500 }} className="main-table">
                {loading ? (
                  <SkeletonLoader />
                ) : (
                  <DataGrid
                    rows={assetList}
                    columns={columns}
                    initialState={{
                      pagination: {
                        paginationModel: {
                          pageSize: 20,
                        },
                      },
                    }}
                    slots={{
                      noRowsOverlay: () => <NoDataFound />,
                    }}
                    pageSizeOptions={[5]}
                    checkboxSelection
                    getRowId={(row) => row.id}
                    onRowSelectionModelChange={(selectedIds) => {
                      const selectedData = assetList.filter((row: any) =>
                        selectedIds.includes(row.id)
                      );
                      setSelectedRowIds(selectedIds);
                      setSelectedAssets(selectedData);
                    }}
                    sx={{
                      cursor: "pointer",
                      "& .MuiDataGrid-columnHeaders": {
                        backgroundColor: "#455a64",
                        color: "#fff",
                        fontWeight: "bold",
                      },
                      "& .MuiDataGrid-columnHeaderCheckbox": {
                        backgroundColor: "#455a64",
                        color: "#fff",
                      },
                      "& .MuiDataGrid-columnHeaderTitleContainer": {
                        color: "#fff",
                      },
                    }}
                  />
                )}
              </Box>
            </Box>
          </Box>

          <Box
            border="1px solid #E8E8E8"
            borderRadius="8px"
            my={2}
            overflow="hidden"
          >
            <Typography
              sx={{
                bgcolor: "#3a8484",
                color: "#fff",
                px: 2,
                py: 1,
                fontSize: 16,
                fontWeight: 600,
                fontFamily: "poppins",
                borderBottom: "1px solid #ccc",
              }}
            >
              To Location
            </Typography>
            <Grid2 container spacing={2} p={3}>
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
              <Grid2 size={2}>
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
                size={6}
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
                      selectedRowIds.length === 0 ||
                      !transferType.selected ||
                      !unit.selected ||
                      !selectedValue.toDepartment ||
                      !custodian.selected
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
};

export default CreateAssetBulkTransfer;
