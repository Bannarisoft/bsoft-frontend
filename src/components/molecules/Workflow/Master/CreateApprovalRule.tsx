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
import { CreateApprovalRules } from  "../../../../types/types";
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
const ApprovalRuleField = [
  {
    label: "Unit",
    name: "unitId",
    field: "autocomplete",
    isRequired: true,
    getOptions: (data: any) => data.unitOptions,
    getLabel: (opt: any) => opt.unitName || "",
    renderOption: (opt: any) => opt.unitName,
  },
  {
    label: "Workflow Type",
    name: "workflowTypeId",
    field: "autocomplete",
    isRequired: true,
    getOptions: (data: any) => data.workflowTypeOptions,
    getLabel: (opt: any) => opt.moduleTypeName || "",
    renderOption: (opt: any) => opt.moduleTypeName,
  },
  {
    label: "Condition Key",
    name: "conditionKey",
    isRequired: true,
  },
  {
    label: "Operator",
    name: "operator",
    isRequired: true,
  },
  {
    label: "Value",
    name: "value",
    isRequired: true,
  },
  {
    label: "Action",
    name: "action",
    isRequired: true,
  },
];

const CreateApprovalRule = ({
  open,
  close,
  editFlag,
  handleAutocomplete,
  selectedValue,
  UnitData,
  approvalRuleInput,
  handleChange,
  handleSubmit,
  error,
  handleSwitch,
  WorkflowTypeData,
}: CreateApprovalRules) => {
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
            {`${editFlag ? "Edit" : "Create"}`} Approval Rule
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
            {ApprovalRuleField.map((field) => {
              const options = field.getOptions
                ? field.getOptions({
                    unitOptions: UnitData,
                    workflowTypeOptions: WorkflowTypeData,
                  }) || []
                : [];

              return (
                <Grid2 key={field.name} size={6}>
                  <MuiText variant="h6" my={1} className="admin-label-title">
                    {field.label}{" "}
                    {field.isRequired && (
                      <span className="mandatory-sign">*</span>
                    )}
                  </MuiText>

                  {field.field === "autocomplete" ? (
                    <Autocomplete<any>
                      options={options}
                      fullWidth
                      size="small"
                      value={selectedValue[field.name] || null}
                      onChange={(_, value) =>
                        handleAutocomplete(field.name, value)
                      }
                      getOptionLabel={(option) =>
                        field.getLabel ? field.getLabel(option) : ""
                      }
                      renderOption={(props, option) => (
                        <li {...props} key={option.id}>
                          {field.renderOption ? field.renderOption(option) : ""}
                        </li>
                      )}
                      renderInput={(params) => (
                        <MuiInputField
                          {...params}
                          name={field.name}
                          error={error.includes(field.name)}
                          helperText={
                            error.includes(field.name) &&
                            "Please select a value"
                          }
                        />
                      )}
                    />
                  ) : (
                    <MuiInputField
                      fullWidth
                      name={field.name}
                      type="text"
                      value={
                        approvalRuleInput[
                          field.name as keyof typeof approvalRuleInput
                        ] ?? ""
                      }
                      autoComplete="off"
                      onChange={handleChange}
                      size="small"
                      error={error.includes(field.name)}
                      helperText={
                        error.includes(field.name) && "Please enter valid value"
                      }
                      InputProps={{
                        inputProps: {
                          maxLength: 50,
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
              checked={approvalRuleInput.isActive === 1}
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

export default CreateApprovalRule;
