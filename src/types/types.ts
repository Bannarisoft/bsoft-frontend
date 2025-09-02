import { SelectChangeEvent, SnackbarCloseReason } from "@mui/material";
import { Dayjs } from "dayjs";
import React, { SyntheticEvent } from "react";

export interface UserInput {
  c_name: string;
  c_password: string;
}

export interface User {
  username: string;
  password: string;
  forceLogout?: boolean;
}

export interface ApiResponse<T> {
  data: T;
}

export interface MenuPrivilege {
  id: number;
  canAdd: number;
  canView: number;
  canUpdate: number;
  canDelete: number;
  canExport: number;
  canApprove: number;
}

export interface MenuItem {
  id: number;
  menuName: string;
  menuUrl: string;
  menuPrivileages: MenuPrivilege[];
  childMenus: MenuItem[];
  icon?: React.ReactNode;
}

export interface Module {
  id: number;
  moduleName: string;
  menus: MenuItem[];
}

export interface AdminSidebarProps {
  modules: any[];
}

export interface MenuWithSubItems extends MenuItem {
  Items: MenuItem[];
  icon: React.ReactNode;
}

export interface SideMenuType {
  icon: React.ReactNode;
  title: string;
  active: boolean;
  items: MenuItem[];
}

export interface SideMenuButtonProps {
  icon?: React.ReactNode;
  title?: string;
  items?: Array<{
    id: number;
    title?: string;
    path?: string;
    active?: boolean;
    icon?: React.ReactNode;
    Items?: Array<{}>;
  }>;
  isOpen?: boolean;
  onToggle?: () => void;
  closeToggle?: () => void;
  isActive?: boolean;
  path?: string;
  pathname?: string;
}

export interface GlobalSearchProps {
  width?: number;
  placeholder: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
}

export interface ButtonTypes {
  title: string;
  redirectLink: string;
}

export interface BreadCrumbProps {
  parent: string;
  child: string;
  path: string;
  subParent?: string;
}

