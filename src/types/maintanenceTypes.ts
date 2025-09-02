import dayjs, { Dayjs } from "dayjs";

export interface CreateMachineMasterProps {
  open: boolean;
  error: Array<{}>;
  close: () => void;
  inputs: CreateMachineInputs;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSwitch: (
    e: React.ChangeEvent<HTMLInputElement>,
    field: "isActive" | "isProductionMachine"
  ) => void;
  handleAutocomplete: (value: any, field: string, rowId?: number) => void;
  handleDate: (value: dayjs.Dayjs | null) => void;
  handleSubmit: () => void;
  editFlag?: boolean;
  assetSpecData: any[];
  handleAddSpec: () => void;
  handleDeleteSpec: (id: number) => void;
  specList: AdditionalSpec[];
  setSpecList: React.Dispatch<React.SetStateAction<AdditionalSpec[]>>; // ✅ Added
  Specification: SpecificationOption[];
  getFilteredSpecOptions: (
    currentSpec: SpecificationOption | null,
    allOptions: SpecificationOption[],
    currentRowId: number,
    allRows: AdditionalSpec[]
  ) => SpecificationOption[];
  AddSpecification: (body: {
    specifications: {
      specificationId: number;
      machineId: number;
      specificationValue: string;
    }[];
  }) => Promise<void>;
}

export interface SpecificationOption {
  id: number;
  code: string;
}

export interface AdditionalSpec {
  id: number;
  specification: {
    id: number;
    code: string;
  } | null;
  machine: string;
  selectedSpecification: any | null;
  apiRowId?: number;
  showError?: boolean;
  specValue?: string;
  isNew?: boolean;
}

export interface CreateShiftProps {
  open: boolean;
  close: () => void;
  handleSubmit: (e: React.MouseEvent<HTMLButtonElement>) => void;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error: Array<{}>;
  shiftInput: ShiftProps;
  handleSwitch: (e: React.ChangeEvent<HTMLInputElement>) => void;
  editFlag?: boolean;
}

export interface ShiftProps {
  shiftCode: string;
  shiftName: string;
  effectiveDate: string;
  id: number;
  isActive: number;
}

export interface CreateShiftDetailProps {
  open: boolean;
  close: () => void;
  handleShiftChange: (
    e: React.ChangeEvent<HTMLInputElement>,
    value: any,
    field: string
  ) => void;
  selectedShift: null;
  shiftData: any;
  shiftSupervisorData: any;
  handleShiftSupervisorChange: (
    e: React.ChangeEvent<HTMLInputElement>,
    value: any,
    field: string
  ) => void;
  selectedshiftSupervisor: null;
  handleSubmit: (e: React.MouseEvent<HTMLButtonElement>) => void;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error: Array<{}>;
  shiftDeatailInput: ShiftDetailProps;
  handleSwitch: (e: React.ChangeEvent<HTMLInputElement>) => void;
  editFlag?: boolean;
}

export interface ShiftDetailProps {
  oldUnitId: number;
  shiftMasterId: number;
  unitId?: number;
  startTime: string;
  endTime: string;
  breakDurationInMinutes: number;
  // effectiveDate: dayjs.Dayjs | string | undefined;
  effectiveDate: string;
  shiftSupervisorId: number;
  id: number;
  isActive: number;
}

export interface CreateMachineInputs {
  machineCode: string;
  machineName: string;
  machineGroupData: any[];
  selecetdMachineGroup: any | null;
  departmentData: any[];
  selecetdDepartment: any | null;
  productionCapacity: string;
  uomData: any[];
  selectedUom: any | null;
  shiftData: any[];
  lineNumberData: any[];
  selectedLineNumber: any | null;
  selectedShift: any | null;
  workCenterData: any[];
  selectedWorkCenter: any | null;
  costCenterData: any[];
  selectedCostCenter: any | null;
  installationDate: dayjs.Dayjs | null | undefined;
  assetData: any[];
  selectedAsset: any | null;
  isActive: number;
  isProductionMachine: number;
  id: number;
  prodDept: string;
}
export interface checklistProps {
  activityCheckList: string;
  activityID: number;
  checklistId: number;
  unitId?: number;
  isActive: number;
}

export interface CreateActivityCheckListProps {
  open: boolean;
  close: () => void;
  handleSubmit: (e: React.MouseEvent<HTMLButtonElement>) => void;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error: Array<{}>;
  checkListInput: checklistProps;
  handleSwitch: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleActivityChange: (
    e: React.ChangeEvent<HTMLInputElement>,
    value: any,
    field: string
  ) => void;
  selectedActivity: null;
  activityDate: any;
  editFlag?: boolean;
}

