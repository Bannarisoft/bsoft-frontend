import { useReducer, useCallback, useEffect, useState } from "react";
import { AssetActionType, AssetState } from "../../../../types";
import {
  AssetCategory,
  AssetGroup,
  AssetSubCategory,
  AssetType,
  ParentAsset,
  UOM,
  WorkingStatus,
} from "../../../../types";
import { NextResponse } from "next/server";
import { Apirequest } from "../../../../utils/lib";
import Config from "../../../../utils/fam.api.json";
import { FileWithPath } from "react-dropzone/.";
import { useRecoilValue } from "recoil";
import { UserData } from "../../../../utils/atoms";

export const assetService = {
  async getAssetGroups() {
    const { endpoint, method } = Config.AssetGroup.AssetGroupName;
    const response = await Apirequest<{ data: AssetGroup[] }>(
      endpoint,
      method,
      null,
      "fam"
    ).then((res: any) => res.data);
    if (response instanceof NextResponse) {
      throw new Error("Failed to fetch data");
    }
    return response.data;
  },

  async getAssetSubGroup(id: number | string) {
    const { endpoint, method } = Config.AssetGroup.GetSubGroup;
    const response = await Apirequest<{ data: AssetGroup[] }>(
      endpoint.replace("{id}", id.toString()),
      method,
      null,
      "fam"
    ).then((res: any) => res.data);
    if (response instanceof NextResponse) {
      throw new Error("Failed to fetch data");
    }
    return response.data;
  },

  async getAssetCategories(id: number) {
    const { endpoint, method } = Config.AssetInfo.category;
    const response = await Apirequest<{ data: AssetCategory[] }>(
      endpoint.replace("{id}", id.toString()),
      method,
      null,
      "fam"
    ).then((res: any) => res.data);

    if (response instanceof NextResponse) {
      throw new Error("Failed to fetch data");
    }
    return response.data;
  },

  async getAssetSubCategories(id: number) {
    const { endpoint, method } = Config.AssetInfo.subCategory;
    const response = await Apirequest<{ data: AssetSubCategory[] }>(
      endpoint.replace("{id}", id.toString()),
      method,
      null,
      "fam"
    ).then((res: any) => res.data);
    if (response instanceof NextResponse) {
      throw new Error("Failed to fetch data");
    }
    return response.data;
  },

  async getUOMs() {
    const { endpoint, method } = Config.Uom.AssetUomName;
    const response = await Apirequest<{ data: UOM[] }>(
      endpoint,
      method,
      null,
      "fam"
    ).then((res: any) => res.data);
    if (response instanceof NextResponse) {
      throw new Error("Failed to fetch data");
    }
    return response.data;
  },

  async getWorkingStatuses() {
    const { endpoint, method } = Config.AssetGeneral.WorkingStatus;
    const response = await Apirequest<{ data: WorkingStatus[] }>(
      endpoint,
      method,
      null,
      "fam"
    ).then((res: any) => res.data);
    if (response instanceof NextResponse) {
      throw new Error("Failed to fetch data");
    }
    return response.data;
  },

  async getAssetTypes() {
    const { endpoint, method } = Config.AssetGeneral.AssetType;
    const response = await Apirequest<{ data: AssetType[] }>(
      endpoint,
      method,
      null,
      "fam"
    ).then((res: any) => res.data);
    if (response instanceof NextResponse) {
      throw new Error("Failed to fetch data");
    }
    return response.data;
  },

  async getParentAssets(value: string) {
    const { endpoint, method } = Config.AssetGeneral.ByName;
    const response = await Apirequest<{ data: ParentAsset[] }>(
      endpoint.replace("{type}", value),
      method,
      null,
      "fam"
    ).then((res: any) => res.data);
    if (response instanceof NextResponse) {
      throw new Error("Failed to fetch data");
    }
    return response.data;
  },
};

const initialState: AssetState = {
  selectedAssetGroup: null,
  assetGroupData: [],
  assetSubGroupData: [],
  selectedAssetSubGroup: null as any,
  assetCategoryData: [],
  selectedAssetCategory: null,
  assetSubCategoryData: [],
  selectedAssetSubCategory: null,
  assetName: "",
  uomData: [],
  selectedUom: null,
  workingStatusData: [],
  selectedWorkingStatus: null,
  assetTypeData: [],
  selectedAssetType: null,
  parentAssetData: [],
  selectedParentAsset: null,
  quantity: "",
  description: "",
  nonDepreciated: 1,
  assetImage: null,
  assetImageFile: null,
  assetImageBase64: null,
};

function assetReducer(state: AssetState, action: AssetActionType): AssetState {
  return {
    ...state,
    [action.type]: action.payload,
  };
}