export interface CreateCountryPropTypes {
  open: boolean;
  close: () => void;
  countryInput: CompanyProps;
  editFlag: boolean;
  handleSubmit: (e: React.MouseEvent<HTMLButtonElement>) => void;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error: Array<{}>;
  handleSwitch: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export interface CompanyProps {
  countryCode: string;
  countryName: string;
  id: number;
  isActive: number;
}

export interface SnackbarPropTypes {
  open: boolean;
  close: (
    event: React.SyntheticEvent | Event,
    reason?: SnackbarCloseReason
  ) => void;
  message: string;
}

export interface CreateStatePropsTypes {
  open: boolean;
  close: () => void;
  stateInput: StateProps;
  country: any;
  selectedCountry: any;
  editFlag: boolean;
  handleSubmit: (e: React.MouseEvent<HTMLButtonElement>) => void;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleContryChange: (
    e: React.ChangeEvent<HTMLInputElement>,
    value: any,
    field: string
  ) => void;
  error: Array<{}>;
  handleSwitch: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export interface StateProps {
  stateCode: string;
  stateName: string;
  countryId: number;
  id: number;
  isActive: number;
}

export interface CreateCityPropsTypes {
  open: boolean;
  close: () => void;
  cityInput: CityProps;
  state: any;
  editFlag: boolean;
  handleSubmit: (e: React.MouseEvent<HTMLButtonElement>) => void;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleStateChange: (
    e: React.ChangeEvent<HTMLInputElement>,
    value: any,
    field: string
  ) => void;
  selectedState: any;
  error: Array<{}>;
  handleSwitch: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export interface CityProps {
  cityCode: string;
  cityName: string;
  stateId: number;
  id: number;
  isActive: number;
}

export interface EntiryPropTypes {
  entityName: string;
  entityDescription: string;
  address: string;
  phone: string;
  email: string;
  isActive: number;
  id?: 0;
}

export interface CreateEntiryPropTypes {
  open: boolean;
  close: () => void;
  entityInput: EntiryPropTypes;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.MouseEvent<HTMLButtonElement>) => void;
  error: Array<{}>;
  editFlag: boolean;
  handleSwitch: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export interface SnackbarState {
  open: boolean;
  message: string;
}

export interface UnitInputTypes {
  unitName: string;
  oldUnitId: string;
  shortName: string;
  unitHeadName: string;
  pincode: number;
  contact: string;
  alternateContact: string;
  address1: string;
  address2: string;
  contactName: string;
  designation: string;
  email: string;
  phone: string;
  remarks: string;
  companyId: number;
  id: number;
  isActive: number;
}

export interface CreateUnitProps {
  open: boolean;
  handleClose: () => void;
  divisionData: Array<{}>;
  unitInput: UnitInputTypes;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.MouseEvent<HTMLButtonElement>) => void;
  handleSwitch: (e: React.ChangeEvent<HTMLInputElement>) => void;
  errors: Array<{}>;
  handleAutocomplete: (
    e: React.ChangeEvent<HTMLInputElement>,
    value: any,

    field: string
  ) => void;
  countryData: Array<{}>;
  stateData: Array<{}>;
  cityData: Array<{}>;
  selectedCountry: any;
  selectedDivision: any;
  selectedState: any;
  selectedCity: any;
}

export interface CreateDepartmentPropTypes {
  open: boolean;
  close: () => void;
  departmentInput: DepartmentProps;
  handleSubmit: (e: React.MouseEvent<HTMLButtonElement>) => void;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error: Array<{}>;
  editFlag: boolean;
  handleSwitch: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleDepartmentGroupChange: (
    e: React.ChangeEvent<HTMLInputElement>,
    value: any,
    field: string
  ) => void;
  selectedDepartmentGroup: null;
  departmentGroupData: any;
}

export interface DepartmentProps {
  shortName: string;
  deptName: string;
  companyId: number;
  departmentGroupId: number;
  id: number;
  isActive: number;
}
export interface CreateDepartmentGroupType {
  open: boolean;
  close: () => void;
  departmentGroupInput: DepartmentGroupProps;
  handleSubmit: (e: React.MouseEvent<HTMLButtonElement>) => void;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error: Array<{}>;
  editFlag: boolean;
  handleSwitch: (e: React.ChangeEvent<HTMLInputElement>) => void;
}
export interface DepartmentGroupProps {
  departmentGroupCode: string;
  departmentGroupName: string;
  id: number;
  isActive: number;
}

export interface CreateDivisionPropTypes {
  open: boolean;
  divisionInput: DivisionProps;
  close: () => void;
  handleSubmit: (e: React.MouseEvent<HTMLButtonElement>) => void;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error: Array<{}>;
  handleSwitch: (e: React.ChangeEvent<HTMLInputElement>) => void;
  editFlag: boolean;
}

export interface DivisionProps {
  shortName: string;
  name: string;
  companyId: number;
  id: number;
  isActive: number;
}

export interface SelectComponentProps {
  options: Array<{}>;
  width?: number;
  selectedValue: string;
  handleChange: (event: SelectChangeEvent<string>) => void;
  name: string;
  data: string;
}

export interface CreateLanguagePropTypes {
  open: boolean;
  languageInput: LanguageProps;
  close: () => void;
  handleSubmit: (e: React.MouseEvent<HTMLButtonElement>) => void;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error: Array<{}>;
  handleSwitch: (e: React.ChangeEvent<HTMLInputElement>) => void;
  editFlag: boolean;
}

export interface LanguageProps {
  code: string;
  name: string;
  id: number;
  isActive: number;
}

export interface CreateCurrencyPropTypes {
  open: boolean;
  currencyInput: CurrencyProps;
  close: () => void;
  handleSubmit: (e: React.MouseEvent<HTMLButtonElement>) => void;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error: Array<{}>;
  handleSwitch: (e: React.ChangeEvent<HTMLInputElement>) => void;
  editFlag: boolean;
}

export interface CurrencyProps {
  code: string;
  name: string;
  id: number;
  isActive: number;
}

export interface CreateFinancialPropTypes {
  open: boolean;
  financialInput: FinancialProps;
  close: () => void;
  handleSubmit: (e: React.MouseEvent<HTMLButtonElement>) => void;
  handleChange: (name: string, newValue: Dayjs | null) => void;
  handleSwitch: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error: Array<{}>;
  editFlag: boolean;
}

export interface FinancialProps {
  startYear: string;
  startDate: string;
  endDate: string;
  finYearName: string;
  id: number;
  isActive: number;
}

export interface CreateRoleProps {
  open: boolean;
  close: () => void;
  roleInput: RoleProps;
  handleSubmit: (e: React.MouseEvent<HTMLButtonElement>) => void;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error: Array<{}>;
  handleSwitch: (e: React.ChangeEvent<HTMLInputElement>) => void;
  editFlag: boolean;
}

export interface RoleProps {
  roleName: string;
  description: string;
  companyId: number;
  id: number;
  isActive: number;
}

export interface CreateInformationProps {
  selectedModules: string[];
  selectedModuleId: number[];
  handleModuleClick: (moduleId: number, moduleName: string) => void;
  roleData: any[];
  selectedRole: string;
  SelectedRoleChanges: (
    e: React.ChangeEvent<HTMLInputElement>,
    value: any,
    field: string
  ) => void;
  moduleData: any[];
  error: Array<{}>;
}

export interface CreateRolemenuProps {
  menuinput: RolemenuProps[];
  chipData: any[];
  chipState: Record<number, boolean>;
  handleChipClick: (chipId: number) => void;
  selectedParentMenu: any[];
  handleChangeParentMenu: (event: any, newValue: any) => void;
  // toggleSelectDeselectAll: () => void;
  error: Array<{}>;
  selectedChips: Array<{}>;
}

export interface RolemenuProps {
  id: number;
  menuName: string;
}

export interface RolePrevillagesProps {
  selectedChips: PrevillagesProps[];
  switchState: { [key: number]: { [key: string]: boolean } };
  handleSwitch: (
    e: React.ChangeEvent<HTMLInputElement>,
    id: number,
    action: string
  ) => void;
}

export interface PrevillagesProps {
  id: number;
  menuName: string;
}

export interface CreateUserProps {
  open: boolean;
  close: () => void;
  errors: Array<{}>;
  userInput: UserInputTypes;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handledAutoComplete: (
    e: React.SyntheticEvent,
    value: any[],
    field: string
  ) => void;
  handleSwitch: (e: React.ChangeEvent<HTMLInputElement>) => void;
  userRoleData: any[];
  selectedUserDepartmentId: any[];
  unitByCompanyData: any[];
  departmentData: any[];
  userGroupData: any[];
  selectedUserRoleId: any[];
  selecteduserGroup: any[];
  handleSubmit: (e: React.MouseEvent<HTMLButtonElement>) => void;
  editFlag: boolean;
  loading: boolean;
  selectedUnit: {} | null;
  companyData?: any[];
  entityData?: any[];
  selectedCompany?: any[];
  selectedEntity?: any;
}

export interface UserInputTypes {
  firstName: string;
  lastName: string;
  userName: string;
  password: string;
  mobile: string;
  emailId: string;
  userGroupId: number;
  divisionId: number;
  companyId: number;
  userRoleId: any[];
  departmentId?: any[];
  company: any[];
  entity: string | null | any;
  unitId: number;
  id: number;
  isActive: number;
  userId: number;
}
export interface CreateMenuPropsTypes {
  open: boolean;
  close: () => void;
  menuInput: MenuPropsType;
  editFlag: boolean;
  moduleData: any;
  parentMenu: any;
  selectedValue: any;
  handleAutocomplete: (
    e: React.ChangeEvent<HTMLInputElement>,
    value: any,
    field: string
  ) => void;
  handleSubmit: (e: React.MouseEvent<HTMLButtonElement>) => void;
  errors: Array<{}>;
  handleSwitch: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}
export interface MenuPropsType {
  id: number;
  menuName: string;
  menuUrl: string;
  menuIcon: string;
  moduleId: number;
  parentId: number;
  sortOrder: number;
  isActive: number;
  menuType: string | null;
}

// ----------------------------------------

export interface AssetGroup {
  id: number;
  groupName: string;
}

export interface AssetCategory {
  id: number;
  categoryName: string;
}

export interface AssetSubCategory {
  id: number;
  subCategoryName: string;
}

export interface UOM {
  id: number;
  uomName: string;
}

export interface WorkingStatus {
  id: number;
  code: string;
}

export interface AssetType {
  id: number;
  code: string;
}

export interface ParentAsset {
  id: number;
  assetName: string;
}

export interface AssetSubGroup {
  id?: number | string;
  [key: string]: any;
}

export interface AssetState {
  selectedAssetGroup: AssetGroup | null;
  assetGroupData: AssetGroup[];
  assetSubGroupData: any[];
  selectedAssetSubGroup: AssetSubGroup;
  assetCategoryData: AssetCategory[];
  selectedAssetCategory: AssetCategory | null;
  assetSubCategoryData: AssetSubCategory[];
  selectedAssetSubCategory: AssetSubCategory | null;
  assetName: string;
  uomData: UOM[];
  selectedUom: UOM | null;
  workingStatusData: WorkingStatus[];
  selectedWorkingStatus: WorkingStatus | null;
  assetTypeData: AssetType[];
  selectedAssetType: AssetType | null;
  parentAssetData: ParentAsset[];
  selectedParentAsset: ParentAsset | null;
  quantity: string;
  description: string;
  nonDepreciated: number;
  assetImage: string | null;
  assetImageFile: File | null;
  assetImageBase64: string | null;
}

export type AssetActionType = {
  type: keyof AssetState;
  payload: any;
};

export interface Profile {
  companyId: number;
  companyName: string;
  divisionId: number;
  divisionName: string;
  divisionShortName: string;
  oldUnitId: number;
  unitId: number;
  unitName: string;
}

export interface ToggleTypes {
  toggleMenu: () => void;
}

export interface MenuItemProps {
  icon: React.ReactNode;
  text: string;
  onClick?: () => void;
  endIcon?: React.ReactNode;
}

export interface ThemeToggleProps {
  mode: string;
  toggleTheme: () => void;
}

export interface HeaderState {
  unitData: Profile[];
  selectedUnitId: string;
  companyName: string;
  unitName: string;
  companyCollapseOpen: boolean;
  profileAnchorEl: HTMLElement | null;
  mobileAnchorEl: HTMLElement | null;
  mobileSidebarOpen: boolean;
}

export interface PurchaseState {
  sourceData: Array<any>;
  selectedSource: any | null;
  grnData: Array<any>;
  selectedGrn: any | null;
  itemData: Array<any>;
  selectedItem: any | null;
  itemDetails: Array<any>;
  additionalCostData: Array<any>;
  selectedAdditionalCost: any | null;
  capitalisationData: string | null;
  putToUse: string | null;
  manual: boolean;
}

export type PurchaseActionType = {
  type:
    | "sourceData"
    | "selectedSource"
    | "grnData"
    | "selectedGrn"
    | "itemData"
    | "selectedItem"
    | "itemDetails"
    | "additionalCostData"
    | "selectedAdditionalCost"
    | "capitalisationData"
    | "manual"
    | "putToUse";
  payload: any;
};

export interface PurchaseDetails {
  budgetType: string;
  oldUnitId: string;
  vendorCode: string;
  vendorName: string;
  poDate: any;
  poNo: string;
  poSno: string;
  itemCode: string;
  itemName: string;
  grnNo: string;
  grnSno: string;
  grnDate: string;
  qcCompleted: string;
  acceptedQty: number;
  purchaseValue: number;
  grnValue: number;
  billNo: string;
  billDate: any;
  uom: string;
  binLocation: string;
  pjYear: string;
  pjDocId: string;
  pjDocSr: string;
  pjDocNo: string;
}

export interface AdditionalCost {
  id: number;
  costType: any;
  amount: string;
  journalNo: string;
}

export interface CreateNotificationPropTypes {
  open: boolean;
  close: () => void;
  notificationInput: NotificationProps;
  handleSubmit: (e: React.MouseEvent<HTMLButtonElement>) => void;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error: Array<{}>;
  handleSwitch: (e: React.ChangeEvent<HTMLInputElement>) => void;
  NotificationType: any;
  handleAutocomplete: (name: string, value: any | null) => void;
  selectedValue: any;
  editFlag?: boolean;
}

export interface NotificationProps {
  moduleName: string;
  notificationEventTypeId: number;
  id: number;
  isActive: number;
}

export interface CreateNotificationGroupPropTypes {
  open: boolean;
  close: () => void;
  notificationGroupInput: NotificationGroupProps;
  handleSubmit: (e: React.MouseEvent<HTMLButtonElement>) => void;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error: Array<{}>;
  handleSwitch: (e: React.ChangeEvent<HTMLInputElement>) => void;
  editFlag?: boolean;
}
export interface NotificationGroupProps {
  groupName: string;
  id: number;
  isActive: number;
}

export interface CreateGroupMemberPropTypes {
  open: boolean;
  close: () => void;
  groupMemberInput: GroupMembersProps;
  error: Array<{}>;
  editFlag?: boolean;
  handleSubmit: (e: React.MouseEvent<HTMLButtonElement>) => void;
  selectedValues: any;
  handleSwitch: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleAutocompleteChange: (
    e: React.SyntheticEvent,
    value: any[] | any | null,
    field: string
  ) => void;
  groupData: any;
  userData: any[];
}
export interface GroupMembersProps {
  groupId: number;
  userId: number[];
  id: number;
  isActive: number;
}
export interface NotificationEventRule {
  id: number;
  notificationChannelId: number;
  recipientTypeId: number;
  templateId: number;
  notificationTypeId?: number;
  notificationTemplateId?: number;
}

export interface NotificationEventRuleProps {
  id: number;
  notificationConfigId: number;
  targetTypeId: number;
  targetId: number;
  approvalModeId: number;
  description: string;
  isActive: number;
  notificationEventRules: NotificationEventRule[];
}

export interface CreateNotificationEventRuleTypes {
  open: boolean;
  close: () => void;
  notificationGroupInput: NotificationEventRuleProps;
  error: Array<{}>;
  editFlag?: boolean;
  handleAutocompleteChange: (
    name: string,
    value: any | null,
    ruleId?: number
  ) => void;
  targetType: any;
  targetOptions: any;
  ApprovalMode: any;
  NotificationConfig: any;
  DepartmentData: any;
  NotificationType: any;
  NotificationTemplet: any;
  ReceipientType: any;
  handleAddNotificationRule: () => void;
  getFilteredOptions: (
    currentValue: any | null,
    allOptions: any[],
    currentRuleId: number,
    allRules: NotificationEventRule[],
    fieldName: string
  ) => NotificationEventRule[];
  handleDeleteNotificationRule: (id: number) => void;
  selectedValues: { [key: string]: any[] };
  handleSwitch: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.MouseEvent<HTMLButtonElement>) => void;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export interface CreateNotificationTemplateTypes {
  open: boolean;
  close: () => void;
  notificationTemplateInput: NotificationTemplateProps;
  error: Array<{}>;
  editFlag?: boolean;
  handleAutocompleteChange: (name: string, value: any | null) => void;
  NotificationConfig: any;
  NotificationType: any;
  selectedValues: { [key: string]: any[] };
  handleSwitch: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.MouseEvent<HTMLButtonElement>) => void;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}
export interface NotificationTemplateProps {
  notificationTypeId: number;
  notificationConfigId: number;
  subjectTemplate: string;
  headerTemplate: string;
  bodyTemplate: string;
  footerTemplate: string;
  languageCode: string;
  id: number;
  isActive: number;
}
//Workflow
export interface CreateWorkflowTypes {
  open: boolean;
  close: () => void;
  editFlag?: boolean;
  workflowInput: WorkflowTypesProps;
  ModuleData?: { id: number; moduleName: string }[];
  handleAutocomplete: (
    e: React.SyntheticEvent,
    value: { id: number; moduleName: string } | null
  ) => void;
  selectedValue: { id: number; moduleName: string } | null;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error: Array<{}>;
  handleSubmit: (e: React.MouseEvent<HTMLButtonElement>) => void;
  handleSwitch: (e: React.ChangeEvent<HTMLInputElement>) => void;
}
export interface WorkflowTypesProps {
  moduleId: number;
  moduleTypeName: string;
  id: number;
  isActive: number;
}

export interface CreateApprovalRules {
  open: boolean;
  close: () => void;
  editFlag?: boolean;
  approvalRuleInput: ApprovalRuleProps;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error: string[];
  handleSubmit: (e: React.MouseEvent<HTMLButtonElement>) => void;
  handleSwitch: (e: React.ChangeEvent<HTMLInputElement>) => void;

