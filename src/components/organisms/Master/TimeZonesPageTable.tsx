import { Box } from "@mui/material";
import React, { useEffect, useState } from "react";
import IconBreadcrumbs from "../../molecules/AdminLayout/BreadCrumbs";
import GlobalSearch from "../../molecules/AdminLayout/GlobalSearch";
import NoDataFound from "../../molecules/AdminLayout/NoDataFound";
import { Apirequest } from "../../../utils/lib";
import Config from "../../../utils/config.api.json";
import { useDebounce } from "../../../hooks/useDebounceHook";
import { MuiTable } from "bsoft-base-elements";
import SkeletonLoader from "../../molecules/AdminLayout/SkeletonLoader";

const TimeZonesPageTable = () => {
  const [timeZoneData, setTimeZoneData] = useState<any[]>([]);
  const columns = [
    {
      field: "s_no",
      headerName: "S.No",
      minWidth: 150,
      flex: 1,
      sortable: true,
      renderCell: (params: any) => {
        return (
          (page - 1) * size + (params.api.getAllRowIds().indexOf(params.id) + 1)
        );
      },
    },
    {
      field: "code",
      headerName: "Zone code",
      flex: 1,
      minWidth: 150,
      valueGetter: (value: any, row: any) => `${row?.code || ""}`,
    },
    {
      field: "Zone_name",
      headerName: "Zone Name",
      sortable: true,
      flex: 2,
      valueGetter: (value: any, row: any) => `${row?.name || ""}`,
    },
    {
      field: "isActive",
      headerName: "Status",
      flex: 1,
      minWidth: 150,
      valueGetter: (value: any, row: any) =>
        `${row?.isActive ? "Active" : "Inactive"}`,
    },
  ];
  const [count, setCount] = React.useState<number>(0);
  const [page, setPage] = React.useState<number>(1);
  const [size, setSize] = React.useState<number>(15);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = React.useState("");
  const debouncedSearchTerm = useDebounce(search, 500);
  const [initFlag, setInitFlag] = React.useState(false);

  const GetDivisionList = async () => {
    try {
      const { endpoint, method } = Config.TimeZones;
      const result = await Apirequest(
        endpoint
          .replace("{page}", page.toString())
          .replace("{size}", size.toString())
          .replace("{searchTerm}", search),
        method
      ).then((res) => res.data);
      setTimeZoneData(result.data);
      setLoading(false);
      setCount(result.totalCount);
    } catch (err) {
      console.log(err);
      setTimeZoneData([]);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  React.useEffect(() => {
    initFlag && search !== "" ? GetDivisionList() : GetDivisionList();
  }, [debouncedSearchTerm, page, size, search]);

  useEffect(() => {
    setInitFlag(true);
  }, []);

  return (
    <>
      <Box
        display={"flex"}
        justifyContent={"space-between"}
        alignItems={"center"}
      >
        <Box display={"flex"}>
          <IconBreadcrumbs parent="Master" child="TimeZones" path="" />
        </Box>
        <Box>
          <GlobalSearch
            width={300}
            placeholder={"search timezones"}
            onChange={handleSearch}
          />
        </Box>
      </Box>
      <Box sx={{ width: "100%", my: 2, height: 700 }} className="main-table">
        {loading ? (
          <SkeletonLoader />
        ) : (
          <MuiTable
            rows={timeZoneData}
            columns={columns}
            paginationMode="server"
            initialState={{
              pagination: {
                paginationModel: {
                  pageSize: size,
                },
              },
            }}
            slots={{
              noRowsOverlay: () => <NoDataFound />,
            }}
            onPaginationModelChange={(newPage) => {
              setPage(newPage.page + 1);
              setSize(newPage.pageSize);
            }}
            rowCount={count}
            rowHeight={40}
            columnHeaderHeight={40}
            pageSizeOptions={[15, 30, 50]}
            disableRowSelectionOnClick
          />
        )}
      </Box>
    </>
  );
};
export default TimeZonesPageTable;