export function useAssetState() {
  const [state, dispatch] = useReducer(assetReducer, initialState);
  const [errors, setErrors] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const userValue = useRecoilValue(UserData);

  const handleAutoComplete = useCallback(
    async (newValue: any, name: string) => {
      setErrors([]);
      const typeMap: { [key: string]: keyof AssetState } = {
        assetGroup: "selectedAssetGroup",
        assetCategory: "selectedAssetCategory",
        assetSubCategory: "selectedAssetSubCategory",
        uom: "selectedUom",
        workingStatus: "selectedWorkingStatus",
        assetType: "selectedAssetType",
        parentAsset: "selectedParentAsset",
        assetImage: "assetImage",
        assetImageFile: "assetImageFile",
        assetImageBase64: "assetImageBase64",
        assetSubGroup: "selectedAssetSubGroup",
      };

      const actionType = typeMap[name];

      if (!newValue) {
        if (actionType === "selectedAssetGroup") {
          dispatch({ type: "assetCategoryData", payload: [] });
          dispatch({ type: "selectedAssetCategory", payload: null });
          dispatch({ type: "assetSubCategoryData", payload: [] });
          dispatch({ type: "selectedAssetSubCategory", payload: null });
        } else if (actionType === "selectedAssetCategory") {
          dispatch({ type: "assetSubCategoryData", payload: [] });
          dispatch({ type: "selectedAssetSubCategory", payload: null });
        } else if (actionType === "selectedAssetType") {
          dispatch({ type: "parentAssetData", payload: [] });
          dispatch({ type: "selectedParentAsset", payload: null });
        }

        if (actionType) {
          dispatch({ type: actionType, payload: null } as AssetActionType);
        }
        return;
      }

      if (actionType === "selectedAssetGroup") {
        const getCategory = await assetService.getAssetCategories(newValue.id);
        const getSubGroup = await assetService.getAssetSubGroup(newValue.id);
        dispatch({ type: "assetCategoryData", payload: getCategory });
        dispatch({ type: "assetSubGroupData", payload: getSubGroup });
      } else if (actionType === "selectedAssetCategory") {
        const getSubCategory = await assetService.getAssetSubCategories(
          newValue.id
        );
        dispatch({ type: "assetSubCategoryData", payload: getSubCategory });
      } else if (actionType === "selectedAssetType") {
        const getParent = await assetService.getParentAssets(newValue.code);
        dispatch({ type: "parentAssetData", payload: getParent });
      }
      if (actionType) {
        dispatch({ type: actionType, payload: newValue });
      }
    },
    []
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setErrors([]);
      let { name, value } = e.target;
      dispatch({
        type: name as keyof AssetState,
        payload: value,
      } as AssetActionType);
    },
    []
  );

  const fetchAssetData = useCallback(async () => {
    try {
      const [assetGroups, uoms, workingStatuses, assetTypes] =
        await Promise.all([
          assetService.getAssetGroups(),
          assetService.getUOMs(),
          assetService.getWorkingStatuses(),
          assetService.getAssetTypes(),
        ]);
      dispatch({ type: "assetGroupData", payload: assetGroups });
      dispatch({ type: "uomData", payload: uoms });
      dispatch({ type: "workingStatusData", payload: workingStatuses });
      dispatch({ type: "assetTypeData", payload: assetTypes });
      // dispatch({ type: "parentAssetData", payload: parentAssets });
    } catch (error) {
      console.error("Error fetching asset data:", error);
    }
  }, []);

  useEffect(() => {
    fetchAssetData();
  }, [fetchAssetData]);

  const handleImageUpload = useCallback(async (formData: FormData) => {
    setErrors([]);
    try {
      const { endpoint, method } = Config.AssetGeneral.ImageUpload;
      const result = await Apirequest(endpoint, method, formData, "fam").then(
        (res) => res.data
      );

      if (result.statusCode === 200 || result.statusCode === 201) {
        dispatch({
          type: "assetImage",
          payload: result.data.assetImage,
        });

        const file = formData.get("file") as File;
        if (file) {
          dispatch({
            type: "assetImageFile",
            payload: file,
          });
        }
      }
    } catch (err) {
      console.error("Image upload failed:", err);
      dispatch({ type: "assetImage", payload: null });
      dispatch({ type: "assetImageFile", payload: null });
      dispatch({ type: "assetImageBase64", payload: null });
    } finally {
      setIsUploading(false);
    }
  }, []);

  const convertFileToBinary = useCallback(
    (file: File, userValue: any) => {
      setIsUploading(true);

      // Create base64 preview immediately
      const base64Reader = new FileReader();
      base64Reader.onloadend = () => {
        dispatch({
          type: "assetImageBase64",
          payload: base64Reader.result,
        });
      };
      base64Reader.readAsDataURL(file);

      // Handle file upload
      const uploadReader = new FileReader();
      uploadReader.onloadend = () => {
        const binaryData = uploadReader.result as ArrayBuffer;
        const formData = new FormData();
        formData.append("file", new Blob([binaryData]), file.name);
        formData.append("CompanyName", userValue.companyName);
        formData.append("UnitName", userValue.unitName);
        handleImageUpload(formData);
      };
      uploadReader.readAsArrayBuffer(file);
    },
    [handleImageUpload]
  );

  const handleImageDrop = useCallback(
    (acceptedFiles: FileWithPath[], userValue: any) => {
      if (acceptedFiles.length > 0) {
        const image = acceptedFiles[0] as File;
        dispatch({ type: "assetImageFile", payload: image });
        convertFileToBinary(image, userValue);
      }
    },
    [convertFileToBinary]
  );

  return {
    state,
    handleAutoComplete,
    handleInputChange,
    errors,
    setErrors,
    handleImageDrop,
    isUploading,
    dispatch,
  };
}
