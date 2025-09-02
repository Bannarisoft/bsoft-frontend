import React from "react";
import {
  Autocomplete,
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  FormGroup,
  Slide,
  Grid2,
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

import {
  PartyGroupType,
  CreatePartyGroupType,
} from "../../../types/PurchaseTypes";

type GroupTypeApi = { id: number; code: string; description?: string };
type ParentGroupApi = {
  id: number;
  partyGroupName: string;
  parentPartyGroupName?: string;
};
type GlCategoryApi = { id: number; code: string; description?: string };

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & { children: React.ReactElement<any, any> },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const CreatePartyGroup: React.FC<PartyGroupType> = ({
  open,
  close,
  editFlag,
  handleChange,
  handleSwitch,
  handleSubmit,
  error,
  PartyGroupInput,
  handlePartytypeChange,
  selectedPartyType,
  PartyType,
  handlePartyGroupChange,
  selectedPartyGroup,
  PartyGroupData,
  PartyGlCategory,
  submitDisabled,
}) => {
  const normalizeArray = (src: any) =>
    Array.isArray(src) ? src : Array.isArray(src?.data) ? src.data : [];

  const groupTypeOptions: GroupTypeApi[] = normalizeArray(PartyType);
  const parentGroupOptions: ParentGroupApi[] = normalizeArray(PartyGroupData);
  const glCategoryOptions: GlCategoryApi[] = normalizeArray(PartyGlCategory);

  const findById = <T extends { id: number }>(arr: T[], id?: number) =>
    arr?.find((x) => Number(x.id) === Number(id)) ?? null;

  const groupTypeValue: GroupTypeApi | null =
    (selectedPartyType as any) ??
    findById(groupTypeOptions, PartyGroupInput.groupTypeId);

  const parentGroupValue: ParentGroupApi | null =
    (selectedPartyGroup as any) ??
    findById(parentGroupOptions, PartyGroupInput.parentPartyGroupId);

  const glCategoryValue: GlCategoryApi | null = findById(
    glCategoryOptions,
    PartyGroupInput.glCategoryId
  );

  type FieldKey = keyof CreatePartyGroupType;
  const PartyFields: Array<{
    label: string;
    name: FieldKey;
    field?: "autocomplete" | "date";
    isRequired?: boolean;
    isMultiline?: boolean;
    rows?: number;
    minRows?: number;
    maxRows?: number;
    size: { xs: number; sm: number; lg: number; md: number };
  }> = [
      {
        label: "Group Type",
        name: "groupTypeId",
        field: "autocomplete",
        isRequired: true,
        size: { xs: 12, sm: 6, md: 4, lg: 3 },
      },
      {
        label: "Party Group Name",
        name: "partyGroupName",
        isRequired: true,
        size: { xs: 12, sm: 6, md: 4, lg: 3 },
      },
      {
        label: "Parent Party Group",
        name: "parentPartyGroupId",
        field: "autocomplete",
        isRequired: true,
        size: { xs: 12, sm: 6, md: 4, lg: 3 },
      },
      {
        label: "GL Code",
        name: "glcode",
        isRequired: true,
        size: { xs: 12, sm: 6, md: 4, lg: 3 },
      },
      {
        label: "GL Category",
        name: "glCategoryId",
        field: "autocomplete",
        isRequired: true,
        size: { xs: 12, sm: 6, md: 4, lg: 3 },
      },
      {
        label: "Description",
        name: "description",
        isMultiline: true,
        minRows: 1,
        maxRows: 6,
        size: { xs: 12, sm: 12, md: 8, lg: 9 },
      },
    ];
  // near top of component
  const showIsGroup = !editFlag;

  // Local switches (no name prop on MuiSwitch)
  const [isActiveLocal, setIsActiveLocal] = React.useState(false);
  React.useEffect(() => {
    setIsActiveLocal(Number(PartyGroupInput?.isActive) === 1);
  }, [PartyGroupInput?.isActive, open]);

  const [isGlGroupLocal, setIsGlGroupLocal] = React.useState(false);
  React.useEffect(() => {
    setIsGlGroupLocal(Number(PartyGroupInput?.isGroup) === 1);
  }, [PartyGroupInput?.isGroup, open]);

  const onActiveChange = (valOrEvent: any) => {
    const checked =
      typeof valOrEvent === "boolean"
        ? valOrEvent
        : !!valOrEvent?.target?.checked;
    setIsActiveLocal(checked);
    // synthesize event that the parent understands
    handleSwitch({
      target: { name: "isActive", checked, value: checked ? 1 : 0 },
    } as unknown as React.ChangeEvent<HTMLInputElement>);
  };

  const onGlGroupChange = (valOrEvent: any) => {
    const checked =
      typeof valOrEvent === "boolean"
        ? valOrEvent
        : !!valOrEvent?.target?.checked;
    setIsGlGroupLocal(checked);
    handleSwitch({
      target: { name: "isGroup", checked, value: checked ? 1 : 0 },
    } as unknown as React.ChangeEvent<HTMLInputElement>);
  };

  const synthChange = (name: string, value: any) =>
  ({
    target: { name, value },
  } as unknown as React.ChangeEvent<HTMLInputElement>);

  const onPartyTypeChange = (
    event: React.SyntheticEvent,
    value: GroupTypeApi | null
  ) => {
    if (typeof handlePartytypeChange === "function") {
      handlePartytypeChange(event, value as any, "groupTypeId");
    }
    const id = value?.id ?? 0;
    const label = value?.code ?? "";
    handleChange(synthChange("groupTypeId", id));
    handleChange(synthChange("groupName", label));
  };

  const onParentGroupChange = (
    event: React.SyntheticEvent,
    value: ParentGroupApi | null
  ) => {
    if (typeof handlePartyGroupChange === "function") {
      handlePartyGroupChange(event, value as any, "parentPartyGroupId");
    }
    const id = value?.id ?? 0;
    const label = value?.partyGroupName ?? "";
    handleChange(synthChange("parentPartyGroupId", id));
    handleChange(synthChange("parentPartyGroupName", label));
  };

  const onGlCategoryChange = (
    _event: React.SyntheticEvent,
    value: GlCategoryApi | null
  ) => {
    const id = value?.id ?? 0;
    const label = value?.code ?? "";
    handleChange(synthChange("glCategoryId", id));
    handleChange(synthChange("glCategoryName", label));
  };

  const getGroupTypeLabel = (option: GroupTypeApi) =>
    option?.code ?? option?.description ?? "";
  const getParentGroupLabel = (option: ParentGroupApi) =>
    option?.partyGroupName ?? "";
  const getGlCategoryLabel = (option: GlCategoryApi) => option?.code ?? "";
  const equalById = (o: any, v: any) => Number(o?.id) === Number(v?.id);

  const hasErr = (field: keyof CreatePartyGroupType) =>
    error.includes(field as string);

  const help = (field: keyof CreatePartyGroupType, label: string) =>
    hasErr(field) ? `${label} is required.` : "";

  return (
    <React.Fragment>
      <Dialog
        open={open}
        onClose={close}
        TransitionComponent={Transition}
        keepMounted
        aria-describedby="alert-dialog-slide-description"
        sx={{ "& .MuiPaper-root": { minWidth: "55vw", borderRadius: "8px" } }}
      >
        <Box className="popup-header-wrapper">
          <h2 className="dialog-header">
            {`${editFlag ? "Edit" : "Create"}`} Party Group
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
            {PartyFields.map((field) => (
              <Grid2 size={field.size} key={field.name}>
                <MuiText variant="h6" my={1} className="admin-label-title">
                  {field.label}{" "}
                  {field.isRequired && (
                    <span className="mandatory-sign">*</span>
                  )}
                </MuiText>

                {field.field === "autocomplete" ? (
                  field.name === "groupTypeId" ? (
                    <Autocomplete
                      options={groupTypeOptions}
                      fullWidth
                      size="small"
                      value={groupTypeValue}
                      onChange={(e, v) => onPartyTypeChange(e, v)}
                      getOptionLabel={getGroupTypeLabel}
                      isOptionEqualToValue={equalById}
                      renderInput={(params) => (
                        <MuiInputField
                          {...params}
                          name="groupTypeId"
                          error={hasErr("groupTypeId")}
                          helperText={help("groupTypeId", "Group Type")}
                        />
                      )}
                    />
                  ) : field.name === "parentPartyGroupId" ? (
                    <Autocomplete
                      options={parentGroupOptions}
                      fullWidth
                      size="small"
                      value={parentGroupValue}
                      onChange={(e, v) => onParentGroupChange(e, v)}
                      getOptionLabel={getParentGroupLabel}
                      isOptionEqualToValue={equalById}
                      renderInput={(params) => (
                        <MuiInputField
                          {...params}
                          name="parentPartyGroupId"
                          error={hasErr("parentPartyGroupId")}
                          helperText={help(
                            "parentPartyGroupId",
                            "Parent Party Group"
                          )}
                        />
                      )}
                    />
                  ) : (
                    <Autocomplete
                      options={glCategoryOptions}
                      fullWidth
                      size="small"
                      value={glCategoryValue}
                      onChange={(e, v) => onGlCategoryChange(e, v)}
                      getOptionLabel={getGlCategoryLabel}
                      isOptionEqualToValue={equalById}
                      renderInput={(params) => (
                        <MuiInputField
                          {...params}
                          name="glCategoryId"
                          error={hasErr("glCategoryId")}
                          helperText={help("glCategoryId", "GL Category")}
                        />
                      )}
                    />
                  )
                ) : field.field === "date" ? (
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
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
                    multiline={!!field.isMultiline}
                    rows={field.rows}
                    minRows={field.minRows}
                    maxRows={field.maxRows}
                    value={String((PartyGroupInput as any)[field.name] ?? "")}
                    InputProps={{
                      inputProps: {
                        maxLength: field.name === "glcode" ? 20 : 250,
                      },
                    }}
                    onChange={handleChange}
                    error={hasErr(field.name)}
                    helperText={help(field.name, field.label)}
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
            pr: { xs: "16px", md: "22px" },
          }}
        >
          <Box
            display={"flex"}
            gap={2}
            sx={{ flexWrap: { xs: "wrap", md: "nowrap" } }}
          >
            <FormGroup sx={{ pl: 2 }}>
              <MuiSwitch
                checked={isActiveLocal}
                onChange={onActiveChange}
                label="Status"
              />
            </FormGroup>

            {showIsGroup && (
              <FormGroup sx={{ pl: 2 }}>
                <MuiSwitch
                  checked={isGlGroupLocal}
                  onChange={onGlGroupChange}
                  label="Is Group"
                />
              </FormGroup>
            )}
          </Box>

          <Box
            display={"flex"}
            alignItems={"center"}
            gap={2}
            sx={{
              button: { minWidth: { xs: "50px", md: "70px" } },
              flexWrap: { xs: "wrap", md: "nowrap" },
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
              onClick={handleSubmit}
              disabled={!!submitDisabled}
            >
              Submit
            </MuiButton>
          </Box>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
};

export default CreatePartyGroup;
