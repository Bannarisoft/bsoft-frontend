import React from "react";
import { CreateNotificationEventRuleTypes } from "../../../../types/types";
import { TransitionProps } from "@mui/material/transitions";
import {
  Autocomplete,
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  FormGroup,
  Grid2,
  IconButton,
  Slide,
} from "@mui/material";
import { IoClose } from "react-icons/io5";
import {
  MuiButton,
  MuiInputField,
  MuiSwitch,
  MuiText,
} from "bsoft-base-elements";
import { RiDeleteBin6Line } from "react-icons/ri";
import { MdDelete, MdOutlineLibraryAdd } from "react-icons/md";
const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});
const notificationLevelFields = [
  {
    label: "Notification Config",
    name: "notificationConfigId",
    field: "autocomplete",
    isRequired: true,
    getOptions: (data: any) => data.notificationConfig,
    getLabel: (opt: any) => opt.moduleName || "",
    renderOption: (opt: any) => opt.moduleName,
  },
  {
    label: "Target Type",
    name: "targetTypeId",
    field: "autocomplete",
    isRequired: true,
    getOptions: (data: any) => data.targertType,
    getLabel: (opt: any) => opt.code || "",
    renderOption: (opt: any) => opt.code,
  },
  {
    label: "Target",
    name: "targetId",
    field: "autocomplete",
    isRequired: true,
    getOptions: (data: any) => data.targert,
    getLabel: (opt: any) =>
      opt.userName ||
      opt?.roleName ||
      opt?.groupName ||
      opt?.deptName ||
      opt?.name ||
      opt?.code ||
      "",
    renderOption: (opt: any) =>
      opt?.userName ||
      opt?.roleName ||
      opt?.groupName ||
      opt?.deptName ||
      opt?.unitName ||
      opt?.moduleName ||
      opt?.name ||
      opt?.code,
  },
  {
    label: "Approval Mode",
    name: "approvalModeId",
    field: "autocomplete",
    isRequired: true,
    getOptions: (data: any) => data.approval,
    getLabel: (opt: any) => opt.code || "",
    renderOption: (opt: any) => opt.code,
  },
  {
    label: "Notification Channel",
    name: "notificationChannelId",
    field: "autocomplete",
    isRequired: true,
    getOptions: (data: any) => data.channel,
    getLabel: (opt: any) => opt.code || "",
    renderOption: (opt: any) => opt.code,
  },
  {
    label: "Recipient Type",
    name: "recipientTypeId",
    field: "autocomplete",
    isRequired: true,
    getOptions: (data: any) => data.recipit,
    getLabel: (opt: any) => opt.code || "",
    renderOption: (opt: any) => opt.code,
  },
  {
    label: "Template",
    name: "templateId",
    field: "autocomplete",
    isRequired: true,
    getOptions: (data: any) => data.templet,
    getLabel: (opt: any) => opt.moduleName || "",
    renderOption: (opt: any) => opt.moduleName,
  },
  {
    label: "Description",
    name: "description",
    field: "input",
    isRequired: false,
  },
];

