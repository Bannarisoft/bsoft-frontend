"use client";

import { Box } from "@mui/material";
import React, { useCallback, useEffect, useState } from "react";
import { MuiButton, MuiTable } from "bsoft-base-elements";
import { GoPlus } from "react-icons/go";
import IconBreadcrumbs from "../../../molecules/AdminLayout/BreadCrumbs";
import GlobalSearch from "../../../molecules/AdminLayout/GlobalSearch";
import { useDebounce } from "../../../../hooks/useDebounceHook";
import { FiEdit } from "react-icons/fi";
import { RiDeleteBin6Line } from "react-icons/ri";
import NoDataFound from "../../../molecules/AdminLayout/NoDataFound";
import DeleteConfirmation from "../../../molecules/Master/DeleteConfirmation";
import { usePrivilegeCheck } from "../../../../hooks/usePrivilegeCheck";
import ErrorModal from "../../../molecules/Master/Role/ErrorModal";
import SkeletonLoader from "../../../molecules/AdminLayout/SkeletonLoader";
import CreatePutawayRule from "../../../molecules/Inventory/Master/CreatePutawayRule";
import { Apirequest } from "../../../../utils/lib";
import InventoryInventoryConfig from "../../../../utils/inventory.api.json";
import {
  GetItem,
  PutawayRuleRequest,
  Strategy,
} from "../../../../types/inventoryTypes";
import { useRecoilValue } from "recoil";
import { UserData } from "../../../../utils/atoms";
import { useDataFetchHook } from "../../../../hooks/useDataFetchHook";
import { Warehouse } from "../../../../utils/warehouse.api.json";
import { RackMaster, BinMaster } from "../../../../utils/warehouse.api.json";
import InventoryConfig from "../../../../utils/inventory.api.json";
import toast from "react-hot-toast";

