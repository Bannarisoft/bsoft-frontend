//----------------------UOM Master---------------------------------//
export interface CreateUomProps {
  code: string;
  uomName: string;
  id: number;
  uomTypeId: number;
  uomType: string;
  isActive: number;
  sortOrder: number;
}
export interface CreateUomPropTypes {
  open: boolean;
  close: () => void;
  error: Array<{}>;
  handleAutocompleteChange: (
    e: React.SyntheticEvent,
    value: CreateUomProps | CreateUomProps[] | null,
    field: string
  ) => void;
  uomInput: CreateUomProps;
  uomType: CreateUomProps[];
  selectedUomType: any;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.MouseEvent<HTMLButtonElement>) => void;
  handleSwitch: (e: React.ChangeEvent<HTMLInputElement>) => void;
  editFlag: boolean;
}

//----------------------UOM Coversion---------------------------------//
export interface GetByUom {
  id: number;
  uomName: string;
}
export interface UomConversionProps {
  id: number;
  fromUOMId: number;
  toUOMId: number;
  conversionValue: number;
  isActive: number;
}

export interface UomConversionPropTypes {
  open: boolean;
  close: () => void;
  error: Array<{}>;
  handleAutocompleteChange: (
    e: React.SyntheticEvent,
    value: GetByUom | GetByUom[] | null,
    field: string
  ) => void;
  uomData: GetByUom[];
  selectedUomConversion: any;
  uomConversionInput: UomConversionProps;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.MouseEvent<HTMLButtonElement>) => void;
  handleSwitch: (e: React.ChangeEvent<HTMLInputElement>) => void;
  editFlag: boolean;
}

export interface GetByGroup {
  id: number;
  itemGroupName: string;
}
export interface GetByCategory {
  id: number;
  itemCategoryName: string;
  parentCategoryName: string;
}
export interface GetByWarehouse {
  id: number;
  itemCode: string;
  itemName: string;
  parentItemId: number;
}
export interface GetStorageType {
  id: number;
  code: string;
  description: string;
}
export interface GetItem {
  id: number;
  itemCode: string;
  itemName: string;
}
export interface GetRack {
  id: number;
  rackCode: string;
  rackName: string;
}
export interface GetBin {
  id: number;
  binCode: string;
  binName: string;
}
export interface GetPriority {
  id: number;
  code: string;
  description: string;
}

export interface PutawayPropTypes {
  open: boolean;
  close: () => void;
  error: Array<{}>;
  selectedValues: { [key: string]: any[] };
  putawayRuleInput: PutawayRuleRequest;
  editFlag: boolean;
  ItemGroup: GetByGroup[];
  ItemCategory: GetByCategory[];
  warehouse: GetByWarehouse[];
  StorageType: GetStorageType[];
  Rack: GetRack[];
  Bin: GetBin[];
  Priority: GetPriority[];
  handleAutocompleteChange: (
    name: string,
    value: any | null,
    index?: number
  ) => void;
  handleSwitch: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.MouseEvent<HTMLButtonElement>) => void;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleAddStorageRule: () => void;
  handleDeleteStorageRule: (id: number) => void;
  getFilteredOptions: (
    currentValue: any | null,
    allOptions: any[],
    currentRuleId: number,
    allRules: Strategy[] | null | undefined,
    fieldName: keyof Strategy
  ) => Strategy[];
  itemOptions: any;
}
export interface Strategy {
  id?: number;
  storageTypeId: number;
  storageTypeCode?: string;
  targetId: number;
  targetCode?: string;
  targetName?: string;
  priorityId: number;
  priorityName?: string;
}

export interface PutawayRuleBody {
  id: number;
  unitId: number;
  itemGroupId: number;
  itemCategoryId: number;
  itemId: number;
  warehouseId: number;
  strategies: Strategy[];
}
export interface PutawayRuleRequest {
  body: PutawayRuleBody;
}

//-------------------------------------------------------------------//
