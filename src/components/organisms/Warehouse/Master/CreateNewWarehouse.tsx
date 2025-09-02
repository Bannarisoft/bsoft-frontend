"use client";

import * as React from "react";
import Box from "@mui/material/Box";
import { Autocomplete, Chip, Grid2, InputAdornment, TextField } from "@mui/material";
import { MuiButton, MuiInputField, MuiText } from "bsoft-base-elements";
import {
    MdOutlinePowerSettingsNew,
    MdOutlineGroups,
    MdWarehouse,
    MdOutlineDeleteSweep,
    MdLocalShipping,
    MdInventory2,
    MdOutlineAccountBalance,
    MdOutlineContactPhone,
    MdOutlineMap,
} from "react-icons/md";
import { TbBuildingWarehouse } from "react-icons/tb";
import { useRecoilValue } from "recoil";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { RiSettings3Line } from "react-icons/ri";
import IconBreadcrumbs from "../../../molecules/AdminLayout/BreadCrumbs";
import SectionCard from "../../../molecules/Warehouse/components/SectionCard";
import ToggleTile from "../../../molecules/Warehouse/components/ToggleTile";
import { UserData } from "../../../../utils/atoms";
import ConfigWH from "../../../../../src/utils/warehouse.api.json";
import InventoryConfig from "../../../../../src/utils/inventory.api.json";
import Config from "../../../../../src/utils/config.api.json";
import { Apirequest, emailRegex } from "../../../../utils/lib";
import { Option, FieldDef, AutocompleteSources, Props } from "../../../../types/warehouseTypes";
import { StyledAutocomplete } from "../../../atoms/ModernComponents/CustomAutocomplete";

