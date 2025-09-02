import {
  Autocomplete,
  Box,
  Card,
  Checkbox,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid2,
  Pagination,
  Skeleton,
  Stack,
} from "@mui/material";
import Config from "../../../../utils/fam.api.json";
import React, { useEffect, useState } from "react";
import IconBreadcrumbs from "../../../molecules/AdminLayout/BreadCrumbs";
import { MuiButton, MuiInputField, MuiText } from "bsoft-base-elements";
import InputDatePicker from "../../../atoms/Datepicker";
import {
  Apirequest,
  isSubmitting,
  startLoading,
  stopLoading,
} from "../../../../utils/lib";
import { useDebounce } from "../../../../hooks/useDebounceHook";
import { FaAngleRight } from "react-icons/fa6";
import NoDataFound from "../../../molecules/AdminLayout/NoDataFound";
import Swal from "sweetalert2";
import ErrorModal from "../../../molecules/Master/Role/ErrorModal";
import dayjs from "dayjs";
import toast from "react-hot-toast";

export interface TransferApprovalProps {
  id: number;
  transferType: string;
  transferFrom: string;
  transferTo: string;
  transferDate: string;
  assetId: 0;
  assetName: string;
}

export default function TransferApprovalpage() {
  const [transferTypeData, setTransferTypeData] = React.useState<any>(null);
  const [selectedTransfertype, setSelectedTransfertype] = useState<any>(null);
  const [page, setPage] = React.useState<number>(1);
  const [size, setSize] = React.useState<number>(15);
  const [loading, setLoading] = React.useState(true);
  const [count, setCount] = React.useState<number>(0);
  const [search, setSearch] = React.useState("");
  const [fromdate, setFromdate] = React.useState(null);
  const [todate, setTodate] = React.useState(null);
  const [transferType, setTransferType] = React.useState<string>("");
  const debouncedSearchTerm = useDebounce(search, 500);
  const [initFlag, setInitFlag] = React.useState(false);
  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [errorMessages, setErrorMessages] = useState<string[]>([]);
  const [transferApprovalData, setTransferApprovalData] = React.useState<any[]>(
    []
  );
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [transferApprovalId, setTransferApprovalId] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<any[]>([]);
  const [checkAll, setCheckAll] = useState(false);
  const [transferApprovalInput, setTransferApprovalInput] =
    React.useState<TransferApprovalProps>({
      id: 0,
      transferType: "",
      transferFrom: "",
      transferTo: "",
      transferDate: "",
      assetId: 0,
      assetName: "",
    });
  const handleExpandClick = async (id: number) => {
    if (expandedId === id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(id);
    await GetAllTransferApproval(id);
  };
  const handleSearch = (
    e: React.ChangeEvent<HTMLInputElement> | any,
    name?: string
  ) => {
    let value = e?.target ? e.target.value : e;
    let fieldName = name || e?.target?.name;

    if (fieldName === "fromDate") {
      setFromdate(value);
    } else if (fieldName === "toDate") {
      setTodate(value);
    } else if (fieldName === "transferType") {
      setTransferType(value);
    }
  };
  const handleChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };
  const handleCheckAllChange = () => {
    if (checkAll) {
      setSelectedIds([]);
    } else {
      setSelectedIds(transferApprovalData.map((item) => item.id));
    }
    setCheckAll(!checkAll);
  };

  const handleCheckboxChange = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const GetTransferApprovalList = async () => {
    try {
      setLoading(true);
      const { endpoint, method } = Config.AssetTransferApproval;

      const formattedTransferType = transferType ? transferType.toString() : "";

      const result = await Apirequest(
        endpoint
          .replace("{page}", page.toString())
          .replace("{size}", size.toString())
          .replace("{searchTerm}", search)
          .replace(
            "{FromDate}",
            fromdate ? dayjs(fromdate).format("YYYY-MM-DD") : ""
          )
          .replace("{ToDate}", todate ? dayjs(todate).format("YYYY-MM-DD") : "")
          .replace("{TransferType}", formattedTransferType),
        method,
        null,
        "fam"
      ).then((res) => res.data);

      setTransferApprovalData(result?.data ?? []);
      setCount(result?.totalCount ?? 0);
    } catch (err) {
      console.log(err);
      setTransferApprovalData([]);
    } finally {
      setLoading(false);
    }
  };

  const GetAllTransferApproval = async (id: number) => {
    try {
      setTransferApprovalId([]);
      const { endpoint, method } =
        Config.AssetTransferApproval.GetTransferApproval;
      const url = endpoint.replace("{id}", id?.toString());
      const result = await Apirequest(url, method, null, "fam").then(
        (res) => res.data
      );
      setTransferApprovalId(result?.data ?? []);
    } catch (err) {
      console.error("Error fetching data:", err);
      setTransferApprovalId([]);
    }
  };

  const handleAction = async (status: "Approved" | "Rejected") => {
    if (selectedIds.length === 0) {
      console.warn("No items selected");
      return;
    }

    if (isSubmitting()) return;
    startLoading();

    try {
      const { endpoint, method } =
        Config.AssetTransferApproval.AddTransferApproval;
      const payload = { id: selectedIds, status };

      const result = await Apirequest(endpoint, method, payload, "fam");
      const { statusCode, errors, message } = result.data;

      if (statusCode !== 200) {
        setErrorMessages(errors);
        setErrorModalOpen(true);
      } else {
        await Swal.fire({
          title: message,
          icon: "success",
          confirmButtonText: "Okay",
          customClass: { title: "custom-title" },
        });
      }

      setSelectedIds([]);
      setCheckAll(false);
      GetTransferApprovalList();
    } catch (err) {
      console.error("Error performing action:", err);
    } finally {
      stopLoading();
    }
  };

  const GetTransfer = async () => {
    try {
      const { endpoint, method } = Config.AssetTransfer.AssetTransferTypes;
      const result = await Apirequest(endpoint, method, null, "fam");
      setTransferTypeData(result?.data?.data);
    } catch (err) {
      console.log(err);
      setTransferTypeData([]);
    }
  };
  const handleTransferTypeChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    value: any,
    field: string
  ) => {
    if (field === "Transfercode") {
      if (!value?.id) {
        setSelectedTransfertype(null);
        setTransferApprovalInput((prev) => ({ ...prev, code: 0 }));
        setTransferType("");
      } else {
        setSelectedTransfertype(value);
        setTransferApprovalInput((prev) => ({ ...prev, code: value.id }));
        handleSearch(value.id, "transferType");
      }
    }
  };

  useEffect(() => {
    GetTransfer();
    setInitFlag(true);
  }, []);

  useEffect(() => {
    GetTransferApprovalList();
  }, [transferType, fromdate, todate, page, size, debouncedSearchTerm]);

  return (
    <Box>
      <Box my={2}>
        <IconBreadcrumbs
          parent={"Transfer"}
          child={"Transfer Approval"}
          path=" "
        />
      </Box>

      <Grid2
        container
        spacing={2}
        my={1}
        height={"100%"}
        maxHeight={790}
        overflow={"auto"}
        bgcolor={"#fff"}
        borderRadius={2}
      >
        <DialogContent>
          <DialogTitle className="highlighted-header" sx={{ pt: 0, pl: 0 }}>
            Transfer Approval
          </DialogTitle>
          <Grid2
            container
            spacing={2}
            alignItems={"center"}
            size={{ xs: 12, sm: 12, md: 12, lg: 12, xl: 12 }}
            my={"12px"}
            display={"flex"}
            sx={{
              justifyContent: {
                xs: "center",
                sm: "space-between",
                md: "space-between",
                lg: "space-between",
              },
            }}
            justifyContent={"center"}
          >
            <Grid2 size={{ xs: 4, sm: 4, md: 4, lg: 4 }}>
              <FormControl fullWidth>
                <Grid2 display={"flex"} alignItems={"center"} gap={1}>
                  <MuiText
                    variant="h6"
                    my={1}
                    mb={"2px"}
                    gap={1}
                    sx={{ width: "auto", whiteSpace: "nowrap" }}
                    className="admin-label-title"
                    width={"auto"}
                  >
                    From Date
                  </MuiText>
                  <InputDatePicker
                    slotProps={{
                      textField: { size: "small", placeholder: "" },
                    }}
                    format="DD-MM-YYYY"
                    onChange={(newValue) => handleSearch(newValue, "fromDate")}
                    name="fromDate"
                  />
                </Grid2>
              </FormControl>
            </Grid2>
            <Grid2 size={{ xs: 4, sm: 4, md: 4, lg: 4 }}>
              <FormControl fullWidth>
                <Grid2 display={"flex"} alignItems={"center"} gap={1}>
                  <MuiText
                    variant="h6"
                    my={1}
                    mb={"2px"}
                    gap={1}
                    sx={{ width: "auto", whiteSpace: "nowrap" }}
                    className="admin-label-title"
                    width={"auto"}
                  >
                    To Date
                  </MuiText>
                  <InputDatePicker
                    slotProps={{
                      textField: { size: "small", placeholder: "" },
                    }}
                    format="DD-MM-YYYY"
                    onChange={(newValue) => handleSearch(newValue, "toDate")}
                    name="toDate"
                  />
                </Grid2>
              </FormControl>
            </Grid2>
            <Grid2 size={{ xs: 4, sm: 4, md: 4, lg: 4 }}>
              <FormControl fullWidth>
                <Grid2 display={"flex"} alignItems={"center"} gap={1}>
                  <MuiText
                    fontSize={"13px"}
                    my={1}
                    mb={"2px"}
                    gap={1}
                    sx={{ width: "auto", whiteSpace: "nowrap" }}
                    className="admin-label-title"
                  >
                    Transfer Type code
                  </MuiText>
                  <Autocomplete
                    options={transferTypeData || []}
                    id="state-autocomplete"
                    fullWidth
                    size="small"
                    value={selectedTransfertype}
                    onChange={(event, value) =>
                      handleTransferTypeChange(
                        event as React.ChangeEvent<HTMLInputElement>,
                        value,
                        "Transfercode"
                      )
                    }
                    getOptionLabel={(option: any) => option?.code}
                    renderOption={(props, option) => (
                      <li {...props} key={option?.id}>
                        {option?.code}
                      </li>
                    )}
                    renderInput={(params) => (
                      <MuiInputField
                        {...params}
                        name="code"
                        value={transferApprovalInput.transferType}
                        // error={error.includes("locationId")}
                        // helperText={
                        //   error.includes("locationId") &&
                        //   "Please select a locationId"
                        // }
                      />
                    )}
                  />
                </Grid2>
              </FormControl>
            </Grid2>
          </Grid2>

          <Box mt={2}>
            {loading ? (
              Array.from(new Array(8)).map((_, index) => (
                <Grid2 container spacing={2} key={index}>
                  <Grid2 size={12}>
                    <Skeleton height={50} width="100%" sx={{ mb: 1 }} />
                  </Grid2>
                </Grid2>
              ))
            ) : transferApprovalData?.length > 0 ? (
              <>
                <Grid2 my={1} size={12} container>
                  <Grid2
                    display="flex"
                    gap={2}
                    alignItems="center"
                    size={2}
                    paddingRight={1.2}
                    spacing={1}
                    p={1}
                  >
                    <Checkbox
                      checked={checkAll}
                      onChange={handleCheckAllChange}
                      sx={{ color: "#147d9e", p: 0, m: 0 }}
                    />
                    <MuiText className="admin-label-title">Select All</MuiText>
                  </Grid2>
                  <Grid2
                    gap={5}
                    display="flex"
                    justifyContent={"flex-end"}
                    alignItems="center"
                    size={10}
                  >
                    <Box>
                      <MuiButton
                        variant="contained"
                        onClick={() => handleAction("Approved")}
                        disabled={isSubmitting()}
                      >
                        Approve
                      </MuiButton>
                    </Box>
                    <Box>
                      <MuiButton
                        variant="contained"
                        onClick={() => handleAction("Rejected")}
                        disabled={isSubmitting()}
                      >
                        Reject
                      </MuiButton>
                    </Box>
                  </Grid2>
                </Grid2>
                {transferApprovalData.map((data, index) => (
                  <Box key={index} mt={2}>
                    <Card
                      key={data.id}
                      sx={{
                        p: 2,
                        my: 1,
                        boxShadow: "0px 0px 10px 3px rgba(0, 0, 0, 0.075)",
                      }}
                    >
                      <Grid2 container>
                        <Grid2
                          size={0.5}
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                        >
                          <MuiText
                            className="admin-label-title"
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              cursor: "pointer",
                            }}
                            onClick={() => handleExpandClick(data.id)}
                          >
                            <FaAngleRight
                              fontSize="0.9rem"
                              style={{
                                transform:
                                  expandedId === data.id
                                    ? "rotate(90deg)"
                                    : "rotate(0deg)",
                                transition: "0.2s",
                              }}
                            />
                          </MuiText>
                        </Grid2>
                        <Grid2 size={11.5}>
                          <Box display="flex" gap={2}>
                            <MuiText className="admin-label-title">
                              <Checkbox
                                checked={selectedIds.includes(data.id)}
                                onChange={() => handleCheckboxChange(data.id)}
                                sx={{ color: "#147d9e", p: 0, m: 0 }}
                              />
                            </MuiText>
                            <MuiText
                              whiteSpace="nowrap"
                              display={"flex"}
                              gap={1}
                            >
                              <MuiText fontWeight={600}>Id:</MuiText> {data.id}
                            </MuiText>
                            <MuiText>|</MuiText>
                            <MuiText
                              whiteSpace="nowrap"
                              display={"flex"}
                              gap={1}
                            >
                              <MuiText fontWeight={600}> Doc Date:</MuiText>
                              {new Date(data.docDate).toLocaleDateString(
                                "en-GB",
                                {
                                  day: "2-digit",
                                  month: "2-digit",
                                  year: "numeric",
                                }
                              )}
                            </MuiText>
                            <MuiText>|</MuiText>

                            <Box
                              sx={{
                                display: "flex",
                                overflowX: "hidden",
                                maxWidth: "900px",
                                whiteSpace: "nowrap",
                                gap: 2,
                                border: "none",
                                scrollbarWidth: "none",
                                "&::-webkit-scrollbar": {
                                  display: "none",
                                },
                                "&:hover": {
                                  overflowX: "auto",
                                  scrollbarWidth: "thin",
                                  "&::-webkit-scrollbar": {
                                    display: "block",
                                    height: "6px",
                                  },
                                },
                              }}
                            >
                              <MuiText
                                whiteSpace={"nowrap"}
                                display={"flex"}
                                gap={1}
                              >
                                <MuiText fontWeight={600}>
                                  Transfer Type:
                                </MuiText>
                                {data.transferType}
                              </MuiText>
                              <MuiText>|</MuiText>
                              <MuiText
                                whiteSpace={"nowrap"}
                                display={"flex"}
                                gap={1}
                              >
                                <MuiText fontWeight={600}>From Unit:</MuiText>
                                {data.fromUnitname}
                              </MuiText>
                              <MuiText>|</MuiText>
                              <MuiText
                                whiteSpace={"nowrap"}
                                display={"flex"}
                                gap={1}
                              >
                                <MuiText fontWeight={600}>To Unit:</MuiText>
                                {data.toUnitname}
                              </MuiText>
                              <MuiText>|</MuiText>
                              <MuiText
                                whiteSpace={"nowrap"}
                                display={"flex"}
                                gap={1}
                              >
                                <MuiText fontWeight={600}>
                                  From Department:
                                </MuiText>
                                {data.fromDepartment}
                              </MuiText>
                              <MuiText>|</MuiText>
                              <MuiText
                                whiteSpace={"nowrap"}
                                display={"flex"}
                                gap={1}
                              >
                                <MuiText fontWeight={600}>
                                  To Department:
                                </MuiText>
                                {data.toDepartment}
                              </MuiText>
                              <MuiText>|</MuiText>
                              <MuiText
                                whiteSpace={"nowrap"}
                                display={"flex"}
                                gap={1}
                              >
                                <MuiText fontWeight={600}>Status:</MuiText>
                                {data.status}
                              </MuiText>
                            </Box>
                          </Box>
                        </Grid2>
                      </Grid2>
                    </Card>
                    <Grid2 container>
                      {expandedId === data.id && (
                        <Grid2 size={12}>
                          {transferApprovalId.length > 0 ? (
                            transferApprovalId.map((item, index) => (
                              <Card
                                sx={{
                                  p: 2,
                                  boxShadow: "none",
                                  border: "1px solid #e8e8e8",
                                  my: 1,
                                }}
                                key={item.id}
                              >
                                <Grid2 container spacing={2}>
                                  <Grid2
                                    size={1}
                                    display="flex"
                                    alignItems="baseline"
                                    justifyContent="center"
                                  >
                                    <MuiText className="admin-label-title">
                                      {index + 1}
                                    </MuiText>
                                  </Grid2>
                                  <Grid2 size={4}>
                                    <Box>
                                      <MuiText className="admin-label-title">
                                        Asset Code
                                      </MuiText>
                                      <MuiText
                                        variant="h6"
                                        className="admin-page-title"
                                      >
                                        {item.assetCode}
                                      </MuiText>
                                    </Box>
                                  </Grid2>
                                  <Grid2 size={4}>
                                    <Box>
                                      <MuiText className="admin-label-title">
                                        Asset Name
                                      </MuiText>
                                      <MuiText
                                        variant="h6"
                                        className="admin-page-title"
                                      >
                                        {item.assetName}
                                      </MuiText>
                                    </Box>
                                  </Grid2>
                                  <Grid2 size={3}>
                                    <Box>
                                      <MuiText className="admin-label-title">
                                        Asset Value
                                      </MuiText>
                                      <MuiText
                                        variant="h6"
                                        className="admin-page-title"
                                      >
                                        {item.assetValue}
                                      </MuiText>
                                    </Box>
                                  </Grid2>
                                </Grid2>
                              </Card>
                            ))
                          ) : (
                            <MuiText>No Asset Details</MuiText>
                          )}
                        </Grid2>
                      )}
                    </Grid2>
                  </Box>
                ))}
              </>
            ) : (
              <Grid2
                size={12}
                sx={{
                  height: "60vh",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <NoDataFound />
              </Grid2>
            )}
          </Box>
          {Array.isArray(transferApprovalData) &&
            transferApprovalData.length !== 0 && (
              <Grid2
                size={12}
                mt={2}
                sx={{
                  justifyContent: "space-between",
                  alignItems: "center",
                  display: "flex",
                  position: "sticky",
                }}
              >
                <Box sx={{ display: "flex" }} gap={2}>
                  <MuiText fontSize={14}>Page: {page}</MuiText>
                  <MuiText fontSize={14}>size: {size}</MuiText>
                  <MuiText fontSize={14}>count: {count}</MuiText>
                </Box>
                <Stack spacing={2}>
                  <Pagination
                    count={Math.ceil(count / size)}
                    page={page}
                    color="primary"
                    onChange={handleChange}
                  />{" "}
                </Stack>
              </Grid2>
            )}
        </DialogContent>
      </Grid2>

      <ErrorModal
        open={errorModalOpen}
        onClose={() => setErrorModalOpen(false)}
        errors={errorMessages}
      />
    </Box>
  );
}
