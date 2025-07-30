import * as React from "react";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import Slide from "@mui/material/Slide";
import { TransitionProps } from "@mui/material/transitions";
import {
  Autocomplete,
  Box,
  FormControl,
  FormGroup,
  Grid2,
} from "@mui/material";
import { IoClose } from "react-icons/io5";
import {
  MuiButton,
  MuiInputField,
  MuiSwitch,
  MuiText,
} from "bsoft-base-elements";
export interface LocationProps {
  code: string;
  locationName: string;
  description: string;
  sortOrder: number;
  unitId: number;
  departmentId: number;
  id: number;
  isActive: number;
}
interface CreateLocationPropTypes {
  open: boolean;
  close: () => void;
  error: Array<{}>;
  handleDepartmentChange: (
    e: React.ChangeEvent<HTMLInputElement>,
    value: any,
    field: string
  ) => void;
  selectedDepartment: null;

  departmentData: any;
  locationInput: LocationProps;
  handleSubmit: (e: React.MouseEvent<HTMLButtonElement>) => void;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSwitch: (e: React.ChangeEvent<HTMLInputElement>) => void;
  editFlag: boolean;
}

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function CreateLocation({
  open,
  close,
  error,
  handleDepartmentChange,
  selectedDepartment,
  departmentData,
  locationInput,
  handleChange,
  handleSubmit,
  handleSwitch,
  editFlag,
}: CreateLocationPropTypes) {
  return (
    <React.Fragment>
      <Dialog
        open={open}
        TransitionComponent={Transition}
        keepMounted
        aria-describedby="alert-dialog-slide-description"
        sx={{
          "& .MuiPaper-root": {
            minWidth: "70vw",
            borderRadius: "8px",
          },
        }}
      >
        <Box className="popup-header-wrapper">
          <h2 className="dialog-header">
            {editFlag ? "Edit  Location" : "Create Location"}
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
            <Grid2 size={4}>
              <MuiText variant="h6" my={1} className="admin-label-title">
                Department Name <span className="mandatory-sign">*</span>
              </MuiText>

              <Autocomplete
                options={departmentData || []}
                id="state-autocomplete"
                fullWidth
                size="small"
                value={selectedDepartment}
                onChange={(event, value) =>
                  handleDepartmentChange(
                    event as React.ChangeEvent<HTMLInputElement>,
                    value,
                    "deptName"
                  )
                }
                getOptionLabel={(option: any) => option?.deptName}
                renderOption={(props, option) => (
                  <li {...props} key={option?.id}>
                    {option?.deptName}
                  </li>
                )}
                renderInput={(params) => (
                  <MuiInputField
                    {...params}
                    name="departmentId"
                    value={locationInput.departmentId}
                    error={error.includes("departmentId")}
                    helperText={
                      error.includes("departmentId") &&
                      "please select a department"
                    }
                  />
                )}
              />
            </Grid2>
            <Grid2 size={4}>
              <FormControl fullWidth>
                <MuiText variant="h6" my={1} className="admin-label-title">
                  Location Code <span className="mandatory-sign">*</span>
                </MuiText>
                <MuiInputField
                  fullWidth
                  variant="outlined"
                  size="small"
                  type="text"
                  name="code"
                  autoComplete="off"
                  disabled={editFlag}
                  onChange={handleChange}
                  value={locationInput.code.toUpperCase()}
                  error={error.includes("code")}
                  helperText={
                    error.includes("code") &&
                    "please enter valid  location code"
                  }
                />
              </FormControl>
            </Grid2>
            <Grid2 size={4}>
              <FormControl fullWidth>
                <MuiText variant="h6" my={1} className="admin-label-title">
                  Location Name <span className="mandatory-sign">*</span>
                </MuiText>
                <MuiInputField
                  fullWidth
                  variant="outlined"
                  size="small"
                  autoComplete="off"
                  type="text"
                  name="locationName"
                  value={locationInput.locationName}
                  onChange={handleChange}
                  error={error.includes("locationName")}
                  helperText={
                    error.includes("locationName") &&
                    "please enter valid  location name"
                  }
                />
              </FormControl>
            </Grid2>
            <Grid2 size={12}>
              <MuiText variant="h6" my={1} className="admin-label-title">
                Description
              </MuiText>
              <MuiInputField
                fullWidth
                type="text"
                variant="outlined"
                size="small"
                name="description"
                value={locationInput.description}
                error={error.includes("description")}
                helperText={
                  error.includes("description") &&
                  "please enter valid description"
                }
                rows={3}
                multiline
                onChange={handleChange}
                InputProps={{
                  inputProps: {
                    maxLength: 250,
                  },
                }}
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
              checked={locationInput.isActive === 1}
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
}
