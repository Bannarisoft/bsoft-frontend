import { Box } from "@mui/material";
import React, { useEffect, useState } from "react";
import IconBreadcrumbs from "../../../molecules/AdminLayout/BreadCrumbs";
import GlobalSearch from "../../../molecules/AdminLayout/GlobalSearch";
import { MuiButton, MuiTable } from "bsoft-base-elements";
import { GoPlus } from "react-icons/go";
import NoDataFound from "../../../molecules/AdminLayout/NoDataFound";
import { useDebounce } from "../../../../hooks/useDebounceHook";
import {
  GeneratorConsumption,
} from "../../../../maintanenceTypes";
import dayjs from "dayjs";
import { Apirequest } from "../../../../utils/lib";
import MainConfig from "../../../../utils/main.api.json";
import ErrorModal from "../../../molecules/Master/Role/ErrorModal";
import { useRecoilValue } from "recoil";
import { UserData } from "../../../../utils/atoms";
import { usePrivilegeCheck } from "../../../../hooks/usePrivilegeCheck";
import SkeletonLoader from "../../../molecules/AdminLayout/SkeletonLoader";
import CreateGeneratorConsumption from "../../../molecules/Maintanence/Power/CreateGenerator";
import { useDataFetchHook } from "../../../../hooks/useDataFetchHook";
import toast from "react-hot-toast";
interface OpeningMeterData {
  generatorId: number;
  generatorCode: string;
  generatorName: string;
  openingEnergyReading: number;
}
const GeneratorConsumptionpage = () => {
  const [pathname, setPathName] = useState<string>("");
  const permissions = usePrivilegeCheck(pathname);
  useEffect(() => {
    setInitFlag(true);
    const currentPath = window.location.pathname.split("/bsoft").at(-1) || "";
    setPathName(currentPath);
  }, []);
  const [page, setPage] = React.useState<number>(1);
  const [size, setSize] = React.useState<number>(15);
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const debouncedSearchTerm = useDebounce(search, 500);
  const [initFlag, setInitFlag] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [count, setCount] = React.useState(0);
  const [error, setError] = React.useState<string[]>([]);
  const [generatorConsumptionData, setGeneratorConsumptionData] = useState<
    any[]
  >([]);
  const [editFlag, setEditFlag] = React.useState(false);
  const [errorModalOpen, setErrorModalOpen] = React.useState(false);
  const [errorMessages, setErrorMessages] = React.useState<string[]>([]);
  const userValue = useRecoilValue(UserData);
  const [runningHours, setRunningHours] = useState<number>(0);

  const [selectedValues, setSelectedValues] = useState<{
    [key: string]: any[];
  }>({});
  const [openingReading, setOpeningReading] = useState<OpeningMeterData>({
    generatorId: 0,
    generatorCode: "",
    generatorName: "",
    openingEnergyReading: 0,
  });

  const [generatorInput, setGeneratorInput] = useState<GeneratorConsumption>({
    generatorId: 0,
    startTime: "",
    endTime: "",
    dieselConsumption: 0,
    openingEnergyReading: 0,
    closingEnergyReading: 0,
    purposeId: 0,
    totalUnits: 0,
    unitId: 0,
    runningHours: 0,
  });
  const columns = [
    {
      field: "s_no",
      headerName: "S.No",
      minWidth: 50,
      flex: 0.5,
      sortable: true,
      renderCell: (params: any) => {
        return (
          (page - 1) * size + (params.api.getAllRowIds().indexOf(params.id) + 1)
        );
      },
    },
    {
      field: "machine_code",
      headerName: "Code",
      flex: 1,
      minWidth: 150,
      valueGetter: (value: any, row: any) =>
        `${row?.machineCode.toUpperCase() || ""}`,
    },
    {
      field: "machine_name",
      headerName: "Name",
      sortable: true,
      flex: 2,
      valueGetter: (value: any, row: any) => `${row?.machineName || ""}`,
    },
    {
      field: "running_Hours",
      headerName: "Running Hours",
      sortable: true,
      flex: 2,
      valueGetter: (value: any, row: any) => `${row?.runningHours || ""}`,
    },
    {
      field: "diesel_consumption",
      headerName: "Diesel Consumption",
      flex: 2,
      minWidth: 200,
      valueGetter: (value: any, row: any) => `${row?.dieselConsumption || ""}`,
    },
    {
      field: "opening_energy",
      headerName: "Opening Energy",
      flex: 2,
      minWidth: 200,
      valueGetter: (value: any, row: any) =>
        `${row?.openingEnergyReading || ""}`,
    },
    {
      field: "closing_energy",
      headerName: "Closing Energy",
      flex: 2,
      minWidth: 200,
      valueGetter: (value: any, row: any) =>
        `${row?.closingEnergyReading || ""}`,
    },
    {
      field: "total_energy",
      headerName: "Total Energy",
      flex: 1,
      minWidth: 200,
      valueGetter: (value: any, row: any) => `${row?.energy || ""}`,
    },
    {
      field: "createdByName",
      headerName: "Created By",
      sortable: true,
      flex: 2,
      minWidth: 150,
      valueGetter: (value: any, row: any) => `${row?.createdByName ?? ""}`,
    },
  ];

  const handleClickOpen = () => {
    setOpen(true);
    setError([]);
    setSelectedValues({});
     setGeneratorInput({
      ...generatorInput,
      openingEnergyReading: 0,
      closingEnergyReading: 0,
      runningHours: 0,
      startTime: "",
      endTime: "",
      totalUnits: 0,
      dieselConsumption: 0,
    });
  };
  const handleClose = () => {
    setOpen(false);
    setError([]);
    setSelectedValues({});
    setGeneratorInput({
      ...generatorInput,
      openingEnergyReading: 0,
      closingEnergyReading: 0,
      runningHours: 0,
      startTime: "",
      endTime: "",
      totalUnits: 0,
      dieselConsumption: 0,
    });
  };
 const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const { name, value } = e.target;
  let updated = { ...generatorInput };

  const numericFields = [
    "openingEnergyReading",
    "closingEnergyReading",
    "totalUnits",
    "runningHours",
  ];

  if (numericFields.includes(name)) {
    const numericValue = Number(value);
    updated[name] = value === "" ? 0 : numericValue;

    if (name === "closingEnergyReading") {
      const opening = Number(generatorInput.openingEnergyReading) || 0;

      if (value === "" || numericValue === 0) {
        updated.totalUnits = 0;
      } else {
        const total = numericValue - opening; // ✅ closing - opening
        const multiplied = total >= 0 ? total * 1000 : 0;
        updated.totalUnits = Number(multiplied.toFixed(2));
      }
    }
  } else {
    updated[name] = value;
  }

  setGeneratorInput(updated);
  setError([]);
};


  useEffect(() => {
    if (generatorInput.startTime && generatorInput.endTime) {
      const start = dayjs(generatorInput.startTime, "HH:mm:ss");
      const end = dayjs(generatorInput.endTime, "HH:mm:ss");

      const duration = end.isAfter(start)
        ? end.diff(start, "minute")
        : end.add(1, "day").diff(start, "minute");

      const totalHours = (duration / 60).toFixed(2);

      handleChange({
        target: {
          name: "runningHours",
          value: totalHours,
        },
      } as React.ChangeEvent<HTMLInputElement>);
    }
  }, [generatorInput.startTime, generatorInput.endTime]);
  const handleSubmit = (e: React.MouseEvent<HTMLButtonElement>) => {
    let temp: any = [];
    Object.entries(generatorInput).map(([key, value]) => {
      if (
        (key === "openingEnergyReading" &&
          (value === "" || value === 0 || value == null)) ||
        (key === "closingEnergyReading" &&
          (value === "" || value === 0 || value == null)) ||
        (key === "startTime" &&
          (value === "" || value === 0 || value == null)) ||
        (key === "endTime" && (value === "" || value === 0 || value == null)) ||
        (key === "dieselConsumption" &&
          (value === "" || value === 0 || value == null))
      ) {
        temp.push(key);
      }
    });

    if (
      !selectedValues["generatorId"] ||
      selectedValues["generatorId"].length === 0
    ) {
      temp.push("generatorId");
    }

    if (
      !selectedValues["purposeId"] ||
      selectedValues["purposeId"].length === 0
    ) {
      temp.push("purposeId");
    }
    setError(temp);

    if (temp.length === 0) {
      AddGeneratorConsumption();
    }
  };

  const AddGeneratorConsumption = async () => {
    try {
      const body: any = {
        generatorId: selectedValues["generatorId"]?.[0]?.id || 0,
        startTime: generatorInput.startTime
          ? dayjs(generatorInput.startTime, "HH:mm:ss").toISOString()
          : null,
        endTime: generatorInput.endTime
          ? dayjs(generatorInput.endTime, "HH:mm:ss").toISOString()
          : null,
        dieselConsumption: generatorInput.dieselConsumption,
        purposeId: selectedValues["purposeId"]?.[0]?.id || 0,
        unitId: userValue.unitId,
        openingEnergyReading: generatorInput.openingEnergyReading,
        closingEnergyReading: generatorInput.closingEnergyReading,
      };

      if (editFlag) {
        body.id = Number(generatorInput.id);
      }

      const { endpoint, method } =
        MainConfig.GeneratorConsumption.AddGeneratorConsumption;

      const response = await Apirequest(endpoint, method, body, "main").then(
        (res) => res.data
      );

      if (response.statusCode === 201) {
        toast.success(response.message);
        setOpen(false);
        setGeneratorInput({ ...generatorInput });
        setEditFlag(false);
        GetGeneratorConsumptionList();
      } else {
        toast.error(response.message);
        setErrorMessages(response.errors);
        setErrorModalOpen(true);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const GetGeneratorConsumptionList = async () => {
    try {
      const response = await Apirequest(
        MainConfig.GeneratorConsumption.GetGeneratorList.endpoint
          .replace("{page}", page.toString())
          .replace("{size}", size.toString())
          .replace("{searchTerm}", search),
        MainConfig.GeneratorConsumption.GetGeneratorList.method,
        null,
        "main"
      ).then((res) => res.data);
      const { totalCount, statusCode, data } = response;
      if (statusCode === 200 || statusCode === 201) {
        setGeneratorConsumptionData(data);
        setLoading(false);
        setCount(totalCount);
      } else {
        setCount(0);
        setGeneratorConsumptionData([]);
        setLoading(false);
      }
    } catch (err) {
      console.log(err);
      setGeneratorConsumptionData([]);
    }
  };
  React.useEffect(() => {
    initFlag && search !== ""
      ? GetGeneratorConsumptionList()
      : GetGeneratorConsumptionList();
  }, [debouncedSearchTerm, page, size]);

  const { data: purposeData } = useDataFetchHook(
    MainConfig.GeneratorConsumption.PurposeType.endpoint.replace(
      "{type}",
      "GENTSETPURPOSE"
    ),
    MainConfig.GeneratorConsumption.PurposeType.method,
    "main"
  );
  const GetOpeningReading = async (id: number) => {
    try {
      const { endpoint, method } =
        MainConfig.GeneratorConsumption.GetOpeningMeter;
      const response = await Apirequest(
        endpoint.replace(`{generatorId}`, id.toString()),
        method,
        null,
        "main"
      ).then((res) => res.data);
      setOpeningReading(response.data);
      setGeneratorInput((prev) => ({
        ...prev,
        openingEnergyReading: response.data.openingEnergyReading ?? 0,
      }));
    } catch (err) {
      console.log(err);
    }
  };

  const handleAutocompleteChange = (
    e: React.SyntheticEvent | React.ChangeEvent<HTMLInputElement>,
    value: any[] | any | null,
    field: string
  ) => {
    setError([]);

    switch (field) {
      case "generatorId":
        if (!value) {
          setSelectedValues((prev) => ({
            ...prev,
            [field]: [],
            openingEnergyReading: [],
          }));

          setGeneratorInput((prev) => ({
            ...prev,
            generatorId: 0,
            openingEnergyReading: 0,
          }));
        } else {
          setSelectedValues((prev) => ({
            ...prev,
            [field]: [value],
          }));
          GetOpeningReading(value.id);

          setGeneratorInput((prev) => ({
            ...prev,
            generatorId: value?.id || 0,
          }));
        }
        break;

      case "purposeId":
        if (!value) {
          setSelectedValues((prev) => ({
            ...prev,
            [field]: [],
          }));
          setGeneratorInput((prev) => ({
            ...prev,
            purposeId: 0,
          }));
        } else {
          setSelectedValues((prev) => ({
            ...prev,
            [field]: [value],
          }));
          setGeneratorInput((prev) => ({
            ...prev,
            purposeId: value?.id || 0,
          }));
        }
        break;

      default:
        break;
    }
  };

  const { data: generatorTypeData } = useDataFetchHook(
    MainConfig.GeneratorConsumption.GetGeneratorConsumption.endpoint,
    MainConfig.GeneratorConsumption.GetGeneratorConsumption.method,
    "main"
  );

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
            parent="Maintanence"
            child="Generator Consumption"
            path=""
          />
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
            <MuiButton
              startIcon={<GoPlus />}
              onClick={handleClickOpen}
              variant="contained"
            >
              Add
            </MuiButton>
          </Box>
        </Box>
      </Box>

      <Box sx={{ width: "100%", my: 2, height: 700 }} className="main-table">
        {loading ? (
          <SkeletonLoader />
        ) : (
          <MuiTable
            rows={generatorConsumptionData}
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

      <CreateGeneratorConsumption
        generatorTypeData={generatorTypeData}
        close={handleClose}
        open={open}
        generatorInput={generatorInput}
        selectedValues={selectedValues}
        handledAutoComplete={handleAutocompleteChange}
        error={error}
        handleChange={handleChange}
        runningHours={runningHours}
        openingReading={openingReading}
        purposeData={purposeData}
        handleSubmit={handleSubmit}
      />

      <ErrorModal
        open={errorModalOpen}
        onClose={() => setErrorModalOpen(false)}
        errors={errorMessages}
      />
    </>
  );
};

export default GeneratorConsumptionpage;
