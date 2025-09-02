import React from "react";
import { HsnPropsType } from "../../../types/PurchaseTypes";
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
import { IoClose } from "react-icons/io5";
import { TransitionProps } from "@mui/material/transitions";
import {
  MuiButton,
  MuiInputField,
  MuiSwitch,
  MuiText,
} from "bsoft-base-elements";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});
const CreateHsnMaster = ({
  open,
  close,
  editFlag,
  handleChange,
  hsnInput,
}: HsnPropsType) => {
  const HsnFields = [
    { label: "Type", name: "type", field: "autocomplete", isRequired: true },
    { label: "HSN Code", name: "hsnCode", isRequired: true },
    { label: "GST Category", name: "gstCategory", field: "autocomplete",isRequired: true },
    { label: "GST%", name: "gstPercent" },
    { label: "CGST%", name: "cgstPercent" },
    { label: "SGST%", name: "sgstPercent" },
    { label: "IGST%", name: "igstPercent" },
    { label: "Valid From", name: "validFrom", field: "date" },
    {
      label: "Description",
      name: "description",
      isMultiline: true,
      isRequired: true,
    },
  ];

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
            {`${editFlag ? "Edit" : "Create"}`} Hsn
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
            {HsnFields.map((field) => (
              <Grid2 key={field.name} size={field.isMultiline ? 12 : 3}>
                <MuiText variant="h6" my={1} className="admin-label-title">
                  {field.label}{" "}
                  {field.isRequired && (
                    <span className="mandatory-sign">*</span>
                  )}
                </MuiText>

                {field.field === "autocomplete" ? (
                  <Autocomplete
                    options={[]}
                    fullWidth
                    size="small"
                    // value={selectedMisc}
                    // onChange={(event, value) =>
                    //   handleAutocomplete(event as any, value)
                    // }
                    // getOptionLabel={(option) => option?.miscTypeCode}
                    // renderOption={(props, option) => (
                    //   <li {...props} key={option.id}>
                    //     {option.miscTypeCode}
                    //   </li>
                    // )}
                    renderInput={(params) => (
                      <MuiInputField
                        {...params}
                        name="type"
                        // error={error.includes("miscType")}
                        // helperText={
                        //   error.includes("miscType") &&
                        //   "please select a misc type"
                        // }
                      />
                    )}
                  />
                ) : field.field === "date" ? (
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      value={
                        hsnInput["validFrom"]
                          ? dayjs(hsnInput["validFrom"])
                          : null
                      }
                      onChange={(date) => {
                        handleChange({
                          target: {
                            name: "validFrom",
                            value: date ? dayjs(date).format("YYYY-MM-DD") : "",
                          },
                        } as React.ChangeEvent<HTMLInputElement>);
                      }}
                      minDate={dayjs()}
                      maxDate={dayjs().add(30, "day")}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          size: "small",
                          placeholder: "",
                        },
                      }}
                    />
                  </LocalizationProvider>
                ) : (
                  <MuiInputField
                    fullWidth
                    type="text"
                    variant="outlined"
                    size="small"
                    name={field.name}
                    multiline={field.isMultiline}
                    rows={field.isMultiline ? 3 : undefined}
                    value={hsnInput[field.name] || ""}
                    disabled={[
                      "cgstPercent",
                      "sgstPercent",
                      "igstPercent",
                    ].includes(field.name)}
                    InputProps={{
                      inputProps: {
                        maxLength: field.name === "hsnCode" ? 8 : 250,
                      },
                    }}
                    onChange={handleChange}
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
              checked
              //   onChange={handleSwitch}
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
              // onClick={handleSubmit}
            >
              Submit
            </MuiButton>
          </Box>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
};

export default CreateHsnMaster;
