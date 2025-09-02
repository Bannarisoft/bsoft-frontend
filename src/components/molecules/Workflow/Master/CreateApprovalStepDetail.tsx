import {
  Autocomplete,
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  FormGroup,
  Grid2,
  Slide,
} from "@mui/material";
import { TransitionProps } from "@mui/material/transitions";
import React from "react";
import { IoClose } from "react-icons/io5";
import {
  ApprovalDetailProps,
  CreateApprovalDetail,
  CreateApprovalRules,
} from  "../../../../types/types";
import {
  MuiButton,
  MuiInputField,
  MuiSwitch,
  MuiText,
} from "bsoft-base-elements";
const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});
const ApprovalStepFields = [
  {
    label: "Workflow Type",
    name: "workFlowTypeId",
    field: "autocomplete",
    isRequired: true,
    getOptions: (data: any) => data.workflowTypeOptions,
    getLabel: (opt: any) => opt.moduleTypeName || "",
    renderOption: (opt: any) => opt.moduleTypeName,
  },
  {
    label: "Step Order",
    name: "stepOrder",
    field: "input",
    isRequired: true,
  },
  {
    label: "Target Type",
    name: "targetTypeId",
    field: "autocomplete",
    isRequired: true,
    getOptions: (data: any) => data.targetTypeOptions,
    getLabel: (opt: any) => opt.userName || "",
    renderOption: (opt: any) => opt.userName,
  },
  {
    label: "Approval Step",
    name: "approvalStepId",
    field: "autocomplete",
    isRequired: true,
    getOptions: (data: any) => data.approvalStepOptions,
    getLabel: (opt: any) => opt.code || "",
    renderOption: (opt: any) => opt.code,
  },
  {
    label: "Approval Type",
    name: "approvalTypeId",
    field: "autocomplete",
    isRequired: true,
    getOptions: (data: any) => data.approvalTypeOptions,
    getLabel: (opt: any) => opt.code || "",
    renderOption: (opt: any) => opt.code,
  },
  {
    label: "SLA Hours",
    name: "slaHours",
    field: "input",
  },
  {
    label: "On SLA Action",
    name: "onSLAAction",
    field: "input",
  },
  {
    label: "Units",
    name: "unitId",
    field: "autocomplete-multi",
    isRequired: true,
    getOptions: (data: any) => data.unitOptions,
    getLabel: (opt: any) => opt.unitName || "",
    renderOption: (opt: any) => opt.unitName,
  },
  {
    label: "Rule",
    name: "ruleId",
    field: "autocomplete-multi",
    getOptions: (data: any) => data.ruleOptions,
    getLabel: (opt: any) => opt.conditionKey || "",
    renderOption: (opt: any) => opt.conditionKey,
  },
  {
    label: "Department",
    name: "departmentId",
    field: "autocomplete-multi",
    isRequired: true,
    getOptions: (data: any) => data.departmentOptions,
    getLabel: (opt: any) => opt.deptName || "",
    renderOption: (opt: any) => opt.deptName,
  },
];

const CreateApprovalStepDetails = ({
  open,
  close,
  editFlag,
  handleAutocomplete,
  selectedValue,
  approvalDetailInput,
  handleChange,
  error,
  workflowTypeOptions,
  targetTypeOptions,
  approvalStepOptions,
  approvalTypeOptions,
  unitOptions,
  ruleOptions,
  departmentOptions,
  handleSwitch,
  handleSubmit,
}: CreateApprovalDetail) => {
  return (
    <React.Fragment>
      <Dialog
        open={open}
        TransitionComponent={Transition}
        keepMounted
        aria-describedby="alert-dialog-slide-description"
        sx={{
          "& .MuiPaper-root": {
            width: "1000px",
            borderRadius: "8px",
            maxWidth: "none !important",
          },
        }}
      >
        <Box className="popup-header-wrapper">
          <h2 className="dialog-header">
            {" "}
            {`${editFlag ? "Edit" : "Create"}`} Approval Detail
          </h2>
          <IoClose
            fontSize={24}
            onClick={close}
            cursor={"pointer"}
            color="#fff"
          />
        </Box>
        <DialogContent sx={{ p: "4px 24px 12px" }}>
          <Grid2 container spacing={2}>
            {ApprovalStepFields.map((field) => {
              const options =
                field.field === "autocomplete" ||
                field.field === "autocomplete-multi"
                  ? field.getOptions?.({
                      workflowTypeOptions,
                      targetTypeOptions,
                      approvalStepOptions,
                      approvalTypeOptions,
                      unitOptions,
                      ruleOptions,
                      departmentOptions,
                    }) || []
                  : [];

              return (
                <Grid2 key={field.name} size={3}>
                  <MuiText variant="h6" my={1} className="admin-label-title">
                    {field.label}
                    {field.isRequired && (
                      <span className="mandatory-sign"> *</span>
                    )}
                  </MuiText>

                  {(field.field === "autocomplete" ||
                    field.field === "autocomplete-multi") && (
                    <Autocomplete
                      multiple={field.field === "autocomplete-multi"}
                      value={
                        field.field === "autocomplete-multi"
                          ? selectedValue?.[field.name] || []
                          : selectedValue?.[field.name] || null
                      }
                      options={options}
                      fullWidth
                      size="small"
                      onChange={(_, value) =>
                        handleAutocomplete(field.name, value)
                      }
                      getOptionLabel={(option) =>
                        typeof option === "string"
                          ? option
                          : field.getLabel?.(option) || ""
                      }
                      isOptionEqualToValue={(option, value) =>
                        option.id === value.id
                      }
                      renderOption={(props, option) => (
                        <li {...props} key={option.id}>
                          {field.renderOption?.(option)}
                        </li>
                      )}
                      renderInput={(params) => (
                        <MuiInputField
                          {...params}
                          name={field.name}
                          error={error.includes(field.name)}
                          helperText={
                            error.includes(field.name) &&
                            `Please select ${
                              field.field === "autocomplete-multi"
                                ? "values"
                                : "a value"
                            }`
                          }
                        />
                      )}
                    />
                  )}

                  {field.field === "input" && (
                    <MuiInputField
                      fullWidth
                      name={field.name}
                      type={
                        field.name === "slaHours" || field.name === "stepOrder"
                          ? "number"
                          : "text"
                      }
                      value={
                        approvalDetailInput[
                          field.name as keyof ApprovalDetailProps
                        ] ?? ""
                      }
                      onChange={handleChange}
                      size="small"
                      error={error.includes(field.name)}
                      helperText={
                        error.includes(field.name) && "Please enter valid value"
                      }
                      InputProps={{
                        inputProps: {
                          maxLength: 50,
                          ...((field.name === "stepOrder" && { min: 0 }) ||
                            (field.name === "slaHours" && { min: 0 })),
                        },
                      }}
                    />
                  )}
                </Grid2>
              );
            })}
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
          <FormGroup sx={{ pl: 2 }}>
            <MuiSwitch
              checked={approvalDetailInput.isActive === 1}
              onChange={handleSwitch}
              label="Status"
            />
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
            <MuiButton variant="contained" onClick={handleSubmit}>
              Submit
            </MuiButton>
          </Box>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
};

export default CreateApprovalStepDetails;
