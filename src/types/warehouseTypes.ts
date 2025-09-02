import type { ReactNode } from "react";
import type { SxProps, Theme } from "@mui/material/styles";

export type WarehouseFormMode = "create" | "edit";
export type Option = { id: number; label: string };
export type Props = { warehouseId?: string };

export interface WarehouseFormValues {
  warehouseCode: string;
  warehouseName: string;
  unitId: number | null;
  unitName?: string;
  parentWarehouseGroupId: number | null;
  parentWarehouseGroupName?: string;
  isGroup: boolean;
  isVirtualWarehouse: boolean;
  warehouseTypeId: number | null;
  storageTypeId: number | null;
  areaTypeId: number | null;
  operationTypeId: number | null;
  contactPersonName: string;
  mobileNumber: string;
  email: string;
  addressLine1: string;
  addressLine2: string;
  cityId: number | null;
  stateId: number | null;
  countryId: number | null;
  pincode: string;
  status: boolean;
  isScrapWarehouse: boolean;
  isTransitWarehouse: boolean;
  maxCapacity: string;
  capacityUomId: number | null;
  accountId: number | null;
  accountName?: string;
  defaultForStockEntry: boolean;
  allowedItemGroupIds: number[];
}

export interface WarehouseFormProps {
  initial?: Partial<WarehouseFormValues>;
  onSubmit?: (values: WarehouseFormValues) => void;
}

export interface ToggleTileProps {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
  subtitle?: string;
  icon: ReactNode;
  disabled?: boolean;
}

export interface SectionCardProps {
  icon?: ReactNode;
  title: string;
  action?: ReactNode;
  children: ReactNode;
  sx?: SxProps<Theme>;
  titleColor?: string;

}

export type FieldKind =
  | "text"
  | "number"
  | "autocomplete"
  | "autocomplete-multi"
  | "pincode"
  | "unit-readonly"
  | "toggle";



export type FieldDef = {
  section: "general" | "contact" | "address" | "capacity" | "itemgroups" | "settings";
  label: string;
  name:
  | "warehouseName"
  | "unitId"
  | "parentWarehouseGroupId"
  | "parentWarehouseGroupName"
  | "isGroup"
  | "isVirtualWarehouse"
  | "warehouseTypeId"
  | "storageTypeId"
  | "areaTypeId"
  | "operationTypeId"
  | "contactPersonName"
  | "mobileNumber"
  | "email"
  | "addressLine1"
  | "addressLine2"
  | "cityId"
  | "stateId"
  | "countryId"
  | "pincode"
  | "isScrapWarehouse"
  | "isTransitWarehouse"
  | "maxCapacity"
  | "capacityUomId"
  | "accountId"
  | "accountName"
  | "defaultForStockEntry"
  | "allowedItemGroupIds"
  | "isActive";
  kind: FieldKind;
  isRequired?: boolean;
  size: { xs: number; sm: number; md: number; lg: number };
  optionsKey?: keyof AutocompleteSources;
  disableErrorText?: boolean;
  maxLength?: number;
  min?: number;
  max?: number;
  subtitle?: string;
  icon?: ReactNode;
};
export type AutocompleteSources = {
  warehouseTypes: Option[];
  storageTypes: Option[];
  areaTypes: Option[];
  operationTypes: Option[];
  capacityUoms: Option[];
  itemGroups: Option[];
  parentWHOptions: Option[];
  countryData: any[];
  stateData: any[];
  cityData: any[];
};





export type Id = number;
export interface ApiListResponse<T> {
  statusCode: number;
  message?: string;
  data: T[];
  totalCount: number;
  errors?: string[];
}
export interface ApiItemResponse<T> {
  statusCode: number;
  message?: string;
  data: T;
  errors?: string[];
}
export interface WarehouseOption {
  id: Id;
  warehouseCode: string;
  warehouseName: string;
  isActive?: boolean;
}
export interface RackOption {
  id: Id;
  rackCode: string;
  rackName: string;
  warehouseId?: Id;
}
export interface UomOption {
  id: Id;
  uomName: string;
}
export type BinStatus = 'Active' | 'Inactive';
export interface BinRow {
  id: Id;
  binCode: string;
  binName?: string | null;
  warehouseId: Id;
  warehouseName: string;
  rackId?: Id | null;
  rackCode?: string | null;
  rackName?: string | null;
  binCapacity?: number;
  capacityUOMId?: Id;
  capacityUOMName?: string;
  isActive?: boolean | 0 | 1;
  status?: BinStatus;
}

