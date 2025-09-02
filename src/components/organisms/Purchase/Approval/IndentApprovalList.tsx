"use client";

import React, { useEffect, useState } from "react";
import { Box } from "@mui/material";
import NoDataFound from "../../../molecules/AdminLayout/NoDataFound";
import { MuiTable } from "bsoft-base-elements";
import { useRouter, useSearchParams } from "next/navigation";
import IndentApproval from "./IndentApproval";
import { useDebounce } from "../../../../hooks/useDebounceHook";
import dayjs from "dayjs";
import { Apirequest } from "../../../../utils/lib";
import PurchaseConfig from "../../../../utils/purchase.api.json";

export default function AssetApprovalPage() {
  const router = useRouter();
   const searchParams = useSearchParams();
   const value = searchParams.get("value");
   const id = searchParams.get("id");
   const [search, setSearch] = React.useState("");
   const debouncedSearchTerm = useDebounce(search, 500);
   const [page, setPage] = React.useState<number>(1);
   const [size, setSize] = React.useState<number>(15);
   const [count, setCount] = React.useState<number>(0);
   const [loading, setLoading] = React.useState(true);
   const [purchaseDetailData, setPurchaseData] = React.useState<any[]>([]);
   const [initFlag, setInitFlag] = React.useState(false);
 
   const columns = [
     {
       field: "s_no",
       headerName: "S.No",
       minWidth: 100,
       flex: 1,
       sortable: true,
       renderCell: (params: any) => {
         return (
           (page - 1) * size + (params.api.getAllRowIds().indexOf(params.id) + 1)
         );
       },
     },
     {
       field: "indentNumber",
       headerName: "Indent Number",
       flex: 1,
       minWidth: 200,
       valueGetter: (value: any, row: any) =>
         `${row?.indentNumber || ""}`.replace(/\b\w/g, (char) =>
           char.toUpperCase()
         ),
     },
     {
       field: "indentType",
       headerName: "Indent Type",
       flex: 2,
       minWidth: 200,
       valueGetter: (value: any, row: any) =>
         `${row?.indentType || ""}`.replace(/\b\w/g, (char) =>
           char.toUpperCase()
         ),
     },
     {
       field: "unitName",
       headerName: "Unit Name",
       flex: 2,
       minWidth: 200,
       valueGetter: (value: any, row: any) =>
         `${row?.unitName || ""}`.replace(/\b\w/g, (char) => char.toUpperCase()),
     },
     {
       field: "isActive",
       headerName: "Status",
       flex: 1,
       minWidth: 200,
       valueGetter: (value: any, row: any) =>
         `${row?.isActive ? "Active" : "Inactive"}`,
     },
     {
       field: "createdDate",
       headerName: "Created Date",
       flex: 1,
       minWidth: 200,
       valueGetter: (value: any, row: any) =>
         `${dayjs(row?.createdDate).format("DD-MM-YYYY")}`,
     },
     {
       field: "createdByName",
       headerName: "Created By",
       sortable: true,
       flex: 2,
       minWidth: 150,
       valueGetter: (value: any, row: any) => `${row?.createdByName ?? ""}`,
     },
   ];
 
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
   useEffect(() => {
     initFlag && search !== "" ? PurchaseList() : PurchaseList();
   }, [debouncedSearchTerm, page, size]);
 
   const handleRowClick = (params: any) => {
     router.push(`/purchase/approval?value=indent&id=${params.row.id}`);
   };
 
   if (value === "indent" && id) {
     return <IndentApproval />;
   }
 
   return (
     <Box
       sx={{ width: "100%", my: 2, height: 700 }}
       className="main-table content-wrapper"
     >
       <MuiTable
         rows={purchaseDetailData}
         columns={columns}
         paginationMode="server"
         initialState={{
           pagination: {
             paginationModel: { pageSize: 15 },
           },
         }}
         rowCount={count}
         rowHeight={40}
         columnHeaderHeight={40}
         pageSizeOptions={[15, 30, 50]}
         disableRowSelectionOnClick
         onRowClick={handleRowClick}
         slots={{
           noRowsOverlay: () => <NoDataFound />,
         }}
       />
     </Box>
   );
 }
