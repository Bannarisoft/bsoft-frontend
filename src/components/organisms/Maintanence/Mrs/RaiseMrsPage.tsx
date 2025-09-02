import {
  Box,
  CircularProgress,
  DialogTitle,
  Grid2,
  Typography,
} from "@mui/material";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import IconBreadcrumbs from "../../../molecules/AdminLayout/BreadCrumbs";
import { MuiInputField, MuiText } from "bsoft-base-elements";
import {
  Apirequest,
  isSubmitting,
  startLoading,
  stopLoading,
  StyledAutocomplete,
  StyledButton,
} from "../../../../utils/lib";
import dayjs from "dayjs";
import { useRecoilValue } from "recoil";
import { UserData } from "../../../../utils/atoms";
import { useDataFetchHook } from "../../../../hooks/useDataFetchHook";
import ConfigMain from "../../../../utils/main.api.json";
import { SpareRow } from "../../../../types/maintanenceTypes";
import MrsItems from "./MrsItems";
import Swal from "sweetalert2";
import CreateGif from "../../../../../public/assets/images/create-animation.gif";
import Image from "next/image";
import ErrorModal from "../../../molecules/Master/Role/ErrorModal";
import toast from "react-hot-toast";

const INITIAL_ROW: Omit<SpareRow, "id"> = {
  type: null,
  item: null,
  requiredQty: 0,
  itemOptions: [],
  isLoading: false,
  pending: 0,
  availableQty: 0,
  stockValue: 0,
  rate: 0,
  category: null,
  subCostCenter: null,
  machine: null,
};

const INITIAL_SELECTED_VALUES = {
  maintanenceType: null,
  department: null,
  subDepartment: null,
  category: null,
  subCostCenter: null,
  machine: null,
  workOrder: null,
  remarks: "",
};

