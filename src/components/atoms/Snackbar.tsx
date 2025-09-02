import { Snackbar, SnackbarCloseReason } from "@mui/material";
import React from "react";
import { SnackbarPropTypes } from "../../types/types";
import { IoIosClose } from "react-icons/io";

function SnackbarComponent({ open, close, message }: SnackbarPropTypes) {
  return (
    <div>
      <Snackbar
        open={open}
        onClose={close}
        autoHideDuration={2500}
        message={message}
        action={<IoIosClose fontSize={24} onClick={close} cursor={"pointer"} />}
      />
    </div>
  );
}

export default SnackbarComponent;
