import * as React from "react";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import Slide from "@mui/material/Slide";
import { TransitionProps } from "@mui/material/transitions";
import {
  Autocomplete,
  Box,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Grid2,
} from "@mui/material";
import { IoClose } from "react-icons/io5";
import {
  MuiButton,
  MuiInputField,
  MuiSwitch,
  MuiText,
} from "bsoft-base-elements";
import { isSubmitting } from "../../../utils/lib";
interface GroupSubProps {
  code: string;
  subGroupName: string;
  groupId: number;
  subGroupPercentage: number;
  additionalDepreciation: number;
  id: number;
  isActive: number;
  sortOrder: number;
}
interface CreateMiscPropTypes {
  open: boolean;
  close: () => void;
  groupInput: GroupSubProps;
  handleSubmit: (e: React.MouseEvent<HTMLButtonElement>) => void;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error: Array<{}>;
  handleSwitch: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleGroupChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleChecked: (e: React.ChangeEvent<HTMLInputElement>) => void;
  editFlag: boolean;
  assetGroupData: any[];
  selectedSubGroup: any;
  handleSubGroupChange: (
    e: React.ChangeEvent<HTMLInputElement>,
    value: { id: string; groupName: string } | null
  ) => void;
}

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function CreateAssetSubGroup({
  open,
  close,
  groupInput,
  handleSubmit,
  handleChange,
  error,
  handleSwitch,
  editFlag,
  assetGroupData,
  handleGroupChange,
  handleChecked,
  selectedSubGroup,
  handleSubGroupChange,
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
            {editFlag ? "Edit Asset Sub Group" : "Create Asset Sub Group"}
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
                Select Parent Group <span className="mandatory-sign">*</span>
              </MuiText>
              <Autocomplete<{ id: string; groupName: string }>
                options={assetGroupData || []}
                id="manufacture-type-autocomplete"
                fullWidth
                size="small"
                value={selectedSubGroup}
                getOptionLabel={(option: any) => option?.groupName}
                onChange={(event, value) =>
                  handleSubGroupChange(
                    event as React.ChangeEvent<HTMLInputElement>,
                    value
                  )
                }
                renderOption={(
                  props,
                  option: { id: string; groupName: string }
                ) => (
                  <li {...props} key={option?.id}>
                    {option?.groupName}
                  </li>
                )}
                renderInput={(params) => (
                  <MuiInputField {...params} name="assetSubGroupId" />
                )}
              />
            </Grid2>
            <Grid2 size={4}>
              <MuiText variant="h6" my={1} className="admin-label-title">
                Asset Sub Group Code <span className="mandatory-sign">*</span>
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
                Asset Sub Group Name <span className="mandatory-sign">*</span>
              </MuiText>
              <MuiInputField
                fullWidth
                type="text"
                variant="outlined"
                size="small"
                name="subGroupName"
                autoComplete="off"
                value={groupInput.subGroupName}
                error={error.includes("subGroupName")}
                helperText={
                  error.includes("subGroupName") && "please enter valid sub group name"
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
                Asset Sub Group Percentage{" "}
                <span className="mandatory-sign">%</span>
              </MuiText>
              <MuiInputField
                fullWidth
                type="number"
                variant="outlined"
                size="small"
                name="subGroupPercentage"
                autoComplete="off"
                InputProps={{ inputProps: { min: 0 } }}
                value={groupInput.subGroupPercentage}
                error={error.includes("subGroupPercentage")}
                helperText={
                  error.includes("subGroupPercentage") &&
                  "please enter valid group name"
                }
                onChange={handleChange}
              />
            </Grid2>
            <Grid2
              size={4}
              display={"flex"}
              sx={{
                justifyContent: "center",
                alignItems: "center",
                mt: "auto",
              }}
            >
              <FormGroup>
                <FormControlLabel
                  control={
                    <Checkbox
                      defaultChecked
                      value={Boolean(groupInput.additionalDepreciation)}
                      onChange={handleChecked}
                    />
                  }
                  label="Additional Cost Applicable"
                />
              </FormGroup>
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
