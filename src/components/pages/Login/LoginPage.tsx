"use client";

import React, { useState } from "react";
import LoginTemplate from "../../templates/LoginTemplate";
import {
  Box,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { LoginForm, MuiButton, MuiText } from "bsoft-base-elements";
import NavigationLink from "../../atoms/NavigationLink";
import Cookies from "js-cookie";
import Swal from "sweetalert2";
import { Apirequest } from "../../../utils/lib";
import Config from "../../../../src/utils/config.api.json";
import { User, UserInput } from "../../../types";
import { useRouter } from "next/navigation";
import ErrorModal from "../../molecules/Master/Role/ErrorModal";
import toast from "react-hot-toast";

function LoginPage() {
  const [input, setInput] = useState<UserInput>({
    c_name: "",
    c_password: "",
  });

  const [error, setError] = useState<string[]>([]);
  const [view, setView] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [errorMessages, setErrorMessages] = useState<string[]>([]);
  const [sessionExists, setSessionExists] = useState(false);
  const [sessionDialogOpen, setSessionDialogOpen] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setError([]);
    setInput((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    let temp: string[] = [];
    Object.entries(input).forEach(([key, value]) => {
      if (key === "c_name" && value === "") {
        temp.push(key);
      }
      if (key === "c_password" && value === "") {
        temp.push(key);
      }
    });

    setError(temp);

    if (temp.length === 0) {
      await attemptLogin(false);
    }
  };

  const attemptLogin = async (forceLogout = false) => {
    const userData: User = {
      username: input.c_name,
      password: input.c_password,
      forceLogout: forceLogout,
    };

    setLoading(true);

    try {
      const { endpoint, method } = Config.AuthLogin;
      const result = await Apirequest(endpoint, method, userData);
      setLoading(false);

      if (result.data.statusCode !== 200) {
        if (
          result.data.session &&
          result.data.errors?.some((error: any) =>
            error.includes("already logged in on another machine")
          )
        ) {
          setSessionExists(true);
          setSessionDialogOpen(true);
          setErrorMessages(result.data.errors);
        } else {
          result.data.errors
            ? setErrorMessages(result.data.errors)
            : toast.error(result.data?.message, {
                className: "custom-toast",
              });
          result.data.errors && setErrorModalOpen(true);
        }
      } else {
        toast.success("Logged in successfully");
        setTimeout(() => {
          if (Boolean(result.data.data.isFirstTimeUser)) {
            router.push("/reset-password");
          } else {
            if (!Boolean(result.data.data.isFirstTimeUser)) {
              router.push("/choose-unit");
            }
          }
        }, 150);
        Cookies.set("bsoft", result?.data?.data?.token, {
          expires: 1,
        });
      }
    } catch (err) {
      setLoading(false);
      console.log(err);
    }
  };

  const handleLogout = async () => {
    try {
      const userData: User = {
        username: input.c_name,
        password: input.c_password,
      };
      const { endpoint, method } = Config.AuthLogin.ForceLogout;
      const result = await Apirequest(endpoint, method, userData).then(
        (res) => res.data
      );
      setSessionDialogOpen(false);
      if (result.statusCode === 200 || result.statusCode === 201) {
        toast.success(result.message, {
          className: "custom-toast",
        });
      } else {
        toast.success("Something went wrong, please try again later", {
          className: "custom-toast",
        });
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleView = (val: boolean) => {
    setView(val);
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
        <Box
          sx={{
            opacity: loading ? 0.5 : 1,
            pointerEvents: loading ? "none" : "unset",
          }}
        >
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
          <LoginForm
            handleSubmit={handleSubmit}
            handleChange={handleChange}
            error={error}
            input={input}
            view={view}
            handleView={handleView}
          />
          <Box textAlign={"center"} py={2}>
            <NavigationLink
              title="Forget Password?"
              redirectLink="forgot-password"
            />
          </Box>
        </Box>
        <ErrorModal
          open={errorModalOpen}
          onClose={() => setErrorModalOpen(false)}
          errors={errorMessages}
        />

        <Dialog
          open={sessionDialogOpen}
          onClose={() => setSessionDialogOpen(false)}
          PaperProps={{
            sx: {
              borderRadius: 2,
              boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
              maxWidth: 400,
              width: "100%",
            },
          }}
        >
          <DialogTitle
            sx={{
              backgroundColor: "#f8f9fa",
              borderBottom: "1px solid #e9ecef",
              fontWeight: 600,
              color: "#343a40",
            }}
          >
            Active Session Detected
          </DialogTitle>
          <DialogContent sx={{ py: 3, px: 3 }}>
            <MuiText variant="body1" sx={{ my: 2 }}>
              Your account is currently logged in on another device or browser.
            </MuiText>
            <MuiText variant="body2" color="text.secondary">
              Would you like to end that session and log in here?
            </MuiText>
          </DialogContent>
          <DialogActions sx={{ p: 2, justifyContent: "space-between" }}>
            <MuiButton
              onClick={() => setSessionDialogOpen(false)}
              variant="contained"
              sx={{
                borderRadius: "8px",
                px: 3,
                background: "#fff !important",
                color: "#000 !important",
              }}
            >
              Cancel
            </MuiButton>
            <MuiButton
              onClick={handleLogout}
              variant="contained"
              color="primary"
              sx={{
                borderRadius: "8px",
                px: 3,
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              }}
            >
              Log out other sessions
            </MuiButton>
          </DialogActions>
        </Dialog>
      </LoginTemplate>
    </Box>
  );
}

export default LoginPage;
