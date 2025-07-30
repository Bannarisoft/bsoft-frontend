import { useReducer, useCallback, useEffect, useState } from "react";
import Config from "../../../../utils/config.api.json";
import FamConfig from "../../../../utils/fam.api.json";
import { Apirequest } from "../../../../utils/lib";
import dayjs from "dayjs";

type WarrantyAction =
  | { type: "SET_ALL"; payload: Partial<WarrantyState> }
  | { type: string; payload: any };

export interface WarrantyState {
  startDate: string;
  endDate: string;
  warrantyPeriod: any;
  warrantyType: string;
  warrantyProvider: string;
  mobile: string;
  contactPerson: string;
  termsAndCondition: string;
  email: string;
  status: number;
  country: string;
  state: string;
  city: string;
  pincode: string;
  address1: string;
  address2: string;
  centrePhone: string;
  centreEmail: string;
  centreContactPerson: string;
  claimProcess: string;
  serviceLastClaimDate: string;
  warrantyClaimStatus: any;
  warrantyTypeData: any[];
  countryData: any[];
  stateData: any[];
  cityData: any[];
  warrantyClaimData: any[];
}

const initialState: WarrantyState = {
  startDate: "",
  endDate: "",
  warrantyPeriod: 0,
  warrantyType: "",
  warrantyProvider: "",
  mobile: "",
  contactPerson: "",
  termsAndCondition: "",
  email: "",
  status: 0,
  country: "",
  state: "",
  city: "",
  pincode: "",
  address1: "",
  address2: "",
  centrePhone: "",
  centreEmail: "",
  centreContactPerson: "",
  claimProcess: "",
  serviceLastClaimDate: "",
  warrantyClaimStatus: "",
  warrantyTypeData: [],
  countryData: [],
  stateData: [],
  cityData: [],
  warrantyClaimData: [],
};

function warrantyReducer(
  state: WarrantyState,
  action: WarrantyAction
): WarrantyState {
  switch (action.type) {
    case "SET_ALL":
      return {
        ...state,
        ...action.payload,
      };
    default:
      return {
        ...state,
        [action.type]: action.payload,
      };
  }
}

export const useAssetWarranty = () => {
  const [state, dispatch] = useReducer(warrantyReducer, initialState);
  const [errors, setErrors] = useState<string[]>([]);

  const GetWarrantyType = useCallback(async () => {
    try {
      const { endpoint, method } = FamConfig.AssetWarranty.WarrantyType;
      const response = await Apirequest(endpoint, method, null, "fam").then(
        (res) => res?.data?.data
      );
      dispatch({ type: "warrantyTypeData", payload: response });
    } catch (err) {
      console.error("Error fetching warranty types:", err);
    }
  }, []);

  const GetWarrantyClaimStatus = useCallback(async () => {
    try {
      const { endpoint, method } = FamConfig.AssetWarranty.WarrantyClaimStatus;
      const response = await Apirequest(endpoint, method, null, "fam").then(
        (res) => res?.data?.data
      );
      dispatch({ type: "warrantyClaimData", payload: response });
    } catch (err) {
      console.error("Error fetching warranty types:", err);
    }
  }, []);

  const GetCountryList = useCallback(async () => {
    try {
      const { endpoint, method } = Config.Countries.getCountry;
      const result = await Apirequest(endpoint, method);
      dispatch({ type: "countryData", payload: result?.data?.data });
    } catch (err) {
      console.error("Error fetching countries:", err);
      dispatch({ type: "countryData", payload: [] });
    }
  }, []);

  const GetState = useCallback(async (id: number) => {
    try {
      const { endpoint, method } = Config.State.getById;
      const result = await Apirequest(
        endpoint.replace(`{countryId}`, id ? id.toString() : ""),
        method
      ).then((res) => res.data);
      dispatch({ type: "stateData", payload: result?.data?.data });
    } catch (err) {
      console.error("Error fetching states:", err);
      dispatch({ type: "stateData", payload: [] });
    }
  }, []);

  const GetCity = useCallback(async (id: number) => {
    try {
      const { endpoint, method } = Config.City.getById;
      const result = await Apirequest(
        endpoint.replace(`{stateId}`, id ? id.toString() : ""),
        method
      ).then((res) => res.data);
      dispatch({ type: "cityData", payload: result?.data?.data });
    } catch (err) {
      console.error("Error fetching cities:", err);
      dispatch({ type: "cityData", payload: [] });
    }
  }, []);

  const handleAutocomplete = useCallback((newValue: any, field: string) => {
    setErrors([]);
    if (field === "country") {
      dispatch({ type: "country", payload: newValue });
      GetState(newValue?.id);
    } else if (field === "state") {
      dispatch({ type: "state", payload: newValue });
      GetCity(newValue?.id);
    } else {
      dispatch({
        type: field as WarrantyAction["type"],
        payload: newValue,
      });
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let { name, value } = e.target;
    setErrors([]);

    if (name === "warrantyPeriod") {
      const periodInMonths = parseInt(value) || 0;
      dispatch({ type: "warrantyPeriod", payload: value });

      if (state.startDate && dayjs(state.startDate).isValid()) {
        const endDate = dayjs(state.startDate).add(periodInMonths, "month");
        dispatch({ type: "endDate", payload: endDate });
      }
      return;
    }

    dispatch({ type: name as WarrantyAction["type"], payload: value });
  };

  const handleDate = (value: dayjs.Dayjs | null, field?: string) => {
    setErrors([]);

    switch (field) {
      case "startDate": {
        const periodInMonths = parseInt(state.warrantyPeriod) || 0;
        const endDate = value
          ? dayjs(value).add(periodInMonths, "month")
          : null;

        dispatch({
          type: "SET_ALL",
          payload: {
            startDate: value ? dayjs(value).format("YYYY-MM-DD") : "",
            endDate: endDate ? endDate.format("YYYY-MM-DD") : "",
          },
        });
        break;
      }
      case "endDate":
        dispatch({
          type: "endDate",
          payload: value ? dayjs(value).format("YYYY-MM-DD") : "",
        });
        break;
      case "lastWarrantyDate":
        dispatch({
          type: "lastWarrantyDate",
          payload: value ? dayjs(value).format("YYYY-MM-DD") : "",
        });
        break;
    }
  };

  useEffect(() => {
    GetWarrantyType();
    GetCountryList();
    GetWarrantyClaimStatus();
  }, [GetWarrantyType, GetCountryList, GetWarrantyClaimStatus]);

  return {
    warrantyInputs: state,
    handleAutocomplete,
    handleChange,
    handleDate,
    errors,
    setErrors,
    setWarrantyInputs: dispatch,
    GetState,
    GetCity,
  };
};
