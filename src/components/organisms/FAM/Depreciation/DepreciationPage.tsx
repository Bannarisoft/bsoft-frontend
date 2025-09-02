"use client";

import React, { useState, useEffect } from "react";
import FamConfig from "../../../../utils/fam.api.json";
import UserConfig from "../../../../utils/config.api.json";
import {
  Apirequest,
  DateFormatter,
  isSubmitting,
  startLoading,
  stopLoading,
  StyledAutocomplete,
  StyledButton,
} from "../../../../utils/lib";
import dayjs from "dayjs";
import {
  Box,
  Paper,
  ThemeProvider,
  createTheme,
  CssBaseline,
  DialogTitle,
  Grid2,
} from "@mui/material";
import "jspdf-autotable";
import { MuiInputField, MuiText } from "bsoft-base-elements";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { useRecoilValue } from "recoil";
import { UserData } from "../../../../utils/atoms";
import AgGridCommon from "../../Maintanence/Report/AgGridCommon";
import { abstract, columns } from "./headers";
import toast from "react-hot-toast";

interface FilterParams {
  unitId: string;
  companyId: string;
  finYearId: string;
  depreciationType: string;
  period: string;
  startDate: string;
  endDate: string;
  search: string;
  page: string;
  size: string;
}
interface FilterAbstractParams {
  unitId: string;
  companyId: string;
  finYearId: string;
  depreciationType: string;
  period: string;
  startDate: string;
  endDate: string;
  search: string;
  page: string;
  size: string;
}

interface Unit {
  id: number | null;
  unitName: string;
}

interface FinancialYear {
  id: number | null;
  startYear: string;
}

interface DepreciationType {
  id: number;
  typeName: string;
  code?: string;
  description?: string;
}

interface ReportType {
  id: number | null;
  code: string;
}
interface AbstractType {
  id: number;
  typeName: string;
}

const theme = createTheme({
  palette: {
    primary: {
      main: "#188a71",
    },
    secondary: {
      main: "#2ac0a1",
    },
    background: {
      default: "#f5f5f5",
    },
  },
});

const DEFAULT_PARAMS: FilterParams = {
  unitId: "40",
  companyId: "1",
  finYearId: "8",
  depreciationType: "7",
  period: "84",
  startDate: "",
  endDate: "",
  search: "",
  page: "1",
  size: "10",
};
const DEFAULT_ABSTRACT_PARAMS: FilterAbstractParams = {
  unitId: "40",
  companyId: "1",
  finYearId: "8",
  depreciationType: "7",
  period: "84",
  startDate: "",
  endDate: "",
  search: "",
  page: "1",
  size: "10",
};

