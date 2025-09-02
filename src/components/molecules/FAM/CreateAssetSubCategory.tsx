import * as React from "react";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import Slide from "@mui/material/Slide";
import { TransitionProps } from "@mui/material/transitions";
import { Autocomplete, Box, FormGroup, Grid2 } from "@mui/material";
import { IoClose } from "react-icons/io5";
import { SubCategoryProps } from "../../organisms/FAM/AssetSubCategoryPage";
import {
  MuiButton,
  MuiInputField,
  MuiSwitch,
  MuiText,
} from "bsoft-base-elements";
import { isSubmitting } from "../../../utils/lib";

interface CreatesubPropTypes {
  open: boolean;
  close: () => void;
  subCategoryInput: SubCategoryProps;
  handleSubmit: (e: React.MouseEvent<HTMLButtonElement>) => void;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error: Array<{}>;
  handleSwitch: (e: React.ChangeEvent<HTMLInputElement>) => void;
  assetCategory: Array<{ id: string; categoryName: string }>;
  editFlag: boolean;
  handleAutocomplete: (
    e: React.ChangeEvent<HTMLInputElement>,
    value: { id: string; categoryName: string } | null
  ) => void;
  selectedCategory: null;
}

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function CreateAssetCategory({
  open,
  close,
  subCategoryInput,
  handleSubmit,
  handleChange,
  error,
  handleSwitch,
  assetCategory,
  handleAutocomplete,
  selectedCategory,
  editFlag,
}: CreatesubPropTypes) {
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
            {editFlag ? "Edit Asset Sub Category" : "Create Asset Sub Category"}
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
                Asset Category Name <span className="mandatory-sign">*</span>
              </MuiText>

              <Autocomplete
                options={assetCategory || []}
                id="company-autocomplete"
                fullWidth
                size="small"
                value={selectedCategory}
                onChange={(event, value) =>
                  handleAutocomplete(
                    event as React.ChangeEvent<HTMLInputElement>,
                    value
                  )
                }
                getOptionLabel={(option: any) => option?.categoryName}
                renderOption={(
                  props,
                  option: { id: string; categoryName: string }
                ) => (
                  <li {...props} key={option?.id}>
                    {option?.categoryName}
                  </li>
                )}
                renderInput={(params) => (
                  <MuiInputField
                    {...params}
                    name="category"
                    value={selectedCategory}
                    error={error.includes("category")}
                    helperText={
                      error.includes("category") && "please select a category"
                    }
                  />
                )}
              />
            </Grid2>

            <Grid2 size={6}>
              <MuiText variant="h6" my={1} className="admin-label-title">
                Asset Sub Category Name{" "}
                <span className="mandatory-sign">*</span>
              </MuiText>
              <MuiInputField
                fullWidth
                variant="outlined"
                size="small"
                InputProps={{
                  inputProps: {
                    maxLength: 50,
                  },
                }}
                autoComplete="off"
                error={error.includes("subcategoryName")}
                helperText={
                  error.includes("subcategoryName") &&
                  "please enter valid sub category name"
                }
                value={subCategoryInput.subcategoryName}
                name="subcategoryName"
                onChange={handleChange}
              />
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
                value={subCategoryInput.description}
                // error={error.includes("description")}
                // helperText={
                //   error.includes("description") &&
                //   "please enter valid description"
                // }
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
              checked={subCategoryInput.isActive === 1}
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
