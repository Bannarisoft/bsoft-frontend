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
import { CreateMenuPropsTypes } from "../../../types";
const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});
const CreateNewMenu = ({
  open,
  close,
  menuInput,
  editFlag,
  handleSwitch,
  moduleData,
  parentMenu,
  selectedValue,
  handleAutocomplete,
  handleChange,
  handleSubmit,
  errors,
}: CreateMenuPropsTypes) => {
  return (
    <React.Fragment>
      <Dialog
        open={open}
        TransitionComponent={Transition}
        keepMounted
        aria-describedby="alert-dialog-slide-description"
        sx={{
          "& .MuiPaper-root": {
            minWidth: "40vw",
            borderRadius: "8px",
          },
        }}
      >
        <Box className="popup-header-wrapper">
          <h2 className="dialog-header">
            {editFlag ? "Edit Menu" : "Create Menu"}
          </h2>
          <IoClose
            fontSize={24}
            onClick={close}
            cursor={"pointer"}
            color="#fff"
          />
        </Box>
        <DialogContent>
          <Grid2 container spacing={2}>
            <Grid2 size={6}>
              <MuiText variant="h6" my={1} className="admin-label-title">
                Menu Name <span className="mandatory-sign">*</span>
              </MuiText>
              <MuiInputField
                fullWidth
                variant="outlined"
                size="small"
                onChange={handleChange}
                autoComplete="off"
                value={menuInput.menuName}
                name="menuName"
                type="text"
                error={errors.includes("menuName")}
                helperText={
                  errors.includes("menuName") && "please enter valid menu name"
                }
              />
            </Grid2>
            <Grid2 size={6}>
              <MuiText variant="h6" my={1} className="admin-label-title">
                Module Name <span className="mandatory-sign">*</span>
              </MuiText>
              <Autocomplete
                options={moduleData || []}
                id="module-autocomplete"
                fullWidth
                size="small"
                value={selectedValue.selectedModule}
                onChange={(event, value) =>
                  handleAutocomplete(
                    event as React.ChangeEvent<HTMLInputElement>,
                    value,
                    "moduleId"
                  )
                }
                getOptionLabel={(option: any) => option?.moduleName || ""}
                renderOption={(props, option) => (
                  <li {...props} key={option?.id}>
                    {option?.moduleName}
                  </li>
                )}
                renderInput={(params) => (
                  <MuiInputField
                    {...params}
                    name="moduleId"
                    value={menuInput.moduleId}
                    error={errors.includes("moduleId")}
                    helperText={
                      errors.includes("moduleId") && "Please select a module"
                    }
                  />
                )}
              />
            </Grid2>
            <Grid2 size={6}>
              <MuiText variant="h6" my={1} className="admin-label-title">
                Parent Name <span className="mandatory-sign">*</span>
              </MuiText>
              <Autocomplete
                options={parentMenu || []}
                id="parent-autocomplete"
                fullWidth
                size="small"
                value={selectedValue.parentId}
                onChange={(event, value) =>
                  handleAutocomplete(
                    event as React.ChangeEvent<HTMLInputElement>,
                    value,
                    "parentId"
                  )
                }
                getOptionLabel={(option: any) => option?.menuName || ""}
                renderOption={(props, option) => (
                  <li {...props} key={option?.id}>
                    {option?.menuName}
                  </li>
                )}
                renderInput={(params) => (
                  <MuiInputField
                    {...params}
                    name="parentId"
                    value={menuInput.parentId}
                    error={errors.includes("parentId")}
                    helperText={
                      errors.includes("parentId") &&
                      "Please select a parent menu"
                    }
                  />
                )}
              />
            </Grid2>
            <Grid2 size={6}>
              <MuiText variant="h6" my={1} className="admin-label-title">
                Menu Icon
              </MuiText>
              <MuiInputField
                fullWidth
                variant="outlined"
                size="small"
                onChange={handleChange}
                autoComplete="off"
                value={menuInput.menuIcon}
                name="menuIcon"
                type="file"
              />
            </Grid2>
            <Grid2 size={6}>
              <MuiText variant="h6" my={1} className="admin-label-title">
                Menu Url
              </MuiText>
              <MuiInputField
                fullWidth
                variant="outlined"
                size="small"
                onChange={handleChange}
                autoComplete="off"
                value={menuInput.menuUrl}
                name="menuUrl"
                type="text"
              />
            </Grid2>
            <Grid2 size={6}>
              <MuiText variant="h6" my={1} className="admin-label-title">
                Sort Order <span className="mandatory-sign">*</span>
              </MuiText>
              <MuiInputField
                fullWidth
                variant="outlined"
                size="small"
                onChange={handleChange}
                autoComplete="off"
                value={menuInput.sortOrder}
                InputProps={{ inputProps: { min: 0 } }}
                name="sortOrder"
                type="number"
                error={errors.includes("sortOrder")}
                helperText={
                  errors.includes("sortOrder") &&
                  "please enter valid sortOrder "
                }
              />
            </Grid2>
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
            <MuiSwitch
              checked={menuInput.isActive === 1}
              onChange={handleSwitch}
              label="Status"
            />
          </FormGroup>
          <Box
            display={"flex"}
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
            <MuiButton className="filled-icon-btn" onClick={handleSubmit}>
              Submit
            </MuiButton>
          </Box>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
};

export default CreateNewMenu;