const DepreciationPage = ({ pageName }: { pageName: string }) => {
  const [depreciationData, setDepreciationData] = useState<any[]>([]);
  const [abstractData, setAbstractData] = useState<any[]>([]);
  const [depFlag, setDepFlag] = useState(false);
  const userValue = useRecoilValue(UserData);
  const [flag, setFlag] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [filterParams, setFilterParams] =
    useState<FilterParams>(DEFAULT_PARAMS);
  const [filterAbstractParams, setFilterAbstractParams] =
    useState<FilterAbstractParams>(DEFAULT_ABSTRACT_PARAMS);

  const [units, setUnits] = useState<Unit[]>([{ id: null, unitName: "" }]);
  const [financialYears, setFinancialYears] = useState<FinancialYear[]>([
    { id: null, startYear: "" },
  ]);
  const [depreciationTypes, setDepreciationTypes] = useState<
    DepreciationType[]
  >([]);
  const [reportType, setReportType] = useState<AbstractType[]>([
    { id: 9, typeName: "Detailed" },
    { id: 10, typeName: "Abstract" },
  ]);

  const [reportTypes, setReportTypes] = useState<ReportType[]>([
    { id: null, code: "" },
  ]);

  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(units[0]);
  const [selectedFinYear, setSelectedFinYear] = useState<FinancialYear | null>(
    financialYears[0]
  );
  const [selectedDepreciationType, setSelectedDepreciationType] =
    useState<DepreciationType | null>(depreciationTypes[0]);

  const [selectedType, setSelectedType] = useState<AbstractType | null>(
    reportType[0]
  );

  const [selectedReportType, setSelectedReportType] =
    useState<ReportType | null>(null);
  const [startDate, setStartDate] = useState<any>(null);
  const [endDate, setEndDate] = useState<any>(null);

  // -------------------------------------------------------------------

  const GetDepreciationMethod = async () => {
    try {
      const { endpoint, method } = FamConfig.Uom.Misc;
      const result = await Apirequest(
        endpoint.replace("{type}", "DEPRECIATIONMETHOD"),
        method,
        null,
        "fam"
      ).then((res) => res.data);
      const getSLM = Array.isArray(result?.data)
        ? result.data.filter(
            (i: any) =>
              typeof i.code === "string" && i.code.toLowerCase().includes("slm")
          )
        : [];
      setSelectedDepreciationType(getSLM?.at(0));
      setDepreciationTypes(result.data);
    } catch (err) {
      console.log(err);
      setDepreciationTypes([]);
    }
  };

  // -------------------------------------------------------------------

  const fetchApstractData = async (
    params: FilterAbstractParams = filterAbstractParams
  ) => {
    try {
      setError(null);
      const { endpoint, method } = FamConfig.Depreciation.GetApstract;
      const formattedStartDate = params.startDate
        ? dayjs(params.startDate).format("YYYY-MM-DD")
        : "";
      const formattedEndDate = params.endDate
        ? dayjs(params.endDate).format("YYYY-MM-DD")
        : "";
      const url = endpoint
        .replace("{page}", "0")
        .replace("{size}", "0")
        .replace("{unitId}", params.unitId)
        .replace("{companyId}", params.companyId)
        .replace("{finYearId}", params.finYearId)
        .replace("{depreciationType}", params.depreciationType)
        .replace("{period}", params.period)
        .replace("{startDate}", formattedStartDate)
        .replace("{endDate}", formattedEndDate)
        .replace("{search}", params.search);

      const result = await Apirequest(url, method, null, "fam")
        .then((res) => res.data)
        .catch((err) => {
          console.error("API Error:", err);
          throw new Error("Failed to fetch abstract data from API");
        });

      const { data, totalCount } = result;
      if (!data || !Array.isArray(data)) {
        throw new Error("Invalid data format received from API");
      }
      setAbstractData(data);
    } catch (err: any) {
      console.error("Error fetching abstract data:", err);
      setError(err.message || "An error occurred while fetching abstract data");
    } finally {
    }
  };

  const fetchDepreciationData = async (params: FilterParams = filterParams) => {
    try {
      setError(null);
      const { endpoint, method } = FamConfig.Depreciation.DepreciationDetail;
      const formattedStartDate = params.startDate
        ? dayjs(params.startDate).format("YYYY-MM-DD")
        : "";
      const formattedEndDate = params.endDate
        ? dayjs(params.endDate).format("YYYY-MM-DD")
        : "";
      const url = endpoint
        .replace("{page}", "0")
        .replace("{size}", "0")
        .replace("{unitId}", params.unitId)
        .replace("{companyId}", params.companyId)
        .replace("{finYearId}", params.finYearId)
        .replace("{depreciationType}", params.depreciationType)
        .replace("{period}", params.period)
        .replace("{startDate}", formattedStartDate)
        .replace("{endDate}", formattedEndDate)
        .replace("{search}", params.search);

      const result = await Apirequest(url, method, null, "fam")
        .then((res) => res.data)
        .catch((err) => {
          console.error("API Error:", err);
          throw new Error("Failed to fetch data from API");
        });

      const { data, totalCount } = result;
      if (!data || !Array.isArray(data)) {
        throw new Error("Invalid data format received from API");
      }
      setDepreciationData(data);
    } catch (err: any) {
      console.error("Error fetching data:", err);
      setError(err.message || "An error occurred while fetching data");
      setDepreciationData([]);
    } finally {
    }
  };

  const fetchUnits = async () => {
    try {
      const { endpoint, method } = UserConfig.Unit.getUnitByUser;
      const response = await Apirequest(
        endpoint
          .replace("{companyId}", userValue.companyId)
          .replace("{userId}", userValue.userId),
        method
      ).then((res) => res.data);
      setUnits(response.data);
    } catch (err) {
      console.log(err);
    }
  };

  const fetchFinancialYears = async () => {
    try {
      const { endpoint, method } = UserConfig.FinanceYear.getByName;
      const response = await Apirequest(endpoint, method).then(
        (res) => res.data
      );
      setFinancialYears(response.data);
    } catch (err) {
      console.log(err);
    }
  };

  const fetchReportPeriod = async () => {
    try {
      const { endpoint, method } = FamConfig.Depreciation.DepreciationPeriod;
      const response = await Apirequest(endpoint, method, null, "fam").then(
        (res) => res.data
      );
      setReportTypes(response.data);
    } catch (err) {
      console.log(err);
    }
  };

  // const handleSaveGenerate = async () => {
  //   if (isSubmitting()) return;
  //   const body = {
  //     companyId: userValue.companyId,
  //     unitId: selectedUnit?.id,
  //     finYearId: selectedFinYear?.id,
  //     depreciationType: selectedDepreciationType?.id,
  //     depreciationPeriod: selectedReportType?.id,
  //   };
  //   try {
  //     startLoading();
  //     const { endpoint, method } = FamConfig.Depreciation.AddDepreciationDetail;
  //     const response = await Apirequest(endpoint, method, body, "fam").then(
  //       (res) => res.data
  //     );
  //     toast.error(response?.message || "Saved successfully!");
  //     fetchDepreciationData();

  //     setSelectedUnit(null);
  //     setSelectedFinYear(null);
  //     setSelectedReportType(null);
  //   } catch (err: any) {
  //     console.error("API Error:", err);
  //     const message = err?.response?.data?.message || "Something went wrong!";
  //     toast.error(message);
  //   } finally {
  //     stopLoading();
  //   }
  // };
  const handleSaveGenerate = async () => {
    if (isSubmitting()) return;

    const validationErrors: string[] = [];
    if (!selectedUnit) validationErrors.push("unit");
    if (!selectedFinYear) validationErrors.push("finYear");
    if (!selectedDepreciationType) validationErrors.push("depreciationType");
    if (!selectedReportType) validationErrors.push("reportType");

    if (validationErrors.length > 0) {
      console.error("Please select all required fields");
      return;
    }

    const body = {
      companyId: userValue.companyId,
      unitId: selectedUnit?.id,
      finYearId: selectedFinYear?.id,
      depreciationType: selectedDepreciationType?.id,
      depreciationPeriod: selectedReportType?.id,
    };

    try {
      startLoading();

      const { endpoint, method } = FamConfig.Depreciation.AddDepreciationDetail;
      const response = await Apirequest(endpoint, method, body, "fam").then(
        (res) => res.data
      );

      if (response.statusCode === 200 || response.statusCode === 201) {
        toast.success(response?.message);
        fetchDepreciationData();
        setSelectedUnit(null);
        setSelectedFinYear(null);
        setSelectedReportType(null);
      } else {
        toast.error(response?.message);
        response.error(response.errors);
      }
    } catch (err: any) {
      console.error("API Error:", err);
    } finally {
      stopLoading();
    }
  };

  useEffect(() => {
    fetchFinancialYears();
    fetchReportPeriod();
    // fetchApstractData();
    GetDepreciationMethod();
    // fetchDepreciationTypes();
  }, []);

  useEffect(() => {
    console.log(selectedUnit);
  }, [selectedUnit]);

  useEffect(() => {
    if (userValue.companyId) {
      fetchUnits();
    }
  }, [userValue]);

  const handleSearch = () => {
    let hasError = false;

    if (!selectedFinYear?.id) {
      setError("Please select a Financial Year");
      hasError = true;
    } else if (!selectedDepreciationType?.id) {
      setError("Please select a Depreciation Type");
      hasError = true;
    } else if (!selectedType?.id) {
      setError("Please select a Report Type");
      hasError = true;
    }
    if (pageName !== "statement" && !startDate) {
      setError("Please select a Start Date");
      hasError = true;
    } else if (pageName !== "statement" && !endDate) {
      setError("Please select an End Date");
      hasError = true;
    }

    if (hasError) return;
    setFlag(true);
    const newParams = {
      ...filterParams,
      unitId: selectedUnit?.id?.toString() || "0",
      finYearId: selectedFinYear?.id?.toString() || "8",
      depreciationType: selectedDepreciationType?.id?.toString() || "7",
      startDate: startDate ? dayjs(startDate).format("YYYY-MM-DD") : "",
      endDate: endDate ? dayjs(endDate).format("YYYY-MM-DD") : "",
      page: "1",
    };
    const newAbstractParams = {
      ...filterAbstractParams,
      unitId: selectedUnit?.id?.toString() || "0",
      finYearId: selectedFinYear?.id?.toString() || "8",
      depreciationType: selectedDepreciationType?.id?.toString() || "7",
      startDate: startDate ? dayjs(startDate).format("YYYY-MM-DD") : "",
      endDate: endDate ? dayjs(endDate).format("YYYY-MM-DD") : "",
      page: "1",
    };
    setError(null);
    setFilterParams(newParams);
    setFilterAbstractParams(newAbstractParams);
    if (selectedType?.typeName === "Detailed") {
      fetchDepreciationData(newParams);
      setDepFlag(true);
    } else if (selectedType?.typeName === "Abstract") {
      fetchApstractData(newAbstractParams);
      setDepFlag(false);
    }
  };

  const [columnDefs, setColumnDefs] = useState<any[]>([]);
  const [abstractColumnDefs, setAbstractColumnDefs] = useState<any[]>([]);

  useEffect(() => {
    setAbstractColumnDefs(abstract);
    setColumnDefs(columns);
  }, [columnDefs, abstractColumnDefs]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      <Paper sx={{ p: 3, mb: 3 }} elevation={3}>
        <DialogTitle
          className="highlighted-header"
          sx={{
            pl: 0,
            "& .MuiTypography-root": {
              fontSize: "24px",
              fontWeight: 600,
              background: "linear-gradient(45deg, #188a71, #2ac0a1)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              color: "transparent",
            },
            pt: 0,
          }}
        >
          {pageName === "statement"
            ? "Depreciation Statement (SLM)"
            : "Depreciation Report (SLM)"}
        </DialogTitle>
        <Grid2 container spacing={2} mt={3} justifyContent={"space-between"}>
          <Grid2 size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
            <MuiText
              className="admin-label-title"
              sx={{
                fontSize: "14px",
                fontWeight: 500,
                color: "#666",
                mb: 1,
              }}
            >
              Unit Name
            </MuiText>
            <StyledAutocomplete
              options={units}
              value={selectedUnit}
              onChange={(_, newValue: any) => {
                setSelectedUnit(newValue);
                if (newValue) {
                  setError(null);
                }
              }}
              fullWidth
              getOptionLabel={(option: any) => option.unitName || ""}
              isOptionEqualToValue={(option: any, value: any) =>
                option.id === value.id
              }
              renderInput={(params) => (
                <MuiInputField
                  {...params}
                  size="small"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      backgroundColor: "#f8f9fa",
                    },
                  }}
                />
              )}
            />
          </Grid2>
          <Grid2 size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
            <MuiText
              className="admin-label-title"
              sx={{
                fontSize: "14px",
                fontWeight: 500,
                color: "#666",
                mb: 1,
              }}
            >
              Financial Year
            </MuiText>

            <StyledAutocomplete
              options={financialYears}
              value={selectedFinYear}
              onChange={(_, newValue: any) => {
                setSelectedFinYear(newValue);
                if (newValue) {
                  setError(null);

                  // Merged logic from handleChangeFinYear
                  if (newValue.startYear) {
                    const start = dayjs(newValue.startYear).add(3, "months");
                    const endDate = dayjs(newValue.startYear)
                      .add(1, "year")
                      .add(2, "months")
                      .add(30, "days");
                    setStartDate(start);
                    setEndDate(endDate);
                  }
                }
              }}
              fullWidth
              getOptionLabel={(option: any) =>
                option.startYear?.toString() || ""
              }
              isOptionEqualToValue={(option: any, value: any) =>
                option.id === value.id
              }
              renderInput={(params) => (
                <MuiInputField
                  {...params}
                  size="small"
                  error={!!error && !selectedFinYear?.id}
                  helperText={
                    !!error && !selectedFinYear?.id
                      ? "Please select a Financial Year"
                      : ""
                  }
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      backgroundColor: "#f8f9fa",
                    },
                  }}
                />
              )}
            />
          </Grid2>

          {pageName !== "statement" && (
            <>
              <Grid2 size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
                <MuiText
                  className="admin-label-title"
                  sx={{
                    fontSize: "14px",
                    fontWeight: 500,
                    color: "#666",
                    mb: 1,
                  }}
                >
                  Start Date
                </MuiText>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    value={startDate}
                    onChange={(newValue) => setStartDate(newValue)}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        size: "small",
                        placeholder: "",
                        error: !startDate && !!error,
                        helperText:
                          !startDate && !!error
                            ? "Please select a Start Date"
                            : "",
                        inputProps: {
                          placeholder: "",
                          value: startDate ? DateFormatter(startDate) : "",
                          readOnly: true,
                        },
                      },
                    }}
                    maxDate={endDate || dayjs(new Date())}
                  />
                </LocalizationProvider>
              </Grid2>
              <Grid2 size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
                <MuiText
                  className="admin-label-title"
                  sx={{
                    fontSize: "14px",
                    fontWeight: 500,
                    color: "#666",
                    mb: 1,
                  }}
                >
                  End Date
                </MuiText>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    value={endDate}
                    onChange={(newValue) => setEndDate(newValue)}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        size: "small",
                        placeholder: "",
                        error: !endDate && !!error,
                        helperText:
                          !endDate && !!error
                            ? "Please select an End Date"
                            : "",
                        inputProps: {
                          placeholder: "",
                          value: endDate ? DateFormatter(endDate) : "",
                          readOnly: true,
                        },
                      },
                    }}
                    minDate={startDate}
                    maxDate={dayjs(new Date())}
                  />
                </LocalizationProvider>
              </Grid2>
            </>
          )}
          {pageName !== "" &&
            !selectedDepreciationType?.code?.toLowerCase()?.includes("wdv") && (
              <Grid2 size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
                <MuiText
                  className="admin-label-title"
                  sx={{
                    fontSize: "14px",
                    fontWeight: 500,
                    color: "#666",
                    mb: 1,
                  }}
                >
                  Depreciation Period
                </MuiText>
                <StyledAutocomplete
                  options={reportTypes}
                  value={selectedReportType}
                  onChange={(_, newValue: any) =>
                    setSelectedReportType(newValue)
                  }
                  fullWidth
                  getOptionLabel={(option: any) => option.code || ""}
                  isOptionEqualToValue={(option: any, value: any) =>
                    option.id === value.id
                  }
                  renderInput={(params) => (
                    <MuiInputField
                      {...params}
                      size="small"
                      error={!!error && !selectedReportType?.id}
                      helperText={
                        !!error && !selectedReportType?.id
                          ? "Please select a Report "
                          : ""
                      }
                    />
                  )}
                />
              </Grid2>
            )}

          <Grid2 size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
            <MuiText
              className="admin-label-title"
              sx={{
                fontSize: "14px",
                fontWeight: 500,
                color: "#666",
                mb: 1,
              }}
            >
              Report Type
            </MuiText>
            <StyledAutocomplete
              options={reportType}
              value={selectedType}
              onChange={(_, newValue: any) => setSelectedType(newValue)}
              fullWidth
              getOptionLabel={(option: any) => option.typeName || ""}
              isOptionEqualToValue={(option: any, value: any) =>
                option.id === value.id
              }
              renderInput={(params) => (
                <MuiInputField
                  {...params}
                  size="small"
                  error={!!error && !selectedType?.id}
                  helperText={
                    !!error && !selectedType?.id
                      ? "Please select a Depreciation Type"
                      : ""
                  }
                />
              )}
            />
          </Grid2>
        </Grid2>

        <Box
          gap={2}
          my={2}
          display={
            Array.isArray(depreciationData) && depreciationData.length > 0
              ? "flex"
              : "block"
          }
          justifyContent={"space-between"}
          alignItems={"center"}
          flexWrap="wrap"
        >
          {pageName !== "statement" && (
            <StyledButton
              variant="contained"
              sx={{
                background:
                  "linear-gradient(45deg, #188a71 30%, #2ac0a1 90%) !important",
                color: "#fff",
              }}
              onClick={handleSearch}
            >
              View
            </StyledButton>
          )}
          {pageName === "statement" && (
            <Box
              display={"flex"}
              alignItems="center"
              justifyContent="flex-end"
              gap={2}
              my={2}
            >
              <StyledButton
                variant="contained"
                sx={{
                  background: "#fff !important",
                  color: "#2ac0a1",
                  border: "1px solid #2ac0a1",
                }}
                onClick={handleSearch}
              >
                View
              </StyledButton>
              <StyledButton
                variant="contained"
                disabled={isSubmitting()}
                sx={{
                  background:
                    "linear-gradient(45deg, #188a71 30%, #2ac0a1 90%) !important",
                  color: "#fff",
                }}
                onClick={handleSaveGenerate}
              >
                Save & Generate
              </StyledButton>
            </Box>
          )}
        </Box>
        {flag && (
          <>
            <div
              className="ag-theme-quartz"
              style={{
                height: 600,
              }}
            >
              <AgGridCommon
                rowData={depFlag ? depreciationData : abstractData}
                columnData={depFlag ? columnDefs : abstractColumnDefs}
              />
            </div>
          </>
        )}
      </Paper>
    </ThemeProvider>
  );
};

export default DepreciationPage;
