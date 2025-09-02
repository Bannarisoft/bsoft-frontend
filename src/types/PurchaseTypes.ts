export interface HsnPropsType {
  open: boolean;
  close: () => void;
  editFlag?: boolean;
  hsnInput: CreateHan;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export interface CreateHan {
  hsnCode: number;
  [key: string]: string | number | undefined;
}
//----------------------Item Master---------------------------------//
export interface ItemGroupType {
  open: boolean;
  close: () => void;
  editFlag?: boolean;
  itemGroupInput: ItemGroup;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.MouseEvent<HTMLButtonElement>) => void;
}
export interface ItemGroup {
  itemGroupCode: string;
  itemGroupName: string;
  id: number;
  isActive: number;
}

export interface GetByGroup {
  id: number;
  itemGroupName: string;
}
export interface GetByCategory {
  id: number;
  itemCategoryName: string;
  parentCategoryName: string | null;
}
export interface ItemCategoryType {
  open: boolean;
  close: () => void;
  editFlag?: boolean;
  itemCategoryInput: ItemCategory;
  handleAutocompleteChange: (
    e: React.SyntheticEvent,
    value: GetByGroup | GetByCategory | GetByGroup[] | GetByCategory[] | null,
    field: string
  ) => void;
  itemgroupData: GetByGroup[];
  itemcategoryData: GetByCategory[];
  handleSwitch: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleCheck: (e: React.ChangeEvent<HTMLInputElement>) => void;
  selectedValues: any;
  handleSubmit: (e: React.MouseEvent<HTMLButtonElement>) => void;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error: Array<{}>;
}
export interface ItemCategory {
  itemGroupId: number;
  parentCategoryId: number;
  itemCategoryName: string;
  id: number;
  isActive: number;
  isGroup: number;
  isBudgetApplicable: number;
}
//-------------------------------------------------------------------//
export interface checklistProps {
  activityCheckList: string;
  activityID: number;
  checklistId: number;
  unitId?: number;
  isActive: number;
}

//PartyGroup
export interface CreatePartyGroupType {
  partyGroupName: string;
  parentPartyGroupId: number;
  parentPartyGroupName: string;
  groupTypeId: number;
  groupName: string;
  description: string;
  glcode: string;
  glCategoryId: number;
  glCategoryName: string;
  isActive: number;
  isGroup: number;
}

export type PartyTypeOption = {
  id: number;
  groupName: string;
};

export type PartyGroupOption = {
  id: number;
  partyGroupName: string;
};

export interface PartyGroupType {
  open: boolean;
  close: () => void;
  handleSubmit: (e: React.MouseEvent<HTMLButtonElement>) => void;
  handleChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  handleSwitch: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error: string[];
  PartyGroupInput: CreatePartyGroupType;
  // Autocomplete props
  handlePartytypeChange?: (
    e: React.SyntheticEvent,
    value: PartyTypeOption | null,
    field: keyof CreatePartyGroupType
  ) => void;
  selectedPartyType: PartyTypeOption | null;
  PartyType: PartyTypeOption[] | null;
  handlePartyGroupChange?: (
    e: React.SyntheticEvent,
    value: PartyGroupOption | null,
    field: keyof CreatePartyGroupType
  ) => void;
  selectedPartyGroup: PartyGroupOption | null;
  PartyGroupData: PartyGroupOption[] | null;
  PartyGlCategory: PartyGroupOption[] | null;
  editFlag?: boolean;
  submitDisabled?: boolean;
}








import { Dayjs } from "dayjs";

export type QuotationStatus = "Draft" | "Submitted" | "Accepted" | "Rejected";

export type FieldSize = { xs: number; sm?: number; md?: number; lg?: number };
export type FieldType =
  | "text"
  | "select-status"
  | "datepicker"
  | "autocomplete-supplier"
  | "autocomplete-costcenter"
  | "autocomplete-project";

export type FieldDef = {
  label: string;
  name: keyof QuotationForm;
  type: FieldType;
  isRequired?: boolean;
  readOnly?: boolean;
  size: FieldSize;
  maxLength?: number;
};

export type QuotationForm = {
  series: string;
  status: QuotationStatus;
  supplierId: string | number | null;
  date: Dayjs | null;
  validTill: Dayjs | null;
  quotationNo: string;
  costCenterId: string | number | null;
  projectId: string | number | null;
};

export type Supplier = {
  id: number | string;
  name?: string;
  supplierName?: string;
  displayName?: string;
};

export type CC = { id: number | string; name?: string; text?: string };
export type Proj = { id: number | string; name?: string; text?: string };

export type ItemRow = {
  id: string;
  itemCode: string;
  quantity: number | "";
  uom: string;
  rate: number | "";
  amount: number;
};

export type TaxRow = {
  id: string;
  idx: number;
  addOrDeduct: "Add" | "Deduct";
  chargeType: "On Net Total";
  accountHead: string;
  taxRate: number | "";
  amount: number;
  total: number;
};

export type AdditionalDiscount = {
  type: "Amount" | "Percent";
  value: number | "";
  applyOn: "Net Total";
};

export type Totals = {
  netTotal: number;
  taxesAdded: number;
  taxesDeducted: number;
  discount: number;
  grandTotal: number;
  roundingAdjustment: number;
  roundedTotal: number;
  disableRoundedTotal: boolean;
};
export type Attachment = { name: string; at: string; by: string };

export type ItemSource = "Manual" | "RFQ" | "Indent";
export type ItemRowEx = ItemRow & {
  gstPercent?: number | "";
  gstAmount?: number;
  deduction?: number | "";
  taxable?: number;
};