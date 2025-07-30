import {
  Box,
  styled,
  Table,
  TableBody,
  TableCell,
  tableCellClasses,
  TableHead,
  TableRow,
} from "@mui/material";
import { MuiButton, MuiText } from "bsoft-base-elements";
import dayjs, { Dayjs } from "dayjs";
import React, { useEffect, useState } from "react";
import AddAMCPop from "./AddAMCPop";
import { Apirequest, emailRegex } from "../../../../utils/lib";
import Config from "../../../../utils/fam.api.json";
import { useDebounce } from "../../../../hooks/useDebounceHook";
import Swal from "sweetalert2";
import { FaEdit } from "react-icons/fa";
import { RiDeleteBinFill } from "react-icons/ri";
import { useRecoilValue } from "recoil";
import { UserData } from "../../../../utils/atoms";
import utc from "dayjs/plugin/utc";
import customParseFormat from "dayjs/plugin/customParseFormat";
import SkeletonLoader from "../../../molecules/AdminLayout/SkeletonLoader";
import DeleteConfirmation from "../../../molecules/Master/DeleteConfirmation";
import ErrorModal from "../../../molecules/Master/Role/ErrorModal";
import toast from "react-hot-toast";

dayjs.extend(utc);
dayjs.extend(customParseFormat);

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: "#BBDBDB",
    color: theme.palette.common.black,
    borderRight: "1px solid #D8D8D8",
  },
  [`&.${tableCellClasses.body}`]: {
    backgroundColor: "#fff",
    fontSize: 14,
    borderRight: "1px solid #D8D8D8",
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:nth-of-type(odd)": {
    backgroundColor: theme.palette.action.hover,
  },
  "&:last-child td, &:last-child th": {
    borderBottom: 0,
  },
}));

export interface AssetAMCInputTypes {
  amcStatus: number;
  startDate: any;
  endDate: any;
  amcPeriod: string;
  vendorCode: string;
  vendorName: string;
  email: string;
  phone: string;
  coverageScope: any;
  freeServices: string;
  renewalDueDate: any;
  renewalStatus: any;
  renewedDate: any;
}

