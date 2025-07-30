import { Box, Modal, Typography, Button } from "@mui/material";

interface ErrorModalProps {
  open: boolean;
  onClose: () => void;
  errors: string[];
}

const ErrorModal: React.FC<ErrorModalProps> = ({ open, onClose, errors }) => {
  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="error-modal-title"
      aria-describedby="error-modal-description"
    >
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          bgcolor: "background.paper",
          boxShadow: 24,
          p: 4,
          borderRadius: 2,
          minWidth: 300,
          maxWidth: 500,
        }}
      >
        <Typography
          id="error-modal-title"
          variant="h6"
          component="h2"
          color="error"
          mb={2}
        >
          Error
        </Typography>
        <Box
          id="error-modal-description"
          sx={{
            "& li": {
              color: "#222",
              fontSize: 14,
              fontWeight: 500,
              lineHeight: 2,
              mb: 1,
              fontFamily: "var(--poppins-font)",
            },
          }}
          mb={3}
        >
          {Array.isArray(errors) &&
            errors.length > 0 &&
            errors.map((error, index) => <li key={index}>{error}</li>)}
        </Box>
        <Box display="flex" justifyContent="flex-end">
          <Button onClick={onClose} variant="contained" color="primary">
            Close
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default ErrorModal;