const asArray = (v: any): any[] => (Array.isArray(v) ? v : Array.isArray(v?.data) ? v.data : []);
const toIntOrZero = (v: any): number => {
    const n = Number(v);
    if (!Number.isFinite(n) || n <= 0 || n > 2147483647) return 0;
    return Math.trunc(n);
};
const toNumberOrZero = (v: any): number => {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
};
function normalize(input: any, idKeys: string[], labelKeys: string[]): Option[] {
    const list = asArray(input);
    const out: Option[] = [];
    const seen = new Set<number>();
    for (const r of list) {
        const idKey = idKeys.find((k) => r?.[k] !== undefined);
        const labelKey = labelKeys.find((k) => r?.[k] !== undefined);
        const id = Number(idKey ? r[idKey] : NaN);
        const label = String(labelKey ? r[labelKey] : "").trim();
        if (Number.isFinite(id) && id > 0 && label && !seen.has(id)) {
            out.push({ id, label });
            seen.add(id);
        }
    }
    return out.sort((a, b) => a.label.localeCompare(b.label));
}
const getFirstNumber = (obj: any, keys: string[]): number | null => {
    for (const k of keys) {
        const n = Number(obj?.[k]);
        if (Number.isFinite(n) && n > 0) return Math.trunc(n);
    }
    return null;
};
const byId = (arr: Option[], id?: number | null) => arr.find((o) => Number(o.id) === Number(id ?? -1)) ?? null;
const CreateNewWarehouse: React.FC<Props> = ({ warehouseId }) => {
    const router = useRouter();
    const user = useRecoilValue(UserData);
    const [values, setValues] = React.useState({
        warehouseName: "",
        unitId: user?.unitId ?? null,
        parentWarehouseGroupId: null as number | null,
        parentWarehouseGroupName: "",
        isGroup: false,
        isVirtualWarehouse: false,
        warehouseTypeId: null as number | null,
        storageTypeId: null as number | null,
        areaTypeId: null as number | null,
        operationTypeId: null as number | null,
        contactPersonName: "",
        mobileNumber: "",
        email: "",
        addressLine1: "",
        addressLine2: "",
        cityId: null as number | null,
        stateId: null as number | null,
        countryId: null as number | null,
        pincode: "",
        isScrapWarehouse: false,
        isTransitWarehouse: false,
        maxCapacity: "",
        capacityUomId: null as number | null,
        accountId: null as number | null,
        accountName: "",
        defaultForStockEntry: false,
        allowedItemGroupIds: [] as number[],
        isActive: true,
    });
    const [errors, setErrors] = React.useState<string[]>([]);
    const [sources, setSources] = React.useState<AutocompleteSources>({
        warehouseTypes: [],
        storageTypes: [],
        areaTypes: [],
        operationTypes: [],
        capacityUoms: [],
        itemGroups: [],
        parentWHOptions: [],
        countryData: [],
        stateData: [],
        cityData: [],
    });
    const [selectedCountry, setSelectedCountry] = React.useState<any>(null);
    const [selectedState, setSelectedState] = React.useState<any>(null);
    const [selectedCity, setSelectedCity] = React.useState<any>(null);
    const twoCol = { xs: 12, sm: 6, md: 6, lg: 6 };
    const fullRow = { xs: 12, sm: 12, md: 12, lg: 12 };

    const Fields: Array<FieldDef> = [
        { section: "general", label: "Warehouse Name", name: "warehouseName", kind: "text", isRequired: true, size: twoCol, maxLength: 100 },
        { section: "general", label: "Unit", name: "unitId", kind: "unit-readonly", isRequired: true, size: twoCol },
        { section: "general", label: "Parent Warehouse Group", name: "parentWarehouseGroupId", kind: "autocomplete", size: twoCol, optionsKey: "parentWHOptions" },
        { section: "general", label: "Warehouse Type", name: "warehouseTypeId", kind: "autocomplete", isRequired: true, size: twoCol, optionsKey: "warehouseTypes" },
        { section: "general", label: "Storage Type", name: "storageTypeId", kind: "autocomplete", isRequired: true, size: twoCol, optionsKey: "storageTypes" },
        { section: "general", label: "Area Type", name: "areaTypeId", kind: "autocomplete", isRequired: true, size: twoCol, optionsKey: "areaTypes" },
        { section: "general", label: "Operation Type", name: "operationTypeId", kind: "autocomplete", size: twoCol, optionsKey: "operationTypes" },
        { section: "contact", label: "Contact Person Name", name: "contactPersonName", kind: "text", isRequired: true, size: twoCol, maxLength: 80 },
        { section: "contact", label: "Mobile Number", name: "mobileNumber", kind: "text", isRequired: true, size: twoCol, maxLength: 10 },
        { section: "contact", label: "Email", name: "email", kind: "text", isRequired: true, size: twoCol, maxLength: 120 },
        { section: "address", label: "Address Line 1", name: "addressLine1", kind: "text", isRequired: true, size: fullRow },
        { section: "address", label: "Address Line 2", name: "addressLine2", kind: "text", size: fullRow },
        { section: "address", label: "Pincode", name: "pincode", kind: "pincode", isRequired: true, size: { xs: 12, sm: 4, md: 3, lg: 3 } },
        { section: "address", label: "Country", name: "countryId", kind: "autocomplete", isRequired: true, size: { xs: 12, sm: 3, md: 4, lg: 3 }, optionsKey: "countryData" },
        { section: "address", label: "State", name: "stateId", kind: "autocomplete", isRequired: true, size: { xs: 12, sm: 4, md: 3, lg: 3 }, optionsKey: "stateData" },
        { section: "address", label: "City", name: "cityId", kind: "autocomplete", isRequired: true, size: { xs: 12, sm: 4, md: 3, lg: 3 }, optionsKey: "cityData" },
        { section: "capacity", label: "Max Capacity", name: "maxCapacity", kind: "number", size: twoCol },
        { section: "capacity", label: "Capacity UOM", name: "capacityUomId", kind: "autocomplete", size: twoCol, optionsKey: "capacityUoms" },
        { section: "itemgroups", label: "Allowed Item Groups", name: "allowedItemGroupIds", kind: "autocomplete-multi", size: fullRow, optionsKey: "itemGroups", disableErrorText: true },
    ];
    const help = (name: string, label: string) => (errors.includes(name) ? `${label} is required` : "");
    const setField = (name: keyof typeof values, v: any) => {
        setValues((prev) => ({ ...prev, [name]: v }));
        setErrors((prev) => prev.filter((k) => k !== name));
    };
    const handlePincodeChange = (raw: string) => {
        const pin = (raw || "").replace(/\D/g, "").slice(0, 6);
        setField("pincode", pin);
    };
    const validate = () => {
        const e: string[] = [];
        if (!values.warehouseName.trim()) e.push("warehouseName");
        if (!values.warehouseTypeId) e.push("warehouseTypeId");
        if (!values.storageTypeId) e.push("storageTypeId");
        if (!values.areaTypeId) e.push("areaTypeId");
        if (!Number.isFinite(Number(values.unitId)) || Number(values.unitId) <= 0) e.push("unitId");
        if (!values.contactPersonName.trim()) e.push("contactPersonName");
        if (!/^\d{10}$/.test(values.mobileNumber)) e.push("mobileNumber");
        if (!emailRegex.test(values.email)) e.push("email");
        if (!values.countryId) e.push("countryId");
        if (!values.stateId) e.push("stateId");
        if (!values.cityId) e.push("cityId");
        if (!values.addressLine1.trim()) e.push("addressLine1");
        if (!/^\d{6}$/.test(values.pincode)) e.push("pincode");
        if (values.maxCapacity && !/^\d+(\.\d+)?$/.test(values.maxCapacity)) e.push("maxCapacity");
        return e;
    };
    const buildPayload = () => ({
        WarehouseName: values.warehouseName.trim(),
        UnitId: toIntOrZero(values.unitId ?? user?.unitId),
        ParentWarehouseId: values.parentWarehouseGroupId === 0 ? null : values.parentWarehouseGroupId,
        IsGroup: Boolean(values.isGroup),
        IsVirtualWarehouse: Boolean(values.isVirtualWarehouse),
        WarehouseTypeId: toIntOrZero(values.warehouseTypeId),
        StorageTypeId: toIntOrZero(values.storageTypeId),
        AreaTypeId: toIntOrZero(values.areaTypeId),
        OperationTypeId: toIntOrZero(values.operationTypeId),
        CapacityUOMId: toIntOrZero(values.capacityUomId),
        AccountId: toIntOrZero(values.accountId),
        ContactPersonName: values.contactPersonName.trim(),
        MobileNumber: values.mobileNumber.trim(),
        Email: values.email.trim(),
        AddressLine1: values.addressLine1.trim(),
        AddressLine2: values.addressLine2.trim(),
        CityId: toIntOrZero(values.cityId),
        StateId: toIntOrZero(values.stateId),
        CountryId: toIntOrZero(values.countryId),
        Pincode: (values.pincode ?? "").trim(),
        IsScrapWarehouse: Boolean(values.isScrapWarehouse),
        IsTransitWarehouse: Boolean(values.isTransitWarehouse),
        MaxCapacity: toNumberOrZero(values.maxCapacity),
        IsDefaultStockEntry: Boolean(values.defaultForStockEntry),
        IsActive: values.isActive ? 1 : 0,
        AllowedItemGroupIds: (values.allowedItemGroupIds || []).map((x) => toIntOrZero(x)).filter((n) => n > 0),
    });
    const loadMisc = async (type: "WarehouseType" | "StorageType" | "AreaType" | "OperationType") => {
        try {
            const { endpoint, method } = ConfigWH.WarehouseMisc;
            const url = endpoint.replace("{type}", type);
            const res = await Apirequest(url, method, null, "inventory").then((r) => r.data);
            const opts = normalize(
                res,
                ["id", "Id", "typeId", "TypeId"],
                ["typeName", "TypeName", "name", "Name", "description", "Description", "label", "Label", "displayName", "DisplayName"]
            );
            setSources((s) => ({
                ...s,
                warehouseTypes: type === "WarehouseType" ? opts : s.warehouseTypes,
                storageTypes: type === "StorageType" ? opts : s.storageTypes,
                areaTypes: type === "AreaType" ? opts : s.areaTypes,
                operationTypes: type === "OperationType" ? opts : s.operationTypes,
            }));
        } catch {
            setSources((s) => ({
                ...s,
                warehouseTypes: type === "WarehouseType" ? [] : s.warehouseTypes,
                storageTypes: type === "StorageType" ? [] : s.storageTypes,
                areaTypes: type === "AreaType" ? [] : s.areaTypes,
                operationTypes: type === "OperationType" ? [] : s.operationTypes,
            }));
        }
    };
    const loadCapacityUoms = async () => {
        try {
            const { endpoint, method } = InventoryConfig.Uom.GetUomName;
            const res = await Apirequest(endpoint, method, null, "inventory").then((r) => r.data);
            const opts = normalize(res, ["uomId", "UomId", "id", "Id"], ["uomName", "UomName", "name", "Name", "code", "Code"]);
            setSources((s) => ({ ...s, capacityUoms: opts }));
        } catch {
            setSources((s) => ({ ...s, capacityUoms: [] }));
        }
    };
    const loadItemGroups = async () => {
        try {
            const { endpoint, method } = InventoryConfig.ItemGroup.GetByGroup;
            const res = await Apirequest(endpoint, method, null, "inventory").then((r) => r.data);
            setSources((s) => ({ ...s, itemGroups: normalize(res, ["id", "Id"], ["itemGroupName", "ItemGroupName", "name", "Name"]) }));
        } catch {
            setSources((s) => ({ ...s, itemGroups: [] }));
        }
    };
    const GetParentWH = async () => {
        try {
            const { endpoint, method } = ConfigWH.Warehouse.GetParentWarehouseWH;
            const result = await Apirequest(endpoint, method, null, "warehouse").then((r) => r.data);
            const opts = normalize(
                result?.data ?? result,
                ["id", "Id", "warehouseId", "WarehouseId"],
                ["parentWarehouseName", "ParentWarehouseName", "warehouseName", "WarehouseName", "warehouseCode", "WarehouseCode"]
            );
            setSources((s) => ({ ...s, parentWHOptions: opts }));
        } catch {
            setSources((s) => ({ ...s, parentWHOptions: [] }));
        }
    };
    const GetCountryList = async () => {
        try {
            const { endpoint, method } = Config.Countries.getCountry;
            let body: any;
            try {
                body = await Apirequest(endpoint, method).then((r) => r.data);
            } catch (err: any) {
                body = err?.response?.data ?? {};
            }
            setSources((s) => ({ ...s, countryData: asArray(body?.data) || asArray(body) || [] }));
        } catch {
            setSources((s) => ({ ...s, countryData: [] }));
        }
    };
    const GetState = async (countryId: number) => {
        try {
            const { endpoint, method } = Config.State.getById;
            let body: any;
            try {
                body = await Apirequest(endpoint.replace("{countryId}", String(countryId)), method).then((r) => r.data);
            } catch (err: any) {
                body = err?.response?.data ?? {};
            }
            setSources((s) => ({ ...s, stateData: asArray(body?.data) || asArray(body) || [] }));
        } catch {
            setSources((s) => ({ ...s, stateData: [] }));
        }
    };
    const GetCity = async (stateId: number) => {
        try {
            const { endpoint, method } = Config.City.getById;
            let body: any;
            try {
                body = await Apirequest(endpoint.replace("{stateId}", String(stateId)), method).then((r) => r.data);
            } catch (err: any) {
                body = err?.response?.data ?? {};
            }
            setSources((s) => ({ ...s, cityData: asArray(body?.data) || asArray(body) || [] }));
        } catch {
            setSources((s) => ({ ...s, cityData: [] }));
        }
    };
    const loadWarehouseById = async (id: string) => {
        try {
            const { endpoint, method } = ConfigWH.Warehouse.GetWarehouseMasterid;
            const res = await Apirequest(endpoint.replace("{id}", id), method, null, "warehouse").then(
                (r) => r.data?.data ?? r.data
            );
            if (!res) return;
            setValues((prev) => ({
                ...prev,
                warehouseName: res.warehouseName ?? "",
                unitId: res.unitId ?? prev.unitId,
                parentWarehouseGroupId: res.parentWarehouseId ?? null,
                parentWarehouseGroupName: res.parentWarehouseGroupName ?? "",
                isGroup: Boolean(res.isGroup),
                isVirtualWarehouse: Boolean(res.isVirtualWarehouse),
                warehouseTypeId: res.warehouseTypeId ?? null,
                storageTypeId: res.storageTypeId ?? null,
                areaTypeId: res.areaTypeId ?? null,
                operationTypeId: res.operationTypeId ?? null,
                contactPersonName: res.contactPersonName ?? "",
                mobileNumber: res.mobileNumber ?? "",
                email: res.email ?? "",
                addressLine1: res.addressLine1 ?? "",
                addressLine2: res.addressLine2 ?? "",
                cityId: toIntOrZero(res.cityId),
                stateId: toIntOrZero(res.stateId),
                countryId: toIntOrZero(res.countryId),
                pincode: res.pincode ?? "",
                isScrapWarehouse: Boolean(res.isScrapWarehouse),
                isTransitWarehouse: Boolean(res.isTransitWarehouse),
                maxCapacity: res.maxCapacity ? String(res.maxCapacity) : "",
                capacityUomId: res.capacityUOMId ?? res.capacityUomId ?? null,
                accountId: null,
                accountName: "",
                defaultForStockEntry: Boolean(res.isDefaultStockEntry ?? res.defaultForStockEntry),
                allowedItemGroupIds: Array.isArray(res.allowedItemGroupIds)
                    ? res.allowedItemGroupIds.map((x: any) => Number(x)).filter((n: number) => Number.isFinite(n) && n > 0)
                    : [],
                isActive: Number(res.isActive ?? res.IsActive ?? 1) === 1,
            }));
        } catch { }
    };
    React.useEffect(() => {
        loadMisc("WarehouseType");
        loadMisc("StorageType");
        loadMisc("AreaType");
        loadMisc("OperationType");
        loadCapacityUoms();
        loadItemGroups();
        GetParentWH();
        GetCountryList();
        if (warehouseId) loadWarehouseById(warehouseId);
    }, [warehouseId]);

    React.useEffect(() => {
        if (values.countryId) GetState(values.countryId);
    }, [values.countryId]);

    React.useEffect(() => {
        if (values.stateId) GetCity(values.stateId);
    }, [values.stateId]);

    React.useEffect(() => {
        if (values.countryId && sources.countryData.length) {
            const found = sources.countryData.find(
                (c) => getFirstNumber(c, ["id", "Id", "countryId", "CountryId"]) === Number(values.countryId)
            );
            setSelectedCountry(found ?? null);
        }
    }, [sources.countryData, values.countryId]);

    React.useEffect(() => {
        if (values.stateId && sources.stateData.length) {
            const found = sources.stateData.find(
                (s) => getFirstNumber(s, ["id", "Id", "stateId", "StateId"]) === Number(values.stateId)
            );
            setSelectedState(found ?? null);
        }
    }, [sources.stateData, values.stateId]);

    React.useEffect(() => {
        if (values.cityId && sources.cityData.length) {
            const found = sources.cityData.find(
                (c) => getFirstNumber(c, ["id", "Id", "cityId", "CityId"]) === Number(values.cityId)
            );
            setSelectedCity(found ?? null);
        }
    }, [sources.cityData, values.cityId]);

    React.useEffect(() => {
        if (!values.unitId && Number(user?.unitId) > 0) {
            setField("unitId", Number(user.unitId));
        }
    }, [user?.unitId]);
    const addWarehouse = async () => {
        const { endpoint, method } = ConfigWH.Warehouse.AddWarehouseMaster;
        const payload = buildPayload();
        const res = await Apirequest(endpoint, method, payload, "warehouse").then((r) => r.data);
        if (res?.statusCode === 200 || res?.statusCode === 201) {
            toast.success(res?.message ?? "Warehouse created successfully");
            router.push("/warehouse/warehouse-master");
        } else {
            toast.error(res?.message ?? "Failed to create warehouse");
        }
    };
    const updateWarehouse = async (id: string) => {
        const { endpoint, method } = ConfigWH.Warehouse.UpdateWarehouseMaster;
        const body = { Id: toIntOrZero(id), ...buildPayload() };
        const res = await Apirequest(endpoint, method, body, "warehouse").then((r) => r.data);
        if (res?.statusCode === 200 || res?.statusCode === 201) {
            toast.success(res?.message ?? "Warehouse updated successfully");
            router.push("/warehouse/warehouse-master");
        } else {
            toast.error(res?.message ?? "Failed to update warehouse");
        }
    };

    const handleSubmit = () => {
        const e = validate();
        if (e.length) {
            setErrors(e);
            return;
        }
        if (warehouseId) updateWarehouse(warehouseId);
        else addWarehouse();
    };
    const renderField = (f: FieldDef) => {
        const name = f.name;
        const label = f.label;
        const hasErr = errors.includes(name);
        const optionList = (f.optionsKey ? (sources as any)[f.optionsKey] : undefined) ?? [];
        const inputSx = { "& .MuiInputBase-root": { minHeight: 40 } };

        if (f.kind === "unit-readonly") {
            return (
                <TextField
                    fullWidth
                    size="small"
                    value={String(user?.unitName ?? "")}
                    disabled
                    error={hasErr}
                    helperText={hasErr ? "Unit is required" : ""}
                    sx={inputSx}
                />
            );
        }

        if (f.kind === "pincode") {
            return (
                <MuiInputField
                    fullWidth
                    size="small"
                    placeholder="6-digit pincode"
                    value={values.pincode}
                    onChange={(e) => handlePincodeChange(e.target.value)}
                    error={hasErr}
                    helperText={hasErr ? "Pincode is required (6 digits)" : ""}
                    sx={inputSx}
                />
            );
        }

        if (f.kind === "text" || f.kind === "number") {
            const isMobile = name === "mobileNumber";
            return (
                <MuiInputField
                    fullWidth
                    size="small"
                    type={f.kind === "number" ? "number" : "text"}
                    value={String((values as any)[name] ?? "")}
                    onChange={(e) => {
                        let v = e.target.value;
                        if (name === "maxCapacity") v = v.replace(/[^\d.]/g, "");
                        if (isMobile) v = v.replace(/\D/g, "").slice(0, 10);
                        if (f.maxLength) v = v.slice(0, f.maxLength);
                        setField(name, v);
                    }}
                    error={hasErr}
                    helperText={help(name, label)}
                    slotProps={
                        isMobile
                            ? { input: { startAdornment: <InputAdornment position="start">+91</InputAdornment> } }
                            : undefined
                    }
                    sx={inputSx}
                />
            );
        }

        if (f.kind === "autocomplete-multi") {
            const value = (optionList as Option[]).filter((opt) =>
                (values.allowedItemGroupIds || []).some((id) => Number(id) === Number(opt.id))
            );
            return (
                <>
                    <StyledAutocomplete
                        disablePortal
                        multiple
                        disableCloseOnSelect
                        options={optionList as Option[]}
                        value={value}
                        onChange={(_, arr) => setField("allowedItemGroupIds", arr.map((x) => Number(x.id)))}
                        isOptionEqualToValue={(o, v) => Number(o.id) === Number(v?.id)}
                        getOptionLabel={(o) => (o as Option)?.label ?? ""}
                        sx={inputSx}
                        renderTags={(selected, getTagProps) =>
                            selected.map((option, index) => (
                                <Chip
                                    {...getTagProps({ index })}
                                    key={(option as Option).id}
                                    label={(option as Option).label}
                                    variant="outlined"
                                    size="small"
                                />
                            ))
                        }
                        renderInput={(params) => <MuiInputField {...params} size="small" placeholder="Choose item groups" />}
                    />
                    <Box mt={1.5}>
                        <Chip size="small" color="default" variant="outlined" label={`${values.allowedItemGroupIds.length} selected`} />
                    </Box>
                </>
            );
        }

        if (f.kind === "autocomplete") {
            if (name === "countryId") {
                return (
                    <Autocomplete
                        disablePortal
                        options={asArray(sources.countryData)}
                        fullWidth
                        size="small"
                        value={selectedCountry}
                        getOptionLabel={(option: any) => option?.countryName ?? option?.CountryName ?? option?.name ?? ""}
                        onChange={(_, value: any) => {
                            setSelectedCountry(value ?? null);
                            const id = getFirstNumber(value, ["id", "Id", "countryId", "CountryId"]) ?? 0;
                            setField("countryId", id);
                            setSelectedState(null);
                            setSelectedCity(null);
                            setSources((s) => ({ ...s, stateData: [], cityData: [] }));
                            if (id) GetState(id);
                        }}
                        renderOption={(props, option: any) => (
                            <li {...props} key={String(getFirstNumber(option, ["id", "Id", "countryId", "CountryId"]))}>
                                {option?.countryName ?? option?.CountryName ?? option?.name ?? ""}
                            </li>
                        )}
                        isOptionEqualToValue={(o, v) =>
                            getFirstNumber(o, ["id", "Id", "countryId", "CountryId"]) ===
                            getFirstNumber(v, ["id", "Id", "countryId", "CountryId"])
                        }
                        sx={inputSx}
                        renderInput={(params) => (
                            <MuiInputField {...params} name="countryId" error={hasErr} helperText={hasErr ? "Please select a country" : ""} />
                        )}
                    />
                );
            }
            if (name === "stateId") {
                return (
                    <Autocomplete
                        disablePortal
                        options={asArray(sources.stateData)}
                        fullWidth
                        size="small"
                        value={selectedState}
                        onChange={(_, value: any) => {
                            setSelectedState(value ?? null);
                            const id = getFirstNumber(value, ["id", "Id", "stateId", "StateId"]) ?? 0;
                            setField("stateId", id);
                            setSelectedCity(null);
                            setSources((s) => ({ ...s, cityData: [] }));
                            if (id) GetCity(id);
                        }}
                        getOptionLabel={(option: any) => option?.stateName ?? option?.StateName ?? option?.name ?? ""}
                        renderOption={(props, option: any) => (
                            <li {...props} key={String(getFirstNumber(option, ["id", "Id", "stateId", "StateId"]))}>
                                {option?.stateName ?? option?.StateName ?? option?.name ?? ""}
                            </li>
                        )}
                        isOptionEqualToValue={(o, v) =>
                            getFirstNumber(o, ["id", "Id", "stateId", "StateId"]) ===
                            getFirstNumber(v, ["id", "Id", "stateId", "StateId"])
                        }
                        sx={inputSx}
                        renderInput={(params) => (
                            <MuiInputField {...params} error={hasErr} helperText={hasErr ? "Please select a state" : ""} />
                        )}
                    />
                );
            }
            if (name === "cityId") {
                return (
                    <Autocomplete
                        disablePortal
                        options={asArray(sources.cityData)}
                        fullWidth
                        size="small"
                        value={selectedCity}
                        onChange={(_, value: any) => {
                            setSelectedCity(value ?? null);
                            const id = getFirstNumber(value, ["id", "Id", "cityId", "CityId"]) ?? 0;
                            setField("cityId", id);
                        }}
                        getOptionLabel={(option: any) => option?.cityName ?? option?.CityName ?? option?.name ?? ""}
                        renderOption={(props, option: any) => (
                            <li {...props} key={String(getFirstNumber(option, ["id", "Id", "cityId", "CityId"]))}>
                                {option?.cityName ?? option?.CityName ?? option?.name ?? ""}
                            </li>
                        )}
                        isOptionEqualToValue={(o, v) =>
                            getFirstNumber(o, ["id", "Id", "cityId", "CityId"]) ===
                            getFirstNumber(v, ["id", "Id", "cityId", "CityId"])
                        }
                        sx={inputSx}
                        renderInput={(params) => (
                            <MuiInputField {...params} error={hasErr} helperText={hasErr ? "Please select a city" : ""} />
                        )}
                    />
                );
            }

            const list = optionList as Option[];
            return (
                <Autocomplete
                    disablePortal
                    options={list}
                    value={byId(list, (values as any)[name] as any)}
                    onChange={(_, v) => setField(name as any, v?.id ?? null)}
                    isOptionEqualToValue={(o, v) => Number(o.id) === Number((v as Option)?.id)}
                    getOptionLabel={(o) => (o as Option)?.label ?? ""}
                    sx={inputSx}
                    renderInput={(params) => (
                        <MuiInputField {...params} size="small" error={hasErr} helperText={help(name, label)} />
                    )}
                />
            );
        }
        return null;
    };
    const handleCancel = () => router.push("/warehouse/warehouse-master");
    const sectionBlock = (
        section: FieldDef["section"],
        icon: React.ReactNode,
        title: string,
        titleColor: string,
        extra?: React.ReactNode
    ) => (
        <SectionCard icon={icon} title={title} titleColor={titleColor}>
            <Grid2
                container
                spacing={{ xs: 2, sm: 2.5, md: 3 }}
                padding={{ xs: 2, md: 3 }}
                marginTop={-3}
            >
                {Fields.filter((f) => f.section === section).map((f) => (
                    <Grid2 key={`${section}-${f.name}`} size={f.size}>
                        <MuiText variant="h6" my={0.75} className="admin-label-title">
                            {f.label} {f.isRequired && <span className="mandatory-sign">*</span>}
                        </MuiText>
                        {renderField(f)}
                    </Grid2>
                ))}
                {extra}
            </Grid2>
        </SectionCard>
    );
    return (
        <Box>
            <IconBreadcrumbs
                parent={"Warehouse"}
                child={"Warehouse Master"}
                subParent={warehouseId ? "Edit Warehouse" : "Create Warehouse"}
                path="/warehouse/warehouse-master"
            />

            <Grid2 container spacing={3} my={1} maxHeight={725} overflow={"auto"} p={{ xs: 2, md: 5 }}>
                <Grid2 size={{ xs: 12, md: 6.5 }} pr={{ md: 2 }}>
                    {sectionBlock("general", <TbBuildingWarehouse size={18} />, "General Information", "#127C9E")}
                    {sectionBlock("contact", <MdOutlineContactPhone size={18} />, "Contact", "#127C9E")}
                    {sectionBlock("address", <MdOutlineMap size={18} />, "Address", "#127C9E")}
                </Grid2>
                <Grid2 size={{ xs: 12, md: 5.5 }} pl={{ md: 1 }}>
                    {sectionBlock("capacity", <MdOutlineAccountBalance size={18} />, "Capacity & Account", "#127C9E")}
                    {sectionBlock("itemgroups", <MdInventory2 size={18} />, "Allowed Item Groups", "#127C9E")}
                    <SectionCard icon={<RiSettings3Line size={18} />} title="Settings" titleColor="#127C9E">
                        <Grid2 container spacing={{ xs: 2, md: 3 }} padding={{ xs: 2, md: 3 }}>
                            <Grid2 size={{ xs: 12 }}>
                                <ToggleTile
                                    checked={values.isActive}
                                    onChange={(c) => setField("isActive", c)}
                                    label="isActive"
                                    subtitle="Active / Inactive"
                                    icon={<MdOutlinePowerSettingsNew size={18} />}
                                />
                            </Grid2>
                            <Grid2 size={{ xs: 12 }}>
                                <ToggleTile
                                    checked={values.isGroup}
                                    onChange={(c) => setField("isGroup", c)}
                                    label="Is Group"
                                    subtitle="Acts as a parent grouping"
                                    icon={<MdOutlineGroups size={18} />}
                                />
                            </Grid2>
                            <Grid2 size={{ xs: 12 }}>
                                <ToggleTile
                                    checked={values.isVirtualWarehouse}
                                    onChange={(c) => setField("isVirtualWarehouse", c)}
                                    label="Is Virtual Warehouse"
                                    subtitle="Logical, not physical"
                                    icon={<MdWarehouse size={18} />}
                                />
                            </Grid2>
                            <Grid2 size={{ xs: 12 }}>
                                <ToggleTile
                                    checked={values.isScrapWarehouse}
                                    onChange={(c) => setField("isScrapWarehouse", c)}
                                    label="Is Scrap Warehouse"
                                    subtitle="Used for rejected/scrapped"
                                    icon={<MdOutlineDeleteSweep size={18} />}
                                />
                            </Grid2>
                            <Grid2 size={{ xs: 12 }}>
                                <ToggleTile
                                    checked={values.isTransitWarehouse}
                                    onChange={(c) => setField("isTransitWarehouse", c)}
                                    label="Is Transit Warehouse"
                                    subtitle="Used for stock-in-transit"
                                    icon={<MdLocalShipping size={18} />}
                                />
                            </Grid2>
                            <Grid2 size={{ xs: 12 }}>
                                <ToggleTile
                                    checked={values.defaultForStockEntry}
                                    onChange={(c) => setField("defaultForStockEntry", c)}
                                    label="Default for Stock Entry"
                                    subtitle="Use as default source/target"
                                    icon={<MdInventory2 size={18} />}
                                />
                            </Grid2>
                        </Grid2>
                    </SectionCard>
                </Grid2>
            </Grid2>
            <Box
                display={"flex"}
                alignItems={"center"}
                justifyContent={"end"}
                gap={2}
                borderTop={"2px solid #f1f1f1"}
                py={"16px"}
                mt={2}
                sx={{ position: "sticky", bottom: 0, zIndex: 1 }}
            >
                <MuiButton className="dialog-cancel-btn" variant="outlined" onClick={handleCancel}>
                    Cancel
                </MuiButton>
                <MuiButton className="filled-icon-btn" onClick={handleSubmit}>
                    Submit
                </MuiButton>
            </Box>
        </Box>
    );
};

export default CreateNewWarehouse;
