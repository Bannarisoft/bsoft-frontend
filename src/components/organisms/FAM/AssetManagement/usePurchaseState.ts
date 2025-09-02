import { useReducer, useCallback, useEffect, useState } from "react";
import { useRecoilValue } from "recoil";
import { UserData } from "../../../../utils/atoms";
import { Apirequest } from "../../../../utils/lib";
import Config from "../../../../utils/fam.api.json";
import { PurchaseActionType, PurchaseState } from  "../../../../types/types";
import { usePurchaseDetails } from "./usePurchaseDetails";

const initialState: PurchaseState = {
  sourceData: [],
  selectedSource: null,
  grnData: [],
  selectedGrn: null,
  itemData: [],
  selectedItem: null,
  itemDetails: [],
  additionalCostData: [],
  selectedAdditionalCost: null,
  capitalisationData: "",
  putToUse: null,
  manual: false,
};

function purchaseReducer(
  state: PurchaseState,
  action: PurchaseActionType
): PurchaseState {
  return {
    ...state,
    [action.type]: action.payload,
  };
}

export const usePurchaseState = () => {
  const [state, dispatch] = useReducer(purchaseReducer, initialState);
  const userValue = useRecoilValue(UserData);
  const [errors, setErrors] = useState<string[]>([]);
  const [itemLoading, setItemLoading] = useState<boolean>(false);

  const { setPoDataErrors } = usePurchaseDetails();

  const getSource = useCallback(async () => {
    try {
      const { endpoint, method } = Config.PurchaseInfo.Source;
      const response = await Apirequest(endpoint, method, null, "fam");
      dispatch({ type: "sourceData", payload: response.data?.data });
    } catch (err) {
      console.error("Error fetching source data:", err);
    }
  }, []);

  const getAdditionalCostTypes = useCallback(async () => {
    try {
      const { endpoint, method } = Config.PurchaseInfo.AdditionalCost;
      const response = await Apirequest(endpoint, method, null, "fam").then(
        (res) => res.data
      );
      dispatch({ type: "additionalCostData", payload: response?.data });
    } catch (err) {
      console.log(err);
    }
  }, []);

  const getGrnData = useCallback(async () => {
    try {
      const { endpoint, method } = Config.PurchaseInfo.Grn;
      const response = await Apirequest(
        endpoint
          .replace("{oldUnitId}", userValue.oldUnitId.toString())
          .replace("{assetSourceId}", state.selectedSource?.id.toString()),
        method,
        null,
        "fam"
      );
      dispatch({ type: "grnData", payload: response.data?.data });
    } catch (err) {
      console.error("Error fetching GRN data:", err);
    }
  }, [userValue.unitId, state.selectedSource]);

  const getGrnItems = useCallback(
    async (grnNo: string) => {
      try {
        const { endpoint, method } = Config.PurchaseInfo.Items;
        const response = await Apirequest(
          endpoint
            .replace("{oldUnitId}", userValue.oldUnitId.toString())
            .replace("{assetSourceId}", state.selectedSource?.id.toString())
            .replace("{grnNo}", grnNo),
          method,
          null,
          "fam"
        );
        dispatch({ type: "itemData", payload: response.data?.data });
      } catch (err) {
        console.error("Error fetching GRN items:", err);
      }
    },
    [userValue.unitId, state.selectedSource]
  );

  const getGrnItemDetails = useCallback(
    async (grnSerialNo: string) => {
      try {
        const { endpoint, method } = Config.PurchaseInfo.Details;
        const response = await Apirequest(
          endpoint
            .replace("{oldUnitId}", userValue.oldUnitId.toString())
            .replace("{assetSourceId}", state.selectedSource?.id.toString())
            .replace("{grnNo}", state.selectedGrn?.grnNo)
            .replace("{grnSerialNo}", grnSerialNo),
          method,
          null,
          "fam"
        );
        dispatch({ type: "itemDetails", payload: response.data?.data });
        setItemLoading(false);
      } catch (err) {
        console.error("Error fetching GRN item details:", err);
        setItemLoading(false);
      }
    },
    [userValue.unitId, state.selectedSource, state.selectedGrn]
  );

  const handlePurchaseAutoComplete = useCallback(
    (newValue: any, name: string) => {
      setErrors([]);
      setPoDataErrors({});
      switch (name) {
        case "source":
          if (
            newValue &&
            typeof newValue?.sourceName === "string" &&
            newValue?.sourceName.toLowerCase() === "manual"
          ) {
            dispatch({ type: "manual", payload: true });
          } else {
            dispatch({ type: "manual", payload: false });
          }
          dispatch({ type: "selectedSource", payload: newValue });
          dispatch({ type: "grnData", payload: [] });
          dispatch({ type: "selectedGrn", payload: null });
          dispatch({ type: "itemData", payload: [] });
          dispatch({ type: "selectedItem", payload: null });
          dispatch({ type: "itemDetails", payload: [] });
          break;

        case "grn":
          dispatch({ type: "selectedGrn", payload: newValue });
          dispatch({ type: "itemData", payload: [] });
          dispatch({ type: "selectedItem", payload: null });
          dispatch({ type: "itemDetails", payload: [] });

          if (newValue?.grnNo) {
            getGrnItems(newValue.grnNo);
          }
          break;

        case "items":
          dispatch({ type: "selectedItem", payload: newValue });
          dispatch({ type: "itemDetails", payload: [] });

          if (newValue?.grnSerialNo) {
            setItemLoading(true);
            getGrnItemDetails(newValue.grnSerialNo);
          }
          break;

        case "cost":
          dispatch({ type: "selectedAdditionalCost", payload: newValue });
          break;
      }
    },
    [getGrnItems, getGrnItemDetails]
  );

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: string
  ) => {
    if (field === "capitalisationData") {
      dispatch({ type: "capitalisationData", payload: e.target.value });
    } else {
      dispatch({ type: "putToUse", payload: e.target.value });
    }
  };

  useEffect(() => {
    getSource();
    getAdditionalCostTypes();
  }, [getSource]);

  useEffect(() => {
    if (userValue.unitId && state.selectedSource && !state.manual) {
      getGrnData();
    }
  }, [userValue.unitId, state.selectedSource, getGrnData]);

  return {
    state,
    handlePurchaseAutoComplete,
    errors,
    setErrors,
    handleChange,
    purchaseDispatch: dispatch,
    itemLoading,
  };
};
