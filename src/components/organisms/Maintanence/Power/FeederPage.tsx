import { Box } from "@mui/material";
import React, { useEffect, useState } from "react";
import IconBreadcrumbs from "../../../molecules/AdminLayout/BreadCrumbs";
import GlobalSearch from "../../../molecules/AdminLayout/GlobalSearch";
import { MuiButton, MuiTable } from "bsoft-base-elements";
import { GoPlus } from "react-icons/go";
import NoDataFound from "../../../molecules/AdminLayout/NoDataFound";
import CreateFeeder from "../../../molecules/Maintanence/Power/CreateFeeder";
import { FiEdit } from "react-icons/fi";
import { RiDeleteBin6Line } from "react-icons/ri";
import { FeederProps } from "../../../../maintanenceTypes";
import DeleteConfirmation from "../../../molecules/Master/DeleteConfirmation";
import { useDebounce } from "../../../../hooks/useDebounceHook";
import { usePrivilegeCheck } from "../../../../hooks/usePrivilegeCheck";
import { useDataFetchHook } from "../../../../hooks/useDataFetchHook";
import MainConfig from "../../../../utils/main.api.json";
import Config from "../../../../utils/config.api.json";
import { Apirequest } from "../../../../utils/lib";
import SkeletonLoader from "../../../molecules/AdminLayout/SkeletonLoader";
import { useRecoilValue } from "recoil";
import { UserData } from "../../../../utils/atoms";
import ErrorModal from "../../../molecules/Master/Role/ErrorModal";
import { GridColDef } from "@mui/x-data-grid";
import toast from "react-hot-toast";

