import React, { useEffect, useState } from "react";
import { Box, Grid2, Skeleton } from "@mui/material";
import DashboardCard from "../../../molecules/Dashboard/DashboardCard";
import FamDashboardCard from "../../../molecules/FAM/Dashboard/FamDashboardCard";
import { useDataFetchHook } from "../../../../hooks/useDataFetchHook";
import FamConfig from "../../../../utils/fam.api.json";
import { Apirequest } from "../../../../utils/lib";
import AssetSummaryChart from "../../../molecules/FAM/Dashboard/AssetSummaryChart";
import AssetExpirySummaryChart from "../../../molecules/FAM/Dashboard/AssetExpirySummaryChart";
export interface DashboardData {
  totalAssets: number;
  totalAssetValue: number;
  newAssets: number;
  newAssetsValue: number;
  assetDisposed: number;
}
const FixedAssetDashboardPage = () => {
  const [isLoading, setIsLoading] = useState(false);

  const [cardData, setCardData] = useState<DashboardData>({
    totalAssets: 0,
    totalAssetValue: 0,
    newAssets: 0,
    newAssetsValue: 0,
    assetDisposed: 0,
  });

  const GetDashboardCardData = async () => {
    try {
      setIsLoading(true);

      const { endpoint, method } = FamConfig.Dashboard.Cards;
      const response = await Apirequest(endpoint, method, null, "fam").then(
        (res) => res.data
      );
      setCardData(response);
      setIsLoading(false);
    } catch (err) {
      console.error("Dashboard fetch failed:", err);
    }
  };
  interface AssetSeries {
    name: string;
    data: number[];
  }
  interface SeriesType {
    name: string;
    data: number[];
  }

  interface AssetDataType {
    categories: string[];
    series: AssetSeries[];
  }

  const [assetData, setAssetData] = useState<AssetDataType>({
    categories: [],
    series: [],
  });
  interface AssetExpiryDataType {
    categories: string[];
    series: SeriesType[];
  }
  const [assetExpiryData, setAssetExpiryData] = useState<AssetExpiryDataType>({
    categories: [],
    series: [],
  });

  const GetAssetSummaryData = async () => {
    try {
      setIsLoading(true);
      const { endpoint, method } = FamConfig.Dashboard.AssetSummary;

      const response = await Apirequest(endpoint, method, null, "fam").then(
        (res) => res.data
      );
      if (
        response &&
        Array.isArray(response.categories) &&
        Array.isArray(response.series)
      ) {
        const validSeries = response.series.filter(
          (item: any) =>
            typeof item.name === "string" &&
            Array.isArray(item.data) &&
            item.data.every((v: any) => typeof v === "number")
        );
        setAssetData({
          categories: response.categories,
          series: validSeries,
        });
      } else {
        console.warn("Invalid asset summary response format.");
        setAssetData({ categories: [], series: [] });
      }
    } catch (err) {
      console.error("Dashboard fetch failed:", err);
      setAssetData({ categories: [], series: [] });
    } finally {
      setIsLoading(false);
    }
  };
  const GetAssetExpirySummaryData = async () => {
    try {
      setIsLoading(true);
      const { endpoint, method } = FamConfig.Dashboard.AssetExpirySummary;

      const response = await Apirequest(endpoint, method, null, "fam").then(
        (res) => res.data
      );
      if (
        response &&
        Array.isArray(response.categories) &&
        Array.isArray(response.series)
      ) {
        const validSeries = response.series.filter(
          (item: any) =>
            typeof item.name === "string" &&
            Array.isArray(item.data) &&
            item.data.every((v: any) => typeof v === "number")
        );
        setAssetExpiryData({
          categories: response.categories,
          series: validSeries,
        });
      } else {
        console.warn("Invalid asset summary response format.");
        setAssetExpiryData({ categories: [], series: [] });
      }
    } catch (err) {
      console.error("Dashboard fetch failed:", err);
      setAssetExpiryData({ categories: [], series: [] });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    GetDashboardCardData();
    GetAssetSummaryData();
    GetAssetExpirySummaryData()
  }, []);
  return (
    <Box px={2} sx={{ fontFamily: "poppins !important" }}>
      {isLoading ? (
        <Grid2 container spacing={2}>
          {[...Array(8)].map((_, li) => (
            <Grid2 size={{ xs: 3 }} key={li}>
              <Skeleton
                variant="rectangular"
                width="100%"
                height={180}
                sx={{ borderRadius: "12px" }}
              />
            </Grid2>
          ))}
          {[0, 1].map((li) => (
            <Grid2 size={{ xs: 6 }} key={li}>
              <Skeleton
                variant="rectangular"
                width="100%"
                height={420}
                sx={{ borderRadius: "12px" }}
              />
            </Grid2>
          ))}
        </Grid2>
      ) : (
        <Box>
          <FamDashboardCard data={cardData} />
          <Grid2 container spacing={2} my={3}>
            <Grid2 size={{ xs: 12, sm: 12, md: 6 }}>
              <AssetSummaryChart data={assetData} />
            </Grid2>
            <Grid2 size={{ xs: 12, sm: 12, md: 6 }}>
              <AssetExpirySummaryChart data={assetExpiryData} />
            </Grid2>
          </Grid2>
        </Box>
      )}
    </Box>
  );
};
export default FixedAssetDashboardPage;