function RaiseMrsPage() {
  const userData = useRecoilValue(UserData);

  // State management
  const [rows, setRows] = useState<SpareRow[]>([
    { ...INITIAL_ROW, id: Date.now() },
  ]);
  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [errorMessages, setErrorMessages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [stockLoading, setStockLoading] = useState(false);
  const [selectedValues, setSelectedValues] = useState<any>(
    INITIAL_SELECTED_VALUES
  );

  // Memoized unit ID to prevent unnecessary re-renders
  const oldUnitId = useMemo(
    () => (userData.oldUnitId ? userData.oldUnitId.toString() : ""),
    [userData.oldUnitId]
  );

  // Data fetching hooks with memoized endpoints
  const maintenanceTypeEndpoint = useMemo(
    () => ConfigMain.MRS.Mrs.endpoint.replace("{type}", "maintenancetype"),
    []
  );

  const departmentEndpoint = useMemo(
    () => ConfigMain.MRS.department.endpoint.replace("{oldUnit}", oldUnitId),
    [oldUnitId]
  );

  const subDepartmentEndpoint = useMemo(
    () => ConfigMain.MRS.subDepartment.endpoint.replace("{oldUnit}", oldUnitId),
    [oldUnitId]
  );

  const categoryEndpoint = useMemo(
    () => ConfigMain.MRS.category.endpoint.replace("{oldUnit}", oldUnitId),
    [oldUnitId]
  );

  const subCostCenterEndpoint = useMemo(
    () => ConfigMain.MRS.subCostCenter.endpoint.replace("{oldUnit}", oldUnitId),
    [oldUnitId]
  );

  const storeTypeEndpoint = useMemo(
    () =>
      ConfigMain.WorkOrder.Activity.ItemGroup.endpoint.replace(
        "{oldUnit}",
        oldUnitId
      ),
    [oldUnitId]
  );

  // Data hooks
  const { data: maintenanceTypeData, loading: maintenanceTypeLoading } =
    useDataFetchHook(
      maintenanceTypeEndpoint,
      ConfigMain.MRS.Mrs.method,
      "main"
    );

  const { data: departmentData, loading: departmentLoading } = useDataFetchHook(
    departmentEndpoint,
    ConfigMain.MRS.department.method,
    "main"
  );

  const { data: subDepartmentData, loading: subDepartmentLoading } =
    useDataFetchHook(
      subDepartmentEndpoint,
      ConfigMain.MRS.subDepartment.method,
      "main"
    );

  const { data: categoryData } = useDataFetchHook(
    categoryEndpoint,
    ConfigMain.MRS.category.method,
    "main"
  );

  const { data: subCostCenterData } = useDataFetchHook(
    subCostCenterEndpoint,
    ConfigMain.MRS.subCostCenter.method,
    "main"
  );

  const { data: machineData } = useDataFetchHook(
    ConfigMain.Machine.GetByMachinName.endpoint,
    ConfigMain.Machine.GetByMachinName.method,
    "main"
  );

  const { data: workOrderData, loading: workOrderLoading } = useDataFetchHook(
    ConfigMain.MRS.workOrder.endpoint,
    ConfigMain.MRS.workOrder.method,
    "main"
  );

  const { data: storeTypeData } = useDataFetchHook(
    storeTypeEndpoint,
    ConfigMain.WorkOrder.Activity.ItemGroup.method,
    "main"
  );

  const GetStock = useCallback(
    async (itemCode: number | string, id: number) => {
      setStockLoading(true);
      if (!itemCode || !oldUnitId) {
        setRows((prevRows) =>
          prevRows.map((row) =>
            row.id === id
              ? {
                  ...row,
                  item: null,
                  requiredQty: 0,
                  itemOptions: [],
                  isLoading: false,
                  pending: 0,
                  availableQty: 0,
                  stockValue: 0,
                  rate: 0,
                }
              : row
          )
        );
        return;
      }

      try {
        setRows((prevRows) =>
          prevRows.map((row) =>
            row.id === id ? { ...row, isLoading: true } : row
          )
        );

        const { endpoint, method } = ConfigMain.MRS.MainStoreStock;
        const response = await Apirequest(
          endpoint
            .replace("{oldUnit}", oldUnitId)
            .replace("{grpcode}", itemCode.toString()),
          method,
          null,
          "main"
        );

        if (response?.data?.statusCode === 200) {
          setStockLoading(false);
          setRows((prevRows) =>
            prevRows.map((row) =>
              row.id === id
                ? {
                    ...row,
                    itemOptions: response.data.data || [],
                    availableQty: response.data.data?.stockQty || 0,
                    isLoading: false,
                  }
                : row
            )
          );
        } else {
          throw new Error(
            response?.data?.message || "Failed to fetch stock data"
          );
          setStockLoading(false);
        }
      } catch (err) {
        console.error("Error fetching stock data:", err);
        setStockLoading(false);
        setRows((prevRows) =>
          prevRows.map((row) =>
            row.id === id
              ? { ...row, isLoading: false, itemOptions: [], availableQty: 0 }
              : row
          )
        );
        toast.error("Failed to fetch stock data");
      }
    },
    [oldUnitId]
  );

  const GetQuantity = useCallback(
    async (itemCode: number | string, id: number) => {
      if (!itemCode || !oldUnitId) return;

      try {
        const { endpoint, method } = ConfigMain.MRS.QuantityAvailable;
        const response = await Apirequest(
          endpoint
            .replace("{oldUnit}", oldUnitId)
            .replace("{itemCode}", itemCode.toString()),
          method,
          null,
          "main"
        );

        if (response?.data?.statusCode === 200 && response.data.data) {
          setRows((prevRows) =>
            prevRows.map((row) =>
              row.id === id
                ? {
                    ...row,
                    availableQty: response.data.data.stockQty || 0,
                    stockValue: response.data.data.stockValue || 0,
                    rate: response.data.data.rate || 0,
                  }
                : row
            )
          );
        }
      } catch (err) {
        console.error("Error fetching quantity data:", err);
        toast.error("Failed to fetch quantity data");
      }
    },
    [oldUnitId]
  );

  const GetPending = useCallback(
    async (itemCode: number | string, id: number) => {
      if (!itemCode || !oldUnitId) return;

      try {
        const { endpoint, method } = ConfigMain.MRS.PendingQty;
        const response = await Apirequest(
          endpoint
            .replace("{oldUnit}", oldUnitId)
            .replace("{itemCode}", itemCode.toString()),
          method,
          null,
          "main"
        );

        if (response?.data?.statusCode === 200 && response.data.data) {
          setRows((prevRows) =>
            prevRows.map((row) =>
              row.id === id
                ? {
                    ...row,
                    pending: response.data.data.pendingQty || 0,
                  }
                : row
            )
          );
        }
      } catch (err) {
        console.error("Error fetching pending quantity:", err);
        toast.error("Failed to fetch pending quantity");
      }
    },
    [oldUnitId]
  );

  const handleAddRow = useCallback(() => {
    setRows((prevRows) => [...prevRows, { ...INITIAL_ROW, id: Date.now() }]);
  }, []);

  const handleDeleteRow = useCallback((id: number) => {
    setRows((prevRows) => {
      if (prevRows.length <= 1) {
        toast.error("At least one row is required");
        return prevRows;
      }
      return prevRows.filter((row) => row.id !== id);
    });
  }, []);

  const handleInputChange = useCallback(
    (id: number, field: keyof SpareRow, value: any) => {
      setRows((prevRows) =>
        prevRows.map((row) => {
          if (row.id !== id) return row;

          let updatedRow = { ...row, [field]: value };

          if (field === "type") {
            updatedRow = {
              ...updatedRow,
              item: null,
              requiredQty: 0,
              itemOptions: [],
              isLoading: false,
              pending: 0,
              availableQty: 0,
              stockValue: 0,
              rate: 0,
            };

            if (value?.groupCode) {
              GetStock(value.groupCode, id);
            }
          }

          if (field === "item" && value?.itemCode) {
            GetQuantity(value.itemCode, id);
            GetPending(value.itemCode, id);
          }

          if (field === "item" && !value) {
            updatedRow = {
              ...updatedRow,
              requiredQty: 0,
              pending: 0,
              availableQty: 0,
              stockValue: 0,
              rate: 0,
            };
          }

          return updatedRow;
        })
      );
    },
    [GetStock, GetQuantity, GetPending]
  );

  const handleItemValueChange = useCallback((field: string, value: any) => {
    setSelectedValues((prev: any) => ({
      ...prev,
      [field]: value,
    }));

    if (field === "department") {
      setSelectedValues((prev: any) => ({
        ...prev,
        subDepartment: null,
      }));
    }
  }, []);

  const validateForm = useCallback(() => {
    const requiredFields = [
      { key: "maintanenceType", label: "Maintenance Type" },
      { key: "department", label: "Department" },
      { key: "subDepartment", label: "Sub Department" },
    ];

    for (const field of requiredFields) {
      if (!selectedValues[field.key]) {
        toast.error(`Please select ${field.label}`);
        return false;
      }
    }

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNumber = i + 1;

      if (!row.type) {
        toast.error(`Please select Item Group for row ${rowNumber}`);
        return false;
      }
      if (!row.item) {
        toast.error(`Please select Item for row ${rowNumber}`);
        return false;
      }
      if (!row.requiredQty || row.requiredQty <= 0) {
        toast.error(
          `Required Quantity must be greater than 0 for row ${rowNumber}`
        );
        return false;
      }
      if (row.requiredQty > (row.availableQty || 0)) {
        toast.error(
          `Required quantity exceeds available stock for row ${rowNumber}`
        );
        return false;
      }
    }

    return true;
  }, [selectedValues, rows]);

  const resetForm = useCallback(() => {
    setRows([{ ...INITIAL_ROW, id: Date.now() }]);
    setSelectedValues(INITIAL_SELECTED_VALUES);
  }, []);

  const CreateMrs = useCallback(async () => {
    if (!validateForm()) {
      toast.error("Please fill all required fields.");
      return;
    }
    if (isSubmitting()) return;

    startLoading();
    setLoading(true);

    try {
      const body = {
        divcode: oldUnitId,
        irDate: dayjs(new Date()).toISOString(),
        depcode: selectedValues.department?.depcode || "",
        subDepcode: selectedValues.subDepartment?.subdeptcd || "",
        refno: selectedValues.workOrder?.id
          ? String(selectedValues.workOrder.id)
          : "",
        maintenanceType: String(selectedValues.maintanenceType?.id) || "",
        remarks: selectedValues.remarks?.trim() || "",
        details: rows.map((row) => ({
          itemCode: row.item?.itemCode || "",
          macno: row?.machine?.id ? String(row.machine.id) : "",
          qtyReqd: Number(row.requiredQty) || 0,
          catCode: row.category?.catcode || "",
          ccCode: row.subCostCenter?.scccode || "",
          currStk: row?.availableQty || 0,
          rate: row.rate || 0,
        })),
      };

      const response = await Apirequest(
        ConfigMain.MRS.CreateMrs.endpoint,
        ConfigMain.MRS.CreateMrs.method,
        body,
        "main"
      );

      if (
        response?.data?.statusCode === 200 ||
        response?.data?.statusCode === 201
      ) {
        await Swal.fire({
          title: response.data.message || "MRS created successfully",
          icon: "success",
          confirmButtonText: "OK",
        });
        resetForm();
      } else {
        if (response?.data?.errors?.length > 0) {
          setErrorMessages(response.data.errors);
          setErrorModalOpen(true);
        }
        toast.error(
          response?.data?.message || "Failed to create MRS. Please try again."
        );
      }
    } catch (err) {
      console.error("Error creating MRS:", err);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
      stopLoading();
    }
  }, [validateForm, isSubmitting, oldUnitId, selectedValues, rows, resetForm]);

  const handleCloseErrorModal = useCallback(() => {
    setErrorModalOpen(false);
    setErrorMessages([]);
  }, []);

  useEffect(() => {
    if (Array.isArray(subDepartmentData) && subDepartmentData.length === 1) {
      setSelectedValues((prev: any) => ({
        ...prev,
        subDepartment: subDepartmentData?.at(0),
      }));
    }
  }, [subDepartmentData]);

  return (
    <Box
      component={"div"}
      sx={{
        opacity: stockLoading ? 0.5 : 1,
        pointerEvents: stockLoading ? "none" : "auto",
      }}
      position={"relative"}
    >
      {stockLoading && (
        <Box position={"absolute"} top={"45%"} left={"45%"} zIndex={3}>
          <CircularProgress />
        </Box>
      )}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        flexWrap="wrap"
        gap={2}
        my={1}
      >
        <Box>
          <IconBreadcrumbs parent="Schedule" child="MRS" path="" />
        </Box>
      </Box>

      <Box bgcolor="#fff" px={2} pt={0} pb={1}>
        <DialogTitle
          className="highlighted-header"
          sx={{ pl: 0, pb: 1, pt: "6px" }}
        >
          MRS
        </DialogTitle>

        <Grid2 container spacing={2} mt={2}>
          <Grid2 size={{ xs: 12, sm: 12, md: 4 }}>
            <MuiText className="admin-label-title" mb={0.5}>
              Unit Name
            </MuiText>
            <MuiInputField
              size="small"
              value={userData?.unitName || ""}
              sx={{ "& fieldset": { borderRadius: "8px" } }}
              variant="outlined"
              fullWidth
              disabled
            />
          </Grid2>

          <Grid2 size={{ xs: 12, sm: 12, md: 4 }}>
            <MuiText className="admin-label-title" mb={0.5}>
              Maintenance Type
            </MuiText>
            <StyledAutocomplete
              options={maintenanceTypeData || []}
              id="maintenance-type-autocomplete"
              fullWidth
              size="small"
              loading={maintenanceTypeLoading}
              value={selectedValues.maintanenceType}
              onChange={(event, value) =>
                handleItemValueChange("maintanenceType", value)
              }
              getOptionLabel={(option: any) =>
                option ? `${option.code} - ${option.description}` : ""
              }
              renderOption={(props, option: any) => (
                <li {...props} key={option?.id}>
                  {`${option.code} - ${option.description}`}
                </li>
              )}
              renderInput={(params) => (
                <MuiInputField
                  {...params}
                  name="maintenanceTypeId"
                  placeholder="Select Type"
                />
              )}
            />
          </Grid2>

          <Grid2 size={{ xs: 12, sm: 12, md: 4 }}>
            <MuiText className="admin-label-title" mb={0.5}>
              Department Name
            </MuiText>
            <StyledAutocomplete
              options={departmentData || []}
              id="department-autocomplete"
              fullWidth
              size="small"
              loading={departmentLoading}
              value={selectedValues.department}
              onChange={(event, value) =>
                handleItemValueChange("department", value)
              }
              getOptionLabel={(option: any) => option?.depname || ""}
              renderOption={(props, option: any) => (
                <li {...props} key={option?.id}>
                  {option?.depname}
                </li>
              )}
              renderInput={(params) => (
                <MuiInputField
                  {...params}
                  name="department"
                  placeholder="Select Department"
                />
              )}
            />
          </Grid2>
        </Grid2>

        <Grid2 container spacing={2} mt={2}>
          <Grid2 size={{ xs: 12, sm: 12, md: 4 }}>
            <MuiText className="admin-label-title" mb={0.5}>
              Sub Department Name
            </MuiText>
            <StyledAutocomplete
              options={subDepartmentData || []}
              id="sub-department-autocomplete"
              fullWidth
              size="small"
              loading={subDepartmentLoading}
              value={selectedValues.subDepartment}
              onChange={(event, value) =>
                handleItemValueChange("subDepartment", value)
              }
              getOptionLabel={(option: any) => option?.subdeptdesc || ""}
              renderOption={(props, option: any) => (
                <li {...props} key={option?.id}>
                  {option?.subdeptdesc}
                </li>
              )}
              renderInput={(params) => (
                <MuiInputField
                  {...params}
                  name="subDepartment"
                  placeholder="Select Sub Department"
                />
              )}
            />
          </Grid2>

          <Grid2 size={{ xs: 12, sm: 12, md: 4 }}>
            <MuiText className="admin-label-title" mb={0.5}>
              Work Order (Optional)
            </MuiText>
            <StyledAutocomplete
              options={workOrderData || []}
              id="work-order-autocomplete"
              fullWidth
              size="small"
              loading={workOrderLoading}
              value={selectedValues.workOrder}
              onChange={(event, value) =>
                handleItemValueChange("workOrder", value)
              }
              getOptionLabel={(option: any) => option?.workOrderDocNo || ""}
              renderOption={(props, option: any) => (
                <li {...props} key={option?.id}>
                  {option?.workOrderDocNo}
                </li>
              )}
              renderInput={(params) => (
                <MuiInputField
                  {...params}
                  name="workOrder"
                  placeholder="Select Work Order"
                />
              )}
            />
          </Grid2>
        </Grid2>

        <Box
          p={2}
          pt={0}
          border="1px solid #cbcbcb"
          bgcolor="#f4f4f4"
          borderRadius="10px"
          mt={2}
        >
          <MrsItems
            rows={rows}
            storeTypeData={storeTypeData}
            handleAddRow={handleAddRow}
            handleDeleteRow={handleDeleteRow}
            handleInputChange={handleInputChange}
            categoryData={categoryData}
            subCostCenterData={subCostCenterData}
            machineData={machineData}
            selectedValues={selectedValues}
            setSelectedValues={setSelectedValues}
          />
        </Box>

        <Grid2 size={{ xs: 12, sm: 12, md: 8 }} mt={2}>
          <MuiText className="admin-label-title" mb={0.5}>
            Remarks
          </MuiText>
          <MuiInputField
            size="small"
            multiline
            rows={4}
            value={selectedValues.remarks}
            onChange={(e) => handleItemValueChange("remarks", e.target.value)}
            sx={{ "& fieldset": { borderRadius: "8px" } }}
            variant="outlined"
            fullWidth
            placeholder="Enter any additional remarks..."
          />
        </Grid2>

        <Box display="flex" justifyContent="flex-end" gap={2} p={3}>
          <StyledButton
            variant="outlined"
            sx={{ borderRadius: 2 }}
            onClick={resetForm}
            disabled={loading}
          >
            Reset
          </StyledButton>
          <StyledButton
            variant="contained"
            sx={{
              borderRadius: 2,
              bgcolor: "#3a8484",
              "&:hover": { bgcolor: "#2d6666" },
            }}
            onClick={CreateMrs}
            disabled={loading || isSubmitting()}
          >
            {loading ? "Saving..." : "Save"}
          </StyledButton>
        </Box>
      </Box>

      {loading && (
        <Box
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(255, 255, 255, 0.8)",
            backdropFilter: "blur(3px)",
            zIndex: 1200,
            transition: "all 0.3s ease-in-out",
          }}
        >
          <Box
            sx={{
              position: "relative",
              width: 400,
              height: 400,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              animation: "pulse 2s infinite ease-in-out",
              "@keyframes pulse": {
                "0%": { transform: "scale(0.95)" },
                "50%": { transform: "scale(1)" },
                "100%": { transform: "scale(0.95)" },
              },
            }}
          >
            <Image src={CreateGif} alt="Loading..." />
            <Typography
              color="#107869"
              sx={{
                mt: 3,
                fontWeight: 600,
                animation: "fadeInOut 1.5s infinite ease-in-out",
                "@keyframes fadeInOut": {
                  "0%": { opacity: 0.6 },
                  "50%": { opacity: 1 },
                  "100%": { opacity: 0.6 },
                },
              }}
            >
              Creating MRS...
            </Typography>
          </Box>
        </Box>
      )}

      <ErrorModal
        open={errorModalOpen}
        onClose={handleCloseErrorModal}
        errors={errorMessages}
      />
    </Box>
  );
}

export default React.memo(RaiseMrsPage);
