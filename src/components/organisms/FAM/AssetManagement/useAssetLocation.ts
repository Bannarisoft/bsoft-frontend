import { useReducer, useCallback, useEffect, useState } from "react";
import { Apirequest } from "../../../../utils/lib";
import Config from "../../../../utils/config.api.json";
import FamConfig from "../../../../utils/fam.api.json";
import { useRecoilValue } from "recoil";
import { UserData } from "../../../../utils/atoms";

interface LocationState {
  departmentData: any[];
  selectedDepartment: any;
  locationData: any[];
  selectedLocation: any;
  subLocationData: any[];
  selectedSubLocation: any;
  custodianData: any[];
  selectedCustodian: any;
  selectedUser: any;
}

interface LocationAction {
  type: keyof LocationState;
  payload: any;
}

const initialState: LocationState = {
  departmentData: [],
  selectedDepartment: null,
  locationData: [],
  selectedLocation: null,
  subLocationData: [],
  selectedSubLocation: null,
  custodianData: [],
  selectedCustodian: null,
  selectedUser: null,
};

function locationReducer(
  state: LocationState,
  action: LocationAction
): LocationState {
  return {
    ...state,
    [action.type]: action.payload,
  };
}

export function useAssetLocation() {
  const [locationState, dispatch] = useReducer(locationReducer, initialState);
  const [errors, setErrors] = useState<string[]>([]);
  const userValue = useRecoilValue(UserData);

  const getDepartment = useCallback(async () => {
    try {
      const { endpoint, method } = Config.Department.withoutControl;
      const response = await Apirequest(endpoint, method, null);
      dispatch({ type: "departmentData", payload: response.data.data });
    } catch (err) {
      console.error("Error fetching department data:", err);
    }
  }, []);

  const getLocation = useCallback(async () => {
    try {
      const { endpoint, method } = FamConfig.AssetLocation.location;
      const response = await Apirequest(endpoint, method, null, "fam");
      dispatch({ type: "locationData", payload: response.data.data });
    } catch (err) {
      console.error("Error fetching location data:", err);
    }
  }, []);

  const getCustodian = useCallback(async (unitId: string) => {
    try {
      const { endpoint, method } = FamConfig.AssetLocation.custodian;
      const response = await Apirequest(
        endpoint.replace("{id}", unitId.toString()),
        method,
        null,
        "fam"
      );
      dispatch({ type: "custodianData", payload: response.data.data });
    } catch (err) {
      console.error("Error fetching custodian data:", err);
    }
  }, []);

  const getSubLocation = useCallback(async (locationId: string) => {
    try {
      const { endpoint, method } = FamConfig.AssetLocation.subLocation;
      const response = await Apirequest(
        endpoint.replace("{id}", locationId),
        method,
        null,
        "fam"
      );
      dispatch({ type: "subLocationData", payload: response.data.data });
    } catch (err) {
      console.error("Error fetching sublocation data:", err);
    }
  }, []);

  const handleLocationAutoComplete = useCallback(
    (newValue: any, name: string) => {
      setErrors([]);
      switch (name) {
        case "dept":
          dispatch({ type: "selectedDepartment", payload: newValue });
          break;
        case "location":
          dispatch({ type: "selectedLocation", payload: newValue });
          if (newValue?.id) {
            getSubLocation(newValue.id);
          }
          break;
        case "subLocation":
          dispatch({ type: "selectedSubLocation", payload: newValue });
          break;
        case "custodian":
          dispatch({ type: "selectedCustodian", payload: newValue });
          break;
        case "user":
          dispatch({ type: "selectedUser", payload: newValue });
          break;
      }
    },
    [getSubLocation]
  );

  useEffect(() => {
    getDepartment();
    getLocation();
  }, [getDepartment, getLocation]);

  useEffect(() => {
    if (userValue.oldUnitId) {
      getCustodian(userValue.oldUnitId.toString());
    }
  }, [userValue.oldUnitId]);

  return {
    locationState,
    handleLocationAutoComplete,
    errors,
    setErrors,
    locationDispatch: dispatch,
  };
}
