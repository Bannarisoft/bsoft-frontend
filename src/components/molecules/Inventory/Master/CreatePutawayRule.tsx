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
import { PutawayPropTypes, Strategy } from "../../../../types/inventoryTypes";
import { RiDeleteBin6Line } from "react-icons/ri";
import { MdOutlineLibraryAdd } from "react-icons/md";

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const PutawayRuleFields = [
  {
    label: "Item Group",
    name: "itemGroupId",
    field: "autocomplete",
    isRequired: true,
    getOptions: (data: any) => data.ItemGroup ?? [],
    getLabel: (opt: any) => opt?.itemGroupName || "",
    renderOption: (opt: any) => opt?.itemGroupName,
  },
  {
    label: "Item Category",
    name: "itemCategoryId",
    field: "autocomplete",
    isRequired: true,
    getOptions: (data: any) => data.ItemCategory ?? [],
    getLabel: (opt: any) => opt?.itemCategoryName || "",
    renderOption: (opt: any) => opt?.itemCategoryName,
  },
  {
    label: "Item",
    name: "itemId",
    field: "autocomplete",
    // isRequired: true,
    getOptions: (data: any) => data.itemOptions ?? [],
    getLabel: (opt: any) => `${opt.itemCode} - ${opt.itemName}` || "",
    renderOption: (opt: any) => `${opt.itemCode} - ${opt.itemName}`,
  },
  {
    label: "Warehouse",
    name: "warehouseId",
    field: "autocomplete",
    isRequired: true,
    getOptions: (data: any) => data.warehouse ?? [],
    getLabel: (opt: any) => opt?.warehouseName || "",
    renderOption: (opt: any) => opt?.warehouseName,
  },
  {
    label: "Storage Type",
    name: "storageTypeId",
    field: "autocomplete",
    isRequired: true,
    getOptions: (data: any) => data.StorageType ?? [],
    getLabel: (opt: any) => opt?.code || "",
    renderOption: (opt: any) => opt?.code,
  },
  {
    label: "Rack",
    name: "rackId",
    field: "autocomplete",
    isRequired: true,
    getOptions: (data: any) => data.Rack ?? [],
    getLabel: (opt: any) => opt?.rackName || "",
    renderOption: (opt: any) => opt?.rackName,
  },
  {
    label: "Bin",
    name: "binId",
    field: "autocomplete",
    isRequired: true,
    getOptions: (data: any) => data.Bin ?? [],
    getLabel: (opt: any) => opt?.binName || "",
    renderOption: (opt: any) => opt?.binName,
  },
  {
    label: "Priority",
    name: "priorityId",
    field: "autocomplete",
    isRequired: true,
    getOptions: (data: any) => data.Priority ?? [],
    getLabel: (opt: any) => opt?.code || "",
    renderOption: (opt: any) => opt?.code,
  },
];

