import React, { useEffect, useState } from "react";
import { Apirequest } from "../../../utils/lib";
import Config from "../../../../src/utils/config.api.json";
import { Box } from "@mui/material";
import dayjs from "dayjs";
import { FiEdit } from "react-icons/fi";
import { RiDeleteBin6Line } from "react-icons/ri";
import IconBreadcrumbs from "../../molecules/AdminLayout/BreadCrumbs";
import { GoPlus } from "react-icons/go";
import CreateNewCountry from "../../molecules/Master/CreateNewCountry";
import { CompanyProps } from "../../../types";
import DeleteConfirmation from "../../molecules/Master/DeleteConfirmation";
import GlobalSearch from "../../molecules/AdminLayout/GlobalSearch";
import { useDebounce } from "../../../hooks/useDebounceHook";
import NoDataFound from "../../molecules/AdminLayout/NoDataFound";
import { MuiButton, MuiTable } from "bsoft-base-elements";
import { usePrivilegeCheck } from "../../../hooks/usePrivilegeCheck";
import ErrorModal from "../../molecules/Master/Role/ErrorModal";
import SkeletonLoader from "../../molecules/AdminLayout/SkeletonLoader";
import toast from "react-hot-toast";

function CountryPageTable() {
  const [countryData, setCountryData] = useState<any[]>([]);
  const [pathname, setPathName] = useState<string>("");
  const permissions = usePrivilegeCheck(pathname);
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
      field: "country_code",
      headerName: "Country Code",
      flex: 1,
      minWidth: 150,
      valueGetter: (value: any, row: any) =>
        `${row?.countryCode.toUpperCase() || ""}`,
    },
    {
      field: "country_name",
      headerName: "Country Name",
      sortable: true,
      flex: 2,
      valueGetter: (value: any, row: any) =>
        `${row?.countryName || ""}`.replace(/\b\w/g, (char) =>
          char.toUpperCase()
        ),
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
      field: "createdAt",
      headerName: "Created Date",
      flex: 2,
      minWidth: 150,
      valueGetter: (value: any, row: any) =>
        `${dayjs(row?.createdAt).format("DD-MM-YYYY")}`,
    },
    {
      field: "createdByName",
      headerName: "Created By",
      sortable: true,
      flex: 2,
      minWidth: 150,
      valueGetter: (value: any, row: any) => `${row?.createdByName ?? ""}`,
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
  const [open, setOpen] = React.useState(false);
  const [countryInput, setCountryInput] = useState<CompanyProps>({
    countryCode: "",
    countryName: "",
    id: 0,
    isActive: 1,
  });
  const [error, setError] = useState<any[]>([]);

  const [page, setPage] = React.useState<number>(1);
  const [size, setSize] = React.useState<number>(15);
  const [count, setCount] = React.useState<number>(0);
  const [editFlag, setEditFlag] = React.useState(false);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [initFlag, setInitFlag] = React.useState(false);
  const debouncedSearchTerm = useDebounce(search, 500);
  const [loading, setLoading] = useState(true);
  const [errorModalOpen, setErrorModalOpen] = React.useState(false);
  const [errorMessages, setErrorMessages] = React.useState<string[]>([]);
  const handleClickOpen = () => {
    setOpen(true);
    setCountryInput({ ...countryInput, countryCode: "", countryName: "" });
  };

  const handleClose = () => {
    setOpen(false);
    setCountryInput({ ...countryInput, countryCode: "", countryName: "" });
    setEditFlag(false);
    setError([]);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let { name, value } = e.target;
    const filteredValue =
      name === "countryCode" ? value.replace(/[^a-zA-Z0-9]/g, "") : value;
    setCountryInput({ ...countryInput, [name]: filteredValue });
    setError([]);
  };

  const handleSwitch = (e: React.ChangeEvent<HTMLInputElement>) => {
    let { checked } = e.target;
    checked
      ? setCountryInput({ ...countryInput, isActive: 1 })
      : setCountryInput({ ...countryInput, isActive: 0 });
  };

  const handleSubmit = (e: React.MouseEvent<HTMLButtonElement>) => {
    let temp: any = [];
    Object.entries(countryInput).map(([key, value]) => {
      if (key === "countryCode" && value?.length <= 2) {
        temp.push(key);
      } else if (key === "countryName" && value?.length < 4) {
        temp.push(key);
      }
    });

    setError(temp);

    if (temp.length === 0 && editFlag) {
      UpdateCountry();
    } else {
      if (temp.length === 0) {
        AddCountry();
        setLoading(false);
      }
    }
  };

  const AddCountry = async () => {
    try {
      const body = {
        ...countryInput,
        countryCode: countryInput.countryCode?.trim().toUpperCase(),
        countryName: countryInput.countryName
          ?.trim()
          .replace(/\b\w/g, (char) => char.toUpperCase()),
      };
      const { endpoint, method } = Config.Countries.addCountry;
      const response = await Apirequest(endpoint, method, body).then(
        (res) => res.data
      );

      if (response.statusCode === 200 || response.statusCode === 201) {
        toast.success(response.message);
        setOpen(false);
        setEditFlag(false);
        GetCountryList();
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

  const UpdateCountry = async () => {
    try {
      const body = {
        ...countryInput,
        countryCode: countryInput.countryCode?.trim().toUpperCase(),
        countryName: countryInput.countryName
          ?.trim()
          .replace(/\b\w/g, (char) => char.toUpperCase()),
        id: countryInput.id,
        isActive: countryInput.isActive,
      };
      const { endpoint, method } = Config.Countries.updateCountry;
      const response = await Apirequest(endpoint, method, body).then(
        (res) => res.data
      );

      if (response.statusCode === 200 || response.statusCode === 201) {
        toast.success(response.message);
        setOpen(false);
        setEditFlag(false);
        GetCountryList();
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

  const handleEdit = (row: any) => {
    setEditFlag(true);
    setOpen(true);
    setCountryInput({
      countryCode: row?.countryCode,
      countryName: row?.countryName,
      id: row?.id,
      isActive: row?.isActive,
    });
  };

  const handleDelete = (id: number) => {
    setCountryInput({ ...countryInput, id: id });
    setDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    DeleteCountry();
    setDeleteOpen(false);
  };

  const DeleteCountry = async () => {
    try {
      const body = {
        id: countryInput.id,
      };
      const { endpoint, method } = Config.Countries.deleteCountry;
      const response = await Apirequest(
        endpoint.replace("{id}", `${countryInput.id}`),
        method,
        body
      ).then((res) => res.data);

      if (response.statusCode === 200 || response.statusCode === 201) {
        toast.success(response.message);
        setOpen(false);
        setEditFlag(false);
        GetCountryList();
      } else {
        toast.error(response.message);
        setErrorMessages(response.errors);
      }
    } catch (err) {
      console.log(err);
      GetCountryList();
    }
  };

  const GetCountryList = async () => {
    try {
      const { endpoint, method } = Config.Countries;
      const result = await Apirequest(
        endpoint
          .replace("{page}", page.toString())
          .replace("{size}", size.toString())
          .replace("{searchTerm}", search),
        method
      ).then((res) => res.data);
      setLoading(false);
      setCountryData(result.data);
      setCount(result.totalCount);
    } catch (err) {
      console.log(err);
      setLoading(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  React.useEffect(() => {
    initFlag && search !== "" ? GetCountryList() : GetCountryList();
  }, [debouncedSearchTerm, page, size]);

  useEffect(() => {
    setInitFlag(true);
    const currentPath = window.location.pathname.split("/bsoft").at(-1) || "";
    setPathName(currentPath);
  }, []);

  return (
    <>
      <Box
        display={"flex"}
        justifyContent={"space-between"}
        alignItems={"center"}
        flexWrap={"wrap"}
        gap={2}
        position={"relative"}
        zIndex={6}
      >
        <Box>
          <IconBreadcrumbs parent={"Master"} child={"Country"} path="" />
        </Box>
        <Box
          display={"flex"}
          justifyContent={"space-between"}
          alignItems={"center"}
          flexWrap={"wrap"}
          gap={2}
        >
          <GlobalSearch
            placeholder="search country"
            width={300}
            onChange={handleSearch}
          />
          <Box className="d-flex-center" gap={2}>
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

      <Box
        sx={{ width: "100%", my: 2, height: 700 }}
        className="main-table content-wrapper"
      >
        {loading ? (
          <SkeletonLoader />
        ) : (
          <MuiTable
            rows={countryData}
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
            columnHeaderHeight={40}
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
      <CreateNewCountry
        open={open}
        close={handleClose}
        countryInput={countryInput}
        handleSubmit={handleSubmit}
        handleChange={handleChange}
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
}

export default CountryPageTable;
