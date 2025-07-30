"use client";
import { Box, Grid2, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import IconBreadcrumbs from "../../../molecules/AdminLayout/BreadCrumbs";
import { MuiSwitch, MuiText } from "bsoft-base-elements";
import { HiOutlineUpload } from "react-icons/hi";
import { FaTrashCan } from "react-icons/fa6";
import { useDropzone } from "react-dropzone";
import { useRecoilValue } from "recoil";
import { UserData } from "../../../../utils/atoms";
import { Apirequest } from "../../../../utils/lib";
import Config from "../../../../utils/fam.api.json";
import Image from "next/image";
import CreateGif from "../../../../../public/assets/images/create-animation.gif";
import ErrorModal from "../../../molecules/Master/Role/ErrorModal";
import toast from "react-hot-toast";
function AssetImportPage() {
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [userInput, setUserInput] = useState({ companyId: "", unitId: "" });
  const [loading, setLoading] = React.useState(false);

  const userValue = useRecoilValue(UserData);
  useEffect(() => {
    if (userValue) {
      setUserInput((prevState) => ({
        ...prevState,
        companyId:
          typeof userValue.companyId === "string" &&
          (userValue.companyId.startsWith("{") ||
            userValue.companyId.startsWith("["))
            ? JSON.parse(userValue.companyId)?.[0]?.companyId ??
              prevState.companyId
            : userValue.companyId ?? prevState.companyId,
        unitId:
          typeof userValue.unitId === "string" &&
          (userValue.unitId.startsWith("{") || userValue.unitId.startsWith("["))
            ? JSON.parse(userValue.unitId)?.[0]?.unitId ?? prevState.unitId
            : userValue.unitId ?? prevState.unitId,
      }));
    }
  }, [userValue]);
  const handleDelete = () => {
    setExcelFile(null);
    setErrors([]);
  };
  const handleFileUpload = async (file: any) => {
    if (!file || !userInput.companyId || !userInput.unitId) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("companyId", userInput.companyId);
    formData.append("unitId", userInput.unitId);
    setLoading(true);
    try {
      const { endpoint, method } = Config.AssetMasterGeneral.ExelUpload;
      const response = await Apirequest(endpoint, method, formData, "fam").then(
        (res) => res.data
      );
      setLoading(false);
      if (response.statusCode === 200) {
        toast.success(response.message);
      } else {
        toast.error(response.message);
      }
      setExcelFile(null);
    } catch (err) {
      console.error("Upload failed:", err);
    }
  };
  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
        ".xlsx",
      ],
      "application/vnd.ms-excel": [".xls"],
    },
    multiple: false,
    onDrop: async (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (!file) return;

      const isExcel =
        file.type ===
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
        file.type === "application/vnd.ms-excel";

      if (!isExcel) {
        setErrors(["excelFile"]);
        return;
      }

      setErrors([]);
      setExcelFile(file);
      await handleFileUpload(file);
    },
  });

  return (
    <Box>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        px={3}
        py={2}
        bgcolor="#fff"
        borderBottom="1px solid #eee"
      >
        <Box>
          <IconBreadcrumbs
            parent={"Asset Management"}
            child={"Asset Import"}
            path=""
          />
        </Box>
      </Box>

      <Box
        minHeight="80vh"
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        px={2}
        sx={{
          background: "rgba(58, 180, 197, 0.2)",
        }}
      >
        <Grid2
          size={12}
          mt={3}
          display="flex"
          justifyContent="center"
          alignItems="center"
        >
          <Grid2
            size={6}
            container
            justifyContent="center"
            alignItems="center"
            borderRadius="20px"
            py={4}
            px={3}
            sx={{
              cursor: excelFile ? "not-allowed" : "pointer",
              backdropFilter: "blur(10px)",
              background: "rgba(255, 255, 255, 0.2)",
              boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
              border: "1px solid rgba(255, 255, 255, 0.18)",
              color: "white",
              transition: "all 0.3s ease",
              "&:hover": {
                transform: excelFile ? "none" : "scale(1.02)",
              },
            }}
            {...getRootProps()}
          >
            <input
              {...getInputProps()}
              disabled={!!excelFile}
              accept=".xls, .xlsx, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            />

            <Box
              bgcolor={excelFile ? "transparent" : "#ffffff"}
              borderRadius="50%"
              width={100}
              height={100}
              className="d-grid-center"
              border="6px solid #257d97"
              display="flex"
              justifyContent="center"
              alignItems="center"
              sx={{ boxShadow: "0 0 10px rgba(0,0,0,0.2)" }}
            >
              <HiOutlineUpload color="#257d97" fontSize={32} />
            </Box>

            <MuiText
              variant="h6"
              className="breadcrumb-parent-title"
              fontSize={16}
              color="black"
              mt={2}
              pl={3}
            >
              {excelFile ? "Delete to change Excel file" : "Upload Excel file"}
            </MuiText>
          </Grid2>
        </Grid2>

        <Grid2
          size={12}
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
          mt={2}
        >
          {excelFile && (
            <FaTrashCan
              style={{ zIndex: 10 }}
              cursor="pointer"
              color="red"
              size={20}
              onClick={handleDelete}
            />
          )}
          <MuiText
            variant="caption"
            sx={{
              mt: 1,
              fontSize: 13,
              color: "#444",
            }}
          >
            📁 Allowed formats: XLS, XLSX (max 2MB)
          </MuiText>

          {errors.includes("excelFile") && (
            <MuiText variant="caption" color="red" sx={{ mt: 1, fontSize: 13 }}>
              ❗ Please upload a valid Excel file
            </MuiText>
          )}
        </Grid2>
      </Box>

      {loading && (
        <Box
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(255, 255, 255, 0.8)",
            backdropFilter: "blur(3px)",
            zIndex: 1200,
            transition: "all 0.3s ease-in-out",
          }}
        >
          <Box
            sx={{
              position: "relative",
              width: 400,
              height: 400,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              animation: "pulse 2s infinite ease-in-out",
              "@keyframes pulse": {
                "0%": { transform: "scale(0.95)" },
                "50%": { transform: "scale(1)" },
                "100%": { transform: "scale(0.95)" },
              },
            }}
          >
            {/* <Image src={CreateGif} alt="Loading..." /> */}
            <Image src={CreateGif} alt="Loading..." />
            <Typography
              variant="h6"
              color="#107869"
              sx={{
                mt: 3,
                fontWeight: 600,
                animation: "fadeInOut 1.5s infinite ease-in-out",
                "@keyframes fadeInOut": {
                  "0%": { opacity: 0.6 },
                  "50%": { opacity: 1 },
                  "100%": { opacity: 0.6 },
                },
              }}
            >
              Importing asset...
            </Typography>
          </Box>
        </Box>
      )}
    </Box>
  );
}

export default AssetImportPage;
