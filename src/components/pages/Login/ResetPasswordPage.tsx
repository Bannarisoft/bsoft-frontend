"use client";

import { Box } from "@mui/material";
import React, { useEffect, useState } from "react";
import LoginTemplate from "../../templates/LoginTemplate";
import { ResetPasswordForm } from "bsoft-base-elements";
import { Apirequest, tokenDecode } from "../../../utils/lib";
import Config from "../../../../src/utils/config.api.json";
import Swal from "sweetalert2";
import Cookies from "js-cookie";
import { useRecoilValue } from "recoil";
import { useRouter } from "next/navigation";
import { UserData } from "../../../utils/atoms";

function ResetPasswordPage() {
  const REGEX = /^(?=.*[A-Z])(?=.*[\W_])(?=.{8,}).*$/;

  const [viewPassword, setViewPassword] = useState({
    newPassword: false,
    confirmPassword: false,
  });

  const [input, setInput] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  const [checked, setChecked] = useState<boolean>(false);
  const [error, setError] = useState<string[]>([]);
  const router = useRouter();
  const userValue = useRecoilValue(UserData);
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    userId: "",
    companyId: "",
  });

  const token = Cookies.get("bsoft");
  const FetchUserData = () => {
    const decoded = tokenDecode(token || "") ?? {};
    setUserData({
      ...userData,
      name: decoded?.unique_name,
      email: decoded?.email,
      userId: decoded?.nameid,
      companyId: decoded?.companyId,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const checkPassword = REGEX.test(input.newPassword);

    let temp: string[] = [];
    Object.entries(input).forEach(([key, value]) => {
      if (key === "newPassword" && !checkPassword) {
        temp.push(key);
      } else if (key === "confirmPassword" && value !== input.newPassword) {
        temp.push(key);
      }
    });
    setError(temp);
    if (temp.length === 0) FirstTimePasswordChange();
  };

  const FirstTimePasswordChange = async () => {
    try {
      const body = {
        userId: userData?.userId,
        userName: userData?.name,
        password: input.newPassword,
      };
      const { endpoint, method } = Config.AuthLogin.FirstTimeLogin;
      const result = await Apirequest(endpoint, method, body);
      if (result.data.statusCode !== 200) {
        Swal.fire({
          title: result.data.message,
          icon: "error",
          denyButtonText: "Okay",
          customClass: {
            title: "custom-title",
            confirmButton: "custom-button",
          },
        });
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
            router.push("/choose-unit");
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

  useEffect(() => {
    FetchUserData();
  }, []);

  const handleViewPassword = (val: string) => {
    if (val === "newPassword") {
      setViewPassword({
        ...viewPassword,
        newPassword: !viewPassword.newPassword,
      });
    } else {
      setViewPassword({
        ...viewPassword,
        confirmPassword: !viewPassword.confirmPassword,
      });
    }
  };

  return (
    <Box
      component={"div"}
      className="d-grid-center login-page-wrapper"
      sx={{
        backgroundImage: "url(/assets/images/login-bg.png)",
      }}
    >
      <LoginTemplate>
        <ResetPasswordForm
          handleSubmit={handleSubmit}
          handleChange={handleChange}
          handleViewPassword={handleViewPassword}
          input={input}
          error={error}
          viewPassword={viewPassword}
        />
      </LoginTemplate>
    </Box>
  );
}

export default ResetPasswordPage;