export interface SummaryCardProps {
  clockData: any;
}

export interface activityProps {
  activityName: string;
  description: string;
  departmentId: number;
  id: number;
  estimatedDuration: number;
  activityType: number;
  unitId?: number;
  isActive: number;
  machineGroupId: number;
}

export interface CreateActivityProps {
  open: boolean;
  close: () => void;
  handleSubmit: (e: React.MouseEvent<HTMLButtonElement>) => void;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error: Array<{}>;
  activityinput: activityProps;
  handleSwitch: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleDepartmentChange: (
    e: React.ChangeEvent<HTMLInputElement>,
    value: any,
    field: string
  ) => void;
  selectedDepartment: null;
  departmentData: any;
  handleactivitytypeChange: (
    e: React.ChangeEvent<HTMLInputElement>,
    value: any,
    field: any
  ) => void;
  selectedActivityType: null;
  activityType: any;
  handleMachineGroupChange: (
    e: React.ChangeEvent<HTMLInputElement>,
    value: any,
    field: any
  ) => void;
  selectedMachineGroup: any[];
  machineGroupData: any;
  editFlag?: boolean;
}
export interface ClockCardProps {
  handleToggle: (action: string) => void;
  clockData: any;
  clockState: any;
}
export interface CreateMaintanenceTypeProps {
  open: boolean;
  close: () => void;
  handleSubmit: (e: React.MouseEvent<HTMLButtonElement>) => void;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error: Array<{}>;
  maintanenceTypeInput: MaintanenceTypeProps;
  handleSwitch: (e: React.ChangeEvent<HTMLInputElement>) => void;
  editFlag?: boolean;
}
export interface MaintanenceTypeProps {
  maitenenceType: string;
  id: number;
  isActive: number;
  typeName?: string;
}
export interface CreateMaintanenceCategoryProps {
  open: boolean;
  close: () => void;
  handleSubmit: (e: React.MouseEvent<HTMLButtonElement>) => void;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error: Array<{}>;
  maintanenceInput: MaintanenceCategoryProps;
  handleSwitch: (e: React.ChangeEvent<HTMLInputElement>) => void;
  editFlag?: boolean;
}
export interface MaintanenceCategoryProps {
  catogoryName: string;
  decription: string;
  id: number;
  isActive: number;
  categoryName?: string;
  description?: string;
}

export interface CreatemachinegroupsProps {
  open: boolean;
  close: () => void;
  handleSubmit: (e: React.MouseEvent<HTMLButtonElement>) => void;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error: Array<{}>;
  machinegroupInput: machinegroupsProps;
  handleSwitch: (
    e: React.ChangeEvent<HTMLInputElement>,
    field: "isActive" | "powerSource"
  ) => void;
  handleDepartmentChange: (
    e: React.ChangeEvent<HTMLInputElement>,
    value: any,
    field: string
  ) => void;
  selectedDepartment: null;
  departmentData: any;
  manufactureData: any;
  selectedmanufacture: any;
  handleManufactureChange: (
    e: React.ChangeEvent<HTMLInputElement>,
    value: any,
    field: string
  ) => void;
  editFlag?: boolean;
}
export interface machinegroupsProps {
  groupName: string;
  ManufactureId: number;
  isActive: number;
  departmentId: number;
  powerSource: number;
  id: number;
  unitId?: number;
}

export interface CreateMachineGroupUserProps {
  open: boolean;
  close: () => void;
  error: Array<{}>;
  handleDepartmentChange: (
    e: React.ChangeEvent<HTMLInputElement>,
    value: any,
    field: string
  ) => void;
  machineGroupUserInput: MachineGroupsUserProps;
  selectedDepartment: null;
  departmentData: any;
  handleMachineGroupChange: (
    e: React.ChangeEvent<HTMLInputElement>,
    value: any,
    field: string
  ) => void;
  selectedMachineGroup: null;
  machineGroupDate: any;
  userIdData: any;
  handleUserChange: (
    e: React.ChangeEvent<HTMLInputElement>,
    value: any,
    field: string
  ) => void;
  selectedUser: null;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSwitch: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.MouseEvent<HTMLButtonElement>) => void;
  editFlag?: boolean;
}

