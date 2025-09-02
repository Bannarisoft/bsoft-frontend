import * as React from "react";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import Slide from "@mui/material/Slide";
import { TransitionProps } from "@mui/material/transitions";
import { Autocomplete, Box, FormGroup, Grid2 } from "@mui/material";
import { IoClose } from "react-icons/io5";
import { GroupProps } from "../../organisms/FAM/AssetGroupPage";
import {
  MuiButton,
  MuiInputField,
  MuiSwitch,
  MuiText,
} from "bsoft-base-elements";
import { isSubmitting } from "../../../utils/lib";

interface CreateMiscPropTypes {
  open: boolean;
  close: () => void;
  groupInput: GroupProps;
  handleSubmit: (e: React.MouseEvent<HTMLButtonElement>) => void;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error: Array<{}>;
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

export default function CreateAssetGroup({
  open,
  close,
  groupInput,
  handleSubmit,
  handleChange,
  error,
  handleSwitch,
  editFlag,
}: CreateMiscPropTypes) {
  return (
    <React.Fragment>
      <Dialog
        open={open}
        TransitionComponent={Transition}
        keepMounted
        aria-describedby="alert-dialog-slide-description"
        sx={{
          "& .MuiPaper-root": {
            width: "60rem",
            borderRadius: "8px",
            maxWidth: "none !important",
          },
        }}
      >
        <Box className="popup-header-wrapper">
          <h2 className="dialog-header">
            {editFlag ? "Edit Asset Group" : "Create Asset Group"}
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
                Asset Group Code <span className="mandatory-sign">*</span>
              </MuiText>
              <MuiInputField
                fullWidth
                variant="outlined"
                size="small"
                InputProps={{
                  inputProps: {
                    maxLength: 15,
                  },
                }}
                disabled={editFlag}
                autoComplete="off"
                error={error.includes("code")}
                helperText={error.includes("code") && "please enter valid code"}
                value={groupInput.code.toUpperCase()}
                name="code"
                onChange={handleChange}
              />
            </Grid2>
            <Grid2 size={4}>
              <MuiText variant="h6" my={1} className="admin-label-title">
                Asset Group Name <span className="mandatory-sign">*</span>
              </MuiText>
              <MuiInputField
                fullWidth
                type="text"
                variant="outlined"
                size="small"
                name="groupName"
                autoComplete="off"
                value={groupInput.groupName}
                error={error.includes("groupName")}
                helperText={
                  error.includes("groupName") && "please enter valid group name"
                }
                onChange={handleChange}
                InputProps={{
                  inputProps: {
                    maxLength: 50,
                  },
                }}
              />
            </Grid2>
            <Grid2 size={4}>
              <MuiText variant="h6" my={1} className="admin-label-title">
                Asset Group Percentage <span className="mandatory-sign">%</span>
              </MuiText>
              <MuiInputField
                fullWidth
                type="number"
                variant="outlined"
                size="small"
                name="groupPercentage"
                autoComplete="off"
                value={groupInput.groupPercentage}
                onChange={handleChange}
                onInput={(e: React.FormEvent<HTMLInputElement>) => {
                  const value = parseInt((e.target as HTMLInputElement).value);
                  if (isNaN(value)) return;
                  if (isNaN(value) || value < 0 || value > 99) {
                    (e.target as HTMLInputElement).value = Math.min(
                      Math.max(value, 0),
                      100
                    ).toString();
                  }
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
              checked={groupInput.isActive === 1}
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
