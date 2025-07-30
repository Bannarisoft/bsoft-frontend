import { useReducer, useCallback, useState } from "react";

export interface PoDetailsData {
  [key: string]: any;
}

interface PoDetailAction {
  type: keyof PoDetailsData;
  payload: any;
}

const initialState: PoDetailsData = {
  grnDate: null,
  grnNo: "",
  grnSno: "",
  grnValue: "",
  poNo: "",
  poDate: null,
  poSno: "",
  purchaseValue: "",
  itemCode: "",
  itemName: "",
  acceptedQty: "",
  uom: "",
  vendorCode: "",
  vendorName: "",
  billNo: "",
  billDate: null,
  billLocation: "",
  qcCompleted: "Y",
};

function locationReducer(
  state: PoDetailsData,
  action: PoDetailAction
): PoDetailsData {
  return {
    ...state,
    [action.type]: action.payload,
  };
}

export function usePurchaseDetails() {
  const [poDetailsInput, dispatch] = useReducer(locationReducer, initialState);
  const [poDataErrors, setPoDataErrors] = useState<Record<string, string>>({});

  const handlePoInputChange = (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | { target: { name: string; value: string } }
  ) => {
    const { name, value } = e.target;
    dispatch({ type: name as keyof PoDetailsData, payload: value });
    setPoDataErrors({});
  };

  return {
    poDetailsInput,
    handlePoInputChange,
    poDataErrors,
    setPoDataErrors,
    poDataDispatch: dispatch,
  };
}
