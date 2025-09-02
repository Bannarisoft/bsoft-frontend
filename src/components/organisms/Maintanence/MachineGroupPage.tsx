"use client";
import { Box } from "@mui/material";
import React, { useEffect, useState } from "react";
import IconBreadcrumbs from "../../molecules/AdminLayout/BreadCrumbs";
import GlobalSearch from "../../molecules/AdminLayout/GlobalSearch";
import { MuiButton, MuiTable } from "bsoft-base-elements";
import { GoPlus } from "react-icons/go";
import Config from "../../../utils/config.api.json";
import FamConfig from "../../../utils/fam.api.json";
import MainConfig from "../../../utils/main.api.json";
import NoDataFound from "../../molecules/AdminLayout/NoDataFound";
import dayjs from "dayjs";
import { FiEdit } from "react-icons/fi";
import { RiDeleteBin6Line } from "react-icons/ri";
import { machinegroupsProps } from "../../../types/maintanenceTypes";
import DeleteConfirmation from "../../molecules/Master/DeleteConfirmation";
import {
  Apirequest,
  isSubmitting,
  startLoading,
  stopLoading,
} from "../../../utils/lib";
import { useDebounce } from "../../../hooks/useDebounceHook";
import CreateMachineGroup from "../../molecules/Maintanence/CreateMachineGroup";
import { useDataFetchHook } from "../../../hooks/useDataFetchHook";
import SkeletonLoader from "../../molecules/AdminLayout/SkeletonLoader";
import ErrorModal from "../../molecules/Master/Role/ErrorModal";
import { usePrivilegeCheck } from "../../../hooks/usePrivilegeCheck";
import { useRecoilValue } from "recoil";
import { UserData } from "../../../utils/atoms";
import toast from "react-hot-toast";

