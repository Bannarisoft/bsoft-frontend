import React, { useEffect, useState } from "react";
import TextComponent from "../../atoms/Text";
import InputComponent from "../../atoms/Input";
import ButtonComponent from "../../atoms/Button";
import { Box, InputAdornment, LinearProgress } from "@mui/material";
import Config from "../../../../src/utils/config.api.json";
import {
  Apirequest,
  emailTemplate,
  isSubmitting,
  startLoading,
  stopLoading,
} from "../../../utils/lib";
import LoginResponsePopUp from "./LoginResponsePopUp";
import { MuiOtpInput } from "mui-one-time-password-input";
import { useRouter } from "next/navigation";
import NavigationLink from "../../atoms/NavigationLink";
import Swal from "sweetalert2";
import { IoEyeOffOutline } from "react-icons/io5";
import { FaRegEye } from "react-icons/fa6";
import { MuiButton, MuiInputField, MuiText } from "bsoft-base-elements";
import axios from "axios";
import ErrorModal from "../Master/Role/ErrorModal";
import toast from "react-hot-toast";

const ForgotPasswordForm = () => {
  const [username, setUsername] = React.useState<string>("");
  const [password, setPassword] = React.useState<string>("");
  const [error, setError] = React.useState<any>([]);
  const [errorModalOpen, setErrorModalOpen] = React.useState(false);
  const [errorMessages, setErrorMessages] = React.useState<string[]>([]);
  const [resetResponse, setResetResponse] = React.useState<any>({});
  const [otp, setOtp] = React.useState("");
  const [check, setCheck] = React.useState<boolean>(false);
  const [loading, setLoading] = React.useState<boolean>(false);
  const handleChange = (newValue: any) => {
    setOtp(newValue);
    setError([]);
  };
  const [view, setView] = useState<boolean>(false);
  const router = useRouter();
  const ResetRequest = async () => {
    try {
      startLoading();
      setLoading(true);
      const body = {
        username: username,
      };
      const { endpoint, method } = Config.AuthLogin.ResetRequest;
      const result = await Apirequest(endpoint, method, body);
      setResetResponse(result.data.message);
      if (result.data.statusCode !== 200) {
        setErrorMessages(result.data.errors);
        setErrorModalOpen(true);

        setLoading(false);
      } else {
        startLoading();
        setLoading(true);
        SendMail(
          result?.data?.message?.verificationCode,
          result.data.message?.passwordResetCodeExpiryMinutes,
          result.data.message?.email,
          result.data.message?.message
        );
      }
    } catch (err) {
      console.log(err);
      setLoading(false);
    } finally {
      stopLoading();
    }
  };

  const SendMail = async (
    code: string,
    minutes: string,
    email: string,
    message: string
  ) => {
    try {
      const body = {
        provider: "Gmail",
        toEmail: email,
        subject: "Password Reset Request",
        htmlContent: emailTemplate(code, username, minutes),
      };

      const response: any = await axios
        .post(`${process.env.NEXT_PUBLIC_SERVICE_URL}/api/email/send`, body)
        .then((res) => res.data);
      if (response.statusCode === 200 || response.statusCode === 201) {
        Swal.fire({
          title: message,
          icon: "success",
          confirmButtonText: "okay",
          customClass: {
            title: "custom-title",
          },
        }).then((res) => {
          if (res.isConfirmed) {
            setCheck(true);
          }
        });
      } else {
        toast.error(response.message);
      }
      setLoading(false);
    } catch (err: any) {
      setCheck(false);
      setLoading(false);
      Swal.fire({
        title: message,
        icon: "error",
        denyButtonText: "Okay",
        customClass: {
          title: "custom-title",
          confirmButton: "custom-button",
        },
      });
      console.log(err);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting()) return;

    if (username.length < 3) {
      setError(["name"]);
      toast.error("Username must be at least 3 characters long.");
      return;
    }
    setError([]);
    ResetRequest();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let { name, value } = e.target;
    name === "username" && setUsername(value);
    name === "password" && setPassword(value);
    setError([]);
  };

  const ForgetPasswordReset = async () => {
    try {
      startLoading();
      const body = {
        userName: username,
        verificationCode: otp?.toLocaleUpperCase(),
        password: password,
      };
      setLoading(true);
      const { endpoint, method } = Config.AuthLogin.ForgotPasswordReset;
      const result = await Apirequest(endpoint, method, body);
      if (result.data.statusCode !== 200) {
        setErrorMessages(result.data.errors);
        setErrorModalOpen(true);

        setLoading(false);
      } else {
        Swal.fire({
          title: result.data.message.message,
          icon: "success",
          confirmButtonText: "okay",
          customClass: {
            title: "custom-title",
          },
        }).then((res) => res.isConfirmed && router.push("/login"));
        setLoading(false);
      }
    } catch (err) {
      setLoading(false);
      console.log(err);
    } finally {
      stopLoading();
    }
  };

  const handleSubmitOtp = () => {
    const REGEX = /^(?=.*[A-Z])(?=.*[\W_])(?=.{8,}).*$/;

    if (otp.length !== 6) {
      setError(["otp"]);
    } else if (!REGEX.test(password)) {
      setError(["password"]);
    } else {
      ForgetPasswordReset();
    }
  };

  return (
    <Box
      sx={{
        opacity: loading ? 0.5 : 1,
        pointerEvents: loading ? "none" : "unset",
      }}
    >
      <MuiText variant="h6" className="login-header">
        Forgot Password ?
      </MuiText>
      {loading && (
        <Box
          sx={{
            width: "100%",
            position: "absolute",
            top: 0,
            right: 6,
          }}
        >
          <LinearProgress />
        </Box>
      )}

      {check ? (
        <>
          <MuiText
            variant="caption"
            fontSize={14}
            fontFamily={"var(--poppins-font)"}
          >
            Please enter the OTP sent to your registered email
          </MuiText>
          <MuiOtpInput
            sx={{ mt: 2 }}
            value={otp.toString().toLocaleUpperCase()}
            length={6}
            onChange={handleChange}
          />
          <Box mb={2}>
            {error.includes("otp") && (
              <MuiText
                variant="caption"
                color="#ff0000"
                position={"relative"}
                top={5}
                fontWeight={500}
              >
                Please enter OTP
              </MuiText>
            )}
          </Box>
          <MuiText
            variant="caption"
            fontSize={14}
            fontFamily={"var(--poppins-font)"}
          >
            New Password
          </MuiText>
          <MuiInputField
            className="login-input"
            size="small"
            sx={{ mt: 1 }}
            name="password"
            value={password}
            onChange={handleInputChange}
            helperText={
              error.includes("password") &&
              "password must contain at least eight characters, at least one number and both lower and uppercase letters and special characters"
            }
            type={view ? "text" : "password"}
            error={error.includes("password")}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="start">
                    {view ? (
                      <IoEyeOffOutline
                        onClick={() => setView(false)}
                        cursor={"pointer"}
                      />
                    ) : (
                      <FaRegEye
                        onClick={() => setView(true)}
                        cursor={"pointer"}
                      />
                    )}
                  </InputAdornment>
                ),
              },
            }}
            fullWidth
          />
          <ButtonComponent
            className="filled-icon-btn"
            sx={{ mt: 3 }}
            fullWidth
            type="submit"
            disabled={isSubmitting()}
            onClick={handleSubmitOtp}
          >
            Submit
          </ButtonComponent>
        </>
      ) : (
        <Box>
          <MuiText variant="caption" fontFamily={"var(--poppins-font)"}>
            Kindly enter your registered username, we will send you the reset
            instructions
          </MuiText>
          <br />
          <form onSubmit={handleSubmit}>
            <MuiText variant="h6" my={1} className="login-label-title">
              Enter Username
            </MuiText>
            <MuiInputField
              className="login-input"
              size="small"
              name="username"
              value={username}
              autoFocus
              onChange={handleInputChange}
              helperText={
                error.includes("name") &&
                "Please enter your registered username"
              }
              error={error.includes("name")}
              fullWidth
            />
            <br />
            <br />

            <MuiButton
              className="filled-icon-btn"
              disabled={isSubmitting()}
              fullWidth
              type="submit"
            >
              Send Now
            </MuiButton>
          </form>
          <Box textAlign={"center"} py={2}>
            <NavigationLink title="Back to Login" redirectLink="login" />
          </Box>
        </Box>
      )}

      <ErrorModal
        open={errorModalOpen}
        onClose={() => setErrorModalOpen(false)}
        errors={errorMessages}
      />
    </Box>
  );
};

export default ForgotPasswordForm;
