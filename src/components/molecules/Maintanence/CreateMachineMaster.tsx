import * as React from "react";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import Slide from "@mui/material/Slide";
import { TransitionProps } from "@mui/material/transitions";
import { Autocomplete, Box, FormGroup, Grid2 } from "@mui/material";
import { IoClose } from "react-icons/io5";
import {
  MuiButton,
  MuiInputField,
  MuiSwitch,
  MuiText,
} from "bsoft-base-elements";
import {
  AdditionalSpec,
  CreateMachineMasterProps,
  SpecificationOption,
} from "../../../types/maintanenceTypes";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { useRecoilValue } from "recoil";
import { UserData } from "../../../utils/atoms";
import { DateFormatter, isSubmitting } from "../../../utils/lib";
import { StyledAutocomplete } from "../../../utils/lib";
import { MdOutlineLibraryAdd } from "react-icons/md";
import { RiDeleteBin6Line } from "react-icons/ri";

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function CreateMachineMaster({
  open,
  close,
  inputs,
  handleChange,
  handleSwitch,
  handleAutocomplete,
  handleDate,
  handleSubmit,
  error,
  editFlag,
  assetSpecData,
  handleAddSpec,
  handleDeleteSpec,
  specList,
  Specification,
  getFilteredSpecOptions,
  setSpecList,
}: CreateMachineMasterProps) {
  const userValue = useRecoilValue(UserData);
  return (
    <React.Fragment>
      <Dialog
        open={open}
        TransitionComponent={Transition}
        keepMounted
        fullScreen
        aria-describedby="alert-dialog-slide-description"
      >
        <Box className="popup-header-wrapper">
          <h2 className="dialog-header">
            {" "}
            {`${editFlag ? "Edit" : "Create"}`} Machine
          </h2>
          <IoClose
            fontSize={24}
            onClick={close}
            cursor={"pointer"}
            color="#fff"
          />
        </Box>
        <DialogContent>
          <Grid2 container spacing={2} sx={{ height: "100%" }}>
            <Grid2
              size={{ xs: 12, sm: 12, md: 8 }}
              borderRight={"1.5px solid #d8d8d8a1"}
              pr={2}
              sx={{
                height: "100%",
                padding: "10px",
              }}
            >
              <Grid2 container spacing={3} mt={2}>
                <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                  <MuiText variant="h6" className="admin-label-title" mb={0.5}>
                    Machine Code <span className="mandatory-sign">*</span>
                  </MuiText>
                  <MuiInputField
                    fullWidth
                    variant="outlined"
                    size="small"
                    onChange={handleChange}
                    name="machineCode"
                    value={inputs.machineCode.toUpperCase()}
                    InputProps={{
                      inputProps: {
                        maxLength: 15,
                      },
                    }}
                    disabled={editFlag}
                    autoComplete="off"
                    error={error.includes("machineCode")}
                    helperText={
                      error.includes("machineCode") && "please select a code"
                    }
                  />
                </Grid2>
                <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                  <MuiText variant="h6" className="admin-label-title" mb={0.5}>
                    Machine Name <span className="mandatory-sign">*</span>
                  </MuiText>
                  <MuiInputField
                    fullWidth
                    variant="outlined"
                    onChange={handleChange}
                    size="small"
                    name="machineName"
                    value={inputs.machineName}
                    InputProps={{
                      inputProps: {
                        maxLength: 25,
                      },
                    }}
                    autoComplete="off"
                    error={error.includes("name")}
                    helperText={
                      error.includes("name") && "please select a name"
                    }
                  />
                </Grid2>
                <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                  <MuiText variant="h6" className="admin-label-title" mb={0.5}>
                    Machine Group Name <span className="mandatory-sign">*</span>
                  </MuiText>
                  <StyledAutocomplete
                    options={inputs.machineGroupData || []}
                    id="country-autocomplete"
                    fullWidth
                    value={inputs.selecetdMachineGroup}
                    onChange={(event, value: any) =>
                      handleAutocomplete(value, "machineGroup")
                    }
                    getOptionLabel={(option: any) => option.groupName || ""}
                    isOptionEqualToValue={(option: any, value: any) =>
                      option?.id === value?.id
                    }
                    size="small"
                    renderInput={(params) => (
                      <MuiInputField {...params} name="group" />
                    )}
                  />
                </Grid2>
                <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                  <MuiText variant="h6" className="admin-label-title" mb={0.5}>
                    Unit Name <span className="mandatory-sign">*</span>
                  </MuiText>
                  <MuiInputField
                    fullWidth
                    variant="outlined"
                    size="small"
                    value={userValue.unitName}
                  />
                </Grid2>
              </Grid2>
              <Grid2 container spacing={3} mt={2}>
                <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                  <MuiText variant="h6" className="admin-label-title" mb={0.5}>
                    Line Number <span className="mandatory-sign">*</span>
                  </MuiText>
                  <StyledAutocomplete
                    options={inputs.lineNumberData || []}
                    id="country-autocomplete"
                    fullWidth
                    value={inputs.selectedLineNumber}
                    onChange={(event, value: any) =>
                      handleAutocomplete(value, "lineNumber")
                    }
                    getOptionLabel={(option: any) =>
                      `${option.code} - ${option.description}` || ""
                    }
                    isOptionEqualToValue={(option: any, value: any) =>
                      option.id === value.id
                    }
                    size="small"
                    renderInput={(params) => (
                      <MuiInputField {...params} name="group" />
                    )}
                  />
                </Grid2>
                <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                  <MuiText variant="h6" className="admin-label-title" mb={0.5}>
                    Production Department
                  </MuiText>
                  <MuiInputField
                    size="small"
                    fullWidth
                    value={inputs.prodDept}
                  />
                </Grid2>
                <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                  <MuiText variant="h6" className="admin-label-title" mb={0.5}>
                    Production Capacity (per shift)
                  </MuiText>
                  <MuiInputField
                    fullWidth
                    variant="outlined"
                    size="small"
                    autoComplete="off"
                    name="productionCapacity"
                    onChange={handleChange}
                    value={inputs.productionCapacity}
                    InputProps={{
                      inputProps: {
                        maxLength: 8,
                      },
                    }}
                  />
                </Grid2>
                <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                  <MuiText variant="h6" className="admin-label-title" mb={0.5}>
                    UOM Name <span className="mandatory-sign">*</span>
                  </MuiText>
                  <StyledAutocomplete
                    options={inputs.uomData || []}
                    value={inputs.selectedUom}
                    id="country-autocomplete"
                    fullWidth
                    onChange={(event, value: any) =>
                      handleAutocomplete(value, "uom")
                    }
                    getOptionLabel={(option: any) => option.uomName || ""}
                    isOptionEqualToValue={(option: any, value: any) =>
                      option.id === value.id
                    }
                    size="small"
                    renderInput={(params) => (
                      <MuiInputField {...params} name="group" />
                    )}
                  />
                </Grid2>
              </Grid2>
              <Grid2 container spacing={3} mt={2}>
                <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                  <MuiText variant="h6" className="admin-label-title" mb={0.5}>
                    Shift Name <span className="mandatory-sign">*</span>
                  </MuiText>
                  <StyledAutocomplete
                    options={inputs.shiftData || []}
                    value={inputs.selectedShift}
                    id="country-autocomplete"
                    fullWidth
                    onChange={(event, value: any) =>
                      handleAutocomplete(value, "shift")
                    }
                    getOptionLabel={(option: any) => option.shiftName || ""}
                    isOptionEqualToValue={(option: any, value: any) =>
                      option.id === value.id
                    }
                    size="small"
                    renderInput={(params) => (
                      <MuiInputField {...params} name="group" />
                    )}
                  />
                </Grid2>
                <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                  <MuiText variant="h6" className="admin-label-title" mb={0.5}>
                    Work Center Name <span className="mandatory-sign">*</span>
                  </MuiText>
                  <StyledAutocomplete
                    options={inputs.workCenterData || []}
                    value={inputs.selectedWorkCenter}
                    id="country-autocomplete"
                    fullWidth
                    onChange={(event, value: any) =>
                      handleAutocomplete(value, "work")
                    }
                    getOptionLabel={(option: any) =>
                      option.workCenterName || ""
                    }
                    isOptionEqualToValue={(option: any, value: any) =>
                      option.id === value.id
                    }
                    size="small"
                    renderInput={(params) => (
                      <MuiInputField {...params} name="group" />
                    )}
                  />
                </Grid2>
                <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                  <MuiText variant="h6" className="admin-label-title" mb={0.5}>
                    Cost Center Name <span className="mandatory-sign">*</span>
                  </MuiText>
                  <StyledAutocomplete
                    options={inputs.costCenterData || []}
                    value={inputs.selectedCostCenter}
                    id="country-autocomplete"
                    fullWidth
                    onChange={(event, value: any) =>
                      handleAutocomplete(value, "cost")
                    }
                    getOptionLabel={(option: any) =>
                      option.costCenterName || ""
                    }
                    isOptionEqualToValue={(option: any, value: any) =>
                      option.id === value.id
                    }
                    size="small"
                    renderInput={(params) => (
                      <MuiInputField {...params} name="group" />
                    )}
                  />
                </Grid2>
                <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                  <MuiText variant="h6" className="admin-label-title" mb={0.5}>
                    Installation Date <span className="mandatory-sign">*</span>
                  </MuiText>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      value={inputs.installationDate}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          size: "small",
                          placeholder: "",
                        },
                      }}
                      format={DateFormatter(inputs.installationDate ?? dayjs())}
                      maxDate={dayjs(new Date())}
                      onChange={(value) => handleDate(value)}
                    />
                  </LocalizationProvider>
                </Grid2>
              </Grid2>
              <Grid2 container spacing={3} mt={2}>
                <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                  <MuiText variant="h6" className="admin-label-title" mb={0.5}>
                    Asset Name <span className="mandatory-sign">*</span>
                  </MuiText>
                  <StyledAutocomplete
                    options={inputs.assetData || []}
                    value={inputs.selectedAsset || null}
                    onChange={(event, value: any) =>
                      handleAutocomplete(value, "asset")
                    }
                    getOptionLabel={(option: any) =>
                      typeof option === "string"
                        ? option
                        : option?.assetName ?? ""
                    }
                    isOptionEqualToValue={(option: any, value: any) =>
                      option?.id === value?.id
                    }
                    filterOptions={(options, state) =>
                      options.filter((option: any) =>
                        option?.assetName
                          ?.toLowerCase()
                          .includes(state.inputValue.toLowerCase())
                      )
                    }
                    id="asset-autocomplete"
                    fullWidth
                    size="small"
                    renderOption={(props, option: any) => (
                      <li {...props} key={option.id}>
                        {" "}
                        {/* ✅ unique key */}
                        {option.assetName}
                      </li>
                    )}
                    renderInput={(params) => (
                      <MuiInputField {...params} name="group" />
                    )}
                  />
                </Grid2>
                <Grid2 size={{ xs: 12, sm: 6, md: 12 }} m={"auto"}>
                  <Box
                    sx={{
                      width: "100%",
                      bgcolor: "#f9f9f9",
                      borderRadius: 2,
                      boxShadow: "0 2px 8px rgba(58,132,132,0.05)",
                      p: 2,
                      overflowX: "auto",
                      fontFamily: "var(--poppins-font)",
                      maxHeight: 220,
                    }}
                  >
                    <table
                      style={{
                        width: "100%",
                        borderCollapse: "collapse",
                      }}
                    >
                      <thead>
                        <tr style={{ background: "#e0f7fa" }}>
                          <th
                            style={{
                              position: "sticky",
                              top: 0,
                              zIndex: 2,
                              background: "#e0f7fa",
                              padding: "8px 12px",
                              textAlign: "left",
                              fontWeight: 600,
                              color: "#3a8484",
                            }}
                          >
                            Specification
                          </th>
                          <th
                            style={{
                              position: "sticky",
                              top: 0,
                              zIndex: 2,
                              background: "#e0f7fa",
                              padding: "8px 12px",
                              textAlign: "left",
                              fontWeight: 600,
                              color: "#3a8484",
                            }}
                          >
                            Value
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {Array.isArray(assetSpecData) &&
                        assetSpecData.length > 0 ? (
                          assetSpecData.map((spec, idx) => (
                            <tr
                              key={idx}
                              style={{ borderBottom: "1px solid #e0e0e0" }}
                            >
                              <td
                                style={{ padding: "8px 12px", fontWeight: 500 }}
                              >
                                {spec.specificationName}
                              </td>
                              <td style={{ padding: "8px 12px" }}>
                                {spec.specificationValue}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={2}>
                              <Box p={2} textAlign="center">
                                No Data Found
                              </Box>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </Box>
                </Grid2>
              </Grid2>
            </Grid2>

            <Grid2 size={{ xs: 12, sm: 12, md: 4 }}>
              <Grid2 size={{ xs: 12, sm: 12, md: 12 }}>
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <MuiText
                    variant="h6"
                    my={1}
                    pt={1}
                    className="admin-page-title"
                  >
                    Machine Specification
                  </MuiText>

                  <MdOutlineLibraryAdd
                    size={24}
                    onClick={handleAddSpec}
                    color="#222"
                    cursor="pointer"
                  />
                </Box>
                <Grid2 container spacing={3} borderTop="1px solid #d8d8d8a1">
                  {specList.map((item, index) => (
                    <React.Fragment key={item.id}>
                      <Grid2 size={{ xs: 12, sm: 6, md: 5 }}>
                        {index === 0 ? (
                          <MuiText
                            variant="h6"
                            className="admin-label-title"
                            mt={1}
                          >
                            Specification
                          </MuiText>
                        ) : (
                          <MuiText variant="h6" sx={{ display: "none" }}>
                            Specification
                          </MuiText>
                        )}
                        <Autocomplete
                          disablePortal
                          fullWidth
                          size="small"
                          options={getFilteredSpecOptions(
                            item.specification,
                            Specification || [],
                            item.id,
                            specList || []
                          )}
                          value={
                            item.specification as SpecificationOption | null
                          }
                          onChange={(_, value) =>
                            handleAutocomplete(value, "specification", item.id)
                          }
                          getOptionLabel={(option: SpecificationOption) =>
                            option.code || ""
                          }
                          isOptionEqualToValue={(option, value) =>
                            option.id === value.id
                          }
                          disabled={editFlag && !item.isNew}
                          renderInput={(params) => (
                            <MuiInputField
                              {...params}
                              size="small"
                              error={
                                !!item.showError && !item.specification?.id
                              }
                              helperText={
                                !!item.showError && !item.specification?.id
                                  ? "Please select specification"
                                  : ""
                              }
                              sx={{
                                mt: index === 0 ? 1 : 0,
                              }}
                            />
                          )}
                        />
                      </Grid2>
                      <Grid2 size={{ xs: 12, sm: 6, md: 5 }}>
                        {index === 0 ? (
                          <MuiText
                            variant="h6"
                            className="admin-label-title"
                            mt={1}
                          >
                            Value
                          </MuiText>
                        ) : (
                          <MuiText variant="h6" sx={{ display: "none" }}>
                            Value
                          </MuiText>
                        )}
                        <MuiInputField
                          fullWidth
                          size="small"
                          name="specValue"
                          type="number"
                          autoComplete="off"
                          value={item.specValue || ""}
                          disabled={editFlag && !item.isNew}
                          error={
                            !!item.showError &&
                            (!item.specValue || item.specValue.trim() === "")
                          }
                          helperText={
                            !!item.showError &&
                            (!item.specValue || item.specValue.trim() === "")
                              ? "Please enter the value"
                              : ""
                          }
                          sx={{
                            mt: index === 0 ? 1 : 0,
                          }}
                          onChange={(
                            e: React.ChangeEvent<HTMLInputElement>
                          ) => {
                            const { value } = e.target;
                            setSpecList((prev: AdditionalSpec[]) =>
                              prev.map((row: AdditionalSpec) =>
                                row.id === item.id
                                  ? {
                                      ...row,
                                      specValue: value,
                                      showError: false,
                                    }
                                  : row
                              )
                            );
                          }}
                        />
                      </Grid2>
                      {/* Delete Button */}
                      <Grid2
                        size={{ xs: 12, sm: 12, md: 2 }}
                        sx={{
                          display: "flex",
                          justifyContent: "end",
                          alignItems: "center",
                          mt: index === 0 ? 3 : 0,
                        }}
                      >
                        <RiDeleteBin6Line
                          size={24}
                          color="red"
                          cursor="pointer"
                          onClick={() => handleDeleteSpec(item.id)}
                        />
                      </Grid2>
                    </React.Fragment>
                  ))}
                </Grid2>
              </Grid2>
            </Grid2>

            {/* <Grid2 size={{ xs: 12, sm: 12, md: 4 }}>
              <Grid2 container spacing={2}>
                <Grid2 size={{ xs: 12 }}>
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <MuiText
                      variant="h6"
                      my={1}
                      pt={1}
                      className="admin-page-title"
                    >
                      Machine Specification
                    </MuiText>
                    <MdOutlineLibraryAdd
                      size={24}
                      onClick={() => {}}
                      color="#222"
                      cursor="pointer"
                    />
                  </Box>
                </Grid2>

                <Grid2 size={{ xs: 12 }}>
                  <Box borderTop="1px solid #d8d8d8a1" />
                </Grid2>

                <Grid2 size={{ xs: 12, sm: 6, md: 5 }}>
                  <MuiText
                    variant="h6"
                    my={1}
                    pt={1}
                    className="admin-label-title"
                  >
                    Specification
                  </MuiText>
                  <Autocomplete
                    disablePortal
                    options={[]}
                    fullWidth
                    getOptionLabel={(option: any) => option.code || ""}
                    isOptionEqualToValue={(option: any, value: any) =>
                      option.id === value.id
                    }
                    renderInput={(params) => (
                      <MuiInputField {...params} size="small" />
                    )}
                  />
                </Grid2>

                <Grid2 size={{ xs: 12, sm: 6, md: 5 }}>
                  <MuiText
                    variant="h6"
                    my={1}
                    pt={1}
                    className="admin-label-title"
                  >
                    Machine
                  </MuiText>
                  <MuiInputField
                    fullWidth
                    type="text"
                    variant="outlined"
                    size="small"
                  />
                </Grid2>

                <Grid2 size={{ xs: 12, sm: 12, md: 2 }} pt={{ xs: 0, sm: 6 }}>
                  <Box
                    display="flex"
                    justifyContent={{ xs: "flex-end", md: "center" }}
                    height="100%"
                    alignItems="center"
                  >
                    <RiDeleteBin6Line size={24} color="red" cursor="pointer" />
                  </Box>
                </Grid2>
              </Grid2>
            </Grid2> */}
          </Grid2>
        </DialogContent>
        <DialogActions
          sx={{
            borderTop: "1px solid #f1f1f1",
            py: 2,
            justifyContent: "space-between",
            pr: "22px",
          }}
        >
          <FormGroup
            sx={{
              pl: 2,
            }}
          >
            <Box>
              <MuiSwitch
                checked={(inputs.isActive ?? 0) === 1}
                onChange={(e) => handleSwitch(e, "isActive")}
                label="Status"
              />
              <MuiSwitch
                checked={(inputs.isProductionMachine ?? 0) === 1}
                onChange={(e) => handleSwitch(e, "isProductionMachine")}
                label="Is Production"
              />
            </Box>
          </FormGroup>
          <Box
            display={"flex"}
            alignItems={"center"}
            gap={2}
            sx={{
              button: {
                minWidth: "70px !important",
              },
            }}
          >
            <MuiButton
              className="dialog-cancel-btn"
              variant="outlined"
              onClick={close}
            >
              Cancel
            </MuiButton>
            <MuiButton
              variant="contained"
              disabled={isSubmitting()}
              onClick={handleSubmit}
            >
              Submit
            </MuiButton>
          </Box>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}
