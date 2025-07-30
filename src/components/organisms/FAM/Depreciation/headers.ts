import dayjs from "dayjs";

export const columns = [
  { field: "company", headerName: "Company" },
  { field: "unit", headerName: "Unit" },
  {
    field: "division",
    headerName: "Division",
  },
  {
    field: "assetGroup",
    headerName: "Asset Group",
  },
  {
    field: "assetCode",
    headerName: "Asset Code",
  },
  {
    field: "assetName",
    headerName: "Asset Name",
  },
  {
    field: "purchaseCost",
    headerName: "Purchase Cost",
    valueFormatter: (p: any) => `₹${p.value?.toFixed(2)}`,
  },
  {
    field: "assetDate",
    headerName: "Asset Date",
    valueFormatter: (params: any) =>
      params.value && params.value !== "N/A"
        ? dayjs(params.value).isValid()
          ? dayjs(params.value).format("DD-MM-YYYY")
          : "-"
        : "-",
  },
  {
    field: "usefulLife",
    headerName: "Useful Life (Years)",
  },
  {
    field: "usefulLifeDays",
    headerName: "Useful Life (Days)",
  },
  {
    field: "residual_Per",
    headerName: "Residual %",
  },
  {
    field: "residualValue",
    headerName: "Residual Value",
  },
  {
    field: "daysOpening",
    headerName: "Days Opening",
  },
  {
    field: "daysUsedCurrent",
    headerName: "Days Used (Current)",
  },
  {
    field: "expiryDate",
    headerName: "Expiry Date",
    valueFormatter: (params: any) =>
      params.value && params.value !== "N/A"
        ? dayjs(params.value).isValid()
          ? dayjs(params.value).format("DD-MM-YYYY")
          : "-"
        : "-",
  },
  {
    field: "openingValue",
    headerName: "Opening Value",
    valueFormatter: (p: any) => `₹${p.value?.toFixed(2)}`,
  },
  {
    field: "depreciationValue",
    headerName: "Depreciation Value",

    valueFormatter: (p: any) => `₹${p.value?.toFixed(2)}`,
  },
  {
    field: "closingValue",
    headerName: "Closing Value",

    valueFormatter: (p: any) => `₹${p.value?.toFixed(2)}`,
  },
  {
    field: "depreciationPeriod",
    headerName: "Depreciation Period",
  },
  {
    field: "depreciationType",
    headerName: "Depreciation Type",
  },
  {
    field: "startDate",
    headerName: "Start Date",
    valueFormatter: (params: any) =>
      params.value && params.value !== "N/A"
        ? dayjs(params.value).isValid()
          ? dayjs(params.value).format("DD-MM-YYYY")
          : "-"
        : "-",
  },
  {
    field: "endDate",
    headerName: "End Date",
    valueFormatter: (params: any) =>
      params.value && params.value !== "N/A"
        ? dayjs(params.value).isValid()
          ? dayjs(params.value).format("DD-MM-YYYY")
          : "-"
        : "-",
  },
  {
    field: "netValue",
    headerName: "Net Value",
    valueFormatter: (p: any) => `₹${p.value?.toFixed(2)}`,
  },
];

export const abstract = [
  { field: "company", headerName: "Company" },
  { field: "unit", headerName: "Unit" },
  {
    field: "division",
    headerName: "Division",
  },
  {
    field: "assetGroup",
    headerName: "Asset Group",
  },
  {
    field: "grossBlockOpening",
    headerName: "Gross Block Opening",
    valueFormatter: ({ value }: any) => `₹${value?.toFixed(2)}`,
  },
  {
    field: "addition",
    headerName: "Addition",
    valueFormatter: ({ value }: any) => `₹${value?.toFixed(2)}`,
  },
  {
    field: "deletion",
    headerName: "Deletion",
    valueFormatter: ({ value }: any) => `₹${value?.toFixed(2)}`,
  },
  {
    field: "grossBlockClosing",
    headerName: "Gross Block Closing",

    valueFormatter: ({ value }: any) => `₹${value?.toFixed(2)}`,
  },
  {
    field: "depreciationOpening",
    headerName: "Depreciation Opening",
    valueFormatter: ({ value }: any) => `₹${value?.toFixed(2)}`,
  },
  {
    field: "depreciationCurrent",
    headerName: "Depreciation Current",
    valueFormatter: ({ value }: any) => `₹${value?.toFixed(2)}`,
  },
  {
    field: "disposalDepreciation",
    headerName: "Disposal Depreciation",
    valueFormatter: ({ value }: any) => `₹${value?.toFixed(2)}`,
  },
  {
    field: "depreciationClosing",
    headerName: "Depreciation Closing",
    valueFormatter: ({ value }: any) => `₹${value?.toFixed(2)}`,
  },
  {
    field: "netBlockOpening",
    headerName: "Net Block Opening",
    valueFormatter: ({ value }: any) => `₹${value?.toFixed(2)}`,
  },
  {
    field: "netBlockClosing",
    headerName: "Net Block Closing",
    valueFormatter: ({ value }: any) => `₹${value?.toFixed(2)}`,
  },
  {
    field: "startDate",
    headerName: "Start Date",
    valueFormatter: (params: any) =>
      params.value && params.value !== "N/A"
        ? dayjs(params.value).isValid()
          ? dayjs(params.value).format("DD-MM-YYYY")
          : "-"
        : "-",
  },
  {
    field: "endDate",
    headerName: "End Date",
    valueFormatter: (params: any) =>
      params.value && params.value !== "N/A"
        ? dayjs(params.value).isValid()
          ? dayjs(params.value).format("DD-MM-YYYY")
          : "-"
        : "-",
  },
  {
    field: "depType",
    headerName: "Depreciation Type",
  },
  {
    field: "depPeriod",
    headerName: "Depreciation Period",
  },
];
