import { Autocomplete, Box, Grid2 } from "@mui/material";
import { MuiInputField, MuiSwitch, MuiText } from "bsoft-base-elements";
import React from "react";
import { FileWithPath, useDropzone } from "react-dropzone";
import { FaTrashCan } from "react-icons/fa6";
import { HiOutlineUpload } from "react-icons/hi";
import { AssetState } from  "../../../../types/types";
import { useRecoilValue } from "recoil";
import { UserData } from "../../../../utils/atoms";
import Config from "../../../../utils/fam.api.json";
import { Apirequest } from "../../../../utils/lib";

interface AssetGeneralInformationProps {
  assetData: AssetState;
  handleAutoComplete: (newValue: any, name: string) => void;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  errors: string[];
  handleImageDrop?: (acceptedFiles: FileWithPath[], userValue: any) => void;
  isUploading?: boolean;
  loadingStates?: any;
}

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB in bytes
const ACCEPTED_IMAGE_TYPES = {
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
};

function AssetGeneralInformation(props: AssetGeneralInformationProps) {
  const userValue = useRecoilValue(UserData);
  const {
    assetData,
    handleAutoComplete,
    handleInputChange,
    errors,
    handleImageDrop,
    isUploading,
    loadingStates,
  } = props;

  const onDrop = async (
    acceptedFiles: FileWithPath[],
    rejectedFiles: any[]
  ) => {
    if (rejectedFiles.length > 0) {
      const errors = rejectedFiles[0].errors;
      if (errors.some((e: any) => e.code === "file-too-large")) {
        console.error("File is larger than 2MB");
        return;
      }
      if (errors.some((e: any) => e.code === "file-invalid-type")) {
        console.error("File type must be PNG, JPG or JPEG");
        return;
      }
      return;
    }

    if (acceptedFiles.length > 0) {
      handleImageDrop?.(acceptedFiles, userValue);
    }
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: ACCEPTED_IMAGE_TYPES,
    maxSize: MAX_FILE_SIZE,
    multiple: false,
  });

  const handleDelete = async () => {
    try {
      const { endpoint, method } = Config.AssetGeneral.DeleteImage;
      const payload = {
        assetPath: assetData.assetImage,
        companyName: userValue.companyName,
        unitName: userValue.unitName,
      };
      const result = await Apirequest(endpoint, method, payload, "fam");
      if (result.status === 200) {
        handleAutoComplete(null, "assetImage");
        handleAutoComplete(null, "assetImageFile");
        handleAutoComplete(null, "assetImageBase64");
      }
    } catch (err) {
      console.error("Image deletion failed:", err);
    }
  };

  return (
    <Grid2 container spacing={2}>
      <Grid2
        size={{ xs: 12, sm: 12, md: 8 }}
        borderRight={"1.5px solid #d8d8d8a1"}
        pr={2}
      >
        <Grid2 container spacing={2}>
          <Grid2 size={{ xs: 12, sm: 6, md: 4 }}>
            <MuiText variant="h6" pt={1} className="admin-label-title">
              Asset Group Name <span className="mandatory-sign">*</span>
            </MuiText>
            <Autocomplete
              disablePortal
              options={assetData.assetGroupData || []}
              fullWidth
              value={assetData.selectedAssetGroup}
              onChange={(event, newValue) => {
                handleAutoComplete(newValue, "assetGroup");
              }}
              getOptionLabel={(option) => option.groupName || ""}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              renderInput={(params) => (
                <MuiInputField
                  {...params}
                  size="small"
                  error={errors.includes("selectedAssetGroup")}
                  helperText={
                    errors.includes("selectedAssetGroup") &&
                    "please select asset group"
                  }
                />
              )}
            />
          </Grid2>
          <Grid2 size={{ xs: 12, sm: 6, md: 4 }}>
            <MuiText variant="h6" pt={1} className="admin-label-title">
              Asset Sub Group
            </MuiText>
            <Autocomplete
              disablePortal
              options={assetData.assetSubGroupData || []}
              fullWidth
              value={assetData.selectedAssetSubGroup}
              onChange={(event, newValue) => {
                handleAutoComplete(newValue, "assetSubGroup");
              }}
              getOptionLabel={(option) =>
                `${option.subGroupName} - ${option.code}` || ""
              }
              isOptionEqualToValue={(option, value) => option.id === value.id}
              renderInput={(params) => (
                <MuiInputField {...params} size="small" />
              )}
            />
          </Grid2>
          <Grid2 size={{ xs: 12, sm: 6, md: 4 }}>
            <MuiText variant="h6" pt={1} className="admin-label-title">
              Asset Category Name <span className="mandatory-sign">*</span>
            </MuiText>
            <Autocomplete
              disablePortal
              options={assetData.assetCategoryData || []}
              fullWidth
              value={assetData.selectedAssetCategory}
              onChange={(event, newValue) => {
                handleAutoComplete(newValue, "assetCategory");
              }}
              getOptionLabel={(option) => option.categoryName || ""}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              renderInput={(params) => (
                <MuiInputField
                  {...params}
                  size="small"
                  error={errors.includes("selectedAssetCategory")}
                  helperText={
                    errors.includes("selectedAssetCategory") &&
                    "please select asset category"
                  }
                />
              )}
            />
          </Grid2>
          <Grid2 size={{ xs: 12, sm: 6, md: 4 }}>
            <MuiText variant="h6" pt={1} className="admin-label-title">
              Asset Sub Category Name <span className="mandatory-sign">*</span>
            </MuiText>
            <Autocomplete
              disablePortal
              options={assetData.assetSubCategoryData || []}
              fullWidth
              value={assetData.selectedAssetSubCategory}
              onChange={(event, newValue) => {
                handleAutoComplete(newValue, "assetSubCategory");
              }}
              getOptionLabel={(option) => option.subCategoryName || ""}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              renderInput={(params) => (
                <MuiInputField
                  {...params}
                  size="small"
                  error={errors.includes("selectedAssetSubCategory")}
                  helperText={
                    errors.includes("selectedAssetSubCategory") &&
                    "please select asset sub category"
                  }
                />
              )}
            />
          </Grid2>
          <Grid2 size={{ xs: 12, sm: 6, md: 4 }}>
            <MuiText
              variant="h6"
              mb={"2px"}
              pt={1}
              className="admin-label-title"
            >
              Asset Name <span className="mandatory-sign">*</span>
            </MuiText>
            <MuiInputField
              fullWidth
              type="text"
              variant="outlined"
              size="small"
              name="assetName"
              autoComplete="off"
              value={assetData.assetName}
              onChange={handleInputChange}
              error={errors.includes("assetName")}
              helperText={
                errors.includes("assetName") && "please enter asset name"
              }
            />
          </Grid2>
          <Grid2 size={{ xs: 12, sm: 6, md: 4 }}>
            <MuiText
              variant="h6"
              mb={"2px"}
              pt={1}
              className="admin-label-title"
            >
              Asset Type <span className="mandatory-sign">*</span>
            </MuiText>
            <Autocomplete
              disablePortal
              options={assetData.assetTypeData || []}
              fullWidth
              value={assetData.selectedAssetType}
              onChange={(event, newValue) => {
                handleAutoComplete(newValue, "assetType");
              }}
              getOptionLabel={(option) => option.code || ""}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              renderInput={(params) => (
                <MuiInputField
                  {...params}
                  size="small"
                  error={errors.includes("selectedAssetType")}
                  helperText={
                    errors.includes("selectedAssetType") &&
                    "please select asset type"
                  }
                />
              )}
            />
          </Grid2>
          {assetData.selectedAssetType?.code === "Dependent Parent" && (
            <Grid2 size={{ xs: 12, sm: 6, md: 4 }}>
              <MuiText
                variant="h6"
                mb={"2px"}
                pt={1}
                className="admin-label-title"
              >
                Parent Asset
              </MuiText>
              <Autocomplete
                disablePortal
                options={assetData.parentAssetData || []}
                fullWidth
                value={assetData.selectedParentAsset}
                onChange={(event, newValue) => {
                  handleAutoComplete(newValue, "parentAsset");
                }}
                getOptionLabel={(option) => option.assetName || ""}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                renderInput={(params) => (
                  <MuiInputField {...params} size="small" />
                )}
              />
            </Grid2>
          )}
          <Grid2 size={{ xs: 12, sm: 6, md: 4 }}>
            <MuiText
              variant="h6"
              mb={"2px"}
              pt={1}
              className="admin-label-title"
            >
              Quantity <span className="mandatory-sign">*</span>
            </MuiText>
            <MuiInputField
              fullWidth
              type="number"
              variant="outlined"
              size="small"
              name="quantity"
              value={assetData.quantity}
              InputProps={{ inputProps: { min: 0 } }}
              onChange={handleInputChange}
              error={errors.includes("quantity")}
              helperText={
                errors.includes("quantity") && "please enter quantity"
              }
            />
          </Grid2>
          <Grid2 size={{ xs: 12, sm: 6, md: 4 }}>
            <MuiText
              variant="h6"
              mb={"2px"}
              pt={1}
              className="admin-label-title"
            >
              Unit of Measurement <i>(UOM)</i>{" "}
              <span className="mandatory-sign">*</span>
            </MuiText>
            <Autocomplete
              disablePortal
              options={assetData.uomData || []}
              fullWidth
              value={assetData.selectedUom}
              onChange={(event, newValue) => {
                handleAutoComplete(newValue, "uom");
              }}
              getOptionLabel={(option) => option.uomName || ""}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              renderInput={(params) => (
                <MuiInputField
                  {...params}
                  size="small"
                  error={errors.includes("selectedUom")}
                  helperText={
                    errors.includes("selectedUom") && "please select unit"
                  }
                />
              )}
            />
          </Grid2>
          <Grid2 size={{ xs: 12, sm: 6, md: 4 }}>
            <MuiText
              variant="h6"
              mb={"2px"}
              pt={1}
              className="admin-label-title"
            >
              Working Status Code
            </MuiText>
            <Autocomplete
              disablePortal
              options={assetData.workingStatusData || []}
              fullWidth
              value={assetData.selectedWorkingStatus}
              onChange={(event, newValue) => {
                handleAutoComplete(newValue, "workingStatus");
              }}
              getOptionLabel={(option) => option.code || ""}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              renderInput={(params) => (
                <MuiInputField {...params} size="small" />
              )}
            />
          </Grid2>
        </Grid2>
        <Grid2 container spacing={2} mt={1}>
          <Grid2 size={{ xs: 12, sm: 6, md: 8 }}>
            <MuiText
              variant="h6"
              mb={"2px"}
              pt={1}
              className="admin-label-title"
            >
              Description
            </MuiText>
            <MuiInputField
              fullWidth
              type="text"
              variant="outlined"
              size="small"
              rows={5}
              multiline
              name="description"
              value={assetData.description}
              onChange={handleInputChange}
            />
          </Grid2>
        </Grid2>
      </Grid2>
      <Grid2 size={{ xs: 12, sm: 12, md: 4 }}>
        <MuiText variant="h6" mb={"2px"} pt={1} className="admin-label-title">
          Asset Image <span className="mandatory-sign">*</span>
        </MuiText>
        <Box
          className="d-flex-center"
          gap={4}
          border={"2px solid #f1f1f1"}
          borderRadius={"6px"}
          py={2}
          mt={2}
          sx={{
            cursor: assetData.assetImageFile ? "not-allowed" : "pointer",
            background:
              "linear-gradient(180deg, #EFEFEF 0%, rgba(255, 255, 255, 0.78) 100%)",
            opacity: isUploading ? 0.5 : 1,
            pointerEvents: isUploading ? "none" : "",
          }}
          {...getRootProps()}
        >
          <input {...getInputProps()} disabled={!!assetData.assetImageFile} />
          <Box
            bgcolor={assetData.assetImageFile ? "transparent" : "#f1f1f1"}
            borderRadius={"50%"}
            width={50}
            height={50}
            className="d-grid-center"
            border={"1px solid #a5a5a5"}
          >
            {assetData.assetImageBase64 ? (
              !isUploading && (
                <img
                  src={`${assetData.assetImageBase64}`}
                  alt="Uploaded"
                  style={{
                    width: "100%",
                    height: "100%",
                    borderRadius: "50%",
                    overflow: "hidden",
                    objectFit: "cover",
                  }}
                />
              )
            ) : (
              <HiOutlineUpload color="#A5A5A5" fontSize={24} />
            )}
          </Box>
          <MuiText
            variant="h6"
            className="breadcrumb-parent-title"
            fontSize={15}
          >
            {assetData.assetImageFile
              ? "Delete to change asset image"
              : "Upload Asset Image"}
          </MuiText>
          {assetData.assetImageFile && (
            <FaTrashCan
              style={{ zIndex: 10 }}
              cursor={"pointer"}
              color="red"
              onClick={handleDelete}
            />
          )}
        </Box>
        <MuiText
          variant="caption"
          color="textSecondary"
          sx={{ display: "block", mt: 1, fontSize: 12 }}
        >
          Allowed formats: PNG, JPG, JPEG (max 2MB)
        </MuiText>
        {errors.includes("assetImage") && (
          <MuiText
            variant="caption"
            color="red"
            sx={{ display: "block", mt: 1, fontSize: 12 }}
          >
            Please upload valid image
          </MuiText>
        )}

        <Box my={3}>
          <MuiSwitch label="Non Deprecated Asset?" />
        </Box>
      </Grid2>
    </Grid2>
  );
}

export default AssetGeneralInformation;
