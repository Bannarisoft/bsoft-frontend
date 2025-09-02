import {
  Autocomplete,
  Box,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  FormControlLabel,
  FormGroup,
  Grid2,
  Slide,
} from "@mui/material";
import { TransitionProps } from "@mui/material/transitions";
import React from "react";
import {
  GetByCategory,
  GetByGroup,
  ItemCategory,
  ItemCategoryType,
  ItemGroup,
} from "../../../../types/PurchaseTypes";
import { IoClose } from "react-icons/io5";
import {
  MuiButton,
  MuiInputField,
  MuiSwitch,
  MuiText,
} from "bsoft-base-elements";
const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});
const itemGroupFields = [
  {
    label: "Category Name",
    name: "itemCategoryName",
    isRequired: true,
    field: "text",
  },
  {
    label: "Item Group",
    name: "itemGroupId",
    field: "autocomplete",
    isRequired: true,
    getOptions: (data: { itemgroupData: GetByGroup[] }) => data.itemgroupData,
    getLabel: (opt: GetByGroup) => opt.itemGroupName || "",
    renderOption: (opt: GetByGroup) => opt.itemGroupName,
  },
  {
    label: "Parent Category",
    name: "parentCategoryId",
    field: "autocomplete",
    getOptions: (data: { itemcategoryData: GetByCategory[] }) =>
      data.itemcategoryData,
    getLabel: (opt: GetByCategory) => opt.itemCategoryName || "",
    renderOption: (opt: GetByCategory) => opt.itemCategoryName,
  },
];

const CreateItemCategory = ({
  open,
  close,
  editFlag,
  handleAutocompleteChange,
  itemgroupData,
  itemcategoryData,
  itemCategoryInput,
  handleSwitch,
  handleCheck,
  selectedValues,
  handleSubmit,
  error,
  handleChange,
}: ItemCategoryType) => {
  return (
    <React.Fragment>
      <Dialog
        open={open}
        TransitionComponent={Transition}
        keepMounted
        aria-describedby="alert-dialog-slide-description"
        sx={{
          "& .MuiPaper-root": {
            width: "1000px",
            borderRadius: "8px",
            maxWidth: "none !important",
          },
        }}
      >
        <Box className="popup-header-wrapper">
          <h2 className="dialog-header">
            {" "}
            {`${editFlag ? "Edit" : "Create"}`} Item Category{" "}
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
            {itemGroupFields.map((field) => {
              const options = field.getOptions
                ? field.getOptions({ itemgroupData, itemcategoryData })
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
                      value={
                        field.name === "itemGroupId"
                          ? selectedValues.itemGroupId
                          : selectedValues.parentCategoryId
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
                      name={field.name}
                      onChange={handleChange}
                      value={itemCategoryInput.itemCategoryName}
                      type="text"
                      autoComplete="off"
                      size="small"
                      InputProps={{
                        inputProps: { maxLength: 100 },
                      }}
                      error={error.includes(field.name)}
                      helperText={
                        error.includes(field.name) &&
                        `Please select ${field.label.toLowerCase()}`
                      }
                    />
                  )}
                </Grid2>
              );
            })}
            <Grid2 size={4}>
              <FormControlLabel
                control={
                  <Checkbox
                    name="isGroup"
                    checked={itemCategoryInput.isGroup === 1}
                    onChange={handleCheck}
                  />
                }
                label="Group"
              />

              <FormControlLabel
                control={
                  <Checkbox
                    name="isBudgetApplicable"
                    checked={itemCategoryInput.isBudgetApplicable === 1}
                    onChange={handleCheck}
                  />
                }
                label="Budget Applicable"
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
          <FormGroup sx={{ pl: 2 }}>
            <MuiSwitch
              checked={itemCategoryInput.isActive === 1}
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
            <MuiButton className="filled-icon-btn" onClick={handleSubmit}>
              Submit
            </MuiButton>
          </Box>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
};

export default CreateItemCategory;
