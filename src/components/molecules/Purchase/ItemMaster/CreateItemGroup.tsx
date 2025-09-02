import {
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  FormGroup,
  Grid2,
  Slide,
} from "@mui/material";
import { TransitionProps } from "@mui/material/transitions";
import React from "react";
import { ItemGroup, ItemGroupType } from "../../../../types/PurchaseTypes";
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
    label: "Item Code",
    name: "itemGroupCode",
    isRequired: true,
    field: "text",
  },
  {
    label: "Item Name",
    name: "itemGroupName",
    isRequired: true,
    field: "text",
  },
];
const CreateItemGroup = ({
  open,
  close,
  editFlag,
  handleChange,
  itemGroupInput,
  handleSubmit,
}: ItemGroupType) => {
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
          },
        }}
      >
        <Box className="popup-header-wrapper">
          <h2 className="dialog-header">
            {`${editFlag ? "Edit" : "Create"}`} Item Group
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
            {itemGroupFields.map((field) => (
              <Grid2 key={field.name} size={6}>
                <MuiText variant="h6" my={1} className="admin-label-title">
                  {field.label}{" "}
                  {field.isRequired && (
                    <span className="mandatory-sign">*</span>
                  )}
                </MuiText>

                <MuiInputField
                  fullWidth
                  name={field.name}
                  type="text"
                  onChange={handleChange}
                  size="small"
                  autoComplete="off"
                  value={itemGroupInput[field.name as keyof ItemGroup] ?? ""}
                  //   error={error.includes(field.name)}
                  //   helperText={
                  //     error.includes(field.name) && "please enter valid value"
                  //   }
                  InputProps={{
                    inputProps: {
                      maxLength: 100,
                    },
                  }}
                />
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
              //   checked={notificationGroupInput.isActive === 1}
              //   onChange={handleSwitch}
              checked
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
};

export default CreateItemGroup;
