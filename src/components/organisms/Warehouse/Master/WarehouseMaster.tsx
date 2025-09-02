import * as React from "react";
import Box from "@mui/material/Box";
import Config from "../../../../../src/utils/warehouse.api.json";
import { Apirequest } from "../../../../utils/lib";
import IconBreadcrumbs from "../../../molecules/AdminLayout/BreadCrumbs";
import GlobalSearch from "../../../molecules/AdminLayout/GlobalSearch";
import { GoPlus } from "react-icons/go";
import { FiEdit } from "react-icons/fi";
import { RiDeleteBin6Line } from "react-icons/ri";
import Link from "next/link";
import NoDataFound from "../../../molecules/AdminLayout/NoDataFound";
import DeleteConfirmation from "../../../molecules/Master/DeleteConfirmation";
import { useDebounce } from "../../../../hooks/useDebounceHook";
import { MuiButton, MuiTable } from "bsoft-base-elements";
import { usePrivilegeCheck } from "../../../../hooks/usePrivilegeCheck";
import SkeletonLoader from "../../../molecules/AdminLayout/SkeletonLoader";
import ErrorModal from "../../../molecules/Master/Role/ErrorModal";
import toast from "react-hot-toast";

export default function WarehouseMaster() {
    const [warehouseData, setwarehouseData] = React.useState<any[]>([]);
    const [deleteOpen, setDeleteOpen] = React.useState(false);
    const [id, setId] = React.useState(0);
    const [errorModalOpen, setErrorModalOpen] = React.useState(false);
    const [errorMessages, setErrorMessages] = React.useState<string[]>([]);
    const [page, setPage] = React.useState<number>(1);
    const [size, setSize] = React.useState<number>(15);
    const [count, setCount] = React.useState<number>(0);
    const [search, setSearch] = React.useState<string>("");
    const [loading, setLoading] = React.useState(true);
    const [pathname, setPathName] = React.useState<string>("");
    const permissions = usePrivilegeCheck(pathname);

    React.useEffect(() => {
        const currentPath = window.location.pathname.split("/bsoft").at(-1) || "";
        setPathName(currentPath);
    }, []);

    const columns = [
        {
            field: "s_no",
            headerName: "S.No",
            minWidth: 80,
            flex: 0.5,
            sortable: false,
            renderCell: (params: any) =>
                (page - 1) * size + (params.api.getAllRowIds().indexOf(params.id) + 1),
        },
        {
            field: "warehouseCode",
            headerName: "Warehouse Code",
            minWidth: 160,
            flex: 1.2,
            valueGetter: (_: any, row: any) => row?.warehouseCode ?? "-",
        },
        {
            field: "warehouseName",
            headerName: "Warehouse Name",
            minWidth: 200,
            flex: 1.4,
            valueGetter: (_: any, row: any) => row?.warehouseName ?? "-",
        },
        {
            field: "warehouseTypeName",
            headerName: "Type",
            minWidth: 150,
            flex: 1,
            valueGetter: (_: any, row: any) => row?.warehouseTypeName ?? "-",
        },
        {
            field: "storageTypeName",
            headerName: "Storage",
            minWidth: 140,
            flex: 1,
            valueGetter: (_: any, row: any) => row?.storageTypeName ?? "-",
        },
        {
            field: "operationTypeName",
            headerName: "Operation",
            minWidth: 140,
            flex: 1,
            valueGetter: (_: any, row: any) => row?.operationTypeName ?? "-",
        },
        {
            field: "isDefaultStockEntry",
            headerName: "Default SE",
            minWidth: 120,
            flex: 0.8,
            valueGetter: (_: any, row: any) =>
                row?.isDefaultStockEntry ? "Yes" : "No",
        },
        {
            field: "isActive",
            headerName: "Status",
            minWidth: 120,
            flex: 0.9,
            valueGetter: (_: any, row: any) =>
                Number(row?.isActive) === 1 || row?.isActive === true ? "Active" : "Inactive",
        },

        {
            field: "actions",
            headerName: "Actions",
            flex: 1,
            minWidth: 200,
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
                    <Link href={`/warehouse/warehouse-master/${params.row.id}?edit=true`}>
                        <FiEdit fontSize={20} color="black" cursor={"pointer"} />
                    </Link>
                    <RiDeleteBin6Line
                        fontSize={20}
                        color="red"
                        cursor={"pointer"}
                        onClick={() => handleDelete(params.row.id)}
                    />
                </Box>
            ),
        },

    ];
    const debouncedSearchTerm = useDebounce(search, 500);

    const handleDelete = (id: number) => {
        setId(id);
        setDeleteOpen(true);
    };
    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPage(1);
        setSearch(e.target.value);
    };

    React.useEffect(() => {
        GetWarehouses();
    }, [debouncedSearchTerm, page, size]);

    const GetWarehouses = async () => {
        try {
            setLoading(true);
            const { endpoint, method } = Config.Warehouse.GetWarehouseMaster;
            const url = endpoint
                .replace("{page}", String(page))
                .replace("{size}", String(size))
                .replace("{searchTerm}", encodeURIComponent(debouncedSearchTerm || ""));

            const response = await Apirequest(url, method, null, "warehouse").then(
                (res) => res.data
            );
            const { totalCount = 0, statusCode, data } = response ?? {};
            if (statusCode === 200 || statusCode === 201) {
                setwarehouseData(Array.isArray(data) ? data : []);
                setCount(Number(totalCount) || 0);
            } else {
                setwarehouseData([]);
                setCount(0);
            }
        } catch (err) {
            console.error("GetWarehouses error:", err);
            setwarehouseData([]);
            setCount(0);
        } finally {
            setLoading(false);
        }
    };


    const Deletewarehouse = async () => {
        try {
            const { endpoint, method } = Config.Warehouse.DeleteWarehouseMaster;
            const url = endpoint.replace("{id}", String(id));
            const response = await Apirequest(url, method, null, "warehouse").then(r => r.data);

            if (response.statusCode === 200 || response.statusCode === 201) {
                toast.success(response.message);
                GetWarehouses();
            } else {
                toast.error(response.message);
                if (Array.isArray(response.errors) && response.errors.length > 0) {
                    setErrorModalOpen(true);
                    setErrorMessages(response.errors);
                }
            }
        } catch (err) {
            console.error(err);
            toast.error("Delete failed.");
        }
    };


    const handleConfirmDelete = async () => {
        await Deletewarehouse();
        setDeleteOpen(false);
    };

    return (
        <>
            <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
                <IconBreadcrumbs parent={"Master"} child={"Warehouse"} path="" />
                <Box display="flex" alignItems="center" flexWrap="wrap" gap={2}>
                    <GlobalSearch
                        placeholder="Search warehouse"
                        width={300}
                        onChange={handleSearch}
                    />
                    <Link href="/warehouse/warehouse-master/add-warehouse">
                        <MuiButton startIcon={<GoPlus />} variant="contained">
                            Create
                        </MuiButton>
                    </Link>
                </Box>
            </Box>

            <Box sx={{ width: "100%", my: 2, height: 700 }} className="main-table">
                {loading ? (
                    <SkeletonLoader />
                ) : (
                    <MuiTable
                        rows={warehouseData}
                        columns={columns}
                        paginationMode="server"
                        initialState={{
                            pagination: { paginationModel: { pageSize: size } },
                        }}
                        slots={{ noRowsOverlay: () => <NoDataFound /> }}
                        onPaginationModelChange={(m: any) => {
                            setPage(m.page + 1);
                            setSize(m.pageSize);
                        }}
                        rowCount={count}
                        rowHeight={44}
                        columnHeaderHeight={44}
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
