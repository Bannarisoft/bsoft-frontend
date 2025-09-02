"use client";

import {
  Box,
  CircularProgress,
  DialogTitle,
  Grid2,
  Tab,
  Tabs,
  TextField,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import IconBreadcrumbs from "../../../molecules/AdminLayout/BreadCrumbs";
import { MuiText } from "bsoft-base-elements";
import { TabContext, TabPanel } from "@mui/lab";
import { SpareRow } from "../../../../types/maintanenceTypes";
import MainConfig from "../../../../utils/main.api.json";
import Config from "../../../../utils/config.api.json";
import {
  Apirequest,
  isSubmitting,
  startLoading,
  stopLoading,
  StyledAutocomplete,
  StyledButton,
} from "../../../../utils/lib";
import { useRecoilValue } from "recoil";
import { UserData } from "../../../../utils/atoms";
import { useDataFetchHook } from "../../../../hooks/useDataFetchHook";
import ScheduleItems from "./ScheduleItems";
import MainScheduler from "./MainScheduler";
import dayjs, { Dayjs } from "dayjs";
import Swal from "sweetalert2";
import ErrorModal from "../../../molecules/Master/Role/ErrorModal";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useLoadingHook } from "../../../../hooks/useLoadingHook";

function CreateSchedulePage({ sheduleId }: { sheduleId?: string }) {
  const { withLoader, isLoading } = useLoadingHook<number>();

  const [formData, setFormData] = useState({
    frequencyType: "" as any,
    period: "",
    periodType: "" as any,
    graceDays: "",
    workOrder: "",
    materialRequest: "",
    effectiveDate: null as Dayjs | null,
    isDowntimeRequired: false,
    downtimeEstimate: "",
  });

  const [errors, setErrors] = useState({
    frequencyType: false,
    period: false,
    periodType: false,
    effectiveDate: false,
  });

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (errors[field as keyof typeof errors]) {
      setErrors((prev) => ({
        ...prev,
        [field]: false,
      }));
    }
  };

  const validate = () => {
    const newErrors = {
      frequencyType: !formData.frequencyType || formData.frequencyType === "",
      period: !formData.period || formData.period.trim() === "",
      periodType: !formData.periodType || formData.periodType === "",
      effectiveDate: !formData.effectiveDate,
    };

    setErrors(newErrors);
    return !Object.values(newErrors).some((error) => error);
  };
  const router = useRouter();
  const [scheduleName, setScheduleName] = React.useState("");
  const [value, setValue] = React.useState(0);
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };
  const userValue = useRecoilValue(UserData);
  const [rows, setRows] = useState<SpareRow[]>([
    {
      id: Date.now(),
      type: null,
      item: null,
      requiredQty: 0,
      itemOptions: [],
      isLoading: false,
      uom: "",
    },
  ]);
  const [selectedActivities, setSelectedActivities] = useState<any[]>([]);
  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [errorMessages, setErrorMessages] = useState<string[]>([]);
  const [activityMasterData, setActivityMasterData] = useState<string[]>([]);
  const [selectedValues, setSelectedValues] = useState<any>({
    selectedMachineGroup: null,
    selectedDepartment: null,
    selectedCategory: null,
  });
  const [stockLoading, setStockLoading] = useState(false);

  const handleActivityChange = (event: any, newValues: any) => {
    setSelectedActivities(newValues);
  };

  const handleAddRow = () => {
    setRows((prevRows) => [
      ...prevRows,
      {
        id: Date.now(),
        type: null,
        item: null,
        requiredQty: 0,
        itemOptions: [],
        isLoading: false,
        uom: "",
      },
    ]);
  };

  const handleDeleteRow = (id: number) => {
    setRows((prevRows) => prevRows.filter((row) => row.id !== id));
  };

  const handleInputChange = (id: number, field: keyof SpareRow, value: any) => {
    const safeValue =
      typeof value === "object" && value !== null
        ? Array.isArray(value)
          ? [...value]
          : { ...value }
        : value;

    if (field === "type") {
      setRows((prevRows) =>
        prevRows.map((row) =>
          row.id === id
            ? {
                ...row,
                type: safeValue,
                item: null,
                itemOptions: [],
                isLoading: true,
                uom: "",
              }
            : row
        )
      );
      if (safeValue?.groupCode) {
        GetStock(safeValue.groupCode, id);
      }
    } else if (field === "item") {
      setRows((prevRows) =>
        prevRows.map((row) =>
          row.id === id
            ? {
                ...row,
                item: safeValue,
                uom: safeValue?.uom || "",
              }
            : row
        )
      );
    } else {
      setRows((prevRows) =>
        prevRows.map((row) =>
          row.id === id ? { ...row, [field]: safeValue } : row
        )
      );
    }
  };

  const GetStock = async (groupCode: string, id: number) => {
    setStockLoading(true);
    if (!groupCode?.trim()) {
      setRows((prevRows) =>
        prevRows.map((row) =>
          row.id === id ? { ...row, itemOptions: [], isLoading: false } : row
        )
      );
      return;
    }

    try {
      const items = await fetchItemsForGroup(groupCode);
      setRows((prevRows) =>
        prevRows.map((row) =>
          row.id === id
            ? { ...row, itemOptions: items || [], isLoading: false }
            : row
        )
      );
      setStockLoading(false);
    } catch (err) {
      setRows((prevRows) =>
        prevRows.map((row) =>
          row.id === id ? { ...row, isLoading: false } : row
        )
      );
      setStockLoading(false);
      toast.error("Failed to fetch items for the selected group");
    }
  };

  const { data: storeTypeData } = useDataFetchHook(
    MainConfig.WorkOrder.Activity.ItemGroup.endpoint.replace(
      "{oldUnit}",
      userValue.oldUnitId ? userValue.oldUnitId.toString() : ""
    ),
    MainConfig.WorkOrder.Activity.ItemGroup.method,
    "main"
  );

  const { data: machineGroupData } = useDataFetchHook(
    MainConfig.Machine.MachineGroupByName.endpoint,
    MainConfig.Machine.MachineGroupByName.method,
    "main"
  );

  const { data: maintanenceTypeData } = useDataFetchHook(
    MainConfig.MaintenanceRequest.ScheduleMisc.endpoint.replace(
      "{type}",
      "Preventive_type"
    ),
    MainConfig.MaintenanceRequest.ScheduleMisc.method,
    "main"
  );

  const { data: frequencyTypeData } = useDataFetchHook(
    MainConfig.WorkOrder.Schedule.ScheduleMisc.endpoint.replace(
      "{type}",
      "frequency_type"
    ),
    MainConfig.WorkOrder.Schedule.ScheduleMisc.method,
    "main"
  );

  const { data: periodTypeData } = useDataFetchHook(
    MainConfig.WorkOrder.Schedule.ScheduleMisc.endpoint.replace(
      "{type}",
      "frequency_unit"
    ),
    MainConfig.WorkOrder.Schedule.ScheduleMisc.method,
    "main"
  );

  const { data: departmentData } = useDataFetchHook(
    Config.Department.getGroupName.endpoint.replace("{name}", "maintenance"),
    Config.Department.getGroupName.method
  );

  const handleSave = async () => {
    if (isSubmitting()) return;

    const isFormValid = validateForm();
    if (!isFormValid) {
      toast.error("Please fill all required fields.");
      return;
    }

    try {
      startLoading();
      await CreateSchedule();
    } catch (error) {
      console.error("Error creating schedule:", error);
    } finally {
      stopLoading();
    }
  };

  const validateForm = () => {
    const isScheduleValid = validate();

    const selectionErrors = [];
    if (scheduleName === "") selectionErrors.push("Schedule Name");
    if (!selectedValues.selectedMachineGroup)
      selectionErrors.push("Machine Group");
    if (!selectedValues.selectedDepartment) selectionErrors.push("Department");
    if (!selectedValues.selectedCategory)
      selectionErrors.push("Maintenance Category");

    if (selectionErrors.length > 0) {
      toast.error(`Please select: ${selectionErrors.join(", ")}`);
      return false;
    }

    if (selectedActivities.length === 0) {
      toast.error("Please select at least one activity");
      return false;
    }

    const hasItemData = rows.some(
      (row) => row.type || row.item || (row.requiredQty && row.requiredQty > 0)
    );

    if (hasItemData) {
      const invalidRows = rows.filter(
        (row) =>
          !row.type ||
          !row.item ||
          row.requiredQty === undefined ||
          row.requiredQty <= 0
      );

      if (invalidRows.length > 0) {
        toast.error(
          "All item rows must have valid Type, Item, and Required Quantity"
        );
        return false;
      }
    }

    return isScheduleValid;
  };

  const CreateSchedule = async () => {
    await withLoader(async () => {
      try {
        startLoading();
        const validRows = rows.filter(
          (row) =>
            row.type && row.item && row.requiredQty && row.requiredQty > 0
        );

        const body: any = {
          preventiveSchedulerName: scheduleName
            ?.trim()
            .replace(/\b\w/g, (char: any) => char.toUpperCase()),
          machineGroupId: selectedValues.selectedMachineGroup?.id,
          departmentId: selectedValues.selectedDepartment?.id,
          maintenanceCategoryId: selectedValues.selectedCategory?.id,
          scheduleId: 34,
          frequencyTypeId: formData?.frequencyType?.id,
          frequencyInterval: Number(formData?.period?.trim()),
          frequencyUnitId: formData.periodType?.id,
          effectiveDate: dayjs(formData.effectiveDate).format("YYYY-MM-DD"),
          graceDays: formData.graceDays?.trim()
            ? Number(formData.graceDays)
            : 0,
          reminderWorkOrderDays: formData.workOrder
            ? Number(formData.workOrder)
            : 0,
          reminderMaterialReqDays: formData.materialRequest?.trim()
            ? Number(formData.materialRequest)
            : 0,
          isDownTimeRequired: formData?.isDowntimeRequired ? 1 : 0,
          downTimeEstimateHrs:
            formData?.isDowntimeRequired && formData.downtimeEstimate
              ? Number(formData.downtimeEstimate)
              : 0,
          activity: selectedActivities.map((activity: any) => ({
            activityId: activity?.id,
            preventiveSchedulerHeaderId: sheduleId,
          })),
          items:
            validRows.length > 0
              ? validRows.map((row) => ({
                  itemId: row.item?.itemCode,
                  requiredQty: Number(row.requiredQty),
                  oldCategoryDescription: row.item?.description || "",
                  oldGroupName: row.type?.groupName || "",
                  preventiveSchedulerHeaderId: sheduleId,
                  oldItemName: row.item?.itemName,
                }))
              : [],
        };

        if (sheduleId) {
          body["id"] = Number(sheduleId);
        }

        const { endpoint, method } = sheduleId
          ? MainConfig.WorkOrder.Schedule.UpdateSchedule
          : MainConfig.WorkOrder.Schedule.CreateSchedule;

        const finalEndpoint = sheduleId
          ? endpoint.replace("{id}", sheduleId)
          : endpoint;

        console.log(body);

        const response = await Apirequest(
          finalEndpoint,
          method,
          body,
          "main"
        ).then((res) => res.data);

        if (response.statusCode === 200 || response.statusCode === 201) {
          Swal.fire({
            title: response.message || "Schedule saved successfully",
            icon: "success",
            confirmButtonText: "okay",
            customClass: {
              title: "custom-title",
            },
          }).then((res) => {
            if (res.isConfirmed) {
              router.push(`/maintanence/schedule-list`);
            }
          });
        } else if (response.errors && response.errors.length > 0) {
          setErrorMessages(response.errors);
          setErrorModalOpen(true);
        } else {
          toast.error(response.message || "Failed to save schedule");
        }
      } catch (err: any) {
        toast.error(
          err?.message || "An error occurred while saving the schedule"
        );
      } finally {
        stopLoading();
      }
    });
  };

  const [scheduleData, setScheduleData] = useState<any>({});

  const GetScheduleDetails = async () => {
    if (!sheduleId) return;

    try {
      const { endpoint, method } = MainConfig.WorkOrder.Schedule.SchedueGetById;
      const response = await Apirequest(
        endpoint.replace("{id}", sheduleId),
        method,
        null,
        "main"
      ).then((res) => res.data);

      if (response.statusCode === 200 && response.data) {
        setScheduleData(response.data);
      } else {
        toast.error("Failed to load schedule details");
      }
    } catch (err) {
      toast.error("Error loading schedule data");
    }
  };

  const validateArray = (array: any[]) => {
    return Array.isArray(array) && array.length > 0;
  };

  const fetchItemsForGroup = async (groupName: string) => {
    if (!groupName?.trim()) return [];

    try {
      const { endpoint, method } =
        MainConfig.WorkOrder.Activity.ItemGroupByCode;
      const response = await Apirequest(
        endpoint
          .replace(
            "{oldUnit}",
            userValue.oldUnitId ? userValue.oldUnitId.toString() : ""
          )
          .replace("{grpcode}", groupName),
        method,
        null,
        "main"
      ).then((res) => res.data);

      return response?.data || [];
    } catch (err) {
      return [];
    }
  };

  useEffect(() => {
    if (!scheduleData || Object.keys(scheduleData).length === 0) return;

    const processScheduleData = async () => {
      setStockLoading(true);
      try {
        const machineData = machineGroupData?.find(
          (list: any) => list.id === scheduleData?.machineGroupId
        );
        const dept = departmentData?.find(
          (list: any) => list.id === scheduleData?.departmentId
        );
        const mainType = maintanenceTypeData?.find(
          (list: any) => list.id === scheduleData?.maintenanceCategoryId
        );
        const freq = frequencyTypeData?.find(
          (list: any) => list.id === scheduleData?.frequencyTypeId
        );
        const freqType = periodTypeData?.find(
          (list: any) => list.id === scheduleData?.frequencyUnitId
        );

        if (
          validateArray(scheduleData?.activity) &&
          validateArray(activityMasterData)
        ) {
          const mappedActivities = scheduleData.activity.map(
            (activity: any) => {
              const foundActivity = activityMasterData.find(
                (master: any) => master.id === activity.activityId
              );
              return (
                foundActivity || {
                  id: activity.activityId,
                  activityName: `Activity ${activity.activityId}`,
                }
              );
            }
          );
          setSelectedActivities(mappedActivities);
        }

        setSelectedValues({
          selectedMachineGroup: machineData || null,
          selectedDepartment: dept || null,
          selectedCategory: mainType || null,
        });
        setScheduleName(scheduleData?.preventiveSchedulerName);
        setFormData({
          frequencyType: freq || "",
          period: scheduleData?.frequencyInterval?.toString() || "",
          periodType: freqType || "",
          graceDays: scheduleData?.graceDays?.toString() || "",
          workOrder: scheduleData?.reminderWorkOrderDays?.toString() || "",
          materialRequest:
            scheduleData?.reminderMaterialReqDays?.toString() || "",
          effectiveDate: scheduleData?.effectiveDate
            ? dayjs(scheduleData.effectiveDate)
            : null,
          isDowntimeRequired: scheduleData?.isDownTimeRequired === 1,
          downtimeEstimate: scheduleData?.downTimeEstimateHrs?.toString() || "",
        });
        if (validateArray(scheduleData?.items)) {
          setRows([
            {
              id: Date.now(),
              type: null,
              item: null,
              requiredQty: 0,
              itemOptions: [],
              isLoading: true,
              uom: "",
            },
          ]);

          const itemGroupCache: Record<string, any[]> = {};

          const mappedRows = await Promise.all(
            scheduleData.items.map(async (item: any) => {
              const groupType = storeTypeData?.find(
                (type: any) =>
                  type.groupCode === item.oldGroupName ||
                  type.groupName === item.oldGroupName
              );

              let groupItems: any[] = [];

              if (groupType?.groupCode) {
                const groupCode = groupType.groupCode;

                if (itemGroupCache[groupCode]) {
                  groupItems = itemGroupCache[groupCode];
                } else {
                  groupItems = await fetchItemsForGroup(groupCode);
                  itemGroupCache[groupCode] = groupItems;
                }
              }

              const matchedItem = groupItems.find(
                (detail: any) =>
                  detail.itemCode === item.itemId ||
                  detail.itemCode === item.oldItemId
              );

              return {
                id: item.id || Date.now() + Math.random(),
                type: groupType || {
                  groupName: item.oldGroupName || null,
                  groupCode: item.oldGroupName,
                },
                item: matchedItem || {
                  itemCode: item.itemId || item.oldItemId,
                  itemName: null,
                  description: item.oldCategoryDescription || "",
                },
                requiredQty: item.requiredQty || 0,
                itemOptions: groupItems || [],
                isLoading: false,
              };
            })
          );

          setRows(
            mappedRows.length > 0
              ? mappedRows
              : [
                  {
                    id: Date.now(),
                    type: null,
                    item: null,
                    requiredQty: 0,
                    itemOptions: [],
                    isLoading: false,
                  },
                ]
          );
        }
      } catch (error) {
        console.error(error);
      } finally {
        setStockLoading(false);
      }
    };
    if (
      machineGroupData &&
      departmentData &&
      maintanenceTypeData &&
      frequencyTypeData &&
      periodTypeData &&
      storeTypeData
      // &&
      // activityMasterData
    ) {
      processScheduleData();
    }
  }, [
    scheduleData,
    machineGroupData,
    departmentData,
    maintanenceTypeData,
    frequencyTypeData,
    periodTypeData,
    storeTypeData,
    // activityMasterData,
  ]);

  useEffect(() => {
    if (sheduleId) {
      GetScheduleDetails();
    }
  }, [sheduleId]);

  const handleCancel = () => {
    if (window.history && window.history.back) {
      window.history.back();
    }
  };

  useEffect(() => {
    if (
      validateArray(scheduleData?.activity) &&
      validateArray(activityMasterData) &&
      selectedActivities.length === 0
    ) {
      const mappedActivities = scheduleData.activity.map((activity: any) => {
        const foundActivity = activityMasterData.find(
          (master: any) => master.id === activity.activityId
        );
        return foundActivity || activityMasterData?.at(0);
      });
      setSelectedActivities(mappedActivities);
    }
  }, [scheduleData?.activity, activityMasterData]);

  const GetActivityByGroup = async (id: string) => {
    try {
      const { endpoint, method } = MainConfig.WorkOrder.Activity.GetByGroupName;
      const res = await Apirequest(
        endpoint.replace("{group}", id),
        method,
        null,
        "main"
      );
      if (res?.data?.statusCode === 200 || res?.data?.statusCode === 201) {
        setActivityMasterData(res.data.data);
      } else {
        setActivityMasterData([]);
      }
    } catch (err) {
      console.error("Error fetching activities:", err);
    }
  };

  useEffect(() => {
    if (selectedValues.selectedMachineGroup?.id) {
      GetActivityByGroup(selectedValues.selectedMachineGroup.id);
    }
  }, [selectedValues.selectedMachineGroup?.id]);

  return (
    <div>
      <Box
        display={"flex"}
        justifyContent={"space-between"}
        alignItems={"center"}
        flexWrap={"wrap"}
        gap={2}
        my={1}
        component={"div"}
      >
        <Box>
          <IconBreadcrumbs
            parent="Maintenance"
            child="Schedule List"
            subParent={sheduleId ? "Edit Schedule" : "Create Schedule"}
            path="/maintanence/schedule-list"
          />
        </Box>
      </Box>
      <Box p={2} bgcolor={"#fff"}>
        <DialogTitle className="highlighted-header" sx={{ pl: 0, pt: 0 }}>
          {sheduleId ? "Edit Maintenance Schedule" : "Maintenance Schedule"}
        </DialogTitle>
        <Box
          border={"1px solid #E8E8E8"}
          mb={2}
          p={2}
          position={"relative"}
          borderRadius={"8px"}
          mt={3}
        >
          <MuiText
            variant="caption"
            position={"absolute"}
            top={-15}
            left={30}
            bgcolor={"#fff"}
            fontSize={16}
            fontWeight={400}
          >
            General Information
          </MuiText>
          <Grid2 container spacing={2}>
            <Grid2 size={{ xs: 6, sm: 6, md: 2 }}>
              <MuiText className="admin-label-title">Schedule Name</MuiText>
              <TextField
                value={scheduleName}
                onChange={(e) => setScheduleName(e.target.value)}
                variant="outlined"
                size="small"
                fullWidth
                required
              />
            </Grid2>
            <Grid2 size={{ xs: 6, sm: 6, md: 2 }}>
              <MuiText className="admin-label-title">
                Machine Group Name
              </MuiText>
              <StyledAutocomplete
                options={machineGroupData || []}
                getOptionLabel={(option: any) => option.groupName || ""}
                fullWidth
                value={selectedValues.selectedMachineGroup || null}
                onChange={(_, newValue: any) => {
                  setSelectedValues({
                    ...selectedValues,
                    selectedMachineGroup: newValue,
                  });
                  setSelectedActivities([]);
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant="outlined"
                    size="small"
                    fullWidth
                    required
                  />
                )}
              />
            </Grid2>
            <Grid2 size={{ xs: 6, sm: 6, md: 3 }}>
              <MuiText className="admin-label-title">
                Maintenance Department Name
              </MuiText>
              <StyledAutocomplete
                options={departmentData || []}
                fullWidth
                value={selectedValues.selectedDepartment}
                onChange={(_, newvalue: any) =>
                  setSelectedValues({
                    ...selectedValues,
                    selectedDepartment: newvalue,
                  })
                }
                getOptionLabel={(option: any) => option.deptName || ""}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant="outlined"
                    size="small"
                    fullWidth
                    required
                  />
                )}
              />
            </Grid2>
            <Grid2 size={{ xs: 6, sm: 6, md: 3 }}>
              <MuiText className="admin-label-title">
                Maintenance Category Code
              </MuiText>
              <StyledAutocomplete
                options={maintanenceTypeData || []}
                fullWidth
                value={selectedValues.selectedCategory}
                onChange={(_, newvalue: any) =>
                  setSelectedValues({
                    ...selectedValues,
                    selectedCategory: newvalue,
                  })
                }
                getOptionLabel={(option: any) =>
                  `${option.code} - ${option.description}` || ""
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant="outlined"
                    size="small"
                    fullWidth
                    required
                  />
                )}
              />
            </Grid2>
          </Grid2>
        </Box>
        <TabContext value={value.toString()}>
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
                color: "#3a8484",
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
              <Tab label="Activity" value={0} />
              <Tab label="Items" value={1} />
              <Tab label="Schedule" value={2} />
            </Tabs>
          </Box>
          <TabPanel
            value="0"
            sx={{
              p: "4px",
            }}
          >
            <StyledAutocomplete
              multiple
              id="activities-autocomplete"
              options={activityMasterData || []}
              getOptionLabel={(option: any) => option?.activityName || ""}
              value={selectedActivities}
              onChange={handleActivityChange}
              renderInput={(params) => (
                <TextField
                  {...params}
                  variant="outlined"
                  placeholder="Select activities"
                  size="medium"
                  fullWidth
                />
              )}
              renderOption={(props, option: any) => (
                <Box
                  component="li"
                  {...props}
                  sx={{ display: "flex", alignItems: "center", gap: 1 }}
                >
                  {option.activityName}
                </Box>
              )}
              sx={{
                "& .MuiOutlinedInput-root": {
                  "&.Mui-focused fieldset": {
                    borderColor: "#1976d2",
                  },
                },
              }}
            />
          </TabPanel>
          <TabPanel
            value="1"
            sx={{
              opacity: stockLoading ? 0.5 : 1,
              pointerEvents: stockLoading ? "none" : "auto",
              p: "4px",
              position: "relative",
            }}
          >
            {stockLoading && (
              <Box position={"absolute"} top={"45%"} left={"45%"} zIndex={3}>
                <CircularProgress />
              </Box>
            )}
            <ScheduleItems
              rows={rows}
              storeTypeData={storeTypeData}
              handleAddRow={handleAddRow}
              handleDeleteRow={handleDeleteRow}
              handleInputChange={handleInputChange}
            />
          </TabPanel>
          <TabPanel value="2" sx={{ p: "4px" }}>
            <MainScheduler
              formData={formData}
              errors={errors}
              handleChange={handleChange}
              validate={validate}
              frequencyTypeData={frequencyTypeData}
              periodTypeData={periodTypeData}
              sheduleId={sheduleId ? sheduleId : ""}
            />
          </TabPanel>
        </TabContext>
        <Box display="flex" justifyContent="flex-end" gap={2} p={3}>
          <StyledButton
            variant="outlined"
            sx={{ borderRadius: 2 }}
            onClick={handleCancel}
          >
            Cancel
          </StyledButton>
          <StyledButton
            variant="contained"
            sx={{
              borderRadius: 2,
              bgcolor: "#3a8484",
              "&:hover": { bgcolor: "#3a8484" },
            }}
            disabled={stockLoading || isLoading() || isSubmitting()}
            onClick={handleSave}
          >
            {sheduleId ? "Update" : "Save"}
          </StyledButton>
        </Box>
      </Box>
      <ErrorModal
        open={errorModalOpen}
        onClose={() => setErrorModalOpen(false)}
        errors={errorMessages}
      />
    </div>
  );
}

export default CreateSchedulePage;
