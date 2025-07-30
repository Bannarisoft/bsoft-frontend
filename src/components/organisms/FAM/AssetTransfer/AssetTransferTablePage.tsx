import {
  Box,
  Skeleton,
  Collapse,
  Paper,
  Typography,
  Divider,
  Chip,
  Grid,
  DialogTitle,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import IconBreadcrumbs from "../../../molecules/AdminLayout/BreadCrumbs";
import GlobalSearch from "../../../molecules/AdminLayout/GlobalSearch";
import { MuiButton, MuiTable, MuiText } from "bsoft-base-elements";
import NoDataFound from "../../../molecules/AdminLayout/NoDataFound";
import { useDebounce } from "../../../../hooks/useDebounceHook";
import { GoPlus } from "react-icons/go";
import { IoChevronDownOutline, IoChevronUpOutline } from "react-icons/io5";
import { Apirequest, formatIndianCurrency } from "../../../../utils/lib";
import Config from "../../../../utils/fam.api.json";
import dayjs, { Dayjs } from "dayjs";
import Link from "next/link";
import { usePrivilegeCheck } from "../../../../hooks/usePrivilegeCheck";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

const AssetTransferPage = () => {
  const [pathname, setPathName] = useState<string>("");
  const permissions = usePrivilegeCheck(pathname);
  const [page, setPage] = React.useState<number>(1);
  const [size, setSize] = React.useState<number>(15);
  const [loading, setLoading] = React.useState(true);
  const [count, setCount] = React.useState<number>(0);
  const [search, setSearch] = React.useState("");
  const [fromdate, setFromdate] = React.useState<Dayjs>();
  const [todate, setTodate] = React.useState<Dayjs>();
  const debouncedSearchTerm = useDebounce(search, 500);
  const [initFlag, setInitFlag] = React.useState(false);
  const [transferData, setTransferData] = React.useState<any[]>([]);
  const [assetData, setAssetData] = useState<any>([]);

  const [expandedRowId, setExpandedRowId] = React.useState<string | null>(null);

  const handleRowClick = (id: string) => {
    setExpandedRowId(expandedRowId === id ? null : id);
    GetAssetDetails(id);
  };

  const handleSearch = (
    e: React.ChangeEvent<HTMLInputElement> | Dayjs | null,
    name?: string
  ) => {
    let value: any;
    let fieldName: string | undefined;

    if (e && "target" in e) {
      value = e.target.value;
      fieldName = name || e.target.name;
      setSearch(value);
    } else {
      value = e;
      fieldName = name;
    }

    if (fieldName === "fromDate" && value) {
      setFromdate(value);
    } else if (fieldName === "toDate" && value) {
      setTodate(value);
    }
  };

  useEffect(() => {
    setInitFlag(true);
    const currentPath = window.location.pathname.split("/bsoft").at(-1) || "";
    setPathName(currentPath);
  }, []);

  // const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   setSearch(e.target.value);
  //   setFromdate(e.target.value);
  //   setTodate(e.target.value);
  // };

  const GetTransferList = async () => {
    try {
      const formattedFromDate = fromdate ? fromdate.format("YYYY-MM-DD") : "";
      const formattedToDate = todate ? todate.format("YYYY-MM-DD") : "";
      const { endpoint, method } = Config.AssetTransfer;
      const result = await Apirequest(
        endpoint
          .replace("{page}", page.toString())
          .replace("{size}", size.toString())
          .replace("{searchTerm}", search)
          .replace("{FromDate}", formattedFromDate)
          .replace("{ToDate}", formattedToDate),
        method,
        null,
        "fam"
      ).then((res) => res.data);
      setLoading(false);
      setTransferData(result.data);
      setCount(result.totalCount);
    } catch (err) {
      console.log(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    initFlag && search !== "" ? GetTransferList() : GetTransferList();
  }, [debouncedSearchTerm, page, size, fromdate, todate]);

  const skeletonRows = Array.from({ length: 10 }).map((_, rowIndex) => (
    <tr key={rowIndex}>
      {[0, 1, 2, 3, 4, 5, 6].map((colIndex) => (
        <td key={colIndex}>
          <Skeleton variant="text" width={"95%"} height={50} />
        </td>
      ))}
    </tr>
  ));

  const CollapsibleDetail = ({ row }: any) => {
    return (
      <Box sx={{ padding: "6px", backgroundColor: "#f8f9fa" }}>
        <Paper
          elevation={0}
          sx={{
            p: "12px",
            borderRadius: 2,
            backgroundImage:
              "linear-gradient(to right bottom, #ffffff, #f9fafd)",
          }}
        >
          <Box mb={1}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Typography
                  variant="h6"
                  sx={{ mb: 2, color: "#1976d2", fontWeight: "bold" }}
                >
                  Transfer Details
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ display: "flex", flexDirection: "column" }}>
                  <Chip
                    label={`Document Date - ${dayjs(row?.docDate).format(
                      "DD-MM-YYYY"
                    )}`}
                    size="small"
                    sx={{
                      mt: 0.5,
                      py: 2,
                      bgcolor: "rgba(25, 118, 210, 0.1)",
                      fontWeight: 500,
                    }}
                  />
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ display: "flex", flexDirection: "column" }}>
                  <Chip
                    label={`Transfer Type - ${row?.transferTypeName || "N/A"}`}
                    size="small"
                    sx={{
                      mt: 0.5,
                      py: 2,
                      bgcolor: "rgba(25, 118, 210, 0.1)",
                      fontWeight: 500,
                    }}
                  />
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ display: "flex", flexDirection: "column" }}>
                  <Chip
                    label={`Created By - ${row?.createdByName || "N/A"}`}
                    size="small"
                    sx={{
                      mt: 0.5,
                      py: 2,
                      bgcolor: "rgba(25, 118, 210, 0.1)",
                      fontWeight: 500,
                    }}
                  />
                </Box>
              </Grid>
            </Grid>
          </Box>
          <Divider sx={{ mb: 1 }} />
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  From Information
                </Typography>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2,
                    mt: 1,
                    borderRadius: 2,
                    borderColor: "rgba(25, 118, 210, 0.2)",
                  }}
                >
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" color="text.secondary">
                      Unit
                    </Typography>
                    <Typography variant="body1">
                      {row?.fromUnitName || "N/A"}
                    </Typography>
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" color="text.secondary">
                      Department
                    </Typography>
                    <Typography variant="body1">
                      {row?.fromDepartmentName || "N/A"}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Custodian
                    </Typography>
                    <Typography variant="body1">
                      {row?.fromCustodianName || "N/A"}
                    </Typography>
                  </Box>
                </Paper>
              </Box>
            </Grid>

            <Grid item xs={12} md={4}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  To Information
                </Typography>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2,
                    mt: 1,
                    borderRadius: 2,
                    borderColor: "rgba(25, 118, 210, 0.2)",
                  }}
                >
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" color="text.secondary">
                      Unit
                    </Typography>
                    <Typography variant="body1">
                      {row?.toUnitName || "N/A"}
                    </Typography>
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" color="text.secondary">
                      Department
                    </Typography>
                    <Typography variant="body1">
                      {row?.toDepartmentName || "N/A"}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Custodian
                    </Typography>
                    <Typography variant="body1">
                      {row?.toCustodianName || "N/A"}
                    </Typography>
                  </Box>
                </Paper>
              </Box>
            </Grid>

            <Grid item xs={12} md={4}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Asset Information
                </Typography>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2,
                    mt: 1,
                    borderRadius: 2,
                    borderColor: "rgba(25, 118, 210, 0.2)",
                  }}
                >
                  <Box
                    sx={{
                      maxHeight: 200, // Set the maximum height for the table body
                      overflowY: "auto", // Enable vertical scrolling
                    }}
                  >
                    <table
                      style={{
                        width: "100%",
                        borderCollapse: "collapse",
                      }}
                    >
                      <thead>
                        <tr>
                          <th
                            style={{
                              textAlign: "left",
                              padding: "8px",
                              fontWeight: 500,
                              borderBottom: "1px solid rgba(0, 0, 0, 0.1)",
                            }}
                          >
                            Asset Code
                          </th>
                          <th
                            style={{
                              textAlign: "left",
                              padding: "8px",
                              fontWeight: 500,
                              borderBottom: "1px solid rgba(0, 0, 0, 0.1)",
                            }}
                          >
                            Asset Name
                          </th>
                          <th
                            style={{
                              textAlign: "left",
                              padding: "8px",
                              fontWeight: 500,
                              borderBottom: "1px solid rgba(0, 0, 0, 0.1)",
                            }}
                          >
                            Asset Value
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {Array.isArray(assetData) && assetData.length > 0 ? (
                          assetData.map((asset: any, index: number) => (
                            <tr key={index}>
                              <td
                                style={{
                                  padding: "8px",
                                  borderBottom: "1px solid rgba(0, 0, 0, 0.1)",
                                  fontSize: "14px",
                                }}
                              >
                                {asset?.assetCode || "N/A"}
                              </td>
                              <td
                                style={{
                                  padding: "8px",
                                  borderBottom: "1px solid rgba(0, 0, 0, 0.1)",
                                  fontSize: "14px",
                                }}
                              >
                                {asset?.assetName || "N/A"}
                              </td>
                              <td
                                style={{
                                  padding: "8px",
                                  borderBottom: "1px solid rgba(0, 0, 0, 0.1)",
                                  fontSize: "14px",
                                }}
                              >
                                {formatIndianCurrency(asset?.assetValue) ||
                                  "N/A"}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td
                              colSpan={3}
                              style={{
                                textAlign: "center",
                                padding: "16px",
                                color: "rgba(0, 0, 0, 0.6)",
                              }}
                            >
                              No Asset Data Available
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </Box>
                </Paper>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </Box>
    );
  };

  const CustomRow = ({ row, index }: any) => {
    const isExpanded = expandedRowId === row.id;

    return (
      <React.Fragment>
        <tr
          onClick={() => handleRowClick(row.id)}
          style={{
            cursor: "pointer",
            backgroundColor: isExpanded
              ? "rgba(25, 118, 210, 0.05)"
              : index % 2 === 0
              ? "#ffffff"
              : "#f9fafc",
            transition: "background-color 0.3s ease",
          }}
          className={`custom-row ${isExpanded ? "expanded-row" : ""}`}
        >
          <td>{(page - 1) * size + index + 1}</td>
          <td>{dayjs(row?.docDate).format("DD-MM-YYYY")}</td>
          <td>{row?.transferTypeName || ""}</td>
          <td>{row?.fromUnitName || ""}</td>
          <td>{row?.toUnitName || ""}</td>
          <td>
            <Chip
              label={row?.status || "N/A"}
              color={
                row?.status === "Completed"
                  ? "success"
                  : row?.status === "Pending"
                  ? "warning"
                  : "default"
              }
              size="small"
              sx={{ fontWeight: 500 }}
            />
          </td>
          <td>
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                color: isExpanded ? "#1976d2" : "inherit",
                transition: "all 0.2s ease",
              }}
            >
              {isExpanded ? (
                <IoChevronUpOutline size={20} />
              ) : (
                <IoChevronDownOutline size={20} />
              )}
            </Box>
          </td>
        </tr>
        <tr className="detail-row">
          <td colSpan={7} style={{ padding: 0, border: "none" }}>
            <Collapse in={isExpanded} timeout="auto" unmountOnExit>
              <CollapsibleDetail row={row} />
            </Collapse>
          </td>
        </tr>
      </React.Fragment>
    );
  };

  const GetAssetDetails = async (id: string) => {
    try {
      const { endpoint, method } =
        Config.AssetTransferApproval.GetTransferApproval;
      const url = endpoint.replace("{id}", id?.toString());
      const result = await Apirequest(url, method, null, "fam").then(
        (res) => res.data
      );
      setAssetData(result.data);
    } catch (err) {
      console.error("Error fetching data:", err);
    }
  };

  return (
    <Box
      sx={{
        fontFamily: "var(--poppins-font)",
      }}
    >
      <Box
        display={"flex"}
        justifyContent={"space-between"}
        alignItems={"center"}
        flexWrap={"wrap"}
        gap={2}
      >
        <Box>
          <IconBreadcrumbs
            parent={"Transfer"}
            child={"Asset Transfer"}
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
            placeholder="Search"
            width={300}
            onChange={handleSearch}
          />
          <Box className="d-flex-center" gap={2}>
            <Link href={"/fam/transfer/asset-transfer/add-transfer"}>
              {permissions?.canAdd && (
                <MuiButton startIcon={<GoPlus />} variant="contained">
                  Add Transfer
                </MuiButton>
              )}
            </Link>
          </Box>
        </Box>
      </Box>

      <Box bgcolor={"#fff"} p={3} pt={0} mt={1.5}>
        <Box position={"relative"}>
          <DialogTitle className="highlighted-header" sx={{ pl: 0 }}>
            Transfer List
          </DialogTitle>
          <Box
            display={"flex"}
            justifyContent={"center"}
            alignItems={"center"}
            gap={3}
            position={"absolute"}
            top={"12px"}
            right={0}
          >
            <Box
              display={"flex"}
              justifyContent={"center"}
              alignItems={"center"}
              gap={2}
            >
              <MuiText
                variant="h6"
                display={"flex"}
                flex={"none"}
                className="admin-label-title"
                mb={0.5}
              >
                From Date
              </MuiText>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      size: "small",
                      placeholder: "",
                    },
                  }}
                  value={fromdate}
                  onChange={(newValue) => handleSearch(newValue, "fromDate")}
                  name="fromDate"
                  format="DD-MM-YYYY"
                />
              </LocalizationProvider>
            </Box>
            <Box
              display={"flex"}
              justifyContent={"center"}
              alignItems={"center"}
              gap={2}
            >
              <MuiText
                variant="h6"
                display={"flex"}
                flex={"none"}
                className="admin-label-title"
                mb={0.5}
              >
                To Date
              </MuiText>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      size: "small",
                      placeholder: "",
                    },
                  }}
                  value={todate}
                  onChange={(newValue) => handleSearch(newValue, "toDate")}
                  name="toDate"
                  format="DD-MM-YYYY"
                />
              </LocalizationProvider>
            </Box>
          </Box>
        </Box>
        <Box
          sx={{
            width: "100%",
            my: 2,
            maxHeight: "calc(100vh - 180px)",
            overflow: "auto",
            borderRadius: 1,
            boxShadow: "0 0 10px rgba(0,0,0,0.05)",
            "& .MuiDataGrid-root": {
              border: "none",
            },
            "& .MuiDataGrid-cell": {
              borderBottom: "1px solid #f0f0f0",
            },
            "& .MuiDataGrid-columnHeaders": {
              backgroundColor: "#f5f5f5",
              borderBottom: "none",
            },
            "& .MuiDataGrid-footerContainer": {
              borderTop: "none",
            },
          }}
          className="main-table"
        >
          {loading ? (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {[0, 1, 2, 3, 4, 5, 6].map((i) => (
                    <th key={i}>
                      <Skeleton variant="text" width={"95%"} height={60} />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>{skeletonRows}</tbody>
            </table>
          ) : (
            <>
              {/* Custom Table Implementation for Expandable Rows */}
              <Box sx={{ overflowX: "auto" }}>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    borderSpacing: 0,
                  }}
                >
                  <thead>
                    <tr
                      style={{
                        backgroundColor: "#3a8484",
                        height: "56px",
                      }}
                    >
                      <th
                        style={{
                          padding: "16px",
                          textAlign: "left",
                          fontWeight: 600,
                          color: "#fff",
                          fontSize: "0.875rem",
                        }}
                      >
                        S.No
                      </th>
                      <th
                        style={{
                          padding: "16px",
                          textAlign: "left",
                          fontWeight: 600,
                          color: "#fff",
                          fontSize: "0.875rem",
                        }}
                      >
                        Doc Date
                      </th>
                      <th
                        style={{
                          padding: "16px",
                          textAlign: "left",
                          fontWeight: 600,
                          color: "#fff",
                          fontSize: "0.875rem",
                        }}
                      >
                        Transfer Type
                      </th>
                      <th
                        style={{
                          padding: "16px",
                          textAlign: "left",
                          fontWeight: 600,
                          color: "#fff",
                          fontSize: "0.875rem",
                        }}
                      >
                        From Unit
                      </th>
                      <th
                        style={{
                          padding: "16px",
                          textAlign: "left",
                          fontWeight: 600,
                          color: "#fff",
                          fontSize: "0.875rem",
                        }}
                      >
                        To Unit
                      </th>
                      <th
                        style={{
                          padding: "16px",
                          textAlign: "left",
                          fontWeight: 600,
                          color: "#fff",
                          fontSize: "0.875rem",
                        }}
                      >
                        Status
                      </th>
                      <th
                        style={{
                          padding: "16px",
                          textAlign: "center",
                          fontWeight: 600,
                          color: "#fff",
                          fontSize: "0.875rem",
                          width: "60px",
                        }}
                      ></th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.isArray(transferData) && transferData.length > 0 ? (
                      transferData.map((row, index) => (
                        <CustomRow key={row.id} row={row} index={index} />
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={7}
                          style={{ textAlign: "center", padding: "40px 0" }}
                        >
                          <NoDataFound />
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </Box>

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "flex-end",
                  p: 2,
                  borderTop: "1px solid #f0f0f0",
                }}
              >
                <MuiTable
                  rows={[]}
                  columns={[]}
                  hideFooter={false}
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
                  onPaginationModelChange={(newPage) => {
                    setPage(newPage.page + 1);
                    setSize(newPage.pageSize);
                    setExpandedRowId(null);
                  }}
                  sx={{
                    "& .MuiDataGrid-main": { display: "none" },
                    "& .MuiDataGrid-footerContainer": {
                      borderTop: "none",
                      justifyContent: "flex-end",
                    },
                  }}
                />
              </Box>
            </>
          )}
        </Box>
      </Box>

      <style jsx global>{`
        .custom-row:hover {
          background-color: rgba(25, 118, 210, 0.04) !important;
        }

        .custom-row.expanded-row {
          font-weight: 500;
        }

        .custom-row td {
          padding: 16px;
          border-bottom: 1px solid #f0f0f0;
        }

        .detail-row td {
          padding: 0;
          border-bottom: 1px solid #f0f0f0;
        }
      `}</style>
    </Box>
  );
};

export default AssetTransferPage;
