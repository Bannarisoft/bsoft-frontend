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
import { useDebounce } from "../../../../hooks/useDebounceHook";
import { useDataFetchHook } from "../../../../hooks/useDataFetchHook";
import { Apirequest } from "../../../../utils/lib";
import DeleteConfirmation from "../../../molecules/Master/DeleteConfirmation";
import CreateRackMaster from "../../../molecules/Warehouse/RackMaster/CreateRackMaster";
import WarehouseConfig from "../../../../utils/warehouse.api.json";
import InventoryConfig from "../../../../utils/inventory.api.json";

import {
  ApiItemResponse,
  ApiListResponse,
  RackErrorField,
  RackForm,
  RackRow,
  WarehouseOption,
  FloorOption,
  AisleOption,
  RackLevelOption,
  UomOption,
} from "../../../../types/warehouseTypes";

const toForm = (): RackForm => ({
  id: 0,
  warehouseId: "",
  rackCode: "",
  rackName: "",
  floorId: "",
  aisleId: "",
  rackLevelId: "",
  maxCapacity: "",
  capacityUOMId: "",
  rackWidth: "",
  rackHeight: "",
  dimensionUOMId: "",
  isActive: true,
});

const normalize = <T,>(src: any): T[] =>
  Array.isArray(src) ? src : Array.isArray(src?.data) ? src.data : [];

