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
import { isSubmitting } from "../../../utils/lib";

export interface DepreciationProps {
  code: string;
  depreciationGroupName: string;
  bookType: number;
  // assetGroupId: number;
  depreciationMethod: number;
  usefulLife: number;
  residualValue: number;
  id: number;
  isActive: number;
  sortOrder: number;
}
interface CreateDepreciationPropTypes {
  open: boolean;
  close: () => void;
  error: Array<{}>;
  bookType: any;
  assetGroupId: Array<{ id: string; groupName: string }>;
  depreciationMethod: any;
  depreciationInput: DepreciationProps;
  handleDepreciationMethodChange: (
    e: React.ChangeEvent<HTMLInputElement>,
    value: { id: string; description: string } | null,
    field: string
  ) => void;
  handleAssetGroupChange: (
    e: React.ChangeEvent<HTMLInputElement>,
    value: { id: string; groupName: string } | null
  ) => void;
  editFlag: boolean;
  handleBooktypeChange: (
    e: React.ChangeEvent<HTMLInputElement>,
    value: { id: string; description: string } | null,
    field: string
  ) => void;
  handleSubmit: (e: React.MouseEvent<HTMLButtonElement>) => void;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSwitch: (e: React.ChangeEvent<HTMLInputElement>) => void;
  selectedBookType: any;
  selectedDepreciationMethod: any;
  selectedAssetGroup: null;
}

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function CreateDepreciation({
  open,
  close,
  error,
  bookType,
  assetGroupId,
  handleBooktypeChange,
  selectedBookType,
  depreciationInput,
  depreciationMethod,
  handleDepreciationMethodChange,
  selectedDepreciationMethod,
  selectedAssetGroup,
  handleChange,
  handleSwitch,
  handleSubmit,
  handleAssetGroupChange,
  editFlag,
}: CreateDepreciationPropTypes) {
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
            {editFlag ? "Edit Depreciation" : "Create Depreciation"}
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
                Depreciation Code <span className="mandatory-sign">*</span>
              </MuiText>
              <MuiInputField
                fullWidth
                variant="outlined"
                size="small"
                InputProps={{
                  inputProps: {
                    maxLength: 10,
                  },
                }}
                disabled={editFlag}
                autoComplete="off"
                error={error.includes("code")}
                helperText={error.includes("code") && "please enter valid code"}
                value={depreciationInput.code.toUpperCase()}
                name="code"
                onChange={handleChange}
              />
            </Grid2>
            <Grid2 size={4}>
              <MuiText variant="h6" my={1} className="admin-label-title">
                Asset Group Name <span className="mandatory-sign">*</span>
              </MuiText>

              <Autocomplete<{ id: string; groupName: string }>
                options={assetGroupId || []}
                id="manufacture-type-autocomplete"
                fullWidth
                size="small"
                value={selectedAssetGroup}
                onChange={(event, value) =>
                  handleAssetGroupChange(
                    event as React.ChangeEvent<HTMLInputElement>,
                    value
                  )
                }
                getOptionLabel={(option: any) => option?.groupName}
                renderOption={(props, option) => (
                  <li {...props} key={option?.id}>
                    {option?.groupName}
                  </li>
                )}
                renderInput={(params) => (
                  <MuiInputField
                    {...params}
                    name="assetGroupId"
                    error={error.includes("assetGroupId")}
                    helperText={
                      error.includes("assetGroupId") &&
                      "please select a asset group"
                    }
                  />
                )}
              />
            </Grid2>
            <Grid2 size={4}>
              <MuiText variant="h6" my={1} className="admin-label-title">
                Depreciation Group Name{" "}
                <span className="mandatory-sign">*</span>
              </MuiText>
              <MuiInputField
                fullWidth
                variant="outlined"
                size="small"
                InputProps={{
                  inputProps: {
                    maxLength: 45,
                  },
                }}
                autoComplete="off"
                error={error.includes("depreciationGroupName")}
                helperText={
                  error.includes("depreciationGroupName") &&
                  "please enter valid depreciation groupName"
                }
                value={depreciationInput.depreciationGroupName}
                name="depreciationGroupName"
                onChange={handleChange}
              />
            </Grid2>
          </Grid2>
          <Grid2 container spacing={2}>
            <Grid2 size={4}>
              <MuiText variant="h6" my={1} className="admin-label-title">
                Book Type <span className="mandatory-sign">*</span>
              </MuiText>

              <Autocomplete
                options={bookType || []}
                id="manufacture-type-autocomplete"
                fullWidth
                size="small"
                value={selectedBookType}
                defaultValue={selectedBookType}
                getOptionLabel={(option: any) => option?.description}
                onChange={(event, value) =>
                  handleBooktypeChange(
                    event as React.ChangeEvent<HTMLInputElement>,
                    value,
                    "bookType"
                  )
                }
                renderOption={(
                  props,
                  option: { id: string; description: string }
                ) => (
                  <li {...props} key={option?.id}>
                    {option?.description}
                  </li>
                )}
                renderInput={(params) => (
                  <MuiInputField
                    {...params}
                    name="bookType"
                    value={depreciationInput.bookType}
                    error={error.includes("bookType")}
                    helperText={
                      error.includes("bookType") && "please select a book Type "
                    }
                  />
                )}
              />
            </Grid2>
            <Grid2 size={4}>
              <MuiText variant="h6" my={1} className="admin-label-title">
                Depreciation Method Name{" "}
                <span className="mandatory-sign">*</span>
              </MuiText>

              <Autocomplete
                options={depreciationMethod || []}
                id="manufacture-type-autocomplete"
                fullWidth
                size="small"
                value={selectedDepreciationMethod}
                defaultValue={selectedDepreciationMethod}
                getOptionLabel={(option: any) => option?.description}
                onChange={(event, value) =>
                  handleDepreciationMethodChange(
                    event as React.ChangeEvent<HTMLInputElement>,
                    value,
                    "depreciationMethod"
                  )
                }
                renderOption={(
                  props,
                  option: { id: string; description: string }
                ) => (
                  <li {...props} key={option?.id}>
                    {option?.description}
                  </li>
                )}
                renderInput={(params) => (
                  <MuiInputField
                    {...params}
                    name="depreciationMethod "
                    value={depreciationInput.depreciationMethod}
                    error={error.includes("depreciationMethod")}
                    helperText={
                      error.includes("depreciationMethod") &&
                      "please select a depreciation method "
                    }
                  />
                )}
              />
            </Grid2>

            <Grid2 size={4}>
              <MuiText variant="h6" my={1} className="admin-label-title">
                Useful Life (<i>Years</i>){" "}
                <span className="mandatory-sign">*</span>
              </MuiText>
              <MuiInputField
                fullWidth
                variant="outlined"
                size="small"
                type="number"
                InputProps={{ inputProps: { min: 0 } }}
                error={error.includes("usefulLife")}
                helperText={
                  error.includes("usefulLife") &&
                  "please enter valid usefulLife"
                }
                value={
                  depreciationInput.usefulLife === 0
                    ? ""
                    : depreciationInput.usefulLife
                }
                autoComplete="off"
                name="usefulLife"
                onChange={handleChange}
              />
            </Grid2>
          </Grid2>
          <Grid2 size={6}>
            <MuiText variant="h6" my={1} className="admin-label-title">
              Residual Value <span className="mandatory-sign">%</span>
            </MuiText>
            <MuiInputField
              fullWidth
              variant="outlined"
              size="small"
              type="number"
              InputProps={{
                inputProps: {
                  min: 0,
                },
              }}
              autoComplete="off"
              error={error.includes("residualValue")}
              helperText={
                error.includes("residualValue") &&
                "please enter valid residualValue"
              }
              value={
                depreciationInput.residualValue === 0
                  ? ""
                  : depreciationInput.residualValue
              }
              name="residualValue"
              onChange={handleChange}
            />
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
              checked={depreciationInput.isActive === 1}
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