const CreatePutawayRule = ({
  open,
  close,
  handleSwitch,
  editFlag,
  error,
  selectedValues,
  ItemGroup,
  ItemCategory,
  warehouse,
  StorageType,
  Rack,
  Bin,
  Priority,
  handleAutocompleteChange,
  handleSubmit,
  handleAddStorageRule,
  getFilteredOptions,
  handleDeleteStorageRule,
  putawayRuleInput,
  itemOptions,
}: PutawayPropTypes) => {
  return (
    <Dialog open={open} TransitionComponent={Transition} keepMounted fullScreen>
      <Box className="popup-header-wrapper">
        <h2 className="dialog-header">
          {editFlag ? "Edit Putaway Rule" : "Create Putaway Rule"}
        </h2>
        <IoClose fontSize={24} onClick={close} cursor="pointer" color="#fff" />
      </Box>

      <DialogContent sx={{ p: "4px 24px 12px" }}>
        <Grid2 container spacing={2}>
          {PutawayRuleFields.filter(
            (f) =>
              !["storageTypeId", "rackId", "binId", "priorityId"].includes(
                f.name
              )
          ).map((field) => {
            const options =
              field.name === "itemId"
                ? itemOptions ?? []
                : field.getOptions
                  ? field.getOptions({
                    ItemGroup,
                    ItemCategory,
                    itemOptions,
                    warehouse,
                  })
                  : [];
            return (
              <Grid2 key={field.name} size={6}>
                <MuiText variant="h6" my={1} className="admin-label-title">
                  {field.label}
                  {field.isRequired && (
                    <span className="mandatory-sign"> *</span>
                  )}
                </MuiText>

                <Autocomplete
                  options={options}
                  fullWidth
                  size="small"
                  value={selectedValues[field.name]?.[0] || null} // value must match an object from options
                  getOptionLabel={(option) =>
                    typeof option === "string"
                      ? option
                      : field.getLabel
                        ? field.getLabel(option)
                        : ""
                  }
                  isOptionEqualToValue={(option, val) => option?.id === val?.id} // crucial!
                  onChange={(_, value) =>
                    handleAutocompleteChange(field.name, value)
                  }
                  renderOption={(props, option) => (
                    <li {...props} key={option?.id}>
                      {field.renderOption ? field.renderOption(option) : ""}
                    </li>
                  )}
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
              </Grid2>
            );
          })}
        </Grid2>

        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          mt={5}
        >
          <MuiText variant="h6" my={1} pt={1} className="admin-page-title">
            Putaway Strategies
          </MuiText>
          <MdOutlineLibraryAdd
            size={24}
            onClick={handleAddStorageRule}
            color="#222"
            cursor="pointer"
          />
        </Box>

        {putawayRuleInput.body.strategies.map((rule, idx) => {
          const showRack =
            rule.storageTypeId &&
            StorageType.find((st) => st.id === rule.storageTypeId)?.code ===
            "Rack";
          const showBin =
            rule.storageTypeId &&
            StorageType.find((st) => st.id === rule.storageTypeId)?.code ===
            "Bin";
          const visibleFields = PutawayRuleFields.filter((f) =>
            ["storageTypeId", "rackId", "binId", "priorityId"].includes(f.name)
          ).filter(
            (f) =>
              (f.name !== "rackId" || showRack) &&
              (f.name !== "binId" || showBin)
          );
          const totalColumns = 12,
            statusColumns = 3;
          const gridSize =
            visibleFields.length > 0
              ? Math.floor(
                (totalColumns - statusColumns) / visibleFields.length
              )
              : totalColumns - statusColumns;

          return (
            <Grid2 container spacing={2} alignItems="center" key={idx}>
              {visibleFields.map((field) => {
                const options = field.getOptions
                  ? field.getOptions({ StorageType, Rack, Bin, Priority })
                  : [];
                const fieldName = field.name as keyof Strategy;
                const isFilterableField =
                  fieldName === ("rackId" as keyof Strategy) ||
                  fieldName === ("binId" as keyof Strategy);
                return (
                  <Grid2 key={field.name} size={gridSize}>
                    <MuiText variant="h6" my={1} className="admin-label-title">
                      {field.label}
                      {field.isRequired && (
                        <span className="mandatory-sign"> *</span>
                      )}
                    </MuiText>

                    <Autocomplete
                      options={
                        isFilterableField
                          ? getFilteredOptions(
                            rule.targetId
                              ? options.find(
                                (o: any) => o.id === rule.targetId
                              )
                              : null,
                            options,
                            idx,
                            putawayRuleInput.body.strategies,
                            fieldName
                          )
                          : options
                      }
                      size="small"
                      fullWidth
                      value={
                        isFilterableField
                          ? options.find((o: any) => o.id === rule.targetId) ||
                          null
                          : options.find(
                            (o: any) => o.id === rule[fieldName]
                          ) || null
                      }
                      onChange={(_, value) =>
                        handleAutocompleteChange(fieldName, value, idx)
                      }
                      getOptionLabel={(option) =>
                        typeof option === "string"
                          ? option
                          : field.getLabel
                            ? field.getLabel(option)
                            : ""
                      }
                      isOptionEqualToValue={(opt, val) => opt?.id === val?.id}
                      renderOption={(props, option) => (
                        <li {...props} key={option?.id}>
                          {field.renderOption ? field.renderOption(option) : ""}
                        </li>
                      )}
                      renderInput={(params) => (
                        <MuiInputField
                          {...params}
                          name={field.name}
                          error={error.includes(`${field.name}_${idx}`)}
                          helperText={
                            error.includes(`${field.name}_${idx}`) &&
                            `Please select ${field.label.toLowerCase()}`
                          }
                        />
                      )}
                    />
                  </Grid2>
                );
              })}

              <Grid2
                size={3}
                mt={5}
                display="flex"
                justifyContent="space-around"
              >
                <MuiSwitch checked onChange={handleSwitch} label="Status" />
                <RiDeleteBin6Line
                  size={24}
                  color="red"
                  cursor="pointer"
                  onClick={() => handleDeleteStorageRule(idx)}
                />
              </Grid2>
            </Grid2>
          );
        })}
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
          <MuiSwitch checked onChange={handleSwitch} label="Status" />
        </FormGroup>
        <Box
          display={"flex"}
          alignItems={"center"}
          gap={2}
          sx={{ button: { minWidth: "70px !important" } }}
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
  );
};

export default CreatePutawayRule;
