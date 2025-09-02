import { Box } from "@mui/material";
import React, { useEffect, useState } from "react";
import IconBreadcrumbs from "../../molecules/AdminLayout/BreadCrumbs";
import GlobalSearch from "../../molecules/AdminLayout/GlobalSearch";
import NoDataFound from "../../molecules/AdminLayout/NoDataFound";
import dayjs, { Dayjs } from "dayjs";
import { FiEdit } from "react-icons/fi";
import { RiDeleteBin6Line } from "react-icons/ri";
import {
  Apirequest,
  isSubmitting,
  startLoading,
  stopLoading,
} from "../../../utils/lib";
import Config from "../../../utils/config.api.json";
import { useDebounce } from "../../../hooks/useDebounceHook";
import { GoPlus } from "react-icons/go";
import CreateNewFinancial from "../../molecules/Master/CreateNewFinancial";
import { FinancialProps } from "../../../types/types";
import DeleteConfirmation from "../../molecules/Master/DeleteConfirmation";
import { MuiButton, MuiTable } from "bsoft-base-elements";
import { usePrivilegeCheck } from "../../../hooks/usePrivilegeCheck";
import ErrorModal from "../../molecules/Master/Role/ErrorModal";
import SkeletonLoader from "../../molecules/AdminLayout/SkeletonLoader";
import toast from "react-hot-toast";

