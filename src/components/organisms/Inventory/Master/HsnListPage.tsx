"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Box } from "@mui/material";
import IconBreadcrumbs from "../../../molecules/AdminLayout/BreadCrumbs";
import GlobalSearch from "../../../molecules/AdminLayout/GlobalSearch";
import { MuiButton, MuiTable } from "bsoft-base-elements";
import { GoPlus } from "react-icons/go";
import NoDataFound from "../../../molecules/AdminLayout/NoDataFound";
import dayjs from "dayjs";
import { FiEdit } from "react-icons/fi";
import { RiDeleteBin6Line } from "react-icons/ri";
import SkeletonLoader from "../../../molecules/AdminLayout/SkeletonLoader";
import ErrorModal from "../../../molecules/Master/Role/ErrorModal";
import toast from "react-hot-toast";
import { usePrivilegeCheck } from "../../../../hooks/usePrivilegeCheck";
import { useDebounce } from "../../../../hooks/useDebounceHook";
import { useDataFetchHook } from "../../../../hooks/useDataFetchHook";
import InventoryConfig from "../../../../utils/inventory.api.json";
import { Apirequest } from "../../../../utils/lib";
import CreateHsnCode from "../../../molecules/Inventory/Master/CreateHsnCode";

import {
  HsnRow,
  HsnForm,
  HsnErrorField,
  HsnCategoryOption,
  HsnTypeOption,
  ApiListResponse,
} from "../../../../types/maintanenceTypes";
import DeleteConfirmation from "../../../molecules/Master/DeleteConfirmation";

// ----- helpers
const toForm = (): HsnForm => ({
  id: 0,
  type: "",
  typeId: "",
  hsnCode: "",
  description: "",
  gstCategoryId: "",
  gstCategoryName: "",
  gstPercentage: "",
  cgstPercentage: "",
  sgstPercentage: "",
  igstPercentage: "",
  validFrom: "",
  isActive: true,
});

const normalize = <T,>(src: any): T[] =>
  Array.isArray(src) ? src : Array.isArray(src?.data) ? src.data : [];

