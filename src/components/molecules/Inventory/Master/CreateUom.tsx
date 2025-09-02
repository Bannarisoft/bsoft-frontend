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
import {
  CreateUomProps,
  CreateUomPropTypes,
} from "../../../../types/inventoryTypes";

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});
const uomFields = [
  {
    label: "UOM Type",
    name: "uomType",
    field: "autocomplete",
    isRequired: true,
    getOptions: (data: { uomType: CreateUomProps[] }) => data.uomType,
    getLabel: (opt: any) => opt?.description || "",
    renderOption: (opt: any) => opt?.description,
  },
  {
    label: "UOM Code",
    name: "code",
    field: "text",
    isRequired: true,
    maxLength: 10,
  },
  {
    label: "UOM Name",
    name: "uomName",
    field: "text",
    isRequired: true,
    maxLength: 45,
  },
];

export default function CreateInveUom({
  open,
  close,
  error,
  uomType,
  uomInput,
  selectedUomType,
  handleAutocompleteChange,
  handleChange,
  handleSubmit,
  handleSwitch,
  editFlag,
}: CreateUomPropTypes) {
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
            {editFlag ? "Edit UOM" : "Create UOM"}
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
            {uomFields.map((field) => {
              const options = field.getOptions
                ? field.getOptions({ uomType })
                : [];

              return (
                <Grid2 key={field.name} size={4}>
                  <MuiText variant="h6" my={1} className="admin-label-title">
                    {field.label}{" "}
                    {field.isRequired && (
                      <span className="mandatory-sign">*</span>
                    )}
                  </MuiText>

                  {field.field === "autocomplete" ? (
                    <Autocomplete
                      options={options as any[]}
                      getOptionLabel={(option) =>
                        field.getLabel ? field.getLabel(option) : ""
                      }
                      value={selectedUomType}
                      renderOption={(props, option) => (
                        <li {...props} key={option.id}>
                          {field.renderOption ? field.renderOption(option) : ""}
                        </li>
                      )}
                      onChange={(e, value) =>
                        handleAutocompleteChange(e, value, field.name)
                      }
                      fullWidth
                      size="small"
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
                      fullWidth
                      variant="outlined"
                      size="small"
                      InputProps={{
                        inputProps: { maxLength: field.maxLength || 100 },
                      }}
                      disabled={field.name === "code" ? editFlag : false}
                      autoComplete="off"
                      error={error.includes(field.name)}
                      helperText={
                        error.includes(field.name) &&
                        `Please enter valid ${field.label.toLowerCase()}`
                      }
                      value={(uomInput as any)[field.name]}
                      name={field.name}
                      onChange={handleChange}
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
          <FormGroup
            sx={{
              pl: 2,
            }}
          >
            <MuiSwitch
              checked={uomInput.isActive === 1}
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
