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
export interface UomProps {
  code: string;
  uomName: string;
  id: number;
  uomTypeId: number;
  uomType: string;
  isActive: number;
  sortOrder: number;
}
interface CreateUomPropTypes {
  open: boolean;
  close: () => void;
  error: Array<{}>;
  handleUomType: (
    e: React.ChangeEvent<HTMLInputElement>,
    value: { id: string; uomType: string } | null,
    field: string
  ) => void;
  uomInput: UomProps;
  uomType: any;
  selectedUomType: any;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.MouseEvent<HTMLButtonElement>) => void;
  handleSwitch: (e: React.ChangeEvent<HTMLInputElement>) => void;
  editFlag: boolean;
}

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function CreateUom({
  open,
  close,
  error,
  uomType,
  uomInput,
  selectedUomType,
  handleUomType,
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
            <Grid2 size={4}>
              <MuiText variant="h6" my={1} className="admin-label-title">
                UOM Type <span className="mandatory-sign">*</span>
              </MuiText>

              <Autocomplete
                options={uomType || []}
                id="manufacture-type-autocomplete"
                fullWidth
                size="small"
                value={selectedUomType}
                defaultValue={selectedUomType}
                getOptionLabel={(option: any) => option?.description}
                onChange={(event, value) =>
                  handleUomType(
                    event as React.ChangeEvent<HTMLInputElement>,
                    value,
                    "uomType"
                  )
                }
                renderOption={(
                  props,
                  option: { id: string; description: string }
                ) => (
                  <li {...props} key={option?.id}>
                    {option?.description}
                  </li>
                )}
                renderInput={(params) => (
                  <MuiInputField
                    {...params}
                    name="uomType"
                    value={uomInput.uomTypeId}
                    error={error.includes("uomType")}
                    helperText={
                      error.includes("uomType") && "please select a uom Type "
                    }
                  />
                )}
              />
            </Grid2>
            <Grid2 size={4}>
              <MuiText variant="h6" my={1} className="admin-label-title">
               UOM Code <span className="mandatory-sign">*</span>
              </MuiText>
              <MuiInputField
                fullWidth
                variant="outlined"
                size="small"
                InputProps={{
                  inputProps: {
                    maxLength: 10,
                  },
                }}
                disabled={editFlag}
                autoComplete="off"
                error={error.includes("code")}
                helperText={error.includes("code") && "please enter valid code"}
                value={uomInput.code.toUpperCase()}
                name="code"
                onChange={handleChange}
              />
            </Grid2>
            <Grid2 size={4}>
              <MuiText variant="h6" my={1} className="admin-label-title">
                UOM Name <span className="mandatory-sign">*</span>
              </MuiText>
              <MuiInputField
                fullWidth
                variant="outlined"
                size="small"
                InputProps={{
                  inputProps: {
                    maxLength: 45,
                  },
                }}
                autoComplete="off"
                error={error.includes("uomName")}
                helperText={
                  error.includes("uomName") && "please enter valid name"
                }
                value={uomInput.uomName}
                name="uomName"
                onChange={handleChange}
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
