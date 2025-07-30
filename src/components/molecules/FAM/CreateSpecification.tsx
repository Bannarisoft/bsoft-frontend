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

export interface SpecificationProps {
  id: number;
  isActive: number;
  specificationName: string;
  assetGroupId: number;
  isDefault: number;
}

interface CreateSpecificationProp {
  open: boolean;
  close: () => void;
  error: Array<{}>;
  editFlag: boolean;
  handleSwitch: (
    e: React.ChangeEvent<HTMLInputElement>,
    field: "isActive" | "isDefault"
  ) => void;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.MouseEvent<HTMLButtonElement>) => void;
  HandleAssetGroup: (
    e: React.ChangeEvent<HTMLInputElement>,
    value: { id: string; groupName: string } | null,
    field: string
  ) => void;
  selectedAssetGroup: null;
  assetGroup: any;
  specificationInput: SpecificationProps;
}

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});
function CreateSpecification({
  open,
  close,
  error,
  editFlag,
  HandleAssetGroup,
  selectedAssetGroup,
  assetGroup,
  specificationInput,
  handleSwitch,
  handleChange,
  handleSubmit,
}: CreateSpecificationProp) {
  return (
    <React.Fragment>
      <Dialog
        open={open}
        TransitionComponent={Transition}
        keepMounted
        aria-describedby="alert-dialog-slide-description"
        sx={{
          "& .MuiPaper-root": {
            width: "700px",
            borderRadius: "8px",
          },
        }}
      >
        <Box className="popup-header-wrapper">
          <h2 className="dialog-header">
            {editFlag ? "Edit Specification" : "Create Specification"}
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
            <Grid2 size={6}>
              <MuiText variant="h6" my={1} className="admin-label-title">
                Asset Group Name <span className="mandatory-sign">*</span>
              </MuiText>

              <Autocomplete
                options={assetGroup || []}
                id="manufacture-type-autocomplete"
                fullWidth
                size="small"
                value={selectedAssetGroup}
                defaultValue={selectedAssetGroup}
                getOptionLabel={(option: any) => option?.groupName}
                onChange={(event, value) =>
                  HandleAssetGroup(
                    event as React.ChangeEvent<HTMLInputElement>,
                    value,
                    "groupName"
                  )
                }
                renderOption={(
                  props,
                  option: { id: string; groupName: string }
                ) => (
                  <li {...props} key={option?.id}>
                    {option?.groupName}
                  </li>
                )}
                renderInput={(params) => (
                  <MuiInputField
                    {...params}
                    name="groupName"
                    value={specificationInput.assetGroupId}
                    error={error.includes("assetGroup")}
                    helperText={
                      error.includes("assetGroup") &&
                      "please select a asset group"
                    }
                  />
                )}
              />
            </Grid2>
            <Grid2 size={6}>
              <MuiText variant="h6" my={1} className="admin-label-title">
                Specification Name <span className="mandatory-sign">*</span>
              </MuiText>

              <MuiInputField
                fullWidth
                variant="outlined"
                size="small"
                type="text"
                name="specificationName"
                InputProps={{
                  inputProps: {
                    maxLength: 45,
                  },
                }}
                autoComplete="off"
                onChange={handleChange}
                value={specificationInput.specificationName}
                error={error.includes("specificationName")}
                helperText={
                  error.includes("specificationName") &&
                  "please enter valid  specificationName"
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
            <Box>
              <MuiSwitch
                checked={specificationInput.isActive === 1}
                onChange={(e) => handleSwitch(e, "isActive")}
                label="Status"
              />
              <MuiSwitch
                checked={specificationInput.isDefault === 1}
                onChange={(e) => handleSwitch(e, "isDefault")}
                label="Default"
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
            <MuiButton variant="contained" onClick={handleSubmit}>
              Submit
            </MuiButton>
          </Box>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}

export default CreateSpecification;
