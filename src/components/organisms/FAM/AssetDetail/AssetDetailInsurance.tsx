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
import React, { useEffect, useState } from "react";
import AddInsurancePop from "./AddInsurancePop";
import dayjs from "dayjs";
import Config from "../../../../utils/fam.api.json";
import {
  Apirequest,
  isSubmitting,
  parseDateString,
  startLoading,
  stopLoading,
} from "../../../../utils/lib";
import Swal from "sweetalert2";
import { FaEdit } from "react-icons/fa";
import { RiDeleteBinFill } from "react-icons/ri";
import SkeletonLoader from "../../../molecules/AdminLayout/SkeletonLoader";
import DeleteConfirmation from "../../../molecules/Master/DeleteConfirmation";
import ErrorModal from "../../../molecules/Master/Role/ErrorModal";
import toast from "react-hot-toast";

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

export interface AssetInsuranceInputTypes {
  policyNo: string;
  fromDate: any;
  toDate: any;
  period: string;
  amount: string;
  vendor: string;
  renewalDate: any;
  renewalStatus: any;
  renewedDate: any;
  isActive: number;
}

function AssetDetailInsurance({
  insuranceList,
  renewalData,
  pathname,
  onUpdated,
}: any) {
  const [open, setOpen] = useState(false);
  const [editFlag, setEditFlag] = React.useState(false);

  const [insuranceInputs, setInsuranceInputs] =
    useState<AssetInsuranceInputTypes>({
      policyNo: "",
      fromDate: "",
      toDate: "",
      period: "",
      amount: "",
      vendor: "",
      renewalDate: "",
      renewalStatus: "",
      renewedDate: "",
      isActive: 1,
    });
  const [errors, setErrors] = useState([]);
  const [insuranceId, setInsuranceId] = useState(0);
  const [loading, setLoading] = React.useState(false);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [errorModalOpen, setErrorModalOpen] = React.useState(false);
  const [errorMessages, setErrorMessages] = React.useState<string[]>([]);

  const handleOpen = () => {
    setOpen(true);
    setEditFlag(false);

    setErrors([]);
  };

  const handleClose = () => {
    setOpen(false);
    setErrors([]);
    setInsuranceInputs({
      policyNo: "",
      fromDate: "",
      toDate: "",
      period: "",
      amount: "",
      vendor: "",
      renewalDate: "",
      renewalStatus: "",
      renewedDate: "",
      isActive: 1,
    });
    setEditFlag(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let { name, value } = e.target;
    setErrors([]);
    setInsuranceInputs({ ...insuranceInputs, [name]: value });
  };

  const handleSubmit = async () => {
    if (isSubmitting()) return;

    let temp: any = [];

    Object.entries(insuranceInputs).forEach(([key, value]: any) => {
      if (value === "" || value === null) {
        temp.push(key);
      }
    });

    setErrors(temp);

    if (temp.length === 0) {
      try {
        setLoading(true);
        await AddInsurance();
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSwitch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrors([]);
    e.target.checked
      ? setInsuranceInputs({ ...insuranceInputs, isActive: 1 })
      : setInsuranceInputs({ ...insuranceInputs, isActive: 0 });
  };

  const AddInsurance = async () => {
    const body: any = {
      assetId: Number(pathname),
      policyNo: insuranceInputs.policyNo?.trim(),
      startDate: dayjs(insuranceInputs.fromDate).format("YYYY-MM-DD"),
      insuranceperiod: Number(insuranceInputs.period),
      endDate: dayjs(insuranceInputs.toDate).format("YYYY-MM-DD"),
      policyAmount: Number(insuranceInputs.amount),
      vendorCode: insuranceInputs.vendor?.trim(),
      renewalStatus: insuranceInputs.renewalStatus?.id,
      renewedDate: dayjs(insuranceInputs.renewedDate).format("YYYY-MM-DD"),
      isActive: insuranceInputs.isActive,
    };
    if (insuranceId) {
      body["id"] = insuranceId;
    }
    try {
      startLoading();
      const { endpoint, method } = editFlag
        ? Config.AssetWarranty.UpdateInsurance
        : Config.AssetWarranty.AddInsurance;
      const response = await Apirequest(endpoint, method, body, "fam").then(
        (res) => res.data
      );
      if (response?.statusCode === 200 || response?.statusCode === 201) {
        onUpdated && onUpdated();
        handleClose();
        setTimeout(() => {
          Swal.fire({
            title: editFlag
              ? "Asset Insurance Update Successfully"
              : "Asset Insurance Added Successfully",
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
    } finally {
      stopLoading();
    }
  };

  const handleDate = (value: dayjs.Dayjs | null, field?: string) => {
    setErrors([]);
    switch (field) {
      case "from":
        const periodInMonths = parseInt(insuranceInputs.period) || 0;
        const endDate = value
          ? dayjs(value).add(periodInMonths, "month")
          : null;
        const renewalDueDate = endDate
          ? dayjs(endDate).subtract(1, "week")
          : null;
        return setInsuranceInputs({
          ...insuranceInputs,
          fromDate: value ? dayjs(value).format("YYYY-MM-DD") : "",
          toDate: endDate ? endDate.format("YYYY-MM-DD") : "",
          renewalDate: renewalDueDate
            ? renewalDueDate.format("YYYY-MM-DD")
            : "",
        });
      case "to":
        const newRenewalDueDate = value
          ? dayjs(value).subtract(1, "week")
          : null;
        return setInsuranceInputs({
          ...insuranceInputs,
          toDate: dayjs(value).format("YYYY-MM-DD"),
          renewalDate: newRenewalDueDate
            ? newRenewalDueDate.format("YYYY-MM-DD")
            : "",
        });

      case "renewable":
      case "renewedDate":
        return setInsuranceInputs({
          ...insuranceInputs,
          [field === "renewable" ? "renewable" : "renewedDate"]: value
            ? dayjs(value).format("YYYY-MM-DD")
            : "",
        });
    }
  };

  const handleEdit = (list: any) => {
    setOpen(true);
    setEditFlag(true);

    const status = renewalData.find(
      (item: any) => item.code === list.renewalStatus
    );
    setInsuranceId(list?.id);

    setInsuranceInputs({
      ...insuranceInputs,
      policyNo: list?.policyNo,
      amount: list?.policyAmount,
      period: list?.insuranceperiod,
      fromDate: parseDateString(list?.startDate),
      toDate: parseDateString(list?.endDate),
      renewedDate: parseDateString(list?.renewedDate),
      renewalDate: parseDateString(list?.endDate)?.subtract(1, "week"),
      vendor: list?.vendorCode,
      isActive: list?.isActive,
      renewalStatus: status,
    });
  };
  const handleAutocomplete = (value: any, field: string) => {
    setErrors([]);
    setInsuranceInputs((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleDelete = (id: number) => {
    setInsuranceId(id);
    setDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    DeleteAmc();
    setDeleteOpen(false);
  };

  const DeleteAmc = async () => {
    try {
      const body = {
        id: insuranceId,
      };
      const { endpoint, method } = Config.AssetWarranty.DeleteInsurance;
      const response = await Apirequest(
        endpoint.replace("{id}", `${insuranceId}`),
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
          Add Insurance
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
                "Policy No.",
                "From Date",
                "Period (Months)",
                "To Date",
                "Policy Amount",
                "Vendor Code",
                "Renewed Date",
                "Renewal Status",
                "Status",
                "Action",
              ].map((item) => (
                <StyledTableCell align="center" key={item}>
                  {item}
                </StyledTableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {Array.isArray(insuranceList) &&
              insuranceList.length > 0 &&
              insuranceList.map((list, index) => (
                <StyledTableRow key={index}>
                  <StyledTableCell component="th" align="center" scope="row">
                    {list?.policyNo}
                  </StyledTableCell>
                  <StyledTableCell component="th" align="center" scope="row">
                    {list?.startDate?.split(" ")?.at(0)}
                  </StyledTableCell>
                  <StyledTableCell component="th" align="center" scope="row">
                    {list?.insuranceperiod}
                  </StyledTableCell>
                  <StyledTableCell component="th" align="center" scope="row">
                    {list?.endDate?.split(" ")?.at(0)}
                  </StyledTableCell>
                  <StyledTableCell component="th" align="center" scope="row">
                    {list?.policyAmount}
                  </StyledTableCell>
                  <StyledTableCell component="th" align="center" scope="row">
                    {list?.vendorCode}
                  </StyledTableCell>
                  <StyledTableCell component="th" align="center" scope="row">
                    {list?.renewedDate?.split(" ")?.at(0)}
                  </StyledTableCell>
                  <StyledTableCell component="th" align="center" scope="row">
                    {list?.renewalStatus}
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
      <AddInsurancePop
        open={open}
        close={handleClose}
        inputs={insuranceInputs}
        handleSubmit={handleSubmit}
        handleChange={handleChange}
        handleDate={handleDate}
        errors={errors}
        handleAutocomplete={handleAutocomplete}
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

export default AssetDetailInsurance;
