"use client";

import {
  Box,
  CircularProgress,
  DialogTitle,
  Grid2,
  Paper,
} from "@mui/material";
import { MuiInputField, MuiText } from "bsoft-base-elements";
import React, { useState } from "react";
import {
  Apirequest,
  StyledAutocomplete,
  StyledButton,
} from "../../../../utils/lib";
import { useDataFetchHook } from "../../../../hooks/useDataFetchHook";
import UserConfig from "../../../../utils/config.api.json";
import FamConfig from "../../../../utils/fam.api.json";
import dayjs from "dayjs";
import AgGridCommon from "../../Maintanence/Report/AgGridCommon";
import { ColDef } from "ag-grid-community";
import customParseFormat from "dayjs/plugin/customParseFormat";
import toast from "react-hot-toast";
dayjs.extend(customParseFormat);
interface FinancialYear {
  id: number | null;
  startYear: string;
}

function WDVMethod() {
  const { data: financialYears } = useDataFetchHook(
    UserConfig.FinanceYear.getByName.endpoint,
    UserConfig.FinanceYear.getByName.method
  );

  const [selectedFinYear, setSelectedFinYear] = useState<FinancialYear | null>(
    null
  );
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const { endpoint, method } =
        FamConfig.Depreciation.WdvMethod.ViewStatement;
      const response = await Apirequest(
        endpoint.replace(
          "{finYear}",
          selectedFinYear &&
            selectedFinYear.id !== null &&
            selectedFinYear.id !== undefined
            ? selectedFinYear.id.toString()
            : ""
        ),
        method,
        null,
        "fam"
      ).then((res) => res.data);
      const { isSuccess, message, data } = response;
      if (isSuccess) {
        setData(data);
        setLoading(false);
      } else {
        toast.error(message);
        setLoading(false);
      }
    } catch (err) {
      console.log(err);
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const { endpoint, method } =
        FamConfig.Depreciation.WdvMethod.GenerateStatement;
      const response = await Apirequest(
        endpoint,
        method,
        {
          finYearId: selectedFinYear?.id,
        },
        "fam"
      ).then((res) => res.data);
      const { statusCode, message } = response;
      if (statusCode === 200 || statusCode === 201) {
        handleSubmit();
      } else {
        toast.error(message);
        setLoading(false);
      }
    } catch (err) {
      console.log(err);
      setLoading(false);
    }
  };

  const columnData: ColDef[] = [
    {
      field: "groupName",
      headerName: "Group Name",
      valueFormatter: ({ value }) => value || "-",
    },
    {
      field: "subGroupName",
      headerName: "Sub Group Name",
      valueFormatter: ({ value }) => value || "-",
    },

    {
      field: "finYear",
      headerName: "Financial Year",
      valueFormatter: ({ value }) => value ?? "-",
    },
    {
      field: "percentage",
      headerName: "Depreciation %",
      valueFormatter: ({ value }) => value?.toFixed(2) ?? "-",
    },
    {
      field: "openingValue",
      headerName: "Opening Value",
      valueFormatter: ({ value }) => value?.toFixed(2) ?? "-",
    },
    {
      field: "additionLastYear",
      headerName: "Addition Last Year",
      valueFormatter: ({ value }) => value?.toFixed(2) ?? "-",
    },
    {
      field: "moreThan180DaysValue",
      headerName: "More Than 180 Days Value",
      valueFormatter: ({ value }) => value?.toFixed(2) ?? "-",
    },
    {
      field: "lessThan180DaysValue",
      headerName: "Less Than 180 Days Value",
      valueFormatter: ({ value }) => value?.toFixed(2) ?? "-",
    },
    {
      field: "deletionValue",
      headerName: "Deletion Value",
      valueFormatter: ({ value }) => value?.toFixed(2) ?? "-",
    },
    {
      field: "closingValue",
      headerName: "Closing Value",
      valueFormatter: ({ value }) => value?.toFixed(2) ?? "-",
    },
    {
      field: "depreciationValue",
      headerName: "Depreciation Value",
      valueFormatter: ({ value }) => value?.toFixed(2) ?? "-",
    },
    {
      field: "normalDepreciation",
      headerName: "Normal Depreciation",
      valueFormatter: ({ value }) => value?.toFixed(2) ?? "-",
    },
    {
      field: "additionalDepreciation",
      headerName: "Additional Depreciation",
      valueFormatter: ({ value }) => value?.toFixed(2) ?? "-",
    },
    {
      field: "additionalCarryForward",
      headerName: "Additional Carry Forward",
      valueFormatter: ({ value }) => value?.toFixed(2) ?? "-",
    },
    {
      field: "wdvDepreciationValue",
      headerName: "WDV Depreciation Value",
      valueFormatter: ({ value }) => value?.toFixed(2) ?? "-",
    },
    {
      field: "startDate",
      headerName: "Start Date",
      valueFormatter: ({ value }) =>
        value && value !== "0001-01-01T00:00:00+00:00"
          ? dayjs(value).format("DD-MM-YYYY")
          : "-",
    },
    {
      field: "endDate",
      headerName: "End Date",
      valueFormatter: ({ value }) =>
        value && value !== "0001-01-01T00:00:00+00:00"
          ? dayjs(value).format("DD-MM-YYYY")
          : "-",
    },
  ];

  return (
    <Box component={"main"} position={"relative"}>
      <Paper sx={{ p: 3, mb: 3 }} elevation={3}>
        <DialogTitle
          className="highlighted-header"
          sx={{
            pl: 0,
            "& .MuiTypography-root": {
              fontSize: "24px",
              fontWeight: 600,
            },
            pt: 0,
          }}
        >
          WDV Depreciation Statement
        </DialogTitle>
        <Box
          display={"flex"}
          justifyContent={"space-between"}
          alignItems={"center"}
          mt={2}
        >
          <Box>
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
              options={financialYears || []}
              value={selectedFinYear}
              onChange={(_, newValue: any) => {
                setSelectedFinYear(newValue);
                setData([]);
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
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      backgroundColor: "#f8f9fa",
                    },
                    width: 250,
                  }}
                />
              )}
            />
          </Box>
          <Box
            display={"flex"}
            alignItems="center"
            justifyContent="flex-end"
            gap={2}
            mt={3}
          >
            <StyledButton
              variant="contained"
              sx={{
                background: "#fff !important",
                color: "#2ac0a1",
                border: "1px solid #2ac0a1",
              }}
              onClick={handleSubmit}
            >
              View
            </StyledButton>
            <StyledButton
              variant="contained"
              sx={{
                background:
                  "linear-gradient(45deg, #188a71 30%, #2ac0a1 90%) !important",
                color: "#fff",
              }}
              onClick={handleGenerate}
            >
              Save & Generate
            </StyledButton>
          </Box>
        </Box>
        {loading && (
          <Box position={"absolute"} zIndex={10} top={"30%"} left={"50%"}>
            <CircularProgress />
          </Box>
        )}
        {Array.isArray(data) && data.length > 0 && (
          <Paper
            elevation={3}
            sx={{
              mt: 2,
              opacity: loading ? 0.3 : 1,
              pointerEvents: loading ? "none" : "unset",
            }}
          >
            <div
              className="ag-theme-quartz"
              style={{
                height: 600,
                marginTop: 12,
              }}
            >
              <AgGridCommon rowData={data} columnData={columnData} />
            </div>
          </Paper>
        )}
      </Paper>
    </Box>
  );
}

export default WDVMethod;
