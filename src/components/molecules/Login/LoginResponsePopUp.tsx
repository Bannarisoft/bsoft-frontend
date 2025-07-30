import * as React from "react";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import ImageComponent from "../../atoms/Image";
import Success from "../../../../public/assets/images/checked.png";
import Error from "../../../../public/assets/images/warning.png";
import SuccessGif from "../../../../public/assets/images/success.gif";
import TextComponent from "../../atoms/Text";
import ButtonComponent from "../../atoms/Button";
import { MuiButton, MuiText } from "bsoft-base-elements";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  boxShadow: 24,
  borderRadius: "14px",
  p: 4,
};

export default function LoginResponsePopUp({
  open,
  close,
  status,
  message,
}: {
  open: boolean;
  close: () => void;
  status: number;
  message: string;
}) {
  return (
    <div>
      <Modal
        keepMounted
        open={open}
        aria-labelledby="keep-mounted-modal-title"
        aria-describedby="keep-mounted-modal-description"
      >
        <Box sx={style} className="d-grid-center">
          <Box width={84} height={84}>
            <ImageComponent
              src={(status === 200 || status === 201) ? SuccessGif : Error}
              alt="img"
              style={{ width: "100%", height: "100%" }}
            />
          </Box>
          <MuiText
            variant="h6"
            className="className='login-label-title"
            fontFamily={"var(--poppins-font)"}
            py={4}
            pt={0}
            textAlign={"center"}
          >
            {message}
          </MuiText>
          <MuiButton
            variant="contained"
            color={(status === 200 || status === 201) ? "secondary" : "error"}
            onClick={close}
          >
            OK
          </MuiButton>
        </Box>
      </Modal>
    </div>
  );
}
