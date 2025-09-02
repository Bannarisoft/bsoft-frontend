"use client";
import { Box } from "@mui/material";
import React, { useEffect, useMemo, useState } from "react";
import IconBreadcrumbs from "../../../molecules/AdminLayout/BreadCrumbs";
import GlobalSearch from "../../../molecules/AdminLayout/GlobalSearch";
import { MuiButton, MuiTable } from "bsoft-base-elements";
import { GoPlus } from "react-icons/go";
import { usePrivilegeCheck } from "../../../../hooks/usePrivilegeCheck";
import { FiEdit } from "react-icons/fi";
import { RiDeleteBin6Line } from "react-icons/ri";
import NoDataFound from "../../../molecules/AdminLayout/NoDataFound";
import CreatePartyGroup from "../../../molecules/Purchase/CreatePartyGroup";
import {
  CreatePartyGroupType,
  PartyGroupOption,
  PartyTypeOption,
} from "../../../../types/PurchaseTypes";
import PartyConfig from "../../../../utils/party.api.json";
import { Apirequest } from "../../../../utils/lib";
import { useDebounce } from "../../../../hooks/useDebounceHook";
import ErrorModal from "../../../molecules/Master/Role/ErrorModal";
import toast from "react-hot-toast";
import DeleteConfirmation from "../../../molecules/Master/DeleteConfirmation";
import { useDataFetchHook } from "../../../../hooks/useDataFetchHook";
import { useFormDirtyCheck } from "../../../../hooks/useFormDirtyCheck";
import SkeletonLoader from "../../../molecules/AdminLayout/SkeletonLoader";

