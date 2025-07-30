"use client";
import React, { useEffect, useState } from "react";
import IconBreadcrumbs from "../../molecules/AdminLayout/BreadCrumbs";
import { Box } from "@mui/material";
import GlobalSearch from "../../molecules/AdminLayout/GlobalSearch";
import { MuiButton, MuiTable } from "bsoft-base-elements";
import { GoPlus } from "react-icons/go";
import NoDataFound from "../../molecules/AdminLayout/NoDataFound";
import dayjs from "dayjs";
import { FiEdit } from "react-icons/fi";
import { RiDeleteBin6Line } from "react-icons/ri";
import { useDebounce } from "../../../hooks/useDebounceHook";
import DeleteConfirmation from "../../molecules/Master/DeleteConfirmation";
import { ShiftProps } from "../../../maintanenceTypes";
import config from "../../../utils/main.api.json";
import { Apirequest } from "../../../utils/lib";
import MainConfig from "../../../utils/main.api.json";
import SkeletonLoader from "../../molecules/AdminLayout/SkeletonLoader";
import ErrorModal from "../../molecules/Master/Role/ErrorModal";
import CreateShiftMaster from "../../molecules/Maintanence/CreateShiftMaster";
import { usePrivilegeCheck } from "../../../hooks/usePrivilegeCheck";
import toast from "react-hot-toast";

