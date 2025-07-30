import { Box } from "@mui/material";
import React, { useEffect, useState } from "react";
import IconBreadcrumbs from "../../molecules/AdminLayout/BreadCrumbs";
import GlobalSearch from "../../molecules/AdminLayout/GlobalSearch";
import { GoPlus } from "react-icons/go";
import NoDataFound from "../../molecules/AdminLayout/NoDataFound";
import { FiEdit } from "react-icons/fi";
import { RiDeleteBin6Line } from "react-icons/ri";
import { Apirequest } from "../../../utils/lib";
import Config from "../../../utils/config.api.json";
import { useDebounce } from "../../../hooks/useDebounceHook";
import CreateNewCurrency from "../../molecules/Master/CreateNewCurrency";
import { CurrencyProps } from "../../../types";
import DeleteConfirmation from "../../molecules/Master/DeleteConfirmation";
import { MuiButton, MuiTable } from "bsoft-base-elements";
import { usePrivilegeCheck } from "../../../hooks/usePrivilegeCheck";
import SkeletonLoader from "../../molecules/AdminLayout/SkeletonLoader";
import ErrorModal from "../../molecules/Master/Role/ErrorModal";
import toast from "react-hot-toast";

const CurrencyPageTable = () => {
  const [CurrencyData, setCurrencyData] = useState<any[]>([]);
  const [pathname, setPathName] = useState<string>("");
  const permissions = usePrivilegeCheck(pathname);
  useEffect(() => {
    setInitFlag(true);
    const currentPath = window.location.pathname.split("/bsoft").at(-1) || "";
    setPathName(currentPath);
  }, []);
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
      headerName: "Currency Code",
      flex: 1,
      minWidth: 150,
      valueGetter: (value: any, row: any) => `${row?.code.toUpperCase() || ""}`,
    },
    {
      field: "name",
      headerName: "Currency Name",
      sortable: true,
      flex: 2,
      valueGetter: (value: any, row: any) =>
        `${row?.name || ""}`.replace(/\b\w/g, (char) => char.toUpperCase()),
    },
    {
      field: "isActive",
      headerName: "Status",
      flex: 1,
      minWidth: 150,
      valueGetter: (value: any, row: any) =>
        `${row?.isActive ? "Active" : "Inactive"}`,
    },
    {
      field: "actions",
      headerName: "Actions",
      flex: 1,
      minWidth: 150,
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
  const [currencyInput, setCurrencyInput] = useState<CurrencyProps>({
    code: "",
    name: "",
    id: 0,
    isActive: 1,
  });

  const [error, setError] = useState<any>([]);
  const [count, setCount] = React.useState<number>(0);
  const [page, setPage] = React.useState<number>(1);
  const [size, setSize] = React.useState<number>(15);
  const [search, setSearch] = React.useState("");
  const [loading, setLoading] = useState(true);
  const [initFlag, setInitFlag] = React.useState(false);
  const debouncedSearchTerm = useDebounce(search, 500);
  const [open, setOpen] = React.useState(false);
  const [editFlag, setEditFlag] = React.useState(false);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [errorModalOpen, setErrorModalOpen] = React.useState(false);
  const [errorMessages, setErrorMessages] = React.useState<string[]>([]);
  const handleClickOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
    setCurrencyInput({
      code: "",
      name: "",
      id: 0,
      isActive: 1,
    });
    setEditFlag(false);
  };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let { name, value } = e.target;
    const filteredValue =
      name === "code" ? value.replace(/[^a-zA-Z0-9]/g, "") : value;
    setCurrencyInput({ ...currencyInput, [name]: filteredValue });
  };
  const handleEdit = (row: any) => {
    setCurrencyInput({
      code: row.code,
      name: row.name,
      id: row.id,
      isActive: row.isActive,
    });
    setEditFlag(true);
    setOpen(true);
  };

  const handleSubmit = (e: React.MouseEvent<HTMLButtonElement>) => {
    let temp: any = [];
    Object.entries(currencyInput).map(([key, value]) => {
      if (
        key === "code" &&
        (!value || typeof value !== "string" || value.trim().length < 2)
      ) {
        temp.push(key);
        console.log("Invalid code");
      } else if (
        key === "name" &&
        (!value || typeof value !== "string" || value.trim().length < 4)
      ) {
        temp.push(key);
        console.log("Invalid Name");
      }
    });
    setError(temp);
    if (temp.length === 0 && editFlag) {
      UpdateCurrency();
    } else {
      if (temp.length === 0) {
        AddCurrency();
        setLoading(false);
      }
    }
  };
  const AddCurrency = async () => {
    try {
      const body = {
        ...currencyInput,
        code: currencyInput.code?.trim().toUpperCase(),
      };
      const { endpoint, method } = Config.Currency.addCurrency;
      const response = await Apirequest(endpoint, method, body).then(
        (res) => res.data
      );
      if (response.statusCode === 200 || response.statusCode === 201) {
        toast.success(response.message);
        setOpen(false);
        setCurrencyInput({
          code: "",
          name: "",
          id: 0,
          isActive: 1,
        });
        setEditFlag(false);
        GetCurrencyList();
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
  const UpdateCurrency = async () => {
    try {
      const body = {
        ...currencyInput,
        code: currencyInput.code?.trim().toUpperCase(),
      };
      const { endpoint, method } = Config.Currency.updateCurrency;
      const response = await Apirequest(endpoint, method, body).then(
        (res) => res.data
      );
      if (response.statusCode === 200 || response.statusCode === 201) {
        toast.success(response.message);
        setOpen(false);
        setCurrencyInput({
          code: "",
          name: "",
          id: 0,
          isActive: 1,
        });
        setEditFlag(false);
        GetCurrencyList();
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
  const handleDelete = (id: number) => {
    setCurrencyInput({ ...currencyInput, id: id });
    setDeleteOpen(true);
    console.log("Deleted user with ID:", id);
  };
  const handleConfirmDelete = async () => {
    DeleteCurrency();
    setDeleteOpen(false);
  };
  const DeleteCurrency = async () => {
    try {
      const body = {
        id: currencyInput.id,
      };
      const { endpoint, method } = Config.Currency.deleteCurrency;
      const response = await Apirequest(
        endpoint.replace("{id}", `${currencyInput.id}`),
        method,
        body
      ).then((res) => res.data);
      if (response.statusCode === 200 || response.statusCode === 201) {
        toast.success(response.message);
        setOpen(false);
        setEditFlag(false);
        GetCurrencyList();
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
  const GetCurrencyList = async () => {
    try {
      const { endpoint, method } = Config.Currency;
      const result = await Apirequest(
        endpoint
          .replace("{page}", page.toString())
          .replace("{size}", size.toString())
          .replace("{searchTerm}", search),
        method
      ).then((res) => res.data);
      setCurrencyData(result.data);
      setLoading(false);
      setCount(result.totalCount);
    } catch (err) {
      console.log(err);
      setCurrencyData([]);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  React.useEffect(() => {
    initFlag && search !== "" ? GetCurrencyList() : GetCurrencyList();
  }, [debouncedSearchTerm, page, size]);
  useEffect(() => {
    setInitFlag(true);
  }, []);

  const handleSwitch = (e: React.ChangeEvent<HTMLInputElement>) => {
    let { checked } = e.target;
    checked
      ? setCurrencyInput({ ...currencyInput, isActive: 1 })
      : setCurrencyInput({ ...currencyInput, isActive: 0 });
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
        <Box display={"flex"}>
          <IconBreadcrumbs parent={"Master"} child={"Currency"} path="" />
        </Box>
        <Box display={"flex"} gap={3}>
          <GlobalSearch
            width={300}
            placeholder={"search currency"}
            onChange={handleSearch}
          />
          <Box
            display={"flex"}
            justifyContent={"space-between"}
            alignItems={"center"}
            flexWrap={"wrap"}
            gap={2}
          >
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
            rows={CurrencyData}
            columns={columns}
            paginationMode="server"
            initialState={{
              pagination: {
                paginationModel: {
                  pageSize: 15,
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
      <CreateNewCurrency
        open={open}
        close={handleClose}
        handleChange={handleChange}
        handleSubmit={handleSubmit}
        currencyInput={currencyInput}
        error={error}
        handleSwitch={handleSwitch}
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

export default CurrencyPageTable;
