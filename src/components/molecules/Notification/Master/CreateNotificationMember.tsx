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
import {
  MuiButton,
  MuiInputField,
  MuiSwitch,
  MuiText,
} from "bsoft-base-elements";
import React from "react";
import { IoClose } from "react-icons/io5";
import { CreateGroupMemberPropTypes } from  "../../../../types/types";
const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});
const notificationGroupMemberFields = [
  {
    label: "Group Name",
    name: "groupId",
    field: "autocomplete",
    isRequired: true,
    getOptions: (data: any) => data.groupData,
    getLabel: (opt: any) => opt.groupName || "",
    renderOption: (opt: any) => opt.groupName,
  },
  {
    label: "Users",
    name: "userId",
    field: "autocomplete",
    isRequired: true,
    getOptions: (data: any) => data.userData,
    getLabel: (opt: any) => opt.userName || "",
    renderOption: (opt: any) => opt.userName,
  },
];

const CreateNotificationMember = ({
  open,
  close,
  groupMemberInput,
  error,
  handleSwitch,
  editFlag,
  selectedValues,
  handleAutocompleteChange,
  userData,
  groupData,
  handleSubmit,
}: CreateGroupMemberPropTypes) => {
  return (
    <React.Fragment>
      <Dialog
        open={open}
        TransitionComponent={Transition}
        keepMounted
        aria-describedby="alert-dialog-slide-description"
        sx={{
          "& .MuiPaper-root": {
            width: "900px",
            borderRadius: "8px",
          },
        }}
      >
        <Box className="popup-header-wrapper">
          <h2 className="dialog-header">
            {`${editFlag ? "Edit" : "Create"}`} Notification Group Members
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
            {notificationGroupMemberFields.map((field) => {
              if (editFlag && field.name === "groupId") return null;
              const gridSize = editFlag && field.name === "userId" ? 12 : 6;
              const options = field.getOptions
                ? field.getOptions({ userData, groupData })
                : [];
              return (
                <Grid2 key={field.name} size={gridSize}>
                  <MuiText variant="h6" my={1} className="admin-label-title">
                    {field.label}
                    {field.isRequired && (
                      <span className="mandatory-sign">*</span>
                    )}
                  </MuiText>
                  <Autocomplete
                    options={options}
                    fullWidth
                    size="small"
                    disablePortal
                    multiple={field.name === "userId"}
                    value={
                      field.name === "userId"
                        ? selectedValues.userId
                        : selectedValues.groupId
                    }
                    onChange={(event, value) =>
                      handleAutocompleteChange(event, value, field.name)
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
              checked={groupMemberInput.isActive === 1}
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

export default CreateNotificationMember;