const FinancialyearTable = () => {
  const [financialData, setFinancialData] = useState<any[]>([]);
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
      field: "short_Name",
      headerName: "Short Name",
      flex: 1,
      minWidth: 150,
      valueGetter: (value: any, row: any) =>
        `${dayjs(row?.startDate).format("YYYY")}`,
    },
    {
      field: "Start_Date",
      headerName: "StartDate",
      sortable: true,
      flex: 1,
      valueGetter: (value: any, row: any) =>
        `${dayjs(row?.startDate).format("DD-MM-YYYY")}`,
    },
    {
      field: "End_Date",
      headerName: "End Date",
      sortable: true,
      flex: 1,
      valueGetter: (value: any, row: any) =>
        `${dayjs(row?.endDate).format("DD-MM-YYYY")}`,
    },
    {
      field: "FinYear_Name",
      headerName: "Financial Year",
      flex: 1,
      minWidth: 150,
      valueGetter: (value: any, row: any) =>
        `${dayjs(row?.finYearName).format("YYYY")}`,
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
  const [editFlag, setEditFlag] = React.useState(false);
  const [error, setError] = useState<any>([]);
  const [open, setOpen] = React.useState(false);
  const [count, setCount] = React.useState<number>(0);
  const [page, setPage] = React.useState<number>(1);
  const [size, setSize] = React.useState<number>(15);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = React.useState("");
  const debouncedSearchTerm = useDebounce(search, 500);
  const [initFlag, setInitFlag] = React.useState(false);
  const [errorModalOpen, setErrorModalOpen] = React.useState(false);
  const [errorMessages, setErrorMessages] = React.useState<string[]>([]);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [financialInput, setFinancialInput] = useState<FinancialProps>({
    startYear: "",
    startDate: "",
    endDate: "",
    finYearName: "",
    id: 0,
    isActive: 1,
  });

  const handleClickOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
    setEditFlag(false);
    setFinancialInput({
      startYear: "",
      startDate: "",
      endDate: "",
      finYearName: "",
      id: 0,
      isActive: 1,
    });
    setError([]);
  };
  const handleSwitch = (e: React.ChangeEvent<HTMLInputElement>) => {
    let { checked } = e.target;
    checked
      ? setFinancialInput({ ...financialInput, isActive: 1 })
      : setFinancialInput({ ...financialInput, isActive: 0 });
  };
  const GetFinancialyearList = async () => {
    try {
      const { endpoint, method } = Config.Financial;
      const result = await Apirequest(
        endpoint
          .replace("{page}", page.toString())
          .replace("{size}", size.toString())
          .replace("{searchTerm}", search),
        method
      ).then((res) => res.data);
      setFinancialData(result.data);
      setLoading(false);
      setCount(result.totalCount);
    } catch (err) {
      console.log(err);
      setFinancialData([]);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };
  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    let temp: string[] = [];
    if (isSubmitting()) return;

    Object.entries(financialInput).forEach(([key, value]) => {
      if (key === "startYear" && !value) {
        temp.push(key);
      }
      if (key === "startDate" && !value) {
        temp.push(key);
      }
      if (key === "endDate" && !value) {
        temp.push(key);
      }
      if (key === "finYearName" && !value) {
        temp.push(key);
      }
    });

    setError(temp);

    if (temp.length > 0) {
      toast.error("Please fill all required fields");
      stopLoading();
      return;
    }

    try {
      if (editFlag) {
        await UpdateFinancial();
      } else {
        await AddFinancial();
        setLoading(false);
      }
    } catch (err) {
      console.error("Error in handleSubmit:", err);
    } finally {
      stopLoading();
    }
  };

  const AddFinancial = async () => {
    try {
      startLoading();
      const { endpoint, method } = Config.Financial.addfinancial;
      const response = await Apirequest(endpoint, method, financialInput).then(
        (res) => res.data
      );

      if (response.statusCode === 200 || response.statusCode === 201) {
        toast.success(response.message);
        setOpen(false);
        setFinancialInput({
          startYear: "",
          startDate: "",
          endDate: "",
          finYearName: "",
          id: 0,
          isActive: 1,
        });
        setEditFlag(false);
        GetFinancialyearList();
      } else {
        toast.error(response.message);
        if (Array.isArray(response.errors) && response.errors.length > 0) {
          setErrorModalOpen(true);
          setErrorMessages(response.errors);
        }
      }
    } catch (err) {
      console.log(err);
    } finally {
      stopLoading();
    }
  };
  const UpdateFinancial = async () => {
    try {
      startLoading();
      const { endpoint, method } = Config.Financial.updatefinancial;
      const response = await Apirequest(endpoint, method, financialInput).then(
        (res) => res.data
      );

      if (response.statusCode === 200 || response.statusCode === 201) {
        toast.success(response.message);
        setOpen(false);
        setFinancialInput({
          startYear: "",
          startDate: "",
          endDate: "",
          finYearName: "",
          id: 0,
          isActive: 1,
        });
        setEditFlag(false);
        GetFinancialyearList();
      } else {
        toast.error(response.message);
        if (Array.isArray(response.errors) && response.errors.length > 0) {
          setErrorModalOpen(true);
          setErrorMessages(response.errors);
        }
      }
    } catch (err) {
      console.log(err);
    } finally {
      stopLoading();
    }
  };
  const handleEdit = (row: any) => {
    setEditFlag(true);
    setOpen(true);
    setFinancialInput({
      startYear: row.startYear,
      startDate: row.startDate,
      endDate: row.endDate,
      finYearName: row.finYearName,
      id: row.id,
      isActive: row.isActive,
    });
  };
  const handleDelete = (id: number) => {
    setFinancialInput({ ...financialInput, id: id });
    setDeleteOpen(true);
  };
  const handleConfirmDelete = async () => {
    DeleteFinancial();
    setDeleteOpen(false);
  };
  const DeleteFinancial = async () => {
    try {
      const body = {
        id: financialInput.id,
      };
      const { endpoint, method } = Config.Financial.deletefinancial;
      const response = await Apirequest(
        endpoint.replace("{id}", `${financialInput.id}`),
        method,
        body
      ).then((res) => res.data);

      if (response.statusCode === 200 || response.statusCode === 201) {
        toast.success(response.message);
        setOpen(false);

        setEditFlag(false);
        GetFinancialyearList();
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

  const handleChange = (name: string, newValue: Dayjs | null) => {
    if (name === "startYear" && newValue) {
      const selectedYear = newValue.year();
      setFinancialInput((prev) => ({
        ...prev,
        startYear: selectedYear.toString(),
        finYearName: selectedYear.toString(),
        startDate: dayjs(`${selectedYear}-04-01`).format("YYYY-MM-DD"),
        endDate: dayjs(`${selectedYear + 1}-03-31`).format("YYYY-MM-DD"),
      }));
    } else {
      setFinancialInput((prev) => ({
        ...prev,
        [name]: newValue
          ? newValue.format(name === "finYearName" ? "YYYY" : "YYYY-MM-DD")
          : "",
      }));
    }
    setError([]);
  };
  React.useEffect(() => {
    initFlag && search !== "" ? GetFinancialyearList() : GetFinancialyearList();
  }, [debouncedSearchTerm, page, size]);
  React.useEffect(() => {
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
          <IconBreadcrumbs parent="Master" child="FinancialYear" path="" />
        </Box>
        <Box display={"flex"} gap={3}>
          <GlobalSearch
            width={300}
            placeholder={"search financialyear"}
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
      <Box sx={{ width: "100%", my: 3, height: 700 }} className="main-table">
        {loading ? (
          <SkeletonLoader />
        ) : (
          <MuiTable
            rows={financialData}
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
      <CreateNewFinancial
        open={open}
        close={handleClose}
        financialInput={financialInput}
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
};
export default FinancialyearTable;
