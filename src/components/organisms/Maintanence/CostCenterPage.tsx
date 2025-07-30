"use client";

import DeleteConfirmation from "../../molecules/Master/DeleteConfirmation";
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
import { CostCenterProps } from "../../../maintanenceTypes";
import { Apirequest } from "../../../utils/lib";
import { useRecoilValue } from "recoil";
import { UserData } from "../../../utils/atoms";
import CreateCostCenter from "../../molecules/Maintanence/CreateCostCenter";
import { useDataFetchHook } from "../../../hooks/useDataFetchHook";
import MainConfig from "../../../utils/main.api.json";
import Config from "../../../utils/config.api.json";
import ConfigMain from "../../../utils/main.api.json";
import FamConfig from "../../../utils/fam.api.json";
import ErrorModal from "../../molecules/Master/Role/ErrorModal";
import SkeletonLoader from "../../molecules/AdminLayout/SkeletonLoader";
import { usePrivilegeCheck } from "../../../hooks/usePrivilegeCheck";
import { GridColDef } from "@mui/x-data-grid";
import toast from "react-hot-toast";
const CostCenterPage = () => {
  const [pathname, setPathName] = useState<string>("");
  const permissions = usePrivilegeCheck(pathname);
  useEffect(() => {
    setInitFlag(true);
    const currentPath = window.location.pathname.split("/bsoft").at(-1) || "";
    setPathName(currentPath);
  }, []);
  const [open, setOpen] = React.useState(false);
  const [page, setPage] = React.useState<number>(1);
  const [size, setSize] = React.useState<number>(15);
  const [error, setError] = React.useState<any[]>([]);
  const [search, setSearch] = React.useState("");
  const [initFlag, setInitFlag] = React.useState(false);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const debouncedSearchTerm = useDebounce(search, 500);
  const [editFlag, setEditFlag] = React.useState(false);
  const [errorModalOpen, setErrorModalOpen] = React.useState(false);
  const [errorMessages, setErrorMessages] = React.useState<string[]>([]);
  const [costCenterData, setCostCenterData] = useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [count, setCount] = React.useState(0);
  const [selectedDepartment, setSelectedDepartment] = useState<any>(null);
  const [responsiblePersonData, setResponsiblePersonData] = React.useState<
    any[]
  >([]);
  const [selectedResponsiblePerson, setSelectedResponsiblePerson] = useState<
    any | null
  >(null);

  const userValue = useRecoilValue(UserData);

  const { data: oldUnit } = useDataFetchHook(
    FamConfig.GetResponsiblePerson.endpoint
      .replace("{OldUnitId}", userValue.oldUnitId?.toString() || "")
      .replace("{SearchEmployee}", ""),
    FamConfig.GetResponsiblePerson.method,
    "fam"
  );

  useEffect(() => {
    if (oldUnit && Array.isArray(oldUnit) && oldUnit.length > 0) {
      setCostCenterInput((prev) => ({
        ...prev,
        oldUnitId: oldUnit[0].oldUnitId ?? prev.oldUnitId,
      }));
      setResponsiblePersonData(
        oldUnit.map((item: any) => ({
          custodianId: item.custodianId,
          custodianName: item.custodianName,
        }))
      );
    } else {
      console.error("Error fetching oldUnit data:", oldUnit);
    }
  }, [oldUnit]);

  const { data: departmentData } = useDataFetchHook(
    Config.Department.withoutControl.endpoint,
    Config.Department.withoutControl.method
  );

  const [costCenterInput, setCostCenterInput] = React.useState<CostCenterProps>(
    {
      costCenterCode: "",
      costCenterName: "",
      unitId: 1,
      departmentId: 0,
      effectiveDate: "",
      responsiblePerson: "",
      budgetAllocated: 0,
      remarks: "",
      id: 0,
      oldUnitId: 0,
      isActive: 1,
    }
  );
  const columns: GridColDef<(typeof costCenterData)[number]>[] = [
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
      field: "costCenterCode",
      headerName: "Cost Center Code",
      flex: 1,
      minWidth: 200,
      valueGetter: (value: any, row: any) =>
        `${row?.costCenterCode.toUpperCase() || ""}`,
    },
    {
      field: "costCenterName",
      headerName: "Cost Center Name",
      flex: 2,
      minWidth: 200,
      valueGetter: (value: any, row: any) =>
        `${row?.costCenterName || ""}`.replace(/\b\w/g, (char) =>
          char.toUpperCase()
        ),
    },
    {
      field: "responsiblePerson",
      headerName: "Responsible Person",
      flex: 2,
      minWidth: 200,
      valueGetter: (value: any, row: any) => `${row?.responsiblePerson || ""}`,
    },
    {
      field: "department",
      headerName: "Department",
      flex: 2,
      minWidth: 200,
      valueGetter: (value: any, row: any) => `${row?.departmentName || ""}`,
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
      field: "effectiveDate",
      headerName: "Effective Date",
      flex: 2,
      minWidth: 200,
      valueGetter: (value: any, row: any) =>
        `${dayjs(row?.effectiveDate).format("DD-MM-YYYY")}`,
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
    setCostCenterInput({
      ...costCenterInput,
      costCenterCode: "",
      costCenterName: "",
      budgetAllocated: 0,
      effectiveDate: "",
      remarks: "",
    });
    setSelectedDepartment(null);
    setSelectedResponsiblePerson(null);
  };
  const handleSwitch = (e: React.ChangeEvent<HTMLInputElement>) => {
    let { checked } = e.target;
    checked
      ? setCostCenterInput({ ...costCenterInput, isActive: 1 })
      : setCostCenterInput({ ...costCenterInput, isActive: 0 });
  };

  const handleDepartmentChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    value: any,
    field: string
  ) => {
    if (field === "deptName") {
      if (!value?.id) {
        setSelectedDepartment(null);
        setCostCenterInput((prev) => ({ ...prev, deptName: 0 }));
      } else {
        setSelectedDepartment(value);
        setCostCenterInput((prev) => ({ ...prev, deptName: value.id }));
      }
    }
  };

  const handleResponsiblePersonChange = (
    e: React.ChangeEvent<HTMLInputElement> | null,
    value: any,
    field: string
  ) => {
    if (field === "ResponsiblePerson") {
      setSelectedResponsiblePerson(value || null);

      setCostCenterInput((prev) => ({
        ...prev,
        responsiblepersonId: value?.custodianId || 0,
      }));
    }
  };
  const AddCostCenter = async () => {
    try {
      const body: any = {
        costCenterCode: costCenterInput.costCenterCode?.trim()?.toUpperCase(),
        costCenterName: costCenterInput.costCenterName
          ?.trim()
          .replace(/\b\w/g, (char) => char.toUpperCase()),
        responsiblePerson:
          selectedResponsiblePerson?.custodianName?.trim() || "",
        effectiveDate: costCenterInput.effectiveDate,
        isActive: costCenterInput.isActive,
        departmentId: selectedDepartment?.id,
        unitId: userValue.unitId,
        remarks: costCenterInput.remarks.trim(),
        budgetAllocated: costCenterInput.budgetAllocated,
      };

      if (editFlag) {
        body.id = Number(costCenterInput.id);
      }
      const { endpoint, method } = ConfigMain.CostCenter.AddCostCenter;
      const response = await Apirequest(endpoint, method, body, "main").then(
        (res) => res.data
      );

      if (response.statusCode === 200 || response.statusCode === 201) {
        toast.success(response.message);
        setOpen(false);
        setEditFlag(false);
        setCostCenterInput({ ...costCenterInput });
        GetCostCenterList();
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

  const UpdateCostCenter = async () => {
    try {
      const body: any = {
        costCenterCode: costCenterInput.costCenterCode?.trim()?.toUpperCase(),
        costCenterName: costCenterInput.costCenterName
          ?.trim()
          .replace(/\b\w/g, (char) => char.toUpperCase()),
        responsiblePerson:
          selectedResponsiblePerson?.custodianName?.trim() || "",
        effectiveDate: costCenterInput.effectiveDate,
        isActive: costCenterInput.isActive,
        departmentId: selectedDepartment?.id,
        unitId: userValue.unitId,
        remarks: costCenterInput.remarks?.trim(),
        id: costCenterInput.id,
        budgetAllocated: costCenterInput.budgetAllocated,
      };
      if (editFlag) {
        body.id = Number(costCenterInput.id);
      }
      const { endpoint, method } = ConfigMain.CostCenter.UpdateCostCenter;
      const response = await Apirequest(endpoint, method, body, "main").then(
        (res) => res.data
      );

      if (response.statusCode === 200 || response.statusCode === 201) {
        toast.success(response.message);
        setOpen(false);
        setEditFlag(false);
        setCostCenterInput({ ...costCenterInput });
        GetCostCenterList();
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
  const handleSubmit = (e: React.MouseEvent<HTMLButtonElement>) => {
    let temp: any = [];

    Object.entries(costCenterInput).map(([key, value]) => {
      if (key === "costCenterCode" && value?.length == 0) {
        temp.push(key);
      } else if (key === "costCenterName" && value?.length == 0) {
        temp.push(key);
      } else if (key === "effectiveDate" && !value) {
        temp.push(key);
      }
    });

    if (selectedDepartment === null) temp.push("departmentId");
    if (selectedResponsiblePerson === null) temp.push("responsiblePerson");

    setError(temp);

    if (temp.length === 0) {
      if (editFlag) {
        UpdateCostCenter();
      } else {
        AddCostCenter();
      }
    } else {
      toast.error("Please fill all required fields");
    }
  };
  const handleEdit = (row: any) => {
    setEditFlag(true);
    setOpen(true);
    setCostCenterInput({
      ...costCenterInput,
      costCenterCode: row.costCenterCode,
      costCenterName: row.costCenterName,
      budgetAllocated: row.budgetAllocated,
      remarks: row.remarks,
      effectiveDate: row.effectiveDate,
      responsiblePerson: row.responsiblePerson,
      id: row.id,
      isActive: row.isActive,
    });
    setSelectedDepartment(
      departmentData.find((item: any) => item.id === row.departmentId)
    );

    GetByCustodian(row.id);
  };

  const GetByCustodian = async (id: number) => {
    if (!id) return;

    try {
      const { endpoint, method } = ConfigMain.CostCenter.CostDetailMaster;
      const response = await Apirequest(
        endpoint.replace("{id}", id.toString()),
        method,
        null,
        "main"
      ).then((res) => res?.data);
      const GetResponsiblePerson = responsiblePersonData.find(
        (item: any) => item?.custodianName === response.data?.responsiblePerson
      );

      setSelectedResponsiblePerson(GetResponsiblePerson);
    } catch (err) {
      console.error("Error fetching custodian data:", err);
    }
  };

  const handleDelete = (id: number) => {
    setCostCenterInput({ ...costCenterInput, id: id });
    setDeleteOpen(true);
  };
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };
  const handleClose = () => {
    setOpen(false);
    setEditFlag(false);
    setError([]);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const filteredValue =
      name === "costCenterCode" ? value.replace(/[^a-zA-Z0-9]/g, "") : value;
    setCostCenterInput({ ...costCenterInput, [name]: filteredValue ?? null });
    setError([]);
  };

  const DeleteCostCenter = async () => {
    try {
      const body = {
        id: costCenterInput.id,
      };
      const { endpoint, method } = ConfigMain.CostCenter.DeleteCostCenter;
      const result = await Apirequest(
        endpoint.replace("{id}", `${costCenterInput.id}`),
        method,
        body,
        "main"
      ).then((res) => res.data);
      toast.success(result?.message);
      GetCostCenterList();
    } catch (err) {
      console.log(err);
    }
  };

  const handleConfirmDelete = async () => {
    DeleteCostCenter();
    setDeleteOpen(false);
  };

  const GetCostCenterList = async () => {
    try {
      setLoading(true);
      const response = await Apirequest(
        MainConfig.CostCenter.GetCostCenter.endpoint
          .replace("{page}", page.toString())
          .replace("{size}", size.toString())
          .replace("{searchTerm}", search),
        MainConfig.CostCenter.GetCostCenter.method,
        null,
        "main"
      ).then((res) => res.data);
      const { totalCount, statusCode, data } = response;
      if (statusCode === 200 || statusCode === 201) {
        setCount(totalCount);
        setCostCenterData(data);
        setLoading(false);
      } else {
        setCount(0);
        setCostCenterData([]);
        setLoading(false);
      }
    } catch (err) {
      setLoading(false);
      console.log(err);
    }
  };
  useEffect(() => {
    initFlag && search !== "" ? GetCostCenterList() : GetCostCenterList();
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
          <IconBreadcrumbs parent="Maintenance" child="Cost Center" path="" />
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
            rows={costCenterData}
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

      <CreateCostCenter
        open={open}
        close={handleClose}
        handleSubmit={handleSubmit}
        handleChange={handleChange}
        error={error}
        costCenterInput={costCenterInput}
        handleSwitch={handleSwitch}
        handleDepartmentChange={handleDepartmentChange}
        selectedDepartment={selectedDepartment}
        departmentData={departmentData}
        handleResponsiblePersonChange={handleResponsiblePersonChange}
        selectedResponsiblePerson={selectedResponsiblePerson}
        responsiblePersonData={responsiblePersonData}
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

export default CostCenterPage;
