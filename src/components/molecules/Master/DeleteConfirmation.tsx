import * as React from "react";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import ImageComponent from "../../atoms/Image";
import Warning from "../../../../public/assets/images/alert.png";
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

export default function DeleteConfirmation({
  open,
  close,
  handleDelete,
}: {
  open: boolean;
  close: () => void;
  handleDelete: () => void;
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
          <Box width={72} height={72}>
            <ImageComponent
              src={Warning}
              alt="img"
              style={{ width: "100%", height: "100%" }}
            />
          </Box>
          <MuiText
            variant="h6"
            className="className='login-label-title"
            fontFamily={"var(--poppins-font)"}
            py={4}
            textAlign={"center"}
          >
            Are you sure you want to delete this item ?
          </MuiText>
          <Box
            display={"flex"}
            alignItems={"center"}
            justifyContent={"flex-end"}
            gap={2}
          >
            <MuiButton
              variant="outlined"
              color={"secondary"}
              onClick={close}
            >
              Cancel
            </MuiButton>
            <MuiButton
              variant="contained"
              color={"secondary"}
              onClick={handleDelete}
            >
              OK
            </MuiButton>
          </Box>
        </Box>
      </Modal>
    </div>
  );
}
