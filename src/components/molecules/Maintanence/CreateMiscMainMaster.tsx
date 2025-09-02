import * as React from "react";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import Slide from "@mui/material/Slide";
import { TransitionProps } from "@mui/material/transitions";
import { Autocomplete, Box, FormGroup, Grid2 } from "@mui/material";
import { IoClose } from "react-icons/io5";
import { MiscProps } from "../../organisms/FAM/MiscMasterPage";
import {
  MuiButton,
  MuiInputField,
  MuiSwitch,
  MuiText,
} from "bsoft-base-elements";
import { CreateMiscMainPropTypes } from "../../../types/maintanenceTypes";
import { isSubmitting } from "../../../utils/lib";

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

function CreateMiscMain({
  open,
  close,
  miscInput,
  handleSubmit,
  handleChange,
  error,
  handleSwitch,
  miscType,
  handleAutocomplete,
  selectedMisc,
  editFlag,
}: CreateMiscMainPropTypes) {
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
            {`${editFlag ? "Edit" : "Create"}`} Main Misc
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
                Misc Type <span className="mandatory-sign">*</span>
              </MuiText>
              <Autocomplete<{ id: string; miscTypeCode: string }>
                options={miscType || []}
                id="country-autocomplete"
                fullWidth
                size="small"
                value={selectedMisc}
                onChange={(event, value) =>
                  handleAutocomplete(
                    event as React.ChangeEvent<HTMLInputElement>,
                    value
                  )
                }
                getOptionLabel={(option) => option?.miscTypeCode}
                renderOption={(props, option, state) => (
                  <li {...props} key={option?.id}>
                    {option?.miscTypeCode}
                  </li>
                )}
                renderInput={(params) => (
                  <MuiInputField
                    {...params}
                    name="miscType"
                    error={error.includes("miscType")}
                    helperText={
                      error.includes("miscType") && "please select a misc type"
                    }
                  />
                )}
              />
            </Grid2>
            <Grid2 size={6}>
              <MuiText variant="h6" my={1} className="admin-label-title">
                Misc Code <span className="mandatory-sign">*</span>
              </MuiText>
              <MuiInputField
                fullWidth
                variant="outlined"
                autoComplete="off"
                size="small"
                InputProps={{
                  inputProps: {
                    maxLength: 45,
                  },
                }}
                disabled={editFlag}
                error={error.includes("miscCode")}
                helperText={
                  error.includes("miscCode") && "please enter valid code"
                }
                value={miscInput.miscCode.toUpperCase()}
                name="miscCode"
                onChange={handleChange}
              />
            </Grid2>
            <Grid2 size={12}>
              <MuiText variant="h6" my={1} className="admin-label-title">
                Description <span className="mandatory-sign">*</span>
              </MuiText>
              <MuiInputField
                fullWidth
                type="text"
                variant="outlined"
                size="small"
                name="description"
                value={miscInput.description}
                rows={3}
                multiline
                error={error.includes("description")}
                helperText={
                  error.includes("description") && "please enter valid code"
                }
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
              checked={miscInput.isActive === 1}
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
export default CreateMiscMain;
