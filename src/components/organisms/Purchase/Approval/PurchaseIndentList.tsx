"use client";

import React, { useEffect, useState } from "react";
import { Box } from "@mui/material";
import NoDataFound from "../../../molecules/AdminLayout/NoDataFound";
import { MuiTable } from "bsoft-base-elements";
import { useRouter, useSearchParams } from "next/navigation";
import PurchaseIndentApproval from "./PurchaseIndentApproval";
import { Apirequest } from "../../../../utils/lib";
import { useDebounce } from "../../../../hooks/useDebounceHook";
import PurchaseConfig from "../../../../utils/purchase.api.json";
import dayjs from "dayjs";
import IndentApproval from "./IndentApproval";
interface PurchaseApprovalListProps {
  moduleType?: string; // moduleType will be "Asset" or "Purchase Indent"
}
const PurchaseApprovalList: React.FC<PurchaseApprovalListProps> = ({
  moduleType,
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const value = moduleType || searchParams.get("value"); // fallback to URL
  const id = searchParams.get("id");

  const [search, setSearch] = useState("");
  const debouncedSearchTerm = useDebounce(search, 500);
  const [page, setPage] = useState<number>(1);
  const [size, setSize] = useState<number>(15);
  const [count, setCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [purchaseDetailData, setPurchaseData] = useState<any[]>([]);
  const [assetData, setAssetData] = useState<any[]>([]);

  // ------------------- PURCHASE LIST -------------------
  const PurchaseList = async () => {
    try {
      const { endpoint, method } = PurchaseConfig.PurchaseIndent;
      const result = await Apirequest(
        endpoint
          .replace("{page}", page.toString())
          .replace("{size}", size.toString())
          .replace("{searchTerm}", search),
        method,
        null,
        "purchase"
      ).then((res) => res.data);

      setLoading(false);
      setPurchaseData(result.data);
      setCount(result.totalCount);
    } catch (err) {
      console.log(err);
      setLoading(false);
    }
  };

  // ------------------- ASSET LIST -------------------
  const AssetList = async () => {
    try {
      const { endpoint, method } = PurchaseConfig.PurchaseMisc; // 👈 use correct config for Asset
      const result = await Apirequest(
        endpoint
          .replace("{page}", page.toString())
          .replace("{size}", size.toString())
          .replace("{searchTerm}", search),
        method,
        null,
        "purchase"
      ).then((res) => res.data);

      console.log("Asset list fetched ✅");
      setLoading(false);
      setAssetData(result.data);
      setCount(result.totalCount);
    } catch (err) {
      console.log(err);
      setLoading(false);
    }
  };

  // ------------------- HOOK -------------------
  useEffect(() => {
    setLoading(true);
    if (value === "asset") {
      AssetList();
    } else {
      PurchaseList();
    }
  }, [debouncedSearchTerm, page, size, value]);

  // ------------------- TABLE COLUMNS -------------------
  const columns = [
    {
      field: "s_no",
      headerName: "S.No",
      minWidth: 100,
      flex: 1,
      sortable: true,
      renderCell: (params: any) =>
        (page - 1) * size + (params.api.getAllRowIds().indexOf(params.id) + 1),
    },
    {
      field: "indentNumber",
      headerName: "Indent Number",
      flex: 1,
      minWidth: 200,
      valueGetter: (_: any, row: any) =>
        `${row?.indentNumber || ""}`.replace(/\b\w/g, (char) =>
          char.toUpperCase()
        ),
    },
    {
      field: "indentType",
      headerName: "Indent Type",
      flex: 2,
      minWidth: 200,
      valueGetter: (_: any, row: any) =>
        `${row?.indentType || ""}`.replace(/\b\w/g, (char) =>
          char.toUpperCase()
        ),
    },
    {
      field: "unitName",
      headerName: "Unit Name",
      flex: 2,
      minWidth: 200,
      valueGetter: (_: any, row: any) =>
        `${row?.unitName || ""}`.replace(/\b\w/g, (char) => char.toUpperCase()),
    },
    {
      field: "isActive",
      headerName: "Status",
      flex: 1,
      minWidth: 200,
      valueGetter: (_: any, row: any) =>
        row?.isActive ? "Active" : "Inactive",
    },
    {
      field: "createdDate",
      headerName: "Created Date",
      flex: 1,
      minWidth: 200,
      valueGetter: (_: any, row: any) =>
        dayjs(row?.createdDate).format("DD-MM-YYYY"),
    },
    {
      field: "createdByName",
      headerName: "Created By",
      sortable: true,
      flex: 2,
      minWidth: 150,
      valueGetter: (_: any, row: any) => row?.createdByName ?? "",
    },
  ];

  // ------------------- ROW CLICK -------------------
  const handleRowClick = (params: any) => {
    if (value === "asset") {
      router.push(`/purchase/approval?value=asset&id=${params.row.id}`);
    } else {
      router.push(`/purchase/approval?value=purchase&id=${params.row.id}`);
    }
  };

  // ------------------- ROUTER CONDITION -------------------
  if (value === "purchase" && id) {
    return <PurchaseIndentApproval />;
  } else if (value === "asset" && id) {
    return <IndentApproval />; // 👈 route to correct component
  }

  return (
    <Box
      sx={{ width: "100%", my: 2, height: 700 }}
      className="main-table content-wrapper"
    >
      <MuiTable
        rows={value === "asset" ? assetData : purchaseDetailData}
        columns={columns}
        paginationMode="server"
        initialState={{
          pagination: { paginationModel: { pageSize: 15 } },
        }}
        rowCount={count}
        rowHeight={40}
        columnHeaderHeight={40}
        pageSizeOptions={[15, 30, 50]}
        disableRowSelectionOnClick
        onRowClick={handleRowClick}
        slots={{ noRowsOverlay: () => <NoDataFound /> }}
      />
    </Box>
  );
};

export default PurchaseApprovalList;
