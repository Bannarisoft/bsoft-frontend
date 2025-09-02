import {
  Autocomplete,
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  FormControl,
  FormGroup,
  Grid2,
  InputAdornment,
  Slide,
} from "@mui/material";
import { TransitionProps } from "@mui/material/transitions";
import React, { useState } from "react";
import { IoClose, IoEyeOffOutline } from "react-icons/io5";
import { CreateUserProps } from "../../../types/types";
import {
  MuiButton,
  MuiInputField,
  MuiSwitch,
  MuiText,
} from "bsoft-base-elements";
import { FaRegEye } from "react-icons/fa6";
import { useRecoilValue } from "recoil";
import { UserData } from "../../../utils/atoms";
import { isSubmitting } from "../../../utils/lib";

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function CreateUser({
  open,
  errors,
  close,
  userInput,
  handleChange,
  handleSwitch,
  selecteduserGroup,
  userGroupData,
  selectedUserRoleId,
  userRoleData,
  selectedUserDepartmentId,
  handleSubmit,
  unitByCompanyData,
  departmentData,
  editFlag,
  handledAutoComplete,
  selectedUnit,
  companyData,
  entityData,
  selectedCompany,
  selectedEntity,
}: CreateUserProps) {
  const [view, setView] = useState<boolean>(false);

  const userValue = useRecoilValue(UserData);
  const { groupCode } = userValue;
  const isAdmin =
    groupCode === "ADMIN" || groupCode === "SUPER_ADMIN" ? true : false;

  const handleView = (val: boolean) => {
    setView(val);
  };
  return (
    <>
      <Dialog
        open={open}
        TransitionComponent={Transition}
        keepMounted
        aria-describedby="alert-dialog-slide-description"
        sx={{
          "& .MuiPaper-root": {
            minWidth: "65vw",
            borderRadius: "8px",
          },
        }}
      >
        <Box className="popup-header-wrapper">
          <h2 className="dialog-header">Create New User</h2>
          <IoClose
            fontSize={24}
            onClick={close}
            cursor={"pointer"}
            color="#fff"
          />
        </Box>

        <DialogContent>
          <Grid2 container spacing={2}>
            <Grid2 size={12} position={"relative"}>
              <Grid2 container spacing={2}>
                <Grid2 size={4}>
                  <FormControl fullWidth>
                    <MuiText variant="h6" mt={1} className="admin-label-title">
                      First Name <span className="mandatory-sign">*</span>
                    </MuiText>
                    <MuiInputField
                      fullWidth
                      variant="outlined"
                      size="small"
                      type="text"
                      autoComplete="off"
                      name="firstName"
                      error={errors.includes("firstName")}
                      helperText={
                        errors.includes("firstName") &&
                        "please enter valid first name"
                      }
                      value={userInput.firstName}
                      onChange={handleChange}
                    />
                  </FormControl>
                </Grid2>
                <Grid2 size={4}>
                  <FormControl fullWidth>
                    <MuiText variant="h6" mt={1} className="admin-label-title">
                      Last Name <span className="mandatory-sign">*</span>
                    </MuiText>
                    <MuiInputField
                      fullWidth
                      variant="outlined"
                      size="small"
                      autoComplete="off"
                      type="text"
                      name="lastName"
                      error={errors.includes("lastName")}
                      helperText={
                        errors.includes("lastName") &&
                        "please enter valid last name"
                      }
                      value={userInput.lastName}
                      onChange={handleChange}
                    />
                  </FormControl>
                </Grid2>
                <Grid2 size={4}>
                  <FormControl fullWidth>
                    <MuiText variant="h6" mt={1} className="admin-label-title">
                      User Name <span className="mandatory-sign">*</span>
                    </MuiText>
                    <MuiInputField
                      fullWidth
                      variant="outlined"
                      size="small"
                      type="text"
                      autoComplete="off"
                      name="userName"
                      error={errors.includes("userName")}
                      helperText={
                        errors.includes("userName") &&
                        "please enter valid user name"
                      }
                      value={userInput.userName}
                      onChange={handleChange}
                    />

                    
                  </FormControl>
                </Grid2>
              </Grid2>
              <Grid2 container spacing={2} mt={2}>
                {!editFlag && (
                  <Grid2 size={4}>
                    <FormControl fullWidth>
                      <MuiText
                        variant="h6"
                        mt={1}
                        className="admin-label-title"
                      >
                        Password <span className="mandatory-sign">*</span>
                      </MuiText>
                      <MuiInputField
                        fullWidth
                        variant="outlined"
                        size="small"
                        type={view ? "text" : "password"}
                        name="password"
                        error={errors.includes("password")}
                        helperText={
                          errors.includes("password") &&
                          "please enter valid password"
                        }
                        value={userInput.password}
                        onChange={handleChange}
                        slotProps={{
                          input: {
                            endAdornment: (
                              <InputAdornment position="start">
                                {view ? (
                                  <IoEyeOffOutline
                                    onClick={() =>
                                      handleView && handleView(false)
                                    }
                                    cursor={"pointer"}
                                  />
                                ) : (
                                  <FaRegEye
                                    onClick={() =>
                                      handleView && handleView(true)
                                    }
                                    cursor={"pointer"}
                                  />
                                )}
                              </InputAdornment>
                            ),
                          },
                        }}
                      />
                    </FormControl>
                  </Grid2>
                )}

                <Grid2 size={editFlag ? 6 : 4}>
                  <FormControl fullWidth>
                    <MuiText variant="h6" mt={1} className="admin-label-title">
                      Phone <span className="mandatory-sign">*</span>
                    </MuiText>
                    <MuiInputField
                      fullWidth
                      variant="outlined"
                      size="small"
                      name="mobile"
                      type="tel"
                      onInput={(e) => {
                        const input = e.target as HTMLInputElement;
                        input.value = input.value
                          .replace(/\D/g, "")
                          .slice(0, 10);
                      }}
                      inputProps={{ maxLength: 10 }}
                      value={
                        userInput.mobile !== undefined
                          ? userInput.mobile.toString().slice(0, 10)
                          : ""
                      }
                      autoComplete="off"
                      onChange={handleChange}
                      error={errors.includes("mobile")}
                      helperText={
                        errors.includes("mobile") &&
                        "please enter valid mobile number"
                      }
                    />
                  </FormControl>
                </Grid2>
                <Grid2 size={editFlag ? 6 : 4}>
                  <FormControl fullWidth>
                    <MuiText variant="h6" mt={1} className="admin-label-title">
                      Email <span className="mandatory-sign">*</span>
                    </MuiText>
                    <MuiInputField
                      fullWidth
                      variant="outlined"
                      size="small"
                      name="emailId"
                      autoComplete="off"
                      value={
                        userInput.emailId !== undefined
                          ? userInput.emailId.toString().slice(0, 50)
                          : ""
                      }
                      onChange={handleChange}
                      error={errors.includes("emailId")}
                      helperText={
                        errors.includes("emailId") && "please enter valid email"
                      }
                    />
                  </FormControl>
                </Grid2>
              </Grid2>
              <Grid2 container spacing={2} mt={2} size={12}>
                <Grid2 size={4}>
                  <FormControl fullWidth>
                    <MuiText variant="h6" mt={1} className="admin-label-title">
                      Entity Name
                      {!isAdmin && <span className="mandatory-sign"> *</span>}
                    </MuiText>

                    <Autocomplete
                      id="user-role-autocomplete"
                      options={entityData || []}
                      size="small"
                      multiple={false}
                      getOptionLabel={(option: any) => option?.entityName ?? ""}
                      isOptionEqualToValue={(option, value) =>
                        option.id === value.id
                      }
                      value={selectedEntity ?? null}
                      onChange={(event, newValue: any) =>
                        handledAutoComplete(
                          event,
                          newValue ? newValue : null,
                          "entityId"
                        )
                      }
                      renderOption={(props, option) => (
                        <li {...props} key={option?.id ?? ""}>
                          {option?.entityName ?? ""}
                        </li>
                      )}
                      renderInput={(params) => (
                        <MuiInputField
                          {...params}
                          error={errors.includes("entity")}
                          helperText={
                            errors.includes("entity") && "Please select entity"
                          }
                        />
                      )}
                    />
                  </FormControl>
                </Grid2>
                <Grid2 size={4}>
                  <FormControl fullWidth>
                    <MuiText variant="h6" mt={1} className="admin-label-title">
                      Company Name
                      {!isAdmin && <span className="mandatory-sign">*</span>}
                    </MuiText>
                    <Autocomplete
                      multiple
                      id="user-role-autocomplete"
                      options={companyData || []}
                      size="small"
                      getOptionLabel={(option: {
                        id: string;
                        companyName: string;
                      }) => option.companyName || ""}
                      isOptionEqualToValue={(option, value) =>
                        option.id === value.id
                      }
                      value={
                        Array.isArray(selectedCompany) ? selectedCompany : []
                      }
                      onChange={(event, newValue) =>
                        handledAutoComplete(event, newValue, "companyId")
                      }
                      filterSelectedOptions
                      renderOption={(props, option) => (
                        <li {...props} key={option.id}>
                          {option.companyName}
                        </li>
                      )}
                      renderInput={(params) => (
                        <MuiInputField
                          {...params}
                          error={errors.includes("companyId")}
                          helperText={
                            errors.includes("companyId") &&
                            "Please select company"
                          }
                        />
                      )}
                    />
                  </FormControl>
                </Grid2>
                <Grid2 size={4}>
                  <FormControl fullWidth>
                    <MuiText variant="h6" mt={1} className="admin-label-title">
                      Unit Name
                      {!isAdmin && <span className="mandatory-sign"> *</span>}
                    </MuiText>
                    <Autocomplete
                      multiple
                      id="unit-autocomplete"
                      options={unitByCompanyData || []}
                      size="small"
                      value={Array.isArray(selectedUnit) ? selectedUnit : []}
                      onChange={(event, newValue) =>
                        handledAutoComplete(event, newValue, "unit")
                      }
                      getOptionLabel={(option) => option.unitName}
                      isOptionEqualToValue={(option, value) =>
                        option.id === value.id
                      }
                      filterSelectedOptions
                      renderOption={(props, option) => (
                        <li {...props} key={option.id}>
                          {option.unitName}
                        </li>
                      )}
                      renderInput={(params) => (
                        <MuiInputField
                          {...params}
                          size="small"
                          error={errors.includes("selectedUnit")}
                          helperText={
                            errors.includes("selectedUnit") &&
                            "Please select at least one unit"
                          }
                        />
                      )}
                    />
                  </FormControl>
                </Grid2>
                <Grid2 size={4}>
                  <FormControl fullWidth>
                    <MuiText variant="h6" mt={1} className="admin-label-title">
                      Department Name
                      {!isAdmin && <span className="mandatory-sign"> *</span>}
                    </MuiText>
                    <Autocomplete
                      multiple
                      id="user-role-autocomplete"
                      options={departmentData || []}
                      size="small"
                      getOptionLabel={(option: {
                        id: string;
                        deptName: string;
                      }) => option.deptName}
                      isOptionEqualToValue={(option, value) =>
                        option.id === value.id
                      }
                      value={selectedUserDepartmentId}
                      onChange={(event, newValue) =>
                        handledAutoComplete(event, newValue, "userDepartmentId")
                      }
                      filterSelectedOptions
                      renderOption={(props, option) => (
                        <li {...props} key={option.id}>
                          {option.deptName}
                        </li>
                      )}
                      renderInput={(params) => (
                        <MuiInputField
                          {...params}
                          error={errors.includes("userDepartmentId")}
                          helperText={
                            errors.includes("userDepartmentId") &&
                            "Please select a user role"
                          }
                        />
                      )}
                    />
                  </FormControl>
                </Grid2>
                <Grid2 size={4}>
                  <FormControl fullWidth>
                    <MuiText variant="h6" mt={1} className="admin-label-title">
                      User Group Name <span className="mandatory-sign">*</span>
                    </MuiText>
                    <Autocomplete
                      options={userGroupData || []}
                      id="user-role-autocomplete"
                      fullWidth
                      size="small"
                      value={selecteduserGroup}
                      getOptionLabel={(option: any) => option?.groupName}
                      onChange={(event, value) =>
                        handledAutoComplete(
                          event as React.ChangeEvent<HTMLInputElement>,
                          value,
                          "userGroupId"
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
                        <MuiInputField
                          {...params}
                          name="userGroupId"
                          error={errors.includes("userGroupId")}
                          helperText={
                            errors.includes("userGroupId") &&
                            "Please select a user groupName"
                          }
                        />
                      )}
                    />
                  </FormControl>
                </Grid2>

                <Grid2 size={4}>
                  <FormControl fullWidth>
                    <MuiText variant="h6" mt={1} className="admin-label-title">
                      User Role Name <span className="mandatory-sign">*</span>
                    </MuiText>
                    <Autocomplete
                      multiple
                      id="user-role-autocomplete"
                      options={userRoleData || []}
                      size="small"
                      getOptionLabel={(option: {
                        id: string;
                        roleName: string;
                      }) => option.roleName}
                      isOptionEqualToValue={(option, value) =>
                        option.id === value.id
                      }
                      value={selectedUserRoleId}
                      onChange={(event, newValue) =>
                        handledAutoComplete(event, newValue, "userRoleId")
                      }
                      filterSelectedOptions
                      renderOption={(props, option) => (
                        <li {...props} key={option.id}>
                          {option.roleName}
                        </li>
                      )}
                      renderInput={(params) => (
                        <MuiInputField
                          {...params}
                          error={errors.includes("userRoleId")}
                          helperText={
                            errors.includes("userRoleId") &&
                            "Please select a user role"
                          }
                        />
                      )}
                    />
                  </FormControl>
                </Grid2>
              </Grid2>
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
              checked={userInput.isActive === 1}
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
            <MuiButton className="filled-icon-btn" disabled={isSubmitting()} onClick={handleSubmit}>
              Submit
            </MuiButton>
          </Box>
        </DialogActions>
      </Dialog>
    </>
  );
}
