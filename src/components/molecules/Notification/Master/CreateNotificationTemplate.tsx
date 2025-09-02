import React from "react";
import { CreateNotificationTemplateTypes } from  "../../../../types/types";
import { TransitionProps } from "@mui/material/transitions";
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
import { IoClose } from "react-icons/io5";
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
const notificationTempletFields = [
  {
    label: "Notification Type",
    name: "notificationTypeId",
    field: "autocomplete",
    isRequired: true,
    getOptions: (data: any) => data.NotificationType,
    getLabel: (opt: any) => opt.code || "",
    renderOption: (opt: any) => opt.code,
  },
  {
    label: "Notification Config",
    name: "notificationConfigId",
    field: "autocomplete",
    isRequired: true,
    getOptions: (data: any) => data.NotificationConfig,
    getLabel: (opt: any) => opt.moduleName || "",
    renderOption: (opt: any) => opt.moduleName,
  },
  {
    label: "Subject Template",
    name: "subjectTemplate",
    field: "input",
    isRequired: true,
  },
  {
    label: "Header Template",
    name: "headerTemplate",
    field: "input",
    isRequired: true,
  },
  {
    label: "Body Template",
    name: "bodyTemplate",
    field: "input",
    isRequired: true,
  },
  {
    label: "Footer Template",
    name: "footerTemplate",
    field: "input",
    isRequired: false,
  },
  {
    label: "Language Code",
    name: "languageCode",
    field: "input",
    isRequired: false,
  },
];

const CreateNotificationTemplate = ({
  open,
  close,
  notificationTemplateInput,
  error,
  handleAutocompleteChange,
  selectedValues,
  handleSubmit,
  handleSwitch,
  editFlag,
  handleChange,
  NotificationType,
  NotificationConfig,
}: CreateNotificationTemplateTypes) => {
  return (
    <React.Fragment>
      <Dialog
        open={open}
        TransitionComponent={Transition}
        keepMounted
        aria-describedby="alert-dialog-slide-description"
        sx={{
          "& .MuiPaper-root": {
            width: "800px",
            borderRadius: "8px",
            maxWidth: "none !important",
          },
        }}
      >
        <Box className="popup-header-wrapper">
          <h2 className="dialog-header">
            {" "}
            {`${editFlag ? "Edit" : "Create"}`} Notification Template
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
            {notificationTempletFields.map((field, index) => {
              const isLast = index === notificationTempletFields.length - 1;
              const options = field.getOptions
                ? field.getOptions({ NotificationType, NotificationConfig })
                : [];
              return (
                <Grid2 key={field.name} size={isLast ? 12 : 6}>
                  <MuiText variant="h6" my={1} className="admin-label-title">
                    {field.label}
                    {field.isRequired && (
                      <span className="mandatory-sign">*</span>
                    )}
                  </MuiText>

                  {field.field === "autocomplete" ? (
                    <Autocomplete<any>
                      options={options}
                      fullWidth
                      size="small"
                      value={selectedValues[field.name]?.[0] || null}
                      onChange={(_, value) =>
                        handleAutocompleteChange(field.name, value)
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
                      onChange={handleChange}
                      value={
                        (notificationTemplateInput as any)[field.name] || ""
                      }
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
              checked={notificationTemplateInput.isActive === 1}
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

export default CreateNotificationTemplate;
