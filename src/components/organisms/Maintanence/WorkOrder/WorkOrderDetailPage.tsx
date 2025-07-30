"use client";

import {
  Alert,
  Box,
  Card,
  CardContent,
  Checkbox,
  Chip,
  Dialog,
  Divider,
  FormControlLabel,
  FormGroup,
  Grid,
  Grid2,
  Paper,
  Tab,
  Tabs,
} from "@mui/material";
import { MuiInputField, MuiText } from "bsoft-base-elements";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { TabContext, TabPanel } from "@mui/lab";
import Technicians from "./Technicians";
import CheckLists from "./CheckLists";
import SparesUsed from "./SparesUsed";
import {
  Apirequest,
  StyledAutocomplete,
  StyledButton,
} from "../../../../utils/lib";
import { FiSave, FiSettings, FiX } from "react-icons/fi";
import IconBreadcrumbs from "../../../../components/molecules/AdminLayout/BreadCrumbs";
import { useDataFetchHook } from "../../../../hooks/useDataFetchHook";
import MainConfig from "../../../../utils/main.api.json";
import FamConfig from "../../../../utils/fam.api.json";
import dayjs, { Dayjs } from "dayjs";
import { useRecoilValue } from "recoil";
import { UserData } from "../../../../utils/atoms";
import { SpareRow } from "../../../../maintanenceTypes";
import { DateTimePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import Swal from "sweetalert2";
import { StatusSelector } from "./StatusSelector";
import { useRouter, useSearchParams } from "next/navigation";
import CustomizedTimeline from "./CustomizedTimeline";
import { IoClose } from "react-icons/io5";
import duration from "dayjs/plugin/duration";
import ErrorModal from "../../../molecules/Master/Role/ErrorModal";
import toast from "react-hot-toast";

dayjs.extend(duration);

type StatusType = "open" | "onHold" | "inProgress" | "done";

interface TechnicianDetails {
  custodianId: number;
  custodianName: string;
}

interface TechnicianRow {
  id: number;
  technician: TechnicianDetails | null;
  hours: string;
  minutes: string;
}

interface TimePickerProps {
  startDate: Dayjs | null;
  endDate: Dayjs | null;
  mainStart: Dayjs | null;
  mainEnd: Dayjs | null;
}

const statusOption = [
  {
    value: "onHold" as StatusType,
    label: "On Hold",
    icon: "⏸️",
    selectedBg: "#fff3e0",
    selectedBorder: "#ff9800",
    selectedTextColor: "#e65100",
    normalTextColor: "#ff9800",
  },
  {
    value: "inProgress" as StatusType,
    label: "In Progress",
    icon: "🔄",
    selectedBg: "#e8f5e9",
    selectedBorder: "#4caf50",
    selectedTextColor: "#1b5e20",
    normalTextColor: "#4caf50",
  },
  {
    value: "cancel" as StatusType,
    label: "Reject",
    icon: "❌",
    selectedBg: "#dd5061a1",
    selectedBorder: "red",
    selectedTextColor: "#ff001f",
    normalTextColor: "#dd5061",
  },
  {
    value: "done" as StatusType,
    label: "Done",
    icon: "✓",
    selectedBg: "#00c853",
    selectedBorder: "#00c853",
    selectedTextColor: "#ffffff",
    normalTextColor: "#00c853",
  },
];

function WorkOrderDetailPage({ workOrderId }: { workOrderId?: string }) {
  const userValue = useRecoilValue(UserData);
  const [value, setValue] = React.useState(0);
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };
  const router = useRouter();
  const [type, setType] = useState("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [statusOptions, setStatusOptions] = useState(statusOption);
  const [mainTime, setMainTime] = useState("");
  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [errorMessages, setErrorMessages] = useState<string[]>([]);
  const [dept, setDept] = useState("");
  const searchParams = useSearchParams().size;
  const editFlag = searchParams > 0 ? true : false;
  const [itemDetailsData, setItemDetailsData] = useState([]);
  const [selectedCause, setSelectedCause] = useState<any>(null);
  const [remarks, setRemarks] = useState<string>("");
  const [selectedTechnician, setSelectedTechnician] = useState<number[]>([]);
  const [rows, setRows] = useState<SpareRow[]>([]);
  const [selectedSpares, setSelectedSpares] = useState<any>([]);
  const [technician, setTechnician] = useState<TechnicianRow[]>([]);
  const [status, setStatus] = useState<StatusType>("inProgress");
  const [selectedActivities, setSelectedActivities] = useState<any>([]);
  const [checklistItems, setChecklistItems] = useState<any>([]);
  const [activities, setActivities] = useState<any>([]);
  const [selectedDate, setSelectedDate] = React.useState<TimePickerProps>({
    startDate: null,
    endDate: null,
    mainStart: null,
    mainEnd: null,
  });
  const [open, setOpen] = React.useState(false);
  const [maintanenceErr, setMaintanenceErr] = useState(false);
  const [sameTime, setSameTime] = useState(true);
  const isInitialMount = useRef(true);
  const activityFlagRef = useRef(false);
  const [errorRowIds, setErrorRowIds] = useState<{
    tech: boolean;
    hours: boolean;
    min: boolean;
  }>({
    tech: false,
    hours: false,
    min: false,
  });

  const { data: WorkOrderDetailData, error: workOrderError } = useDataFetchHook(
    MainConfig.WorkOrder.WorkOrderDetail.endpoint.replace(
      "{id}",
      workOrderId ? workOrderId.toString() : ""
    ),
    MainConfig.WorkOrder.WorkOrderDetail.method,
    "main"
  );

  if (workOrderError) {
    console.error("Failed to fetch Work Order details:", workOrderError);
  }

  const { data: storeTypeData } = useDataFetchHook(
    MainConfig.WorkOrder.StoreType.endpoint,
    MainConfig.WorkOrder.StoreType.method,
    "main"
  );

  const { data: workorderStatus } = useDataFetchHook(
    MainConfig.WorkOrder.WorkOrderStatus.endpoint,
    MainConfig.WorkOrder.WorkOrderStatus.method,
    "main"
  );

  const { data: custodianData } = useDataFetchHook(
    FamConfig.AssetLocation.custodian.endpoint.replace(
      "{id}",
      userValue.oldUnitId ? userValue.oldUnitId.toString() : ""
    ),
    FamConfig.AssetLocation.custodian.method,
    "fam"
  );

  const { data: activityMasterData } = useDataFetchHook(
    MainConfig.WorkOrder.Activity.GetByName.endpoint,
    MainConfig.WorkOrder.Activity.GetByName.method,
    "main"
  );

  const { data: rootCauseData } = useDataFetchHook(
    MainConfig.WorkOrder.Schedule.RootCause.endpoint,
    MainConfig.WorkOrder.Schedule.RootCause.method,
    "main"
  );

  const totalTime = useMemo(() => {
    let totalHours = 0;
    let totalMinutes = 0;

    technician.forEach((row) => {
      totalHours += parseInt(row.hours || "0") || 0;
      totalMinutes += parseInt(row.minutes || "0") || 0;
    });

    totalHours += Math.floor(totalMinutes / 60);
    totalMinutes = totalMinutes % 60;

    return { hours: totalHours, minutes: totalMinutes };
  }, [technician]);

  const handleAddRow = useCallback(() => {
    setRows((prevRows) => [
      ...prevRows,
      {
        id: Date.now(),
        type: null,
        item: null,
        availableQty: 0,
        usedQty: 0,
        scrapQty: 0,
        toSubStore: 0,
        image: null,
        isEdit: false,
      },
    ]);
  }, []);

  const GetStock = useCallback(
    async (itemCode: number | string, id: number) => {
      try {
        const { endpoint, method } = MainConfig.WorkOrder.CurrentStock;
        const response = await Apirequest(
          endpoint
            .replace("{oldUnit}", userValue.oldUnitId.toString())
            .replace("{itemCode}", itemCode.toString())
            .replace("{dept}", dept),
          method,
          null,
          "main"
        );

        if (response?.data?.statusCode === 200) {
          setRows((prevRows) =>
            prevRows.map((row) =>
              row.id === id
                ? {
                    ...row,
                    availableQty: response.data.data.stockQty,
                    rate: response.data.data.rate,
                  }
                : row
            )
          );
        } else {
          console.error("Failed to fetch stock data.");
        }
      } catch (err) {
        console.error("Error fetching stock data:", err);
      }
    },
    [userValue.oldUnitId, dept]
  );

  const GetCheckList = useCallback(async () => {
    if (!activityFlagRef.current) return;

    activityFlagRef.current = false;
    try {
      const checked = [...checklistItems];
      let temp: Array<number> = selectedActivities.map((list: any) =>
        list?.id ? list?.id : list?.activityId
      );

      const body = { ids: temp };
      const { endpoint, method } = MainConfig.WorkOrder.Activity.GetCheckList;
      const response = await Apirequest(endpoint, method, body, "main").then(
        (res) => res.data
      );

      if (response.statusCode === 200 || response.statusCode === 201) {
        const uniqueByChecklistId = (arr: any) => {
          const seen = new Map();
          return arr
            .filter((item: any) => {
              const id = item.checklistId ?? item.checkListId;
              if (!seen.has(id)) {
                seen.set(id, true);
                return true;
              }
              return false;
            })
            ?.map((li: any) => ({
              ...li,
              isCompleted: 1,
            }));
        };

        const uniqueData = uniqueByChecklistId([...checked, ...response.data]);
        setChecklistItems(uniqueData);
      }
    } catch (err) {
      console.error("Error fetching checklist:", err);
    }
  }, [checklistItems, selectedActivities]);

  const GetItemData = async () => {
    try {
      const { endpoint, method } = MainConfig.WorkOrder.StoreItem;
      const response = await Apirequest(
        endpoint
          .replace(
            "{oldUnit}",
            userValue.oldUnitId ? userValue.oldUnitId.toString() : ""
          )
          .replace("{dept}", dept),
        method,
        null,
        "main"
      ).then((res) => res.data);
      setItemDetailsData(response?.data);
    } catch (err) {
      console.log(err);
    }
  };

  const handleAddTechnician = () => {
    const totalInMinutes = totalTime.hours * 60 + totalTime.minutes;
    const timeMatch = mainTime.match(/(\d+)\s*hrs\s+(\d+)\s*mins/i);

    const mainHours = timeMatch ? parseInt(timeMatch[1]) : 0;
    const mainMinutes = timeMatch ? parseInt(timeMatch[2]) : 0;
    const mainInMinutes = mainHours * 60 + mainMinutes;

    if (technician.length > 0 && totalInMinutes >= mainInMinutes) {
      toast.error("Cannot add more technicians. Time limit exceeded.");
      return;
    }

    const activeRow = technician.find((row) => row.isEdit);

    if (activeRow && !activeRow.technician) {
      setErrorRowIds({ tech: true, hours: false, min: false });
      return;
    }

    setErrorRowIds({ tech: false, hours: false, min: false });
    setTechnician((prevRows) => [
      ...prevRows.map((row) => ({ ...row, isEdit: false })),
      {
        id: Date.now(),
        technician: null,
        hours: "",
        minutes: "",
        isEdit: true,
      },
    ]);
  };

  interface TechnicianDetails {
    custodianId: number;
    custodianName: string;
  }
  const handleTechnicianInputChange = (
    id: number,
    field: keyof TechnicianRow,
    value: any
  ) => {
    const timeMatch = mainTime.match(
      /(?:(\d+)\s*hr[s]?)?\s*(?:(\d+)\s*min[s]?)/i
    );
    const mainHours = timeMatch?.[1] ? parseInt(timeMatch[1]) : 0;
    const mainMinutes = timeMatch?.[2] ? parseInt(timeMatch[2]) : 0;
    setTechnician((prevRows) =>
      prevRows.map((row, index) => {
        if (row.id !== id) return row;
        const updatedRow = { ...row };

        if (field === "technician") {
          updatedRow.technician = value?.custodianId
            ? {
                custodianId: value.custodianId,
                custodianName: value.custodianName,
              }
            : null;
        }
        if (index === 0 && value?.custodianId) {
          updatedRow.hours = mainHours.toString();
          updatedRow.minutes = mainMinutes.toString();
        }
        if (!value) {
          updatedRow.hours = "";
          updatedRow.minutes = "";
        } else if (field === "hours" || field === "minutes") {
          updatedRow[field] = value;
        }

        return updatedRow;
      })
    );
    setErrorRowIds({ tech: false, hours: false, min: false });

    if (field === "technician" && value?.custodianId) {
      setSelectedTechnician((prev: number[]) =>
        prev.includes(value.custodianId) ? prev : [...prev, value.custodianId]
      );
    }
  };

  interface TechnicianRow {
    id: number;
    technician: TechnicianDetails | null;
    hours: string;
    minutes: string;
    isEdit?: boolean;
  }

  const handleDeleteRow = (id: number, code?: string | number) => {
    setRows((prevRows) => {
      const updatedRows = prevRows.filter((row) => row.id !== id);
      return updatedRows;
    });

    setSelectedSpares((prevRows: any[]) => {
      const updatedSelected = prevRows.filter(
        (row: any) => !row.includes(code?.toString())
      );
      return updatedSelected;
    });
  };

  const handleInputChange = (id: number, field: keyof SpareRow, value: any) => {
    setRows((prevRows) =>
      prevRows.map((row) => {
        if (row.id !== id) return row;

        let updatedRow = { ...row, [field]: value };

        const usedQty = Number(updatedRow.usedQty) || 0;
        let scrapQty = Number(updatedRow.scrapQty) || 0;
        let toSubStore = Number(updatedRow.toSubStore) || 0;

        if (field === "scrapQty") {
          toSubStore = usedQty - (Number(value) || 0);
          updatedRow.toSubStore = toSubStore < 0 ? 0 : toSubStore;
        } else if (field === "toSubStore") {
          scrapQty = usedQty - (Number(value) || 0);
          updatedRow.scrapQty = scrapQty < 0 ? 0 : scrapQty;
        }

        if (field === "usedQty") {
          const total =
            (Number(row.scrapQty) || 0) + (Number(row.toSubStore) || 0);
          if (total > 0) {
            const ratio = (Number(row.scrapQty) || 0) / total;
            updatedRow.scrapQty = Math.round((Number(value) || 0) * ratio);
            updatedRow.toSubStore = (Number(value) || 0) - updatedRow.scrapQty;
          } else {
            updatedRow.scrapQty = 0;
            updatedRow.toSubStore = 0;
          }
        }

        if (field === "item" && value?.itemCode) {
          updatedRow.availableQty = 0;
          updatedRow.scrapQty = 0;
          updatedRow.usedQty = 0;
          updatedRow.toSubStore = 0;
        }

        return updatedRow;
      })
    );

    if (field === "item" && value?.itemCode) {
      setSelectedSpares((prev: any) => [...prev, value.itemCode]);
      GetStock(value.itemCode, id);
    }
  };

  const handleActivityChange = (event: any, newValues: any) => {
    const newActivityIds = newValues.map((activity: any) =>
      activity.id ? activity.id : activity.activityId
    );
    const updatedChecklistItems = checklistItems.filter((item: any) =>
      newActivityIds.includes(item.activityId || item.checklistId)
    );

    setSelectedActivities(newValues);
    setChecklistItems(updatedChecklistItems);
    activityFlagRef.current = true;
  };

  const handleStatusChange = (index: any, status: number) => {
    const updatedItems = [...checklistItems];
    updatedItems[index].isCompleted = status;
    setChecklistItems(updatedItems);
  };

  const handleRemarksChange = (index: any, value: any) => {
    const updatedItems = [...checklistItems];
    updatedItems[index].description = value;
    setChecklistItems(updatedItems);
  };

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleDeleteTechnician = (_: number | string, custodianId?: number) => {
    if (custodianId === undefined || custodianId === null) return;
    setTechnician((prevRows) => {
      const updated = prevRows.filter(
        (row) => row.technician?.custodianId !== custodianId
      );
      return updated;
    });
    setSelectedTechnician((prev) => {
      const updated = prev.filter((techId) => techId !== custodianId);
      return updated;
    });
  };

  const handleInputTechnicianChange = (
    id: number,
    field: string,
    value: string | any
  ) => {
    setTechnician((prevRows) =>
      prevRows.map((row) => {
        if (row.id !== id) return row;
        const updatedRow = { ...row };

        const currentHours = parseInt(row.hours || "0");
        const currentMinutes = parseInt(row.minutes || "0");
        const inputVal = parseInt(value || "0");
        const mainMatch = mainTime.match(/(\d+)\s*hrs\s+(\d+)\s*mins/i);
        const mainLimit = mainMatch
          ? parseInt(mainMatch[1]) * 60 + parseInt(mainMatch[2])
          : 0;

        const otherTotal =
          totalTime.hours * 60 +
          totalTime.minutes -
          (currentHours * 60 + currentMinutes);

        const remaining = mainLimit - otherTotal;

        if (field === "hours") {
          const safeHours = Math.floor(remaining / 60);
          updatedRow.hours = Math.min(inputVal, safeHours).toString();
        }

        if (field === "minutes") {
          const safeMinutes = remaining - parseInt(row.hours || "0") * 60;
          updatedRow.minutes = Math.min(inputVal, safeMinutes).toString();
        }

        if (field === "technician") {
          updatedRow.technician = value?.custodianId
            ? {
                custodianId: value.custodianId,
                custodianName: value.custodianName,
              }
            : null;

          if (!value) {
            updatedRow.hours = "";
            updatedRow.minutes = "";
          }
        }
        return updatedRow;
      })
    );
  };

  const validateMinutes = (value: string) => {
    if (value === "") return "";

    const minutes = parseInt(value, 10);

    if (isNaN(minutes)) return "";
    if (minutes < 0) return "0";
    if (minutes > 59) return "59";

    return minutes.toString();
  };

  const handleSaveChanges = async () => {
    if (type.toLowerCase() === "preventive" && status === "done") {
      if (!selectedDate.mainStart || !selectedDate.mainEnd) {
        setMaintanenceErr(true);
        return;
      } else {
        setMaintanenceErr(false);
      }
    }

    if (
      status === "done" &&
      type.toLowerCase() === "breakdown" &&
      !selectedDate.endDate
    ) {
      toast.error("Stop the maintanence time to close this work order");
      return;
    }

    if (type.toLowerCase() !== "preventive" && status === "done") {
      if (!selectedDate.mainStart || !selectedDate.mainEnd) {
        setMaintanenceErr(true);
        return;
      } else {
        setMaintanenceErr(false);
      }
    }
    const foundStatus: any = statusOptions.find(
      (list: any) => status === list?.value
    );

    setIsSubmitting(true);

    const checkItemType = rows.some((item) => !item?.type);

    if (checkItemType) {
      toast.error("Please select item type");
      setIsSubmitting(false);
      return;
    }

    try {
      const workOrderData: any = {
        workOrder: {
          id: Number(workOrderId),
          companyId: Number(userValue.companyId),
          unitId: Number(userValue.unitId),
          workOrderDocNo: WorkOrderDetailData?.workOrderDocNo,
          statusId: foundStatus?.id
            ? foundStatus?.id
            : WorkOrderDetailData?.statusId,
          rootCauseId: selectedCause?.id,
          remarks: remarks,
          image: "string",
          downTimeStart: selectedDate.startDate
            ? dayjs(selectedDate.startDate).toISOString()
            : WorkOrderDetailData?.downTimeStart,
          downTimeEnd: selectedDate.endDate
            ? dayjs(selectedDate.endDate).toISOString()
            : WorkOrderDetailData?.downTimeEnd,
          workOrderActivity: selectedActivities.map((activity: any) => ({
            workOrderId: Number(workOrderId),
            activityId: activity.activityId || activity.id,
            description: activity.description,
          })),
          workOrderTechnician: technician
            .filter((tech) => tech.technician)
            .map((tech: TechnicianRow) => ({
              workOrderId: Number(workOrderId),
              technicianId: tech.technician?.custodianId,
              oldTechnicianId: tech.technician?.custodianId,
              hoursSpent: tech.hours || "0",
              minutesSpent: tech.minutes || "0",
              sourceId: 1,
              technicianName: tech.technician?.custodianName,
            })),
          workOrderItem: rows
            .filter((row) => row.type && row.item)
            .map((row: SpareRow) => ({
              workOrderId: Number(workOrderId),
              itemCode: row?.item?.itemCode,
              oldItemCode: row?.item?.itemCode,
              itemName: row?.item?.itemName,
              storeTypeId: row.type?.id,
              availableQty: row.availableQty,
              usedQty: row.usedQty === "" ? 0 : Number(row.usedQty),
              scarpQty: row.scrapQty === "" ? 0 : Number(row.scrapQty),
              toSubStoreQty: row.toSubStore === "" ? 0 : Number(row.toSubStore),
              image: row.image,
              rate: row?.rate,
              departmentId: dept,
            })),
          workOrderCheckList: checklistItems.map((item: any) => ({
            workOrderId: Number(workOrderId),
            checkListId: item.checklistId || item.checkListId,
            isCompleted: item.isCompleted ? 1 : 0,
            description: item.description || "string",
          })),
          woSchedule: [
            {
              startTime: selectedDate.mainStart
                ? dayjs(selectedDate.mainStart).toISOString()
                : new Date().toISOString(),
              endTime: selectedDate.endDate
                ? dayjs(selectedDate.endDate).toISOString()
                : new Date().toISOString(),
            },
          ],
        },
      };

      if (selectedDate.mainStart && selectedDate.mainEnd) {
        if (
          Array.isArray(WorkOrderDetailData?.woSchedule) &&
          WorkOrderDetailData?.woSchedule.length === 0
        ) {
          const timerData = {
            woSchedule: {
              workOrderId: workOrderId,
              startTime: selectedDate.mainStart,
              endTime: selectedDate.mainEnd,
              isCompleted: status === "done" ? 1 : 0,
              statusId: foundStatus?.id
                ? foundStatus?.id
                : WorkOrderDetailData?.statusId,
            },
          };
          await Apirequest(
            MainConfig.WorkOrder.CreateTimer.endpoint,
            MainConfig.WorkOrder.CreateTimer.method,
            timerData,
            "main"
          ).then((res) => res.data);
        } else {
          const timerData = {
            woSchedule: {
              workOrderId: workOrderId,
              startTime: selectedDate.mainStart,
              endTime: selectedDate.mainEnd,
              isCompleted: status === "done" ? 1 : 0,
              statusId: foundStatus?.id
                ? foundStatus?.id
                : WorkOrderDetailData?.statusId,
            },
          };
          await Apirequest(
            MainConfig.WorkOrder.UpdateTimer.endpoint,
            MainConfig.WorkOrder.UpdateTimer.method,
            timerData,
            "main"
          ).then((res) => res.data);
        }
      }

      if (WorkOrderDetailData.requestId) {
        if (workOrderData.workOrder) {
          workOrderData.workOrder.requestId = WorkOrderDetailData.requestId;
        }
      }
      if (WorkOrderDetailData.preventiveScheduleId) {
        if (workOrderData.workOrder) {
          workOrderData.workOrder.preventiveScheduleId =
            WorkOrderDetailData.preventiveScheduleId;
        }
      }

      const { endpoint, method } = MainConfig.WorkOrder.UpdateWorkOrder;
      const response = await Apirequest(
        endpoint,
        method,
        workOrderData,
        "main"
      ).then((res) => res.data);

      if (response.statusCode === 200 || response.statusCode === 201) {
        Swal.fire({
          title: response.message,
          icon: "success",
          confirmButtonText: "okay",
          customClass: {
            title: "custom-title",
          },
        }).then((res) => {
          if (res.isConfirmed) {
            router.push(`/maintanence/work-order`);
          }
        });
      } else {
        setErrorMessages(response.errors);
        setErrorModalOpen(true);
        toast.error(
          "Failed to update work order: " +
            (response.message || "Unknown error")
        );
      }
    } catch (error) {
      toast.error("An error occurred while updating the work order.");
      console.log(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = async (id: number, file: File) => {
    try {
      const uploadedImageUrl = await uploadImage(file);
      const { workOrderImageItemBase64, workOrderItemImage }: any =
        uploadedImageUrl;
      setRows((prevRows: any) =>
        prevRows.map((row: any) =>
          row.id === id
            ? {
                ...row,
                image: workOrderItemImage,
                imagePath: workOrderImageItemBase64,
              }
            : row
        )
      );
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Failed to upload image. Please try again.");
    }
  };

  const uploadImage = async (file: File): Promise<string> => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      const { endpoint, method } = MainConfig.WorkOrder.ImageUpload;
      const response = await Apirequest(
        endpoint,
        method,
        formData,
        "main"
      ).then((res) => res.data);

      if (response.statusCode === 200 || response.statusCode === 201) {
        toast.success("Image uploaded successfully!");
        return response.data;
      } else {
        throw new Error(response.message || "Failed to upload image");
      }
    } catch (error) {
      console.error("Error during image upload:", error);
      throw error;
    }
  };

  const handleDeleteImage = async (image: string, id: number) => {
    try {
      const { endpoint, method } = MainConfig.WorkOrder.DeleteImage;
      const payload = {
        image: image,
      };
      const result = await Apirequest(endpoint, method, payload, "main").then(
        (res) => res.data
      );
      if (result.statusCode === 200 || result.statusCode === 201) {
        toast.success(result.message);
        setRows((prevRows: any) =>
          prevRows.map((row: any) =>
            row.id === id
              ? {
                  ...row,
                  image: null,
                  imageName: null,
                }
              : row
          )
        );
      }
    } catch (err) {
      console.error("Image deletion failed:", err);
    }
  };

  const handleSameTime = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { checked } = e.target;
    checked ? setSameTime(true) : setSameTime(false);
  };

  useEffect(() => {
    if (sameTime) {
      setSelectedDate({
        ...selectedDate,
        startDate: selectedDate.mainStart,
        endDate: selectedDate.mainEnd,
      });
    } else {
      setSelectedDate({
        ...selectedDate,
        startDate: null,
        endDate: null,
      });
    }
  }, [sameTime]);

  useEffect(() => {
    if (activityFlagRef.current) {
      GetCheckList();
    }
  }, [GetCheckList]);

  useEffect(() => {
    if (workorderStatus) {
      const codeToStyledValue: Record<string, string> = {
        Hold: "onHold",
        InProgress: "inProgress",
        Cancelled: "cancel",
        Closed: "done",
      };
      const styledMap = new Map(statusOptions.map((s) => [s.value, s]));
      const mergedStatuses = workorderStatus
        .map((status: any) => {
          const styledValue: any = codeToStyledValue[status.code];
          const styled = styledMap.get(styledValue) || {};
          return {
            ...status,
            ...styled,
          };
        })
        .filter((a: any) => a.code?.toLowerCase() !== "open")
        .slice(0, 4);

      const areDifferent =
        JSON.stringify(mergedStatuses) !== JSON.stringify(statusOptions);
      if (areDifferent) {
        setStatusOptions(mergedStatuses);
      }
    }
  }, [workorderStatus]);

  useEffect(() => {
    if (
      !WorkOrderDetailData ||
      !storeTypeData ||
      !itemDetailsData ||
      // !custodianData ||
      !isInitialMount.current
    )
      return;

    isInitialMount.current = false;

    setType(WorkOrderDetailData?.requestDesc);
    setActivities(WorkOrderDetailData?.woActivity || []);
    setSelectedActivities(WorkOrderDetailData?.woActivity || []);
    setChecklistItems(WorkOrderDetailData?.woCheckList || []);
    setDept(WorkOrderDetailData?.departmentId);

    const mappedNonEditableRows = (
      (Array.isArray(WorkOrderDetailData?.woItem) &&
        WorkOrderDetailData?.woItem) ||
      []
    ).map((item: any) => ({
      id: `${item.itemCode}-${Math.random()}`,
      type:
        item.storeTypeId === 0
          ? {
              id: storeTypeData?.[0]?.id ?? 0,
              code: storeTypeData?.[0]?.code ?? "",
            }
          : {
              id: item.storeTypeId,
              code: item.storeTypeDesc,
            },
      item: {
        itemCode: item.itemCode,
        itemName: item.itemName,
      },
      availableQty: item.availableQty ?? 0,
      usedQty: item.usedQty ?? 0,
      scrapQty: item.scarpQty ?? 0,
      toSubStore: item.toSubStoreQty ?? 0,
      image: item.image || null,
      imagePath: item.imagePath || null,
      rate: item.rate ?? null,
      isEdit: item.usedQty <= 0 ? false : true,
    }));

    // if (mappedNonEditableRows && mappedNonEditableRows.length > 0) {
    //   const initialSelected = mappedNonEditableRows
    //     .map((row: any) => row.item?.itemCode)
    //     .filter(Boolean);
    //   setSelectedSpares(initialSelected);
    // }

    setRows(mappedNonEditableRows);

    const mappedTechnician = (
      (Array.isArray(WorkOrderDetailData?.woTechnician) &&
        WorkOrderDetailData?.woTechnician) ||
      []
    ).map((list: any) => ({
      id: list.id || Date.now(),
      technician: (Array.isArray(custodianData) &&
        custodianData?.find(
          (type: any) => type.custodianId === list?.oldCustodianId
        )) || {
        custodianId: list.oldCustodianId,
        custodianName: list?.custodianName || "",
      },
      hours: list?.hoursSpent,
      minutes: list?.minutesSpent,
    }));
    setTechnician(mappedTechnician);
    setRemarks(WorkOrderDetailData?.remarks);

    const rootCause =
      Array.isArray(rootCauseData) &&
      rootCauseData.find(
        (list) => list.id === WorkOrderDetailData?.rootCauseId
      );
    setSelectedCause(rootCause);

    setSelectedDate({
      startDate: WorkOrderDetailData?.downTimeStart
        ? dayjs(WorkOrderDetailData?.downTimeStart)
        : null,
      endDate: WorkOrderDetailData?.downTimeEnd
        ? dayjs(WorkOrderDetailData?.downTimeEnd)
        : null,
      mainStart:
        Array.isArray(WorkOrderDetailData?.woSchedule) &&
        WorkOrderDetailData?.woSchedule.length > 0
          ? dayjs(WorkOrderDetailData?.woSchedule?.at(0).startTime)
          : null,
      mainEnd:
        Array.isArray(WorkOrderDetailData?.woSchedule) &&
        WorkOrderDetailData?.woSchedule.length > 0
          ? dayjs(WorkOrderDetailData?.woSchedule?.at(-1).endTime)
          : null,
    });

    const foundStatus = statusOptions.find(
      (list: any) => WorkOrderDetailData?.statusId === list?.id
    );
    setStatus(foundStatus?.value || "inProgress");
  }, [
    WorkOrderDetailData,
    storeTypeData,
    itemDetailsData,
    custodianData,
    rootCauseData,
    statusOptions,
  ]);

  useEffect(() => {
    if (userValue.oldUnitId !== "" && dept !== "") {
      GetItemData();
    }
  }, [dept, userValue]);

  useEffect(() => {
    if (!WorkOrderDetailData) return;

    const { woSchedule } = WorkOrderDetailData;

    if (!Array.isArray(woSchedule)) {
      console.log("Invalid woSchedule format");
      setMainTime("-");
      return;
    }

    const validSchedules = woSchedule
      .map((schedule: any) => {
        const start = dayjs(schedule.startTime);
        const end = dayjs(schedule.endTime);
        const isValid = start.isValid() && end.isValid() && end.isAfter(start);

        if (!isValid) {
          console.warn("Invalid schedule:", schedule);
        }

        return isValid ? { start, end } : null;
      })
      .filter(Boolean) as { start: dayjs.Dayjs; end: dayjs.Dayjs }[];

    if (validSchedules.length === 0) {
      setMainTime("-");
      return;
    }

    const totalSeconds = validSchedules.reduce(
      (sum, { start, end }) => sum + end.diff(start, "second"),
      0
    );

    if (totalSeconds > 0) {
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;

      setMainTime(
        `${hours} hr${hours !== 1 ? "s" : ""} ` +
          `${minutes} min${minutes !== 1 ? "s" : ""} ` +
          `${seconds} sec${seconds !== 1 ? "" : ""}`
      );
    } else {
      setMainTime("-");
    }
  }, [WorkOrderDetailData]);
  useEffect(() => {
    const start =
      type.toLowerCase() === "preventive"
        ? selectedDate.startDate
        : selectedDate.mainStart;

    const end =
      type.toLowerCase() === "preventive"
        ? selectedDate.endDate
        : selectedDate.mainEnd;

    if (start && end && dayjs(end).isAfter(start)) {
      const totalSeconds = dayjs(end).diff(start, "second");
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;

      setMainTime(
        `${hours} hr${hours !== 1 ? "s" : ""} ` +
          `${minutes} min${minutes !== 1 ? "s" : ""} ` +
          `${seconds} sec${seconds !== 1 ? "" : ""}`
      );
    } else {
      setMainTime("-");
    }
  }, [
    selectedDate.mainStart,
    selectedDate.mainEnd,
    selectedDate.startDate,
    selectedDate.endDate,
    type,
  ]);

  return (
    <div>
      <Box
        display={"flex"}
        justifyContent={"space-between"}
        alignItems={"center"}
        flexWrap={"wrap"}
        gap={2}
        mt={1}
      >
        <Box>
          <IconBreadcrumbs
            parent="Schedule"
            child="Work Order"
            subParent="Work Order Detail"
            path="/maintanence/work-order"
          />
        </Box>
      </Box>
      <Box bgcolor={"#fff"} p={3} pt={0} mt={1.5}>
        <Box
          pt={2}
          sx={{
            "& .MuiCardContent-root": {
              pb: 0,
            },
          }}
        >
          <Card
            elevation={0}
            sx={{
              mb: 0,
              borderRadius: 2,
              overflow: "visible",
              position: "relative",
            }}
          >
            <CardContent sx={{ p: 0 }}>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                mb={2}
              >
                <Box>
                  <MuiText variant="h5" fontWeight={600}>
                    Work Order #{WorkOrderDetailData?.workOrderDocNo}
                  </MuiText>
                  {WorkOrderDetailData?.createdDate ? (
                    <MuiText variant="body2" color="text.secondary">
                      Created At :{" "}
                      {`${dayjs(WorkOrderDetailData?.createdDate).format(
                        "MM-DD-YYYY"
                      )} @ ${dayjs(WorkOrderDetailData?.createdDate).format(
                        "hh:mm a"
                      )}`}
                    </MuiText>
                  ) : (
                    ""
                  )}
                </Box>
                <Chip
                  label={type}
                  sx={{
                    borderRadius: "4px",
                    fontSize: 15,
                    textTransform: "uppercase",
                    bgcolor: "rgba(0, 120, 215, 0.1)",
                    color: "#000",
                    borderLeft: "4px solid #107869",
                    fontWeight: 500,
                  }}
                />
              </Box>

              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <Paper
                    elevation={2}
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      bgcolor: "#f8fafc",
                      border: "1px solid #e0e7ff",
                    }}
                  >
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      <FiSettings size={18} color="#107869" />
                      <MuiText fontWeight={600}>Machine Details</MuiText>
                    </Box>
                    <Box display="flex" flexDirection="column" gap={1} pl={4}>
                      <MuiText variant="body2" fontWeight={500}>
                        Asset Code:{" "}
                        <span style={{ color: "#107869" }}>
                          {WorkOrderDetailData?.assetCode}
                        </span>
                      </MuiText>
                      <MuiText variant="body2" fontWeight={500}>
                        Location:{" "}
                        <span style={{ color: "#107869" }}>
                          {WorkOrderDetailData?.assetLocation}
                        </span>
                      </MuiText>
                      <MuiText variant="body2" fontWeight={500}>
                        Machine :{" "}
                        <span style={{ color: "#107869" }}>
                          {WorkOrderDetailData?.machine} -{" "}
                          {WorkOrderDetailData?.machineName}
                        </span>
                      </MuiText>
                      <MuiText variant="body2" fontWeight={500}>
                        {WorkOrderDetailData?.requestId
                          ? "Request Id"
                          : "Preventive Schedule Id"}{" "}
                        :{" "}
                        <span style={{ color: "#107869" }}>
                          {WorkOrderDetailData?.requestId
                            ? WorkOrderDetailData?.requestId
                            : WorkOrderDetailData?.preventiveScheduleId}
                        </span>
                      </MuiText>
                      <MuiText variant="body2" fontWeight={500}>
                        Requested By :{" "}
                        <span style={{ color: "#107869" }}>
                          {WorkOrderDetailData?.createdUser}
                        </span>
                      </MuiText>
                    </Box>
                  </Paper>
                </Grid>

                <Grid item xs={12} md={8}>
                  <Paper
                    elevation={2}
                    sx={{
                      borderRadius: 2,
                      overflow: "hidden",
                      border: "1px solid #e0e7ff",
                      height: "100%",
                    }}
                  >
                    <Box
                      display={"flex"}
                      flexDirection={"column"}
                      justifyContent={"space-around"}
                      height={"100%"}
                      bgcolor={"#f8fafc"}
                    >
                      <Grid2 container spacing={2} px={2}>
                        <Grid2 size={{ xs: 12, sm: 12, md: 4 }}>
                          <MuiText
                            fontWeight={500}
                            fontSize={14}
                            color="#000"
                            mb={0.5}
                          >
                            Maintenance Time (Start)
                          </MuiText>
                          <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DateTimePicker
                              value={selectedDate.mainStart}
                              onChange={(newValue) => {
                                sameTime
                                  ? setSelectedDate({
                                      ...selectedDate,
                                      mainStart: newValue,
                                      startDate: newValue,
                                    })
                                  : setSelectedDate({
                                      ...selectedDate,
                                      mainStart: newValue,
                                    });
                              }}
                              disabled={
                                typeof type === "string" &&
                                type.toLowerCase() === "breakdown"
                              }
                              format="DD-MM-YYYY HH:mm:ss"
                              slotProps={{
                                textField: {
                                  fullWidth: true,
                                  size: "small",
                                  placeholder: "Start Date and Time",
                                  helperText:
                                    maintanenceErr &&
                                    "please select start time",
                                  sx: {
                                    bgcolor: "#fff",
                                  },
                                },
                              }}
                            />
                          </LocalizationProvider>
                        </Grid2>
                        <Grid2 size={{ xs: 12, sm: 12, md: 4 }}>
                          <MuiText
                            fontWeight={500}
                            fontSize={14}
                            color="#000"
                            mb={0.5}
                          >
                            Maintenance Time (End)
                          </MuiText>
                          <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DateTimePicker
                              value={selectedDate.mainEnd}
                              onChange={(newValue) => {
                                sameTime
                                  ? setSelectedDate({
                                      ...selectedDate,
                                      mainEnd: newValue,
                                      endDate: newValue,
                                    })
                                  : setSelectedDate({
                                      ...selectedDate,
                                      mainEnd: newValue,
                                    });
                              }}
                              // minDateTime={dayjs(selectedDate.mainStart)}
                              disabled={
                                typeof type === "string" &&
                                type.toLowerCase() === "breakdown"
                              }
                              format="DD-MM-YYYY HH:mm:ss"
                              slotProps={{
                                textField: {
                                  fullWidth: true,
                                  size: "small",
                                  placeholder: "End Date and Time",
                                  helperText:
                                    maintanenceErr && "please select end time",
                                  sx: {
                                    bgcolor: "#fff",
                                  },
                                },
                              }}
                            />
                          </LocalizationProvider>
                        </Grid2>
                        <Grid2
                          size={{ xs: 12, sm: 12, md: 4 }}
                          display={"grid"}
                          sx={{ placeItems: "center" }}
                        >
                          <Box>
                            <MuiText
                              fontWeight={500}
                              fontSize={12}
                              color="#000"
                              mb={0.5}
                              textAlign={"center"}
                            >
                              Total Maintenance Time
                            </MuiText>
                            <MuiText
                              fontWeight={500}
                              fontSize={16}
                              color="#000"
                              mb={0.5}
                              textAlign={"center"}
                            >
                              {selectedDate.mainStart && selectedDate.mainEnd
                                ? (() => {
                                    const diffInSeconds = dayjs(
                                      selectedDate.mainEnd
                                    ).diff(selectedDate.mainStart, "second");
                                    const hours = Math.floor(
                                      diffInSeconds / 3600
                                    );
                                    const minutes = Math.floor(
                                      (diffInSeconds % 3600) / 60
                                    );
                                    const seconds = diffInSeconds % 60;

                                    return `${hours} hr${
                                      hours !== 1 ? "s" : ""
                                    } ${minutes} min${
                                      minutes !== 1 ? "s" : ""
                                    } ${seconds} sec${seconds !== 1 ? "" : ""}`;
                                  })()
                                : "-"}
                            </MuiText>
                          </Box>
                        </Grid2>
                      </Grid2>
                      <Grid2 container spacing={2} px={2}>
                        <Grid2 size={{ xs: 12, sm: 12, md: 4 }}>
                          <MuiText
                            fontWeight={500}
                            fontSize={14}
                            color="#000"
                            mb={0.5}
                          >
                            Down Time (Start)
                          </MuiText>
                          <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DateTimePicker
                              onChange={(newValue) =>
                                setSelectedDate({
                                  ...selectedDate,
                                  startDate: newValue,
                                })
                              }
                              disabled={sameTime}
                              format="DD-MM-YYYY HH:mm:ss"
                              value={selectedDate.startDate}
                              slotProps={{
                                textField: {
                                  fullWidth: true,
                                  size: "small",
                                  placeholder: "Start Date and Time",
                                  sx: {
                                    bgcolor: "#fff",
                                  },
                                },
                              }}
                            />
                          </LocalizationProvider>
                        </Grid2>
                        <Grid2 size={{ xs: 12, sm: 12, md: 4 }}>
                          <MuiText
                            fontWeight={500}
                            fontSize={14}
                            color="#000"
                            mb={0.5}
                          >
                            Down Time (End)
                          </MuiText>
                          <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DateTimePicker
                              onChange={(newValue) =>
                                setSelectedDate({
                                  ...selectedDate,
                                  endDate: newValue,
                                })
                              }
                              format="DD-MM-YYYY HH:mm:ss"
                              value={selectedDate.endDate}
                              disabled={sameTime}
                              // minDateTime={dayjs(selectedDate.startDate)}
                              slotProps={{
                                textField: {
                                  fullWidth: true,
                                  size: "small",
                                  placeholder: "End Date and Time",
                                  sx: {
                                    bgcolor: "#fff",
                                  },
                                },
                              }}
                            />
                          </LocalizationProvider>
                        </Grid2>
                        <Grid2
                          size={{ xs: 12, sm: 12, md: 4 }}
                          display={"grid"}
                          sx={{ placeItems: "center" }}
                        >
                          <Box>
                            <MuiText
                              fontWeight={500}
                              fontSize={12}
                              color="#000"
                              mb={0.5}
                              textAlign={"center"}
                            >
                              Total Down Time
                            </MuiText>
                            <MuiText
                              fontWeight={500}
                              fontSize={16}
                              color="#000"
                              mb={0.5}
                              textAlign={"center"}
                            >
                              {selectedDate.startDate && selectedDate.endDate
                                ? (() => {
                                    const diffInSeconds = dayjs(
                                      selectedDate.endDate
                                    ).diff(selectedDate.startDate, "second");
                                    const hours = Math.floor(
                                      diffInSeconds / 3600
                                    );
                                    const minutes = Math.floor(
                                      (diffInSeconds % 3600) / 60
                                    );
                                    const seconds = diffInSeconds % 60;

                                    return `${hours} hr${
                                      hours !== 1 ? "s" : ""
                                    } ${minutes} min${
                                      minutes !== 1 ? "s" : ""
                                    } ${seconds} sec${seconds !== 1 ? "" : ""}`;
                                  })()
                                : "-"}
                            </MuiText>
                          </Box>
                        </Grid2>
                      </Grid2>
                    </Box>
                    {/* )} */}
                  </Paper>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Box>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            {typeof type === "string" && type.toLowerCase() === "breakdown" && (
              <Alert
                onClick={handleClickOpen}
                severity="info"
                sx={{ mb: 2, cursor: "pointer", width: "fit-content" }}
              >
                Click to view work/break timeline
              </Alert>
            )}
          </Grid>
          <Grid item xs={12} md={8} mb={1}>
            <FormGroup>
              <FormControlLabel
                sx={{ width: "fit-content" }}
                control={
                  <Checkbox
                    defaultChecked
                    checked={sameTime}
                    onChange={handleSameTime}
                  />
                }
                label="Same as Maintenance Time"
              />
            </FormGroup>
          </Grid>
        </Grid>
        <Divider sx={{ mb: 2, mt: 0 }} />

        <Dialog
          open={open}
          onClose={handleClose}
          sx={{
            "& .MuiPaper-root": {
              borderRadius: "8px",
              maxWidth: "none !important",
            },
          }}
        >
          <Box className="popup-header-wrapper">
            <h2
              className="dialog-header"
              style={{ textAlign: "center", width: "100%" }}
            >
              Work/Break Timeline
            </h2>
            <IoClose
              fontSize={24}
              onClick={handleClose}
              cursor={"pointer"}
              color="#fff"
            />
          </Box>
          <CustomizedTimeline
            timelineData={
              Array.isArray(WorkOrderDetailData?.woSchedule)
                ? WorkOrderDetailData?.woSchedule
                : []
            }
          />
        </Dialog>

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
                borderBottom: "1px solid #107869",
              },
              "& .Mui-selected": {
                border: "1px solid #107869",
                borderBottom: "1px solid #fff",
                borderTop: "4px solid #107869",
                color: "#107869",
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
              <Tab label="Spares Used" value={1} />
              <Tab label="Technicians" value={2} />
            </Tabs>
          </Box>
          <TabPanel
            value={0}
            sx={{ p: "4px", pointerEvents: editFlag ? "none" : "" }}
            aria-labelledby="tab-activity"
          >
            <CheckLists
              selectedActivities={selectedActivities}
              checklistItems={checklistItems}
              activities={activities}
              handleActivityChange={handleActivityChange}
              handleStatusChange={handleStatusChange}
              handleRemarksChange={handleRemarksChange}
              activityMasterData={activityMasterData}
            />
          </TabPanel>
          <TabPanel
            value={1}
            sx={{ p: "4px", pointerEvents: editFlag ? "none" : "" }}
            aria-labelledby="tab-spares-used"
          >
            <SparesUsed
              rows={rows}
              storeTypeData={storeTypeData}
              itemDetailsData={itemDetailsData}
              handleAddRow={handleAddRow}
              handleDeleteRow={handleDeleteRow}
              handleInputChange={handleInputChange}
              handleFileChange={handleFileChange}
              handleDeleteImage={handleDeleteImage}
              selectedSpares={selectedSpares}
            />
          </TabPanel>
          <TabPanel
            value={2}
            sx={{ p: "4px", pointerEvents: editFlag ? "none" : "" }}
            aria-labelledby="tab-technicians"
          >
            <Technicians
              rows={technician}
              custodianData={custodianData}
              handleAddRow={handleAddTechnician}
              handleDeleteRow={handleDeleteTechnician}
              handleInputChange={handleInputTechnicianChange}
              totalTime={totalTime}
              mainTime={mainTime}
              selectedTechnician={selectedTechnician}
              handleTechnicianInputChange={handleTechnicianInputChange}
              errorRowIds={errorRowIds}
            />
          </TabPanel>
        </TabContext>
        <Divider sx={{ my: 2 }} />
        <Grid2 container spacing={2}>
          <Grid2
            size={{ xs: 12, sm: 12, md: 3 }}
            sx={{ pointerEvents: editFlag ? "none" : "" }}
          >
            <MuiText fontWeight={400} fontSize={14} color="#000">
              Root Cause Analysis
            </MuiText>
            <StyledAutocomplete
              options={rootCauseData || []}
              fullWidth
              getOptionLabel={(option: any) => option.code}
              value={selectedCause}
              onChange={(_, newValue) => setSelectedCause(newValue)}
              size="small"
              renderInput={(params) => (
                <MuiInputField {...params} name="technician" />
              )}
            />
          </Grid2>
          <Grid2
            size={{ xs: 12, sm: 12, md: 9 }}
            sx={{ pointerEvents: editFlag ? "none" : "" }}
          >
            <MuiText fontWeight={400} fontSize={14} color="#000">
              Remarks
            </MuiText>
            <MuiInputField
              fullWidth
              onChange={(e) => setRemarks(e.target.value)}
              multiline
              value={remarks}
              rows={5}
              name="technician"
            />
          </Grid2>
        </Grid2>
        <Divider sx={{ my: 2 }} />

        <Box
          display="flex"
          justifyContent="space-between"
          alignItems={"center"}
          gap={2}
          p={2}
          bgcolor="#f8fafc"
          borderTop="1px solid rgba(0, 0, 0, 0.12)"
        >
          <Box
            sx={{
              pointerEvents: editFlag ? "none" : "",
            }}
          >
            <MuiText
              fontWeight={500}
              fontSize={14}
              color="#000"
              position={"relative"}
              top={-6}
            >
              Work Order Status
            </MuiText>
            <StatusSelector
              value={status}
              onChange={setStatus}
              statusOptions={statusOptions}
            />
          </Box>
          <Box>
            <StyledButton
              variant="outlined"
              startIcon={<FiX size={18} />}
              sx={{ borderRadius: 2, mr: 2 }}
              onClick={() => router.push(`/maintanence/work-order`)}
            >
              Cancel
            </StyledButton>
            <StyledButton
              variant="contained"
              startIcon={isSubmitting ? null : <FiSave size={18} />}
              sx={{
                borderRadius: 2,
              }}
              disabled={isSubmitting || editFlag}
              onClick={handleSaveChanges}
            >
              Save Changes
            </StyledButton>
          </Box>
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

export default WorkOrderDetailPage;
