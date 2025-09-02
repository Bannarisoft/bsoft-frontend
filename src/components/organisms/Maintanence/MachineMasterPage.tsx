"use client";

import { Box, Tab } from "@mui/material";
import React, { useCallback, useEffect, useState } from "react";
import IconBreadcrumbs from "../../molecules/AdminLayout/BreadCrumbs";
import GlobalSearch from "../../molecules/AdminLayout/GlobalSearch";
import { MuiButton, MuiTable } from "bsoft-base-elements";
import { GoPlus } from "react-icons/go";
import { FiEdit } from "react-icons/fi";
import { RiDeleteBin6Line } from "react-icons/ri";
import { usePrivilegeCheck } from "../../../hooks/usePrivilegeCheck";
import dayjs from "dayjs";
import NoDataFound from "../../molecules/AdminLayout/NoDataFound";
import CreateMachineMaster from "../../molecules/Maintanence/CreateMachineMaster";
import {
  AdditionalSpec,
  CreateMachineInputs,
  SpecificationOption,
} from "../../../types/maintanenceTypes";
import MainConfig from "../../../utils/main.api.json";
import Config from "../../../utils/config.api.json";
import FamConfig from "../../../utils/fam.api.json";
import { useDataFetchHook } from "../../../hooks/useDataFetchHook";
import { useRecoilValue } from "recoil";
import { UserData } from "../../../utils/atoms";
import {
  Apirequest,
  isSubmitting,
  startLoading,
  stopLoading,
} from "../../../utils/lib";
import ErrorModal from "../../molecules/Master/Role/ErrorModal";
import { useDebounce } from "../../../hooks/useDebounceHook";
import SkeletonLoader from "../../molecules/AdminLayout/SkeletonLoader";
import DeleteConfirmation from "../../molecules/Master/DeleteConfirmation";
import { TabContext, TabList } from "@mui/lab";
import toast from "react-hot-toast";

