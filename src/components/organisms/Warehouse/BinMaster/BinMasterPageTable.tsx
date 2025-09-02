"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Box } from "@mui/material";
import IconBreadcrumbs from "../../../molecules/AdminLayout/BreadCrumbs";
import GlobalSearch from "../../../molecules/AdminLayout/GlobalSearch";
import { MuiButton, MuiTable } from "bsoft-base-elements";
import { GoPlus } from "react-icons/go";
import NoDataFound from "../../../molecules/AdminLayout/NoDataFound";
import { FiEdit } from "react-icons/fi";
import { RiDeleteBin6Line } from "react-icons/ri";
import SkeletonLoader from "../../../molecules/AdminLayout/SkeletonLoader";
import ErrorModal from "../../../molecules/Master/Role/ErrorModal";
import toast from "react-hot-toast";
import { usePrivilegeCheck } from "../../../../hooks/usePrivilegeCheck";
import { useDebounce } from "../../../../hooks/useDebounceHook";
import { useDataFetchHook } from "../../../../hooks/useDataFetchHook";
import { Apirequest } from "../../../../utils/lib";
import DeleteConfirmation from "../../../molecules/Master/DeleteConfirmation";
import CreateBinMaster from "../../../molecules/Warehouse/BinMaster/CreateBinMaster";
import InventoryConfig from "../../../../utils/inventory.api.json";

import {
    ApiItemResponse,
    ApiListResponse,
    BinErrorField,
    BinForm,
    BinRow,
    BinStatus,
    RackOption,
    UomOption,
    WarehouseOption,
} from "../../../../types/warehouseTypes";
import WarehouseConfig from "../../../../utils/warehouse.api.json";

const toForm = (): BinForm => ({
    id: 0,
    warehouseId: "",
    warehouseCode: "",
    rackId: null,
    rackCode: "",
    binCode: "",
    binName: "",
    binCapacity: "",
    capacityUOMId: "",
    status: "Active",
    isActive: 1,
});

const normalize = <T,>(src: any): T[] =>
    Array.isArray(src) ? src : Array.isArray(src?.data) ? src.data : [];

