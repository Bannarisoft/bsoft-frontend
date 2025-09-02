import * as React from "react";
import Box from "@mui/material/Box";
import Config from "../../../../src/utils/config.api.json";
import { Apirequest } from "../../../utils/lib";
import IconBreadcrumbs from "../../molecules/AdminLayout/BreadCrumbs";
import GlobalSearch from "../../molecules/AdminLayout/GlobalSearch";
import { GoPlus } from "react-icons/go";
import { FiEdit } from "react-icons/fi";
import { RiDeleteBin6Line } from "react-icons/ri";
import Link from "next/link";
import NoDataFound from "../../molecules/AdminLayout/NoDataFound";
import DeleteConfirmation from "../../molecules/Master/DeleteConfirmation";
import { useDebounce } from "../../../hooks/useDebounceHook";
import { MuiButton, MuiTable } from "bsoft-base-elements";
import { usePrivilegeCheck } from "../../../hooks/usePrivilegeCheck";
import SkeletonLoader from "../../molecules/AdminLayout/SkeletonLoader";
import ErrorModal from "../../molecules/Master/Role/ErrorModal";
import toast from "react-hot-toast";

export default function CompanyPageTable() {
  const [companyData, setCompanyData] = React.useState([]);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [id, setId] = React.useState(0);
  const [errorModalOpen, setErrorModalOpen] = React.useState(false);
  const [errorMessages, setErrorMessages] = React.useState<string[]>([]);
  const [page, setPage] = React.useState<number>(1);
  const [size, setSize] = React.useState<number>(15);
  const [count, setCount] = React.useState<number>(0);
  const [search, setSearch] = React.useState<string>("");
  const debouncedSearchTerm = useDebounce(search, 500);
  const [initFlag, setInitFlag] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [pathname, setPathName] = React.useState<string>("");
  const permissions = usePrivilegeCheck(pathname);

  React.useEffect(() => {
    setInitFlag(true);
    const currentPath = window.location.pathname.split("/bsoft").at(-1) || "";
    setPathName(currentPath);
  }, []);

  const columns = [
    {
      field: "s_no",
      headerName: "S.No",
      flex: 1,
      minWidth: 150,
      sortable: false,
      renderCell: (params: any) => {
        return (
          (page - 1) * size + (params.api.getAllRowIds().indexOf(params.id) + 1)
        );
      },
    },
    {
      field: "companyName",
      headerName: "Company name",
      flex: 2,
      minWidth: 150,
      valueGetter: (value: any, row: any) => `${row?.companyName || ""}`,
    },
    {
      field: "gstNumber",
      headerName: "GST",
      flex: 1,
      minWidth: 150,
      valueGetter: (value: any, row: any) => `${row?.gstNumber || ""}`,
    },
    {
      field: "yearOfEstablishment",
      headerName: "Established Year",
      flex: 1,
      minWidth: 150,
      valueGetter: (value: any, row: any) =>
        `${row?.yearOfEstablishment || ""}`,
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
          alignItems={"baseline"}
          gap={2}
          height={"100%"}
        >
          {permissions.canUpdate && (
            <Link href={`/master/company/${params.row.id}?edit=true`}>
              <FiEdit fontSize={20} color="black" cursor={"pointer"} />
            </Link>
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

  const handleDelete = (id: number) => {
    setId(id);
    setDeleteOpen(true);
  };

  React.useEffect(() => {
    initFlag && search !== "" ? GetCompaniesList() : GetCompaniesList();
  }, [debouncedSearchTerm, page, size]);

  const GetCompaniesList = async () => {
    try {
      const { endpoint, method } = Config.Company;
      const result = await Apirequest(
        endpoint
          .replace("{page}", page.toString())
          .replace("{size}", size.toString())
          .replace("{searchTerm}", search),
        method
      ).then((res) => res.data);
      setCompanyData(result.data);
      setCount(result.totalCount);
      setLoading(false);
    } catch (err) {
      console.log(err);
      setCompanyData([]);
    }
  };

  const DeleteCompany = async () => {
    try {
      const body = {
        id: id,
      };
      const { endpoint, method } = Config.Company.DeleteCompany;
      const response = await Apirequest(
        endpoint.replace("{id}", id.toString()),
        method,
        body
      ).then((res) => res.data);

      if (response.statusCode === 200 || response.statusCode === 201) {
        toast.success(response.message);
        GetCompaniesList();
      } else {
        toast.error(response.message);
        if (Array.isArray(response.errors) && response.errors.length > 0) {
          setErrorModalOpen(true);
          setErrorMessages(response.errors);
        }
      }
      GetCompaniesList();
    } catch (err) {
      console.log(err);
    }
  };

  const handleConfirmDelete = async () => {
    DeleteCompany();
    setDeleteOpen(false);
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
          <IconBreadcrumbs parent={"Master"} child={"Company"} path="" />
        </Box>
        <Box
          display={"flex"}
          justifyContent={"space-between"}
          alignItems={"center"}
          flexWrap={"wrap"}
          gap={2}
        >
          <GlobalSearch
            placeholder="search company"
            width={300}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setSearch(e.target.value)
            }
          />
          <Box className="d-flex-center" gap={2}>
            {permissions.canAdd && (
              <Link href={"/master/company/add-company"}>
                <MuiButton
                  startIcon={<GoPlus />}
                  onClick={() => { }}
                  variant="contained"
                >
                  Create
                </MuiButton>
              </Link>
            )}
          </Box>
        </Box>
      </Box>
      <Box sx={{ width: "100%", my: 2, height: 700 }} className="main-table">
        {loading ? (
          <SkeletonLoader />
        ) : (
          <MuiTable
            rows={companyData}
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
