"use client";

import { Box } from "@mui/material";
import React, { useState } from "react";
import IconBreadcrumbs from "../../../molecules/AdminLayout/BreadCrumbs";
import GlobalSearch from "../../../molecules/AdminLayout/GlobalSearch";
import { MuiButton, MuiTable } from "bsoft-base-elements";
import { GoPlus } from "react-icons/go";
import NoDataFound from "../../../molecules/AdminLayout/NoDataFound";
import { FiEdit } from "react-icons/fi";
import { RiDeleteBin6Line } from "react-icons/ri";
import { Apirequest } from "../../../../utils/lib";
import { useDebounce } from "../../../../hooks/useDebounceHook";
import PartyConfig from "../../../../utils/party.api.json";
import toast from "react-hot-toast";
import DeleteConfirmation from "../../../molecules/Master/DeleteConfirmation";
import SkeletonLoader from "../../../molecules/AdminLayout/SkeletonLoader";
import { useRouter } from "next/navigation";

interface ItemGroup {
  id: number;
}

const PartyListPage = () => {
  const [page, setPage] = React.useState<number>(1);
  const [size, setSize] = React.useState<number>(15);
  const [search, setSearch] = React.useState("");
  const debouncedSearchTerm = useDebounce(search, 500);
  const [count, setCount] = React.useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [itemGroupInput, setItemGroupInput] = React.useState<ItemGroup>({
    id: 0,
  });
  const [itemGroupData, setItemGroupData] = React.useState<any[]>([]);
  const router = useRouter();

  const columns = [
    {
      field: "s_no",
      headerName: "S.No",
      minWidth: 50,
      flex: 1,
      sortable: true,
      renderCell: (params: any) => {
        return (
          (page - 1) * size + (params.api.getAllRowIds().indexOf(params.id) + 1)
        );
      },
    },
    {
      field: "partyCode",
      headerName: "Party Code",
      flex: 1,
      minWidth: 200,
      valueGetter: (value: any, row: any) =>
        `${row?.partyCode?.toUpperCase() || ""}`,
    },
    {
      field: "partyName",
      headerName: "Party Name",
      flex: 2,
      minWidth: 200,
      valueGetter: (value: any, row: any) =>
        `${row?.partyName?.toUpperCase() || ""}`.replace(/\b\w/g, (char) =>
          char.toUpperCase()
        ),
    },
    {
      field: "registrationType",
      headerName: "Registration Type",
      flex: 2,
      minWidth: 200,
      valueGetter: (value: any, row: any) => `${row?.registrationType || ""}`,
    },
    {
      field: "gstNumber",
      headerName: "GST Number",
      flex: 2,
      minWidth: 150,
      valueGetter: (value: any, row: any) => `${row?.gstNumber || ""}`,
    },
    {
      field: "partyStatus",
      headerName: "Party Status",
      sortable: true,
      flex: 2,
      minWidth: 150,
      valueGetter: (value: any, row: any) => `${row?.partyStatus ?? "-"}`,
    },
    {
      field: "actions",
      headerName: "Actions",
      flex: 2,
      minWidth: 200,
      sortable: false,
      filterable: false,
      renderCell: (params: any) => (
        <Box
          component={"div"}
          display={"flex"}
          alignItems={"center"}
          gap={2}
          height={"100%"}
        >
          {/* {permissions.canUpdate && ( */}
          <FiEdit
            fontSize={20}
            color="black"
            cursor={"pointer"}
            onClick={() =>
              router.push(`/purchase/party-master/${params.row.id}`)
            }
          />
          {/* )} */}
          {/* {permissions.canDelete && ( */}
          <RiDeleteBin6Line
            fontSize={20}
            color="red"
            cursor={"pointer"}
            onClick={() => handleDelete(params.row.id)}
          />
          {/* )} */}
        </Box>
      ),
    },
  ];
  const GetItemGroupList = async () => {
    try {
      const response = await Apirequest(
        PartyConfig.PartyMaster.GetPartyList.endpoint
          .replace("{page}", page.toString())
          .replace("{size}", size.toString())
          .replace("{search}", search),
        PartyConfig.PartyMaster.GetPartyList.method,
        null,
        "party"
      ).then((res) => res.data);
      const { totalCount, statusCode, data } = response;
      if (statusCode === 200 || statusCode === 201) {
        setItemGroupData(data);
        setLoading(false);
        setCount(totalCount);
      } else {
        setCount(0);
        setItemGroupData([]);
        setLoading(false);
      }
    } catch (err) {
      console.log(err);
      setItemGroupData([]);
    }
  };

  React.useEffect(() => {
    search !== "" ? GetItemGroupList() : GetItemGroupList();
  }, [debouncedSearchTerm, page, size]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const handleDelete = (id: number) => {
    setItemGroupInput({ ...itemGroupInput, id: id });
    setDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    DeleteItemGroup();
    setDeleteOpen(false);
  };

  const DeleteItemGroup = async () => {
    try {
      const body = {
        id: itemGroupInput.id,
      };
      const { endpoint, method } = PartyConfig.PartyMaster.DeleteParty;
      const result = await Apirequest(
        endpoint.replace("{id}", `${itemGroupInput.id}`),
        method,
        body,
        "party"
      ).then((res) => res.data);
      toast.success(result?.message);
      GetItemGroupList();
    } catch (err) {
      console.log(err);
      GetItemGroupList();
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
          <IconBreadcrumbs parent={"Purchase"} child={"Party List"} path="" />
        </Box>
        <Box
          display={"flex"}
          justifyContent={"space-between"}
          alignItems={"center"}
          flexWrap={"wrap"}
          gap={2}
        >
          <GlobalSearch
            placeholder="search party"
            width={300}
            onChange={handleSearch}
          />
          <Box className="d-flex-center" gap={2}>
            {/* {permissions.canAdd && ( */}
            <MuiButton
              startIcon={<GoPlus />}
              onClick={() => router.push(`/purchase/party-master`)}
              variant="contained"
            >
              Create Party
            </MuiButton>
            {/* )} */}
          </Box>
        </Box>
      </Box>
      <Box sx={{ width: "100%", my: 2, height: 700 }} className="main-table">
        {loading ? (
          <SkeletonLoader />
        ) : (
          <MuiTable
            rows={itemGroupData}
            columns={columns}
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
            onPaginationModelChange={(newPage) => {
              setPage(newPage.page + 1);
              setSize(newPage.pageSize);
            }}
          />
        )}
      </Box>

      <DeleteConfirmation
        open={deleteOpen}
        close={() => setDeleteOpen(false)}
        handleDelete={handleConfirmDelete}
      />
    </>
  );
};

export default PartyListPage;
