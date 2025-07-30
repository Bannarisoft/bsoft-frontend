"use client";
import { Box, Skeleton } from "@mui/material";
import React, { useEffect, useState } from "react";
import IconBreadcrumbs from "../../../molecules/AdminLayout/BreadCrumbs";
import GlobalSearch from "../../../molecules/AdminLayout/GlobalSearch";
import { MuiButton, MuiTable } from "bsoft-base-elements";
import { GoPlus } from "react-icons/go";
import Link from "next/link";
import { Apirequest } from "../../../../utils/lib";
import Config from "../../../../../src/utils/fam.api.json";
import { useDebounce } from "../../../../hooks/useDebounceHook";
import NoDataFound from "../../../molecules/AdminLayout/NoDataFound";
import { useRouter } from "next/navigation";
import QRCode from "react-qr-code";
import dayjs from "dayjs";
import { useRecoilState } from "recoil";
import { AssetCheckedList } from "../../../../utils/atoms";
import SkeletonLoader from "../../../molecules/AdminLayout/SkeletonLoader";

const AssetListPage = () => {
  const [page, setPage] = useState<number>(1);
  const [size, setSize] = useState<number>(15);
  const [search, setSearch] = useState<string>("");
  const debouncedSearchTerm = useDebounce(search, 500);
  const [loading, setLoading] = useState<boolean>(true);
  const [assetData, setAssetData] = useState<any[]>([]);
  const [count, setCount] = useState<number>(0);
  const [selectedRows, setSelectedRows] = useRecoilState<any>(AssetCheckedList);
  const [initFlag, setInitFlag] = useState<boolean>(false);
  const router = useRouter();

  const columns = [
    {
      field: "assetName",
      headerName: "Asset Name",
      flex: 2,
      minWidth: 200,
      valueGetter: (value: any, row: any) => `${row?.assetName || ""}`,
    },
    {
      field: "assetCode",
      headerName: "Asset Code",
      flex: 2,
      minWidth: 200,
      valueGetter: (value: any, row: any) =>
        `${row?.assetCode.toUpperCase() || ""}`,
    },
    {
      field: "assetGroupName",
      headerName: "Asset Group Name",
      flex: 2,
      minWidth: 200,
      valueGetter: (value: any, row: any) => `${row?.assetGroupName || ""}`,
    },
    {
      field: "workingStatusDesc",
      headerName: "Working Status Desc",
      flex: 2,
      minWidth: 200,
      valueGetter: (value: any, row: any) => `${row?.workingStatusDesc || ""}`,
    },
    {
      field: "assetTypeDesc",
      headerName: "Asset Type Desc",
      flex: 2,
      minWidth: 200,
      valueGetter: (value: any, row: any) => `${row?.assetTypeDesc || ""}`,
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
      field: "createdAt",
      headerName: "Created At",
      flex: 2,
      minWidth: 150,
      valueGetter: (value: any, row: any) =>
        `${dayjs(row?.createdDate).format("DD-MM-YYYY")}`,
    },
    {
      field: "createdByName",
      headerName: "Created By",
      flex: 2,
      minWidth: 200,
      valueGetter: (value: any, row: any) => `${row?.createdByName || ""}`,
    },
  ];

  const GetAssetList = async () => {
    try {
      const { endpoint, method } = Config.AssetGeneral;
      const result = await Apirequest(
        endpoint
          .replace("{page}", page.toString())
          .replace("{size}", size.toString())
          .replace("{searchTerm}", search),
        method,
        null,
        "fam"
      ).then((res) => res.data);
      setLoading(false);
      setAssetData(result.data);
      setCount(result.totalCount);
    } catch (err) {
      console.log(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initFlag) {
      GetAssetList();
    }
  }, [debouncedSearchTerm, page, size, initFlag]);

  useEffect(() => {
    setInitFlag(true);
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const handleRowClick = (params: any) => {
    router.push(`/fam/asset-management/asset-detail/${params.row.id}`);
  };

  const handleSelectionChange = (selectionModel: any[]) => {
    const newlySelected = assetData.filter((row) =>
      selectionModel.includes(row.id)
    );
    const existingIds = selectedRows.map((row: any) => row.id);

    const updatedSelection = [
      ...selectedRows.filter(
        (row: any) => !assetData.some((r) => r.id === row.id)
      ),
      ...newlySelected,
    ];

    setSelectedRows(updatedSelection);
  };

  const handlePrint = () => {
    const printContent = document.getElementById("print-area");
    if (!printContent) return;

    const printWindow = window.open("", "", "width=800,height=600");
    if (printWindow) {
      printWindow.document.write(
        `<html>
          <head>
            <title>Print QR</title>
            <style>
              @media print {
                @page {
                  size: 70mm 63mm;
                  margin: 0;
                }
                body {
                  margin: 0;
                  padding: 0;
                  width: 70mm;
                  height: 63mm;
                }
                .qr-container {
                  width: 70mm;
                  height: 63mm;
                  display: table;
                  page-break-after: always;
                }
                .qr-centered {
                  display: table-cell;
                  vertical-align: middle;
                  text-align: center;
                }
                .asset-name {
                  font-family: Arial, sans-serif;
                  font-weight: bold;
                  font-size: 10pt;
                  margin-bottom: 5px;
                }
                .asset-code {
                  font-family: Arial, sans-serif;
                  font-size: 9pt;
                  margin-top: 5px;
                }
              }
            </style>
          </head>
          <body>
            ${printContent.innerHTML}
          </body>
        </html>`
      );
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 1000);
    }
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
            parent={"Asset Management"}
            child={"Asset List"}
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
            placeholder="Search Asset"
            width={300}
            onChange={handleSearch}
          />
          <Box className="d-flex-center" gap={2}>
            <Link href={"/fam/asset-management/add-asset"}>
              <MuiButton startIcon={<GoPlus />} variant="contained">
                Add Asset
              </MuiButton>
            </Link>
            <MuiButton
              variant="contained"
              sx={{ background: "#fff !important", color: "#000 !important" }}
              disabled={selectedRows.length === 0}
              onClick={handlePrint}
            >
              Print Selected
            </MuiButton>
          </Box>
        </Box>
      </Box>

      <div id="print-area" style={{ display: "none" }}>
        {selectedRows.map(
          (row: any) =>
            row.assetCode && (
              <div key={row.id} className="qr-container">
                <div className="qr-centered">
                  <p className="asset-name">{row.assetName}</p>
                  <QRCode value={row.assetCode} size={100} level="H" />
                  {/* <p className="asset-code">{row.assetCode}</p> */}
                </div>
              </div>
            )
        )}
      </div>

      <Box sx={{ width: "100%", my: 2, height: 700 }} className="main-table">
        {loading ? (
           <SkeletonLoader />
        ) : (
          <MuiTable
            rows={assetData}
            columns={columns}
            onRowClick={handleRowClick}
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
            sx={{ cursor: "pointer" }}
            onPaginationModelChange={(newPage) => {
              setPage(newPage.page + 1);
              setSize(newPage.pageSize);
            }}
            checkboxSelection
            disableRowSelectionOnClick
            rowSelectionModel={selectedRows.map((row: any) => row.id)}
            onRowSelectionModelChange={(row: any) => handleSelectionChange(row)}
          />
        )}
      </Box>
    </>
  );
};

export default AssetListPage;
