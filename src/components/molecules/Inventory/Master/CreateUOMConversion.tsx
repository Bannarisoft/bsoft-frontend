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
  GetByUom,
  UomConversionPropTypes,
} from "../../../../types/inventoryTypes";

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});
const uomConversionFields = [
  {
    label: "From UOM",
    name: "fromUOMId",
    field: "autocomplete",
    isRequired: true,
    getOptions: (data: { uomData: GetByUom[] }) => data?.uomData ?? [],
    getLabel: (opt: GetByUom) => opt?.uomName || "",
    renderOption: (opt: GetByUom) => opt?.uomName,
  },
  {
    label: "To UOM",
    name: "toUOMId",
    field: "autocomplete",
    isRequired: true,
    getOptions: (data: { uomData: GetByUom[] }) => data?.uomData ?? [],
    getLabel: (opt: GetByUom) => opt?.uomName || "",
    renderOption: (opt: GetByUom) => opt?.uomName,
  },
  {
    label: "Conversion Value",
    name: "conversionValue",
    field: "number",
    isRequired: true,
  },
];

export default function CreateInveUomConversion({
  open,
  close,
  error,
  handleAutocompleteChange,
  handleChange,
  handleSubmit,
  handleSwitch,
  editFlag,
  uomConversionInput,
  selectedUomConversion,
  uomData,
}: UomConversionPropTypes) {
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
            {editFlag ? "Edit UOM Conversion" : "Create UOM Conversion"}
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
            {uomConversionFields.map((field) => {
              const options = field.getOptions
                ? field.getOptions({ uomData })
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
                      options={options}
                      getOptionLabel={(option) =>
                        field.getLabel ? field.getLabel(option) : ""
                      }
                      value={
                        field.name === "fromUOMId"
                          ? selectedUomConversion?.fromUOM || null
                          : selectedUomConversion?.toUOM || null
                      }
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
                      type="number"
                      autoComplete="off"
                      InputProps={{ inputProps: { min: 0 } }}
                      error={error.includes(field.name)}
                      helperText={
                        error.includes(field.name) &&
                        `Please enter valid ${field.label.toLowerCase()}`
                      }
                      value={(uomConversionInput as any)[field.name]}
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
              checked={uomConversionInput.isActive === 1}
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
