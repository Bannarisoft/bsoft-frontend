import React, { useState, useRef } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  Alert,
  IconButton,
  Chip,
  Stack,
  styled,
} from "@mui/material";
import { FiUpload, FiX, FiFile, FiCheckCircle } from "react-icons/fi";

const UploadContainer = styled(Paper, {
  shouldForwardProp: (prop) => prop !== "isDragActive",
})<{
  isDragActive: boolean;
}>(({ theme, isDragActive }) => ({
  border: `2px dashed ${
    isDragActive ? theme.palette.primary.main : theme.palette.grey[300]
  }`,
  borderRadius: theme.spacing(2),
  padding: theme.spacing(4),
  textAlign: "center",
  cursor: "pointer",
  transition: "all 0.3s ease-in-out",
  backgroundColor: isDragActive
    ? theme.palette.primary.light + "10"
    : theme.palette.background.default,
  "&:hover": {
    borderColor: theme.palette.primary.main,
    backgroundColor: theme.palette.primary.light + "05",
  },
}));

const FilePreview = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  padding: theme.spacing(1.5),
  borderRadius: theme.spacing(1),
  backgroundColor: theme.palette.grey[50],
  border: `1px solid ${theme.palette.grey[200]}`,
  marginTop: theme.spacing(1),
}));

interface PdfUploadProps {
  onFileSelect?: (files: File[]) => void;
  onFileRemove?: (fileName: string) => void;
  onUploadComplete?: (uploadedFiles: File[]) => void;
  maxFileSize?: number;
  maxFiles?: number;
  acceptedFileTypes?: string[];
  disabled?: boolean;
  showProgress?: boolean;
  variant?: "outlined" | "elevation";
}

interface UploadState {
  files: File[];
  uploading: boolean;
  uploadProgress: number;
  error: string | null;
  success: boolean;
  dragActive: boolean;
}

const PdfUpload: React.FC<PdfUploadProps> = ({
  onFileSelect,
  onFileRemove,
  onUploadComplete,
  maxFileSize = 5,
  maxFiles = 5,
  acceptedFileTypes = ["application/pdf"],
  disabled = false,
  showProgress = true,
  variant = "outlined",
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [state, setState] = useState<UploadState>({
    files: [],
    uploading: false,
    uploadProgress: 0,
    error: null,
    success: false,
    dragActive: false,
  });

  const validateFile = (file: File): string | null => {
    if (!acceptedFileTypes.includes(file.type)) {
      return `File type not supported. Please upload ${acceptedFileTypes.join(
        ", "
      )} files only.`;
    }

    if (file.size > maxFileSize * 1024 * 1024) {
      return `File size too large. Maximum size is ${maxFileSize}MB.`;
    }

    return null;
  };

  const handleFileChange = (files: FileList | null) => {
    if (!files || disabled) return;

    const fileArray = Array.from(files);
    const validFiles: File[] = [];
    let errorMessage = "";

    if (state.files.length + fileArray.length > maxFiles) {
      setState((prev) => ({
        ...prev,
        error: `Maximum ${maxFiles} files allowed.`,
      }));
      return;
    }

    for (const file of fileArray) {
      const validationError = validateFile(file);
      if (validationError) {
        errorMessage = validationError;
        break;
      }

      if (state.files.some((existingFile) => existingFile.name === file.name)) {
        errorMessage = `File "${file.name}" already exists.`;
        break;
      }

      validFiles.push(file);
    }

    if (errorMessage) {
      setState((prev) => ({ ...prev, error: errorMessage }));
      return;
    }

    const newFiles = [...state.files, ...validFiles];
    setState((prev) => ({
      ...prev,
      files: newFiles,
      error: null,
      success: false,
    }));

    onFileSelect?.(newFiles);
  };

  const removeFile = (fileName: string) => {
    const updatedFiles = state.files.filter((file) => file.name !== fileName);
    setState((prev) => ({
      ...prev,
      files: updatedFiles,
      success: false,
    }));
    onFileRemove?.(fileName);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragIn = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setState((prev) => ({ ...prev, dragActive: true }));
  };

  const handleDragOut = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setState((prev) => ({ ...prev, dragActive: false }));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setState((prev) => ({ ...prev, dragActive: false }));

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileChange(e.dataTransfer.files);
    }
  };

  const clearFiles = () => {
    setState((prev) => ({
      ...prev,
      files: [],
      error: null,
      success: false,
      uploadProgress: 0,
    }));
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <Box sx={{ width: "100%", maxWidth: 600, mx: "auto" }}>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedFileTypes.join(",")}
        multiple={maxFiles > 1}
        onChange={(e) => handleFileChange(e.target.files)}
        style={{ display: "none" }}
        disabled={disabled}
      />

      {/* Upload area */}
      <UploadContainer
        variant={variant}
        isDragActive={state.dragActive}
        onClick={() => !disabled && fileInputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDrag}
        onDragEnter={handleDragIn}
        onDragLeave={handleDragOut}
        sx={{
          opacity: disabled ? 0.6 : 1,
          cursor: disabled ? "not-allowed" : "pointer",
        }}
      >
        <FiUpload size={48} color={disabled ? "#ccc" : "#1976d2"} />
        <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
          {state.dragActive ? "Drop files here" : "Upload PDF Files"}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Drag and drop your PDF files here, or click to browse
        </Typography>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ mt: 1, display: "block" }}
        >
          Max {maxFiles} files • Up to {maxFileSize}MB each • PDF only
        </Typography>
      </UploadContainer>

      {/* Error Alert */}
      {state.error && (
        <Alert
          severity="error"
          sx={{ mt: 2 }}
          onClose={() => setState((prev) => ({ ...prev, error: null }))}
        >
          {state.error}
        </Alert>
      )}

      {/* Success Alert */}
      {state.success && (
        <Alert severity="success" sx={{ mt: 2 }} icon={<FiCheckCircle />}>
          Files uploaded successfully!
        </Alert>
      )}

      {/* File List */}
      {state.files.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{ mb: 2 }}
          >
            <Typography variant="subtitle1" fontWeight="medium">
              Selected Files ({state.files.length})
            </Typography>
            <Button
              size="small"
              onClick={clearFiles}
              disabled={disabled || state.uploading}
              color="error"
            >
              Clear All
            </Button>
          </Stack>

          {state.files.map((file, index) => (
            <FilePreview key={`${file.name}-${index}`}>
              <FiFile size={24} color="#1976d2" />
              <Box sx={{ ml: 2, flex: 1, minWidth: 0 }}>
                <Typography variant="body2" noWrap>
                  {file.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {formatFileSize(file.size)}
                </Typography>
              </Box>
              <Chip
                label="PDF"
                size="small"
                color="primary"
                variant="outlined"
                sx={{ mr: 1 }}
              />
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile(file.name);
                }}
                disabled={disabled || state.uploading}
                color="error"
              >
                <FiX size={18} />
              </IconButton>
            </FilePreview>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default PdfUpload;