export interface BinForm {
  id: Id;
  warehouseId: Id | '';
  warehouseCode?: string;
  rackId: Id | '' | null;
  rackCode?: string | null;
  binCode?: string;
  binName: string;
  binCapacity: number | '';
  capacityUOMId: Id | '';
  status: BinStatus;
  isActive?: 0 | 1;
}

export type BinErrorField =
  | 'warehouseId'
  | 'rackId'
  | 'binName'
  | 'binCapacity'
  | 'capacityUOMId'
  | 'status';

export type FieldKindbin =
  | 'text'
  | 'number'
  | 'autocomplete-warehouse'
  | 'autocomplete-rack'
  | 'autocomplete-uom'
  | 'select-status';

export type Fields = {
  label: string;
  name: keyof BinForm;
  type: FieldKindbin;
  isRequired?: boolean;
  size: { xs: number; sm: number; md: number; lg: number };
  min?: number;
  max?: number;
  maxLength?: number;
  readOnly?: boolean;
};

export interface CreateBinProps {
  open: boolean;
  close: () => void;
  editFlag: boolean;
  form: BinForm;
  errorFields: BinErrorField[];
  onChange: (name: keyof BinForm, value: any) => void;
  onSubmit: () => void;
  warehouses: WarehouseOption[];
  racks: RackOption[];
  uoms: UomOption[];
  statusOptions: BinStatus[];
  submitDisabled?: boolean;
}






export interface ApiListResponse<T> {
  statusCode: number;
  message?: string;
  data: T[];
  totalCount: number;
  errors?: string[];
}

export interface ApiItemResponse<T> {
  statusCode: number;
  message?: string;
  data: T;
  errors?: string[];
}

export interface DropdownOption1 {
  id: Id;
  code?: string;
  name?: string;
  description?: string | null;
  isActive?: boolean;
}

export interface WarehouseOption extends DropdownOption1 { }
export interface FloorOption extends DropdownOption1 {
  warehouseId?: Id;
}
export interface AisleOption extends DropdownOption1 {
  warehouseId?: Id;
  floorId?: Id;
}
export interface RackLevelOption extends DropdownOption1 {
  warehouseId?: Id;
  floorId?: Id;
  aisleId?: Id;
}


export interface RackRow {
  id: Id;
  warehouseId: Id;
  warehouseName: string | null;
  rackCode: string;
  rackName: string;
  floorId: Id;
  floorName: string;
  aisleId: Id;
  aisleName: string;
  rackLevelId: Id;
  rackLevelName: string;
  maxCapacity: number;
  capacityUOMId: Id;
  capacityUOMName: string;
  rackWidth?: number | null;
  rackHeight?: number | null;
  dimensionUOMId?: Id | null;
  dimensionUOMName?: string | null;
  isActive: boolean;
  isDeleted?: boolean;
  createdBy?: number;
  createdDate?: string;
  createdByName?: string;
  createdIP?: string;
  modifiedBy?: number | null;
  modifiedDate?: string | null;
  modifiedByName?: string | null;
  modifiedIP?: string | null;
}

export interface RackForm {
  id: Id;
  warehouseId: Id | '';
  rackCode?: string;
  rackName: string;
  floorId: Id | '';
  aisleId: Id | '';
  rackLevelId: Id | '';
  maxCapacity: number | '';
  capacityUOMId: Id | '';
  rackWidth?: number | '' | null;
  rackHeight?: number | '' | null;
  dimensionUOMId?: Id | '' | null;
  isActive: boolean;
}

export type RackErrorField =
  | 'warehouseId'
  | 'rackName'
  | 'floorId'
  | 'aisleId'
  | 'rackLevelId'
  | 'maxCapacity'
  | 'capacityUOMId';

export type FieldKindrack =
  | 'text'
  | 'number'
  | 'autocomplete-warehouse'
  | 'autocomplete-floor'
  | 'autocomplete-aisle'
  | 'autocomplete-racklevel'
  | 'autocomplete-uom'
  | 'readonly';

export type FieldDefn = {
  label: string;
  name: keyof RackForm;
  type: FieldKindrack;
  isRequired?: boolean;
  size: { xs: number; sm: number; md: number; lg: number };
  min?: number;
  max?: number;
  maxLength?: number;
  readOnly?: boolean;
};

export interface CreateRackProps {
  open: boolean;
  close: () => void;
  editFlag: boolean;
  form: RackForm;
  errorFields: RackErrorField[];
  onChange: (name: keyof RackForm, value: any) => void;
  onSubmit: () => void;
  warehouses: WarehouseOption[];
  floors: FloorOption[];
  aisles: AisleOption[];
  rackLevels: RackLevelOption[];
  uoms: UomOption[];
  submitDisabled?: boolean;
}
