import { Box } from "@mui/material";
import React, { useEffect, useState } from "react";
import IconBreadcrumbs from "../../molecules/AdminLayout/BreadCrumbs";
import GlobalSearch from "../../molecules/AdminLayout/GlobalSearch";
import ButtonComponent from "../../atoms/Button";
import { GoPlus } from "react-icons/go";
import { FiEdit } from "react-icons/fi";
import { RiDeleteBin6Line } from "react-icons/ri";
import { DataGrid } from "@mui/x-data-grid";
import NoDataFound from "../../molecules/AdminLayout/NoDataFound";
import {
  Apirequest,
  emailRegex,
  isSubmitting,
  startLoading,
  stopLoading,
} from "../../../utils/lib";
import Config from "../../../../src/utils/config.api.json";
import { useDebounce } from "../../../hooks/useDebounceHook";
import { UserInputTypes } from "../../../types/types";
import { useRecoilValue } from "recoil";
import { UserData } from "../../../utils/atoms";
import DeleteConfirmation from "../../molecules/Master/DeleteConfirmation";
import CreateUser from "../../molecules/Master/CreateUser";
import { usePrivilegeCheck } from "../../../hooks/usePrivilegeCheck";
import ErrorModal from "../../molecules/Master/Role/ErrorModal";
import { useDataFetchHook } from "../../../hooks/useDataFetchHook";
import SkeletonLoader from "../../molecules/AdminLayout/SkeletonLoader";
import toast from "react-hot-toast";

