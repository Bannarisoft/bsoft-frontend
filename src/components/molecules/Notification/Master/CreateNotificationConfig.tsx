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
import { CreateNotificationPropTypes } from "../../../../types/types";

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const notificationConfigFields = [
  {
    label: "Module Name",
    name: "moduleName",
    isRequired: true,
  },
  {
    label: "Notification Type",
    name: "notificationEventTypeId",
    field: "autocomplete",
    isRequired: true,
    getOptions: (data: any) => data.notificationTypes,
    getLabel: (opt: any) => opt.code || "",
    renderOption: (opt: any) => opt.code,
  },
];
const CreateNotificationConfig = ({
  open,
  close,
  notificationInput,
  handleSubmit,
  handleChange,
  error,
  handleSwitch,
  NotificationType,
  handleAutocomplete,
  selectedValue,
  editFlag,
}: CreateNotificationPropTypes) => {
  return (
    <React.Fragment>
      <Dialog
        open={open}
        TransitionComponent={Transition}
        keepMounted
        aria-describedby="alert-dialog-slide-description"
        sx={{
          "& .MuiPaper-root": {
            width: "500px",
            borderRadius: "8px",
          },
        }}
      >
        <Box className="popup-header-wrapper">
          <h2 className="dialog-header">
            {`${editFlag ? "Edit" : "Create"}`} Notification Config
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
            {notificationConfigFields.map((field) => {
              const options = field.getOptions
                ? field.getOptions({ notificationTypes: NotificationType }) ||
                  []
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
                    <Autocomplete
                      options={options}
                      fullWidth
                      size="small"
                      value={selectedValue?.[field.name] || null}
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
                            "please select a notification event"
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
                        notificationInput[
                          field.name as keyof typeof notificationInput
                        ] || ""
                      }
                      autoComplete="off"
                      onChange={handleChange}
                      size="small"
                      error={error.includes(field.name)}
                      helperText={
                        error.includes(field.name) && "please enter valid value"
                      }
                      InputProps={{
                        inputProps: {
                          maxLength: 100,
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
              checked={notificationInput.isActive === 1}
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

export default CreateNotificationConfig;
