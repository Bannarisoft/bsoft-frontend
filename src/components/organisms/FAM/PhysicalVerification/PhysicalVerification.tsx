"use client";

import {
  Box,
  Grid2,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  Button,
  Chip,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import IconBreadcrumbs from "../../../molecules/AdminLayout/BreadCrumbs";
import { MuiInputField, MuiText } from "bsoft-base-elements";
import { HiOutlineUpload } from "react-icons/hi";
import { FaTrashCan } from "react-icons/fa6";
import { useDropzone } from "react-dropzone";
import { Apirequest, StyledAutocomplete } from "../../../../utils/lib";
import Config from "../../../../utils/fam.api.json";
import Image from "next/image";
import CreateGif from "../../../../../public/assets/images/create-animation.gif";
import * as XLSX from "xlsx";
import { LuCircleFadingPlus } from "react-icons/lu";
import { useDataFetchHook } from "../../../../hooks/useDataFetchHook";
import FamConfig from "../../../../utils/fam.api.json";
import ErrorModal from "../../../molecules/Master/Role/ErrorModal";
import Swal from "sweetalert2";
import toast from "react-hot-toast";

interface ExcelData {
  [key: string]: any;
}

interface AuditProp {
  id: number | null;
  code: string;
  description: string;
}

function PhysicalVerification() {
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [tableData, setTableData] = useState<ExcelData[]>([]);
  const [tableHeaders, setTableHeaders] = useState<string[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(50);
  const [emptyFieldsMap, setEmptyFieldsMap] = useState<{
    [rowIdx: number]: string[];
  }>({});
  const [selectedAudit, setSelectedAudit] = useState<AuditProp | null>(null);
  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [errorMessages, setErrorMessages] = useState<string[]>([]);
  const handleDelete = () => {
    setExcelFile(null);
    setErrors([]);
    setTableData([]);
    setTableHeaders([]);
    setPage(0);
  };

  const { data: auditData } = useDataFetchHook(
    FamConfig.Uom.Misc.endpoint.replace("{type}", "AUDITPERIOD"),
    FamConfig.Uom.Misc.method,
    "fam"
  );

  const excelDateToJSDate = (serial: number) => {
    const utc_days = Math.floor(serial - 25569);
    const utc_value = utc_days * 86400;
    const date_info = new Date(utc_value * 1000);
    return date_info;
  };

  const isProbablyExcelDate = (value: any) =>
    typeof value === "number" && value > 25569 && value < 60000;

  const readExcelFile = (file: File) => {
    return new Promise<ExcelData[]>((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: "binary" });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, {
            header: 1,
            defval: "",
          });

          if (jsonData.length === 0) {
            reject(new Error("Excel file is empty"));
            return;
          }

          const headers = jsonData[0] as string[];
          const dataRows = jsonData.slice(1) as any[][];

          const formattedData = dataRows.map((row) => {
            const rowObj: ExcelData = {};
            headers.forEach((header, index) => {
              let cellValue = row[index] || "";
              if (isProbablyExcelDate(cellValue)) {
                const jsDate = excelDateToJSDate(cellValue);
                cellValue = jsDate.toISOString().slice(0, 10);
              }
              rowObj[header] = cellValue;
            });
            return rowObj;
          });

          resolve(formattedData);
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = () => reject(new Error("Error reading file"));
      reader.readAsBinaryString(file);
    });
  };

  const generateExcelFileFromTableData = (
    data: ExcelData[],
    originalFileName?: string
  ): File => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

    const wbout = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([wbout], { type: "application/octet-stream" });

    let fileName = "updated_data.xlsx";
    if (originalFileName) {
      const base = originalFileName.replace(/\.[^/.]+$/, "");
      fileName = `${base}.xlsx`;
    }

    return new File([blob], fileName, {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
  };

  const handleSubmitData = async () => {
    if (tableData.length === 0) {
      toast.error("No data to submit");
      return;
    }

    if (!selectedAudit) {
      setErrors((prev) => [...prev, "audit"]);
    } else {
      setSubmitting(true);
      try {
        const formData = new FormData();
        if (excelFile) {
          const updatedFile = generateExcelFileFromTableData(
            tableData,
            excelFile.name
          );
          formData.append("file", updatedFile);
          formData.append(
            "auditCycle",
            selectedAudit && selectedAudit.id !== null
              ? String(selectedAudit.id)
              : ""
          );
        }

        const { endpoint, method } = Config.PhysicalVerification.ExelUpload;
        const response = await Apirequest(
          endpoint,
          method,
          formData,
          "fam"
        ).then((res) => res.data);

        if (response.statusCode === 200 || response.statusCode === 201) {
          Swal.fire({
            title: response.message,
            icon: "success",
            confirmButtonText: "okay",
            customClass: {
              title: "custom-title",
            },
          }).then((res) => {
            if (res.isConfirmed) {
              setExcelFile(null);
              setTableData([]);
              setSelectedAudit(null);
            }
          });
        } else {
          setErrorModalOpen(true);
          setErrorMessages([response.message]);
          toast.error(response.message || "Failed to submit data", {
            style: { backgroundColor: "red", color: "white" },
          });
        }
      } catch (err) {
        console.error("Submit failed:", err);
        toast.error("Error submitting data", {
          style: { backgroundColor: "red", color: "white" },
        });
      } finally {
        setSubmitting(false);
      }
    }
  };

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
        ".xlsx",
      ],
      "application/vnd.ms-excel": [".xls"],
    },
    multiple: false,
    onDrop: async (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (!file) return;

      const isExcel =
        file.type ===
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
        file.type === "application/vnd.ms-excel";

      if (!isExcel) {
        setErrors(["excelFile"]);
        toast.error("Please upload a valid Excel file", {
          style: { backgroundColor: "red", color: "white" },
        });
        return;
      }

      setErrors([]);
      setExcelFile(file);
      setLoading(true);

      try {
        const data = await readExcelFile(file);

        if (data.length > 0) {
          const headers = Object.keys(data[0]);
          setTableHeaders(headers);
          setTableData(data);
          setPage(0);

          toast.success(
            `Excel file loaded successfully! Found ${data.length} rows.`,
            {
              style: { backgroundColor: "green", color: "white" },
            }
          );
        } else {
          toast.error("Excel file contains no data", {
            style: { backgroundColor: "red", color: "white" },
          });
          setExcelFile(null);
        }
      } catch (error) {
        console.error("Error reading Excel file:", error);
        toast.error("Error reading Excel file. Please check the file format.", {
          style: { backgroundColor: "red", color: "white" },
        });
        setExcelFile(null);
      } finally {
        setLoading(false);
      }
    },
  });

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleCellEdit = (
    rowIdx: number,
    header: string,
    value: string | null
  ) => {
    setTableData((prev) => {
      const updated = [...prev];
      updated[rowIdx] = { ...updated[rowIdx], [header]: value ?? "" };
      return updated;
    });
  };

  const AddRow = () => {
    if (tableHeaders.length === 0) return;
    const newRow: ExcelData = {};
    tableHeaders.forEach((header) => {
      newRow[header] = "";
    });
    setTableData((prev) => [...prev, newRow]);
  };

  const handleDeleteRow = (rowIdx: number) => {
    setTableData((prev) => prev.filter((_, idx) => idx !== rowIdx));
  };

  useEffect(() => {
    const map: { [rowIdx: number]: string[] } = {};
    tableData.forEach((row, idx) => {
      map[idx] = Object.entries(row)
        .filter(([key, value]) => !value || value === "")
        .map(([key]) => key);
    });
    setEmptyFieldsMap(map);
  }, [tableData]);

  return (
    <Box>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        px={3}
        py={2}
        bgcolor="#fff"
        borderBottom="1px solid #eee"
        position={"relative"}
      >
        <Box>
          <IconBreadcrumbs
            parent={"Fixed Asset Management"}
            child={"Asset Management"}
            subParent="Physical Verification"
            path=""
          />
        </Box>
        <Box>
          <StyledAutocomplete
            options={auditData || []}
            value={selectedAudit}
            onChange={(_, newValue: any) => {
              setSelectedAudit(newValue);
              setErrors([]);
            }}
            fullWidth
            getOptionLabel={(option: any) =>
              `${option.description} - ${option.code}` || ""
            }
            isOptionEqualToValue={(option: any, value: any) =>
              option.id === value.id
            }
            renderInput={(params) => (
              <MuiInputField
                {...params}
                size="small"
                label="Audit Cycle"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: "#f8f9fa",
                  },
                  width: 250,
                }}
                error={errors.includes("audit")}
                helperText={
                  errors.includes("audit") && "please select audit cycle"
                }
              />
            )}
          />
        </Box>
      </Box>

      <Box
        minHeight="80vh"
        display={"flex"}
        justifyContent={"center"}
        px={2}
        sx={{
          background: "rgba(58, 180, 197, 0.2)",
          placeItems: "center",
        }}
      >
        <Box>
          <Grid2
            size={12}
            mt={3}
            display="flex"
            justifyContent="center"
            alignItems="center"
          >
            <Grid2
              size={6}
              container
              justifyContent="center"
              alignItems="center"
              borderRadius="20px"
              display={excelFile ? "none" : "flex"}
              py={4}
              px={3}
              sx={{
                cursor: loading ? "not-allowed" : "pointer",
                backdropFilter: "blur(10px)",
                background: "rgba(255, 255, 255, 0.2)",
                boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
                border: "1px solid rgba(255, 255, 255, 0.18)",
                color: "white",
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: loading ? "none" : "scale(1.02)",
                },
              }}
              {...getRootProps()}
            >
              <input
                {...getInputProps()}
                disabled={loading}
                accept=".xls, .xlsx, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              />

              <Box
                bgcolor={excelFile ? "transparent" : "#ffffff"}
                borderRadius="50%"
                width={100}
                height={100}
                className="d-grid-center"
                border="6px solid #257d97"
                display="flex"
                justifyContent="center"
                alignItems="center"
                sx={{ boxShadow: "0 0 10px rgba(0,0,0,0.2)" }}
              >
                <HiOutlineUpload color="#257d97" fontSize={32} />
              </Box>

              <MuiText
                variant="h6"
                className="breadcrumb-parent-title"
                fontSize={16}
                color="black"
                mt={2}
                pl={3}
              >
                {excelFile
                  ? `Uploaded: ${excelFile.name}`
                  : "Upload Excel file"}
              </MuiText>
            </Grid2>
          </Grid2>

          <Grid2
            size={12}
            display="flex"
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
            mt={2}
          >
            {excelFile && (
              <Box display="flex" alignItems="center" gap={2}>
                <FaTrashCan
                  style={{ zIndex: 10 }}
                  cursor="pointer"
                  color="red"
                  size={20}
                  onClick={handleDelete}
                />
                <MuiText variant="caption" color="#666">
                  Click to remove file
                </MuiText>
              </Box>
            )}
            <MuiText
              variant="caption"
              sx={{
                mt: 1,
                fontSize: 13,
                color: "#444",
              }}
            >
              📁 Allowed formats: XLS, XLSX (max 2MB)
            </MuiText>

            {errors.includes("excelFile") && (
              <MuiText
                variant="caption"
                color="red"
                sx={{ mt: 1, fontSize: 13 }}
              >
                ❗ Please upload a valid Excel file
              </MuiText>
            )}
          </Grid2>

          {tableData.length > 0 && (
            <Grid2 size={12} mt={4} width="100%">
              <Paper
                sx={{
                  width: "100%",
                  overflow: "hidden",
                  background: "rgba(255, 255, 255, 0.9)",
                  backdropFilter: "blur(10px)",
                  borderRadius: "15px",
                  boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
                  mb: 2,
                }}
              >
                <Box
                  sx={{
                    p: 2,
                    borderBottom: "1px solid rgba(224, 224, 224, 1)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{ color: "#257d97", fontWeight: "bold" }}
                  >
                    Excel Data Preview
                  </Typography>
                  <Button
                    variant="contained"
                    onClick={handleSubmitData}
                    disabled={submitting}
                    sx={{
                      backgroundColor: "#257d97",
                      "&:hover": {
                        backgroundColor: "#1e6b7a",
                      },
                      "&:disabled": {
                        backgroundColor: "#ccc",
                      },
                      borderRadius: "8px",
                      px: 3,
                      py: 1,
                    }}
                  >
                    {submitting ? "Submitting..." : "Submit Data"}
                  </Button>
                </Box>

                <TableContainer sx={{ maxHeight: 500 }}>
                  <Table stickyHeader aria-label="excel data table">
                    <TableHead>
                      <TableRow>
                        {tableHeaders.map((header, index) => (
                          <TableCell
                            key={index}
                            sx={{
                              backgroundColor: "#257d97",
                              color: "white",
                              fontWeight: "bold",
                              fontSize: "14px",
                              minWidth: "120px",
                            }}
                          >
                            {header}
                          </TableCell>
                        ))}
                        <TableCell
                          sx={{
                            backgroundColor: "#257d97",
                            color: "white",
                            fontWeight: "bold",
                            fontSize: "14px",
                            minWidth: "120px",
                          }}
                        >
                          Validation{" "}
                          <i>
                            <b>(missing fields)</b>
                          </i>
                        </TableCell>
                        <TableCell
                          sx={{
                            backgroundColor: "#257d97",
                            color: "white",
                            fontWeight: "bold",
                            fontSize: "14px",
                            minWidth: "120px",
                          }}
                        >
                          Action
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {tableData
                        .slice(
                          page * rowsPerPage,
                          page * rowsPerPage + rowsPerPage
                        )
                        .map((row, rowIndex) => {
                          const actualIndex = page * rowsPerPage + rowIndex;
                          return (
                            <TableRow
                              hover
                              key={actualIndex}
                              sx={{
                                "&:last-child td, &:last-child th": {
                                  border: 0,
                                },
                                "&:hover": {
                                  backgroundColor: "rgba(37, 125, 151, 0.1)",
                                },
                              }}
                            >
                              {tableHeaders.map((header, cellIndex) => (
                                <TableCell
                                  key={cellIndex}
                                  sx={{
                                    fontSize: "13px",
                                    backgroundColor: !row[header]
                                      ? "#fff3e0"
                                      : undefined,
                                  }}
                                  contentEditable
                                  suppressContentEditableWarning
                                  onBlur={(e) =>
                                    handleCellEdit(
                                      actualIndex,
                                      header,
                                      e.currentTarget.textContent
                                    )
                                  }
                                >
                                  {row[header]}
                                </TableCell>
                              ))}

                              <TableCell>
                                {emptyFieldsMap[actualIndex] &&
                                emptyFieldsMap[actualIndex].length > 0 ? (
                                  <Box>
                                    {emptyFieldsMap[actualIndex].map(
                                      (field) => (
                                        <Chip
                                          sx={{
                                            px: 1.5,
                                            py: 0.5,
                                            bgcolor: "#ffebee",
                                            color: "#d32f2f",
                                            borderRadius: 2,
                                            fontSize: 12,
                                            fontWeight: 600,
                                            boxShadow:
                                              "0 1px 4px 0 rgba(211,47,47,0.08)",
                                            border: "1px solid #ffcdd2",
                                            mr: 0.5,
                                            mb: 0.5,
                                            display: "inline-block",
                                          }}
                                          label={field}
                                        />
                                      )
                                    )}
                                  </Box>
                                ) : (
                                  <Box
                                    sx={{
                                      px: 1.5,
                                      py: 0.5,
                                      bgcolor: "#e8f5e9",
                                      color: "#388e3c",
                                      borderRadius: 2,
                                      fontSize: 12,
                                      fontWeight: 600,
                                      boxShadow:
                                        "0 1px 4px 0 rgba(56,142,60,0.08)",
                                      border: "1px solid #c8e6c9",
                                      display: "inline-block",
                                    }}
                                  >
                                    All fields filled
                                  </Box>
                                )}
                              </TableCell>
                              <TableCell>
                                <Button
                                  color="error"
                                  size="small"
                                  onClick={() => handleDeleteRow(actualIndex)}
                                >
                                  Delete
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                    </TableBody>
                  </Table>
                </TableContainer>
                <Box position={"relative"}>
                  <Button
                    sx={{ position: "absolute", top: 10, left: 80, zIndex: 10 }}
                    variant="contained"
                    startIcon={<LuCircleFadingPlus />}
                    onClick={AddRow}
                  >
                    Add Row
                  </Button>
                  <TablePagination
                    rowsPerPageOptions={[50, 100, 200]}
                    component="div"
                    count={tableData.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    sx={{
                      backgroundColor: "rgba(255, 255, 255, 0.8)",
                      borderTop: "1px solid rgba(224, 224, 224, 1)",
                    }}
                  />
                </Box>
              </Paper>
            </Grid2>
          )}
          {tableData.length === 0 && !loading && (
            <Grid2 size={12} mt={4} textAlign="center">
              <MuiText
                variant="body1"
                color="#666"
                sx={{
                  fontStyle: "italic",
                  background: "rgba(255, 255, 255, 0.7)",
                  padding: "20px",
                  borderRadius: "10px",
                }}
              >
                No data available. Upload an Excel file to view and submit data.
              </MuiText>
            </Grid2>
          )}
        </Box>
      </Box>

      {(loading || submitting) && (
        <Box
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(255, 255, 255, 0.8)",
            backdropFilter: "blur(3px)",
            zIndex: 1200,
            transition: "all 0.3s ease-in-out",
          }}
        >
          <Box
            sx={{
              position: "relative",
              width: 400,
              height: 400,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              animation: "pulse 2s infinite ease-in-out",
              "@keyframes pulse": {
                "0%": { transform: "scale(0.95)" },
                "50%": { transform: "scale(1)" },
                "100%": { transform: "scale(0.95)" },
              },
            }}
          >
            <Image src={CreateGif} alt="Loading..." />
            <Typography
              variant="h6"
              color="#107869"
              sx={{
                mt: 3,
                fontWeight: 600,
                animation: "fadeInOut 1.5s infinite ease-in-out",
                "@keyframes fadeInOut": {
                  "0%": { opacity: 0.6 },
                  "50%": { opacity: 1 },
                  "100%": { opacity: 0.6 },
                },
              }}
            >
              {submitting ? "Submitting data..." : "Reading Excel file..."}
            </Typography>
          </Box>
        </Box>
      )}
      <ErrorModal
        open={errorModalOpen}
        onClose={() => setErrorModalOpen(false)}
        errors={errorMessages}
      />
    </Box>
  );
}

export default PhysicalVerification;
