import {
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  FormGroup,
  Grid2,
  Slide,
} from "@mui/material";
import React from "react";
import { IoClose } from "react-icons/io5";
import { CreateFinancialPropTypes } from "../../../types";
import { TransitionProps } from "@mui/material/transitions";
import InputDatePicker from "../../atoms/Datepicker";
import dayjs from "dayjs";
import { MuiButton, MuiSwitch, MuiText } from "bsoft-base-elements";
import { DateFormatter } from "../../../utils/lib";

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});
const CreateNewFinancial = ({
  open,
  close,
  handleSubmit,
  handleChange,
  handleSwitch,
  error,
  financialInput,
  editFlag,
}: CreateFinancialPropTypes) => {
  return (
    <React.Fragment>
      <Dialog
        open={open}
        TransitionComponent={Transition}
        keepMounted
        aria-describedby="alert-dialog-slide-description"
        sx={{
          "& .MuiPaper-root": {
            borderRadius: "8px",
          },
        }}
      >
        <Box className="popup-header-wrapper">
          <h2 className="dialog-header">
            {editFlag ? "Edit  Financial Year" : "Create Financial Year"}
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
                Start Year <span className="mandatory-sign">*</span>
              </MuiText>
              <InputDatePicker
                label="Year"
                openTo="year"
                views={["year"]}
                format="YYYY"
                slotProps={{
                  textField: {
                    size: "small",
                    error: error.includes("startYear"),
                    helperText: error.includes("startYear")
                      ? "Please enter a valid year"
                      : "",
                  },
                }}
                value={
                  financialInput.startYear
                    ? dayjs(financialInput.startYear)
                    : null
                }
                onChange={(newValue) => handleChange("startYear", newValue)}
                name="startYear"
              />
            </Grid2>
            <Grid2 size={6}>
              <MuiText variant="h6" my={1} className="admin-label-title">
                Start Date <span className="mandatory-sign">*</span>
              </MuiText>
              <InputDatePicker
                format="DD-MM-YYYY"
                slotProps={{
                  textField: {
                    size: "small",
                    error: error.includes("startDate"),
                    helperText: error.includes("startDate")
                      ? "Please enter a valid date"
                      : "",
                    inputProps: {
                      placeholder: "",
                      value: financialInput.startDate
                        ? DateFormatter(financialInput.startDate)
                        : "",
                      readOnly: true,
                    },
                  },
                }}
                onChange={(newValue) => handleChange("startDate", newValue)}
                name="startDate"
              />
            </Grid2>
            <Grid2 size={6}>
              <MuiText variant="h6" my={1} className="admin-label-title">
                End Date <span className="mandatory-sign">*</span>
              </MuiText>
              <InputDatePicker
                format="DD-MM-YYYY" 
                slotProps={{
                  textField: {
                    size: "small",
                    error: error.includes("endDate"),
                    helperText: error.includes("endDate")
                      ? "Please enter a valid date"
                      : "",
                    inputProps: {
                      placeholder: "",
                      value: financialInput.endDate
                        ? DateFormatter(financialInput.endDate)
                        : "",
                      readOnly: true,
                    },
                  },
                }}
                onChange={(newValue) => handleChange("endDate", newValue)}
                name="endDate"
              />
            </Grid2>
            <Grid2 size={6}>
              <MuiText variant="h6" my={1} className="admin-label-title">
                Financial Year <span className="mandatory-sign">*</span>
              </MuiText>
              <InputDatePicker
                label="Year"
                openTo="year"
                views={["year"]}
                format="YYYY"
                slotProps={{
                  textField: {
                    size: "small",
                  },
                }}
                value={
                  financialInput.finYearName
                    ? dayjs(financialInput.finYearName)
                    : null
                }
                onChange={(newValue) => handleChange("finYearName", newValue)}
                name="finYearName"
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
              onChange={handleSwitch}
              checked={financialInput.isActive === 1}
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

export default CreateNewFinancial;