function RackMasterPageTable() {
  const [rows, setRows] = useState<RackRow[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [count, setCount] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [size, setSize] = useState<number>(15);
  const [search, setSearch] = useState<string>("");
  const debouncedSearchTerm = useDebounce(search, 500);
  const [open, setOpen] = useState<boolean>(false);
  const [editFlag, setEditFlag] = useState<boolean>(false);
  const [form, setForm] = useState<RackForm>(toForm());
  const originalRef = useRef<RackForm>(toForm());
  const [errorFields, setErrorFields] = useState<RackErrorField[]>([]);
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

  const { data: floorData } = useDataFetchHook(
    WarehouseConfig.WarehouseMisc.endpoint.replace("{type}", "Floor"),
    WarehouseConfig.WarehouseMisc.method,
    "inventory"
  );
  const { data: aisleData } = useDataFetchHook(
    WarehouseConfig.WarehouseMisc.endpoint.replace("{type}", "WarehouseAisle"),
    WarehouseConfig.WarehouseMisc.method,
    "inventory"
  );
  const { data: levelData } = useDataFetchHook(
    WarehouseConfig.WarehouseMisc.endpoint.replace("{type}", "WarehouseRackLevel"),
    WarehouseConfig.WarehouseMisc.method,
    "inventory"
  );

  const { data: uomData } = useDataFetchHook(
    InventoryConfig.Uom.GetUomName.endpoint,
    InventoryConfig.Uom.GetUomName.method,
    "inventory"
  );

  const warehouses: WarehouseOption[] = normalize<WarehouseOption>(warehouseData);
  const floors: FloorOption[] = normalize<FloorOption>(floorData);
  const aisles: AisleOption[] = normalize<AisleOption>(aisleData);
  const rackLevels: RackLevelOption[] = normalize<RackLevelOption>(levelData);
  const uoms: UomOption[] = normalize<any>(uomData).map((u: any) => ({
    id: Number(u.id),
    uomName: String(u.uomName ?? u.code ?? u.name ?? u.description ?? ""),
    code: String(u.code ?? u.uomName ?? ""),
  }));

  const columns = useMemo(
    () => [
      {
        field: "s_no",
        headerName: "S.No",
        minWidth: 60,
        flex: 0.6,
        sortable: false,
        renderCell: (params: any) => {
          const idx = params.api.getRowIndexRelativeToVisibleRows(params.id);
          return (page - 1) * size + (idx + 1);
        },
      },
      { field: "rackCode", headerName: "Rack Code", minWidth: 220, flex: 1.2 },
      { field: "rackName", headerName: "Rack Name", minWidth: 160, flex: 1.1 },
      { field: "warehouse", headerName: "Warehouse", minWidth: 160, flex: 1.0, valueGetter: (_: any, row: RackRow) => row?.warehouseName ?? "-" },
      { field: "floorName", headerName: "Floor", minWidth: 140, flex: 0.9, valueGetter: (_: any, row: RackRow) => row?.floorName ?? "-" },
      { field: "aisleName", headerName: "Aisle", minWidth: 140, flex: 0.9 },
      { field: "rackLevelName", headerName: "Rack Level", minWidth: 140, flex: 1.0, valueGetter: (_: any, row: RackRow) => row?.rackLevelName ?? "-" },
      { field: "maxCapacity", headerName: "Max Capacity", minWidth: 120, flex: 0.9, valueGetter: (_: any, row: RackRow) => row?.maxCapacity ?? "-" },
      { field: "capacityUOMName", headerName: "Capacity UOM", minWidth: 130, flex: 0.9, valueGetter: (_: any, row: RackRow) => row?.capacityUOMName ?? "-" },
      { field: "rackWidth", headerName: "Width", minWidth: 100, flex: 0.8, valueGetter: (_: any, row: RackRow) => row?.rackWidth ?? "-" },
      { field: "rackHeight", headerName: "Height", minWidth: 100, flex: 0.8, valueGetter: (_: any, row: RackRow) => row?.rackHeight ?? "-" },
      { field: "dimensionUOMName", headerName: "Dim UOM", minWidth: 110, flex: 0.8, valueGetter: (_: any, row: RackRow) => row?.dimensionUOMName ?? "-" },
      { field: "isActive", headerName: "Status", minWidth: 110, flex: 0.8, valueGetter: (_: any, row: RackRow) => (row?.isActive ? "Active" : "Inactive") },
      {
        field: "actions",
        headerName: "Actions",
        minWidth: 140,
        flex: 1,
        sortable: false,
        filterable: false,
        renderCell: (params: any) => (
          <Box display="flex" alignItems="center" gap={2} height="100%">
            <FiEdit fontSize={20} color="black" cursor="pointer" onClick={() => handleEdit(params.row)} />
            <RiDeleteBin6Line fontSize={20} color="red" cursor="pointer" onClick={() => requestDelete(params.row.id)} />
          </Box>
        ),
      },
    ],
    [page, size]
  );

  const GetallList = async () => {
    try {
      setLoading(true);
      const url = WarehouseConfig.RackMaster.GetAllRackMaster.endpoint
        .replace("{page}", String(page))
        .replace("{size}", String(size))
        .replace("{searchTerm}", encodeURIComponent(debouncedSearchTerm || ""));

      const res: ApiListResponse<RackRow> = await Apirequest(
        url,
        WarehouseConfig.RackMaster.GetAllRackMaster.method,
        null,
        "warehouse"
      ).then((r) => r.data);

      const { statusCode, data, totalCount } = res ?? ({} as any);
      if (statusCode === 200 || statusCode === 201) {
        setRows(Array.isArray(data) ? data : []);
        setCount(Number(totalCount) || 0);
      } else {
        setRows([]);
        setCount(0);
      }
    } catch (err) {
      console.error("Rack list error:", err);
      setRows([]);
      setCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    GetallList();
  }, [debouncedSearchTerm, page, size]);

  const getRackById = async (id: number) => {
    const cfg = WarehouseConfig.RackMaster.GetRackMasterid as { endpoint: string; method: string; };
    const url = cfg.endpoint.replace("{id}", String(id));
    const res: ApiItemResponse<RackRow> = await Apirequest(url, cfg.method, null, "warehouse").then((r) => r.data);
    return res?.data;
  };

  const createRack = async (payload: any) => {
    const cfg = WarehouseConfig.RackMaster.AddRackMaster as { endpoint: string; method: string; };
    return Apirequest(cfg.endpoint, cfg.method, payload, "warehouse").then((r) => r.data);
  };

  const updateRack = async (id: number, payload: any) => {
    const cfg = WarehouseConfig.RackMaster.UpdateRackMaster as { endpoint: string; method: string; };
    const url = cfg.endpoint.replace("{id}", String(id));
    return Apirequest(url, cfg.method, payload, "warehouse").then((r) => r.data);
  };

  const deleteRack = async (id: number) => {
    const cfg = WarehouseConfig.RackMaster.DeleteRackMaster as { endpoint: string; method: string; };
    const url = cfg.endpoint.replace("{id}", String(id));
    return Apirequest(url, cfg.method, null, "warehouse").then((r) => r.data);
  };

  const handleClickOpen = () => {
    setEditFlag(false);
    setEditId(null);
    const blank = toForm();
    setForm(blank);
    originalRef.current = blank;
    setErrorFields([]);
    setOpen(true);
  };

  const handleEdit = async (row: RackRow) => {
    try {
      setEditFlag(true);
      setEditId(row.id);
      setOpen(true);
      const data = await getRackById(row.id);
      const filled: RackForm = {
        id: data?.id ?? row.id,
        warehouseId: data?.warehouseId ?? row.warehouseId,
        rackCode: data?.rackCode ?? row.rackCode ?? "",
        rackName: data?.rackName ?? row.rackName ?? "",
        floorId: data?.floorId ?? row.floorId ?? "",
        aisleId: data?.aisleId ?? row.aisleId ?? "",
        rackLevelId: data?.rackLevelId ?? row.rackLevelId ?? "",
        maxCapacity: (data?.maxCapacity ?? row.maxCapacity ?? "") as any,
        capacityUOMId: data?.capacityUOMId ?? row.capacityUOMId ?? "",
        rackWidth: (data?.rackWidth ?? row.rackWidth ?? "") as any,
        rackHeight: (data?.rackHeight ?? row.rackHeight ?? "") as any,
        dimensionUOMId: (data?.dimensionUOMId ?? row.dimensionUOMId ?? "") as any,
        isActive: !!(data?.isActive ?? row.isActive),
      };

      setForm(filled);
      originalRef.current = filled;
      setErrorFields([]);
    } catch (e) {
      console.error("Edit load error:", e);
      toast.error("Failed to load rack details");
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
      const response = await deleteRack(deleteId);
      if (response?.statusCode === 200 || response?.statusCode === 201) {
        toast.success(response?.message ?? "Deleted");
        await GetallList();
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

  const onFieldChange = (name: keyof RackForm, value: any) => {
    if (name === "maxCapacity" || name === "rackWidth" || name === "rackHeight") {
      if (value === "") {
        setForm((p) => ({ ...p, [name]: "" }));
      } else {
        const n = Number(value);
        if (Number.isNaN(n)) return;
        setForm((p) => ({ ...p, [name]: n as any }));
      }
      return;
    }

    if (name === "warehouseId" || name === "floorId" || name === "aisleId" || name === "rackLevelId" || name === "capacityUOMId" || name === "dimensionUOMId") {
      if (value === "" || value === null) {
        setForm((p) => ({ ...p, [name]: value }));
      } else {
        const n = Number(value);
        if (Number.isNaN(n)) return;
        setForm((p) => ({ ...p, [name]: n as any }));
      }
      return;
    }

    setForm((p) => ({ ...p, [name]: value }));
  };

  const isValid = React.useMemo(() => {
    const errs: RackErrorField[] = [];
    if (!form.warehouseId || Number(form.warehouseId) <= 0) errs.push("warehouseId");
    if (!String(form.rackName || "").trim()) errs.push("rackName");
    if (!form.floorId || Number(form.floorId) <= 0) errs.push("floorId");
    if (!form.aisleId || Number(form.aisleId) <= 0) errs.push("aisleId");
    if (!form.rackLevelId || Number(form.rackLevelId) <= 0) errs.push("rackLevelId");
    if (form.maxCapacity === "" || Number(form.maxCapacity) <= 0) errs.push("maxCapacity");
    if (!form.capacityUOMId || Number(form.capacityUOMId) <= 0) errs.push("capacityUOMId");
    if (form.rackWidth != null && form.rackWidth !== "" && String(form.rackWidth).length > 5) {
      setForm((p) => ({ ...p, rackWidth: Number(String(p.rackWidth).slice(0, 5)) }));
    }
    if (form.rackHeight != null && form.rackHeight !== "" && String(form.rackHeight).length > 6) {
      setForm((p) => ({ ...p, rackHeight: Number(String(p.rackHeight).slice(0, 6)) }));
    }

    setErrorFields(errs);
    return errs.length === 0;
  }, [form]);

  const isDirty = React.useMemo(() => JSON.stringify(form) !== JSON.stringify(originalRef.current), [form]);
  const submitDisabled = editFlag ? !isDirty : false;

  const onSubmit = async () => {
    if (!isValid) return;
    try {
      let resp;
      if (editFlag && editId) {
        const putPayload = {
          id: Number(form.id || editId),
          warehouseId: Number(form.warehouseId),
          rackName: String(form.rackName || ""),
          floorId: Number(form.floorId),
          aisleId: Number(form.aisleId),
          rackLevelId: Number(form.rackLevelId),
          maxCapacity: Number(form.maxCapacity || 0),
          capacityUOMId: Number(form.capacityUOMId),
          rackWidth: form.rackWidth === "" || form.rackWidth == null ? 0 : Number(form.rackWidth),
          rackHeight: form.rackHeight === "" || form.rackHeight == null ? 0 : Number(form.rackHeight),
          dimensionUOMId:
            form.dimensionUOMId === "" || form.dimensionUOMId == null ? 0 : Number(form.dimensionUOMId),
          isActive: form.isActive ? 1 : 0,
        };
        resp = await updateRack(editId, putPayload);
      } else {
        const postPayload = {
          warehouseId: Number(form.warehouseId),
          rackName: String(form.rackName || ""),
          floorId: Number(form.floorId),
          aisleId: Number(form.aisleId),
          rackLevelId: Number(form.rackLevelId),
          maxCapacity: Number(form.maxCapacity || 0),
          capacityUOMId: Number(form.capacityUOMId),
          rackWidth: form.rackWidth === "" || form.rackWidth == null ? 0 : Number(form.rackWidth),
          rackHeight: form.rackHeight === "" || form.rackHeight == null ? 0 : Number(form.rackHeight),
          dimensionUOMId:
            form.dimensionUOMId === "" || form.dimensionUOMId == null ? 0 : Number(form.dimensionUOMId),
        };
        resp = await createRack(postPayload);
      }

      if (resp?.statusCode === 200 || resp?.statusCode === 201) {
        toast.success(resp?.message ?? (editFlag ? "Updated successfully" : "Rack created successfully"));
        setOpen(false);
        setEditFlag(false);
        const blank = toForm();
        setForm(blank);
        originalRef.current = blank;
        await GetallList();
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
      <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2} mt={1}>
        <Box>
          <IconBreadcrumbs parent="Warehouse" child="Rack" path="" />
        </Box>

        <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
          <GlobalSearch placeholder="Search Rack" width={220} onChange={handleSearch} />
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
            initialState={{ pagination: { paginationModel: { pageSize: size } } }}
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

      <ErrorModal open={errorModalOpen} onClose={() => setErrorModalOpen(false)} errors={errorMessages} />
      <DeleteConfirmation open={deleteOpen} close={() => setDeleteOpen(false)} handleDelete={handleConfirmDelete} />

      <CreateRackMaster
        open={open}
        close={handleClose}
        editFlag={editFlag}
        form={form}
        errorFields={errorFields}
        onChange={onFieldChange}
        onSubmit={onSubmit}
        warehouses={warehouses}
        floors={floors}
        aisles={aisles}
        rackLevels={rackLevels}
        uoms={uoms}
        submitDisabled={submitDisabled}
      />
    </>
  );
}

export default RackMasterPageTable;
