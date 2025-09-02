import { Box } from "@mui/material";
import React, { useEffect, useState } from "react";
import IconBreadcrumbs from "../../../molecules/AdminLayout/BreadCrumbs";
import GlobalSearch from "../../../molecules/AdminLayout/GlobalSearch";
import { MuiButton, MuiTable } from "bsoft-base-elements";
import { GoPlus } from "react-icons/go";
import NoDataFound from "../../../molecules/AdminLayout/NoDataFound";
import { useDebounce } from "../../../../hooks/useDebounceHook";
import CreatePowerConsumption from "../../../molecules/Maintanence/Power/CreatePowerConsumption";
import { PowerConsumption } from "../../../../types/maintanenceTypes";
import dayjs from "dayjs";
import {
  Apirequest,
  isSubmitting,
  startLoading,
  stopLoading,
} from "../../../../utils/lib";
import MainConfig from "../../../../utils/main.api.json";
import { useDataFetchHook } from "../../../../hooks/useDataFetchHook";
import ErrorModal from "../../../molecules/Master/Role/ErrorModal";
import { useRecoilValue } from "recoil";
import { UserData } from "../../../../utils/atoms";
import { usePrivilegeCheck } from "../../../../hooks/usePrivilegeCheck";
import SkeletonLoader from "../../../molecules/AdminLayout/SkeletonLoader";
import toast from "react-hot-toast";
interface OpeningReadingData {
  feederId: number;
  feederCode: string;
  feederName: string;
  openingReading: number;
}
const PowerConsumptionpage = () => {
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
  const [powerConsumptionData, setPowerConsumptionData] = useState<any[]>([]);
  const [editFlag, setEditFlag] = React.useState(false);
  const [errorModalOpen, setErrorModalOpen] = React.useState(false);
  const [errorMessages, setErrorMessages] = React.useState<string[]>([]);
  const userValue = useRecoilValue(UserData);
  const [selectedValues, setSelectedValues] = useState<{
    [key: string]: any[];
  }>({});
  const [feederData, setFeederData] = React.useState([]);
  const [openingReading, setOpeningReading] = useState<OpeningReadingData>({
    feederId: 0,
    feederCode: "",
    feederName: "",
    openingReading: 0,
  });
  const [powerInput, setPowerInput] = useState<PowerConsumption>({
    feederTypeId: 0,
    feederId: 0,
    unitId: 0,
    openingReading: 0,
    closingReading: 0,
    totalUnits: 0,
    id: 0,
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
      field: "createdDate ",
      headerName: "Transaction Date ",
      flex: 2,
      minWidth: 150,
      valueGetter: (value: any, row: any) =>
        `${dayjs(row?.createdDate).format("DD-MM-YYYY")}  -  ${dayjs(
          row?.createdDate
        ).format("hh:mm:ss A")}`,
    },
    {
      field: "feederName",
      headerName: "Feeder Name",
      flex: 2,
      minWidth: 200,
      valueGetter: (value: any, row: any) => `${row?.feederName || ""}`,
    },
    {
      field: "feederType",
      headerName: "Feeder Type",
      flex: 2,
      minWidth: 200,
      valueGetter: (value: any, row: any) => `${row?.feederType || ""}`,
    },
    {
      field: "openingReading",
      headerName: "Opening Reading",
      flex: 2,
      minWidth: 200,
      valueGetter: (value: any, row: any) => `${row?.openingReading || ""}`,
    },
    {
      field: "closingReading",
      headerName: "Closing Reading",
      flex: 2,
      minWidth: 200,
      valueGetter: (value: any, row: any) => `${row?.closingReading || ""}`,
    },
    {
      field: "totalUnits",
      headerName: "Total Units",
      flex: 1,
      minWidth: 200,
      valueGetter: (value: any, row: any) => `${row?.totalUnits || ""}`,
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
    setPowerInput({
      ...powerInput,
      openingReading: 0,
      closingReading: 0,
      totalUnits: 0,
    });
  };
  const handleClose = () => {
    setOpen(false);
    setError([]);
    setSelectedValues({});
    setPowerInput({
      ...powerInput,
      openingReading: 0,
      closingReading: 0,
      totalUnits: 0,
    });
  };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let { name, value } = e.target;
    const numericValue = Number(value);

    let updated = {
      ...powerInput,
      [name]: value === "" ? 0 : numericValue,
    };

    if (name === "closingReading") {
      const opening = Number(powerInput.openingReading) || 0;

      if (value === "" || numericValue === 0) {
        updated.totalUnits = 0;
      } else {
        const total = numericValue - opening;
        const multiplied = total >= 0 ? total * 1000 : 0;
        updated.totalUnits = Number(multiplied.toFixed(2));
      }
    }

    setPowerInput(updated);
    setError([]);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    if (isSubmitting()) return;

    let temp: string[] = [];
    Object.entries(powerInput).forEach(([key, value]) => {
      if (
        (key === "openingReading" && (!value || Number(value) === 0)) ||
        (key === "closingReading" && (!value || Number(value) === 0))
      ) {
        temp.push(key);
      }
    });

    if (!selectedValues["feederTypeId"]?.length) temp.push("feederTypeId");
    if (!selectedValues["feederId"]?.length) temp.push("feederId");

    setError(temp);

    if (temp.length > 0) {
      console.error("Please fill all mandatory fields.");
      return;
    }

    try {
      startLoading();

      await AddPowerConsumption();
    } catch (error) {
      console.error("Error adding power consumption:", error);
    } finally {
      stopLoading();
    }
  };

  const GetPowerConsumptionList = async () => {
    try {
      const response = await Apirequest(
        MainConfig.PowerConsumption.GetPowerConsumption.endpoint
          .replace("{page}", page.toString())
          .replace("{size}", size.toString())
          .replace("{searchTerm}", search),
        MainConfig.PowerConsumption.GetPowerConsumption.method,
        null,
        "main"
      ).then((res) => res.data);
      const { totalCount, statusCode, data } = response;
      if (statusCode === 200 || statusCode === 201) {
        setPowerConsumptionData(data);
        setLoading(false);
        setCount(totalCount);
      } else {
        setCount(0);
        setPowerConsumptionData([]);
        setLoading(false);
      }
    } catch (err) {
      console.log(err);
      setPowerConsumptionData([]);
    }
  };

  React.useEffect(() => {
    initFlag && search !== ""
      ? GetPowerConsumptionList()
      : GetPowerConsumptionList();
  }, [debouncedSearchTerm, page, size]);

  const { data: feederTypeData } = useDataFetchHook(
    MainConfig.Feeder.FeederType.endpoint.replace("{type}", "feederType"),
    MainConfig.Feeder.FeederType.method,
    "main"
  );

  const GetFeeder = async (id: number) => {
    try {
      const { endpoint, method } = MainConfig.PowerConsumption.GetFeederById;
      const response = await Apirequest(
        endpoint.replace(`{id}`, id.toString()),
        method,
        null,
        "main"
      ).then((res) => res.data);
      setFeederData(response.data);
    } catch (err) {
      console.log(err);
      setFeederData([]);
    }
  };

  const GetOpeningReading = async (id: number) => {
    try {
      const { endpoint, method } = MainConfig.PowerConsumption.GetOpeningReader;
      const response = await Apirequest(
        endpoint.replace(`{feederId}`, id.toString()),
        method,
        null,
        "main"
      ).then((res) => res.data);
      setOpeningReading(response.data);
      setPowerInput((prev) => ({
        ...prev,
        openingReading: response.data.openingReading ?? 0,
      }));

    } catch (err) {
      console.log(err);
    }
  };

  const AddPowerConsumption = async () => {
    try {
      startLoading();
      const body: any = {
        feederTypeId: selectedValues["feederTypeId"]?.[0]?.id || 0,
        feederId: selectedValues["feederId"]?.[0]?.id || 0,
        unitId: userValue.unitId,
        openingReading: powerInput.openingReading,
        closingReading: powerInput.closingReading,
      };

      if (editFlag) {
        body.id = Number(powerInput.id);
      }
      const { endpoint, method } =
        MainConfig.PowerConsumption.AddPowerConsumption;
      const response = await Apirequest(endpoint, method, body, "main").then(
        (res) => res.data
      );

      if (response.statusCode === 201) {
        toast.success(response.message);
        setOpen(false);
        setPowerInput({ ...powerInput });
        setEditFlag(false);
        GetPowerConsumptionList();
      } else {
        toast.error(response.message);
        setErrorMessages(response.errors);
        setErrorModalOpen(true);
      }
    } catch (err) {
      console.log(err);
    } finally {
      stopLoading();
    }
  };

  const handleAutocompleteChange = (
    e: React.SyntheticEvent | React.ChangeEvent<HTMLInputElement>,
    value: any[] | any | null,
    field: string
  ) => {
    setError([]);
    switch (field) {
      case "feederTypeId":
        if (!value) {
          setSelectedValues((prev) => ({
            ...prev,
            [field]: [],
            feederId: [],
            openingReading: [],
          }));
          setFeederData([]);
          setPowerInput((prev) => ({
            ...prev,
            feederTypeId: 0,
            feederId: 0,
            openingReading: 0,
          }));
        } else {
          setSelectedValues((prev) => ({
            ...prev,
            [field]: [value],
            feederId: [],
            openingReading: [],
          }));
          GetFeeder(value.id);
          setPowerInput((prev) => ({
            ...prev,
            feederTypeId: value?.id || 0,
          }));
        }
        break;

      case "feederId":
        if (!value) {
          setSelectedValues((prev) => ({
            ...prev,
            [field]: [],
            openingReading: [],
          }));

          setPowerInput((prev) => ({
            ...prev,
            feederId: 0,
            openingReading: 0,
          }));
        } else {
          setSelectedValues((prev) => ({
            ...prev,
            [field]: [value],
          }));
          GetOpeningReading(value.id);

          setPowerInput((prev) => ({
            ...prev,
            feederId: value?.id || 0,
          }));
        }
        break;

      default:
        break;
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
          <IconBreadcrumbs
            parent="Maintanence"
            child="Power Consumption"
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
            {permissions.canAdd && (
              <MuiButton
                startIcon={<GoPlus />}
                onClick={handleClickOpen}
                variant="contained"
              >
                Add
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
            rows={powerConsumptionData}
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

      <CreatePowerConsumption
        close={handleClose}
        open={open}
        powerInput={powerInput}
        handleChange={handleChange}
        error={error}
        handleSubmit={handleSubmit}
        feederTypeData={feederTypeData}
        handledAutoComplete={handleAutocompleteChange}
        selectedValues={selectedValues}
        feederData={feederData}
        openingReading={openingReading}
      />
      <ErrorModal
        open={errorModalOpen}
        onClose={() => setErrorModalOpen(false)}
        errors={errorMessages}
      />
    </>
  );
};

export default PowerConsumptionpage;