function MachineMasterPage() {
  const [pathname, setPathName] = useState<string>("");
  const permissions = usePrivilegeCheck(pathname);
  useEffect(() => {
    setInitFlag(true);
    const currentPath = window.location.pathname.split("/bsoft").at(-1) || "";
    setPathName(currentPath);
  }, []);
  const [initFlag, setInitFlag] = React.useState(false);
  const [page, setPage] = React.useState<number>(1);
  const [size, setSize] = React.useState<number>(15);
  const [open, setOpen] = React.useState(false);
  const [error, setError] = React.useState<any[]>([]);
  const [value, setValue] = React.useState("0");
  const [count, setCount] = React.useState(0);
  const handleChangeTab = (event: React.SyntheticEvent, newValue: string) => {
    setValue(newValue);
  };
  const [inputs, setInputs] = useState<CreateMachineInputs>({
    machineCode: "",
    machineName: "",
    machineGroupData: [],
    selecetdMachineGroup: "",
    departmentData: [],
    selecetdDepartment: "",
    productionCapacity: "",
    uomData: [],
    selectedUom: "",
    shiftData: [],
    lineNumberData: [],
    selectedLineNumber: null,
    selectedShift: "",
    workCenterData: [],
    selectedWorkCenter: "",
    costCenterData: [],
    selectedCostCenter: "",
    installationDate: null,
    assetData: [],
    selectedAsset: "",
    isActive: 1,
    isProductionMachine: 1,
    id: 0,
    prodDept: "",
  });

  // const [specValue, setSpecValue] = useState<AdditionalSpec>({
  //   id: 0,
  //   specification: null,
  //   machine: "",
  //   selectedSpecification: null,
  // });
  const userValue = useRecoilValue(UserData);
  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [errorMessages, setErrorMessages] = useState<string[]>([]);
  const [machineMasterData, setMachineMasterData] = useState<any[]>([]);
  const [editFlag, setEditFlag] = useState(false);
  const [search, setSearch] = React.useState("");
  const debouncedSearchTerm = useDebounce(search, 500);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [assetSpecData, setAssetSpecData] = useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [filterData, setFilterData] = useState<any>([]);

  const handleClickOpen = () => {
    setOpen(true);
    setEditFlag(false);
    setOpen(true);
    setInputs({
      ...inputs,
      machineCode: "",
      machineName: "",
      selecetdMachineGroup: "",
      prodDept: "",
      selecetdDepartment: "",
      productionCapacity: "",
      selectedUom: "",
      selectedShift: "",
      selectedWorkCenter: "",
      selectedCostCenter: "",
      installationDate: null,
      selectedAsset: "",
      isActive: 1,
      isProductionMachine: 1,
      id: 0,
    });
    setError([]);
    setSpecList([]);
  };

  const handleClose = () => {
    setOpen(false);
    setEditFlag(false);
    setInputs({
      ...inputs,
      machineCode: "",
      machineName: "",
      selecetdMachineGroup: "",
      selecetdDepartment: "",
      productionCapacity: "",
      prodDept: "",
      selectedUom: "",
      selectedShift: "",
      selectedWorkCenter: "",
      selectedCostCenter: "",
      installationDate: null,
      selectedAsset: "",
      isActive: 1,
      isProductionMachine: 1,

      id: 0,
    });
    setSpecList((prev) =>
      prev.map((item) => ({
        ...item,
        specification: null,
      }))
    );
    setSpecList([]);
    setAssetSpecData([]);
  };

  const { data: machineGroupData } = useDataFetchHook(
    MainConfig.Machine.MachineGroupByName.endpoint,
    MainConfig.Machine.MachineGroupByName.method,
    "main"
  );

  const { data: shiftData } = useDataFetchHook(
    MainConfig.Machine.ShiftByName.endpoint,
    MainConfig.Machine.ShiftByName.method,
    "main"
  );

  const { data: workCenterData } = useDataFetchHook(
    MainConfig.Machine.WorkCenterByName.endpoint,
    MainConfig.Machine.WorkCenterByName.method,
    "main"
  );

  const { data: costCenterData } = useDataFetchHook(
    MainConfig.Machine.CostCenterByName.endpoint,
    MainConfig.Machine.CostCenterByName.method,
    "main"
  );

  const { data: departmentData } = useDataFetchHook(
    Config.Department.getDepartment.endpoint,
    Config.Department.getDepartment.method
  );

  const { data: uomData } = useDataFetchHook(
    FamConfig.Uom.AssetUomName.endpoint,
    FamConfig.Uom.AssetUomName.method,
    "fam"
  );

  const { data: assetData } = useDataFetchHook(
    FamConfig.AssetMasterGeneral.AssetByName.endpoint,
    FamConfig.AssetMasterGeneral.AssetByName.method,
    "fam"
  );

  const { data: lineNumberData } = useDataFetchHook(
    MainConfig.Machine.LineNumber.endpoint,
    MainConfig.Machine.LineNumber.method,
    "main"
  );

  const { data: Specification } = useDataFetchHook(
    MainConfig.Machine.Specification.endpoint.replace("{type}", "MACHINESPEC"),
    MainConfig.Machine.Specification.method,
    "main"
  );
  const GetAllGetSpecification = async (id: number) => {
    setEditFlag(true);
    try {
      const { endpoint, method } =
        MainConfig.MachineSpecification.GetSpecification;
      const url = endpoint.replace("{id}", id.toString());

      const response = await Apirequest(url, method, null, "main").then(
        (res) => res.data
      );

      if (response.statusCode === 200 && Array.isArray(response.data)) {
        const mappedSpecs = response.data.map((item: any, index: number) => {
          const matchedSpec = Specification.find(
            (s: any) => s.id === item.specificationId
          );

          return {
            id: index + 1,
            specification: matchedSpec ?? {
              id: item.specificationId,
              code: item.specificationName,
            },
            machine: "",
            apiRowId: item.id,
            specValue: item.specificationValue || "",
          };
        });

        setSpecList(mappedSpecs);
      }
    } catch (err) {
      console.error("Error fetching specification data:", err);
    }
  };

  useEffect(() => {
    if (lineNumberData && lineNumberData.length > 0) {
      const sortedTypes: any =
        Array.isArray(lineNumberData) &&
        lineNumberData.sort((a, b) => b.code.localeCompare(a.code));
      setInputs({ ...inputs, selectedLineNumber: sortedTypes[0] || null });
    }
  }, [lineNumberData]);

  useEffect(() => {
    if (
      machineGroupData ||
      departmentData ||
      uomData ||
      shiftData ||
      costCenterData ||
      workCenterData ||
      assetData ||
      lineNumberData ||
      Specification
    ) {
      setInputs((prev) => ({
        ...prev,
        machineGroupData,
        departmentData,
        uomData,
        shiftData,
        costCenterData,
        workCenterData,
        assetData,
        lineNumberData,
      }));
    }
  }, [
    machineGroupData,
    departmentData,
    uomData,
    shiftData,
    costCenterData,
    workCenterData,
    assetData,
    lineNumberData,
    Specification,
  ]);

  useEffect(() => {
    setInitFlag(true);
    const currentPath = window.location.pathname.split("/bsoft").at(-1) || "";
    setPathName(currentPath);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const filteredValue =
      name === "machineCode" ? value.replace(/[^a-zA-Z0-9]/g, "") : value;
    setInputs({ ...inputs, [name]: filteredValue });
    const id = Number(e.target.dataset.id);

    setSpecList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [name]: value } : item))
    );
  };

  const handleSwitch = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: "isActive" | "isProductionMachine"
  ) => {
    const { checked } = e.target;

    if (field === "isActive") {
      setInputs({
        ...inputs,
        isActive: checked ? 1 : 0,
      });
    } else if (field === "isProductionMachine") {
      setInputs({
        ...inputs,
        isProductionMachine: checked ? 1 : 0,
      });
    }
  };

  const handleDate = (value: any) => {
    setInputs({ ...inputs, installationDate: value });
  };

  const handleAutocomplete = (value: any, field: string, rowId?: number) => {
    switch (field) {
      case "machineGroup":
        setInputs({ ...inputs, selecetdMachineGroup: value });
        break;
      case "department":
        setInputs({ ...inputs, selecetdDepartment: value });
        break;
      case "uom":
        setInputs({ ...inputs, selectedUom: value });
        break;
      case "shift":
        setInputs({ ...inputs, selectedShift: value });
        break;
      case "work":
        setInputs({ ...inputs, selectedWorkCenter: value });
        break;
      case "lineNumber":
        setInputs({ ...inputs, selectedLineNumber: value });
        break;
      case "cost":
        setInputs({ ...inputs, selectedCostCenter: value });
        break;
      case "asset":
        setInputs({ ...inputs, selectedAsset: value });
        GetAssetData(value?.id);
        break;
      case "specification":
        if (rowId !== undefined) {
          const updatedList = specList.map((item) =>
            item.id === rowId ? { ...item, specification: value } : item
          );
          setSpecList(updatedList);

          // const selectedRow = updatedList.find((item) => item.id === rowId);
          // if (selectedRow) {
          //   setSpecValue(selectedRow);
          // }
        }
        break;

      default:
        break;
    }
  };

  const GetAssetData = async (id: number | string) => {
    try {
      const response = await Apirequest(
        MainConfig.Machine.AssetByMachine.endpoint.replace(
          "{assetId}",
          id.toString()
        ),
        MainConfig.Machine.AssetByMachine.method,
        null,
        "main"
      ).then((res) => res.data);
      setAssetSpecData(response?.data?.data || []);
    } catch (err) {
      console.log(err);
    }
  };

  const GetMachineMasterData = async () => {
    try {
      setLoading(true);
      const response = await Apirequest(
        MainConfig.Machine.MachineMaster.endpoint.replace(
          "{searchTerm}",
          search
        ),
        MainConfig.Machine.MachineMaster.method,
        null,
        "main"
      ).then((res) => res.data);
      const { totalCount, statusCode, data } = response;
      if (statusCode === 200 || statusCode === 201) {
        setCount(totalCount);
        setMachineMasterData(data);
        setLoading(false);
      } else {
        setMachineMasterData([]);
        setLoading(false);
      }
    } catch (err) {
      setLoading(false);
      console.log(err);
    }
  };

  React.useEffect(() => {
    const filtered =
      value === "0"
        ? machineMasterData.filter((item) => item.isProductionMachine === 1)
        : machineMasterData.filter((item) => item.isProductionMachine === 0);

    const start = (page - 1) * size;
    const end = start + size;
    setFilterData(filtered.slice(start, end));
    setCount(filtered.length);
  }, [value, machineMasterData, page, size]);

  React.useEffect(() => {
    initFlag && search !== "" ? GetMachineMasterData() : GetMachineMasterData();
  }, [debouncedSearchTerm]);

  useEffect(() => {
    if (inputs.selecetdMachineGroup?.id) {
      GetProductionDepartment(inputs.selecetdMachineGroup.id);
    }
  }, [inputs.selecetdMachineGroup]);

  const GetProductionDepartment = async (id: number | string) => {
    try {
      const response = await Apirequest(
        MainConfig.Machine.MachineGroupById.endpoint.replace(
          "{Id}",
          id.toString()
        ),
        MainConfig.Machine.MachineGroupById.method,
        null,
        "main"
      ).then((res) => res.data);
      setInputs({ ...inputs, prodDept: response?.data?.departmentName });
    } catch (err) {
      console.log(err);
    }
  };
  const handleSubmit = async () => {
    if (isSubmitting()) return;
    const requiredFields = [
      { key: "machineCode", label: "Machine Code" },
      { key: "machineName", label: "Machine Name" },
      { key: "selecetdMachineGroup", label: "Machine Group" },
      { key: "selectedUom", label: "UOM" },
      { key: "selectedShift", label: "Shift" },
      { key: "selectedWorkCenter", label: "Work Center" },
      { key: "selectedCostCenter", label: "Cost Center" },
      { key: "installationDate", label: "Installation Date" },
      { key: "selectedLineNumber", label: "Line Number" },
      { key: "selectedAsset", label: "Asset" },
    ];

    // validate required fields
    const missingFields = requiredFields.filter(({ key }) => {
      const value = inputs[key as keyof CreateMachineInputs];
      return (
        value === null ||
        value === undefined ||
        (typeof value === "string" && value.trim() === "") ||
        (typeof value === "object" && Object.keys(value).length === 0)
      );
    });

    // validate specifications
    const specErrors = specList.filter(
      (item) =>
        item.specification?.id &&
        (!item.specValue || item.specValue.trim() === "")
    );

    if (missingFields.length > 0 || specErrors.length > 0) {
      if (missingFields.length > 0) {
        toast.error(
          `Please fill required fields: ${missingFields
            .map((f) => f.label)
            .join(", ")}`
        );
      }

      if (specErrors.length > 0) {
        setSpecList((prev) =>
          prev.map((item) =>
            specErrors.some((err) => err.id === item.id)
              ? { ...item, showError: true }
              : { ...item, showError: false }
          )
        );
        toast.error("Please provide all specification values.");
      }

      return;
    }

    setSpecList((prev) => prev.map((item) => ({ ...item, showError: false })));

    startLoading();
    try {
      const machineId = editFlag ? await UpdateMachine() : await AddMachine();
      if (!machineId) {
        return;
      }

      if (!editFlag) {
        const specsToPost = specList.filter(
          (item) => item.specification?.id && item.specValue?.trim() !== ""
        );

        if (specsToPost.length > 0) {
          const addSpecs = specsToPost.map((item) => ({
            specificationId: item.specification!.id,
            machineId,
            specificationValue: item.specValue ?? "",
          }));

          await AddSpecification({ specifications: addSpecs });
        }
      }

      toast.success(
        editFlag
          ? "Machine updated successfully"
          : "Machine created successfully"
      );
    } catch (err) {
      console.error("Error in handleSubmit (Machine):", err);
      toast.error("An error occurred while saving machine details");
    } finally {
      stopLoading();
    }
  };

  const AddMachine = async (): Promise<number | null> => {
    try {
      startLoading();
      const body = {
        machineCode: inputs.machineCode?.trim()?.toUpperCase(),
        machineName: inputs.machineName
          ?.trim()
          .replace(/\b\w/g, (char) => char.toUpperCase()),
        machineGroupId: inputs.selecetdMachineGroup?.id,
        unitId: userValue.unitId,
        isActive: inputs.isActive,
        isProductionMachine: inputs.isProductionMachine,
        departmentId: inputs.selecetdDepartment?.id,
        productionCapacity: Number(inputs.productionCapacity),
        uomId: inputs.selectedUom?.id,
        shiftMasterId: inputs.selectedShift?.id,
        costCenterId: inputs.selectedCostCenter?.id,
        workCenterId: inputs.selectedWorkCenter?.id,
        installationDate: dayjs(inputs.installationDate).format("YYYY-MM-DD"),
        assetId: inputs.selectedAsset?.id,
        lineNo: inputs.selectedLineNumber?.id,
      };

      const { endpoint, method } = MainConfig.Machine.AddMachine;

      const response = await Apirequest(endpoint, method, body, "main").then(
        (res) => res.data
      );

      if (response.statusCode === 200 || response.statusCode === 201) {
        toast.success(response.message);
        setOpen(false);
        GetMachineMasterData();
        return response.data ?? null;
      } else {
        toast.error(response.message);
        if (Array.isArray(response.errors) && response.errors.length > 0) {
          setErrorModalOpen(true);
          setErrorMessages(response.errors);
        }
        GetMachineMasterData();
        return null;
      }
    } catch (err) {
      console.log(err);
      stopLoading();
      toast.error("Unexpected error occurred while adding machine.");
      return null;
    } finally {
      stopLoading();
    }
  };

  const UpdateMachine = async (): Promise<number | null> => {
    try {
      startLoading();
      const machineId = inputs.id;
      const body = {
        id: machineId,
        machineCode: inputs.machineCode?.trim()?.toUpperCase(),
        machineName: inputs.machineName
          ?.trim()
          .replace(/\b\w/g, (char) => char.toUpperCase()),
        machineGroupId: inputs.selecetdMachineGroup?.id,
        unitId: userValue.unitId,
        isActive: inputs.isActive,
        isProductionMachine: inputs.isProductionMachine,
        departmentId: inputs.selecetdDepartment?.id,
        productionCapacity: Number(inputs.productionCapacity),
        uomId: inputs.selectedUom?.id,
        shiftMasterId: inputs.selectedShift?.id,
        costCenterId: inputs.selectedCostCenter?.id,
        workCenterId: inputs.selectedWorkCenter?.id,
        installationDate: dayjs(inputs.installationDate).format("YYYY-MM-DD"),
        assetId: inputs.selectedAsset?.id,
        lineNo: inputs.selectedLineNumber?.id,
      };

      const { endpoint, method } = MainConfig.Machine.UpdateMachine;
      const response = await Apirequest(endpoint, method, body, "main").then(
        (res) => res.data
      );

      if (response.statusCode === 200 || response.statusCode === 201) {
        toast.success(response.message);
        setOpen(false);
        GetMachineMasterData();
        const validSpecs = specList.filter(
          (item) =>
            item.specification?.id &&
            item.specValue &&
            item.specValue.trim() !== ""
        );

        const newSpecs = validSpecs
          .filter((item) => item.isNew || !item.id)
          .map((item) => ({
            specificationId: item.specification!.id,
            machineId,
            specificationValue: item.specValue ?? "",
          }));

        const existingSpecs = validSpecs
          .filter((item) => !item.isNew && item.id)
          .map((item) => ({
            specificationId: item.specification!.id,
            machineId,
            specificationValue: item.specValue ?? "",
          }));

        if (existingSpecs.length > 1) {
          await UpdateSpecification({ specifications: existingSpecs });
        }

        if (newSpecs.length > 0) {
          await AddSpecification({ specifications: newSpecs });
        }

        return response.data ?? null;
      } else {
        toast.error(response.message);
        if (Array.isArray(response.errors) && response.errors.length > 0) {
          setErrorModalOpen(true);
          setErrorMessages(response.errors);
        }
        return null;
      }
    } catch (err) {
      console.error("UpdateMachine error:", err);
      stopLoading();
      toast.error("Unexpected error occurred while updating machine.");
      GetMachineMasterData();
      return null;
    } finally {
      stopLoading();
    }
  };

  const AddSpecification = async (body: {
    specifications: {
      specificationId: number;
      machineId: number;
      specificationValue: string;
    }[];
  }) => {
    try {
      startLoading();
      const { endpoint, method } =
        MainConfig.MachineSpecification.AddSpecification;
      const response = await Apirequest(endpoint, method, body, "main").then(
        (res) => res.data
      );

      if (response.statusCode === 200 || response.statusCode === 201) {
        await GetAllGetSpecification(body.specifications[0].machineId);
      } else {
        toast.error(response.message);

        if (Array.isArray(response.errors) && response.errors.length > 0) {
          setErrorModalOpen(true);
          setErrorMessages(response.errors);
        }
        GetMachineMasterData();
      }
    } catch (err) {
      console.error("AddSpecification error:", err);
      startLoading();
      setLoading(false);
    } finally {
      stopLoading();
    }
  };

  const UpdateSpecification = async (body: {
    specifications: {
      specificationId: number;
      machineId: number;
      specificationValue: string;
    }[];
  }) => {
    try {
      startLoading();
      const { endpoint, method } =
        MainConfig.MachineSpecification.UpdateSpecification;
      const response = await Apirequest(endpoint, method, body, "main").then(
        (res) => res.data
      );

      if (response.statusCode === 200 || response.statusCode === 201) {
        await GetAllGetSpecification(body.specifications[0].machineId);
      } else {
        setErrorMessages(response.errors);
        setErrorModalOpen(true);
        GetMachineMasterData();
      }
    } catch (err) {
      console.error("UpdateSpecification error:", err);
      stopLoading();
      setLoading(false);
    }
  };

  const handleEdit = (row: any) => {
    setEditFlag(true);
    console.log(row);

    setOpen(true);
    setInputs({
      ...inputs,
      machineCode: row.machineCode?.trim(),
      machineName: row.machineName?.trim(),
      productionCapacity: row?.productionCapacity,
      installationDate: dayjs(row?.installationDate),
      isActive: row.isActive,
      isProductionMachine: row.isProductionMachine,
      selecetdMachineGroup:
        Array.isArray(inputs.machineGroupData) &&
        inputs.machineGroupData.find((i) => i.id === row.machineGroupId),
      selecetdDepartment:
        Array.isArray(inputs.departmentData) &&
        inputs.departmentData.find((i) => i.id === row?.departmentId),
      selectedUom:
        Array.isArray(inputs.uomData) &&
        inputs.uomData.find((i) => i.id === row?.uomId),
      selectedShift:
        Array.isArray(inputs.shiftData) &&
        inputs.shiftData.find((i) => i.id === row?.shiftMasterId),
      selectedWorkCenter:
        Array.isArray(inputs.workCenterData) &&
        inputs.workCenterData.find((i) => i.id === row?.workCenterId),
      selectedCostCenter:
        Array.isArray(inputs.costCenterData) &&
        inputs.costCenterData.find((i) => i.id === row?.costCenterId),
      selectedAsset:
        Array.isArray(inputs.assetData) &&
        inputs.assetData.find((i) => i.id === row?.assetId),
      selectedLineNumber:
        Array.isArray(inputs.lineNumberData) &&
        inputs.lineNumberData.find((i) => i.id === row?.lineNo),
      id: row?.id,
    });
    GetAssetData(row?.assetId);
    GetAllGetSpecification(row.id);
  };

  const handleDelete = (id: number) => {
    setInputs({ ...inputs, id: id });
    setDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    DeleteMachine();
    setDeleteOpen(false);
  };

  const DeleteMachine = async () => {
    try {
      const body = {
        id: inputs.id,
      };
      const { endpoint, method } = MainConfig.Machine.DeleteMachine;
      const result = await Apirequest(
        endpoint.replace("{id}", `${inputs.id}`),
        method,
        body,
        "main"
      ).then((res) => res.data);
      toast.success(result?.message);
      GetMachineMasterData();
    } catch (err) {
      console.log(err);
      GetMachineMasterData();
    }
  };

  const columns = [
    {
      field: "s_no",
      headerName: "S.No",
      minWidth: 150,
      flex: 1,
      sortable: true,
      renderCell: (params: any) => {
        return (
          (page - 1) * size + (params.api.getAllRowIds().indexOf(params.id) + 1)
        );
      },
    },
    {
      field: "machine_code",
      headerName: "Code",
      flex: 1,
      minWidth: 150,
      valueGetter: (value: any, row: any) =>
        `${row?.machineCode.toUpperCase() || ""}`,
    },
    {
      field: "machine_name",
      headerName: "Name",
      sortable: true,
      flex: 2,
      valueGetter: (value: any, row: any) =>
        `${row?.machineName || ""}`.replace(/\b\w/g, (char) =>
          char.toUpperCase()
        ),
    },
    {
      field: "machine_group",
      headerName: "Machine Group",
      sortable: true,
      flex: 2,
      valueGetter: (value: any, row: any) => `${row?.machineGroupName || ""}`,
    },
    {
      field: "production_Department",
      headerName: "ProductionDepartment",
      sortable: true,
      flex: 2,
      valueGetter: (value: any, row: any) =>
        `${row?.productionDepartmentName || ""}`.replace(/\b\w/g, (char) =>
          char.toUpperCase()
        ),
    },
    {
      field: "make",
      headerName: "Make",
      sortable: true,
      flex: 2,
      valueGetter: (value: any, row: any) =>
        `${row?.specificationName || ""}`.replace(/\b\w/g, (char) =>
          char.toUpperCase()
        ),
    },
    {
      field: "isActive",
      headerName: "Status",
      flex: 1,
      minWidth: 150,
      valueGetter: (value: any, row: any) =>
        `${row?.isActive ? "Active" : "Inactive"}`,
    },
    {
      field: "installationDate",
      headerName: "Installation Date",
      flex: 2,
      minWidth: 150,
      valueGetter: (value: any, row: any) =>
        `${dayjs(row?.installationDate).format("DD-MM-YYYY")}`,
    },
    {
      field: "actions",
      headerName: "Actions",
      flex: 1,
      minWidth: 150,
      sortable: false,
      filterable: false,
      renderCell: (params: any) => (
        <Box
          component={"div"}
          display={"flex"}
          alignItems={"center"}
          gap={2}
          height={"100%"}
        >
          {permissions.canUpdate && (
            <FiEdit
              fontSize={20}
              color="black"
              cursor={"pointer"}
              onClick={() => handleEdit(params.row)}
            />
          )}

          {permissions.canDelete && (
            <RiDeleteBin6Line
              fontSize={20}
              color="red"
              cursor={"pointer"}
              onClick={() => handleDelete(params.row.id)}
            />
          )}
        </Box>
      ),
    },
  ];

  const getFilteredSpecOptions = (
    currentSpec: SpecificationOption | null,
    allOptions: SpecificationOption[],
    currentRowId: number,
    allRows: AdditionalSpec[] | null | undefined
  ): SpecificationOption[] => {
    if (!Array.isArray(allRows)) return allOptions;

    const selectedSpecIds = allRows
      .filter((row) => row.specification?.id && row.id !== currentRowId)
      .map((row) => row.specification!.id);

    return allOptions.filter(
      (option) =>
        !selectedSpecIds.includes(option.id) || option.id === currentSpec?.id
    );
  };

  const [specList, setSpecList] = useState<AdditionalSpec[]>([]);
  useEffect(() => {
    if (specList.length === 0) {
      setSpecList([
        {
          id: Date.now(),
          specification: null,
          machine: "",
          specValue: "",
          selectedSpecification: null,
          showError: false,
          isNew: true,
        },
      ]);
    }
  }, [specList.length]);

  const handleAddSpec = useCallback(() => {
    const hasUnselected = specList.some(
      (item) => !item.specification || !item.specification.id
    );

    if (hasUnselected) {
      toast.error(
        "Please select the current specification before adding a new one."
      );
      return;
    }

    const selectedIds = specList
      .map((row) => row.specification?.id)
      .filter((id): id is number => Boolean(id));

    const availableSpecs = Specification.filter(
      (option: any) => !selectedIds.includes(option.id)
    );

    if (availableSpecs.length === 0) {
      toast.error("No available specifications to add.");
      return;
    }

    setSpecList((prev): AdditionalSpec[] => [
      ...prev,
      {
        id: Date.now(),
        specification: null,
        machine: "",
        specValue: "",
        selectedSpecification: 0,
        showError: false,
        isNew: true,
      },
    ]);
  }, [specList, Specification]);

  const handleDeleteSpec = async (id: number) => {
    const specToDelete = specList.find((item) => item.id === id);

    if (!specToDelete) return;
    setSpecList((prev) => prev.filter((item) => item.id !== id));
  };

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
            parent={"Maintenance Master"}
            child={"Machine Master"}
            path=""
          />
        </Box>
        <Box
          display={"flex"}
          justifyContent={"space-between"}
          alignItems={"center"}
          flexWrap={"wrap"}
          gap={2}
        >
          <GlobalSearch
            placeholder="search machine"
            width={300}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setSearch(e.target.value)
            }
          />
          <Box className="d-flex-center" gap={2}>
            {permissions.canAdd && (
              <MuiButton
                startIcon={<GoPlus />}
                onClick={handleClickOpen}
                variant="contained"
              >
                Create
              </MuiButton>
            )}
          </Box>
        </Box>
      </Box>

      <Box sx={{ width: "100%", my: 2, height: 700 }} className="main-table">
        <TabContext value={value}>
          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <TabList
              onChange={handleChangeTab}
              aria-label="lab API tabs example"
            >
              <Tab label="Production  Machine" value="0" />
              <Tab label="Non Production  Machine" value="1" />
            </TabList>
          </Box>
          {loading ? (
            <SkeletonLoader />
          ) : (
            <MuiTable
              rows={filterData}
              columns={columns}
              rowCount={count}
              paginationMode="server"
              paginationModel={{
                page: page - 1,
                pageSize: size,
              }}
              onPaginationModelChange={({ page: newPage, pageSize }) => {
                setPage(newPage + 1);
                setSize(pageSize);
              }}
              pageSizeOptions={[15, 30, 50]}
              disableRowSelectionOnClick
              slots={{
                noRowsOverlay: () => <NoDataFound />,
              }}
            />
          )}
        </TabContext>
      </Box>

      <CreateMachineMaster
        open={open}
        close={handleClose}
        inputs={inputs}
        handleChange={handleChange}
        handleSwitch={handleSwitch}
        handleAutocomplete={handleAutocomplete}
        handleDate={handleDate}
        handleSubmit={handleSubmit}
        error={error}
        editFlag={editFlag}
        assetSpecData={assetSpecData}
        handleAddSpec={handleAddSpec}
        handleDeleteSpec={handleDeleteSpec}
        setSpecList={setSpecList}
        specList={specList}
        Specification={Specification}
        getFilteredSpecOptions={getFilteredSpecOptions}
        AddSpecification={AddSpecification}
      />
      <ErrorModal
        open={errorModalOpen}
        onClose={() => setErrorModalOpen(false)}
        errors={errorMessages}
      />
      <DeleteConfirmation
        open={deleteOpen}
        close={() => setDeleteOpen(false)}
        handleDelete={handleConfirmDelete}
      />
    </div>
  );
}

export default MachineMasterPage;