const PutawayRuleListPage = () => {
  const [pathname, setPathName] = useState<string>("");
  const permissions = usePrivilegeCheck(pathname);
  const [page, setPage] = React.useState<number>(1);
  const [size, setSize] = React.useState<number>(15);
  const [search, setSearch] = React.useState("");
  const debouncedSearchTerm = useDebounce(search, 500);
  const [loading, setLoading] = React.useState(true);
  const [count, setCount] = React.useState<number>(0);
  const [initFlag, setInitFlag] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const [error, setError] = React.useState<any[]>([]);
  const [editFlag, setEditFlag] = React.useState(false);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [putawayRuleData, setPutawayRuleData] = React.useState<any[]>([]);
  const [errorModalOpen, setErrorModalOpen] = React.useState(false);
  const [errorMessages, setErrorMessages] = React.useState<string[]>([]);
  const userValue = useRecoilValue(UserData);
  const [selectedValues, setSelectedValues] = useState<{
    [key: string]: any[];
  }>({});

  const initialPutawayRuleInput: PutawayRuleRequest = {
    body: {
      id: 0,
      unitId: 0,
      itemGroupId: 0,
      itemCategoryId: 0,
      itemId: 0,
      warehouseId: 0,
      strategies: [{ storageTypeId: 0, targetId: 0, priorityId: 0 }],
    },
  };
  const [putawayRuleInput, setPutawayRuleInput] = useState<PutawayRuleRequest>(
    initialPutawayRuleInput
  );
  const columns = [
    {
      field: "s_no",
      headerName: "S.No",
      minWidth: 50,
      flex: 1,
      sortable: true,
      renderCell: (params: any) => {
        return (
          (page - 1) * size + (params.api.getAllRowIds().indexOf(params.id) + 1)
        );
      },
    },
    {
      field: "item_GroupName",
      headerName: "Item Group",
      flex: 2,
      minWidth: 200,
      valueGetter: (value: any, row: any) =>
        `${row?.itemGroupName || ""}`.replace(/\b\w/g, (char) =>
          char.toUpperCase()
        ),
    },
    {
      field: "item_Category",
      headerName: "Item Category",
      flex: 2,
      minWidth: 200,
      valueGetter: (value: any, row: any) =>
        `${row?.itemCategoryName || ""}`.replace(/\b\w/g, (char) =>
          char.toUpperCase()
        ),
    },
    {
      field: "Item_Name",
      headerName: "Item Name",
      flex: 2,
      minWidth: 200,
      valueGetter: (value: any, row: any) =>
        `${row?.itemName || ""}`.replace(/\b\w/g, (char) => char.toUpperCase()),
    },
    {
      field: "warehouse_Code",
      headerName: "Warehouse Code",
      flex: 2,
      minWidth: 200,
      valueGetter: (value: any, row: any) =>
        `${row?.warehouseCode.toUpperCase() || ""}`,
    },
    {
      field: "Warehouse_Name",
      headerName: "Warehouse Name",
      flex: 2,
      minWidth: 200,
      valueGetter: (value: any, row: any) =>
        `${row?.warehouseName || ""}`.replace(/\b\w/g, (char) =>
          char.toUpperCase()
        ),
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
          {/* {permissions.canUpdate && ( */}
          <FiEdit
            fontSize={20}
            color="black"
            cursor={"pointer"}
            onClick={() => handleEdit(params.row)}
          />
          {/* )} */}
          {/* {permissions.canDelete && ( */}
          <RiDeleteBin6Line
            fontSize={20}
            color="red"
            cursor={"pointer"}
            onClick={() => handleDelete(params.row.id)}
          />
          {/* )} */}
        </Box>
      ),
    },
  ];

  useEffect(() => {
    setInitFlag(true);
    const currentPath = window.location.pathname.split("/bsoft").at(-1) || "";
    setPathName(currentPath);
  }, []);

  const handleSwitch = (e: React.ChangeEvent<HTMLInputElement>) => {
    let { checked } = e.target;
  };
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };
  const handleClose = () => {
    setOpen(false);
    setEditFlag(false);
    setError([]);
    setSelectedValues({});
  };

  const handleEdit = async (row: any) => {
    setEditFlag(true);
    setOpen(true);

    try {
      const rule = await GetOverAllPutawayRule(row.id);
      if (rule.itemCategoryId) {
        try {
          setLoading(true);
          const response = await GetItemMasterList(rule.itemCategoryId);

          const itemsArray: GetItem[] = Array.isArray(response)
            ? response
            : (response as any)?.data ?? [];

          const mappedItems = itemsArray.map((item: any) => ({
            ...item,
            label: `${item.itemCode} - ${item.itemName}`,
          }));

          setItemOptions(mappedItems);
          const selectedItem =
            mappedItems.find((item) => item.id === rule.itemId) || null;

          setSelectedValues((prev: any) => ({
            ...prev,
            itemId: selectedItem ? [selectedItem] : [],
          }));
        } catch (err) {
          console.error("Failed to fetch items for category:", err);
          setItemOptions([]);
        } finally {
          setLoading(false);
        }
      }
      setSelectedValues((prev: any) => ({
        ...prev,
        itemGroupId: ItemGroup
          ? [
            ItemGroup.find((item: any) => item.id === rule.itemGroupId),
          ].filter(Boolean)
          : [],
        itemCategoryId: ItemCategory
          ? [
            ItemCategory.find((item: any) => item.id === rule.itemCategoryId),
          ].filter(Boolean)
          : [],
        warehouseId: warehouse
          ? [
            warehouse.find((item: any) => item.id === rule.warehouseId),
          ].filter(Boolean)
          : [],
      }));

      // --- Strategies ---
      const strategySelectedValues: any = {};
      rule.strategies.forEach((s: any, idx: number) => {
        if (s.storageTypeCode === "Rack") {
          strategySelectedValues[`rackId_${idx}`] = Rack
            ? [Rack.find((r: any) => r.id === s.targetId)].filter(Boolean)
            : [];
        } else if (s.storageTypeCode === "Bin") {
          strategySelectedValues[`binId_${idx}`] = Bin
            ? [Bin.find((b: any) => b.id === s.targetId)].filter(Boolean)
            : [];
        }

        strategySelectedValues[`storageTypeId_${idx}`] = StorageType
          ? [StorageType.find((st: any) => st.id === s.storageTypeId)].filter(
            Boolean
          )
          : [];

        strategySelectedValues[`priorityId_${idx}`] = Priority
          ? [Priority.find((p: any) => p.id === s.priorityId)].filter(Boolean)
          : [];
      });

      setSelectedValues((prev: any) => ({
        ...prev,
        ...strategySelectedValues,
      }));
    } catch (err) {
      console.error("Failed to fetch rule for edit:", err);
    }
  };

  const GetOverAllPutawayRule = async (id: number) => {
    try {
      const { endpoint, method } =
        InventoryInventoryConfig.PutawayRule.GetPutawayRuleid;
      const url = endpoint.replace("{id}", id?.toString() ?? id);
      const response = await Apirequest(url, method, null, "inventory").then(
        (res) => res.data
      );

      if (response?.data) {
        const rule = response.data;

        setPutawayRuleInput({
          body: {
            id: rule.id,
            unitId: rule.unitId,
            itemGroupId: rule.itemGroupId ?? 0,
            itemCategoryId: rule.itemCategoryId ?? 0,
            itemId: rule.itemId ?? 0,
            warehouseId: rule.warehouseId ?? 0,
            strategies: rule.strategies.map((s: any) => ({
              id: s.id,
              storageTypeId: s.storageTypeId ?? 0,
              storageTypeCode: s.storageTypeCode || "",
              targetId: s.targetId ?? 0,
              targetCode: s.targetCode || "",
              targetName: s.targetName || "",
              priorityId: s.priorityId ?? 0,
              priorityName: s.priorityName || "",
            })),
          },
        });

        const strategySelectedValues: any = {};
        rule.strategies.forEach((s: any) => {
          strategySelectedValues[`storageTypeId_${s.id}`] = s.storageTypeId
            ? [
              {
                id: s.storageTypeId,
                code: s.storageTypeCode,
                label: s.storageTypeCode,
              },
            ]
            : [];

          strategySelectedValues[`targetId_${s.id}`] = s.targetId
            ? [
              {
                id: s.targetId,
                name: s.targetName,
                label: s.targetName,
              },
            ]
            : [];

          strategySelectedValues[`priorityId_${s.id}`] = s.priorityId
            ? [
              {
                id: s.priorityId,
                code: s.priorityName,
                label: s.priorityName,
              },
            ]
            : [];
        });

        setSelectedValues((prev: any) => ({
          ...prev,
          ...strategySelectedValues,
        }));

        return rule;
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      throw err;
    }
  };

  const handleClickOpen = () => {
    setOpen(true);
    setError([]);
    setPutawayRuleInput(initialPutawayRuleInput);
    setEditFlag(false);
    setSelectedValues({});
  };
  const GetPutawayList = async () => {
    try {
      const { endpoint, method } = InventoryInventoryConfig.PutawayRule;
      const response = await Apirequest(
        endpoint
          .replace("{page}", page.toString())
          .replace("{size}", size.toString())
          .replace("{searchTerm}", search),
        method,
        null,
        "inventory"
      ).then((res) => res.data);
      setLoading(false);
      setPutawayRuleData(response.data);
      setCount(response.totalCount);
    } catch (err) {
      console.log(err);
      setLoading(false);
    }
  };
  useEffect(() => {
    initFlag && search !== "" ? GetPutawayList() : GetPutawayList();
  }, [debouncedSearchTerm, page, size]);
  const { data: ItemGroup } = useDataFetchHook(
    InventoryInventoryConfig.ItemGroup.GetByGroup.endpoint,
    InventoryInventoryConfig.ItemGroup.GetByGroup.method,
    "inventory"
  );
  const { data: ItemCategory } = useDataFetchHook(
    InventoryInventoryConfig.ItemCategory.GetByCategory.endpoint,
    InventoryInventoryConfig.ItemCategory.GetByCategory.method,
    "inventory"
  );
  const { data: warehouse } = useDataFetchHook(
    Warehouse.GetAllWarehouseMaster.endpoint,
    Warehouse.GetAllWarehouseMaster.method,
    "warehouse"
  );
  const { data: StorageType } = useDataFetchHook(
    InventoryConfig.InventoryMisc.endpoint.replace("{type}", "STORAGETYPE"),
    InventoryConfig.InventoryMisc.method,
    "inventory"
  );

  const { data: Priority } = useDataFetchHook(
    InventoryConfig.InventoryMisc.endpoint.replace("{type}", "Priority"),
    InventoryConfig.InventoryMisc.method,
    "inventory"
  );
  const { data: Rack } = useDataFetchHook(
    RackMaster.GetRackMaster.endpoint,
    RackMaster.GetRackMaster.method,
    "warehouse"
  );
  const { data: Bin } = useDataFetchHook(
    BinMaster.GetAllBinMaster.endpoint,
    BinMaster.GetAllBinMaster.method,
    "warehouse"
  );
  const { data: Item } = useDataFetchHook(
    InventoryConfig.ItemMaster.GetItem.endpoint,
    InventoryConfig.ItemMaster.GetItem.method,
    "inventory"
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let { name, value } = e.target;
    setPutawayRuleInput({ ...putawayRuleInput, [name]: value });
    setError([]);
  };
  const [itemOptions, setItemOptions] = useState<GetItem[]>([]);

  const GetItemMasterList = async (
    itemCategoryId?: number
  ): Promise<GetItem[]> => {
    try {
      const { endpoint, method } = InventoryInventoryConfig.ItemMaster.ItemList;

      const url = endpoint
        .replace("{page}", page.toString())
        .replace("{size}", size.toString())
        .replace("{search}", search)
        .replace("{itemGroup}", "0")
        .replace("{itemCategory}", itemCategoryId?.toString() ?? "0");

      const response = await Apirequest(url, method, null, "inventory");

      if (response && typeof response === "object" && "data" in response) {
        return response.data ?? [];
      }
      return [];
    } catch (err) {
      console.error("GetItemMasterList failed:", err);
      return [];
    }
  };

  const handleAutocompleteChange = async (
    name: string,
    value: GetItem | null,
    index?: number
  ) => {
    setError([]);

    // --- Strategy rows ---
    if (index !== undefined) {
      setPutawayRuleInput((prev: any) => {
        const updatedStrategies = [...prev.body.strategies];
        const strategy = { ...updatedStrategies[index] };

        strategy[name] = value?.id || 0;

        switch (name) {
          case "rackId":
          case "binId":
            strategy.targetId = value?.id || 0;
            break;
          case "storageTypeId":
            const code = value?.itemCode || "";
            switch (code) {
              case "Rack":
                strategy.binId = 0;
                break;
              case "Bin":
                strategy.rackId = 0;
                break;
              default:
                strategy.rackId = 0;
                strategy.binId = 0;
                strategy.priorityId = 0;
            }
            break;
        }

        updatedStrategies[index] = strategy;
        return {
          ...prev,
          body: { ...prev.body, strategies: updatedStrategies },
        };
      });
      return;
    }

    // --- Main fields ---
    setSelectedValues((prev: any) => ({
      ...prev,
      [name]: value ? [value] : [],
    }));
    setPutawayRuleInput((prev: any) => ({
      ...prev,
      body: { ...prev.body, [name]: value?.id || 0 },
    }));

    switch (name) {
      case "itemCategoryId":
        if (!value) {
          setItemOptions([]);
          setSelectedValues((prev) => ({ ...prev, itemId: [] }));
          setPutawayRuleInput((prev) => ({
            ...prev,
            body: { ...prev.body, itemId: 0 },
          }));
        } else {
          try {
            setLoading(true);
            const response = await GetItemMasterList(value.id);

            // Type assertion to preserve 'data' access
            const itemsArray: GetItem[] = Array.isArray(response)
              ? response
              : (response as any)?.data ?? [];

            const mappedItems = itemsArray.map((item: any) => ({
              ...item,
              label: `${item.itemCode} - ${item.itemName}`,
            }));

            setItemOptions(mappedItems);
            setSelectedValues((prev) => ({ ...prev, itemId: [] }));
          } catch (err) {
            console.error("Failed to fetch items:", err);
            setItemOptions([]);
          } finally {
            setLoading(false);
          }
        }
        break;

      default:
        break;
    }
  };

  const handleSubmit = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    let temp: string[] = [];

    ["itemGroupId", "itemCategoryId", "warehouseId"].forEach((key) => {
      if (!selectedValues[key]?.[0]) temp.push(key);
    });

    if (
      !putawayRuleInput.body.strategies ||
      putawayRuleInput.body.strategies.length === 0
    ) {
      toast.error("Add at least one strategy");
      return;
    }
    setError(temp);

    if (temp.length === 0) {
      setLoading(true);
      if (editFlag) {
        UpdateInventoryStrategy();
      } else {
        AddInventoryStrategy();
      }
    }
  };

  const AddInventoryStrategy = async () => {
    setLoading(true);
    try {
      const { itemGroupId, itemCategoryId, itemId, warehouseId, strategies } =
        putawayRuleInput.body;

      const body = {
        body: {
          unitId: userValue.unitId || 0,
          itemGroupId: itemGroupId ?? 0,
          itemCategoryId: itemCategoryId ?? 0,
          itemId: itemId ?? 0,
          warehouseId: warehouseId ?? 0,
          strategies: strategies.map((s) => ({
            storageTypeId: s.storageTypeId ?? 0,
            targetId: s.targetId ?? 0,
            priorityId: s.priorityId ?? 0,
          })),
        },
      };

      const { endpoint, method } =
        InventoryInventoryConfig.PutawayRule.AddPutawayRule;

      const response = await Apirequest(
        endpoint,
        method,
        body,
        "inventory"
      ).then((res) => res.data);

      if (response.statusCode === 200 || response.statusCode === 201) {
        toast.success(response.message);
        setOpen(false);
        setEditFlag(false);
        GetPutawayList();
      } else {
        toast.error(response.message);
        if (Array.isArray(response.errors) && response.errors.length > 0) {
          setErrorModalOpen(true);
          setErrorMessages(response.errors);
        }
      }
    } catch (err) {
      console.log(err);
      toast.error("Something went wrong while adding the putaway strategy.");
    } finally {
      setLoading(false);
    }
  };

  const UpdateInventoryStrategy = async () => {
    setLoading(true);
    try {
      const {
        id,
        itemGroupId,
        itemCategoryId,
        itemId,
        warehouseId,
        strategies,
      } = putawayRuleInput.body;

      const body = {
        id: id,
        body: {
          unitId: userValue.unitId || 0,
          itemGroupId: itemGroupId ?? 0,
          itemCategoryId: itemCategoryId ?? 0,
          itemId: itemId ?? 0,
          warehouseId: warehouseId ?? 0,
          strategies: strategies.map((s) => ({
            storageTypeId: s.storageTypeId ?? 0,
            targetId: s.targetId ?? 0,
            priorityId: s.priorityId ?? 0,
          })),
        },
      };

      const { endpoint, method } =
        InventoryInventoryConfig.PutawayRule.UpdatePutawayRule;

      const response = await Apirequest(
        endpoint,
        method,
        body,
        "inventory"
      ).then((res) => res.data);

      if (response.statusCode === 200 || response.statusCode === 201) {
        toast.success(response.message);
        setOpen(false);
        setEditFlag(false);
        GetPutawayList();
      } else {
        toast.error(response.message);
        if (Array.isArray(response.errors) && response.errors.length > 0) {
          setErrorMessages(response.errors);
          setErrorModalOpen(true);
        }
      }
    } catch (err) {
      console.log(err);
      toast.error("Something went wrong while updating the putaway strategy.");
    } finally {
      setLoading(false);
    }
  };
  const handleDelete = (id: number) => {
    setPutawayRuleInput({
      ...putawayRuleInput,
      body: {
        ...putawayRuleInput.body,
        id: id,
      },
    });
    setDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    await DeletePutawayRule();
    setDeleteOpen(false);
  };

  const DeletePutawayRule = async () => {
    try {
      const { endpoint, method } =
        InventoryInventoryConfig.PutawayRule.DeletePutawayRule;

      const result = await Apirequest(
        endpoint.replace("{id}", `${putawayRuleInput.body.id}`),
        method,
        { id: putawayRuleInput.body.id },
        "inventory"
      ).then((res) => res.data);

      toast.success(result?.message);
      GetPutawayList();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete putaway rule");
    }
  };

  const handleAddStorageRule = useCallback(() => {
    const hasUnselected = putawayRuleInput.body.strategies.some(
      (rule: Strategy) => !rule.priorityId || !rule.targetId
    );

    if (hasUnselected) {
      toast.error("Please fill all fields before adding a new rule.");
      return;
    }

    setPutawayRuleInput((prev) => {
      const strategies = prev.body.strategies;

      const maxId =
        strategies.length > 0
          ? Math.max(...strategies.map((rule: any, idx: number) => idx + 1))
          : 0;

      return {
        ...prev,
        body: {
          ...prev.body,
          strategies: [
            ...strategies,
            {
              storageTypeId: 0,
              targetId: 0,
              priorityId: 0,
              id: maxId + 1,
            },
          ],
        },
      };
    });
  }, [putawayRuleInput]);

  const handleDeleteStorageRule = (id: number) => {
    setPutawayRuleInput((prev) => ({
      ...prev,
      body: {
        ...prev.body,
        strategies: prev.body.strategies.filter((_, idx) => idx !== id),
      },
    }));
  };

  const getFilteredOptions = (
    currentValue: any | null,
    allOptions: any[],
    currentRuleId: number,
    allRules: Strategy[] | null | undefined,
    fieldName: keyof Strategy
  ) => {
    if (!Array.isArray(allRules)) return allOptions;

    const selectedIds = allRules
      .filter((rule) => rule[fieldName] && rule !== allRules[currentRuleId])
      .map((rule) => rule[fieldName]);

    return allOptions.filter(
      (opt) => !selectedIds.includes(opt.id) || opt.id === currentValue?.id
    );
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
          <IconBreadcrumbs
            parent={"Inventory"}
            child={"Putaway Rule"}
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
            placeholder="search putaway"
            width={300}
            onChange={handleSearch}
          />
          <Box className="d-flex-center" gap={2}>
            {/* {permissions.canAdd && ( */}
            <MuiButton
              startIcon={<GoPlus />}
              onClick={handleClickOpen}
              variant="contained"
            >
              Create
            </MuiButton>
            {/* )} */}
          </Box>
        </Box>
      </Box>
      <Box sx={{ width: "100%", my: 2, height: 700 }} className="main-table">
        {loading ? (
          <SkeletonLoader />
        ) : (
          <MuiTable
            rows={putawayRuleData}
            columns={columns}
            paginationMode="server"
            initialState={{
              pagination: {
                paginationModel: {
                  pageSize: size,
                },
              },
            }}
            rowCount={count}
            pageSizeOptions={[15, 30, 50]}
            slots={{
              noRowsOverlay: () => <NoDataFound />,
            }}
            onPaginationModelChange={(newPage) => {
              setPage(newPage.page + 1);
              setSize(newPage.pageSize);
            }}
          />
        )}
      </Box>
      <CreatePutawayRule
        open={open}
        close={handleClose}
        error={error}
        editFlag={editFlag}
        handleSwitch={handleSwitch}
        ItemGroup={ItemGroup}
        ItemCategory={ItemCategory}
        warehouse={warehouse}
        StorageType={StorageType}
        Rack={Rack}
        Bin={Bin}
        Priority={Priority}
        selectedValues={selectedValues}
        putawayRuleInput={putawayRuleInput}
        handleAutocompleteChange={handleAutocompleteChange}
        handleChange={handleChange}
        handleSubmit={handleSubmit}
        handleAddStorageRule={handleAddStorageRule}
        handleDeleteStorageRule={handleDeleteStorageRule}
        getFilteredOptions={getFilteredOptions}
        itemOptions={itemOptions}
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
    </>
  );
};
export default PutawayRuleListPage;