const CreateNotificationLevelHierarchy = ({
  open,
  close,
  notificationGroupInput,
  error,
  handleChange,
  handleAutocompleteChange,
  selectedValues,
  handleSubmit,
  handleSwitch,
  editFlag,
  targetType,
  targetOptions,
  ApprovalMode,
  NotificationConfig,
  NotificationTemplet,
  NotificationType,
  ReceipientType,
  handleAddNotificationRule,
  handleDeleteNotificationRule,
  getFilteredOptions,
}: CreateNotificationEventRuleTypes) => {
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
            {`${editFlag ? "Edit" : "Create"}`} Notification Event Rule
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
            {notificationLevelFields
              .filter(
                (field) =>
                  ![
                    "notificationChannelId",
                    "recipientTypeId",
                    "templateId",
                  ].includes(field.name)
              )
              .map((field) => {
                const options = field.getOptions
                  ? field.getOptions({
                      notificationConfig: NotificationConfig,
                      targertType: targetType,
                      targert: targetOptions,
                      approval: ApprovalMode,
                      channel: NotificationType,
                      recipit: ReceipientType,
                      templet: NotificationTemplet,
                    }) || []
                  : [];

                return (
                  <Grid2 key={field.name} size={6}>
                    <MuiText variant="h6" my={1} className="admin-label-title">
                      {field.label}
                      {field.isRequired && (
                        <span className="mandatory-sign"> *</span>
                      )}
                    </MuiText>

                    {field.field === "autocomplete" ? (
                      <Autocomplete
                        options={options}
                        fullWidth
                        size="small"
                        value={selectedValues[field.name]?.[0] || null}
                        onChange={(_, value) =>
                          handleAutocompleteChange(field.name, value)
                        }
                        getOptionLabel={(option) =>
                          typeof option === "string"
                            ? option
                            : field.getLabel
                            ? field.getLabel(option)
                            : ""
                        }
                        isOptionEqualToValue={(option, value) =>
                          option?.id === value?.id ||
                          option?.userId === value?.userId
                        }
                        renderOption={(props, option) => (
                          <li {...props} key={option?.id || option?.userId}>
                            {field.renderOption
                              ? field.renderOption(option)
                              : ""}
                          </li>
                        )}
                        renderInput={(params) => (
                          <MuiInputField
                            {...params}
                            name={field.name}
                            error={error.includes(field.name)}
                            helperText={
                              error.includes(field.name) &&
                              `Please select ${field.label.toLowerCase()}`
                            }
                          />
                        )}
                      />
                    ) : (
                      <MuiInputField
                        name={field.name}
                        fullWidth
                        size="small"
                        multiline
                        rows={3}
                        value={notificationGroupInput.description}
                        onChange={handleChange}
                        error={error.includes(field.name)}
                        helperText={
                          error.includes(field.name) &&
                          `Please enter ${field.label.toLowerCase()}`
                        }
                      />
                    )}
                  </Grid2>
                );
              })}
          </Grid2>
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
          >
            <MuiText variant="h6" my={1} pt={1} className="admin-page-title">
              Notification Rules
            </MuiText>
            <MdOutlineLibraryAdd
              size={24}
              onClick={handleAddNotificationRule}
              color="#222"
              cursor="pointer"
            />
          </Box>
          {notificationGroupInput.notificationEventRules.map((rule) => (
            <Grid2
              container
              spacing={2}
              // mt={2}
              key={rule.id}
              alignItems="center"
            >
              {notificationLevelFields
                .filter((field) =>
                  [
                    "notificationChannelId",
                    "recipientTypeId",
                    "templateId",
                  ].includes(field.name)
                )
                .map((field) => {
                  const options = field.getOptions
                    ? field.getOptions({
                        channel: NotificationType,
                        recipit: ReceipientType,
                        templet: NotificationTemplet,
                      }) || []
                    : [];

                  return (
                    <Grid2 key={field.name} size={3.5}>
                      <MuiText
                        variant="h6"
                        my={1}
                        className="admin-label-title"
                      >
                        {field.label}
                        {field.isRequired && (
                          <span className="mandatory-sign"> *</span>
                        )}
                      </MuiText>
                      <Autocomplete
                        options={getFilteredOptions(
                          options.find(
                            (opt: any) => opt.id === (rule as any)[field.name]
                          ) || null,
                          options,
                          rule.id,
                          notificationGroupInput.notificationEventRules,
                          field.name
                        )}
                        fullWidth
                        size="small"
                        value={
                          options.find(
                            (opt: any) => opt.id === (rule as any)[field.name]
                          ) || null
                        }
                        onChange={(_, value) =>
                          handleAutocompleteChange(field.name, value, rule.id)
                        }
                        getOptionLabel={(option) =>
                          typeof option === "string"
                            ? option
                            : field.getLabel
                            ? field.getLabel(option)
                            : ""
                        }
                        renderOption={(props, option) => (
                          <li {...props} key={option?.id || option?.userId}>
                            {field.renderOption
                              ? field.renderOption(option)
                              : ""}
                          </li>
                        )}
                        renderInput={(params) => (
                          <MuiInputField
                            {...params}
                            name={field.name}
                            error={error.includes(`${field.name}_${rule.id}`)}
                            helperText={
                              error.includes(`${field.name}_${rule.id}`) &&
                              `Please select ${field.label.toLowerCase()}`
                            }
                          />
                        )}
                      />
                    </Grid2>
                  );
                })}

              <Grid2 size={1} mt={4} display="flex" justifyContent="center">
                <RiDeleteBin6Line
                  size={24}
                  color="red"
                  cursor="pointer"
                  onClick={() => handleDeleteNotificationRule(rule.id)}
                />
              </Grid2>
            </Grid2>
          ))}
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
              checked={notificationGroupInput.isActive === 1}
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

export default CreateNotificationLevelHierarchy;