function HsnListPage() {
  const [pathname, setPathName] = useState<string>("");
  const permissions = usePrivilegeCheck(pathname);
  useEffect(() => {
    const currentPath = window.location.pathname.split("/bsoft").at(-1) || "";
    setPathName(currentPath);
  }, []);

  // table state
  const [rows, setRows] = useState<HsnRow[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [count, setCount] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [size, setSize] = useState<number>(15);
  const [search, setSearch] = useState<string>("");
  const debouncedSearchTerm = useDebounce(search, 500);

  // modal + form state
  const [open, setOpen] = useState<boolean>(false);
  const [editFlag, setEditFlag] = useState<boolean>(false);
  const [form, setForm] = useState<HsnForm>(toForm());
  const originalRef = useRef<HsnForm>(toForm());
  const [errorFields, setErrorFields] = useState<HsnErrorField[]>([]);
  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [errorMessages, setErrorMessages] = useState<string[]>([]);
  const [editId, setEditId] = useState<number | null>(null);

  // delete state
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  // lookups
  const { data: gstCatData } = useDataFetchHook(
    InventoryConfig.InventoryMisc.endpoint.replace("{type}", "GSTCategory"),
    InventoryConfig.InventoryMisc.method,
    "inventory"
  );
  const { data: typeData } = useDataFetchHook(
    InventoryConfig.InventoryMisc.endpoint.replace("{type}", "HSNType"),
    InventoryConfig.InventoryMisc.method,
    "inventory"
  );

  const [gstCategories, setGstCategories] = useState<HsnCategoryOption[]>([]);
  const [hsnSacTypes, setHsnSacTypes] = useState<HsnTypeOption[]>([]);
  useEffect(
    () => setGstCategories(normalize<HsnCategoryOption>(gstCatData)),
    [gstCatData]
  );
  useEffect(
    () => setHsnSacTypes(normalize<HsnTypeOption>(typeData)),
    [typeData]
  );

  const columns = useMemo(
    () => [
      {
        field: "s_no",
        headerName: "S.No",
        minWidth: 60,
        flex: 1,
        sortable: false,
        renderCell: (params: any) => {
          const idx = params.api.getRowIndexRelativeToVisibleRows(params.id);
          return (page - 1) * size + (idx + 1);
        },
      },
      { field: "type", headerName: "Type", minWidth: 120, flex: 1 },
      { field: "hsnCode", headerName: "HSN Code", minWidth: 150, flex: 1.2 },

      {
        field: "gstCategoryName",
        headerName: "GST Category",
        minWidth: 160,
        flex: 1.2,
      },
      { field: "gstPercentage", headerName: "GST%", minWidth: 100, flex: 0.8 },
      {
        field: "cgstPercentage",
        headerName: "CGST%",
        minWidth: 100,
        flex: 0.8,
      },
      {
        field: "sgstPercentage",
        headerName: "SGST%",
        minWidth: 100,
        flex: 0.8,
      },
      {
        field: "igstPercentage",
        headerName: "IGST%",
        minWidth: 100,
        flex: 0.8,
      },
      {
        field: "validFrom",
        headerName: "Valid From",
        minWidth: 150,
        flex: 1,
        valueGetter: (_: any, row: HsnRow) =>
          row?.validFrom ? dayjs(row.validFrom).format("DD-MM-YYYY") : "",
      },
      {
        field: "isActive",
        headerName: "Status",
        minWidth: 120,
        flex: 1,
        valueGetter: (_: any, row: HsnRow) =>
          row?.isActive ? "Active" : "Inactive",
      },
      {
        field: "createdDate",
        headerName: "Created At",
        minWidth: 150,
        flex: 1,
        valueGetter: (_: any, row: HsnRow) =>
          row?.createdDate ? dayjs(row.createdDate).format("DD-MM-YYYY") : "",
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

  // list
  const fetchList = async () => {
    try {
      setLoading(true);
      const url = InventoryConfig.HsnCode.HsnCodeList.endpoint
        .replace("{page}", String(page))
        .replace("{size}", String(size))
        .replace("{search}", encodeURIComponent(debouncedSearchTerm || ""));

      const res: ApiListResponse<HsnRow> = await Apirequest(
        url,
        InventoryConfig.HsnCode.HsnCodeList.method,
        null,
        "inventory"
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
      console.error("HSN list error:", err);
      setRows([]);
      setCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, [debouncedSearchTerm, page, size]);

  // CRUD calls
  const getHsnById = async (id: number) => {
    const cfg = InventoryConfig.HsnCode.GetHsnCodeById as {
      endpoint: string;
      method: string;
    };
    const url = cfg.endpoint.replace("{id}", String(id));
    const res = await Apirequest(url, cfg.method, null, "inventory").then(
      (r) => r.data
    );
    return res?.data as Partial<HsnForm & HsnRow>;
  };

  const createHsnCode = async (payload: HsnForm) => {
    const cfg = InventoryConfig.HsnCode.AddHsnCode as {
      endpoint: string;
      method: string;
    };
    return Apirequest(cfg.endpoint, cfg.method, payload, "inventory").then(
      (r) => r.data
    );
  };

  const updateHsnCode = async (id: number, payload: HsnForm) => {
    const cfg = InventoryConfig.HsnCode.UpdateHsnCode as {
      endpoint: string;
      method: string;
    };
    const url = cfg.endpoint.replace("{id}", String(id));
    return Apirequest(url, cfg.method, payload, "inventory").then(
      (r) => r.data
    );
  };

  const deleteHsnCode = async (id: number) => {
    const cfg = InventoryConfig.HsnCode.DeleteHsnCode as {
      endpoint: string;
      method: string;
    };
    const url = cfg.endpoint.replace("{id}", String(id));
    return Apirequest(url, cfg.method, null, "inventory").then((r) => r.data);
  };

  // open create
  const handleClickOpen = () => {
    setEditFlag(false);
    setEditId(null);
    const blank = toForm();
    setForm(blank);
    originalRef.current = blank;
    setErrorFields([]);
    setOpen(true);
  };

  // open edit
  const handleEdit = async (row: HsnRow) => {
    try {
      setEditFlag(true);
      setEditId(row.id);
      setOpen(true);

      const data = await getHsnById(row.id);
      const filled: HsnForm = {
        id: Number(data?.id ?? row.id),
        type: String(data?.type ?? row.type ?? ""),
        typeId:
          (data as any)?.typeId ??
          hsnSacTypes.find((t) => t.code === (data?.type ?? row.type))?.id ??
          "",
        hsnCode: String(data?.hsnCode ?? row.hsnCode ?? ""),
        description: String(data?.description ?? row.description ?? ""),
        gstCategoryId:
          (data as any)?.gstCategoryId ??
          gstCategories.find(
            (c) =>
              c.code?.toLowerCase() ===
              String(
                data?.gstCategoryName ?? row.gstCategoryName ?? ""
              ).toLowerCase()
          )?.id ??
          "",
        gstCategoryName: String(
          data?.gstCategoryName ?? row.gstCategoryName ?? ""
        ),
        gstPercentage:
          (data as any)?.gstPercentage ?? (row as any)?.gstPercentage ?? "",
        cgstPercentage:
          (data as any)?.cgstPercentage ?? (row as any)?.cgstPercentage ?? "",
        sgstPercentage:
          (data as any)?.sgstPercentage ?? (row as any)?.sgstPercentage ?? "",
        igstPercentage:
          (data as any)?.igstPercentage ?? (row as any)?.igstPercentage ?? "",
        validFrom: data?.validFrom
          ? dayjs(data.validFrom as any).format("YYYY-MM-DD")
          : row.validFrom
            ? dayjs(row.validFrom as any).format("YYYY-MM-DD")
            : "",
        isActive:
          typeof data?.isActive === "boolean"
            ? data.isActive
            : !!(row as any)?.isActive,
      };

      setForm(filled);
      originalRef.current = filled;
      setErrorFields([]);
    } catch (e) {
      console.error("Edit load error:", e);
      toast.error("Failed to load HSN details");
    }
  };

  // ---- GST CATEGORY FIX: resolver + auto-fill after lookups load ----
  const resolveGstCategoryId = (): number => {
    const rawId = Number(form.gstCategoryId || 0);
    if (rawId > 0) return rawId;

    const label = String(form.gstCategoryName || "")
      .trim()
      .toLowerCase();
    if (!label) return 0;

    const match = gstCategories.find((o) =>
      [o.code, o.description]
        .filter(Boolean)
        .some((n) => String(n).toLowerCase() === label)
    );
    return match?.id ?? 0;
  };

  useEffect(() => {
    // when lookups finish in edit mode, if we only have the label, backfill the ID
    if (!open || !editFlag) return;
    if (Number(form.gstCategoryId || 0) > 0) return;

    const newId = resolveGstCategoryId();
    if (newId > 0) {
      setForm((p) => ({ ...p, gstCategoryId: newId }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, editFlag, gstCategories]);

  // close modal
  const handleClose = () => {
    setOpen(false);
    setErrorFields([]);
  };

  // DELETE flow
  const requestDelete = (id: number) => {
    setDeleteId(id);
    setDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (deleteId == null) return;
    try {
      const response = await deleteHsnCode(deleteId);
      if (response?.statusCode === 200 || response?.statusCode === 201) {
        toast.success(response?.message ?? "Deleted");
        await fetchList();
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

  // field changes
  const onFieldChange = (name: keyof HsnForm, value: any) => {
    const numericKeys: (keyof HsnForm)[] = [
      "gstPercentage",
      "cgstPercentage",
      "sgstPercentage",
      "igstPercentage",
      "typeId",
      "gstCategoryId",
    ];
    if (numericKeys.includes(name)) {
      if (value === "") {
        setForm((p) => ({ ...p, [name]: "" as any }));
        return;
      }
      const n = Number(value);
      if (Number.isNaN(n)) return;
      setForm((p) => ({ ...p, [name]: n as any }));
      return;
    }
    setForm((p) => ({ ...p, [name]: value }));
  };

  const onDateChange = (iso: string) =>
    setForm((p) => ({ ...p, validFrom: iso }));

  const onSwitchChecked = (checked: boolean) =>
    setForm((p) => ({ ...p, isActive: checked }));

  // auto-calc splits
  useEffect(() => {
    const g = Number(form.gstPercentage);
    if (Number.isNaN(g)) return;
    const half = Math.round((g / 2) * 100) / 100;
    setForm((p) => ({
      ...p,
      cgstPercentage: (g as any) === ("" as any) ? "" : half,
      sgstPercentage: (g as any) === ("" as any) ? "" : half,
      igstPercentage: (g as any) === ("" as any) ? "" : g,
    }));
  }, [form.gstPercentage]);

  const isValid = useMemo(() => {
    const errs: HsnErrorField[] = [];
    if (!form.typeId || Number(form.typeId) <= 0) errs.push("type");
    if (!form.hsnCode?.trim()) errs.push("hsnCode");
    const resolvedGstId = resolveGstCategoryId();
    if (resolvedGstId <= 0) errs.push("gstCategoryName");
    if (
      form.gstPercentage === "" ||
      form.gstPercentage === null ||
      typeof form.gstPercentage === "undefined"
    ) {
      errs.push("gstPercentage");
    } else {
      const g = Number(form.gstPercentage);
      if (Number.isNaN(g) || g < 0 || g > 100) errs.push("gstPercentage");
    }
    if (!form.validFrom?.trim()) errs.push("validFrom");
    const g = Number(form.gstPercentage);
    if (Number.isNaN(g) || g < 0 || g > 100) errs.push("gstPercentage");
    setErrorFields(errs);
    return errs.length === 0;
  }, [form, gstCategories]);

  // dirty (only matters on edit)
  const isDirty = useMemo(
    () => JSON.stringify(form) !== JSON.stringify(originalRef.current),
    [form]
  );
  const submitDisabled = editFlag ? !isDirty : false;

  const onSubmit = async () => {
    if (!isValid) return;

    const resolvedGstId = resolveGstCategoryId();

    const payload: HsnForm = {
      ...form,
      id: Number(form.id || 0),
      type: String(form.type || ""),
      typeId: Number(form.typeId || 0),
      gstCategoryId: resolvedGstId,
      gstPercentage:
        form.gstPercentage === "" ? 0 : Number(form.gstPercentage || 0),
      cgstPercentage:
        form.cgstPercentage === "" ? 0 : Number(form.cgstPercentage || 0),
      sgstPercentage:
        form.sgstPercentage === "" ? 0 : Number(form.sgstPercentage || 0),
      igstPercentage:
        form.igstPercentage === "" ? 0 : Number(form.igstPercentage || 0),
      validFrom: form.validFrom,
      isActive: !!form.isActive,
    };

    try {
      const resp =
        editFlag && editId
          ? await updateHsnCode(editId, payload)
          : await createHsnCode(payload);

      if (resp?.statusCode === 200 || resp?.statusCode === 201) {
        toast.success(
          resp?.message ??
          (editFlag ? "Updated successfully" : "Created successfully")
        );
        setOpen(false);
        setEditFlag(false);
        setForm(toForm());
        originalRef.current = toForm();
        await fetchList();
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
          <IconBreadcrumbs parent="Inventory" child="HSN" path="" />
        </Box>

        <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
          <GlobalSearch
            placeholder="Search HSN"
            width={220}
            onChange={handleSearch}
          />
          <MuiButton
            startIcon={<GoPlus />}
            variant="contained"
            onClick={handleClickOpen}
          >
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

      <CreateHsnCode
        open={open}
        close={handleClose}
        editFlag={editFlag}
        form={form}
        errorFields={errorFields}
        onChange={onFieldChange}
        onDateChange={onDateChange}
        onSwitch={onSwitchChecked}
        onSubmit={onSubmit}
        gstCategories={gstCategories}
        hsnSacTypes={hsnSacTypes}
        submitDisabled={submitDisabled}
      />
    </>
  );
}

export default HsnListPage;