export interface MachineGroupsUserProps {
  machineGroupId: number;
  departmentId: number;
  userId: number;
  isActive: number;
  id: number;
}
export interface CreateworkCenterProps {
  open: boolean;
  close: () => void;
  handleSubmit: (e: React.MouseEvent<HTMLButtonElement>) => void;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error: Array<{}>;
  workCenterInput: WorkCenterProps;
  handleSwitch: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleDepartmentChange: (
    e: React.ChangeEvent<HTMLInputElement>,
    value: any,
    field: string
  ) => void;
  selectedDepartment: null;
  departmentData: any;
  editFlag?: boolean;
}
export interface WorkCenterProps {
  code: string;
  workCenterName: string;
  unitId: number;
  departmentId: number;
  id: number;
  isActive: number;
  workCenterCode?: string;
}

export interface CreateCostCenterProps {
  open: boolean;
  close: () => void;
  handleSubmit: (e: React.MouseEvent<HTMLButtonElement>) => void;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error: Array<{}>;
  costCenterInput: CostCenterProps;
  handleSwitch: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleDepartmentChange: (
    e: React.ChangeEvent<HTMLInputElement>,
    value: any,
    field: string
  ) => void;
  selectedDepartment: null;
  departmentData: any;
  editFlag?: boolean;
  handleResponsiblePersonChange: (
    e: React.ChangeEvent<HTMLInputElement>,
    value: any,
    field: string
  ) => void;
  selectedResponsiblePerson: null;
  responsiblePersonData: any;
}

export interface CostCenterProps {
  oldUnitId?: number;
  costCenterCode?: string;
  costcenterName?: string;
  costCenterName?: string;
  unitId: number;
  departmentId: number;
  effectiveDate: string | null;
  responsiblePerson?: string;
  responsiblepersonId?: number;
  budgetAllocated?: number;
  budgetallocation?: string;
  remarks: string;
  id: number;
  isActive: number;
}

export interface SparesPropTypes {
  storeTypeData: any[];
  itemDetailsData: any;
  handleAutoComplete?: ({ id, field, value }: SparesAutocomplete) => void;
  selectedItem?: any;
}

export interface SparesAutocomplete {
  id: number | string;
  field: string;
  value: any;
}

export interface SpareRow {
  id: number;
  type: any;
  item: any;
  availableQty?: number;
  requiredQty?: number;
  usedQty?: number | string;
  scrapQty?: number | string;
  toSubStore?: number | string;
  image?: File | null;
  imageName?: string;
  itemOptions?: any[];
  isLoading?: boolean;
  category?: any;
  subCostCenter?: any;
  machine?: any;
  stockValue?: number;
  rate?: number;
  pending?: number;
  uom?: string;
  isEdit?: boolean;
}

export interface SparesUsedProps {
  rows: SpareRow[];
  storeTypeData: any[];
  itemDetailsData: any[];
  handleAddRow: () => void;
  handleDeleteRow: (id: number, itemCode?: string | number) => void;
  handleInputChange: (id: number, field: keyof SpareRow, value: any) => void;
  handleFileChange: (id: number, file: File) => void;
  handleDeleteImage: (image: string, id: number) => void;
  selectedSpares: string[];
}
export interface ScheduleItemProps {
  rows: SpareRow[];
  storeTypeData: any[];
  itemDetailsData?: any[];
  handleAddRow: () => void;
  handleDeleteRow: (id: number) => void;
  handleInputChange: (id: number, field: keyof SpareRow, value: any) => void;
  handleFileChange?: (id: number, file: File) => void;
  categoryData?: any[];
  subCostCenterData?: any[];
  machineData?: any[];
  selectedValues?: {
    machine?: any;
    category?: any;
    subCostCenter?: any;
  };
  setSelectedValues?: any;
}

export interface TechnicianRow {
  id: number;
  technician: {
    custodianId: number;
    custodianName: string;
  } | null;
  hours: string;
  minutes: string;
  isEdit?: boolean;
}

export interface TechnicianProps {
  custodianData: any[];
  rows: TechnicianRow[];
  handleAddRow: () => void;
  handleDeleteRow: (id: number, custodianId?: number) => void; // updated
  handleInputChange: (
    id: number,
    field: keyof TechnicianRow,
    value: string | any
  ) => void;
  totalTime: any;
  mainTime: string;
  selectedTechnician: number[];
  handleTechnicianInputChange: (
    id: number,
    field: keyof TechnicianRow,
    value: any
  ) => void;
  errorRowIds: {
    tech: boolean;
    hours: boolean;
    min: boolean;
  };
}

