import React, { useState } from "react";
import { MuiInputField, MuiText } from "bsoft-base-elements";
import { Box, Card, Grid2, Stack, Button, Autocomplete } from "@mui/material";
import PdfUpload from "./PdfUpload";
import { FiPlus, FiTrash2 } from "react-icons/fi";

interface DocumentType {
  id: number;
  code: string;
}

interface UploadedDocument {
  docType: DocumentType;
  files: File[];
  uploadedAt: Date;
}

function UploadDocuments() {
  const [docType] = useState({
    additionalCostData: [
      { id: 1, code: "GST Doc" },
      { id: 2, code: "MSME Reg" },
      { id: 3, code: "Bank Statement" },
      { id: 4, code: "PAN Card" },
      { id: 5, code: "Aadhar Card" },
      { id: 6, code: "License Doc" },
    ],
  });

  const [selectedDocType, setSelectedDocType] = useState<DocumentType | null>(
    null
  );
  const [currentFiles, setCurrentFiles] = useState<File[]>([]);
  const [uploadedDocuments, setUploadedDocuments] = useState<
    UploadedDocument[]
  >([]);

  const getAddedDocTypes = () => {
    return uploadedDocuments.map((doc) => doc.docType.code);
  };

  const getFilteredDocTypes = (): DocumentType[] => {
    const addedTypes = getAddedDocTypes();
    return (docType.additionalCostData || []).filter(
      (option) => !addedTypes.includes(option.code)
    );
  };

  const handleDocTypeChange = (newValue: DocumentType | null) => {
    setSelectedDocType(newValue);
    setCurrentFiles([]);
  };

  const handleFileSelect = (files: File[]) => {
    setCurrentFiles(files);
    console.log("Selected files for", selectedDocType?.code, ":", files);
  };

  const handleFileRemove = (fileName: string) => {
    setCurrentFiles((prev) => prev.filter((file) => file.name !== fileName));
    console.log("Removed file:", fileName, "for", selectedDocType?.code);
  };

  const handleUploadComplete = (uploadedFiles: File[]) => {
    setCurrentFiles(uploadedFiles);
    console.log(
      "Upload completed for",
      selectedDocType?.code,
      ":",
      uploadedFiles
    );
  };

  const handleAddDocument = () => {
    if (!selectedDocType || currentFiles.length === 0) {
      console.error("Please select document type and upload files");
      return;
    }

    const newDocument: UploadedDocument = {
      docType: selectedDocType,
      files: [...currentFiles],
      uploadedAt: new Date(),
    };

    setUploadedDocuments((prev) => [...prev, newDocument]);

    setSelectedDocType(null);
    setCurrentFiles([]);

    console.log("Document added:", newDocument);
  };

  const removeUploadedDocument = (docTypeId: number) => {
    setUploadedDocuments((prev) =>
      prev.filter((doc) => doc.docType.id !== docTypeId)
    );
  };

  const canAddDocument = selectedDocType && currentFiles.length > 0;

  return (
    <Box>
      <Card sx={{ p: 2 }} elevation={2}>
        <MuiText variant="h6" my={1} pt={1} className="admin-page-title">
          Upload Documents
        </MuiText>

        <Grid2 container spacing={4}>
          <Grid2 size={{ xs: 12, md: 4 }}>
            <MuiText variant="subtitle2" sx={{ mb: 1 }}>
              Select Document Type{" "}
              <MuiText
                component="span"
                sx={{
                  color: "error.main",
                  ml: 0.5,
                  fontSize: "inherit !important",
                }}
              >
                *
              </MuiText>
            </MuiText>

            <Autocomplete
              disablePortal
              options={getFilteredDocTypes()}
              value={selectedDocType}
              onChange={(
                _: React.SyntheticEvent<Element, Event>,
                newValue: DocumentType | null
              ) => handleDocTypeChange(newValue)}
              getOptionLabel={(option: DocumentType | string) => {
                if (typeof option === "string") return option;
                return option?.code || "";
              }}
              isOptionEqualToValue={(
                option: DocumentType,
                value: DocumentType
              ) => {
                if (!option || !value) return false;
                return option.id === value.id;
              }}
              renderInput={(params: any) => (
                <MuiInputField
                  {...params}
                  size="small"
                  placeholder="Choose document type"
                />
              )}
              disabled={getFilteredDocTypes().length === 0}
              noOptionsText="No document types available"
              clearOnEscape
              autoComplete
              autoHighlight
              blurOnSelect
            />

            {getFilteredDocTypes().length === 0 && (
              <MuiText
                variant="caption"
                color="text.secondary"
                sx={{ mt: 1, display: "block" }}
              >
                All document types have been added
              </MuiText>
            )}
          </Grid2>

          <Grid2 size={{ xs: 12, md: 8 }}>
            {selectedDocType ? (
              <Box>
                <PdfUpload
                  onFileSelect={handleFileSelect}
                  onFileRemove={handleFileRemove}
                  onUploadComplete={handleUploadComplete}
                  maxFileSize={2}
                  maxFiles={5}
                  showProgress={true}
                  variant="outlined"
                  key={selectedDocType.id}
                />

                <Box sx={{ mt: 2, textAlign: "right" }}>
                  <Button
                    variant="contained"
                    color="primary"
                    size="large"
                    startIcon={<FiPlus />}
                    onClick={handleAddDocument}
                    disabled={!canAddDocument}
                    sx={{ minWidth: 120 }}
                  >
                    Add Document
                  </Button>
                </Box>
              </Box>
            ) : (
              <Box
                sx={{
                  p: 4,
                  textAlign: "center",
                  color: "text.secondary",
                  border: "2px dashed",
                  borderColor: "grey.300",
                  borderRadius: 2,
                  backgroundColor: "grey.50",
                }}
              >
                <MuiText>Please select a document type first</MuiText>
              </Box>
            )}
          </Grid2>
        </Grid2>

        {uploadedDocuments.length > 0 && (
          <Box sx={{ mt: 4 }}>
            <MuiText variant="h6" my={1} pt={1} className="admin-page-title">
              Added Documents ({uploadedDocuments.length})
            </MuiText>

            <Grid2 container spacing={2}>
              {uploadedDocuments.map((doc) => (
                <Grid2 key={doc.docType.id} size={{ xs: 12, sm: 6, md: 4 }}>
                  <Card
                    variant="outlined"
                    sx={{
                      p: 2,
                      position: "relative",
                      "&:hover": {
                        boxShadow: 2,
                      },
                    }}
                  >
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="flex-start"
                    >
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <MuiText variant="subtitle2" fontWeight="medium" noWrap>
                          {doc.docType.code}
                        </MuiText>
                        <MuiText variant="caption" color="text.secondary">
                          {doc.files.length} file(s) •{" "}
                          {doc.uploadedAt.toLocaleDateString()}
                        </MuiText>
                      </Box>
                      <Button
                        size="small"
                        color="error"
                        variant="outlined"
                        startIcon={<FiTrash2 size={14} />}
                        onClick={() => removeUploadedDocument(doc.docType.id)}
                        sx={{ ml: 1 }}
                      >
                        Remove
                      </Button>
                    </Stack>

                    <Box sx={{ mt: 2 }}>
                      <MuiText
                        variant="caption"
                        color="text.secondary"
                        fontWeight="medium"
                      >
                        Files:
                      </MuiText>
                      {doc.files.map((file, fileIndex) => (
                        <MuiText
                          key={fileIndex}
                          variant="caption"
                          display="block"
                          sx={{
                            ml: 1,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            color: "text.primary",
                          }}
                        >
                          📄 {file.name} ({(file.size / 1024 / 1024).toFixed(2)}{" "}
                          MB)
                        </MuiText>
                      ))}
                    </Box>
                  </Card>
                </Grid2>
              ))}
            </Grid2>
          </Box>
        )}

        {uploadedDocuments.length > 0 && (
          <Box
            sx={{ mt: 3, p: 2, backgroundColor: "grey.50", borderRadius: 1 }}
          >
            <MuiText variant="body2" color="text.secondary">
              <strong>Summary:</strong> {uploadedDocuments.length} document
              type(s) added with{" "}
              {uploadedDocuments.reduce(
                (total, doc) => total + doc.files.length,
                0
              )}{" "}
              total files
            </MuiText>
          </Box>
        )}
      </Card>
    </Box>
  );
}

export default UploadDocuments;