function AssetDetailAmc({ amcList, pathname, renewalData, onUpdated }: any) {
  const [open, setOpen] = useState(false);
  const [amcInputs, setAmcInputs] = useState<AssetAMCInputTypes>({
    amcStatus: 1,
    startDate: "",
    endDate: "",
    amcPeriod: "",
    vendorCode: "",
    vendorName: "",
    email: "",
    phone: "",
    coverageScope: "",
    freeServices: "",
    renewalDueDate: "",
    renewalStatus: "",
    renewedDate: "",
  });
  const [errors, setErrors] = useState([]);
  const [coverageData, setCoverageData] = useState([]);
  const debouncedSearchTerm = useDebounce(amcInputs.vendorCode, 500);
  const userValue = useRecoilValue(UserData);
  const [editFlag, setEditFlag] = useState(false);
  const [amcId, setAmcId] = useState(0);
  const [loading, setLoading] = React.useState(true);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [errorModalOpen, setErrorModalOpen] = React.useState(false);
  const [errorMessages, setErrorMessages] = React.useState<string[]>([]);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditFlag(false);
    setAmcInputs({
      amcStatus: 1,
      startDate: "",
      endDate: "",
      amcPeriod: "",
      vendorCode: "",
      vendorName: "",
      email: "",
      phone: "",
      coverageScope: "",
      freeServices: "",
      renewalDueDate: "",
      renewalStatus: "",
      renewedDate: "",
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let { name, value } = e.target;
    setErrors([]);
    if (name === "amcPeriod") {
      const periodInMonths = parseInt(value) || 0;
      const startDate = dayjs(amcInputs.startDate);

      if (startDate.isValid()) {
        const endDate = startDate.add(periodInMonths, "month");
        const renewalDueDate = endDate.subtract(1, "week");

        setAmcInputs({
          ...amcInputs,
          [name]: value,
          endDate: endDate.format("YYYY-MM-DD"),
          renewalDueDate: renewalDueDate.format("YYYY-MM-DD"),
        });
        return;
      }
    }
    setAmcInputs({ ...amcInputs, [name]: value });
  };

  const handleSubmit = () => {
    let temp: any = [];
    Object.entries(amcInputs).map(([key, value]: any) => {
      if (key === "phone") {
        value?.length !== 10 && temp.push(key);
      } else if (key === "email") {
        !emailRegex.test(value) && temp.push(key);
      } else if (value === "" || value === null) {
        temp.push(key);
      }
    });
    setErrors(temp);
    if (temp?.length === 0) {
      AddAmc();
      setLoading(true);
    }
  };

  const AddAmc = async () => {
    const body: any = {
      assetId: Number(pathname),
      startDate: amcInputs.startDate,
      period: Number(amcInputs.amcPeriod),
      vendorCode: amcInputs.vendorCode?.trim(),
      vendorName: amcInputs.vendorName?.trim(),
      vendorPhone: amcInputs.phone,
      vendorEmail: amcInputs.email,
      coverageType: amcInputs.coverageScope?.id,
      freeServiceCount: Number(amcInputs.freeServices),
      renewalStatus: amcInputs.renewalStatus?.id,
      renewedDate: amcInputs.renewedDate,
      isActive: amcInputs.amcStatus,
    };
    if (amcId) {
      body["id"] = amcId;
    }
    try {
      const { endpoint, method } = editFlag
        ? Config.AssetWarranty.UpdateAmc
        : Config.AssetWarranty.AddAMC;
      const response = await Apirequest(endpoint, method, body, "fam").then(
        (res) => res.data
      );
      if (response?.statusCode === 200 || response?.statusCode === 201) {
        onUpdated && onUpdated();
        handleClose();
        setTimeout(() => {
          Swal.fire({
            title: editFlag
              ? "Asset AMC Update Successfully"
              : "Asset AMC Added Successfully",
            icon: "success",
            confirmButtonText: "okay",
            customClass: {
              title: "custom-title",
            },
          }).then((res) => {
            if (res.isConfirmed) {
              setLoading(false);
            }
          });
        }, 10);
      } else {
        onUpdated && onUpdated();
        setLoading(false);
        toast.error(response?.message);
        if (Array.isArray(response.errors) && response.errors.length > 0) {
          setErrorMessages(response.errors);
          setErrorModalOpen(true);
        }
      }
    } catch (err) {
      setLoading(false);
      console.log(err);
    }
  };

  const handleDate = (value: dayjs.Dayjs | null, field?: string) => {
    setErrors([]);
    switch (field) {
      case "start":
        const periodInMonths = parseInt(amcInputs.amcPeriod) || 0;
        const endDate = value
          ? dayjs(value).add(periodInMonths, "month")
          : null;
        const renewalDueDate = endDate
          ? dayjs(endDate).subtract(1, "week")
          : null;
        return setAmcInputs({
          ...amcInputs,
          startDate: value ? dayjs(value).format("YYYY-MM-DD") : "",
          endDate: endDate ? endDate.format("YYYY-MM-DD") : "",
          renewalDueDate: renewalDueDate
            ? renewalDueDate.format("YYYY-MM-DD")
            : "",
        });
      case "end":
        const newRenewalDueDate = value
          ? dayjs(value).subtract(1, "week")
          : null;
        return setAmcInputs({
          ...amcInputs,
          endDate: dayjs(value).format("YYYY-MM-DD"),
          renewalDueDate: newRenewalDueDate
            ? newRenewalDueDate.format("YYYY-MM-DD")
            : "",
        });
      case "renewalDueDate":
      case "renewed":
        return setAmcInputs({
          ...amcInputs,
          [field === "renewalDueDate" ? "renewalDueDate" : "renewedDate"]: value
            ? dayjs(value).format("YYYY-MM-DD")
            : "",
        });
    }
  };

  const handleAutocomplete = (value: any, field: string) => {
    setErrors([]);
    setAmcInputs((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSwitch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrors([]);
    e.target.checked
      ? setAmcInputs({ ...amcInputs, amcStatus: 1 })
      : setAmcInputs({ ...amcInputs, amcStatus: 0 });
  };

  const GetVendorDetails = async () => {
    if (!editFlag) {
      try {
        const { endpoint, method } = Config.AssetWarranty.VendorDetails;
        const response = await Apirequest(
          endpoint
            .replace("{oldUnitId}", userValue.oldUnitId.toString())
            .replace("{VendorCode}", amcInputs.vendorCode),
          method,
          null,
          "fam"
        ).then((res) => res.data);
        if (response.statusCode === 200 || response.statusCode === 201) {
          if (Array.isArray(response.data) && response.data.length > 0) {
            const vendor = response?.data?.at(0);
            setAmcInputs({
              ...amcInputs,
              vendorName: vendor?.vendorName,
              vendorCode: vendor?.vendorCode,
              email: vendor?.vendorEmail,
              phone: vendor?.vendorPhone,
            });
          }
        }
      } catch (err) {
        console.log(err);
      }
    }
  };

  const GetCoverageScope = async () => {
    try {
      const { endpoint, method } = Config.AssetWarranty.CoverageScopeAmc;
      const response = await Apirequest(endpoint, method, null, "fam").then(
        (res) => res.data
      );
      setCoverageData(response.data);
      setLoading(false);
    } catch (err) {
      setCoverageData([]);
    }
  };

  useEffect(() => {
    amcInputs.vendorCode !== "" &&
      amcInputs.vendorCode?.length > 5 &&
      GetVendorDetails();
    // : setAmcInputs({
    //     ...amcInputs,
    //     vendorName: "",
    //     email: "",
    //     phone: "",
    //   });
  }, [debouncedSearchTerm]);

  useEffect(() => {
    GetCoverageScope();
  }, []);

  const handleEdit = (list: any) => {
    setOpen(true);
    setEditFlag(true);
    setAmcId(list?.id);
    const newRenewalDueDate = list?.endDate
      ? dayjs(list?.endDate, [
          "YYYY-MM-DDTHH:mm:ssZ",
          "YYYY-MM-DDTHH:mm:ss",
          "YYYY-MM-DD",
        ])
          .utc()
          .subtract(1, "week")
      : null;

    const getCoverage = coverageData
      ?.filter((i: any) => i?.id === list?.coverageTypeId)
      ?.at(0);
    const getStatus = renewalData
      ?.filter((i: any) => i?.id === list?.renewalStatusId)
      ?.at(0);
    setAmcInputs({
      ...amcInputs,
      amcPeriod: list?.period,
      startDate: list?.startDate
        ? dayjs(list?.startDate, [
            "YYYY-MM-DDTHH:mm:ssZ",
            "YYYY-MM-DDTHH:mm:ss",
            "YYYY-MM-DD",
          ])
            .utc()
            .format("YYYY-MM-DD")
        : null,
      endDate: list?.endDate
        ? dayjs(list?.endDate, [
            "YYYY-MM-DDTHH:mm:ssZ",
            "YYYY-MM-DDTHH:mm:ss",
            "YYYY-MM-DD",
          ])
            .utc()
            .format("YYYY-MM-DD")
        : null,
      vendorCode: list?.vendorCode,
      renewalDueDate: newRenewalDueDate
        ? newRenewalDueDate.format("YYYY-MM-DD")
        : "",
      renewedDate: list?.renewedDate
        ? dayjs(list?.renewedDate, [
            "YYYY-MM-DDTHH:mm:ssZ",
            "YYYY-MM-DDTHH:mm:ss",
            "YYYY-MM-DD",
          ])
            .utc()
            .format("YYYY-MM-DD")
        : null,
      coverageScope: getCoverage,
      renewalStatus: getStatus,
      amcStatus: list?.isActive,
      freeServices: list?.freeServiceCount,
      vendorName: list?.vendorName,
      email: list?.vendorEmail,
      phone: list?.vendorPhone,
    });
  };

  const handleDelete = (id: number) => {
    setAmcId(id);
    setDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    DeleteAmc();
    setDeleteOpen(false);
  };

  const DeleteAmc = async () => {
    try {
      const body = {
        id: amcId,
      };
      const { endpoint, method } = Config.AssetWarranty.DeleteAmc;
      const response = await Apirequest(
        endpoint.replace("{id}", `${amcId}`),
        method,
        body,
        "fam"
      ).then((res) => res.data);

      if (response.statusCode === 200 || response.statusCode === 201) {
        toast.success(response.message);
        setOpen(false);
        setEditFlag(false);
        onUpdated && onUpdated();
      } else {
        toast.error(response.message);
      }
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <Box>
      <Box display={"flex"} justifyContent={"end"} alignItems={"center"}>
        <MuiButton className="asset-add-button" onClick={handleOpen}>
          Add AMC
        </MuiButton>
      </Box>

      {loading ? (
        <SkeletonLoader />
      ) : (
        <Table
          aria-label="customized table"
          sx={{
            borderLeft: "1px solid #d8d8d8",
            borderBottom: "1px solid #d8d8d8",
          }}
        >
          <TableHead>
            <TableRow>
              {[
                "Vendor Code",
                "Vendor Name",
                "Start Date",
                "Period (Months)",
                "End Date",
                "Coverage Type",
                "Renewal Status",
                "Renewed Date",
                "Status",
                "Acion",
              ].map((item) => (
                <StyledTableCell align="center" key={item}>
                  {item}
                </StyledTableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {Array.isArray(amcList) &&
              amcList.length > 0 &&
              amcList.map((list, index) => (
                <StyledTableRow key={index}>
                  <StyledTableCell component="th" align="center" scope="row">
                    {list?.vendorCode}
                  </StyledTableCell>
                  <StyledTableCell component="th" align="center" scope="row">
                    {list?.vendorName}
                  </StyledTableCell>
                  <StyledTableCell component="th" align="center" scope="row">
                    {list?.startDate?.split(" ")?.at(0)}
                  </StyledTableCell>
                  <StyledTableCell component="th" align="center" scope="row">
                    {list?.period}
                  </StyledTableCell>
                  <StyledTableCell component="th" align="center" scope="row">
                    {list?.endDate?.split(" ")?.at(0)}
                  </StyledTableCell>
                  <StyledTableCell component="th" align="center" scope="row">
                    {list?.coverageType}
                  </StyledTableCell>
                  <StyledTableCell component="th" align="center" scope="row">
                    {list?.renewalStatus}
                  </StyledTableCell>
                  <StyledTableCell component="th" align="center" scope="row">
                    {list?.renewedDate?.split(" ")?.at(0)}
                  </StyledTableCell>
                  <StyledTableCell component="th" align="center" scope="row">
                    {list?.isActive === 1 ? (
                      <MuiText variant="caption" color="success">
                        Active
                      </MuiText>
                    ) : (
                      <MuiText variant="caption" color="error">
                        Inactive
                      </MuiText>
                    )}
                  </StyledTableCell>
                  <StyledTableCell component="th" align="center" scope="row">
                    <Box
                      display={"flex"}
                      alignItems={"center"}
                      justifyContent={"center"}
                      gap={2}
                    >
                      <FaEdit
                        fontSize={18}
                        cursor={"pointer"}
                        onClick={() => handleEdit(list)}
                      />
                      <RiDeleteBinFill
                        fontSize={18}
                        cursor={"pointer"}
                        color="red"
                        onClick={() => handleDelete(list?.id)}
                      />
                    </Box>
                  </StyledTableCell>
                </StyledTableRow>
              ))}
          </TableBody>
        </Table>
      )}
      <AddAMCPop
        open={open}
        close={handleClose}
        inputs={amcInputs}
        handleSubmit={handleSubmit}
        handleChange={handleChange}
        handleDate={handleDate}
        errors={errors}
        handleAutocomplete={handleAutocomplete}
        coverageData={coverageData}
        renewalData={renewalData}
        handleSwitch={handleSwitch}
        editFlag={editFlag}
      />
      <DeleteConfirmation
        open={deleteOpen}
        close={() => setDeleteOpen(false)}
        handleDelete={handleConfirmDelete}
      />
      <ErrorModal
        open={errorModalOpen}
        onClose={() => setErrorModalOpen(false)}
        errors={errorMessages}
      />
    </Box>
  );
}

export default AssetDetailAmc;