  UnitData: { id: number; name: string }[];
  WorkflowTypeData: { id: number; name: string }[];
  selectedValue: any | null;
  handleAutocomplete: (name: string, value: any | null) => void;
}
export interface ApprovalRuleProps {
  unitId: number;
  workflowTypeId: number;
  conditionKey: string;
  operator: string;
  value: string;
  action: string;
  [key: string]: any;
  id: number;
  isActive: number;
}

export interface CreateApprovalRules {
  open: boolean;
  close: () => void;
  editFlag?: boolean;
  approvalRuleInput: ApprovalRuleProps;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error: string[];
  handleSubmit: (e: React.MouseEvent<HTMLButtonElement>) => void;
  handleSwitch: (e: React.ChangeEvent<HTMLInputElement>) => void;
  selectedValue: any | null;
  handleAutocomplete: (name: string, value: any | null) => void;
}
export interface ApprovalRuleProps {
  unitId: number;
  workflowTypeId: number;
  conditionKey: string;
  operator: string;
  value: string;
  action: string;
  id: number;
  isActive: number;
}

export interface CreateApprovalDetail {
  open: boolean;
  close: () => void;
  editFlag?: boolean;
  approvalDetailInput: ApprovalDetailProps;
  error: string[];
  selectedValue: any | null;
  handleAutocomplete: (name: string, value: any | null) => void;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSwitch: (e: React.ChangeEvent<HTMLInputElement>) => void;
  workflowTypeOptions: any[];
  targetTypeOptions: any[];
  approvalStepOptions: any[];
  approvalTypeOptions: any[];
  unitOptions: any[];
  ruleOptions: any[];
  departmentOptions: any[];
  handleSubmit: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

export interface ApprovalDetailProps {
  workFlowTypeId: number;
  stepOrder: number;
  targetTypeId: number;
  approvalStepId: number;
  approvalTypeId: number;
  slaHours: number;
  onSLAAction: string;
  approvalStepUnitMappings: {
    unitId: number;
  }[];
  ruleSkipApproverMappings: {
    ruleId: number;
  }[];
  approvalStepDepartmentMappings: {
    departmentId: number;
  }[];
  isActive: number;
  id: number;
}
