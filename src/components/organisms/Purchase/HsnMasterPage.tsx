"use client";
import { Box } from "@mui/material";
import React, { useState } from "react";
import IconBreadcrumbs from "../../molecules/AdminLayout/BreadCrumbs";
import GlobalSearch from "../../molecules/AdminLayout/GlobalSearch";
import { MuiButton, MuiTable } from "bsoft-base-elements";
import { GoPlus } from "react-icons/go";
import { usePrivilegeCheck } from "../../../hooks/usePrivilegeCheck";
import dayjs from "dayjs";
import { FiEdit } from "react-icons/fi";
import { RiDeleteBin6Line } from "react-icons/ri";
import NoDataFound from "../../molecules/AdminLayout/NoDataFound";
import CreateHsnMaster from "../../molecules/Purchase/CreateHsnMaster";
import { CreateHan } from "../../../types/PurchaseTypes";

function HsnMasterPage() {
  const [pathname, setPathName] = useState<string>("");
  const permissions = usePrivilegeCheck(pathname);
  const [page, setPage] = React.useState<number>(1);
  const [size, setSize] = React.useState<number>(15);
  const [count, setCount] = React.useState<number>(0);
  const [open, setOpen] = React.useState(false);
  const [editFlag, setEditFlag] = React.useState(false);
  const [hsnInput, setHsnInput] = React.useState<CreateHan>({
    hsnCode:0
  });
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
      field: "HSN Code",
      headerName: "HSN Code",
      flex: 1,
      minWidth: 200,
      valueGetter: (value: any, row: any) => `${row?.code.toUpperCase() || ""}`,
    },
    {
      field: "description",
      headerName: "Description",
      flex: 5,
      minWidth: 200,
      valueGetter: (value: any, row: any) =>
        `${row?.description || ""}`.replace(/\b\w/g, (char) =>
          char.toUpperCase()
        ),
    },
    {
      field: "isActive",
      headerName: "Status",
      flex: 2,
      minWidth: 200,
      valueGetter: (value: any, row: any) =>
        `${row?.isActive ? "Active" : "Inactive"}`,
    },
    {
      field: "createdDate",
      headerName: "Created Date",
      flex: 2,
      minWidth: 200,
      valueGetter: (value: any, row: any) =>
        `${dayjs(row?.createdDate).format("DD-MM-YYYY")}`,
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
          {permissions.canUpdate && (
            <FiEdit
              fontSize={20}
              color="black"
              cursor={"pointer"}
              // onClick={() => handleEdit(params.row)}
            />
          )}
          {permissions.canDelete && (
            <RiDeleteBin6Line
              fontSize={20}
              color="red"
              cursor={"pointer"}
              // onClick={() => handleDelete(params.row.id)}
            />
          )}
        </Box>
      ),
    },
  ];
  const handleClickOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
    setEditFlag(false);
  };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let { name, value } = e.target;
    const filteredValue =
      name === "hsnCode" ? value.replace(/[^0-9]/g, "") : value;
    setHsnInput({ ...hsnInput, [name]: filteredValue });
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
          <IconBreadcrumbs parent={"Purchase"} child={"Hsn Master"} path="" />
        </Box>

        <Box
          display={"flex"}
          justifyContent={"space-between"}
          alignItems={"center"}
          flexWrap={"wrap"}
          gap={2}
        >
          <GlobalSearch
            placeholder="search hsn"
            width={300}
            onChange={() => {}}
          />
          <Box className="d-flex-center" gap={2}>
            {/* {permissions.canAdd && ( */}
            <MuiButton
              startIcon={<GoPlus />}
              variant="contained"
              onClick={handleClickOpen}
            >
              Create
            </MuiButton>
            {/* )} */}
          </Box>
        </Box>
      </Box>
      <Box sx={{ width: "100%", my: 2, height: 700 }} className="main-table">
        {/* {loading ? (
          <SkeletonLoader />
        ) : ( */}
        <MuiTable
          rows={[]}
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
        {/* )} */}
      </Box>
      <CreateHsnMaster
        close={handleClose}
        open={open}
        editFlag={editFlag}
        handleChange={handleChange}
        hsnInput={hsnInput}
      />
    </>
  );
}

export default HsnMasterPage;