export interface MainSchedulePropTypes {
  formData: {
    frequencyType: any;
    period: string;
    periodType: any;
    graceDays: string;
    workOrder: string;
    materialRequest: string;
    effectiveDate: Dayjs | null;
    isDowntimeRequired: boolean;
    downtimeEstimate: string;
  };
  errors: {
    frequencyType: boolean;
    period: boolean;
    periodType: boolean;
    effectiveDate: boolean;
  };
  handleChange: (field: string, value: any) => void;
  validate: () => void;
  frequencyTypeData: any[];
  periodTypeData: any[];
  sheduleId: number | string;
}

export interface CreateInternalProps {
  open: boolean;
  close: () => void;
  selectedDepartment: null;
  departmentData: any;
  handleDepartmentChange: (
    e: React.ChangeEvent<HTMLInputElement>,
    value: any,
    field: string
  ) => void;
  selectedMaintenanceType: null;
  maintenanceTypeData: any;
  handleMaintenanceTypeChange: (
    e: React.ChangeEvent<HTMLInputElement>,
    value: any,
    field: string
  ) => void;
  selectedmachine: null;
  machineData: any;
  handleMachineChange: (
    e: React.ChangeEvent<HTMLInputElement>,
    value: any,
    field: string
  ) => void;
  internalInput: RequestProps;
  error: Array<{}>;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSwitch: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

export interface RequestProps {
  maintenanceTypeId: number;
  machineId: number;
  departmentId: number;
  remarks: string;
  isActive: number;
  requestTypeId: number;
  unitId: number;
  id: number;
  sourceId: number;
  vendorId: number;
  vendorName: string;
  oldVendorId: string;
  oldVendorName: string;
  serviceTypeId: number;
  serviceLocationId: number;
  modeOfDispatchId: number;
  expectedDispatchDate: string;
  sparesTypeId: number;
  estimatedServiceCost: number;
  estimatedSpareCost: number;
  requestStatusId: number;
}

export interface CreateExternalProps {
  open: boolean;
  close: () => void;
  error: Array<{}>;
  externalInput: RequestProps;

  handleMaintenanceTypeChange: (
    e: React.ChangeEvent<HTMLInputElement>,
    value: any,
    field: string
  ) => void;
  handleServiceTypeChange: (
    e: React.ChangeEvent<HTMLInputElement>,
    value: any,
    field: string
  ) => void;
  handleServiceLocation: (
    e: React.ChangeEvent<HTMLInputElement>,
    value: any,
    field: string
  ) => void;
  handleDispatchChange: (
    e: React.ChangeEvent<HTMLInputElement>,
    value: any,
    field: string
  ) => void;
  handleSparsTypeChange: (
    e: React.ChangeEvent<HTMLInputElement>,
    value: any,
    field: string
  ) => void;
  handleDepartmentChange: (
    e: React.ChangeEvent<HTMLInputElement>,
    value: any,
    field: string
  ) => void;