function MachineGroupPage() {
  const [pathname, setPathName] = useState<string>("");
  const permissions = usePrivilegeCheck(pathname);
  useEffect(() => {
    setInitFlag(true);
    const currentPath = window.location.pathname.split("/bsoft").at(-1) || "";
    setPathName(currentPath);
  }, []);
  const [open, setOpen] = React.useState(false);
  const [machinegroupData, setMachinegroupData] = React.useState<any[]>([]);
  const [page, setPage] = React.useState<number>(1);
  const [size, setSize] = React.useState<number>(15);
  const [search, setSearch] = React.useState("");
  const [initFlag, setInitFlag] = React.useState(false);
  const [error, setError] = React.useState<any[]>([]);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const debouncedSearchTerm = useDebounce(search, 500);
  const [selectedManufacturer, setSelectedManufacturer] = useState<any>(null);
  const [manufactureData, setManufactureData] = React.useState<any>(null);
  const [errorModalOpen, setErrorModalOpen] = React.useState(false);
  const [errorMessages, setErrorMessages] = React.useState<string[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<any>(null);
  const [loading, setLoading] = React.useState(false);
  const [count, setCount] = React.useState(0);
  const userValue = useRecoilValue(UserData);

  const [machinegroupInput, setMachinegroupInput] =
    React.useState<machinegroupsProps>({
      id: 0,
      groupName: "",
      ManufactureId: 0,
      isActive: 1,
      departmentId: 0,
      powerSource: 1,
    });
  const [editFlag, setEditFlag] = React.useState(false);

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
      field: "groupName",
      headerName: "Group Name",
      flex: 2,
      minWidth: 200,
      valueGetter: (value: any, row: any) =>
        `${row?.groupName || ""}`.replace(/\b\w/g, (char) =>
          char.toUpperCase()
        ),
    },
    {
      field: "department",
      headerName: "Department",
      flex: 2,
      minWidth: 200,
      valueGetter: (value: any, row: any) => `${row?.departmentName || ""}`,
    },
    {
      field: "unit",
      headerName: "Unit",
      flex: 2,
      minWidth: 200,
      valueGetter: (value: any, row: any) => `${row?.unitName || ""}`,
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
    setMachinegroupInput({
      ...machinegroupInput,
      groupName: "",
      isActive: 1,
      powerSource: 1,
    });
    setError([]);
    setSelectedManufacturer(null);
    selectedDepartment && setSelectedDepartment(null);
  };
  const handleClose = () => {
    setOpen(false);
    setMachinegroupInput({ ...machinegroupInput, groupName: "" });
    setEditFlag(false);
    setError([]);
    setSelectedManufacturer(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let { name, value } = e.target;
    setMachinegroupInput({ ...machinegroupInput, [name]: value });
    setError([]);
  };

  const AddMaintanence = async () => {
    try {
      startLoading();
      const body: any = {
        groupName: machinegroupInput.groupName
          ?.trim()
          .replace(/\b\w/g, (char) => char.toUpperCase()),
        manufacturer: selectedManufacturer.id,
        departmentId: selectedDepartment.id,
        unitId: userValue.unitId,
        powerSource: machinegroupInput.powerSource,
      };

      if (editFlag) {
        body.id = Number(machinegroupInput.id);
      }
      const { endpoint, method } = MainConfig.MachineGroup.AddMachineGroup;
      const response = await Apirequest(endpoint, method, body, "main").then(
        (res) => res.data
      );

      if (response.statusCode === 201) {
        toast.success(response.message);
        setOpen(false);
        setMachinegroupInput({ ...machinegroupInput });
        setEditFlag(false);
        GetMachineGroupList();
      } else {
        toast.error(response.message);
        if (Array.isArray(response.errors) && response.errors.length > 0) {
          setErrorModalOpen(true);
          setErrorMessages(response.errors);
        }
      }

      // GetMachineGroupList();
    } catch (err) {
      console.log(err);
      stopLoading();
    }
  };

  const UpdateMaintanence = async () => {
    try {
      startLoading();
      const body: any = {
        groupName: machinegroupInput.groupName
          ?.trim()
          .replace(/\b\w/g, (char) => char.toUpperCase()),
        manufacturer: selectedManufacturer.id,
        departmentId: selectedDepartment.id,
        id: machinegroupInput.id,
        unitId: userValue.unitId,
        isActive: machinegroupInput.isActive,
        powerSource: machinegroupInput.powerSource,
      };

      const { endpoint, method } = MainConfig.MachineGroup.UpdateMachineGroup;
      const response = await Apirequest(endpoint, method, body, "main").then(
        (res) => res.data
      );
      if (response.statusCode === 200 || response.statusCode === 201) {
        toast.success(response.message);
        setOpen(false);
        setEditFlag(false);
        setMachinegroupInput({ ...machinegroupInput });
        GetMachineGroupList();
      } else {
        toast.error(response.message);
        if (Array.isArray(response.errors) && response.errors.length > 0) {
          setErrorModalOpen(true);
          setErrorMessages(response.errors);
        }
      }
    } catch (err) {
      console.log(err);
      startLoading();
    }
  };
  const handleSwitch = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: "isActive" | "powerSource"
  ) => {
    const { checked } = e.target;

    if (field === "isActive") {
      setMachinegroupInput({
        ...machinegroupInput,
        isActive: checked ? 1 : 0,
      });
    } else if (field === "powerSource") {
      setMachinegroupInput({
        ...machinegroupInput,
        powerSource: checked ? 1 : 0,
      });
    }
  };
  const DeleteMaintanence = async () => {
    try {
      const body = {
        id: machinegroupInput.id,
      };
      const { endpoint, method } = MainConfig.MachineGroup.DeleteMachineGroup;
      const result = await Apirequest(
        endpoint.replace("{id}", `${machinegroupInput.id}`),
        method,
        body,
        "main"
      ).then((res) => res.data);
      toast.success(result?.message);
      GetMachineGroupList();
    } catch (err) {
      console.log(err);
    }
  };
  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (isSubmitting()) return;

    let temp: string[] = [];

    // Validation
    Object.entries(machinegroupInput).forEach(([key, value]) => {
      if (
        key === "groupName" &&
        (!value || value?.toString().trim().length === 0)
      ) {
        temp.push(key);
      }
    });

    if (!selectedManufacturer) temp.push("manufacturer");
    if (!selectedDepartment) temp.push("departmentId");

    setError(temp);

    if (temp.length > 0) return;

    try {
      startLoading();

      if (editFlag) {
        await UpdateMaintanence();
      } else {
        await AddMaintanence();
      }
      setMachinegroupInput({ ...machinegroupInput, groupName: "" });
      setSelectedManufacturer(null);
      setSelectedDepartment(null);
    } catch (err: any) {
      console.error("API Error:", err);
    } finally {
      stopLoading();
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };
  const handleEdit = (row: any) => {
    setEditFlag(true);
    setOpen(true);
    setMachinegroupInput({
      groupName: row?.groupName,
      ManufactureId: row?.manufacturer,
      id: row?.id,
      isActive: row?.isActive,
      departmentId: row?.departmentId,
      powerSource: row?.powerSource,
    });
    manufactureData?.map((item: any) => {
      if (item.id === row?.manufacturer) {
        setSelectedManufacturer(item);
      }
    });
    departmentData?.map((item: any) => {
      if (item.id === row?.departmentId) {
        setSelectedDepartment(item);
      }
    });
  };
  const handleConfirmDelete = async () => {
    DeleteMaintanence();
    setDeleteOpen(false);
  };

  const handleDelete = (id: number) => {
    setMachinegroupInput({ ...machinegroupInput, id: id });
    setDeleteOpen(true);
  };

  const { data: manufacturerData, loading: manufacturerLoading } =
    useDataFetchHook(
      FamConfig.Manufacturer.ManufacturerName.endpoint,
      FamConfig.Manufacturer.ManufacturerName.method,
      "fam"
    );
  useEffect(() => {
    if (manufacturerData || departmentData) {
      setMachinegroupInput((prev) => ({
        ...prev,
        manufacturerData,
        departmentData,
      }));
    }
  }, [manufacturerData]);
  const GetManufacturerType = async () => {
    try {
      const { endpoint, method } = FamConfig.Manufacturer.ManufacturerName;
      const result = await Apirequest(endpoint, method, null, "fam").then(
        (res) => res.data
      );
      setManufactureData(result.data);
    } catch (err) {
      console.log(err);
      setManufactureData([]);
    }
  };

  const handleManufactureChange = (
    e: React.ChangeEvent<HTMLInputElement> | null,
    value: any,
    field: string
  ) => {
    if (field === "manufacturer") {
      if (!value?.id) {
        setSelectedManufacturer(null);
        setMachinegroupInput((prev) => ({ ...prev, manufactureName: 0 }));
      } else {
        setSelectedManufacturer(value);
        setMachinegroupInput((prev) => ({
          ...prev,
          manufactureName: value.id,
        }));
      }
    }
  };

  useEffect(() => {
    GetManufacturerType();
  }, []);

  const { data: departmentData } = useDataFetchHook(
    Config.Department.getGroupName.endpoint.replace("{name}", "production"),
    Config.Department.getGroupName.method
  );

  const handleDepartmentChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    value: any,
    field: string
  ) => {
    if (field === "deptName") {
      if (!value?.id) {
        setSelectedDepartment(null);
        setMachinegroupInput((prev) => ({ ...prev, deptName: 0 }));
      } else {
        setSelectedDepartment(value);
        setMachinegroupInput((prev) => ({ ...prev, deptName: value.id }));
      }
    }
  };

  const GetMachineGroupList = async () => {
    try {
      const response = await Apirequest(
        MainConfig.MachineGroup.GetMachineGroup.endpoint
          .replace("{page}", page.toString())
          .replace("{size}", size.toString())
          .replace("{searchTerm}", search),
        MainConfig.MachineGroup.GetMachineGroup.method,
        null,
        "main"
      ).then((res) => res.data);
      const { totalCount, statusCode, data } = response;
      if (statusCode === 200 || statusCode === 201) {
        setCount(totalCount);
        setMachinegroupData(data);
        setLoading(false);
      } else {
        setCount(0);
        setMachinegroupData([]);
        setLoading(false);
      }
    } catch (err) {
      setLoading(false);
      console.log(err);
    }
  };

  React.useEffect(() => {
    initFlag && search !== "" ? GetMachineGroupList() : GetMachineGroupList();
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
          <IconBreadcrumbs
            parent="Maintenance"
            child=" Machine Group"
            path=""
          />
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
            rows={machinegroupData}
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

      <CreateMachineGroup
        open={open}
        close={handleClose}
        handleSubmit={handleSubmit}
        machinegroupInput={machinegroupInput}
        handleChange={handleChange}
        error={error}
        handleSwitch={handleSwitch}
        manufactureData={manufactureData}
        selectedmanufacture={selectedManufacturer}
        handleManufactureChange={handleManufactureChange}
        handleDepartmentChange={handleDepartmentChange}
        selectedDepartment={selectedDepartment}
        departmentData={departmentData}
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

export default MachineGroupPage;
