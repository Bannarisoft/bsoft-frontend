import { Autocomplete, Box, Chip, Grid2 } from "@mui/material";
import TextComponent from "../../../atoms/Text";
import { FaCircleCheck } from "react-icons/fa6";
import { GoDotFill } from "react-icons/go";
import InputComponent from "../../../atoms/Input";
import { CreateInformationProps, RolemenuProps } from "../../../../types";
import { MuiInputField, MuiText } from "bsoft-base-elements";

const RoleInformation: React.FC<CreateInformationProps> = ({
  selectedModules,
  handleModuleClick,
  roleData,
  selectedRole,
  SelectedRoleChanges,
  moduleData,
  error,
}) => {
  return (
    <>
      <Box pt={1}>
        <Grid2 container spacing={2}>
          <Grid2
            size={4}
            display={"flex"}
            justifyContent={"space-between"}
            alignItems={"center"}
            flex={2}
          >
            <MuiText variant="caption" className="role-label">
              Select Role
            </MuiText>
            <MuiText variant="caption" className="role-label">
              :
            </MuiText>
          </Grid2>
          <Grid2 size={8}>
            <Autocomplete
              options={roleData || []}
              id="company-autocomplete"
              sx={{ width: "50%" }}
              size="small"
              value={selectedRole}
              defaultValue={selectedRole}
              onChange={(event, value) =>
                SelectedRoleChanges(
                  event as React.ChangeEvent<HTMLInputElement>,
                  value,
                  "roleId"
                )
              }
              getOptionLabel={(option: any) => option?.roleName || ""}
              renderOption={(props, option, index) => (
                <li {...props} key={option?.id || `option-${index}`}>
                  {option?.roleName}
                </li>
              )}
              renderInput={(params) => (
                <MuiInputField
                  {...params}
                  name="roleId"
                  value={selectedRole}
                  error={error.includes("roleId")}
                  helperText={
                    error.includes("roleId") && "Please select a roleId"
                  }
                />
              )}
            />
          </Grid2>
        </Grid2>
        <Grid2 container spacing={2} my={2}>
          <Grid2
            size={4}
            display={"flex"}
            justifyContent={"space-between"}
            alignItems={"center"}
            flex={2}
          >
            <MuiText variant="caption" className="role-label">
              Select Modules
            </MuiText>
            <MuiText variant="caption" className="role-label">
              :
            </MuiText>
          </Grid2>
          <Grid2 size={8}>
            <Box
              border={"1px solid #E8E8E8"}
              p={2}
              borderRadius={"4px"}
              sx={{
                pointerEvents: selectedRole ? "" : "none",
                opacity: selectedRole ? "" : "0.5",
              }}
            >
              {moduleData.map((module) => {
                const isSelected = selectedModules.includes(module.moduleName);
                return (
                  <Chip
                    key={module.id}
                    icon={
                      isSelected ? (
                        <FaCircleCheck />
                      ) : (
                        <GoDotFill fontSize={18} color="#4BC5AB" />
                      )
                    }
                    sx={{
                      borderRadius: "4px",
                      mr: 2,
                      mb: 1,
                      cursor: "pointer",
                      border: isSelected ? "none" : "1px solid #3a8484",
                      bgcolor: isSelected ? "success.main" : "#fff",
                      color: isSelected ? "#fff" : "#3a8484",
                    }}
                    label={module.moduleName}
                    color={isSelected ? "success" : "default"}
                    onClick={() =>
                      handleModuleClick(module.id, module.moduleName)
                    }
                  />
                );
              })}
            </Box>
          </Grid2>
        </Grid2>
      </Box>
    </>
  );
};

export default RoleInformation;