  handleMachineChange: (
    e: React.ChangeEvent<HTMLInputElement>,
    value: any,
    field: string
  ) => void;
  selectedServiceType: null;
  serviceTypeData: any;
  selectedServiceLocation: null;
  serviceLocationData: any;
  selectedDispatch: null;
  dispatchData: any;
  selectedSpares: null;
  sparesData: any;
  selectedMaintenanceType: null;
  maintenanceTypeData: any;
  selectedDepartment: null;
  departmentData: any;
  selectedmachine: null;
  machineData: any;
  locationFlag: boolean;
  handleDateChange: (name: string, newValue: Dayjs | null) => void;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSwitch: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

export interface CreateMiscMainPropTypes {
  open: boolean;
  close: () => void;
  miscInput: MiscMainProps;
  handleSubmit: (e: React.MouseEvent<HTMLButtonElement>) => void;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error: Array<{}>;
  handleSwitch: (e: React.ChangeEvent<HTMLInputElement>) => void;
  miscType: Array<{ id: string; miscTypeCode: string }>;
  handleAutocomplete: (
    e: React.ChangeEvent<HTMLInputElement>,
    value: { id: string; miscTypeCode: string } | null
  ) => void;
  selectedMisc: null;
  editFlag?: boolean;
}
export interface MiscMainProps {
  miscCode: string;
  description: string;
  id: number;
  isActive: number;
  sortOrder: number;
}

export interface CreateFeederGroupPropType {
  open: boolean;
  close: () => void;
  feedergroupInput: feedergroupsProps;
  error: Array<{}>;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSwitch: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.MouseEvent<HTMLButtonElement>) => void;
  editFlag?: boolean;
}
export interface feedergroupsProps {
  feederGroupCode?: string;
  feederGroupName?: string;
  isActive: number;
  id: number;
  unitId?: number;
}

export interface CreateFeederPropType {
  open: boolean;
  close: () => void;
  feederInput: FeederProps;
  error: Array<{}>;
  handleSwitch: (
    e: React.ChangeEvent<HTMLInputElement>,
    field: "isActive" | "highPriority" | "meterAvailable"
  ) => void;
  editFlag?: boolean;
  feederTypeFlag?: boolean;
  feederGroupData: any;
  departmentData: any;
  parentFeederData: any;
  feederTypeData: any;
  meterTypeData: any;
  handledAutoComplete: (
    e: React.SyntheticEvent,
    value: any[],
    field: string
  ) => void;
  selectedValues: any;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

export interface FeederProps {
  feederCode: string;
  feederName: string;
  parentFeederId: number;
  feederGroupId: number;
  feederTypeId: number;
  unitId: number;
  departmentId: number;
  description: string;
  multiplicationFactor: number;
  effectiveDate: string;
  openingReading: number;
  highPriority: number;
  target: number;
  id: number;
  isActive: number;
  meterAvailable: number;
  meterTypeId: number | null;
}

export interface CreatePowerConsumptionpage {
  open: boolean;
  close: () => void;
  editFlag?: boolean;
  powerInput: PowerConsumption;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error: Array<{}>;
  handleSubmit: (e: React.MouseEvent<HTMLButtonElement>) => void;
  feederTypeData: any;
  handledAutoComplete: (
    e: React.SyntheticEvent,
    value: any[],
    field: string
  ) => void;
  selectedValues: any;
  feederData: any;
  openingReading: any;
}

export interface PowerConsumption {
  feederTypeId: number;
  feederId: number;
  unitId: number;
  openingReading: number;
  closingReading: number;
  totalUnits: number;
  id: number;
}

export interface CreateGeneratorConsumptionpage {
  open: boolean;
  close: () => void;
  generatorTypeData: any;
  generatorInput: GeneratorConsumption;
  selectedValues: any;
  handledAutoComplete: (
    e: React.SyntheticEvent,
    value: any[],
    field: string
  ) => void;
  error: Array<{}>;
  handleSubmit: (e: React.MouseEvent<HTMLButtonElement>) => void;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  runningHours: string | number;
  openingReading: any;
  purposeData: any;
}

export interface GeneratorConsumption {
  generatorId: number;
  startTime: string;
  endTime: string;
  dieselConsumption: number;
  runningHours: number;
  openingEnergyReading: number;
  closingEnergyReading: number;
  totalUnits: number;
  purposeId: number;
  unitId: number;
  [key: string]: string | number;
}


export interface HsnRow {
  id: number;
  typeId: number;
  type: string;
  hsnCode: string;
  description: string;
  gstCategoryName: string;
  gstPercentage: number;
  cgstPercentage: number;
  sgstPercentage: number;
  igstPercentage: number;
  validFrom: string;
  isActive: boolean;
  isDeleted?: boolean;
  createdBy?: number;
  createdDate?: string;
  createdByName?: string;
  createdIP?: string;
  modifiedBy?: number;
  modifiedDate?: string;
  modifiedByName?: string;
  modifiedIP?: string;
}
export interface HsnForm {
  id: number;
  type: string;
  typeId: number | "";
  hsnCode: string;
  description: string;
  gstCategoryId: number | "";
  gstCategoryName: string;
  gstPercentage: number | "";
  cgstPercentage: number | "";
  sgstPercentage: number | "";
  igstPercentage: number | "";
  validFrom: string;
  isActive: boolean;
}

export type HsnErrorField =
  | "type"
  | "hsnCode"
  | "description"
  | "gstCategoryName"
  | "gstPercentage"
  | "validFrom"
  | "isActive";

export interface ApiListResponse<T> {
  statusCode: number;
  data: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  message?: string;
  errors?: string[];
}
export interface HsnCategoryOption {
  id: number;
  code: string;
  description?: string;
}

export interface HsnTypeOption {
  id: number;
  code: string;
  description?: string;
}


export interface CreateHsnCodeProps {
  open: boolean;
  close: () => void;
  editFlag?: boolean;
  form: HsnForm;
  errorFields: HsnErrorField[];
  onChange: (name: keyof HsnForm, value: any) => void;
  onDateChange: (iso: string) => void;
  onSwitch: (checked: boolean) => void;
  onSubmit: () => void;
  gstCategories?: HsnCategoryOption[] | { data: HsnCategoryOption[] } | null;
  hsnSacTypes?: HsnTypeOption[] | { data: HsnTypeOption[] } | null;
  submitDisabled?: boolean;
}