function UserPageList() {
  const [pathname, setPathName] = useState<string>("");
  const permissions = usePrivilegeCheck(pathname);

  useEffect(() => {
    setInitFlag(true);
    const currentPath = window.location.pathname.split("/bsoft").at(-1) || "";
    setPathName(currentPath);
  }, []);

  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [errorMessages, setErrorMessages] = useState<string[]>([]);
  const userValue = useRecoilValue(UserData);
  useEffect(() => {
    if (userValue) {
      setUserInput((prevState) => ({
        ...prevState,

        companyId:
          typeof userValue.companyId === "string" &&
          (userValue.companyId.startsWith("{") ||
            userValue.companyId.startsWith("["))
            ? JSON.parse(userValue.companyId)?.[0]?.companyId ??
              prevState.companyId
            : userValue.companyId ?? prevState.companyId,

        divisionId:
          typeof userValue.divisionId === "string" &&
          (userValue.divisionId.startsWith("{") ||
            userValue.divisionId.startsWith("["))
            ? JSON.parse(userValue.divisionId)?.[0]?.divisionId ??
              prevState.divisionId
            : userValue.divisionId ?? prevState.divisionId,

        unitId:
          typeof userValue.unitId === "string" &&
          (userValue.unitId.startsWith("{") || userValue.unitId.startsWith("["))
            ? JSON.parse(userValue.unitId)?.[0]?.unitId ?? prevState.unitId
            : userValue.unitId ?? prevState.unitId,
      }));
    }
  }, [userValue]);

  const [userInput, setUserInput] = useState<UserInputTypes>({
    firstName: "",
    lastName: "",
    userName: "",
    password: "",
    mobile: "",
    emailId: "",
    userGroupId: 0,
    divisionId: 0,
    companyId: 0,
    userRoleId: [],
    departmentId: [],
    company: [],
    entity: "",
    unitId: 0,
    id: 0,
    isActive: 1,
    userId: 0,
  });

  const [loading, setLoading] = useState(true);
  const [page, setPage] = React.useState<number>(1);
  const [size, setSize] = React.useState<number>(15);
  const [count, setCount] = React.useState<number>(0);
  const [search, setSearch] = React.useState("");
  const [initFlag, setInitFlag] = React.useState(false);
  const debouncedSearchTerm = useDebounce(search, 500);
  const [editFlag, setEditFlag] = React.useState(false);
  const [error, setError] = useState<any[]>([]);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [unitByCompanyData, setUnitByCompanyData] = React.useState([]);
  const [departmentData, setDepartmentData] = React.useState([]);
  const { groupCode } = userValue;
  const isAdmin =
    groupCode === "ADMIN" || groupCode === "SUPER_ADMIN" ? true : false;
  const [userData, setUserData] = useState<any[]>([]);
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
      field: "Name",
      headerName: "Name",
      flex: 2,
      minWidth: 150,
      valueGetter: (value: any, row: any) =>
        `${row?.firstName} ${row?.lastName} `,
    },
    {
      field: "User_Name",
      headerName: "User Name",
      flex: 2,
      minWidth: 150,
      valueGetter: (value: any, row: any) =>
        `${row?.userName || ""}`.replace(/\b\w/g, (char) => char.toUpperCase()),
    },

    {
      field: "Mobile",
      headerName: "Mobile Number ",
      sortable: true,
      flex: 1,
      minWidth: 200,
      valueGetter: (value: any, row: any) => `${row?.mobile || ""}`,
    },
    {
      field: "EmailId",
      headerName: "Email_Id ",
      sortable: true,
      minWidth: 200,
      flex: 1,
      valueGetter: (value: any, row: any) => `${row?.emailId || ""}`,
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
              onClick={() => handleDelete(params.row)}
            />
          )}
        </Box>
      ),
    },
  ];
  const [open, setOpen] = React.useState(false);
  const [userRoleData, setUserRoleData] = React.useState([]);
  const [userGroupData, setUserGroupData] = React.useState([]);
  const [selectedUnit, setSelectedUnit] = useState<any[]>([]);
  const [selecteduserGroup, setSelectedUserGroup] = useState<any>(null);
  const [selectedUserRoleId, setSelectedUserRoleId] = useState<any[]>([]);
  const [selectedUserDepartmentId, setSelectedUserDepartmentId] = useState<
    any[]
  >([]);
  const [selectedCompany, setSelectedCompany] = useState<any>(null);
  const [selectedEntity, setSelectedEntity] = useState<any>(null);

  const handleClickOpen = () => {
    setOpen(true);
    setEditFlag(false);
    setError([]);
    setSelectedUserRoleId([]);
    setSelectedUserDepartmentId([]);
    setSelectedUserGroup(null);
    setSelectedEntity(null);
    setUserInput({
      firstName: "",
      lastName: "",
      userName: "",
      password: "",
      mobile: "",
      emailId: "",
      userGroupId: 0,
      divisionId: 0,
      companyId: 0,
      userRoleId: [],
      departmentId: [],
      company: [],
      entity: "",
      unitId: 0,
      id: 0,
      isActive: 1,
      userId: 0,
    });
    setSelectedUnit([]);
    setSelectedCompany([]);
  };
  const handleClose = () => {
    setOpen(false);
    setEditFlag(false);
    setError([]);
    setSelectedUserRoleId([]);
    setSelectedUserDepartmentId([]);
    setSelectedUserGroup(null);
    setUserInput({
      firstName: "",
      lastName: "",
      userName: "",
      password: "",
      mobile: "",
      emailId: "",
      userGroupId: 0,
      divisionId: 0,
      companyId: 0,
      userRoleId: [],
      departmentId: [],
      company: [],
      entity: "",
      unitId: 0,
      id: 0,
      isActive: 1,
      userId: 0,
    });
    setSelectedUnit([]);
    setSelectedCompany([]);
  };
  const handleEdit = (row: any) => {
    setEditFlag(true);
    setOpen(true);
    GetOverallUserList(row.userId);
  };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let { name, value } = e.target;
    setUserInput({ ...userInput, [name]: value });
    setError([]);
  };
  const GetUserList = async () => {
    try {
      const { endpoint, method } = Config.User;
      const result = await Apirequest(
        endpoint
          .replace("{page}", page.toString())
          .replace("{size}", size.toString())
          .replace("{searchTerm}", search),
        method
      ).then((res) => res.data);
      setLoading(false);
      setUserData(result.data);
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
    initFlag && search !== "" ? GetUserList() : GetUserList();
  }, [debouncedSearchTerm, page, size]);

  useEffect(() => {
    setInitFlag(true);
  }, []);

  const handleSwitch = (e: React.ChangeEvent<HTMLInputElement>) => {
    let { checked } = e.target;
    checked
      ? setUserInput({ ...userInput, isActive: 1 })
      : setUserInput({ ...userInput, isActive: 0 });
  };

  const GetUserRole = async () => {
    try {
      const { endpoint, method } = Config.Role.getRole;
      const result = await Apirequest(endpoint, method).then((res) => res.data);
      setUserRoleData(result.data);
    } catch (err) {
      console.log(err);
      setUserRoleData([]);
    }
  };

  const GetGroup = async () => {
    try {
      const { endpoint, method } = Config.UserGroup;
      const result = await Apirequest(endpoint, method).then((res) => res.data);
      setUserGroupData(result.data);
    } catch (err) {
      console.log(err);
      setUserGroupData([]);
    }
  };
  const GetDepartment = async () => {
    try {
      const { endpoint, method } = Config.Department.getDepartment;
      const result = await Apirequest(endpoint, method).then((res) => res.data);
      setDepartmentData(result.data);
    } catch (err) {
      console.log(err);
      setDepartmentData([]);
    }
  };

  const { data: companyData } = useDataFetchHook(
    Config.Company.GetAllCompany.endpoint,
    Config.Company.GetAllCompany.method
  );

  const { data: entityData } = useDataFetchHook(
    Config.Entities.getEntity.endpoint,
    Config.Entities.getEntity.method
  );

  useEffect(() => {
    GetUserRole();
    GetDepartment();
    GetGroup();
    setInitFlag(true);
  }, []);

  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    const validationRules: {
      [key in keyof UserInputTypes]: (value: any) => boolean;
    } = {
      firstName: (value: string) => value.trim().length > 3,
      lastName: (value: string | number | any[]) =>
        typeof value === "string" ? value.trim().length > 3 : false,
      userName: (value: string) => value.trim().length > 3,
      password: (value: string) => editFlag || value.trim().length > 0,
      mobile: (value: string) => value.trim().length === 10,
      emailId: (value: string) => emailRegex.test(value),
      userRoleId: (value: any[]) => Array.isArray(value) && value.length > 0,
      isActive: (value: number) => true,
      divisionId: (value: number) => true,
      companyId: (value: number) => true,
      unitId: (value: number) => true,
      id: (value: number) => true,
      userId: (value: number) => true,
      userGroupId: (value: number) =>
        value !== null && value !== undefined && value > 0,
      company: (value: any[]) => true,
      entity: (value: string) => true,
    };

    let tempErrors: string[] = [];
    if (isSubmitting()) return;
    startLoading();

    Object.entries(userInput).forEach(([key, value]) => {
      const validationRule = validationRules[key as keyof UserInputTypes];
      if (validationRule && !validationRule(value)) {
        tempErrors.push(key);
      }
    });

    if (!isAdmin) {
      if (!selectedUnit || selectedUnit.length === 0)
        tempErrors.push("selectedUnit");
      if (!selectedUserDepartmentId || selectedUserDepartmentId.length === 0)
        tempErrors.push("userDepartmentId");
      if (!selectedCompany || selectedCompany.length === 0)
        tempErrors.push("companyId");
      if (!selectedEntity) tempErrors.push("entity");
    }

    setError(tempErrors);

    if (tempErrors.length > 0) {
      toast.error("Please fill all required fields");
      stopLoading();
      return;
    }

    try {
      if (editFlag) {
        await UpdateUser();
      } else {
        await AddUser();
      }
    } catch (err) {
      console.error("Error in handleSubmit:", err);
      toast.error("Failed to save user");
    } finally {
      stopLoading();
    }
  };

  const AddUser = async () => {
    try {
      startLoading();
      const body = {
        firstName: userInput.firstName?.trim(),
        lastName: userInput.lastName?.trim(),
        userName: userInput.userName?.trim(),
        password: userInput.password?.trim(),
        mobile: userInput.mobile?.trim(),
        emailId: userInput.emailId?.trim(),
        userGroupId: userInput.userGroupId,
        userCompanies: selectedCompany
          ? selectedCompany.map((company: any) => ({ companyId: company.id }))
          : [],
        userDivisions: selectedUnit
          ? selectedUnit.map((unit) => ({ divisionId: unit.divisionId }))
          : [],
        userRoleAllocations: selectedUserRoleId.map((i) => ({
          userRoleId: i.id,
        })),
        userDepartments: selectedUserDepartmentId.map((department) => ({
          departmentId: department.id,
        })),
        userUnits: selectedUnit.map((unit) => ({ unitId: unit.id })),
        entityId: selectedEntity?.id,
      };

      const { endpoint, method } = Config.User.adduser;
      const result = await Apirequest(endpoint, method, body).then(
        (res) => res.data
      );

      if (result.errors?.length > 0) {
        setErrorMessages(result.errors);
        setErrorModalOpen(true);
        return;
      }

      handleClose();
      toast.success(result.message);
      GetUserList();
    } catch (err) {
      console.error("Error in AddUser:", err);
      setErrorMessages(["An unexpected error occurred. Please try again."]);
      setErrorModalOpen(true);
    } finally {
      stopLoading();
    }
  };

  const UpdateUser = async () => {
    const body = {
      firstName: userInput.firstName?.trim(),
      lastName: userInput.lastName?.trim(),
      userName: userInput.userName?.trim(),
      password: userInput.password?.trim(),
      mobile: userInput.mobile?.trim(),
      emailId: userInput.emailId?.trim(),
      userGroupId: userInput.userGroupId,
      userCompanies: selectedCompany
        ? selectedCompany.map((company: any) => ({ companyId: company.id }))
        : [],
      userDivisions: selectedUnit
        ? selectedUnit.map((unit) => ({ divisionId: unit.divisionId }))
        : [],
      userRoleAllocations: selectedUserRoleId.map((i) => ({
        userRoleId: i.id,
      })),
      userDepartments: selectedUserDepartmentId.map((department) => ({
        departmentId: department.id,
      })),
      userUnits: selectedUnit.map((unit) => ({ unitId: unit.id })),
      entityId: selectedEntity?.id,
      userId: userInput.userId,
      isActive: userInput.isActive,
    };

    try {
      startLoading();
      const { endpoint, method } = Config.User.updateuser;
      const result = await Apirequest(endpoint, method, body).then(
        (res) => res.data
      );

      if (result.errors?.length > 0) {
        setErrorMessages(result.errors);
        setErrorModalOpen(true);
        return;
      }

      handleClose();
      toast.success(result.message);
      GetUserList();
    } catch (err) {
      console.error("Error in UpdateUser:", err);
      GetUserList();
    } finally {
      stopLoading();
    }
  };

  const DeleteUser = async () => {
    try {
      const body = {
        id: userInput.userId,
      };
      const { endpoint, method } = Config.User.deleteuser;
      const response = await Apirequest(
        endpoint.replace("{id}", `${userInput.userId}`),
        method,
        body
      ).then((res) => res.data);

      if (response.statusCode === 200 || response.statusCode === 201) {
        toast.success(response.message);
        setOpen(false);
        setEditFlag(false);
        GetUserList();
      } else {
        toast.error(response.message);
        setErrorMessages(response.errors);
      }
    } catch (err) {
      console.log(err);
    }
  };
  const handleDelete = (id: any) => {
    setDeleteOpen(true);
    setUserInput({ ...userInput, userId: id?.userId });
  };

  const handleConfirmDelete = async () => {
    DeleteUser();
    setDeleteOpen(false);
  };

  const GetOverallUserList = async (userId: number) => {
    try {
      setLoading(true);
      const { endpoint, method } = Config.User.getoveralluser;
      const url = endpoint.replace("{id}", userId?.toString() ?? userId);

      const result = await Apirequest(url, method).then((res) => res.data);
      const getuserRoleIds =
        result.data?.userRoleAllocations?.map((item: any) => item.userRoleId) ??
        [];
      const filteredRoles = userRoleData.filter((role: any) =>
        getuserRoleIds.includes(role.id)
      );
      if (result.statusCode === 200 || result.statusCode === 201) {
        setLoading(false);
        setUserInput({
          ...userInput,
          userId: result.data?.userId ?? 0,
          firstName: result.data?.firstName ?? "",
          lastName: result.data?.lastName ?? "",
          userName: result.data?.userName ?? "",
          mobile: result.data?.mobile ?? "",
          emailId: result.data?.emailId ?? "",
          divisionId: result.data?.userDivisions?.[0]?.divisionId ?? null,
          companyId: result.data?.userCompanies?.[0]?.companyId ?? null,
          unitId: result.data?.userUnits?.[0]?.unitId ?? null,
          isActive: result.data.isActive,
          // entityId: userId ?? "",
          userGroupId: result.data?.userGroupId ?? 0,
          userRoleId: filteredRoles,
        });

        const getuserGroupId = userGroupData.find((item: any) => {
          return item?.id === result.data?.userGroupId;
        });
        const getuserDepartmentIds =
          result.data?.userDepartments?.map((item: any) => item.departmentId) ??
          [];
        const filteredDepartments = departmentData.filter((department: any) =>
          getuserDepartmentIds.includes(department.id)
        );
        const getCompanies =
          result.data?.userCompanies?.map((item: any) => item.companyId) ?? [];
        const filteredCompany = companyData.filter((role: any) =>
          getCompanies.includes(role.id)
        );
        const getEntity =
          Array.isArray(entityData) &&
          entityData?.find((item: any) => item.id === result.data?.entityId);
        setSelectedEntity(getEntity);
        let temp: any = [];
        Array.isArray(result.data?.userUnits) &&
          result.data?.userUnits.length > 0 &&
          result.data?.userUnits.map((i: any) => {
            unitByCompanyData.map((j: any) => {
              if (i?.unitId === j?.id) {
                temp.push(j);
              }
            });
          });

        setSelectedUnit(temp);
        setSelectedUserDepartmentId(filteredDepartments);
        setSelectedUserRoleId(filteredRoles);
        setSelectedCompany(filteredCompany);
        setSelectedUserGroup(getuserGroupId);
      } else {
        toast.error("Something went wrong");
      }
    } catch (err) {
      console.error("Error fetching data:", err);
    }
  };

  const GetUnitByCompany = async () => {
    try {
      const { endpoint, method } = Config.Unit.getUnitByCompany;
      const result = await Apirequest(
        endpoint.replace("{id}", userValue.companyId?.toString()),
        method
      ).then((res) => res.data);
      setUnitByCompanyData(result?.data);
    } catch (err) {
      console.log(err);
      setUnitByCompanyData([]);
    }
  };

  const handleAutocompleteChange = (
    e: React.SyntheticEvent | React.ChangeEvent<HTMLInputElement>,
    value: any[] | any | null,
    field: string
  ) => {
    setError([]);

    switch (field) {
      case "userDepartmentId":
        if (!value || value.length === 0) {
          setSelectedUserDepartmentId([]);
          setUserInput((prev) => ({ ...prev, departmentId: [] }));
        } else {
          setSelectedUserDepartmentId(value);
          setUserInput((prev) => ({
            ...prev,
            departmentId: value.map((item: any) => item.id),
          }));
        }
        break;

      case "companyId":
        if (!value || value.length === 0) {
          setSelectedCompany([]);
          setUserInput((prev) => ({ ...prev, company: [] }));
        } else {
          setSelectedCompany(value);
          setUserInput((prev) => ({
            ...prev,
            company: value.map((item: any) => item.id),
          }));
        }
        break;

      case "entityId":
        if (!value) {
          setSelectedEntity(null);
          setUserInput((prev) => ({ ...prev, entity: "" }));
        } else {
          setSelectedEntity(value);
          setUserInput((prev) => ({ ...prev, entity: value }));
        }
        break;

      case "userRoleId":
        if (!value || value.length === 0) {
          setSelectedUserRoleId([]);
          setUserInput((prev) => ({ ...prev, userRoleId: [] }));
        } else {
          setSelectedUserRoleId(value);
          setUserInput((prev) => ({
            ...prev,
            userRoleId: value.map((item: any) => item.id),
          }));
        }
        break;

      case "userGroupId":
        if (!value?.id) {
          setSelectedUserGroup(null);
          setUserInput((prev) => ({ ...prev, userGroupId: 0 }));
        } else {
          setSelectedUserGroup(value);
          setUserInput((prev) => ({ ...prev, userGroupId: value.id }));
          GetGroup();
        }
        break;

      case "unit":
        setSelectedUnit(value);
        break;

      default:
        break;
    }
  };

  useEffect(() => {
    if (userValue.companyId !== "") {
      GetUnitByCompany();
    }
  }, [userValue]);

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
          <IconBreadcrumbs parent={"Master"} child={"User"} path="" />
        </Box>
        <Box
          display={"flex"}
          justifyContent={"space-between"}
          alignItems={"center"}
          flexWrap={"wrap"}
          gap={2}
        >
          <GlobalSearch
            placeholder="search User"
            width={300}
            onChange={handleSearch}
          />
          <Box className="d-flex-center" gap={2}>
            {permissions.canAdd && (
              <ButtonComponent
                startIcon={<GoPlus />}
                onClick={handleClickOpen}
                variant="contained"
              >
                Create
              </ButtonComponent>
            )}
          </Box>
        </Box>
      </Box>

      <Box sx={{ width: "100%", my: 3, height: 700 }} className="main-table">
        {loading ? (
          <SkeletonLoader />
        ) : (
          <DataGrid
            rows={userData}
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
      <CreateUser
        open={open}
        close={handleClose}
        errors={error}
        userInput={userInput}
        handleChange={handleChange}
        // handleUserRoleChange={handleUserRoleChange}
        selectedUserRoleId={selectedUserRoleId}
        selecteduserGroup={selecteduserGroup}
        userRoleData={userRoleData}
        userGroupData={userGroupData}
        handleSwitch={handleSwitch}
        handleSubmit={handleSubmit}
        // handleGroupChange={handleGroupChange}
        editFlag={editFlag}
        unitByCompanyData={unitByCompanyData}
        handledAutoComplete={handleAutocompleteChange}
        selectedUnit={selectedUnit}
        departmentData={departmentData}
        selectedUserDepartmentId={selectedUserDepartmentId}
        companyData={companyData}
        entityData={entityData}
        selectedCompany={selectedCompany}
        selectedEntity={selectedEntity}
        loading={loading}
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

export default UserPageList;
