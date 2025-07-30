"use client";

import React from "react";
import LoginTemplate from "../../templates/LoginTemplate";
import { Box } from "@mui/material";
import ForgotPasswordForm from "../../molecules/Login/ForgotPassword";

function ForgetPage() {
    return (
        <Box
            component={"div"}
            className="d-grid-center login-page-wrapper"
            sx={{
                backgroundImage: "url(/assets/images/login-bg.png)",
            }}
        >
            <LoginTemplate>
                <ForgotPasswordForm />
            </LoginTemplate>
        </Box>
    );
}

export default ForgetPage ;
