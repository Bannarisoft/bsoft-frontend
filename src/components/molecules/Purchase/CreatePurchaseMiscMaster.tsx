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
import { CreateMiscMainPropTypes } from "../../../types/maintanenceTypes";

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const purchaseMiscFields = [
  {
    label: "Misc Type",
    name: "miscType",
    field: "autocomplete",
    isRequired: true,
  },
  {
    label: "Misc Code",
    name: "miscCode",
    isRequired: true,
  },
  {
    label: "Description",
    name: "description",
    isMultiline: true,
    isRequired: true,
  },
];

function CreatePurchaseMisc({
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
            {`${editFlag ? "Edit" : "Create"}`} Purchase Misc
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
            {purchaseMiscFields.map((field) => (
              <Grid2 key={field.name} size={field.isMultiline ? 12 : 6}>
                <MuiText variant="h6" my={1} className="admin-label-title">
                  {field.label}{" "}
                  {field.isRequired && (
                    <span className="mandatory-sign">*</span>
                  )}
                </MuiText>

                {field.field === "autocomplete" && (
                  <Autocomplete<{ id: string; miscTypeCode: string }>
                    options={miscType || []}
                    fullWidth
                    size="small"
                    value={selectedMisc}
                    onChange={(event, value) =>
                      handleAutocomplete(event as any, value)
                    }
                    getOptionLabel={(option) => option?.miscTypeCode}
                    renderOption={(props, option) => (
                      <li {...props} key={option.id}>
                        {option.miscTypeCode}
                      </li>
                    )}
                    renderInput={(params) => (
                      <MuiInputField
                        {...params}
                        name="miscType"
                        error={error.includes("miscType")}
                        helperText={
                          error.includes("miscType") &&
                          "please select a misc type"
                        }
                      />
                    )}
                  />
                )}

                {field.isMultiline && (
                  <MuiInputField
                    fullWidth
                    name={field.name}
                    // value={miscInput[field.name]}
                    onChange={handleChange}
                    multiline
                    rows={3}
                    size="small"
                    error={error.includes(field.name)}
                    helperText={
                      error.includes(field.name) && "please enter valid value"
                    }
                    InputProps={{
                      inputProps: {
                        maxLength: 250,
                      },
                    }}
                  />
                )}

                {!field.isMultiline && field.field !== "autocomplete" && (
                  <MuiInputField
                    fullWidth
                    name={field.name}
                    // value={
                    //   field.name === "miscCode"
                    //     ? miscInput[field.name]?.toUpperCase()
                    //     : miscInput[field.name]
                    // }
                    onChange={handleChange}
                    size="small"
                    error={error.includes(field.name)}
                    helperText={
                      error.includes(field.name) && "please enter valid value"
                    }
                    InputProps={{
                      inputProps: {
                        maxLength: 45,
                      },
                    }}
                    disabled={field.name === "miscCode" && editFlag}
                  />
                )}
              </Grid2>
            ))}
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
            <MuiButton variant="contained" onClick={handleSubmit}>
              Submit
            </MuiButton>
          </Box>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}

export default CreatePurchaseMisc;
