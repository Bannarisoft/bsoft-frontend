"use client";

import { MuiButton, OldPasswordForm } from "bsoft-base-elements";
import React, { useState } from "react";
import Swal from "sweetalert2";
import { Apirequest } from "../../../utils/lib";
import Config from "../../../../src/utils/config.api.json";
import { useRecoilValue } from "recoil";
import { UserData } from "../../../utils/atoms";
import { Box, IconButton, Tooltip } from "@mui/material";
import ErrorModal from "../../../components/molecules/Master/Role/ErrorModal";
import { IoIosArrowBack, IoMdClose } from "react-icons/io";
import { useRouter } from "next/navigation";

function page() {
  const REGEX = /^(?=.*[A-Z])(?=.*[\W_])(?=.{8,}).*$/;
  const [viewPassword, setViewPassword] = useState({
    newPassword: false,
    oldPassword: false,
  });
  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [errorMessages, setErrorMessages] = useState<string[]>([]);
  const [input, setInput] = useState({
    newPassword: "",
    oldPassword: "",
  });

  const router = useRouter();

  const [error, setError] = useState<string[]>([]);
  const userValue = useRecoilValue(UserData);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const checkPassword = REGEX.test(input.oldPassword);
    const checkNewPassword = REGEX.test(input.newPassword);

    let temp: string[] = [];
    Object.entries(input).forEach(([key, value]) => {
      if (key === "oldPassword" && !checkPassword) {
        temp.push(key);
      } else if (key === "newPassword" && !checkNewPassword) {
        temp.push(key);
      }
    });

    setError(temp);
    if (temp.length === 0) FirstTimePasswordChange();
  };

  const FirstTimePasswordChange = async () => {
    try {
      const body = {
        userId: userValue.userId,
        userName: userValue.name,
        oldPassword: input.oldPassword,
        newPassword: input.newPassword,
      };
      const { endpoint, method } = Config.AuthLogin.ChangePassword;
      const result = await Apirequest(endpoint, method, body);
      if (result.data.statusCode !== 200) {
        setErrorMessages([result.data.errors]);
        setErrorModalOpen(true);
      } else {
        Swal.fire({
          title: result.data.message.message,
          icon: "success",
          confirmButtonText: "okay",
          customClass: {
            title: "custom-title",
          },
        }).then((res) => {
          if (res.isConfirmed) {
            console.log("sucess");
          }
        });
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setError([]);
    setInput((prev) => ({ ...prev, [name]: value }));
  };

  const handleViewPassword = (val: string) => {
    if (val === "newPassword") {
      setViewPassword({
        ...viewPassword,
        newPassword: !viewPassword.newPassword,
      });
    } else {
      setViewPassword({
        ...viewPassword,
        oldPassword: !viewPassword.oldPassword,
      });
    }
  };

  return (
    <>
      <Box display={"grid"} sx={{ placeItems: "center" }} m={"auto"}>
        <Box
          bgcolor={"#fff"}
          p={3}
          borderRadius={"8px"}
          width={"40rem"}
          position={"relative"}
        >
          <OldPasswordForm
            handleSubmit={handleSubmit}
            handleChange={handleChange}
            handleViewPassword={handleViewPassword}
            input={input}
            error={error}
            viewPassword={viewPassword}
          />
          <Tooltip title="Back">
            <IconButton
              onClick={() => router.back()}
              sx={{ position: "absolute", top: 10, right: 10 }}
            >
              <IoMdClose />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      <ErrorModal
        open={errorModalOpen}
        onClose={() => setErrorModalOpen(false)}
        errors={errorMessages}
      />
    </>
  );
}

export default page;