function FeederPage() {
  const [pathname, setPathName] = useState<string>("");
  const permissions = usePrivilegeCheck(pathname);
  useEffect(() => {
    setInitFlag(true);
    const currentPath = window.location.pathname.split("/bsoft").at(-1) || "";
    setPathName(currentPath);
  }, []);

  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [initFlag, setInitFlag] = React.useState(false);
  const [errorModalOpen, setErrorModalOpen] = React.useState(false);
  const [errorMessages, setErrorMessages] = React.useState<string[]>([]);
  const [feederInput, setFeederInput] = useState<FeederProps>({
    feederCode: "",
    feederName: "",
    parentFeederId: 0,
    feederGroupId: 0,
    feederTypeId: 0,
    unitId: 0,
    departmentId: 0,
    description: "",
    multiplicationFactor: 0,
    effectiveDate: "",
    openingReading: 0,
    highPriority: 1,
    target: 0,
    id: 0,
    isActive: 1,
    meterAvailable: 1,
    meterTypeId: 0,
  });
  const [selectedValues, setSelectedValues] = useState<{
    [key: string]: any[];
  }>({});

  const [error, setError] = React.useState<string[]>([]);
  const [editFlag, setEditFlag] = React.useState(false);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [feederTypeFlag, setFeederTypeFlag] = useState<boolean>(false);
  const [feedrData, setFeederData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const debouncedSearchTerm = useDebounce(search, 500);
  const [count, setCount] = React.useState<number>(0);
  const [page, setPage] = React.useState<number>(1);
  const [size, setSize] = React.useState<number>(15);
  const userValue = useRecoilValue(UserData);

  const columns: GridColDef<(typeof feedrData)[number]>[] = [
    {
      field: "s_no",
      headerName: "S.No",
      flex: 1,
      minWidth: 150,
      sortable: true,
      renderCell: (params) => {
        return (
          (page - 1) * size + (params.api.getAllRowIds().indexOf(params.id) + 1)
        );
      },
    },
    {
      field: "unitName",
      headerName: "Unit Name",
      flex: 1,
      minWidth: 200,
      valueGetter: (value: any, row: any) => `${row?.unitName || ""}`,
    },
    {
      field: "feederCode",
      headerName: "Feeder Code",
      flex: 1,
      minWidth: 200,
      valueGetter: (value: any, row: any) =>
        `${row?.feederCode.toUpperCase() || ""}`,
    },
    {
      field: "feederGroupName",
      headerName: "Feeder Name",
      flex: 1,
      minWidth: 200,
      valueGetter: (value: any, row: any) => `${row?.feederName || ""}`,
    },
    {
      field: "department",
      headerName: "Department",
      flex: 1,
      minWidth: 200,
      valueGetter: (value: any, row: any) => `${row?.departmentName || ""}`,
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
    setError([]);
    setFeederInput({
      ...feederInput,
      feederCode: "",
      feederName: "",
      description: "",
      effectiveDate: "",
      multiplicationFactor: 0,
      openingReading: 0,
      target: 0,
      meterAvailable: 1,
    });
    setEditFlag(false);
    setSelectedValues({});
  };
  const handleClose = () => {
    setOpen(false);
    setFeederInput({
      ...feederInput,
      feederCode: "",
      feederName: "",
      description: "",
      effectiveDate: "",
      multiplicationFactor: 0,
      openingReading: 0,
      target: 0,
      meterAvailable: 1,
    });
  };

  const handleSwitch = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: "isActive" | "highPriority" | "meterAvailable"
  ) => {
    const { checked } = e.target;

    if (field === "isActive") {
      setFeederInput({
        ...feederInput,
        isActive: checked ? 1 : 0,
      });
    } else if (field === "highPriority") {
      setFeederInput({
        ...feederInput,
        highPriority: checked ? 1 : 0,
      });
    } else if (field === "meterAvailable") {
      setFeederInput((prev) => ({
        ...prev,
        meterAvailable: checked ? 1 : 0,
        meterTypeId: checked ? prev.meterTypeId : null,
      }));

      setSelectedValues((prev) => ({
        ...prev,
        meterTypeId: checked ? prev.meterTypeId : [],
      }));
    } else {
      setFeederInput((prev) => ({
        ...prev,
        [field]: checked ? 1 : 0,
      }));
    }
  };

  const handleSubmit = (e: React.MouseEvent<HTMLButtonElement>) => {
    let temp: any = [];
    Object.entries(feederInput).map(([key, value]) => {
      if (
        (key === "feederCode" && !value?.length) ||
        (key === "feederName" && !value?.length) ||
        (key === "effectiveDate" && !value) ||
        (key === "openingReading" && !value) ||
        (key === "target" && !value) ||
        (key === "multiplicationFactor" && !value)
      ) {
        temp.push(key);
      }
    });

    if (!feederTypeFlag && !selectedValues["parentFeederId"]?.length) {
      temp.push("parentFeederId");
    }
    if (
      !selectedValues["feederGroupId"] ||
      selectedValues["feederGroupId"].length === 0
    ) {
      temp.push("feederGroupId");
    }

    if (
      !selectedValues["feederTypeId"] ||
      selectedValues["feederTypeId"].length === 0
    ) {
      temp.push("feederTypeId");
    }
    if (
      !selectedValues["departmentId"] ||
      selectedValues["departmentId"].length === 0
    ) {
      temp.push("departmentId");
    }

    setError(temp);

    if (temp.length === 0 && editFlag) {
      UpdateFeeder();
    } else {
      if (temp.length === 0) {
        AddFeeder();
      }
    }
  };

  const handleEdit = (row: any) => {
    setEditFlag(true);
    setOpen(true);
    setError([]);
    setFeederInput({
      ...feederInput,
      feederCode: row.feederCode,
      feederName: row.feederName,
      description: row.description,
      multiplicationFactor: row.multiplicationFactor,
      effectiveDate: row.effectiveDate,
      openingReading: row.openingReading,
      highPriority: row.highPriority,
      target: row.target,
      id: row.id,
      isActive: row.isActive,
      meterAvailable: row.meterAvailable,
    });
    setSelectedValues((prev) => ({
      ...prev,
      departmentId: departmentData.filter(
        (item: any) => item.id === row.departmentId
      ),
    }));
    setSelectedValues((prev) => ({
      ...prev,
      feederGroupId: feederGroupData.filter(
        (item: any) => item.id === row.feederGroupId
      ),
    }));
    setSelectedValues((prev) => ({
      ...prev,
      feederTypeId: feederTypeData.filter(
        (item: any) => item.id === row.feederTypeId
      ),
    }));
    setSelectedValues((prev) => ({
      ...prev,
      meterTypeId: meterTypeData.filter(
        (item: any) => item.id === row.meterTypeId
      ),
    }));
    setSelectedValues((prev) => ({
      ...prev,
      parentFeederId: parentFeederData.filter(
        (item: any) => item.id === row.parentFeederId
      ),
    }));

    const matchedFeederType = feederTypeData.find(
      (item: any) => item.id === row.feederTypeId
    );
    setFeederTypeFlag(matchedFeederType?.code === "FEEDER");
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let { name, value } = e.target;
     const filteredValue =
      name === "feederCode" ? value.replace(/[^a-zA-Z0-9]/g, "") : value;
    setFeederInput({ ...feederInput, [name]: filteredValue });
    setError([]);
  };

  const GetFeederList = async () => {
    try {
      const response = await Apirequest(
        MainConfig.Feeder.GetFeeder.endpoint
          .replace("{page}", page.toString())
          .replace("{size}", size.toString())
          .replace("{searchTerm}", search),
        MainConfig.Feeder.GetFeeder.method,
        null,
        "main"
      ).then((res) => res.data);
      const { totalCount, statusCode, data } = response;
      if (statusCode === 200 || statusCode === 201) {
        setFeederData(data);
        setLoading(false);
        setCount(totalCount);
      } else {
        setCount(0);
        setFeederData([]);
        setLoading(false);
      }
    } catch (err) {
      console.log(err);
      setFeederData([]);
    }
  };

  React.useEffect(() => {
    initFlag && search !== "" ? GetFeederList() : GetFeederList();
  }, [debouncedSearchTerm, page, size]);

  const { data: feederGroupData } = useDataFetchHook(
    MainConfig.FeederGroup.GetByFeederGroup.endpoint,
    MainConfig.FeederGroup.GetByFeederGroup.method,
    "main"
  );
  const { data: departmentData } = useDataFetchHook(
    Config.Department.getDepartment.endpoint,
    Config.Department.getDepartment.method
  );
  const { data: parentFeederData } = useDataFetchHook(
    MainConfig.Feeder.GetByParentFeeder.endpoint,
    MainConfig.Feeder.GetByParentFeeder.method,
    "main"
  );
  const { data: feederTypeData } = useDataFetchHook(
    MainConfig.Feeder.FeederType.endpoint.replace("{type}", "feederType"),
    MainConfig.Feeder.FeederType.method,
    "main"
  );
  const { data: meterTypeData } = useDataFetchHook(
    MainConfig.Feeder.MeterType.endpoint.replace("{type}", "metertype"),
    MainConfig.Feeder.MeterType.method,
    "main"
  );


  const handleAutocompleteChange = (
    e: React.SyntheticEvent | React.ChangeEvent<HTMLInputElement>,
    value: any[] | any | null,
    field: string
  ) => {
    setError([]);

    switch (field) {
      case "feederGroupId":
        if (!value) {
          setSelectedValues((prev) => ({
            ...prev,
            [field]: [],
          }));
          setFeederInput((prev) => ({
            ...prev,
            feederGroupId: 0,
          }));
        } else {
          setSelectedValues((prev) => ({
            ...prev,
            [field]: [value],
          }));
          setFeederInput((prev) => ({
            ...prev,
            feederGroupId: value?.id || 0,
          }));
        }
        break;

      case "departmentId":
        if (!value) {
          setSelectedValues((prev) => ({
            ...prev,
            [field]: [],
          }));
          setFeederInput((prev) => ({
            ...prev,
            departmentId: 0,
          }));
        } else {
          setSelectedValues((prev) => ({
            ...prev,
            [field]: [value],
          }));
          setFeederInput((prev) => ({
            ...prev,
            departmentId: value?.id || 0,
          }));
        }
        break;

      case "parentFeederId":
        if (!value) {
          setSelectedValues((prev) => ({
            ...prev,
            [field]: [],
          }));
          setFeederInput((prev) => ({
            ...prev,
            parentFeederId: 0,
          }));
        } else {
          setSelectedValues((prev) => ({
            ...prev,
            [field]: [value],
          }));
          setFeederInput((prev) => ({
            ...prev,
            parentFeederId: value?.id || 0,
          }));
        }
        break;

      case "feederTypeId":
        if (!value) {
          setSelectedValues((prev) => ({
            ...prev,
            [field]: [],
            parentFeederId: [],
          }));
          setFeederTypeFlag(false);

          setFeederInput((prev) => ({
            ...prev,
            feederTypeId: 0,
            parentFeederId: 0,
          }));
        } else {
          const isFeeder = value?.code === "FEEDER";

          setSelectedValues((prev) => ({
            ...prev,
            [field]: [value],
            parentFeederId: isFeeder ? [] : prev["parentFeederId"],
          }));

          setFeederTypeFlag(isFeeder);

          setFeederInput((prev) => ({
            ...prev,
            feederTypeId: value?.id || 0,
            parentFeederId: isFeeder ? 0 : prev.parentFeederId,
          }));
        }
        break;
      case "meterTypeId":
        if (!value) {
          setSelectedValues((prev) => ({
            ...prev,
            [field]: [],
          }));
          setFeederInput((prev) => ({
            ...prev,
            meterTypeId: 0,
          }));
        } else {
          setSelectedValues((prev) => ({
            ...prev,
            [field]: [value],
          }));
          setFeederInput((prev) => ({
            ...prev,
            meterTypeId: value?.id || 0,
          }));
        }
        break;

      default:
        break;
    }
  };

  const AddFeeder = async () => {
    try {
      const body: any = {
        feederCode: feederInput.feederCode?.trim()?.toUpperCase(),
        feederName: feederInput.feederName?.trim().replace(/\b\w/g, (char:any) => char.toUpperCase()),
        parentFeederId: selectedValues["parentFeederId"]?.[0]?.id ?? null,
        feederGroupId: selectedValues["feederGroupId"]?.[0]?.id || 0,
        feederTypeId: selectedValues["feederTypeId"]?.[0]?.id || 0,
        meterTypeId: selectedValues["meterTypeId"]?.[0]?.id || 0,
        unitId: userValue.unitId,
        departmentId: selectedValues["departmentId"]?.[0]?.id || 0,
        description: feederInput.description?.trim(),
        multiplicationFactor: feederInput.multiplicationFactor,
        effectiveDate: feederInput.effectiveDate,
        openingReading: feederInput.openingReading,
        highPriority: feederInput.highPriority,
        target: feederInput.target,
        meterAvailable: feederInput.meterAvailable,
      };

      if (editFlag) {
        body.id = Number(feederInput.id);
      }
      const { endpoint, method } = MainConfig.Feeder.AddFeeder;
      const response = await Apirequest(endpoint, method, body, "main").then(
        (res) => res.data
      );

      if (response.statusCode === 201) {
        toast.success(response.message);
        setOpen(false);
        setFeederInput({ ...feederInput });
        setEditFlag(false);
        GetFeederList();
      } else {
        toast.error(response.message);
        setErrorMessages(response.errors);
        setErrorModalOpen(true);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const UpdateFeeder = async () => {
    try {
      const body: any = {
        feederCode: feederInput.feederCode?.trim()?.toUpperCase(),
        feederName: feederInput.feederName?.trim().replace(/\b\w/g, (char:any) => char.toUpperCase()),
        parentFeederId: selectedValues["parentFeederId"]?.[0]?.id ?? null,
        feederGroupId: selectedValues["feederGroupId"]?.[0]?.id || 0,
        feederTypeId: selectedValues["feederTypeId"]?.[0]?.id || 0,
        meterTypeId: selectedValues["meterTypeId"]?.[0]?.id || 0,
        unitId: userValue.unitId,
        departmentId: selectedValues["departmentId"]?.[0]?.id || 0,
        description: feederInput.description?.trim(),
        multiplicationFactor: feederInput.multiplicationFactor,
        effectiveDate: feederInput.effectiveDate,
        openingReading: feederInput.openingReading,
        highPriority: feederInput.highPriority,
        target: feederInput.target,
        isActive: feederInput.isActive,
        meterAvailable: feederInput.meterAvailable,
        id: feederInput.id,
      };
      if (editFlag) {
        body.id = Number(feederInput.id);
      }
      const { endpoint, method } = MainConfig.Feeder.UpdateFeeder;
      const response = await Apirequest(endpoint, method, body, "main").then(
        (res) => res.data
      );
      if (response.statusCode === 200 || response.statusCode === 201) {
        toast.success(response.message);
        setOpen(false);
        setEditFlag(false);
        setFeederInput({ ...feederInput });
        GetFeederList();
      } else {
        toast.error(response.message);
        setErrorMessages(response.errors);
        setErrorModalOpen(true);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleDelete = (id: number) => {
    setFeederInput({ ...feederInput, id: id });
    setDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    DeleteFeederGroup();
    setDeleteOpen(false);
  };

  const DeleteFeederGroup = async () => {
    try {
      const body = {
        id: feederInput.id,
      };
      const { endpoint, method } = MainConfig.Feeder.DeleteFeeder;
      const result = await Apirequest(
        endpoint.replace("{id}", `${feederInput.id}`),
        method,
        body,
        "main"
      ).then((res) => res.data);
      toast.success(result?.message);
      GetFeederList();
    } catch (err) {
      console.log(err);
    }
  };
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
          <IconBreadcrumbs parent="Maintanence" child="Feeder" path="" />
        </Box>

        <Box>
          <Box
            display={"flex"}
            justifyContent={"space-between"}
            alignItems={"center"}
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
            rows={feedrData}
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

      <CreateFeeder
        open={open}
        close={handleClose}
        handleSwitch={handleSwitch}
        feederInput={feederInput}
        error={error}
        editFlag={editFlag}
        handleChange={handleChange}
        handleSubmit={handleSubmit}
        feederTypeFlag={feederTypeFlag}
        feederGroupData={feederGroupData}
        departmentData={departmentData}
        parentFeederData={parentFeederData}
        handledAutoComplete={handleAutocompleteChange}
        selectedValues={selectedValues}
        feederTypeData={feederTypeData}
        meterTypeData={meterTypeData}
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

export default FeederPage;
