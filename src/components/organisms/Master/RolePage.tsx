import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import IconBreadcrumbs from "../../molecules/AdminLayout/BreadCrumbs";
import GlobalSearch from "../../molecules/AdminLayout/GlobalSearch";
import { GoPlus } from "react-icons/go";
import { FaCirclePlus } from "react-icons/fa6";
import { FaMinusCircle } from "react-icons/fa";
import RoleInformation from "../../molecules/Master/Role/RoleInformation";
import RoleMenu from "../../molecules/Master/Role/RoleMenu";
import RolePrevillages from "../../molecules/Master/Role/RolePrevillages";
import {
  PrevillagesProps,
  RolemenuProps,
  RoleProps,
} from "../../../types/types";
import {
  Apirequest,
  isSubmitting,
  startLoading,
  stopLoading,
} from "../../../utils/lib";
import Config from "../../../utils/config.api.json";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";
import { MuiButton, MuiText } from "bsoft-base-elements";
import toast from "react-hot-toast";

function RolePage() {
  const [expanded, setExpanded] = React.useState<string | false>("panel1");
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [selectedModuleId, setSelectedModuleId] = useState<number[]>([]);
  const [menuInput, setMenuinput] = useState<RolemenuProps[]>([]);
  const [roleData, setRoleData] = useState<any[]>([]);
  const [moduleData, setModuleData] = useState<any[]>([]);
  const [selectedRole, setSelectedRole] = useState<any>(null);
  const [chipData, setChipData] = useState<any[]>([]);
  const [roleTableData, setRoleTableData] = useState<any[]>([]);
  const [chipState, setChipState] = useState<Record<number, boolean>>({});
  const [selectedParentMenu, setSelectedParentMenu] = useState<any[]>([]);
  const [selectedChips, setSelectedChips] = useState<PrevillagesProps[]>([]);
  const [roleInput, setroleInput] = useState<RoleProps>({
    roleName: "",
    description: "",
    companyId: 0,
    id: 0,
    isActive: 0,
  });
  const [roleDataByid, setRoleDataById] = useState<{
    roleParents?: any[];
    roleChildren?: any[];
    roleModules?: any[];
    roleMenuPrivileges?: any[];
    roleId?: number;
  } | null>(null);
  const [switchState, setSwitchState] = React.useState<{
    [key: number]: { [key: string]: boolean };
  }>({});
  const [error, setError] = useState<string[]>([]);
  const router = useRouter();
  const handleChange =
    (panel: string) => (event: React.SyntheticEvent, newExpanded: boolean) => {
      setExpanded(newExpanded ? panel : false);
    };

  const fetchMenuByModuleIds = async (moduleIds: number[], roleData?: any) => {
    try {
      if (!moduleIds.length) {
        setMenuinput([]);
        return;
      }
      const { endpoint, method } = Config.Menu.modulemenu;
      const result = await Apirequest(endpoint, method, moduleIds);
      if (Array.isArray(result?.data?.data)) {
        setMenuinput(result.data.data);
        if (
          roleData &&
          roleData.roleParents &&
          roleData.roleParents.length > 0
        ) {
          const temp = result.data.data.filter((item: any) =>
            roleData.roleParents.some((list: any) => item.id === list.parentId)
          );
          setSelectedParentMenu(temp);
        }
      } else {
        setMenuinput([]);
      }
    } catch (error) {
      console.error("Error fetching menu data:", error);
      setMenuinput([]);
    }
  };

  const handleModuleClick = async (moduleId: number, moduleName: string) => {
    setError([]);
    const isAlreadySelected = selectedModules.includes(moduleName);
    const updatedModules = isAlreadySelected
      ? selectedModules.filter((name) => name !== moduleName)
      : [...selectedModules, moduleName];

    const updatedModuleId = isAlreadySelected
      ? selectedModuleId.filter((id) => id !== moduleId)
      : [...selectedModuleId, moduleId];

    setSelectedModules(updatedModules);
    setSelectedModuleId(updatedModuleId);

    if (updatedModuleId.length === 0) {
      setMenuinput([]);
      setSelectedParentMenu([]);
      setChipData([]);
      setSelectedChips([]);
      setRoleTableData([]);
    } else {
      await fetchMenuByModuleIds(updatedModuleId);
    }
  };

  const GetRole = async () => {
    try {
      const { endpoint, method } = Config.Role.getRole;
      const result = await Apirequest(endpoint, method);
      if (result?.data?.data) {
        setRoleData(result.data.data);
        setError([]);
      } else {
        setRoleData([]);
      }
    } catch (err) {
      console.log(err);
      setRoleData([]);
    }
  };

  const SelectedRoleChanges = (
    e: React.ChangeEvent<HTMLInputElement>,
    value: any,
    field: string
  ) => {
    setError([]);
    if (field === "roleId") {
      if (!value?.id) {
        setSelectedRole(null);
        setroleInput((prev) => ({ ...prev, id: 0 }));
        setSelectedModules([]);
        setSelectedModuleId([]);
        setMenuinput([]);
        setSelectedParentMenu([]);
        setChipData([]);
        setSelectedChips([]);
        setRoleTableData([]);
        setSwitchState({});
        setChipState({});
        setRoleDataById(null);
      } else {
        setSelectedRole(value);
        setroleInput((prev) => ({ ...prev, id: value.id }));
        GetRoleById(value.id);
      }
    }
  };

  const GetModules = async () => {
    try {
      const { endpoint, method } = Config.Module.getModule;
      const result = await Apirequest(endpoint, method);
      if (result?.data?.data) {
        setModuleData(result.data.data);
      } else {
        setModuleData([]);
      }
    } catch (err) {
      console.log(err);
      setModuleData([]);
    }
  };

  const handleChangeParentMenu = async (e?: any, value?: any) => {
    if (!value) return;
    setSelectedParentMenu(Array.isArray(value) ? value : []);
    try {
      const parentIds = Array.isArray(value)
        ? value.map((item: any) => item.id).filter(Boolean)
        : [];

      if (parentIds.length === 0) {
        setChipData([]);
        setSelectedChips([]);
        setRoleTableData([]);
        return;
      }
      const { endpoint, method } = Config.Menu.parentMenu;
      const result = await Apirequest(endpoint, method, parentIds);

      if (result?.data?.data) {
        setChipData(result.data.data);
        if (
          roleDataByid &&
          roleDataByid.roleChildren &&
          roleDataByid.roleChildren.length > 0
        ) {
          const selectedChildIds = roleDataByid.roleChildren.map(
            (child: any) => child.childId
          );
          const selectedChipItems = result.data.data.filter((chip: any) =>
            selectedChildIds.includes(chip.id)
          );

          setSelectedChips(selectedChipItems);
          const filterMenu = selectedChipItems.filter(
            (menu: any) => menu.menuUrl !== ""
          );
          setRoleTableData(filterMenu);
        }
      } else {
        setChipData([]);
      }
    } catch (error) {
      console.error("Error updating parent menus:", error);
      setChipData([]);
    }
    setError([]);
  };

  useEffect(() => {
    if (selectedParentMenu.length > 0) {
      handleChangeParentMenu(null, selectedParentMenu);
    }
  }, [selectedParentMenu]);

  const handleChipClick = (chipId: number) => {
    const chipToToggle = chipData.find((chip) => chip.id === chipId);
    if (!chipToToggle) return;

    let updatedChips = [...selectedChips];
    const isAlreadySelected = updatedChips.some((chip) => chip.id === chipId);

    if (isAlreadySelected) {
      const removeChildChips = (parentId: number) => {
        const childChips = chipData.filter(
          (chip) => chip.parentId === parentId
        );

        childChips.forEach((childChip) => removeChildChips(childChip.id));

        updatedChips = updatedChips.filter(
          (chip) => !childChips.some((childChip) => childChip.id === chip.id)
        );
      };

      removeChildChips(chipId);

      updatedChips = updatedChips.filter((chip) => chip.id !== chipId);
    } else {
      updatedChips.push(chipToToggle);

      let parentId: number | null | undefined = chipToToggle.parentId;
      while (parentId !== null && parentId !== undefined) {
        const parentChip = chipData.find((chip) => chip.id === parentId);
        if (!parentChip) break;

        if (!updatedChips.some((chip) => chip.id === parentChip.id)) {
          updatedChips.push(parentChip);
        }

        parentId = parentChip.parentId;
      }
    }

    // const isTypeTab = updatedChips.filter((i: any) => i.type === "tab");

    const filterMenu = updatedChips.filter(
      (menu: any) => menu.menuUrl?.trim() !== "" || menu.type === "tab"
    );

    setRoleTableData([...filterMenu]);
    setSelectedChips([...updatedChips]);

    if (updatedChips.length > 0 && error.includes("roleChildren")) {
      setError((prev) => prev.filter((e) => e !== "roleChildren"));
    }
  };

  const handleSwitch = (
    e: React.ChangeEvent<HTMLInputElement>,
    id: number,
    action: string
  ) => {
    setSwitchState((prevState) => {
      const updatedState = {
        ...prevState,
        [id]: {
          ...prevState[id],
          [action]: e.target.checked,
        },
      };
      if (
        Object.keys(updatedState).length > 0 &&
        error.includes("roleMenuPrivileges")
      ) {
        setError((prev) => prev.filter((e) => e !== "roleMenuPrivileges"));
      }

      return updatedState;
    });
  };

  const AddMenuPrivileges = async () => {
    try {
      startLoading();
      const { endpoint, method } = Config.RoleEntitlements.roleEntitlements;
      const result = await Apirequest(endpoint, method, RolePayload);

      if (result?.data?.statusCode === 201) {
        Swal.fire({
          title: "Role entitlements saved successfully",
          icon: "success",
          confirmButtonText: "okay",
          customClass: {
            title: "custom-title",
          },
        }).then((res) => {
          if (res.isConfirmed) {
            window.location.reload();
          }
        });
        return result.data;
      } else {
        throw new Error(
          result?.data?.message || "Failed to save role entitlements"
        );
      }
    } catch (err) {
      console.error("Error in API request:", err);
      throw err;
    } finally {
      stopLoading();
    }
  };

  const RolePayload = {
    roleId: roleInput.id || 0,
    roleModules: selectedModuleId.map((moduleId) => ({
      moduleId,
    })),
    roleParents: selectedParentMenu.map((parent) => ({
      parentId: parent?.id || 0,
    })),
    roleChildren: selectedChips.map((chip) => ({
      childId: chip?.id || 0,
    })),
    roleMenuPrivileges: Object.entries(switchState || {}).map(
      ([menuId, permissions]) => ({
        menuId: Number(menuId) || 0,
        canView: !!permissions?.canView,
        canAdd: !!permissions?.canAdd,
        canUpdate: !!permissions?.canUpdate,
        canDelete: !!permissions?.canDelete,
        canExport: !!permissions?.canExport,
        canApprove: !!permissions?.canApprove,
      })
    ),
  };

  const GetRoleById = async (roleId: number) => {
    try {
      if (!roleId) return;

      const { endpoint, method } = Config.RoleEntitlements.GetroleEntitlements;
      const result = await Apirequest(
        endpoint.replace("{id}", roleId.toString()),
        method
      );

      if (result?.data?.data) {
        const roleEntitlements = result.data.data;
        setRoleDataById(roleEntitlements);
        setroleInput((prev) => ({ ...prev, id: roleEntitlements.roleId || 0 }));
        const moduleIds =
          roleEntitlements.roleModules?.map((mod: any) => mod.moduleId) || [];
        if (moduleData.length > 0) {
          const moduleNames = moduleData
            .filter((mod: any) => moduleIds.includes(mod.id))
            .map((mod: any) => mod.moduleName);

          setSelectedModuleId(moduleIds);
          setSelectedModules(moduleNames);
          await fetchMenuByModuleIds(moduleIds, roleEntitlements);
        }
        const privileges = roleEntitlements.roleMenuPrivileges?.reduce(
          (acc: any, privilege: any) => {
            acc[privilege.menuId] = {
              canView: privilege.canView || false,
              canAdd: privilege.canAdd || false,
              canUpdate: privilege.canUpdate || false,
              canDelete: privilege.canDelete || false,
              canExport: privilege.canExport || false,
              canApprove: privilege.canApprove || false,
            };
            return acc;
          },
          {}
        );

        setChipState(privileges || {});
        setSwitchState(privileges || {});
      }
    } catch (err) {
      console.error("Error fetching role:", err);
    }
  };

  const handleSubmit = async () => {
    let validationErrors: string[] = [];
    if (isSubmitting()) return;
    startLoading();

    if (!roleInput.id) {
      validationErrors.push("roleId");
    }
    if (selectedModuleId.length === 0) {
      validationErrors.push("roleModules");
    }
    if (selectedParentMenu.length === 0) {
      validationErrors.push("roleParents");
    }
    if (selectedChips.length === 0) {
      validationErrors.push("roleChildren");
    }
    if (Object.keys(switchState).length === 0) {
      validationErrors.push("roleMenuPrivileges");
    }

    setError(validationErrors);

    if (validationErrors.length > 0) {
      toast.error("Please fill all required fields");
      stopLoading();
      return;
    }

    try {
      await AddMenuPrivileges();
    } catch (err) {
      console.error("Error submitting data:", err);
      toast.error("Failed to submit data");
    } finally {
      stopLoading();
    }
  };

  const handleCancel = () => {
    Swal.fire({
      title: "Are you sure want to discard the changes ?",
      icon: "question",
      confirmButtonText: "okay",
      showCancelButton: true,
      customClass: {
        title: "custom-title",
      },
    }).then(async (res) => {
      if (res.isConfirmed) {
        router.push("/master/role/role-list");
      }
    });
  };

  useEffect(() => {
    GetRole();
    GetModules();
  }, []);

  return (
    <>
      <Box
        display={"flex"}
        justifyContent={"space-between"}
        alignItems={"center"}
      >
        <Box>
          <IconBreadcrumbs
            parent={"Master"}
            child={"Role Management"}
            path=""
          />
        </Box>
      </Box>
      <Box bgcolor={"#fff"} p={2} my={2} pt={0}>
        <DialogTitle className="highlighted-header">
          {"Role Entitlement"}
        </DialogTitle>
        <DialogContent sx={{ p: 0, my: 2, borderRadius: "6px" }}>
          <Accordion
            expanded={expanded === "panel1"}
            onChange={handleChange("panel1")}
            sx={{
              border: "1px solid rgba(0, 0, 0, 0.09)",
              borderLeft:
                expanded === "panel1" ? "4px solid" : "4px solid #79C7C7",
            }}
            elevation={0}
          >
            <AccordionSummary
              aria-controls="panel1d-content"
              id="panel1d-header"
              sx={{
                borderBottom: "1px solid rgba(0, 0, 0, 0.09)",
                "& .MuiAccordionSummary-content": {
                  alignItems: "center",
                  m: 0,
                },
              }}
            >
              {expanded === "panel1" ? (
                <FaMinusCircle color="#0C4150" fontSize={24} />
              ) : (
                <FaCirclePlus color="#79C7C7" fontSize={24} />
              )}
              <MuiText variant="h6" pl={2} className="admin-page-title">
                Role Information
              </MuiText>
            </AccordionSummary>
            <AccordionDetails>
              <RoleInformation
                selectedModules={selectedModules}
                selectedModuleId={selectedModuleId}
                handleModuleClick={handleModuleClick}
                roleData={roleData}
                selectedRole={selectedRole}
                SelectedRoleChanges={SelectedRoleChanges}
                moduleData={moduleData}
                error={error}
              />
            </AccordionDetails>
          </Accordion>

          <Accordion
            expanded={expanded === "panel2"}
            onChange={handleChange("panel2")}
            sx={{
              border: "1px solid rgba(0, 0, 0, 0.09)",
              borderLeft:
                expanded === "panel2" ? "4px solid" : "4px solid #79C7C7",
              my: 2,
              pointerEvents: selectedRole ? "" : "none",
              opacity: selectedRole ? "" : "0.5",
            }}
            elevation={0}
          >
            <AccordionSummary
              aria-controls="panel1d-content"
              id="panel1d-header"
              sx={{
                borderBottom: "1px solid rgba(0, 0, 0, 0.09)",
                "& .MuiAccordionSummary-content": {
                  alignItems: "center",
                  m: 0,
                },
              }}
            >
              {expanded === "panel2" ? (
                <FaMinusCircle color="#0C4150" fontSize={24} />
              ) : (
                <FaCirclePlus color="#79C7C7" fontSize={24} />
              )}
              <MuiText variant="h6" pl={2} className="admin-page-title">
                Role Menu
              </MuiText>
            </AccordionSummary>
            <AccordionDetails>
              <RoleMenu
                menuinput={menuInput}
                chipData={chipData}
                chipState={chipState}
                handleChipClick={handleChipClick}
                handleChangeParentMenu={handleChangeParentMenu}
                selectedParentMenu={selectedParentMenu}
                error={error}
                selectedChips={selectedChips}
              />
            </AccordionDetails>
          </Accordion>

          <Accordion
            expanded={expanded === "panel3"}
            onChange={handleChange("panel3")}
            sx={{
              border: "1px solid rgba(0, 0, 0, 0.09)",
              borderLeft:
                expanded === "panel3" ? "4px solid" : "4px solid #79C7C7",
              my: 2,
              pointerEvents: selectedRole ? "" : "none",
              opacity: selectedRole ? "" : "0.5",
            }}
            elevation={0}
          >
            <AccordionSummary
              aria-controls="panel1d-content"
              id="panel1d-header"
              sx={{
                borderBottom: "1px solid rgba(0, 0, 0, 0.09)",
                "& .MuiAccordionSummary-content": {
                  alignItems: "center",
                  m: 0,
                },
              }}
            >
              {expanded === "panel3" ? (
                <FaMinusCircle color="#0C4150" fontSize={24} />
              ) : (
                <FaCirclePlus color="#79C7C7" fontSize={24} />
              )}
              <MuiText variant="h6" pl={2} className="admin-page-title">
                Role Previllages
              </MuiText>
            </AccordionSummary>
            <AccordionDetails>
              <RolePrevillages
                selectedChips={roleTableData}
                switchState={switchState}
                handleSwitch={handleSwitch}
              />
            </AccordionDetails>
          </Accordion>
        </DialogContent>
        <DialogActions>
          <MuiButton variant="outlined" onClick={handleCancel}>
            Cancel
          </MuiButton>
          <MuiButton variant="contained" onClick={handleSubmit}>
            Save
          </MuiButton>
        </DialogActions>
      </Box>
    </>
  );
}

export default RolePage;
