import { Box } from "@mui/material";
import React, { useEffect, useState } from "react";
import IconBreadcrumbs from "../../molecules/AdminLayout/BreadCrumbs";
import GlobalSearch from "../../molecules/AdminLayout/GlobalSearch";
import { GoPlus } from "react-icons/go";
import {
  Apirequest,
  isSubmitting,
  startLoading,
  stopLoading,
} from "../../../utils/lib";
import Config from "../../../utils/config.api.json";
import { FiEdit } from "react-icons/fi";
import { RiDeleteBin6Line } from "react-icons/ri";
import { useDebounce } from "../../../hooks/useDebounceHook";
import CreateNewDivition from "../../molecules/Master/CreateNewDivition";
import { DivisionProps } from "../../../types/types";
import NoDataFound from "../../molecules/AdminLayout/NoDataFound";
import DeleteConfirmation from "../../molecules/Master/DeleteConfirmation";
import { useRecoilValue } from "recoil";
import { UserData } from "../../../utils/atoms";
import { MuiButton, MuiTable } from "bsoft-base-elements";
import { usePrivilegeCheck } from "../../../hooks/usePrivilegeCheck";
import SkeletonLoader from "../../molecules/AdminLayout/SkeletonLoader";
import ErrorModal from "../../molecules/Master/Role/ErrorModal";
import toast from "react-hot-toast";

const DivisionPageTable = () => {
  const [DivisionData, setDivisionData] = useState<any[]>([]);
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
      valueGetter: (value: any, row: any) => `${row?.shortName || ""}`,
    },
    {
      field: "Div_name",
      headerName: "Division Name",
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

  const [open, setOpen] = React.useState(false);
  const userValue = useRecoilValue(UserData);
  const [divisionInput, setDivisionInput] = useState<DivisionProps>({
    shortName: "",
    name: "",
    companyId: 0,
    id: 0,
    isActive: 1,
  });

  const [error, setError] = useState<any>([]);
  const [editFlag, setEditFlag] = React.useState(false);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [initFlag, setInitFlag] = React.useState(false);
  const [loading, setLoading] = useState(true);
  const debouncedSearchTerm = useDebounce(search, 500);
  const [errorModalOpen, setErrorModalOpen] = React.useState(false);
  const [errorMessages, setErrorMessages] = React.useState<string[]>([]);
  const [count, setCount] = React.useState<number>(0);
  const [page, setPage] = React.useState<number>(1);
  const [size, setSize] = React.useState<number>(15);
  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditFlag(false);
    setDivisionInput({
      shortName: "",
      name: "",
      companyId: 0,
      id: 0,
      isActive: 1,
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let { name, value } = e.target;
    setDivisionInput({ ...divisionInput, [name]: value });
    setError([]);
  };

  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    let temp: string[] = [];
    if (isSubmitting()) return;

    Object.entries(divisionInput).forEach(([key, value]) => {
      if (
        key === "shortName" &&
        (!value || typeof value !== "string" || value.trim().length < 2)
      ) {
        temp.push(key);
        console.log("Invalid shortName");
      } else if (
        key === "name" &&
        (!value || typeof value !== "string" || value.trim().length < 4)
      ) {
        temp.push(key);
        console.log("Invalid name");
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
        await Updatedivision();
      } else {
        await AddDivision();
        setLoading(false);
      }
    } catch (err) {
      console.error("Error in handleSubmit:", err);
    } finally {
      stopLoading();
    }
  };

  const AddDivision = async () => {
    try {
      startLoading();
      const body = {
        shortName: divisionInput.shortName
          ?.trim()
          .replace(/\b\w/g, (char) => char.toUpperCase()),
        name: divisionInput.name
          ?.trim()
          .replace(/\b\w/g, (char) => char.toUpperCase()),
        companyId: userValue.companyId,
        isActive: 1,
      };
      const { endpoint, method } = Config.Division.addDivision;
      const response = await Apirequest(endpoint, method, body).then(
        (res) => res.data
      );

      if (response.statusCode === 200 || response.statusCode === 201) {
        toast.success(response.message);
        setOpen(false);
        setDivisionInput({
          shortName: "",
          name: "",
          companyId: 0,
          id: 0,
          isActive: 1,
        });
        setEditFlag(false);
        GetDivisionList();
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

  const Updatedivision = async () => {
    try {
      startLoading();
      const body = {
        shortName: divisionInput.shortName
          ?.trim()
          .replace(/\b\w/g, (char) => char.toUpperCase()),
        name: divisionInput.name
          ?.trim()
          .replace(/\b\w/g, (char) => char.toUpperCase()),
        companyId: userValue.companyId,
        isActive: divisionInput.isActive,
        id: divisionInput.id,
      };
      const { endpoint, method } = Config.Division.updateDivision;
      const response = await Apirequest(endpoint, method, body).then(
        (res) => res.data
      );

      if (response.statusCode === 200 || response.statusCode === 201) {
        toast.success(response.message);
        setOpen(false);
        setDivisionInput({
          shortName: "",
          name: "",
          companyId: 0,
          id: 0,
          isActive: 1,
        });
        setEditFlag(false);
        GetDivisionList();
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
    setDivisionInput({
      shortName: row.shortName,
      name: row.name,
      companyId: row.companyId,
      id: row.id,
      isActive: row?.isActive,
    });
  };

  const handleDelete = (id: number) => {
    setDivisionInput({ ...divisionInput, id: id });
    setDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    DeleteDivision();
    setDeleteOpen(false);
  };

  const DeleteDivision = async () => {
    try {
      const body = {
        id: divisionInput.id,
      };
      const { endpoint, method } = Config.Division.deleteDivision;
      const response = await Apirequest(
        endpoint.replace("{id}", `${divisionInput.id}`),
        method,
        body
      ).then((res) => res.data);

      if (response.statusCode === 200 || response.statusCode === 201) {
        toast.success(response.message);
        setOpen(false);
        setEditFlag(false);
        GetDivisionList();
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

  const GetDivisionList = async () => {
    try {
      const { endpoint, method } = Config.Division;
      const result = await Apirequest(
        endpoint
          .replace("{page}", page.toString())
          .replace("{size}", size.toString())
          .replace("{searchTerm}", search),
        method
      ).then((res) => res.data);
      setDivisionData(result.data);
      setLoading(false);
      setCount(result.totalCount);
    } catch (err) {
      console.log(err);
      setDivisionData([]);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  React.useEffect(() => {
    initFlag && search !== "" ? GetDivisionList() : GetDivisionList();
  }, [debouncedSearchTerm, page, size]);

  useEffect(() => {
    setInitFlag(true);
  }, []);

  const handleSwitch = (e: React.ChangeEvent<HTMLInputElement>) => {
    let { checked } = e.target;
    checked
      ? setDivisionInput({ ...divisionInput, isActive: 1 })
      : setDivisionInput({ ...divisionInput, isActive: 0 });
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
          <IconBreadcrumbs parent={"Master"} child={"Division"} path="" />
        </Box>
        <Box display={"flex"} gap={3}>
          <GlobalSearch
            width={300}
            placeholder={"search division"}
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
            rows={DivisionData}
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
      <CreateNewDivition
        open={open}
        close={handleClose}
        divisionInput={divisionInput}
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

export default DivisionPageTable;