export interface SnackbarTypes {
  open: boolean;
  message: string;
}
const ShiftMasterPage = () => {
  const [pathname, setPathName] = useState<string>("");
  const permissions = usePrivilegeCheck(pathname);
  useEffect(() => {
    setInitFlag(true);
    const currentPath = window.location.pathname.split("/bsoft").at(-1) || "";
    setPathName(currentPath);
  }, []);
  const [open, setOpen] = React.useState(false);
  const [shiftData, setShiftData] = React.useState<any[]>([]);
  const [page, setPage] = React.useState<number>(1);
  const [size, setSize] = React.useState<number>(15);
  const [error, setError] = React.useState<any[]>([]);
  const [search, setSearch] = React.useState("");
  const [editFlag, setEditFlag] = React.useState(false);
  const [initFlag, setInitFlag] = React.useState(false);
  const debouncedSearchTerm = useDebounce(search, 500);
  const [errorModalOpen, setErrorModalOpen] = React.useState(false);
  const [errorMessages, setErrorMessages] = React.useState<string[]>([]);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [loading, setLoading] = useState(true);
  const [count, setCount] = React.useState<number>(0);
  const [shiftInput, setShiftInput] = React.useState<ShiftProps>({
    shiftCode: "",
    shiftName: "",
    effectiveDate: "",
    isActive: 1,
    id: 0,
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
      field: "shiftCode",
      headerName: "Shift Code",
      flex: 1,
      minWidth: 200,
      valueGetter: (value: any, row: any) =>
        `${row?.shiftCode.toUpperCase() || ""}`,
    },

    {
      field: "shiftName",
      headerName: "shift Name",
      flex: 2,
      minWidth: 200,
      valueGetter: (value: any, row: any) =>
        `${row?.shiftName || ""}`.replace(/\b\w/g, (char) =>
          char.toUpperCase()
        ),
    },
    {
      field: "effectiveDate",
      headerName: "Effective Date",
      flex: 2,
      minWidth: 200,
      valueGetter: (value: any, row: any) => `${row?.effectiveDate || ""}`,
    },
    {
      field: "isActive",
      headerName: "Status",
      flex: 1,
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
              onClick={() => handleEdit(params.row)}
            />
          )}

          {permissions.canDelete && (
            <RiDeleteBin6Line
              fontSize={20}
              color="red"
              cursor={"pointer"}
              onClick={() => handleDelete(params.row.id)}
            />
          )}
        </Box>
      ),
    },
  ];
  const handleClickOpen = () => {
    setOpen(true);
    setEditFlag(false);
    setShiftInput({
      ...shiftInput,
      shiftCode: "",
      shiftName: "",
      effectiveDate: "",
    });
    setError([]);
  };
  const handleSwitch = (e: React.ChangeEvent<HTMLInputElement>) => {
    let { checked } = e.target;
    checked
      ? setShiftInput({ ...shiftInput, isActive: 1 })
      : setShiftInput({ ...shiftInput, isActive: 0 });
  };

  const AddShift = async () => {
    try {
      const body: any = {
        shiftCode: shiftInput.shiftCode?.trim()?.toUpperCase(),
        shiftName: shiftInput.shiftName
          ?.trim()
          .replace(/\b\w/g, (char: any) => char.toUpperCase()),
        effectiveDate: shiftInput.effectiveDate,
        isActive: shiftInput.isActive,
      };

      if (editFlag) {
        body.id = Number(shiftInput.id);
      }
      const { endpoint, method } = config.ShiftMaster.AddShift;
      const response = await Apirequest(endpoint, method, body, "main").then(
        (res) => res.data
      );
      if (response.statusCode === 200 || response.statusCode === 201) {
        toast.success(response.message);
        setOpen(false);
        setEditFlag(false);
        setShiftInput({ ...shiftInput });
        GetShiftList();
      } else {
        toast.error(response.message);
        if (Array.isArray(response.errors) && response.errors.length > 0) {
          setErrorModalOpen(true);
          setErrorMessages(response.errors);
        }
      }
    } catch (err) {
      console.log(err);
    }
  };

  const UpdateShift = async () => {
    try {
      const body: any = {
        shiftCode: shiftInput.shiftCode?.trim()?.toUpperCase(),
        shiftName: shiftInput.shiftName
          ?.trim()
          .replace(/\b\w/g, (char: any) => char.toUpperCase()),
        effectiveDate: shiftInput.effectiveDate,
        isActive: shiftInput.isActive,
        id: shiftInput.id,
      };

      if (editFlag) {
        body.id = Number(shiftInput.id);
      }
      const { endpoint, method } = config.ShiftMaster.UpdateShift;
      const response = await Apirequest(endpoint, method, body, "main").then(
        (res) => res.data
      );

      if (response.statusCode === 200 || response.statusCode === 201) {
        toast.success(response.message);
        setOpen(false);
        setEditFlag(false);
        setShiftInput({ ...shiftInput });
        GetShiftList();
      } else {
        toast.error(response.message);
        if (Array.isArray(response.errors) && response.errors.length > 0) {
          setErrorModalOpen(true);
          setErrorMessages(response.errors);
        }
      }
    } catch (err) {
      GetShiftList();
      console.log(err);
    }
  };
  const handleSubmit = (e: React.MouseEvent<HTMLButtonElement>) => {
    let temp: any = [];

    Object.entries(shiftInput).map(([key, value]) => {
      if (key === "shiftCode" && value?.length == 0) {
        temp.push(key);
      } else if (key === "shiftName" && value?.length == 0) {
        temp.push(key);
      } else if (key === "effectiveDate" && value?.length == 0) {
        temp.push(key);
      }
    });

    setError(temp);
    if (temp.length === 0 && editFlag) {
      UpdateShift();
    } else {
      if (temp.length === 0) {
        AddShift();
      }
    }
  };
  const handleEdit = (row: any) => {
    setEditFlag(true);
    setOpen(true);
    setShiftInput({
      ...shiftInput,
      shiftCode: row?.shiftCode,
      shiftName: row?.shiftName,
      effectiveDate: row?.effectiveDate,
      id: row?.id,
    });
  };

  const handleDelete = (id: number) => {
    setShiftInput({ ...shiftInput, id: id });
    setDeleteOpen(true);
  };
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };
  const handleClose = () => {
    setOpen(false);
    setShiftInput({
      ...shiftInput,
      shiftCode: "",
      shiftName: "",
      isActive: 1,
      effectiveDate: "",
    });
    setEditFlag(false);
    setError([]);
  };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let { name, value } = e.target;
    const filteredValue =
      name === "shiftCode" ? value.replace(/[^a-zA-Z0-9]/g, "") : value;
    setShiftInput({ ...shiftInput, [name]: filteredValue });
    setError([]);
  };

  const DeleteShift = async (id: number) => {
    try {
      const { endpoint, method } = config.ShiftMaster.DeleteShift;
      const deleteEndpoint = endpoint.replace("{id}", id.toString());

      const result = await Apirequest(
        deleteEndpoint,
        method,
        null,
        "main"
      ).then((res) => res.data);
      toast.success(result?.message);
      GetShiftList();
    } catch (err) {
      console.log(err);
    }
  };

  const handleConfirmDelete = async () => {
    if (shiftInput.id) {
      await DeleteShift(shiftInput.id);
    }
    setDeleteOpen(false);
  };

  const GetShiftList = async () => {
    try {
      const response = await Apirequest(
        MainConfig.ShiftMaster.GetShift.endpoint
          .replace("{page}", page.toString())
          .replace("{size}", size.toString())
          .replace("{searchTerm}", search),
        MainConfig.ShiftMaster.GetShift.method,
        null,
        "main"
      ).then((res) => res.data);
      const { totalCount, statusCode, data } = response;
      if (statusCode === 200 || statusCode === 201) {
        setShiftData(data);
        setLoading(false);
        setCount(totalCount);
      } else {
        setCount(0);
        setShiftData([]);
        setLoading(false);
      }
    } catch (err) {
      console.log(err);
      setShiftData([]);
    }
  };

  React.useEffect(() => {
    initFlag && search !== "" ? GetShiftList() : GetShiftList();
  }, [debouncedSearchTerm, page, size]);

  return (
    <>
      <Box
        display={"flex"}
        justifyContent={"space-between"}
        alignItems={"center"}
        flexWrap={"wrap"}
        gap={2}
        mt={1}
      >
        <Box>
          <IconBreadcrumbs parent="Maintenance" child="Shift Master" path="" />
        </Box>
        <Box>
          <Box
            display={"flex"}
            justifyContent={"space-between"}
            alignItems={"center"}
            flexWrap={"wrap"}
            gap={2}
          >
            <GlobalSearch
              placeholder="search"
              width={200}
              onChange={handleSearch}
            />
            {permissions.canAdd && (
              <MuiButton
                startIcon={<GoPlus />}
                onClick={handleClickOpen}
                variant="contained"
              >
                Create
              </MuiButton>
            )}
          </Box>
        </Box>
      </Box>
      <Box sx={{ width: "100%", my: 2, height: 700 }} className="main-table">
        {loading ? (
          <SkeletonLoader />
        ) : (
          <MuiTable
            rows={shiftData || []}
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
            rowHeight={40}
            pageSizeOptions={[15, 30, 50]}
            disableRowSelectionOnClick
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
      <CreateShiftMaster
        open={open}
        close={handleClose}
        handleChange={handleChange}
        error={error}
        shiftInput={shiftInput}
        handleSwitch={handleSwitch}
        handleSubmit={handleSubmit}
        editFlag={editFlag}
      />
      <ErrorModal
        open={errorModalOpen}
        onClose={() => setErrorModalOpen(false)}
        errors={errorMessages}
      />
      <DeleteConfirmation
        open={deleteOpen}
        close={() => setDeleteOpen(false)}
        handleDelete={handleConfirmDelete}
      />
    </>
  );
};

export default ShiftMasterPage;