function BinListPage() {
    const [pathname, setPathName] = useState<string>("");
    const permissions = usePrivilegeCheck(pathname);
    useEffect(() => {
        const currentPath = window.location.pathname.split("/bsoft").at(-1) || "";
        setPathName(currentPath);
    }, []);

    const [rows, setRows] = useState<BinRow[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [count, setCount] = useState<number>(0);
    const [page, setPage] = useState<number>(1);
    const [size, setSize] = useState<number>(15);
    const [search, setSearch] = useState<string>("");
    const debouncedSearchTerm = useDebounce(search, 500);
    const [open, setOpen] = useState<boolean>(false);
    const [editFlag, setEditFlag] = useState<boolean>(false);
    const [form, setForm] = useState<BinForm>(toForm());
    const originalRef = useRef<BinForm>(toForm());
    const [errorFields, setErrorFields] = useState<BinErrorField[]>([]);
    const [editId, setEditId] = useState<number | null>(null);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [errorModalOpen, setErrorModalOpen] = useState(false);
    const [errorMessages, setErrorMessages] = useState<string[]>([]);

    const { data: warehouseData } = useDataFetchHook(
        WarehouseConfig.Warehouse.GetAllWarehouseMaster.endpoint,
        WarehouseConfig.Warehouse.GetAllWarehouseMaster.method,
        "warehouse"
    );

    const { data: rackData } = useDataFetchHook(
        WarehouseConfig.RackMaster.GetRackMaster.endpoint,
        WarehouseConfig.RackMaster.GetRackMaster.method,
        "warehouse"
    );

    const { data: uomData } = useDataFetchHook(
        InventoryConfig.Uom.GetUomName.endpoint,
        InventoryConfig.Uom.GetUomName.method,
        "inventory"
    );

    const warehouses: WarehouseOption[] = normalize<WarehouseOption>(warehouseData);
    const racks: RackOption[] = normalize<RackOption>(rackData);
    const uoms: UomOption[] = normalize<UomOption>(uomData);

    const statusOptions: BinStatus[] = ["Active", "Inactive"];

    const columns = useMemo(
        () => [
            {
                field: "s_no",
                headerName: "S.No",
                minWidth: 60,
                flex: 0.5,
                sortable: false,
                renderCell: (params: any) => {
                    const idx = params.api.getRowIndexRelativeToVisibleRows(params.id);
                    return (page - 1) * size + (idx + 1);
                },
            },
            { field: "warehouseName", headerName: "Warehouse", minWidth: 180, flex: 1.4 },
            { field: "rackCode", headerName: "Rack", minWidth: 140, flex: 1.1 },
            { field: "binCode", headerName: "Bin Code", minWidth: 140, flex: 1.0 },
            { field: "binName", headerName: "Bin Name", minWidth: 160, flex: 1.2 },
            {
                field: "capacity",
                headerName: "Capacity",
                minWidth: 160,
                flex: 1.1,
                valueGetter: (_: any, row: BinRow) =>
                    row?.binCapacity != null
                        ? `${row.binCapacity}${row.capacityUOMName ? ` ${row.capacityUOMName}` : ""}`
                        : "",
            },
            {
                field: "isActive",
                headerName: "Status",
                minWidth: 120,
                flex: 0.9,
                valueGetter: (_: any, row: any) =>
                    Number(row?.isActive) === 1 || row?.isActive === true ? "Active" : "Inactive",
            },
            {
                field: "actions",
                headerName: "Actions",
                minWidth: 140,
                flex: 1,
                sortable: false,
                filterable: false,
                renderCell: (params: any) => (
                    <Box display="flex" alignItems="center" gap={2} height="100%">
                        <FiEdit
                            fontSize={20}
                            color="black"
                            cursor="pointer"
                            onClick={() => handleEdit(params.row)}
                        />
                        <RiDeleteBin6Line
                            fontSize={20}
                            color="red"
                            cursor="pointer"
                            onClick={() => requestDelete(params.row.id)}
                        />
                    </Box>
                ),
            },
        ],
        [page, size, permissions]
    );

    const GetAllList = async () => {
        try {
            setLoading(true);
            const url = WarehouseConfig.BinMaster.GetBinMaster.endpoint
                .replace("{page}", String(page))
                .replace("{size}", String(size))
                .replace("{search}", encodeURIComponent(debouncedSearchTerm || ""));

            const res: ApiListResponse<BinRow> = await Apirequest(
                url,
                WarehouseConfig.BinMaster.GetBinMaster.method,
                null,
                "warehouse"
            ).then((r) => r.data);

            const { statusCode, data, totalCount } = (res ?? {}) as any;
            if (statusCode === 200 || statusCode === 201) {
                setRows(Array.isArray(data) ? data : []);
                setCount(Number(totalCount) || 0);
            } else {
                setRows([]);
                setCount(0);
            }
        } catch (err) {
            console.error("Bin list error:", err);
            setRows([]);
            setCount(0);
        } finally {
            setLoading(false);
        }
    };

    const getBinById = async (id: number) => {
        const cfg = WarehouseConfig.BinMaster.GetBinMasterid as {
            endpoint: string;
            method: string;
        };
        const url = cfg.endpoint.replace("{id}", String(id));
        const res: ApiItemResponse<BinRow> = await Apirequest(url, cfg.method, null, "warehouse").then(
            (r) => r.data
        );
        return res?.data;
    };

    const createBin = async (payload: any) => {
        const cfg = WarehouseConfig.BinMaster.AddBinMaster as {
            endpoint: string;
            method: string;
        };
        return Apirequest(cfg.endpoint, cfg.method, payload, "warehouse").then((r) => r.data);
    };

    const updateBin = async (id: number, payload: any) => {
        const cfg = WarehouseConfig.BinMaster.UpdateBinMaster as {
            endpoint: string;
            method: string;
        };
        const url = cfg.endpoint.replace("{id}", String(id));
        return Apirequest(url, cfg.method, payload, "warehouse").then((r) => r.data);
    };

    const deleteBin = async (id: number) => {
        const cfg = WarehouseConfig.BinMaster.DeleteBinMaster as {
            endpoint: string;
            method: string;
        };
        const url = cfg.endpoint.replace("{id}", String(id));
        return Apirequest(url, cfg.method, null, "warehouse").then((r) => r.data);
    };

    useEffect(() => {
        GetAllList();
    }, [debouncedSearchTerm, page, size]);

    const handleClickOpen = () => {
        setEditFlag(false);
        setEditId(null);
        const blank = toForm();
        setForm(blank);
        originalRef.current = blank;
        setErrorFields([]);
        setOpen(true);
    };

    const handleEdit = async (row: BinRow) => {
        try {
            setEditFlag(true);
            setEditId(row.id);
            setOpen(true);

            const data = await getBinById(row.id);
            const inferredStatus: BinStatus =
                Number(row?.isActive) === 1 || row?.isActive === true ? "Active" : "Inactive";

            const filled: BinForm = {
                id: data?.id ?? row.id,
                warehouseId: data?.warehouseId ?? row.warehouseId,
                rackId: data?.rackId ?? row.rackId ?? null,
                rackCode: data?.rackCode ?? row.rackCode ?? "",
                binCode: data?.binCode ?? row.binCode ?? "",
                binName: data?.binName ?? row.binName ?? "",
                binCapacity: (data?.binCapacity ?? row.binCapacity ?? "") as number | "",
                capacityUOMId: (data?.capacityUOMId ?? row.capacityUOMId ?? "") as number | "",
                status: (data?.status ?? inferredStatus) as BinStatus,
                isActive: (inferredStatus === "Active" ? 1 : 0) as 0 | 1,
            };

            setForm(filled);
            originalRef.current = filled;
            setErrorFields([]);
        } catch (e) {
            console.error("Edit load error:", e);
            toast.error("Failed to load bin details");
        }
    };

    const handleClose = () => {
        setOpen(false);
        setErrorFields([]);
    };

    const requestDelete = (id: number) => {
        setDeleteId(id);
        setDeleteOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (deleteId == null) return;
        try {
            const response = await deleteBin(deleteId);
            if (response?.statusCode === 200 || response?.statusCode === 201) {
                toast.success(response?.message ?? "Deleted");
                await GetAllList();
            } else {
                toast.error(response?.message ?? "Delete failed");
                if (Array.isArray(response?.errors) && response.errors.length > 0) {
                    setErrorModalOpen(true);
                    setErrorMessages(response.errors);
                }
            }
        } catch (err) {
            console.error("Delete error:", err);
            toast.error("Something went wrong");
        } finally {
            setDeleteOpen(false);
            setDeleteId(null);
        }
    };

    const onFieldChange = (name: keyof BinForm, value: any) => {
        // numeric ids / numeric fields
        if (name === "warehouseId" || name === "rackId" || name === "capacityUOMId" || name === "binCapacity") {
            if (value === "" || value === null) {
                setForm((p) => ({ ...p, [name]: value }));
            } else {
                const n = Number(value);
                if (Number.isNaN(n)) return;
                setForm((p) => ({ ...p, [name]: n as any }));
            }
            return;
        }
        if (name === "status") {
            const stat = value as BinStatus;
            setForm((p) => ({ ...p, status: stat, isActive: (stat === "Active" ? 1 : 0) as 0 | 1 }));
            return;
        }

        setForm((p) => ({ ...p, [name]: value }));
    };

    const isValid = React.useMemo(() => {
        const errs: BinErrorField[] = [];
        if (!form.warehouseId || Number(form.warehouseId) <= 0) errs.push("warehouseId");
        if (!form.binName?.trim()) errs.push("binName");
        if (form.binName && form.binName.length > 50) {
            setForm((p) => ({ ...p, binName: p.binName.slice(0, 50) }));
        }
        if (form.binCapacity === "" || Number(form.binCapacity) <= 0) errs.push("binCapacity");
        if (!form.capacityUOMId || Number(form.capacityUOMId) <= 0) errs.push("capacityUOMId");
        if (!form.status) errs.push("status");
        if (!form.rackId) errs.push("rackId")
        setErrorFields(errs);
        return errs.length === 0;
    }, [form]);

    const isDirty = useMemo(
        () => JSON.stringify(form) !== JSON.stringify(originalRef.current),
        [form]
    );

    const submitDisabled = editFlag ? !isDirty : false;

    const onSubmit = async () => {
        if (!isValid) return;

        try {
            let resp;

            if (editFlag && editId) {
                const putPayload = {
                    id: Number(form.id || editId),
                    binName: form.binName.trim(),
                    binCapacity: Number(form.binCapacity),
                    capacityUOMId: Number(form.capacityUOMId),
                    isActive: form.status === "Active" ? 1 : 0,
                    rackId: form.rackId === "" || form.rackId === null ? 0 : Number(form.rackId),
                };
                resp = await updateBin(editId, putPayload);
            } else {
                const postPayload = {
                    binName: form.binName.trim(),
                    warehouseId: Number(form.warehouseId),
                    rackId: form.rackId === "" || form.rackId === null ? 0 : Number(form.rackId),
                    binCapacity: Number(form.binCapacity),
                    capacityUOMId: Number(form.capacityUOMId),
                };
                resp = await createBin(postPayload);
            }

            if (resp?.statusCode === 200 || resp?.statusCode === 201) {
                toast.success(
                    resp?.message ?? (editFlag ? "Updated successfully" : "Bin created successfully")
                );
                setOpen(false);
                setEditFlag(false);
                const blank = toForm();
                setForm(blank);
                originalRef.current = blank;
                await GetAllList();
            } else {
                toast.error(resp?.message ?? "Request failed");
                if (Array.isArray(resp?.errors) && resp.errors.length > 0) {
                    setErrorModalOpen(true);
                    setErrorMessages(resp.errors);
                }
            }
        } catch (err) {
            console.error("Submit error:", err);
            toast.error("Something went wrong");
        }
    };

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPage(1);
        setSearch(e.target.value);
    };

    return (
        <>
            <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                flexWrap="wrap"
                gap={2}
                mt={1}
            >
                <Box>
                    <IconBreadcrumbs parent="Warehouse" child="Bin" path="" />
                </Box>

                <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
                    <GlobalSearch placeholder="Search Bin" width={220} onChange={handleSearch} />
                    <MuiButton startIcon={<GoPlus />} variant="contained" onClick={handleClickOpen}>
                        Create
                    </MuiButton>
                </Box>
            </Box>

            <Box sx={{ width: "100%", my: 2, height: 700 }} className="main-table">
                {loading ? (
                    <SkeletonLoader />
                ) : (
                    <MuiTable
                        rows={rows}
                        columns={columns}
                        getRowId={(row) => row.id}
                        paginationMode="server"
                        initialState={{
                            pagination: { paginationModel: { pageSize: size } },
                        }}
                        rowCount={count}
                        rowHeight={40}
                        pageSizeOptions={[15, 30, 50]}
                        disableRowSelectionOnClick
                        slots={{ noRowsOverlay: () => <NoDataFound /> }}
                        onPaginationModelChange={(model: any) => {
                            setPage(model.page + 1);
                            setSize(model.pageSize);
                        }}
                    />
                )}
            </Box>

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

            <CreateBinMaster
                open={open}
                close={handleClose}
                editFlag={editFlag}
                form={form}
                errorFields={errorFields}
                onChange={onFieldChange}
                onSubmit={onSubmit}
                warehouses={warehouses}
                racks={racks}
                uoms={uoms}
                statusOptions={statusOptions}
                submitDisabled={submitDisabled}
            />
        </>
    );
}

export default BinListPage;