function PartyListPage() {
  const [pathname, setPathName] = useState<string>("");
  const permissions = usePrivilegeCheck(pathname);

  useEffect(() => {
    const currentPath = window.location.pathname.split("/bsoft").at(-1) || "";
    setPathName(currentPath);
  }, []);

  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [party, setParty] = useState<any[]>([]);
  const [page, setPage] = useState<number>(1);
  const [search, setSearch] = useState("");
  const [size, setSize] = useState<number>(15);
  const [count, setCount] = useState<number>(0);
  const [open, setOpen] = useState(false);
  const [editFlag, setEditFlag] = useState(false);
  const [loading, setLoading] = useState(true);

  // Field-level errors (track field keys like "groupTypeId", etc.)
  const [error, setError] = React.useState<string[]>([]);
  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [errorMessages, setErrorMessages] = useState<string[]>([]);
  const [id, setId] = React.useState(0);

  // Selected values for autocompletes
  const [selectedPartyType, setSelectedPartyType] =
    useState<PartyTypeOption | null>(null);
  const [selectedParentGroup, setSelectedParentGroup] =
    useState<PartyGroupOption | null>(null);

  const [partyGroupInput, setPartyGroupInput] = useState<CreatePartyGroupType>({
    partyGroupName: "",
    parentPartyGroupId: 0,
    parentPartyGroupName: "",
    groupTypeId: 0,
    groupName: "",
    description: "",
    glcode: "",
    glCategoryId: 0,
    glCategoryName: "",
    isActive: 1,
    isGroup: 0,
  });

  const debouncedSearchTerm = useDebounce(search, 500);
  const [originalPartyGroup, setOriginalPartyGroup] =
    useState<CreatePartyGroupType | null>(null);

  // Validity for submit; dirty check uses this when editFlag=true
  const isValid = Boolean(
    partyGroupInput.groupTypeId &&
    partyGroupInput.partyGroupName?.trim() &&
    partyGroupInput.parentPartyGroupId &&
    partyGroupInput.glcode?.trim() &&
    partyGroupInput.glCategoryId
  );

  const { saveDisabled } = useFormDirtyCheck(
    partyGroupInput,
    originalPartyGroup,
    isValid,
    editFlag
  );
  const submitDisabled = editFlag ? saveDisabled : false;

  const columns = useMemo(
    () => [
      {
        field: "id",
        headerName: "S.No",
        minWidth: 50,
        flex: 1,
        sortable: true,
        renderCell: (params: any) =>
          (page - 1) * size +
          (params.api.getAllRowIds().indexOf(params.id) + 1),
      },
      {
        field: "groupName",
        headerName: "Group Type",
        flex: 2,
        minWidth: 200,
        valueGetter: (_: any, row: any) => `${row?.groupName || "-"}`,
      },
      {
        field: "partyGroupName",
        headerName: "Party Group Name",
        flex: 2,
        minWidth: 200,
        valueGetter: (_: any, row: any) =>
          `${row?.partyGroupName || "-"}`.replace(/\b\w/g, (char: string) =>
            char.toUpperCase()
          ),
      },
      {
        field: "parentPartyGroupName",
        headerName: "Parent Party Group",
        flex: 2,
        minWidth: 200,
        valueGetter: (_: any, row: any) =>
          `${row?.parentPartyGroupName || "-"}`,
      },

      {
        field: "glcode",
        headerName: "GL code",
        flex: 2,
        minWidth: 200,
        valueGetter: (_: any, row: any) => `${row?.glcode || "-"}`,
      },
      {
        field: "isActive",
        headerName: "Status",
        flex: 2,
        minWidth: 200,
        valueGetter: (_: any, row: any) =>
          `${Number(row?.isActive) === 1 ? "Active" : "Inactive"}`,
      },
      {
        field: "actions",
        headerName: "Actions",
        flex: 2,
        minWidth: 200,
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
            <FiEdit
              fontSize={20}
              color="black"
              cursor={"pointer"}
              onClick={() => handleEdit(params.row)}
            />
            <RiDeleteBin6Line
              fontSize={20}
              color="red"
              cursor={"pointer"}
              onClick={() => handleDelete(params.row.id)}
            />
          </Box>
        ),
      },
    ],
    [page, size]
  );

  // autocomplete endpoints
  const groupTypeEndpoint = PartyConfig.PartyMisc.endpoint.replace(
    "{type}",
    encodeURIComponent("GROUPTYPE")
  );
  const glCategoryEndpoint = PartyConfig.PartyMisc.endpoint.replace(
    "{type}",
    encodeURIComponent("GLCATEGORY")
  );

  const { data: PartyTypes } = useDataFetchHook(
    groupTypeEndpoint,
    PartyConfig.PartyMisc.method,
    "party"
  );
  const { data: ParentPartyGroups } = useDataFetchHook(
    PartyConfig.PartyGroup.GroupPartyParent.endpoint,
    PartyConfig.PartyGroup.GroupPartyParent.method,
    "party"
  );
  const { data: PartyGlCategory } = useDataFetchHook(
    glCategoryEndpoint,
    PartyConfig.PartyMisc.method,
    "party"
  );

  const normalize = (src: any) =>
    Array.isArray(src) ? src : Array.isArray(src?.data) ? src.data : [];

  // list
  const getPartyList = async () => {
    try {
      setLoading(true);
      const { endpoint, method } = PartyConfig.PartyGroup.PartyGroupList;
      const url = endpoint
        .replace("{page}", String(page))
        .replace("{size}", String(size))
        .replace("{search}", encodeURIComponent(debouncedSearchTerm || ""));

      const response = await Apirequest(url, method, null, "party").then(
        (res) => res.data
      );
      const { totalCount = 0, statusCode, data } = response ?? {};
      if (statusCode === 200 || statusCode === 201) {
        setParty(Array.isArray(data) ? data : []);
        setCount(Number(totalCount) || 0);
      } else {
        setParty([]);
        setCount(0);
      }
    } catch (err) {
      console.error("GetPartyList error:", err);
      setParty([]);
      setCount(0);
    } finally {
      setLoading(false);
    }
  };

  // get by id (edit) — snapshot original (incl. isGroup) for dirty check
  const getPartyGroupById = async (id: number) => {
    try {
      const cfg =
        (PartyConfig.PartyGroup as any).GetPartyGroupById ??
        ({ endpoint: "api/PartyGroup/{id}", method: "GET" } as {
          endpoint: string;
          method: string;
        });

      const url = cfg.endpoint.replace("{id}", String(id));
      const result = await Apirequest(url, cfg.method, null, "party").then(
        (res) => res.data
      );

      if (result?.data) {
        const data = result.data as CreatePartyGroupType;
        const normalized: CreatePartyGroupType = {
          ...data,
          isActive: Number((data as any).isActive ?? 0),
          isGroup: Number((data as any).isGroup ?? 0),
        };

        setPartyGroupInput(normalized);
        setOriginalPartyGroup(normalized);
      }
    } catch (err) {
      console.error("getPartyGroupById error:", err);
    }
  };

  // create
  const createPartyGroup = async (payload: CreatePartyGroupType) => {
    const cfg = PartyConfig.PartyGroup.AddPartyGroup as {
      endpoint: string;
      method: string;
    };
    const response = await Apirequest(
      cfg.endpoint,
      cfg.method,
      payload,
      "party"
    ).then((r) => r.data);
    return response;
  };

  // update
  const updatePartyGroup = async (
    id: number,
    payload: CreatePartyGroupType
  ) => {
    const cfg = PartyConfig.PartyGroup.UpdatePartyGroup as {
      endpoint: string; // "api/PartyGroup/{id}"
      method: string; // "PUT"
    };
    const url = cfg.endpoint.replace("{id}", String(id));
    const response = await Apirequest(url, cfg.method, payload, "party").then(
      (r) => r.data
    );
    return response;
  };

  // delete
  const DeleteCompany = async () => {
    try {
      const { endpoint, method } = PartyConfig.PartyGroup.DeletePartyGroup;
      const url = endpoint.replace("{id}", String(id));
      const response = await Apirequest(url, method, null, "party").then(
        (r) => r.data
      );

      if (response.statusCode === 200 || response.statusCode === 201) {
        toast.success(response.message);
        getPartyList();
      } else {
        toast.error(response.message);
        if (Array.isArray(response.errors) && response.errors.length > 0) {
          setErrorModalOpen(true);
          setErrorMessages(response.errors);
        }
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleConfirmDelete = async () => {
    await DeleteCompany();
    setDeleteOpen(false);
  };
  const handleDelete = (id: number) => {
    setId(id);
    setDeleteOpen(true);
  };

  // field error helpers
  const clearFieldError = (field: keyof CreatePartyGroupType) => {
    setError((prev) => prev.filter((k) => k !== field));
  };

  const updatePartyGroupInputField = (
    field: keyof CreatePartyGroupType,
    value: any
  ) => {
    setPartyGroupInput((prev) => ({ ...prev, [field]: value }));
  };

  // submit
  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const errs: (keyof CreatePartyGroupType)[] = [];

    if (!partyGroupInput.groupTypeId) errs.push("groupTypeId");
    if (!partyGroupInput.partyGroupName?.trim()) errs.push("partyGroupName");
    if (!partyGroupInput.parentPartyGroupId) errs.push("parentPartyGroupId");
    if (!partyGroupInput.glcode?.trim()) errs.push("glcode");
    if (!partyGroupInput.glCategoryId) errs.push("glCategoryId");

    if (errs.length) {
      setError(errs as string[]);
      return;
    }

    try {
      const payload: CreatePartyGroupType = {
        ...partyGroupInput,
        isActive: Number(partyGroupInput.isActive) === 1 ? 1 : 0,
        isGroup: Number(partyGroupInput.isGroup) === 1 ? 1 : 0,
      };

      const resp = editFlag
        ? await updatePartyGroup(id, payload)
        : await createPartyGroup(payload);

      if (resp?.statusCode === 200 || resp?.statusCode === 201) {
        toast.success(
          resp?.message ?? (editFlag ? "Updated" : "Created") + " successfully"
        );
        setOpen(false);
        setEditFlag(false);
        await getPartyList();
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

  // load table
  useEffect(() => {
    getPartyList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchTerm, page, size]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPage(1);
    setSearch(e.target.value);
  };

  const handleEdit = (row: any) => {
    setEditFlag(true);
    setOpen(true);
    setId(row.id);
    getPartyGroupById(row.id);
  };

  const handleClickOpen = () => {
    setOpen(true);
    setEditFlag(false);
    const blank: CreatePartyGroupType = {
      partyGroupName: "",
      parentPartyGroupId: 0,
      parentPartyGroupName: "",
      groupTypeId: 0,
      groupName: "",
      description: "",
      glcode: "",
      glCategoryId: 0,
      glCategoryName: "",
      isActive: 0,
      isGroup: 0,
    };
    setPartyGroupInput(blank);
    setOriginalPartyGroup(null); // create mode
    setSelectedPartyType(null);
    setSelectedParentGroup(null);
    setError([]);
  };

  const handleClose = () => {
    setOpen(false);
    setEditFlag(false);
    setError([]);
  };

  // clear only edited field’s error when valid
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target as {
      name: keyof CreatePartyGroupType;
      value: any;
    };

    setPartyGroupInput((prev) => ({ ...prev, [name]: value }));

    const valid =
      typeof value === "number"
        ? value > 0
        : typeof value === "string"
          ? value.trim().length > 0
          : !!value;

    if (valid) clearFieldError(name);
  };

  // handles both "isActive" (native) and "isGroup" (synthetic from child)
  const handleSwitch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target as any;

    if (name === "isActive") {
      setPartyGroupInput((prev) => ({ ...prev, isActive: checked ? 1 : 0 }));
      return;
    }

    if (name === "isGroup") {
      // Do not allow/track isGroup changes in EDIT mode
      if (editFlag) return;
      setPartyGroupInput((prev) => ({ ...prev, isGroup: checked ? 1 : 0 }));
      return;
    }
  };

  // set selected autocompletes on edit
  useEffect(() => {
    if (!open || !editFlag) return;

    const gtList = normalize(PartyTypes) as Array<{
      id: number;
      code?: string;
    }>;
    const pgList = normalize(ParentPartyGroups) as Array<{
      id: number;
      partyGroupName?: string;
    }>;

    if (gtList.length) {
      const sel = gtList.find(
        (t) => Number(t.id) === Number(partyGroupInput.groupTypeId)
      );
      setSelectedPartyType(sel as any);
    }
    if (pgList.length) {
      const sel = pgList.find(
        (p) => Number(p.id) === Number(partyGroupInput.parentPartyGroupId)
      );
      setSelectedParentGroup(sel as any);
    }
  }, [
    open,
    editFlag,
    PartyTypes,
    ParentPartyGroups,
    partyGroupInput.groupTypeId,
    partyGroupInput.parentPartyGroupId,
  ]);

  // autocomplete handlers
  const handlePartytypeChange = (
    _e: React.SyntheticEvent,
    value: PartyTypeOption | null
  ) => {
    setSelectedPartyType(value);
    updatePartyGroupInputField("groupTypeId", value?.id ?? 0);
    updatePartyGroupInputField(
      "groupName",
      (value as any)?.code ?? value?.groupName ?? ""
    );
    if (value?.id) clearFieldError("groupTypeId");
  };

  const handlePartyGroupChange = (
    _e: React.SyntheticEvent,
    value: PartyGroupOption | null
  ) => {
    setSelectedParentGroup(value);
    updatePartyGroupInputField("parentPartyGroupId", value?.id ?? 0);
    updatePartyGroupInputField(
      "parentPartyGroupName",
      (value as any)?.partyGroupName ?? ""
    );
    if (value?.id) clearFieldError("parentPartyGroupId");
  };

  return (
    <>
      <Box
        display={"flex"}
        justifyContent={"space-between"}
        alignItems={"center"}
        flexWrap={"wrap"}
        gap={2}
      >
        <Box>
          <IconBreadcrumbs parent={"Party"} child={"Party Group"} path="" />
        </Box>

        <Box
          display={"flex"}
          justifyContent={"space-between"}
          alignItems={"center"}
          flexWrap={"wrap"}
          gap={2}
        >
          <GlobalSearch
            placeholder="Search Party Group"
            width={300}
            onChange={handleSearch}
          />
          <Box className="d-flex-center" gap={2}>
            <MuiButton
              startIcon={<GoPlus />}
              variant="contained"
              onClick={handleClickOpen}
            >
              Create
            </MuiButton>
          </Box>
        </Box>
      </Box>

      <Box
        sx={{ width: "100%", my: 2, height: 700 }}
        className="main-table content-wrapper"
      >
        {loading ? (
          <SkeletonLoader />
        ) : (
          <MuiTable
            rows={party || []}
            columns={columns}
            paginationMode="server"
            loading={loading}
            initialState={{
              pagination: { paginationModel: { pageSize: size } },
            }}
            rowCount={count}
            pageSizeOptions={[15, 30, 50]}
            slots={{ noRowsOverlay: () => <NoDataFound /> }}
            onPaginationModelChange={(newModel: any) => {
              setPage(newModel.page + 1);
              setSize(newModel.pageSize);
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

      <CreatePartyGroup
        open={open}
        close={handleClose}
        editFlag={editFlag}
        handleChange={handleChange}
        handleSwitch={handleSwitch}
        handleSubmit={handleSubmit}
        error={error}
        PartyGroupInput={partyGroupInput}
        PartyType={PartyTypes}
        PartyGroupData={ParentPartyGroups}
        PartyGlCategory={PartyGlCategory}
        handlePartytypeChange={handlePartytypeChange}
        selectedPartyType={selectedPartyType}
        handlePartyGroupChange={handlePartyGroupChange}
        selectedPartyGroup={selectedParentGroup}
        submitDisabled={submitDisabled}
      />
    </>
  );
}

export default PartyListPage;
